<script setup>
import ReadReview from '@/components/form/ReadReview.vue'
import { apiFetch, getProfile } from '@/utils/api'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const technicianId = route.params.id
const reviewModalVisible = ref(false)

const jobs = ref([])
const reviews = ref([])


async function getAcceptedJobs(technicianId) {
  try {
    const response = await apiFetch(`/jobs/${technicianId}/job-history`)

    jobs.value = response.data.jobs
  } catch (error) {
    console.error(error)
  }
}

async function getprofileById(senderId){
  try {
    const response = await getProfile(senderId)
    // profile.value = response
    console.log('Profile:', response)
    return response
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}

const allReviews = ref([])

async function getAllReviews(technicianId){
  try {
    const response = await apiFetch(`/review/${technicianId}/get-review`)
    const reviewData = response.data.review || []
    
    const reviewsWithProfile = await Promise.all(
      reviewData.map(async (review)=>{
        const profile = await getprofileById(review.senderId)

        return {
          ...review,
          senderProfile: profile
        }
      })
    )

    allReviews.value = reviewsWithProfile
  } catch (error) {
    console.error(error)
  }
}

function hasReview(jobId) {
  // cari review yang memiliki jobId sama
  // return true / false
  return allReviews.value.some(r => r.jobId === jobId)
}

function openReview(jobId){
  reviews.value = allReviews.value.filter(r => r.jobId === jobId)
  reviewModalVisible.value = true
}


onMounted(async () => {
  await getAcceptedJobs(technicianId)
  await getAllReviews(technicianId)
})
</script>

<template>
  <VCard title="Riwayat Pekerjaan">

    <!-- LIST JOB HISTORY -->
    <VCardText>
      <VRow>
        <VCol
          v-for="job in jobs"
          :key="job._id"
          cols="12"
        >
          <VCard class="pa-3">
            <div class="d-flex gap-4 history-container">

              <!-- FOTO JOB -->

              <div class="carousel-wrap">
                <CCarousel controls indicators>
                  <CCarouselItem v-for="(image, index) in job.photos || []" :key="index">
                    <img class="carousel-img" :src="`http://localhost:3000/uploads/jobs/${image}`" />
                  </CCarouselItem>
                </CCarousel>
              </div>
              
              <!-- INFORMASI JOB -->
              <div class="flex-grow-1">

                <div class="title-container d-flex justify-space-between align-center mb-1">
                  <h3 class="text-subtitle-1 font-weight-bold">
                    {{ job.title }}
                  </h3>

                  <VChip
                    color="success"
                    size="small"
                    variant="tonal"
                  >
                    {{ job.status }}
                  </VChip>
                </div>

                <div class="text-body-2 text-medium-emphasis mb-2">
                  <VIcon size="16" icon="ri-price-tag-3-line" class="me-1"/>
                  {{ job.category }}
                </div>

                <div class="text-body-2 text-medium-emphasis mb-2">
                  <VIcon size="16" icon="ri-calendar-line" class="me-1"/>
                  {{ job.deadline.start_date }} - {{ job.deadline.end_date }}
                </div>

                <div
                  class="text-body-2"
                  v-html="job.description"
                />
                <div class="review-btn" v-if="hasReview(job._id)">
                  <VBtn
                    color="success"
                    variant="elevated"
                    class="mt-4 mx-2"
                    @click="openReview(job._id)">
                    Lihat Review
                  </VBtn>
                </div>

              </div>

            </div>
          </VCard>
        </VCol>
      </VRow>

      <!-- JIKA TIDAK ADA JOB -->
      <div
        v-if="jobs.length === 0"
        class="text-center text-medium-emphasis py-6"
      >
        <VIcon icon="ri-inbox-line" size="40" class="mb-2"/>
        <div>Belum ada riwayat pekerjaan</div>
      </div>

    </VCardText>
  </VCard>
  <ReadReview 
    v-for="review in reviews" :key="review.id" 
    v-model="reviewModalVisible" 
    :ratings="review.rating" 
    :comment="review.comment" 
    :sender-name="review.senderProfile.nama" 
    :avatar="review.senderProfile.avatar"
  />
</template>

<style scoped>
.carousel-wrap {
  width: 30%;
  max-height: 300px;
  overflow: hidden;
  background: #f4f0ff;
}
 
.carousel-img {
  width: 100%;
  height: 210px;
  object-fit: cover;
  display: block;
  border-radius: 20px;
}
 
@media (max-width: 1023px) {
  .history-container {
    flex-direction: column;
    align-items: center;
  }

  .history-container .image {
    width: 80%;
    height: auto;
  }

  .history-container .flex-grow-1 {
    width: 100%;
    text-align: center;
  }
}
@media (max-width: 768px) {
  .history-container .image {
    width: 100%;
    height: auto;
  }
  .title-container{
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>
