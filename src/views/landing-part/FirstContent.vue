<script setup>
import gambar from '@assets/landing-page/image.png';
</script>

<template>
  <div class="first-content">
    <div class="left-content">
      <p class="text-1" style="color: black;">Sebuah cara baru</p>
      <p class="text-2" style="color: black;">Untuk bekerja</p>
      <p class="text-3" style="color: black;">
        Kelola dan kembangkan tenaga kerja anda <br />secara fleksible di — satu
        platform
      </p>
    </div>
    <div class="right-content">
      <img :src="gambar" alt="" class="image-right-content" />
    </div>
  </div>
  <div class="subs">
    <p class="p-subs" style="color: black;">

        Dipercaya lebih dari <b>10k+</b> pencari kerja dan <b>20k+</b> pengguna
    </p>
  </div>
</template>

<style scoped>


.first-content {
  display: flex;
  /* align-items: center; */
  margin-inline: 20px;
}
.left-content {
  margin-top: 80px;
}
.right-content {
  display: flex;
  align-items: center;   /* ⬅️ Ini memastikan gambar juga align tengah */
  justify-content: right; /* Opsional: Biar gambar ke tengah horizontal */
  width: 100%;
}
.text-1,
.text-2 {
  margin: 0;
}
.text-1 {
  font-family: 'Poppins';
  font-size: 80px;
  font-weight: 900;
}
.text-2 {
  font-family: 'Lora';
  font-size: 70px;
}
.text-3 {
  font-size: 28px;
}
.subs {
  display: flex;
  margin-inline: auto;
}
.p-subs{
    margin-inline: auto;
}
.image-right-content {
  display: flex;
  width: 500px;
  /* margin-inline: auto; */
  
}
@media (max-width: 862px) {
  .first-content {
    flex-direction: column;
  }
  .text-1 {
    font-size: 60px;
  }
  .text-2 {
    font-size: 40px;
  }
}

@media (max-width: 530px) {
  .image-right-content {
    width: 400px;
  }
}
@media (max-width: 450px) {
  .image-right-content {
    width: 300px;
  }
}
</style>
