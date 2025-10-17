import { FastifyInstance } from 'fastify';
import { checkValidRequest } from '../helpers/auth.helper';
import { createClassroom, listClassrooms, updateClassroom, deleteClassroom, addMember, removeMember, attachDeck } from '../controllers/classroom.controller';
async function classroomRouter(fastify: FastifyInstance) {
  const auth = { preHandler: [checkValidRequest] };
  fastify.post('/', auth, createClassroom);
  fastify.get('/', auth, listClassrooms);
  fastify.patch('/:classroomId', auth, updateClassroom);
  fastify.delete('/:classroomId', auth, deleteClassroom);
  fastify.post('/:classroomId/members', auth, addMember);
  fastify.delete('/:classroomId/members/:userId', auth, removeMember);
  fastify.post('/:classroomId/decks', auth, attachDeck);
}
export default classroomRouter;