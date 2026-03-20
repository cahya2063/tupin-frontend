<script setup>
import { ref, computed, toRaw } from 'vue'

const props = defineProps({
  id: String,
  title: String,
  deadline: Object,
  desc: String,
  // skills: Array,
  category: String,
  status: String,
  creator: String,
  // invitesAvatars: Object,
  avatarPlaceholder: String, // untuk default avatar
})

const showFull = ref(false)

// 🔹 Fungsi bantu: hapus tag HTML
const stripHtml = text => text?.replace(/<[^>]*>/g, '').trim() ?? ''

// const formattedSubtext = computed(() => {
//   const result = props.deadline.map(item => {
//     const rawItem = toRaw(item)

//     // 🔹 Jika objek deadline
//     if (rawItem && typeof rawItem === 'object' && 'start_date' in rawItem && 'end_date' in rawItem) {
//       const start = rawItem.start_date ? formatDate(rawItem.start_date) : '-'
//       const end = rawItem.end_date ? formatDate(rawItem.end_date) : '-'
//       return `${start} → ${end}`
//     }

//     // 🔹 Jika angka → format rupiah
//     if (typeof rawItem === 'number') {
//       return `Rp ${rawItem.toLocaleString('id-ID')}`
//     }

//     // 🔹 Jika string → hapus tag HTML
//     if (typeof rawItem === 'string') {
//       return rawItem.replace(/<[^>]*>/g, '').trim()
//     }

//     // 🔹 Jika null atau undefined
//     if (rawItem === null || rawItem === undefined) {
//       return '-'
//     }

//     // 🔹 Default fallback
//     return String(rawItem)
//   })

//   return result.join(', ')
// })

// Fungsi bantu format tanggal
function formatDate(dateStr) {
  // Ambil hanya bagian YYYY-MM-DD
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)

  // Buat tanggal tanpa konversi zona waktu
  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// 🔹 Deskripsi tampil maksimal 60 kata
const displayedText = computed(() => {
  const plainText = stripHtml(props.desc)
  const words = plainText.split(' ')
  if (showFull.value || words.length <= 60) return plainText
  return words.slice(0, 60).join(' ') + '...'
})

const toggleShow = () => {
  showFull.value = !showFull.value
}
</script>

<template>
  <div class="container">
    <div class="container-1">
      <div class="creator">created by {{ creator }} ({{ id }})</div>
      <VChip
        color="success"
        size="small"
        class="job-status-chip"
        variant="elevated"
      >
        {{ status }}
      </VChip>
    </div>

    <div class="title">{{ title }}</div>
    <!-- <div class="subtext-1">{{ formattedSubtext }}</div> -->

    <div class="desc">
      {{ displayedText }}
      <template v-if="props.desc.split(' ').length > 60">
        <span
          class="see-more"
          @click="toggleShow"
        >
          {{ showFull ? ' Sembunyikan' : ' Lihat selengkapnya' }}
        </span>
      </template>
    </div>


    <div class="category">
      <VChip
        color="success lighten-4"
        text-color="green darken-2"
        size="small"
        class="me-2"
      >
        {{ category }}
      </VChip>

    </div>
  </div>
</template>

<style scoped>
.container {
  width: 90%;
  background-color: white;
  /* border: 2px solid black; */
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-content: space-evenly;
}
.container:hover {
  background-color: #dae0e4;
  border-radius: 10px;
}
.container-1 {
  display: flex;
  justify-content: space-between; /* beri jarak antara kiri dan kanan */
  align-items: center; /* sejajarkan secara vertikal */
  margin-bottom: 8px; /* beri sedikit jarak ke bawah (opsional) */
}
.title {
  font-size: 25px;
  font-weight: 600;
}

.subtext-1,
.creator {
  font-size: 12px;
}

.desc {
  font-size: 16px;
  margin-block: 12px;
  line-height: 1.5;
}

.see-more {
  color: #007bff;
  cursor: pointer;
  font-weight: 500;
}

.see-more:hover {
  text-decoration: underline;
}

.category {
  margin-top: 10px;
}

@media (max-width: 1024px) {
  .container {
    width: 100%;
  }
}
</style>
