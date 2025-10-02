<script setup>
import { apiFetch } from "@/utils/api";
import { onMounted, ref } from "vue";

const userId = localStorage.getItem('userId')
const userRole = localStorage.getItem('role')


async function getProfile(userId){
  try {
    const response = await apiFetch(`/profile/${userId}`)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil profil:', error);
    
  }
}

async function getChatByUserId(userId){
  try {
    const response = await apiFetch(`/chats/${userId}`)
    return response.data.chats
  } catch (error) {
    console.error('Gagal ambil chat:', error)
    return []
  }
}


// data dummy
const chats = ref([]);
onMounted(async () => {
  const data = await getChatByUserId(userId)

  // isi chats.value, jangan bikin variabel baru
  chats.value = await Promise.all(
    data.map(async (item) => {
      const profileClient = await getProfile(item.clientId)
      const profileTeknisi = await getProfile(item.technicianId)

      return {
        ...item,
        client: { nama: profileClient?.user?.nama || "Client" },
        teknisi: { nama: profileTeknisi?.user?.nama || "Teknisi" },
      }
    })
  )
})


const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref("");

// pilih chat
async function selectChat(chat) {
  selectedChat.value = chat;
  // console.log('chat data : ', chat._id);
  
  const response = await apiFetch(`/messages/read/${chat._id}`, {
    method: 'GET',
    'Content-Type': 'application/json'
  })
  console.log('chat data : ', response.data);
  
  messages.value = response.data.chat_message
}

// kirim pesan
async function sendMessage() {
  console.log('selected chat : ', selectedChat.value._id);
  
  if (!newMessage.value.trim()) return;
  const msg = {
    chatId: selectedChat.value._id,
    senderId: userId,
    message: newMessage.value,
    createdAt: new Date(),
  };

  const response = await apiFetch(`/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(msg)
  })
  console.log('status message : ', response.data);
  
  messages.value.push(msg);
  console.log('message : ', messages.value);
  
  newMessage.value = "";
}

// format tanggal
function formatDate(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
</script>
<template>
  <div class="chat-container">
    <!-- Sidebar daftar chat -->
    <aside class="chat-sidebar">
      <h2 class="sidebar-title">💬 Percakapan</h2>
      <ul>
        <li
          v-for="chat in chats"
          :key="chat._id"
          :class="{ active: chat._id === selectedChat?._id }"
          @click="selectChat(chat)"
        >
          <div class="chat-info">
            <hr>
            <strong v-if="userRole == `technician`">{{ chat.client?.nama }}</strong>
            <strong v-else>{{ chat.teknisi?.nama }}</strong>
            <hr>
            <!-- <p class="last-message">
              {{ messages.at(-1)?.message || 'Belum ada pesan' }}
            </p> -->
          </div>
        </li>
      </ul>
    </aside>

    <!-- Area chat -->
    <section class="chat-main" v-if="selectedChat">
      <header class="chat-header">
        <h3 v-if="userRole == `technician`">
          👤 {{ selectedChat.client?.nama}}
        </h3>
        <h3 v-else>
          👤 {{ selectedChat.teknisi?.nama}}
        </h3>
      </header>

      <div class="chat-messages">
        <div
          v-for="msg in messages"
          :key="msg._id"
          :class="['chat-message', msg.senderId === userId ? 'sent' : 'received']"
        >
          <p>{{ msg.message }}</p>
          <small>{{ formatDate(msg.createdAt) }}</small>
        </div>
      </div>

      <footer class="chat-input">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Tulis pesan..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">➤</button>
      </footer>
    </section>

    <!-- Jika belum pilih chat -->
    <section class="chat-main empty-state" v-else>
      <p class="empty">👆 Pilih percakapan untuk memulai</p>
    </section>
  </div>
</template>



<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f8f9fb;
}

/* Sidebar */
.chat-sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e5e5e5;
  overflow-y: auto;
  padding: 1rem;
}

.sidebar-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #2d8cf0;
  text-align: center;
}

.chat-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-sidebar li {
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
}

.chat-sidebar li:hover {
  background: #f1f9ff;
}

.chat-sidebar li.active {
  background: #e6f2ff;
  border-left: 4px solid #2d8cf0;
}

.chat-info strong {
  display: block;
  font-size: 0.95rem;
  color: #333;
}

.chat-sidebar .last-message {
  font-size: 0.8rem;
  color: #777;
  margin-top: 2px;
}

/* Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fdfdfd;
}

.chat-header {
  padding: 1rem;
  background: #2d8cf0;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

/* Messages */
.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f5f7fa;
}

.chat-message {
  max-width: 65%;
  padding: 0.7rem 1rem;
  margin-bottom: 0.8rem;
  border-radius: 16px;
  font-size: 0.9rem;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.chat-message.sent {
  margin-left: auto;
  background: #daf5d9;
  border-bottom-right-radius: 4px;
  text-align: right;
}

.chat-message.received {
  margin-right: auto;
  background: #ffffff;
  border-bottom-left-radius: 4px;
}

.chat-message small {
  display: block;
  font-size: 0.7rem;
  color: #666;
  margin-top: 0.3rem;
}

/* Input */
.chat-input {
  display: flex;
  padding: 0.7rem;
  border-top: 1px solid #ddd;
  background: #fff;
}

.chat-input input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
}

.chat-input button {
  margin-left: 0.6rem;
  padding: 0.6rem 1rem;
  border: none;
  background: #2d8cf0;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
}

.chat-input button:hover {
  background: #1a73e8;
}

/* Empty state */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  color: #999;
  font-size: 1.1rem;
  text-align: center;
}
</style>
