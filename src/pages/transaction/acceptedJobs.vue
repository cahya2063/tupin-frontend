<script setup>
import { apiFetch } from '@/utils/api';
import { onMounted, ref } from 'vue';
import avatar1 from '@images/avatars/avatar-1.png'


// avatars creator
const avatars = ref({})
// avatars untuk invites per job
const invitesAvatars = ref({})
const xlDemo = ref(false)


const acceptedJobs = ref([])
const detailJobs = ref()
const userId = localStorage.getItem('userId')
async function getAcceptedJobs(technicianId){
    try {
        const response = await apiFetch(`/jobs/${technicianId}/accepted-jobs`)
        console.log('acceptedJobs : ', response.data.jobs);
        acceptedJobs.value = response.data.jobs
    } catch (error) {
        console.error(error);
        
    }
}

async function getDetailJobs(id) {
    const response = await apiFetch(`/jobs/${id}`)
    detailJobs.value = response.data.job
    xlDemo.value = true
    console.log('detailJobs response:', response.data)
}

onMounted(()=>{
    getAcceptedJobs(userId)
})
</script>
<template>
  <VRow class="jobs-container">
    <!-- Jika ada job open -->
    <template v-if="acceptedJobs.length > 0">
      <VCol
        v-for="(item, i) in acceptedJobs"
        :key="i"
        cols="12"
        sm="6"
        md="4"
      >
        <VCard>
          <div class="position-relative">
            <VImg
                v-if="item.photo"
                :src="`http://localhost:3000/uploads/jobs/${item.photo}`"
                />

            <!-- VChip status -->
            <VChip
              color="warning"
              size="small"
              class="job-status-chip"
            >
              {{ item.status }}
            </VChip>
          </div>

          <VCardText class="position-relative">
            <!-- User Avatar -->
            <div class="detail-cont d-flex justify-space-between align-center">
              <VAvatar
                size="75"
                class="avatar-center"
                :image="`${avatars[item.idCreator] ? `http://localhost:3000${avatars[item.idCreator]}` : avatar1}`"
              />
              <VChip
                v-if="item.invites.find(invite => invite === userId)"
                color="success"
                size="medium"
                class="text-capitalize py-1 px-2 mx-2"
              >
                dilamar
              </VChip>
              <VBtn color="primary" @click="getDetailJobs(item._id)">
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
                  <VChip
                    color="warning"
                    size="medium"
                    class="text-capitalize py-1 px-2 mx-2"
                  >
                    {{ item.category }}
                  </VChip>
                </VCardSubtitle>
              </div>
            </div>

            <!-- Mutual Friends -->
            <div class="d-flex justify-space-between align-center">
              
              <div class="v-avatar-group">
                <VAvatar
                  v-for="(invite, idx) in (invitesAvatars[item._id] || []).slice(0,4)"
                  :key="idx"
                  :image="invite.avatar ? `http://localhost:3000${invite.avatar}` : avatar1"
                  size="40"
                />
                <VAvatar
                  v-if="(invitesAvatars[item._id]?.length || 0) > 4"
                  size="40"
                  color="grey lighten-1"
                  class="d-flex align-center justify-center"
                >
                  +{{ (invitesAvatars[item._id].length - 4) }}
                </VAvatar>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </template>

    <!-- Jika tidak ada job open -->
    <template v-else>
      <VCol cols="12">
        <div class="text-center py-10">
          <h3>Belum ada yang menerima apply mu</h3>
        </div>
      </VCol>
    </template>
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
        {{ detailJobs?.photo }}
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
.job-status-chip {
  position: absolute;
  top: 10px;
  right: 10px;
  font-weight: bold;
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
