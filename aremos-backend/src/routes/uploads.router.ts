import { FastifyInstance } from 'fastify';
import { checkValidRequest } from '../helpers/auth.helper';
import { uploadImageAndSetOnCard, deleteImageFromCard } from '../controllers/uploads.controller';

async function uploadsRouter(fastify: FastifyInstance) {
  // Upload image to card
  fastify.post('/decks/:deckId/cards/:cardId/image', {
    preHandler: [fastify.rateLimit('uploads', 20, 60000), checkValidRequest]
  }, uploadImageAndSetOnCard);

  // Delete image from card
  fastify.delete('/decks/:deckId/cards/:cardId/image', {
    preHandler: checkValidRequest
  }, deleteImageFromCard);
}

export default uploadsRouter;