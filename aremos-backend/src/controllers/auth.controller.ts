import { FastifyReply, FastifyRequest } from 'fastify';
import * as JWT from 'jsonwebtoken';
import { signAccessToken } from '../utils/auth-tokens';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../utils';
import { ERRORS, handleServerError, AppError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { IRegisterDto, ILoginDto } from '../schemas/Auth';

const loginAttempts = new Map<string, { count: number; until?: number }>();
const MAX_ATTEMPTS = 10;
const LOCK_MS = 30 * 60 * 1000;

function keyFor(req: FastifyRequest, name: string) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
  return `${ip}:${name}`;
}
function assertNotLocked(req: FastifyRequest, name: string) {
  const entry = loginAttempts.get(keyFor(req, name));
  if (entry && entry.until && Date.now() < entry.until) throw new AppError('Zu viele Fehlversuche – bitte später erneut versuchen', 429);
}
function registerFailure(req: FastifyRequest, name: string) {
  const key = keyFor(req, name);
  const entry = loginAttempts.get(key) || { count: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) { entry.until = Date.now() + LOCK_MS; entry.count = 0; }
  loginAttempts.set(key, entry);
}
function resetFailures(req: FastifyRequest, name: string) {
  loginAttempts.delete(keyFor(req, name));
}
async function checkLicense(code: string) {
  const hash = process.env.LICENSE_CODE_HASH;
  if (hash) return await bcrypt.compare(code, hash);
  // Fallback: direct comparison with exact license code
  return code === '1185131519';
}

export const register = async (request: FastifyRequest<{ Body: IRegisterDto }>, reply: FastifyReply) => {
  const { name, password, code } = request.body;
  try {
    const ok = await checkLicense(code);

    
    if (!ok) return reply.code(400).send({ message: 'Registrierung fehlgeschlagen dd', field: 'licenseCode' });
    const exists = await prisma.user.findUnique({ where: { name } }); 
    if (exists) return reply.code(409).send({ message: 'Registrierung fehlgeschlagen', field: 'name' });
    const hashed = await bcrypt.hash(password, 12);
    console.log('hashed', hashed);
    const user = await prisma.user.create({ data: { name, password: hashed } });

    console.log('user', user);
    const token = signAccessToken({ id: user.id, name: user.name, tokenVersion: 0 });
    return reply.code(STANDARD.CREATED.statusCode).send({ accessToken: token, user: { id: user.id, name: user.name } });
  } catch (err) {

    console.log('err', err);
    return handleServerError(reply, err);
  }
};

export const login = async (request: FastifyRequest<{ Body: ILoginDto }>, reply: FastifyReply) => {
  const { name, password, code } = request.body;
  try {
    assertNotLocked(request, name);
    const user = await prisma.user.findUnique({ where: { name } });
    console.log('user', user);
    if (!user) { registerFailure(request, name); return reply.code(404).send({ message: 'Login fehlgeschlagen', field: 'name' }); }
    const codeOk = await checkLicense(code);
    if (!codeOk) { registerFailure(request, name); return reply.code(401).send({ message: 'Login fehlgeschlagen', field: 'licenseCode' }); }
    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) { registerFailure(request, name); return reply.code(401).send({ message: 'Login fehlgeschlagen', field: 'password' }); }
    resetFailures(request, name);
    const token = signAccessToken({ id: user.id, name: user.name, tokenVersion: 0 });
    return reply.code(STANDARD.OK.statusCode).send({ accessToken: token, user: { id: user.id, name: user.name } });
  } catch (err) { return handleServerError(reply, err); }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = (request.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
    if (token) {
      const decoded: any = JWT.decode(token);
      const jti = decoded?.jti; const exp = decoded?.exp;
      if (jti && exp && typeof (request.server as any).blacklistToken === 'function') {
        (request.server as any).blacklistToken(jti, exp);
      }
    }
    return reply.code(STANDARD.OK.statusCode).send({ message: 'OK' });
  } catch (err) { return handleServerError(reply, err); }
};
export const deleteAccount = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser'];
    if (!authUser) throw ERRORS.unauthorizedAccess;
    
    // Deep cleanup: delete all user data and associated files
    const userId = authUser.id;
    
    // 1. Delete local uploaded files
    try {
      const fs = require('fs'); 
      const path = require('path');
      const dir = path.join(process.cwd(), 'public', 'uploads', 'cards', String(userId));
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    } catch {}
    
    // 2. Delete notifications
    await prisma.notification.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.systemNotification.deleteMany({ where: { userId } }).catch(() => {});
    
    // 3. Delete classroom memberships
    await prisma.classroomMembership.deleteMany({ where: { userId } }).catch(() => {});
    
    // 4. Delete owned classrooms (cascades to classroom decks)
    const ownedClassrooms = await prisma.classroom.findMany({ where: { ownerId: userId } });
    for (const classroom of ownedClassrooms) {
      await prisma.classroom.delete({ where: { id: classroom.id } }).catch(() => {});
    }
    
    // 5. Delete owned decks with their cards and images
    const ownedDecks = await prisma.deck.findMany({ where: { ownerId: userId } });
    for (const deck of ownedDecks) {
      // Delete card images
      const cards = await prisma.card.findMany({ where: { deckId: deck.id } });
      for (const card of cards) {
        try { 
          if (card.questionImageUrl) {
            require('fs').unlinkSync(require('path').join(process.cwd(), 'public', card.questionImageUrl.replace(/^\//, '')));
          }
        } catch {}
        try { 
          if (card.answerImageUrl) {
            require('fs').unlinkSync(require('path').join(process.cwd(), 'public', card.answerImageUrl.replace(/^\//, '')));
          }
        } catch {}
      }
      // Delete deck (cascades to cards, SR days, etc.)
      await prisma.deck.delete({ where: { id: deck.id } }).catch(() => {});
    }
    
    // 6. Delete learning sessions
    await prisma.learningSession.deleteMany({ where: { userId } }).catch(() => {});
    
    // 7. Finally delete the user
    await prisma.user.delete({ where: { id: userId } });
    
    return reply.code(STANDARD.OK.statusCode).send({ message: 'Account gelöscht' });
  } catch (err) { return handleServerError(reply, err); }
};

export const tokenInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) return reply.code(STANDARD.UNAUTHORIZED.statusCode).send(ERRORS.unauthorizedAccess);
    const token = (request.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
    const decoded: any = JWT.decode(token) || {};
    return reply.code(STANDARD.OK.statusCode).send({ exp: decoded.exp || null, jti: decoded.jti || null, tokenVersion: decoded.tokenVersion ?? null });
  } catch (err) { return handleServerError(reply, err); }
};

export const logoutAll = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) return reply.code(STANDARD.UNAUTHORIZED.statusCode).send(ERRORS.unauthorizedAccess);
    await prisma.user.update({ where: { id: authUser.id }, data: { tokenVersion: { increment: 1 } } });
    return reply.code(STANDARD.OK.statusCode).send({ ok: true });
  } catch (err) { return handleServerError(reply, err); }
};
