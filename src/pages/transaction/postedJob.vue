<script setup>
import { apiFetch, getProfile } from '@/utils/api'
import { onMounted, ref, computed } from 'vue'
import avatar1 from '@images/avatars/avatar-1.png'
// import CardJob from '@/layouts/components/CardJob.vue'
import sweetAlert from '@/utils/sweetAlert'
import { CForm } from '@coreui/vue-pro'
import ReviewModal from '@/components/form/ReviewModal.vue'
import Payment from '@/components/form/Payment.vue'
import SlideJobDetail from '@/layouts/components/SlideJobDetail.vue'
import CardJobClient from '@/layouts/components/CardJobClient.vue'

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
const showRatingModal = ref(false)
const userId = localStorage.getItem('userId')
const jobs = ref([])

const receiverId = computed(() => selectedJob.value?.selectedTechnician)
const jobId = computed(() => selectedJob.value?._id)

// event ketika review berhasil dikirim
function handleReviewSubmitted(data) {
  console.log('Review tersimpan:', data)
  // bisa tambahkan logika refresh data job, dll.
}
// avatars creator
const avatars = ref({})

// avatars untuk teknisi per job
const invitesAvatars = ref({})

const isCancelable = computed(() => ['pending', 'request'].includes(selectedJob.value?.status))
async function getPostedJobs() {
  try {
    
    const response = await apiFetch(`/jobs/uploaded/${userId}`)
    jobs.value = response.data.jobs
    for (const job of jobs.value) {
      const profile = await getProfile(job.idCreator)
      const technicianProfile = await getProfile(job.selectedTechnician)
      job.creatorName = profile.nama
      job.technicianName = technicianProfile.nama
    }
 
    await Promise.all(
      jobs.value.map(async job => {
        if (job.idCreator && !avatars.value[job.idCreator]) {
          const profile = await getProfile(job.idCreator)
          avatars.value[job.idCreator] = profile.avatar
        }
      }),
    )
  } catch (error) {
    console.error(error);
    
  }

}


// fungsi untuk ambil avatar profile
// const getProfile = async (id, type = 'creator', jobId = null) => {
//   if (!id) return

//   if (type === 'creator') {
//     if (avatars.value[id]) return
//     const response = await apiFetch(`/profile/${id}`)
//     avatars.value[id] = response.data.user.avatar
//   }

//   if (type === 'invite' && jobId) {
//     if (!invitesAvatars.value[jobId]) {
//       invitesAvatars.value[jobId] = []
//     }

//     const alreadyFetched = invitesAvatars.value[jobId].find(a => a.userId === id)
//     if (alreadyFetched) return

//     const response = await apiFetch(`/profile/${id}`)
//     invitesAvatars.value[jobId].push({
//       userId: id,
//       avatar: response.data.user.avatar,
//     })
//   }
// }

async function getSubAccountId(teknisiId) {
  try {
    const response = await apiFetch(`/profile/${teknisiId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data.user.subAccountId
  } catch (error) {
    sweetAlert.error(error.message)
  }
}

// async function approveJobRequest(jobId) {
//   try {
//     const response = await apiFetch(`/jobs/${jobId}/approve-job-request`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })
//     // console.log('response approve : ', response.data);
//     return response.data
//   } catch (error) {
//     sweetAlert.error()
//   }
// }

// async function completeJob(jobId, status) {
//   try {
//     const response = await apiFetch(`/jobs/${jobId}/is-job-completed`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ status }),
//     })
//     // console.log('response complete : ', response.data);
//     return response.data
//   } catch (error) {
//     sweetAlert.error(error.message)
//   }
// }
async function cancelJob(jobId) {
  
  try {
    const response = await apiFetch(`/jobs/${jobId}/cancel-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('response cancel : ', response.data)
    return response.data
  } catch (error) {
    console.error('gagal melakukan cancel job')
  }
}



async function handleCancel(jobId) {
  showSidebar.value = false
  const result = await sweetAlert.confirm({
    title: 'Cancel Jobs?',
    text: 'Apakah anda yakin ingin cancel Job?',
    confirmText: 'Ya, cancel!',
    cancelText: 'Batal',
  })

  if (result.isConfirmed) {
    const cancelJobData = await cancelJob(jobId)
    console.log(cancelJobData)
    sweetAlert.success(cancelJobData.message)
  }
}

const openDetail = async job => {
  selectedJob.value = job
  const profile = await apiFetch(`/profile/${job.idCreator}`)  
  if (selectedJob.value.selectedTechnician) {
    const subAccountId = await getSubAccountId(selectedJob.value.selectedTechnician)
    selectedJob.value.subAccountId = subAccountId
  }
  selectedJob.value.creatorName = profile.data.user.nama
  selectedJob.value.creatorEmail = profile.data.user.email
  showSidebar.value = true
}


const openReview = () => {
  showRatingModal.value = true
  showSidebar.value = false
}

const review = ref()

async function getReviewByJobId(jobId, userId) {
  try {
    const response = await apiFetch(`/review/${jobId}/${userId}/get-review-byJobId`)
    return response.data.review
  } catch (error) {
    console.error(error.message)
  }
}



onMounted(async () => {
  const test = await getPostedJobs()
  console.log('posted jobs : ', test);
  
  jobs.value.forEach(async (e, i) => {
    const response = await getReviewByJobId(e._id, e.idCreator)
    review.value = response
    console.log('data review : ', review.value)
  })
})
</script>

<template>
  <div class="page-wrapper">
    <div class="page-content">
 
      <!-- ── Header ── -->
      <div class="page-header">
        <div class="page-header__text">
          <h2 class="page-title">Riwayat perbaikan</h2>
          <p class="page-subtitle">Daftar barang yang kamu unggah</p>
        </div>
        <div v-if="jobs.length > 0" class="job-count-badge">
          {{ jobs.length }} pekerjaan
        </div>
      </div>
 
      <!-- ── Job List ── -->
      <template v-if="jobs.length > 0">
        <div class="container-job">
          <CardJobClient
            v-for="(item, i) in jobs"
            :key="i"
            :id="item._id"
            :title="item.title"
            :deadline="item.deadline"
            :desc="item.description"
            :category="item.category"
            :status="item.status"
            :creator="item.creatorName"
            :technician-name="item.technicianName"
            :avatarPlaceholder="avatar1"
            class="job-card-item"
            @click="openDetail(item)"
          />
        </div>
      </template>
 
      <!-- ── Empty State ── -->
      <template v-else>
        <div class="empty-state">
          <div class="empty-state__icon">
            <i class="ri-briefcase-4-line"></i>
          </div>
          <h3 class="empty-state__title">Belum pernah mengunggah pekerjaan</h3>
          <p class="empty-state__sub">
            unggah lebih banyak pekerjaan untuk menyelesaikan kerusakan!
          </p>
          <div class="empty-state__hint">
            <i class="ri-lightbulb-line"></i>
            Pastikan informasi pekerjaan yang kamu unggah sudah akurat.
          </div>
        </div>
      </template>
 
    </div>
  </div>

  <!-- Sidebar kanan untuk detail job -->
   <SlideJobDetail
    :showSidebar="showSidebar"
    :selectedJob="selectedJob"
    :isCancelable="true"
    @close="showSidebar = false"
    @cancel="handleCancel"
  />
  

  <!-- Modal Pop-up Rating -->
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
.text-danger {
  color: #dc3545;
}
.text-sm {
  font-size: 0.9rem;
}
.container-job {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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
/* .slide-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: flex-end;
  z-index: 2000;
}

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
} */
</style>
