import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { literasiReports } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { canAccessAdminPanel } from '../../../utils/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const secretKey = url.searchParams.get('secret') || request.headers.get('x-admin-secret');
  const isSecretValid = Boolean(secretKey && (secretKey === process.env.JWT_SECRET || secretKey === process.env.POSTGRES_PASSWORD));
  const isAuthorized = (locals.user && canAccessAdminPanel(locals.user.role)) || isSecretValid;

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Akses khusus Guru/Admin.' }), { status: 403 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terkonfigurasi.' }), { status: 503 });
  }

  await ensureDbInitialized();

  try {
    const body = await request.json();
    const {
      reportId,
      w1 = 4, w2 = 4, w3 = 4, w4 = 4, // 4 Aspek Menulis (1-4) -> Max 16
      p1 = 4, p2 = 4, p3 = 4, p4 = 4, p5 = 4, // 5 Aspek Presentasi (1-4) -> Max 20
      teacherFeedback = '',
    } = body;

    if (!reportId) {
      return new Response(JSON.stringify({ error: 'Report ID wajib disertakan.' }), { status: 400 });
    }

    const totalWriting = Math.min(16, Math.max(4, (Number(w1) || 0) + (Number(w2) || 0) + (Number(w3) || 0) + (Number(w4) || 0)));
    const totalPresentation = Math.min(20, Math.max(5, (Number(p1) || 0) + (Number(p2) || 0) + (Number(p3) || 0) + (Number(p4) || 0) + (Number(p5) || 0)));
    
    // Formula RESIK Resmi: Nilai Akhir = (Writing + Presentation) / 36 * 100
    const finalScore = Math.min(100, Math.max(0, Math.round(((totalWriting + totalPresentation) / 36) * 100)));

    const teacherId = locals.user.userId;

    const [updatedReport] = await db.update(literasiReports)
      .set({
        writingScore: totalWriting,
        presentationScore: totalPresentation,
        finalScore,
        teacherFeedback: teacherFeedback.trim(),
        gradedBy: teacherId,
        gradedAt: new Date(),
        status: 'graded',
        updatedAt: new Date(),
      })
      .where(eq(literasiReports.id, Number(reportId)))
      .returning();

    return new Response(JSON.stringify({
      success: true,
      message: `Penilaian berhasil disimpan! Nilai RESIK: ${finalScore}/100`,
      report: updatedReport,
    }), { status: 200 });
  } catch (err: any) {
    console.error('Error grading literasi report:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal menyimpan penilaian RESIK.' }), { status: 500 });
  }
};
