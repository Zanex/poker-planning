export interface User {
  id: string;
  name: string;
  vote: string | null;
  connected: boolean;
  joinedAt?: string;
}

export interface Stats {
  average: number;
  median: number;
  total: number;
}

export interface WSMessage {
  type: 'join' | 'vote' | 'reveal' | 'reset' | 'leave';
  id?: string;
  name?: string;
  card?: string;
}

export interface WSResponse {
  type: 'users' | 'vote_update' | 'revealed' | 'reset' | 'error';
  users?: User[];
  revealed?: boolean;
  stats?: Stats;
  error?: string;
}

export interface RoundHistory {
  round_number: number;
  revealed_at: string;
  average: number;
  median: number;
  votes: { user_name: string; vote: string }[];
}

export interface SessionHistory {
  id: string;
  created_at: string;
  completed_at: string | null;
  rounds: RoundHistory[];
}

export const FIBONACCI_CARDS = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'] as const;
export type FibonacciCard = typeof FIBONACCI_CARDS[number];