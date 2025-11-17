<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePokerStore } from '@/stores/poker';
import { generateRoomId } from '@/utils';

const router = useRouter();
const store = usePokerStore();

const roomId = ref('');
const userName = ref('');

onMounted(() => {
  // Check URL params
  const params = new URLSearchParams(window.location.search);
  const urlRoomId = params.get('room');
  
  if (urlRoomId) {
    roomId.value = urlRoomId;
  } else if (store.roomId) {
    roomId.value = store.roomId;
  }
  
  if (store.userName) {
    userName.value = store.userName;
  }
});

const createRoom = () => {
  roomId.value = generateRoomId();
};

const joinRoom = () => {
  if (!roomId.value || !userName.value) {
    console.warn('Missing roomId or userName');
    return;
  }
  
  console.log('Joining room:', roomId.value, 'as', userName.value);
  
  // Salva prima nello store
  store.setUserName(userName.value);
  store.setRoomId(roomId.value);
  
  // Naviga alla room
  router.push(`/room/${roomId.value}`);
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-slide-up">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          🃏 Poker Planning
        </h1>
        <p class="text-gray-600">
          Real-time collaborative estimation
        </p>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            v-model="userName"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="John Doe"
            @keyup.enter="joinRoom"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Room ID
          </label>
          <div class="flex gap-2">
            <input
              v-model="roomId"
              type="text"
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="abc123"
              @keyup.enter="joinRoom"
            />
            <button
              @click="createRoom"
              class="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              New
            </button>
          </div>
        </div>
        
        <button
          @click="joinRoom"
          :disabled="!roomId || !userName"
          class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          Join Room
        </button>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200">
        <div class="text-sm text-gray-600 text-center">
          <p class="mb-2">✨ Features</p>
          <ul class="space-y-1">
            <li>Real-time voting</li>
            <li>Automatic statistics</li>
            <li>Session history export</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>