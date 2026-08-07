import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { enrollmentTokens, userEnrollments, users, tkaAttempts, userProgress } from '../../../../db/schema';
import { canAccessAdminPanel } from '../../../../utils/auth';
import { eq, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ url, locals }) => {
  if (!locals.user || !canAccessAdminPanel(locals.user.role)) {
    return new Response(JSON.stringify({ error: 'Akses ditolak.' }), { status: 403 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }

  const tokenIdParam = url.searchParams.get('tokenId');
  if (!tokenIdParam) {
    return new Response(JSON.stringify({ error: 'Parameter tokenId diperlukan.' }), { status: 400 });
  }

  const tokenId = parseInt(tokenIdParam, 10);
  if (isNaN(tokenId)) {
    return new Response(JSON.stringify({ error: 'tokenId tidak valid.' }), { status: 400 });
  }

  try {
    await ensureDbInitialized();

    const [token] = await db.select().from(enrollmentTokens).where(eq(enrollmentTokens.id, tokenId)).limit(1);
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token sesi tidak ditemukan.' }), { status: 404 });
    }

    // Get all enrolled users for this token
    const enrolledUsers = await db.select({
      enrollmentId: userEnrollments.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      studentClass: users.studentClass,
      enrolledAt: userEnrollments.enrolledAt,
    }).from(userEnrollments)
      .innerJoin(users, eq(userEnrollments.userId, users.id))
      .where(eq(userEnrollments.tokenId, tokenId))
      .orderBy(desc(userEnrollments.enrolledAt));

    // Get all exam attempts under this token
    const attempts = await db.select({
      id: tkaAttempts.id,
      userId: tkaAttempts.userId,
      score: tkaAttempts.score,
      totalQuestions: tkaAttempts.totalQuestions,
      correctAnswers: tkaAttempts.correctAnswers,
      xpEarned: tkaAttempts.xpEarned,
      createdAt: tkaAttempts.createdAt,
    }).from(tkaAttempts)
      .where(eq(tkaAttempts.tokenId, tokenId))
      .orderBy(desc(tkaAttempts.createdAt));

    // Get all lesson progresses under this token
    const progressList = await db.select({
      id: userProgress.id,
      userId: userProgress.userId,
      lessonSlug: userProgress.lessonSlug,
      completedAt: userProgress.completedAt,
    }).from(userProgress)
      .where(eq(userProgress.tokenId, tokenId))
      .orderBy(desc(userProgress.completedAt));

    // Build consolidated student report
    const studentReports = enrolledUsers.map(u => {
      // Find best/latest attempt by this student for this token
      const userAttempts = attempts.filter(a => a.userId === u.userId);
      const latestAttempt = userAttempts.length > 0 ? userAttempts[0] : null;
      const userCompletedLessons = progressList.filter(p => p.userId === u.userId);

      return {
        userId: u.userId,
        name: u.name,
        email: u.email,
        studentClass: u.studentClass || '-',
        enrolledAt: u.enrolledAt,
        hasTakenExam: userAttempts.length > 0,
        examScore: latestAttempt ? latestAttempt.score : null,
        correctAnswers: latestAttempt ? latestAttempt.correctAnswers : null,
        totalQuestions: latestAttempt ? latestAttempt.totalQuestions : null,
        examSubmittedAt: latestAttempt ? latestAttempt.createdAt : null,
        totalLessonsCompleted: userCompletedLessons.length,
      };
    });

    const totalEnrolled = studentReports.length;
    const studentsWithExam = studentReports.filter(s => s.hasTakenExam);
    const avgScore = studentsWithExam.length > 0
      ? Math.round(studentsWithExam.reduce((acc, curr) => acc + (curr.examScore || 0), 0) / studentsWithExam.length)
      : 0;
    const passCount = studentsWithExam.filter(s => (s.examScore || 0) >= 73).length;
    const passRate = studentsWithExam.length > 0
      ? Math.round((passCount / studentsWithExam.length) * 100)
      : 0;

    return new Response(JSON.stringify({
      success: true,
      token,
      stats: {
        totalEnrolled,
        totalExamTaken: studentsWithExam.length,
        avgScore,
        passCount,
        passRate,
      },
      students: studentReports,
    }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Gagal memuat rekapitulasi token.' }), { status: 500 });
  }
};
