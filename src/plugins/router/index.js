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

  next()
})

export default function (app) {
  app.use(router)
}
export { router }
