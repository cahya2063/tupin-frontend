<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <div class="navbar">
    <img
      class="logo-navbar"
      src="https://upload.wikimedia.org/wikipedia/commons/9/96/SpaceX_Logo_Black.png"
      alt="logo"
      width="300"
    />
    <button
      class="hamburger"
      @click="toggleMenu"
    >
      ☰
    </button>

    <!-- Hanya untuk desktop -->
    <ul class="desktop-menu">
      <li><a href="#">Home</a></li>
      <li><a href="#">Link</a></li>
      <li><a href="#">Profile</a></li>
      <li><a href="#">Menu</a></li>
      <li>
        <RouterLink
          to="/login"
          class="login"
          >Login</RouterLink
        >
      </li>

      <li>
        <RouterLink
          to="/register"
          class="register"
          >Register</RouterLink
        >
      </li>
    </ul>
  </div>

  <!-- Sidebar (mobile only) -->
  <div
    class="sidebar"
    :class="{ open: isMenuOpen }"
  >
    <button
      class="close-btn"
      @click="toggleMenu"
    >
      ✕
    </button>
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">Link</a></li>
      <li><a href="#">Profile</a></li>
      <li><a href="#">Menu</a></li>
      <li><RouterLink to="/login">Login</RouterLink></li>
      <li>
        <RouterLink
          to="/register"
          class="register"
          >Register</RouterLink
        >
      </li>
    </ul>
  </div>

  <div
    v-if="isMenuOpen"
    class="overlay"
    @click="toggleMenu"
  ></div>
</template>

<style scoped>
/* === Umum === */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  flex-wrap: wrap;
}

.logo-navbar {
  max-width: 200px;
}

a {
  font-weight: 700;
  color: black;
  text-decoration: none;
  font-size: 20px;
}

/* === Menu Desktop === */
.desktop-menu {
  display: flex;
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.desktop-menu li {
  margin-inline: 10px;
  padding-inline: 10px;
}

.login {
  background-color: black;
  color: white;
  font-size: 18px;
  padding: 10px 40px;
  border-radius: 10px;
}

.register {
  font-size: 18px;
}

.search {
  border: 2px solid black;
  border-radius: 10px;
  width: 280px;
  height: 30px;
  font-family: 'Quicksand', sans-serif;
  font-size: 15px;
  font-weight: 600;
}

/* === Hamburger Button === */
.hamburger {
  display: none;
  font-size: 30px;
  background: none;
  border: none;
  cursor: pointer;
}

/* === Sidebar (Mobile) === */
.sidebar {
  display: none;
  position: fixed;
  top: 0;
  right: -100%;
  width: 300px;
  height: 100vh;
  background-color: white;
  box-shadow: -3px 0 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  transition: right 0.3s ease;
  z-index: 1001;
}

.sidebar.open {
  right: 0;
  display: block;
}

.sidebar ul {
  display: flex; /* Aktifkan flex container */
  flex-wrap: wrap; /* Biar kalau sempit bisa turun ke baris baru */
  gap: 20px; /* Jarak antar item */
  padding: 0;
  margin-top: 60px;
  list-style: none;
  justify-content: flex-start; /* Atur arah ke kiri */
}

.sidebar ul li {
  margin: 0;
  padding: 0;
}

.sidebar a {
  text-decoration: none;
  color: black;
  font-size: 20px;
  font-weight: bold;
}

/* Tombol close (x) */
.close-btn {
  font-size: 28px;
  background: none;
  border: none;
  position: absolute;
  top: 15px;
  right: 20px;
  cursor: pointer;
}

/* Overlay saat sidebar terbuka */
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.sidebar .login {
  background-color: black;
  color: white !important;
  padding: 10px 40px;
  border-radius: 10px;
}

/* === Responsive === */
@media (max-width: 1072px) {
  .hamburger {
    display: block;
  }

  .desktop-menu {
    display: none;
  }

  .sidebar {
    display: block;
  }

  .search {
    width: 100%;
  }
}
</style>
