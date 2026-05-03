<script setup>
import { apiFetch } from '@/utils/api'
import sweetAlert from '@/utils/sweetAlert'
import { onMounted, ref } from 'vue'

const payment = ref({
  invoices: [],
})
const selectedInvoice = ref(null)
const isActive = ref(false)
const isModalDeleteActive = ref(false)

const selectedDeleteInvoice = ref(null)

const filteredInvoices = computed(() =>
  payment.value.invoices.filter(i => i.isClientDelete === false).reverse()
)
async function getInvoices(userId) {
  const response = await apiFetch(`/payment/get-invoice/${userId}`)
  payment.value = response.data
  console.log('payment history : ', payment.value);
  
}

async function deleteInvoices(invoiceId){
  try {
    isModalDeleteActive.value = false
    console.log(`delete ${invoiceId}`);
    
    const response = await apiFetch(`/payment/delete-invoice/${invoiceId}`,{
      method: 'DELETE'
    })
    sweetAlert.success(response.data.message)
  } catch (error) {
    sweetAlert.error(error.message)
  }

  
}
const openDetailInvoice = invoice => {
  selectedInvoice.value = invoice
  isActive.value = true
}
// const paymentUrl = url => {
//   window.location.href = url
// }
function formatDate(dateString) {
  const date = new Date(dateString)

  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

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
// const openDetailInvoice = (id)=>{
//   isActive.value = true
//   console.log(`test${id}`);

// }

// const reversedInvoices = computed(()=>{
//   return filteredInvoices.value
// })
onMounted(async () => {
  const userId = localStorage.getItem('userId')
  // console.log('userId : ', userId);

  await getInvoices(userId)
  console.log('invoice : ', payment.value)
})
</script>
<template>
  <div class="container">
    <!-- DATA ADA -->
    <template v-if="payment.invoices.length > 0">
      <CCard v-for="item in payment.invoices" :key="item.external_id" class="payment-card">
        <div class="card-accent"></div>
        <CCardBody @click="openDetailInvoice(item)">
          <div class="header">
            <span class="external-id-pill">{{ item.external_id }}</span>
            <span class="date">{{ formatDate(item.created) }}</span>
          </div>
          <div class="content">
            <div class="row">
              <span class="label">Status</span>
              <VChip :color="getStatusColor(item.status)" size="small" class="job-status-chip ms-2" variant="outlined">
                {{ item.status }}
              </VChip>
            </div>
            <div class="inv-divider"></div>
            <div class="row">
              <span class="label">Penerima</span>
              <span class="value">{{ item.merchant_name }}</span>
            </div>
            <div class="row">
              <span class="label">Tipe pembayaran</span>
              <span class="value">{{ item.type }} payment</span>
            </div>
            <div class="inv-footer">
              <div>
                <div class="total-label">Total Pembayaran</div>
                <div class="amount">Rp {{ item.amount.toLocaleString('id-ID') }}</div>
              </div>
              <div class="inv-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
              </div>
            </div>
          </div>
        </CCardBody>
      </CCard>

      <v-dialog
        v-model="isModalDeleteActive"
        max-width="400"
        persistent
      >
        <!-- <template v-slot:activator="{ props: activatorProps }">
          <v-btn v-bind="activatorProps">
            Open Dialog
          </v-btn>
        </template> -->

        <v-card
          prepend-icon="ri-delete-bin-line"
          text="Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running."
          title="Use Google's location service?"
        >
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn @click="isModalDeleteActive = false">
              Batal
            </v-btn>

            <v-btn class="bg-danger white" color="white" @click="deleteInvoices(selectedDeleteInvoice.external_id)">
              Hapus
            </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </template>

    <!-- DATA KOSONG -->
    <template v-else>
      <VRow
        class="empty-state"
        align="center"
        justify="center"
      >
        <VCol
          cols="12"
          class="text-center"
        >
          <h3>Kamu belum pernah melakukan Pembayaran 💵</h3>
          <p class="text-subtitle-2 text-grey-darken-1">Kalo Kamu sudah lakuin pembayaran cek disini ya!!</p>
        </VCol>
      </VRow>
    </template>

    <!-- DIALOG TETAP DI LUAR IF -->
    <VDialog
      v-model="isActive"
      transition="dialog-bottom-transition"
      width="500"
    >
      <VCard
        v-if="selectedInvoice"
        class="rounded-lg"
      >
        <VToolbar
          color="primary"
          class="px-4"
        >
          <VIcon
            icon="mdi-receipt-text-outline"
            class="mr-3"
          ></VIcon>
          <VToolbarTitle class="font-weight-bold">Detail Pembayaran</VToolbarTitle>
          <!-- <VSpacer></VSpacer> -->
          <!-- <VBtn icon="mdi-close" variant="text" @click="isActive = false"></VBtn> -->
        </VToolbar>

        <VCardText class="pa-6">
          <div class="d-flex justify-space-between align-center mb-6">
            <span class="text-subtitle-1 text-grey-darken-1">Status Transaksi</span>
            <VChip
              :color="getStatusColor(selectedInvoice.status)"
              class="font-weight-bold"
              variant="flat"
            >
              {{ selectedInvoice.status }}
            </VChip>
          </div>

          <VList
            lines="two"
            class="pa-0"
          >
            <VListItem class="px-0">
              <template v-slot:prepend>
                <VIcon color="primary">mdi-identifier</VIcon>
              </template>
              <VListItemTitle class="text-caption text-grey">Invoice ID</VListItemTitle>
              <VListItemSubtitle class="text-body-1 font-weight-medium text-black">
                {{ selectedInvoice.external_id }}
              </VListItemSubtitle>
            </VListItem>

            <VDivider class="my-1"></VDivider>

            <VListItem class="px-0">
              <template v-slot:prepend>
                <VIcon color="primary">mdi-storefront-outline</VIcon>
              </template>
              <VListItemTitle class="text-caption text-grey">Penerima</VListItemTitle>
              <VListItemSubtitle class="text-body-1 font-weight-medium text-black">
                {{ selectedInvoice.merchant_name }}
              </VListItemSubtitle>
            </VListItem>

            <VDivider class="my-1"></VDivider>

            <VListItem class="px-0">
              <template v-slot:prepend>
                <VIcon color="primary">mdi-storefront-outline</VIcon>
              </template>
              <VListItemTitle class="text-caption text-grey">Tipe Pembayaran</VListItemTitle>
              <VListItemSubtitle class="text-body-1 font-weight-medium text-black">
                {{ selectedInvoice.type }} payment
              </VListItemSubtitle>
            </VListItem>

            <VDivider class="my-1"></VDivider>

            <VListItem class="px-0">
              <template v-slot:prepend>
                <VIcon color="primary">mdi-storefront-outline</VIcon>
              </template>
              <VListItemTitle class="text-caption text-grey">Metode Pembayaran</VListItemTitle>
              <VListItemSubtitle class="text-body-1 font-weight-medium text-black">
                {{ selectedInvoice.payment_method }}
              </VListItemSubtitle>
            </VListItem>

            <VDivider class="my-1"></VDivider>

            <VListItem class="px-0">
              <template v-slot:prepend>
                <VIcon color="primary">mdi-cash-multiple</VIcon>
              </template>
              <VListItemTitle class="text-caption text-grey">Total Pembayaran</VListItemTitle>
              <VListItemSubtitle class="text-h6 font-weight-bold text-primary">
                Rp {{ selectedInvoice.amount.toLocaleString('id-ID') }}
              </VListItemSubtitle>
            </VListItem>

            <VDivider class="my-1"></VDivider>

            <VRow class="mt-2">
              <VCol cols="6">
                <div class="text-caption text-grey">Channel</div>
                <div class="text-body-2 font-weight-medium">{{ selectedInvoice.payment_channel }}</div>
              </VCol>
              <VCol cols="6">
                <div class="text-caption text-grey">Tanggal</div>
                <div class="text-body-2 font-weight-medium">{{ formatDate(selectedInvoice.created) }}</div>
              </VCol>
            </VRow>
          </VList>

          <div class="mt-6 pa-3 bg-grey-lighten-4 rounded border-dashed">
            <div class="text-caption text-grey mb-1">Deskripsi</div>
            <div class="text-body-2 italic">{{ selectedInvoice.description || '-' }}</div>
          </div>
        </VCardText>

        <VDivider></VDivider>

        <VCardActions class="pa-4 btn-container">
          <VBtn
            block
            color="primary"
            variant="elevated"
            size="large"
            @click="isActive = false"
          >
            Tutup
          </VBtn>
          <VBtn
            block
            v-show="selectedInvoice.status == 'PENDING'"
            color="primary"
            variant="elevated"
            size="large"
            target="_blank"
            @click="isActive = false"
            :href="selectedInvoice.url"
          >
            Bayar
          </VBtn>
          <VBtn
            block
            v-show="selectedInvoice.status == 'PAID' || selectedInvoice.status == 'SETTLED'"
            color="primary"
            variant="elevated"
            size="large"
            target="_blank"
            @click="isActive = false"
            :href="selectedInvoice.url"
          >
            Lihat Bukti Pembayaran
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
}

/* Tablet: 1 kolom */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    padding: 12px;
    gap: 12px;
  }
}

/* Mobile kecil */
@media (max-width: 480px) {
  .container {
    padding: 8px;
    gap: 10px;
  }
}

.empty-state {
  grid-column: 1 / -1;
  min-height: 60vh;
}

.payment-card {
  width: 100%;
  border-radius: 16px;
  border: 0.5px solid #e2d9ff;
  box-shadow: none;
  background: #ffffff;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.15s ease;
}

.payment-card:hover {
  transform: translateY(-2px);
}

/* Disable hover effect on touch devices */
@media (hover: none) {
  .payment-card:hover {
    transform: none;
  }
}

.card-accent {
  height: 4px;
  background: linear-gradient(90deg, #8d58ff, #b48aff);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.external-id-pill {
  font-size: 13px;
  font-weight: 500;
  color: #8d58ff;
  background: #f3eeff;
  padding: 4px 10px;
  border-radius: 20px;
  /* Prevent overflow on small screens */
  max-width: 60%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 480px) {
  .external-id-pill {
    font-size: 12px;
    max-width: 55%;
  }
}

.date {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .date {
    font-size: 11px;
  }
}

.inv-divider {
  height: 0.5px;
  background: #ede9fe;
  margin: 10px 0;
}

.content .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  font-size: 12px;
  color: #6b7280;
}

.value {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

@media (max-width: 480px) {
  .label {
    font-size: 11px;
  }

  .value {
    font-size: 12px;
  }
}

.inv-footer {
  margin-top: 14px;
  background: #f3eeff;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 480px) {
  .inv-footer {
    padding: 8px 12px;
  }
}

.total-label {
  font-size: 11px;
  color: #8d58ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount {
  font-size: 18px;
  font-weight: 600;
  color: #8d58ff;
}

@media (max-width: 480px) {
  .total-label {
    font-size: 10px;
  }

  .amount {
    font-size: 15px;
  }
}

.inv-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #8d58ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

:deep(.job-status-chip) {
  width: fit-content;
  min-width: unset;
  padding-inline: 8px;
}

.btn-container {
  display: flex;
  flex-direction: column;
}
</style>
