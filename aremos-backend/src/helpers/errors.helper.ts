import { FastifyReply } from 'fastify';
export class AppError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 400, code?: string) { super(message); this.status = status; this.code = code; }
}
export const ERRORS = {
  unauthorizedAccess: new AppError('Nicht autorisiert', 401, 'UNAUTHORIZED'),
  forbidden: new AppError('Verboten', 403, 'FORBIDDEN'),
  notFound: new AppError('Nicht gefunden', 404, 'NOT_FOUND'),
  tooManyRequests: new AppError('Zu viele Anfragen', 429, 'RATE_LIMIT'),
  badRequest: new AppError('Ungültige Anfrage', 400, 'BAD_REQUEST'),
};
export function handleServerError(reply: FastifyReply, err: any) {
  const status = err?.status || 500;
  const message = err?.message || 'Interner Serverfehler';
  reply.status(status).send({ ok: false, error: message, code: err?.code || 'SERVER_ERROR' });
}
