<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { onMounted, ref, computed } from 'vue';

const dashboardData = ref(null);
const isLoading = ref(true);

async function getAdminDashboard(){
    try {
        const response = await apiFetch('/dashboard/admin')
        if(response.data.success) {
            dashboardData.value = response.data.dashboard;
        }
    } catch (error) {
        sweetAlert.error(error.message)
    } finally {
        isLoading.value = false;
    }
}

onMounted(async()=>{
    await getAdminDashboard()
})

// ApexChart options for System Overview (Jobs Breakdown)
const chartOptions = computed(() => {
  return {
    chart: {
      type: 'donut',
      fontFamily: 'Quicksand, sans-serif',
      parentHeightOffset: 0,
    },
    labels: ['Aktif', 'Selesai', 'Dibatalkan'],
    colors: ['#8d58ff', '#28c76f', '#ff4c51'],
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: {
              fontSize: '14px',
              color: '#655c75',
            },
            value: {
              fontSize: '28px',
              fontWeight: 800,
              color: '#171421',
            },
            total: {
              show: true,
              label: 'Total Pekerjaan',
              color: '#655c75',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b
                }, 0)
              }
            }
          }
        }
      }
    },
    stroke: {
      width: 0
    },
    legend: {
      position: 'bottom',
      markers: {
        radius: 12,
        offsetX: -4,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 8
      }
    }
  }
})

const chartSeries = computed(() => {
  if(!dashboardData.value) return [0, 0, 0]
  const sys = dashboardData.value.systemOverview
  return [sys.activeJobs || 0, sys.completedJobs || 0, sys.canceledJobs || 0]
})
</script>

<template>
  <div class="dashboard-wrapper">
    <div v-if="isLoading" class="d-flex justify-center align-center h-100 mt-10">
      <VProgressCircular indeterminate color="#8d58ff" size="50"></VProgressCircular>
    </div>
    
    <VRow v-else-if="dashboardData" class="match-height mt-2">
      <!-- Actionable Cards: Approvals & Reports -->
      <VCol cols="12" md="4">
        <VCard class="stat-card pending-tech-card" to="/technician-registration">
          <VCardItem>
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex flex-column">
                <span class="text-subtitle-1 text-medium-emphasis font-weight-bold mb-1">Persetujuan Teknisi</span>
                <h2 class="text-h2 font-weight-black text-warning">{{ dashboardData.approvals.pendingTechnicians }}</h2>
              </div>
              <VAvatar color="rgba(255, 180, 0, 0.12)" size="60" class="rounded-xl">
                <VIcon icon="ri-user-add-line" size="30" color="#ffb400"></VIcon>
              </VAvatar>
            </div>
            <div class="mt-4 text-body-2 text-medium-emphasis">Menunggu verifikasi admin</div>
          </VCardItem>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard class="stat-card pending-reports-card" to="/report-history">
          <VCardItem>
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex flex-column">
                <span class="text-subtitle-1 text-medium-emphasis font-weight-bold mb-1">Laporan Masuk</span>
                <h2 class="text-h2 font-weight-black text-primary" style="color: #8d58ff !important;">{{ dashboardData.reportsAndPenalty.pendingReports }}</h2>
              </div>
              <VAvatar color="rgba(141, 88, 255, 0.12)" size="60" class="rounded-xl">
                <VIcon icon="ri-file-warning-line" size="30" color="#8d58ff"></VIcon>
              </VAvatar>
            </div>
            <div class="mt-4 text-body-2 text-medium-emphasis">Laporan belum ditindaklanjuti</div>
          </VCardItem>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard class="stat-card critical-tech-card" to="/penalty-point">
          <VCardItem>
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex flex-column">
                <span class="text-subtitle-1 text-medium-emphasis font-weight-bold mb-1">Teknisi Kritis</span>
                <h2 class="text-h2 font-weight-black text-error">{{ dashboardData.reportsAndPenalty.criticalTechnicians }}</h2>
              </div>
              <VAvatar color="rgba(255, 76, 81, 0.12)" size="60" class="rounded-xl">
                <VIcon icon="ri-alarm-warning-line" size="30" color="#ff4c51"></VIcon>
              </VAvatar>
            </div>
            <div class="mt-4 text-body-2 text-medium-emphasis">Poin pelanggaran sangat tinggi</div>
          </VCardItem>
        </VCard>
      </VCol>

      <!-- System Overview Chart -->
      <VCol cols="12" md="6">
        <VCard class="h-100 content-card">
          <VCardItem>
            <VCardTitle class="mb-1 font-weight-bold text-h5">Distribusi Pekerjaan</VCardTitle>
            <VCardSubtitle class="text-medium-emphasis">Ikhtisar seluruh pekerjaan dalam sistem</VCardSubtitle>
          </VCardItem>
          <VCardText class="d-flex justify-center mt-6">
            <VueApexCharts
              type="donut"
              :options="chartOptions"
              :series="chartSeries"
              width="100%"
              height="300"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- System Stats -->
      <VCol cols="12" md="6">
        <VCard class="h-100 content-card">
          <VCardItem>
            <VCardTitle class="mb-4 font-weight-bold text-h5">Ikhtisar Sistem</VCardTitle>
          </VCardItem>
          <VCardText class="d-flex flex-column gap-y-6 mt-2">
            
            <div class="d-flex align-center stat-item">
              <VAvatar color="rgba(141, 88, 255, 0.12)" size="56" class="me-4 rounded-xl">
                <VIcon icon="ri-briefcase-line" size="28" color="#8d58ff"></VIcon>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="text-h4 font-weight-black text-high-emphasis">{{ dashboardData.systemOverview.totalJobs }}</span>
                <span class="text-body-1 text-medium-emphasis mt-1">Total Pekerjaan</span>
              </div>
            </div>
            
            <VDivider class="border-opacity-25"></VDivider>
            
            <div class="d-flex align-center stat-item">
              <VAvatar color="rgba(40, 199, 111, 0.12)" size="56" class="me-4 rounded-xl">
                <VIcon icon="ri-shield-check-line" size="28" color="#28c76f"></VIcon>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="text-h4 font-weight-black text-high-emphasis">{{ dashboardData.systemOverview.totalWarranties }}</span>
                <span class="text-body-1 text-medium-emphasis mt-1">Garansi Diproses</span>
              </div>
            </div>
            
            <VDivider class="border-opacity-25"></VDivider>
            
             <div class="d-flex align-center stat-item">
              <VAvatar color="rgba(0, 207, 232, 0.12)" size="56" class="me-4 rounded-xl">
                <VIcon icon="ri-tools-line" size="28" color="#00cfe8"></VIcon>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="text-h4 font-weight-black text-high-emphasis">{{ dashboardData.systemOverview.totalSkills }}</span>
                <span class="text-body-1 text-medium-emphasis mt-1">Keahlian (Skills) Tersedia</span>
              </div>
            </div>

          </VCardText>
        </VCard>
      </VCol>

    </VRow>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  font-family: 'Quicksand', sans-serif;
  padding-bottom: 24px;
}

.stat-card {
  border-radius: 20px;
  border-bottom: 5px solid transparent;
  box-shadow: 0 8px 24px rgba(42, 34, 58, 0.04) !important;
  background-color: #ffffff;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  text-decoration: none;
}

.stat-card.pending-tech-card {
  border-bottom-color: #ffb400;
}
.stat-card.pending-reports-card {
  border-bottom-color: #8d58ff;
}
.stat-card.critical-tech-card {
  border-bottom-color: #ff4c51;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(42, 34, 58, 0.08) !important;
}

.content-card {
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(42, 34, 58, 0.04) !important;
  background-color: #ffffff;
}

.stat-item {
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateX(4px);
}
</style>
