<script setup>
defineProps({
  data: {
    type: Array,
    required: true,
    // Contoh struktur item:
    // [{ title: '5Jt+', subtitle: 'pengunduhan sejak 2020', src: '...', alt: '...' }]
  },
});

import { onMounted } from 'vue';

onMounted(() => {
  let items1 = document.querySelectorAll('.content-1');

  items1.forEach((item) => {
    item.addEventListener('mousemove', (e) => {
      let positionPx = e.x - item.getBoundingClientRect().left;
      let PositionX = (positionPx / item.offsetWidth) * 100;

      let positionPy = e.y - item.getBoundingClientRect().top;
      let PositionY = (positionPy / item.offsetHeight) * 100;

      item.style.setProperty('--rX', 0.5 * (50 - PositionY) + 'deg');
      item.style.setProperty('--rY', 0.5 * (50 - PositionX) + 'deg');
    });

    item.addEventListener('mouseout', () => {
      item.style.setProperty('--rX', '0deg');
      item.style.setProperty('--rY', '0deg');
    });
  });
});

</script>

<template>
  <section class="main-content2">
    <div class="wrap" v-for="(item, index) in data" :key="index">
      <div class="content-1">
        <h3>{{ item.title }}</h3>
        <p class="subs">{{ item.subtitle }}</p>
        <img :src="item.src" :alt="item.alt" />
      </div>
    </div>
  </section>
  <p class="slogan" style="color: black;">Betulin memberdayakan pekerja dengan lebih mudah</p>
</template>

<style>
.main-content2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  place-items: center;
}
.main-content2 .wrap {
  width: 250px;
  
  transform-style: preserve-3d;
  transform: perspective(100rem);
  cursor: pointer;
}

.content-1 {
  --rX: 0deg;
  --rY: 0deg;
  width: 100%;
  background-color: #fff;
  border-radius: 20px;
  transform: rotateX(var(--rX)) rotateY(var(--rY));
  transition: 0.2s;
  padding: 20px;
  /* box-shadow: 0 30px 20px #5555; */
  box-shadow:
    10px 10px 15px #5555,
    /* Bayangan di kanan bawah */ -10px -10px 15px #5555;
}

.content-1 img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 30px 20px #5559;
}
.wrap .content-1 h3,
p {
  font-family: 'Poppins';
}
.slogan{
  font-family: 'Quicksand';
  font-size: 80px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .main-content2 {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .main-content2 .wrap {
    width: 80%; /* Biar nggak terlalu sempit */
    margin-inline: auto;
  }
  .slogan{
    font-size: 45px;
  }
}
@media(min-width: 769px){
    .main-content2 .wrap {
        margin-top: 15px;
    }
}
</style>
