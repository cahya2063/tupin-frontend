<script setup>
import AnalyticsUserTable from '@/layouts/components/AnalyticsUserTable.vue';
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
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

async function approveTechnician(item){
  try {
    const technicianId = item._id || item.id
    const response = await apiFetch(`/profile/approve/${technicianId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    sweetAlert.success(response.data?.message || 'Teknisi berhasil disetujui')
    await getTechnicianPending()
    
  } catch (error) {
    sweetAlert.error(error.message)
  }
}

async function rejectTechnician(item){
  try {
    const technicianId = item._id || item.id
    const response = await apiFetch(`/profile/reject/${technicianId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    sweetAlert.success(response.data?.message || 'Teknisi berhasil ditolak')
    await getTechnicianPending()
    
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
    @accept="approveTechnician"
    @reject="rejectTechnician"
  />
</template>
<style scoped>

</style>
