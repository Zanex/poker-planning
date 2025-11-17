<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePokerStore } from '@/stores/poker';
import { usePokerRoom } from '@/composables/usePokerRoom';
import RoomHeader from '@/components/RoomHeader.vue';
import UserGrid from '@/components/UserGrid.vue';
import VotingCards from '@/components/VotingCards.vue';
import Controls from '@/components/Controls.vue';
import HistoryPanel from '@/components/HistoryPanel.vue';

const route = useRoute();
const router = useRouter();
const store = usePokerStore();
const { joinRoom } = usePokerRoom();

const showHistory = ref(false);

const roomId = computed(() => route.params.id as string);

onMounted(() => {
  // Carica dallo store se disponibile
  store.loadFromStorage();
  
  // Se non c'è username, torna al join
  if (!store.userName) {
    router.push(`/?room=${roomId.value}`);
    return;
  }
  
  // Join alla room
  joinRoom(roomId.value, store.userName);
});
</script>

<template>
  <div class="min-h-screen p-4 pb-20">
    <div class="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <!-- Error Toast -->
      <Transition name="slide">
        <div
          v-if="store.error"
          class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        >
          {{ store.error }}
        </div>
      </Transition>

      <RoomHeader @show-history="showHistory = !showHistory" />
      
      <UserGrid />
      
      <VotingCards />
      
      <Controls />
      
      <HistoryPanel v-if="showHistory" />
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>