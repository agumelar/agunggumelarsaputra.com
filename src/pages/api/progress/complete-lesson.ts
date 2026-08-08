import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { userGamification, userProgress } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { authorizeOrientasiAction, isCanonicalOrientasiSlug } from '../../../utils/orientasiPplgPolicy.ts';
import { getOrientasiServerState } from '../../../utils/orientasiPplgServer.ts';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }

  try {
    await ensureDbInitialized();
    const { lessonSlug, tokenId } = await request.json();
    const userId = locals.user.userId;

    if (typeof lessonSlug === 'string' && lessonSlug.startsWith('orientasi-pplg-') && !isCanonicalOrientasiSlug(lessonSlug)) {
      return new Response(JSON.stringify({ error: 'Slug Modul Orientasi PPLG tidak valid.' }), { status: 400 });
    }

    let trustedTokenId = tokenId ? Number(tokenId) : null;
    if (isCanonicalOrientasiSlug(lessonSlug)) {
      const serverState = await getOrientasiServerState(userId, lessonSlug);
      const authorization = authorizeOrientasiAction({
        lessonSlug,
        action: 'complete',
        role: locals.user.role,
        ...serverState,
      });
      if (!authorization.allowed) {
        return new Response(JSON.stringify({ error: authorization.error }), { status: authorization.status });
      }
      trustedTokenId = serverState.enrollmentTokenId;
    }

    const [existing] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonSlug, lessonSlug))).limit(1);

    if (existing) {
      return new Response(JSON.stringify({ message: 'Sudah diselesaikan sebelumnya.' }), { status: 200 });
    }

    await db.insert(userProgress).values({
      userId,
      tokenId: trustedTokenId,
      lessonSlug
    });

    let [stats] = await db.select().from(userGamification).where(eq(userGamification.userId, userId)).limit(1);
    if (!stats) {
      [stats] = await db.insert(userGamification).values({ userId, xp: 0, level: 1 }).returning();
    }

    const newXp = stats.xp + 15;
    const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;

    await db.update(userGamification)
      .set({ xp: newXp, level: newLevel, lastActiveDate: new Date() })
      .where(eq(userGamification.userId, userId));

    return new Response(JSON.stringify({ success: true, xpEarned: 15, newXp, newLevel }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
