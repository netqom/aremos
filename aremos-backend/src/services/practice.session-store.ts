import { randomUUID } from 'crypto';
import { SessionState } from './aremos.engine';

type CardMeta = { id: number; question: string; answer: string; questionImageUrl?: string | null; answerImageUrl?: string | null; };
export type PracticeSession = { id: string; userId: number; deckId: number; state: SessionState; cards: Record<string, CardMeta>; startedAt: number; lastActivity: number; ttlMs: number; };
const SESSIONS = new Map<string, PracticeSession>(); const DEFAULT_TTL = 2 * 60 * 60 * 1000;
export function createSession(userId: number, deckId: number, state: SessionState, cards: CardMeta[]): PracticeSession {
  const id = randomUUID(); const now = Date.now(); const map: Record<string, CardMeta> = {}; for (const c of cards) map[String(c.id)] = c;
  const session: PracticeSession = { id, userId, deckId, state, cards: map, startedAt: now, lastActivity: now, ttlMs: DEFAULT_TTL }; SESSIONS.set(id, session); return session;
}
export function getSession(sessionId: string, userId: number): PracticeSession | null {
  const s = SESSIONS.get(sessionId); if (!s) return null; const now = Date.now();
  if (s.userId !== userId) return null; if (now - s.lastActivity > s.ttlMs) { SESSIONS.delete(sessionId); return null; } s.lastActivity = now; return s;
}
export function updateState(sessionId: string, newState: SessionState) { const s = SESSIONS.get(sessionId); if (s) { s.state = newState; s.lastActivity = Date.now(); } }
export function removeSession(sessionId: string) { SESSIONS.delete(sessionId); }
setInterval(() => { const now = Date.now(); for (const [id, s] of SESSIONS.entries()) { if (now - s.lastActivity > s.ttlMs) SESSIONS.delete(id); } }, 10 * 60 * 1000);