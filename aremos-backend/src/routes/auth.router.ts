import { FastifyInstance } from 'fastify';
import { utils } from '../utils';
import { loginSchema, registerSchema } from '../schemas/Auth';
import { deleteAccount, login, logout, register, tokenInfo, logoutAll } from '../controllers/auth.controller';
import { checkValidRequest } from '../helpers/auth.helper';

async function authRouter(fastify: FastifyInstance) {
  // Register endpoint
  fastify.post('/register', { 
    preHandler: [fastify.rateLimit('register', 5, 60000)],
    schema: { 
      body: { 
        type: 'object', 
        required: ['name','password','code'], 
        properties: { 
          name: { type: 'string', minLength: 3 }, 
          password: { type: 'string', minLength: 6 }, 
          code: { type: 'string', minLength: 10, maxLength: 10 } 
        } 
      } 
    }, 
    preValidation: utils.preValidation(registerSchema) 
  }, register);
  
  // Login endpoint
  fastify.post('/login', { 
    preHandler: [fastify.rateLimit('login', 10, 60000)],
    schema: { 
      body: { 
        type: 'object', 
        required: ['name','password','code'], 
        properties: { 
          name: { type: 'string', minLength: 3 }, 
          password: { type: 'string', minLength: 6 }, 
          code: { type: 'string', minLength: 10, maxLength: 10 } 
        } 
      } 
    }, 
    preValidation: utils.preValidation(loginSchema) 
  }, login);

  // Protected endpoints (require authentication)
  fastify.post('/logout', { preHandler: checkValidRequest }, logout);
  fastify.post('/logout-all', { preHandler: checkValidRequest }, logoutAll);
  fastify.get('/token-info', { preHandler: checkValidRequest }, tokenInfo);
  fastify.delete('/account', { preHandler: checkValidRequest }, deleteAccount);
}

export default authRouter;