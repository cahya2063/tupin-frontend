import { router } from "@/plugins/router"

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...options.headers,
    authorization: token ? `Bearer ${token}` : ''
  }

  const response = await fetch(`http://localhost:3000${url}`, {
    ...options,
    headers,
  })

  if (response.status === 403) {
    // token kadaluarsa → logout paksa
    localStorage.removeItem('token')
    router.push('/login') // ✅ gunakan instance router
    throw new Error('Token expired, please login again')
  }

  return response.json()
}
