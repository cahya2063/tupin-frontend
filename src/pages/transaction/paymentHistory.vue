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
  payment.value.invoices.filter(i => i.isClientDelete === false)
)
async function getInvoices(userId) {
  const response = await apiFetch(`/payment/get-invoice/${userId}`)
  payment.value = response.data
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

onMounted(async () => {
  const userId = localStorage.getItem('userId')
  // console.log('userId : ', userId);

  await getInvoices(userId)
  console.log('invoice : ', payment.value.invoices)
})
</script>
<template>
  <div class="container">
    <!-- DATA ADA -->
    <template v-if="filteredInvoices.length > 0">
      <CCard
        v-for="item in filteredInvoices"
        :key="item.external_id"
        class="payment-card"
      >
        <CCardBody @click="openDetailInvoice(item)">
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
              <span class="label">Penerima : </span>
              <span class="value">{{ item.merchant_name }}</span>
            </div>


            <div class="total-container mt-4 d-flex justify-space-between">

              <div class="row right">
                <span class="label">Total Pembayaran</span>
                <span class="value amount"> Rp {{ item.amount.toLocaleString('id-ID') }} </span>
              </div>
              <VBtn 
                    v-show="item.status == 'SETTLED'"
                    @click.stop="
                    selectedDeleteInvoice = item;
                    isModalDeleteActive = true" 
                    density="comfortable" icon="ri-delete-bin-line" color="error">
                    
              </VBtn>

              
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
.empty-state {
  grid-column: 1 / -1; /* Membuat elemen ini mengambil seluruh kolom */
  min-height: 60vh;
}
.payment-card {
  width: 100%;
  max-width: 500px;
  border-radius: 14px;
  border: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  background: #ffffff;
  cursor: pointer;
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
.btn-container {
  display: flex;
  flex-direction: column;
}
</style>
