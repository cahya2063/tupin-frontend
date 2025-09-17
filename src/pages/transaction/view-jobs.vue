<script setup>
import { apiFetch } from '@/utils/api';
import { onMounted, ref } from 'vue';
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
const jobs = ref([])
const detailJobs = ref()
const avatars = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
]
const xlDemo = ref(false)
async function getJobs() {
  const response = await apiFetch('/jobs')
  jobs.value = response.data.jobs
}

async function getDetailJobs(id){
  xlDemo.value = true
  const response = await apiFetch(`/jobs/${id}`)
  console.log('response : ', response.data.job);
  
  detailJobs.value = response.data.job
  
  console.log('data detail jobs : ', detailJobs.value.title);
}

onMounted(()=>{
    getJobs()
})   
</script>
<template>
<VRow class="jobs-container">
    <VCol
      v-for="(item, i) in jobs"
      :key="i"
      cols="12"
      sm="6"
      md="4"
    >
      <VCard>
        <VImg :src="`http://localhost:3000/uploads/jobs/${item.photo}`" />

        <VCardText class="position-relative">
          <!-- User Avatar -->
          <VAvatar size="75" class="avatar-center" :image="avatar1" />

          <!-- Title, Subtitle & Action Button -->
          <div class="d-flex justify-space-between flex-wrap pt-8">
            <div class="me-2 mb-2">
              <VCardTitle class="pa-0">
                {{ item.title }}
              </VCardTitle>
              <VCardSubtitle class="text-caption pa-0">
                {{ item.category }}
              </VCardSubtitle>
            </div>
            <VBtn color="primary" @click="getDetailJobs(item._id)" :data-id="`${item._id}`">detail</VBtn>
          </div>

          <!-- Mutual Friends -->
          <div class="d-flex justify-space-between align-center mt-8">
            <span class="font-weight-medium">18 mutual friends</span>
            <div class="v-avatar-group">
              <VAvatar
                v-for="(avatar, idx) in avatars"
                :key="idx"
                :image="avatar"
                size="40"
              />
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <CModal
      size="xl"
      :visible="xlDemo"
      @close="() => { xlDemo = false }"
      aria-labelledby="OptionalSizesExample1"
    >
    <CModalHeader>
      <CModalTitle id="OptionalSizesExample1">{{ detailJobs?.title }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CImage align="center" rounded :src="`http://localhost:3000/uploads/jobs/${detailJobs?.photo}`" width="50%"/>
      <hr>
      <div class="category-text">
        kategori : {{ detailJobs?.category }}
      </div>
      <hr>
      <div class="description">
        deskripsi kerusakan alat : <br> {{ detailJobs?.description }}
      </div>
      <hr>
      <div class="description">
        budget : {{ detailJobs?.budget }} pengalaman : {{ detailJobs?.experiences }}
      </div>
      <hr>
      Skill :
      <div v-for="(skill, idx) in detailJobs?.skills" :key="idx">
        <CBadge textBgColor="primary">{{skill}}</CBadge>
      </div>
      <hr>
      <div class="description">
        <CDateRangePicker
          label="Deadline pengerjaan"
          locale="en-US"
          :start-date="detailJobs?.deadline?.start_date || ''"
          :end-date="detailJobs?.deadline?.end_date || ''"
        />
      </div>

    </CModalBody>
  </CModal>
</template>
<style scoped>
.category-text{
  font-size: 17px;
  margin-block: 40px;
}
.description{
  margin-block: 40px;

}
</style>
