<script setup>
import Payment from '@/components/form/Payment.vue'

const props = defineProps({
  visible: Boolean,
  selectedJob: Object,
  profile: Object,
  technicianProfile: Object,
  shippingCost: Number,
})

const emit = defineEmits(['close'])

const formatRupiah = (val) => 'Rp ' + (val || 0).toLocaleString('id-ID')
</script>

<template>
  <CModal :visible="visible" @close="emit('close')">
    <CModalHeader class="modal-header-custom d-flex justify-content-between" :close-button="false">
        <div>
            <small class="modal-eyebrow">ID Pekerjaan</small>
            <CModalTitle class="modal-job-id">{{ selectedJob?._id }}</CModalTitle>
        </div>

        <button class="btn-close" @click="emit('close')">
            <i class="ri-close-line"></i>
        </button>
    </CModalHeader>

    <CModalBody class="p-0">
      <div class="modal-section">
        <small class="modal-section-label">Lokasi</small>
        <div class="location-grid">
          <div class="location-card location-card--client">
            <span class="location-card__icon"><i class="ri-user-line"></i></span>
            <div>
              <span class="location-card__lbl">Pelanggan</span>
              <strong class="location-card__val">{{ selectedJob?.destination?.destinationName || '-' }}</strong>
            </div>
          </div>
          <div class="location-card location-card--tech">
            <span class="location-card__icon"><i class="ri-tools-line"></i></span>
            <div>
              <span class="location-card__lbl">Teknisi</span>
              <strong class="location-card__val">{{ technicianProfile?.receiverLocation?.destinationName || '-' }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-section">
        <small class="modal-section-label">Rincian Biaya</small>
        <div class="cost-table">
          <div class="cost-row">
            <span class="cost-label">Ongkos kirim</span>
            <span class="cost-value">{{ formatRupiah(shippingCost) }}</span>
          </div>
          <div class="cost-row cost-row--total">
            <span class="cost-label">Total</span>
            <span class="cost-value cost-value--total">{{ formatRupiah(shippingCost) }}</span>
          </div>
        </div>
      </div>
    </CModalBody>

    <CModalFooter class="modal-footer-custom">
      <Payment
        v-show="selectedJob?.status === 'open'"
        :name="profile?.nama"
        :email="profile?.email"
        :amount="shippingCost"
        :sub-account-id="technicianProfile?.subAccountId"
        :job-id="selectedJob?._id"
        :payer-id="profile?._id"
        :status="selectedJob?.status"
        :receiver-id="selectedJob?.selectedTechnician"
      />
    </CModalFooter>
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
</style>
