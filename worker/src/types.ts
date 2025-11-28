export type CardType = 'fibonacci' | 'tshirt' | 'powers' | 'sequential';

export interface Env {
	POKER_ROOM: DurableObjectNamespace;
	DB: D1Database;
}

export interface User {
	id: string;
	name: string;
	vote: string | null;
	connected: boolean;
	isSpectator: boolean;
	joinedAt: string;
}

export interface RoomState {
	roomId: string;
	revealed: boolean;
	roundNumber: number;
	sessionId: string | null;
	cardType: CardType;
	users: Map<WebSocket, User>;
}

export interface WSMessage {
	type: 'join' | 'vote' | 'reveal' | 'reset' | 'leave';
	id?: string;
	name?: string;
	card?: string;
	cardType?: CardType;
	isSpectator?: boolean;
}

export interface WSResponse {
	type: 'users' | 'vote_update' | 'revealed' | 'reset' | 'error';
	users?: User[];
	revealed?: boolean;
	cardType?: CardType;
	stats?: {
		average: number;
		median: number;
		total: number;
	};
	error?: string;
}

export interface RoundData {
	roundNumber: number;
	votes: { name: string; vote: string }[];
	average: number;
	median: number;
	timestamp: string;
}