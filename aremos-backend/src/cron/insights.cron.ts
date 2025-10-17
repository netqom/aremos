import cron from 'node-cron';
import { prisma } from '../utils';
export function startInsightsCleanupCron() {
  cron.schedule('10 1 * * *', async () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7*24*60*60*1000);
    await prisma.cardInteraction.deleteMany({ where: { session: { completedAt: { lt: sevenDaysAgo } } } }).catch(()=>{});
    await prisma.learningSession.deleteMany({ where: { completedAt: { lt: sevenDaysAgo } } }).catch(()=>{});
  }, { timezone: 'Europe/Berlin' });
}