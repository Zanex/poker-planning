<script setup lang="ts">
import { onMounted } from 'vue';
import { usePokerStore } from '@/stores/poker';
import { useHistory } from '@/composables/useHistory';
import { formatTime } from '@/utils';

const store = usePokerStore();
const { loading, history, fetchHistory, exportCSV } = useHistory();

onMounted(() => {
  fetchHistory(store.roomId);
});

const handleExport = () => {
  exportCSV(store.roomId);
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">
        Session History
      </h2>
      
      <button
        v-if="history.length > 0"
        @click="handleExport"
        class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export CSV
      </button>
    </div>
    
    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading history...
    </div>
    
    <div v-else-if="history.length === 0" class="text-center py-8 text-gray-500">
      No history available yet
    </div>
    
    <div v-else class="space-y-4 max-h-96 overflow-y-auto">
      <div
        v-for="session in history"
        :key="session.id"
        class="border border-gray-200 rounded-lg p-4"
      >
        <div class="text-sm text-gray-600 mb-3">
          Session started: {{ formatTime(session.created_at) }}
        </div>
        
        <div class="space-y-2">
          <div
            v-for="round in session.rounds"
            :key="`${session.id}-${round.round_number}`"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="font-medium text-gray-800">
                Round {{ round.round_number }}
              </div>
              <div class="text-sm text-gray-600">
                {{ formatTime(round.revealed_at) }}
              </div>
            </div>
            
            <div class="flex gap-4 text-sm font-semibold">
              <div class="text-center">
                <div class="text-xs text-gray-600">Avg</div>
                <div class="text-indigo-600">{{ round.average }}</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-gray-600">Med</div>
                <div class="text-purple-600">{{ round.median }}</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-gray-600">Votes</div>
                <div class="text-gray-800">{{ round.votes.length }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>