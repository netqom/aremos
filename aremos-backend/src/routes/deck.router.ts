import { FastifyInstance } from 'fastify';
import { utils } from '../utils';
import { checkValidRequest } from '../helpers/auth.helper';
import { createDeckSchema, updateDeckNameSchema, createCardSchema, updateCardSchema, updateAliasNameSchema } from '../schemas/Deck';
import { addCard, createDeck, deleteCard, deleteDeck, getDeck, listDecks, renameDeck, updateCard, setSpacedRepetitionDays, listDecksWithDueToday, renameDeckAlias } from '../controllers/deck.controller';

async function deckRouter(fastify: FastifyInstance) {
  const auth = { preHandler: [checkValidRequest] };
  fastify.post('/', { ...auth, preValidation: utils.preValidation(createDeckSchema) }, createDeck);
  fastify.get('/', auth, listDecks);
  fastify.get('/:deckId', auth, getDeck);
  fastify.patch('/:deckId', { ...auth, preValidation: utils.preValidation(updateDeckNameSchema) }, renameDeck);
  fastify.patch('/:deckId/alias-name', { ...auth, preValidation: utils.preValidation(updateAliasNameSchema) }, renameDeckAlias);
  fastify.delete('/:deckId', auth, deleteDeck);
  fastify.post('/:deckId/cards', { ...auth, preValidation: utils.preValidation(createCardSchema) }, addCard);
  fastify.put('/cards/:cardId', { ...auth, preValidation: utils.preValidation(updateCardSchema) }, updateCard);
  fastify.delete('/cards/:cardId', auth, deleteCard);
  fastify.post('/:deckId/sr', { ...auth }, setSpacedRepetitionDays);
  fastify.get('/with-due', auth, listDecksWithDueToday);
}
export default deckRouter;