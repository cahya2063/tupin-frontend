<script setup>
import FirstContent from '@/views/landing-part/FirstContent.vue'
import SecondContent from '@/views/landing-part/SecondContent.vue'
import ThirdContent from '@/views/landing-part/ThirdContent.vue'
import FourthContent from '@/views/landing-part/FourthContent.vue'
import Navbar from '@/views/Navbar.vue'
import TemplateFooter from '@/views/TemplateFooter.vue'
</script>

<template>
  <div class="landing-page">
    <Navbar />
    <main class="landing-content">
      <FirstContent />
      <SecondContent />
      <ThirdContent />
      <FourthContent />
    </main>
    <footer class="footer">
      <TemplateFooter />
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  font-family: 'Quicksand', 'Poppins', sans-serif;
  background-color: #ffffff;
  color: #171421;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: hidden;
  padding-top: 20px;
}

.footer {
  margin-top: auto;
}
</style>
