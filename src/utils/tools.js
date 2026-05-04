import { ref } from "vue"
import { apiFetch } from "./api"
import InlineEditor from '@ckeditor/ckeditor5-build-inline'
import { io } from 'socket.io-client'
// ===========CKEDITOR============//
export const editor = InlineEditor
export const config = {
  toolbar: [
    'undo', 'redo', '|',
    'heading', '|',
    'bold', 'italic', '|',
    'link', '|',
    'bulletedList', 'numberedList', 'outdent', 'indent',
  ],
  placeholder: 'Ketik atau paste konten di sini...',
}
export const showSidebarPostedJobs = ref(false)
// mentrigger event connection di server
export const socket = io('http://localhost:3000')
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation tidak didukung browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      }
    )
  })
}
export async function createChat(clientId, technicianId) {
  try {
    const response = await apiFetch(`/chats/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: clientId,
        technicianId: technicianId,
      }),
    })
    console.log('Chat created:', response.data)
  } catch (error) {
    console.error('Gagal membuat chat:', error)
  }
}

export function useDestination() {
  const destinationList = ref([])
  let timeout = null

  const getDestination = async (postCode) => {
    try {
      console.log();
      
      const response = await apiFetch(`/ongkir/destination/${postCode}`)
      const data = response.data.destination.data

      console.log('data lokasi : ', data);
      
      destinationList.value = data.map(item => ({
        value: String(item.id),
        label: item.label,
        zipCode: item.zip_code
      }))

    } catch (error) {
      console.error('Gagal ambil data tujuan:', error)
    }
  }

  const handleSearch = (search) => {
    if (!search || search.length < 5) {
      destinationList.value = []
      return
    }

    clearTimeout(timeout)

    timeout = setTimeout(() => {
      getDestination(search)
    }, 500)
  }

  return {
    destinationList,
    handleSearch,
    getDestination
  }
}
export function useJobUpdater(jobs) {

  const updateJobStatus = (jobId, status) => {
    const job = jobs.value.find(j => j._id === jobId)

    if (job) {
      job.status = status
    }
  }

  return {
    updateJobStatus
  }
}
