<script setup>
import { backendUrl } from '@/utils/tools'
import { computed } from 'vue'

const role = localStorage.getItem('role')
const props = defineProps({
  warranty: { type: Object, default: null },
  job: { type: Object, default: null },
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'repairing', 'reject', 'done'])

const statusConfig = {
  claimed:     { label: 'Diajukan', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
  repairing:    { label: 'Proses Perbaikan',        color: '#10b981', bg: '#d1fae5', icon: '✅' },
  rejected:    { label: 'Ditolak',          color: '#ef4444', bg: '#fee2e2', icon: '❌' },
  done: { label: 'Selesai',color: '#8d58ff', bg: '#ede9fe', icon: '🔧' },
}

const statusInfo = computed(() =>
  props.warranty ? (statusConfig[props.warranty.status] || statusConfig.claimed) : statusConfig.claimed
)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

const isClaimed = computed(() => props.warranty?.status === 'claimed')
const isRepairing = computed(() => props.warranty?.status === 'repairing')
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay-fade">
      <div v-if="isOpen" class="overlay" @click="emit('close')"></div>
    </Transition>

    <!-- Slide Panel -->
    <Transition name="slide-up">
      <div v-if="isOpen && warranty && job" class="slide-panel">


        <!-- Scrollable content -->
        <div class="panel-content">

          <!-- Title & Status -->
          <div class="panel-header">
            <div class="panel-status" :style="{ color: statusInfo.color, background: statusInfo.bg }">
              {{ statusInfo.icon }} {{ statusInfo.label }}
            </div>
            <h2 class="panel-title">{{ job.title }}</h2>
            <p class="panel-category">{{ job.category }}</p>
          </div>

          <!-- Divider -->
          <div class="divider"></div>

          <!-- Section: Alasan Garansi -->
          <div class="section">
            <div class="section-label">
              <span class="section-icon">📝</span> Alasan Klaim Garansi
            </div>
            <div class="section-content html-content" v-html="warranty.reason"></div>
          </div>

          <!-- Section: Info Pekerjaan -->
          <div class="section">
            <div class="section-label">
              <span class="section-icon">📋</span> Info Pekerjaan
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-key">Tanggal Selesai</span>
                <span class="info-val">{{ formatDate(job.jobDoneDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">Deadline</span>
                <span class="info-val">{{ job.deadline?.start_date }} – {{ job.deadline?.end_date }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">Lokasi</span>
                <span class="info-val">{{ job.destination?.destinationName }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">Status Klaim</span>
                <span class="info-val resolved" :class="{ resolved: warranty.status == 'done' }">
                  {{ warranty.status == 'done' ? 'Sudah Diselesaikan' : 'Belum Diselesaikan' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Section: Foto Bukti -->
            <div class="section-label">
              <span class="section-icon"></span> Foto Bukti ({{ warranty.evidence.length }})
            </div>
            <div class="carousel-wrap">
                <CCarousel controls indicators>
                <CCarouselItem v-for="(image, index) in warranty.evidence || []" :key="index">
                    <img class="carousel-img" :src="`${backendUrl}/uploads/evidence/${image}`" />
                </CCarouselItem>
                </CCarousel>
            </div>

          <div class="actions" v-if="isClaimed && role == 'technician'">
            <button class="btn-reject" @click="emit('reject', warranty)">
              
              Tolak Perbaikan Ulang
            </button>
            <button class="btn-approve" @click="emit('repairing', warranty)">
              
              Setujui Perbaikan Ulang
            </button>
          </div>
          
          <div class="actions" v-if="isRepairing">
            
            <button class="btn-approve" v-show="role === 'client'" @click="emit('done', warranty)">
              
              Perbaikan Ulang Selesai
            </button>
          </div>
          <!-- Status info for non-claimed -->
          <div class="status-note" v-else>
            <span>{{ statusInfo.icon }}</span>
            <span>Klaim ini sudah <strong>{{ statusInfo.label }}</strong></span>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>

/* @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); */

* { font-family: 'Quicksand' }

/* ── Carousel ──────────────────────────────────────────────── */
.carousel-wrap {
  width: 100%;
  max-height: 210px;
  overflow: hidden;
  background: #f4f0ff;
}
 
.carousel-img {
  width: 100%;
  height: 210px;
  object-fit: cover;
  display: block;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 5, 35, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1198;
}

.slide-panel {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #ffffff;
  border-radius: 28px 28px 0 0;
  z-index: 1199;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 40px rgba(141, 88, 255, 0.2);
  border-top: 3px solid #8d58ff;
}

.handle-bar {
  padding: 12px 0 0;
  display: flex;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.handle {
  width: 44px; height: 5px;
  background: #e0d0ff;
  border-radius: 10px;
  transition: background 0.2s;
}
.handle-bar:hover .handle { background: #8d58ff; }

.panel-content {
  overflow-y: auto;
  padding: 16px 24px calc(40px + env(safe-area-inset-bottom, 0px));
  flex: 1;
}

.panel-header { margin-bottom: 20px; }

.panel-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 20px;
  font-weight: 800;
  color: #1a0a3d;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.panel-category {
  font-size: 13px;
  color: #8d58ff;
  font-weight: 600;
  margin: 0;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, #f0ebff, #e5e7eb, transparent);
  margin: 8px 0 20px;
}

.section { margin-bottom: 24px; }

.section-label {
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon { font-size: 14px; }

.section-content {
  background: #faf8ff;
  border: 1px solid #ede9fe;
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.html-content :deep(p) { margin: 0; }

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-item {
  background: #faf8ff;
  border: 1px solid #ede9fe;
  border-radius: 12px;
  padding: 12px 14px;
}

.info-key {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.info-val {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1a0a3d;
  line-height: 1.4;
}

.info-val.resolved { color: #10b981; }

.evidence-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.evidence-img {
  aspect-ratio: 1;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: #f0ebff;
  border: 2px solid #ede9fe;
  transition: transform 0.2s;
}

.evidence-img:hover { transform: scale(1.04); }

.actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  position: sticky;
  bottom: 0;
  background: white;
  padding: 16px 0 calc(16px + env(safe-area-inset-bottom, 0px));
}

.btn-reject, .btn-approve {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reject {
  background: #fff1f2;
  color: #ef4444;
  border: 1.5px solid #fecaca;
}
.btn-reject:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  transform: translateY(-2px);
}

.btn-approve {
  background: linear-gradient(135deg, #8d58ff, #a875ff);
  color: white;
}
.btn-approve:hover {
  background: linear-gradient(135deg, #7c3aed, #8d58ff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(141, 88, 255, 0.35);
}

.status-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #faf8ff;
  border-radius: 14px;
  font-size: 14px;
  color: #6b7280;
  border: 1px solid #ede9fe;
  margin-top: 8px;
}

/* Transitions */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.3s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1); }
.slide-up-leave-active { transition: transform 0.3s ease-in; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }

/* Desktop wider panel */
@media (min-width: 768px) {
  .slide-panel {
    max-width: 520px;
    margin: 0 auto;
    border-radius: 28px 28px 0 0;
  }
  .info-grid { grid-template-columns: 1fr 1fr; }
  .evidence-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
