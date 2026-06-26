<script setup>
import { apiFetch, getProfile } from '@/utils/api'
import { onMounted, ref, computed, onUnmounted } from 'vue'
import avatar1 from '@images/avatars/avatar-1.png'
import sweetAlert from '@/utils/sweetAlert'
// import CardJob from '@/layouts/components/CardJob.vue'
import ReviewModal from '@/components/form/ReviewModal.vue'
import SlideJobDetail from '@/layouts/components/SlideJobDetail.vue'
import CardJobTechnician from '@/layouts/components/CardJobTechnician.vue'
import { getStatusJobNormalize, socket, useJobUpdater } from '@/utils/tools'

const avatars = ref({})
const role = localStorage.getItem('role')
const acceptedJobs = ref([])
const selectedJob = ref()
const showRatingModal = ref(false)
const userId = localStorage.getItem('userId')
const receiverId = computed(() => selectedJob.value?.idCreator)
const jobId = computed(() => selectedJob.value?._id)
const { updateJobStatus } = useJobUpdater(acceptedJobs)
 
function handleReviewSubmitted(data) {
  console.log('Review tersimpan:', data)
}
 
async function getAcceptedJobs(technicianId) {
  try {
    const response = await apiFetch(`/jobs/${technicianId}/accepted-jobs`)
    acceptedJobs.value = response.data.jobs
 
    acceptedJobs.value = response.data.jobs.filter(
      job => job.moderation?.isDeleted === false
    )
    //ambil nama pelanggan
    await Promise.all(
      acceptedJobs.value.map(async job => {
        const profile = await getProfile(job.idCreator)
        job.creatorName = profile.nama
      })
    )
 

    // ambil avatar pelanggan
    await Promise.all(
      acceptedJobs.value.map(async job => {
        if (job.idCreator && !avatars.value[job.idCreator]) {
          const profile = await getProfile(job.idCreator)
          avatars.value['image'] = profile.avatar
        }
      }),
    )
  } catch (error) {
    console.error(error)
  }
}


async function readCountJobNotification(){
  try {
    const readNotification = await apiFetch(`/notifications/read-count-notification`)
    console.log('read count notif : ', readNotification.data.message);
    
  } catch (error) {
    console.error('gagal membaca notifikasi');
    
  }
}

onMounted(async () => {
  await getAcceptedJobs(userId)
  await readCountJobNotification()

  // trigger event register di server
  socket.emit('register', {
    userId: userId,
    role: role
  })

  socket.on('job:created', async () => {
    await getAcceptedJobs(userId)
  })
  socket.on('job:pending-transport', ({ jobId, status }) => {
    updateJobStatus(jobId, status)
  })
  socket.on('job:paid-transport', ({ jobId, status }) => {
    updateJobStatus(jobId, status)
  })
  socket.on('job:checked', ({jobId, status})=>{
    updateJobStatus(jobId, status)
  })
  socket.on('job:pending-repair', ({ jobId, status }) => {
    updateJobStatus(jobId, status)
  })
  socket.on('job:paid-repair', ({ jobId, status }) => {
    updateJobStatus(jobId, status)
  })
  socket.on('job:done', ({ jobId, status }) => {
    updateJobStatus(jobId, status)
  })
  socket.on('job:completed', ({ jobId, status }) => {
    updateJobStatus(jobId, status)
  })
  socket.on('job:canceled', ({ jobId, status }) => {
    updateJobStatus(jobId, status)
  })

})
onUnmounted(() => {
  socket.off('job:created')
  socket.off('job:pending-transport')
  socket.off('job:paid-transport')
  socket.off('job:checked')
  socket.off('job:pending-repair')
  socket.off('job:paid-repair')
  socket.off('job:done')
  socket.off('job:completed')
  socket.off('job:canceled')
})
</script>
 
<template>
  <div class="page-wrapper">
    <div class="page-content">
      <!-- ── Header ── -->
      <div class="page-header">
        <div class="page-header__text">
          <h2 class="page-title">Pekerjaan Diterima</h2>
          <p class="page-subtitle">Daftar pekerjaan yang sedang kamu tangani</p>
        </div>
        <div v-if="acceptedJobs.length > 0" class="job-count-badge">
          {{ acceptedJobs.length }} pekerjaan
        </div>
      </div>
 
 
      <!-- ── Job List ── -->
      <template v-if="acceptedJobs.length > 0">
        <div class="container-job">
          <CardJobTechnician
            v-for="(item, i) in acceptedJobs"
            :key="item._id"
            :id="item._id"
            :title="item.title"
            :deadline="item.deadline"
            :desc="item.description"
            :category="item.category"
            :status="getStatusJobNormalize(item.status)"
            :creator="item.creatorName"
            :avatarPlaceholder="avatars"
            :selectedJob="item"
            class="job-card-item"
            />
            <!-- @click="getDetailJobs(item._id)" -->
        </div>
      </template>
 
      <!-- ── Empty State ── -->
      <template v-else>
        <div class="empty-state">
          <div class="empty-state__icon">
            <i class="ri-briefcase-4-line"></i>
          </div>
          <h3 class="empty-state__title">Belum ada pekerjaan diterima</h3>
          <p class="empty-state__sub">
            Coba lamar lebih banyak pekerjaan untuk meningkatkan peluangmu!
          </p>
          <div class="empty-state__hint">
            <i class="ri-lightbulb-line"></i>
            Pastikan profil dan skill-mu sudah lengkap agar lebih mudah ditemukan klien.
          </div>
        </div>
      </template>
 
    </div>
  </div>
 
  
 
  <!-- ── Review modal ── -->
  <ReviewModal
    v-model:show="showRatingModal"
    :sender-id="userId"
    :receiver-id="receiverId"
    :job-id="jobId"
    @review-submitted="handleReviewSubmitted"
  />
</template>
 
<style scoped>
/* ─── Wrapper ─────────────────────────────────────────────── */
.page-wrapper {
  background-color: #f4f0ff;
  min-height: 100vh;
  padding: 28px 16px 48px;
}
 
.page-content {
  width: min(92%, 860px);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
 
/* ─── Header ─────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #ffffff;
  border-radius: 18px;
  padding: 20px 24px;
  border: 1px solid rgba(141, 88, 255, 0.12);
  border-left: 4px solid #8d58ff;
}
 
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
  line-height: 1.2;
}
 
.page-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}
 
.job-count-badge {
  flex-shrink: 0;
  background: #f0ebff;
  color: #8d58ff;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 50px;
  border: 1px solid #ddd4ff;
  white-space: nowrap;
}
 
/* ─── Job list ─────────────────────────────────────────────── */
.container-job {
  display: flex;
  flex-direction: column-reverse;
  gap: 14px;
}
 
/* Setiap CardJob diberi styling wrapper agar konsisten */
.job-card-item {
  border-radius: 18px !important;
  border: 1px solid rgba(141, 88, 255, 0.1) !important;
  background: #ffffff !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
  cursor: pointer;
}
 
.job-card-item:hover {
  border-color: #8d58ff !important;
  box-shadow: 0 6px 28px rgba(141, 88, 255, 0.12) !important;
}
 
/* ─── Empty state ─────────────────────────────────────────── */
.empty-state {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(141, 88, 255, 0.1);
  padding: 56px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}
 
.empty-state__icon {
  width: 72px;
  height: 72px;
  background: #f0ebff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #8d58ff;
  margin-bottom: 4px;
}
 
.empty-state__title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}
 
.empty-state__sub {
  font-size: 14px;
  color: #888;
  margin: 0;
  max-width: 360px;
  line-height: 1.6;
}
 
.empty-state__hint {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  background: #f0ebff;
  color: #7040d0;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid #ddd4ff;
  max-width: 380px;
  line-height: 1.5;
  margin-top: 4px;
  text-align: left;
}
 
.empty-state__hint i {
  font-size: 15px;
  margin-top: 1px;
  flex-shrink: 0;
}
 
/* ─── Deadline box (digunakan di sidebar / slot lain) ────── */
.deadline-box {
  background: #f0ebff;
  border: 1px solid #ddd4ff;
  border-radius: 14px;
  padding: 16px 20px;
  text-align: center;
  transition: background 0.2s;
}
 
.deadline-box:hover {
  background: #e6deff;
}
 
.deadline-label {
  font-weight: 600;
  font-size: 13px;
  color: #8d58ff;
  margin-bottom: 4px;
}
 
.deadline-value {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
}
 
/* ─── Animasi ─────────────────────────────────────────────── */
.fade-in {
  animation: fadeInUp 0.35s ease-in-out;
}
 
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
 
/* ─── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-content {
    width: 96%;
  }
 
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 16px 18px;
  }
 
  .page-title {
    font-size: 17px;
  }
 
  .job-count-badge {
    align-self: flex-start;
  }
 
  .empty-state {
    padding: 40px 20px;
  }
 
  .empty-state__icon {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
}
 
@media (max-width: 480px) {
  .page-wrapper {
    padding: 16px 10px 40px;
  }
 
  .page-header {
    border-left-width: 3px;
  }
 
  .empty-state__hint {
    font-size: 12px;
    padding: 10px 14px;
  }
}
</style>
