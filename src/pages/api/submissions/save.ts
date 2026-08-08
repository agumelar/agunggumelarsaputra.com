import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { userSubmissions, userGamification } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { authorizeOrientasiAction, isCanonicalOrientasiSlug } from '../../../utils/orientasiPplgPolicy.ts';
import { getOrientasiServerState } from '../../../utils/orientasiPplgServer.ts';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Harap masuk (login) terlebih dahulu untuk menyimpan jawaban.' }), { status: 401 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }

  try {
    await ensureDbInitialized();
    const userId = locals.user.userId;
    const body = await request.json();
    const { lessonSlug, submissionType, formData, driveUrl, tokenId, score } = body;

    if (!lessonSlug || !submissionType || !formData) {
      return new Response(JSON.stringify({ error: 'Data formulir tidak lengkap.' }), { status: 400 });
    }

    if (typeof lessonSlug === 'string' && lessonSlug.startsWith('orientasi-pplg-') && !isCanonicalOrientasiSlug(lessonSlug)) {
      return new Response(JSON.stringify({ error: 'Slug Modul Orientasi PPLG tidak valid.' }), { status: 400 });
    }

    let trustedTokenId = tokenId ? Number(tokenId) : null;
    if (isCanonicalOrientasiSlug(lessonSlug)) {
      if (submissionType !== 'lkpd' && submissionType !== 'reflection') {
        return new Response(JSON.stringify({ error: 'Jenis submission Orientasi PPLG tidak valid.' }), { status: 400 });
      }
      const serverState = await getOrientasiServerState(userId, lessonSlug);
      const authorization = authorizeOrientasiAction({
        lessonSlug,
        action: submissionType,
        role: locals.user.role,
        ...serverState,
      });
      if (!authorization.allowed) {
        return new Response(JSON.stringify({ error: authorization.error }), { status: authorization.status });
      }
      trustedTokenId = serverState.enrollmentTokenId;
    }

    const jsonFormData = typeof formData === 'string' ? formData : JSON.stringify(formData);

    // Cek apakah sudah pernah submit sebelumnya
    const [existing] = await db.select()
      .from(userSubmissions)
      .where(and(
        eq(userSubmissions.userId, userId),
        eq(userSubmissions.lessonSlug, lessonSlug),
        eq(userSubmissions.submissionType, submissionType)
      ))
      .limit(1);

    // Kunci pengeditan di sisi server jika sudah dinilai tuntas (>= 73)
    if (existing && existing.teacherScore !== null && existing.teacherScore !== undefined && existing.teacherScore >= 73) {
      return new Response(JSON.stringify({ 
        error: 'Lembar kerja ini telah dinilai tuntas oleh guru (KKM Tercapai) dan telah dikunci secara permanen.' 
      }), { status: 403 });
    }

    let isNewSubmission = false;
    let isRemedialResubmit = false;
    let submissionId: number;

    if (existing) {
      submissionId = existing.id;
      if (existing.teacherScore !== null && existing.teacherScore < 73) {
        isRemedialResubmit = true;
      }

      await db.update(userSubmissions)
        .set({
          formData: jsonFormData,
          driveUrl: driveUrl || existing.driveUrl,
          tokenId: trustedTokenId ?? existing.tokenId,
          score: score !== undefined ? Number(score) : existing.score,
          status: isRemedialResubmit ? 'submitted' : existing.status,
          updatedAt: new Date(),
        })
        .where(eq(userSubmissions.id, existing.id));
    } else {
      isNewSubmission = true;
      const [inserted] = await db.insert(userSubmissions)
        .values({
          userId,
          tokenId: trustedTokenId,
          lessonSlug,
          submissionType,
          formData: jsonFormData,
          driveUrl: driveUrl || null,
          score: score !== undefined ? Number(score) : null,
          status: 'submitted',
        })
        .returning();
      submissionId = inserted.id;
    }

    // Gamification XP award on first submission
    let xpEarned = 0;
    if (isNewSubmission) {
      xpEarned = submissionType === 'lkpd' ? 25 : submissionType === 'reflection' ? 15 : 10;
      
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
      submissionId,
      isNewSubmission,
      xpEarned,
      message: isNewSubmission 
        ? `Berhasil mengumpulkan! (+${xpEarned} XP diperoleh 🎉)`
        : 'Perubahan jawaban berhasil diperbarui!',
    }), { status: 200 });

  } catch (err: any) {
    console.error('Error saving submission:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal menyimpan jawaban formulir.' }), { status: 500 });
  }
};
