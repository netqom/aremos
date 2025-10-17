import type { PrismaClient } from '@prisma/client';

const DRIVER = (process.env.DB_DRIVER || 'memory').toLowerCase();

type PrismaLike = any;

let prisma: PrismaLike = null;

if (DRIVER === 'prisma') {
  // Initialize real PrismaClient lazily to allow build without DB
  try {
    const { PrismaClient } = require('@prisma/client') as { PrismaClient: typeof import('@prisma/client').PrismaClient };
    if (!process.env.DATABASE_URL || !String(process.env.DATABASE_URL).trim()) {
      throw new Error('DATABASE_URL fehlt. Setze DATABASE_URL in der .env oder wechsle DB_DRIVER=memory');
    }
    prisma = new PrismaClient();
  } catch (err) {
    throw new Error('Prisma-Modus aktiv, aber Initialisierung fehlgeschlagen: ' + (err?.message || err));
  }
} else {
  // Memory placeholder: provide a proxy that throws clear guidance when used
  const handler: ProxyHandler<any> = {
    get(_t, prop) {
      return new Proxy(function(){}, {
        apply() {
          throw new Error('Kein Datenbank-Treiber aktiv (DB_DRIVER=memory). Setze DB_DRIVER=prisma + DATABASE_URL, dann prisma generate/migrate.');
        },
        get() {
          // any method call (findFirst/create/update/etc.) will throw when invoked
          return (..._args: any[]) => {
            throw new Error('Kein Datenbank-Treiber aktiv (DB_DRIVER=memory). Setze DB_DRIVER=prisma + DATABASE_URL, dann prisma generate/migrate.');
          };
        }
      });
    }
  };
  prisma = new Proxy({}, handler);
}

export { prisma };

// Joi validation helper for Fastify
export const utils = {
  preValidation: (schema: any) => {
    return async (request: any, reply: any) => {
      try {
        const { error } = schema.validate(request.body);
        if (error) {
          return reply.code(400).send({ 
            message: error.details[0].message 
          });
        }
      } catch (err) {
        return reply.code(500).send({ 
          message: 'Validation error' 
        });
      }
    };
  }
};
