<script setup>
import { apiFetch, getProfile } from '@/utils/api'
import { onMounted, ref } from 'vue'
import avatar1 from '@images/avatars/avatar-1.png'
import sweetAlert from '@/utils/sweetAlert'
import CardJob from '@/layouts/components/CardJob.vue'
import ReviewModal from '@/components/form/ReviewModal.vue'
import SlideJobDetail from '@/layouts/components/SlideJobDetail.vue'

// avatars creator
const avatars = ref({})
// avatars untuk invites per job
// const invitesAvatars = ref({})
const showSidebar = ref(false)

const acceptedJobs = ref([])
const selectedJob = ref()
const userName = ref([])
const isCancelable = computed(() => ['pending', 'request'].includes(selectedJob.value?.status))
const showRatingModal = ref(false)
const userId = localStorage.getItem('userId')
const receiverId = computed(() => selectedJob.value?.idCreator)
const jobId = computed(() => selectedJob.value?._id)

// event ketika review berhasil dikirim
function handleReviewSubmitted(data) {
  console.log('Review tersimpan:', data)
  // bisa tambahkan logika refresh data job, dll.
}

async function getAcceptedJobs(technicianId) {
  try {
    const response = await apiFetch(`/jobs/${technicianId}/accepted-jobs`)
    acceptedJobs.value = response.data.jobs
    console.log('accepted jobs : ', acceptedJobs.value[0].deadline);
    

    for (const job of acceptedJobs.value) {
      const profile = await getProfile(job.idCreator)
      job.creatorName = profile.nama
    }
    // Ambil semua avatar secara paralel
    await Promise.all(
      acceptedJobs.value.map(async job => {
        if (job.idCreator && !avatars.value[job.idCreator]) {
          const profile = await getProfile(job.idCreator)
          avatars.value[job.idCreator] = profile.avatar
        }
      }),
    )
  } catch (error) {
    console.error(error)
  }
}

async function getDetailJobs(id) {
  try {
    const response = await apiFetch(`/jobs/${id}`)
    selectedJob.value = response.data.job

    // Ambil profil creator berdasarkan idCreator dari job detail
    const profile = await getProfile(selectedJob.value.idCreator)
    userName.value = profile.nama // simpan nama creator

    showSidebar.value = true
  } catch (error) {
    console.error(error)
  }
}

async function createChat(clientId, technicianId) {
  try {
    const response = await apiFetch(`/chats/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: clientId,
        technicianId: technicianId,
      }),
    })
    console.log('Chat created:', response.data)
  } catch (error) {
    console.error('Gagal membuat chat:', error)
  }
}

async function technicianRequest(jobId) {
  try {
    const response = await apiFetch(`/jobs/${jobId}/technician-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    sweetAlert.error()
  }
}

async function doneJobRequest(jobId) {
  try {
    const response = await apiFetch(`/jobs/${jobId}/done-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    sweetAlert.error()
  }
}

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

const review = ref()

async function getReviewByJobId(jobId, userId) {
  try {
    const response = await apiFetch(`/review/${jobId}/${userId}/get-review-byJobId`)
    return response.data.review
  } catch (error) {
    sweetAlert.error(error.message)
  }
}

async function handleTechnicianRequest() {
  showSidebar.value = false
  const result = await sweetAlert.confirm({
    title: 'Ajukan perbaikan?',
    text: 'pastikan anda sudah punya kesepakatan dengan klien melalui chat',
    confirmText: 'Ya, kirim!',
    cancelText: 'Batal',
  })

  if (result.isConfirmed) {
    const approveData = await technicianRequest(selectedJob.value._id)
    console.log(approveData)
    sweetAlert.success(approveData.message)
  }
}
async function handleDoneJob() {
  showSidebar.value = false
  const result = await sweetAlert.confirm({
    title: 'Sudah diperbaiki?',
    text: 'pastikan anda sudah menyelesaikan perbaikan alat klien',
    confirmText: 'Ya, sudah!',
    cancelText: 'Batal',
  })

  if (result.isConfirmed) {
    const approveData = await doneJobRequest(selectedJob.value._id)
    console.log(approveData)
    sweetAlert.success(approveData.message)
  }
}

async function handleCancel() {
  showSidebar.value = false
  const result = await sweetAlert.confirm({
    title: 'Cancel Jobs?',
    text: 'Apakah anda yakin ingin cancel Job?',
    confirmText: 'Ya, cancel!',
    cancelText: 'Batal',
  })

  if (result.isConfirmed) {
    const cancelJobData = await cancelJob(selectedJob.value._id)
    console.log(cancelJobData)
    sweetAlert.success(cancelJobData.message)
  }
}

onMounted(async () => {
  await getAcceptedJobs(userId)
  

  // acceptedJobs.value.forEach(async (e, i) => {
  //   const response = await getReviewByJobId(e._id, e.selectedTechnician)
  //   review.value = response
  //   console.log('data review : ', review.value)
  // })
})
</script>
<template>
  <VRow class="jobs-container pa-4">
    <!-- ambil job yang diterima -->
    <template v-if="acceptedJobs.length > 0">
      <div class="container-job">
        <CardJob
          v-for="(item, i) in acceptedJobs"
          :key="i"
          :id="item._id"
          :title="item.title"
          :deadline=" item.deadline"
          :desc="item.description"
          :category="item.category"
          :status="item.status"
          @click="getDetailJobs(item._id)"
          :creator="item.creatorName"
          :avatarPlaceholder="avatar1"
        />
      </div>
    </template>

    <!-- Jika tidak ada job -->
    <template v-else>
      <VCol cols="12">
        <div class="text-center py-10">
          <h3>Belum ada yang menerima apply mu 😔</h3>
          <p class="text-subtitle-2 text-grey-darken-1">
            Coba lamar lebih banyak pekerjaan untuk meningkatkan peluangmu!
          </p>
        </div>
      </VCol>
    </template>
  </VRow>

  <!-- Sidebar kanan untuk detail job -->
   <SlideJobDetail
    :showSidebar="showSidebar"
    :selectedJob="selectedJob"
    @close="showSidebar = false"
  />
  
  <ReviewModal
    v-model:show="showRatingModal"
    :sender-id="userId"
    :receiver-id="receiverId"
    :job-id="jobId"
    @review-submitted="handleReviewSubmitted"
  />
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

</style>
