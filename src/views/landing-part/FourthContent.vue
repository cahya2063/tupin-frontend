<script setup>
import sandClockImage from '@assets/landing-page/fourth-content/sand-clock.png'
import locationImage from '@assets/landing-page/fourth-content/location.png'
import medalImage from '@assets/landing-page/fourth-content/medal.png'
import hoursImage from '@assets/landing-page/fourth-content/24-hours.png'
import partnerImage from '@assets/landing-page/fourth-content/partner.png'
import indonesiaImage from '@assets/landing-page/fourth-content/indonesia.png'


import { onMounted } from 'vue'

onMounted(() => {
  const prev = document.getElementById('prev')
  const next = document.getElementById('next')
  const image = document.querySelector('.images')
  const contents = document.querySelectorAll('.content .item')
  const items = document.querySelectorAll('.images .item')

  let rotate = 0
  let active = 0
  const counItem = items.length
  const rotateAdd = 360 / counItem

  function show(){
    image.style.setProperty('--rotate', rotate + 'deg')
    contents.forEach((content, key)=>{
      if (key == active) {
        content.classList.add('active')
      } else {
        content.classList.remove('active')
      }
    })
  }

  function nextSlider(){
    active = active + 1 > counItem - 1 ? 0 : active + 1
    rotate += rotateAdd
    show()
  }
  next.onclick = nextSlider

  function prevSlider(){
    active = active - 1 < 0 ? counItem -1 : active -1
    rotate -= rotateAdd
    show()
  }
  prev.onclick = prevSlider

  show() // Tampilkan slide pertama saat mount

  const autoNext = setInterval(nextSlider, 15000)

  // mousemove efek
  const items1 = document.querySelectorAll('.content-1')
  items1.forEach(item =>{
    item.addEventListener('mousemove', (e)=>{
      let positionPx = e.x - item.getBoundingClientRect().left
      let PositionX = (positionPx / item.offsetWidth)*100
      let positionPy = e.y - item.getBoundingClientRect().top
      let PositionY = (positionPy / item.offsetHeight)*100
      item.style.setProperty('--rX', (0.5)*(50 - PositionY)+ 'deg')
      item.style.setProperty('--rY', (0.5)*(50 - PositionX)+ 'deg')
    })
    item.addEventListener('mouseout', ()=>{
      item.style.setProperty('--rX', '0deg')
      item.style.setProperty('--rY', '0deg')
    })
  })
})

</script>

<template>
<div class="slider">
    <div class="title">
      kenapa betulin?
    </div>
    <!-- ==========content deskripsi========== -->
    <div class="content">
      <!-- ========content 6 item======= -->
      <div class="item active">
        <h1>Dampak perekonomian</h1>
        <div class="desc">
           kontribusi pada perekonomian Indonesia. Mulai dari kemudahan dalam mengelola bisnis hingga mempercepat proses layanan, aplikasi ini membantu usaha kecil dan menengah berkembang lebih cepat. Dengan begitu, peluang usaha dan lapangan kerja baru pun terbuka lebih luas.
        </div>
        <button>selengkapnya</button>
      </div>

      <div class="item">
        <h1>Kemitraan</h1>
        <div class="desc">
           kemitraan dengan banyak pengusaha perbaikan berpengalaman. Dengan layanan yang terintegrasi, pengguna dapat mengakses ahli terbaik di bidangnya, sehingga mempercepat pertumbuhan usaha kecil dan menengah serta menciptakan lebih banyak lapangan kerja.
        </div>
        <button>selengkapnya</button>
      </div>

      <div class="item">
        <h1>Pelayanan</h1>
        <div class="desc">
          tersedia layanan perbaikan 24 jam, sehingga pelanggan dapat mengandalkan dukungan kapan pun diperlukan. Dengan kemitraan bersama pengusaha perbaikan berpengalaman dan akses layanan yang terus-menerus, aplikasi ini menawarkan solusi yang cepat dan efisien untuk berbagai kebutuhan pelanggan.
        </div>
        <button>selengkapnya</button>
      </div>

      <div class="item">
        <h1>No. 1</h1>
        <div class="desc">
           nomor satu di Banyuwangi, dengan pelayanan 24 jam dan dukungan dari pengusaha perbaikan berpengalaman. Aplikasi ini memberikan solusi terbaik dan paling dapat diandalkan untuk berbagai kebutuhan perbaikan, memastikan setiap masalah ditangani dengan cepat dan profesional.
        </div>
        <button>selengkapnya</button>
      </div>

      <div class="item">
        <h1>penjemputan</h1>
        <div class="desc">
           menawarkan layanan penjemputan barang rusak yang akan diperbaiki, sehingga pelanggan tidak perlu repot-repot mengantarkan barang ke tempat perbaikan. Dengan layanan ini, kenyamanan dan kemudahan menjadi prioritas, membuat proses perbaikan menjadi lebih efisien dan bebas hassle.
        </div>
        <button>selengkapnya</button>
      </div>

      <div class="item">
        <h1>Menghemat waktu</h1>
        <div class="desc">
          anda tidak perlu lagi mencari tempat perbaikan terbaik. Semua sudah terintegrasi dalam sistem, sehingga pelanggan bisa langsung mendapatkan layanan dari pengusaha perbaikan yang berpengalaman tanpa harus repot membandingkan pilihan.
          
        </div>
        <button>selengkapnya</button>
      </div>
    </div>
    <!-- =============content images============= -->
    <div class="images">
      <div class="item" style="--i: 1">
        <img :src="sandClockImage">
      </div>
      <div class="item" style="--i: 2">
        <img :src="locationImage">
      </div>
      <div class="item" style="--i: 3">
        <img :src="medalImage">
      </div>
      <div class="item" style="--i: 4">
        <img :src="hoursImage">
      </div>
      <div class="item" style="--i: 5">
        <img :src="partnerImage">
      </div>
      <div class="item" style="--i: 6">
        <img :src="indonesiaImage">
      </div>
    </div>

    <button id="prev"><</button>
    <button id="next">></button>
  </div>
</template>

<style scoped>
.slider{
    margin-top: 50px;
  position: relative;
  top: 10px;
  width: 100%;
  height: 100vh;
  background-image: white;
  overflow: hidden;
  margin-bottom: 20px;
}
.slider::before{
  position: absolute;
  width: 50%;
  height: 100vh;
  content: '';
  top: 0;
  left: 0;
  background-color: white;
}
.slider .title{
  font-family: 'Pacifico', cursive;
  position: absolute;
  top: 5%;
  right: 60%;
  text-align: right;
  color: #AA38D1;
  font-size: 150px;
  width: 40%;
  line-height: .9em;
  text-shadow: 3px 5px 0 #FC79FF;
  transform: rotate(-5deg);
}
.slider .content{
  color: #ffffff;
  position: absolute;
  top: 10%;
  left: 60%;
  text-align: justify;
  width: 350px;
}

.slider .content h1{
  color: #e88735;
  font-size: xx-large;
}

.slider .content button{
  margin-top: 20px;
  padding: 10px 30px;
  border-radius: 20px;
  background-color: #e88735;
  color: #ffffff;
  border: none;
  float: right;
}

.content .item{
  display: none;
}
.content .item.active{
  display: block;
}
@keyframes showContent{
  from {
    opacity: 0;
    transform: translateY(100px);
  }to { 
    opacity: 1;
    transform: translateY(0);
  }
}
.content .item.item.active h1{
  opacity: 0;
  animation: showContent .5s ease-in-out 1 forwards;
}
.content .item.item.active .desc{
  opacity: 0;
  color: black;
  font-family: 'Poppins';
  animation: showContent .5s .3s ease-in-out 1 forwards;
}
.content .item.item.active button{
  opacity: 0;
  animation: showContent .5s .6s ease-in-out 1 forwards;
}
.images{
  position: absolute;
  bottom: -10%;
  left: 50%;
  --rotate: 0deg;
  transform: translate(-50%, 50%) rotate(var(--rotate));
  width: 1300px;
  height: 1300px;
  border-radius: 50%;
  transition: transform 0.5s ease-in-out;
  outline: 4px dashed gray;
  outline-offset: -100px;
}

.images .item {
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;
  /* transform: rotate(calc(60deg * var(--i))) translateY(-250px);  */
  rotate: calc(60deg * var(--i));
  /* transform-origin: 20% 20%; */
}

.images .item img {
  height: 350px;
}

#prev, #next{
position: absolute;
border: none;
top: 50%;
left: 500px;
font-size: 100px;
font-family: cursive;
background-color: transparent;
color: black;
font-weight: bold;
opacity: 0.3;
}

#next{
left: unset;
right: 500px;
}
#prev:hover, #next:hover{
opacity: 1;
}
@media(max-width: 1427px){
    .slider{
        display: none;
    }
}
</style>