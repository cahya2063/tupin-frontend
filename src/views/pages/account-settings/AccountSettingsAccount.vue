<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import { apiFetch } from '@/utils/api'
import { ref } from 'vue'


const profile = ref(null)
const token = localStorage.getItem('token')
const userId = localStorage.getItem('userId')


onMounted(async () => {
  getProfile()
})



const accountData = {
  avatarImg: avatar1,
  firstName: 'john',
  lastName: 'Doe',
  email: 'johnDoe@example.com',
  org: 'ThemeSelection',
  phone: '+1 (917) 543-9876',
  address: '123 Main St, New York, NY 10001',
  state: 'New York',
  zip: '10001',
  country: 'USA',
  language: 'English',
  timezone: '(GMT-11:00) International Date Line West',
  currency: 'USD',
}

const refInputEl = ref()
const accountDataLocal = ref({
  id: '',
  name: '',
  email: '',
  org: '',
  state: '',
  language: '',
  timezone: '',
  currency: '',
  avatarImg: avatar1,

  // field profile tambahan
  phone_number: '',
  address: '',
  country: '',
  zip_code: '',
})
const isAccountDeactivated = ref(false)



async function updateProfile() {
  try {
    const data = await apiFetch(`/profile/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nama: accountDataLocal.value.name,
        phone_number: accountDataLocal.value.phone_number,
        address: accountDataLocal.value.address,
        country: accountDataLocal.value.country,
        zip_code: accountDataLocal.value.zip_code,
      })
    })
    alert('Profile berhasil diperbarui ✅')
  } catch (error) {
    console.error(error)
    alert('Gagal update profile ❌')
  }
}
async function getProfile() {
  try {
    const data = await apiFetch(`/profile/${userId}`)

    accountDataLocal.value = {
      ...accountDataLocal.value,
      id: data.data._id,
      name: data.data.nama,
      email: data.data.email,
      phone_number: data.data.phone_number || '',
      address: data.data.address || '',
      country: data.data.country || '',
      zip_code: data.data.zip_code || '',
    }
    
  } catch (err) {
    console.error(err.message)
  }
}

const resetForm = () => {
  accountDataLocal.value = structuredClone(accountData)
}

const changeAvatar = file => {
  const fileReader = new FileReader()
  const { files } = file.target
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        accountDataLocal.value.avatarImg = fileReader.result
    }
  }
}

// reset avatar image
const resetAvatar = () => {
  accountDataLocal.value.avatarImg = accountData.avatarImg
}

const timezones = [
  '(GMT-11:00) International Date Line West',
  '(GMT-11:00) Midway Island',
  '(GMT-10:00) Hawaii',
  '(GMT-09:00) Alaska',
  '(GMT-08:00) Pacific Time (US & Canada)',
  '(GMT-08:00) Tijuana',
  '(GMT-07:00) Arizona',
  '(GMT-07:00) Chihuahua',
  '(GMT-07:00) La Paz',
  '(GMT-07:00) Mazatlan',
  '(GMT-07:00) Mountain Time (US & Canada)',
  '(GMT-06:00) Central America',
  '(GMT-06:00) Central Time (US & Canada)',
  '(GMT-06:00) Guadalajara',
  '(GMT-06:00) Mexico City',
  '(GMT-06:00) Monterrey',
  '(GMT-06:00) Saskatchewan',
  '(GMT-05:00) Bogota',
  '(GMT-05:00) Eastern Time (US & Canada)',
  '(GMT-05:00) Indiana (East)',
  '(GMT-05:00) Lima',
  '(GMT-05:00) Quito',
  '(GMT-04:00) Atlantic Time (Canada)',
  '(GMT-04:00) Caracas',
  '(GMT-04:00) La Paz',
  '(GMT-04:00) Santiago',
  '(GMT-03:30) Newfoundland',
  '(GMT-03:00) Brasilia',
  '(GMT-03:00) Buenos Aires',
  '(GMT-03:00) Georgetown',
  '(GMT-03:00) Greenland',
  '(GMT-02:00) Mid-Atlantic',
  '(GMT-01:00) Azores',
  '(GMT-01:00) Cape Verde Is.',
  '(GMT+00:00) Casablanca',
  '(GMT+00:00) Dublin',
  '(GMT+00:00) Edinburgh',
  '(GMT+00:00) Lisbon',
  '(GMT+00:00) London',
]

const currencies = [
  'USD',
  'EUR',
  'GBP',
  'AUD',
  'BRL',
  'CAD',
  'CNY',
  'CZK',
  'DKK',
  'HKD',
  'HUF',
  'INR',
]
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
            :image="accountDataLocal.avatarImg"
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
              >

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

            <p class="text-body-1 mb-0">
              Allowed JPG, GIF or PNG. Max size of 800K
            </p>
          </form>
        </VCardText>

        <VDivider />

        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>
              <!-- 👉 ID -->
              <VCol md="6" cols="12">
                <VTextField
                  v-model="accountDataLocal.id"
                  label="ID"
                  placeholder="User ID"
                  :readonly="true"
                />
              </VCol>

              <!-- 👉 Name -->
              <VCol md="6" cols="12">
                <VTextField
                  v-model="accountDataLocal.name"
                  label="Name"
                  placeholder="John Doe"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.email"
                  label="E-mail"
                  placeholder="johndoe@gmail.com"
                  type="email"
                />
              </VCol>

              <!-- 👉 Organization -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.org"
                  label="Organization"
                  placeholder="ThemeSelection"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.phone_number"
                  label="Phone Number"
                  placeholder="+1 (917) 543-9876"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.address"
                  label="Address"
                  placeholder="123 Main St, New York, NY 10001"
                />
              </VCol>

              <!-- 👉 State -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.state"
                  label="State"
                  placeholder="New York"
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.zip_code"
                  label="Zip Code"
                  placeholder="10001"
                />
              </VCol>

              <!-- 👉 Country -->
              <VCol cols="12" md="6">
                <VSelect
                  v-model="accountDataLocal.country"
                  label="Country"
                  :items="['USA', 'Canada', 'UK', 'India', 'Australia']"
                  placeholder="Select Country"
                />
              </VCol>

              <!-- 👉 Language -->
              <VCol cols="12" md="6">
                <VSelect
                  v-model="accountDataLocal.language"
                  label="Language"
                  :items="['English', 'Spanish', 'Arabic', 'Hindi', 'Urdu']"
                  placeholder="Select Language"
                />
              </VCol>

              <!-- 👉 Timezone -->
              <VCol cols="12" md="6">
                <VSelect
                  v-model="accountDataLocal.timezone"
                  label="Timezone"
                  :items="timezones"
                  placeholder="Select Timezone"
                  :menu-props="{ maxHeight: 200 }"
                />
              </VCol>

              <!-- 👉 Currency -->
              <VCol cols="12" md="6">
                <VSelect
                  v-model="accountDataLocal.currency"
                  label="Currency"
                  :items="currencies"
                  placeholder="Select Currency"
                  :menu-props="{ maxHeight: 200 }"
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol cols="12" class="d-flex flex-wrap gap-4">
                <VBtn @click="updateProfile">Save changes</VBtn>

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

    <VCol cols="12">
      <!-- 👉 Deactivate Account -->
      <VCard title="Deactivate Account">
        <VCardText>
          <div>
            <VCheckbox
              v-model="isAccountDeactivated"
              label="I confirm my account deactivation"
            />
          </div>

          <VBtn
            :disabled="!isAccountDeactivated"
            color="error"
            class="mt-3"
          >
            Deactivate Account
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
