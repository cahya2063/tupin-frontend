<script setup>
import { apiFetch, getProfile } from '@/utils/api'
import { onMounted, ref, watch } from 'vue'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { nextTick } from 'vue'
import Swal from 'sweetalert2'
import { getCurrentLocation, useDestination } from '@/utils/tools'
import { config, editor } from '../../utils/tools'

const {destinationList, handleSearch, getDestination} = useDestination()

const props = defineProps({
  technicianId: String,
})
 
const description = ref('')

 
const userId = localStorage.getItem('userId')

const technicianProfile = ref({})
const uploadedFiles = ref([])

const title = ref('')
const category = ref('Elektronik')
const needDeadline = ref(false)
const vStartDate = ref(null)
const vEndDate = ref(null)
const postCode = ref(null)
const today = new Date()
// const destinationList = ref([])
const selectedDestination = ref([])
 
const lat = ref(-8.2192)
const lng = ref(114.3691)
 
let map
let marker
 
// function handleFileUpload(e) {
//   photoFile.value = e.target.files[0]
// }
function toLocalISODate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().split('T')[0]
}

const getMyLocation = async () => {
  try {
    const posisi = await getCurrentLocation()
    lat.value = posisi.lat
    lng.value = posisi.lng
    map.flyTo([posisi.lat, posisi.lng], 15)
    marker.setLatLng([posisi.lat, posisi.lng])
  } catch (err) {
    console.error('Gagal ambil lokasi:', err)
  }
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

async function postJob() {
  
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
    Swal.fire({
      title: 'Sukses',
      text: response.data.message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#16a34a',
    })

    // reset form
    title.value = ''
    category.value = 'Elektronik'
    needDeadline.value = false
    vStartDate.value = null
    vEndDate.value = null
    description.value = ''
    uploadedFiles.value = []
    postCode.value = null
    destinationList.value = []
    lat.value = -8.2192
    lng.value = 114.3691
    marker?.setLatLng([lat.value, lng.value])
    map?.setView([lat.value, lng.value], 13)
  }
  else{
    Swal.fire({
      title: 'Gagal',
      text: response.data.message || 'Terjadi kesalahan saat mengirim permintaan',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626',
    })
  }
}
 
watch(selectedDestination, (val) => {
  console.log('selected raw:', val)
})
onMounted(async () => {
  
  technicianProfile.value = await getProfile(props.technicianId)
  
  technicianProfile.value.skills = await Promise.all(
    technicianProfile.value.skills.map(async (skillId) => {
      return await getSkills(skillId)
    })
  )
  console.log('profile teknisi : ', technicianProfile.value.skills);
  
  await nextTick()
  map = L.map('map', {
    zoomControl: false,
  }).setView([lat.value, lng.value], 13)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap & Carto',
  }).addTo(map)
 
  marker = L.marker([lat.value, lng.value], { draggable: true }).addTo(map)
 
  marker.on('dragend', function () {
    const position = marker.getLatLng()
    lat.value = position.lat
    lng.value = position.lng
  })
 
  map.on('click', function (e) {
    lat.value = e.latlng.lat
    lng.value = e.latlng.lng
    marker.setLatLng(e.latlng)
  })
 
  map.invalidateSize()
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
            v-model="title"
            name="title"
            type="text"
            placeholder="cth: kulkas saya tidak dingin"
            required
          />
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
          <div class="category-options">
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
          />
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
          <div class="editor-wrapper">
            <ckeditor
              v-if="editor && config"
              v-model="description"
              :editor="editor"
              :config="config"
            />
          </div>
        </div>
 
        <!-- Lokasi -->
        <div class="form-group">
          <label class="field-label">
            <span class="label-number">06</span>
            Lokasi Perbaikan
          </label>
          <p class="field-hint">masukkan kode pos tempat perbaikan</p>

          <CMultiSelect
            :multiple="false"
            :options="destinationList"
            :value="selectedDestination"
            @change="(val) => { selectedDestination = val }"
            @filter-change="handleSearch"
            placeholder="masukkan kode pos"
            virtual-scroller
            
          />
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
 
/* ===== Input ===== */
.field-input {
  margin-top: 0.25rem;
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
</style>
