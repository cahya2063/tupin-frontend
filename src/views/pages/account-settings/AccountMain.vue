<script setup>
import JobHistory from './JobHistory.vue';
import TechnicianDetail from './TechnicianDetail.vue';

const route = useRoute()
const activeTab = ref(route.params.tab)
console.log('active tab : ', activeTab);


const tabs = [
  {
    title: 'Akun',
    icon: 'ri-group-line',
    tab: 'account',
  },
  {
    title: 'Riwayat Pekerjaan',
    icon: 'ri-hourglass-line',
    tab: 'work-history',
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
      <!-- technician detail -->
      <VWindowItem value="account">
        <TechnicianDetail :technicianId="route.params.id"/>
      </VWindowItem>

      <!-- job history -->
      <VWindowItem value="work-history">
        <JobHistory />
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
