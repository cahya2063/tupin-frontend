<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { onMounted, ref, computed } from 'vue';

const dashboardData = ref(null);
const isLoading = ref(true);

async function getTechnicianDashboard(){
    try {
        const response = await apiFetch('/dashboard/technician')
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
    await getTechnicianDashboard()
})

// Format Currency
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value || 0)
}

// ApexChart options for Job Queue
const chartOptions = computed(() => {
  return {
    chart: {
      type: 'donut',
      fontFamily: 'Quicksand, sans-serif',
      parentHeightOffset: 0,
    },
    labels: ['Masuk', 'Menunggu Pembayaran', 'Garansi'],
    colors: ['#8d58ff', '#ffb400', '#ff4c51'],
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
  const q = dashboardData.value.jobQueue
  return [q.incoming || 0, q.pendingPayment || 0, q.warranty || 0]
})

// Options for RadialBar Chart for Rating
const ratingChartOptions = computed(() => {
  return {
    chart: {
      type: 'radialBar',
      fontFamily: 'Quicksand, sans-serif',
      parentHeightOffset: 0,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '65%',
        },
        track: {
          background: 'rgba(141, 88, 255, 0.1)',
        },
        dataLabels: {
          name: {
            show: true,
            color: '#655c75',
            fontSize: '15px',
            offsetY: -10,
          },
          value: {
            show: true,
            color: '#8d58ff',
            fontSize: '32px',
            fontWeight: 900,
            offsetY: 8,
            formatter: function (val) {
              return (val / 20).toFixed(1) // from percentage to 5.0
            }
          }
        }
      }
    },
    colors: ['#8d58ff'],
    stroke: {
      lineCap: 'round',
    },
    labels: ['Rating Anda'],
  }
})

const ratingSeries = computed(() => {
  if(!dashboardData.value) return [0]
  const rating = dashboardData.value.statistics?.avgRating || 0
  return [rating * 20] // convert 5.0 scale to 100%
})
</script>

<template>
  <div class="dashboard-wrapper">
    <div v-if="isLoading" class="d-flex justify-center align-center h-100 mt-10">
      <VProgressCircular indeterminate color="#8d58ff" size="50"></VProgressCircular>
    </div>
    
    <VRow v-else-if="dashboardData" class="match-height mt-2">
      <!-- Welcome Card / Wallet -->
      <VCol cols="12" md="8">
        <VCard class="wallet-card h-100">
          <VCardItem class="h-100 d-flex flex-column justify-center">
            <div class="d-flex justify-space-between align-center flex-wrap gap-4">
              <div class="d-flex flex-column">
                <span class="text-subtitle-1 text-medium-emphasis mb-1 font-weight-bold">Saldo Dompet Anda</span>
                <h2 class="text-h2 font-weight-black wallet-balance mb-2">
                  {{ formatCurrency(dashboardData.wallet.balance) }}
                </h2>
                <span class="text-body-2 text-medium-emphasis">Saldo yang tersedia untuk ditarik ke rekening.</span>
              </div>
              <div class="wallet-icon-wrapper">
                <VIcon icon="ri-wallet-3-line" size="42" color="#8d58ff"></VIcon>
              </div>
            </div>
            <div class="mt-8">
              <VBtn color="#8d58ff" class="px-6 rounded-lg text-white font-weight-bold" to="/wallet" elevation="3">
                Cairkan Saldo
              </VBtn>
            </div>
          </VCardItem>
        </VCard>
      </VCol>

      <!-- Penalty Point -->
      <VCol cols="12" md="4">
        <VCard class="penalty-card h-100">
          <VCardItem class="text-center h-100 d-flex flex-column justify-center align-center">
            <VAvatar color="rgba(255, 76, 81, 0.1)" size="68" class="mb-5">
              <VIcon icon="ri-error-warning-line" size="36" color="#ff4c51"></VIcon>
            </VAvatar>
            <h3 class="text-h3 font-weight-black text-error mb-2">{{ dashboardData.warning.penaltyPoint }}</h3>
            <span class="text-subtitle-1 font-weight-bold text-medium-emphasis">Poin Pelanggaran</span>
            <p class="text-body-2 text-muted mt-2 px-3 mb-0">Jaga poin pelanggaran tetap rendah agar akun tidak ditangguhkan.</p>
          </VCardItem>
        </VCard>
      </VCol>

      <!-- Job Queue Donut Chart -->
      <VCol cols="12" md="4">
        <VCard class="h-100 chart-card">
          <VCardItem>
            <VCardTitle class="mb-1 font-weight-bold text-h5">Antrean Pekerjaan</VCardTitle>
            <VCardSubtitle class="text-medium-emphasis">Status pekerjaan saat ini</VCardSubtitle>
          </VCardItem>
          <VCardText class="d-flex justify-center mt-6">
            <VueApexCharts
              type="donut"
              :options="chartOptions"
              :series="chartSeries"
              width="100%"
              height="280"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Rating Radial Bar -->
      <VCol cols="12" md="4">
        <VCard class="h-100 chart-card">
          <VCardItem>
            <VCardTitle class="mb-1 font-weight-bold text-h5">Performa Rating</VCardTitle>
            <VCardSubtitle class="text-medium-emphasis">Skor dari {{ dashboardData.statistics.totalReview }} ulasan pelanggan</VCardSubtitle>
          </VCardItem>
          <VCardText class="d-flex justify-center align-center mt-6">
            <VueApexCharts
              type="radialBar"
              :options="ratingChartOptions"
              :series="ratingSeries"
              width="100%"
              height="280"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Statistics Summary -->
      <VCol cols="12" md="4">
        <VCard class="h-100 stats-card">
          <VCardItem>
            <VCardTitle class="mb-4 font-weight-bold text-h5">Statistik Penyelesaian</VCardTitle>
          </VCardItem>
          <VCardText class="d-flex flex-column gap-y-6 mt-2">
            
            <div class="d-flex align-center stat-item">
              <VAvatar color="rgba(141, 88, 255, 0.12)" size="56" class="me-4 rounded-xl">
                <VIcon icon="ri-check-double-line" size="28" color="#8d58ff"></VIcon>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="text-h4 font-weight-black text-high-emphasis">{{ dashboardData.statistics.completedJobs }}</span>
                <span class="text-body-1 text-medium-emphasis mt-1">Pekerjaan Selesai</span>
              </div>
            </div>
            
            <VDivider class="border-opacity-25"></VDivider>
            
            <div class="d-flex align-center stat-item">
              <VAvatar color="rgba(255, 180, 0, 0.12)" size="56" class="me-4 rounded-xl">
                <VIcon icon="ri-star-smile-line" size="28" color="#ffb400"></VIcon>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="text-h4 font-weight-black text-high-emphasis">{{ dashboardData.statistics.totalReview }}</span>
                <span class="text-body-1 text-medium-emphasis mt-1">Ulasan Pelanggan</span>
              </div>
            </div>
            
            <VDivider class="border-opacity-25"></VDivider>
            
             <div class="d-flex align-center stat-item">
              <VAvatar color="rgba(42, 34, 58, 0.08)" size="56" class="me-4 rounded-xl">
                <VIcon icon="ri-tools-line" size="28" color="#2a223a"></VIcon>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="text-h4 font-weight-black text-high-emphasis">{{ dashboardData.jobQueue.incoming }}</span>
                <span class="text-body-1 text-medium-emphasis mt-1">Pekerjaan Masuk Baru</span>
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

.wallet-card {
  background: linear-gradient(145deg, #ffffff 0%, #f9f7ff 100%);
  border-left: 8px solid #8d58ff;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(141, 88, 255, 0.06) !important;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.wallet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(141, 88, 255, 0.12) !important;
}

.wallet-balance {
  color: #8d58ff;
  letter-spacing: -0.5px;
}

.wallet-icon-wrapper {
  background: linear-gradient(135deg, rgba(141, 88, 255, 0.1) 0%, rgba(141, 88, 255, 0.18) 100%);
  padding: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.penalty-card {
  border-radius: 20px;
  border: 1px solid rgba(255, 76, 81, 0.15);
  box-shadow: 0 12px 30px rgba(255, 76, 81, 0.04) !important;
  background: linear-gradient(180deg, #ffffff 0%, #fffbfc 100%);
}

.chart-card, .stats-card {
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

.text-muted {
  color: #8a819b;
}

@media (max-width: 960px) {
  .wallet-card {
    border-left: 6px solid #8d58ff;
  }
}
</style>
