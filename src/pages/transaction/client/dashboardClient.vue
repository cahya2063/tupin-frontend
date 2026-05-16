<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { onMounted, ref, computed } from 'vue';

const dashboardData = ref(null);
const isLoading = ref(true);

async function getClientDashboard(){
    try {
        const response = await apiFetch('/dashboard/client')
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
    await getClientDashboard()
})

// ApexChart options for Job Summary
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
              label: 'Total',
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
  const sum = dashboardData.value.jobSummary
  return [sum.active || 0, sum.completed || 0, sum.canceled || 0]
})

function getStatusColor(status) {
  const map = {
    open: 'info',
    completed: 'success',
    canceled: 'error',
    active: 'primary',
    progress: 'warning',
  }
  return map[status?.toLowerCase()] || 'secondary'
}

function formatDate(dateString) {
  if(!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="dashboard-wrapper">
    <div v-if="isLoading" class="d-flex justify-center align-center h-100 mt-10">
      <VProgressCircular indeterminate color="#8d58ff" size="50"></VProgressCircular>
    </div>
    
    <VRow v-else-if="dashboardData" class="match-height mt-2">
      <!-- Summary Cards -->
      <VCol cols="12" md="4">
        <VCard class="stat-card active-card">
          <VCardItem>
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex flex-column">
                <span class="text-subtitle-1 text-medium-emphasis font-weight-bold mb-1">Pekerjaan Aktif</span>
                <h2 class="text-h2 font-weight-black text-primary" style="color: #8d58ff !important;">{{ dashboardData.jobSummary.active }}</h2>
              </div>
              <VAvatar color="rgba(141, 88, 255, 0.12)" size="60" class="rounded-xl">
                <VIcon icon="ri-tools-line" size="30" color="#8d58ff"></VIcon>
              </VAvatar>
            </div>
          </VCardItem>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard class="stat-card unpaid-card">
          <VCardItem>
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex flex-column">
                <span class="text-subtitle-1 text-medium-emphasis font-weight-bold mb-1">Tagihan Belum Dibayar</span>
                <h2 class="text-h2 font-weight-black text-warning">{{ dashboardData.unpaidInvoices }}</h2>
              </div>
              <VAvatar color="rgba(255, 180, 0, 0.12)" size="60" class="rounded-xl">
                <VIcon icon="ri-bill-line" size="30" color="#ffb400"></VIcon>
              </VAvatar>
            </div>
          </VCardItem>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard class="stat-card warranty-card">
          <VCardItem>
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex flex-column">
                <span class="text-subtitle-1 text-medium-emphasis font-weight-bold mb-1">Garansi Aktif</span>
                <h2 class="text-h2 font-weight-black text-success">{{ dashboardData.activeWarranties }}</h2>
              </div>
              <VAvatar color="rgba(40, 199, 111, 0.12)" size="60" class="rounded-xl">
                <VIcon icon="ri-shield-check-line" size="30" color="#28c76f"></VIcon>
              </VAvatar>
            </div>
          </VCardItem>
        </VCard>
      </VCol>

      <!-- Chart and Recent Jobs -->
      <VCol cols="12" md="4">
        <VCard class="h-100 content-card">
          <VCardItem>
            <VCardTitle class="mb-1 font-weight-bold text-h5">Ringkasan Pekerjaan</VCardTitle>
            <VCardSubtitle class="text-medium-emphasis">Status keseluruhan pekerjaan Anda</VCardSubtitle>
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

      <VCol cols="12" md="8">
        <VCard class="h-100 content-card">
          <VCardItem class="pb-2">
            <VCardTitle class="font-weight-bold text-h5">Pekerjaan Terbaru</VCardTitle>
          </VCardItem>
          <VCardText class="pa-0">
            <VTable class="recent-jobs-table mt-4">
              <thead>
                <tr>
                  <th class="text-uppercase text-caption font-weight-bold text-medium-emphasis px-4">Judul</th>
                  <th class="text-uppercase text-caption font-weight-bold text-medium-emphasis px-4">Kategori</th>
                  <th class="text-uppercase text-caption font-weight-bold text-medium-emphasis px-4">Deadline</th>
                  <th class="text-uppercase text-caption font-weight-bold text-medium-emphasis px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="dashboardData.recentJobs.length === 0">
                  <td colspan="4" class="text-center text-medium-emphasis py-6">Belum ada pekerjaan.</td>
                </tr>
                <tr v-for="job in dashboardData.recentJobs" :key="job._id">
                  <td class="font-weight-bold text-high-emphasis px-4">
                    {{ job.title.length > 35 ? job.title.substring(0, 35) + '...' : job.title }}
                  </td>
                  <td class="px-4">
                    <span class="text-body-2">{{ job.category }}</span>
                  </td>
                  <td class="text-medium-emphasis px-4">
                    {{ formatDate(job.deadline?.end_date) }}
                  </td>
                  <td class="px-4 text-center">
                    <VChip size="small" :color="getStatusColor(job.status)" class="text-capitalize font-weight-bold px-3">
                      {{ job.status }}
                    </VChip>
                  </td>
                </tr>
              </tbody>
            </VTable>
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
}

.stat-card.active-card {
  border-bottom-color: #8d58ff;
}
.stat-card.unpaid-card {
  border-bottom-color: #ffb400;
}
.stat-card.warranty-card {
  border-bottom-color: #28c76f;
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

.recent-jobs-table {
  background: transparent;
}
.recent-jobs-table th {
  background-color: rgba(141, 88, 255, 0.03) !important;
  border-bottom: 1px solid rgba(141, 88, 255, 0.1);
}
.recent-jobs-table td {
  border-bottom: 1px solid rgba(141, 88, 255, 0.06);
  padding-top: 14px !important;
  padding-bottom: 14px !important;
}
.recent-jobs-table tr:last-child td {
  border-bottom: none;
}
.recent-jobs-table tr:hover td {
  background-color: rgba(141, 88, 255, 0.02);
}
</style>
