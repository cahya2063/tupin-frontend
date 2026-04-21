<script setup>
import { apiFetch, getProfile } from '@/utils/api';
import { getCurrentLocation } from '@/utils/tools';
import avatar1 from '@images/avatars/avatar-1.png'
import { computed, ref } from 'vue';

const nearestTechnicianProfile = ref([])
const skillsList = ref([])
const selectedSkills = ref([])
const isLoading = ref(false)

const formatDistance = (distance)=>{
  if(distance < 1){
    return `${Math.round(distance * 1000)} m`
  } else {
    // supaya km menjadi desimal
    return `${distance.toFixed(2)} km`
  }
}

const filteredTechnicians = computed(()=>{

  if(selectedSkills.value.length === 0){
    return nearestTechnicianProfile.value
  }

  return nearestTechnicianProfile.value.filter(technician => 
    selectedSkills.value.some(skill => technician.skills.includes(skill))
  )
})


async function getNearestTechnician(location){  
  const nearestTechnicianList = await apiFetch('/nearest-technician', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(location)
  })

  
  return nearestTechnicianList
}

async function getAllSkills(){
  const response = await apiFetch('/skills')
  
  // console.log('data skills : ', response.data.skills[0].label);
  response.data.skills.forEach((skill, i)=>{    
    skillsList.value.push(
      skill.label,
    )
  })
  
  // return response.data.skills
}

async function getSkills(id){
  const response = await apiFetch(`/skills/${id}`)
  
  return response.data.skill.label
}

const buildTechnicianProfiles = async (technicians) =>
  Promise.all(
    technicians.map(async ({ _id, distance }) => {
      
      const profile = await getProfile(_id)

      // ambil semua skill berdasarkan ID
      const skillDetails = await Promise.all(
        profile.skills.map(async (skillId) => {
          return await getSkills(skillId)
        })
      )

      return {
        ...profile,
        skills: skillDetails, // sekarang skills bukan ID lagi
        distance
      }
    })
  )

const searchNearestTechnician = async()=>{
  try {
    isLoading.value = true
    const location = await getCurrentLocation()
    console.log('location test : ', location.lat);
    
    
    const nearestTechnician = await getNearestTechnician(location)
    const technicians = nearestTechnician.data.technicians
    console.log('teknisi terdekat : ', technicians);
        
  
    nearestTechnicianProfile.value = await buildTechnicianProfiles(technicians)
    sessionStorage.setItem('nearestTechnicianProfile', JSON.stringify(nearestTechnicianProfile.value))
  } catch (error) {
    console.error(error);
    
  }finally{
    isLoading.value = false
  }


}
onMounted( async () => {
  getAllSkills()
  const data = sessionStorage.getItem('nearestTechnicianProfile')
  if(data){
    nearestTechnicianProfile.value = JSON.parse(data)
    console.log('data teknisi terdekat : ', nearestTechnicianProfile.value);
    
  }
})

</script>
<template>
  <div class="page-wrapper">
    <div class="content">
 
      <!-- ── Banner ── -->
      <div class="banner-card">
        <div class="banner-inner">
          <span class="banner-eyebrow">Direktori Teknisi</span>
          <h1 class="banner-title">Cari teknisi di sekitarmu!</h1>
          <p class="banner-description">
            Temukan teknisi terpercaya terdekat dari lokasimu. Bandingkan rating,
            keahlian, dan jarak sebelum menghubungi.
          </p>
          <a href="#" class="btn-search" @click.prevent="searchNearestTechnician">
            <i class="ri-search-line"></i>
            Cari Sekarang
          </a>
        </div>
        <div class="banner-deco banner-deco--1"></div>
        <div class="banner-deco banner-deco--2"></div>
      </div>
 
      <!-- ── Filter Skills ── -->
      <div class="filter-card">
        <p class="filter-label">
          <i class="ri-filter-3-line"></i>
          Filter berdasarkan keahlian
        </p>
        <VSelect
          v-model="selectedSkills"
          clearable
          chips
          label="Pilih keahlian..."
          :items="skillsList"
          multiple
          variant="outlined"
          color="#8d58ff"
          base-color="#c4aeff"
          class="skill-select"
        />
      </div>
 
      <!-- ── Loading ── -->
      <div v-if="isLoading" class="loading-container">
        <v-progress-circular :size="52" :width="5" color="#8d58ff" indeterminate />
        <span class="loading-text">Mencari teknisi terdekat…</span>
      </div>
 
      <!-- ── List ── -->
      <div v-else>
        <template v-if="filteredTechnicians.length > 0">
          <div
            class="technician-card"
            v-for="(item, i) in filteredTechnicians"
            :key="i"
          >
            <!-- Part 1 – Avatar + Nama + Rating -->
            <div class="part-one">
              <div class="technician-detail">
                <CAvatar
                  class="avatar-wrapper"
                  :src="item.avatar ? `http://localhost:3000${item.avatar}` : avatar1"
                />
                <div class="name-block">
                  <div class="technician-name">{{ item.nama }}</div>
                  <div class="address">
                    <i class="ri-map-pin-2-line"></i>
                    {{ item.village }}, {{ item.city }}
                  </div>
                </div>
              </div>
              <CRating readOnly v-model="item.ratings" class="card-rating" />
            </div>
 
            <!-- Part 2 – Skills -->
            <div class="part-two">
              <v-chip
                v-for="(skill, index) in item.skills"
                :key="index"
                class="skill-chip"
                size="small"
              >
                {{ skill }}
              </v-chip>
            </div>
 
            <!-- Part 3 – Jarak (desktop) -->
            <div class="part-three">
              <div class="distance-badge">
                <i class="ri-map-pin-line"></i>
                {{ formatDistance(item.distance) }}
              </div>
            </div>
 
            <!-- Part 4 – Deskripsi -->
            <div class="part-four" v-html="item.description"></div>
 
            <!-- Part 5 – Tombol + Jarak mobile -->
            <div class="part-five">
              <VBtn
                color="#8d58ff"
                variant="elevated"
                class="btn-profile"
                :to="`/technician-detail/${item._id}`"
                rounded="pill"
              >
                <i class="ri-user-line me-1"></i>
                Lihat Profil
              </VBtn>
              <div class="distance-badge mobile-distance">
                <i class="ri-map-pin-line"></i>
                {{ formatDistance(item.distance) }}
              </div>
            </div>
          </div>
        </template>
 
        <!-- ── Empty State ── -->
        <template v-else>
          <div class="empty-state">
            <div class="empty-icon">
              <i class="ri-search-eye-line"></i>
            </div>
            <h3 class="empty-title">Tidak ada teknisi yang sesuai</h3>
            <p class="empty-sub">Coba ubah atau hapus filter skill yang dipilih</p>
          </div>
        </template>
      </div>
 
    </div>
  </div>
</template>
 
<style scoped>
/* ─── Base ─────────────────────────────────────────────── */
.page-wrapper {
  background-color: #f4f0ff;
  min-height: 100vh;
  padding: 28px 16px 48px;
}
 
.content {
  width: min(90%, 820px);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
 
/* ─── Banner ─────────────────────────────────────────────── */
.banner-card {
  background-color: #8d58ff;
  border-radius: 24px;
  padding: 32px 32px 28px;
  position: relative;
  overflow: hidden;
}
 
.banner-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
 
.banner-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
}
 
.banner-title {
  font-family: 'Quicksand', sans-serif;
  font-size: 30px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  margin: 0;
}
 
.banner-description {
  font-family: 'Quicksand', sans-serif;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.65;
  max-width: 520px;
  margin-bottom: 8px;
}
 
.btn-search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 11px 26px;
  background-color: #ffffff;
  color: #8d58ff;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.15s;
}
 
.btn-search:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
 
/* Dekoratif lingkaran */
.banner-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  pointer-events: none;
}
.banner-deco--1 {
  width: 220px;
  height: 220px;
  top: -60px;
  right: -50px;
}
.banner-deco--2 {
  width: 140px;
  height: 140px;
  bottom: -50px;
  right: 60px;
}
 
/* ─── Filter ─────────────────────────────────────────────── */
.filter-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px 22px 12px;
  border: 1px solid rgba(141, 88, 255, 0.12);
}
 
.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #8d58ff;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
 
.skill-select :deep(.v-field__outline__start),
.skill-select :deep(.v-field__outline__end),
.skill-select :deep(.v-field__outline__notch) {
  border-color: rgba(141, 88, 255, 0.35) !important;
}
 
.skill-select :deep(.v-chip) {
  background-color: #ede8ff !important;
  color: #6a38d4 !important;
  font-weight: 600;
}
 
/* ─── Loading ─────────────────────────────────────────────── */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding: 56px 0;
}
 
.loading-text {
  font-size: 14px;
  color: #8d58ff;
  font-weight: 500;
}
 
/* ─── Technician Card ────────────────────────────────────── */
.technician-card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 22px 22px 18px;
  border: 1px solid rgba(141, 88, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  margin-block: 40px;
}
 
.technician-card:hover {
  border-color: #8d58ff;
  box-shadow: 0 6px 28px rgba(141, 88, 255, 0.13);
}
 
/* Part 1 */
.part-one {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
 
.technician-detail {
  display: flex;
  align-items: center;
  gap: 14px;
}
 
.avatar-wrapper {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2.5px solid #e0d6ff;
}
 
.avatar-wrapper :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
 
.name-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
 
.technician-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}
 
.address {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}
 
.card-rating {
  flex-shrink: 0;
}
 
/* Part 2 – chips */
.part-two {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
 
.skill-chip {
  background-color: #f0ebff !important;
  color: #7040d0 !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  border: 1px solid #ddd4ff !important;
}
 
/* Part 3 – Jarak desktop */
.part-three {
  display: flex;
  justify-content: flex-end;
}
 
.distance-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #f0ebff;
  color: #8d58ff;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 50px;
  border: 1px solid #ddd4ff;
}
 
/* Part 4 – Deskripsi */
.part-four {
  background-color: #fafafa;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 14px 18px;
  font-size: 14px;
  color: #555;
  line-height: 1.7;
  max-height: 90px;
  overflow-y: auto;
}
 
/* Part 5 */
.part-five {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}
 
.btn-profile {
  font-weight: 600 !important;
  letter-spacing: 0.3px;
  padding-inline: 22px !important;
}
 
.mobile-distance {
  display: none;
}
 
/* ─── Empty State ─────────────────────────────────────────── */
.empty-state {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(141, 88, 255, 0.1);
  padding: 56px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}
 
.empty-icon {
  width: 64px;
  height: 64px;
  background: #f0ebff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #8d58ff;
  margin-bottom: 4px;
}
 
.empty-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
}
 
.empty-sub {
  font-size: 14px;
  color: #999;
}
 
/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 768px) {
  .content {
    width: 95%;
  }
 
  .banner-title {
    font-size: 22px;
  }
 
  .banner-description {
    font-size: 13px;
  }
 
  .part-one {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
 
  .card-rating {
    align-self: flex-start;
  }
 
  .technician-name {
    font-size: 17px;
  }
 
  /* Sembunyikan badge jarak di desktop-section saat mobile */
  .part-three {
    display: none;
  }
 
  /* Tampilkan badge jarak di part-five saat mobile */
  .mobile-distance {
    display: inline-flex;
  }
 
  .part-five {
    justify-content: space-between;
    flex-direction: row-reverse;
  }
 
  .part-four {
    max-height: 80px;
  }
}
 
@media (max-width: 480px) {
  .banner-card {
    padding: 24px 20px;
  }
 
  .btn-search {
    font-size: 14px;
    padding: 10px 20px;
  }
 
  .technician-card {
    padding: 18px 16px;
  }
}
</style>
