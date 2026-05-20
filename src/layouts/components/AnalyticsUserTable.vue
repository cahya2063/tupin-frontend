<script setup>
import { apiFetch } from '@/utils/api'
import sweetAlert from '@/utils/sweetAlert'
import { ref } from 'vue'

const props = defineProps({
  headers: Array,
  items: Array,
})

const emit = defineEmits(['accept', 'reject', 'detail'])

const detailDialog = ref(false)
const selectedTechnician = ref(null)
const skills = ref()


async function openDetail(item) {
  selectedTechnician.value = item

  const results = await Promise.all(
    selectedTechnician.value.skills.map(skillId =>
      apiFetch(`/skills/${skillId}`)
    )
  )

  skills.value = results.map(res => res.data.skill)

  console.log('skills : ', skills.value)

  detailDialog.value = true
}

function closeDetail() {
  detailDialog.value = false
  selectedTechnician.value = null
}

async function handleAccept(item) {
  const result = await sweetAlert.confirm({
    title: `Apakah kamu ingin menerima teknisi ${item.nama}?`,
    text: 'Pastikan teknisi sudah mengisikan data dengan benar.',
    showCancelButton: true,
    confirmText: 'Ya, Sudah',
    cancelText: 'Batal',
  })

  if (result.isConfirmed) {
    emit('accept', item)
  }  
}

async function handleReject(item) {
  const result = await sweetAlert.confirm({
    title: `Apakah kamu ingin menolak teknisi ${item.nama}?`,
    text: 'Jika teknisi ditolak maka tidak bisa dirubah kembali.',
    showCancelButton: true,
    confirmText: 'Ya, Sudah',
    cancelText: 'Batal',
  })

  if (result.isConfirmed) {
    emit('reject', item)
  } 
}

function getStatusColor(status) {
  const s = status?.toLowerCase()
  if (s === 'active' || s === 'aktif' || s === 'approved' || s === 'approve') return 'success'
  if (s === 'pending') return 'warning'
  if (s === 'inactive' || s === 'rejected' || s === 'ditolak') return 'error'
  return 'default'
}

function getStatusLabel(status) {
  const s = status?.toLowerCase()
  if (s === 'active' || s === 'aktif') return 'Aktif'
  if (s === 'pending') return 'Menunggu'
  if (s === 'inactive') return 'Tidak Aktif'
  if (s === 'approved' || s === 'approve') return 'Disetujui'
  if (s === 'rejected' || s === 'ditolak') return 'Ditolak'
  return status
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarColor(name) {
  const colors = ['#8d85ff', '#a89dff', '#6c63ff', '#7c74ff', '#9e97ff']
  if (!name) return colors[0]
  return colors[name.charCodeAt(0) % colors.length]
}

function formatSkills(skills) {
  if (!skills || skills.length === 0) return '-'
  if (typeof skills === 'string') return skills

  return skills
    .map(skill => {
      if (typeof skill === 'string') return skill
      return skill.label || skill.nama || skill.name || skill.title || skill._id || skill.id
    })
    .filter(Boolean)
    .join(', ')
}
</script>

<template>
  <!-- Main Table Card -->
  <VCard class="analytics-table-card" elevation="0">
    <!-- Header -->
    <div class="table-header">
      <div class="header-left">
        <div class="header-icon">
          <VIcon size="20" color="white">ri-group-line</VIcon>
        </div>
        <div>
          <h6 class="table-title">Teknisi Pending</h6>
          <span class="table-subtitle">Daftar teknisi yang menunggu persetujuan</span>
        </div>
      </div>
      <VChip color="#8d85ff" variant="tonal" size="small" class="count-chip">
        {{ items?.length || 0 }} Teknisi
      </VChip>
    </div>

    <!-- Desktop Table -->
    <div class="table-wrapper d-none d-md-block">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Teknisi</th>
            <th>Role</th>
            <th>Status</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!items || items.length === 0">
            <td colspan="4" class="empty-state">
              <VIcon size="48" color="#8d85ff" class="mb-3">ri-user-search-line</VIcon>
              <p class="empty-text">Tidak ada teknisi pending</p>
            </td>
          </tr>
          <tr
            v-for="(item, index) in items"
            :key="item.id || index"
            class="table-row"
          >
            <!-- Teknisi Info -->
            <td>
              <div class="technician-info">
                <div
                  class="avatar-circle"
                  :style="{ background: getAvatarColor(item.nama) }"
                >
                  {{ getInitials(item.nama) }}
                </div>
                <div class="tech-details">
                  <span class="tech-name">{{ item.nama || '-' }}</span>
                  <span class="tech-email">{{ item.email || '-' }}</span>
                </div>
              </div>
            </td>

            <!-- Role -->
            <td>
              <VChip
                size="small"
                variant="tonal"
                color="#8d85ff"
                class="role-chip"
              >
                <VIcon start size="12">ri-shield-user-line</VIcon>
                {{ item.role || '-' }}
              </VChip>
            </td>

            <!-- Status -->
            <td>
              <div class="status-badge" :class="`status-${getStatusColor(item.status)}`">
                <span class="status-dot" />
                {{ getStatusLabel(item.status) }}
              </div>
            </td>

            <!-- Actions -->
            <td>
              <div class="action-buttons">
                <VBtn
                  size="small"
                  variant="tonal"
                  color="#8d85ff"
                  class="action-btn detail-btn"
                  @click="openDetail(item)"
                >
                  <VIcon start size="14">ri-eye-line</VIcon>
                  Detail
                </VBtn>
                
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="mobile-cards d-block d-md-none">
      <div v-if="!items || items.length === 0" class="empty-state-mobile">
        <VIcon size="48" color="#8d85ff" class="mb-3">ri-user-search-line</VIcon>
        <p class="empty-text">Tidak ada teknisi pending</p>
      </div>

      <div
        v-for="(item, index) in items"
        :key="item.id || index"
        class="mobile-card"
      >
        <div class="mobile-card-header">
          <div class="technician-info">
            <div
              class="avatar-circle"
              :style="{ background: getAvatarColor(item.nama) }"
            >
              {{ getInitials(item.nama) }}
            </div>
            <div class="tech-details">
              <span class="tech-name">{{ item.nama || '-' }}</span>
              <span class="tech-email">{{ item.email || '-' }}</span>
            </div>
          </div>
          <div class="status-badge" :class="`status-${getStatusColor(item.status)}`">
            <span class="status-dot" />
            {{ getStatusLabel(item.status) }}
          </div>
        </div>

        <div class="mobile-card-meta">
          <VChip size="small" variant="tonal" color="#8d85ff">
            <VIcon start size="12">ri-shield-user-line</VIcon>
            {{ item.role || '-' }}
          </VChip>
        </div>

        <div class="mobile-action-buttons">
          <VBtn size="small" variant="tonal" color="#8d85ff" class="flex-1" @click="openDetail(item)">
            <VIcon start size="14">ri-eye-line</VIcon>
            Detail
          </VBtn>
          <VBtn size="small" variant="tonal" color="success" class="flex-1" @click="handleAccept(item)">
            <VIcon start size="14">ri-check-line</VIcon>
            Terima
          </VBtn>
          <VBtn size="small" variant="tonal" color="error" class="flex-1" @click="handleReject(item)">
            <VIcon start size="14">ri-close-line</VIcon>
            Tolak
          </VBtn>
        </div>
      </div>
    </div>
  </VCard>

  <!-- Detail Dialog -->
  <VDialog v-model="detailDialog" max-width="720" :scrim-opacity="0.4" scrollable>
    <VCard v-if="selectedTechnician" class="detail-dialog-card">
      <!-- Dialog Header -->
      <div class="dialog-header">
        <div class="dialog-profile">
          <div
            class="dialog-avatar"
            :style="{ background: getAvatarColor(selectedTechnician.nama) }"
          >
            {{ getInitials(selectedTechnician.nama) }}
          </div>

          <div class="dialog-heading">
            <span class="dialog-eyebrow">Detail Teknisi</span>
            <h5 class="dialog-name">{{ selectedTechnician.nama || '-' }}</h5>
            <p class="dialog-email">{{ selectedTechnician.email || '-' }}</p>
          </div>
        </div>

        <VBtn
          icon
          variant="text"
          size="small"
          class="close-btn"
          @click="closeDetail"
        >
          <VIcon>ri-close-line</VIcon>
        </VBtn>
      </div>

      <!-- Dialog Content -->
      <div class="dialog-content">
        <div class="dialog-summary">
          <div class="summary-item">
            <span class="summary-label">Role</span>
            <VChip size="small" variant="tonal" color="#8d85ff">
              <VIcon start size="12">ri-shield-user-line</VIcon>
              {{ selectedTechnician.role || '-' }}
            </VChip>
          </div>

          <div class="summary-item">
            <span class="summary-label">Status</span>
            <div class="status-badge" :class="`status-${getStatusColor(selectedTechnician.status)}`">
              <span class="status-dot" />
              {{ getStatusLabel(selectedTechnician.status) }}
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">
            <VIcon size="18" color="#8d85ff">ri-contacts-book-line</VIcon>
            <span>Informasi Kontak</span>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ selectedTechnician.email || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Nomor Telepon</span>
              <span class="detail-value">{{ selectedTechnician.phone_number || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Kota Domisili</span>
              <span class="detail-value">{{ selectedTechnician.city || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Nama Lengkap</span>
              <span class="detail-value">{{ selectedTechnician.nama || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">
            <VIcon size="18" color="#8d85ff">ri-tools-line</VIcon>
            <span>Keahlian</span>
          </div>
          <VChip v-for="skill in skills" size="small" variant="tonal" color="#8d85ff">
              <VIcon start size="12">ri-tools-line</VIcon>
              {{ skill.label }}
            </VChip>

        </div>

        <div class="detail-section">
          <div class="section-title">
            <VIcon size="18" color="#8d85ff">ri-file-text-line</VIcon>
            <span>Deskripsi Pengalaman</span>
          </div>
          <p class="detail-paragraph">
            {{ selectedTechnician.description || 'Belum ada deskripsi pengalaman.' }}
          </p>
        </div>
      </div>

      <!-- Dialog Actions -->
      <div class="dialog-actions">
        <VBtn
          variant="tonal"
          color="success"
          class="flex-1"
          @click="handleAccept(selectedTechnician); closeDetail()"
        >
          <VIcon start>ri-check-line</VIcon>
          Terima
        </VBtn>
        <VBtn
          variant="tonal"
          color="error"
          class="flex-1"
          @click="handleReject(selectedTechnician); closeDetail()"
        >
          <VIcon start>ri-close-line</VIcon>
          Tolak
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<style scoped>
*{
  font-family: 'Quicksand';
}
/* ── Card ── */
.analytics-table-card {
  border-radius: 16px !important;
  border: 1.5px solid #ede9ff !important;
  overflow: hidden;
  background: #ffffff !important;
}

/* ── Header ── */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  background: linear-gradient(135deg, #8d85ff 0%, #a89dff 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-title {
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

.table-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.count-chip {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  font-weight: 600;
}

/* ── Desktop Table ── */
.table-wrapper {
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table thead tr {
  background: #f4f2ff;
}

.custom-table th {
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #8d85ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  border-bottom: 2px solid #ede9ff;
}

.table-row {
  transition: background 0.15s;
  border-bottom: 1px solid #f4f2ff;
}

.table-row:hover {
  background: #faf9ff;
}

.table-row:last-child {
  border-bottom: none;
}

.custom-table td {
  padding: 14px 20px;
  vertical-align: middle;
}

/* ── Technician Info ── */
.technician-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.tech-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tech-name {
  font-size: 14px;
  font-weight: 600;
  color: #2d2d3a;
  line-height: 1.3;
}

.tech-email {
  font-size: 12px;
  color: #9e9eb8;
}

/* ── Role Chip ── */
.role-chip {
  font-size: 12px !important;
  font-weight: 500 !important;
}

/* ── Status Badge ── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-success {
  background: #e8f8f0;
  color: #2e7d57;
}
.status-success .status-dot { background: #4caf82; }

.status-warning {
  background: #fff8e6;
  color: #c17a00;
}
.status-warning .status-dot { background: #f5a623; }

.status-error {
  background: #ffeef0;
  color: #c62828;
}
.status-error .status-dot { background: #ef5350; }

.status-default {
  background: #f0efff;
  color: #6b64cc;
}
.status-default .status-dot { background: #8d85ff; }

/* ── Action Buttons ── */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.action-btn {
  font-size: 12px !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  height: 32px !important;
  min-width: 0 !important;
  padding: 0 10px !important;
}

/* ── Empty State ── */
.empty-state {
  text-align: center;
  padding: 56px 24px !important;
}

.empty-text {
  color: #9e9eb8;
  font-size: 14px;
  margin: 0;
}

/* ── Mobile Cards ── */
.mobile-cards {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-state-mobile {
  text-align: center;
  padding: 48px 24px;
}

.mobile-card {
  border: 1.5px solid #ede9ff;
  border-radius: 12px;
  padding: 14px;
  background: #faf9ff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mobile-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-action-buttons {
  display: flex;
  gap: 8px;
}

.flex-1 {
  flex: 1;
}

/* ── Detail Dialog ── */
.detail-dialog-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #8d85ff 0%, #a89dff 100%);
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
}

.dialog-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.dialog-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  border: 3px solid rgba(255,255,255,0.4);
  box-shadow: 0 4px 16px rgba(141,133,255,0.4);
  flex-shrink: 0;
}

.dialog-heading {
  min-width: 0;
}

.dialog-eyebrow {
  display: inline-flex;
  margin-bottom: 5px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.close-btn {
  color: white !important;
  flex-shrink: 0;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 64vh;
  overflow-y: auto;
  padding: 20px 24px 0;
  text-align: left;
}

.dialog-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px;
  line-height: 1.25;
  word-break: break-word;
}

.dialog-email {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  word-break: break-word;
}

.dialog-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #f8f7ff;
  border: 1.5px solid #ede9ff;
  border-radius: 12px;
  padding: 12px;
}

.summary-label {
  color: #8d85ff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.detail-section {
  background: #ffffff;
  border: 1.5px solid #ede9ff;
  border-radius: 14px;
  padding: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #2d2d3a;
  font-size: 14px;
  font-weight: 700;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  text-align: left;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #f8f7ff;
  padding: 10px 12px;
  border-radius: 10px;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  color: #8d85ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #2d2d3a;
  line-height: 1.45;
  word-break: break-word;
}

.detail-paragraph {
  background: #f8f7ff;
  border-radius: 10px;
  color: #2d2d3a;
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
  padding: 12px;
  white-space: pre-line;
}

.dialog-actions {
  display: flex;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1.5px solid #ede9ff;
  margin-top: 16px;
}

@media (max-width: 640px) {
  .dialog-header {
    align-items: flex-start;
    padding: 20px;
  }

  .dialog-profile {
    align-items: flex-start;
  }

  .dialog-avatar {
    width: 56px;
    height: 56px;
    font-size: 18px;
  }

  .dialog-summary,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .summary-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .dialog-content {
    max-height: 66vh;
    padding-inline: 18px;
  }

  .dialog-actions {
    flex-direction: column;
    padding-inline: 18px;
  }
}
</style>
