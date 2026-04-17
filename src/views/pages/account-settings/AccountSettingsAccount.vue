<script setup>
import ReviewContainer from '@/pages/part/ReviewContainer.vue'
import { apiFetch } from '@/utils/api'
import avatar1 from '@images/avatars/avatar-1.png'
import { ref, onMounted } from 'vue'
import { useDestination } from '@/utils/tools'

const { destinationList, handleSearch } = useDestination()

const userId = localStorage.getItem('userId')
const role = localStorage.getItem('role')

const selectedDestination = ref([])

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
  receiverLocation: null,
})

const refInputEl = ref()

onMounted(getProfile)

// ================== API ==================

async function updateProfile() {
  try {
    const dest = selectedDestination.value[0] || {}

    const payload = {
      nama: accountDataLocal.value.name,
      phone_number: accountDataLocal.value.phone_number,
      address: accountDataLocal.value.address,
      village: accountDataLocal.value.village,
      subdistrict: accountDataLocal.value.subdistrict,
      city: accountDataLocal.value.city,
      zip_code: dest.zipCode || accountDataLocal.value.zip_code,
      receiverLocation: {
        destinationId: dest.value,
        destinationName: dest.label,
      },
    }

    const res = await apiFetch(`/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    alert(res.data.message)
  } catch (err) {
    console.error(err)
    alert('Gagal update profile ❌')
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
      receiverLocation: user.receiverLocation || null,
    })
    console.log('profile', accountDataLocal.value.receiverLocation.destinationName)

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
  })
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
            :image="accountDataLocal.avatar ? `http://localhost:3000${accountDataLocal.avatar}` : avatar1"
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

              <!-- 👉 village -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.village"
                  label="Desa/Kelurahan"
                  variant="outlined"
                />
              </VCol>

              <!-- 👉 subdistrict -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.subdistrict"
                  label="Kecamatan"
                  variant="outlined"
                />
              </VCol>

              <!-- 👉 city -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="accountDataLocal.city"
                  label="Kabupaten"
                  :items="['Banyuwangi']"
                  placeholder="Select city"
                  variant="outlined"
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol
                cols="12"
                md="6"
              >
                  <CMultiSelect
                    :multiple="false"
                    :options="destinationList"
                    :value="selectedDestination"
                    @change="(val) => { selectedDestination = val }"
                    @filter-change="handleSearch"
                    :placeholder="`(Kode Pos) ${accountDataLocal.receiverLocation?.destinationName || 'Masukkan kode pos'}`"
                    virtual-scroller
                    teleport="body"
                    
                  />
                
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

    <VCol
      cols="12"
      v-show="role == 'technician'"
    >
      <!-- 👉 Data Sertifikat -->
      <VCard title="Data Sertifikat">
        <VCardText>
          <div>
            <VCheckbox label="I confirm my account deactivation" />
          </div>

          <VBtn
            color="error"
            class="mt-3"
          >
            Deactivate Account
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>

    <ReviewContainer :userId="accountDataLocal.id" />
  </VRow>
</template>

<style scoped>

</style>
