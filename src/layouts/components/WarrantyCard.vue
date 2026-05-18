<script setup>
import { computed } from 'vue'

const props = defineProps({
  warranty: {
    type: Object,
    required: true
  },
  job: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const statusConfig = {
  claimed: 
  { label: 'Diajukan', 
    color: '#f59e0b', 
    bg: '#fef3c7', 
    icon: '⏳' 
  },
  repairing: { label: 'Proses Perbaikan', color: '#10b981', bg: '#d1fae5', icon: '✅' },
  rejected: { label: 'Ditolak', color: '#ef4444', bg: '#fee2e2', icon: '❌' },
  done: { label: 'Selesai', color: '#8d58ff', bg: '#ede9fe', icon: '🔧' },
}

const statusInfo = computed(() => statusConfig[props.warranty.status] || statusConfig.claimed)

const categoryIcon = computed(() => {
  const icons = {
    'Elektronik': '⚡',
    'Furnitur': '🪑',
    'Plumbing': '🔧',
    'AC': '❄️',
    'Listrik': '💡',
  }
  return icons[props.job.category] || '🔨'
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
</script>

<template>
  <div class="warranty-card" >
    <!-- Accent bar -->
    <div class="card-accent"></div>

    <!-- Header -->
    <div class="card-header">
      <div class="category-badge">
        <span class="cat-icon">{{ categoryIcon }}</span>
        <span class="cat-label">{{ job.category }}</span>
      </div>
      <div class="status-badge" :style="{ color: statusInfo.color, background: statusInfo.bg }">
        <span>{{ statusInfo.icon }}</span>
        <span>{{ statusInfo.label }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="card-body">
      <h3 class="job-title">{{ job.title }}</h3>
      <p class="warranty-reason" v-html="warranty.reason"></p>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <div class="footer-item">
        <span class="footer-icon">📍</span>
        <span class="footer-text">{{ job.destination?.destinationName?.split(',')[0] }}</span>
      </div>
      <div class="footer-item">
        <span class="footer-icon">📅</span>
        <span class="footer-text">{{ formatDate(job.jobDoneDate) }}</span>
      </div>
      <div class="detail-btn" @click="emit('click', { warranty, job })">
        <span>Detail</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>

    
  </div>
</template>

<style scoped>

.warranty-card {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  padding-bottom: 56px;
  box-shadow: 0 4px 24px rgba(141, 88, 255, 0.08), 0 1px 4px rgba(0,0,0,0.06);
  border: 1.5px solid #f0ebff;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  font-family: 'Quicksand';
}

.warranty-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 40px rgba(141, 88, 255, 0.18), 0 4px 12px rgba(0,0,0,0.08);
  border-color: #c4a8ff;
}

.warranty-card::before {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(141,88,255,0.06) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.card-accent {
  position: absolute;
  top: 0; left: 24px; right: 24px;
  height: 3px;
  background: linear-gradient(90deg, #8d58ff, #c084fc);
  border-radius: 0 0 4px 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  margin-top: 8px;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f0ff;
  border: 1px solid #e0d0ff;
  border-radius: 20px;
  padding: 4px 12px;
}

.cat-icon { font-size: 13px; }
.cat-label {
  font-size: 12px;
  font-weight: 600;
  color: #8d58ff;
  letter-spacing: 0.02em;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.card-body {
  margin-bottom: 16px;
}

.job-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a0a3d;
  margin: 0 0 6px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.warranty-reason {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.warranty-reason :deep(p) { margin: 0; }

.card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.footer-icon { font-size: 12px; }
.footer-text {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #8d58ff, #a875ff);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.warranty-card:hover .detail-btn {
  background: linear-gradient(135deg, #7c3aed, #8d58ff);
  gap: 8px;
}

.photo-strip {
  position: absolute;
  bottom: 16px;
  left: 20px;
  display: flex;
  align-items: center;
  height: 30px;
}

.photo-thumb {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 2px solid white;
  background-size: cover;
  background-position: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

.photo-more {
  position: absolute;
  left: calc(3 * 28px);
  background: #8d58ff;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid white;
}
</style>
