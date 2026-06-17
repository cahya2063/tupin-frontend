<script setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue'
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'

import { ref, computed } from 'vue'

const role = localStorage.getItem('role')

const menuItems = computed(() => {
  if (role === 'admin') {
    return [
      {
        title: 'Dashboard',
        icon: 'ri-dashboard-line',
        to: '/dashboard-admin',
      },
      {
        title: 'Pendaftaran teknisi',
        icon: 'ri-user-add-line',
        to: '/technician-registration',
      },
      {
        title: 'Management skill',
        icon: 'ri-settings-3-line',
        to: '/skill-management',
      },
      {
        title: 'Laporan pelanggan',
        icon: 'ri-customer-service-2-line',
        to: '/report-history',
      },
      {
        title: 'Pelanggaran teknisi',
        icon: 'ri-alarm-warning-line',
        to: '/penalty-point',
      },
      {
        title: 'Laporan pekerjaan',
        icon: 'ri-file-list-3-line',
        to: '/report-job',
      },

    ]
  }

  if (role === 'technician') {
    return [

      {
        title: 'Dashboard',
        icon: 'ri-dashboard-line',
        to: '/dashboard-technician',
      },
      {
        title: 'Pesanan masuk',
        icon: 'ri-inbox-archive-line',
        to: '/accepted-jobs',
      },
      {
        title: 'Pengajuan garansi',
        icon: 'ri-shield-check-line',
        to: '/warranty-request',
      },
      {
        title: 'Laporan pelanggan',
        icon: 'ri-customer-service-2-line',
        to: '/report-history',
      },
    ]
  }

  return [] // default: kosong
})
</script>

<template>
  <!-- 👉 Dashboard -->
 

  <!-- 👉 Menu berdasarkan role -->
  <VerticalNavLink
    v-for="item in menuItems"
    :key="item.title"
    :item="item"
  />

  <!-- 👉 Kalau BUKAN admin -->
  <template v-if="role !== 'admin'">

    <VerticalNavLink
      :item="{
        title: 'Chat',
        icon: 'ri-chat-3-line',
        to: '/chat-view',
      }"
    />

    <VerticalNavLink
      :item="{
        title: 'Pembayaran',
        icon: 'ri-wallet-3-line',
        to: '/payment-tabs',
      }"
    />

    <VerticalNavLink
      :item="{
        title: 'Profile',
        icon: 'ri-user-settings-line',
        to: '/profile',
      }"
    />
  </template>
</template>

  <!-- <VerticalNavLink
    :item="{
      title: 'Calendar',
      icon: 'ri-calendar-line',
      href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/demo-1/apps/calendar',
      target: '_blank',
      badgeContent: 'Pro',
      badgeClass: 'bg-light-primary text-primary',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Kanban',
      icon: 'ri-drag-drop-line',
      href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/demo-1/apps/kanban',
      target: '_blank',
      badgeContent: 'Pro',
      badgeClass: 'bg-light-primary text-primary',
    }"
  />

  

  <VerticalNavLink
    :item="{
      title: 'Login',
      icon: 'ri-login-box-line',
      to: '/login',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Register',
      icon: 'ri-user-add-line',
      to: '/register',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Error',
      icon: 'ri-information-line',
      to: '/no-existence',
    }"
  />

  <VerticalNavSectionTitle
    :item="{
      heading: 'User Interface',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Typography',
      icon: 'ri-text',
      to: '/typography',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Icons',
      icon: 'ri-remixicon-line',
      to: '/icons',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Cards',
      icon: 'ri-bar-chart-box-line',
      to: '/cards',
    }"
  />

  <VerticalNavSectionTitle
    :item="{
      heading: 'Forms & Tables',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Jobs',
      icon: 'ri-layout-4-line',
      to: '/jobs',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Form Validation',
      icon: 'ri-checkbox-multiple-line',
      href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/demo-1/forms/form-validation',
      target: '_blank',
      badgeContent: 'Pro',
      badgeClass: 'bg-light-primary text-primary',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Form Wizard',
      icon: 'ri-git-commit-line',
      href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/demo-1/forms/form-wizard-numbered',
      target: '_blank',
      badgeContent: 'Pro',
      badgeClass: 'bg-light-primary text-primary',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Tables',
      icon: 'ri-table-alt-line',
      to: '/tables',
    }"
  />

  <VerticalNavSectionTitle
    :item="{
      heading: 'Others',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Access Control',
      icon: 'ri-shield-line',
      href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/demo-1/access-control',
      target: '_blank',
      badgeContent: 'Pro',
      badgeClass: 'bg-light-primary text-primary',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Documentation',
      icon: 'ri-article-line',
      href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/documentation/',
      target: '_blank',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Raise Support',
      href: 'https://github.com/themeselection/materio-vuetify-vuejs-admin-template-free/issues',
      icon: 'ri-lifebuoy-line',
      target: '_blank',
    }"
  /> -->
<!-- </template> -->
