<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { ref } from 'vue';

const emit = defineEmits(['close'])

const props = defineProps({
  visible: Boolean,
  selectedJob: Object,
})

const deletedReason = ref('')

async function reportJob(){
    console.log('test report', deletedReason.value);
    
    
  if(!deletedReason.value) {
    sweetAlert.error('Pilih alasan report')
    return
  }
  console.log('jobId : ', props.selectedJob?._id);
  
  try {
    const response = await apiFetch(`/jobs/${props.selectedJob?._id}/report-job`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deletedReason: deletedReason.value
      })
    })
    console.log('reponse report : ', response.data);
    
    
    emit('close')
    sweetAlert.success('Berhasil melaporkan pekerjaan')
    deletedReason.value = ''
  } catch (error) {
    sweetAlert.error(error)
  }
}

</script>

<template>
  <CModal :visible="visible" @close="emit('close')">
    <CModalHeader class="modal-header-custom d-flex justify-content-between" :close-button="false">
        <div>
            <small class="modal-eyebrow">Laporkan Pekerjaan</small>
            <CModalTitle class="modal-job-id">{{ selectedJob?.title }}</CModalTitle>
        </div>

        <button class="btn-close modal-close-btn" @click="emit('close')">
            <i class="ri-close-line"></i>
        </button>
    </CModalHeader>

    <CModalBody>
      <div class="modal-section">
        <label class="modal-section-label">Alasan Laporan</label>
        <select class="form-select mt-2" v-model="deletedReason">
          <option value="" disabled>Pilih Alasan</option>
          <option value="postingan spam">Postingan spam</option>
          <option value="konten tidak pantas">Konten tidak pantas</option>
          <option value="upload foto aneh">Upload foto aneh</option>
          <option value="bukan konteks perbaikan">Bukan konteks perbaikan</option>
        </select>
      </div>
    </CModalBody>

    <CModalFooter class="modal-footer-custom">
        <CButton
            color="danger"
            class="my-2 text-white"
            type="submit"
            @click="reportJob"
            >Laporkan Pekerjaan
        </CButton>
    </CModalFooter>
  </CModal>
</template>

<style scoped>
.modal-header-custom {
  position: relative;
}

.modal-header-custom .btn-close.modal-close-btn {
  margin-left: auto;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  color: #b91c1c;
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
  background: #fee2e2;
}
.modal-section-label {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}
.modal-eyebrow {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: #b0a4cc;
  display: block;
  margin-bottom: 4px;
}
.modal-job-id {
  font-family: monospace;
  font-size: 14px;
  color: #2d1f52;
  font-weight: 700;
}
</style>
