<script setup>
import { apiFetch } from '@/utils/api';
import { onMounted, ref } from 'vue';
import avatar1 from '@images/avatars/avatar-1.png'
import sweetAlert from '@/utils/sweetAlert';
import CardJob from '@/layouts/components/CardJob.vue';


// avatars creator
const avatars = ref({})
// avatars untuk invites per job
const invitesAvatars = ref({})
const xlDemo = ref(false)


const acceptedJobs = ref([])
const detailJobs = ref()
const userId = localStorage.getItem('userId')
const userName = ref([])
const isCancelable = computed(() => 
  ['pending', 'request'].includes(detailJobs.value?.status)
)
const showRatingModal = ref(false)

const rating = ref(0)
const comment = ref('')

// untuk validasi required
const errors = ref({
  rating: '',
  comment: ''
})
async function getAcceptedJobs(technicianId){
  try {
    const response = await apiFetch(`/jobs/${technicianId}/accepted-jobs`)
    acceptedJobs.value = response.data.jobs

    for (const job of acceptedJobs.value) {
      const profile = await getProfile(job.idCreator)
      job.creatorName = profile.nama
    }
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

async function doneJobRequest(jobId){
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
        'Content-Type': 'application/json'
      }
    })
    console.log('response cancel : ', response.data);
    return response.data
    
  } catch (error) {
    console.error('gagal melakukan cancel job');
    
  }
}

const review = ref()

async function getReviewByJobId(jobId, userId){
  try {    
    const response = await apiFetch(`/review/${jobId}/${userId}/get-review-byJobId`)
    return response.data.review
    
  } catch (error) {
    sweetAlert.error(error.message)
  }
}

const createRating = async() => {
  // reset pesan error dulu
  errors.value.rating = ''
  errors.value.comment = ''
  let valid = true

  if (!rating.value || rating.value === 0) {
    errors.value.rating = 'Rating wajib diisi.'
    valid = false
  }

  if (!comment.value.trim()) {
    errors.value.comment = 'Komentar wajib diisi.'
    valid = false
  }

  if (!valid) return
  const data = {
    senderId: userId,
    receiverId: detailJobs.value.idCreator,
    jobId: detailJobs.value._id,
    rating: rating.value,
    comment: comment.value
  }

  xlDemo.value = false
  showRatingModal.value = false
  try {
    const response = await apiFetch(`/review/create-review`, {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    sweetAlert.success(response.data.message)

    
  } catch (error) {
    sweetAlert.error(error.message)
  }
}

async function handleTechnicianRequest(){
  xlDemo.value = false
  const result = await sweetAlert.confirm({
    title: 'Ajukan perbaikan?',
    text: 'pastikan anda sudah punya kesepakatan dengan klien melalui chat',
    confirmText: 'Ya, kirim!',
    cancelText: 'Batal'
  })

  if(result.isConfirmed){
    const approveData = await technicianRequest(detailJobs.value._id)
    console.log(approveData);
    sweetAlert.success(approveData.message)
    
  }
}
async function handleDoneJob(){
  xlDemo.value = false
  const result = await sweetAlert.confirm({
    title: 'Sudah diperbaiki?',
    text: 'pastikan anda sudah menyelesaikan perbaikan alat klien',
    confirmText: 'Ya, sudah!',
    cancelText: 'Batal'
  })

  if(result.isConfirmed){
    const approveData = await doneJobRequest(detailJobs.value._id)
    console.log(approveData);
    sweetAlert.success(approveData.message)
    
  }
}

async function handleCancel() {
  xlDemo.value = false
  const result = await sweetAlert.confirm({
    title: 'Cancel Jobs?',
    text: 'Apakah anda yakin ingin cancel Job?',
    confirmText: 'Ya, cancel!',
    cancelText: 'Batal'
  })

  if (result.isConfirmed) {
    const cancelJobData = await cancelJob(detailJobs.value._id)
    console.log(cancelJobData)
    sweetAlert.success(cancelJobData.message)
  }
}

onMounted(async()=>{
    await getAcceptedJobs(userId)

    acceptedJobs.value.forEach(async(e, i)=>{
    const response = await getReviewByJobId(e._id, e.selectedTechnician)
    review.value = response
    console.log('data review : ', review.value);
    
  })
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
  <transition name="slide-fade">
  <div v-if="xlDemo" class="slide-modal-overlay" @click.self="xlDemo = false">
    <div class="slide-modal-content">
      <div class="slide-modal-header">
        <h4>{{ detailJobs?.title }} </h4>
        <button class="close-btn" @click="xlDemo = false">×</button>
      </div>
      
      <div class="slide-modal-body">
        <h5 style="color: red;" v-if="detailJobs?.status == `progress` ">Request anda disetujui segera perbaiki alat clientmu!</h5>
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

      <div class="apply-btn d-flex justify-end my-4">
        <VBtn
          v-if="detailJobs.status == `progress`"
          color="success"
          variant="elevated"
          @click="handleDoneJob"
        >
          Perbaikan selesai
        </VBtn>
        <VBtn
        class="mx-4"
          color="primary"
          variant="elevated"
          @click="createChat(detailJobs.idCreator, detailJobs.selectedTechnician)"
          :to="`/chat-view`"
        >
          💬 Hubungi
        </VBtn>
        <VBtn
            v-if="detailJobs.status == 'pending'"
            style="margin-right: 20px;"
            color="success"
            variant="elevated"
            @click="handleTechnicianRequest"
          >
            Ajukan perbaikan
        </VBtn>

        <VBtn
            v-if="detailJobs?.status == 'payed done' && !review"
            class=" me-4"
            color="success"
            @click="showRatingModal = true"
          >Beri Review
        </VBtn>

        <VBtn
          style="margin-right: 20px;"
          color="danger"
          variant="elevated"
          v-if="isCancelable"
          @click="handleCancel"
        >
          Cancel
        </VBtn>
      </div>
    </div>
  </div>
</transition>
<!-- Modal Pop-up Rating -->
  <VDialog v-model="showRatingModal" max-width="800">
    <VCard style="font-family: 'Poppins';">
      <VCardTitle class="d-flex justify-between align-center">
        <span>Form Rating</span>
      </VCardTitle>

      <div class="d-flex justify-center">
        <CForm style="width: 90%;">
          <CRating v-model="rating" allowClear class="my-2" />
          <div v-if="errors.rating" class="text-danger text-sm mt-1">
            {{ errors.rating }}
          </div>
          <CFormTextarea
            id="comment"
            label="Komentar review"
            rows="4"
            text="Must be 8-20 words long."
            v-model="comment"
            required
          ></CFormTextarea>
          <div v-if="errors.comment" class="text-danger text-sm mt-1">
            {{ errors.comment }}
          </div>

          <div class="d-flex justify-end my-3">
            <VBtn color="success" @click="createRating">Kirim Review</VBtn>
          </div>
        </CForm>
      </div>
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

.info-box {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #334155;
}
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
  width: 50%;
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

