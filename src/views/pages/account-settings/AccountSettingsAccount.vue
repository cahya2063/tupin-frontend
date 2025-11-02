<script setup>
import { apiFetch } from '@/utils/api'
import avatar1 from '@images/avatars/avatar-1.png'
import { ref } from 'vue'


const userId = localStorage.getItem('userId')
const role = localStorage.getItem('role')


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
  address: '123 Main St, Banyuwangi, NY 10001',
  zip: '10001',
  city: 'Banyuwangi',
  subdistrict: 'Banyuwangi',
  village: 'Karangrejo',
  language: 'English',
  timezone: '(GMT-11:00) International Date Line West',
  currency: 'USD',
}

const refInputEl = ref()
const accountDataLocal = ref({
  id: '',
  name: '',
  email: '',
  avatar: '',
  // field profile tambahan
  phone_number: '',
  address: '',
  village: '',
  subdistrict: '',
  city: '',
  zip_code: '',
})
const isAccountDeactivated = ref(false)



async function updateProfile() {
  try {
    const response = await apiFetch(`/profile/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nama: accountDataLocal.value.name,
        phone_number: accountDataLocal.value.phone_number,
        address: accountDataLocal.value.address,
        village: accountDataLocal.value.village,
        subdistrict: accountDataLocal.value.subdistrict,
        city: accountDataLocal.value.city,
        zip_code: accountDataLocal.value.zip_code,
      })
      
    })
      alert(response.data.message)
  } catch (error) {
    console.error(error)
    alert('Gagal update profile ❌')
  }
}
async function getProfile() {
  try {
    const response = await apiFetch(`/profile/${userId}`)

    accountDataLocal.value = {
      ...accountDataLocal.value,
      id: response.data.user._id,
      name: response.data.user.nama,
      email: response.data.user.email,
      phone_number: response.data.user.phone_number || '',
      address: response.data.user.address || '',
      village: response.data.user.village || '',
      subdistrict: response.data.user.subdistrict || '',
      city: response.data.user.city || '',
      zip_code: response.data.user.zip_code || '',
      avatar: response.data.user.avatar || null, // default avatar jika kosong
    }

    console.log('profile', accountDataLocal.value);
    
    
  } catch (err) {
    console.error(err.message)
  }
}

const resetForm = () => {
  accountDataLocal.value = structuredClone(accountData)
}

const changeAvatar = async file => {
  const { files } = file.target
  if (!files || !files.length) return

  const formData = new FormData()
  formData.append('avatar', files[0]) // `avatar` harus sama dengan field multer.single('avatar')

  try {
    const response = await apiFetch(`/profile/${userId}/avatar`, {
      method: 'POST',
      body: formData,
    })

    // update preview avatar
    accountDataLocal.value.avatar = response.data.avatar
    
    alert('Avatar berhasil diperbarui ✅')
  } catch (error) {
    console.error(error)
    alert('Gagal upload avatar ❌')
  }
}

// reset avatar image
const resetAvatar = () => {
  accountDataLocal.value.avatar = accountData.avatarImg
}

// Data dummy ulasan
const reviews = ref([
  {
    user: 'Budi Santoso',
    rating: 5,
    comment: 'Pelayanan sangat cepat dan ramah!',
    date: '2 November 2025',
  },
  {
    user: 'Siti Rahma',
    rating: 4,
    comment: 'Teknisi datang tepat waktu dan hasil perbaikan bagus.',
    date: '1 November 2025',
  },
  {
    user: 'Ahmad Fauzi',
    rating: 3,
    comment: 'Cukup baik, tapi perlu peningkatan dalam komunikasi.',
    date: '30 Oktober 2025',
  },
])

// Event klik tombol ulasan (sementara hanya alert)
// const addReview = () => {
//   alert('Fitur tambah ulasan akan ditambahkan nanti.')
// }
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
            :image="accountDataLocal.avatar 
    ? `http://localhost:3000${accountDataLocal.avatar}` 
    : avatar1"
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
                  label="Nama"
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

              

              <!-- 👉 Phone -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.phone_number"
                  label="No. Handphone"
                  placeholder="085123456789"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.address"
                  label="Alamat"
                  placeholder="Jl. Ikan Hiu no. 123"
                />
              </VCol>

              <!-- 👉 village -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.village"
                  label="Desa/Kelurahan"
                  placeholder="Karangrejo"
                />
              </VCol>

              <!-- 👉 subdistrict -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.subdistrict"
                  label="Kecamatan"
                  placeholder="Banyuwangi"
                />
              </VCol>

              <!-- 👉 city -->
              <VCol cols="12" md="6">
                <VSelect
                  v-model="accountDataLocal.city"
                  label="Kabupaten"
                  :items="['Banyuwangi']"
                  placeholder="Select city"
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.zip_code"
                  label="Kode pos"
                  placeholder="68411"
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

    <VCol cols="12" v-show="role=='technician'">
      <!-- 👉 Data Sertifikat -->
      <VCard title="Data Sertifikat">
        <VCardText>
          <div>
            <VCheckbox
              
              label="I confirm my account deactivation"
            />
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
    
    <VCol cols="12">
    <!-- 👉 Kartu Ulasan -->
    <VCard title="Ulasan">
      <VCardText>
        <!-- Daftar Komentar (Scrollable Area) -->
        <div class="review-list">
          <div
            v-for="(review, index) in reviews"
            :key="index"
            class="mb-4 border-b pb-3"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <strong>{{ review.user }}</strong>
                <div class="text-grey text-caption">{{ review.date }}</div>
              </div>

              <!-- Rating Bintang -->
              <div class="text-warning">
                <VIcon
                  v-for="n in 5"
                  :key="n"
                  :icon="n <= review.rating ? 'mdi-star' : 'mdi-star-outline'"
                  size="18"
                />
              </div>
            </div>

            <!-- Isi Komentar -->
            <div class="mt-2 text-body-2">
              {{ review.comment }}
            </div>
          </div>
        </div>


      </VCardText>
    </VCard>
  </VCol>

    
  </VRow>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
.text-warning {
  color: #fbc02d;
}

/* ✅ Scroll untuk daftar ulasan */
.review-list {
  max-height: 300px; /* batas tinggi area komentar */
  overflow-y: auto;  /* aktifkan scroll vertikal */
  padding-right: 6px;
}

/* opsional: styling scrollbar agar lebih halus */
.review-list::-webkit-scrollbar {
  width: 6px;
}
.review-list::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}
.review-list::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}
</style>
