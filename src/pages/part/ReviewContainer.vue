<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import avatar1 from '@images/avatars/avatar-1.png'
import { onMounted } from 'vue';

const props = defineProps({
  userId : {
    type: String,
    required: true
  }
})
// Data dummy ulasan
const reviews = ref([])

async function getProfile(id){
  try {
    const response = await apiFetch(`/profile/${id}`)
    return response.data.user
  } catch (error) {
    sweetAlert.error(error.message)
  }
}
async function getReviewByUserId(id){
  try {    
    const response = await apiFetch(`/review/${id}/get-review`)
    reviews.value = response.data.review
    reviews.value.forEach(async(item, i) => {
      const profile = await getProfile(item.senderId)
      // console.log('avatar : ', profile.avatar);
      
      reviews.value[i].user = profile.nama
      reviews.value[i].avatar = profile.avatar
      
    });
    
    
  } catch (error) {
    sweetAlert.error(error.message)
  }
}


watch(() => props.userId,
  (newId) => {
    if (newId) getReviewByUserId(newId)

  },
)
</script>
<template>
  <VCol cols="12">
      <!-- 👉 Kartu Ulasan -->
      <VCard title="Ulasan">
        <VCardText>
          <!-- Daftar Komentar (Scrollable Area) -->
          <div class="review-list">
            <div
              v-for="(review, index) in reviews"
              :key="index"
              class="mb-4 border-b pb-3"
            >
              <div class="d-flex align-center justify-space-between">
                <div>
                  <VAvatar size="36">
                    <VImg :src="review.avatar ? `http://localhost:3000${review.avatar}` : avatar1" />
                  </VAvatar>&nbsp;
                  <strong>{{ review.user }}</strong>
                  <div class="text-grey text-caption">{{ review.date }}</div>
                </div>

                <!-- Rating Bintang -->
                <div class="text-warning">
                  <CRating :value="review.rating" />
                </div>
              </div>

              <!-- Isi Komentar -->
              <div class="mt-2 text-body-2">
                {{ review.comment }}
              </div>
            </div>
          </div>


        </VCardText>
      </VCard>
    </VCol>

</template>
<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
.text-warning {
  color: #fbc02d;
}

/* ✅ Scroll untuk daftar ulasan */
.review-list {
  max-height: 300px; /* batas tinggi area komentar */
  overflow-y: auto;  /* aktifkan scroll vertikal */
  padding-right: 6px;
}

/* opsional: styling scrollbar agar lebih halus */
.review-list::-webkit-scrollbar {
  width: 6px;
}
.review-list::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}
.review-list::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}
</style>
