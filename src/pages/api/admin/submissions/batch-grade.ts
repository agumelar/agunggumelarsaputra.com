import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { userSubmissions } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { canAccessAdminPanel } from '../../../../utils/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const secretKey = url.searchParams.get('secret') || request.headers.get('x-admin-secret');
  const isSecretValid = Boolean(secretKey && (secretKey === process.env.JWT_SECRET || secretKey === process.env.POSTGRES_PASSWORD));
  const isAuthorized = (locals.user && canAccessAdminPanel(locals.user.role)) || isSecretValid;

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Akses ditolak. Khusus Guru / Administrator.' }), { status: 403 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung.' }), { status: 500 });
  }

  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { grades } = body;

    if (!Array.isArray(grades) || grades.length === 0) {
      return new Response(JSON.stringify({ error: 'Payload grades harus berupa JSON array.' }), { status: 400 });
    }

    const updatedItems = [];

    for (const g of grades) {
      if (!g.submissionId && !g.id) continue;
      const targetId = Number(g.submissionId || g.id);

      if (g.submissionType === 'literasi' || g.targetTable === 'literasi_reports') {
        const { literasiReports } = await import('../../../../db/schema');
        const writingScore = Number(g.writingScore) || Number(g.teacherScore) || 14;
        const presentationScore = Number(g.presentationScore) || 18;
        const finalScore = g.finalScore ? Number(g.finalScore) : Math.min(100, Math.max(0, Math.round(((writingScore + presentationScore) / 36) * 100)));

        const [updatedLit] = await db.update(literasiReports)
          .set({
            writingScore,
            presentationScore,
            finalScore,
            teacherFeedback: g.teacherFeedback || null,
            gradedBy: locals.user?.userId || null,
            gradedAt: new Date(),
            status: 'graded',
            updatedAt: new Date(),
          })
          .where(eq(literasiReports.id, targetId))
          .returning();

        if (updatedLit) updatedItems.push(updatedLit);
      } else {
        const isReflection = g.submissionType === 'reflection' || g.status === 'reviewed';
        const newStatus = isReflection ? 'reviewed' : (g.status || 'graded');

        const scoreNum = g.teacherScore !== undefined && g.teacherScore !== null && g.teacherScore !== '' 
          ? Math.min(100, Math.max(0, Number(g.teacherScore))) 
          : null;

        const [updated] = await db.update(userSubmissions)
          .set({
            teacherScore: isReflection ? null : scoreNum,
            teacherLevel: g.teacherLevel || null,
            teacherFeedback: g.teacherFeedback || null,
            gradedBy: locals.user?.userId || null,
            gradedAt: new Date(),
            status: newStatus,
            updatedAt: new Date(),
          })
          .where(eq(userSubmissions.id, targetId))
          .returning();

        if (updated) updatedItems.push(updated);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Berhasil memperbarui penilaian untuk ${updatedItems.length} dokumen siswa!`,
      count: updatedItems.length,
      submissions: updatedItems,
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (err: any) {
    console.error('Error batch grading submissions:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal memperbarui penilaian batch.' }), { status: 500 });
  }
};
