import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { literasiReports, users } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung.' }), { status: 500 });
  }

  try {
    await ensureDbInitialized();

    const reports = await db.select({
      id: literasiReports.id,
      userId: literasiReports.userId,
      userName: users.name,
      userEmail: users.email,
      studentClass: users.studentClass,
      weekNumber: literasiReports.weekNumber,
      bookTitle: literasiReports.bookTitle,
      author: literasiReports.author,
      publisher: literasiReports.publisher,
      city: literasiReports.city,
      year: literasiReports.year,
      pageCount: literasiReports.pageCount,
      summary: literasiReports.summary,
      moralMessage: literasiReports.moralMessage,
      status: literasiReports.status,
      writingScore: literasiReports.writingScore,
      presentationScore: literasiReports.presentationScore,
      finalScore: literasiReports.finalScore,
      teacherFeedback: literasiReports.teacherFeedback,
      createdAt: literasiReports.createdAt,
    }).from(literasiReports)
      .leftJoin(users, eq(literasiReports.userId, users.id))
      .orderBy(desc(literasiReports.createdAt));

    // Filter 12 RPL 1
    const rpl1 = reports.filter(r => r.studentClass === '12 RPL 1');

    // Deduplicate: Keep latest per student
    const latestPerStudentMap = new Map();
    for (const r of rpl1) {
      if (!latestPerStudentMap.has(r.userId)) {
        latestPerStudentMap.set(r.userId, r);
      }
    }

    const uniqueStudentsReports = Array.from(latestPerStudentMap.values());

    return new Response(JSON.stringify({
      success: true,
      total12RPL1Submissions: rpl1.length,
      totalUniqueStudentsCount: uniqueStudentsReports.length,
      reports: uniqueStudentsReports,
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
