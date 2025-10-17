import { unlinkSync } from 'fs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { ERRORS, handleServerError, AppError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { ICreateDeckDto, IUpdateDeckNameDto, ICreateCardDto, IUpdateCardDto } from '../schemas/Deck';
import { todayStrBerlin, toBerlinDateStr } from '../utils/time';
import { getAuthUser } from '../helpers/auth.helper';
import { parsePagination, buildPaginatedResponse, PaginationParams } from '../utils/pagination';

async function assertOwnOriginalDeck(deckId: number, ownerId: number) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, ownerId } });
  if (!deck) throw new AppError('Deck not found', 404);
  if (deck.copiedFromId) throw new AppError('Kopierte Decks können nicht bearbeitet werden', 403);
  return deck;
}
async function assertOwnDeck(deckId: number, ownerId: number) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, ownerId } });
  if (!deck) throw new AppError('Deck not found', 404);
  return deck;
}

export const createDeck = async (request: FastifyRequest<{ Body: ICreateDeckDto }>, reply: FastifyReply) => {
  try {

    const authUser = (request as any)['authUser'];
    console.log('authUser', authUser);
    if (!authUser) throw ERRORS.unauthorizedAccess;
    let baseName = request.body.name?.trim() || 'Neues Deck';
    
    // Handle name collisions with suffix logic (1), (2), etc.
    let finalName = baseName;
    let suffix = 1;
    while (true) {
      const existing = await prisma.deck.findFirst({ 
        where: { ownerId: authUser.id, name: finalName } 
      });
      if (!existing) break;
      finalName = `${baseName} (${suffix})`;
      suffix++;
    }
    
    // Quota: decks per day (Europe/Berlin)
    const deckQuota = Number(process.env.QUOTA_DECKS_PER_DAY ?? '25');
    if (deckQuota > 0) {
      const now = new Date();
      const recent = new Date(now.getTime() - 48*60*60*1000);
      const created = await prisma.deck.findMany({ where: { ownerId: authUser.id, created_at: { gte: recent } }, select: { created_at: true } });
      const todayStr = todayStrBerlin(now);
      const todays = created.filter(d => todayStrBerlin(new Date(d.created_at as any)) === todayStr).length;
      if (todays >= deckQuota) throw new AppError(`Tageslimit erreicht: max. ${deckQuota} Decks pro Tag.`, 429);
    }
    const deck = await prisma.deck.create({ data: { name: finalName, ownerId: authUser.id } });
    return reply.code(STANDARD.CREATED.statusCode).send(deck);
  } catch (err) { return handleServerError(reply, err); }
};

export const listDecks = async (request: FastifyRequest<{ Querystring: PaginationParams }>, reply: FastifyReply) => {
  try {
    const authUser = getAuthUser(request);
    const { page, pageSize, skip } = parsePagination(request.query);
    
    const total = await prisma.deck.count({ where: { ownerId: authUser.id } });
    const decks = await prisma.deck.findMany({
      where: { ownerId: authUser.id },
      select: { id: true, name: true, version: true, copiedFromId: true, created_at: true, updated_at: true, _count: { select: { cards: true } }, sr: { select: { dayStr: true } } as any },
      orderBy: { updated_at: 'desc' }, skip, take: pageSize,
    } as any);
    
    const todayStr = todayStrBerlin();
    const mapped = decks.map((d: any) => ({
      id: d.id, name: d.name, version: d.version, copiedFromId: d.copiedFromId,
      isCopy: !!d.copiedFromId,
      originalDeckId: d.copiedFromId,
      created_at: d.created_at, updated_at: d.updated_at, cardsCount: d._count.cards,
      dueToday: (d.sr || []).some((s: any) => s.dayStr === todayStr),
    }));
    
    return reply.code(STANDARD.OK.statusCode).send(buildPaginatedResponse(mapped, total, { page, pageSize, skip }));
  } catch (err) { return handleServerError(reply, err); }
};

export const getDeck = async (request: FastifyRequest<{ Params: { deckId: string } }>, reply: FastifyReply) => {
  try {
    const authUser = getAuthUser(request);
    const deckId = parseInt(request.params.deckId, 10);
    const deck = await prisma.deck.findFirst({ where: { id: deckId, ownerId: authUser.id }, include: { cards: true } });
    if (!deck) throw new AppError('Deck not found', 404);
    return reply.code(STANDARD.OK.statusCode).send(deck);
  } catch (err) { return handleServerError(reply, err); }
};

export const renameDeck = async (request: FastifyRequest<{ Params: { deckId: string }; Body: IUpdateDeckNameDto }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const deckId = parseInt(request.params.deckId, 10);
    const deck = await assertOwnOriginalDeck(deckId, authUser.id);
    const updated = await prisma.deck.update({ where: { id: deck.id }, data: { name: request.body.name.trim(), version: { increment: 1 } } });
    return reply.code(STANDARD.OK.statusCode).send(updated);
  } catch (err) { return handleServerError(reply, err); }
};

export const deleteDeck = async (request: FastifyRequest<{ Params: { deckId: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const deckId = parseInt(request.params.deckId, 10);
    const deck = await assertOwnDeck(deckId, authUser.id);
    // delete card images
    const cards = await prisma.card.findMany({ where: { deckId: deck.id } });
    for (const c of cards) {
      try { if (c.questionImageUrl) unlinkSync(require('path').join(process.cwd(), 'public', c.questionImageUrl.replace(/^\//, ''))); } catch {}
      try { if (c.answerImageUrl) unlinkSync(require('path').join(process.cwd(), 'public', c.answerImageUrl.replace(/^\//, ''))); } catch {}
    }
    await prisma.deck.delete({ where: { id: deck.id } });
    return reply.code(STANDARD.NO_CONTENT.statusCode).send();
  } catch (err) { return handleServerError(reply, err); }
};

export const addCard = async (request: FastifyRequest<{ Params: { deckId: string }; Body: ICreateCardDto }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const deckId = parseInt(request.params.deckId, 10);
    const deck = await assertOwnOriginalDeck(deckId, authUser.id);
    // Quota: cards per day (Europe/Berlin)
    const cardQuota = Number(process.env.QUOTA_CARDS_PER_DAY ?? '400');
    if (cardQuota > 0) {
      const now = new Date();
      const recent = new Date(now.getTime() - 48*60*60*1000);
      const created = await prisma.card.findMany({ where: { created_at: { gte: recent }, deck: { ownerId: authUser.id } }, select: { created_at: true } });
      const todayStr = todayStrBerlin(now);
      const todays = created.filter(c => todayStrBerlin(new Date(c.created_at as any)) === todayStr).length;
      if (todays >= cardQuota) throw new AppError(`Tageslimit erreicht: max. ${cardQuota} Karten pro Tag.`, 429);
    }
    const card = await prisma.card.create({ data: { deckId: deck.id, question: request.body.question.trim(), answer: request.body.answer.trim(), questionImageUrl: request.body.questionImageUrl || null, answerImageUrl: request.body.answerImageUrl || null } });
    await prisma.deck.update({ where: { id: deck.id }, data: { version: { increment: 1 } } });
    return reply.code(STANDARD.CREATED.statusCode).send(card);
  } catch (err) { return handleServerError(reply, err); }
};

export const updateCard = async (request: FastifyRequest<{ Params: { cardId: string }; Body: IUpdateCardDto }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const cardId = parseInt(request.params.cardId, 10);
    const card = await prisma.card.findFirst({ where: { id: cardId }, include: { deck: true } });
    if (!card || card.deck.ownerId !== authUser.id) throw new AppError('Unauthorized or Card not found', 403);
    if (card.deck.copiedFromId) throw new AppError('Kopierte Decks können nicht bearbeitet werden', 403);
    const updated = await prisma.card.update({ where: { id: cardId }, data: {
      question: request.body.question?.trim() ?? card.question,
      answer: request.body.answer?.trim() ?? card.answer,
      questionImageUrl: request.body.questionImageUrl ?? card.questionImageUrl,
      answerImageUrl: request.body.answerImageUrl ?? card.answerImageUrl,
    }});
    await prisma.deck.update({ where: { id: card.deckId }, data: { version: { increment: 1 } } });
    return reply.code(STANDARD.OK.statusCode).send(updated);
  } catch (err) { return handleServerError(reply, err); }
};

export const deleteCard = async (request: FastifyRequest<{ Params: { cardId: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const cardId = parseInt(request.params.cardId, 10);
    const card = await prisma.card.findFirst({ where: { id: cardId }, include: { deck: true } });
    if (!card || card.deck.ownerId !== authUser.id) throw new AppError('Unauthorized or Card not found', 403);
    if (card.deck.copiedFromId) throw new AppError('Kopierte Decks können nicht bearbeitet werden', 403);
    // cleanup images
    try { if (card.questionImageUrl) unlinkSync(require('path').join(process.cwd(), 'public', card.questionImageUrl.replace(/^\//, ''))); } catch {}
    try { if (card.answerImageUrl) unlinkSync(require('path').join(process.cwd(), 'public', card.answerImageUrl.replace(/^\//, ''))); } catch {}
    await prisma.card.delete({ where: { id: cardId } });
    await prisma.deck.update({ where: { id: card.deckId }, data: { version: { increment: 1 } } });
    return reply.code(STANDARD.NO_CONTENT.statusCode).send();
  } catch (err) { return handleServerError(reply, err); }
};

/** SR: set days (Berlin dayStr) */
export const setSpacedRepetitionDays = async (request: FastifyRequest<{ Params: { deckId: string }; Body: { days: string[] } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const deckId = parseInt(request.params.deckId, 10);
    const deck = await assertOwnOriginalDeck(deckId, authUser.id);
    const inputDays = (request.body.days || []).map(d => new Date(d));
    if (inputDays.some(d => isNaN(d.getTime()))) throw new AppError('Ungültige Datumsangabe', 400);
    await prisma.spacedRepetitionDay.deleteMany({ where: { deckId: deck.id } });
    if (inputDays.length > 0) await prisma.spacedRepetitionDay.createMany({ data: inputDays.map(d => ({ deckId: deck.id, day: d, dayStr: toBerlinDateStr(d) })) });
    await prisma.deck.update({ where: { id: deck.id }, data: { version: { increment: 1 } } });
    return reply.code(STANDARD.OK.statusCode).send({ ok: true });
  } catch (err) { return handleServerError(reply, err); }
};

export const listDecksWithDueToday = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const todayStr = todayStrBerlin();
    const decks: any = await prisma.deck.findMany({
      where: { ownerId: authUser.id },
      select: { id: true, name: true, version: true, copiedFromId: true, created_at: true, updated_at: true, _count: { select: { cards: true } }, sr: { select: { dayStr: true } } },
      orderBy: { updated_at: 'desc' },
    });
    const mapped = decks.map((d: any) => ({
      id: d.id, name: d.name, version: d.version, copiedFromId: d.copiedFromId,
      isCopy: !!d.copiedFromId,
      originalDeckId: d.copiedFromId,
      
      created_at: d.created_at, updated_at: d.updated_at, cardsCount: d._count.cards,
      dueToday: (d.sr || []).some((s: any) => s.dayStr === todayStr),
    }));
    return reply.code(STANDARD.OK.statusCode).send(mapped);
  } catch (err) { return handleServerError(reply, err); }
};


export const renameDeckAlias = async (request: FastifyRequest<{ Params: { deckId: string }; Body: { name: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const deckId = parseInt(request.params.deckId, 10);
    const deck = await prisma.deck.findFirst({ where: { id: deckId, ownerId: authUser.id } });
    if (!deck) throw new AppError('Deck nicht gefunden', 404);
    if (!deck.copiedFromId) throw new AppError('Nur Kopien können als Alias umbenannt werden', 403);
    const newName = (request.body.name || '').trim();
    if (!newName || newName.length < 3 || newName.length > 100) throw new AppError('Ungültiger Name', 400);
    const updated = await prisma.deck.update({ where: { id: deck.id }, data: { name: newName } });
    return reply.code(STANDARD.OK.statusCode).send(updated);
  } catch (err) { return handleServerError(reply, err); }
};
