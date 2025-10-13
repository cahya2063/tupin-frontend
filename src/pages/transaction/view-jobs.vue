<script setup>
import { apiFetch } from '@/utils/api';
import { onMounted, ref } from 'vue';
import avatar1 from '@images/avatars/avatar-1.png'
import CardJob from '@/layouts/components/CardJob.vue';

const jobs = ref([])
const detailJobs = ref()
const userId = localStorage.getItem('userId')
const xlDemo = ref(false)
const userName = ref([])

// avatars creator
const avatars = ref({}) 
// avatars untuk invites per job
const invitesAvatars = ref({})  

async function getJobs() {
  const response = await apiFetch('/jobs')
  jobs.value = response.data.jobs.filter(job => job.status === 'open')

  for (const job of jobs.value) {
    const profile = await getProfile(job.idCreator)
    job.creatorName = profile.nama
  }

  for (const job of jobs.value) {
    // avatar si creator
    getAvatar(job.idCreator, 'creator')

    // avatar untuk semua invites
    if (job.invites && job.invites.length > 0) {
      for (const inviteId of job.invites) {
        getAvatar(inviteId, 'invite', job._id)
      }
    }
  }
}

const getAvatar = async (id, type = 'creator', jobId = null) => {
  if (!id) return

  // kalau creator
  if (type === 'creator') {
    if (avatars.value[id]) return
    const response = await apiFetch(`/profile/${id}`)
    avatars.value[id] = response.data.user.avatar
  }

  // kalau invite
  if (type === 'invite' && jobId) {
    if (!invitesAvatars.value[jobId]) {
      invitesAvatars.value[jobId] = []
    }

    // cek kalau sudah ada jangan fetch lagi
    const alreadyFetched = invitesAvatars.value[jobId].find(a => a.userId === id)
    if (alreadyFetched) return

    const response = await apiFetch(`/profile/${id}`)
    invitesAvatars.value[jobId].push({
      userId: id,
      avatar: response.data.user.avatar,
    })
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
  const response = await apiFetch(`/jobs/${id}`)
  detailJobs.value = response.data.job

  // Ambil profil creator berdasarkan idCreator dari job detail
    const profile = await getProfile(detailJobs.value.idCreator)
    userName.value = profile.nama // simpan nama creator

  xlDemo.value = true
}

async function applyJob(jobId) {
  const response = await apiFetch(`/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (response.status === 201) {
    alert('Berhasil apply job');
  } else {
    alert('Gagal apply job');
  }
}

onMounted(() => {
  getJobs()
})
</script>


<template>
  <VRow class="jobs-container pa-4">
    <!-- Jika ada job open -->
    <template v-if="jobs.length > 0">
      
      <div class="container-job">
        
        <CardJob
        v-for="(item, i) in jobs"
        :key="i"
        
          :id="item._id"
          :title="item.title"
          :subtext1="[item.experiences, item.deadline, item.budget]"
          :desc="item.description"
          :skills="item.skills"
          :category="item.category"
          :status="item.status"
          @click="getDetailJobs(item._id)"
          :creator="item.creatorName"
          :invitesAvatars="invitesAvatars"
          :avatarPlaceholder="avatar1"
        />
      </div>
    </template>

    <!-- Jika tidak ada job open -->
    <template v-else>
      <VCol cols="12">
        <div class="text-center py-10">
          <h3>Tidak ada job tersedia 😔</h3>
          <p class="text-subtitle-2 text-grey-darken-1">Coba periksa kembali nanti atau ubah filter pencarianmu.</p>
        </div>
      </VCol>
    </template>
  </VRow>

  <!-- Modal Detail -->
  <!-- Slide-over Modal -->
<transition name="slide-fade">
  <div v-if="xlDemo" class="slide-modal-overlay" @click.self="xlDemo = false">
    <div class="slide-modal-content">
      <div class="slide-modal-header">
        <h4>{{ detailJobs?.title }}</h4>
        <button class="close-btn" @click="xlDemo = false">×</button>
      </div>

      <div class="slide-modal-body">
        <CImage
          :src="`http://localhost:3000/uploads/jobs/${detailJobs?.photo}`"
          rounded
          width="100%"
          class="job-detail-image"
        />

        <div class="category-text mt-3">
          <strong>Kategori:</strong> {{ detailJobs?.category }}
        </div>

        <div class="description mt-3">
          <h6>Deskripsi Kerusakan Alat:</h6>
          <div v-html="detailJobs?.description"></div>
        </div>

        <div class="info-box mb-4">
              💰 <strong>Budget:</strong> Rp {{ detailJobs.budget?.toLocaleString('id-ID') }}<br>
              🧰 <strong>Pengalaman:</strong> {{ detailJobs.experiences }}
            </div>

        <div class="skills mt-3">
          <h6>Skill yang Dibutuhkan:</h6>
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

        <div class="deadline-box mt-3">
          <label class="deadline-label">📅 Deadline Pengerjaan:</label>
          <p class="deadline-value">
            {{ detailJobs?.deadline?.start_date?.split('T')[0] }}
            →
            {{ detailJobs?.deadline?.end_date?.split('T')[0] }}
          </p>
        </div>
      </div>

      <div class="slide-modal-footer">
        <VBtn
          v-if="detailJobs?.invites?.includes(userId)"
          variant="outlined"
          color="error"
          disabled
        >
          Anda sudah melamar
        </VBtn>

        <VBtn
          v-else
          color="primary"
          variant="elevated"
          @click="applyJob(detailJobs?._id)"
        >
          Apply Sekarang
        </VBtn>
      </div>
    </div>
  </div>
</transition>

</template>

<style scoped>
.container-job {
  width: 100%;
  display: flex;
  flex-direction: column;
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
.info-box {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #334155;
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

/* Opsional: hanya simpan jika kamu benar-benar pakai animasi fade-in */
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

.v-avatar-group {
  display: flex;
  align-items: center;
}

.v-avatar-group .v-avatar {
  border: 2px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

/* Overlay blur belakang */
.slide-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
  z-index: 2000;
}

/* Panel kanan */
.slide-modal-content {
  background: #fff;
  width: 500px;
  max-width: 90%;
  height: 100%;
  overflow-y: auto;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  box-shadow: -2px 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: fadeInRight 0.3s ease forwards;
}

/* Header */
.slide-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background-color: #f8faff;
}

.slide-modal-header h4 {
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 26px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #ef4444;
}

/* Body */
.slide-modal-body {
  padding: 20px;
  flex: 1;
}

.job-detail-image {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

/* Footer */
.slide-modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #f9fafb;
}

/* Animasi Slide */
@keyframes fadeInRight {
  from {
    transform: translateX(100%);
    opacity: 0.3;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Animasi Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

</style>

