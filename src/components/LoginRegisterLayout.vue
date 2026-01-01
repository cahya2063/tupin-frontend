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
        Lorem ipsum dolor sit amet.
      </p>
      <p
        class="teks-login-2"
        style="color: black"
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit amet earum fugit
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
  height: auto;
  background-color: white;
  margin-inline: auto;
  margin-block: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* tambahkan ini */
  border-radius: 15px;
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
  margin-block: 0px;
  font-family: 'Quicksand';
  font-size: 25px;
  font-weight: 700;
  width: 300px;
  text-align: center;
}
.teks-login-2 {
  width: 300px;
  text-align: center;
  color: rgb(90, 109, 109);
}

.right-content {
  flex-grow: 1;
  align-content: center;
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
</style>
