<script setup>
import { apiFetch, getProfile } from '@/utils/api'
import { ref, computed, onMounted } from 'vue'

const userId = localStorage.getItem('userId')
const balance = ref(0)
const amount = ref('')
const error = ref('')
const showSuccess = ref(false)
const subAccountId = ref('')

const technician = ref()

const quickAmounts = [50000, 100000, 200000, 500000]

const withdrawAmount = computed(() => parseInt(amount.value || 0))

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)

const selectQuickAmount = (value) => {
  amount.value = value
  error.value = ''
}

async function getBalance(subAccountId){
    const response = await apiFetch(`/payment/check-balance/${subAccountId}`)
    return response.data
    
}



const withdraw = async() => {
  const channelName = 'BCA'
  console.log(`debug payout : ${userId}, ${balance.value}, ${channelName}, ${withdrawAmount.value}`);
  const request = {
    technicianId: userId,
    amount: withdrawAmount.value,
    channelName,
  }
    const response = await apiFetch('/payment/create-payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })
    console.log('response : ', response.data);
    

}

onMounted(async()=>{
    const profile = await getProfile(userId)

    subAccountId.value = profile.subAccountId
    const response = await getBalance(subAccountId.value)
    balance.value = response.balance
    
    
    console.log('profile teknisi : ', profile.subAccountId);
    
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

              <!-- Amount Input -->
              <div class="mb-3">
                <label class="form-label">Nominal Penarikan</label>
                <div class="amount-input-wrapper">
                  <span class="currency-prefix">Rp</span>
                  <input 
                    type="number" 
                    class="amount-input" 
                    v-model="amount"
                    @input="clearError"
                    placeholder="0"
                  >
                </div>
                <transition name="fade">
                  <div v-if="error" class="error-message">
                    <i class="bi bi-exclamation-circle"></i>
                    <span>{{ error }}</span>
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

              <!-- Withdraw Button -->
              <button 
                class="btn-withdraw"
                :class="{ success: showSuccess }"
                :disabled="!amount || showSuccess"
                @click="withdraw"
              >
                <i v-if="showSuccess" class="bi bi-check-circle"></i>
                <i v-else class="bi bi-arrow-down-circle"></i>
                <span>{{ showSuccess ? 'Berhasil Diproses!' : 'Tarik Saldo' }}</span>
              </button>

              <!-- Info Footer -->
              <div class="info-footer">
                <div class="info-footer-content">
                  <i class="bi bi-info-circle"></i>
                  <div class="info-list">
                    • Minimal penarikan: Rp 10.000<br>
                    • Tidak ada biaya admin untuk penarikan<br>
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

    .quick-amount-btn {
      padding: 0.875rem;
      border-radius: 12px;
      border: 1px solid #475569;
      background: #334155;
      color: #cbd5e1;
      font-weight: 600;
      transition: all 0.3s;
      cursor: pointer;
    }

    .quick-amount-btn:hover {
      background: #475569;
      border-color: #64748b;
    }

    .quick-amount-btn.active {
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

    .fade-enter-active, .fade-leave-active {
      transition: opacity 0.3s;
    }

    .fade-enter-from, .fade-leave-to {
      opacity: 0;
    }
</style>
