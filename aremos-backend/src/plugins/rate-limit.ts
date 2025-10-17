import { FastifyPluginCallback } from 'fastify';
type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();
function key(scope: string, ip: string) { return `${scope}:${ip}`; }
function allow(scope: string, ip: string, limit: number, windowMs: number): { ok: boolean; remaining: number; reset: number } {
  const k = key(scope, ip); const now = Date.now(); let b = buckets.get(k);
  if (!b || b.reset <= now) { b = { count: 0, reset: now + windowMs }; buckets.set(k, b); }
  if (b.count >= limit) return { ok: false, remaining: 0, reset: b.reset }; b.count += 1;
  return { ok: true, remaining: Math.max(0, limit - b.count), reset: b.reset };
}

// Cleanup expired buckets every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.reset <= now) buckets.delete(key);
  }
}, 5 * 60 * 1000);
export const rateLimit: FastifyPluginCallback = (fastify, _opts, done) => {
  // Global rate limit middleware (150 requests per minute per IP)
  fastify.addHook('preHandler', async (req, reply) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
    const res = allow('global', ip, 150, 60000); // 150 requests per minute
    reply.header('X-RateLimit-Global-Remaining', res.remaining);
    reply.header('X-RateLimit-Global-Reset', res.reset);
    if (!res.ok) {
      return reply.code(429).send({ message: 'Too Many Requests - Global Limit Exceeded' });
    }
  });

  // Per-route rate limit decorator
  fastify.decorate('rateLimit', (scope: string, limit: number, windowMs: number) => {
    return async (req: any, reply: any) => {
      const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
      const res = allow(scope, ip, limit, windowMs);
      reply.header('X-RateLimit-Remaining', res.remaining);
      reply.header('X-RateLimit-Reset', res.reset);
      if (!res.ok) return reply.code(429).send({ message: 'Too Many Requests' });
    }
  });
  done();
};
declare module 'fastify' { interface FastifyInstance { rateLimit(scope: string, limit: number, windowMs: number): any; } }