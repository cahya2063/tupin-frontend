<script setup>
import MultiStepForm from '@/components/form/MultiStepForm.vue'
import DemoFormLayoutHorizontalForm from '@/views/pages/form-layouts/DemoFormLayoutHorizontalForm.vue'
import DemoFormLayoutHorizontalFormWithIcons from '@/views/pages/form-layouts/DemoFormLayoutHorizontalFormWithIcons.vue'
import DemoFormLayoutMultipleColumn from '@/views/pages/form-layouts/DemoFormLayoutMultipleColumn.vue'
import DemoFormLayoutVerticalForm from '@/views/pages/form-layouts/DemoFormLayoutVerticalForm.vue'
import DemoFormLayoutVerticalFormWithIcons from '@/views/pages/form-layouts/DemoFormLayoutVerticalFormWithIcons.vue'
// import { Vueform } from '@vueform/vueform/dist/vueform'
</script>

<template>
  <div class="title">
    perbaiki barangmu di sini
  </div>
    <div class="form">

      <MultiStepForm/>
    </div>
    
</template>
<style scoped>
  .title{
    font-size: 40px;
    font-weight: 700;
    margin-bottom: 40px;
  }
</style>
