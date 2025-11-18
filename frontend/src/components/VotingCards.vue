<script setup lang="ts">
import { usePokerStore } from '@/stores/poker';
import { usePokerRoom } from '@/composables/usePokerRoom';

const store = usePokerStore();
const { vote } = usePokerRoom();

const handleVote = (card: string) => {
  if (store.revealed) return;
  vote(card);
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">
      Your Vote
    </h2>
    
    <div class="grid grid-cols-5 md:grid-cols-10 gap-3">
      <button
        v-for="card in store.availableCards"
        :key="card"
        @click="handleVote(card)"
        :disabled="store.revealed"
        :class="[
          'card-poker',
          store.myVote === card ? 'card-selected' : 'card-default'
        ]"
      >
        {{ card }}
      </button>
    </div>
    
    <div v-if="store.revealed" class="mt-4 text-center text-sm text-gray-600">
      Voting is locked. Click "Reset" to start a new round.
    </div>
  </div>
</template>