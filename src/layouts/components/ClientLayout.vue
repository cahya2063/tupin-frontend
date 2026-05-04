<script setup>
import ClientBottomNav from '@/layouts/components/ClientBottomNav.vue'
import Footer from '@/layouts/components/Footer.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import logo from '@images/logos/logo-fixify-clear.png'
import { apiFetch } from '@/utils/api'
import { ref, onMounted, computed } from 'vue'
import { CButton } from '@coreui/vue-pro'
import sweetAlert from '@/utils/sweetAlert'

const userId = localStorage.getItem('userId')
const notifications = ref([])

const unreadCount = computed(() =>
  notifications.value.filter(n => n.isRead === false).length
)

const visibleNotifModal = ref(false)
const selectedNotif = ref(null)
const job = ref(null)

async function getNotificationsByUserId() {
  try {
    const res = await apiFetch(`/notifications/${userId}`)
    notifications.value = res.data.notification || []
  } catch (err) {
    console.error('Gagal ambil notifikasi:', err)
  }
}

async function readNotification(id) {
  try {
    await apiFetch(`/notifications/read/${id}`, { method: 'GET' })
    await getNotificationsByUserId()
  } catch (err) {
    console.error('Gagal update notifikasi:', err)
  }
}

async function getDetailJobs(jobId) {
  try {
    const res = await apiFetch(`/jobs/${jobId}`)
    return res.data.job
  } catch (err) {
    console.error('Gagal ambil detail job:', err)
    return null
  }
}

async function deleteNotification(id) {
  try {
    const res = await apiFetch(`/notifications/delete/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    sweetAlert.success(res.data.message)
    await getNotificationsByUserId()
    visibleNotifModal.value = false
  } catch (err) {
    sweetAlert.error('Gagal menghapus notifikasi')
  }
}

async function handleNotifClick(notif) {
  readNotification(notif._id)
  selectedNotif.value = notif
  job.value = await getDetailJobs(notif.jobId)
  visibleNotifModal.value = true
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => getNotificationsByUserId())
</script>

<template>
  <div class="client-layout">
    <!-- ===== TOP NAVBAR ===== -->
    <header class="client-navbar">
      <div class="client-navbar__inner">
        <!-- Logo -->
        <RouterLink to="/dashboard" class="client-navbar__logo">
          <img :src="logo" alt="Fixify Logo" class="client-navbar__logo-img" />
        </RouterLink>

        <!-- Right actions -->
        <div class="client-navbar__actions">
          <!-- Notification dropdown -->
          <CDropdown variant="nav-item" :popper="true">
            <CDropdownToggle :caret="false">
              <div class="client-navbar__notif-btn">
                <VIcon icon="ri-notification-3-line" class="client-navbar__notif-icon" />
                <span v-if="unreadCount > 0" class="client-navbar__notif-badge">
                  {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
              </div>
            </CDropdownToggle>

            <CDropdownMenu class="p-2" style="width: 21rem; max-height: 26rem; overflow-y: auto">
              <div class="notif-header">
                <span class="notif-header__title">Notifikasi</span>
                <span v-if="unreadCount > 0" class="notif-header__count">{{ unreadCount }} baru</span>
              </div>

              <template v-if="notifications.length">
                <div
                  v-for="notif in notifications"
                  :key="notif._id"
                  class="notif-item"
                  :class="{ 'notif-item--unread': !notif.isRead }"
                  @click="handleNotifClick(notif)"
                >
                  <div class="notif-item__dot" />
                  <div class="notif-item__body">
                    <p class="notif-item__message">{{ notif.message }}</p>
                    <span class="notif-item__time">
                      {{ new Date(notif.createdAt).toLocaleString('id-ID') }}
                    </span>
                  </div>
                  <VChip
                    v-if="!notif.isRead"
                    color="primary"
                    size="x-small"
                    class="notif-item__chip"
                  >
                    Baru
                  </VChip>
                </div>
              </template>

              <template v-else>
                <div class="notif-empty">
                  <VIcon icon="ri-notification-off-line" size="36" class="notif-empty__icon" />
                  <p>Belum ada notifikasi</p>
                </div>
              </template>
            </CDropdownMenu>
          </CDropdown>

          <!-- User avatar -->
          <UserProfile />
        </div>
      </div>
    </header>

    <!-- ===== MAIN CONTENT ===== -->
    <main class="client-main">
      <div class="client-main__container">
        <slot />
      </div>
    </main>

    <!-- ===== BOTTOM NAVIGATION ===== -->
    <ClientBottomNav />

    <!-- ===== NOTIFICATION DETAIL MODAL ===== -->
    <CModal
      alignment="center"
      :visible="visibleNotifModal"
      @close="() => { visibleNotifModal = false }"
      aria-labelledby="notifModalTitle"
    >
      <CModalHeader>
        <CModalTitle id="notifModalTitle">Detail Notifikasi</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div v-if="selectedNotif">
          <p><strong>Pesan:</strong> {{ selectedNotif.message }}</p>
          <p><strong>Tanggal:</strong> {{ formatDate(selectedNotif.createdAt) }}</p>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="danger"
          v-show="selectedNotif?.isRead == true"
          @click="deleteNotification(selectedNotif._id)"
        >
          Hapus
        </CButton>
        <CButton
          color="secondary"
          @click="() => { visibleNotifModal = false }"
        >
          Tutup
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.client-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #f6f4ff;
}

/* ===== Navbar ===== */
.client-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1.5px solid rgba(141, 88, 255, 0.11);
  box-shadow: 0 2px 18px rgba(141, 88, 255, 0.08);
}

.client-navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Logo */
.client-navbar__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.client-navbar__logo-img {
  height: 50px;
  width: auto;
  filter: drop-shadow(0 2px 6px rgba(141, 88, 255, 0.18));
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.client-navbar__logo-img:hover {
  transform: scale(1.05);
}

/* Right actions */
.client-navbar__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Notification button */
.client-navbar__notif-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(141, 88, 255, 0.07);
  cursor: pointer;
  transition: background 0.18s ease, transform 0.15s;
}

.client-navbar__notif-btn:hover {
  background: rgba(141, 88, 255, 0.15);
  transform: scale(1.06);
}

.client-navbar__notif-icon {
  font-size: 1.3rem !important;
  color: #8d58ff !important;
}

.client-navbar__notif-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: linear-gradient(135deg, #8d58ff 0%, #a97bff 100%);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 5px;
  line-height: 1.4;
  box-shadow: 0 2px 6px rgba(141, 88, 255, 0.4);
  min-width: 16px;
  text-align: center;
}

/* ===== Notification dropdown items ===== */
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(141, 88, 255, 0.1);
  margin-bottom: 0.5rem;
}

.notif-header__title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
}

.notif-header__count {
  font-size: 0.72rem;
  font-weight: 600;
  color: #8d58ff;
  background: rgba(141, 88, 255, 0.1);
  padding: 2px 8px;
  border-radius: 20px;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.65rem 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 0.25rem;
}

.notif-item:hover {
  background: rgba(141, 88, 255, 0.07);
}

.notif-item--unread {
  background: rgba(141, 88, 255, 0.04);
}

.notif-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8d58ff;
  flex-shrink: 0;
  margin-top: 5px;
  opacity: 0.8;
}

.notif-item__body {
  flex: 1;
  min-width: 0;
}

.notif-item__message {
  font-size: 0.83rem;
  color: #1e293b;
  margin: 0 0 3px;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notif-item__time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.notif-item__chip {
  flex-shrink: 0;
}

.notif-empty {
  text-align: center;
  padding: 1.5rem 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

.notif-empty__icon {
  color: rgba(141, 88, 255, 0.35) !important;
  margin-bottom: 0.5rem;
  display: block;
  margin-inline: auto;
}

/* ===== Main content ===== */
.client-main {
  flex: 1;
  padding-top: 70px;   /* navbar height */
}

.client-main__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
</style>
