<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import AnalyticsUserTable from '@/views/dashboard/AnalyticsUserTable.vue';
import { onMounted } from 'vue';

const technicians = ref([])
const headers = [
  { title: 'Nama', key: 'nama' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'City', key: 'city' },
  { title: 'Phone Number', key: 'phone_number' },
  { title: 'Description', key: 'description' },
  { title: 'Skills', key: 'skills' },
]
async function getTechnicianPending(){
    try {
        const response = await apiFetch('/profile/get-pending-technician')
        technicians.value = response.data.technician
        console.log('technician value : ', technicians.value);
        
    } catch (error) {
        sweetAlert.error(error.message)
    }
}

onMounted(async()=>{
    await getTechnicianPending()
})

</script>
<template>
  <AnalyticsUserTable
    :headers="headers"
    :items="technicians"

  />
</template>
<style scoped>

</style>
