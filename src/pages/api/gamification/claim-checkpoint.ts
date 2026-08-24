import type { APIRoute } from 'astro';
import { sql as neonSql, isDbConfigured, ensureDbInitialized } from '../../../db';
import { authorizeOrientasiAction, getApprovedCheckpoint } from '../../../utils/orientasiPplgPolicy.ts';
import { getOrientasiServerState } from '../../../utils/orientasiPplgServer.ts';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Harap masuk (login) untuk mencatat checkpoint.' }), { status: 401 });
  }

  if (!neonSql || !isDbConfigured()) {
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

    const checkpointPayload = JSON.stringify({
      quizId: checkpoint.quizId,
      passed: true,
      autoGraded: true,
      timestamp: new Date().toISOString(),
    });

    // One PostgreSQL statement is the transaction boundary. If the XP upsert
    // fails, the winning checkpoint insert is rolled back as part of the same
    // statement, so a retry can still receive the reward exactly once.
    const insertedRows = await neonSql`
      WITH inserted_checkpoint AS (
        INSERT INTO user_submissions (
          user_id,
          token_id,
          lesson_slug,
          submission_type,
          form_data,
          score,
          teacher_score,
          teacher_level,
          teacher_feedback,
          graded_at,
          status
        )
        VALUES (
          ${userId},
          ${serverState.enrollmentTokenId},
          ${checkpoint.lessonSlug},
          'checkpoint',
          ${checkpointPayload},
          100,
          100,
          'Level 2',
          'Selesai otomatis via Gamified Checkpoint Quest',
          NOW(),
          'verified'
        )
        ON CONFLICT (user_id, lesson_slug, submission_type) DO NOTHING
        RETURNING id
      ),
      rewarded_checkpoint AS (
        INSERT INTO user_gamification (user_id, xp, level, last_active_date)
        SELECT
          ${userId},
          ${checkpoint.xpReward},
          LEAST(5, FLOOR(${checkpoint.xpReward} / 100.0)::int + 1),
          NOW()
        FROM inserted_checkpoint
        ON CONFLICT (user_id) DO UPDATE SET
          xp = user_gamification.xp + EXCLUDED.xp,
          level = LEAST(5, FLOOR((user_gamification.xp + EXCLUDED.xp) / 100.0)::int + 1),
          last_active_date = NOW()
        RETURNING user_id
      )
      SELECT id AS submission_id FROM inserted_checkpoint
    `;

    const inserted = insertedRows[0];

    const isFirstTime = Boolean(inserted);
    const xpEarned = inserted ? checkpoint.xpReward : 0;

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
