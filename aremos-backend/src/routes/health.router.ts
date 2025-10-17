import { FastifyInstance } from 'fastify';
import { checkValidRequest } from '../helpers/auth.helper';
async function healthRouter(fastify: FastifyInstance) {
  fastify.get('/health', async (_req, reply) => reply.send({ ok: true }));
  fastify.get('/auth/me', { preHandler: [checkValidRequest] }, async (req: any, reply) => {
    const user = req.authUser || null;
    return reply.send({ user: user ? { id: user.id, name: user.name } : null });
  });
}
export default healthRouter;