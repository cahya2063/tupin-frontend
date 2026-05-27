<script setup>
import ReviewContainer from '@/pages/part/ReviewContainer.vue'
import { apiFetch } from '@/utils/api'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import avatar1 from '@images/avatars/avatar-1.png'
import { computed, nextTick, onMounted, ref } from 'vue'
import { backendUrl, config, editor, useLocationPicker, getProvinces, getRegencies, getDistricts, getVillages } from '@/utils/tools'

import sweetAlert from '@/utils/sweetAlert'

const userId = localStorage.getItem('userId')
const role = localStorage.getItem('role')

const accountDataLocal = ref({
  id: '',
  name: '',
  email: '',
  avatar: '',
  phone_number: '',
  address: '',
  village: '',
  subdistrict: '',
  city: '',
  zip_code: '',
  description: '',
  receiverLocation: null,
  location: null,
})

const provinceList = ref([])
const regencyList = ref([])
const districtList = ref([])
const villageList = ref([])

const selectedProvince = ref(null)
const selectedRegency = ref(null)
const selectedDistrict = ref(null)
const selectedVillage = ref(null)


// provinsi
async function handleProvinceChange(provinceId) {
  selectedRegency.value = null
  selectedDistrict.value = null
  selectedVillage.value = null

  districtList.value = []
  villageList.value = []

  regencyList.value = await getRegencies(provinceId)
  console.log('regencies : ', regencyList.value);
  
}

// Kabupaten
async function handleRegencyChange(regencyId) {
  selectedDistrict.value = null
  selectedVillage.value = null

  villageList.value = []

  districtList.value = await getDistricts(regencyId)
}

// Kecamatan
async function handleDistrictChange(districtId) {
  selectedVillage.value = null

  villageList.value = await getVillages(districtId)
}

function syncDestinationToProfile(selected) {
  if (!selected) {
    accountDataLocal.value.receiverLocation = null
    return
  }

  accountDataLocal.value.zip_code = selected.zipCode || accountDataLocal.value.zip_code
  accountDataLocal.value.receiverLocation = {
    destinationId: selected.value,
    destinationName: selected.label,
  }
}

const {
  destinationList,
  handleSearch,
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
} = useLocationPicker({
  clearDestinationWhenPostCodeChanges: true,
  onDestinationChange: syncDestinationToProfile,
  onPostCodeFound: code => {
    accountDataLocal.value.zip_code = code
  },
  onCurrentLocationError: () => {
    alert('Gagal mengambil lokasi. Pastikan izin lokasi browser aktif.')
  },
})

// const description = ref('')
const refInputEl = ref()

onMounted(async () => {
  await getProfile()
  provinceList.value = await getProvinces()
  console.log('provinces : ', provinceList.value);
  
  if(role == 'technician'){

    await nextTick()
    initLocationMap('profile-map')
  }
})

function getSelectedName(list, id) {
  return list.find(item => item.value === id)?.label || ''
}

// ================== API ==================

async function updateProfile() {
  try {
    const dest = selectedDestination.value[0] || {}
    const destinationId = dest.value || accountDataLocal.value.receiverLocation?.destinationId || ''
    const destinationName = dest.label || accountDataLocal.value.receiverLocation?.destinationName || ''

    const payload = {
      nama: accountDataLocal.value.name,
      phone_number: accountDataLocal.value.phone_number,
      address: accountDataLocal.value.address,

      province: getSelectedName(
        provinceList.value,
        selectedProvince.value,
      ),

      city: getSelectedName(
        regencyList.value,
        selectedRegency.value,
      ),

      subdistrict: getSelectedName(
        districtList.value,
        selectedDistrict.value,
      ),

      village: getSelectedName(
        villageList.value,
        selectedVillage.value,
      ),

      zip_code: dest.zipCode || postCode.value || accountDataLocal.value.zip_code,

      description: accountDataLocal.value.description,
    }

    if (hasLocationValue.value) {
      payload.location = {
        type: 'Point',
        coordinates: [Number(lng.value), Number(lat.value)],
      }
    }

    if (destinationId && destinationName) {
      payload.receiverLocation = {
        destinationId,
        destinationName,
      }
    }

    const res = await apiFetch(`/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    sweetAlert.success(res.data.message)
  } catch (err) {
    console.error(err)
    sweetAlert.error(err.message)
  }
}

async function getProfile() {
  try {
    const { data } = await apiFetch(`/profile/${userId}`)
    const user = data.user

    Object.assign(accountDataLocal.value, {
      id: user._id,
      name: user.nama || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      village: user.village || '',
      subdistrict: user.subdistrict || '',
      city: user.city || '',
      zip_code: user.zip_code || '',
      avatar: user.avatar || null,
      description: user.description || '',
      receiverLocation: user.receiverLocation || null,
      location: user.location || null,
    })

    if (user.receiverLocation?.destinationId && user.receiverLocation?.destinationName) {
      selectedDestination.value = [{
        value: user.receiverLocation.destinationId,
        label: user.receiverLocation.destinationName,
        zipCode: user.zip_code || '',
      }]
    }

    postCode.value = user.zip_code || null

    const coordinates = user.location?.coordinates

    if (Array.isArray(coordinates) && coordinates.length === 2) {
      const savedLng = Number(coordinates[0])
      const savedLat = Number(coordinates[1])

      if (Number.isFinite(savedLat) && Number.isFinite(savedLng))
        setMapPosition(savedLat, savedLng, { zoom: 13, fly: false })
    }

    console.log('profile', accountDataLocal.value)

  } catch (err) {
    console.error(err)
  }
}

// ================== AVATAR ==================

async function changeAvatar(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const { data } = await apiFetch(`/profile/${userId}/avatar`, {
      method: 'POST',
      body: formData,
    })

    accountDataLocal.value.avatar = data.avatar
    alert('Avatar berhasil diperbarui ✅')
  } catch (err) {
    console.error(err)
    alert('Gagal upload avatar ❌')
  }
}

function resetAvatar() {
  accountDataLocal.value.avatar = avatar1
}

// ================== RESET ==================

function resetForm() {
  Object.assign(accountDataLocal.value, {
    name: '',
    email: '',
    phone_number: '',
    address: '',
    village: '',
    subdistrict: '',
    city: '',
    zip_code: '',
    receiverLocation: null,
    location: null,
  })
  selectedDestination.value = []
  postCode.value = null
  postCodeError.value = ''
  hasLocationValue.value = false
}

const phoneModel = computed({
  get() {
    let val = accountDataLocal.value.phone_number
    if (!val) return ''

    val = String(val)

    if (val.startsWith('+62')) return '0' + val.slice(3)
    if (val.startsWith('62')) return '0' + val.slice(2)

    return val.startsWith('0') ? val : '0' + val
  },
  set(val) {
    accountDataLocal.value.phone_number = val
  }
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Account Details">
        <VCardText class="d-flex">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6"
            :image="accountDataLocal.avatar ? `${backendUrl}${accountDataLocal.avatar}` : avatar1"
          />

          <!-- 👉 Upload Photo -->
          <form class="d-flex flex-column justify-center gap-5">
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                color="primary"
                @click="refInputEl?.click()"
              >
                <VIcon
                  icon="ri-upload-cloud-line"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">Upload new photo</span>
              </VBtn>

              <input
                ref="refInputEl"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @input="changeAvatar"
              />

              <VBtn
                type="reset"
                color="error"
                variant="outlined"
                @click="resetAvatar"
              >
                <span class="d-none d-sm-block">Reset</span>
                <VIcon
                  icon="ri-refresh-line"
                  class="d-sm-none"
                />
              </VBtn>
            </div>

            <p class="text-body-1 mb-0">Allowed JPG, GIF or PNG. Max size of 800K</p>
          </form>
        </VCardText>

        <VDivider />

        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>              
              <VCol cols="12" v-if="role == 'technician'">
                <div class="ckeditor-wrapper">
                  <ckeditor
                    v-if="editor && config"
                    v-model="accountDataLocal.description"
                    :editor="editor"
                    :config="config"
                  />
                </div>
              </VCol>

              <!-- 👉 Name -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountDataLocal.name"
                  label="Nama"
                  placeholder="John Doe"
                  variant="outlined"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.email"
                  label="E-mail"
                  placeholder="johndoe@gmail.com"
                  type="email"
                  variant="outlined"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="phoneModel"
                  label="No. Handphone"
                  variant="outlined"
                  :value="phoneModel"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.address"
                  label="Alamat"
                  variant="outlined"
                />
              </VCol>

              <!-- PROVINSI -->
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="selectedProvince"
                    label="Provinsi"
                    :items="provinceList"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    @update:model-value="handleProvinceChange"
                  />
                </VCol>

                <!-- KABUPATEN -->
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="selectedRegency"
                    label="Kabupaten / Kota"
                    :items="regencyList"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    @update:model-value="handleRegencyChange"
                  />
                </VCol>

                <!-- KECAMATAN -->
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="selectedDistrict"
                    label="Kecamatan"
                    :items="districtList"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    @update:model-value="handleDistrictChange"
                  />
                </VCol>

                <!-- DESA -->
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="selectedVillage"
                    label="Desa / Kelurahan"
                    :items="villageList"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                  />
                </VCol>
              <!-- 👉 Zip Code -->
              <VCol
                cols="12"
                md="12"
                v-if="role == 'technician'"
                >
                <div class="location-section">
                  <div class="location-header">
                    <div>
                      <h3>Lokasi dan kode pos</h3>
                      <p>Pilih kode pos, lalu klik peta atau ambil lokasi saat ini.</p>
                    </div>
                    <div class="coordinate-pill">
                      {{ lat.toFixed(5) }}, {{ lng.toFixed(5) }}
                    </div>
                  </div>

                  <p
                    v-if="postCodeError"
                    class="location-error"
                  >
                    {{ postCodeError }}
                  </p>

                  <CMultiSelect
                    :multiple="false"
                    :options="destinationList"
                    :value="selectedDestination"
                    @change="handleDestinationChange"
                    @filter-change="handleSearch"
                    :placeholder="`(Kode Pos) ${accountDataLocal.receiverLocation?.destinationName || postCode || 'Masukkan kode pos'}`"
                    virtual-scroller
                    teleport="body"
                  />

                  <div
                    id="profile-map"
                    class="profile-map"
                  ></div>

                  <div class="map-footer">
                    <button
                      type="button"
                      class="btn-location"
                      @click.prevent="getMyLocation"
                    >
                      <i class="ri-map-pin-user-line"></i>
                      Ambil Lokasi Saya
                    </button>

                    <span class="location-note">
                      Data ini akan disimpan ke field location user.
                    </span>
                  </div>
                </div>
              </VCol>

              
              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-5"
              >
                <VBtn color="primary" @click="updateProfile">Save changes</VBtn>

                <VBtn
                  color="secondary"
                  variant="outlined"
                  type="reset"
                  @click.prevent="resetForm"
                >
                  Reset
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <ReviewContainer v-if="role == 'technician'" :userId="accountDataLocal.id" />
  </VRow>
</template>

<style scoped>
.ckeditor-wrapper {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px;
}

.location-section {
  padding: 18px;
  border: 1px solid #e5e1ff;
  border-radius: 14px;
  background: #fbfaff;
}

.location-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.location-header h3 {
  margin: 0;
  color: #1f2140;
  font-size: 17px;
  font-weight: 800;
}

.location-header p {
  margin: 4px 0 0;
  color: #74778d;
  font-size: 13px;
}

.coordinate-pill {
  flex-shrink: 0;
  padding: 7px 11px;
  border: 1px solid #d8d3ff;
  border-radius: 999px;
  background: #ffffff;
  color: #8d58ff;
  font-family: monospace;
  font-size: 12px;
  font-weight: 800;
}

.location-error {
  margin: 0 0 10px;
  color: #c72f43;
  font-size: 13px;
  font-weight: 700;
}

.profile-map {
  width: 100%;
  height: 280px;
  margin-top: 14px;
  overflow: hidden;
  border: 1px solid #e5e1ff;
  border-radius: 12px;
  background: #f4f2ff;
}

.map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.btn-location {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 14px;
  border: 1.5px solid #8d58ff;
  border-radius: 10px;
  background: #ffffff;
  color: #8d58ff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.btn-location:hover {
  background: #f3efff;
}

.location-note {
  color: #74778d;
  font-size: 12px;
  text-align: right;
}

@media (max-width: 600px) {
  .location-header,
  .map-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .coordinate-pill,
  .btn-location {
    width: 100%;
  }

  .location-note {
    text-align: left;
  }

  .profile-map {
    height: 220px;
  }
}
</style>
