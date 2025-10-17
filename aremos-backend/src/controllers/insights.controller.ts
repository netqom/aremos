import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { ERRORS, handleServerError, AppError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { ICreateSessionDto } from '../schemas/Insights';

export const createSession = async (request: FastifyRequest<{ Body: ICreateSessionDto }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const { deckId, durationMs, interactions } = request.body;
    const deck = await prisma.deck.findFirst({ where: { id: deckId, ownerId: authUser.id } });
    if (!deck) throw new AppError("You don't own this deck.", 403);
    const session = await prisma.learningSession.create({ data: { userId: authUser.id, deckId, durationMs: durationMs, interactions: { create: interactions.map(i => ({ cardId: i.cardId, round: i.round, isCorrect: i.isCorrect })) } } });
    return reply.code(STANDARD.CREATED.statusCode).send(session);
  } catch (err) { return handleServerError(reply, err); }
};
export const getInsightsForOriginalDeck = async (request: FastifyRequest<{ Params: { originalDeckId: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const originalDeckId = parseInt(request.params.originalDeckId, 10);
    const originalDeck = await prisma.deck.findFirst({ where: { id: originalDeckId, ownerId: authUser.id } });
    if (!originalDeck) throw new AppError('You are not the owner of this deck.', 403);
    const sessions = await prisma.learningSession.findMany({ where: { deck: { copiedFromId: originalDeckId } }, include: { user: { select: { id: true, name: true } }, interactions: { select: { cardId: true, round: true, isCorrect: true } } }, orderBy: { completedAt: 'desc' } });
    const latestPerUser = new Map<number, any>();
    for (const s of sessions) { const prev = latestPerUser.get(s.userId); if (!prev || s.completedAt > prev.completedAt) latestPerUser.set(s.userId, s); }
    const data = Array.from(latestPerUser.values()).map((s: any) => ({ id: s.userId, name: s.user.name, lastVisit: s.completedAt.toISOString().split('T')[0], studyDuration: Math.round(s.duration / 60), answers: s.interactions.map((i: any) => ({ round: i.round, card: i.cardId, isCorrect: i.isCorrect })) }));
    return reply.code(STANDARD.OK.statusCode).send(data);
  } catch (err) { return handleServerError(reply, err); }
};