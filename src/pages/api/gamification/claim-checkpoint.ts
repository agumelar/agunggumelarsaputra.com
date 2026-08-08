import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { userSubmissions, userGamification } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { authorizeOrientasiAction, getApprovedCheckpoint } from '../../../utils/orientasiPplgPolicy.ts';
import { getOrientasiServerState } from '../../../utils/orientasiPplgServer.ts';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Harap masuk (login) untuk mencatat checkpoint.' }), { status: 401 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }

  try {
    await ensureDbInitialized();
    const userId = locals.user.userId;
    const { lessonSlug } = await request.json();
    const checkpoint = getApprovedCheckpoint(lessonSlug);
    if (!checkpoint) return new Response(JSON.stringify({ error: 'Slug checkpoint Orientasi PPLG tidak valid.' }), { status: 400 });

    const serverState = await getOrientasiServerState(userId, checkpoint.lessonSlug);
    const authorization = authorizeOrientasiAction({
      lessonSlug: checkpoint.lessonSlug,
      action: 'checkpoint',
      role: locals.user.role,
      ...serverState,
    });
    if (!authorization.allowed) {
      return new Response(JSON.stringify({ error: authorization.error }), { status: authorization.status });
    }

    // Cek apakah checkpoint modul ini sudah pernah di-claim oleh user
    const [existing] = await db.select()
      .from(userSubmissions)
      .where(and(
        eq(userSubmissions.userId, userId),
        eq(userSubmissions.lessonSlug, checkpoint.lessonSlug),
        eq(userSubmissions.submissionType, 'checkpoint')
      ))
      .limit(1);

    let xpEarned = 0;
    let isFirstTime = false;

    if (!existing) {
      isFirstTime = true;
      xpEarned = checkpoint.xpReward;

      await db.insert(userSubmissions).values({
        userId,
        tokenId: serverState.enrollmentTokenId,
        lessonSlug: checkpoint.lessonSlug,
        submissionType: 'checkpoint',
        formData: JSON.stringify({ quizId: checkpoint.quizId, passed: true, autoGraded: true, timestamp: new Date().toISOString() }),
        score: 100,
        teacherScore: 100,
        teacherLevel: 'Level 2',
        teacherFeedback: 'Selesai otomatis via Gamified Checkpoint Quest',
        gradedAt: new Date(),
        status: 'verified',
      });

      // Update XP & Level
      const [gam] = await db.select().from(userGamification).where(eq(userGamification.userId, userId)).limit(1);
      if (gam) {
        const newXp = gam.xp + xpEarned;
        const newLevel = Math.min(5, Math.floor(newXp / 100) + 1);
        await db.update(userGamification)
          .set({ xp: newXp, level: newLevel, lastActiveDate: new Date() })
          .where(eq(userGamification.userId, userId));
      } else {
        await db.insert(userGamification).values({
          userId,
          xp: xpEarned,
          level: 1,
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      isFirstTime,
      xpEarned,
      message: isFirstTime 
        ? `Tantangan berhasil dipecahkan! (+${xpEarned} XP didapatkan 🎉)` 
        : 'Checkpoint telah terverifikasi sebelumnya.',
    }), { status: 200 });

  } catch (err: any) {
    console.error('Error claiming checkpoint:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal mencatat checkpoint.' }), { status: 500 });
  }
};
