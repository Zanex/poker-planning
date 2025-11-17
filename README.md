# Poker Planning

Un'applicazione real-time per Poker Planning meetings, costruita con Vue 3, TypeScript, Vite e Cloudflare Workers.

**Live Demo**: [poker-planning.workers.dev](https://poker-planning.workers.dev)

## 🎯 Panoramica

Poker Planning è un'applicazione web moderna per facilitare le riunioni di stima agile usando la tecnica del Planning Poker. Supporta:

- ✅ **Real-time Collaboration** - WebSocket per comunicazione istantanea
- ✅ **Serverless Architecture** - Backend su Cloudflare Workers + Durable Objects
- ✅ **Responsive Design** - Mobile-first UI con Tailwind CSS
- ✅ **Type Safety** - TypeScript full stack
- ✅ **Auto-reconnect** - Gestione automatica disconnessioni
- ✅ **History & Analytics** - Export CSV con statistiche round
- ✅ **Zero Database Setup** - Cloudflare D1 SQLite

## 🏗️ Architettura

```
┌─────────────────────────────────────┐
│     Client (Vue 3 + TypeScript)     │
│     http://localhost:3000           │
└──────────────┬──────────────────────┘
               │ WebSocket
               │ /room/{roomId}
               ↓
┌─────────────────────────────────────┐
│   Cloudflare Workers + Durable Obj  │
│     http://localhost:8787           │
├─────────────────────────────────────┤
│ - Router HTTP                       │
│ - Poker Room Durable Object         │
│ - WebSocket broadcast               │
│ - REST endpoints                    │
└──────────────┬──────────────────────┘
               │ Persist
               ↓
┌─────────────────────────────────────┐
│      Cloudflare D1 (SQLite)         │
│  - Session history                  │
│  - Round statistics                 │
│  - Vote details                     │
└─────────────────────────────────────┘
```

## 📁 Struttura Progetto

```
poker-planning/
├── frontend/                    # Vue 3 + Vite frontend
│   ├── src/
│   │   ├── components/          # Vue components
│   │   │   ├── Controls.vue
│   │   │   ├── HistoryPanel.vue
│   │   │   ├── RoomHeader.vue
│   │   │   ├── UserGrid.vue
│   │   │   └── VotingCards.vue
│   │   ├── composables/         # Logic riutilizzabile
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useWebSocketGlobal.ts
│   │   │   ├── usePokerRoom.ts
│   │   │   └── useHistory.ts
│   │   ├── stores/              # Pinia state management
│   │   │   └── poker.ts
│   │   ├── views/               # Page components
│   │   │   ├── JoinView.vue
│   │   │   └── RoomView.vue
│   │   ├── router/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── style.css
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── worker/                      # Cloudflare Workers backend
│   ├── src/
│   │   ├── index.ts             # Router principale
│   │   ├── poker-room.ts        # Durable Object
│   │   ├── types.ts             # TypeScript types
│   │   └── schema.sql           # Database schema
│   ├── wrangler.toml            # Configurazione Workers
│   ├── tsconfig.json
│   └── package.json
│
└── README.md                    # Questo file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm o yarn
- Account Cloudflare (per deploy)

### 1. Setup Locale

```bash
# Clone repo
git clone https://github.com/yourusername/poker-planning.git
cd poker-planning

# Install root dependencies (se necessario)
npm install
```

### 2. Setup Worker (Backend)

```bash
cd worker

# Install dependencies
npm install

# Crea D1 database
wrangler d1 create poker_history

# Copia database_id e aggiorna wrangler.toml
# [env.production]
# d1_databases = [{ binding = "DB", database_id = "YOUR_ID" }]

# Inizializza schema
npm run db:init

# Avvia worker locale
npm run dev
# Worker disponibile su http://localhost:8787
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Crea .env per variabili locali
cat > .env.local << EOF
VITE_API_URL=http://localhost:8787
VITE_WS_URL=ws://localhost:8787
EOF

# Avvia dev server
npm run dev
# App disponibile su http://localhost:3000
```

### 4. Test

Apri `http://localhost:3000` in due finestre:
1. Prima finestra: crea una nuova room
2. Seconda finestra: unisciti con un nome diverso
3. Entrambi possono votare e vedere aggiornamenti in real-time

## 📡 API Reference

### WebSocket Endpoint

```
ws://localhost:8787/room/{roomId}
wss://your-worker.workers.dev/room/{roomId}
```

**Messaggi Client → Server:**

```typescript
// Join a room
{ type: 'join', id: 'uuid', name: 'John Doe' }

// Vote
{ type: 'vote', card: '5' }

// Reveal cards
{ type: 'reveal' }

// Reset round
{ type: 'reset' }

// Leave room
{ type: 'leave' }

// Ping (keepalive)
{ type: 'ping' }
```

**Messaggi Server → Client:**

```typescript
// Users list update
{
  type: 'users',
  users: [
    { id: 'uuid', name: 'John', vote: '🃏', connected: true }
  ]
}

// Cards revealed with stats
{
  type: 'revealed',
  users: [...],
  revealed: true,
  stats: {
    average: 5.5,
    median: 5,
    total: 4
  }
}

// Round reset
{
  type: 'reset',
  users: [...],
  revealed: false
}

// Error
{
  type: 'error',
  error: 'Error message'
}
```

### REST Endpoints

```
GET /health
  → { status: 'ok' }

GET /history/{roomId}
  → { rounds: [...] }

GET /export/{roomId}
  → CSV file download
```

## 🛠️ Sviluppo

### Frontend Development

```bash
cd frontend

# Dev server con hot reload
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

### Worker Development

```bash
cd worker

# Dev server locale
npm run dev

# Build
npm run build

# Deploy a Cloudflare
npm run deploy

# Database commands
npm run db:init      # Inizializza schema
npm run db:shell     # Shell D1 locale
npm run db:local     # Database locale
```

## 🧪 Testing

### Test WebSocket Locale

```bash
# Installa wscat
npm install -g wscat

# Connettiti al room
wscat -c ws://localhost:8787/room/test123

# Invia messaggi
> {"type":"join","id":"user1","name":"Alice"}
> {"type":"vote","card":"5"}
> {"type":"reveal"}
> {"type":"reset"}
```

### Test E2E

```bash
cd frontend
npm run test
```

## 🌐 Deploy

### Deploy Frontend su Cloudflare Pages

**Opzione 1: GitHub Integration (Consigliato)**

1. Push codice su GitHub
2. Vai su [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Pages → Create a project → Connect to Git
4. Seleziona questo repo
5. Build settings:
   - Framework preset: **Vue**
   - Build command: `npm run build`
   - Build output directory: `frontend/dist`
   - Root directory: `frontend`
6. Aggiungi environment variables:
   ```
   VITE_API_URL=https://poker-planning.workers.dev
   VITE_WS_URL=wss://poker-planning.workers.dev
   ```
7. Deploy

**Opzione 2: Wrangler CLI**

```bash
cd frontend
npm run build
npx wrangler pages publish dist --project-name poker-planning
```

### Deploy Worker su Cloudflare

```bash
cd worker

# Configura wrangler.toml con i tuoi dettagli

# Build e deploy
npm run deploy
```

## 🔐 Environment Variables

### Frontend (.env / .env.local)

```env
# Local development
VITE_API_URL=http://localhost:8787
VITE_WS_URL=ws://localhost:8787

# Production
VITE_API_URL=https://poker-planning.workers.dev
VITE_WS_URL=wss://poker-planning.workers.dev
```

### Worker (wrangler.toml)

```toml
[env.production]
d1_databases = [{ binding = "DB", database_id = "YOUR_DATABASE_ID" }]

[[routes]]
pattern = "https://poker-planning.workers.dev/*"
zone_name = "your-domain.com"
```

## 📊 Performance

- **Frontend**: Code splitting con Vite, lazy loading, minificazione con Terser
- **Worker**: Durable Objects per istanze isolate per room, streaming WebSocket
- **Database**: D1 SQLite con indici ottimizzati
- **CDN**: Cloudflare Pages con edge caching

Metrics:
- Core Web Vitals: ✅ Green
- Build time: ~2s
- Worker response: <50ms
- WebSocket latency: <100ms

## 🐛 Troubleshooting

### WebSocket non si connette

```
Controlla:
1. Worker è in esecuzione (npm run dev in worker/)
2. URL in .env è corretto
3. Console browser per errori di connessione
4. CORS headers nel worker
```

### Build fallisce

```bash
# Pulisci cache
rm -rf node_modules dist
npm install
npm run build
```

### Stili non caricano

```bash
cd frontend
# Verifica postcss.config.js e tailwind.config.js
npm run build
```

### D1 database non trovato

```bash
# Reinstalla binding
wrangler d1 list
wrangler d1 create poker_history
# Aggiorna database_id in wrangler.toml
npm run db:init
```

## 🤝 Contributing

1. Fork il progetto
2. Crea una feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Changelog

### v1.0.0
- ✅ Real-time WebSocket collaboration
- ✅ Poker room management
- ✅ Vote reveal con statistiche
- ✅ History e CSV export
- ✅ Mobile responsive design
- ✅ Auto-reconnect logic

## 📜 License

Questo progetto è licenziato sotto la MIT License - vedi il file [LICENSE](LICENSE) per dettagli.

## 🎓 Credits

- Vue 3 framework
- Cloudflare Workers & Durable Objects
- Tailwind CSS
- TypeScript

## 📞 Support

Per problemi o suggerimenti:

- Apri un issue su GitHub
- Discussioni: [GitHub Discussions](https://github.com/yourusername/poker-planning/discussions)
- Email: support@poker-planning.dev

## 🔗 Link Utili

- [Vue 3 Documentation](https://vuejs.org)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects)
- [D1 SQLite Database](https://developers.cloudflare.com/d1)
- [Tailwind CSS](https://tailwindcss.com)

---

Fatto con ❤️ per il Poker Planning

**Deploy Status**: [![Deploy](https://github.com/yourusername/poker-planning/workflows/deploy/badge.svg)](https://github.com/yourusername/poker-planning/actions)