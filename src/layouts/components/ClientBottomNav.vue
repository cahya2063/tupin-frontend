<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

const navItems = [
  {
    label: 'Home',
    icon: 'ri-home-5-line',
    iconActive: 'ri-home-5-fill',
    to: '/dashboard',
  },
  {
    label: 'Teknisi',
    icon: 'ri-user-search-line',
    iconActive: 'ri-user-search-fill',
    to: '/search-technician',
  },
  {
    label: 'Jobs',
    icon: 'ri-briefcase-line',
    iconActive: 'ri-briefcase-fill',
    to: '/posted-jobs',
  },
  {
    label: 'Chat',
    icon: 'ri-wechat-line',
    iconActive: 'ri-wechat-fill',
    to: '/chat-view',
  },
  {
    label: 'Dompet',
    icon: 'ri-wallet-3-line',
    iconActive: 'ri-wallet-3-fill',
    to: '/payment-tabs',
  },
]

const activeIndex = computed(() => {
  const idx = navItems.findIndex(item => route.path.startsWith(item.to))
  return idx >= 0 ? idx : 0
})

const currentValue = ref(activeIndex.value)

watch(activeIndex, val => { currentValue.value = val })

function navigate(item, index) {
  currentValue.value = index
  router.push(item.to)
}
</script>

<template>
  <!-- Safe-area spacer so content isn't hidden behind floating nav -->
  <div class="client-bottom-nav-spacer" />

  <div class="client-bottom-nav-wrapper">
    <nav class="client-bottom-nav">
      <button
        v-for="(item, index) in navItems"
        :key="item.to"
        class="nav-btn"
        :class="{ 'nav-btn--active': currentValue === index }"
        @click="navigate(item, index)"
      >
        <!-- Icon -->
        <VIcon
          :icon="currentValue === index ? item.iconActive : item.icon"
          class="nav-btn__icon"
        />

        <!-- Label -->
        <span class="nav-btn__label">{{ item.label }}</span>

        <!-- Active dot indicator -->
        <span class="nav-btn__dot" />
      </button>
    </nav>
  </div>
</template>

<style scoped>
/* ============================================================
   SPACER
   ============================================================ */
.client-bottom-nav-spacer {
  height: 72px;
}

/* ============================================================
   WRAPPER — fixed, spans full width like content, centered pill inside
   ============================================================ */
.client-bottom-nav-wrapper {
  position: fixed;
  bottom: 16px;
  left: 0;
  right: 0;
  z-index: 1100;
  padding: 0 1rem;                        /* matches .client-main__container padding */
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  justify-content: center;               /* keep pill centered */
}

/* ============================================================
   FLOATING PILL — fills wrapper width, capped at content max-width (1200px)
   ============================================================ */
.client-bottom-nav {
  display: flex;                          /* fill full wrapper width evenly */
  align-items: center;
  width: 100%;
  max-width: 1200px;                      /* same cap as .client-main__container */
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 3px 8px;
  box-shadow:
    0 8px 32px rgba(141, 88, 255, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(141, 88, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* ============================================================
   BUTTON — flex:1 so each item takes equal share of nav width
   ============================================================ */
.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 5px 4px 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 20px;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  min-width: 0;
}

.nav-btn:active {
  transform: scale(0.9);
}

/* ============================================================
   ICON
   ============================================================ */
.nav-btn__icon {
  font-size: 1.35rem !important;
  color: #c2c8d8;
  transition:
    color 0.2s ease,
    transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: block;
}

.nav-btn--active .nav-btn__icon {
  color: #8d58ff !important;
  transform: scale(1.12) translateY(-1px);
}

/* ============================================================
   LABEL
   ============================================================ */
.nav-btn__label {
  font-size: 0.68rem;
  font-weight: 500;
  color: #c2c8d8;
  white-space: nowrap;
  transition: color 0.2s ease, font-weight 0.1s;
  line-height: 1;
  letter-spacing: 0.01em;
}

.nav-btn--active .nav-btn__label {
  color: #8d58ff;
  font-weight: 700;
}

/* ============================================================
   ACTIVE DOT
   ============================================================ */
.nav-btn__dot {
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #8d58ff;
  margin-top: 2px;
  transform: scale(0);
  opacity: 0;
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
}

.nav-btn--active .nav-btn__dot {
  transform: scale(1);
  opacity: 1;
}

/* ============================================================
   TABLET (≥ 600px)
   ============================================================ */
@media (min-width: 600px) {
  .client-bottom-nav-wrapper {
    bottom: 20px;
    padding: 0 1.5rem;
  }

  .client-bottom-nav {
    padding: 8px 12px;
    border-radius: 32px;
  }

  .nav-btn {
    padding: 10px 4px 8px;
    gap: 4px;
  }

  .nav-btn__icon {
    font-size: 1.5rem !important;
  }

  .nav-btn__label {
    font-size: 0.75rem;
  }

  .client-bottom-nav-spacer {
    height: 76px;
  }
}

/* ============================================================
   DESKTOP (≥ 1024px)
   ============================================================ */
@media (min-width: 1024px) {
  .client-bottom-nav-wrapper {
    bottom: 24px;
    padding: 0 2rem;
  }

  .client-bottom-nav {
    padding: 4px 20px;
    border-radius: 28px;
    box-shadow:
      0 12px 48px rgba(141, 88, 255, 0.2),
      0 4px 16px rgba(0, 0, 0, 0.08),
      0 0 0 1.5px rgba(141, 88, 255, 0.12);
  }

  .nav-btn {
    padding: 7px 8px 6px;
    gap: 3px;
  }

  .nav-btn__icon {
    font-size: 1.65rem !important;
  }

  .nav-btn__label {
    font-size: 0.8rem;
    letter-spacing: 0.02em;
  }

  .nav-btn__dot {
    width: 5px;
    height: 5px;
  }

  .client-bottom-nav-spacer {
    height: 80px;
  }
}
</style>
