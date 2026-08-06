import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../../db';
import { tkaAttempts, userGamification } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await ensureDbInitialized();
    const { score, totalQuestions, correctAnswers, tokenId } = await request.json();
    const userId = locals.user.userId;

    const bonusXp = 10 + Math.round((score / 100) * 50);

    await db.insert(tkaAttempts).values({
      userId,
      tokenId: tokenId ? Number(tokenId) : null,
      score,
      totalQuestions,
      correctAnswers,
      xpEarned: bonusXp,
    });

    let [stats] = await db.select().from(userGamification).where(eq(userGamification.userId, userId)).limit(1);
    if (!stats) {
      [stats] = await db.insert(userGamification).values({ userId, xp: 0, level: 1 }).returning();
    }

    const newXp = stats.xp + bonusXp;
    const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;

    await db.update(userGamification)
      .set({ xp: newXp, level: newLevel, lastActiveDate: new Date() })
      .where(eq(userGamification.userId, userId));

    return new Response(JSON.stringify({ success: true, xpEarned: bonusXp, newXp, newLevel }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
