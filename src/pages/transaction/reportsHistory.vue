<script setup>
import { apiFetch, getProfile } from '@/utils/api'
import sweetAlert from '@/utils/sweetAlert'
import { backendUrl } from '@/utils/tools'
import { computed, onMounted, ref } from 'vue'
import ReportActionModal from '@/layouts/components/ReportActionModal.vue'
import { useRoute } from 'vue-router'

const userId = localStorage.getItem('userId')
const role = localStorage.getItem('role')

const route = useRoute()
const technicianId = route.params.technicianId

const reports = ref([])
const jobs = ref([])
const isLoading = ref(true)
const selectedReport = ref(null)
const isDetailOpen = ref(false)
const activeFilter = ref('all')
const isActionModalOpen = ref(false)
const actionType = ref('approve')
const isActionLoading = ref(false)
const technicianPoint = ref()

const reportCategories = [
  {
    //barang tetap rusak
    category: 'Hasil tidak sesuai',
    point: 5
  },
  {
    // ada biaya tambahan diluar biaya awal
    category: 'Penipuan',
    point: 20
  },
  {
    // membawa alat pelanggan dan tidak dikembalikan
    category: 'Pencurian',
    point: 50
  },
  {
    // slow respon
    category: 'Sulit dihubungi',
    point: 15
  },
  {
    category: 'Lainnya',
    point: 1
  },

]


const filterOptions = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'rejected', label: 'Rejected' },
]

//cari data job yang cocok dengan jobId di reports
const reportItems = computed(() =>
  reports.value
    .map(report => ({
      ...report,
      job: jobs.value.find(job => job._id === report.jobId),
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
)

// hitung total point pelanggaran
const totalPenaltyPoints = computed(() => {
  return filteredReports.value.reduce((total, report) => {
    return total + getReportPoint(report.category)
  }, 0)
})


// filter reports berdasarkan status
const filteredReports = computed(() => {
  if (activeFilter.value === 'all')
    return reportItems.value

  return reportItems.value.filter(item =>
    item.status?.toLowerCase() === activeFilter.value
  )
})

// hitung jumlah reports dengan status tertentu
function getFilterCount(status) {
  if (status === 'all')
    return reportItems.value.length

  return reportItems.value.filter(item =>
    item.status?.toLowerCase() === status
  ).length
}

function getReportPoint(category) {
  const report = reportCategories.find(
    item => item.category === category
  )

  return report?.point || 0
}

const activeFilterLabel = computed(() =>
  filterOptions.find(item => item.key === activeFilter.value)?.label || 'filter ini'
)

const emptyStateTitle = computed(() => {
  if (activeFilter.value === 'all')
    return 'Belum ada laporan'

  return `Tidak ada laporan ${activeFilterLabel.value}`
})

function getReportImageUrl(image) {
  return `${backendUrl}/uploads/reports/${image}`
}

function getJobImageUrl(image) {
  return `${backendUrl}/uploads/jobs/${image}`
}

function formatDate(dateString) {
  if (!dateString)
    return '-'

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime()))
    return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatDateRange(deadline) {
  if (!deadline?.start_date && !deadline?.end_date)
    return '-'

  return `${formatDate(deadline.start_date)} - ${formatDate(deadline.end_date)}`
}

function stripHtml(value) {
  if (!value)
    return '-'

  const element = document.createElement('div')
  element.innerHTML = value

  return element.textContent?.replace(/\s+/g, ' ').trim() || '-'
}

function getStatusConfig(status) {
  const normalizedStatus = status?.toLowerCase()

  if (normalizedStatus === 'pending') {
    return {
      label: 'Menunggu Review',
      icon: 'ri-time-line',
      color: '#a16207',
      bg: '#fff8e1',
      border: '#f5d36a',
    }
  }

  if (normalizedStatus === 'resolved') {
    return {
      label: 'Selesai',
      icon: 'ri-checkbox-circle-line',
      color: '#0f7a4f',
      bg: '#e9f8f1',
      border: '#a8e6c9',
    }
  }

  if (normalizedStatus === 'rejected') {
    return {
      label: 'Ditolak',
      icon: 'ri-close-circle-line',
      color: '#b42318',
      bg: '#fff0ee',
      border: '#ffb4aa',
    }
  }

}

function openDetail(report) {
  selectedReport.value = report
  isDetailOpen.value = true
}

async function getReportsByUserId(id) {
  if (!id) {
    sweetAlert.error('User tidak ditemukan, silakan login ulang')
    return
  }

  try {
    isLoading.value = true

    const response = await apiFetch(`/reports/${id}/get-reports-by-userId`)

    reports.value = response.data?.reports || []
    jobs.value = response.data?.jobs || []
    console.log('reports : ', response.data)
  } catch (error) {
    sweetAlert.error(error.message || 'Gagal mengambil riwayat pelaporan')
  } finally {
    isLoading.value = false
  }
}
async function getReportsByTechnicianId(technicianId) {
  if (!technicianId) {
    sweetAlert.error('User tidak ditemukan, silakan login ulang')
    return
  }

  try {
    isLoading.value = true

    console.log('technicianId : ', technicianId);
    
    const response = await apiFetch(`/reports/${technicianId}/get-reports-by-technicianId`)

    reports.value = response.data?.reports || []
    jobs.value = response.data?.jobs || []
    console.log('reports : ', response.data)
  } catch (error) {
    sweetAlert.error(error.message || 'Gagal mengambil riwayat pelaporan')
  } finally {
    isLoading.value = false
  }
}

function openActionModal(type) {
  actionType.value = type
  isActionModalOpen.value = true
}

async function handleActionSubmit(note) {
  if (!note.trim()) {
    sweetAlert.error('Catatan admin wajib diisi.')
    return
  }

  try {
    isActionLoading.value = true
    const endpoint = actionType.value === 'approve' ? 'approve-report' : 'reject-report'
    const point = actionType.value === 'approve' ? getReportPoint(selectedReport.value.category) : 0

    const response = await apiFetch(`/reports/${selectedReport.value._id}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        adminNote: note,
        point: point
      })
    })

    sweetAlert.success(response.data.message)
    isActionModalOpen.value = false
    isDetailOpen.value = false

    if (role === 'admin') {
      await getAllReports()
    } else {
      await getReportsByUserId(userId)
    }
  } catch (error) {
    sweetAlert.error(error.message)
  } finally {
    isActionLoading.value = false
  }
}

async function getAllReports(){
    try {
        isLoading.value = true
        const response = await apiFetch(`/reports/get-all-reports`)
        reports.value = response.data?.reports || []
        jobs.value = response.data?.jobs || []
        console.log('reports admin: ', response.data)

    } catch (error) {
        sweetAlert.error(error.message)
    } finally{
        isLoading.value = false
    }
}

onMounted(async () => {
  if(role == 'admin'){
    await getAllReports()

    if(technicianId){      
      await getReportsByTechnicianId(technicianId)
    }
  }
  else if(role == 'technician'){

    const profile = await getProfile(userId)

    technicianPoint.value = profile.penaltyPoint || 0

    console.log('teknisi point : ', technicianPoint.value);

    await getReportsByUserId(userId)
  }
  else{
    await getReportsByUserId(userId)
  }

})
</script>

<template>
  <section class="reports-page">
    <div class="reports-shell">
      <header class="reports-header">
        <div class="header-copy">
          <span class="eyebrow">Riwayat Pelaporan</span>
          <h2>Pengajuan laporan</h2>
          <p>Pantau status laporan, bukti, dan pekerjaan yang terkait dalam satu tempat.</p>
        </div>

        <div class="summary-panel" v-if="role == 'technician'">
          <div class="summary-item">
            <span class="summary-value">{{ technicianPoint }}</span>
            <span class="summary-label">Poin Penalti</span>
          </div>
        </div>
        <div class="summary-panel">
          <div class="summary-item">
            <span class="summary-value">{{ filteredReports.length }}</span>
            <span class="summary-label">Total laporan</span>
          </div>
        </div>
      </header>

      <div class="filter-bar">
        <button
          v-for="option in filterOptions"
          :key="option.key"
          class="filter-tab"
          :class="{ active: activeFilter === option.key }"
          type="button"
          @click="activeFilter = option.key"
        >
          {{ option.label }}
          <span class="filter-count">{{ getFilterCount(option.key) }}</span>
        </button>
      </div>

      <div v-if="isLoading" class="state-box">
        <VProgressCircular
          color="#8d85ff"
          indeterminate
        />
        <span>Mengambil riwayat pelaporan...</span>
      </div>

      <div v-else-if="filteredReports.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="ri-shield-check-line"></i>
        </div>
        <h3>{{ emptyStateTitle }}</h3>
        <p>Riwayat laporan dengan status ini akan muncul di sini.</p>
      </div>

      <div v-else class="reports-grid">
        <article
          v-for="report in filteredReports"
          :key="report._id"
          class="report-card"
          
        >
          <div class="card-topline"></div>

          <div class="card-header">
            <div>
              <span class="report-category">{{ report.category }}</span>
              <h3>{{ report.job?.title || 'Pekerjaan tidak ditemukan' }}</h3>
            </div>

            <span
              class="status-badge"
              :style="{
                color: getStatusConfig(report.status).color,
                backgroundColor: getStatusConfig(report.status).bg,
                borderColor: getStatusConfig(report.status).border,
              }"
            >
              <i :class="getStatusConfig(report.status).icon"></i>
              {{ getStatusConfig(report.status).label }}
            </span>
          </div>

          <p class="report-description">
            {{ stripHtml(report.description) }}
          </p>

          <div class="meta-grid">
            <div class="meta-item">
              <i class="ri-calendar-line"></i>
              <div>
                <span>Tanggal laporan</span>
                <strong>{{ formatDate(report.createdAt) }}</strong>
              </div>
            </div>
            <div class="meta-item">
              <i class="ri-tools-line"></i>
              <div>
                <span>Kategori pekerjaan</span>
                <strong>{{ report.job?.category || '-' }}</strong>
              </div>
            </div>
          </div>

          <div class="card-footer d-flex justify-content-end">

            <button
              class="detail-button"
              type="button"
              @click="openDetail(report)"
            >
              Detail
              <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </article>
      </div>
    </div>

    <VDialog
      v-model="isDetailOpen"
      max-width="760"
      scrollable
    >
      <VCard
        v-if="selectedReport"
        class="detail-card"
        >
        <div class="detail-hero">
          <div>
            <span class="eyebrow">Detail Laporan</span>
            <h3>{{ selectedReport.job?.title || 'Pekerjaan tidak ditemukan' }}</h3>
          </div>
          <button
            class="close-button"
            type="button"
            aria-label="Tutup detail laporan"
            @click="isDetailOpen = false"
          >
            <i class="ri-close-line"></i>
          </button>
        </div>

        <VCardText class="detail-body">
          <div
            class="detail-status"
            :style="{
              color: getStatusConfig(selectedReport.status).color,
              backgroundColor: getStatusConfig(selectedReport.status).bg,
              borderColor: getStatusConfig(selectedReport.status).border,
            }"
          >
            <i :class="getStatusConfig(selectedReport.status).icon"></i>
            {{ getStatusConfig(selectedReport.status).label }}
          </div>

          <div class="detail-section">
            <h4>Isi laporan</h4>
            <div
              class="rich-text"
              v-html="selectedReport.description || '-'"
            ></div>
          </div>
          <div class="detail-section" v-if="selectedReport.adminNote">
            <h4>Catatan admin</h4>
            <div
              class="rich-text"
            > {{ selectedReport.adminNote }}</div>
          </div>
          

          <div class="detail-section">
            <h4>Bukti laporan</h4>
            <div
              v-if="selectedReport.reportImage?.length"
              class="image-grid"
            >
              <a
                v-for="image in selectedReport.reportImage"
                :key="image"
                :href="getReportImageUrl(image)"
                target="_blank"
                rel="noopener noreferrer"
                class="image-preview"
              >
                <img
                  :src="getReportImageUrl(image)"
                  alt="Bukti laporan"
                >
              </a>
            </div>
            <p
              v-else
              class="muted-text"
            >
              Tidak ada bukti gambar.
            </p>
          </div>

          <div class="detail-section">
            <h4>Informasi pekerjaan</h4>
            <div class="job-panel">
              <img
                v-if="selectedReport.job?.photos?.[0]"
                :src="getJobImageUrl(selectedReport.job.photos[0])"
                alt="Foto pekerjaan"
                class="job-image"
              >

              <div class="job-info">
                <div class="info-row">
                  <span>Judul</span>
                  <strong>{{ selectedReport.job?.title || '-' }}</strong>
                </div>
                <div class="info-row">
                  <span>Kategori</span>
                  <strong>{{ selectedReport.job?.category || '-' }}</strong>
                </div>
                <div class="info-row">
                  <span>Status pekerjaan</span>
                  <strong class="capitalize">{{ selectedReport.job?.status || '-' }}</strong>
                </div>
                <div class="info-row">
                  <span>Deadline</span>
                  <strong>{{ formatDateRange(selectedReport.job?.deadline) }}</strong>
                </div>
                <div class="info-row info-row--full">
                  <span>Lokasi</span>
                  <strong>{{ selectedReport.job?.destination?.destinationName || '-' }}</strong>
                </div>
              </div>
            </div>
          </div>
        </VCardText>

        <VCardActions class="detail-actions" v-if="role === 'admin' && selectedReport.status == 'pending'">
          <VBtn
            class="accept-btn"
            variant="flat"
            block
            @click="openActionModal('approve')"
          >
            <i class="ri-checkbox-circle-line mr-1" />
            Setujui Laporan Pelanggan
          </VBtn>
          <VBtn
            class="btn--reject"
            variant="flat"
            block
            @click="openActionModal('reject')"
          >
            <i class="ri-close-circle-line mr-1" />
            Tolak Laporan Pelanggan
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <ReportActionModal
      v-model:show="isActionModalOpen"
      :type="actionType"
      :report="selectedReport"
      :point="selectedReport ? getReportPoint(selectedReport.category) : 0"
      :loading="isActionLoading"
      @submit="handleActionSubmit"
    />
  </section>
</template>

<style scoped>
*{
  font-family: 'Quicksand';
}
.accept-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.accept-btn:hover {
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.45);
  transform: translateY(-1px);
}

.btn--reject {
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
  border: 1.5px solid #fecaca;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.1);
  transition: background 0.2s ease, transform 0.15s ease;
}

.btn--reject:hover {
  background: #fee2e2;
  transform: translateY(-1px);
}
.reports-page {
  min-height: 100vh;
  padding: 28px 16px 48px;
  background: #f7f6ff;
}

.reports-shell {
  width: min(100%, 1080px);
  margin-inline: auto;
}

.reports-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding: 22px;
  border: 1px solid #ddd9ff;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(77, 70, 160, 0.08);
}

.header-copy {
  max-width: 620px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  margin-bottom: 8px;
  color: #6f67dd;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.reports-header h2,
.detail-hero h3 {
  margin: 0;
  color: #1f2140;
  font-weight: 800;
  line-height: 1.25;
}

.reports-header h2 {
  font-size: 24px;
}

.reports-header p {
  max-width: 560px;
  margin: 8px 0 0;
  color: #6c6f85;
  font-size: 14px;
  line-height: 1.6;
}

.summary-panel {
  display: flex;
  align-items: center;
  min-width: 250px;
  overflow: hidden;
  border: 1px solid #e4e1ff;
  border-radius: 14px;
  background: #f6f4ff;
}

.summary-item {
  flex: 1;
  padding: 14px 18px;
  text-align: center;
}

.summary-value {
  display: block;
  color: #8d85ff;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.summary-label {
  display: block;
  margin-top: 6px;
  color: #5f6278;
  font-size: 12px;
  font-weight: 700;
}

.summary-divider {
  align-self: stretch;
  width: 1px;
  background: #ddd9ff;
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 16px;
  border: 1.5px solid #ddd9ff;
  border-radius: 999px;
  background: #ffffff;
  color: #62657b;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.filter-tab:hover {
  border-color: #8d85ff;
  color: #6f67dd;
}

.filter-tab.active {
  border-color: #8d85ff;
  background: #8d85ff;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(141, 133, 255, 0.26);
}

.filter-count {
  display: inline-grid;
  min-width: 22px;
  height: 22px;
  padding-inline: 7px;
  place-items: center;
  border-radius: 999px;
  background: #f0efff;
  color: #8d85ff;
  font-size: 12px;
  font-weight: 800;
}

.filter-tab.active .filter-count {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.state-box,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  padding: 36px 20px;
  border: 1px solid #e4e1ff;
  border-radius: 18px;
  background: #ffffff;
  color: #6c6f85;
  text-align: center;
}

.state-box {
  gap: 14px;
  font-weight: 700;
}

.empty-icon {
  display: grid;
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  place-items: center;
  border-radius: 18px;
  background: #f1f0ff;
  color: #8d85ff;
  font-size: 32px;
}

.empty-state h3 {
  margin: 0;
  color: #1f2140;
  font-size: 20px;
}

.empty-state p {
  max-width: 420px;
  margin: 8px 0 0;
  line-height: 1.6;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.report-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e2dfff;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(77, 70, 160, 0.08);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.report-card:hover {
  border-color: #b9b3ff;
  box-shadow: 0 18px 44px rgba(77, 70, 160, 0.13);
  transform: translateY(-2px);
}

.card-topline {
  height: 5px;
  background: linear-gradient(90deg, #8d85ff, #bdb8ff);
}

.card-header,
.card-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-header {
  padding: 18px 18px 0;
}

.report-category {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  margin-bottom: 8px;
  padding: 5px 10px;
  overflow: hidden;
  border: 1px solid #ddd9ff;
  border-radius: 999px;
  background: #f5f3ff;
  color: #6f67dd;
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.skill-chip {
  background-color: #f0ebff !important;
  color: #7040d0 !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  border: 1px solid #ddd4ff !important;
}

.card-header h3 {
  display: -webkit-box;
  min-height: 48px;
  margin: 0;
  overflow: hidden;
  color: #20223f;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.status-badge,
.detail-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  border: 1px solid;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.status-badge {
  padding: 7px 10px;
}

.report-description {
  display: -webkit-box;
  min-height: 44px;
  margin: 14px 18px;
  overflow: hidden;
  color: #606377;
  font-size: 14px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 0 18px 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border: 1px solid #ece9ff;
  border-radius: 12px;
  background: #fbfaff;
}

.meta-item i {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: #f0efff;
  color: #8d85ff;
  font-size: 18px;
}

.meta-item div {
  min-width: 0;
}

.meta-item span,
.info-row span,
.muted-text {
  color: #777a8f;
  font-size: 12px;
}

.meta-item strong,
.info-row strong {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: #252743;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  align-items: center;
  padding: 14px 18px 18px;
  border-top: 1px solid #f0edff;
}

.evidence-stack {
  display: flex;
  align-items: center;
  min-height: 36px;
}

.evidence-stack img,
.more-evidence {
  width: 36px;
  height: 36px;
  border: 2px solid #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(77, 70, 160, 0.12);
}

.evidence-stack img {
  object-fit: cover;
}

.evidence-stack img + img,
.more-evidence {
  margin-left: -8px;
}

.more-evidence {
  display: grid;
  place-items: center;
  background: #8d85ff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.detail-button,
.close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
}

.detail-button {
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  background: #8d85ff;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.detail-card {
  overflow: hidden;
  border-radius: 18px;
}

.detail-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
  background: #ffffff;
  border-bottom: 1px solid #ebe8ff;
}

.detail-hero h3 {
  font-size: 20px;
}

.close-button {
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #f2f0ff;
  color: #6f67dd;
  font-size: 20px;
}

.detail-body {
  padding: 22px !important;
  background: #fbfaff;
}

.detail-status {
  width: fit-content;
  margin-bottom: 18px;
  padding: 8px 12px;
}

.detail-section {
  padding: 18px;
  border: 1px solid #e6e2ff;
  border-radius: 14px;
  background: #ffffff;
}

.detail-section + .detail-section {
  margin-top: 14px;
}

.detail-section h4 {
  margin: 0 0 12px;
  color: #232541;
  font-size: 15px;
  font-weight: 800;
}

.rich-text {
  color: #4e5168;
  font-size: 14px;
  line-height: 1.7;
}

.rich-text :deep(p:last-child) {
  margin-bottom: 0;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.image-preview {
  display: block;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border: 1px solid #ebe8ff;
  border-radius: 12px;
  background: #f4f2ff;
}

.image-preview img,
.job-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.job-panel {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 14px;
}

.job-image {
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  background: #f4f2ff;
}

.job-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.info-row {
  min-width: 0;
  padding: 12px;
  border: 1px solid #efecff;
  border-radius: 12px;
  background: #fbfaff;
}

.info-row--full {
  grid-column: 1 / -1;
}

.info-row--full strong {
  white-space: normal;
}

.capitalize {
  text-transform: capitalize;
}

.detail-actions {
  padding: 16px 22px 22px !important;
  background: #ffffff;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 900px) {
  .reports-header {
    flex-direction: column;
  }

  .summary-panel {
    width: 100%;
    min-width: 0;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .reports-page {
    padding: 16px 10px 32px;
  }

  .reports-header {
    padding: 18px;
    border-radius: 16px;
  }

  .reports-header h2 {
    font-size: 20px;
  }

  .summary-item {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
  }

  .card-header h3 {
    min-height: 0;
    font-size: 16px;
  }

  .status-badge {
    width: fit-content;
  }

  .meta-grid,
  .job-panel,
  .job-info {
    grid-template-columns: 1fr;
  }

  .image-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-hero,
  .detail-body {
    padding: 18px !important;
  }
}

@media (hover: none) {
  .report-card:hover {
    border-color: #e2dfff;
    box-shadow: 0 14px 34px rgba(77, 70, 160, 0.08);
    transform: none;
  }
}
</style>
