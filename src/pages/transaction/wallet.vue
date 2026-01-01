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

const validateForm = () => {
  let isValid = true

  // reset error
  amountError.value = ''
  accountError.value = ''

  if (!amount.value || withdrawAmount.value <= 0) {
    amountError.value = 'Nominal penarikan wajib diisi'
    isValid = false
  }

  if (!accountNumber.value) {
    accountError.value = 'Nomor rekening wajib diisi'
    isValid = false
  }

  if (withdrawAmount.value > balance.value) {
    amountError.value = 'Saldo tidak mencukupi'
    isValid = false
  }

  return isValid
}

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
    sweetAlert.success('Permintaan penarikan saldo berhasil diproses.')
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
  <!-- <body> -->
  <div id="app">
    <div class="wallet-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-md-6 col-lg-5">
            <!-- Balance Card -->
            <div class="balance-card">
              <div class="balance-header">
                <div class="balance-icon">
                  <i class="bi bi-wallet2 fs-4 text-white"></i>
                </div>
                <div>
                  <p class="balance-label">Saldo Tersedia</p>
                  <h2 class="balance-amount">{{ formatCurrency(balance) }}</h2>
                </div>
              </div>

              <div class="info-box">
                <i class="bi bi-info-circle"></i>
                <p>Penarikan akan diproses dalam 1-3 hari kerja ke rekening terdaftar</p>
              </div>
            </div>

            <!-- Withdraw Card -->
            <div class="withdraw-card">
              <h3 class="card-title">
                <i class="bi bi-arrow-down-circle text-primary"></i>
                Tarik Saldo
              </h3>

              <!-- <CForm> -->

              <!-- Amount Input -->
              <div class="mb-3">
                <label class="form-label">Nominal Penarikan</label>
                <div class="amount-input-wrapper">
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
                  <div
                    v-if="amountError"
                    class="error-message"
                  >
                    <i class="bi bi-exclamation-circle"></i>
                    <span>{{ amountError }}</span>
                  </div>
                </transition>
              </div>

              <!-- Quick Amount Buttons -->
              <div class="mb-3">
                <label class="form-label">Nominal Cepat</label>
                <div class="quick-amounts">
                  <button
                    v-for="quickAmount in quickAmounts"
                    :key="quickAmount"
                    class="quick-amount-btn"
                    :class="{ active: parseInt(amount) === quickAmount }"
                    @click="selectQuickAmount(quickAmount)"
                  >
                    {{ formatCurrency(quickAmount) }}
                  </button>
                </div>
              </div>

              <div class="account-number-input mb-3">
                <CInputGroup class="has-validation">
                  <CFormInput
                    v-model="accountNumber"
                    type="text"
                    placeholder="Masukkan Nomor Rekening"
                    class="custom-input"
                    feedbackInvalid="Please choose a username."
                    required
                    @input="onlyNumber"
                  />
                  <div
                    v-if="accountError"
                    class="text-danger text-sm mt-1"
                  >
                    {{ accountError }}
                  </div>
                </CInputGroup>
              </div>

              <VExpansionPanels
                variant="accordion"
                class="accordion mb-3"
              >
                <VExpansionPanel :title="'Bank Dipilih : ' + channelName">
                  <v-expansion-panel-text>
                    <div class="quick-amounts">
                      <button
                        v-for="bank in payoutBankList"
                        :key="bank"
                        class="payout-bank-btn"
                        :class="{ active: channelName === bank }"
                        @click="channelName = bank"
                      >
                        {{ bank }}
                      </button>
                    </div>
                  </v-expansion-panel-text>
                </VExpansionPanel>
              </VExpansionPanels>

              <!-- Withdraw Button -->
              <button
                class="btn-withdraw"
                :disabled="!amount || !accountNumber || showSuccess"
                @click="withdraw"
              >
                <i
                  v-if="showSuccess"
                  class="bi bi-check-circle"
                ></i>
                <i
                  v-else
                  class="bi bi-arrow-down-circle"
                ></i>
                <span>{{ showSuccess ? 'Berhasil Diproses!' : 'Tarik Saldo' }}</span>
              </button>
              <!-- </CForm> -->

              <!-- Info Footer -->
              <div class="info-footer">
                <div class="info-footer-content">
                  <i class="bi bi-info-circle"></i>
                  <div class="info-list">
                    • Minimal penarikan: Rp 10.000<br />
                    • Tidak ada biaya admin untuk penarikan<br />
                    • Maksimal 3x penarikan per hari
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- </body> -->
</template>

<style scoped>
/* body {
      min-height: 100vh;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    } */

.wallet-container {
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.custom-input {
  height: 58px; /* tambah tinggi input */
  font-size: 14px; /* ukuran teks input */
}

/* placeholder lebih kecil */
.custom-input::placeholder {
  font-size: 8px;
  color: #9ca3af; /* opsional: lebih soft */
}

.balance-card {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);
  border: none;
}

.balance-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.balance-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.balance-amount {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.balance-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0;
}

.info-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0.875rem;
  display: flex;
  gap: 0.5rem;
  align-items: start;
}

.info-box i {
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0.125rem;
}

.info-box p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.5;
}

.withdraw-card {
  background: #1e293b;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label {
  color: #cbd5e1;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.amount-input-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.currency-prefix {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-weight: 600;
  pointer-events: none;
}

.amount-input {
  width: 100%;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid #475569;
  border-radius: 16px;
  padding: 1rem 1rem 1rem 3rem;
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.3s;
}

.amount-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: rgba(51, 65, 85, 0.7);
}

.amount-input::placeholder {
  color: #64748b;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.quick-amount-btn,
.payout-bank-btn {
  padding: 0.875rem;
  border-radius: 12px;
  border: 1px solid #475569;
  background: #334155;
  color: #cbd5e1;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
}

.quick-amount-btn,
.payout-bank-btn:hover {
  background: #475569;
  border-color: #64748b;
}

.quick-amount-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.payout-bank-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-withdraw {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 16px;
  padding: 1rem;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-withdraw:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-withdraw:disabled {
  background: #475569;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-withdraw.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.info-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.info-footer-content {
  display: flex;
  gap: 0.75rem;
  align-items: start;
}

.info-footer-content i {
  color: #94a3b8;
  margin-top: 0.125rem;
}

.info-list {
  color: #94a3b8;
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.8;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
