import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { userSubmissions, userGamification } from '../../../db/schema';
import { sql } from 'drizzle-orm';
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

    // The composite unique key makes this insert the single arbiter for parallel
    // first claims. Only the request receiving a RETURNING row may award XP.
    const [inserted] = await db.insert(userSubmissions).values({
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
    })
      .onConflictDoNothing({
        target: [
          userSubmissions.userId,
          userSubmissions.lessonSlug,
          userSubmissions.submissionType,
        ],
      })
      .returning({ id: userSubmissions.id });

    const isFirstTime = Boolean(inserted);
    const xpEarned = inserted ? checkpoint.xpReward : 0;

    if (inserted) {
      const initialLevel = Math.min(5, Math.floor(xpEarned / 100) + 1);
      const now = new Date();

      // Atomic upsert avoids read/modify/write lost updates when two different
      // checkpoints are legitimately claimed at the same time.
      await db.insert(userGamification).values({
        userId,
        xp: xpEarned,
        level: initialLevel,
        lastActiveDate: now,
      }).onConflictDoUpdate({
        target: userGamification.userId,
        set: {
          xp: sql`${userGamification.xp} + ${xpEarned}`,
          level: sql`LEAST(5, FLOOR((${userGamification.xp} + ${xpEarned}) / 100.0)::int + 1)`,
          lastActiveDate: now,
        },
      });
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
