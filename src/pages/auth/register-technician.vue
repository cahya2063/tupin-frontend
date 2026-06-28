<script setup>
import technicianImage from '@assets/login/image.png'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/utils/api'

const router = useRouter()

const form = reactive({
  nama: '',
  email: '',
  phone_number: '',
  skills: [],
  ktp: null,
  selfie: null,
  cv: null,
  description: '',
})

const errors = reactive({})
const skillOptions = ref([])
const isLoadingSkills = ref(false)
const isSubmitting = ref(false)
const alertMessage = ref('')
const statusCode = ref(null)

const descriptionCount = computed(() => form.description.trim().length)
const selectedSkillLabels = computed(() =>
  skillOptions.value
  //ambil skillOptions yang id-nya ada di dalam form.skills
    .filter(skill => form.skills.includes(skill._id))
    .map(skill => skill.label),
)

watch(selectedSkillLabels,(skill)=>{
  console.log('selected skills options : ', skill);
})

function setFieldError(field, message) {
  //errors.nama || errors['nama']
  
  errors[field] = message
  console.log('error fields : ', errors);
}

function clearErrors() {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

function getSingleFile(fileInput) {
  if (Array.isArray(fileInput)) {
    return fileInput[0] || null
  }

  return fileInput || null
}

function validateForm() {
  clearErrors()

  if (!form.nama) {
    setFieldError('nama', 'Nama lengkap wajib diisi')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    setFieldError('email', 'Masukkan email yang valid')
  }

  if (!/^\+?[0-9\s-]{9,16}$/.test(form.phone_number)) {
    setFieldError('phone_number', 'Nomor telepon minimal 9 digit')
  }

  if (form.skills.length === 0) {
    setFieldError('skills', 'Pilih minimal satu keahlian')
  }

  if (!getSingleFile(form.ktp)) {
    setFieldError('ktp', 'Foto KTP wajib diunggah')
  }
  if(!getSingleFile(form.cv)){
    setFieldError('cv', 'CV wajib diunggah')
  }

  if (!getSingleFile(form.selfie)) {
    setFieldError('selfie', 'Selfie dengan KTP wajib diunggah')
  }

  if (form.description.length < 20) {
    setFieldError('description', 'Ceritakan pengalaman atau layanan minimal 20 karakter')
  }
  console.log('object key : ',Object.keys(errors))


  return Object.keys(errors).length === 0
}

// aksi klik btn skills
function toggleSkill(skillId) {
  if (form.skills.includes(skillId)) {
    // hapus id skills yang sudah ada di form.skills
    form.skills = form.skills.filter(id => id !== skillId)
    
    return
  }
  
  form.skills = [...form.skills, skillId]
  console.log('form skills : ', form.skills);

}

function resetForm() {
  form.nama = ''
  form.email = ''
  form.phone_number = ''
  form.skills = []
  form.ktp = null
  form.selfie = null
  form.cv = null,
  form.description = ''
}


async function getAllSkills() {
  try {
    isLoadingSkills.value = true
    const response = await apiFetch('/skills-register')
    const skills = response.data?.skills || []
    
    skillOptions.value =  skills
  }
  catch (error) {
    console.error('Gagal mengambil daftar skills:', error)
  }
  finally {
    isLoadingSkills.value = false
  }
}

async function registerTechnician() {
  alertMessage.value = ''
  statusCode.value = null

  if (!validateForm()) {
    alertMessage.value = 'Periksa kembali data yang wajib diisi'
    statusCode.value = 400
    return
  }

  try {
    isSubmitting.value = true

    const formData = new FormData()

    formData.append('nama', form.nama)
    formData.append('email', form.email)
    formData.append('phone_number', form.phone_number)
    form.skills.forEach(skillId => {
      formData.append('skills[]', skillId)
    })
    formData.append('description', form.description)
    formData.append('ktp', getSingleFile(form.ktp))
    formData.append('selfie', getSingleFile(form.selfie))
    formData.append('cv', getSingleFile(form.cv))

    const response = await apiFetch('/signup-tech', {
      method: 'POST',
      body: formData,
    })

    alertMessage.value = response.data?.message || 'Pendaftaran berhasil dikirim'
    statusCode.value = response.status

    if (response.status === 201) {
      resetForm()
    }
  }
  catch (error) {
    console.error('Error:', error)
    alertMessage.value = 'Terjadi kesalahan di server'
    statusCode.value = 500
  }
  finally {
    isSubmitting.value = false
  }
}

function goHome() {
  router.push('/')
}

onMounted(getAllSkills)
</script>

<template>
  <main class="technician-register-page">
    <button
      type="button"
      class="brand-link"
      aria-label="Kembali ke halaman utama"
      @click="goHome"
    >
      <span class="brand-mark">F</span>
      <span>Fixify</span>
    </button>

    <section class="register-shell">
      <aside class="intro-panel">
        <div class="intro-copy">
          <span class="eyebrow">Program Mitra Teknisi</span>
          <h1>Daftar sebagai teknisi terpercaya.</h1>
          <p>
            Lengkapi data dasar, pilih keahlian, dan ceritakan pengalamanmu.
            Tim kami akan meninjau pendaftaran lalu menghubungi lewat email.
          </p>
        </div>

        <img
          :src="technicianImage"
          alt="Ilustrasi teknisi Fixify"
          class="intro-image"
        >

        <div class="benefit-row">
          <div class="benefit-item">
            <i class="ri-shield-check-line"></i>
            <span>Review manual</span>
          </div>
          <div class="benefit-item">
            <i class="ri-map-pin-user-line"></i>
            <span>Area kerja jelas</span>
          </div>
          <div class="benefit-item">
            <i class="ri-mail-send-line"></i>
            <span>Update via email</span>
          </div>
        </div>
      </aside>

      <section class="form-panel">
        <div class="form-header">
          <h2>Registrasi Teknisi</h2>
          <p>Gunakan data yang aktif agar proses verifikasi berjalan lancar.</p>
        </div>

        <div
          v-if="alertMessage"
          class="form-alert"
          :class="{ success: statusCode === 201 }"
          role="alert"
        >
          <i :class="statusCode === 201 ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>
          <span>{{ alertMessage }}</span>
        </div>

        <form
          class="technician-form"
          novalidate
          @submit.prevent="registerTechnician"
        >
          <div class="field-grid">
            <label class="field-group">
              <span>Nama Lengkap</span>
              <!-- jika errors.nama == true tambahkan class invalid -->
              <input
                v-model="form.nama"
                type="text"
                name="nama"
                autocomplete="name"
                placeholder="cth: Budi Santoso"
                :class="{ invalid: errors.nama }"
              >
              <small
                v-if="errors.nama"
                class="error-text"
              >
                {{ errors.nama }}
              </small>
            </label>

            <label class="field-group">
              <span>Email Aktif</span>
              <input
                v-model="form.email"
                type="email"
                name="email"
                autocomplete="email"
                placeholder="nama@email.com"
                :class="{ invalid: errors.email }"
              >
              <small
                v-if="errors.email"
                class="error-text"
              >
                {{ errors.email }}
              </small>
            </label>

            <label class="field-group">
              <span>Nomor Telepon</span>
              <input
                v-model="form.phone_number"
                type="tel"
                name="phone_number"
                autocomplete="tel"
                placeholder="081234567890"
                :class="{ invalid: errors.phone_number }"
              >
              <small
                v-if="errors.phone_number"
                class="error-text"
              >
                {{ errors.phone_number }}
              </small>
            </label>
          </div>

          <div class="field-group skill-field">
            <div class="field-title">
              <span>Keahlian</span>
              <small v-if="isLoadingSkills">Memuat pilihan...</small>
              <small v-else-if="selectedSkillLabels.length > 0">
                {{ selectedSkillLabels.length }} dipilih
              </small>
            </div>

            <div class="skill-list">
              <button
                v-for="skill in skillOptions"
                :key="skill._id"
                type="button"
                class="skill-chip"
                :class="{ active: form.skills.includes(skill._id) }"
                @click="toggleSkill(skill._id)"
              >
                <i :class="form.skills.includes(skill._id) ? 'ri-check-line' : 'ri-add-line'"></i>
                {{ skill.label }}
              </button>
            </div>
            <small
              v-if="errors.skills"
              class="error-text"
            >
              {{ errors.skills }}
            </small>
          </div>
          <v-file-input
            v-model="form.ktp"
            prepend-icon=""
            clearable
            label="Foto KTP"
            name="ktp"
            accept="image/*"
            show-size
            variant="outlined"
            :error-messages="errors.ktp ? [errors.ktp] : []"
          ></v-file-input>
          <v-file-input
            v-model="form.selfie"
            prepend-icon=""
            clearable
            label="Selfie dengan KTP"
            name="selfie"
            accept="image/*"
            show-size
            variant="outlined"
            :error-messages="errors.selfie ? [errors.selfie] : []"
          ></v-file-input>
          <v-file-input
            v-model="form.cv"
            prepend-icon=""
            clearable
            label="Curiculum Vitae"
            name="cv"
            accept=".pdf"
            show-size
            variant="outlined"
            :error-messages="errors.cv ? [errors.cv] : []"
          ></v-file-input>

          <label class="field-group">
            <div class="field-title">
              <span>Deskripsi Pengalaman</span>
            </div>
            <div class="description-count d-flex justify-content-end">
              
              {{descriptionCount}}/500
            </div>
            <textarea
              v-model="form.description"
              name="description"
              maxlength="500"
              rows="5"
              placeholder="Ceritakan spesialisasi, pengalaman, area layanan, atau jenis pekerjaan yang biasa kamu tangani."
              :class="{ invalid: errors.description }"
            ></textarea>
            <small
              v-if="errors.description"
              class="error-text"
            >
              {{ errors.description }}
            </small>
          </label>

          <div class="form-footer">
            <RouterLink
              to="/login"
              class="login-link"
            >
              Sudah pernah diverifikasi?
            </RouterLink>

            <button
              type="submit"
              class="submit-button"
              :disabled="isSubmitting"
            >
              <i class="ri-send-plane-line"></i>
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran' }}
            </button>
          </div>
        </form>
      </section>
    </section>
  </main>
</template>

<style scoped>
.technician-register-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(141, 88, 255, 0.1), rgba(255, 255, 255, 0) 340px),
    #ffffff;
  color: #171421;
  font-family: 'Quicksand', 'Poppins', sans-serif;
  padding: 28px;
}

.brand-link {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  background-color: transparent;
  color: #241b3f;
  cursor: pointer;
  font: inherit;
  font-size: 18px;
  font-weight: 800;
  padding: 0;
  text-decoration: none;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #8d58ff;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(141, 88, 255, 0.25);
}

.register-shell {
  width: min(1180px, 100%);
  min-height: calc(100vh - 112px);
  display: grid;
  grid-template-columns: minmax(280px, 0.86fr) minmax(360px, 1.14fr);
  gap: 28px;
  align-items: stretch;
  margin: 28px auto 0;
}

.intro-panel,
.form-panel {
  border: 1px solid rgba(141, 88, 255, 0.14);
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 70px rgba(54, 31, 103, 0.11);
}

.intro-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 34px;
  background:
    linear-gradient(145deg, rgba(141, 88, 255, 0.13), rgba(255, 255, 255, 0.96) 54%),
    #ffffff;
}

.intro-copy {
  max-width: 430px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  background-color: #f1ebff;
  color: #6c32e7;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 12px;
}

.intro-copy h1 {
  color: #171421;
  font-size: clamp(32px, 4vw, 54px);
  font-weight: 900;
  line-height: 1.05;
  margin: 24px 0 18px;
}

.intro-copy p,
.form-header p {
  color: #655c75;
  font-size: 16px;
  line-height: 1.75;
  margin: 0;
}

.intro-image {
  width: min(360px, 86%);
  align-self: center;
  margin: 20px 0;
}

.benefit-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.benefit-item {
  min-height: 86px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(141, 88, 255, 0.16);
  border-radius: 16px;
  background-color: #ffffff;
  color: #3c3155;
  font-size: 13px;
  font-weight: 800;
  padding: 14px;
}

.benefit-item i {
  color: #8d58ff;
  font-size: 24px;
}

.form-panel {
  padding: 34px;
}

.form-header {
  margin-bottom: 22px;
}

.form-header h2 {
  color: #171421;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 900;
  margin: 16px 0 8px;
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
  margin-bottom: 18px;
}

.form-alert.success {
  border-color: #c4efd6;
  background-color: #effbf4;
  color: #167044;
}

.technician-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.field-group span,
.field-title span {
  color: #2a223a;
  font-size: 14px;
  font-weight: 900;
}

.field-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field-title small,
.field-group small {
  color: #8a819b;
  font-size: 12px;
  font-weight: 700;
}

.field-group input,
.field-group textarea {
  width: 100%;
  border: 1.5px solid #ddd3f6;
  border-radius: 14px;
  background-color: #ffffff;
  color: #211a31;
  font: inherit;
  font-size: 15px;
  outline: none;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.field-group input {
  height: 52px;
  padding: 0 15px;
}

.field-group textarea {
  min-height: 136px;
  resize: vertical;
  padding: 15px;
  line-height: 1.6;
}

.field-group input:focus,
.field-group textarea:focus {
  border-color: #8d58ff;
  box-shadow: 0 0 0 4px rgba(141, 88, 255, 0.12);
}

.field-group input.invalid,
.field-group textarea.invalid {
  border-color: #e45264;
}

.field-group .error-text,
.skill-field .error-text {
  color: #c72f43;
}

.skill-field {
  border: 1px solid #eee8ff;
  border-radius: 18px;
  background-color: #fbf9ff;
  padding: 16px;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1.5px solid #ddd3f6;
  border-radius: 999px;
  background-color: #ffffff;
  color: #4d4262;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  min-height: 40px;
  padding: 8px 14px;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.16s ease;
}

.skill-chip:hover {
  border-color: #8d58ff;
  color: #6c32e7;
  transform: translateY(-1px);
}

.skill-chip.active {
  border-color: #8d58ff;
  background-color: #8d58ff;
  color: #ffffff;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 4px;
}

.login-link {
  color: #6c32e7;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

.submit-button {
  min-width: 210px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: none;
  border-radius: 14px;
  background-color: #8d58ff;
  color: #ffffff;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 900;
  box-shadow: 0 16px 34px rgba(141, 88, 255, 0.28);
  transition: background-color 0.16s ease, transform 0.16s ease, opacity 0.16s ease;
}

.submit-button:hover {
  background-color: #7642e6;
  transform: translateY(-1px);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
  transform: none;
}

@media (max-width: 980px) {
  .technician-register-page {
    padding: 22px;
  }

  .register-shell {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .intro-panel {
    gap: 20px;
  }

  .intro-copy {
    max-width: 100%;
  }

  .intro-image {
    width: min(300px, 76%);
  }
}

@media (max-width: 640px) {
  .technician-register-page {
    padding: 16px;
  }

  .register-shell {
    gap: 18px;
    margin-top: 18px;
  }

  .intro-panel,
  .form-panel {
    border-radius: 18px;
    padding: 22px;
  }

  .benefit-row,
  .field-grid {
    grid-template-columns: 1fr;
  }

  .benefit-item {
    min-height: 66px;
  }

  .form-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .submit-button {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 420px) {
  .intro-panel,
  .form-panel {
    padding: 18px;
  }

  .skill-chip {
    width: 100%;
    justify-content: center;
  }
}
</style>
