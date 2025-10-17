import { FastifyReply, FastifyRequest } from 'fastify';
import { ERRORS } from './errors.helper';
import { AuthUser } from '../types/auth.types';

export function checkValidRequest(req: FastifyRequest, reply: FastifyReply) {
  // Assumes authHardening plugin has set req['authUser'] when needed
  // If an authenticated route is hit without authUser, we block
  // console.log('checkValidRequest: Checking auth for', req.url);
  // console.log('checkValidRequest:  REs', req);
  const user = (req as any)['authUser'] as AuthUser | undefined;
  console.log('checkValidRequest: user', user);
  console.log('checkValidRequest: Checking auth for', req.url, 'user exists:', !!user);
  if (!user) {
    console.log('checkValidRequest: No user found, throwing unauthorized');
    throw ERRORS.unauthorizedAccess;
  }
  return true;
}

/**
 * Type guard to get authenticated user from request
 */
export function getAuthUser(req: FastifyRequest): AuthUser {
  const user = (req as any)['authUser'] as AuthUser | undefined;
  if (!user) throw ERRORS.unauthorizedAccess;
  return user;
}
