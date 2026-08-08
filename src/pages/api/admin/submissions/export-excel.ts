import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { userSubmissions, users } from '../../../../db/schema';
import { canAccessAdminPanel } from '../../../../utils/auth';
import { eq, desc } from 'drizzle-orm';
import { generateLkpdSubmissionsExcel } from '../../../../utils/excelExport';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || !canAccessAdminPanel(locals.user.role)) {
    return new Response('Akses ditolak.', { status: 403 });
  }

  if (!isDbConfigured()) {
    return new Response('Database belum terhubung.', { status: 503 });
  }

  try {
    await ensureDbInitialized();

    const rawSubmissions = await db.select({
      id: userSubmissions.id,
      userName: users.name,
      userEmail: users.email,
      studentClass: users.studentClass,
      lessonSlug: userSubmissions.lessonSlug,
      submissionType: userSubmissions.submissionType,
      teacherScore: userSubmissions.teacherScore,
      teacherLevel: userSubmissions.teacherLevel,
      teacherNotes: userSubmissions.teacherFeedback,
      status: userSubmissions.status,
      submittedAt: userSubmissions.submittedAt,
    }).from(userSubmissions)
      .innerJoin(users, eq(userSubmissions.userId, users.id))
      .where(eq(userSubmissions.submissionType, 'lkpd'))
      .orderBy(desc(userSubmissions.submittedAt));

    const excelBuffer = await generateLkpdSubmissionsExcel(rawSubmissions);

    const now = new Date();
    const dateTag = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const filename = `Rekap_LKPD_PPLG_${dateTag}.xlsx`;

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (err: any) {
    return new Response(`Gagal menghasilkan file Excel LKPD: ${err.message || 'Server error'}`, { status: 500 });
  }
};
