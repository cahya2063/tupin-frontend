<script setup>
import cameraImage from '@assets/landing-page/img-slider/camera.png'
import historyImage from '@assets/landing-page/img-slider/history.png'
import mapImage from '@assets/landing-page/img-slider/map.png'

import { ref, computed } from 'vue'
const contentData = {
  desc: {
    text: 'HistoryLens adalah aplikasi cerdas yang memindai foto tempat wisata dan menampilkan informasi sejarah dan letak wilayahnya. Cocok untuk traveler, pelajar, dan pecinta budaya, HistoryLens mengubah pengalaman berkunjung menjadi perjalanan waktu yang interaktif, edukatif, dan menyenangkan, cukup dengan satu jepretan kamera.',
    image: historyImage,
  },
  scan: {
    text: 'Fitur scan memudahkan pengguna untuk memotret candi atau objek wisata, lalu secara otomatis menampilkan informasi lengkap tentang lokasi di peta. Selain itu, pengguna juga dapat mengetahui cerita sejarah, latar belakang budaya, serta fakta menarik dan tersembunyi yang ada di balik tempat tersebut hanya dengan satu klik.',
    image: cameraImage,
  },
  history: {
    text: 'Jelajahi kisah sejarah dari setiap lokasi wisata, termasuk latar belakang kerajaan yang pernah berjaya, keunikan arsitektur kuno, hingga beragam mitos lokal yang menyertainya. Setiap tempat menyimpan cerita menarik yang memperkaya pengalaman berkunjung dan memberikan perspektif budaya yang lebih dalam bagi para pengunjung.',
    image: mapImage,
  },
}

const currentKey = ref('desc')

const currentContent = computed(() => contentData[currentKey.value])

function switchContent(key) {
  currentKey.value = key
}
</script>

<template>
  <div
    class="container-slider"
    style="color: black"
  >
    <div class="switch-image-container">
      <img
        :src="currentContent.image"
        alt=""
        class="img-description"
      />
    </div>
    <div class="container-switch">
      <div class="btn-container">
        <button
          type="button"
          class="switch-btn"
          :class="{ active: currentKey === 'desc' }"
          @click="switchContent('desc')"
        >
          Deskripsi
        </button>
        <button
          type="button"
          class="switch-btn"
          :class="{ active: currentKey === 'scan' }"
          @click="switchContent('scan')"
        >
          Scan
        </button>
        <button
          type="button"
          class="switch-btn"
          :class="{ active: currentKey === 'history' }"
          @click="switchContent('history')"
        >
          Sejarah
        </button>
      </div>
      <div class="switch-teks">
        {{ currentContent.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-slider {
  width: 70%;
  display: flex;
  margin-inline: auto;
}
.switch-image-container {
  width: 400px;
  margin-inline: auto;
}
.img-description {
  width: 100%;
  border: 2px solid black;
  border-radius: 10px;
}

.img-description,
.switch-teks {
  font-size: 17px;
  transition: opacity 0.5s ease-in-out;
  opacity: 1;
}

.fade-out {
  opacity: 0;
}

.fade-in {
  opacity: 1;
}

.container-switch {
  display: flex;
  flex-direction: column;
}

.btn-container {
  display: flex;
  flex-direction: row;
  width: 400px;
  height: 60px;
  background-color: white;
  border-radius: 40px;
  margin-inline: 20px;
  box-shadow: 0.5px 0.5px 5px grey inset;
  margin-inline: auto;
}
.switch-btn {
  flex-grow: 1;
  height: 40px;
  margin-block: auto;
  margin-inline: 5px;
  border-radius: 20px;
  background-color: rgba(245, 246, 249, 0.5);
  border-radius: 100px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 8px 0px inset;
  opacity: 1;
  font-family: 'Poppins';
  font-weight: 500;
  font-size: 17px;
  font-style: normal;
}
.switch-btn.active {
  border: none;
  box-shadow:
    0px 0px 7px orangered,
    /* Bayangan di kanan bawah */ -0px -0px 7px orangered;
}

.switch-teks {
  width: 400px;
  margin-inline: auto;
  text-align: justify;
  margin-block: 10px;
}

@media (max-width: 1302px) {
  .container-slider {
    width: 80%;
    flex-direction: column;
  }
}
@media (max-width: 524px) {
  .container-slider {
    flex-direction: column;
    width: 100%;
  }

  .switch-image-container,
  .container-switch,
  .btn-container,
  .switch-teks {
    width: 100%;
  }
}
</style>
