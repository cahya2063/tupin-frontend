<script setup>
import { apiFetch, getProfile } from '@/utils/api'
import sweetAlert from '@/utils/sweetAlert'
import { ref, computed, onMounted } from 'vue'

const userId = localStorage.getItem('userId')
const balance = ref(0)
const amount = ref('')
const error = ref('')
const showSuccess = ref(false)
const subAccountId = ref('')
const channelName = ref('BCA')
const accountNumber = ref('')

const amountError = ref('')
const accountError = ref('')

const technician = ref()

const quickAmounts = [50000, 100000, 200000, 500000]
const payoutBankList = ['BCA', 'BNI', 'BRI']

const withdrawAmount = computed(() => parseInt(amount.value || 0))

const formatCurrency = value =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)

const selectQuickAmount = value => {
  amount.value = value
  error.value = ''
}
const onlyNumber = event => {
  event.target.value = event.target.value.replace(/[^0-9]/g, '')
}

// const validateForm = () => {
//   let isValid = true

//   // reset error
//   amountError.value = ''
//   accountError.value = ''

//   if (!amount.value || withdrawAmount.value <= 0) {
//     amountError.value = 'Nominal penarikan wajib diisi'
//     isValid = false
//   }

//   if (!accountNumber.value) {
//     accountError.value = 'Nomor rekening wajib diisi'
//     isValid = false
//   }

//   if (withdrawAmount.value > balance.value) {
//     amountError.value = 'Saldo tidak mencukupi'
//     isValid = false
//   }

//   return isValid
// }

async function getBalance(subAccountId) {
  const response = await apiFetch(`/payment/check-balance/${subAccountId}`)
  return response.data
}

const withdraw = async () => {
  try {
    console.log(`debug payout : ${accountNumber.value} ${channelName.value}, ${withdrawAmount.value}`)
    const request = {
      technicianId: userId,
      amount: withdrawAmount.value,
      channelName: channelName.value,
      accountNumber: accountNumber.value,
    }
    const response = await apiFetch('/payment/create-payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    if(response.data.success){

      sweetAlert.success('Permintaan penarikan saldo berhasil diproses.')
    }
    else{
      sweetAlert.error(response.data.message || 'Gagal memproses penarikan saldo.')
    }
    console.log('response : ', response.data)
  } catch (error) {
    sweetAlert.error(error.message)
  }
}

onMounted(async () => {
  const profile = await getProfile(userId)

  subAccountId.value = profile.subAccountId
  const response = await getBalance(subAccountId.value)
  balance.value = response.balance

  console.log('profile teknisi : ', profile.subAccountId)
})
</script>

<template>
  <div class="page-wrapper">
    <div class="content-col">

      <!-- Balance Card -->
      <div class="balance-card">
        <div class="balance-bg-circle circle-1"></div>
        <div class="balance-bg-circle circle-2"></div>
        <div class="balance-top">
          <div class="balance-icon-wrap">
            <i class="ri-wallet-fill" style="font-size: 32px; color: white;"></i>
          </div>
          <div>
            <p class="balance-label">Saldo Tersedia</p>
            <h2 class="balance-amount">{{ formatCurrency(balance) }}</h2>
          </div>
        </div>
        <div class="balance-info-box">
          <i class="ri-information-fill" style="color: white;"></i>
          <p>Penarikan akan diproses dalam 1–3 hari kerja ke rekening terdaftar</p>
        </div>
      </div>

      <!-- Withdraw Card -->
      <div class="withdraw-card">
        <div class="card-title-row">
          <div class="card-title-icon">
            <i class="ri-download-fill" style="color: white;"></i>
          </div>
          <h3 class="card-title">Tarik Saldo</h3>
        </div>

        <!-- Nominal Input -->
        <div class="field-group">
          <label class="field-label">Nominal Penarikan</label>
          <div class="amount-wrapper">
            <span class="currency-prefix">Rp</span>
            <input
              type="number"
              class="amount-input"
              v-model="amount"
              @input="onlyNumber"
              placeholder="0"
            />
          </div>
          <transition name="fade">
            <div v-if="amountError" class="error-msg">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {{ amountError }}
            </div>
          </transition>
        </div>

        <!-- Quick Amounts -->
        <div class="field-group">
          <label class="field-label">Nominal Cepat</label>
          <div class="quick-grid">
            <button
              v-for="quickAmount in quickAmounts"
              :key="quickAmount"
              class="quick-btn"
              :class="{ active: parseInt(amount) === quickAmount }"
              @click="selectQuickAmount(quickAmount)"
            >
              {{ formatCurrency(quickAmount) }}
            </button>
          </div>
        </div>

        <!-- Account Number -->
        <div class="field-group">
          <label class="field-label">Nomor Rekening</label>
          <CInputGroup class="has-validation">
            <CFormInput
              v-model="accountNumber"
              type="text"
              placeholder="Masukkan Nomor Rekening"
              class="account-input"
              required
              @input="onlyNumber"
            />
          </CInputGroup>
          <transition name="fade">
            <div v-if="accountError" class="error-msg">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {{ accountError }}
            </div>
          </transition>
        </div>

        <!-- Bank Selector -->
        <div class="field-group">
          <label class="field-label">Pilih Bank</label>
          <VExpansionPanels variant="accordion" class="bank-accordion">
            <VExpansionPanel :title="'Bank Dipilih : ' + channelName">
              <v-expansion-panel-text>
                <div class="bank-grid">
                  <button
                    v-for="bank in payoutBankList"
                    :key="bank"
                    class="bank-btn"
                    :class="{ active: channelName === bank }"
                    @click="channelName = bank"
                  >
                  <i class="ri-bank-fill" :fill="channelName === bank ? 'white' : '#8d58ff'" style="size: 30px;"></i>
                    
                    {{ bank }}
                  </button>
                </div>
              </v-expansion-panel-text>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>

        <!-- Withdraw Button -->
        <button
          class="btn-withdraw"
          :disabled="!amount || !accountNumber || showSuccess"
          @click="withdraw"
        >
        <i class="ri-download-fill" v-if="showSuccess" width="18" height="18" fill="white"></i>
        <i class="ri-download-fill" v-else width="18" height="18" fill="white"></i>
          {{ showSuccess ? 'Berhasil Diproses!' : 'Tarik Saldo' }}
        </button>

        <!-- Info Footer -->
        <div class="info-footer">
          <div class="info-row">
            <div class="info-dot"></div>
            <span>Minimal penarikan: Rp 10.000</span>
          </div>
          <div class="info-row">
            <div class="info-dot"></div>
            <span>Tidak ada biaya admin untuk penarikan</span>
          </div>
          <div class="info-row">
            <div class="info-dot"></div>
            <span>Maksimal 3x penarikan per hari</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ===== PAGE ===== */
.page-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px 16px 40px;
}
.content-col {
  width: 100%;
  max-width: 480px;
}

/* ===== BALANCE CARD ===== */
.balance-card {
  position: relative;
  background: linear-gradient(135deg, #8d58ff 0%, #b48aff 100%);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 20px;
  overflow: hidden;
}
.balance-bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}
.circle-1 {
  width: 160px;
  height: 160px;
  top: -60px;
  right: -40px;
}
.circle-2 {
  width: 100px;
  height: 100px;
  bottom: -30px;
  left: 30px;
}
.balance-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}
.balance-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.balance-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 4px;
}
.balance-amount {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.5px;
}
.balance-info-box {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 10px 14px;
}
.balance-info-box p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.5;
}

/* ===== WITHDRAW CARD ===== */
.withdraw-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  border: 0.5px solid #e2d9ff;
}
.card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.card-title-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #8d58ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* ===== FIELDS ===== */
.field-group {
  margin-bottom: 20px;
}
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

/* Amount Input */
.amount-wrapper {
  position: relative;
}
.currency-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  font-weight: 600;
  color: #8d58ff;
  pointer-events: none;
  z-index: 1;
}
.amount-input {
  width: 100%;
  border: 1.5px solid #e2d9ff;
  border-radius: 14px;
  padding: 13px 14px 13px 42px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  background: #faf8ff;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.amount-input:focus {
  outline: none;
  border-color: #8d58ff;
  box-shadow: 0 0 0 3px rgba(141, 88, 255, 0.12);
  background: #fff;
}
.amount-input::placeholder {
  color: #c4b5fd;
  font-weight: 400;
}

/* Quick Amounts */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.quick-btn {
  padding: 11px 8px;
  border-radius: 12px;
  border: 1.5px solid #e2d9ff;
  background: #faf8ff;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-btn:hover {
  border-color: #8d58ff;
  color: #8d58ff;
  background: #f3eeff;
}
.quick-btn.active {
  background: #8d58ff;
  border-color: #8d58ff;
  color: white;
  box-shadow: 0 4px 12px rgba(141, 88, 255, 0.25);
}

/* Account Input */
.account-input {
  height: 50px !important;
  font-size: 14px !important;
  border-radius: 14px !important;
  border: 1.5px solid #e2d9ff !important;
  background: #faf8ff !important;
  padding-left: 14px !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
}
.account-input:focus {
  border-color: #8d58ff !important;
  box-shadow: 0 0 0 3px rgba(141, 88, 255, 0.12) !important;
  background: #fff !important;
}
.account-input::placeholder {
  color: #c4b5fd !important;
  font-size: 13px !important;
}

/* Bank Accordion */
.bank-accordion {
  border-radius: 14px !important;
  border: 1.5px solid #e2d9ff !important;
  overflow: hidden;
}
.bank-grid {
  display: flex;
  gap: 10px;
  padding: 4px 0 8px;
  flex-wrap: wrap;
}
.bank-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1.5px solid #e2d9ff;
  background: #faf8ff;
  color: #8d58ff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.bank-btn:hover {
  border-color: #8d58ff;
  background: #f3eeff;
}
.bank-btn.active {
  background: #8d58ff;
  border-color: #8d58ff;
  color: white;
  box-shadow: 0 4px 12px rgba(141, 88, 255, 0.25);
}

/* Error */
.error-msg {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
}

/* Withdraw Button */
.btn-withdraw {
  width: 100%;
  background: linear-gradient(135deg, #8d58ff, #b48aff);
  border: none;
  border-radius: 14px;
  padding: 14px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(141, 88, 255, 0.3);
  margin-top: 8px;
}
.btn-withdraw:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(141, 88, 255, 0.4);
}
.btn-withdraw:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

/* Info Footer */
.info-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f0ff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
}
.info-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #c4b5fd;
  flex-shrink: 0;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .page-wrapper {
    padding: 16px 12px 32px;
  }
  .balance-amount {
    font-size: 22px;
  }
  .balance-card,
  .withdraw-card {
    padding: 18px;
    border-radius: 20px;
  }
  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 380px) {
  .balance-amount {
    font-size: 19px;
  }
  .quick-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .quick-btn {
    font-size: 12px;
    padding: 10px 6px;
  }
  .bank-btn {
    padding: 9px 14px;
    font-size: 12px;
  }
}
@media (hover: none) {
  .btn-withdraw:hover:not(:disabled) {
    transform: none;
  }
}
</style>
