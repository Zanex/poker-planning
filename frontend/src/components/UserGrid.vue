<script setup lang="ts">
import { usePokerStore } from '@/stores/poker';
import { computed, watch } from 'vue';

const store = usePokerStore();

const players = computed(() => store.users.filter(u => !u.isSpectator));
const spectators = computed(() => store.users.filter(u => u.isSpectator));

watch(() => store.users, (newUsers) => {
  console.log('Users updated:', newUsers);
  console.log('Players:', players.value.length);
  console.log('Spectators:', spectators.value.length);
}, { deep: true });
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <div class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <h2 class="text-lg font-semibold text-gray-800">
        Players ({{ store.votedCount }}/{{ store.totalPlayers }} voted)
      </h2>
    </div>
    
    <div v-if="players.length === 0" class="text-center py-8 text-gray-500">
      Waiting for players...
    </div>
    
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="user in players"
        :key="user.id"
        :class="[
          'p-4 rounded-xl border-2 transition-all',
          user.vote
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-200 bg-gray-50'
        ]"
      >
        <div class="font-semibold text-gray-800 truncate" :title="user.name">
          {{ user.name }}
        </div>
        <div class="text-4xl font-bold text-center mt-3">
          <span v-if="store.revealed && user.vote">
            {{ user.vote }}
          </span>
          <span v-else-if="user.vote" class="animate-pulse">
            🃏
          </span>
          <span v-else class="text-gray-400">
            —
          </span>
        </div>
      </div>
    </div>
    
    <!-- Spectators Section -->
    <div v-if="spectators.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <h3 class="text-sm font-semibold text-purple-600">
          Spectators ({{ spectators.length }})
        </h3>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <div
          v-for="spectator in spectators"
          :key="spectator.id"
          class="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-sm text-purple-700"
        >
          👁️ {{ spectator.name }}
        </div>
      </div>
    </div>
  </div>
</template>