<script setup>
import { apiFetch } from "@/utils/api";
import { onMounted, ref } from "vue";

const userId = "6520a1f9c1234a1234567890";
const userId1 = localStorage.getItem('userId')
const userRole = localStorage.getItem('role')
// user login (contoh)
// const userId = localStorage.getItem('userId')

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
  const data = await getChatByUserId(userId1)

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

  console.log("Chats with profile:", chats.value)
})


const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref("");

// pilih chat
function selectChat(chat) {
  selectedChat.value = chat;
  messages.value = [
    {
      _id: "m1",
      chat_id: chat._id,
      sender_id: "6520a1f9c1234a1234567890",
      message: "Halo, alat saya rusak di bagian motor",
      created_at: new Date(),
    },
    {
      _id: "m2",
      chat_id: chat._id,
      sender_id: "teknisi123",
      message: "Oke, saya bisa datang besok",
      created_at: new Date(),
    },
  ];
}

// kirim pesan
function sendMessage() {
  if (!newMessage.value.trim()) return;
  const msg = {
    _id: Date.now().toString(),
    chat_id: selectedChat.value._id,
    sender_id: userId,
    message: newMessage.value,
    created_at: new Date(),
  };
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
            <strong v-if="userRole == `technician`">{{ chat.client?.nama }}</strong>
            <strong v-else>{{ chat.technician?.nama }}</strong>
            <p class="last-message">
              {{ chat.lastMessage?.message || 'Belum ada pesan' }}
            </p>
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
          👤 {{ selectedChat.technician?.nama}}
        </h3>
      </header>

      <div class="chat-messages">
        <div
          v-for="msg in messages"
          :key="msg._id"
          :class="['chat-message', msg.sender_id === userId ? 'sent' : 'received']"
        >
          <p>{{ msg.message }}</p>
          <small>{{ formatDate(msg.created_at) }}</small>
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
  padding: 0.8rem;
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
