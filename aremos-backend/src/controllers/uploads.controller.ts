import { FastifyReply, FastifyRequest } from 'fastify';
import { ERRORS, handleServerError, AppError } from '../helpers/errors.helper';
import { prisma } from '../utils';
import * as path from 'path';
import { ensureDir, saveMultipartFileToLocal, deleteLocalFile } from '../storage/storage.adapter';
import { uploadToSupabase } from '../storage/supabase.adapter';

const PUBLIC_ROOT = path.join(process.cwd(), 'public');
const UPLOADS_ROOT = path.join(PUBLIC_ROOT, 'uploads', 'cards');

export const uploadImage = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;

    const file: any = await (request as any).file();

    // Validate size (<=10MB) and mime (jpg/png/webp)
    const MAX = 10 * 1024 * 1024;
    const allowed = ['image/jpeg','image/png','image/webp'];
    if (!file) throw new AppError('Keine Datei empfangen', 400);
    const mime = (file.mimetype || '').toLowerCase();
    if (!allowed.includes(mime)) throw new AppError('Dateityp nicht erlaubt (nur JPG/PNG/WebP)', 400);
    if ((file.file?.truncated || 0)) throw new AppError('Datei zu groß (max. 10 MB)', 400);

    const deckId = Number((request.body as any)?.deckId);
    const slot = String((request.body as any)?.slot || 'question');
    if (!deckId || (slot!=='question' && slot!=='answer')) throw new AppError('Ungültige Parameter', 400);

    const driver = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
    if (driver === 'supabase') {
      const res = await uploadToSupabase(file);
      return reply.send({ ok: true, url: res.url });
    }

    // local
    const dir = path.join(UPLOADS_ROOT, String(authUser.id), String(deckId), slot);
    ensureDir(dir);
    const saved = await saveMultipartFileToLocal(file, dir);
    const publicUrl = `/uploads/cards/${authUser.id}/${deckId}/${slot}/${saved.filename}`;
    reply.send({ ok: true, url: publicUrl });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const uploadImageAndSetOnCard = async (request: FastifyRequest<{ Params: { deckId: string; cardId: string }; Querystring: { side?: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    
    const deckId = parseInt(request.params.deckId, 10);
    const cardId = parseInt(request.params.cardId, 10);
    const side = (request.query as any)?.side || 'question'; // 'question' or 'answer'
    
    // Verify ownership
    const deck = await prisma.deck.findFirst({ where: { id: deckId, ownerId: authUser.id } });
    if (!deck) throw new AppError('Deck nicht gefunden oder keine Berechtigung', 404);
    
    const card = await prisma.card.findFirst({ where: { id: cardId, deckId } });
    if (!card) throw new AppError('Karte nicht gefunden', 404);

    const file: any = await (request as any).file();
    const MAX = 10 * 1024 * 1024;
    const allowed = ['image/jpeg','image/png','image/webp'];
    if (!file) throw new AppError('Keine Datei empfangen', 400);
    if (file._buf && file._buf.length > MAX) throw new AppError('Datei zu groß (max. 10 MB)', 400);
    if (!allowed.includes(file.mimetype)) throw new AppError('Dateityp nicht erlaubt (nur JPG/PNG/WebP)', 400);

    const STORAGE_DRIVER = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
    let publicUrl: string;

    if (STORAGE_DRIVER === 'supabase') {
      const uploadResult = await uploadToSupabase(file);
      publicUrl = uploadResult.url;
    } else {
      await ensureDir(UPLOADS_ROOT);
      const filename = `card-${cardId}-${side}-${Date.now()}.${file.mimetype.split('/')[1]}`;
      const localPath = path.join(UPLOADS_ROOT, filename);
      await saveMultipartFileToLocal(file, localPath);
      publicUrl = `/uploads/cards/${filename}`;
    }

    // Update card with image URL based on side
    const updateData = side === 'answer' 
      ? { answerImageUrl: publicUrl }
      : { questionImageUrl: publicUrl };
      
    await prisma.card.update({
      where: { id: cardId },
      data: updateData
    });

    reply.send({ ok: true, url: publicUrl });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const deleteImageFromCard = async (request: FastifyRequest<{ Params: { deckId: string; cardId: string }; Querystring: { side?: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    
    const deckId = parseInt(request.params.deckId, 10);
    const cardId = parseInt(request.params.cardId, 10);
    const side = (request.query as any)?.side || 'both'; // 'question', 'answer', or 'both'
    
    // Verify ownership
    const deck = await prisma.deck.findFirst({ where: { id: deckId, ownerId: authUser.id } });
    if (!deck) throw new AppError('Deck nicht gefunden oder keine Berechtigung', 404);
    
    const card = await prisma.card.findFirst({ where: { id: cardId, deckId } });
    if (!card) throw new AppError('Karte nicht gefunden', 404);

    // Remove image URLs based on side
    let updateData: any = {};
    if (side === 'question' || side === 'both') {
      updateData.questionImageUrl = null;
    }
    if (side === 'answer' || side === 'both') {
      updateData.answerImageUrl = null;
    }
    
    await prisma.card.update({
      where: { id: cardId },
      data: updateData
    });

    reply.send({ ok: true });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
