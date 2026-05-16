<script setup>
import jobSeek from '@assets/landing-page/third-content/job.png'
import mechanics from '@assets/landing-page/third-content/mechanic-right.png'
import sosImage from '@assets/landing-page/third-content/sos.png'
import leakImage from '@assets/landing-page/third-content/leak.png'

const features = [
  {
    icon: jobSeek,
    title: 'Peluang Kerja',
    desc: 'Selalu membutuhkan tenaga kerja berpengalaman untuk bergabung menjadi mitra kami.'
  },
  {
    icon: mechanics,
    title: 'Teknisi Andal',
    desc: 'Jangan khawatir, proyek atau barang perbaikan Anda berada di tangan yang tepat.'
  },
  {
    icon: sosImage,
    title: 'Siap Siaga',
    desc: 'Teknisi kami selalu siap sedia di saat ada keperluan dadakan dan mendesak.'
  },
  {
    icon: leakImage,
    title: 'Layanan Panggilan',
    desc: 'Beritahu kami jika mengalami kerusakan, teknisi akan segera menghampiri lokasi Anda.'
  }
]
</script>

<template>
  <section class="features-section">
    <div class="features-header">
      <span class="eyebrow">Keunggulan</span>
      <h2>Layanan Unggulan Kami</h2>
      <p>Mengapa banyak orang mempercayakan perbaikannya kepada Fixify?</p>
    </div>

    <div class="features-grid">
      <div 
        v-for="(feat, index) in features" 
        :key="index"
        class="feature-item"
      >
        <div class="feat-icon-box">
          <img :src="feat.icon" :alt="feat.title" />
        </div>
        <div class="feat-content">
          <h3>{{ feat.title }}</h3>
          <p>{{ feat.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.features-header {
  text-align: center;
  margin-bottom: 60px;
}

.eyebrow {
  display: inline-block;
  padding: 6px 14px;
  background-color: #f0ebff;
  color: #8d58ff;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 16px;
}

.features-header h2 {
  font-size: 36px;
  font-weight: 900;
  color: #1a1525;
  margin: 0 0 16px;
}

.features-header p {
  font-size: 18px;
  color: #655c75;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  width: 100%;
  max-width: 1000px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 32px;
  background-color: #ffffff;
  border: 1px solid #f0ebff;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background-color: #fbf9ff;
  border-color: #d1bfff;
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(141, 88, 255, 0.08);
}

.feat-icon-box {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background-color: #f4efff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feat-icon-box img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.feat-content h3 {
  font-size: 20px;
  font-weight: 800;
  color: #1a1525;
  margin: 0 0 10px;
}

.feat-content p {
  font-size: 15px;
  line-height: 1.6;
  color: #655c75;
  margin: 0;
}

@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .features-section {
    padding: 60px 20px;
  }

  .features-header h2 {
    font-size: 28px;
  }

  .feature-item {
    flex-direction: column;
    padding: 24px;
  }
}
</style>
