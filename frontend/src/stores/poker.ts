import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Stats } from '@/types';

export const usePokerStore = defineStore('poker', () => {
  // State
  const roomId = ref<string>('');
  const userName = ref<string>('');
  const userId = ref<string>('');
  const users = ref<User[]>([]);
  const revealed = ref(false);
  const stats = ref<Stats | null>(null);
  const connected = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const myVote = computed(() => {
    const me = users.value.find(u => u.id === userId.value);
    return me?.vote || null;
  });

  const allVoted = computed(() => {
    return users.value.length > 0 && users.value.every(u => u.vote !== null);
  });

  const totalUsers = computed(() => users.value.length);

  const votedCount = computed(() => users.value.filter(u => u.vote !== null).length);

  // Actions
  function setRoomId(id: string) {
    roomId.value = id;
    localStorage.setItem('poker_room_id', id);
  }

  function setUserName(name: string) {
    userName.value = name;
    localStorage.setItem('poker_username', name);
  }

  function setUserId(id: string) {
    userId.value = id;
  }

  function updateUsers(newUsers: User[]) {
    users.value = [...newUsers];
  }

  function setRevealed(value: boolean) {
    revealed.value = value;
  }

  function setStats(newStats: Stats | null) {
    stats.value = newStats;
  }

  function setConnected(value: boolean) {
    connected.value = value;
  }

  function setError(message: string | null) {
    error.value = message;
  }

  function reset() {
    revealed.value = false;
    stats.value = null;
  }

  function loadFromStorage() {
    const savedRoomId = localStorage.getItem('poker_room_id');
    const savedUsername = localStorage.getItem('poker_username');
    
    if (savedRoomId) roomId.value = savedRoomId;
    if (savedUsername) userName.value = savedUsername;
  }

  return {
    // State
    roomId,
    userName,
    userId,
    users,
    revealed,
    stats,
    connected,
    error,
    
    // Computed
    myVote,
    allVoted,
    totalUsers,
    votedCount,
    
    // Actions
    setRoomId,
    setUserName,
    setUserId,
    updateUsers,
    setRevealed,
    setStats,
    setConnected,
    setError,
    reset,
    loadFromStorage,
  };
});