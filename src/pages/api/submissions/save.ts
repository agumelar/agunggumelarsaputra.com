import type { APIRoute } from 'astro';
import { db, sql as neonSql, isDbConfigured, ensureDbInitialized } from '../../../db';
import { userSubmissions } from '../../../db/schema';
import { and, eq, isNull, lt, or } from 'drizzle-orm';
import { authorizeOrientasiAction, getApprovedSubmission } from '../../../utils/orientasiPplgPolicy.ts';
import { getOrientasiServerState } from '../../../utils/orientasiPplgServer.ts';

const lockedSubmissionResponse = () => new Response(JSON.stringify({
  error: 'Lembar kerja ini telah dinilai tuntas oleh guru (KKM Tercapai) dan telah dikunci secara permanen.',
}), { status: 403 });

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Harap masuk (login) terlebih dahulu untuk menyimpan jawaban.' }), { status: 401 });
  }

  if (!neonSql || !isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }

  try {
    await ensureDbInitialized();
    const userId = locals.user.userId;
    const body = await request.json();
    const { lessonSlug, submissionType, formData, driveUrl } = body;

    if (!lessonSlug || !submissionType || !formData) {
      return new Response(JSON.stringify({ error: 'Data formulir tidak lengkap.' }), { status: 400 });
    }

    const approvedSubmission = getApprovedSubmission(lessonSlug, submissionType);
    if (!approvedSubmission) {
      return new Response(JSON.stringify({ error: 'Slug atau jenis submission Orientasi PPLG tidak valid.' }), { status: 400 });
    }

    const serverState = await getOrientasiServerState(userId, approvedSubmission.lessonSlug);
    const authorization = authorizeOrientasiAction({
      lessonSlug: approvedSubmission.lessonSlug,
      action: approvedSubmission.action,
      role: locals.user.role,
      ...serverState,
    });
    if (!authorization.allowed) {
      return new Response(JSON.stringify({ error: authorization.error }), { status: authorization.status });
    }

    const jsonFormData = typeof formData === 'string' ? formData : JSON.stringify(formData);
    const trustedDriveUrl = typeof driveUrl === 'string' && driveUrl.trim() ? driveUrl.trim() : null;

    // The first insert and XP award share one PostgreSQL statement. A parallel
    // request that loses the unique-key race returns no row and continues via
    // the normal update path below; it never receives duplicate XP or a 500.
    const insertedRows = await neonSql`
      WITH inserted_submission AS (
        INSERT INTO user_submissions (
          user_id,
          token_id,
          lesson_slug,
          submission_type,
          form_data,
          drive_url,
          score,
          status
        )
        VALUES (
          ${userId},
          ${serverState.enrollmentTokenId},
          ${approvedSubmission.lessonSlug},
          ${approvedSubmission.submissionType},
          ${jsonFormData},
          ${trustedDriveUrl},
          NULL,
          'submitted'
        )
        ON CONFLICT (user_id, lesson_slug, submission_type) DO NOTHING
        RETURNING id
      ),
      rewarded_submission AS (
        INSERT INTO user_gamification (user_id, xp, level, last_active_date)
        SELECT
          ${userId},
          ${approvedSubmission.xpReward},
          LEAST(5, FLOOR(${approvedSubmission.xpReward} / 100.0)::int + 1),
          NOW()
        FROM inserted_submission
        ON CONFLICT (user_id) DO UPDATE SET
          xp = user_gamification.xp + EXCLUDED.xp,
          level = LEAST(5, FLOOR((user_gamification.xp + EXCLUDED.xp) / 100.0)::int + 1),
          last_active_date = NOW()
        RETURNING user_id
      )
      SELECT id AS submission_id FROM inserted_submission
    `;

    const inserted = insertedRows[0] as { submission_id: number } | undefined;
    let submissionId = inserted ? Number(inserted.submission_id) : 0;
    let isRemedialResubmit = false;

    if (!inserted) {
      const [existing] = await db.select()
        .from(userSubmissions)
        .where(and(
          eq(userSubmissions.userId, userId),
          eq(userSubmissions.lessonSlug, approvedSubmission.lessonSlug),
          eq(userSubmissions.submissionType, approvedSubmission.submissionType),
        ))
        .limit(1);

      if (!existing) {
        return new Response(JSON.stringify({ error: 'Submission berubah saat disimpan. Silakan coba lagi.' }), { status: 409 });
      }
      if (existing.teacherScore !== null && existing.teacherScore >= 73) {
        return lockedSubmissionResponse();
      }

      submissionId = existing.id;
      isRemedialResubmit = existing.teacherScore !== null && existing.teacherScore < 73;

      const [updated] = await db.update(userSubmissions)
        .set({
          formData: jsonFormData,
          driveUrl: trustedDriveUrl ?? existing.driveUrl,
          tokenId: serverState.enrollmentTokenId ?? existing.tokenId,
          status: isRemedialResubmit ? 'submitted' : existing.status,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userSubmissions.id, existing.id),
          or(isNull(userSubmissions.teacherScore), lt(userSubmissions.teacherScore, 73)),
        ))
        .returning({ id: userSubmissions.id });

      // A teacher may grade and lock the LKPD between the read and update. The
      // guarded UPDATE fails closed instead of overwriting that new grade.
      if (!updated) return lockedSubmissionResponse();
    }

    const isNewSubmission = Boolean(inserted);
    const xpEarned = isNewSubmission ? approvedSubmission.xpReward : 0;

    return new Response(JSON.stringify({
      success: true,
      submissionId,
      isNewSubmission,
      xpEarned,
      message: isNewSubmission
        ? `Berhasil mengumpulkan! (+${xpEarned} XP diperoleh 🎉)`
        : isRemedialResubmit
          ? 'Perbaikan jawaban berhasil dikirim ulang!'
          : 'Perubahan jawaban berhasil diperbarui!',
    }), { status: 200 });
  } catch (err: any) {
    console.error('Error saving submission:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal menyimpan jawaban formulir.' }), { status: 500 });
  }
};
