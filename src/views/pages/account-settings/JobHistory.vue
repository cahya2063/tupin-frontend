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
const profile = ref()


async function getAcceptedJobs(technicianId) {
  try {
    const response = await apiFetch(`/jobs/${technicianId}/job-history`)
    // console.log('accepted jobs : ', response.data)

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

async function getReviewByReceiverId(receiverId){
  try {
    const response = await apiFetch(`/review/${receiverId}/get-review`)
    const reviewData = response.data.review

    const reviewsWithProfile = await Promise.all(
      reviewData.map(async (review)=>{
        const profile = await getprofileById(review.senderId)

        return {
          ...review,
          senderProfile: profile
        }
      })
    )

    reviews.value = reviewsWithProfile

    // console.log('reviews with profile : ', reviews.value)
    
    // return response.data.review
  } catch (error) {
    console.error(error)
  }
}

async function openReview(technicianId){
  reviewModalVisible.value = true
  await getReviewByReceiverId(technicianId)
  // profile.value = await getprofileById(reviews.value[0].senderId)
  // console.log('review value : ', reviews.value[0].senderProfile.nama);
  
  // await getprofileById(review.value.senderId)
}


onMounted(async () => {
  await getAcceptedJobs(technicianId)
  
  // await getReviewByJobId(jobs.value[0].id)
})
</script>

<template>
  <VCard title="Riwayat Pekerjaan">
    <VCardText>
      We need permission from your browser to show notifications.
      <a href="javascript:void(0)">Request Permission</a>
    </VCardText>

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
              <VImg
                cover
                class="rounded image"
                :src="`http://localhost:3000/uploads/jobs/${job.photo}`"
              />

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
                <div class="review-btn">
                  <VBtn
                    color="success"
                    variant="elevated"
                    class="mt-4 mx-2"
                    @click="openReview(technicianId)">
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
  <ReadReview v-for="review in reviews" :key="review.id" v-model="reviewModalVisible" :ratings="review.rating" :comment="review.comment" :sender-name="review.senderProfile.nama" :avatar="review.senderProfile.avatar"/>
</template>

<style scoped>
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
