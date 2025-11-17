import { PokerRoom } from './poker-room';
import { Env } from './types';

export { PokerRoom };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Connection'
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // WebSocket room connection
    if (url.pathname.startsWith('/room/')) {
      const roomId = url.pathname.split('/')[2];

      if (!roomId) {
        return new Response('Room ID required', { status: 400 });
      }

      // Get or create Durable Object
      const id = env.POKER_ROOM.idFromName(roomId);
      const stub = env.POKER_ROOM.get(id);

      return stub.fetch(request);
    }

    // Get room history
    if (url.pathname.startsWith('/history/')) {
      const roomId = url.pathname.split('/')[2];

      if (!roomId) {
        return new Response('Room ID required', { status: 400 });
      }

      try {
        const history = await getHistory(env.DB, roomId);
        return new Response(JSON.stringify(history), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          }
        });
      } catch (error) {
        return new Response('Failed to fetch history', { status: 500 });
      }
    }

    // Export history as CSV
    if (url.pathname.startsWith('/export/')) {
      const roomId = url.pathname.split('/')[2];

      if (!roomId) {
        return new Response('Room ID required', { status: 400 });
      }

      try {
        const csv = await exportHistoryCSV(env.DB, roomId);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="poker-planning-${roomId}.csv"`,
            ...CORS_HEADERS
          }
        });
      } catch (error) {
        return new Response('Failed to export history', { status: 500 });
      }
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    return new Response('Poker Planning API - Use /room/{id} for WebSocket connection', {
      status: 200,
      headers: CORS_HEADERS
    });
  }
};

async function getHistory(db: D1Database, roomId: string) {
  const sessions = await db
    .prepare(`
      SELECT s.id, s.created_at, s.completed_at,
             r.id as round_id, r.round_number, r.revealed_at, r.average, r.median
      FROM sessions s
      LEFT JOIN rounds r ON s.id = r.session_id
      WHERE s.room_id = ?
      ORDER BY s.created_at DESC, r.round_number ASC
    `)
    .bind(roomId)
    .all();

  if (!sessions.results || sessions.results.length === 0) {
    return [];
  }

  const history = [];
  let currentSession = null;

  for (const row of sessions.results) {
    if (!currentSession || currentSession.id !== row.id) {
      currentSession = {
        id: row.id,
        created_at: row.created_at,
        completed_at: row.completed_at,
        rounds: []
      };
      history.push(currentSession);
    }

    if (row.round_id) {
      const votes = await db
        .prepare('SELECT user_name, vote FROM votes WHERE round_id = ?')
        .bind(row.round_id)
        .all();

      currentSession.rounds.push({
        round_number: row.round_number,
        revealed_at: row.revealed_at,
        average: row.average,
        median: row.median,
        votes: votes.results
      });
    }
  }

  return history;
}

async function exportHistoryCSV(db: D1Database, roomId: string): Promise<string> {
  const history = await getHistory(db, roomId);

  const rows = ['Timestamp,Session,Round,User,Vote,Average,Median'];

  for (const session of history) {
    for (const round of session.rounds) {
      for (const vote of round.votes) {
        rows.push(
          `${round.revealed_at},${session.id},${round.round_number},${vote.user_name},${vote.vote},${round.average},${round.median}`
        );
      }
    }
  }

  return rows.join('\n');
}
