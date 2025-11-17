import { onUnmounted } from 'vue';
import { usePokerStore } from '@/stores/poker';
import { useWebSocket } from './useWebSocket';
import type { WSResponse, FibonacciCard } from '@/types';

export function usePokerRoom() {
  const store = usePokerStore();
  const { connect, send, disconnect } = useWebSocket();

  const handleMessage = (data: WSResponse) => {
    switch (data.type) {
      case 'users':
      case 'vote_update':
        if (data.users) {
          store.updateUsers(data.users);
        }
        break;

      case 'revealed':
        store.setRevealed(true);
        if (data.users) store.updateUsers(data.users);
        if (data.stats) store.setStats(data.stats);
        break;

      case 'reset':
        store.reset();
        if (data.users) store.updateUsers(data.users);
        break;

      case 'error':
        store.setError(data.error || 'Unknown error');
        setTimeout(() => store.setError(null), 5000);
        break;
    }
  };

  const handleConnect = () => {
    store.setConnected(true);
    
    // Send join message
    send({
      type: 'join',
      id: store.userId,
      name: store.userName,
    });
  };

  const handleDisconnect = () => {
    store.setConnected(false);
  };

  const joinRoom = (roomId: string, userName: string) => {
    const userId = crypto.randomUUID();
    
    store.setRoomId(roomId);
    store.setUserName(userName);
    store.setUserId(userId);
    
    connect(roomId, handleMessage, handleConnect, handleDisconnect);
  };

  const vote = (card: FibonacciCard) => {
    send({
      type: 'vote',
      card,
    });
  };

  const reveal = () => {
    send({
      type: 'reveal',
    });
  };

  const reset = () => {
    send({
      type: 'reset',
    });
  };

  const leave = () => {
    send({
      type: 'leave',
    });
    disconnect();
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    joinRoom,
    vote,
    reveal,
    reset,
    leave,
  };
}