<script setup>
import { apiFetch } from '@/utils/api'
import { onMounted, ref, computed } from 'vue'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import InlineEditor from '@ckeditor/ckeditor5-build-inline'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { nextTick } from 'vue'
import Swal from 'sweetalert2'

// import 'ckeditor5/ckeditor5.css';

const props = defineProps({
  technicianId : String
})

// ===========CKEDITOR============//

const editor = InlineEditor
const editorData = ref('<p>Tulis sesuatu di sini...</p>')

const config = {
  toolbar: [
    'undo',
    'redo',
    '|',
    'heading',
    '|',
    'bold',
    'italic',
    '|',
    'link',
    '|',
    'bulletedList',
    'numberedList',
    'outdent',
    'indent',
  ],
  placeholder: 'Ketik atau paste konten di sini...',
  height: '100px',
}

const stepperRef = ref()
const currentStep = ref(1)
const finish = ref(false)
const validationState = ref(0)

const userId = localStorage.getItem('userId')

const steps = [
  'Judul',
  'Kategori',
  'Deadline',
  'Gambar',
  'Deskripsi',
  'Lokasi'
]

// langsung flat
const options = ref([])


const title = ref('')
const category = ref('Elektronik')
const needDeadline = ref(false)
const vStartDate = ref(null)
const vEndDate = ref(null)

const description = ref('')
const photoFile = ref(null) // simpan file disini

const lat = ref(-8.2192) // default lokasi
const lng = ref(114.3691)

let map
let marker

// handle ambil file
function handleFileUpload(e) {
  photoFile.value = e.target.files[0]
}
function toLocalISODate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().split('T')[0]
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
  formData.append('selectedTechnician', props.technicianId)

  if (photoFile.value) {
    formData.append('photo', photoFile.value)
  }

  console.log('form data : ', formData);
  
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
    stepperRef.value.reset()
  }
}

onMounted(()=>{
  map = L.map('map').setView([lat.value, lng.value], 13)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap & Carto'
  }).addTo(map)

  marker = L.marker([lat.value, lng.value], {draggable: true}).addTo(map)

  // event geser marker
  marker.on('dragend', function(e){
    const position  = marker.getLatLng()
    lat.value = position.lat
    lng.value = position.lng
  })

  // event klik map
  map.on('click', function(e){
    lat.value = e.latlng.lat
    lng.value = e.latlng.lng

    marker.setLatLng(e.latlng)
  })
})

const getCurrentLocation = ()=>{
  if(!navigator.geolocation){
    Swal.fire({
      title: 'Error',
      text: 'Geolocation tidak didukung oleh browser Anda.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }

  navigator.geolocation.getCurrentPosition(
    (position)=>{
      lat.value = position.coords.latitude
      lng.value = position.coords.longitude

      map.flyTo([lat.value, lng.value], 15, {
        animate: true,
        duration: 1.5
      })
      marker.setLatLng([lat.value, lng.value])
    },
    ()=>{
      Swal.fire({
        title: 'Error',
        text: 'Gagal mendapatkan lokasi. Pastikan Anda memberikan izin akses lokasi.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  )
}
watch(currentStep, async (step) => {
  if (step === 6) {
    await nextTick()
    map.invalidateSize()
  }
})

</script>

<template>
  <div class="stepper-wrapper">
    <CStepper
      :steps="steps"
      layout="vertical"
      @finish="finish = true"
      @reset="finish = false"
      @step-change="step => (currentStep = step)"
      @step-validation-complete="({ stepNumber }) => (validationState = stepNumber)"
      ref="stepperRef"
    >
      <template #step-1="{ formRef }">
        <form
          class="row form-title g-2 py-3"
          :class="{ 'was-validated': validationState === 1 }"
          novalidate
          :ref="formRef"
        >
          <CCol :md="4">
            <div class="title">ayo buat judul yang mudah dipahami</div>
          </CCol>
          <CCol :md="6">
            <CFormInput
              class="title-input"
              v-model="title"
              name="title"
              type="text"
              value=""
              label="tulis judul untuk perbaikanmu"
              required
            />
            <div class="example-title">
              <div class="example-title-1">contoh judul :</div>
              <ul class="custom-list">
                <li>lemari pendingin saya tidak dingin</li>
                <li>meja kerja saya permukaannya retak</li>
                <li>kompor gas saya tidak menyala</li>
                <li>keran air saya mampet</li>
                <li>motor saya mengeluarkan suara kasar</li>
              </ul>
            </div>
          </CCol>
        </form>
        <div class="d-flex btn-next-container gap-2 mt-4 me-4">
          
          <CButton
            v-if="!finish && currentStep < steps.length"
            color="primary"
            @click="stepperRef?.next()"
          >
            Next
          </CButton>
        </div>
      </template>

      <template #step-2="{ formRef }">
        <form
          class="row g-2 py-3"
          novalidate
          :ref="formRef"
        >
          <CCol :md="4">
            <div class="title">barangmu yang rusak apa kategorinya?</div>
          </CCol>
          <CCol :md="8">
            <CFormCheck
              class="category-radio"
              type="radio"
              id="flexRadioVModel1"
              inline
              label="Elektronik"
              value="Elektronik"
              v-model="category"
            />
            <CFormCheck
              class="category-radio"
              type="radio"
              id="flexRadioVModel2"
              inline
              label="Furnitur"
              value="Furnitur"
              v-model="category"
            />
            <CFormCheck
              class="category-radio"
              type="radio"
              id="flexRadioVModel4"
              inline
              label="Kamar Mandi"
              value="Kamar Mandi"
              v-model="category"
            />
            <CFormCheck
              class="category-radio"
              type="radio"
              id="flexRadioVModel5"
              inline
              label="Kendaraan"
              value="Kendaraan"
              v-model="category"
            />
            <CFormCheck
              class="category-radio"
              type="radio"
              id="flexRadioVModel5"
              inline
              label="Lainnya"
              value="Lainnya"
              v-model="category"
            />
            <div class="picked">Category : {{ category }}</div>
          </CCol>
        </form>
        <div class="d-flex btn-next-container gap-2 mt-4">
          <CButton
            v-if="!finish && currentStep > 1"
            color="secondary"
            @click="stepperRef?.prev()"
          >
            Previous
          </CButton>
          <CButton
            v-if="!finish && currentStep < steps.length"
            color="primary"
            @click="stepperRef?.next()"
          >
            Next
          </CButton>
          
        </div>
      </template>

      <template #step-3="{ formRef }">
        <form
          class="row g-3 pt-3"
          novalidate
          :ref="formRef"
        >
          <CCol :md="4">
            <div class="title">apakah kamu perlu jangka waktu?</div>
          </CCol>
          <CCol :md="6">
            <div class="switch-box">
              Tidak
              <CFormSwitch
                size="xl"
                id="formSwitchCheckDefaultXL"
                v-model="needDeadline"
              />
              Ya
            </div>

            <!-- hanya muncul kalau switch aktif -->
            <CDateRangePicker
              v-if="needDeadline"
              :key="'date-picker-' + needDeadline"
              label="Date range"
              locale="en-US"
              v-model:start-date="vStartDate"
              v-model:end-date="vEndDate"
            />
            <div class="mt-2 text-muted">
              <pre>{{ (vStartDate, '-', vEndDate) }}</pre>
            </div>
          </CCol>
        </form>
        <div class="d-flex btn-next-container gap-2 mt-4">
          <CButton
            v-if="!finish && currentStep > 1"
            color="secondary"
            @click="stepperRef?.prev()"
          >
            Previous
          </CButton>
          <CButton
            v-if="!finish && currentStep < steps.length"
            color="primary"
            @click="stepperRef?.next()"
          >
            Next
          </CButton>
          
        </div>
      </template>

      <template #step-4="{ formRef }">
        <form
          class="row g-3 pt-3"
          novalidate
          :ref="formRef"
        >
          <CCol :md="4">
            <div class="title">Upload gambar alatmu</div>
          </CCol>
          <CCol
            :md="6"
            class="py-3"
          >
            <CFormInput
              type="file"
              id="inputGroupFile01"
              @change="handleFileUpload"
            />
          </CCol>
        </form>
        <div class="d-flex btn-next-container gap-2 mt-4">
          <CButton
            v-if="!finish && currentStep > 1"
            color="secondary"
            @click="stepperRef?.prev()"
          >
            Previous
          </CButton>
          <CButton
            v-if="!finish && currentStep < steps.length"
            color="primary"
            @click="stepperRef?.next()"
          >
            Next
          </CButton>
          
        </div>
      </template>

      <template #step-5="{ formRef }">
        <form
          class="row g-3 pt-3"
          novalidate
          :ref="formRef"
        >
          <CCol :md="4">
            <div class="title">Ceritakan lagi tentang alatmu?</div>
          </CCol>
          <CCol
            :md="6"
            class="py-3"
          >
            <div class="main-container">
              <div
                class="editor-container editor-container_inline-editor"
                ref="editorContainerElement"
              >
                <div class="editor-container__editor">
                  <div ref="editorElement">
                    <ckeditor
                      v-if="editor && config"
                      v-model="description"
                      :modelValue="config.initialData"
                      :editor="editor"
                      :config="config"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CCol>
        </form>
        <div class="d-flex btn-next-container gap-2 mt-4">
          <CButton
            v-if="!finish && currentStep > 1"
            color="secondary"
            @click="stepperRef?.prev()"
          >
            Previous
          </CButton>
          <CButton
            v-if="!finish && currentStep < steps.length"
            color="primary"
            @click="stepperRef?.next()"
          >
            Next
          </CButton>
          
        </div>
      </template>

      <template #step-6="{ formRef }">
        <form
          class="row g-3 pt-3"
          novalidate
          :ref="formRef"
        >
          <CCol :md="4">
            <div class="title">Dimana lokasi perbaikannya?</div>
          </CCol>
          <CCol
            :md="6"
            class="py-3"
          >
            <div id="map" style="height: 400px;"></div>

            <button @click.prevent="getCurrentLocation">
              Ambil Lokasi Saya
            </button>

            <p>Latitude: {{ lat }}</p>
            <p>Longitude: {{ lng }}</p>
          </CCol>
        </form>
        <div class="d-flex btn-next-container gap-2 mt-4">
          <CButton
            v-if="!finish && currentStep > 1"
            color="secondary"
            @click="stepperRef?.prev()"
          >
            Previous
          </CButton>
              <CButton
            v-if="!finish && currentStep === steps.length"
            color="primary"
            @click="postJob"
          >
            Finish
          </CButton>
          
        </div>
      </template>

    </CStepper>
    <div v-if="finish">All steps are complete—you're finished.</div>

    <div class="d-flex gap-2 mt-4">      
      <CButton
        color="danger"
        @click="stepperRef?.reset()"
      >
        Reset
      </CButton>
    </div>
  </div>
</template>

<style scoped>
.stepper-wrapper {
  width: 85%;
}
.btn-next-container{
  display: flex;
  justify-content: end;
}
.title {
  font-size: 30px;
  font-weight: 500;
  margin-bottom: 15px;
}
.title-input {
  margin-bottom: 10px;
}
.example-title {
  margin-block: 15px;
}
.example-title-1 {
  margin-block: 10px;
}
.custom-list {
  list-style-type: disc;
  padding-left: 1.5rem; /* atau sesuai kebutuhan */
}
.category-radio {
  margin-inline: 30px;
}
.picked {
  margin-left: 30px;
}
.switch-box {
  display: flex;
  justify-content: center;
  align-items: center; /* biar vertikalnya juga rapi */
  gap: 10px; /* kasih jarak antara teks dan switch */
}

.ck-editor__editable_inline {
  width: 600px;
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd; /* kasih border default */
  border-radius: 4px; /* biar lebih halus */
  padding: 8px; /* kasih jarak teks ke border */
  background: #fff;
}
.ck-editor__editable_inline:focus {
  border-color: #4a90e2; /* warna border saat fokus */
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}
</style>
