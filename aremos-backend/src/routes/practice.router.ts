import { FastifyInstance } from 'fastify';
import { checkValidRequest } from '../helpers/auth.helper';
import {
  startSession,
  getSessionStatus,
  answerPractice,
  finishPractice,
  endSession,
} from '../controllers/practice.controller';

async function practiceRouter(fastify: FastifyInstance) {
  // All practice endpoints require authentication
  // Start a session for a given deck
  fastify.post('/:deckId/start', {
    preHandler: [fastify.rateLimit('practice', 100, 60000), checkValidRequest],
  }, startSession);

  // Get status for a session
  fastify.get('/:sessionId/status', {
    preHandler: checkValidRequest,
  }, getSessionStatus);

  // Submit an answer and get the next card
  fastify.post('/:sessionId/answer', {
    preHandler: [fastify.rateLimit('practice', 100, 60000), checkValidRequest],
  }, answerPractice);

  // Finish a session and persist insights
  fastify.post('/:sessionId/finish', {
    preHandler: checkValidRequest,
  }, finishPractice);

  // End a session without saving
  fastify.post('/:sessionId/end', {
    preHandler: checkValidRequest,
  }, endSession);
}

export default practiceRouter;