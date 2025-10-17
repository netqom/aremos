import { FastifyInstance } from 'fastify';
import { checkValidRequest } from '../helpers/auth.helper';
import { listNotifications, markRead, markReadSystem } from '../controllers/notification.controller';
async function notificationRouter(fastify: FastifyInstance) {
  const auth = { preHandler: [checkValidRequest] };
  fastify.get('/', auth, listNotifications);
  fastify.post('/:id/read', auth, markRead);
  fastify.post('/system/:id/read', auth, markReadSystem);
}
export default notificationRouter;