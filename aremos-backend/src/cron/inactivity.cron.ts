import cron from 'node-cron';
import { prisma } from '../utils';
import { TZ } from '../utils/time';

function addDays(d: Date, days: number) { const r = new Date(d); r.setDate(r.getDate() + days); return r; }

export function startInactivityCron() {
  cron.schedule('0 2 * * *', async () => {
    const now = new Date();
    const inactivityDays = Number(process.env.INACTIVITY_DAYS ?? '365');
    const graceDays = Number(process.env.INACTIVITY_GRACE_DAYS ?? '14');

    // Phase 1: schedule deletions
    if (inactivityDays > 0 && graceDays >= 0) {
      const threshold = addDays(now, -inactivityDays);
      const inactive = await prisma.user.findMany({ where: { lastActiveAt: { lt: threshold }, deletionScheduledAt: null } });
      for (const u of inactive) {
        const delAt = addDays(now, graceDays);
        await prisma.user.update({ where: { id: u.id }, data: { deletionScheduledAt: delAt } });
        // Create a system notification with expiry at delAt
        const msg = `Inaktivität: Dein AREMOS-Account wurde seit ${inactivityDays} Tagen nicht genutzt. Ohne Aktivität wird er am ${delAt.toISOString().split('T')[0]} gelöscht.`;
        await prisma.systemNotification.create({ data: { userId: u.id, message: msg, expires_at: delAt } }).catch(()=>{});
      }
    }

    // Phase 2: delete accounts past scheduled deletion
    const due = await prisma.user.findMany({ where: { deletionScheduledAt: { lte: now } } });
    for (const u of due) {
      // Use existing deep cleanup logic: mirrors deleteAccount controller
      try {
        const fs = require('fs'); const path = require('path');
        const dir = path.join(process.cwd(), 'public', 'uploads', 'cards', String(u.id));
        if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
      } catch {}
      await prisma.notification.deleteMany({ where: { userId: u.id } }).catch(()=>{});
      await prisma.systemNotification.deleteMany({ where: { userId: u.id } }).catch(()=>{});
      await prisma.classroomMembership.deleteMany({ where: { userId: u.id } }).catch(()=>{});
      const ownedClasses = await prisma.classroom.findMany({ where: { ownerId: u.id } });
      for (const cls of ownedClasses) { await prisma.classroom.delete({ where: { id: cls.id } }).catch(()=>{}); }
      const ownedDecks = await prisma.deck.findMany({ where: { ownerId: u.id } });
      for (const d of ownedDecks) {
        const cards = await prisma.card.findMany({ where: { deckId: d.id } });
        for (const c of cards) {
          try { if (c.questionImageUrl) require('fs').unlinkSync(require('path').join(process.cwd(), 'public', c.questionImageUrl.replace(/^\//, ''))); } catch {}
          try { if (c.answerImageUrl) require('fs').unlinkSync(require('path').join(process.cwd(), 'public', c.answerImageUrl.replace(/^\//, ''))); } catch {}
        }
        await prisma.deck.delete({ where: { id: d.id } }).catch(()=>{});
      }
      await prisma.learningSession.deleteMany({ where: { userId: u.id } }).catch(()=>{});
      await prisma.user.delete({ where: { id: u.id } }).catch(()=>{});
    }
  }, { timezone: TZ });
}
