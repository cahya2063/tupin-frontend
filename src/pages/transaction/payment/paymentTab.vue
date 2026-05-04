<script setup>
import DisbursementsHistory from './disbursementsHistory.vue';
import PaymentHistory from './paymentHistory.vue';
import TransferMoneyIn from './transferMoneyIn.vue';
import Wallet from './wallet.vue';

const route = useRoute()
const activeTab = ref(route.params.tab)
console.log('active tab : ', activeTab);
const role = localStorage.getItem('role')


const tabs = [
  {
    title: 'Wallet',
    icon: 'ri-hourglass-line',
    tab: 'wallet',
  },
  ...(role !== 'technician' ? [{
    title: 'Tagihan',
    icon: 'ri-group-line',
    tab: 'invoices',
  }] : []),
  {
    title: 'Riwayat Penarikan',
    icon: 'ri-hourglass-line',
    tab: 'disbursements-history',
  },
  {
    title: 'Transfer',
    icon: 'ri-hourglass-line',
    tab: 'transfer-history',
  },
]

</script>

<template>
  <div>
    <VTabs
      v-model="activeTab"
      show-arrows
      class="v-tabs-pill"
    >
      <VTab
        v-for="item in tabs"
        :key="item.icon"
        :value="item.tab"
        class="custom-tabs"
      >
        <VIcon
          size="20"
          start
          :icon="item.icon"
        />
        {{ item.title }}
      </VTab>
    </VTabs>

    <VWindow
      v-model="activeTab"
      class="mt-5 disable-tab-transition"
      :touch="false"
    >
      <!-- Tagihan -->
      <VWindowItem value="invoices" v-if="role === 'client'">
        <PaymentHistory></PaymentHistory>
      </VWindowItem>

      <!-- riwayat penarikan -->
      <VWindowItem value="disbursements-history">
        <DisbursementsHistory></DisbursementsHistory>
      </VWindowItem>
      
      <!-- wallet -->
      <VWindowItem value="wallet">
        <Wallet></Wallet>
      </VWindowItem>

      <!-- wallet -->
      <VWindowItem value="transfer-history">
        <TransferMoneyIn></TransferMoneyIn>
      </VWindowItem>


    </VWindow>
  </div>
</template>

<style scoped>
.custom-tabs.v-tab--selected {
  background-color: #8d58ff;
  color: white;
}
</style>
