// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Auto-generated robust bootstrap with DB/Storage toggles (memory/prisma, local/supabase)
import fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import * as JWT from 'jsonwebtoken';
import { prisma } from './utils';

// Environment variables loaded successfully
console.log('Environment check: APP_JWT_SECRET exists:', !!process.env.APP_JWT_SECRET);

// Test database connection
console.log('Testing database connection...');
prisma.$connect().then(() => {
  console.log('Database connected successfully');
}).catch((e) => {
  console.error('Database connection failed:', e.message);
});

// Ensure default timezone
process.env.TZ = process.env.TZ || 'Europe/Berlin';
import practiceRouter from './routes/practice.router';
import authRouter from './routes/auth.router';
import deckRouter from './routes/deck.router';
import classroomRouter from './routes/classroom.router';
import notificationRouter from './routes/notification.router';
import uploadsRouter from './routes/uploads.router';
import insightsRouter from './routes/insights.router';
import securityRouter from './routes/security.router';
import healthRouter from './routes/health.router';
import * as fastifyRateLimit from '@fastify/rate-limit'; // 👈 Import the official plugin 
import { jwtBlacklist } from './plugins/jwt-blacklist';
import { authHardening } from './plugins/auth-hardening';
import { cronWiring } from './plugins/cron-wiring';
// import { rateLimit } from './plugins/rate-limit';

// Strict CORS guard in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.FRONTEND_ORIGIN || process.env.FRONTEND_ORIGIN.trim() === '') {
    throw new Error('FRONTEND_ORIGIN required in production');
  }
}

export const app = fastify({ logger: true });

// CORS Configuration
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [frontendOrigin] 
  : [
      'http://localhost:3000',
      'https://localhost:3000',
      // Add your ngrok frontend URL here
      'https://6a59dc055575.ngrok-free.app'
    ];

app.register(cors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});

// Rate limit + Multipart
// app.register(rateLimit);
// Rate limit + Multipart
app.register(fastifyRateLimit, {
  global: true, // Apply to all routes unless overwritten
  max: 100,
  timeWindow: '1 minute',
  // You can also pass a Redis instance here for multi-process environments
}); // ✅ This registers the official plugin and adds the missing function
app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

// Security / Auth plugins
console.log('Registering auth plugins...');
try {
  app.register(jwtBlacklist);
  console.log('JWT blacklist plugin registered');
} catch (e) {
  console.error('Error registering JWT blacklist plugin:', e);
}

// Direct authentication hook instead of plugin
console.log('Setting up direct auth hook...');
app.addHook('onRequest', async (req, reply) => {
  console.log('Direct auth hook: Processing request for', req.url);
  
  // Set a timeout for the entire auth process
  const authTimeout = setTimeout(() => {
    console.log('Direct auth hook: Timeout for', req.url);
    if (!reply.sent) {
      reply.code(408).send({ error: 'Authentication timeout' });
    }
  }, 5000); // 5 second timeout
  
  try {
    const auth = (req.headers['authorization'] || '').toString();
    console.log('Direct auth hook: Auth header exists:', !!auth);
    if (!auth.startsWith('Bearer ')) {
      console.log('Direct auth hook: No Bearer token, skipping for', req.url);
      clearTimeout(authTimeout);
      return;
    }
    const token = auth.replace(/^Bearer\s+/i, '');
    
    console.log('Direct auth hook: Processing token for', req.url);
    console.log('Direct auth hook: Token preview:', token.substring(0, 20) + '...');
    
    // JWT verification with timeout
    console.log('Direct auth hook: JWT secret exists:', !!process.env.APP_JWT_SECRET);
    const decoded: any = JWT.verify(token, process.env.APP_JWT_SECRET as string);
    console.log('Direct auth hook: JWT decoded successfully:', !!decoded);
    
    // Version check (logout-all support) with timeout
    console.log('Direct auth hook: Looking up user with id:', decoded.id);
    const userPromise = prisma.user.findUnique({ 
      where: { id: decoded.id }, 
      select: { id: true, tokenVersion: true } 
    });
    
    const user = await Promise.race([
      userPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 3000))
    ]) as any;
    
    console.log('Direct auth hook: User found:', !!user);
    if (!user) {
      console.log('Direct auth hook: User not found in database');
      clearTimeout(authTimeout);
      return;
    }
    if ((user as any).tokenVersion !== (decoded.tokenVersion ?? 0)) {
      console.log('Direct auth hook: Token version mismatch');
      clearTimeout(authTimeout);
      return;
    }
    
    // Set authUser for controllers
    (req as any)['authUser'] = user;
    console.log('Direct auth hook: Set authUser for', req.url, 'user:', user.id);
    
    // Update lastActiveAt (best-effort, non-blocking)
    prisma.user.update({ 
      where: { id: user.id }, 
      data: { lastActiveAt: new Date() } 
    }).catch((e) => {
      console.log('Direct auth hook: Failed to update lastActiveAt:', e.message);
    });
    
    clearTimeout(authTimeout);
    
  } catch (e) {
    console.log('Direct auth hook: JWT verification failed for', req.url, 'error:', e.message);
    clearTimeout(authTimeout);
  }
});
console.log('Direct auth hook registered');

// Cron jobs wiring
app.register(cronWiring);

// Routers
app.register(authRouter, { prefix: '/api/auth' });
app.register(deckRouter, { prefix: '/api/decks' });
app.register(classroomRouter, { prefix: '/api/classrooms' });
app.register(notificationRouter, { prefix: '/api/notifications' });
app.register(practiceRouter, { prefix: '/api/practice' });
app.register(uploadsRouter, { prefix: '/api/uploads' });
app.register(insightsRouter, { prefix: '/api/insights' });
app.register(securityRouter, { prefix: '/api/security' });
app.register(healthRouter, { prefix: '/api' });

// Start if run directly
if (require.main === module) {
  const PORT = Number(process.env.PORT || 3001);
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen({ port: PORT, host: HOST }).then(() => {
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
    console.log(`Server listening on http://${HOST}:${PORT}`);
  }).catch(err => {
    app.log.error(err);
    process.exit(1);
  });
}
