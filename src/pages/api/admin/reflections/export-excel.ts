import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { userSubmissions, users } from '../../../../db/schema';
import { canAccessAdminPanel } from '../../../../utils/auth';
import { eq, desc } from 'drizzle-orm';
import { generateReflectionsExcel } from '../../../../utils/excelExport';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || !canAccessAdminPanel(locals.user.role)) {
    return new Response('Akses ditolak.', { status: 403 });
  }

  if (!isDbConfigured()) {
    return new Response('Database belum terhubung.', { status: 503 });
  }

  try {
    await ensureDbInitialized();

    const rawReflections = await db.select({
      id: userSubmissions.id,
      userName: users.name,
      userEmail: users.email,
      studentClass: users.studentClass,
      lessonSlug: userSubmissions.lessonSlug,
      submissionType: userSubmissions.submissionType,
      formData: userSubmissions.formData,
      teacherFeedback: userSubmissions.teacherFeedback,
      status: userSubmissions.status,
      submittedAt: userSubmissions.submittedAt,
    }).from(userSubmissions)
      .innerJoin(users, eq(userSubmissions.userId, users.id))
      .where(eq(userSubmissions.submissionType, 'reflection'))
      .orderBy(desc(userSubmissions.submittedAt));

    const parsedReflections = rawReflections.map(r => {
      let data: any = {};
      try {
        if (typeof r.formData === 'string') {
          data = JSON.parse(r.formData);
        } else if (typeof r.formData === 'object' && r.formData !== null) {
          data = r.formData;
        }
      } catch (e) {
        data = {};
      }

      return {
        id: r.id,
        userName: r.userName,
        userEmail: r.userEmail,
        studentClass: r.studentClass,
        lessonSlug: r.lessonSlug,
        q1: data.q1 || data.halBaru || '-',
        q2: data.q2 || data.pandangan || '-',
        q3: data.q3 || data.kendala || '-',
        q4: data.q4 || data.komitmen || '-',
        teacherFeedback: r.teacherFeedback || '-',
        status: r.status,
        submittedAt: r.submittedAt,
      };
    });

    const excelBuffer = await generateReflectionsExcel(parsedReflections);

    const now = new Date();
    const dateTag = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const filename = `Rekap_Jurnal_Refleksi_PPLG_${dateTag}.xlsx`;

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (err: any) {
    return new Response(`Gagal menghasilkan file Excel Refleksi: ${err.message || 'Server error'}`, { status: 500 });
  }
};
