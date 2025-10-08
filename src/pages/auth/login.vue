<!-- views/Login.vue -->
<!-- views/Login.vue -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import TemplateForm from '@/components/form/TemplateForm.vue'
import TemplateButton from '@/components/form/TemplateButton.vue'
import TemplateAlertFailed from '@/components/alert/TemplateAlertFailed.vue'
import TemplateAlertSuccess from '@/components/alert/TemplateAlertSuccess.vue'
import { apiFetch } from '@/utils/api'

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

    const response = await apiFetch(`/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })
    const result = response.data
    alertMessage.value = result.message
    statusCode.value = response.status
    
    
    if (response.status === 200 && result.token) {
      localStorage.setItem('token', result.token)
      localStorage.setItem('userId', result.data.id)
      localStorage.setItem('role', result.data.role)
      // alertMessage.value = response.data.message
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <div class="container-form">
    <p class="teks-login-3">Login Aplikasi</p>
    <TemplateAlertSuccess v-show="statusCode == 200" :message="alertMessage" :duration="5"/>
    <TemplateAlertFailed v-show="statusCode != 200" :message="alertMessage" :duration="5"/>

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
