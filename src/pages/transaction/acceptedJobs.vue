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
const userName = ref([])
async function getAcceptedJobs(technicianId){
  try {
    const response = await apiFetch(`/jobs/${technicianId}/accepted-jobs`)
    acceptedJobs.value = response.data.jobs

    // Ambil semua avatar secara paralel
    await Promise.all(
      acceptedJobs.value.map(async (job) => {
        if (job.idCreator && !avatars.value[job.idCreator]) {
          const profile = await getProfile(job.idCreator)
          avatars.value[job.idCreator] = profile.avatar
        }
      })
    )
  } catch (error) {
    console.error(error);
  }
}

async function getProfile(userId){
  try {
    
    const response = await apiFetch(`/profile/${userId}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data.user
  } catch (error) {
    console.error(error);
    
  }
}

async function getDetailJobs(id) {
  try {
    const response = await apiFetch(`/jobs/${id}`)
    detailJobs.value = response.data.job

    // Ambil profil creator berdasarkan idCreator dari job detail
    const profile = await getProfile(detailJobs.value.idCreator)
    userName.value = profile.nama // simpan nama creator

    xlDemo.value = true
    console.log('detailJobs response:', response.data)
  } catch (error) {
    console.error(error)
  }
}

async function createChat(clientId, technicianId){  
  try {
    const response = await apiFetch(`/chats/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        technicianId: technicianId
      })
      
    })
    console.log('Chat created:', response.data);
  } catch (error) {
    console.error('Gagal membuat chat:', error);
    
  }
}

onMounted(()=>{
    getAcceptedJobs(userId)
})
</script>
<template>
  <VRow class="jobs-container pa-4">
    <!-- Jika ada job open -->
    <template v-if="acceptedJobs.length > 0">
      <VCol
        v-for="(item, i) in acceptedJobs"
        :key="i"
        cols="12"
        sm="6"
        md="4"
        class="fade-in"
      >
        <VCard class="job-card" elevation="4">
          <div class="position-relative">
            <VImg
              v-if="item.photo"
              :src="`http://localhost:3000/uploads/jobs/${item.photo}`"
              height="200"
              cover
              class="job-image"
            />

            <!-- VChip status -->
            <VChip
              color="amber lighten-2"
              text-color="black"
              size="small"
              class="job-status-chip"
              variant="elevated"
            >
              {{ item.status }}
            </VChip>
          </div>

          <VCardText class="px-4 pb-4">
            <!-- Avatar dan tombol -->
            <div class="detail-cont d-flex justify-space-between align-center mb-4">
              <VAvatar
                size="64"
                class="avatar-center"
                :image="`${avatars[item.idCreator] ? `http://localhost:3000${avatars[item.idCreator]}` : avatar1}`"
              />

              <div class="d-flex align-center">
                <VChip
                  v-if="item.invites.find(invite => invite === userId)"
                  color="success"
                  size="small"
                  class="text-capitalize me-2"
                >
                  Dilamar
                </VChip>
                <VBtn
                  color="primary"
                  size="small"
                  variant="tonal"
                  @click="getDetailJobs(item._id)"
                >
                  Detail
                </VBtn>
              </div>
            </div>

            <!-- Title dan kategori -->
            <div class="text-section mb-3">
              <VCardTitle class="pa-0 text-wrap job-title">
                {{ item.title }}
              </VCardTitle>
              <VCardSubtitle class="text-caption pa-0 mt-1">
                <VChip
                  color="blue lighten-4"
                  text-color="primary"
                  size="small"
                  class="text-capitalize"
                >
                  {{ item.category }}
                </VChip>
              </VCardSubtitle>
            </div>

            <!-- Avatars dari invite -->
            <div class="d-flex align-center">
              <div class="v-avatar-group">
                <VAvatar
                  v-for="(invite, idx) in (invitesAvatars[item._id] || []).slice(0, 4)"
                  :key="idx"
                  :image="invite.avatar ? `http://localhost:3000${invite.avatar}` : avatar1"
                  size="40"
                  class="me-1"
                />
                <VAvatar
                  v-if="(invitesAvatars[item._id]?.length || 0) > 4"
                  size="40"
                  color="grey lighten-2"
                  class="d-flex align-center justify-center text-body-2 font-weight-medium"
                >
                  +{{ (invitesAvatars[item._id].length - 4) }}
                </VAvatar>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </template>

    <!-- Jika tidak ada job -->
    <template v-else>
      <VCol cols="12">
        <div class="text-center py-10">
          <h3>Belum ada yang menerima apply mu 😔</h3>
          <p class="text-subtitle-2 text-grey-darken-1">Coba lamar lebih banyak pekerjaan untuk meningkatkan peluangmu!</p>
        </div>
      </VCol>
    </template>
  </VRow>

  <!-- Modal Detail -->
  <CModal
    size="xl"
    :visible="xlDemo"
    @close="() => { xlDemo = false }"
    aria-labelledby="OptionalSizesExample1"
  >
    <CModalHeader>
      <CModalTitle id="OptionalSizesExample1">
        <span class="fw-bold">{{ detailJobs?.title }}</span>
        <span style="font-size: 0.9rem; color: gray;"> oleh {{ userName }}</span>
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="text-center mb-4">
        <CImage
          rounded
          :src="`http://localhost:3000/uploads/jobs/${detailJobs?.photo}`"
          width="55%"
          class="shadow-sm"
        />
      </div>

      <div class="category-text">
        <strong>Kategori:</strong> {{ detailJobs?.category }}
      </div>

      <hr>
      <div class="description">
        <h5>Deskripsi Kerusakan Alat:</h5>
        <div v-html="detailJobs?.description" class="text-body-1"></div>
      </div>

      <hr>
      <div class="experience cont">
        💰 <strong>Budget:</strong> {{ detailJobs?.budget }} |
        🧰 <strong>Pengalaman:</strong> {{ detailJobs?.experiences }}
      </div>

      <hr>
      <div>
        <h6>Skill yang dibutuhkan:</h6>
        <div v-for="(skill, idx) in detailJobs?.skills" :key="idx" class="d-inline">
          <VChip
            color="green lighten-4"
            text-color="green darken-2"
            size="small"
            class="text-capitalize me-2 mb-2"
          >
            {{ skill }}
          </VChip>
        </div>
      </div>

      <hr>
      <div class="date cont deadline-box">
        <label class="deadline-label">📅 Deadline Pengerjaan:</label>
        <p class="deadline-value">
          {{ detailJobs?.deadline?.start_date?.split('T')[0] }}
          →
          {{ detailJobs?.deadline?.end_date?.split('T')[0] }}
        </p>
      </div>

      <div class="apply-btn d-flex justify-end mt-4">
        <VBtn
          color="primary"
          variant="elevated"
          @click="createChat(detailJobs.idCreator, detailJobs.selectedTechnician)"
          :to="`/chat-view`"
        >
          💬 Hubungi
        </VBtn>
      </div>
    </CModalBody>
  </CModal>
</template>

<style scoped>
.job-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #fff;
}

.job-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.job-image {
  border-bottom: 1px solid #eee;
}

.job-status-chip {
  position: absolute;
  top: 12px;
  right: 12px;
  font-weight: 600;
}

.job-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.category-text {
  font-size: 17px;
  margin-block: 20px;
}

.description :deep(ul) {
  list-style-type: disc;
  padding-left: 20px;
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
}

.deadline-label {
  font-weight: 600;
  font-size: 15px;
  color: #3b82f6;
}

.deadline-value {
  font-size: 18px;
  font-weight: bold;
  color: #1e293b;
}

.fade-in {
  animation: fadeInUp 0.4s ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

