import { router } from "@/plugins/router"
const baseUrl = import.meta.env.VITE_API_URL
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...options.headers,
    authorization: token ? `Bearer ${token}` : ''
  }

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
  })

  // const statusCode = response.status
  console.log('status code :', response.status);
  
  if (response.status === 403) {
    // token kadaluarsa → logout paksa
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')

    router.push('/login') // ✅ gunakan instance router
    throw new Error('Token expired, please login again')
  }

  return {
    status: response.status,
    data: await response.json()
  }
}

