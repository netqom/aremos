import { FastifyInstance } from 'fastify';
import { utils } from '../utils';
import { checkValidRequest } from '../helpers/auth.helper';
import { createSessionSchema } from '../schemas/Insights';
import { createSession, getInsightsForOriginalDeck } from '../controllers/insights.controller';
async function insightsRouter(fastify: FastifyInstance) {
  const auth = { preHandler: [checkValidRequest] };
  fastify.post('/sessions', { ...auth, preValidation: utils.preValidation(createSessionSchema) }, createSession);
  fastify.get('/decks/:originalDeckId', auth, getInsightsForOriginalDeck);
}
export default insightsRouter;