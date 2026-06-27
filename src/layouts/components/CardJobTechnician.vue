<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { apiFetch, getProfile } from '@/utils/api'
import ShippingCostModal from './ShippingCostModal.vue'
import CancelJobModal from './CancelJobModal.vue'
import SlideJobDetail from './SlideJobDetail.vue'
import AddPriceModal from './AddPriceModal.vue'
import reportJobModal from './reportJobModal.vue'
import { backendUrl } from '@/utils/tools'

const role = localStorage.getItem('role')
const technicianId = localStorage.getItem('userId')
const props = defineProps({
  id: String,
  title: String,
  deadline: String,
  desc: String,
  category: String,
  status: Object,
  creator: String,
  avatarPlaceholder: Object,
  selectedJob: Object
})

const lastCalculatedJobId = ref(null)
const modalShippingCost = ref(false)
const profile = ref()
const technicianProfile = ref()
const shippingCost = ref()
const showCancelModal = ref(false)
const showDetailJob = ref(false)
const modalAddPrice = ref(false)
const showReportModal = ref(false)
const distance = ref(null)

const openReportModal = () => {
  showReportModal.value = true
}


const showFull = ref(false)

const stripHtml = text => text?.replace(/<[^>]*>/g, '').trim() ?? ''

// Fungsi bantu format tanggal
const formatDate = date => {
  if (!date || typeof date !== 'string') return '-'
  return date.split('T')[0]
}

const displayedText = computed(() => {
  const plainText = stripHtml(props.desc)
  const words = plainText.split(' ')
  if (showFull.value || words.length <= 60) return plainText
  return words.slice(0, 60).join(' ') + '...'
})

const toggleShow = () => {
  showFull.value = !showFull.value
}

const hasLongDesc = computed(() => stripHtml(props.desc).split(' ').length > 60)

const statusConfig = computed(() => {
  const s = props.status?.label?.toLowerCase()
  if (s === 'pengajuan perbaikan')   return { accent: '#f59e0b', bg: '#fff8e6', text: '#92400e', border: '#fcd34d', avatarBg: '#f59e0b' }
  if (s === 'menunggu pembayaran transportasi')   return { accent: '#3b82f6', bg: '#eff6ff', text: '#1e3a8a', border: '#93c5fd', avatarBg: '#3b82f6' }
  if (s === 'biaya transportasi sudah dibayar')  return { accent: '#14532d', bg: '#f0fdf4', text: '#14532d', border: '#14532d', avatarBg: '#14532d' }
  if (s === 'Kerusakan sudah diperiksa')      return { accent: '#10b981', bg: '#f0fdf4', text: '#14532d', border: '#6ee7b7', avatarBg: '#10b981' }
  if (s === 'perbaikan selesai')      return { accent: '#10b981', bg: '#f0fdf4', text: '#14532d', border: '#6ee7b7', avatarBg: '#10b981' }
  if (s === 'perbaikan dibatalkan') return { accent: '#ef4444', bg: '#fef2f2', text: '#7f1d1d', border: '#fca5a5', avatarBg: '#ef4444' }
  return { accent: '#8d58ff', bg: '#f4f0ff', text: '#4c1d95', border: '#c4b5fd', avatarBg: '#8d58ff' }
})

const paymentStatus = ref('')

const isPaymentStatusVisible = computed(() => {
  const s = props.status?.label?.toLowerCase()
  return [
    'menunggu pembayaran transportasi', 
    'biaya transportasi sudah dibayar',
    'menunggu pembayaran perbaikan',
    'biaya perbaikan sudah dibayar',
    // 'pending transport fee',
    // 'transport fee paid',
    // 'pending repair payment',
    // 'repair paid'
  ].includes(s)
})

const fetchPaymentStatus = async () => {
  if (!isPaymentStatusVisible.value) return
  try {
    const response = await apiFetch(`/payment/${props.id}/get-invoice-by-jobId`)
    if (response.data) {
      paymentStatus.value = response.data.payment.status
    }
  } catch (error) {
    console.error(error)
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

async function calculateShippingCost(jobId){
  try {

    const location = props.selectedJob.location
    shippingCost.value = null // reset
    
    const response = await apiFetch(`/ongkir/${jobId}/calculate-shipping-cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        size: props.selectedJob.size,
        technicianId: props.selectedJob.selectedTechnician,
        lat: location.lat,
        lng: location.lng
      })
    })

    console.log('Shipping cost:', response.data)

    shippingCost.value = response.data.shippingCost
    distance.value = response.data.distance

  } catch (error) {
    console.error('Gagal menghitung biaya pengiriman:', error)
  }
}
async function handleShippingCost(jobId){

  profile.value = await getProfile(props.selectedJob.idCreator)
  
  // update kalau job beda
  if (jobId !== lastCalculatedJobId.value) {
    await calculateShippingCost(jobId)
    lastCalculatedJobId.value = jobId
  }
  await getTechnicianProfile(technicianId)

  modalShippingCost.value = true
}

const handleCancelJobs = async()=>{
  showCancelModal.value = true
}
async function handlePriceInput(jobId){
  
  profile.value = await getProfile(props.selectedJob.idCreator)
  await getTechnicianProfile(props.selectedJob?.selectedTechnician)
  modalAddPrice.value = true
}
onMounted(() => {
  fetchPaymentStatus()
  
})



watch(() => props.status, () => {
  fetchPaymentStatus()
}, { deep: true })
</script>

<template>
  <div class="wrapper">

    <div class="card">
  
      <!-- Accent bar warna ikut status -->
      <div class="card-accent" :style="{ background: statusConfig.accent }"></div>
  
      <div class="card-body">
  
        <!-- Baris atas: creator + status badge -->
        <div class="row-top">
          <div class="creator-wrap">
            <div class="creator-avatar" :style="{ background: statusConfig.avatarBg }">
              <img class="avatar-img" :src="`${backendUrl}${avatarPlaceholder.image}`" alt="">
            </div>
            <div class="creator-info">
              <span class="creator-lbl">Dibuat oleh</span>
              <span class="creator-nm">{{ creator }} </span>
            </div>
          </div>
  
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <button 
                v-if="status.label === 'pengajuan perbaikan' && !selectedJob?.moderation?.deletedReason" 
                class="btn-report-icon" 
                @click.stop="openReportModal"
                title="Laporkan Pekerjaan"
              >
                <i class="ri-error-warning-line"></i>
              </button>
              <div
                class="status-badge"
                :style="{
                  background: statusConfig.bg,
                  color: statusConfig.text,
                  borderColor: statusConfig.border,
                }"
              >
                <span class="status-dot" :style="{ background: statusConfig.text }"></span>
                {{ status.label }}
              </div>
            </div>
            <div 
              class="status-badge payment-status-badge"
              :style="{
                  background: statusConfig.bg,
                  color: statusConfig.text,
                  borderColor: statusConfig.border,
                }"
              v-if="isPaymentStatusVisible"
              >
                <span class="status-dot" :style="{ background: statusConfig.text }"></span>
                {{ paymentStatus === 'PAID' || paymentStatus === 'SETTLED' ? 'Sudah bayar' : 'Belum bayar' }}
            </div>
          </div>
        </div>
  
        <div class="separator"></div>
  
        <!-- Judul -->
        <h3 class="card-title">{{ title }}</h3>
  
        <!-- Meta: deadline + kategori -->
        <div class="meta-row">
          <div v-if="deadline" class="pill pill-deadline">
            <i class="ri-calendar-event-line pill-icon"></i>
            Jangka waktu : <strong>{{ formatDate(deadline) }}</strong>
          </div>
          <div v-else-if="deadline == null" class="pill pill-deadline">
            <i class="ri-calendar-event-line pill-icon"></i>
            Jangka waktu : tidak ada deadline
          </div>
          <div class="pill pill-category">
            <i class="ri-price-tag-3-line pill-icon"></i>
            {{ category }}
          </div>
        </div>
  
        <!-- Deskripsi -->
        <div class="desc-wrap">
          <p class="desc-text">
            {{ displayedText }}
            <template v-if="hasLongDesc">
              <span class="see-more" @click.stop="toggleShow">
                {{ showFull ? ' Sembunyikan' : ' Lihat selengkapnya' }}
              </span>
            </template>
          </p>
        </div>
  
        <!-- Footer: tag kategori + job ID -->
        <div class="card-footer">
          <div class="cat-tag" :style="{ background: statusConfig.accent }">
            <i class="ri-price-tag-3-line pill-icon"></i>
            {{ category }}
          </div>
          
          <div class="card-actions">
            <button
              v-if="role === 'technician'"
              class="action-btn btn-detail"
              @click="showDetailJob = true"
            >
              <i class="ri-file-list-3-line"></i>
              Detail
            </button>
            <template v-if="status.label === 'pengajuan perbaikan' && !selectedJob?.moderation?.deletedReason">
              <button
                class="action-btn btn-reject"
                @click="handleCancelJobs"
              >
                <i class="ri-close-line"></i>
                Tolak
              </button>
              <button
                class="action-btn btn-accept"
                @click="handleShippingCost(id)"
              >
                <i class="ri-check-line"></i>
                Terima
              </button>
            </template>
            <template v-if="status.label === 'kerusakan sudah diperiksa' && role === 'technician'">

              <button
                class="action-btn btn-accept"
                @click="handlePriceInput(selectedJob?._id)"
              >
                <i class="ri-check-double-line"></i>
                Ajukan biaya perbaikan
              </button>
            </template>
            
            
          </div>
        </div>
  
      </div>
    </div>
    <!-- ── Sidebar detail job ── -->
    <SlideJobDetail
      :showSidebar="showDetailJob"
      :selectedJob="selectedJob"
      @close="showDetailJob = false"
    />
    <!-- ── Modal ongkir ── -->
      <ShippingCostModal
        :visible="modalShippingCost"
        :selected-job="selectedJob"
        :profile="profile"
        :technician-profile="technicianProfile"
        :shipping-cost="shippingCost"
        :distance="distance"
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
      <!-- Modal Pop-up Cancel -->
      <CancelJobModal
        :visible="showCancelModal"
        :selected-job="selectedJob"
        @close="showCancelModal = false"
      />
    <reportJobModal 
      :visible="showReportModal" 
      :selectedJob="selectedJob" 
      @close="showReportModal = false"
    />
  </div>
</template>

<style scoped>
.avatar-img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.btn-report-icon {
  padding: 4px 6px;
  font-size: 16px;
  border-radius: 8px;
  border: 1.5px solid #fca5a5;
  color: #ef4444;
  background: #fef2f2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-report-icon:hover {
  background: #fee2e2;
  border-color: #ef4444;
}
.card {
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #ede8ff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.card:hover {
  border-color: #8d58ff;
  box-shadow: 0 8px 32px rgba(141, 88, 255, 0.14);
}

.card-accent {
  height: 5px;
  width: 100%;
  flex-shrink: 0;
}

.card-body {
  padding: 18px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.creator-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.creator-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  border-radius: 50%;
  overflow: hidden;
}

.creator-info {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.creator-lbl {
  font-size: 10px;
  color: #b0a4cc;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.creator-nm {
  font-size: 13px;
  font-weight: 700;
  color: #2d1f52;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  border-radius: 50px;
  border: 1.5px solid;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  text-transform: capitalize;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.separator {
  height: 1px;
  background: #f0ebff;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #1a1030;
  margin: 0;
  line-height: 1.3;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
}

.pill-deadline {
  background: #f4f0ff;
  color: #6d28d9;
  border: 1px solid #ddd4ff;
}

.pill-category {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.pill-icon {
  font-size: 13px;
}

.desc-wrap {
  background: #fbf9ff;
  border: 1px solid #ede8ff;
  border-radius: 14px;
  padding: 13px 16px;
}

.desc-text {
  font-size: 13px;
  color: #5c4f78;
  line-height: 1.75;
  margin: 0;
}

.see-more {
  color: #8d58ff;
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;
  transition: opacity 0.15s;
}

.see-more:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn i {
  font-size: 16px;
}

.btn-detail {
  background: #f4f0ff;
  color: #8d58ff;
  border: 1px solid #dcd1ff;
}

.btn-detail:hover {
  background: #ede8ff;
}

.btn-reject {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.btn-reject:hover {
  background: #fee2e2;
}

.btn-accept {
  background: #10b981;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-accept:hover {
  background: #059669;
  transform: translateY(-1px);
}

.cat-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 15px;
  border-radius: 50px;
}

.job-id {
  font-size: 11px;
  color: #c4b5fd;
  font-family: monospace;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .card-body {
    padding: 16px 16px 14px;
    gap: 12px;
  }

  .card-title {
    font-size: 16px;
  }

  .row-top {
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .card-title {
    font-size: 15px;
  }

  .creator-nm {
    max-width: 120px;
  }

  .meta-row {
    gap: 6px;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .cat-tag {
    align-self: flex-start;
  }

  .card-actions {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 6px;
  }

  .action-btn {
    flex: 1;
    padding: 10px 8px;
    font-size: 12px;
  }
  
  .action-btn i {
    font-size: 14px;
  }

  .job-id {
    align-self: flex-end;
  }

  .pill {
    font-size: 11px;
    padding: 4px 10px;
  }
}
</style>
