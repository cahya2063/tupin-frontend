<script setup>
import { apiFetch, getProfile } from '@/utils/api'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import { config, editor, useLocationPicker } from '@/utils/tools'
import sweetAlert from '@/utils/sweetAlert'
import { useRouter } from 'vue-router'

const {
  destinationList,
  handleSearch,
  selectedDestination,
  postCodeError,
  lat,
  lng,
  initLocationMap,
  getMyLocation,
  handleDestinationChange,
  resetLocation,
} = useLocationPicker({
  clearDestinationWhenPostCodeChanges: true,
})

const props = defineProps({
  technicianId: String,
})

 
const description = ref('')
const router = useRouter()
 
const userId = localStorage.getItem('userId')

const technicianProfile = ref({})
const uploadedFiles = ref([])
const errors = reactive({})

const title = ref('')
const category = ref('Elektronik')
const needDeadline = ref(false)
const vStartDate = ref(null)
const vEndDate = ref(null)
const today = new Date()
 
// function handleFileUpload(e) {
//   photoFile.value = e.target.files[0]
// }
function toLocalISODate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().split('T')[0]
}

function onFileChange(newFiles) {
  // kalau jumlah berkurang → berarti hapus
  if (newFiles.length < uploadedFiles.value.length) {
    uploadedFiles.value = newFiles
    return
  }

  // kalau bertambah → merge
  const merged = [...uploadedFiles.value, ...newFiles]

  uploadedFiles.value = merged.filter((file, index, self) =>
    index === self.findIndex(f =>
      f.name === file.name &&
      f.size === file.size &&
      f.lastModified === file.lastModified
    )
  )
}


async function getSkills(id){
  const response = await apiFetch(`/skills/${id}`)
  
  return response.data.skill.label
}

function setFieldError(field, message) {
  errors[field] = message
}

function clearErrors() {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

function getDescriptionText() {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = description.value || ''

  return (wrapper.textContent || '').replace(/\u00a0/g, ' ').trim()
}

function validateForm() {
  clearErrors()

  if (!title.value.trim()) {
    setFieldError('title', 'Judul perbaikan wajib diisi')
  }

  if (
    !category.value ||
    (technicianProfile.value.skills?.length && !technicianProfile.value.skills.includes(category.value))
  ) {
    setFieldError('category', 'Pilih kategori kerusakan')
  }

  if (needDeadline.value && (!vStartDate.value || !vEndDate.value)) {
    setFieldError('deadline', 'Pilih rentang tanggal pengerjaan')
  }

  if (!getDescriptionText()) {
    setFieldError('description', 'Deskripsi kerusakan wajib diisi')
  }

  if (!selectedDestination.value?.[0]?.value) {
    setFieldError('destination', 'Kode pos atau lokasi wajib dipilih')
  }

  return Object.keys(errors).length === 0
}

async function postJob() {
  if (!validateForm()) {
    sweetAlert.error('Periksa kembali data yang wajib diisi')
    return
  }
  
  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('category', category.value)
  formData.append(
    'deadline',
    JSON.stringify({
      start_date: vStartDate.value ? toLocalISODate(vStartDate.value) : null,
      end_date: vEndDate.value ? toLocalISODate(vEndDate.value) : null,
    }),
  )
  formData.append('description', description.value)
  formData.append('userId', userId)
  formData.append('location', JSON.stringify({ lat: lat.value, lng: lng.value }))
  formData.append('destination', JSON.stringify({ destinationId: selectedDestination.value[0].value, destinationName: selectedDestination.value[0].label }))
  formData.append('selectedTechnician', props.technicianId)
 
  console.log('uploaded files : ', uploadedFiles.value);
  
  if (uploadedFiles.value && uploadedFiles.value.length > 0) {
    uploadedFiles.value.forEach(file => {
      formData.append('photos', file)
    })
  }
 
  const response = await apiFetch('/jobs', {
    method: 'POST',
    body: formData,
  })
 
  if (response.status === 201) {
    sweetAlert.success(response.data.message)

    // reset form
    title.value = ''
    category.value = 'Elektronik'
    needDeadline.value = false
    vStartDate.value = null
    vEndDate.value = null
    description.value = ''
    uploadedFiles.value = []
    destinationList.value = []
    resetLocation()

    router.push('/posted-jobs')
  }
  else{
    sweetAlert.error(response.data.message)
  }
}
onMounted(async () => {
  
  technicianProfile.value = await getProfile(props.technicianId)
  
  technicianProfile.value.skills = await Promise.all(
    technicianProfile.value.skills.map(async (skillId) => {
      return await getSkills(skillId)
    })
  )
  console.log('profile teknisi : ', technicianProfile.value.skills);
  
  await nextTick()
  initLocationMap('map')
})
 

</script>
 
<template>
  <div class="job-form-wrapper">
    <h2 class="form-heading">Buat Permintaan Perbaikan</h2>
 
    <form class="job-form" novalidate @submit.prevent="postJob">
 
      <!-- ROW 1: Judul & Kategori -->
      <div class="form-row">
        <!-- Judul -->
        <div class="form-group">
          <label class="field-label">
            <span class="label-number">01</span>
            Judul Perbaikan
          </label>
          <p class="field-hint">Buat judul yang mudah dipahami teknisi</p>
          <CFormInput
            class="field-input"
            :class="{ invalid: errors.title }"
            v-model="title"
            name="title"
            type="text"
            placeholder="cth: kulkas saya tidak dingin"
            required
          />
          <small
            v-if="errors.title"
            class="error-text"
          >
            {{ errors.title }}
          </small>
          <ul class="example-list">
            <li>lemari pendingin saya tidak dingin</li>
            <li>meja kerja saya permukaannya retak</li>
            <li>kompor gas saya tidak menyala</li>
          </ul>
        </div>
 
        <!-- Kategori -->
        <div class="form-group">
          <label class="field-label">
            <span class="label-number">02</span>
            Kategori Kerusakan
          </label>
          <p class="field-hint">Pilih kategori yang sesuai dengan barangmu</p>
          <div
            class="category-options"
            :class="{ invalid: errors.category }"
          >
            <label
              v-for="opt in technicianProfile.skills"
              :key="opt"
              class="category-chip"
              :class="{ active: category === opt }"
            >
              <input type="radio" :value="opt" v-model="category" hidden />
              {{ opt }}
            </label>
          </div>
          <small
            v-if="errors.category"
            class="error-text"
          >
            {{ errors.category }}
          </small>
        </div>
      </div>
 
      <!-- ROW 2: Deadline & Foto -->
      <div class="form-row">
        <!-- Deadline -->
        <div class="form-group">
          <label class="field-label">
            <span class="label-number">03</span>
            Jangka Waktu
          </label>
          <p class="field-hint">Apakah kamu butuh batas waktu pengerjaan?</p>
          <div class="switch-row">
            <span class="switch-label">Tidak</span>
            <CFormSwitch size="xl" id="deadlineSwitch" v-model="needDeadline" />
            <span class="switch-label">Ya</span>
          </div>
          <CDateRangePicker
            v-if="needDeadline"
            label="Pilih rentang tanggal"
            locale="id-ID"
            :min-date="today"
            v-model:start-date="vStartDate"
            v-model:end-date="vEndDate"
            class="mt-3"
            :class="{ invalid: errors.deadline }"
          />
          <small
            v-if="errors.deadline"
            class="error-text"
          >
            {{ errors.deadline }}
          </small>
        </div>
 
        <!-- Foto -->
        <div class="form-group">
          <label class="field-label">
            <span class="label-number">04</span>
            Foto Barang
          </label>
          <p class="field-hint">Upload foto barang yang ingin diperbaiki</p>
          <div class="file-upload-area">
            <!-- <CFormInput
              type="file"
              id="photoUpload"
              @change="handleFileUpload"
              accept="image/*"
            /> -->
            
            <v-file-upload
              :model-value="uploadedFiles"
              @update:modelValue="onFileChange"
              multiple
              clearable
              accept="image/*"
            />
            

          </div>
        </div>
      </div>
 
      <!-- ROW 3: Deskripsi & Lokasi -->
      <div class="form-row">
        <!-- Deskripsi -->
        <div class="form-group">
          <label class="field-label">
            <span class="label-number">05</span>
            Deskripsi
          </label>
          <p class="field-hint">Ceritakan lebih detail tentang kerusakan barangmu</p>
          <div
            class="editor-wrapper"
            :class="{ invalid: errors.description }"
          >
            <ckeditor
              v-if="editor && config"
              v-model="description"
              :editor="editor"
              :config="config"
            />
          </div>
          <small
            v-if="errors.description"
            class="error-text"
          >
            {{ errors.description }}
          </small>
        </div>
 
        <!-- Lokasi -->
        <div class="form-group">
          <label class="field-label">
            <span class="label-number">06</span>
            Lokasi Perbaikan
          </label>
          <p class="field-hint">masukkan kode pos tempat perbaikan</p>
          ( jika tidak ada yang cocok input manual atau pilih yang terdekat )

          <!-- ERROR MESSAGE -->
            <p v-if="postCodeError" style="color: red; margin-bottom: 8px;">
              {{ postCodeError }}
            </p>

            <CMultiSelect
              :multiple="false"
              :options="destinationList"
              :value="selectedDestination"
              @change="handleDestinationChange"
              @filter-change="handleSearch"
              placeholder="masukkan kode pos"
              :class="{ invalid: errors.destination }"

            />
            <small
              v-if="errors.destination"
              class="error-text"
            >
              {{ errors.destination }}
            </small>
          <!-- <p>Dipilih: {{ selectedDestination }}</p> -->
          <p class="field-hint">Klik peta atau seret penanda untuk menentukan lokasi</p>
          <div id="map" class="map-container"></div>
          <div class="map-footer">
            <button type="button" class="btn-location" @click.prevent="getMyLocation">
              📍 Ambil Lokasi Saya
            </button>
            <span class="coords">{{ lat.toFixed(5) }}, {{ lng.toFixed(5) }}</span>
          </div>
        </div>
      </div>
 
      <!-- Submit -->
      <div class="form-actions">
        <button type="submit" class="btn-submit">
          Kirim Permintaan
        </button>
      </div>
 
    </form>
  </div>
</template>
 
<style scoped>
.c-multi-select .form-multi-select-options {
  max-height: 400px !important;
  overflow-y: auto;
}
.v-file-upload-item:hover .v-file-upload-item__actions {
  opacity: 1 !important;
}

.v-file-upload-item__actions {
  opacity: 1 !important;
}
/* ===== Base ===== */
.job-form-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Quicksand';
}
 
.form-heading {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 2rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #9341fd;
  display: inline-block;
}
 
/* ===== Grid Row (2 kolom di desktop) ===== */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
 
/* 1 kolom di mobile */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .job-form-wrapper {
    width: 100%;
    padding-inline: 0px;
  }
  .form-group{
    padding: 0px;
  }
}
 
/* ===== Form Group ===== */
.form-group {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}
 
.form-group:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
 
/* ===== Label ===== */
.field-label {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
 
.label-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #9341fd;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}
 
.field-hint {
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0;
}

.error-text {
  color: #c72f43;
  font-size: 0.78rem;
  font-weight: 700;
  margin-top: 0.15rem;
}
 
/* ===== Input ===== */
.field-input {
  margin-top: 0.25rem;
}

.field-input.invalid,
.editor-wrapper.invalid {
  border-color: #e45264 !important;
}

.category-options.invalid .category-chip {
  border-color: #e45264;
}

:deep(.c-multi-select.invalid .form-multi-select),
:deep(.c-date-range-picker.invalid .form-control),
:deep(.c-date-range-picker.invalid .form-select) {
  border-color: #e45264 !important;
}
 
/* ===== Example list ===== */
.example-list {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
  font-size: 0.8rem;
  color: #9ca3af;
}
 
.example-list li {
  margin-bottom: 0.2rem;
}
 
/* ===== Category chips ===== */
.category-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
 
.category-chip {
  cursor: pointer;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  border: 1.5px solid #d1d5db;
  font-size: 0.85rem;
  color: #374151;
  background: #f9fafb;
  transition: all 0.15s;
  user-select: none;
}
 
.category-chip.active {
  background: #9341fd;
  border-color: #9341fd;
  color: white;
  font-weight: 600;
}
 
.category-chip:hover:not(.active) {
  border-color: #9341fd;
  color: #9341fd;
}
 
/* ===== Switch ===== */
.switch-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
 
.switch-label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}
 
/* ===== Map ===== */
.map-container {
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  margin-top: 0.5rem;
  flex-shrink: 0;
}
 
.map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
 
.btn-location {
  background: #f0fdf4;
  border: 1.5px solid #9341fd;
  color: #9341fd;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
 
.btn-location:hover {
  background: #dcfce7;
}
 
.coords {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: monospace;
}
 
/* ===== Editor ===== */
.editor-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  min-height: 180px;
  margin-top: 0.25rem;
}
 
/* ===== Submit ===== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
 
.btn-submit {
  background: #9341fd;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 2.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 4px 12px rgba(147, 65, 253, 0.3);
}
 
.btn-submit:hover {
  background: #9341fd;
  transform: translateY(-1px);
}
 
.btn-submit:active {
  transform: translateY(0);
}
/* ROW 3: Editor deskripsi */
  .editor-wrapper {
    min-height: 200px;
    max-height: 300px;
    overflow-y: auto;
  }

  /* ROW 3: Lokasi - peta lebih pendek di HP */
  .map-container {
    height: 200px;
  }

  .map-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-location {
    width: 100%;
    text-align: center;
  }

  /* ROW 4: Date range picker full width */
  .c-date-range-picker,
  [class*="date-range"] {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* ROW 4: File upload full width dan tidak overflow */
  .file-upload-area {
    width: 100%;
    overflow-x: hidden;
  }

  .v-file-upload {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Switch row agar tidak overflow */
  .switch-row {
    flex-wrap: wrap;
  }

  /* Pastikan semua form group tidak overflow */
  .form-group {
    overflow: hidden;
    word-break: break-word;
  }

</style>
