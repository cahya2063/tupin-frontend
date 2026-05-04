<script setup>
import { getProfile } from '@/utils/api';
import { onMounted, watch } from 'vue';

const props = defineProps({
    avatar : String,
    senderName: String,
    ratings: Number,
    comment: String
})

// watch(() => props.senderId, async (newId) => {
//   if (newId) {
//     console.log('sender Id : ', newId)
//     await getprofileById(newId)
//   }
// })
console.log('debug rating : ', props.ratings);

</script>
<template>
    <!-- v-model="props.show" -->
  <VDialog
    max-width="800"
  >
    <VCard style="font-family: 'Poppins'">
      <!-- <VCardTitle class="d-flex justify-between align-center"> -->
        
        <div class="card-profile mx-4">
          <img
            :src="`http://localhost:3000${props.avatar}`"
            class="avatar"
          />
          <span>{{ props.senderName }}</span>
        </div>
      <!-- </VCardTitle> -->

      <div class="d-flex justify-center">
          <CForm style="width: 90%">
            <!-- v-model="rating" -->
            <CRating readOnly v-model="props.ratings" class="card-rating mb-3" />
          <!-- v-if="errors.rating" -->
          <div
            class="text-danger text-sm mt-1"
          >
            <!-- {{ errors.rating }} -->
          </div>
          <!-- v-model="comment" -->
          <CFormTextarea
            :model-value="props.comment"
            disabled
            readonly
          />
          <!-- v-if="errors.comment" -->
          <div
            class="text-danger text-sm mt-1"
          >
            <!-- {{ errors.comment }} -->
          </div>

          <div class="d-flex justify-end my-3">
            
          </div>
        </CForm>
      </div>
    </VCard>
  </VDialog>
</template>
<style scoped>

.card-profile{
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.card-profile span{
  font-weight: 600;
  font-size: 16px;
}
.avatar{
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
