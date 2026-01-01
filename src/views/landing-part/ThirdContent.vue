<script setup>
import gearImage from '@assets/landing-page/setting.png'
import TemplateStrength from '@/components/landing-page/TemplateStrength.vue'
import jobSeek from '@assets/landing-page/third-content/job.png'
import mechanics from '@assets/landing-page/third-content/mechanic-right.png'
import sosImage from '@assets/landing-page/third-content/sos.png'
import leakImage from '@assets/landing-page/third-content/leak.png'
document.addEventListener('scroll', e => {
  const gear = document.querySelector('.gear')
  gear.style.transform = `rotate(${window.scrollY / 5}deg)` // Ubah transform ke rotasi
})
</script>

<template>
  <div
    class="flex-container"
    style="color: black"
  >
    <div class="left-content">
      <p class="text-left-content">ada apa aja sih di betulin?</p>
      <img
        :src="gearImage"
        alt=""
        class="gear"
        width="400px"
      />
    </div>
    <div class="right-content">
      <TemplateStrength
        :src="jobSeek"
        alt="Icon lowongan kerja"
        width="75px"
        text="Selalu membutuhkan tenaga kerja berpengalaman"
      />
      <TemplateStrength
        :src="mechanics"
        alt="Icon teknisi"
        width="75px"
        text="Jangan khawatir projek anda ada di tangan yang tepat"
      />
      <TemplateStrength
        :src="sosImage"
        alt="Icon SOS"
        width="75px"
        text="selalu siap disaat ada keperluan dadakan"
      />
      <TemplateStrength
        :src="leakImage"
        alt="Icon SOS"
        width="75px"
        text="beritahu kami jika mengalami kerusakan pada alatmu akan kami hampiri"
      />
    </div>
  </div>
</template>

<style scoped>
.gear {
  opacity: 0.5;
}
.flex-container {
  display: flex;
  width: 100%;
  margin-inline: auto;
  margin-block: 50px;
  justify-content: center;
  align-items: center;
}
.text-left-content {
  font-size: 40px;
  margin: 0px;
}
.left-content {
  display: flex;
  flex-direction: column; /* atau row, sesuai kebutuhan */
  justify-content: center;
  align-items: center;
  text-align: center; /* opsional, biar teks juga rata tengah */
}
.right-content {
  display: flex;
  flex-direction: column;
}
@media (max-width: 1122px) {
  .flex-container {
    flex-direction: column;
  }
}
</style>
