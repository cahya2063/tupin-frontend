<script setup>
import AdminReportDetailModal from '@/layouts/components/AdminReportDetailModal.vue';
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { onMounted, ref } from 'vue';

const reportedJobs = ref([]);
const isDetailModalOpen = ref(false);
const selectedJob = ref(null);

async function getReportedJobs(){
    try {
        const response = await apiFetch(`/jobs/get-reported-jobs`);
        reportedJobs.value = response.data.jobs || [];
        console.log('data report job : ', reportedJobs.value);
    } catch (error) {
        sweetAlert.error(error.message);
    }
}

function openDetail(job) {
    selectedJob.value = job;
    isDetailModalOpen.value = true;
}

onMounted(async()=>{
    await getReportedJobs();
});
</script>

<template>
  <v-container fluid class="px-0 py-4">
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 font-weight-bold" style="color: #2f2a3d;">Daftar Pekerjaan Dilaporkan</h2>
    </div>

    <!-- Empty State -->
    <v-card v-if="reportedJobs.length === 0" class="pa-5 text-center elevation-0 rounded-lg" style="border: 1px dashed #ccc;">
      <v-icon size="64" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
      <div class="text-h6 mt-4 text-grey-darken-1">Tidak ada laporan pekerjaan saat ini</div>
    </v-card>

    <!-- Jobs Grid -->
    <v-row v-else>
      <v-col v-for="job in reportedJobs" :key="job._id" cols="12" md="6" lg="4">
        <v-card class="job-card elevation-2 rounded-xl h-100 d-flex flex-column bg-white">
          <v-card-text class="flex-grow-1">
            <div class="d-flex justify-space-between align-start mb-3">
              <v-chip size="small" color="error" variant="flat" class="font-weight-medium">
                Dilaporkan
              </v-chip>
              <div class="text-caption text-grey font-weight-medium">
                {{ job.category }}
              </div>
            </div>
            <h3 class="text-h6 font-weight-bold mb-2 text-truncate" style="color: #2f2a3d;">{{ job.title }}</h3>
            
            <div class="d-flex align-center mb-2 text-body-2 text-grey-darken-1">
              <v-icon size="16" class="mr-2" color="#8d85ff">mdi-map-marker</v-icon>
              <span class="text-truncate">{{ job.destination?.destinationName || 'Lokasi tidak tersedia' }}</span>
            </div>

            <div class="d-flex align-center mb-4 text-body-2 text-grey-darken-1">
              <v-icon size="16" class="mr-2" color="#8d85ff">mdi-calendar</v-icon>
              <span v-if="job.deadline">{{ job.deadline.start_date }} s/d {{ job.deadline.end_date }}</span>
              <span v-else>Jadwal tidak tersedia</span>
            </div>
            
            <!-- Report details summary -->
            <div class="report-info-box pa-3 rounded-lg mb-2">
              <div class="text-caption font-weight-bold text-error mb-1">Alasan Pelaporan:</div>
              <div class="text-body-2 text-truncate">{{ job.moderation?.deletedReason || 'Tidak ada alasan' }}</div>
            </div>
          </v-card-text>
          
          <v-card-actions class="pa-4 pt-0">
            <v-btn 
              block 
              color="#8d85ff" 
              variant="flat" 
              class="text-none font-weight-bold rounded-lg text-white" 
              @click="openDetail(job)"
            >
              Lihat Detail
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detail & Action Modal -->
    <AdminReportDetailModal
      :visible="isDetailModalOpen"
      :selected-job="selectedJob"
      @close="isDetailModalOpen = false"
    />
  </v-container>
</template>

<style scoped>
*{
    font-family: 'Quicksand';
}
.job-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid #f0f0f0;
}
.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(141, 133, 255, 0.15) !important;
  border-color: #8d85ff;
}
.report-info-box {
  background-color: #fff5f5;
  border: 1px solid #ffebee;
}
</style>
