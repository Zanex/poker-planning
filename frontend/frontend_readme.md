# Poker Planning Frontend

Vue 3 + TypeScript + Vite + Tailwind CSS

## Setup

```bash
npm install
```

## Configuration

Crea `.env` file dalla copia di `.env.example`:

```bash
cp .env.example .env
```

Aggiorna con i tuoi URL Worker:

```env
VITE_API_URL=https://poker-planning.YOUR_SUBDOMAIN.workers.dev
VITE_WS_URL=wss://poker-planning.YOUR_SUBDOMAIN.workers.dev
```

## Development

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

## Build

```bash
npm run build
```

Build ottimizzato in `dist/`

## Deploy su Cloudflare Pages

### Opzione 1: Wrangler CLI

```bash
npm run deploy
```

### Opzione 2: GitHub Integration

1. Push su GitHub
2. Vai su [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Pages → Create a project → Connect to Git
4. Seleziona repo
5. Build settings:
   - Framework preset: **Vue**
   - Build command: `npm run build`
   - Build output: `dist`
6. Environment variables: aggiungi `VITE_API_URL` e `VITE_WS_URL`

## Struttura

```
src/
├── components/          # Componenti Vue
│   ├── RoomHeader.vue
│   ├── UserGrid.vue
│   ├── VotingCards.vue
│   ├── Controls.vue
│   └── HistoryPanel.vue
├── composables/         # Logic riutilizzabile
│   ├── useWebSocket.ts
│   ├── usePokerRoom.ts
│   └── useHistory.ts
├── stores/              # Pinia stores
│   └── poker.ts
├── views/               # Route views
│   ├── JoinView.vue
│   └── RoomView.vue
├── router/              # Vue Router
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Utility functions
│   └── index.ts
├── config/              # App configuration
│   └── index.ts
├── App.vue
├── main.ts
└── style.css
```

## Features Implementate

✅ **Real-time WebSocket** connection con auto-reconnect
✅ **State Management** con Pinia
✅ **Type Safety** completo TypeScript
✅ **Responsive Design** mobile-first
✅ **Animazioni** smooth transitions
✅ **Error Handling** con toast notifications
✅ **History Panel** con export CSV
✅ **Room Sharing** copy link to clipboard
✅ **Auto-save** username e room ID in localStorage

## Composables

### usePokerRoom

```typescript
const { joinRoom, vote, reveal, reset, leave } = usePokerRoom();

// Join room
joinRoom('abc123', 'John Doe');

// Vote
vote('5');

// Reveal cards
reveal();

// New round
reset();
```

### useWebSocket

```typescript
const { connect, send, disconnect } = useWebSocket();

connect(roomId, onMessage, onConnect, onDisconnect);
send({ type: 'vote', card: '5' });
disconnect();
```

### useHistory

```typescript
const { loading, history, fetchHistory, exportCSV } = useHistory();

await fetchHistory('abc123');
await exportCSV('abc123');
```

## Styling

Utilizza **Tailwind CSS** con configurazione custom:

- Gradient background
- Custom animations
- Utility classes per poker cards
- Responsive breakpoints

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- Code splitting automatico
- Lazy loading componenti
- Tree shaking Vite
- Minificazione Terser
- Prefetch/Preload automatico

## Testing Locale con Worker

```bash
# Terminal 1: Worker
cd ../worker
npm run dev

# Terminal 2: Frontend
npm run dev
```

Il proxy Vite inoltrerà automaticamente WebSocket e API requests al worker locale.

## Troubleshooting

**WebSocket non si connette:**
- Verifica URL in `.env`
- Controlla che Worker sia deployed
- Verifica CORS settings nel worker

**Build fallisce:**
- Pulisci cache: `rm -rf node_modules dist && npm install`
- Verifica versione Node.js >= 18

**Stili non caricano:**
- Verifica `postcss.config.js` e `tailwind.config.js`
- Rebuild: `npm run build`

## License

MIT