<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="modern-footer">
    <div class="footer-container">
      <div class="footer-grid">
        <!-- Brand Section -->
        <div class="footer-brand">
          <div class="brand-logo">
            <span class="brand-mark">F</span>
            <span class="brand-name">Fixify</span>
          </div>
          <p class="brand-desc">
            Platform perbaikan terpadu yang menghubungkan Anda dengan teknisi profesional. Solusi cepat dan tepercaya untuk segala masalah perbaikan Anda.
          </p>
          <div class="social-links">
            <a href="#" aria-label="Facebook"><i class="ri-facebook-fill"></i></a>
            <a href="#" aria-label="Twitter"><i class="ri-twitter-fill"></i></a>
            <a href="#" aria-label="Instagram"><i class="ri-instagram-line"></i></a>
            <a href="#" aria-label="LinkedIn"><i class="ri-linkedin-fill"></i></a>
          </div>
        </div>

        <!-- Links Section -->
        <div class="footer-links-group">
          <div class="footer-links">
            <h3>Layanan</h3>
            <ul>
              <li><a href="#">Servis Elektronik</a></li>
              <li><a href="#">Perbaikan Rumah</a></li>
              <li><a href="#">Servis Kendaraan</a></li>
              <li><a href="#">Layanan Darurat 24/7</a></li>
            </ul>
          </div>

          <div class="footer-links">
            <h3>Perusahaan</h3>
            <ul>
              <li><a href="#">Tentang Kami</a></li>
              <li><a href="#">Karir / Mitra</a></li>
              <li><a href="#">Syarat & Ketentuan</a></li>
              <li><a href="#">Kebijakan Privasi</a></li>
            </ul>
          </div>

          <div class="footer-links">
            <h3>Hubungi Kami</h3>
            <ul class="contact-info">
              <li><i class="ri-map-pin-line"></i> Banyuwangi, Jawa Timur</li>
              <li><i class="ri-mail-line"></i> halo@fixify.com</li>
              <li><i class="ri-phone-line"></i> +62 812 3456 7890</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Fixify. Seluruh Hak Cipta Dilindungi.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.modern-footer {
  width: 100%;
  background-color: #ffffff;
  border-top: 1px solid #f0ebff;
  padding: 80px 24px 24px;
  font-family: 'Quicksand', 'Poppins', sans-serif;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 2fr;
  gap: 60px;
  margin-bottom: 60px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #8d58ff;
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 8px 16px rgba(141, 88, 255, 0.2);
}

.brand-name {
  font-size: 24px;
  font-weight: 800;
  color: #1a1525;
}

.brand-desc {
  color: #655c75;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  max-width: 340px;
}

.social-links {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f4efff;
  color: #8d58ff;
  text-decoration: none;
  font-size: 20px;
  transition: all 0.3s ease;
}

.social-links a:hover {
  background-color: #8d58ff;
  color: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(141, 88, 255, 0.25);
}

.footer-links-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.footer-links h3 {
  font-size: 18px;
  font-weight: 800;
  color: #1a1525;
  margin: 0 0 24px;
}

.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-links a {
  color: #655c75;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #8d58ff;
}

.contact-info li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #655c75;
  font-size: 15px;
  line-height: 1.5;
}

.contact-info i {
  color: #8d58ff;
  font-size: 18px;
  margin-top: 2px;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #f0ebff;
}

.footer-bottom p {
  color: #8a819b;
  font-size: 14px;
  margin: 0;
}

@media (max-width: 980px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .brand-desc {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .modern-footer {
    padding: 60px 20px 20px;
  }

  .footer-links-group {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
</style>
