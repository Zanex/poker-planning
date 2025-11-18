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
  cardType?: CardType;
}

export interface WSResponse {
  type: 'users' | 'vote_update' | 'revealed' | 'reset' | 'error';
  users?: User[];
  revealed?: boolean;
  cardType?: CardType;
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
  card_type?: CardType;
}

export type CardType = 'fibonacci' | 'tshirt' | 'powers' | 'sequential';

export const CARD_TYPES = {
  fibonacci: {
    label: 'Fibonacci',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'] as const,
  },
  tshirt: {
    label: 'T-Shirt Sizes',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'] as const,
  },
  powers: {
    label: 'Powers of 2',
    cards: ['1', '2', '4', '8', '16', '32', '64', '?', '☕'] as const,
  },
  sequential: {
    label: 'Sequential',
    cards: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?', '☕'] as const,
  },
} as const;

export const FIBONACCI_CARDS = CARD_TYPES.fibonacci.cards;
export type FibonacciCard = typeof FIBONACCI_CARDS[number];