<script setup>
import Payment from '@/components/form/Payment.vue';
import { apiFetch, getProfile } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { createChat } from '@/utils/tools';
import { onMounted, ref, watch } from 'vue';
import ShippingCostModal from './ShippingCostModal.vue';
import AddPriceModal from './AddPriceModal.vue';
import WarrantyModal from './WarrantyModal.vue';
import ReviewModal from '@/components/form/ReviewModal.vue'
import CancelJobModal from './CancelJobModal.vue';



const props = defineProps({
    selectedJob: Object,
    showSidebar: Boolean,
    isCancelable: Boolean
})
// console.log('selected job : ', props.selectedJob);

const profile = ref()
const userId = localStorage.getItem('userId')
const role = localStorage.getItem('role')
const technicianProfile = ref()
const shippingCost = ref()
const modalShippingCost = ref(false)
const modalAddPrice = ref(false)
const modalWarranty = ref(false)
const lastCalculatedJobId = ref(null)
const showRatingModal = ref(false)
const showCancelModal = ref(false)
const receiverId = computed(() => props.selectedJob?.selectedTechnician)



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

function handleReviewSubmitted(data) {
  console.log('Review tersimpan:', data)
  // bisa tambahkan logika refresh data job, dll.
}

// validasi garansi 3 hari
const isWithinWarranty = (jobDoneDate) => {
  if (!jobDoneDate) return false;

  const doneDate = new Date(jobDoneDate);
  const now = new Date();
  
  // hitung selisi ms
  const diffTime = now - doneDate;
  // 1 hari = 1000 ms * 60 detik * 60 menit * 24 jam
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  console.log('warranty debug : ', diffDays);

  return diffDays >= 0;
};


const openGoogleMaps = () => {
  if (!props.selectedJob?.location) return

  const { lat, lng } = props.selectedJob.location

  const url = `https://www.google.com/maps?q=${lat},${lng}`

  window.open(url, '_blank') // buka di tab baru
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

    console.log('Shipping cost:', response);
    const data = response.data.shippingCost.data

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
    sweetAlert.success('Job telah diselesaikan kami tunggu ulasanmu ya!')
  } catch (error) {
    sweetAlert.error('terjadi kesalahan saat menyelesaikan job')
  }
}
async function claimWarranty(jobId){
  try {
    const response = await apiFetch(`/jobs/${jobId}/claim-warranty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify({ status }),
    })
    console.log('status completed : ', response);
    
    sweetAlert.success(response.data.message)
  } catch (error) {
    sweetAlert.error('Gagal konfirmasi perbaikan')
  }
}

// =================== handle ==============//

const handleDoneJob = async () => {
  const jobId = props.selectedJob._id
  const result = await sweetAlert.confirm({
    title: 'Apakah teknisi sudah memperbaiki kerusakan?',
    text: 'Pastikan teknisi sudah melakukan perbaikan dengan benar sebelum mengonfirmasi.',
    showCancelButton: false,
    showCancelButton: true,
    confirmText: 'Ya, Sudah'
  })

  if (result.isConfirmed) {
    await doneJob(jobId)
  }
}




const handleIsWarranty = async(jobId)=>{
  modalWarranty.value = true
  
}

const handleCancelJobs = async()=>{
  showCancelModal.value = true
}

async function handleShippingCost(){
  const jobId = props.selectedJob?._id

  // update kalau job beda
  if (jobId !== lastCalculatedJobId.value) {
    await calculateShippingCost(jobId)
    lastCalculatedJobId.value = jobId
  }
  await getTechnicianProfile(props.selectedJob?.selectedTechnician)

  modalShippingCost.value = true
}
async function checkedJob(jobId){
  try {
    const response = await apiFetch(`/jobs/${jobId}/checked-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    sweetAlert.success(response.data.message)
  } catch (error) {
    sweetAlert.error('Gagal mengonfirmasi pengecekan')
  }

}
async function handleChekedJob(){
  const jobId = props.selectedJob?._id

  const result = await sweetAlert.confirm({
    title: 'Apakah teknisi sudah melakukan pengecekan kerusakan?',
    text: 'Pastikan teknisi sudah melakukan pengecekan kerusakan dengan benar sebelum mengonfirmasi.',
    showCancelButton: false,
    showCancelButton: true,
    confirmText: 'Ya, Sudah'
  })

  if (result.isConfirmed) {
    await checkedJob(jobId)
  }
}


async function handlePriceInput(jobId){
    
  await getTechnicianProfile(props.selectedJob?.selectedTechnician)

  modalAddPrice.value = true
}

const statusConfig = (s) => {
  const st = s?.toLowerCase()
  if (st === 'open')      return { color: '#f59e0b', bg: '#fff8e6', text: '#92400e', label: st }
  if (st === 'pending transport fee')   return { color: '#3b82f6', bg: '#eff6ff', text: '#1e3a8a', label: st }
  if (st === 'transport fee paid')      return { color: '#14532d', bg: '#f0fdf4', text: '#14532d', label: st }
  if (st === 'checked')      return { color: '#10b981', bg: '#f4f0ff', text: '#4c1d95', label: st }
  if (st === 'completed') return { color: '#10b981', bg: '#f0fdf4', text: '#14532d', label: st }
  if (st === 'cancelled') return { color: '#ef4444', bg: '#fef2f2', text: '#7f1d1d', label: st }
  return { color: '#8d58ff', bg: '#f4f0ff', text: '#4c1d95', label: s }
}
 

watch(() => props.selectedJob,
  async (newVal) => {
    if (newVal?.idCreator) {
      try {
        profile.value = await getProfile(newVal.idCreator)
        technicianProfile.value = await getProfile(newVal.selectedTechnician)
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
    <div v-if="showSidebar" class="overlay" @click.self="closeSidebar">
      <div class="panel">
 
        <!-- ── Header ── -->
        <div class="panel-header">
          <div class="header-left">
            <div class="header-icon-wrap">
              <i class="ri-tools-line"></i>
            </div>
            <div class="header-text">
              <span class="header-eyebrow">Detail Pekerjaan</span>
              <h4 class="header-title">{{ selectedJob.title }}</h4>
            </div>
          </div>
          <button class="close-btn" @click="closeSidebar" aria-label="Tutup">
            <i class="ri-close-line"></i>
          </button>
        </div>
 
        <!-- ── Status bar ── -->
        <div
          class="status-bar"
          :style="{
            background: statusConfig(selectedJob?.status).bg,
            borderBottomColor: statusConfig(selectedJob?.status).color + '40'
          }"
        >
          <span
            class="status-dot"
            :style="{ background: statusConfig(selectedJob?.status).color }"
          ></span>
          <span
            class="status-text"
            :style="{ color: statusConfig(selectedJob?.status).text }"
          >
            {{ statusConfig(selectedJob?.status).label }}
          </span>


          <!-- pesan pada slide job technician -->
          <span
            v-if="selectedJob?.status === 'transport fee paid' && role === 'technician'"
            class="status-hint"
            :style="{ color: statusConfig(selectedJob?.status).text }"
          >
            — segera lakukan pengecekan kerusakan
          </span>
          <span
            v-if="selectedJob?.status === 'repair paid' && role == 'technician'" 
            class="status-hint"
            :style="{ color: statusConfig(selectedJob?.status).text }"
          >
            — Segera lakukan perbaikan alat
          </span>

          <!-- pesan pada slide job client -->
           <span
            v-if="selectedJob?.status === 'pending transport fee' && role === 'client'"
            class="status-hint"
            :style="{ color: statusConfig(selectedJob?.status).text }"
          >
            — menunggu pembayaran transportasi
          </span>
          <span
            v-if="selectedJob?.status === 'transport fee paid' && role === 'client'"
            class="status-hint"
            :style="{ color: statusConfig(selectedJob?.status).text }"
          >
            — menunggu pengecekan teknisi
          </span>
          <span
            v-if="selectedJob?.status === 'repair paid' && role == 'client'" 
            class="status-hint"
            :style="{ color: statusConfig(selectedJob?.status).text }"
          >
            — Tunggu teknisi selesai memperbaiki alatmu
          </span>
          <span
            v-if="selectedJob?.status === 'warranty' && role == 'client'" 
            class="status-hint"
            :style="{ color: statusConfig(selectedJob?.status).text }"
          >
            — Klaim garansi dalam 3 hari jika ada kerusakan
          </span>
        </div>
 
        <!-- ── Body (scrollable) ── -->
        <div class="panel-body">
 
          <!-- Foto carousel -->
          <div class="carousel-wrap">
            <CCarousel controls indicators>
              <CCarouselItem v-for="(image, index) in selectedJob?.photos || []" :key="index">
                <img class="carousel-img" :src="`http://localhost:3000/uploads/jobs/${image}`" />
              </CCarouselItem>
            </CCarousel>
          </div>
 
          <div v-if="selectedJob" class="detail-content">
 
            <!-- Info cards -->
            <div class="info-grid">
              <div class="info-card">
                <span class="info-lbl">Kategori</span>
                <span class="info-val">{{ selectedJob.category }}</span>
              </div>
              <div class="info-card">
                <span class="info-lbl">Status</span>
                <span
                  class="info-val status-pill"
                  :style="{
                    background: statusConfig(selectedJob.status).bg,
                    color: statusConfig(selectedJob.status).text
                  }"
                >
                  {{ statusConfig(selectedJob.status).label }}
                </span>
              </div>
              <div class="info-card info-card--wide">
                <span class="info-lbl" v-if="role == 'client'">Diajukan kepada</span>
                <span class="info-lbl" v-else-if="role == 'technician'">Diajukan oleh</span>
                <div class="info-val info-row">
                  <span v-if="role == 'client'">{{ technicianProfile?.nama }}</span>
                  <span v-else-if="role == 'technician'">{{ profile?.nama }}</span>
                  <button
                    class="chat-btn"
                    @click="createChat(selectedJob.idCreator, selectedJob.selectedTechnician)"
                  >
                    <i class="ri-chat-1-line"></i>
                    Chat
                  </button>
                </div>
              </div>
            </div>
 
            <div class="divider"></div>
 
            <!-- Deskripsi -->
            <section class="section">
              <h6 class="section-title">
                <i class="ri-file-text-line section-icon"></i>
                Deskripsi
              </h6>
              <div class="desc-box" v-html="selectedJob.description"></div>
            </section>
 
            <div class="divider"></div>
 
            <!-- Deadline -->
            <section class="section">
              <h6 class="section-title">
                <i class="ri-calendar-event-line section-icon"></i>
                Deadline Pengerjaan
              </h6>
              <div class="deadline-track">
                <div class="deadline-point">
                  <div class="deadline-dot-wrap">
                    <span class="dl-dot dl-dot--start"></span>
                  </div>
                  <div>
                    <span class="dl-label">Mulai</span>
                    <p class="dl-date">{{ formatDate(selectedJob?.deadline?.start_date) }}</p>
                  </div>
                </div>
                <div class="deadline-line"></div>
                <div class="deadline-point">
                  <div class="deadline-dot-wrap">
                    <span class="dl-dot dl-dot--end"></span>
                  </div>
                  <div>
                    <span class="dl-label">Selesai</span>
                    <p class="dl-date">{{ formatDate(selectedJob?.deadline?.end_date) }}</p>
                  </div>
                </div>
              </div>
            </section>
 
            <!-- Payment slot -->
            <div v-show="selectedJob?.status === 'completed'">
              <div class="divider"></div>
            </div>
 
            <div class="divider"></div>
 
            <!-- Action buttons -->
            <div class="action-group">
              <button class="btn btn--outline" @click="openGoogleMaps">
                <i class="ri-map-pin-line"></i>
                Lihat Lokasi
              </button>

              <button
                v-if="selectedJob.status === 'pending transport fee' && role === 'client'"
                class="btn btn--accept"
                @click="$router.push('/payment-tabs')"
              >
                <i class="ri-check-line"></i>
                lihat tagihan transportasi
              </button>
              <button
                v-if="selectedJob.status === 'pending repair payment' && role === 'client'"
                class="btn btn--accept"
                @click="$router.push('/payment-tabs')"
              >
                <i class="ri-check-line"></i>
                lihat tagihan perbaikan
              </button>


              <!-- aksi client -->
               <button
                v-if="selectedJob.status === 'transport fee paid' && role === 'client'"
                class="btn btn--checked"
                @click="handleChekedJob"
              >
                <i class="ri-check-line"></i>
                Sudah diperiksa
              </button>
               <button
                v-if="selectedJob.status === 'repair paid' && role === 'client'"
                class="btn btn--checked"
                @click="handleDoneJob"
              >
                <i class="ri-check-line"></i>
                Sudah diperbaiki
              </button>
              <button
                v-if="
                  selectedJob.status === 'warranty' &&
                  role === 'client' &&
                  isWithinWarranty(selectedJob.jobDoneDate)
                "
                class="btn btn--accept"
                @click="handleIsWarranty(selectedJob?._id)"
              >
                <i class="ri-shield-check-line"></i>
                Klaim garansi
              </button>
              <button
                v-if="selectedJob.status === 'completed' && role === 'client'"
                class="btn btn--checked"
                @click="showRatingModal = true"
              >
                <i class="ri-check-line"></i>
                Beri Ulasan
              </button>
              
              <!-- aksi teknisi -->
              <button
                v-if="selectedJob.status === 'open' && role === 'technician'"
                class="btn btn--accept"
                @click="handleShippingCost"
              >
                <i class="ri-check-line"></i>
                Terima Job
              </button>
 
              <button
                v-if="selectedJob.status === 'open' && role === 'technician'"
                class="btn btn--reject"
                @click="handleCancelJobs"
              >
                <i class="ri-close-line"></i>
                Tolak Job
              </button>
 
              <button
                v-if="selectedJob.status === 'checked' && role === 'technician'"
                class="btn btn--accept"
                @click="handlePriceInput(selectedJob?._id)"
              >
                <i class="ri-check-double-line"></i>
                Ajukan biaya perbaikan
              </button>
 
              
            </div>
 
          </div>
        </div>
      </div>
    </div>
  </transition>
 
  <!-- ── Modal ongkir ── -->
  <ShippingCostModal
    :visible="modalShippingCost"
    :selected-job="selectedJob"
    :profile="profile"
    :technician-profile="technicianProfile"
    :shipping-cost="shippingCost"
    @close="modalShippingCost = false"
  />

  <!-- Modal add price -->
  <AddPriceModal
    :visible="modalAddPrice"
    :selected-job="selectedJob"
    :profile="profile"
    :technician-profile="technicianProfile"
    @close="modalAddPrice = false"
  />

  <!-- modal warranty -->
   <WarrantyModal
    :visible="modalWarranty"
    :selected-job="selectedJob"
    :profile="profile"
    :technician-profile="technicianProfile"
    @close="modalWarranty = false"
   />

   <!-- Modal Pop-up Rating -->
     <ReviewModal
       v-model:show="showRatingModal"
       :sender-id="userId"
       :receiver-id="receiverId"
       :job-id="selectedJob?._id"
       @review-submitted="handleReviewSubmitted"
     />
    
    <!-- Modal Pop-up Cancel -->
      <CancelJobModal
        :visible="showCancelModal"
        :selected-job="selectedJob"
        @close="showCancelModal = false"
      />
</template>
 
<style>
/* ── Overlay ───────────────────────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 5, 25, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}
 
/* ── Panel ─────────────────────────────────────────────────── */
.panel {
  width: 440px;
  max-width: 100vw;
  height: 100dvh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(141, 88, 255, 0.15);
  overflow: hidden;
}
 
/* ── Header ────────────────────────────────────────────────── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #8d58ff;
  flex-shrink: 0;
  gap: 12px;
}
 
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
 
.header-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #ffffff;
  flex-shrink: 0;
}
 
.header-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
 
.header-eyebrow {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 1px;
  text-transform: uppercase;
}
 
.header-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
 
.close-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.28); }
 
/* ── Status bar ────────────────────────────────────────────── */
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border-bottom: 1px solid transparent;
  flex-shrink: 0;
}
 
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
 
.status-text {
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}
 
.status-hint {
  font-size: 12px;
  font-weight: 400;
}
 
/* ── Body ──────────────────────────────────────────────────── */
.panel-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #e0d6ff transparent;
}
 
/* ── Carousel ──────────────────────────────────────────────── */
.carousel-wrap {
  width: 100%;
  max-height: 210px;
  overflow: hidden;
  background: #f4f0ff;
}
 
.carousel-img {
  width: 100%;
  height: 210px;
  object-fit: cover;
  display: block;
}
 
/* ── Detail content ────────────────────────────────────────── */
.detail-content {
  padding: 20px 20px 120px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
 
/* ── Info grid ─────────────────────────────────────────────── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
 
.info-card {
  background: #fbf9ff;
  border: 1px solid #ede8ff;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
 
.info-card--wide {
  grid-column: 1 / -1;
}
 
.info-lbl {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: #b0a4cc;
}
 
.info-val {
  font-size: 14px;
  font-weight: 700;
  color: #2d1f52;
  text-transform: capitalize;
}
 
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
 
.status-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}
 
.chat-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #8d58ff;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.chat-btn:hover { background: #7a46ef; }
 
/* ── Divider ───────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: #f0ebff;
  margin: 18px 0;
}
 
/* ── Section ───────────────────────────────────────────────── */
.section { margin-bottom: 0; }
 
.section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #8d58ff;
  margin-bottom: 12px;
}
 
.section-icon {
  font-size: 14px;
}
 
.desc-box {
  background: #fbf9ff;
  border: 1px solid #ede8ff;
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.75;
  color: #5c4f78;
}
 
/* ── Deadline ──────────────────────────────────────────────── */
.deadline-track {
  display: flex;
  align-items: center;
  background: #fbf9ff;
  border: 1px solid #ede8ff;
  border-radius: 14px;
  padding: 14px 18px;
  gap: 0;
}
 
.deadline-point {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}
 
.deadline-dot-wrap {
  margin-top: 3px;
}
 
.dl-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
 
.dl-dot--start {
  background: #8d58ff;
  box-shadow: 0 0 0 3px rgba(141, 88, 255, 0.2);
}
 
.dl-dot--end {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}
 
.deadline-line {
  flex: 1;
  height: 2px;
  background: repeating-linear-gradient(
    90deg, #ddd4ff, #ddd4ff 5px, transparent 5px, transparent 10px
  );
  margin: 0 12px;
  margin-top: -12px;
}
 
.dl-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #b0a4cc;
  display: block;
}
 
.dl-date {
  font-size: 14px;
  font-weight: 700;
  color: #2d1f52;
  margin: 2px 0 0;
}
 
/* ── Action buttons ────────────────────────────────────────── */
.action-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
 
.btn {
  width: 100%;
  height: 46px;
  border-radius: 14px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s, transform 0.15s;
}
 
.btn:hover { opacity: 0.88; transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
 
.btn--outline {
  background: #f4f0ff;
  color: #8d58ff;
  border: 1.5px solid #ddd4ff;
}
 
.btn--accept {
  background: #8d58ff;
  color: #ffffff;
}
.btn--checked {
  background: #0dff00;
  color: #ffffff;
}
 
.btn--reject {
  background: #fef2f2;
  color: #b91c1c;
  border: 1.5px solid #fecaca;
}
 
/* ── Modal ─────────────────────────────────────────────────── */
.modal-header-custom {
  border-bottom: 1px solid #ede8ff;
  padding-bottom: 14px;
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
 
.modal-section {
  padding: 16px 20px;
  border-bottom: 1px solid #f4f0ff;
}
 
.modal-section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: #b0a4cc;
  display: block;
  margin-bottom: 10px;
}
 
.location-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
 
.location-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ede8ff;
  background: #fbf9ff;
}
 
.location-card__icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
 
.location-card--client .location-card__icon { background: #f0fdf4; color: #15803d; }
.location-card--tech   .location-card__icon { background: #f4f0ff; color: #8d58ff; }
 
.location-card__lbl {
  font-size: 10px;
  font-weight: 600;
  color: #b0a4cc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 2px;
}
 
.location-card__val {
  font-size: 12px;
  color: #2d1f52;
  font-weight: 700;
}
 
.cost-table {
  background: #fbf9ff;
  border: 1px solid #ede8ff;
  border-radius: 12px;
  overflow: hidden;
}
 
.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #f0ebff;
}
 
.cost-row:last-child { border-bottom: none; }
 
.cost-row--total {
  background: #f4f0ff;
}
 
.cost-label {
  font-size: 13px;
  color: #7a6d9a;
}
 
.cost-value {
  font-size: 13px;
  font-weight: 700;
  color: #2d1f52;
  font-family: monospace;
}
 
.cost-value--total {
  color: #8d58ff;
  font-size: 14px;
}
 
.price-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #ddd4ff;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}
 
.price-prefix {
  padding: 0 14px;
  background: #f4f0ff;
  color: #8d58ff;
  font-weight: 700;
  font-size: 14px;
  height: 48px;
  display: flex;
  align-items: center;
  border-right: 1.5px solid #ddd4ff;
  flex-shrink: 0;
}
 
.price-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 700;
  font-family: monospace;
  color: #2d1f52;
  height: 48px;
  background: transparent;
}
 
.modal-footer-custom {
  border-top: 1px solid #ede8ff;
  padding: 14px 20px;
}
 
/* ── Transition ────────────────────────────────────────────── */
.slide-fade-enter-active { transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(0.55, 0, 1, 0.45); }
.slide-fade-enter-from { opacity: 0; }
.slide-fade-leave-to  { opacity: 0; }
.slide-fade-enter-from .panel { transform: translateX(60px); }
.slide-fade-leave-to  .panel { transform: translateX(60px); }
 
/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 480px) {
  .panel {
    width: 100vw;
    border-left: none;
  }
 
  .info-grid {
    grid-template-columns: 1fr;
  }
 
  .info-card--wide {
    grid-column: 1;
  }
 
  .deadline-track {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
 
  .deadline-line { display: none; }
 
  .location-grid {
    grid-template-columns: 1fr;
  }
 
  .header-title {
    font-size: 13px;
  }
}
</style>
 