<script setup>
import MultiStepForm from '@/components/form/MultiStepForm.vue'
import { useRoute } from 'vue-router'
// import { Vueform } from '@vueform/vueform/dist/vueform'

const route = useRoute()
const technicianId = route.params.technicianId
</script>

<template>
  <div class="title">perbaiki barangmu di sini</div>
  <div class="form">
    <MultiStepForm :technician-id="technicianId" />
  </div>
</template>
<style scoped>
.title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 40px;
}
</style>
