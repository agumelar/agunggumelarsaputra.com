import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { userSubmissions } from '../../../../db/schema';
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
    const { submissionId, teacherFeedback } = body;

    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'ID Submission diperlukan.' }), { status: 400 });
    }

    const [updated] = await db.update(userSubmissions)
      .set({
        teacherScore: null,
        teacherLevel: null,
        teacherFeedback: teacherFeedback?.trim() || 'Telah dibaca dan ditinjau oleh Guru.',
        gradedBy: locals.user.userId,
        gradedAt: new Date(),
        status: 'reviewed',
        updatedAt: new Date(),
      })
      .where(eq(userSubmissions.id, Number(submissionId)))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Data jurnal refleksi tidak ditemukan.' }), { status: 404 });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Jurnal refleksi siswa telah ditandai selesai ditinjau!',
      submission: updated,
    }), { status: 200 });

  } catch (err: any) {
    console.error('Error reviewing reflection:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal menyimpan tinjauan refleksi.' }), { status: 500 });
  }
};
