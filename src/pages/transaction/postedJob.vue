<script setup>
import { apiFetch } from '@/utils/api';
import { onMounted, ref } from 'vue';
import avatar1 from '@images/avatars/avatar-1.png'
import CardJob from '@/layouts/components/CardJob.vue';
import sweetAlert from '@/utils/sweetAlert';

const headers = [
  { title: 'User', key: 'username' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Profile', key: 'profile' },
]

const userData = ref([])
const selectedJob = ref(null)
const showSidebar = ref(false)
const showApplicantsModal = ref(false)
const userId = localStorage.getItem('userId')
const jobs = ref([])

// avatars creator
const avatars = ref({}) 
// avatars untuk invites per job
const invitesAvatars = ref({})  

async function getPostedJobs(){
  const response = await apiFetch(`/jobs/uploaded/${userId}`)
  jobs.value = response.data.jobs

  for (const job of jobs.value) {
    getProfile(job.idCreator, 'creator')

    if (job.invites && job.invites.length > 0) {
      for (const inviteId of job.invites) {
        getProfile(inviteId, 'invite', job._id)
      }
    }
  }
}

const getProfile = async (id, type = 'creator', jobId = null) => {
  if (!id) return

  if (type === 'creator') {
    if (avatars.value[id]) return
    const response = await apiFetch(`/profile/${id}`)    
    avatars.value[id] = response.data.user.avatar
  }

  if (type === 'invite' && jobId) {
    if (!invitesAvatars.value[jobId]) {
      invitesAvatars.value[jobId] = []
    }

    const alreadyFetched = invitesAvatars.value[jobId].find(a => a.userId === id)
    if (alreadyFetched) return

    const response = await apiFetch(`/profile/${id}`)
    invitesAvatars.value[jobId].push({
      userId: id,
      avatar: response.data.user.avatar,
    })
  }
}

async function cancelJob(jobId) {
  try {
    const response = await apiFetch(`/jobs/${jobId}/cancel-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log('response cancel : ', response.data);
    return response.data
    
  } catch (error) {
    console.error('gagal melakukan cancel job');
    
  }
}

const openDetail = (job) => {
  selectedJob.value = job
  showSidebar.value = true
}

const openApplicants = async () => {
  userData.value = []

  if (invitesAvatars.value[selectedJob.value._id]) {
    for (const invite of invitesAvatars.value[selectedJob.value._id]) {
      const res = await apiFetch(`/profile/${invite.userId}`)
      userData.value.push(res.data.user)
    }
  }

  showApplicantsModal.value = true
}

onMounted(() => {
  getPostedJobs()
})
</script>

<template>
  <VRow class="jobs-container">
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
          @click="openDetail(item)"
          :creator="item.creatorName"
          :invitesAvatars="invitesAvatars"
          :avatarPlaceholder="avatar1"
        />
      </div>
    </template>
  </VRow>

  <!-- Sidebar kanan untuk detail job -->
  <transition name="slide-fade">
    <div v-if="showSidebar" class="slide-modal-overlay" @click.self="showSidebar = false">
      <div class="slide-modal-content">
        <div class="slide-modal-header">
          <h4>Detail Job</h4>
          <button class="close-btn" @click="showSidebar = false">×</button>
        </div>

        <div class="slide-modal-body">
          <CImage
          :src="`http://localhost:3000/uploads/jobs/${selectedJob?.photo}`"
          rounded
          width="100%"
          class="job-detail-image"
        />
          <div v-if="selectedJob" class="job-detail">
            <h5 class="fw-bold mb-2">{{ selectedJob.title }}</h5>
            <p class="text-muted mb-2"><strong>Kategori:</strong> {{ selectedJob.category }}</p>
            <p class="text-muted mb-3"><strong>Status:</strong> {{ selectedJob.status }}</p>

            <div class="description mb-4">
              <h6 class="fw-semibold">Deskripsi:</h6>
              <div v-html="selectedJob.description"></div>
            </div>

            <div class="info-box mb-4">
              💰 <strong>Budget:</strong> Rp {{ selectedJob.budget?.toLocaleString('id-ID') }}<br>
              🧰 <strong>Pengalaman:</strong> {{ selectedJob.experiences }}
            </div>

            <div class="skills mb-4">
              <h6 class="fw-semibold mb-2">Skill Dibutuhkan:</h6>
              <VChip
                v-for="(skill, idx) in selectedJob.skills"
                :key="idx"
                color="green lighten-4"
                text-color="green darken-2"
                size="small"
                class="text-capitalize me-2 mb-2"
              >
                {{ skill }}
              </VChip>
            </div>

            <div class="deadline-box mt-3">
          <label class="deadline-label">📅 Deadline Pengerjaan:</label>
          <p class="deadline-value">
            {{ selectedJob?.deadline?.start_date?.split('T')[0] }}
            →
            {{ selectedJob?.deadline?.end_date?.split('T')[0] }}
          </p>
        </div>

            <VBtn color="primary" variant="elevated" class="mt-4 mx-2" @click="openApplicants">
              Lihat Pelamar
            </VBtn>
            <VBtn
            class="mt-4 mx-2"
            v-if="selectedJob?.status == 'progress'"
              style="margin-right: 20px;"
                color="danger"
                variant="elevated"
                @click="showSidebar = false; sweetAlert.confirm({
                  title: 'Cancel Jobs?',
                  text: 'apakah anda yakin ingin cancel Job?',
                  confirmText: 'Ya, cancel!',
                  cancelText: 'Batal'
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    const cancelJobData = await cancelJob(selectedJob._id)
                    console.log(cancelJobData);
                    
                    sweetAlert.success(cancelJobData.message)
                  }
                })"
              >
                Cancel
            </VBtn>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Modal Pop-up Pelamar -->
  <VDialog v-model="showApplicantsModal" max-width="800">
    <VCard>
      <VCardTitle class="d-flex justify-between align-center">
        <span>Daftar Pelamar</span>
      </VCardTitle>
      <VCardText>
        <VDataTable
          :headers="headers"
          :items="userData"
          item-value="id"
          class="text-no-wrap"
          density="comfortable"
        >
          <!-- Kolom Avatar & Nama -->
          <template #item.username="{ item }">
            <div class="d-flex align-center gap-x-3">
              <VAvatar size="36">
                <VImg :src="item.avatar ? `http://localhost:3000${item.avatar}` : avatar1" />
              </VAvatar>
              <div><strong>{{ item.nama }}</strong></div>
            </div>
          </template>

          <template #item.email="{ item }">
            <span>{{ item.email }}</span>
          </template>

          <template #item.role="{ item }">
            <span class="text-capitalize">{{ item.role }}</span>
          </template>

          <template #item.profile="{ item }">
            <VBtn
              color="secondary"
              variant="tonal"
              :to="`/technician-detail/${item._id}?jobId=${selectedJob._id}`"
            >
              Profile
            </VBtn>
          </template>

          <template #bottom />
        </VDataTable>
      </VCardText>
    </VCard>
  </VDialog>
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


/* Overlay blur */
.slide-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: flex-end;
  z-index: 2000;
}

/* Panel kanan */
.slide-modal-content {
  background: #fff;
  width: 50%;
  max-width: 90%;
  height: 100%;
  overflow-y: auto;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
  animation: fadeInRight 0.3s ease forwards;
  display: flex;
  flex-direction: column;
}

/* Header */
.slide-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f8fafc;
}

.slide-modal-header h4 {
  margin: 0;
  color: #1e293b;
  font-weight: 600;
}

.close-btn {
  border: none;
  background: none;
  font-size: 28px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #ef4444;
}

/* Body */
.slide-modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.job-detail h5 {
  color: #0f172a;
}

.deadline-label {
  font-weight: 600;
  color: #2563eb;
}

.deadline-value {
  font-size: 15px;
  font-weight: 500;
}

.info-box {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #334155;
}

/* Animasi */
@keyframes fadeInRight {
  from {
    transform: translateX(100%);
    opacity: 0.2;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

</style>
