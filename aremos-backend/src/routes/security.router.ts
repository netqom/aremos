import { FastifyInstance } from 'fastify';

function randomToken(len = 32) {
  const bytes = require('crypto').randomBytes(len);
  return bytes.toString('base64url');
}

async function securityRouter(fastify: FastifyInstance) {
  fastify.get('/csrf', async (req: any, reply) => {
    if (process.env.USE_COOKIE_AUTH !== 'true') {
      return reply.code(404).send({ message: 'Not enabled' });
    }
    const token = randomToken(32);
    // Non-HttpOnly so client JS can read and send via header (double-submit pattern)
    // Set cookie manually via header (Fastify doesn't have setCookie without plugin)
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    reply.header('Set-Cookie', `csrf_token=${token}; path=/; SameSite=lax; HttpOnly=false${secure}; Max-Age=3600`);
    return reply.send({ csrfToken: token });
  });
}
export default securityRouter;