import cron from 'node-cron';
import { prisma } from '../utils';
import { todayStrBerlin } from '../utils/time';
export function startSrCron() {
  cron.schedule('0 1 * * *', async () => {
    const now = new Date();
    const todayStr = todayStrBerlin(now);
    const dueSr = await prisma.spacedRepetitionDay.findMany({ where: { dayStr: todayStr }, include: { deck: true } });
    const data = dueSr.map(sr => ({ userId: sr.deck.ownerId, deckId: sr.deckId, created_at: now, expires_at: new Date(now.getTime() + 48*60*60*1000) }));
    if (data.length) await prisma.notification.createMany({ data, skipDuplicates: true }).catch(()=>{});
    await prisma.notification.deleteMany({ where: { expires_at: { lte: now } } });
  }, { timezone: 'Europe/Berlin' });
}