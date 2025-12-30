<script setup>
import { apiFetch } from '@/utils/api';
import { onMounted, ref } from 'vue';

const jobs = ref([])
async function getInvoices(userId){
    
    const response = await apiFetch(`/payment/get-invoice/${userId}`)
    jobs.value = response.data
    
}
function formatDate(dateString) {
  const date = new Date(dateString)

  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ]

  const month = monthNames[date.getMonth()]

  return `${day} - ${month} - ${year}`
}
function getStatusColor(status) {
    switch (status) {
    case 'SETTLED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'PAID':
      return 'warning'
    case 'EXPIRED':
      return 'error'
    default:
      return 'default'
  }
}


onMounted(async()=>{
    const userId = localStorage.getItem('userId');
    // console.log('userId : ', userId);
    
    await getInvoices(userId);
    console.log('invoice : ',jobs.value.invoices);
})
</script>

<template>
<div class="container">

    <CCard class="payment-card" v-for="(item, i) in jobs.invoices">
      <CCardBody>
        <!-- Header -->
        <div class="header">
          <span class="month">{{ item.external_id }}</span>
          <span class="date">{{ formatDate(item.created) }}</span>
        </div>
  
        <!-- Content -->
        <div class="content">
          <div class="row">
            <span class="label">Status</span>
            <VChip
              :color="getStatusColor(item.status)"
              size="small"
              class="job-status-chip ms-2"
              variant="outlined"
            >
              {{ item.status }}
            </VChip>
          </div>
  
          <div class="row">
            <span class="label">Dibayarkan kepada : </span>
            <span class="value">{{ item.merchant_name }}</span>
          </div>
  
          <div class="row right">
            <span class="label">Total Pembayaran</span>
            <span class="value amount">Rp {{ item.amount.toLocaleString('id-ID') }}</span>
          </div>
        </div>
      </CCardBody>
    </CCard>

    
</div>
</template>


<style scoped>
:deep(.job-status-chip) {
  width: fit-content;
  min-width: unset;
  padding-inline: 8px;
}
.container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 card per baris */
  gap: 20px;
  padding: 20px;
}
.payment-card {
  width: 100%;
  max-width: 500px;
  border-radius: 14px;
  border: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  background: #ffffff;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.month {
  font-weight: 600;
  font-size: 16px;
  color: #111827;
}

.date {
  font-size: 13px;
  color: #6b7280;
}

.content .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.label {
  font-size: 14px;
  color: #6b7280;
}

.value {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

/* Status */
.status-failed {
  color: #ef4444;
}

/* Amount */
.amount {
  color: #3ff00e;
  font-weight: 600;
}

</style>
