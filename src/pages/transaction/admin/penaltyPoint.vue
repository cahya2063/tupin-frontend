<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { backendUrl } from '@/utils/tools';
import { onMounted, ref } from 'vue';

const technicians = ref([])
const loading = ref(true)

async function getTechnicianPoint(){
    try {
        loading.value = true
        const response = await apiFetch('/profile/get-technician-point')
        technicians.value = response.data.technician || []
    } catch (error) {
        sweetAlert.error(error.message)
    } finally {
        loading.value = false
    }
}

async function disableTechnician(technianId) {
    try {
        loading.value = true
        const response = await apiFetch(`/reports/${technianId}/disable-technician`, {
            method: 'POST'
        })
        if(response.status == 201){
            sweetAlert.success(response.data.message)
            await getTechnicianPoint()
            loading.value = false
        }
    } catch (error) {
        sweetAlert.error(error.message)
    }
}

const handleDisableTechnician = async (technianId)=>{
    try {
        console.log('technicianId : ', technianId);
        
        const result = await sweetAlert.confirm({
            title: 'Apakah kamu ingin non aktifkan teknisi?',
            text: 'teknisi yang dinon aktifkan tidak bisa menerima perbaikan.',
            // showCancelButton: false,
            showCancelButton: true,
            confirmText: 'Ya, Nonaktifkan'
        })
        if(result.isConfirmed){
            await disableTechnician(technianId)
        }
    } catch (error) {
        sweetAlert.error(error.message)
    }
}

onMounted( async ()=>{
    await getTechnicianPoint()
})


const formatCity = (city) => city || '-'
const formatSkills = (skills) => {
  if (Array.isArray(skills) && skills.length > 0) return `${skills.length} Keahlian`
  return 'Belum ada keahlian'
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-content">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-text">
          <h2 class="title">Poin Penalti Teknisi</h2>
          <p class="subtitle">Pantau dan kelola poin penalti dari semua teknisi yang terdaftar.</p>
        </div>
        <div class="header-action">
          <div class="total-badge">
            <i class="ri-group-line"></i> Total: {{ technicians.length }} Teknisi
          </div>
        </div>
      </div>

      <!-- Main Table Container -->
      <div class="table-container">
        
        <!-- Loading State -->
        <div v-if="loading" class="state-container">
          <div class="spinner"></div>
          <p>Memuat data teknisi...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="technicians.length === 0" class="state-container">
          <i class="ri-user-search-line empty-icon"></i>
          <h3>Belum ada data</h3>
          <p>Data teknisi tidak ditemukan.</p>
        </div>

        <!-- Data Table -->
        <div v-else class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Profil Teknisi</th>
                <th>Keahlian</th>
                <th>Kota</th>
                <th>Poin Penalti</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in technicians" :key="item._id">
                <!-- Profile Info -->
                <td>
                  <div class="profile-cell">
                    <img :src="`${backendUrl}${item.avatar}`" alt="Avatar" class="avatar-img" />
                    <div class="profile-info">
                      <span class="profile-name">{{ item.nama }}</span>
                      <span class="profile-email">{{ item.email }}</span>
                    </div>
                  </div>
                </td>
                
                <!-- Skills -->
                <td>
                  <div class="skill-badge">
                    <i class="ri-tools-line"></i> {{ formatSkills(item.skills) }}
                  </div>
                </td>
                
                <!-- City -->
                <td>
                  <div class="city-text">
                    <i class="ri-map-pin-line"></i> {{ formatCity(item.city) }}
                  </div>
                </td>
                
                <!-- Penalty Point -->
                <td>
                  <div class="penalty-cell">
                    <span 
                      class="penalty-value" 
                      :class="{
                        'high-penalty': item.penaltyPoint > 50, 
                        'medium-penalty': item.penaltyPoint > 0 && item.penaltyPoint <= 50,
                        'low-penalty': !item.penaltyPoint || item.penaltyPoint === 0
                      }"
                    >
                      {{ item.penaltyPoint || 0 }}
                    </span>
                    <span class="penalty-label">Poin</span>
                  </div>
                </td>
                
                <!-- Actions -->
                <td>
                  <div class="action-buttons">
                    <VBtn class="detail-btn" :to="`/report-history/${item._id}`">
                        <VIcon start icon="ri-search-line" />
                        Detail
                    </VBtn>
                    <button class="btn-action btn-disable" @click="handleDisableTechnician(item._id)">
                      <i class="ri-user-unfollow-line"></i> Nonaktifkan
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reset & Fonts */
* {
  box-sizing: border-box;
}

.page-wrapper {
  background-color: #f8f6ff;
  min-height: 100vh;
  padding: 24px;
  font-family: 'Inter', sans-serif;
}
.detail-btn{
  background-color: rgb(15, 255, 15);
  color: white;
  font-weight: bold;
}
.detail-btn:hover{
  background-color: rgba(0, 128, 0, 0.736);
}
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.page-header {
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(141, 88, 255, 0.05);
  border-left: 5px solid #8d58ff;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.total-badge {
  background: #f0ebff;
  color: #8d58ff;
  padding: 10px 18px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2d9ff;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(141, 88, 255, 0.05);
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 850px;
}

.custom-table th {
  background: #f8f6ff;
  color: #4b5563;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px 20px;
  text-align: left;
  border-bottom: 2px solid #e2d9ff;
}

.custom-table th:first-child {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.custom-table th:last-child {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.custom-table td {
  padding: 20px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.custom-table tbody tr:hover td {
  background-color: #fcfbff;
}

.custom-table tbody tr:last-child td {
  border-bottom: none;
}

/* Profile Cell */
.profile-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2d9ff;
  box-shadow: 0 2px 8px rgba(141, 88, 255, 0.1);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
  text-transform: capitalize;
}

.profile-email {
  font-size: 13px;
  color: #64748b;
}

/* Badges & Texts */
.skill-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
}

.skill-badge i {
  color: #8d58ff;
}

.city-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
}

.city-text i {
  color: #8d58ff;
}

/* Penalty Cell */
.penalty-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.penalty-value {
  font-weight: 700;
  font-size: 16px;
  padding: 6px 12px;
  border-radius: 8px;
  min-width: 44px;
  text-align: center;
}

.penalty-value.low-penalty {
  background: #f1f5f9;
  color: #475569;
}

.penalty-value.medium-penalty {
  background: #fff7ed;
  color: #ea580c;
}

.penalty-value.high-penalty {
  background: #fef2f2;
  color: #dc2626;
}

.penalty-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-action {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-detail {
  background: #f0ebff;
  color: #8d58ff;
}

.btn-detail:hover {
  background: #8d58ff;
  color: white;
  transform: translateY(-1px);
}

.btn-disable {
  background: #fef2f2;
  color: #ef4444;
}

.btn-disable:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
}

.text-center {
  text-align: center !important;
}

/* States (Loading & Empty) */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0ebff;
  border-top: 4px solid #8d58ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.state-container h3 {
  font-size: 18px;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.state-container p {
  color: #64748b;
  margin: 0;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .page-wrapper {
    padding: 16px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .table-container {
    padding: 16px;
  }
  
  .btn-action {
    padding: 8px 12px;
  }
  
  .btn-action span {
    display: none; /* Hide text on very small screens if we had it */
  }
}
</style>
