<script setup>
import { useRouter } from 'vue-router'
import gambar from '@assets/landing-page/teknisi-perbaikan-ilustrasi.png'

const router = useRouter()
</script>

<template>
  <section class="hero-section">
    <div class="hero-content">
      
      
      <h1 class="hero-title">
        Solusi Cepat untuk<br>
        <span class="highlight">Setiap Perbaikan Anda</span>
      </h1>
      
      <p class="hero-subtitle">
        Menghubungkan Anda dengan teknisi ahli terpercaya untuk menyelesaikan masalah elektronik, kendaraan, dan kebutuhan rumah tangga lainnya dengan mudah.
      </p>

      <div class="hero-actions">
        <button class="btn-primary" @click="router.push('/login')">
          Cari Teknisi Sekarang
          <i class="ri-arrow-right-line"></i>
        </button>
        <button class="btn-secondary" @click="router.push('/register-technician')">
          Gabung Menjadi Mitra
        </button>
      </div>
    </div>

    <div class="hero-visual">
      <div class="visual-backdrop"></div>
      <img
        :src="gambar"
        alt="Ilustrasi Layanan Fixify"
        class="hero-image"
      />
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  padding: 24px;
  min-height: 80vh;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  z-index: 2;
}



@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(141, 88, 255, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(141, 88, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(141, 88, 255, 0); }
}

.hero-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 900;
  line-height: 1.1;
  color: #1a1525;
  margin: 0;
}

.highlight {
  color: #8d58ff;
}

.hero-subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: #655c75;
  max-width: 540px;
  margin: 0;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 54px;
  padding: 0 28px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #8d58ff;
  color: white;
  border: none;
  box-shadow: 0 12px 24px rgba(141, 88, 255, 0.25);
}

.btn-primary:hover {
  background-color: #7642e6;
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(141, 88, 255, 0.35);
}

.btn-secondary {
  background-color: transparent;
  color: #2a223a;
  border: 2px solid #e2d9ff;
}

.btn-secondary:hover {
  border-color: #8d58ff;
  color: #8d58ff;
  background-color: #fbf9ff;
}

.trust-stats {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0ebff;
  width: 100%;
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-group p {
  color: #655c75;
  font-size: 14px;
  margin: 0;
}

.stat-group b {
  color: #1a1525;
  font-weight: 800;
}

.avatars {
  display: flex;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e2d9ff;
  border: 2px solid #ffffff;
  margin-left: -12px;
}
.avatar-circle:nth-child(1) { margin-left: 0; background-color: #c4b5fd; }
.avatar-circle:nth-child(2) { background-color: #a78bfa; }
.avatar-circle:nth-child(3) { background-color: #8b5cf6; }

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.visual-backdrop {
  position: absolute;
  width: 80%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, rgba(141, 88, 255, 0.2), rgba(141, 88, 255, 0.05));
  border-radius: 50%;
  z-index: 0;
  filter: blur(40px);
}

.hero-image {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 580px;
  object-fit: contain;
  /* animation: float 6s ease-in-out infinite; */
}
/* 
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
} */

@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 60px;
    padding: 40px 20px;
  }

  .hero-content {
    align-items: center;
  }

  .hero-subtitle {
    margin: 0 auto;
  }

  .trust-stats {
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
  }

  .hero-image {
    max-width: 100%;
  }
}
</style>
