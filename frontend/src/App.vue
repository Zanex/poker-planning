<script setup lang="ts">
import { onMounted } from 'vue';
import { usePokerStore } from '@/stores/poker';

const store = usePokerStore();

onMounted(() => {
  store.loadFromStorage();
});
</script>

<template>
  <div id="app" class="min-h-screen">
    <RouterView />
  </div>
</template>