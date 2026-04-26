<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  id: String,
  title: String,
  deadline: Object,
  desc: String,
  category: String,
  status: String,
  creator: String,
  technicianName: String,
  avatarPlaceholder: String,
})

const showFull = ref(false)

const stripHtml = text => text?.replace(/<[^>]*>/g, '').trim() ?? ''

const formatDate = date => {
  if (!date || typeof date !== 'string') return '-'
  return date.split('T')[0]
}

const displayedText = computed(() => {
  const plainText = stripHtml(props.desc)
  const words = plainText.split(' ')
  if (showFull.value || words.length <= 60) return plainText
  return words.slice(0, 60).join(' ') + '...'
})

const toggleShow = () => {
  showFull.value = !showFull.value
}

const hasLongDesc = computed(() => stripHtml(props.desc).split(' ').length > 60)

const statusConfig = computed(() => {
  const s = props.status?.toLowerCase()
  if (s === 'open')
    return { accent: '#f59e0b', bg: 'rgba(253,246,220,0.95)', text: '#92400e', border: '#fcd34d' }
  if (s === 'pending transport fee')
    return { accent: '#3b82f6', bg: 'rgba(239,246,255,0.95)', text: '#1e3a8a', border: '#93c5fd' }
  if (s === 'transport fee paid')
    return { accent: '#14532d', bg: 'rgba(240,253,244,0.95)', text: '#14532d', border: '#6ee7b7' }
  if (s === 'checked')
    return { accent: '#10b981', bg: 'rgba(240,253,244,0.95)', text: '#14532d', border: '#6ee7b7' }
  if (s === 'completed')
    return { accent: '#10b981', bg: 'rgba(240,253,244,0.95)', text: '#14532d', border: '#6ee7b7' }
  if (s === 'cancelled')
    return { accent: '#ef4444', bg: 'rgba(254,242,242,0.95)', text: '#7f1d1d', border: '#fca5a5' }
  return { accent: '#8d58ff', bg: 'rgba(243,232,255,0.95)', text: '#4c1d95', border: '#c4b5fd' }
})

const creatorInitials = computed(() => {
  if (!props.creator) return '?'
  return props.creator.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

const shortId = computed(() => props.id?.slice(-6) ?? '------')
</script>

<template>
  <div class="card">

    <!-- Top accent bar with stripe pattern -->
    <div class="card-topbar"></div>

    <!-- Hero header dengan warna dominan ungu -->
    <div class="card-header">
      <div class="header-left">
        <div class="role-badge">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1.5C6.07 1.5 4.5 3.07 4.5 5c0 .74.22 1.43.6 2H2.5a1 1 0 00-1 1v6a1 1 0 001 1h11a1 1 0 001-1V8a1 1 0 00-1-1h-2.6c.38-.57.6-1.26.6-2 0-1.93-1.57-3.5-3.5-3.5z" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          {{creator}}
        </div>
        <h3 class="card-title">{{ title }}</h3>
        <span class="job-id-header">#{{ shortId }}</span>
      </div>

      <div
        class="status-badge"
        :style="{
          background: statusConfig.bg,
          color: statusConfig.text,
          borderColor: statusConfig.border,
        }"
      >
        <span class="status-dot" :style="{ background: statusConfig.text }"></span>
        {{ status }}
      </div>
    </div>

    <div class="card-body">

      <!-- Creator row dengan background ungu muda -->
      <div class="creator-row">
        <div class="creator-avatar">
          {{ creatorInitials }}
        </div>
        <div class="creator-info">
          <span class="creator-lbl">Diajukan kepada</span>
          <span class="creator-nm">{{ technicianName }}</span>
        </div>
        <span class="creator-tag">Client</span>
      </div>

      <!-- Meta: deadline + kategori -->
      <div class="meta-row">
        <div v-if="deadline" class="pill pill-deadline">
          <i class="ri-calendar-event-line pill-icon"></i>
          Jangka waktu: <strong>{{ formatDate(deadline?.start_date) }}</strong> sampai <strong>{{ formatDate(deadline?.end_date) }}</strong>
        </div>
        <div class="pill pill-category">
          <i class="ri-price-tag-3-line pill-icon"></i>
          {{ category }}
        </div>
      </div>

      <!-- Deskripsi dengan aksen garis kiri ungu -->
      <div class="desc-wrap">
        <p class="desc-text">
          {{ displayedText }}
          <template v-if="hasLongDesc">
            <span class="see-more" @click.stop="toggleShow">
              {{ showFull ? ' Sembunyikan' : ' Lihat selengkapnya' }}
            </span>
          </template>
        </p>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <div class="cat-tag">
          <i class="ri-price-tag-3-line"></i>
          {{ category }}
        </div>
        <div class="footer-right">
          <span class="job-id">#{{ shortId }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ===========================
   VARIABEL & RESET
=========================== */
.card * {
  box-sizing: border-box;
}

/* ===========================
   CARD WRAPPER
=========================== */
.card {
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #e0d9f7;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.card:hover {
  border-color: #8d58ff;
  box-shadow: 0 8px 32px rgba(141, 88, 255, 0.14);
}

/* ===========================
   TOP ACCENT BAR
=========================== */
.card-topbar {
  height: 6px;
  width: 100%;
  flex-shrink: 0;
  background: #8d58ff;
  position: relative;
  overflow: hidden;
}

.card-topbar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.18) 0,
    rgba(255, 255, 255, 0.18) 6px,
    transparent 6px,
    transparent 14px
  );
}

/* ===========================
   HERO HEADER
=========================== */
.card-header {
  background: linear-gradient(135deg, #8d58ff 0%, #6d28d9 100%);
  padding: 18px 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

/* Dekorasi lingkaran abstrak di background header */
.card-header::before {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

.card-header::after {
  content: '';
  position: absolute;
  right: 30px;
  bottom: -40px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.header-left {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Badge role teknisi */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.18);
  color: #e9d5ff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 50px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.card-title {
  font-size: 17px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

.job-id-header {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-family: monospace;
  letter-spacing: 0.5px;
}

/* Status badge (tampil di header) */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  border-radius: 50px;
  border: 1.5px solid;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  text-transform: capitalize;
  position: relative;
  z-index: 1;
  align-self: flex-start;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ===========================
   CARD BODY
=========================== */
.card-body {
  padding: 16px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ===========================
   CREATOR ROW
=========================== */
.creator-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0ebff;
  border: 1px solid #e0d9f7;
  border-radius: 12px;
  padding: 10px 14px;
}

.creator-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #8d58ff;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(141, 88, 255, 0.3);
}

.creator-info {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
  flex: 1;
}

.creator-lbl {
  font-size: 10px;
  color: #9c8fc0;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.creator-nm {
  font-size: 13px;
  font-weight: 700;
  color: #1a1030;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tag "Client" di kanan creator */
.creator-tag {
  font-size: 10px;
  font-weight: 700;
  color: #8d58ff;
  background: rgba(141, 88, 255, 0.12);
  padding: 3px 10px;
  border-radius: 50px;
  border: 1px solid rgba(141, 88, 255, 0.25);
  flex-shrink: 0;
  white-space: nowrap;
}

/* ===========================
   META PILLS
=========================== */
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
}

.pill-deadline {
  background: #f0ebff;
  color: #6d28d9;
  border: 1px solid #c4b5fd;
}

.pill-category {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.pill-icon {
  font-size: 13px;
}

/* ===========================
   DESCRIPTION
=========================== */
.desc-wrap {
  background: #faf8ff;
  border: 1px solid #e0d9f7;
  border-left: 3px solid #8d58ff;
  border-radius: 0 12px 12px 0;
  padding: 12px 16px;
}

.desc-text {
  font-size: 13px;
  color: #5c4f78;
  line-height: 1.75;
  margin: 0;
}

.see-more {
  color: #8d58ff;
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;
  transition: opacity 0.15s;
}

.see-more:hover {
  opacity: 0.7;
  text-decoration: underline;
}

/* ===========================
   FOOTER
=========================== */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e0d9f7;
}

.cat-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #8d58ff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 50px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.job-id {
  font-size: 11px;
  color: #c4b5fd;
  font-family: monospace;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ===========================
   RESPONSIVE
=========================== */
@media (max-width: 768px) {
  .card-header {
    padding: 16px 16px 14px;
  }

  .card-body {
    padding: 14px 16px 14px;
    gap: 12px;
  }

  .card-title {
    font-size: 15px;
  }

  .status-badge {
    font-size: 10px;
    padding: 4px 10px;
  }
}

@media (max-width: 480px) {
  .card-title {
    font-size: 14px;
  }

  .creator-nm {
    max-width: 120px;
  }

  .meta-row {
    gap: 6px;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .job-id {
    align-self: flex-end;
  }

  .pill {
    font-size: 11px;
    padding: 4px 10px;
  }

  .card-header {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
