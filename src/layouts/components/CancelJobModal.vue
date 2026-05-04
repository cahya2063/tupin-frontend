<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { config, editor } from '@/utils/tools';
import { Ckeditor } from '@ckeditor/ckeditor5-vue'

import { ref } from 'vue';


const props = defineProps({
  visible: Boolean,
  selectedJob: Object,
})
const category = ref('skill_mismatch')
const note = ref('')

async function cancelJobs(){
  try {
    console.log('job cancel : ', props.selectedJob._id);
    
    const response = await apiFetch(`/jobs/${props.selectedJob?._id}/cancel-jobs`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        note: note.value,
        category: category.value
      })
      
    })
    console.log('cancel : ', response);
    sweetAlert.success('Berhasil menolak job')
  } catch (error) {
    sweetAlert.error(error)
  }
}

const emit = defineEmits(['close'])


</script>

<template>
  <CModal :visible="visible" @close="emit('close')">
    <CModalHeader class="modal-header-custom d-flex justify-content-between" :close-button="false">
        <div>
            <small class="modal-eyebrow">Tolak Perbaikan</small>
            <CModalTitle class="modal-job-id">{{ selectedJob?._id }}</CModalTitle>
        </div>

        <button class="btn-close" @click="emit('close')">
            <i class="ri-close-line"></i>
        </button>
    </CModalHeader>

    <CModalBody class="p-0">
      <div class="modal-section">
        <small class="modal-section-label">Lokasi</small>
        <CFormCheck type="radio" id="flexRadioVModel1" inline label="Tidak sesuai keahlian" value="skill_mismatch" v-model="category"/>
        <CFormCheck type="radio" id="flexRadioVModel3" inline label="Tidak tersedia" value="not_available" v-model="category"/>
        <CFormCheck type="radio" id="flexRadioVModel2" inline label="Lokasi terlalu jauh" value="distance_too_far" v-model="category"/>
        <CFormCheck type="radio" id="flexRadioVModel4" inline label="Negosiasi gagal" value="negotiation_failed" v-model="category"/>
        <CFormCheck type="radio" id="flexRadioVModel5" inline label="Pelanggan tidak responsif" value="client_unresponsive" v-model="category"/>
      </div>

      <div class="modal-section">
        <small class="modal-section-label">alasan</small>
        <div class="cost-table">
          <div class="editor-wrapper">
            <ckeditor
              v-if="editor && config"
              v-model="note"
              :editor="editor"
              :config="config"
            />
          </div>
        </div>
      </div>
    </CModalBody>

    <CModalFooter class="modal-footer-custom">
        <div class="button-warranty-wrapper">
            <CButton
                color="primary"
                class="my-2 "
                type="submit"
                @click="cancelJobs"
                >Ajukan garansi
            </CButton>
        </div>
    </CModalFooter>
  </CModal>
</template>
<style scoped>
.editor-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  min-height: 180px;
  margin-top: 0.25rem;
}
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
</style>
