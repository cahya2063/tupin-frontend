<script setup>
import TemplateForm from '@/components/form/TemplateForm.vue'
import TemplateButton from '@/components/form/TemplateButton.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TemplateAlertFailed from '@/components/alert/TemplateAlertFailed.vue'
import TemplateAlertSuccess from '@/components/alert/TemplateAlertSuccess.vue'
import { apiFetch } from '@/utils/api'

const name = ref('')
const email = ref('')
const password = ref('')
const alertMessage = ref('')
const statusCode = ref(null)
const router = useRouter()
async function registerUser() {
  try {
    alertMessage.value = ''
    statusCode.value = null
    const response = await apiFetch(`/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nama: name.value,
        email: email.value,
        password: password.value
      })
    })

    const result = response.data
    alertMessage.value = result.message
    statusCode.value = response.status

    // kalau berhasil (status 201), redirect ke /login
    if (response.status === 201) {
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }

  } catch (error) {
    console.error('Error:', error)
    alertMessage.value = 'Terjadi kesalahan di server'
    statusCode.value = 500
  }
}
</script>

<template>
  <div class="container-form">
    <p class="teks-register-3">Registrasi</p>

    <!-- alert kondisi -->
    <TemplateAlertSuccess v-show="statusCode == 201" :message="alertMessage" :duration="5"/>
    <TemplateAlertFailed v-show="statusCode != 201" :message="alertMessage" :duration="5"/>

    <p>
      Sudah punya akun?
      <RouterLink to="/login" class="router">Login</RouterLink>
    </p>

    <!-- form registrasi -->
    <form @submit.prevent="registerUser" method="post">
      <TemplateForm v-model="name" name="name" type="text" width="65%" placeholder="Nama lengkap" />
      <TemplateForm v-model="email" name="email" type="email" width="65%" placeholder="Email" />
      <TemplateForm v-model="password" name="password" type="password" width="65%" placeholder="Password" />
      <br />
      <TemplateButton content="Daftar" width="66%" height="50px"/>
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
.teks-register-3{
    margin-block: 20px;
    font-size: 20px;
    color: black;
}
.router {
  text-decoration: none;
}
</style>
