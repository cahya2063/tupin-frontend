<script setup>
import downloadImage from '@assets/landing-page/download.gif'
import technicianImage from '@assets/landing-page/technician.gif'
import handShakeImage from '@assets/landing-page/handshake.gif'
import launch from '@assets/landing-page/launch.gif'
import TemplateSecondContent from '@/components/landing-page/TemplateSecondContent.vue'
import TemplateSlider from '@/components/landing-page/TemplateSlider.vue'

const statistics = [
  {
    title: '5Jt+',
    subtitle: 'pengunduhan sejak 2020',
    src: downloadImage,
    alt: 'Gambar download',
  },
  {
    title: '30Ribu+',
    subtitle: 'Teknisi ahli',
    src: technicianImage,
    alt: 'Gambar teknisi',
  },
  {
    title: '100Ribu+',
    subtitle: 'Mitra terpercaya',
    src: handShakeImage,
    alt: 'Gambar mitra',
  },
  {
    title: '30Ribu+',
    subtitle: 'Lonjakan pengunduhan dari tahun 2020 ke 2024',
    src: launch,
    alt: 'Gambar roket',
  },
]
</script>

<template>
  <div class="wrap">
    <TemplateSecondContent :data="statistics"></TemplateSecondContent>
  </div>
  <TemplateSlider></TemplateSlider>
</template>

<style scoped>
.wrap {
  margin-block: 40px;
}
</style>
