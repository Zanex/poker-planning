<script setup lang="ts">
import { computed } from 'vue';
import { usePokerStore } from '@/stores/poker';
import { usePokerRoom } from '@/composables/usePokerRoom';

const store = usePokerStore();
const { reveal, reset } = usePokerRoom();

const isSpectatorMode = computed(() => store.me?.isSpectator ?? store.isSpectator);
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <div class="flex gap-3">
        <button
          @click="reveal"
          :disabled="!store.allVoted || store.revealed || isSpectatorMode"
          class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          Reveal Cards
        </button>
        
        <button
          @click="reset"
          :disabled="!store.revealed || isSpectatorMode"
          class="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          New Round
        </button>
      </div>
      
      <Transition name="fade">
        <div v-if="store.revealed && store.stats" class="flex gap-6">
          <div class="text-center">
            <div class="text-sm text-gray-600">Average</div>
            <div class="text-3xl font-bold text-indigo-600">
              {{ store.stats.average }}
            </div>
          </div>
          
          <div class="text-center">
            <div class="text-sm text-gray-600">Median</div>
            <div class="text-3xl font-bold text-purple-600">
              {{ store.stats.median }}
            </div>
          </div>
          
          <div class="text-center">
            <div class="text-sm text-gray-600">Votes</div>
            <div class="text-3xl font-bold text-pink-600">
              {{ store.stats.total }}
            </div>
          </div>
        </div>
      </Transition>
    </div>
    
    <div v-if="!store.allVoted && !store.revealed && !isSpectatorMode" class="mt-4 text-center text-sm text-gray-600">
      Waiting for all participants to vote...
    </div>

    <div v-if="isSpectatorMode" class="mt-4 text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        You are in spectator mode
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>