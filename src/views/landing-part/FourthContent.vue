<script setup>
const reasons = [
  {
    icon: 'ri-line-chart-line',
    title: 'Dampak Perekonomian',
    desc: 'Kontribusi nyata pada perekonomian Indonesia. Membantu usaha kecil dan menengah berkembang lebih cepat dan membuka lapangan kerja.'
  },
  {
    icon: 'ri-group-line',
    title: 'Kemitraan Luas',
    desc: 'Kemitraan dengan banyak pengusaha perbaikan berpengalaman. Pengguna dapat mengakses ahli terbaik di bidangnya dengan mudah.'
  },
  {
    icon: 'ri-24-hours-line',
    title: 'Pelayanan 24 Jam',
    desc: 'Tersedia layanan perbaikan 24 jam sehingga Anda dapat mengandalkan dukungan kapan pun diperlukan dengan cepat dan efisien.'
  },
  {
    icon: 'ri-medal-line',
    title: 'Kualitas No. 1',
    desc: 'Aplikasi nomor satu di Banyuwangi, memberikan solusi terbaik dan paling dapat diandalkan untuk berbagai kebutuhan perbaikan Anda.'
  },
  {
    icon: 'ri-truck-line',
    title: 'Layanan Penjemputan',
    desc: 'Menawarkan layanan penjemputan barang rusak yang akan diperbaiki, mengutamakan kenyamanan dan efisiensi waktu Anda.'
  },
  {
    icon: 'ri-timer-flash-line',
    title: 'Menghemat Waktu',
    desc: 'Tidak perlu repot membandingkan pilihan. Semua sudah terintegrasi untuk memberikan teknisi terbaik langsung ke tempat Anda.'
  }
]
</script>

<template>
  <section class="why-us-section">
    <div class="content-wrapper">
      <div class="text-content">
        <span class="eyebrow">Kenapa Fixify?</span>
        <h2>Alasan Memilih Kami</h2>
        <p>Kami mendedikasikan platform ini untuk memberikan kemudahan, keamanan, dan kenyamanan bagi setiap pelanggan dan mitra teknisi.</p>
      </div>

      <div class="reasons-grid">
        <div 
          v-for="(reason, index) in reasons" 
          :key="index"
          class="reason-card"
        >
          <div class="icon-wrapper">
            <i :class="reason.icon"></i>
          </div>
          <h3>{{ reason.title }}</h3>
          <p>{{ reason.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.why-us-section {
  padding: 80px 24px 120px;
  background: linear-gradient(180deg, #ffffff 0%, #fbf9ff 100%);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.text-content {
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

.text-content h2 {
  font-size: 36px;
  font-weight: 900;
  color: #1a1525;
  margin: 0 0 16px;
}

.text-content p {
  font-size: 18px;
  color: #655c75;
  max-width: 600px;
  margin: 0 auto;
}

.reasons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.reason-card {
  background-color: #ffffff;
  padding: 32px;
  border-radius: 24px;
  border: 1px solid #f0ebff;
  box-shadow: 0 12px 24px rgba(141, 88, 255, 0.04);
  transition: all 0.3s ease;
}

.reason-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(141, 88, 255, 0.12);
  border-color: #d1bfff;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #8d58ff 0%, #6c32e7 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 24px;
}

.reason-card h3 {
  font-size: 20px;
  font-weight: 800;
  color: #1a1525;
  margin: 0 0 12px;
}

.reason-card p {
  font-size: 15px;
  line-height: 1.6;
  color: #655c75;
  margin: 0;
}

@media (max-width: 768px) {
  .why-us-section {
    padding: 60px 20px 80px;
  }

  .text-content h2 {
    font-size: 28px;
  }

  .reasons-grid {
    grid-template-columns: 1fr;
  }
}
</style>
