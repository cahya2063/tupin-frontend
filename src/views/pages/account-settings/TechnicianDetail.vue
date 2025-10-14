<script setup>
import { useRoute } from 'vue-router';
import avatar1 from '@images/avatars/avatar-1.png'
import { apiFetch } from '@/utils/api';
import Swal from 'sweetalert2';

const route = useRoute()
const technicianId = route.params.id      // dari :id di path
const jobId = route.query.jobId           // dari query ?jobId=...

console.log('id job : ', jobId);
console.log('id teknisi : ', technicianId);

const accountDataLocal = ref({
  id: '',
  name: '',
  email: '',
  avatar: '',
  // field profile tambahan
  phone_number: '',
  address: '',
  village: '',
  subdistrict: '',
  city: '',
  zip_code: '',
})

async function getProfile() {
  try {
    const response = await apiFetch(`/profile/${technicianId}`)

    accountDataLocal.value = {
      ...accountDataLocal.value,
      id: response.data.user._id,
      name: response.data.user.nama,
      email: response.data.user.email,
      phone_number: response.data.user.phone_number || '',
      address: response.data.user.address || '',
      village: response.data.user.village || '',
      subdistrict: response.data.user.subdistrict || '',
      city: response.data.user.city || '',
      zip_code: response.data.user.zip_code || '',
      avatar: response.data.user.avatar || null, // default avatar jika kosong
    }

    console.log('profile', accountDataLocal.value);
    
    
  } catch (err) {
    console.error(err.message)
  }
}

async function chooseTechnician(technicianId, jobId){
  try{
    console.log('chooseTechnician', technicianId, jobId);
    const data = {
      clientId: localStorage.getItem('userId'),
      technicianId: technicianId
    }
    
    const response = await apiFetch(`/jobs/${jobId}/choose-technician`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    console.log('response', response);
    if(response.status == 200){

      Swal.fire({
        title: 'Sukses',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#16a34a'
      })
    }    
  }catch(error){
    Swal.fire({
      title: 'Gagal',
      text: 'gagal menyetujui teknisi',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    })
  }
}

onMounted(async () => {
  getProfile()
})

</script>

<template>
    <VRow>
    <VCol cols="12">
      <VCard title="Account Details">
        <VCardText class="d-flex">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6"
            :image="accountDataLocal.avatar 
    ? `http://localhost:3000${accountDataLocal.avatar}` 
    : avatar1"
          />

        </VCardText>

        <VDivider />

        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>
              <!-- 👉 ID -->
              <VCol md="6" cols="12">
                <VTextField
                  v-model="accountDataLocal.id"
                  label="ID"
                  placeholder="User ID"
                  :readonly="true"
                />
              </VCol>

              <!-- 👉 Name -->
              <VCol md="6" cols="12">
                <VTextField
                  v-model="accountDataLocal.name"
                  label="Nama"
                  placeholder="John Doe"
                  :readonly="true"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.email"
                  label="E-mail"
                  placeholder="johndoe@gmail.com"
                  type="email"
                  :readonly="true"
                />
              </VCol>

              

              <!-- 👉 Phone -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.phone_number"
                  label="No. Handphone"
                  placeholder="085123456789"
                  :readonly="true"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.address"
                  label="Alamat"
                  placeholder="Jl. Ikan Hiu no. 123"
                  :readonly="true"
                />
              </VCol>

              <!-- 👉 village -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.village"
                  label="Desa/Kelurahan"
                  placeholder="Karangrejo"
                  :readonly="true"
                />
              </VCol>

              <!-- 👉 subdistrict -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.subdistrict"
                  label="Kecamatan"
                  placeholder="Banyuwangi"
                  :readonly="true"
                />
              </VCol>

              <!-- 👉 city -->
              <VCol cols="12" md="6">
                <VSelect
                  v-model="accountDataLocal.city"
                  label="Kabupaten"
                  :items="['Banyuwangi']"
                  placeholder="Select city"
                  :readonly="true"
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol cols="12" md="6">
                <VBtn @click="chooseTechnician(accountDataLocal.id, jobId)">Accept</VBtn>
              </VCol>

            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12">
      <!-- 👉 Data Sertifikat -->
      <VCard title="Data Sertifikat">
        <VCardText>
          <div>
            <VCheckbox
              
              label="I confirm my account deactivation"
            />
          </div>

          <VBtn
            
            color="error"
            class="mt-3"
          >
            Deactivate Account
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>

  </VRow>
</template>

<style scoped>

</style>




