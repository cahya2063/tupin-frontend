<script setup>
import Payment from '@/components/form/Payment.vue';
import { apiFetch, getProfile } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { createChat } from '@/utils/tools';
import { onMounted, ref, watch } from 'vue';


const props = defineProps({
    selectedJob: Object,
    showSidebar: Boolean,
    isCancelable: Boolean
})
// console.log('selected job : ', props.selectedJob);

const profile = ref()
const technicianId = localStorage.getItem('userId')
const role = localStorage.getItem('role')
const technicianProfile = ref()
const shippingCost = ref()
const repairPrice = ref(0)
const modalAddPrice = ref(false)
const lastCalculatedJobId = ref(null)

const emit = defineEmits([
  'close',
  'cancel',
])

const closeSidebar = () => {
  emit('close')
}
const formatDate = date => {
  if (!date || typeof date !== 'string') return '-'
  return date.split('T')[0]
}



const openGoogleMaps = () => {
  if (!props.selectedJob?.location) return

  const { lat, lng } = props.selectedJob.location

  const url = `https://www.google.com/maps?q=${lat},${lng}`

  window.open(url, '_blank') // buka di tab baru
}
// format angka ke Rupiah
const formatRupiah = (val) => 'Rp ' + (val || 0).toLocaleString('id-ID')

// handle input manual (strip non-digit, update repairPrice)
const onPriceInput = (e) => {
  const raw = e.target.value.replace(/\D/g, '')
  repairPrice.value = parseInt(raw) || 0
}

async function calculateShippingCost(jobId){
  try {
    shippingCost.value = null // reset

    const response = await apiFetch(`/ongkir/calculate-shipping-cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId,
        technicianId
      })
    })

    const data = response.data.shippingCost.data

    console.log('Shipping cost:', data);
    shippingCost.value =
      (
        data.calculate_instant?.[0]?.shipping_cost
        ?? data.calculate_reguler?.[0]?.shipping_cost
        ?? 0
      ) * 2

  } catch (error) {
    console.error('Gagal menghitung biaya pengiriman:', error)
  }
}

async function getTechnicianProfile(technicianId){
  try {
    const response = await getProfile(technicianId)
    technicianProfile.value = response
    console.log('technician profile : ', technicianProfile.value);
    
  } catch (error) {
    console.error('Gagal ambil profile teknisi:', error)
  }
}

async function doneJob(jobId){
  try {
    const response = await apiFetch(`/jobs/${jobId}/done-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log('done job : ', response);
    sweetAlert.success('Job berhasil diselesaikan tunggu konfirmasi pelanggan')
  } catch (error) {
    sweetAlert.error('terjadi kesalahan saat menyelesaikan job')
  }
}

const handleDoneJob = async (jobId) => {
  const result = await sweetAlert.confirm({
    title: 'Apakah kamu yakin pekerjaan sudah selesai?',
    text: 'Pastikan kamu sudah menyelesaikan pekerjaan dengan baik sebelum mengonfirmasi.'
  })

  if (result.isConfirmed) {
    await doneJob(jobId)
  }
}


async function isJobCompleted(jobId, status){
  try {
    const response = await apiFetch(`/jobs/${jobId}/is-job-completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status }),
    })
    console.log('status completed : ', response);
    
    sweetAlert.success(response.data.message)
  } catch (error) {
    sweetAlert.error('Gagal konfirmasi perbaikan')
  }
}

const handleIsJobCompleted = async(jobId)=>{
  const result = await sweetAlert.confirm({
    title: 'Apakah kamu yakin perbaikan sudah selesai?',
    text: 'Pastikan pekerjaan sudah benar-benar selesai sebelum mengonfirmasi.',
    showDenyButton: true,
    showCancelButton: false
  })

  if (result.isConfirmed) {
    await isJobCompleted(jobId, 'completed')
  }
  else if(result.isDenied){
    await isJobCompleted(jobId, 'uncompleted')
  }

}



async function cancelJobs(jobId){
  try {
    const response = await apiFetch(`/jobs/${jobId}/cancel-jobs`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log('cancel Job : ', response);
    sweetAlert.success('Berhasil menolak job')
  } catch (error) {
    sweetAlert.error('Gagal menolak job')
  }
}

async function handleShippingCost(){
  const jobId = props.selectedJob?._id

  // update kalau job beda
  if (jobId !== lastCalculatedJobId.value) {
    await calculateShippingCost(jobId)
    lastCalculatedJobId.value = jobId
  }


  await getTechnicianProfile(props.selectedJob?.selectedTechnician)

  modalAddPrice.value = true
}

watch(() => props.selectedJob,
  async (newVal) => {
    if (newVal?.idCreator) {
      try {
        profile.value = await getProfile(newVal.idCreator)
        
        console.log('jobs detail:', props.selectedJob)
      } catch (err) {
        console.error('Gagal ambil profile:', err)
      }
    }
  },
  { immediate: true }
)

</script>
<template>
  <transition name="slide-fade">
    <div
      v-if="showSidebar"
      class="slide-modal-overlay"
      @click.self="closeSidebar"
    >
      <div class="slide-modal-content">
 
        <!-- Header -->
        <div class="slide-modal-header">
          <div class="header-title-group">
            <span class="header-icon">🔧</span>
            <h4 class="header-title">{{ selectedJob.title }}</h4>
          </div>
          <button class="close-btn" @click="closeSidebar" aria-label="Tutup">
            <span>×</span>
          </button>
        </div>
 
        <!-- Body -->
        <div class="slide-modal-body">
 
          <!-- Status Banner -->
          <div
            v-if="selectedJob?.status === 'progress'"
            class="status-banner status-progress"
          >
            <span class="status-icon">⏳</span>
            <span>Teknisi sedang memperbaiki alatmu, mohon tunggu...</span>
          </div>
 
          <!-- Job Image -->
          <div class="image-wrapper">
            <!-- <v-carousel>
              <v-carousel-item
              v-for="(image, index) in selectedJob?.photos || []"
              :key="index"
                :src="`http://localhost:3000/uploads/jobs/${image}`"
                cover
              ></v-carousel-item>

            </v-carousel> -->
            <CCarousel controls indicators>
              <CCarouselItem v-for="(image, index) in selectedJob?.photos || []" :key="index">
                <img class="d-block w-100" :src="`http://localhost:3000/uploads/jobs/${image}`"/>
              </CCarouselItem>
              
            </CCarousel>
            
          </div>
 
          <!-- Detail Content -->
          <div v-if="selectedJob" class="job-detail">
 
            <!-- Info Pills -->
            <div class="info-pills">
              <div class="info-pill">
                <span class="pill-label">Kategori</span>
                <span class="pill-value">{{ selectedJob.category }}</span>
              </div>
              <div class="info-pill">
                <span class="pill-label">Status</span>
                <span class="pill-value">{{ selectedJob.status }}</span>
              </div>
              <div class="info-pill">
                <span>Pelanggan</span>
                <div class="pill-content">

                  <span>
                    {{ profile?.nama }}
                  </span>
                  <VBtn class="chat-btn" @click="createChat(selectedJob.idCreator, selectedJob.selectedTechnician)" :to="`/chat-view`">
                    <i class="ri-chat-1-line"></i>
                  </VBtn>
                </div>
              </div>
            </div>
 
            <!-- Divider -->
            <div class="section-divider"></div>
 
            <!-- Description -->
            <div class="description-section">
              <h6 class="section-title">
                <span class="section-icon">📋</span> Deskripsi
              </h6>
              <div class="description-content" v-html="selectedJob.description"></div>
            </div>
 
            <!-- Divider -->
            <div class="section-divider"></div>
 
            <!-- Deadline -->
            <div class="deadline-section">
              <h6 class="section-title">
                <span class="section-icon">📅</span> Deadline Pengerjaan
              </h6>
              <div class="deadline-track">
                <div class="deadline-point">
                  <span class="deadline-dot start"></span>
                  <div>
                    <span class="deadline-meta">Mulai</span>
                    <p class="deadline-date">{{ formatDate(selectedJob?.deadline?.start_date) }}</p>
                  </div>
                </div>
                <div class="deadline-line"></div>
                <div class="deadline-point">
                  <span class="deadline-dot end"></span>
                  <div>
                    <span class="deadline-meta">Selesai</span>
                    <p class="deadline-date">{{ formatDate(selectedJob?.deadline?.end_date) }}</p>
                  </div>
                </div>
              </div>
            </div>
 
            <!-- Payment Component -->
            <div v-show="selectedJob?.status === 'completed'" class="payment-section">
              <div class="section-divider"></div>
              <!-- <payment
                :name="selectedJob?.creatorName"
                :email="selectedJob?.creatorEmail"
                :amount="selectedJob?.budget"
                :sub-account-id="selectedJob.subAccountId"
                :job-id="selectedJob?._id"
                :payer-id="selectedJob?.idCreator"
                :receiver-id="selectedJob?.selectedTechnician"
              /> -->
            </div>
 
            <!-- Action Buttons -->
            <div class="action-buttons">

              <VBtn @click="openGoogleMaps" color="primary" class="location-btn">Lihat lokasi</VBtn>

              <VBtn v-if="selectedJob.status == 'open'" @click="handleShippingCost"
              class="accept-btn"
              >
                terima job
              </VBtn>
              <VBtn class="cancel-btn" v-if="selectedJob.status == 'open'" @click="cancelJobs(selectedJob?._id)"
              >
                tolak job
              </VBtn>
              <VBtn class="accept-btn" v-if="selectedJob.status == 'paid' && role == 'technician'" @click="handleDoneJob(selectedJob?._id)"
              >
                perbaikan selesai
              </VBtn>
              <VBtn v-if="selectedJob.status == 'done' && role == 'client'" @click="handleIsJobCompleted(selectedJob?._id)"
              class="accept-btn"
              >
                konfirmasi perbaikan
              </VBtn>

              <!-- <VBtn
                v-if="selectedJob?.status === 'payed done' && !review"
                class="action-btn btn-review"
                color="success"
                variant="elevated"
                rounded="lg"
                @click="openReview"
              >
                <span class="btn-icon">⭐</span> Beri Review
              </VBtn> -->
 
              
            </div>
 
          </div>
        </div>
      </div>
    </div>
  </transition>
    <CModal  :visible="modalAddPrice" @close="modalAddPrice = false">

    <CModalHeader style="border-bottom: 0.5px solid var(--cui-border-color); padding-bottom: 0.9rem;">
      <div>
        <small class="text-uppercase text-muted" style="font-size:11px; letter-spacing:.05em;">ID Pekerjaan</small>
        <CModalTitle class="font-monospace mt-1">{{ selectedJob?._id }}</CModalTitle>
      </div>
    </CModalHeader>

    <CModalBody class="p-0">

      <!-- Lokasi -->
      <div class="p-3 border-bottom">
        <small class="text-uppercase text-muted d-block mb-2" style="font-size:11px; letter-spacing:.05em;">Lokasi</small>
        <div class="row g-2">
          <div class="col-6">
            <div class="bg-light border rounded p-2">
              <small class="text-muted d-block mb-1" style="font-size:11px;">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" class="me-1">
                  <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 8 4a1.5 1.5 0 0 1 0 3z" fill="#639922"/>
                </svg>
                Pelanggan
              </small>
              <strong class="small">{{ selectedJob.destination?.destinationName || '-' }}</strong>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-light border rounded p-2">
              <small class="text-muted d-block mb-1" style="font-size:11px;">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" class="me-1">
                  <circle cx="8" cy="6" r="2" stroke="#185FA5" stroke-width="1.5"/>
                  <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="#185FA5" stroke-width="1.5" fill="none"/>
                </svg>
                Teknisi
              </small>
              <strong class="small">{{ technicianProfile.receiverLocation?.destinationName || '-' }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Rincian biaya -->
      <div class="p-3 border-bottom">
        <small class="text-uppercase text-muted d-block mb-2" style="font-size:11px; letter-spacing:.05em;">Rincian biaya</small>
        <div class="bg-light rounded px-3 py-1">
          <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span class="small text-muted">Ongkos kirim</span>
            <span class="small fw-semibold font-monospace">{{ formatRupiah(shippingCost) }}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span class="small text-muted">Harga perbaikan</span>
            <span class="small fw-semibold font-monospace">{{ formatRupiah(repairPrice) }}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center py-2">
            <span class="small fw-semibold">Total</span>
            <span class="small fw-semibold font-monospace text-primary">{{ formatRupiah(shippingCost + repairPrice) }}</span>
          </div>
        </div>
      </div>

      <!-- Input harga perbaikan -->
      <div class="p-3">
        <small class="text-uppercase text-muted d-block mb-2" style="font-size:11px; letter-spacing:.05em;">Harga perbaikan</small>
        <div class="input-group mb-2">
          <span class="input-group-text">Rp</span>
          <input
            type="text"
            class="form-control form-control-lg font-monospace fw-semibold"
            placeholder="0"
            :value="repairPrice ? repairPrice.toLocaleString('id-ID') : ''"
            @input="onPriceInput"
          />
        </div>
        <!-- Tombol shortcut -->
        
      </div>

    </CModalBody>

    <CModalFooter>
      <Payment
        v-show="selectedJob?.status == 'open'"
        :name="profile?.nama"
        :email="profile?.email"
        :amount="shippingCost + repairPrice"
        :sub-account-id="technicianProfile.subAccountId"
        :job-id="selectedJob?._id"
        :payer-id="profile?._id"
        :receiver-id="selectedJob?.selectedTechnician"
      />
    </CModalFooter>
  </CModal>


</template>
<style scoped>
.slide-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 30, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}
 
/* =====================
   MODAL PANEL
===================== */
.slide-modal-content {
  width: 420px;
  max-width: 100vw;
  height: 100dvh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.14);
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
}
 
/* =====================
   HEADER
===================== */
.slide-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  flex-shrink: 0;
}
 
.header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
 
.header-icon {
  font-size: 20px;
  flex-shrink: 0;
}
 
.header-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}
 
.close-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #ffffff;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
 
.close-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}
 
/* =====================
   BODY
===================== */
.slide-modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 0 32px;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 transparent;
}
 
/* =====================
   STATUS BANNER
===================== */
.status-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  font-size: 0.84rem;
  font-weight: 500;
}
 
.status-progress {
  background: linear-gradient(90deg, #fff8e1, #fff3cd);
  color: #856404;
  border-bottom: 1px solid #ffeaa7;
}
 
.status-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
 
/* =====================
   IMAGE
===================== */
.image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  max-height: 220px;
}
 
.job-detail-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}
 

 
/* =====================
   JOB DETAIL
===================== */
.job-detail {
  padding: 20px 20px 0;
  font-family: 'Quicksand';
}
 
/* =====================
   INFO PILLS
===================== */
.info-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
 
.info-pill {
  flex: 1;
  min-width: 120px;
  background: #f8f9fb;
  border: 1px solid #eaecf0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pill-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background-color: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}

.chat-btn i {
  font-size: 16px;
}

.chat-btn:hover {
  background-color: #6366f1;
  color: white;
}
 
.pill-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}
 
.pill-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  text-transform: capitalize;
}
 
.pill-status--progress   { color: #d97706; }
.pill-status--completed  { color: #16a34a; }
.pill-status--cancelled  { color: #dc2626; }
.pill-status--pending    { color: #64748b; }
 
/* =====================
   DIVIDER
===================== */
.section-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 18px 0;
}
 
/* =====================
   SECTION TITLES
===================== */
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #64748b;
  margin-bottom: 12px;
}
 
.section-icon {
  font-size: 1rem;
}
 
/* =====================
   DESCRIPTION
===================== */
 
.description-content {
  font-size: 0.9rem;
  line-height: 1.7;
  color: #374151;
}
 
/* =====================
   DEADLINE
===================== */
 
.deadline-track {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f8f9fb;
  border: 1px solid #eaecf0;
  border-radius: 14px;
  padding: 14px 18px;
}
 
.deadline-point {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}
 
.deadline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}
 
.deadline-dot.start { background: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
.deadline-dot.end   { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
 
.deadline-line {
  flex: 1;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    #cbd5e1,
    #cbd5e1 5px,
    transparent 5px,
    transparent 10px
  );
  margin: 0 12px;
  margin-top: -10px;
}
 
.deadline-meta {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  display: block;
}
 
.deadline-date {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  margin: 2px 0 0;
}
 
/* =====================
   PAYMENT SECTION
===================== */
.payment-section {
  margin-top: 0;
}
 
/* =====================
   ACTION BUTTONS
===================== */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
  font-family: 'Quicksand';
}
 
.action-btn {
  width: 100% !important;
  height: 46px !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  letter-spacing: 0.01em !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.location-btn{
  font-weight: bold;
}
.accept-btn{
  background-color: rgb(15, 255, 15);
  color: white;
  font-weight: bold;
}
.accept-btn:hover{
  background-color: rgba(0, 128, 0, 0.736);
}
.cancel-btn{
  color: white;
  background-color: rgb(255, 4, 4);
  font-weight: bold;

}
.cancel-btn:hover{
  background-color: rgba(255, 0, 0, 0.738);
}
 
.btn-icon {
  font-size: 1rem;
}
 
/* =====================
   TRANSITION
===================== */
.slide-fade-enter-active {
  transition: all 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-fade-leave-active {
  transition: all 0.22s cubic-bezier(0.55, 0, 1, 0.45);
}
.slide-fade-enter-from {
  opacity: 0;
}
.slide-fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-from .slide-modal-content {
  transform: translateX(60px);
}
.slide-fade-leave-to .slide-modal-content {
  transform: translateX(60px);
}
 

/* =====================
   RESPONSIVE
===================== */
@media (max-width: 480px) {
  .slide-modal-content {
    width: 100vw;
    border-left: none;
    border-radius: 0;
  }
 
  .deadline-track {
    flex-direction: column;
    gap: 14px;
    align-items: flex-start;
  }
 
  .deadline-line {
    display: none;
  }
 
  .info-pills {
    flex-direction: column;
  }
 
  .info-pill {
    min-width: unset;
  }
}
</style>
