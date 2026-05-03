<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { onMounted, ref, computed } from 'vue';

const technicianId = localStorage.getItem('userId')
const role = localStorage.getItem('role')
const transferedMoneyIn = ref([])
const isModalOpen = ref(false)
const selectedTransfer = ref(null)

async function getTransfer(receiverId) {
  try {
    const response = await apiFetch(`/payment/get-transfers/`)
    transferedMoneyIn.value = response.data.transfers
  } catch (error) {
    sweetAlert.error('Gagal mendapatkan data transfer')
  }
}

function openDetail(transfer) {
  selectedTransfer.value = transfer
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedTransfer.value = null
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const month = monthNames[date.getMonth()]
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

function getTypeLabel(type) {
  switch (type) {
    case 'transportation': return 'Transportasi'
    case 'repair': return 'Perbaikan'
    default: return type
  }
}


const totalIncome = computed(() =>
  transferedMoneyIn.value.reduce((sum, t) => sum + (t.amount || 0), 0)
)

onMounted(async () => {
  await getTransfer(technicianId)
  console.log('transfered money in : ', transferedMoneyIn.value);
  

  const updatedTransfers = await Promise.all(
    transferedMoneyIn.value.map(async (element) => {
      try {
        const response = await apiFetch(`/jobs/${element.jobId}`)
        return { ...element, job: response.data.job }
      } catch (error) {
        return { ...element, job: null }
      }
    })
  )

  transferedMoneyIn.value = updatedTransfers
})
</script>

<template>
  <div class="page-wrapper">

    <!-- Summary Header -->
    <div class="summary-header">
      <div class="summary-icon">
        <i class="ri-wallet-2-line" style="font-size: 32px;"></i>
      </div>
      <div class="summary-info">
        <span class="summary-label">Total Uang Masuk</span>
        <span class="summary-amount">Rp {{ totalIncome.toLocaleString('id-ID') }}</span>
      </div>
      <div class="summary-count">
        <span class="count-num">{{ transferedMoneyIn.length }}</span>
        <span class="count-label">Transaksi</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="transferedMoneyIn.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#c4b5fd">
          <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        </svg>
      </div>
      <p class="empty-text">Belum ada transfer masuk</p>
    </div>

    <!-- Card Grid -->
    <div v-else class="card-grid">
      <div
        v-for="item in transferedMoneyIn"
        :key="item.transfer_id"
        class="transfer-card"
        @click="openDetail(item)"
      >
        <div class="card-accent"></div>
        <div class="card-body">
          <!-- Top Row -->
          <div class="card-top">
            <div class="card-avatar">
              <i class="ri-wallet-2-line" style="font-size: 20px; color: white;"></i>
            </div>
            <div class="card-ref">
              <span class="ref-text">{{ item.reference }}</span>
              <span class="ref-date">{{ formatDate(item.created) }}</span>
            </div>
            <span class="status-badge">
              <svg width="8" height="8" viewBox="0 0 8 8" style="margin-right:4px;flex-shrink:0;">
                <circle cx="4" cy="4" r="4" fill="#10b981"/>
              </svg>
              {{ item.status }}
            </span>
          </div>

          <div class="card-divider"></div>

          <!-- Job Title -->
          <div class="card-job" v-if="item.job">
            <span class="job-title">{{ item.job.title }}</span>
          </div>

          <div class="card-divider"></div>

          <!-- Footer -->
          <div class="card-footer">
            <div>
              <span class="type-pill" :class="`type-${item.type}`">{{ getTypeLabel(item.type) }}</span>
            </div>
            <div class="card-amount">
              <span class="amount-text">Rp {{ item.amount.toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detail -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isModalOpen && selectedTransfer" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box">

            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-header-icon">
                <i class="ri-wallet-2-line" style="font-size: 25px; color: white;"></i>

              </div>
              <div>
                <h3 class="modal-title">Detail Transfer</h3>
                <p class="modal-subtitle">{{ selectedTransfer.reference }}</p>
              </div>
              <button class="modal-close" @click="closeModal">
                <i class="ri-close-line"></i>
              </button>
            </div>

            <!-- Amount Hero -->
            <div class="modal-amount-hero">
              <span class="hero-label">Jumlah Transfer</span>
              <span class="hero-amount">Rp {{ selectedTransfer.amount.toLocaleString('id-ID') }}</span>
              <span class="hero-currency">{{ selectedTransfer.currency }}</span>
            </div>

            <!-- Detail Rows -->
            <div class="modal-section">
              <h4 class="section-title">Informasi Transaksi</h4>

              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="status-badge-lg">
                  <svg width="8" height="8" viewBox="0 0 8 8" style="margin-right:5px;">
                    <circle cx="4" cy="4" r="4" fill="#10b981"/>
                  </svg>
                  {{ selectedTransfer.status }}
                </span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Tipe</span>
                <span class="type-pill" :class="`type-${selectedTransfer.type}`">{{ getTypeLabel(selectedTransfer.type) }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Tanggal</span>
                <span class="detail-value">{{ formatDate(selectedTransfer.created) }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">ID Transfer</span>
                <span class="detail-value mono">{{ selectedTransfer.reference }}</span>
              </div>

              
            </div>

            <!-- Job Info -->
            <div class="modal-section" v-if="selectedTransfer.job">
              <h4 class="section-title">Informasi Pekerjaan</h4>

              <div class="job-card-mini">
                <div class="job-mini-header">
                  <i class="ri-suitcase-2-line"></i>

                  <span class="job-mini-title">{{ selectedTransfer.job.title }}</span>
                </div>
                <div class="detail-row" style="margin-top:10px;">
                  <span class="detail-label">Kategori</span>
                  <span class="detail-value">{{ selectedTransfer.job.category }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status Pekerjaan</span>
                  <span class="detail-value">{{ selectedTransfer.job.status }}</span>
                </div>
                <div class="detail-row" v-if="selectedTransfer.job.deadline">
                  <span class="detail-label">Deadline</span>
                  <span class="detail-value">
                    {{ selectedTransfer.job.deadline.start_date }} s/d {{ selectedTransfer.job.deadline.end_date }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Close Button -->
            <button class="modal-btn-close" @click="closeModal">Tutup</button>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
/* ===== PAGE ===== */
.page-wrapper {
  padding: 20px;
  max-width: 960px;
  margin: 0 auto;
}

/* ===== SUMMARY HEADER ===== */
.summary-header {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #8d58ff, #b48aff);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 20px;
  color: white;
}
.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.summary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.summary-label {
  font-size: 12px;
  opacity: 0.85;
}
.summary-amount {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.5px;
}
.summary-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 8px 16px;
}
.count-num {
  font-size: 22px;
  font-weight: 600;
}
.count-label {
  font-size: 11px;
  opacity: 0.85;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}
.empty-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}
.empty-text {
  font-size: 14px;
}

/* ===== CARD GRID ===== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* ===== TRANSFER CARD ===== */
.transfer-card {
  background: #ffffff;
  border-radius: 16px;
  border: 0.5px solid #e2d9ff;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.transfer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(141, 88, 255, 0.12);
}
.card-accent {
  height: 4px;
  background: linear-gradient(90deg, #8d58ff, #b48aff);
}
.card-body {
  padding: 14px 16px;
}
.card-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.card-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #8d58ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-ref {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.ref-text {
  font-size: 12px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ref-date {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 500;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}
.card-divider {
  height: 0.5px;
  background: #f3f0ff;
  margin: 10px 0;
}
.card-job {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.job-title {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.type-pill {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
}
.type-transportation {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.type-repair {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.card-amount {
  display: flex;
  align-items: center;
}
.amount-text {
  font-size: 15px;
  font-weight: 600;
  color: #8d58ff;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  padding: 0;
}
@media (min-width: 640px) {
  .modal-overlay {
    align-items: center;
    padding: 20px;
  }
}
.modal-box {
  background: #ffffff;
  font-family: 'Quicksand';
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0 0 24px;
}
@media (min-width: 640px) {
  .modal-box {
    border-radius: 20px;
    max-height: 85vh;
  }
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 0.5px solid #f3f0ff;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}
.modal-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #8d58ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}
.modal-subtitle {
  font-size: 12px;
  color: #9ca3af;
  margin: 2px 0 0;
}
.modal-close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 0.5px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  flex-shrink: 0;
}
.modal-close:hover {
  background: #f3f0ff;
  color: #8d58ff;
}
.modal-amount-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 20px;
  background: linear-gradient(135deg, #f3eeff, #ede9fe);
  margin: 0 20px 16px;
  border-radius: 16px;
  margin-top: 16px;
}
.hero-label {
  font-size: 12px;
  color: #7c3aed;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.hero-amount {
  font-size: 28px;
  font-weight: 700;
  color: #8d58ff;
  letter-spacing: -1px;
}
.hero-currency {
  font-size: 12px;
  color: #a78bfa;
  margin-top: 4px;
}
.modal-section {
  padding: 0 20px;
  margin-bottom: 16px;
}
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #8d58ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 0.5px solid #f3f0ff;
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-label {
  font-size: 13px;
  color: #6b7280;
}
.detail-value {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}
.detail-value.mono {
  font-family: monospace;
  font-size: 12px;
  color: #8d58ff;
}
.detail-value.small {
  font-size: 10px;
}
.status-badge-lg {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  padding: 4px 10px;
  border-radius: 20px;
}
.job-card-mini {
  background: #f9f5ff;
  border: 0.5px solid #e2d9ff;
  border-radius: 12px;
  padding: 14px;
}
.job-mini-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.job-mini-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}
.modal-btn-close {
  display: block;
  width: calc(100% - 40px);
  margin: 0 20px;
  padding: 13px;
  background: #8d58ff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.modal-btn-close:hover {
  background: #7c3aed;
}

/* ===== MODAL TRANSITION ===== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active .modal-box,
.modal-fade-leave-active .modal-box {
  transition: transform 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-box {
  transform: translateY(40px);
}
@media (min-width: 640px) {
  .modal-fade-enter-from .modal-box {
    transform: scale(0.95) translateY(10px);
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 12px;
  }
  .card-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .summary-amount {
    font-size: 18px;
  }
}
@media (max-width: 480px) {
  .summary-header {
    padding: 14px 16px;
    gap: 12px;
  }
  .summary-icon {
    width: 38px;
    height: 38px;
  }
  .summary-amount {
    font-size: 16px;
  }
  .count-num {
    font-size: 18px;
  }
  .hero-amount {
    font-size: 24px;
  }
  @media (hover: none) {
    .transfer-card:hover {
      transform: none;
      box-shadow: none;
    }
  }
}
</style>
