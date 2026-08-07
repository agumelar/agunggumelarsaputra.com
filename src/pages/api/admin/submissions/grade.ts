import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { userSubmissions, users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { canAccessAdminPanel } from '../../../../utils/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !canAccessAdminPanel(locals.user.role)) {
    return new Response(JSON.stringify({ error: 'Akses ditolak. Khusus Guru / Administrator.' }), { status: 403 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung.' }), { status: 500 });
  }

  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { submissionId, teacherScore, teacherLevel, teacherFeedback } = body;

    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'ID Submission diperlukan.' }), { status: 400 });
    }

    const scoreNum = teacherScore !== undefined && teacherScore !== '' ? Math.min(100, Math.max(0, Number(teacherScore))) : null;

    const [updated] = await db.update(userSubmissions)
      .set({
        teacherScore: scoreNum,
        teacherLevel: teacherLevel || null,
        teacherFeedback: teacherFeedback || null,
        gradedBy: locals.user.userId,
        gradedAt: new Date(),
        status: 'graded',
        updatedAt: new Date(),
      })
      .where(eq(userSubmissions.id, Number(submissionId)))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Data pengumpulan tugas tidak ditemukan.' }), { status: 404 });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Nilai dan catatan evaluasi Guru berhasil disimpan!',
      submission: updated,
    }), { status: 200 });

  } catch (err: any) {
    console.error('Error grading submission:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal menyimpan penilaian.' }), { status: 500 });
  }
};
