import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
// import sweetAlert from '@/utils/sweetAlert'
// import {jwtDecode} from 'jwt-decode' // ✅ WAJIB

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // Daftar halaman publik (tidak butuh login)
  const publicPages = ['/login', '/register', '/register-technician', '/technician/activate', '/']
  const guestPages = ['/login', '/register', '/register-technician', '/']
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !token) {
    // Kalau belum login redirect ke login
    return next({
      path: '/login',
    })
  }
  if (token && guestPages.includes(to.path)) {
    const role = localStorage.getItem('role')
    if (role === 'pelanggan' || role === 'client') {
      return next({ path: '/dashboard-client' })
    } else if (role === 'admin') {
      return next({ path: '/dashboard-admin' })
    } else if (role === 'teknisi' || role === 'technician') {
      return next({ path: '/dashboard-technician' })
    }
    // Kalau sudah login redirect ke dashboard default
    return next({ path: '/dashboard' })
  }
  // if (to.meta?.roles) {
  //   const decoded = jwtDecode(token)
  //   const userRole = decoded.role
  //   console.log('userRole : ', userRole);
    
  //   if (!to.meta.roles.includes(userRole)) {
  //     sweetAlert.error('Unauthorized access')
  //     return next('/dashboard')
  //   }
  // }

  next()
})

export default function (app) {
  app.use(router)
}
export { router }
