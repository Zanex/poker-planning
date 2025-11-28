import { onUnmounted } from 'vue';
import { usePokerStore } from '@/stores/poker';
import { useWebSocket } from './useWebSocket';
import type { WSResponse } from '@/types';

export function usePokerRoom() {
  const store = usePokerStore();
  const { connect, send, disconnect } = useWebSocket();

  const handleMessage = (data: WSResponse) => {
    console.log('Received message:', data);
    
    switch (data.type) {
      case 'users':
      case 'vote_update':
        if (data.users) {
          console.log('Updating users:', data.users);
          store.updateUsers(data.users);
        }
        if (data.cardType) {
          store.setCardType(data.cardType);
        }
        break;

      case 'revealed':
        console.log('Cards revealed with stats:', data.stats);
        store.setRevealed(true);
        if (data.users) store.updateUsers(data.users);
        if (data.stats) store.setStats(data.stats);
        if (data.cardType) store.setCardType(data.cardType);
        break;

      case 'reset':
        console.error('Server error:', data.error);
        console.log('Round reset');
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
    const joinMessage = {
      type: 'join' as const,
      id: store.userId,
      name: store.userName,
      cardType: store.cardType,
      isSpectator: store.isSpectator,
    };
    
    console.log('Sending join message:', joinMessage);
    send(joinMessage);
  };

  const handleDisconnect = () => {
    store.setConnected(false);
  };

  const joinRoom = (roomId: string, userName: string, isSpectator: boolean) => {
    const userId = crypto.randomUUID();
    
    store.setRoomId(roomId);
    store.setUserName(userName);
    store.setUserId(userId);
    store.setIsSpectator(isSpectator);
    
    connect(roomId, handleMessage, handleConnect, handleDisconnect);
  };

  const vote = (card: string) => {
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