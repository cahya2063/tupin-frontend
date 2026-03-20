<script setup>
import { apiFetch, getProfile } from '@/utils/api';
import { ref } from 'vue';

const nearestTechnicianProfile = ref([])
const showSearch = ref(false)

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}
const formatDistance = (distance)=>{
  if(distance < 1){
    return `${Math.round(distance * 1000)} m`
  } else {
    // supaya km menjadi desimal
    return `${distance.toFixed(2)} km`
  }
}


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
async function getSkills(id){
  const response = await apiFetch(`/skills/${id}`)
  console.log('skill teknisi : ', response);
  
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
onMounted( async () => {
  const profile = await getProfile(localStorage.getItem('userId'));

  const location = {
    lat: profile.location.coordinates[1],
    lng: profile.location.coordinates[0]
  }
  
  const nearestTechnician = await getNearestTechnician(location)
  // const skills = await getSkills(nearestTechnician.data.technicians[0]._id)
  const technicians = nearestTechnician.data.technicians

  nearestTechnicianProfile.value = await buildTechnicianProfiles(technicians)

  // console.log('teknisi skill : ', nearestTechnicianProfile.value[0].skills);
  console.log('profile teknisi terdekat : ', nearestTechnicianProfile.value);
})

</script>
<template>
  <div class="content">

    <div class="banner-card">
      
      <div class="title">
        Cari teknisi disekitarmu!
      </div>
      <div class="banner-description">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates dolore atque alias. Consequatur, accusamus nobis expedita rerum iusto cum praesentium corporis explicabo, ea molestiae dolores, est vitae? Praesentium dolorem dolor iusto soluta perferendis doloribus repellendus, ad fugit mollitia molestias sint unde non. Aliquid ratione omnis tempora quaerat sequi eaque sed!
      </div>
      <a href="#" class="btn-search" @click.prevent="toggleSearch">Cari</a>
      
    </div>
    <transition name="slide-fade">
      <div class="search-box" v-show="showSearch">
        <input type="text" placeholder="Cari teknisi..." />
        <button type="submit">🔍</button>
      </div>
    </transition>


    <div class="technician-card" v-for="(item, i) in nearestTechnicianProfile" :key="i">
      <div class="part-one">
        <div class="technician-detail">

          <CAvatar color="secondary" size="lg">CUI</CAvatar>
          <div class="technician-name">{{ item.nama }}</div>
        </div>
        <v-rating
          half-increments
          hover
          readonly
          :length="5"
          :size="29"
          :model-value="item.ratings"
          color="warning"
          active-color="warning"
        />
      </div>
      <div class="part-two">
        <v-chip 
          class="me-2"
          v-for="(skill, index) in item.skills"
          color="success lighten-4"
          text-color="green darken-2"
          >
          {{ skill }}
        </v-chip>
      </div>
      <div class="part-three">
        <div class="completed-work">
          4 pekerjaan terselesaikan
        </div>
        <div class="distance">
          <i class="ri-map-pin-line" style="font-size: 20px;"></i>

          {{ formatDistance(item.distance) }}
        </div>
      </div>
      <div class="part-four">
        {{ item.description }}
      </div>
      <div class="part-five">
        <VBtn
          color="primary"
          variant="elevated"
          class="mt-4 mx-2"
          :to="`/technician-detail/${item._id}`"
        >
          Lihat Profile
        </VBtn>
      </div>
    </div>
  </div>
</template>
<style scoped>

.content{
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-inline: auto;
  /* padding: 20px; */
}
.banner-card{
  margin-inline: auto;
  /* width: 80%; */
  /* height: 200px; */
  background-color: #8d58ff;
  display: flex;
  flex-direction: column;
  color: #333;
  border-radius: 25px;
  align-items: start;
  padding: 20px;
}
.title{
  font-family: 'Quicksand';
  font-size: 35px;
  font-weight: 900;
  color: white;
}
.banner-description{
  font-family: 'Quicksand';
  font-size: 18px;
  color: white;
}
.btn-search {
  width: 130px;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #333;
  color: white;
  height: 40px;
  text-decoration: none;
  border-radius: 15px;
  font-size: 20px;

  display: flex;
  justify-content: center;
  align-items: center;
}
.search-box {
  position: relative;
  /* width: 300px; */
}

.search-box input {
  width: 100%;
  padding: 12px 45px 12px 15px;
  border-radius: 30px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-box input:focus {
  border-color: #333;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
}

.search-box button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: #333;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s ease;
}

.search-box button:hover {
  background: #555;
}

/* animasi klik btn-search */
.slide-fade-enter-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


/* card technician */
.technician-card {
  background-color: white;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-content: space-evenly;
  padding-inline: 15px;
}
.technician-card:hover {
  background-color: #dae0e4;
  border-radius: 20px;
}
.part-one, .part-two, .part-three, .part-four{
  display: flex;
  flex-direction: row;
}
.part-one{
  justify-content: space-between;
  padding-block: 10px;
  align-items: center;

}
.technician-detail{
  display: flex;
  gap: 15px;
}
.technician-name{
  font-size: 30px;
  font-weight: bolder;
}
.part-three{
  justify-content: space-between;
  align-items: center;
}
.distance{
  background-color: #8d58ff;
  display: flex;
  padding: 5px;
  border-radius: 10px;
  align-items: center;
}
.part-four{
  width: 90%;
}
</style>
