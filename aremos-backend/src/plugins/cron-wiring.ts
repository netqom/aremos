import { FastifyPluginCallback } from 'fastify';

export const cronWiring: FastifyPluginCallback = (fastify, _opts, done) => {
  try {
    // Lazy import to avoid hard crashes if files are missing in certain builds
    try {
      const sr = require('../cron/sr.cron');
      if (typeof sr.startSrCron === 'function') sr.startSrCron();
      if (typeof sr.startSRCron === 'function') sr.startSRCron();
    } catch {}
    try {
      const insights = require('../cron/insights.cron');
      if (typeof insights.startInsightsCleanupCron === 'function') insights.startInsightsCleanupCron();
    } catch {}
    try {
      const ina = require('../cron/inactivity.cron');
      if (typeof ina.startInactivityCron === 'function') ina.startInactivityCron();
    } catch {}
  } catch {}
  done();
};
