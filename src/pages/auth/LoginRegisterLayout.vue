<script setup>
import TemplateFooter from '@/views/TemplateFooter.vue'
import craftManImage from '@assets/login/image.png'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <main class="auth-page">
    <button
      type="button"
      class="brand-link"
      aria-label="Kembali ke halaman utama"
      @click="goHome"
    >
      <span class="brand-mark">F</span>
      <span>Fixify</span>
    </button>

    <section class="auth-shell">
      <aside class="intro-panel">
        <div class="intro-copy">
          <span class="eyebrow">Selamat Datang</span>
          <h1>Solusi Perbaikan Terpercaya.</h1>
          <p>
            Menghubungkan pelanggan dengan teknisi profesional untuk setiap masalah perbaikan Anda.
          </p>
        </div>

        <img
          :src="craftManImage"
          alt="Ilustrasi teknisi Fixify"
          class="intro-image"
        >

        <div class="benefit-row">
          <div class="benefit-item">
            <i class="ri-tools-line"></i>
            <span>Layanan Cepat</span>
          </div>
          <div class="benefit-item">
            <i class="ri-shield-star-line"></i>
            <span>Teknisi Ahli</span>
          </div>
          <div class="benefit-item">
            <i class="ri-money-dollar-circle-line"></i>
            <span>Harga Transparan</span>
          </div>
        </div>
      </aside>

      <section class="form-panel">
        <RouterView />
      </section>
    </section>

    <!-- <footer class="footer">
      <TemplateFooter />
    </footer> -->
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(141, 88, 255, 0.1), rgba(255, 255, 255, 0) 340px),
    #ffffff;
  color: #171421;
  font-family: 'Quicksand', 'Poppins', sans-serif;
  padding: 28px;
  display: flex;
  flex-direction: column;
}

.brand-link {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  background-color: transparent;
  color: #241b3f;
  cursor: pointer;
  font: inherit;
  font-size: 18px;
  font-weight: 800;
  padding: 0;
  text-decoration: none;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #8d58ff;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(141, 88, 255, 0.25);
}

.auth-shell {
  width: min(1080px, 100%);
  flex: 1;
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(360px, 1.1fr);
  gap: 28px;
  align-items: stretch;
  margin: 28px auto 28px;
}

.intro-panel,
.form-panel {
  border: 1px solid rgba(141, 88, 255, 0.14);
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 70px rgba(54, 31, 103, 0.11);
}

.intro-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 34px;
  background:
    linear-gradient(145deg, rgba(141, 88, 255, 0.13), rgba(255, 255, 255, 0.96) 54%),
    #ffffff;
}

.intro-copy {
  max-width: 430px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  background-color: #f1ebff;
  color: #6c32e7;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 12px;
}

.intro-copy h1 {
  color: #171421;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 900;
  line-height: 1.1;
  margin: 24px 0 18px;
}

.intro-copy p {
  color: #655c75;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

.intro-image {
  width: min(320px, 86%);
  align-self: center;
  margin: 20px 0;
}

.benefit-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.benefit-item {
  min-height: 86px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(141, 88, 255, 0.16);
  border-radius: 16px;
  background-color: #ffffff;
  color: #3c3155;
  font-size: 13px;
  font-weight: 800;
  padding: 14px;
  text-align: center;
}

.benefit-item i {
  color: #8d58ff;
  font-size: 24px;
}

.form-panel {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.form-panel::-webkit-scrollbar {
  width: 8px;
}

.form-panel::-webkit-scrollbar-thumb {
  background-color: rgba(141, 88, 255, 0.35);
  border-radius: 999px;
}

@media (max-width: 980px) {
  .auth-page {
    padding: 22px;
  }

  .auth-shell {
    grid-template-columns: 1fr;
  }

  .intro-panel {
    gap: 20px;
    display: none; /* Sembunyikan panel intro di mobile untuk fokus ke form */
  }
}

@media (max-width: 640px) {
  .auth-page {
    padding: 16px;
  }

  .auth-shell {
    margin-top: 18px;
  }

  .form-panel {
    border-radius: 18px;
    padding: 24px;
  }
}
</style>
