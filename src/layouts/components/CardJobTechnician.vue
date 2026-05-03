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
  avatarPlaceholder: String,
})

const showFull = ref(false)

const stripHtml = text => text?.replace(/<[^>]*>/g, '').trim() ?? ''

// Fungsi bantu format tanggal
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
  if (s === 'open')   return { accent: '#f59e0b', bg: '#fff8e6', text: '#92400e', border: '#fcd34d', avatarBg: '#f59e0b' }
  if (s === 'pending transport fee')   return { accent: '#3b82f6', bg: '#eff6ff', text: '#1e3a8a', border: '#93c5fd', avatarBg: '#3b82f6' }
  if (s === 'transport fee paid')  return { accent: '#14532d', bg: '#f0fdf4', text: '#14532d', border: '#14532d', avatarBg: '#14532d' }
  if (s === 'checked')      return { accent: '#10b981', bg: '#f0fdf4', text: '#14532d', border: '#6ee7b7', avatarBg: '#10b981' }
  if (s === 'completed')      return { accent: '#10b981', bg: '#f0fdf4', text: '#14532d', border: '#6ee7b7', avatarBg: '#10b981' }
  if (s === 'cancelled') return { accent: '#ef4444', bg: '#fef2f2', text: '#7f1d1d', border: '#fca5a5', avatarBg: '#ef4444' }
  return { accent: '#8d58ff', bg: '#f4f0ff', text: '#4c1d95', border: '#c4b5fd', avatarBg: '#8d58ff' }
})

const creatorInitials = computed(() => {
  if (!props.creator) return '?'
  return props.creator.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

const shortId = computed(() => props.id?.slice(-6) ?? '------')
</script>

<template>
  <div class="card">

    <!-- Accent bar warna ikut status -->
    <div class="card-accent" :style="{ background: statusConfig.accent }"></div>

    <div class="card-body">

      <!-- Baris atas: creator + status badge -->
      <div class="row-top">
        <div class="creator-wrap">
          <div class="creator-avatar" :style="{ background: statusConfig.avatarBg }">
            {{ creatorInitials }}
          </div>
          <div class="creator-info">
            <span class="creator-lbl">Dibuat oleh</span>
            <span class="creator-nm">{{ creator }}</span>
          </div>
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

      <div class="separator"></div>

      <!-- Judul -->
      <h3 class="card-title">{{ title }}</h3>

      <!-- Meta: deadline + kategori -->
      <div class="meta-row">
        <div v-if="deadline?.start_date" class="pill pill-deadline">
          <i class="ri-calendar-event-line pill-icon"></i>
          Jangka waktu : <strong>{{ formatDate(deadline?.start_date) }} sampai {{ formatDate(deadline?.end_date) }}</strong>
        </div>
        <div v-else-if="deadline?.start_date == null" class="pill pill-deadline">
          <i class="ri-calendar-event-line pill-icon"></i>
          Jangka waktu : tidak ada deadline
        </div>
        <div class="pill pill-category">
          <i class="ri-price-tag-3-line pill-icon"></i>
          {{ category }}
        </div>
      </div>

      <!-- Deskripsi -->
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

      <!-- Footer: tag kategori + job ID -->
      <div class="card-footer">
        <div class="cat-tag" :style="{ background: statusConfig.accent }">
          <i class="ri-price-tag-3-line pill-icon"></i>
          {{ category }}
        </div>
        <span class="job-id">#{{ shortId }}</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #ede8ff;
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

.card-accent {
  height: 5px;
  width: 100%;
  flex-shrink: 0;
}

.card-body {
  padding: 18px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.creator-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.creator-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.creator-info {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.creator-lbl {
  font-size: 10px;
  color: #b0a4cc;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.creator-nm {
  font-size: 13px;
  font-weight: 700;
  color: #2d1f52;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.separator {
  height: 1px;
  background: #f0ebff;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #1a1030;
  margin: 0;
  line-height: 1.3;
}

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
  background: #f4f0ff;
  color: #6d28d9;
  border: 1px solid #ddd4ff;
}

.pill-category {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.pill-icon {
  font-size: 13px;
}

.desc-wrap {
  background: #fbf9ff;
  border: 1px solid #ede8ff;
  border-radius: 14px;
  padding: 13px 16px;
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

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 15px;
  border-radius: 50px;
}

.job-id {
  font-size: 11px;
  color: #c4b5fd;
  font-family: monospace;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .card-body {
    padding: 16px 16px 14px;
    gap: 12px;
  }

  .card-title {
    font-size: 16px;
  }

  .row-top {
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .card-title {
    font-size: 15px;
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
}
</style>
