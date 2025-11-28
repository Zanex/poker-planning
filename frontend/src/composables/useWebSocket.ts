import { getWsUrl } from '@/config';
import { config } from '@/config';
import type { WSMessage, WSResponse } from '@/types';

let wsInstance: WebSocket | null = null;
let reconnectAttempts = 0;
let reconnectTimeout: number | undefined;
let pingInterval: number | undefined;
let currentRoomId: string | null = null;
let currentCallbacks: { onMessage: (data: WSResponse) => void; onConnect: () => void; onDisconnect: () => void } | null = null;
const messageQueue: WSMessage[] = [];

const connect = (
  roomId: string,
  onMessage: (data: WSResponse) => void,
  onConnect: () => void,
  onDisconnect: () => void
) => {
  // Se già connesso allo stesso room, non fare nulla
  if (wsInstance && currentRoomId === roomId && wsInstance.readyState === WebSocket.OPEN) {
    console.log('Already connected to room:', roomId);
    return;
  }

  // Disconnetti se era connesso a un room diverso
  if (wsInstance && currentRoomId !== roomId) {
    wsInstance.close();
    wsInstance = null;
  }

  currentRoomId = roomId;
  currentCallbacks = { onMessage, onConnect, onDisconnect };

  const url = getWsUrl(roomId);
  console.log('Connecting to WebSocket:', url);
  wsInstance = new WebSocket(url);

  wsInstance.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    
    // Invia i messaggi in coda
    while (messageQueue.length > 0) {
      const msg = messageQueue.shift();
      if (msg && wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify(msg));
      }
    }
    
    onConnect();
    
    // Start ping interval
    pingInterval = window.setInterval(() => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify({ type: 'ping' }));
      }
    }, config.pingInterval);
  };

  wsInstance.onmessage = (event) => {
    try {
      const data: WSResponse = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  };

  wsInstance.onclose = () => {
    console.log('WebSocket disconnected');
    onDisconnect();
    
    if (pingInterval) {
      clearInterval(pingInterval);
    }

    // Attempt reconnection
    if (reconnectAttempts < config.maxReconnectAttempts && currentCallbacks) {
      reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
      
      reconnectTimeout = window.setTimeout(() => {
        if (currentCallbacks) {
          connect(roomId, currentCallbacks.onMessage, currentCallbacks.onConnect, currentCallbacks.onDisconnect);
        }
      }, config.reconnectDelay * reconnectAttempts);
    }
  };

  wsInstance.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

const send = (message: WSMessage) => {
  console.log('send() called. wsInstance:', wsInstance, 'readyState:', wsInstance?.readyState, 'OPEN:', WebSocket.OPEN);
  
  if (!wsInstance) {
    console.warn('WebSocket not initialized, queueing message', message);
    messageQueue.push(message);
    return;
  }
  
  if (wsInstance.readyState === WebSocket.OPEN) {
    console.log('Json sending message:', JSON.stringify(message));
    wsInstance.send(JSON.stringify(message));
  } else if (wsInstance.readyState === 0) { // CONNECTING
    console.warn('WebSocket is CONNECTING, queueing message', message);
    messageQueue.push(message);
  } else {
    console.error(`WebSocket not connected. State: ${wsInstance.readyState} (CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3)`);
  }
};

const disconnect = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  
  if (pingInterval) {
    clearInterval(pingInterval);
  }
  
  if (wsInstance) {
    wsInstance.close();
  }
  
  currentRoomId = null;
  currentCallbacks = null;
  reconnectAttempts = 0;
};

export function useWebSocket() {
  return {
    connect,
    send,
    disconnect,
  };
}
