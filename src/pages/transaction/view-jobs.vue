<script setup>
import { apiFetch } from '@/utils/api';
import { onMounted, ref } from 'vue';
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
const avatarList = [avatar1, avatar2, avatar3, avatar4]
const jobs = ref()
const detailJobs = ref()
const userId = localStorage.getItem('userId')
const avatars = ref([])
const xlDemo = ref(false)

async function getJobs() {
  const response = await apiFetch('/jobs')
  jobs.value = response.data.jobs

  // setelah jobs didapat, langsung ambil profil untuk tiap idCreator
  for (const job of jobs.value) {
    getProfile(job.idCreator)
  }
}


const getProfile = async(id) => {
  if (!id || avatars.value[id]) return   // kalau sudah ada jangan fetch lagi
  const response = await apiFetch(`/profile/${id}`)
  avatars.value[id] = response.data.user.avatar
}

async function getDetailJobs(id){
  xlDemo.value = true
  const response = await apiFetch(`/jobs/${id}`)
  
  detailJobs.value = response.data.job
  
}

async function applyJob(jobId) {
  const response = await apiFetch(`/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (response.status === 201) {
    alert('Berhasil apply job');
  } else {
    alert('Gagal apply job');
  }
}
onMounted(()=>{
    getJobs()
})   
</script>
<template>
<VRow class="jobs-container">
    <VCol
      v-for="(item, i) in jobs"
      :key="i"
      cols="12"
      sm="6"
      md="4"
    >
      <VCard>
        <VImg :src="`http://localhost:3000/uploads/jobs/${item.photo}`" />
        <VCardText class="position-relative">
          <!-- User Avatar -->
           <div class="detail-cont d-flex justify-space-between align-center">
            <VAvatar
              size="75"
              class="avatar-center"
              :image="`${avatars[item.idCreator] ?`http://localhost:3000${avatars[item.idCreator]}` :  avatar1}`"
            />
            <VChip
              v-if="item.invites.find(invite => invite === userId)"
                color="success"
                size="medium"
                class="text-capitalize py-1 px-2 mx-2"
              >
              dilamar
            </VChip>
            <VBtn color="primary" @click="getDetailJobs(item._id)" :data-id="`${item._id}`">
              Detail
            </VBtn>
          </div>


          <!-- Title, Subtitle & Action Button -->
          <div class="d-flex justify-space-between flex-wrap pt-6">
            <div class="me-2 mb-2">
              <VCardTitle class="pa-0 text-wrap">
                {{ item.title }}
              </VCardTitle>
              <VCardSubtitle class="text-caption pa-0">
                {{ item.category }}
              </VCardSubtitle>
            </div>
          </div>

          <!-- Mutual Friends -->
          <div class="d-flex justify-space-between align-center">
            <span class="font-weight-medium">18 mutual friends</span>
            <div class="v-avatar-group">
              <VAvatar
                v-for="(avatar, idx) in avatarList"
                :key="idx"
                :image="avatar"
                size="40"
              />
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <CModal
      size="xl"
      :visible="xlDemo"
      @close="() => { xlDemo = false }"
      aria-labelledby="OptionalSizesExample1"
    >
    <CModalHeader>
      <CModalTitle id="OptionalSizesExample1">{{ detailJobs?.title }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CImage align="center" rounded :src="`http://localhost:3000/uploads/jobs/${detailJobs?.photo}`" width="50%"/>
      <hr>
      <div class="category-text">
        kategori : {{ detailJobs?.category }}
      </div>
      <hr>
      <div class="description">
      <h5>Deskripsi kerusakan alat :</h5>
        <div v-html="detailJobs?.description"></div>
      </div>

      <hr>
      <div class="experience cont">
        budget : {{ detailJobs?.budget }} pengalaman : {{ detailJobs?.experiences }}
      </div>
      <hr>
      Skill :
      <div v-for="(skill, idx) in detailJobs?.skills" :key="idx" class="d-inline">
        <VChip
            color="success"
            size="medium"
            class="text-capitalize py-1 px-2 mx-2"
          >
          {{ skill }}
        </VChip>
        
      </div>
      <hr>
      <div class="date cont deadline-box">
        <label class="deadline-label">📅 Deadline pengerjaan:</label>
        <p class="deadline-value">
          {{ detailJobs?.deadline?.start_date?.split('T')[0] }}
          → 
          {{ detailJobs?.deadline?.end_date?.split('T')[0] }}
        </p>
      </div>
      <div class="apply-btn d-flex justify-end">
        <!-- Jika user sudah melamar -->
        <VBtn
          v-if="detailJobs?.invites?.includes(userId)"
          style="color: red;"
          disabled
        >
          Anda sudah melamar
        </VBtn>

        <!-- Jika belum melamar -->
        <VBtn
          v-else
          color="primary"
          @click="applyJob(detailJobs?._id)"
        >
          Apply
        </VBtn>
      </div>
      


    </CModalBody>
  </CModal>
</template>
<style scoped>
.category-text{
  font-size: 17px;
  margin-block: 40px;
}
.cont{
  margin-block: 40px;
}
.date{
  max-width: 80%;
  margin-inline: auto;
}
.description :deep(ul) {
  list-style-type: disc;
  padding-left: 20px;
  margin: 8px 0;
}

.description :deep(li) {
  margin-bottom: 4px;
}

.deadline-box {
  background: #f5f9ff;
  border: 1px solid #d0e3ff;
  border-radius: 12px;
  padding: 16px 20px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.deadline-box:hover {
  background: #ebf4ff;
  transform: translateY(-2px);
}

.deadline-label {
  display: block;
  font-weight: 600;
  font-size: 15px;
  color: #3b82f6;
  margin-bottom: 6px;
}

.deadline-value {
  font-size: 18px;
  font-weight: bold;
  color: #1e293b;
  margin: 0;
  letter-spacing: 0.5px;
}

</style>
