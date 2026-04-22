<script setup>
import { useRoute } from 'vue-router'
import avatar1 from '@images/avatars/avatar-1.png'
import { apiFetch } from '@/utils/api'
import { ref } from 'vue'
import Swal from 'sweetalert2'
import ReviewContainer from '@/pages/part/ReviewContainer.vue'
import { createChat } from '@/utils/tools'

// const route = useRoute()
// const technicianId = route.params.id // dari :id di path
// const jobId = route.query.jobId // dari query ?jobId=...
// const jobId = '693d1810c4cb04f41f21b527' // dari query ?jobId=...
// const detailJobs = ref()

const userId = localStorage.getItem('userId')

const props = defineProps({
  technicianId : String
})

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
  ratings : 0,
  description: '',
  skills: []
})

async function getProfile() {
  try {
    const response = await apiFetch(`/profile/${props.technicianId}`)

    

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
      ratings: response.data.user.ratings || 0,
      description: response.data.user.description || '',
      skills: response.data.user.skills || [],
    }    
  } catch (err) {
    console.error(err.message)
  }
}

async function getSkills(id){
  const response = await apiFetch(`/skills/${id}`)
  
  return response.data.skill.label
}

onMounted(async () => {
  await getProfile()
  accountDataLocal.value.skills = await Promise.all(
    accountDataLocal.value.skills.map(async (skillId) => {
      return await getSkills(skillId)
    })
  )
  // getDetailJobs(jobId)
})
</script>

<template>
  
  <VRow>
    <VCol cols="12">
      <VCard class="technician-detail-card">
        <VCardText class="profile-card d-flex">
    
          <!-- Avatar -->
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6 avatar"
            :image="accountDataLocal.avatar ? `http://localhost:3000${accountDataLocal.avatar}` : avatar1"
          />

          <!-- Info -->
          <div class="d-flex flex-column gap-2 profile-info">
            <div class="name">
              {{ accountDataLocal.name }}
            </div>
            <CRating v-model="accountDataLocal.ratings" />
            

            <div class="completed-job">
              4 pekerjaan terselesaikan
            </div>
          </div>

          <!-- Buttons -->
          <div class="action-buttons d-flex flex-column ms-auto gap-3">
            <VBtn color="primary" @click="createChat(userId, accountDataLocal.id)" :to="`/chat-view`">
              <VIcon start icon="ri-chat-3-line" />
              Chat
            </VBtn>

            <VBtn class="accept-btn" :to="`/jobs/${accountDataLocal.id}`">
              <VIcon start icon="ri-tools-line" />
              Ajukan Perbaikan
            </VBtn>
          </div>

        </VCardText>

        <VDivider />
        <div class="skills d-flex flex-wrap gap-2 px-4">
          <v-chip 
            class="me-2"
            v-for="(skill, index) in accountDataLocal.skills"
            color="success lighten-4"
            text-color="green darken-2"
          >
            {{ skill }}
          </v-chip>
        </div>

        <!-- deskripsi -->
        <div class="card-description px-4 mx-auto my-4">
          <div class="description-content" v-html="accountDataLocal.description"></div>

        </div>

        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>

              <!-- 👉 Address -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.address"
                  label="Alamat"
                  placeholder="Jl. Ikan Hiu no. 123"
                  :readonly="true"
                  variant="outlined"
                />
              </VCol>

              <!-- 👉 village -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.village"
                  label="Desa/Kelurahan"
                  placeholder="Karangrejo"
                  :readonly="true"
                  variant="outlined"
                />
              </VCol>

              <!-- 👉 subdistrict -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.subdistrict"
                  label="Kecamatan"
                  placeholder="Banyuwangi"
                  :readonly="true"
                  variant="outlined"
                />
              </VCol>

              <!-- 👉 city -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="accountDataLocal.city"
                  label="Kabupaten"
                  :items="['Banyuwangi']"
                  placeholder="Select city"
                  :readonly="true"
                  variant="outlined"
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol
                cols="12"
                md="6"
                v-if="accountDataLocal.zip_code"
              >
              <VTextField
                  v-model="accountDataLocal.zip_code"
                  label="Kode Pos"
                  :readonly="true"
                  variant="outlined"
                />
              </VCol>

             

              <VCol
                cols="12"
                md="6"
                v-else
              >
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.technician-detail-card {
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}
.accept-btn{
  background-color: rgb(15, 255, 15);
  color: white;
  font-weight: bold;
}
.accept-btn:hover{
  background-color: rgba(0, 128, 0, 0.736);
}
.name{
  font-size: 30px;
  font-weight: 600;
}
.card-description{
  width: 97%;
  height: auto;
  padding: 20px;
  border-radius: 10px;  
  background-color: #e7eaee;
}
.description-content ul {
  list-style: disc;
  padding-left: 20px;
}

.description-content li {
  margin-bottom: 5px;
}
@media (max-width: 618px) {

  .profile-card {
    flex-direction: column;
    gap: 16px;
  }

  .profile-info {
    align-items: center;
    text-align: center;
  }

  .avatar {
    margin-right: 0 !important;
    align-self: center;
  }

  .action-buttons {
    flex-direction: row !important;
    justify-content: center;
    margin-left: 0 !important;
  }

}
</style>
