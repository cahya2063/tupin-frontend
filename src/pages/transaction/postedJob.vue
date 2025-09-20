<script setup>
import { apiFetch } from '@/utils/api';
import { onMounted, ref } from 'vue';
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
const headers = [
  {
    title: 'User',
    key: 'username',
  },
  {
    title: 'Email',
    key: 'email',
  },
  {
    title: 'Role',
    key: 'role',
  },
  {
    title: 'Status',
    key: 'status',
  },
]

const userData = ref([])

const xlDemo = ref(false)
const userId = localStorage.getItem('userId')
const jobs = ref([])
// avatars creator
const avatars = ref({}) 
// avatars untuk invites per job
const invitesAvatars = ref({})  
async function getPostedJobs(){
  const response = await apiFetch(`/jobs/uploaded/${userId}`)
  jobs.value = response.data.jobs

  for (const job of jobs.value) {
    // avatar si creator
    getProfile(job.idCreator, 'creator')

    // avatar untuk semua invites
    if (job.invites && job.invites.length > 0) {
      for (const inviteId of job.invites) {
        getProfile(inviteId, 'invite', job._id)
      }
    }
  }
}

const getProfile = async (id, type = 'creator', jobId = null) => {
  if (!id) return

  // kalau creator
  if (type === 'creator') {
    if (avatars.value[id]) return
    const response = await apiFetch(`/profile/${id}`)
    avatars.value[id] = response.data.user.avatar
  }

  // kalau invite
  if (type === 'invite' && jobId) {
    if (!invitesAvatars.value[jobId]) {
      invitesAvatars.value[jobId] = []
    }

    // cek kalau sudah ada jangan fetch lagi
    const alreadyFetched = invitesAvatars.value[jobId].find(a => a.userId === id)
    if (alreadyFetched) return

    const response = await apiFetch(`/profile/${id}`)
    userData.value.push(response.data.user)    
    
    invitesAvatars.value[jobId].push({
      userId: id,
      avatar: response.data.user.avatar,
    })
  }
}

onMounted(()=>{
    getPostedJobs()
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
           <div class="detail-cont d-flex justify-space-between align-center">
            <VAvatar
              size="75"
              class="avatar-center"
              :image="`${avatars[item.idCreator] ?`http://localhost:3000${avatars[item.idCreator]}` :  avatar1}`"
            />
            <VChip
              v-if="item.invites.find(invite => invite === userId)"
                color="success"
                size="medium"
                class="text-capitalize py-1 px-2 mx-2"
              >
              dilamar
            </VChip>
            
            <VBtn color="primary" @click="() => { xlDemo = true }" :data-id="`${item._id}`">
              Detail
            </VBtn>
          </div>


          <!-- Title, Subtitle & Action Button -->
          <div class="d-flex justify-space-between flex-wrap pt-6">
            <div class="me-2 mb-2">
              <VCardTitle class="pa-0 text-wrap">
                {{ item.title }}
              </VCardTitle>
              <VCardSubtitle class="text-caption pa-0">
                <VChip
                    color="warning"
                    size="medium"
                    class="text-capitalize py-1 px-2 mx-2"
                  >
                  {{ item.category }}
                </VChip>
              </VCardSubtitle>
            </div>
          </div>

          <!-- Mutual Friends -->
          <div class="d-flex justify-space-between align-center">
            <span class="font-weight-medium">
              {{ (invitesAvatars[item._id]?.length || 0) }} teknisi berminat
            </span>
            <div class="v-avatar-group">
              <!-- tampilkan maksimal 4 avatar -->
              <VAvatar
                v-for="(invite, idx) in (invitesAvatars[item._id] || []).slice(0,4)"
                :key="idx"
                :image="invite.avatar ? `http://localhost:3000${invite.avatar}` : avatar1"
                size="40"
              />
              <!-- kalau lebih dari 4, tampilkan badge +N -->
              <VAvatar
                v-if="(invitesAvatars[item._id]?.length || 0) > 4"
                size="40"
                color="grey lighten-1"
                class="d-flex align-center justify-center"
              >
                +{{ (invitesAvatars[item._id].length - 4) }}
              </VAvatar>
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
      <CModalTitle id="OptionalSizesExample1">Extra large modal</CModalTitle>
    </CModalHeader>
    <CModalBody>
        <VDataTable
            :headers="headers"
            :items="userData || []"
            item-value="id"
            class="text-no-wrap"
            >
        <!-- User -->
        <template #item.username="{ item }">

            <div class="d-flex align-center gap-x-4">
            <VAvatar
                size="34"
                :variant="!item.avatar ? 'tonal' : undefined"
                :color="`black`"
            >
                <VImg
                :src="item.avatar ? `http://localhost:3000${item.avatar}` : avatar1"
                />
            </VAvatar>

            <div class="d-flex flex-column">
                <h6 class="text-h6 font-weight-medium user-list-name">
                {{ item.fullName }}
                </h6>

            </div>
            </div>
        </template>
        <!-- Role -->
        <template #item.role="{ item }">
            <div class="d-flex gap-4">
            <VIcon
                :icon="`ri-user-line`"
                :color="`black`"
                size="22"
            />
            <div class="text-capitalize text-high-emphasis">
                {{ item.role }}
            </div>
            </div>
        </template>
        <!-- Plan -->
        <template #item.plan="{ item }">
            <span class="text-capitalize text-high-emphasis">{{ item.currentPlan }}</span>
        </template>
        <!-- Status -->
        <template #item.status="{ item }">
            <VChip
            :color="`black`"
            size="small"
            class="text-capitalize"
            >
            {{ item.status }}
            </VChip>
        </template>

        <template #bottom />
    </VDataTable>
    </CModalBody>
  </CModal>
</template>
<style scoped>

</style>
