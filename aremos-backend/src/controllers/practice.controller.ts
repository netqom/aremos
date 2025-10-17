import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { ERRORS, handleServerError, AppError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { initSession, getNextCardId, answerCard, SessionState } from '../services/aremos.engine';
import { createSession, getSession, updateState, removeSession } from '../services/practice.session-store';
import { getAuthUser } from '../helpers/auth.helper';

/** Start a practice session */
export const startSession = async (request: FastifyRequest<{ Params: { deckId: string } }>, reply: FastifyReply) => {
  try {
    const authUser = getAuthUser(request);
    const deckId = parseInt(request.params.deckId, 10);
    const deck = await prisma.deck.findFirst({ where: { id: deckId, ownerId: authUser.id }, include: { cards: true } });
    if (!deck) throw new AppError('Deck gehört dir nicht', 403);
    if (!deck.cards.length) throw new AppError('Deck hat keine Karten', 400);
    const cardsForAlgo = deck.cards.map(c => ({ id: String(c.id), question: c.question, answer: c.answer }));
    const state: SessionState = initSession(cardsForAlgo);
    const sess = createSession(authUser.id, deck.id, state, deck.cards as any);
    const nextId = getNextCardId(sess.state); const nextCard = nextId ? sess.cards[nextId] : null;
    return reply.code(STANDARD.CREATED.statusCode).send({ sessionId: sess.id, totalCards: deck.cards.length, roundIndex: sess.state.round, firstCard: nextCard ? { id: nextCard.id, question: nextCard.question, questionImageUrl: nextCard.questionImageUrl || null } : null });
  } catch (err) { return handleServerError(reply, err); }
};

/** Submit an answer for the current card and get next */
export const answerPractice = async (request: FastifyRequest<{ Params: { sessionId: string }; Body: { cardId: number; isCorrect: boolean } }>, reply: FastifyReply) => {
  try {
    const authUser = getAuthUser(request);
    const { sessionId } = request.params; const { cardId, isCorrect } = request.body;
    const sess = getSession(sessionId, authUser.id); if (!sess) throw new AppError('Session nicht gefunden oder abgelaufen', 404);
    const result = answerCard(sess.state, String(cardId), !!isCorrect); 
    updateState(sessionId, result.session);
    const nextId = getNextCardId(result.session); 
    if (!nextId) return reply.code(STANDARD.OK.statusCode).send({ done: true });
    const nextCard = sess.cards[nextId];
    return reply.code(STANDARD.OK.statusCode).send({ nextCard: { id: nextCard.id, question: nextCard.question, questionImageUrl: nextCard.questionImageUrl || null }, roundIndex: result.session.round, remaining: result.session.queue.length });
  } catch (err) { return handleServerError(reply, err); }
};

/** Get current state for resume */
export const getSessionStatus = async (request: FastifyRequest<{ Params: { sessionId: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const { sessionId } = request.params; const sess = getSession(sessionId, authUser.id); if (!sess) throw new AppError('Session nicht gefunden oder abgelaufen', 404);
    const nextId = getNextCardId(sess.state); const nextCard = nextId ? sess.cards[nextId] : null;
    return reply.code(STANDARD.OK.statusCode).send({ roundIndex: sess.state.round, remaining: sess.state.queue.length, currentCard: nextCard ? { id: nextCard.id, question: nextCard.question, questionImageUrl: nextCard.questionImageUrl || null } : null });
  } catch (err) { return handleServerError(reply, err); }
};

/** Finish and persist insights */
export const finishPractice = async (request: FastifyRequest<{ Params: { sessionId: string }; Body: { durationMs: number } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const { sessionId } = request.params; const { durationMs } = request.body;
    const sess = getSession(sessionId, authUser.id); if (!sess) throw new AppError('Session nicht gefunden oder abgelaufen', 404);
    const interactionsData = sess.state.history.map(h => ({ cardId: Number(h.cardId), round: h.round, isCorrect: h.isCorrect }));
    
    // Delete any existing sessions for this user+deck combination (keep only latest)
    await prisma.learningSession.deleteMany({ 
      where: { userId: authUser.id, deckId: sess.deckId } 
    }).catch(() => {});
    
    // Create new session
    await prisma.learningSession.create({ data: { userId: authUser.id, deckId: sess.deckId, durationMs: Math.max(1, Math.floor(durationMs || 0)), interactions: { create: interactionsData } } });
    const correctCount = interactionsData.filter(i => i.isCorrect).length; const wrongCount = interactionsData.length - correctCount; const uniqueCards = new Set(interactionsData.map(i => i.cardId)).size; const rounds = Math.max(1, ...interactionsData.map(i => i.round));
    removeSession(sessionId);
    return reply.code(STANDARD.OK.statusCode).send({ saved: true, summary: { cards: uniqueCards, rounds, correctCount, wrongCount } });
  } catch (err) { return handleServerError(reply, err); }
};

/** Cancel without saving */
export const endSession = async (request: FastifyRequest<{ Params: { sessionId: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const { sessionId } = request.params; const sess = getSession(sessionId, authUser.id); if (sess) removeSession(sessionId);
    return reply.code(STANDARD.OK.statusCode).send({ ok: true });
  } catch (err) { return handleServerError(reply, err); }
};