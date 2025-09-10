<!-- views/Login.vue -->
<!-- views/Login.vue -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import TemplateForm from '@/components/form/TemplateForm.vue'
import TemplateButton from '@/components/form/TemplateButton.vue'
import TemplateAlertFailed from '@/components/alert/TemplateAlertFailed.vue'
import TemplateAlertSuccess from '@/components/alert/TemplateAlertSuccess.vue'

const baseUrl = import.meta.env.VITE_API_URL

const email = ref('')
const password = ref('')
const alertMessage = ref('')
const statusCode = ref(null)

const router = useRouter()

async function loginUser() {
  try {
    alertMessage.value = ''
    statusCode.value = null

    const response = await fetch(`${baseUrl}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    statusCode.value = response.status
    const result = await response.json()
    alertMessage.value = result.message

    if (response.status === 200 && result.token) {
      localStorage.setItem('token', result.token)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <div class="container-form">
    <p class="teks-login-3">Login Aplikasi</p>

    <TemplateAlertFailed v-if="statusCode === 400" :message="alertMessage" :duration="5"/>
    <TemplateAlertSuccess v-else-if="statusCode === 200" :message="alertMessage" :duration="5"/>

    <p>
      Belum punya akun?
      <RouterLink to="/register" class="router">Daftar</RouterLink>
    </p>

    <form @submit.prevent="loginUser" method="post">
      <TemplateForm v-model="email" name="email" type="email" width="65%" placeholder="Masukkan emailmu..." />
      <TemplateForm v-model="password" name="password" type="password" width="65%" placeholder="Masukkan passwordmu..." />
      <br />
      <TemplateButton content="Login" width="66%" height="50px" />
    </form>
  </div>
</template>

<style scoped>
.container-form{
    display: flex;
    flex-direction: column;
    margin-block: auto;
    width: 95%;
    height: 480px;
    background-color: #dae0e461;
    margin-inline: auto;
    border-radius: 15px;
    text-align: center;
    padding-top: 30px;
}
.teks-login-3{
    margin-block: 20px;
    font-size: 20px;
    color: black;
}
.router{
    text-decoration: none;
}
</style>
