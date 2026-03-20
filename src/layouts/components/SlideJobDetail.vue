<script setup>
import Payment from '@/components/form/Payment.vue';
import { onMounted } from 'vue';


const props = defineProps({
    selectedJob: Object,
    showSidebar: Boolean,
    isCancelable: Boolean
})
const emit = defineEmits([
  'close',
  'cancel',
])

const closeSidebar = () => {
  emit('close')
}
const formatDate = date => {
  if (!date || typeof date !== 'string') return '-'
  return date.split('T')[0]
}

// onMounted(()=>{
    
//     console.log('selectedJob : ', props.selectedJob);
// })

</script>
<template>
  <transition name="slide-fade">
    <div
      v-if="showSidebar"
      class="slide-modal-overlay"
      @click.self="closeSidebar"
    >
      <div class="slide-modal-content">
 
        <!-- Header -->
        <div class="slide-modal-header">
          <div class="header-title-group">
            <span class="header-icon">🔧</span>
            <h4 class="header-title">{{ selectedJob.title }}</h4>
          </div>
          <button class="close-btn" @click="closeSidebar" aria-label="Tutup">
            <span>×</span>
          </button>
        </div>
 
        <!-- Body -->
        <div class="slide-modal-body">
 
          <!-- Status Banner -->
          <div
            v-if="selectedJob?.status === 'progress'"
            class="status-banner status-progress"
          >
            <span class="status-icon">⏳</span>
            <span>Teknisi sedang memperbaiki alatmu, mohon tunggu...</span>
          </div>
 
          <!-- Job Image -->
          <div class="image-wrapper">
            <CImage
              :src="`http://localhost:3000/uploads/jobs/${selectedJob?.photo}`"
              rounded
              class="job-detail-image"
            />
            
          </div>
 
          <!-- Detail Content -->
          <div v-if="selectedJob" class="job-detail">
 
            <!-- Info Pills -->
            <div class="info-pills">
              <div class="info-pill">
                <span class="pill-label">Kategori</span>
                <span class="pill-value">{{ selectedJob.category }}</span>
              </div>
              <div class="info-pill">
                <span class="pill-label">Status</span>
                <span :class="['pill-value', 'pill-status', `pill-status--${selectedJob.status}`]">
                  {{ selectedJob.status }}
                </span>
              </div>
            </div>
 
            <!-- Divider -->
            <div class="section-divider"></div>
 
            <!-- Description -->
            <div class="description-section">
              <h6 class="section-title">
                <span class="section-icon">📋</span> Deskripsi
              </h6>
              <div class="description-content" v-html="selectedJob.description"></div>
            </div>
 
            <!-- Divider -->
            <div class="section-divider"></div>
 
            <!-- Deadline -->
            <div class="deadline-section">
              <h6 class="section-title">
                <span class="section-icon">📅</span> Deadline Pengerjaan
              </h6>
              <div class="deadline-track">
                <div class="deadline-point">
                  <span class="deadline-dot start"></span>
                  <div>
                    <span class="deadline-meta">Mulai</span>
                    <p class="deadline-date">{{ formatDate(selectedJob?.deadline?.start_date) }}</p>
                  </div>
                </div>
                <div class="deadline-line"></div>
                <div class="deadline-point">
                  <span class="deadline-dot end"></span>
                  <div>
                    <span class="deadline-meta">Selesai</span>
                    <p class="deadline-date">{{ formatDate(selectedJob?.deadline?.end_date) }}</p>
                  </div>
                </div>
              </div>
            </div>
 
            <!-- Payment Component -->
            <div v-show="selectedJob?.status === 'completed'" class="payment-section">
              <div class="section-divider"></div>
              <payment
                :name="selectedJob?.creatorName"
                :email="selectedJob?.creatorEmail"
                :amount="selectedJob?.budget"
                :sub-account-id="selectedJob.subAccountId"
                :job-id="selectedJob?._id"
                :payer-id="selectedJob?.idCreator"
                :receiver-id="selectedJob?.selectedTechnician"
              />
            </div>
 
            <!-- Action Buttons -->
            <div class="action-buttons">
              <!-- <VBtn
                v-if="selectedJob?.status === 'payed done' && !review"
                class="action-btn btn-review"
                color="success"
                variant="elevated"
                rounded="lg"
                @click="openReview"
              >
                <span class="btn-icon">⭐</span> Beri Review
              </VBtn> -->
 
              <VBtn
                v-if="isCancelable"
                class="action-btn btn-cancel"
                color="error"
                variant="outlined"
                rounded="lg"
                @click="emit('cancel', selectedJob._id)"
              >
                <span class="btn-icon">✕</span> Batalkan Job
              </VBtn>
            </div>
 
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<style scoped>
.slide-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 30, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}
 
/* =====================
   MODAL PANEL
===================== */
.slide-modal-content {
  width: 420px;
  max-width: 100vw;
  height: 100dvh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.14);
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
}
 
/* =====================
   HEADER
===================== */
.slide-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  flex-shrink: 0;
}
 
.header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
 
.header-icon {
  font-size: 20px;
  flex-shrink: 0;
}
 
.header-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}
 
.close-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #ffffff;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
 
.close-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}
 
/* =====================
   BODY
===================== */
.slide-modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 0 32px;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 transparent;
}
 
/* =====================
   STATUS BANNER
===================== */
.status-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  font-size: 0.84rem;
  font-weight: 500;
}
 
.status-progress {
  background: linear-gradient(90deg, #fff8e1, #fff3cd);
  color: #856404;
  border-bottom: 1px solid #ffeaa7;
}
 
.status-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
 
/* =====================
   IMAGE
===================== */
.image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  max-height: 220px;
}
 
.job-detail-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}
 

 
/* =====================
   JOB DETAIL
===================== */
.job-detail {
  padding: 20px 20px 0;
}
 
/* =====================
   INFO PILLS
===================== */
.info-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
 
.info-pill {
  flex: 1;
  min-width: 120px;
  background: #f8f9fb;
  border: 1px solid #eaecf0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
 
.pill-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}
 
.pill-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  text-transform: capitalize;
}
 
.pill-status--progress   { color: #d97706; }
.pill-status--completed  { color: #16a34a; }
.pill-status--cancelled  { color: #dc2626; }
.pill-status--pending    { color: #64748b; }
 
/* =====================
   DIVIDER
===================== */
.section-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 18px 0;
}
 
/* =====================
   SECTION TITLES
===================== */
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #64748b;
  margin-bottom: 12px;
}
 
.section-icon {
  font-size: 1rem;
}
 
/* =====================
   DESCRIPTION
===================== */
 
.description-content {
  font-size: 0.9rem;
  line-height: 1.7;
  color: #374151;
}
 
/* =====================
   DEADLINE
===================== */
 
.deadline-track {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f8f9fb;
  border: 1px solid #eaecf0;
  border-radius: 14px;
  padding: 14px 18px;
}
 
.deadline-point {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}
 
.deadline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}
 
.deadline-dot.start { background: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
.deadline-dot.end   { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
 
.deadline-line {
  flex: 1;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    #cbd5e1,
    #cbd5e1 5px,
    transparent 5px,
    transparent 10px
  );
  margin: 0 12px;
  margin-top: -10px;
}
 
.deadline-meta {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  display: block;
}
 
.deadline-date {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  margin: 2px 0 0;
}
 
/* =====================
   PAYMENT SECTION
===================== */
.payment-section {
  margin-top: 0;
}
 
/* =====================
   ACTION BUTTONS
===================== */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}
 
.action-btn {
  width: 100% !important;
  height: 46px !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  letter-spacing: 0.01em !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
 
.btn-icon {
  font-size: 1rem;
}
 
/* =====================
   TRANSITION
===================== */
.slide-fade-enter-active {
  transition: all 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-fade-leave-active {
  transition: all 0.22s cubic-bezier(0.55, 0, 1, 0.45);
}
.slide-fade-enter-from {
  opacity: 0;
}
.slide-fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-from .slide-modal-content {
  transform: translateX(60px);
}
.slide-fade-leave-to .slide-modal-content {
  transform: translateX(60px);
}
 

/* =====================
   RESPONSIVE
===================== */
@media (max-width: 480px) {
  .slide-modal-content {
    width: 100vw;
    border-left: none;
    border-radius: 0;
  }
 
  .deadline-track {
    flex-direction: column;
    gap: 14px;
    align-items: flex-start;
  }
 
  .deadline-line {
    display: none;
  }
 
  .info-pills {
    flex-direction: column;
  }
 
  .info-pill {
    min-width: unset;
  }
}
</style>
