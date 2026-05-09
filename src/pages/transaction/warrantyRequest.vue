<script setup>
import { apiFetch } from '@/utils/api'
import sweetAlert from '@/utils/sweetAlert'
import { onMounted, ref, computed, onUnmounted } from 'vue'
import WarrantyCard from '@/layouts/components/WarrantyCard.vue'
import WarrantyDetailSlide from '@/layouts/components/WarrantyDetailSlide.vue'
import { socket, useWarrantyUpdater } from '@/utils/tools'

const userId = localStorage.getItem('userId')
const role = localStorage.getItem('role')

const warranties = ref([])
const jobs = ref([])
const isLoading = ref(true)

const selectedWarranty = ref(null)
const selectedJob = ref(null)
const isSlideOpen = ref(false)

const {updateWarrantyStatus} = useWarrantyUpdater(warranties)

const activeFilter = ref('all')
const filterOptions = [
  { key: 'all',         label: 'Semua' },
  { key: 'claimed',     label: 'Menunggu' },
  { key: 'repairing',    label: 'Proses Perbaikan' },
  { key: 'rejected',    label: 'Ditolak' },
  { key: 'done', label: 'Selesai' },
]

// satukan warranties dan job berdasarkan jobId
const mergedItems = computed(() => {
  return warranties.value.map(warranty => {
    const job = jobs.value.find(j => j._id === warranty.jobId) || {}
    return { warranty, job }
  })
})

// filter btn
const filteredItems = computed(() => {
    console.log('active filter : ', activeFilter);
    
  if (activeFilter.value === 'all'){
    return mergedItems.value
  } 
  // kembalikan mergedItems yang sesuai dengan active filter
  return mergedItems.value.filter(i => i.warranty.status === activeFilter.value)
})

async function getWarranties() {
  isLoading.value = true
  try {
    const response = await apiFetch(`/warranty/${userId}/get-warranties`)
    warranties.value = response.data.warranties || []
    jobs.value = response.data.jobs || []
  } catch (error) {
    sweetAlert.error(error.message)
  } finally {
    isLoading.value = false
  }
}

function openDetail({ warranty, job }) {
  console.log('detail warranty : ', warranty);
  
  selectedWarranty.value = warranty
  selectedJob.value = job
  isSlideOpen.value = true
}

function closeDetail() {
  isSlideOpen.value = false
  setTimeout(() => {
    selectedWarranty.value = null
    selectedJob.value = null
  }, 350)
}

async function handleApprove(warranty) {
  try {
    const response = await apiFetch(`/warranty/${warranty._id}/approve-warranty`, { 
        method: 'POST' 
      })
    closeDetail()
    sweetAlert.success(response.data.message || 'Klaim garansi disetujui!')
    // await getWarranties()
  } catch (error) {
    sweetAlert.error(error.message)
  }
}

async function doneWarranty(warrantyId){

  try {
    const response = await apiFetch(`/warranty/${warrantyId}/done-warranty`, {
      method: 'POST'
    })
    closeDetail()
    sweetAlert.success(response.data.message || 'perbaikan ulang selesai')
  } catch (error) {
    sweetAlert.error(error.message)
  }  
}

async function handleDone(warranty){
  const result = await sweetAlert.confirm({
    title: 'Apakah teknisi sudah memperbaiki ulang?',
    text: 'Pastikan teknisi sudah melakukan perbaikan ulang pada kerusakan.',
    showCancelButton: true,
    confirmText: 'Ya, Sudah'
  })

  if (result.isConfirmed) {
    await doneWarranty(warranty._id)
  }
}

async function rejectWarranty(warranty) {
  try {
    await apiFetch(`/warranty/${warranty._id}/reject-warranty`, { 
      method: 'POST' 

    })
    sweetAlert.success('Klaim garansi ditolak.')
    closeDetail()
    await getWarranties()
  } catch (error) {
    sweetAlert.error(error.message)
  }
}
async function handleReject(warranty){
  console.log('reject warranties : ', warranty._id);
  
  const result = await sweetAlert.confirm({
    title: 'Apakah kamu yakin menolak garansi?',
    text: 'Jika kamu menolak garansi maka biaya perbaikan akan dikembalikan ke pelanggan',
    showCancelButton: true,
    confirmText: 'Ya'
  })

  if (result.isConfirmed) {
    await rejectWarranty(warranty)
  }
}

onMounted(async () => {
  await getWarranties()
  // trigger event register di server
  socket.emit('register', {
    userId: userId,
    role: role
  })
  socket.on('warranty:approve', ({warrantyId, status})=>{
    updateWarrantyStatus(warrantyId, status)
  })
  socket.on('warranty:done', ({warrantyId, status})=>{
    updateWarrantyStatus(warrantyId, status)
  })
  socket.on('warranty:reject', ({warrantyId, status})=>{
    updateWarrantyStatus(warrantyId, status)
  })

})
onUnmounted(()=>{
  socket.off('warranty:approve')
  socket.off('warranty:done')
  socket.off('warranty:reject')
})
</script>

<template>
  <div class="page-wrapper">

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">Klaim Garansi</h1>
        <p class="page-subtitle">Kelola permintaan garansi pelanggan Anda</p>
      </div>
      <div class="total-badge">
        <span class="total-num">{{ filteredItems.length }}</span>
        <span class="total-label">Klaim</span>
      </div>
    </div>

    <!-- Filter Tabs -->
     
    <div class="filter-bar">
      <button
        v-for="opt in filterOptions"
        :key="opt.key"
        class="filter-tab"
        :class="{ active: activeFilter === opt.key }"
        @click="activeFilter = opt.key"
      >
        {{ opt.label }}
        <span class="filter-count" v-if="opt.key === 'all'">{{ mergedItems.length }}</span>
        <span class="filter-count" v-else>
          {{ mergedItems.filter(i => i.warranty.status === opt.key).length }}
        </span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="skeleton-card" v-for="i in 3" :key="i"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredItems.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p class="empty-title">Tidak ada klaim garansi</p>
      <p class="empty-sub">Belum ada permintaan garansi untuk filter ini</p>
    </div>

    <!-- Card Grid -->
    <div v-else class="cards-grid">
      <WarrantyCard
        v-for="item in filteredItems"
        :key="item.warranty._id"
        :warranty="item.warranty"
        :job="item.job"
        @click="openDetail"
      />
    </div>

    <!-- Detail Slide -->
    <WarrantyDetailSlide
      :warranty="selectedWarranty"
      :job="selectedJob"
      :isOpen="isSlideOpen"
      @close="closeDetail"
      @repairing="handleApprove"
      @done="handleDone"
      @reject="handleReject"
    />
  </div>
</template>

<style scoped>

.page-wrapper {
  min-height: 100vh;
  background: linear-gradient(160deg, #f8f5ff 0%, #ffffff 50%, #f0f9ff 100%);
  padding: 24px 16px 80px;
  font-family: 'Quicksand';
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #1a0a3d;
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  font-weight: 500;
}

.total-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #8d58ff, #a875ff);
  color: white;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 4px 16px rgba(141, 88, 255, 0.3);
}

.total-num {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

.total-label {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.85;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 24px;
  scrollbar-width: none;
}
.filter-bar::-webkit-scrollbar { display: none; }

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid #e0d0ff;
  background: white;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  font-family: 'Quicksand';
}

.filter-tab:hover {
  border-color: #8d58ff;
  color: #8d58ff;
}

.filter-tab.active {
  background: linear-gradient(135deg, #8d58ff, #a875ff);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(141, 88, 255, 0.25);
}

.filter-count {
  font-size: 11px;
  font-weight: 700;
  background: rgba(255,255,255,0.25);
  padding: 1px 7px;
  border-radius: 10px;
}

.filter-tab:not(.active) .filter-count {
  background: #f0ebff;
  color: #8d58ff;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
  .page-wrapper { padding: 32px 24px 80px; }
}

@media (min-width: 1024px) {
  .cards-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .page-wrapper { padding: 40px 32px 80px; max-width: 1200px; margin: 0 auto; }
  .page-title { font-size: 30px; }
}

/* Loading skeleton */
.loading-state {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.skeleton-card {
  height: 180px;
  border-radius: 20px;
  background: linear-gradient(90deg, #f5f0ff 25%, #ede9fe 50%, #f5f0ff 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (min-width: 640px) { .loading-state { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .loading-state { grid-template-columns: repeat(3, 1fr); } }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 64px 24px;
}

.empty-icon { font-size: 52px; margin-bottom: 16px; }

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a0a3d;
  margin: 0 0 8px;
}

.empty-sub {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}
</style>
