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
    <FirstContent />
    <SecondContent></SecondContent>
    <ThirdContent></ThirdContent>
    <FourthContent></FourthContent>
  </div>
  <footer class="footer">
    <TemplateFooter />
  </footer>
  <!-- <teleport to="footer">
    </teleport> -->
</template>

<style scoped>
.landing-page {
  width: 85%;
  margin-inline: auto;
  margin-top: 20px;
}
</style>
