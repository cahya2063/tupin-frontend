<script setup>
import DefaultLayoutWithVerticalNav from './components/DefaultLayoutWithVerticalNav.vue'
import ClientLayout from './components/ClientLayout.vue'

const role = localStorage.getItem('role')
const isClient = role === 'client'
</script>

<template>
  <!-- Client: bottom navigation layout (no sidebar) -->
  <ClientLayout v-if="isClient">
    <RouterView />
  </ClientLayout>

  <!-- Technician / others: sidebar layout -->
  <DefaultLayoutWithVerticalNav v-else>
    <RouterView />
  </DefaultLayoutWithVerticalNav>
</template>

<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use '@layouts/styles/default-layout';
</style>
