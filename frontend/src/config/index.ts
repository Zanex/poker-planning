export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
  reconnectDelay: 1000,
  maxReconnectAttempts: 5,
  pingInterval: 30000,
};

export const getWsUrl = (roomId: string): string => {
  const base = config.wsUrl;
  console.log(`Using WebSocket base URL: ${base}`);
  return `${base}/room/${roomId}`;
};

export const getApiUrl = (path: string): string => {
  const base = config.apiUrl || window.location.origin;
  return `${base}${path}`;
};