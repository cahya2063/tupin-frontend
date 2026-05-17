<script setup>
import { apiFetch } from '@/utils/api'
import sweetAlert from '@/utils/sweetAlert'
import { config, editor } from '@/utils/tools'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  selectedJob: Object,
})

const emit = defineEmits(['close', 'submitted'])

const reportCategories = [
  'Hasil tidak sesuai',
  'Penipuan',
  'Pencurian',
  'Sulit dihubungi',
  'Lainnya',
]

const category = ref('Penipuan')
const description = ref('')
const uploadedFiles = ref([])
const isSubmitting = ref(false)

function onFileChange(newFiles) {
  const files = newFiles || []

  if (files.length < uploadedFiles.value.length) {
    uploadedFiles.value = files
    return
  }

  const merged = [...uploadedFiles.value, ...files]

  uploadedFiles.value = merged.filter((file, index, self) =>
    index === self.findIndex(f =>
      f.name === file.name &&
      f.size === file.size &&
      f.lastModified === file.lastModified
    )
  )
}

function resetForm() {
  category.value = 'Penipuan'
  description.value = ''
  uploadedFiles.value = []
}

function hasDescriptionValue() {
  const element = document.createElement('div')
  element.innerHTML = description.value || ''

  return Boolean(element.textContent?.replace(/\u00a0/g, ' ').trim())
}

async function createReport() {
  if (isSubmitting.value)
    return

  if (!props.selectedJob?._id) {
    sweetAlert.error('Data job tidak ditemukan')
    return
  }

  if (!hasDescriptionValue()) {
    sweetAlert.error('Deskripsi laporan wajib diisi')
    return
  }

  if (!uploadedFiles.value.length) {
    sweetAlert.error('Bukti pelanggaran wajib diunggah')
    return
  }

  try {
    isSubmitting.value = true

    const formData = new FormData()
    formData.append('category', category.value)
    formData.append('description', description.value)

    uploadedFiles.value.forEach(file => {
      formData.append('reports', file)
    })

    const response = await apiFetch(`/reports/${props.selectedJob._id}/add-reports`, {
      method: 'POST',
      body: formData,
    })

    if (response.status === 201) {
      sweetAlert.success(response.data.message || 'Berhasil mengajukan laporan')
      emit('submitted', response.data)
      emit('close')
      resetForm()
      return
    }

    emit('close')
    sweetAlert.error(response.data.message || 'Gagal mengajukan laporan')
  } catch (error) {
    sweetAlert.error(error.message || 'Gagal mengajukan laporan')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.visible,
  visible => {
    if (!visible)
      resetForm()
  }
)
</script>

<template>
  <CModal :visible="visible" @close="emit('close')" scrollable>
    <CModalHeader class="modal-header-custom d-flex justify-content-between" :close-button="false">
      <div>
        <small class="modal-eyebrow">Laporkan Teknisi</small>
        <CModalTitle class="modal-job-id">{{ selectedJob?.title }}</CModalTitle>
      </div>

      <button class="btn-close" @click="emit('close')">
        <i class="ri-close-line"></i>
      </button>
    </CModalHeader>

    <CModalBody class="p-0">
      <form class="report-form" novalidate @submit.prevent="createReport">
        <div class="modal-section">
          <small class="modal-section-label">Kategori pelanggaran</small>
          <select v-model="category" class="report-select">
            <option
              v-for="item in reportCategories"
              :key="item"
              :value="item"
            >
              {{ item }}
            </option>
          </select>
        </div>

        <div class="modal-section">
          <small class="modal-section-label">Deskripsi pelanggaran</small>
          <div class="ckeditor-wrapper">
            <ckeditor
              v-if="editor && config"
              v-model="description"
              :editor="editor"
              :config="config"
            />
          </div>
        </div>

        <div class="modal-section">
          <small class="modal-section-label">Bukti pelanggaran</small>
          <v-file-upload
            :model-value="uploadedFiles"
            @update:modelValue="onFileChange"
            multiple
            clearable
            accept="image/*"
          />
        </div>

        <div class="button-report-wrapper">
          <CButton
            color="primary"
            class="my-2"
            type="submit"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Mengirim laporan...' : 'Kirim laporan' }}
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

.modal-header-custom .btn-close:hover {
  background: #ede8ff;
}

.report-form {
  padding-bottom: 80px;
}

.modal-section {
  max-height: 500px;
  overflow-y: auto;
}

.report-select {
  width: 100%;
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid #d8d3e8;
  border-radius: 8px;
  background: #fff;
  color: #2f2a3d;
  outline: none;
}

.report-select:focus {
  border-color: #8d58ff;
  box-shadow: 0 0 0 3px rgba(141, 88, 255, 0.14);
}

.ckeditor-wrapper {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px;
}

.button-report-wrapper {
  display: flex;
}

.button-report-wrapper button {
  width: 50%;
  margin-left: auto;
  margin-right: 20px;
}
</style>
