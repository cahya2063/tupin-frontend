<script setup>
import { apiFetch } from '@/utils/api'
import technicianImage from '@assets/login/image.png'
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const form = reactive({
  password: '',
  passwordConfirmation: '',
})

const fieldErrors = reactive({})
const isSubmitting = ref(false)
const alertMessage = ref('')
const status = ref('idle')
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const activationToken = computed(() => {
  const token = route.query.token

  if (Array.isArray(token))
    return token[0] || ''

  return token || ''
})

const activationRole = computed(() => {
  const role = route.query.role

  if (Array.isArray(role))
    return role[0] || ''

  return role || ''
})

const activationEndpoint = computed(() => {
  if (activationRole.value === 'client')
    return '/client/activate'

  return '/technician/activate'
})

const canSubmit = computed(() => Boolean(activationToken.value) && !isSubmitting.value)

function clearErrors() {
  Object.keys(fieldErrors).forEach(key => {
    delete fieldErrors[key]
  })
}

function setFieldError(field, message) {
  fieldErrors[field] = message
}

function validateForm() {
  clearErrors()

  if (!activationToken.value) {
    alertMessage.value = 'Token aktivasi tidak ditemukan. Buka kembali link dari email aktivasi.'
    status.value = 'error'
  }

  if (!form.password) {
    setFieldError('password', 'Password baru wajib diisi')
  }
  

  if (!form.passwordConfirmation) {
    setFieldError('passwordConfirmation', 'Konfirmasi password wajib diisi')
  }
  else if (form.passwordConfirmation !== form.password) {
    setFieldError('passwordConfirmation', 'Konfirmasi password belum sama')
  }

  return Boolean(activationToken.value) && Object.keys(fieldErrors).length === 0
}


async function activateAccount() {
  alertMessage.value = ''
  status.value = 'idle'

  if (!validateForm())
    return

  try {
    isSubmitting.value = true

    const response = await apiFetch(activationEndpoint.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: activationToken.value,
        password: form.password
      })
    })

    console.log('response : ', response)

    if (response.status != 200) {
      status.value = 'error'
      alertMessage.value =
        response.message || 'Token aktivasi tidak valid atau sudah kedaluwarsa.'

      return
    }

    status.value = 'success'

    alertMessage.value =
      response.message || 'Password berhasil dibuat.'

    form.password = ''
    form.passwordConfirmation = ''
  }
  catch (error) {
    console.error('Gagal aktivasi akun:', error)

    status.value = 'error'
    alertMessage.value =
      'Tidak bisa terhubung ke server. Coba lagi beberapa saat lagi.'
  }
  finally {
    isSubmitting.value = false
  }
}

function goHome() {
  router.push('/')
}

function goLogin() {
  router.push('/login')
}
</script>

<template>
  <main class="activation-page">
    <nav class="activation-nav">
      <button
        type="button"
        class="brand-button"
        aria-label="Kembali ke halaman utama"
        @click="goHome"
      >
        <span class="brand-mark">F</span>
        <span>Fixify</span>
      </button>

      
    </nav>

    <section class="activation-layout">
      <aside class="activation-copy">
        <div>
          <h1>Buat password baru untuk mulai menerima pekerjaan.</h1>
          <p>
            Akun teknisi kamu sudah disetujui. Amankan akun dengan password baru
            sebelum masuk ke dashboard Fixify.
          </p>
        </div>

        <img
          :src="technicianImage"
          alt="Ilustrasi teknisi Fixify"
          class="technician-illustration"
        >

        <div class="security-list">
          <div class="security-item">
            <i class="ri-shield-keyhole-line"></i>
            <span>Link aktivasi pribadi</span>
          </div>
          <div class="security-item">
            <i class="ri-timer-flash-line"></i>
            <span>Token punya batas waktu</span>
          </div>
          <div class="security-item">
            <i class="ri-lock-password-line"></i>
            <span>Password langsung terenkripsi</span>
          </div>
        </div>
      </aside>

      <section
        class="form-panel"
        aria-labelledby="activation-title"
      >
        <div class="panel-heading">
          <span class="heading-icon">
            <i class="ri-key-2-line"></i>
          </span>

          <div>
            <h2 id="activation-title">
              Perbarui Password
            </h2>
            <p>Gunakan password yang kuat untuk akun teknisi kamu.</p>
          </div>
        </div>

        <div
          v-if="alertMessage || !activationToken"
          class="form-alert"
          :class="{ success: status === 'success' }"
          role="alert"
          aria-live="polite"
        >
          <i :class="status === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>
          <span>
            {{ !activationToken ? 'Token aktivasi tidak ditemukan. Pastikan link email dibuka lengkap.' : alertMessage }}
          </span>
        </div>

        <form
          v-if="activationToken && status !== 'success'"
          class="password-form"
          novalidate
          @submit.prevent="activateAccount"
        >
          <label class="field-group">
            <span>Password Baru</span>
            <div
              class="password-field"
              :class="{ invalid: fieldErrors.password }"
            >
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="new-password"
                placeholder="Masukkan password baru"
              >
              <button
                type="button"
                class="icon-button"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
              </button>
            </div>
            <small
              v-if="fieldErrors.password"
              class="error-text"
            >
              {{ fieldErrors.password }}
            </small>
          </label>

        
          <label class="field-group">
            <span>Konfirmasi Password</span>
            <div
              class="password-field"
              :class="{ invalid: fieldErrors.passwordConfirmation }"
            >
              <input
                v-model="form.passwordConfirmation"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                name="passwordConfirmation"
                autocomplete="new-password"
                placeholder="Ulangi password baru"
              >
              <button
                type="button"
                class="icon-button"
                :aria-label="showPasswordConfirmation ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'"
                @click="showPasswordConfirmation = !showPasswordConfirmation"
              >
                <i :class="showPasswordConfirmation ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
              </button>
            </div>
            <small
              v-if="fieldErrors.passwordConfirmation"
              class="error-text"
            >
              {{ fieldErrors.passwordConfirmation }}
            </small>
          </label>

          <button
            type="submit"
            class="primary-button"
            :disabled="!canSubmit"
          >
            <i :class="isSubmitting ? 'ri-loader-4-line loading-icon' : 'ri-shield-check-line'"></i>
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Password' }}
          </button>
        </form>

        <div
          v-else-if="status === 'success'"
          class="success-panel"
        >
          <span class="success-icon">
            <i class="ri-checkbox-circle-line"></i>
          </span>
          <h3>Password berhasil diperbarui</h3>
          <p>Akun teknisi kamu sudah siap digunakan di Fixify.</p>
        </div>

        <div
          v-else
          class="missing-token-panel"
        >
          <i class="ri-mail-warning-line"></i>
          <h3>Link aktivasi tidak lengkap</h3>
          <p>Buka ulang tombol aktivasi dari email persetujuan teknisi.</p>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.activation-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(141, 88, 255, 0.1), rgba(255, 255, 255, 0) 360px),
    #ffffff;
  color: #1f1930;
  font-family: 'Quicksand', 'Poppins', sans-serif;
  padding: 28px;
}

.activation-nav {
  width: min(1120px, 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 auto;
}

.brand-button,
.login-shortcut,
.icon-button,
.primary-button {
  font: inherit;
}

.brand-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background-color: transparent;
  color: #241b3f;
  cursor: pointer;
  font-size: 18px;
  font-weight: 900;
  padding: 0;
}

.brand-mark {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: #8d58ff;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(141, 88, 255, 0.24);
}

.login-shortcut {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(141, 88, 255, 0.28);
  border-radius: 8px;
  color: #6c32e7;
  font-size: 14px;
  font-weight: 900;
  padding: 0 18px;
  text-decoration: none;
}

.activation-layout {
  width: min(1120px, 100%);
  display: grid;
  grid-template-columns: minmax(280px, 0.95fr) minmax(360px, 1.05fr);
  gap: 34px;
  align-items: center;
  margin: 34px auto 0;
}

.activation-copy {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  border: 1px solid rgba(141, 88, 255, 0.18);
  border-radius: 8px;
  background-color: #f5f0ff;
  color: #6c32e7;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
  padding: 8px 12px;
  text-transform: uppercase;
}

.activation-copy h1 {
  color: #171421;
  font-size: clamp(34px, 4.6vw, 58px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.04;
  margin: 22px 0 16px;
}

.activation-copy p,
.panel-heading p,
.success-panel p,
.missing-token-panel p {
  color: #675d78;
  font-size: 16px;
  line-height: 1.7;
  margin: 0;
}

.technician-illustration {
  width: min(360px, 78%);
  align-self: center;
  filter: drop-shadow(0 20px 36px rgba(47, 31, 84, 0.14));
}

.security-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.security-item {
  min-height: 88px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(141, 88, 255, 0.16);
  border-radius: 8px;
  background-color: #ffffff;
  color: #392f50;
  font-size: 13px;
  font-weight: 900;
  padding: 14px;
  box-shadow: 0 14px 34px rgba(44, 32, 73, 0.07);
}

.security-item i {
  color: #8d58ff;
  font-size: 25px;
}

.form-panel {
  border: 1px solid rgba(141, 88, 255, 0.18);
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 24px 70px rgba(54, 31, 103, 0.12);
  padding: 34px;
}

.panel-heading {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.heading-icon {
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: #8d58ff;
  color: #ffffff;
  font-size: 25px;
  box-shadow: 0 14px 30px rgba(141, 88, 255, 0.28);
}

.panel-heading h2 {
  color: #171421;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.1;
  margin: 0 0 8px;
}

.form-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border: 1px solid #ffd3d9;
  border-radius: 8px;
  background-color: #fff4f5;
  color: #9d2638;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.5;
  margin-bottom: 18px;
  padding: 13px 14px;
}

.form-alert.success {
  border-color: #bbe8d0;
  background-color: #f0fbf5;
  color: #176b42;
}

.form-alert i {
  font-size: 19px;
  line-height: 1.25;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.field-group > span {
  color: #2a223a;
  font-size: 14px;
  font-weight: 900;
}

.password-field {
  min-height: 54px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 46px;
  align-items: center;
  border: 1.5px solid #ddd3f6;
  border-radius: 8px;
  background-color: #ffffff;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.password-field:focus-within {
  border-color: #8d58ff;
  box-shadow: 0 0 0 4px rgba(141, 88, 255, 0.12);
}

.password-field.invalid {
  border-color: #e45264;
}

.password-field input {
  width: 100%;
  height: 52px;
  border: 0;
  background-color: transparent;
  color: #211a31;
  font: inherit;
  font-size: 15px;
  outline: 0;
  padding: 0 0 0 15px;
}

.password-field input::placeholder {
  color: #a197b3;
}

.icon-button {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 8px;
  background-color: transparent;
  color: #7a6b94;
  cursor: pointer;
  font-size: 20px;
}

.icon-button:hover {
  background-color: #f4efff;
  color: #6c32e7;
}

.error-text {
  color: #c72f43;
  font-size: 12px;
  font-weight: 800;
}

.strength-box {
  border: 1px solid #eee8ff;
  border-radius: 8px;
  background-color: #fbf9ff;
  padding: 15px;
}

.strength-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #4d4262;
  font-size: 13px;
  font-weight: 900;
  margin-bottom: 10px;
}

.strength-top strong {
  color: #6c32e7;
}

.strength-meter {
  height: 8px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #ebe3ff;
}

.strength-meter span {
  height: 100%;
  display: block;
  border-radius: inherit;
  background-color: #c72f43;
  transition: width 0.18s ease, background-color 0.18s ease;
}

.strength-meter .score-2 {
  background-color: #d99019;
}

.strength-meter .score-3 {
  background-color: #1d9a61;
}

.rule-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
}

.rule-list li {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #7d738e;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
}

.rule-list li.valid {
  color: #176b42;
}

.rule-list i {
  flex: 0 0 auto;
  font-size: 16px;
}

.primary-button {
  width: 100%;
  min-height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 8px;
  background-color: #8d58ff;
  color: #ffffff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 900;
  padding: 0 18px;
  box-shadow: 0 16px 34px rgba(141, 88, 255, 0.28);
  transition: background-color 0.16s ease, opacity 0.16s ease, transform 0.16s ease;
}

.primary-button:hover {
  background-color: #7642e6;
  transform: translateY(-1px);
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
  transform: none;
}

.loading-icon {
  animation: spin 0.9s linear infinite;
}

.success-panel,
.missing-token-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 24px 0 4px;
}

.success-icon,
.missing-token-panel > i {
  width: 68px;
  height: 68px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 34px;
}

.success-icon {
  background-color: #effbf4;
  color: #1d9a61;
}

.missing-token-panel > i {
  background-color: #fff4f5;
  color: #c72f43;
}

.success-panel h3,
.missing-token-panel h3 {
  color: #171421;
  font-size: 24px;
  font-weight: 900;
  margin: 4px 0 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .activation-page {
    padding: 22px;
  }

  .activation-layout {
    grid-template-columns: 1fr;
  }

  .activation-copy {
    align-items: center;
    text-align: center;
  }

  .activation-copy > div:first-child {
    max-width: 680px;
  }

  .technician-illustration {
    width: min(300px, 70%);
  }
}

@media (max-width: 640px) {
  .activation-page {
    padding: 16px;
  }

  .activation-layout {
    gap: 22px;
    margin-top: 24px;
  }

  .activation-copy h1 {
    font-size: 34px;
  }

  .security-list,
  .rule-list {
    grid-template-columns: 1fr;
  }

  .security-list {
    width: 100%;
  }

  .security-item {
    min-height: 66px;
  }

  .form-panel {
    padding: 22px;
  }

  .panel-heading {
    align-items: flex-start;
  }
}

@media (max-width: 420px) {
  .activation-nav {
    align-items: flex-start;
    flex-direction: column;
  }

  .login-shortcut {
    width: 100%;
  }

  .activation-copy h1 {
    font-size: 30px;
  }

  .panel-heading {
    flex-direction: column;
  }
}
</style>
