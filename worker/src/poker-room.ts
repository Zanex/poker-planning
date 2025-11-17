import { Env, User, WSMessage, WSResponse, RoomState, RoundData } from './types';

export class PokerRoom {
  state: DurableObjectState;
  env: Env;
  roomState: RoomState;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;

    this.roomState = {
      roomId: '',
      revealed: false,
      roundNumber: 0,
      sessionId: null,
      users: new Map()
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const roomId = url.pathname.split('/').pop() || '';
    this.roomState.roomId = roomId;

    // WebSocket upgrade
    const upgrade = request.headers.get('Upgrade');
    if (upgrade !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    await this.handleSession(server);

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async handleSession(ws: WebSocket) {
    ws.accept();

    ws.addEventListener('message', async (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data as string);
        await this.handleMessage(ws, data);
      } catch (error) {
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.addEventListener('close', () => {
      this.handleDisconnect(ws);
    });

    ws.addEventListener('error', () => {
      this.handleDisconnect(ws);
    });
  }

  async handleMessage(ws: WebSocket, data: WSMessage) {
    switch (data.type) {
      case 'join':
        await this.handleJoin(ws, data);
        break;
      case 'vote':
        await this.handleVote(ws, data);
        break;
      case 'reveal':
        await this.handleReveal();
        break;
      case 'reset':
        await this.handleReset();
        break;
      case 'leave':
        this.handleDisconnect(ws);
        break;
    }
  }

  async handleJoin(ws: WebSocket, data: WSMessage) {
    if (!data.id || !data.name) {
      this.sendError(ws, 'Missing user id or name');
      return;
    }

    const user: User = {
      id: data.id,
      name: data.name,
      vote: null,
      connected: true,
      joinedAt: new Date().toISOString()
    };

    this.roomState.users.set(ws, user);

    // Create session if first user
    if (this.roomState.users.size === 1 && !this.roomState.sessionId) {
      this.roomState.sessionId = crypto.randomUUID();
      await this.createSession();
    }

    this.broadcastUsers();
  }

  async handleVote(ws: WebSocket, data: WSMessage) {
    const user = this.roomState.users.get(ws);
    if (!user) return;

    if (this.roomState.revealed) {
      this.sendError(ws, 'Voting closed - round already revealed');
      return;
    }

    if (!data.card) {
      this.sendError(ws, 'Missing vote card');
      return;
    }

    user.vote = data.card;
    this.broadcastUsers();
  }

  async handleReveal() {
    if (this.roomState.revealed) return;

    this.roomState.revealed = true;
    this.roomState.roundNumber++;

    const stats = this.calculateStats();

    // Persist to D1
    await this.saveRound(stats);

    const response: WSResponse = {
      type: 'revealed',
      users: this.getUsersArray(),
      revealed: true,
      stats
    };

    this.broadcast(response);
  }

  async handleReset() {
    this.roomState.revealed = false;

    // Clear votes
    this.roomState.users.forEach(user => {
      user.vote = null;
    });

    const response: WSResponse = {
      type: 'reset',
      users: this.getUsersArray(),
      revealed: false
    };

    this.broadcast(response);
  }

  handleDisconnect(ws: WebSocket) {
    this.roomState.users.delete(ws);

    try {
      ws.close();
    } catch { }

    this.broadcastUsers();
  }

  calculateStats() {
    const votes = Array.from(this.roomState.users.values())
      .filter(u => u.vote && u.vote !== '?' && u.vote !== '☕')
      .map(u => parseInt(u.vote!));

    if (votes.length === 0) {
      return { average: 0, median: 0, total: 0 };
    }

    const sum = votes.reduce((a, b) => a + b, 0);
    const average = sum / votes.length;

    const sorted = [...votes].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return {
      average: Math.round(average * 10) / 10,
      median,
      total: votes.length
    };
  }

  getUsersArray(): User[] {
    return Array.from(this.roomState.users.values()).map(u => ({
      ...u,
      vote: this.roomState.revealed ? u.vote : (u.vote ? '🃏' : null)
    }));
  }

  broadcastUsers() {
    const response: WSResponse = {
      type: 'users',
      users: this.getUsersArray()
    };
    this.broadcast(response);
  }

  broadcast(message: WSResponse) {
    const json = JSON.stringify(message);
    this.roomState.users.forEach((_, ws) => {
      try {
        ws.send(json);
      } catch { }
    });
  }

  sendError(ws: WebSocket, error: string) {
    const response: WSResponse = {
      type: 'error',
      error
    };
    try {
      ws.send(JSON.stringify(response));
    } catch { }
  }

  async createSession() {
    if (!this.roomState.sessionId) return;

    try {
      await this.env.DB.prepare(
        'INSERT INTO sessions (id, room_id, created_at) VALUES (?, ?, ?)'
      )
        .bind(
          this.roomState.sessionId,
          this.roomState.roomId,
          new Date().toISOString()
        )
        .run();
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }

  async saveRound(stats: { average: number; median: number; total: number }) {
    if (!this.roomState.sessionId) return;

    try {
      const roundId = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      // Insert round
      await this.env.DB.prepare(
        'INSERT INTO rounds (id, session_id, round_number, revealed_at, average, median) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(
          roundId,
          this.roomState.sessionId,
          this.roomState.roundNumber,
          timestamp,
          stats.average,
          stats.median
        )
        .run();

      // Insert votes
      const users = Array.from(this.roomState.users.values());
      for (const user of users) {
        if (user.vote) {
          await this.env.DB.prepare(
            'INSERT INTO votes (id, round_id, user_name, vote, voted_at) VALUES (?, ?, ?, ?, ?)'
          )
            .bind(
              crypto.randomUUID(),
              roundId,
              user.name,
              user.vote,
              timestamp
            )
            .run();
        }
      }
    } catch (error) {
      console.error('Failed to save round:', error);
    }
  }
}
