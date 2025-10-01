
<template>
  <div class="chat-container">
    <aside class="chat-sidebar">
      <header class="sidebar-header">
        <h2>Percakapan</h2>
        </header>
      <ul>
        <li
          v-for="chat in chats"
          :key="chat._id"
          :class="{ active: chat._id === selectedChat?._id }"
          @click="selectChat(chat)"
          tabindex="0"
        >
          <img :src="getChatPartner(chat).avatar" alt="Avatar" class="avatar" />
          <div class="chat-info">
            <strong>{{ getChatPartner(chat).name }}</strong>
            <p class="last-message">
              {{ chat.lastMessage?.message || 'Belum ada pesan' }}
            </p>
          </div>
        </li>
      </ul>
    </aside>

    <section class="chat-main" v-if="selectedChat">
      <header class="chat-header">
        <img :src="chatPartner.avatar" alt="Avatar" class="avatar" />
        <h3>{{ chatPartner.name }}</h3>
        </header>

      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="msg in messages"
          :key="msg._id"
          :class="['message-wrapper', msg.sender_id === userId ? 'sent' : 'received']"
        >
          <img
            v-if="msg.sender_id !== userId"
            :src="chatPartner.avatar"
            alt="Avatar"
            class="avatar message-avatar"
          />
          <div class="chat-message">
            <p>{{ msg.message }}</p>
            <small>{{ formatDate(msg.created_at) }}</small>
          </div>
        </div>
      </div>

      <footer class="chat-input">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Ketik pesan..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" aria-label="Kirim Pesan">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </footer>
    </section>

    <section class="chat-main empty-chat" v-else>
      <div class="empty-content">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="#ced4da">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
        <p>Pilih percakapan untuk ditampilkan</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";

// --- DATA & STATE MANAGEMENT ---

// ID user yang sedang login (didapat dari sistem auth)
const userId = "user_budi"; 

// Data pengguna (lebih baik dipisah agar tidak duplikat)
const users = {
  user_budi: { name: "Budi (Anda)", avatar: "https://i.pravatar.cc/150?u=user_budi" },
  teknisi_andi: { name: "Teknisi Andi", avatar: "https://i.pravatar.cc/150?u=teknisi_andi" },
  teknisi_sari: { name: "Teknisi Sari", avatar: "https://i.pravatar.cc/150?u=teknisi_sari" },
};

// Daftar chat
const chats = ref([
  {
    _id: "chat_1",
    participants: ["user_budi", "teknisi_andi"],
    lastMessage: { message: "Oke, saya bisa datang besok jam 2." },
  },
  {
    _id: "chat_2",
    participants: ["user_budi", "teknisi_sari"],
    lastMessage: { message: "Siap, segera saya periksa kerusakannya." },
  },
]);

const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref("");
const messagesContainer = ref(null); // Ref untuk div pesan

// --- COMPUTED PROPERTIES ---

// Mencari partner chat secara dinamis
const chatPartner = computed(() => {
  if (!selectedChat.value) return null;
  const partnerId = selectedChat.value.participants.find(id => id !== userId);
  return users[partnerId];
});

// --- METHODS ---

// Fungsi untuk mendapatkan partner chat di daftar sidebar
function getChatPartner(chat) {
  const partnerId = chat.participants.find(id => id !== userId);
  return users[partnerId];
}

// Memilih chat dan memuat pesannya
function selectChat(chat) {
  selectedChat.value = chat;
  
  // Dummy data pesan (di aplikasi nyata, ini akan fetch dari API)
  messages.value = [
    {
      _id: "m1",
      chat_id: chat._id,
      sender_id: userId,
      message: "Halo, AC saya tidak dingin, bisa tolong diperiksa?",
      created_at: new Date(Date.now() - 5 * 60000), // 5 menit lalu
    },
    {
      _id: "m2",
      chat_id: chat._id,
      sender_id: getChatPartner(chat)._id || "teknisi_andi", // Fallback
      message: getChatPartner(chat).name === "Teknisi Andi"
        ? "Tentu, Pak Budi. Boleh kirimkan alamat lengkapnya?"
        : "Baik, Bu. Akan segera kami jadwalkan.",
      created_at: new Date(Date.now() - 4 * 60000),
    },
    {
      _id: "m3",
      chat_id: chat._id,
      sender_id: userId,
      message: "Jl. Merdeka No. 17, Jember.",
      created_at: new Date(Date.now() - 3 * 60000),
    },
  ];
}

// Mengirim pesan baru
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
  // Update last message di sidebar (opsional, untuk UX)
  const chatInList = chats.value.find(c => c._id === selectedChat.value._id);
  if (chatInList) {
    chatInList.lastMessage = { message: newMessage.value };
  }
  
  newMessage.value = "";
}

// Format tanggal menjadi HH:MM
function formatDate(date) {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- WATCHERS (Lifecycle Hooks) ---

// Logika untuk auto-scroll ke pesan terbaru
watch(messages, async () => {
  await nextTick(); // Tunggu DOM selesai di-update
  const container = messagesContainer.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}, { deep: true });

</script>

<style scoped>
/* Variabel CSS untuk tema yang mudah diubah */
:root {
  --primary-color: #007bff;
  --background-color: #f8f9fa;
  --sidebar-bg: #ffffff;
  --chat-bg: #e9ecef;
  --sent-message-bg: #007bff;
  --received-message-bg: #ffffff;
  --text-color: #212529;
  --text-color-light: #ffffff;
  --border-color: #dee2e6;
  --hover-bg: #f1f3f5;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  --border-radius: 12px;
}

.chat-container {
  display: flex;
  height: 100vh;
  font-family: var(--font-family);
  background-color: var(--background-color);
}

/* --- Sidebar --- */
.chat-sidebar {
  width: 320px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.chat-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
}

.chat-sidebar li {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--border-color);
}

.chat-sidebar li:hover {
  background: var(--hover-bg);
}

.chat-sidebar li.active {
  background: #e9ecef;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}

.chat-info {
  overflow: hidden;
}
.chat-info strong {
  display: block;
}
.last-message {
  font-size: 0.9rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0.25rem 0 0;
}

/* --- Main Chat Area --- */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--chat-bg);
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--sidebar-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.chat-header h3 {
  margin: 0;
  font-weight: 600;
}

/* --- Messages --- */
.chat-messages {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  max-width: 75%;
}

.chat-message {
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  position: relative;
  word-wrap: break-word;
}
.chat-message p {
  margin: 0;
}
.chat-message small {
  display: block;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  text-align: right;
}

/* Sent Messages */
.message-wrapper.sent {
  margin-left: auto;
}
.chat-message.sent {
  background: var(--sent-message-bg);
  color: var(--text-color-light);
  border-bottom-right-radius: 4px; /* Bubble tail */
}
.chat-message.sent small {
  color: rgba(255, 255, 255, 0.7);
}

/* Received Messages */
.message-wrapper.received {
  margin-right: auto;
}
.chat-message.received {
  background: var(--received-message-bg);
  color: var(--text-color);
  border-bottom-left-radius: 4px; /* Bubble tail */
}
.chat-message.received small {
  color: #6c757d;
}

.message-avatar {
  width: 36px;
  height: 36px;
}

/* --- Input --- */
.chat-input {
  display: flex;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--sidebar-bg);
  gap: 0.75rem;
}

.chat-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 2rem;
  background-color: var(--hover-bg);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.chat-input input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.chat-input button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}
.chat-input button:hover {
  background: #0056b3;
}

/* --- Empty State --- */
.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
}
.empty-content {
  text-align: center;
  color: #6c757d;
}
.empty-content p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* --- Responsiveness --- */
@media (max-width: 768px) {
  .chat-sidebar {
    display: none; /* Sembunyikan sidebar di mobile */
    /* Untuk aplikasi nyata, gunakan tombol untuk toggle sidebar */
  }
}
</style>
```
