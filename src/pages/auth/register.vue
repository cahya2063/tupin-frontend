<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/utils/api'

const name = ref('')
const email = ref('')
const password = ref('')
const alertMessage = ref('')
const statusCode = ref(null)
const isSubmitting = ref(false)
const router = useRouter()

async function registerUser() {
  try {
    alertMessage.value = ''
    statusCode.value = null
    isSubmitting.value = true

    const response = await apiFetch(`/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nama: name.value,
        email: email.value,
        password: password.value,
      }),
    })

    const result = response.data
    alertMessage.value = result.message
    statusCode.value = response.status

    // kalau berhasil (status 201), redirect ke /login
    if (response.status === 201) {
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  } catch (error) {
    console.error('Error:', error)
    alertMessage.value = 'Terjadi kesalahan di server'
    statusCode.value = 500
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="auth-form-container">
    <div class="form-header">
      <h2>Registrasi Akun</h2>
      <p>Buat akun baru untuk mulai menggunakan layanan kami.</p>
    </div>

    <!-- alert kondisi -->
    <div
      v-if="alertMessage"
      class="form-alert"
      :class="{ success: statusCode === 201 }"
      role="alert"
    >
      <i :class="statusCode === 201 ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>
      <span>{{ alertMessage }}</span>
    </div>

    <!-- form registrasi -->
    <form class="auth-form" @submit.prevent="registerUser" method="post">
      <label class="field-group">
        <span>Nama Lengkap</span>
        <input
          v-model="name"
          type="text"
          name="name"
          required
          placeholder="cth: Budi Santoso"
        >
      </label>

      <label class="field-group">
        <span>Email</span>
        <input
          v-model="email"
          type="email"
          name="email"
          required
          placeholder="nama@email.com"
        >
      </label>

      <label class="field-group">
        <span>Password</span>
        <input
          v-model="password"
          type="password"
          name="password"
          required
          placeholder="Buat password yang kuat"
        >
      </label>

      <div class="form-footer">
        <button
          type="submit"
          class="submit-button"
          :disabled="isSubmitting"
        >
          <i class="ri-user-add-line"></i>
          {{ isSubmitting ? 'Memproses...' : 'Daftar Sekarang' }}
        </button>
      </div>
      
      <div class="text-center mt-4 auth-links">
        <p class="auth-link-text">
          Sudah punya akun?
          <RouterLink to="/login" class="router-link">Login</RouterLink>
        </p>
        <p class="auth-link-text tech-link">
          Ingin bergabung sebagai teknisi?
          <RouterLink to="/register-technician" class="router-link">Daftar Teknisi</RouterLink>
        </p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.auth-form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-header {
  margin-bottom: 24px;
}

.form-header h2 {
  color: #171421;
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 900;
  margin: 0 0 8px;
  font-family: 'Quicksand', sans-serif;
}

.form-header p {
  color: #655c75;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
}

.form-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ffd5d8;
  border-radius: 14px;
  background-color: #fff3f4;
  color: #9f2635;
  font-size: 14px;
  font-weight: 700;
  padding: 13px 15px;
  margin-bottom: 20px;
}

.form-alert.success {
  border-color: #c4efd6;
  background-color: #effbf4;
  color: #167044;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group span {
  color: #2a223a;
  font-size: 14px;
  font-weight: 800;
}

.field-group input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1.5px solid #ddd3f6;
  border-radius: 14px;
  background-color: #ffffff;
  color: #211a31;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
}

.field-group input:focus {
  border-color: #8d58ff;
  box-shadow: 0 0 0 4px rgba(141, 88, 255, 0.12);
}

.form-footer {
  margin-top: 10px;
}

.submit-button {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 14px;
  background-color: #8d58ff;
  color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(141, 88, 255, 0.25);
  transition: all 0.2s ease;
}

.submit-button:hover {
  background-color: #7642e6;
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(141, 88, 255, 0.3);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.auth-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  text-align: center;
}

.auth-link-text {
  color: #655c75;
  font-size: 14px;
  margin: 0;
}

.router-link {
  color: #8d58ff;
  font-weight: 800;
  text-decoration: none;
  margin-left: 4px;
}

.router-link:hover {
  text-decoration: underline;
}

.tech-link {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px dashed #e2d9ff;
}
</style>
