<script setup>
import TemplateFooter from '@/views/TemplateFooter.vue'
import craftManImage from '@assets/login/image.png'
</script>
<template>
  <div class="login-container">
    <div class="left-content">
      <img
        :src="craftManImage"
        alt=""
        width="300px"
        class="login-image"
      />
      <p
        class="teks-login-1"
        style="color: black"
      >
        Fixify
      </p>
      <p
        class="teks-login-2"
        style="color: black"
      >
        Menghubungkan pelanggan dengan teknisi profesional untuk perbaikan.
      </p>
    </div>
    <div class="right-content">
      <RouterView />
    </div>
  </div>
  <footer class="footer">
    <TemplateFooter />
  </footer>
</template>

<style scoped>
.login-container {
  display: flex;
  width: 70%;
  max-height: calc(100vh - 100px);
  background-color: white;
  margin-inline: auto;
  margin-block: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* tambahkan ini */
  border-radius: 15px;
  overflow: hidden;
}
.login-image {
  margin: 25px;
}
.left-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* kalau mau di tengah vertikal juga */
}
.teks-login-1 {
  display: flex;
  margin-inline: auto;
  font-family: 'Quicksand';
  font-size: 25px;
  font-weight: 700;
  width: 75px;
}
.teks-login-2 {
  width: 300px;
  font-family: 'Quicksand';
  text-align: center;
  color: rgb(90, 109, 109);
}

.right-content {
  min-width: 0;
  max-height: calc(100vh - 100px);
  flex-grow: 1;
  align-content: center;
  overflow-y: auto;
  padding-block: 20px;
}

.right-content::-webkit-scrollbar {
  width: 8px;
}

.right-content::-webkit-scrollbar-thumb {
  background-color: rgba(141, 88, 255, 0.35);
  border-radius: 999px;
}

.right-content::-webkit-scrollbar-track {
  background-color: rgba(141, 88, 255, 0.08);
}

form {
  margin-top: 50px;
}
@media (max-width: 1160px) {
  .left-content {
    display: none;
  }
  .container-form {
    width: 100%;
  }
  .login-container {
    width: 90%;
  }
}

@media (max-width: 640px) {
  .login-container {
    max-height: calc(100vh - 32px);
    margin-block: 16px;
  }

  .right-content {
    max-height: calc(100vh - 32px);
    padding-block: 14px;
  }
}
</style>
