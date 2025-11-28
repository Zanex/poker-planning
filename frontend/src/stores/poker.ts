import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Stats, CardType } from '@/types';
import { CARD_TYPES } from '@/types';

export const usePokerStore = defineStore('poker', () => {
  // State
  const roomId = ref<string>('');
  const userName = ref<string>('');
  const userId = ref<string>('');
  const isSpectator = ref<boolean>(false);
  const cardType = ref<CardType>('fibonacci');
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

  const me = computed(() => {
    return users.value.find(u => u.id === userId.value);
  });

  const allVoted = computed(() => {
    const voters = users.value.filter(u => !u.isSpectator);
    return voters.length > 0 && voters.every(u => u.vote !== null);
  });

  const totalUsers = computed(() => users.value.length);

  const totalPlayers = computed(() => users.value.filter(u => !u.isSpectator).length);
  
  const totalSpectators = computed(() => users.value.filter(u => u.isSpectator).length);

  const votedCount = computed(() => users.value.filter(u => !u.isSpectator && u.vote !== null).length);

  const availableCards = computed(() => {
    return CARD_TYPES[cardType.value].cards;
  });

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

  function setIsSpectator(value: boolean) {
    isSpectator.value = value;
    localStorage.setItem('poker_is_spectator', value.toString());
  }

  function setCardType(type: CardType) {
    cardType.value = type;
    localStorage.setItem('poker_card_type', type);
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
    const savedCardType = localStorage.getItem('poker_card_type') as CardType | null;
    const savedSpectator = localStorage.getItem('poker_is_spectator');
    
    if (savedRoomId) roomId.value = savedRoomId;
    if (savedUsername) userName.value = savedUsername;
    if (savedCardType) cardType.value = savedCardType;
    if (savedSpectator) isSpectator.value = savedSpectator === 'true';
  }

  return {
    // State
    roomId,
    userName,
    userId,
    isSpectator,
    cardType,
    users,
    revealed,
    stats,
    connected,
    error,
    
    // Computed
    myVote,
    me,
    allVoted,
    totalUsers,
    totalPlayers,
    totalSpectators,
    votedCount,
    availableCards,
    
    // Actions
    setRoomId,
    setUserName,
    setUserId,
    setIsSpectator,
    setCardType,
    updateUsers,
    setRevealed,
    setStats,
    setConnected,
    setError,
    reset,
    loadFromStorage,
  };
});