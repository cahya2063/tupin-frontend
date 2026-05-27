<script setup>
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import { config, editor, showSidebarPostedJobs } from '../../utils/tools'
import { reactive, ref, watch } from 'vue'
import sweetAlert from '@/utils/sweetAlert'
import { apiFetch } from '@/utils/api'


const props = defineProps({
  visible: Boolean,
  selectedJob: Object,
  profile: Object,
  technicianProfile: Object,
})
const reason = ref('')
const uploadedFiles = ref([])

const emit = defineEmits(['close', 'success'])

const errors = reactive({})

function onFileChange(newFiles) {
  const files = newFiles || []

  // kalau jumlah berkurang → berarti hapus
  if (files.length < uploadedFiles.value.length) {
    uploadedFiles.value = files
    return
  }

  // kalau bertambah → merge
  const merged = [...uploadedFiles.value, ...files]

  uploadedFiles.value = merged.filter((file, index, self) =>
    index === self.findIndex(f =>
      f.name === file.name &&
      f.size === file.size &&
      f.lastModified === file.lastModified
    )
  )

  if (uploadedFiles.value.length > 0) {
    delete errors.photos
  }
}
function setFieldError(field, message) {
  errors[field] = message
}
function clearErrors() {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

function getReasonText() {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = reason.value || ''

  return (wrapper.textContent || '').replace(/\u00a0/g, ' ').trim()
}

function validateForm(){
    clearErrors()

    if (!getReasonText()) {
        setFieldError('reason', 'Alasan garansi harus diisi')
    }

    if (!uploadedFiles.value.length) {
        setFieldError('photos', 'Foto barang wajib diunggah')
    }

    return Object.keys(errors).length === 0
}

watch(reason, () => {
    if (getReasonText()) {
        delete errors.reason
    }
})

async function createWarranty(){
    try {
        if (!validateForm()) {
            return
        }
        const formData = new FormData()
        formData.append('jobId', props.selectedJob?._id)
        formData.append('reason', reason.value)
        if (uploadedFiles.value && uploadedFiles.value.length > 0) {
            uploadedFiles.value.forEach(file => {
                formData.append('evidence', file)
            })
        }
        const response = await apiFetch(`/warranty/${props.selectedJob._id}/claim-warranty`, {
            method: 'POST',
            body: formData
        })

        console.log('status code garansi : ', response.status);
        
        if(response.status == 201){
            sweetAlert.success(response.data.message)
            reason.value = ''
            uploadedFiles.value = []
            showSidebarPostedJobs.value = false
            emit('success')
            emit('close')
        }
        else{
            sweetAlert.error(response.data.message)
            emit('close')
        }
    } catch (error) {
        sweetAlert.error(error.message)
    }
}
</script>

<template>
  <CModal :visible="visible" @close="emit('close')" scrollable>
    <CModalHeader class="modal-header-custom d-flex justify-content-between" :close-button="false">
        <div>
            <small class="modal-eyebrow">judul Pekerjaan</small>
            <CModalTitle class="modal-job-id">{{ selectedJob?.title }}</CModalTitle>
        </div>

        <button class="btn-close" @click="emit('close')">
            <i class="ri-close-line"></i>
        </button>
    </CModalHeader>

    <CModalBody class="p-0">
        <form class="job-form" novalidate @submit.prevent="createWarranty">
            <div class="modal-section">
                <small class="modal-section-label">Keluhan yang dialami</small>
                <div class="ckeditor-wrapper" :class="{ invalid: errors.reason }">
                <ckeditor
                    v-if="editor && config"
                    v-model="reason"
                    :editor="editor"
                    :config="config"
                    />
                </div>
                <small
                    v-if="errors.reason"
                    class="error-text"
                >
                    {{ errors.reason }}
                </small>
            </div>

            <div class="modal-section">
                <small class="modal-section-label">Unggah foto barang</small>
                <div class="file-upload-area" :class="{ invalid: errors.photos }">
                    <v-file-upload
                        :model-value="uploadedFiles"
                        @update:modelValue="onFileChange"
                        multiple
                        clearable
                        accept="image/*"
                    />
                </div>
                <small
                    v-if="errors.photos"
                    class="error-text"
                >
                    {{ errors.photos }}
                </small>
            </div>
            <div class="button-warranty-wrapper">

                <CButton
                    color="primary"
                    class="my-2 "
                    type="submit"
                    >Ajukan garansi
                </CButton>
            </div>
        </form>
      
    </CModalBody>
  </CModal>
</template>
<style scoped>
.modal-header-custom {
  position: relative;
}
.ckeditor-wrapper.invalid {
  border-color: #e45264 !important;
}
.file-upload-area.invalid :deep(.v-file-upload) {
  border-color: #e45264 !important;
}

.file-upload-area.invalid {
  outline: 1.5px solid #e45264;
  border-radius: 8px;
}

.file-upload-area {
  width: 100%;
  overflow-x: hidden;
}

.error-text {
  display: block;
  color: #c72f43;
  font-size: 0.78rem;
  font-weight: 700;
  margin-top: 0.15rem;
}
.modal-header-custom .btn-close {
  margin-left: auto;
  background: #f4f0ff;
  border: 1.5px solid #ddd4ff;
  color: #8d58ff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.modal-close-btn:hover {
  background: #ede8ff;
}
.ckeditor-wrapper {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px;
}
.modal-section{
    max-height: 500px;
    overflow-y: auto;
}
.button-warranty-wrapper{
    display: flex;
    padding-bottom: 80px; /* added space to clear bottom navigation */
}

.button-warranty-wrapper button{
    width: 50%;
    margin-left: auto;
    margin-right: 20px;
}
</style>
