<script setup>
import NavItems from '@/layouts/components/NavItems.vue'
import logo from '@images/logos/logo-fixify-clear.png'
import VerticalNavLayout from '@layouts/components/VerticalNavLayout.vue'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import { apiFetch } from '@/utils/api'
import { ref, onMounted } from 'vue'
import { CButton } from '@coreui/vue-pro'
import sweetAlert from '@/utils/sweetAlert'

const userId = localStorage.getItem('userId')
const notifications = ref([]) // list notifikasi

// hitung notifikasi unread
const unreadCount = computed(() => {
  return notifications.value.filter(notif => notif.isRead === false).length
})

// modal detail notifikasi
const visibleVerticallyCenteredDemo = ref(false)

// ambil data notifikasi user
async function getNotificationsByUserId() {
  try {
    const response = await apiFetch(`/notifications/${userId}`)
    notifications.value = response.data.notification || []
  } catch (err) {
    console.error('Gagal ambil notifikasi:', err)
  }
}

async function readNotification(notificationId) {
  try {
    const response = await apiFetch(`/notifications/read/${notificationId}`, {
      method: 'GET', // atau PATCH sesuai backend
    })

    // refresh notifikasi setelah dibaca
    await getNotificationsByUserId()
  } catch (err) {
    console.error('Gagal update notifikasi:', err)
  }
}
async function getDetailJobs(jobId) {
  try {
    const response = await apiFetch(`/jobs/${jobId}`)
    return response.data.job
  } catch (error) {
    console.error('Gagal ambil detail job:', error)
    return null
  }
}
async function deleteNotification(notificationId) {
  try {
    const response = await apiFetch(`/notifications/delete/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    sweetAlert.success(response.data.message)
  } catch (error) {
    sweetAlert.error('Gagal menghapus notifikasi:', error)
  }
}

const selectedNotif = ref(null)
const job = ref(null)
async function handleNotifClick(notif) {
  readNotification(notif._id)
  selectedNotif.value = notif
  job.value = await getDetailJobs(notif.jobId)
  visibleVerticallyCenteredDemo.value = true
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

onMounted(() => {
  getNotificationsByUserId()
})
</script>

<template>
  <VerticalNavLayout>
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <!-- 👉 Vertical nav toggle -->
        <IconBtn
          class="ms-n3 icon-nav"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <VSpacer />

        <!-- 👉 Notifikasi -->
        <CDropdown
          variant="nav-item"
          :popper="true"
        >
          <CDropdownToggle :caret="false">
            <VIcon icon="ri-notification-line" />
            <span
              v-if="unreadCount > 0"
              class="notif-badge"
              >{{ unreadCount }}</span
            >
          </CDropdownToggle>

          <CDropdownMenu
            class="p-2"
            style="width: 20rem; max-height: 24rem; overflow-y: auto"
          >
            <template v-if="notifications.length">
              <CCard
                v-for="notif in notifications"
                :key="notif._id"
                class="mb-2 shadow-sm"
                @click="handleNotifClick(notif)"
              >
                <CCardBody>
                  <CCardTitle class="text-sm font-weight-bold mb-1"> 📢 Notifikasi </CCardTitle>
                  <CCardText class="text-xs text-muted">
                    {{ notif.message }}
                  </CCardText>

                  <div class="d-flex justify-between items-center">
                    <small class="text-secondary">
                      {{ new Date(notif.createdAt).toLocaleString() }}
                    </small>
                    <VChip
                      v-if="notif.isRead === false"
                      color="primary"
                      size="x-small"
                      class="ms-2"
                    >
                      Unread
                    </VChip>
                  </div>
                </CCardBody>
              </CCard>
            </template>

            <template v-else>
              <p class="text-center text-muted my-3">Belum ada notifikasi</p>
            </template>
          </CDropdownMenu>
        </CDropdown>

        <CModal
          alignment="center"
          :visible="visibleVerticallyCenteredDemo"
          @close="
            () => {
              visibleVerticallyCenteredDemo = false
            }
          "
          aria-labelledby="VerticallyCenteredExample"
        >
          <CModalHeader>
            <CModalTitle id="VerticallyCenteredExample"> Detail Notifikasi </CModalTitle>
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
              v-show="selectedNotif.isRead == true"
              @click="deleteNotification(selectedNotif._id)"
            >
              Hapus
            </CButton>
            <CButton
              color="secondary"
              @click="
                () => {
                  visibleVerticallyCenteredDemo = false
                }
              "
            >
              Tutup
            </CButton>
          </CModalFooter>
        </CModal>

        <NavbarThemeSwitcher class="me-2" />
        <UserProfile />
      </div>
    </template>

    <template #vertical-nav-header="{ toggleIsOverlayNavActive }">
      <RouterLink
        to="/"
        class="app-logo app-title-wrapper"
      >
        <div
          class="d-flex align-center"
        >
          <img
            :src="logo"
            alt="Logo"
            class="sidebar-logo-img"
          />
        </div>
      </RouterLink>

      <IconBtn
        class="d-block d-lg-none sidebar-close-btn"
        @click="toggleIsOverlayNavActive(false)"
      >
        <VIcon icon="ri-close-line" />
      </IconBtn>
    </template>

    <template #vertical-nav-content>
      <NavItems />
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>

<style lang="scss" scoped>
.notif-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #8d58ff 0%, #a97bff 100%);
  color: white;
  border-radius: 50%;
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(141, 88, 255, 0.4);
}

.sidebar-logo-img {
  width: 100px;
  margin-right: 8px;
  filter: drop-shadow(0 2px 8px rgba(141, 88, 255, 0.2));
  transition: transform 0.22s cubic-bezier(.4, 0, .2, 1);

  &:hover {
    transform: scale(1.04);
  }
}

.sidebar-close-btn {
  background: rgba(141, 88, 255, 0.1) !important;
  color: #8d58ff !important;
  border-radius: 8px !important;
  transition: background 0.18s, transform 0.15s;

  &:hover {
    background: rgba(141, 88, 255, 0.2) !important;
    transform: scale(1.08);
  }

  .v-icon {
    color: #8d58ff !important;
  }
}

@media (min-width: 1279px) {
  .icon-nav {
    display: none;
  }
}
</style>
