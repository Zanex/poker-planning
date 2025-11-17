# Poker Planning Worker

Backend serverless per Poker Planning App su Cloudflare Workers + Durable Objects.

## Setup

```bash
npm install
```

## Database Setup

```bash
# Crea database D1
wrangler d1 create poker_history

# Copia il database_id nell'output e aggiornalo in wrangler.toml

# Inizializza schema
npm run db:init

# Per testing locale
npm run db:local
```

## Development

```bash
npm run dev
```

Il worker sarà disponibile su `http://localhost:8787`

## Deploy

```bash
npm run deploy
```

## API Endpoints

### WebSocket Room
```
wss://your-worker.workers.dev/room/{roomId}
```

**Messaggi Client → Server:**
```json
// Join room
{ "type": "join", "id": "user-uuid", "name": "John Doe" }

// Vote
{ "type": "vote", "card": "5" }

// Reveal cards
{ "type": "reveal" }

// Reset round
{ "type": "reset" }

// Leave room
{ "type": "leave" }
```

**Messaggi Server → Client:**
```json
// Users update
{
  "type": "users",
  "users": [
    { "id": "uuid", "name": "John", "vote": "🃏", "connected": true }
  ]
}

// Revealed
{
  "type": "revealed",
  "users": [...],
  "revealed": true,
  "stats": {
    "average": 5.5,
    "median": 5,
    "total": 4
  }
}

// Reset
{
  "type": "reset",
  "users": [...],
  "revealed": false
}

// Error
{
  "type": "error",
  "error": "Error message"
}
```

### REST Endpoints

**Get Room History**
```
GET /history/{roomId}
```

**Export CSV**
```
GET /export/{roomId}
```

**Health Check**
```
GET /health
```

## Architettura

```
┌─────────────────┐
│   Client Vue    │
└────────┬────────┘
         │ WebSocket
         ↓
┌─────────────────┐
│  Worker Router  │ (index.ts)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Durable Object  │ (poker-room.ts)
│  Per Room ID    │
└────────┬────────┘
         │ Persist
         ↓
┌─────────────────┐
│   D1 Database   │ (schema.sql)
│ Sessions/Rounds │
└─────────────────┘
```

## Durable Objects

Ogni room poker è gestita da un Durable Object isolato:
- Stato real-time in memoria
- WebSocket connections persistenti
- Broadcast automatico agli utenti connessi
- Salvataggio round in D1

## Database Schema

**sessions**: Sessioni poker (create al primo join)
**rounds**: Round singoli con statistiche
**votes**: Voti individuali per analytics

## Limiti Free Tier

- 100k richieste/giorno Worker
- Durable Objects: 1M richieste/mese
- D1: 5GB storage + 5M letture/giorno
- WebSocket: illimitate

## Testing Locale

```bash
# Terminal 1: Worker
npm run dev

# Terminal 2: Test WebSocket
wscat -c ws://localhost:8787/room/test123

# Invia messaggi
> {"type":"join","id":"1","name":"Test"}
> {"type":"vote","card":"5"}
> {"type":"reveal"}
```

## Production URLs

Dopo deploy, gli URL saranno:
```
WebSocket: wss://poker-planning.YOUR_SUBDOMAIN.workers.dev/room/{id}
REST: https://poker-planning.YOUR_SUBDOMAIN.workers.dev/history/{id}
```

Aggiorna questi URL nel frontend Vue.