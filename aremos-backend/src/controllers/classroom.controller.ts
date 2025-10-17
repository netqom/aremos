import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { ERRORS, handleServerError, AppError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';

/** Helper: copy original deck (with cards & SR) to a target user if not existing for this version */
async function copyDeckToUser(originalDeckId: number, targetUserId: number) {
  const original: any = await prisma.deck.findUnique({ where: { id: originalDeckId }, include: { cards: true, sr: true } as any });
  if (!original) throw new Error('Original deck not found');
  
  // Check if this specific version already exists for the user
  const exists = await prisma.deck.findFirst({ 
    where: { 
      ownerId: targetUserId, 
      copiedFromId: originalDeckId,
      version: original.version 
    } 
  });
  if (exists) return;
  
  const newDeck = await prisma.deck.create({ data: { name: original.name, version: original.version, ownerId: targetUserId, copiedFromId: original.id } });
  if (original.cards?.length) await prisma.card.createMany({ data: original.cards.map((c: any) => ({ deckId: newDeck.id, question: c.question, answer: c.answer, questionImageUrl: c.questionImageUrl, answerImageUrl: c.answerImageUrl })) });
  if (original.sr?.length) await prisma.spacedRepetitionDay.createMany({ data: original.sr.map((s: any) => ({ deckId: newDeck.id, day: s.day, dayStr: s.dayStr })) });
}

export const createClassroom = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const classroom = await prisma.classroom.create({ data: { name: 'neuer classroom', ownerId: authUser.id, description: 'Standardlektionstext' } });
    await prisma.classroomMembership.create({ data: { userId: authUser.id, classroomId: classroom.id } });
    return reply.code(STANDARD.CREATED.statusCode).send(classroom);
  } catch (err) { return handleServerError(reply, err); }
};
export const listClassrooms = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const page = Math.max(1, parseInt(String((request.query as any)?.page || '1'), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String((request.query as any)?.pageSize || '20'), 10)));
    const skip = (page - 1) * pageSize;
    const total = await prisma.classroomMembership.count({ where: { userId: authUser.id } });
    const memberships = await prisma.classroomMembership.findMany({ where: { userId: authUser.id }, include: { classroom: true }, orderBy: { classroomId: 'desc' }, skip, take: pageSize });
    return reply.code(STANDARD.OK.statusCode).send({ items: memberships.map(m => m.classroom), total, page, pageSize });
  } catch (err) { return handleServerError(reply, err); }
};
export const updateClassroom = async (request: FastifyRequest<{ Params: { classroomId: string }; Body: { name?: string; description?: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; const classroomId = parseInt(request.params.classroomId, 10);
    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.ownerId !== authUser.id) throw new AppError('Not found or not owner', 403);
    const updated = await prisma.classroom.update({ where: { id: classroomId }, data: { name: request.body.name ?? classroom.name, description: request.body.description ?? classroom.description } });
    return reply.code(STANDARD.OK.statusCode).send(updated);
  } catch (err) { return handleServerError(reply, err); }
};
export const deleteClassroom = async (request: FastifyRequest<{ Params: { classroomId: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; const classroomId = parseInt(request.params.classroomId, 10);
    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.ownerId !== authUser.id) throw new AppError('Not found or not owner', 403);
    await prisma.classroom.delete({ where: { id: classroomId } });
    return reply.code(STANDARD.NO_CONTENT.statusCode).send();
  } catch (err) { return handleServerError(reply, err); }
};
export const addMember = async (request: FastifyRequest<{ Params: { classroomId: string }; Body: { name: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; const classroomId = parseInt(request.params.classroomId, 10);
    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.ownerId !== authUser.id) throw new AppError('Not owner', 403);
    const user = await prisma.user.findUnique({ where: { name: request.body.name } });
    if (!user) throw new AppError('User not found', 404);
    await prisma.$transaction(async (tx) => {
      await tx.classroomMembership.create({ data: { userId: user.id, classroomId } });
      const clsDecks = await tx.classroomDeck.findMany({ where: { classroomId } });
      for (const d of clsDecks) { await copyDeckToUser(d.deckId, user.id); }
    });
    return reply.code(STANDARD.CREATED.statusCode).send({ ok: true });
  } catch (err) { return handleServerError(reply, err); }
};
export const removeMember = async (request: FastifyRequest<{ Params: { classroomId: string; userId: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; const classroomId = parseInt(request.params.classroomId, 10); const userId = parseInt(request.params.userId, 10);
    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.ownerId !== authUser.id) throw new AppError('Not owner', 403);
    await prisma.classroomMembership.deleteMany({ where: { classroomId, userId } });
    return reply.code(STANDARD.NO_CONTENT.statusCode).send();
  } catch (err) { return handleServerError(reply, err); }
};
export const attachDeck = async (request: FastifyRequest<{ Params: { classroomId: string }; Body: { deckId: number } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; const classroomId = parseInt(request.params.classroomId, 10);
    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.ownerId !== authUser.id) throw new AppError('Not owner', 403);
    const deckId = request.body.deckId;
    await prisma.$transaction(async (tx) => {
      await tx.classroomDeck.create({ data: { classroomId, deckId } });
      const members = await tx.classroomMembership.findMany({ where: { classroomId } });
      for (const m of members) { await copyDeckToUser(deckId, m.userId); }
    });
    return reply.code(STANDARD.CREATED.statusCode).send({ ok: true });
  } catch (err) { return handleServerError(reply, err); }
};