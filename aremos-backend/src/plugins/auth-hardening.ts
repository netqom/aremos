import { FastifyPluginCallback } from 'fastify';
import * as JWT from 'jsonwebtoken';
import { prisma } from '../utils';

export const authHardening: FastifyPluginCallback = (fastify, _opts, done) => {
  console.log('Auth hardening plugin: Starting registration...');
  fastify.addHook('onRequest', async (req, reply) => {
    console.log('Auth hardening plugin: Hook called for', req.url);
    try {
      const auth = (req.headers['authorization'] || '').toString();
      console.log('Auth hardening: Processing request for', req.url, 'auth header exists:', !!auth);
      if (!auth.startsWith('Bearer ')) {
        console.log('Auth hardening: No Bearer token, skipping for', req.url);
        return; // only act on auth routes
      }
      const token = auth.replace(/^Bearer\s+/i, '');
      
      console.log('Auth hardening: Processing token for', req.url);
      console.log('Token preview:', token.substring(0, 20) + '...');
      
      // JWT verification
      console.log('Auth hardening: JWT secret exists:', !!process.env.APP_JWT_SECRET);
      const decoded: any = JWT.verify(token, process.env.APP_JWT_SECRET as string);
      console.log('Auth hardening: JWT decoded successfully:', !!decoded);
      
      // Optional expiry check (additional to JWT.verify built-in check)
      if (process.env.ENABLE_ADDITIONAL_EXPIRY_CHECK === 'true') {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
          return reply.code(401).send({ message: 'Token expired' });
        }
      }
      
      // Version check (logout-all support)
      console.log('Auth hardening: Looking up user with id:', decoded.id);
      const user = await prisma.user.findUnique({ 
        where: { id: decoded.id }, 
        select: { id: true, tokenVersion: true } 
      });
      console.log('Auth hardening: User found:', !!user);
      if (!user) {
        console.log('Auth hardening: User not found in database');
        return reply.code(401).send({ message: 'Unauthorized' });
      }
      if ((user as any).tokenVersion !== (decoded.tokenVersion ?? 0)) {
        console.log('Auth hardening: Token version mismatch');
        return reply.code(401).send({ message: 'Token ungültig (Version)' });
      }
      
      // JTI blacklist check (if plugin registered)
      const jti = decoded.jti;
      const isBlacklisted = (typeof (req.server as any).isTokenBlacklisted === 'function') 
        ? (req.server as any).isTokenBlacklisted(jti) 
        : false;
      if (jti && isBlacklisted) return reply.code(401).send({ message: 'Token widerrufen' });
      
      // Set authUser for controllers
      (req as any)['authUser'] = user;
      console.log('Auth hardening: Set authUser for', req.url, 'user:', user.id);
      
      // Update lastActiveAt (best-effort)
      await prisma.user.update({ 
        where: { id: user.id }, 
        data: { lastActiveAt: new Date() } 
      }).catch(() => {});
      
    } catch (e) {
      // if verification fails, let existing auth guard handle it later
      console.log('Auth hardening: JWT verification failed for', req.url, 'error:', e.message);
    }
  });
  console.log('Auth hardening plugin: Hook registered, calling done()');
  done();
};