<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { onMounted, ref, computed } from 'vue';

const technicianId = localStorage.getItem('userId')
const disbursements = ref([])

const getDisbursements = async () => {
  try {
    const response = await apiFetch(`/payment/get-disbursements/${technicianId}`)
    disbursements.value = response.data.disbursements
  } catch (error) {
    sweetAlert.error('Gagal mengambil data riwayat penarikan saldo.')
  }
}

const totalDisbursed = computed(() =>
  disbursements.value
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + (d.amount || 0), 0)
)

const totalPending = computed(() =>
  disbursements.value
    .filter(d => d.status === 'PENDING')
    .reduce((sum, d) => sum + (d.amount || 0), 0)
)

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

function getStatusConfig(status) {
  switch (status) {
    case 'COMPLETED':
      return {  bgColor: '#f0fdf4', textColor: '#15803d', borderColor: '#bbf7d0', dotColor: '#22c55e' }
    case 'PENDING':
      return {  bgColor: '#fefce8', textColor: '#a16207', borderColor: '#fde68a', dotColor: '#eab308' }
    case 'FAILED':
      return {  bgColor: '#fef2f2', textColor: '#b91c1c', borderColor: '#fecaca', dotColor: '#ef4444' }
    default:
      return { label: status, bgColor: '#f9fafb', textColor: '#6b7280', borderColor: '#e5e7eb', dotColor: '#9ca3af' }
  }
}

function getBankIcon(bankCode) {
  const colors = { BCA: '#0060af', BNI: '#f37021', BRI: '#00529b' }
  return colors[bankCode] || '#8d58ff'
}

onMounted(async () => {
  await getDisbursements()
  console.log('disbursements : ', disbursements.value)
})
</script>

<template>
  <div class="page-wrapper">

    <!-- Summary Row -->
    <div class="summary-row">
      <div class="summary-card main">
        <div class="summary-icon-wrap">
          <i class="ri-download-fill" style="color: white;"></i>
        </div>
        <div class="summary-info">
          <span class="summary-label">Total Dicairkan</span>
          <span class="summary-amount">{{ formatCurrency(totalDisbursed) }}</span>
        </div>
      </div>

      <div class="summary-card side">
        <div class="side-top">
            <i class="ri-error-warning-fill" style="width: 14px; color: #eab308;"></i>
          <span class="side-label">PENDING</span>
        </div>
        <span class="side-amount pending">{{ formatCurrency(totalPending) }}</span>
      </div>

      <div class="summary-card side">
        <div class="side-top">
            <i class="ri-calendar-2-line" style="width: 14px; color: #8d58ff;"></i>
          
          <span class="side-label">Total</span>
        </div>
        <span class="side-amount total">{{ disbursements.length }} Transaksi</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="disbursements.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#c4b5fd">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </div>
      <p class="empty-title">Belum ada riwayat penarikan</p>
      <p class="empty-sub">Transaksi penarikan saldo akan muncul di sini</p>
    </div>

    <!-- Card List -->
    <div v-else class="card-list">
      <div
        v-for="item in disbursements"
        :key="item.id"
        class="disb-card"
      >
        <div class="card-accent"></div>
        <div class="card-body">

          <!-- Top Row -->
          <div class="card-top">
            <div class="bank-badge" :style="{ background: getBankIcon(item.bank_code) + '18', borderColor: getBankIcon(item.bank_code) + '44' }">
              <span class="bank-code" :style="{ color: getBankIcon(item.bank_code) }">{{ item.bank_code }}</span>
            </div>
            <div class="card-meta">
              <span class="card-extid">{{ item.external_id }}</span>
              <span class="card-holder">{{ item.account_holder_name }}</span>
            </div>
            <div
              class="status-chip"
              :style="{
                background: getStatusConfig(item.status).bgColor,
                color: getStatusConfig(item.status).textColor,
                borderColor: getStatusConfig(item.status).borderColor
              }"
            >
              <span
                class="status-dot"
                :style="{ background: getStatusConfig(item.status).dotColor }"
              ></span>
              {{ item.status }}
            </div>
          </div>

          <div class="card-divider"></div>

          <!-- Description -->
          <div class="card-desc">
            <i class="ri-file-text-line" style="width: 13px; color: #a78bfa; flex-shrink:0;margin-top: 3px;"></i>
            
            <span class="desc-text">{{ item.disbursement_description }}</span>
          </div>

          <div class="card-divider"></div>

          <!-- Footer -->
          <div class="card-footer">
            
            <div class="amount-wrap">
              
              <span class="amount-value">{{ formatCurrency(item.amount) }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ===== PAGE ===== */
.page-wrapper {
  padding: 20px;
  max-width: 720px;
  margin: 0 auto;
}

/* ===== SUMMARY ROW ===== */
.summary-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  margin-bottom: 20px;
  align-items: stretch;
}
.summary-card {
  border-radius: 16px;
  overflow: hidden;
}
.summary-card.main {
  background: linear-gradient(135deg, #8d58ff, #b48aff);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.summary-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.summary-info {
  display: flex;
  flex-direction: column;
}
.summary-label {
  font-size: 11px;
  color: rgba(255,255,255,0.85);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.summary-amount {
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}
.summary-card.side {
  background: white;
  border: 0.5px solid #e2d9ff;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 120px;
}
.side-top {
  display: flex;
  align-items: center;
  gap: 5px;
}
.side-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.side-amount {
  font-size: 14px;
  font-weight: 600;
}
.side-amount.pending { color: #a16207; }
.side-amount.total { color: #8d58ff; }

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #f3eeff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.empty-title {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 6px;
}
.empty-sub {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* ===== CARD LIST ===== */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ===== DISBURSEMENT CARD ===== */
.disb-card {
  background: #ffffff;
  border-radius: 16px;
  border: 0.5px solid #e2d9ff;
  overflow: hidden;
  transition: transform 0.15s ease;
}
.disb-card:hover {
  transform: translateY(-2px);
}
.card-accent {
  height: 4px;
  background: linear-gradient(90deg, #8d58ff, #b48aff);
}
.card-body {
  padding: 16px;
}

/* Top Row */
.card-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bank-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bank-code {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.card-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.card-extid {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-holder {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
  text-transform: capitalize;
}
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid;
  white-space: nowrap;
  flex-shrink: 0;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Divider */
.card-divider {
  height: 0.5px;
  background: #f3f0ff;
  margin: 12px 0;
}

/* Description */
.card-desc {
  display: flex;
  align-items: flex-start;
  gap: 7px;
}
.desc-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

/* Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.id-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
  margin-right: 12px;
}
.id-label {
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: #8d58ff;
  padding: 2px 7px;
  border-radius: 6px;
  flex-shrink: 0;
}
.id-value {
  font-size: 11px;
  font-family: monospace;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.amount-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}
.amount-value {
  font-size: 16px;
  font-weight: 700;
  color: #8d58ff;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .page-wrapper {
    padding: 12px;
  }
  .summary-row {
    grid-template-columns: 1fr;
  }
  .summary-card.main {
    padding: 14px 16px;
  }
  .summary-amount {
    font-size: 18px;
  }
  .summary-card.side {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-width: unset;
    padding: 12px 16px;
  }
  .side-top {
    flex-direction: row;
  }
}
@media (max-width: 480px) {
  .card-extid {
    font-size: 12px;
  }
  .amount-value {
    font-size: 14px;
  }
  .bank-badge {
    width: 40px;
    height: 40px;
  }
  .bank-code {
    font-size: 11px;
  }
}
@media (hover: none) {
  .disb-card:hover {
    transform: none;
  }
}
</style>
