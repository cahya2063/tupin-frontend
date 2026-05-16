<script setup>
import downloadImage from '@assets/landing-page/download.gif'
import technicianImage from '@assets/landing-page/technician.gif'
import handShakeImage from '@assets/landing-page/handshake.gif'
import launch from '@assets/landing-page/launch.gif'

const statistics = [
  {
    title: 'Akses Mudah',
    subtitle: 'Satu Aplikasi Terpadu',
    desc: 'Unduh dan gunakan Fixify dengan antarmuka yang dirancang sangat ramah untuk siapa saja.',
    src: downloadImage,
    alt: 'Gambar akses mudah',
  },
  {
    title: 'Kualitas Ahli',
    subtitle: 'Teknisi Terverifikasi',
    desc: 'Kami membangun sistem seleksi untuk memastikan teknisi yang bergabung memiliki keahlian andal.',
    src: technicianImage,
    alt: 'Gambar teknisi',
  },
  {
    title: 'Kolaborasi',
    subtitle: 'Kemitraan UMKM',
    desc: 'Kami berfokus menjalin kemitraan yang transparan dan menguntungkan bagi para penyedia jasa.',
    src: handShakeImage,
    alt: 'Gambar mitra',
  },
  {
    title: 'Inovasi',
    subtitle: 'Terus Berkembang',
    desc: 'Platform ini akan terus diperbarui dengan fitur-fitur baru demi memberikan layanan terbaik.',
    src: launch,
    alt: 'Gambar roket',
  },
]
</script>

<template>
  <section class="stats-section">
    <div class="section-header">
      <h2>Pencapaian Kami</h2>
      <p>Kami terus bertumbuh untuk memberikan pelayanan perbaikan terbaik di Indonesia.</p>
    </div>

    <div class="stats-grid">
      <div 
        v-for="(stat, index) in statistics" 
        :key="index"
        class="stat-card"
      >
        <div class="stat-icon-wrapper">
          <img :src="stat.src" :alt="stat.alt" class="stat-icon" />
        </div>
        <div class="stat-info">
          <h3>{{ stat.title }}</h3>
          <h4>{{ stat.subtitle }}</h4>
          <p>{{ stat.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-section {
  padding: 80px 24px;
  background-color: #fbf9ff;
  border-radius: 40px;
  margin: 40px 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 900;
  color: #1a1525;
  margin: 0 0 16px;
}

.section-header p {
  font-size: 18px;
  color: #655c75;
  max-width: 600px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #f0ebff;
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(141, 88, 255, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(141, 88, 255, 0.12);
  border-color: #d1bfff;
}

.stat-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background-color: #f4efff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.stat-info h3 {
  font-size: 32px;
  font-weight: 900;
  color: #8d58ff;
  margin: 0 0 8px;
}

.stat-info h4 {
  font-size: 18px;
  font-weight: 800;
  color: #1a1525;
  margin: 0 0 12px;
}

.stat-info p {
  font-size: 14px;
  color: #655c75;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .stats-section {
    padding: 60px 20px;
    margin: 20px 16px;
    border-radius: 30px;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .stat-card {
    padding: 24px;
  }
}
</style>
