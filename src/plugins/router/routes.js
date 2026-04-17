export const routes = [
  { path: '/', component: () => import('@/pages/landing-page.vue') },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('@/pages/transaction/dashboard.vue'),
      },
      {
        path: 'jobs/:technicianId',
        component: () => import('@/pages/transaction/jobs.vue'),
      },
      {
        path: 'view-jobs',
        component: () => import('@/pages/transaction/view-jobs.vue')
      },
      {
        path: 'posted-jobs',
        component: () => import('@/pages/transaction/postedJob.vue')
      },
      {
        path: 'technician-detail/:id',
        component: ()=> import('@/views/pages/account-settings/AccountMain.vue')
      },
      {
        path: 'search-technician',
        component: ()=> import('@/pages/transaction/searchTechnician.vue')
      },
      {
        path: 'chat-view',
        component: ()=> import('@/pages/transaction/chatView.vue')
      },
      {
        path: 'accepted-jobs',
        component: ()=> import('@/pages/transaction/acceptedJobs.vue')
      },
      {
        path: 'wallet',
        component: ()=> import('@/pages/transaction/wallet.vue')
      },
      {
        path: 'payment-history',
        component: ()=> import('@/pages/transaction/paymentHistory.vue'),
        // meta: { roles: ['client'] }
      },
      {
        path: 'profile',
        component: () => import('@/views/pages/account-settings/AccountSettingsAccount.vue'),
      },
      // bawaan template
      {
        path: 'typography',
        component: () => import('@/pages/typography.vue'),
      },
      {
        path: 'icons',
        component: () => import('@/pages/icons.vue'),
      },
      {
        path: 'cards',
        component: () => import('@/pages/cards.vue'),
      },
      {
        path: 'tables',
        component: () => import('@/pages/tables.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/components/LoginRegisterLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('@/pages/auth/login.vue'),
      },
      {
        path: 'register',
        component: () => import('@/pages/auth/register.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/pages/[...error].vue'),
      },
    ],
  },
]
