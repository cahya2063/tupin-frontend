<script setup>
import logo from '@images/logos/logo-fixify-clear.png'

</script>

<template>
  <div class="navbar">
    <img
      class="logo-navbar"
      :src="logo"
      alt="logo"
      width="300"
    />
    
  </div>

  <!-- Sidebar (mobile only) -->
  

  
</template>

<style scoped>
/* === Umum === */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  flex-wrap: wrap;
}

.logo-navbar {
  max-width: 100px;
}


</style>
