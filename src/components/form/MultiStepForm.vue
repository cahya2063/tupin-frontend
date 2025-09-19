<script setup>
import { apiFetch } from '@/utils/api'
import { onMounted, ref, useId, computed } from 'vue'
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import InlineEditor from '@ckeditor/ckeditor5-build-inline'

// import 'ckeditor5/ckeditor5.css';

// ===========CKEDITOR============//

const editor = InlineEditor
const editorData = ref('<p>Tulis sesuatu di sini...</p>')

const config = {
  toolbar: [
    'undo', 'redo', '|',
    'heading', '|',
    'bold', 'italic', '|',
    'link', '|',
    'bulletedList', 'numberedList', 'outdent', 'indent'
  ],
  placeholder: 'Ketik atau paste konten di sini...',
  height: '100px'
}

const stepperRef = ref()
const currentStep = ref(1)
const finish = ref(false)
const validationState = ref(0)
const uid = useId()

const userId = localStorage.getItem('userId')

const steps = ['Judul', 'Kategori', 'Keahlian', 'Deadline', 'Pengalaman', 'Budget', 'Gambar', 'Deskripsi']

// langsung flat
const options = ref([])

async function getSkills() {
  const response = await apiFetch(`/skills`)
  const flatSkills = response.data.skills.flatMap((item) =>
    item.skill.map((s) => ({
      value: s.value,
      label: s.value,
    }))
  )

  options.value = flatSkills
}

const title = ref('')
const category = ref('Elektronik')
const skills = ref([])
const needDeadline = ref(false)
const vStartDate = ref(null)
const vEndDate = ref(null)
const experience = ref('Medioker')
const budget = ref()
const description = ref('')
const photoFile = ref(null) // file akan disimpan di sini

// handle ambil file
function handleFileUpload(e) {
  photoFile.value = e.target.files[0]
}

async function postJob() {
  const formData = new FormData()

  formData.append('title', title.value)
  formData.append('category', category.value)
  formData.append('skills', JSON.stringify(skills.value))
  formData.append(
    'deadline',
    JSON.stringify({
      start_date: vStartDate.value || '-',
      end_date: vEndDate.value || '-',
    })
  )
  formData.append('experiences', experience.value)
  formData.append('budget', budget.value)
  formData.append('description', description.value)
  formData.append('userId', userId)

  if (photoFile.value) {
    formData.append('photo', photoFile.value)
  }

  const response = await apiFetch('/jobs', {
    method: 'POST',
    body: formData, // langsung FormData
    // ❌ jangan set Content-Type
  })

}

onMounted(async () => {
  getSkills()
})
</script>



<template>
  <div>
    <CStepper
      :steps="steps"
      layout="vertical"
      @finish="finish = true"
      @reset="finish = false"
      @step-change="(step) => (currentStep = step)"
      @step-validation-complete="({stepNumber}) => (validationState = stepNumber)"
      ref="stepperRef"
    >
      <template #step-1="{ formRef }">
        <form class="row form-title g-2 py-3" :class="{ 'was-validated': validationState === 1 }" novalidate :ref="formRef">
            
          <CCol :md="4">
            <div class="title">
                ayo buat judul yang mudah dipahami
            </div>
          </CCol>
          <CCol :md="6">
            <CFormInput class="title-input" v-model="title" name="title" type="text" value="" label="tulis judul untuk perbaikanmu" required/>
            <div class="example-title">
                <div class="example-title-1">

                    contoh judul :
                </div>
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
      </template>

      <template #step-2="{ formRef }">
        <form class="row g-2 py-3" novalidate :ref="formRef">
          <CCol :md="4">
            <div class="title">
                barangmu yang rusak apa kategorinya?
            </div>
          </CCol>
          <CCol :md="8">
            <CFormCheck class="category-radio" type="radio" id="flexRadioVModel1" inline label="Elektronik" value="Elektronik" v-model="category"/>
            <CFormCheck class="category-radio" type="radio" id="flexRadioVModel2" inline label="Furnitur" value="Furnitur" v-model="category"/>
            <CFormCheck class="category-radio" type="radio" id="flexRadioVModel4" inline label="Kamar Mandi" value="Kamar Mandi" v-model="category"/>
            <CFormCheck class="category-radio" type="radio" id="flexRadioVModel5" inline label="Kendaraan" value="Kendaraan" v-model="category"/>
            <CFormCheck class="category-radio" type="radio" id="flexRadioVModel5" inline label="Lainnya" value="Lainnya" v-model="category"/>
            <div class="picked">Category : {{ category }}</div>
          </CCol>
        </form>
      </template>

      <template #step-3="{ formRef }">
        <form class="row g-3 pt-3" novalidate :ref="formRef">
          <CCol :md="4">
            <div class="title">
              skill apa yang kamu butuhkan?
            </div>
          </CCol>
          <CCol :md="6">
            <CMultiSelect
              :options="options"
              multiple
              @change="skills = $event.map(opt => opt.value)"
            />
          </CCol>
        </form>
      </template>

      <template #step-4="{ formRef }">
        <form class="row g-3 pt-3" novalidate :ref="formRef">
          <CCol :md="4">
            <div class="title">
                apakah kamu perlu jangka waktu?
            </div>
          </CCol>
          <CCol :md="6">
            <div class="switch-box">
              Tidak
              <CFormSwitch size="xl" id="formSwitchCheckDefaultXL" v-model="needDeadline" />
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
                <pre>{{vStartDate, '-', vEndDate}}</pre>
              </div>
          </CCol>
        </form>
      </template>

      <template #step-5="{ formRef }">
        <form class="row g-3 pt-3" novalidate :ref="formRef">
          <CCol :md="4">
            <div class="title">
                Mau alatmu diperbaiki ahli?
            </div>
          </CCol>
          <CCol :md="6" class="py-3">
            <div class="experience-container">
              <div class="experience-btn-caption">     
                mencari seseorang yang relatif baru di bidang ini
              </div>
              <CFormCheck type="radio" value="Newbie" v-model="experience" name="flexRadioDefault" id="flexRadioDefault1"  label="Newbie"/>
            </div>
            <div class="experience-container">
              <div class="experience-btn-caption">     
                mencari seseorang dengan pengalaman menengah
              </div>
            <CFormCheck type="radio" value="Medioker" v-model="experience" name="flexRadioDefault" id="flexRadioDefault2" label="Medioker" checked/>
            </div>

            <div class="experience-container">
              <div class="experience-btn-caption">
                mencari seseorang ahli untuk menangani
              </div>
              <CFormCheck type="radio" value="Expert" v-model="experience" name="flexRadioDefault" id="flexRadioDefault1" label="Expert"/>
            </div>
          </CCol>
        </form>
      </template>

      <template #step-6="{ formRef }">
        <form class="row g-3 pt-3" novalidate :ref="formRef">
          <CCol :md="4">
            <div class="title">
                Mau alatmu diperbaiki ahli?
            </div>
          </CCol>
          <CCol :md="6" class="py-3">
            <CFormInput
              v-model="budget"
              type="number"
              id="input-budget"
              label="Berapa budgetmu?"
              placeholder="masukkan budgetmu..."
            />
          </CCol>
        </form>
      </template>

      <template #step-7="{ formRef }">
        <form class="row g-3 pt-3" novalidate :ref="formRef">
          <CCol :md="4">
            <div class="title">Upload gambar alatmu</div>
          </CCol>
          <CCol :md="6" class="py-3">
            <CFormInput type="file" id="inputGroupFile01" @change="handleFileUpload" />
          </CCol>
        </form>
      </template>

      <template #step-8="{ formRef }">
        <form class="row g-3 pt-3" novalidate :ref="formRef">
          <CCol :md="4">
            <div class="title">
                Ceritakan lagi tentang alatmu?
            </div>
          </CCol>
          <CCol :md="6" class="py-3">
            <div class="main-container">
              <div class="editor-container editor-container_inline-editor" ref="editorContainerElement">
                <div class="editor-container__editor">
                  <div ref="editorElement">
                    <ckeditor v-if="editor && config" v-model="description" :modelValue="config.initialData" :editor="editor" :config="config" />
                  </div>
                </div>
              </div>
            </div>
          </CCol>
        </form>
      </template>



    </CStepper>
    <div v-if="finish">All steps are complete—you're finished.</div>

    <div class="d-flex gap-2 mt-4">
      <CButton v-if="!finish && currentStep > 1" color="secondary" @click="stepperRef?.prev()">
        Previous
      </CButton>
      <CButton
        v-if="!finish && currentStep < steps.length"
        color="primary"
        @click="stepperRef?.next()"
      >
        Next
      </CButton>
      <CButton
        v-if="!finish && currentStep === steps.length"
        color="primary"
        @click="postJob"
      >
        Finish
      </CButton>
      <CButton v-if="finish" color="danger" @click="stepperRef?.reset()"> Reset </CButton>
    </div>
  </div>
</template>

<style scoped>

.title{
    font-size: 30px;
    font-weight: 500;
    margin-bottom: 15px;
}
.title-input{
    margin-bottom: 10px;
}
.example-title{
    margin-block: 15px;
}
.example-title-1{
    margin-block: 10px;
}
.custom-list {
  list-style-type: disc;
  padding-left: 1.5rem; /* atau sesuai kebutuhan */
}
.category-radio{
    margin-inline: 30px;
}
.picked{
    margin-left: 30px;
}
.switch-box{
  display: flex;
  justify-content: center;
  align-items: center; /* biar vertikalnya juga rapi */
  gap: 10px; /* kasih jarak antara teks dan switch */
}
.experience-container{
  margin-bottom: 10px;
}
.experience-btn-caption{
  color: rgb(165, 156, 156);
}
.ck-editor__editable_inline {
  width: 600px;
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;     /* kasih border default */
  border-radius: 4px;         /* biar lebih halus */
  padding: 8px;               /* kasih jarak teks ke border */
  background: #fff;     
}
.ck-editor__editable_inline:focus {
  border-color: #4a90e2;      /* warna border saat fokus */
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}
</style>
