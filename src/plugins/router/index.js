import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // Daftar halaman publik (tidak butuh login)
  const publicPages = ['/login', '/register', '/']
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !token) {
    // Kalau belum login → redirect ke login
    return next({
      path: '/login',
    })
  }
    if (token && (to.path === '/login' || to.path === '/register' || to.path === '/')) {
      // Kalau sudah login → redirect ke dashboard
      return next({ path: '/dashboard' })
    }

  next()
})

export default function (app) {
  app.use(router)
}
export { router }
