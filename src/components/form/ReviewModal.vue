<script setup>
import { ref } from 'vue'
import sweetAlert from '@/utils/sweetAlert'
import { apiFetch } from '@/utils/api'

const props = defineProps({
  show: Boolean,
  senderId: String,
  receiverId: String,
  jobId: String,
})
const emits = defineEmits(['update:show', 'review-submitted'])

// state lokal
const rating = ref(0)
const comment = ref('')
const errors = ref({
  rating: '',
  comment: ''
})

// kirim review
const createRating = async () => {
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
    senderId: props.senderId,
    receiverId: props.receiverId,
    jobId: props.jobId,
    rating: rating.value,
    comment: comment.value
  }

  try {
    const response = await apiFetch(`/review/create-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    sweetAlert.success(response.data.message)

    // beri tahu parent bahwa review berhasil dikirim
    emits('review-submitted', response.data)
    emits('update:show', false)

    // reset form
    rating.value = 0
    comment.value = ''
  } catch (error) {
    sweetAlert.error(error.message)
  }
}
</script>

<template>
  <VDialog v-model="props.show" max-width="800">
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
          />
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
