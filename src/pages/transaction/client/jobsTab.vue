<script setup>
import WarrantyRequest from '../warrantyRequest.vue';
import PostedJob from './postedJob.vue';


const route = useRoute()
const activeTab = ref(route.params.tab)
console.log('active tab : ', activeTab);
const role = localStorage.getItem('role')


const tabs = [
  
  {
    title: 'Riwayat Perbaikan',
    icon: 'ri-hourglass-line',
    tab: 'postedJob-history',
  },
  {
    title: 'Pengajuan Garansi',
    icon: 'ri-hourglass-line',
    tab: 'warranty-history',
  },
]

</script>

<template>
  <div>
    <VTabs
      v-model="activeTab"
      show-arrows
      mobile-breakpoint="0"
      class="v-tabs-pill"
    >
    <!-- panah kiri -->
      <template #prev>
        <button class="tab-arrow left">
          <i class="ri-arrow-left-s-line"></i>
        </button>
      </template>

      <!-- panah kanan -->
      <template #next>
        <button class="tab-arrow right">
          <i class="ri-arrow-right-s-line"></i>
        </button>
      </template>
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


      <!-- riwayat perbaikan -->
      <VWindowItem value="postedJob-history">
        <PostedJob></PostedJob>
      </VWindowItem>
      

      <!-- wallet -->
      <VWindowItem value="warranty-history">
        <WarrantyRequest></WarrantyRequest>
      </VWindowItem>


    </VWindow>
  </div>
</template>

<style scoped>
.custom-tabs.v-tab--selected {
  background-color: #8d58ff;
  color: white;
}

/* Memaksa panah navigasi tab muncul di tampilan mobile */
@media (max-width: 600px) {
  :deep(.v-slide-group__prev),
  :deep(.v-slide-group__next) {
    display: flex !important;
  }
}
</style>
