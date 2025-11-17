<script setup lang="ts">
import { ref } from 'vue';
import { usePokerStore } from '@/stores/poker';
import { copyToClipboard, getRoomLink } from '@/utils';

const emit = defineEmits<{
  showHistory: [];
}>();

const store = usePokerStore();
const copied = ref(false);

const copyLink = async () => {
  const link = getRoomLink(store.roomId);
  const success = await copyToClipboard(link);
  
  if (success) {
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  }
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          Room: {{ store.roomId }}
        </h1>
        <div class="flex items-center gap-3 text-sm text-gray-600 mt-2">
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                store.connected ? 'bg-green-500' : 'bg-red-500'
              ]"
            />
            {{ store.connected ? 'Connected' : 'Disconnected' }}
          </div>
          <span>•</span>
          <span>{{ store.totalUsers }} participants</span>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button
          @click="copyLink"
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          <svg
            v-if="!copied"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {{ copied ? 'Copied!' : 'Share' }}
        </button>
        
        <button
          @click="emit('showHistory')"
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          History
        </button>
      </div>
    </div>
  </div>
</template>