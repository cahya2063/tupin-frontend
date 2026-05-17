import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { onUnmounted, ref, watch } from "vue"
import { apiFetch } from "./api"
import InlineEditor from '@ckeditor/ckeditor5-build-inline'
import { io } from 'socket.io-client'

export const backendUrl = import.meta.env.VITE_API_URL
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
export const socket = io(backendUrl)
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
export const getStatusJobNormalize = (statusJob)=>{
  const normalizedJobStatus = statusJob?.toLowerCase()
  if(normalizedJobStatus == 'open'){
    return {
      label: 'pengajuan perbaikan'
    }
  }
  if(normalizedJobStatus == 'pending transport fee'){
    return {
      label: 'menunggu pembayaran transportasi'
    }
  }
  if(normalizedJobStatus == 'transport fee paid'){
    return {
      label: 'biaya transportasi sudah dibayar'
    }
  }
  if(normalizedJobStatus == 'checked'){
    return {
      label: 'kerusakan sudah diperiksa'
    }
  }
  if(normalizedJobStatus == 'pending repair payment'){
    return {
      label: 'menunggu pembayaran perbaikan'
    }
  }
  if(normalizedJobStatus == 'repair paid'){
    return {
      label: 'biaya perbaikan sudah dibayar'
    }
  }
  if(normalizedJobStatus == 'warranty'){
    return {
      label: 'masa garansi'
    }
  }
  if(normalizedJobStatus == 'completed'){
    return {
      label: 'perbaikan selesai'
    }
  }
  if(normalizedJobStatus == 'canceled'){
    return {
      label: 'perbaikan dibatalkan'
    }
  }
}

export function useDestination() {
  const destinationList = ref([])
  let timeout = null

  // ambil data destinasi
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

// ambil kode pos dari koordinat
export async function getPostCodeFromCoordinates(lat, lng) {
  try {
    const response = await apiFetch('/ongkir/get-poscode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lon: lng }),
    })

    return response.data.location?.address?.postcode || null
  } catch (error) {
    console.error('Gagal mengambil kode pos:', error)
    return null
  }
}

export function useLocationPicker(options = {}) {
  // Default value dan callback dari user
  const {
    initialLat = -8.2192,
    initialLng = 114.3691,
    clearDestinationWhenPostCodeChanges = false,
    onDestinationChange,
    onPostCodeFound,
    onCurrentLocationError,
  } = options

  // Mengambil fitur destination
  const { destinationList, handleSearch, getDestination } = useDestination()

  // state awal saat useLocationPicker() dipanggil
  const selectedDestination = ref([])
  const postCode = ref(null)
  const postCodeError = ref('')
  const lat = ref(initialLat)
  const lng = ref(initialLng)
  const hasLocationValue = ref(false)

  let map = null
  let marker = null

  function setMapPosition(latitude, longitude, positionOptions = {}) {
    const {
      zoom = 15,
      fly = true,
      markSelected = true,
    } = positionOptions

    lat.value = latitude
    lng.value = longitude

    if (markSelected)
      hasLocationValue.value = true

    // Pindahkan map
    if (map) {
      if (fly)
        map.flyTo([latitude, longitude], zoom)
      else
        map.setView([latitude, longitude], zoom)
    }

    // Pindahkan marker
    if (marker)
      marker.setLatLng([latitude, longitude])
  }

  // ambil lokasi pengguna
  async function getMyLocation() {
    try {
      const position = await getCurrentLocation()

      setMapPosition(position.lat, position.lng)

      return position
    } catch (error) {
      console.error('Gagal ambil lokasi:', error)

      if (typeof onCurrentLocationError === 'function')
        onCurrentLocationError(error)

      return null
    }
  }

  // Ketika destination dipilih
  function handleDestinationChange(value) {
    selectedDestination.value = value || []

    const selected = selectedDestination.value[0]

    if (!selected) {
      if (typeof onDestinationChange === 'function')
        onDestinationChange(null)

      return
    }

    // Ambil kode pos dari destination
    postCode.value = selected.zipCode || postCode.value
    postCodeError.value = ''

    if (typeof onDestinationChange === 'function')
      onDestinationChange(selected)
  }

  // saat initLocationMap dipanggil
  function initLocationMap(mapId, mapOptions = {}) {
    if (map)
      return { map, marker }

    const {
      zoom = 13,
      zoomControl = false,
      tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution = '&copy; OpenStreetMap & Carto',
      invalidateDelay = 250,
    } = mapOptions

    // Membuat map
    map = L.map(mapId, {
      zoomControl,
    }).setView([lat.value, lng.value], zoom)

    //menampilkan tile map
    L.tileLayer(tileUrl, {
      attribution,
    }).addTo(map)

    // membuat marker
    marker = L.marker([lat.value, lng.value], { draggable: true }).addTo(map)

    // perbarui lat lng saat drag ataupun clik
    marker.on('dragend', function () {
      const position = marker.getLatLng()

      lat.value = position.lat
      lng.value = position.lng
      hasLocationValue.value = true
    })

    map.on('click', function (event) {
      lat.value = event.latlng.lat
      lng.value = event.latlng.lng
      hasLocationValue.value = true
      marker.setLatLng(event.latlng)
    })

    // Refresh ukuran map
    setTimeout(() => {
      map?.invalidateSize()
    }, invalidateDelay)

    return { map, marker }
  }

  // Reset lokasi ke default
  function resetLocation(resetOptions = {}) {
    const {
      latitude = initialLat,
      longitude = initialLng,
      zoom = 13,
      clearDestination = true,
      clearPostCode = true,
      markSelected = false,
    } = resetOptions

    lat.value = latitude
    lng.value = longitude
    hasLocationValue.value = markSelected

    if (clearDestination)
      selectedDestination.value = []

    if (clearPostCode) {
      postCode.value = null
      postCodeError.value = ''
    }

    if (marker)
      marker.setLatLng([latitude, longitude])

    if (map)
      map.setView([latitude, longitude], zoom)
  }

  // Menghapus map dari memory
  function destroyLocationMap() {
    map?.remove()
    map = null
    marker = null
  }

  // ketika lat dan lng diperbarui
  watch([lat, lng], async ([latitude, longitude]) => {
    if (!latitude || !longitude)
      return

    const previousPostCode = postCode.value
    const locationPostCode = await getPostCodeFromCoordinates(latitude, longitude)

    if (!locationPostCode) {
      postCode.value = null
      postCodeError.value = 'Kode pos tidak ditemukan, silakan input manual'

      return
    }

    // reset destination jika postcode berubah
    if (
      clearDestinationWhenPostCodeChanges &&
      previousPostCode &&
      String(previousPostCode) !== String(locationPostCode)
    ) {
      // reset destination
      selectedDestination.value = []

      if (typeof onDestinationChange === 'function')
        onDestinationChange(null)
    }

    // jika postcode ada
    postCode.value = locationPostCode
    postCodeError.value = ''

    // caro destinasi
    await getDestination(locationPostCode)

    if (typeof onPostCodeFound === 'function')
      onPostCodeFound(locationPostCode)
  })

  onUnmounted(destroyLocationMap)

  return {
    destinationList,
    handleSearch,
    getDestination,
    selectedDestination,
    postCode,
    postCodeError,
    lat,
    lng,
    hasLocationValue,
    initLocationMap,
    setMapPosition,
    getMyLocation,
    handleDestinationChange,
    resetLocation,
    destroyLocationMap,
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
export function useWarrantyUpdater(warranties){
  const updateWarrantyStatus = (warrantyId, status)=>{
    const warranty = warranties.value.find(w => w._id === warrantyId)

    if(warranty){
      warranty.status = status
    }
  }
  return {
    updateWarrantyStatus
  }
}
