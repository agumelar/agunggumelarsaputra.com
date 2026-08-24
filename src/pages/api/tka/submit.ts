import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { tkaAttempts, userSubmissions, userGamification } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }

  try {
    await ensureDbInitialized();
    const { score, totalQuestions, correctAnswers, tokenId, lessonSlug } = await request.json();
    const userId = locals.user.userId;

    const bonusXp = 10 + Math.round((score / 100) * 50);

    // Calculate attemptNumber for this module
    let attemptNumber = 1;
    if (lessonSlug) {
      const existingAttempts = await db.select({ id: tkaAttempts.id })
        .from(tkaAttempts)
        .where(and(eq(tkaAttempts.userId, userId), eq(tkaAttempts.lessonSlug, lessonSlug)));
      attemptNumber = existingAttempts.length + 1;
    }

    const [newAttempt] = await db.insert(tkaAttempts).values({
      userId,
      tokenId: tokenId ? Number(tokenId) : null,
      lessonSlug: lessonSlug || null,
      attemptNumber,
      score,
      totalQuestions,
      correctAnswers,
      xpEarned: bonusXp,
    }).returning();

    if (lessonSlug) {
      const existingSub = await db.select().from(userSubmissions)
        .where(and(
          eq(userSubmissions.userId, userId),
          eq(userSubmissions.lessonSlug, lessonSlug),
          eq(userSubmissions.submissionType, 'quiz')
        ))
        .limit(1);

      const formDataJson = JSON.stringify({ score, totalQuestions, correctAnswers });

      if (existingSub.length > 0) {
        await db.update(userSubmissions)
          .set({ score, formData: formDataJson, updatedAt: new Date() })
          .where(eq(userSubmissions.id, existingSub[0].id));
      } else {
        await db.insert(userSubmissions).values({
          userId,
          tokenId: tokenId ? Number(tokenId) : null,
          lessonSlug,
          submissionType: 'quiz',
          formData: formDataJson,
          score,
          status: 'submitted',
        });
      }
    }

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
