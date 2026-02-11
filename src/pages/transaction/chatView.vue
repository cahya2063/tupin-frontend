<script setup>
import { apiFetch } from '@/utils/api'
import { onMounted, ref } from 'vue'
import { io } from 'socket.io-client'
import sweetAlert from '@/utils/sweetAlert'

// mentrigger event connection di server
const socket = io('http://localhost:3000')

const userId = localStorage.getItem('userId')
const userRole = localStorage.getItem('role')

const chats = ref([])
const selectedChat = ref(null)
const messages = ref([])
const newMessage = ref('')
const isMobileView = ref(false)
const showChat = ref(false)

async function getProfile(userId) {
  try {
    const response = await apiFetch(`/profile/${userId}`)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil profil:', error)
  }
}

async function getChatByUserId(userId) {
  try {
    const response = await apiFetch(`/chats/${userId}`)
    return response.data.chats
  } catch (error) {
    console.error('Gagal ambil chat:', error)
    return []
  }
}

onMounted(async () => {
  // Ambil data chat
  const data = await getChatByUserId(userId)
  chats.value = await Promise.all(
    data.map(async item => {
      const profileClient = await getProfile(item.clientId)
      const profileTeknisi = await getProfile(item.technicianId)
      return {
        ...item,
        client: { nama: profileClient?.user?.nama || 'Client' },
        teknisi: { nama: profileTeknisi?.user?.nama || 'Teknisi' },
      }
    }),
  )

  // Cek ukuran layar
  const checkScreen = () => {
    isMobileView.value = window.innerWidth <= 992 // batas tablet ke bawah
  }

  checkScreen()
  window.addEventListener('resize', checkScreen)

  socket.on('receive_message', msg => {
    // Hindari duplikasi: kalau pesan terakhir punya teks & sender sama, abaikan
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.message === msg.message && lastMsg.senderId === msg.senderId) {
      return
    }

    if (selectedChat.value && msg.chatId === selectedChat.value._id) {
      messages.value.push(msg)
    }
  })
})

async function selectChat(chat) {
  selectedChat.value = chat

  // mentrigger event join room di server
  socket.emit('join_room', chat._id)
  const response = await apiFetch(`/messages/read/${chat._id}`)
  messages.value = response.data.chat_message
  if (isMobileView.value) showChat.value = true
}

async function sendMessage() {
  if (!newMessage.value.trim() || !selectedChat.value) return

  const msg = {
    chatId: selectedChat.value._id,
    senderId: userId,
    message: newMessage.value,
    messageType: 'message',
    createdAt: new Date(),
  }

  // mentrigger event send_message di server
  socket.emit('send_message', msg)

  await apiFetch(`/messages/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
  })

  newMessage.value = ''
}

async function shareLocation() {
  if (!selectedChat.value) return

  if (!navigator.geolocation) {
    sweetAlert.error('browsermu tidak mendukung geolokasi')
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords

    // const msg = {
    //   chatId: selectedChat.value._id,
    //   senderId: userId,
    //   messageType: 'location',
    //   message: `https://www.google.com/maps?q=${latitude},${longitude}`,
    //   // createdAt: new Date()
    // }
    const msg = {
      chatId: selectedChat.value._id,
      senderId: userId,
      messageType: 'location',
      message: 'Berbagi lokasi saat ini',
      latitude,
      longitude,
      createdAt: new Date(),
    }
    
 // test 1

    console.log('data lokasi : ', msg)
    await apiFetch(`/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(msg),
    })
    socket.emit('send_message', msg)
  })
}

function formatDate(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="chat-wrapper">
    <!-- Sidebar -->
    <aside
      class="sidebar"
      v-show="!isMobileView || (isMobileView && !showChat)"
    >
      <div class="search-bar">
        <input
          type="text"
          placeholder="Search..."
        />
      </div>

      <h3 class="section-title">Chats</h3>
      <ul class="chat-list">
        <li
          v-for="chat in chats"
          :key="chat._id"
          :class="{ active: chat._id === selectedChat?._id }"
          @click="selectChat(chat)"
        >
          <div class="avatar"></div>
          <div class="chat-meta">
            <h4>
              {{ userRole == 'technician' ? chat.client?.nama : chat.teknisi?.nama }}
            </h4>
            <p class="last">Klik untuk membuka percakapan</p>
          </div>
          <span class="chat-time">Oct 26</span>
        </li>
      </ul>
    </aside>

    <!-- Chat Area -->
    <main
      class="chat-area"
      :class="{ fullscreen: isMobileView && showChat }"
      v-if="selectedChat && (!isMobileView || showChat)"
    >
      <header class="chat-header">
        <div class="user-info">
          <button
            v-if="isMobileView"
            class="back-btn"
            @click="showChat = false"
          >
            ←
          </button>
          <div class="avatar header"></div>
          <div>
            <h4>{{ userRole == 'technician' ? selectedChat.client?.nama : selectedChat.teknisi?.nama }}</h4>
            <small>{{ userRole == 'technician' ? `client` : `teknisi` }}</small>
          </div>
        </div>
      </header>

      <div class="chat-body">
        <div
          v-for="msg in messages"
          :key="msg._id"
          :class="['msg', msg.senderId === userId ? 'sent' : 'received']"
        >
          <!-- Jika pesan tipe location -->
          <template v-if="msg.messageType === 'location'">
            <p>{{ msg.message }}</p>
            <iframe
              :src="`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}&hl=es;z=14&output=embed`"
              width="250"
              height="150"
              style="border: 0; border-radius: 8px; margin-top: 5px"
              allowfullscreen=""
              loading="lazy"
            ></iframe>
            <br />
            <a
              :href="`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`"
              target="_blank"
              style="color: black"
              class="map-link"
            >
              Buka di Google Maps ↗
            </a>
          </template>

          <!-- Jika pesan biasa -->
          <template v-else>
            <p>{{ msg.message }}</p>
          </template>

          <small>{{ formatDate(msg.createdAt) }}</small>
        </div>
      </div>

      <footer class="chat-footer">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type your message"
          @keyup.enter="sendMessage"
        />
        <button @click="shareLocation">
          <i
            class="ri-map-pin-line"
            style="font-size: 24px"
          ></i>
        </button>
        <button @click="sendMessage">Send ➤</button>
      </footer>
    </main>

    <main
      class="chat-area empty"
      v-else-if="!isMobileView"
    >
      <p>Pilih percakapan untuk memulai</p>
    </main>
  </div>
</template>

<style scoped>
.chat-wrapper {
  display: flex;
  height: 70vh;
  width: 90%;
  margin-inline: auto;
  background: #fafafa;
  border: 2px solid #915eff;
  border-radius: 30px;
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.2),
    0 20px 20px rgba(0, 0, 0, 0.1);

  overflow: hidden; /* Tambahkan ini agar radius diterapkan ke anak */
  font-family: 'Inter', sans-serif;
}

/* Sidebar */
.sidebar {
  /* width: 40%; */
  flex: 1.3;
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1rem 0;
}
.search-bar {
  padding: 0 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.6rem 1rem;
  border-radius: 20px;
  border: none;
  background: #f0f2f5;
  font-size: 0.9rem;
  outline: none;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #a855f7;
  margin: 1rem;
}

.chat-list,
.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-list li {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.chat-list li.active,
.chat-list li:hover {
  background: #a855f71a;
}

.avatar {
  width: 45px;
  height: 45px;
  background: #a855f7;
  border-radius: 50%;
  margin-right: 12px;
}

.avatar.small {
  width: 36px;
  height: 36px;
}

.chat-meta h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
}

.chat-meta .last {
  font-size: 0.8rem;
  color: #777;
}

.chat-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: #aaa;
}

/* Chat Area */
.chat-area {
  flex: 3;
  display: flex;
  flex-direction: column;
  background: #fdfcff;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  background: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar.header {
  width: 45px;
  height: 45px;
  background: #a855f7;
  border-radius: 50%;
}

.chat-body {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.msg {
  max-width: 60%;
  padding: 0.8rem 1rem;
  margin-bottom: 0.8rem;
  border-radius: 15px;
  line-height: 1.4;
  word-wrap: break-word;
  font-size: 0.9rem;
}

.msg.sent {
  background: #a855f7;
  color: #fff;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.msg.received {
  background: #fff;
  color: #333;
  margin-right: auto;
  border-bottom-left-radius: 4px;
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.2),
    0 20px 20px rgba(0, 0, 0, 0.1);
}

.msg small {
  display: block;
  font-size: 0.7rem;
  margin-top: 3px;
  opacity: 0.8;
}
.chat-message iframe {
  display: block;
  margin-top: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.map-link {
  color: #007bff;
  font-size: 0.85rem;
  text-decoration: none;
}

.map-link:hover {
  text-decoration: underline;
}

/* Input */
.chat-footer {
  display: flex;
  padding: 1rem 2rem;
  border-top: 1px solid #eee;
  background: #fff;
}

.chat-footer input {
  flex: 1;
  border: none;
  border-radius: 20px;
  padding: 0.8rem 1rem;
  background: #f0f2f5;
  outline: none;
  font-size: 0.9rem;
}

.chat-footer button {
  margin-left: 1rem;
  padding: 0.6rem 1.2rem;
  border: none;
  background: #a855f7;
  color: #fff;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.chat-footer button:hover {
  background: #9333ea;
}

/* Empty */
.chat-area.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.1rem;
}
@media (min-width: 992px) {
  .sidebar {
    left: 0px;
  }
}
@media (max-width: 992px) {
  .chat-wrapper {
    position: relative; /* pastikan anak-anak bisa absolute penuh */
    width: 100%;
    height: 100dvh;
    border: none;
    border-radius: 0;
    overflow: visible; /* cegah munculnya scroll sisa */
    margin-inline: 0;
  }

  /* Sidebar tampil penuh di mobile */
  .sidebar {
    position: absolute;
    top: 0;
    left: 257px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: #fff;
    z-index: 1; /* pastikan di atas chat-area */
  }

  /* Chat disembunyikan default */
  .chat-area {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fdfcff;
    flex-direction: column;
    z-index: 2; /* muncul di atas sidebar saat aktif */
  }

  /* Ketika showChat = true */
  .chat-area.fullscreen {
    display: flex !important;
  }

  .back-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    margin-right: 10px;
    cursor: pointer;
    color: #a855f7;
  }
}
</style>
