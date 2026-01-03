<script setup>
import UpgradeToPro from '@/components/UpgradeToPro.vue'
import TemplateFooter from './views/TemplateFooter.vue'
</script>

<template>
  <RouterView />

  <!-- Teleport footer ke <footer> di index.html -->
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap');
* {
  font-family: 'Quicksand', sans-serif;
}
a {
  text-decoration: none;
}
</style>
