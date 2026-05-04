<script setup>
import Payment from '@/components/form/Payment.vue'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import { config, editor, showSidebarPostedJobs } from '../../utils/tools'
import { ref } from 'vue'
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

const emit = defineEmits(['close'])


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

async function createWarranty(){
    try {
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
                <div class="ckeditor-wrapper">
                <ckeditor
                    v-if="editor && config"
                    v-model="reason"
                    :editor="editor"
                    :config="config"
                    />
                </div>
            </div>

            <div class="modal-section">
                <small class="modal-section-label">Unggah foto barang</small>
                <v-file-upload
                    :model-value="uploadedFiles"
                    @update:modelValue="onFileChange"
                    multiple
                    clearable
                    accept="image/*"
                />
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
