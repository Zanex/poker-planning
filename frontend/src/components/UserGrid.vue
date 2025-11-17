<script setup lang="ts">
import { usePokerStore } from '@/stores/poker';

const store = usePokerStore();
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
        Participants ({{ store.votedCount }}/{{ store.totalUsers }} voted)
      </h2>
    </div>
    
    <div v-if="store.users.length === 0" class="text-center py-8 text-gray-500">
      Waiting for participants...
    </div>
    
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="user in store.users"
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
  </div>
</template>