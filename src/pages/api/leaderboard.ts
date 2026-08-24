import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../db';
import { users, userGamification, enrollmentTokens, userEnrollments, userProgress, tkaAttempts, userSubmissions } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ 
      leaderboard: [],
      currentUserRank: null,
      tokensList: [],
      message: 'Database belum terhubung.' 
    }), { status: 200 });
  }

  try {
    await ensureDbInitialized();
    const url = new URL(request.url);
    const subjectFilter = url.searchParams.get('subject') || 'all'; // 'all', 'orientasi-pplg', 'tka', 'literasi'
    const classFilter = url.searchParams.get('class');
    const tokenIdFilter = url.searchParams.get('tokenId');
    const limit = Math.min(100, Math.max(5, Number(url.searchParams.get('limit')) || 50));
    const currentUserId = locals.user?.userId;

    // 1. Fetch all student users and their base gamification
    const allStudents = await db.select({
      id: users.id,
      name: users.name,
      studentClass: users.studentClass,
      avatarUrl: users.avatarUrl,
      role: users.role,
      xp: userGamification.xp,
      level: userGamification.level,
      streakDays: userGamification.streakDays,
      lastActiveDate: userGamification.lastActiveDate,
    })
    .from(userGamification)
    .innerJoin(users, eq(userGamification.userId, users.id))
    .where(eq(users.role, 'student'));

    // 2. Fetch all user enrollments with token info
    const enrollments = await db.select({
      userId: userEnrollments.userId,
      tokenId: enrollmentTokens.id,
      tokenCode: enrollmentTokens.token,
      tokenTitle: enrollmentTokens.title,
      targetType: enrollmentTokens.targetType,
      targetClass: enrollmentTokens.targetClass,
    })
    .from(userEnrollments)
    .innerJoin(enrollmentTokens, eq(userEnrollments.tokenId, enrollmentTokens.id));

    // Map user to their enrolled tokens
    const userEnrollmentsMap = new Map<number, typeof enrollments>();
    enrollments.forEach(e => {
      if (!userEnrollmentsMap.has(e.userId)) userEnrollmentsMap.set(e.userId, []);
      userEnrollmentsMap.get(e.userId)!.push(e);
    });

    // 3. Fetch user progress & TKA attempts
    const [allProgress, allTkaAttempts, allSubmissions, allTokensList] = await Promise.all([
      db.select({ userId: userProgress.userId, lessonSlug: userProgress.lessonSlug }).from(userProgress),
      db.select({ userId: tkaAttempts.userId, score: tkaAttempts.score, xpEarned: tkaAttempts.xpEarned }).from(tkaAttempts),
      db.select({ userId: userSubmissions.userId, submissionType: userSubmissions.submissionType }).from(userSubmissions),
      db.select({
        id: enrollmentTokens.id,
        token: enrollmentTokens.token,
        title: enrollmentTokens.title,
        targetType: enrollmentTokens.targetType,
        targetClass: enrollmentTokens.targetClass,
      }).from(enrollmentTokens).where(eq(enrollmentTokens.isActive, true)),
    ]);

    // Compute metrics per user
    const userProgressCountMap = new Map<number, number>();
    const userOrientasiCountMap = new Map<number, number>();
    const userTkaCountMap = new Map<number, number>();
    const userTkaXpMap = new Map<number, number>();
    const userTkaTopScoreMap = new Map<number, number>();
    const userLiterasiCountMap = new Map<number, number>();

    allProgress.forEach(p => {
      userProgressCountMap.set(p.userId, (userProgressCountMap.get(p.userId) || 0) + 1);
      if (p.lessonSlug.startsWith('orientasi-pplg')) {
        userOrientasiCountMap.set(p.userId, (userOrientasiCountMap.get(p.userId) || 0) + 1);
      } else if (p.lessonSlug.startsWith('tka-')) {
        userTkaCountMap.set(p.userId, (userTkaCountMap.get(p.userId) || 0) + 1);
      }
    });

    allTkaAttempts.forEach(t => {
      userTkaXpMap.set(t.userId, (userTkaXpMap.get(t.userId) || 0) + t.xpEarned);
      const curTop = userTkaTopScoreMap.get(t.userId) || 0;
      if (t.score > curTop) userTkaTopScoreMap.set(t.userId, t.score);
    });

    allSubmissions.forEach(s => {
      if (s.submissionType === 'resensi') {
        userLiterasiCountMap.set(s.userId, (userLiterasiCountMap.get(s.userId) || 0) + 1);
      }
    });

    // Filter students by class / token if requested
    let filteredStudents = allStudents;

    if (tokenIdFilter && tokenIdFilter !== 'all') {
      const numTokenId = Number(tokenIdFilter);
      filteredStudents = filteredStudents.filter(u => {
        const uTokens = userEnrollmentsMap.get(u.id) || [];
        return uTokens.some(t => t.tokenId === numTokenId);
      });
    } else if (classFilter && classFilter !== 'all' && classFilter !== 'Semua Kelas' && classFilter !== 'Semua' && classFilter !== 'Semua Siswa & Rombel (Global)') {
      const target = classFilter.trim().toLowerCase();
      filteredStudents = filteredStudents.filter(u => {
        const uTokens = userEnrollmentsMap.get(u.id) || [];
        const studentClass = (u.studentClass || '').trim().toLowerCase();

        // Exact class match (e.g. "10 rpl 1" === "10 rpl 1")
        if (studentClass === target) return true;

        // Token code match (e.g. "12rpl1-26")
        if (uTokens.some(t => t.tokenCode.toLowerCase() === target)) return true;

        // Token target class match (e.g. token assigned to "10 RPL 1")
        if (uTokens.some(t => (t.targetClass || '').toLowerCase() === target)) return true;

        return false;
      });
    }

    // Filter by subject & sort accordingly
    if (subjectFilter === 'orientasi-pplg') {
      filteredStudents.sort((a, b) => {
        const cntA = userOrientasiCountMap.get(a.id) || 0;
        const cntB = userOrientasiCountMap.get(b.id) || 0;
        if (cntB !== cntA) return cntB - cntA;
        return b.xp - a.xp;
      });
    } else if (subjectFilter === 'tka') {
      filteredStudents.sort((a, b) => {
        const scoreA = userTkaTopScoreMap.get(a.id) || 0;
        const scoreB = userTkaTopScoreMap.get(b.id) || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        const xpTkaA = userTkaXpMap.get(a.id) || 0;
        const xpTkaB = userTkaXpMap.get(b.id) || 0;
        if (xpTkaB !== xpTkaA) return xpTkaB - xpTkaA;
        return b.xp - a.xp;
      });
    } else if (subjectFilter === 'literasi') {
      filteredStudents.sort((a, b) => {
        const litA = userLiterasiCountMap.get(a.id) || 0;
        const litB = userLiterasiCountMap.get(b.id) || 0;
        if (litB !== litA) return litB - litA;
        return b.xp - a.xp;
      });
    } else {
      // Default 'all'
      filteredStudents.sort((a, b) => b.xp - a.xp);
    }

    // Assign rank & format response
    const rankedList = filteredStudents.map((item, index) => {
      const uTokens = userEnrollmentsMap.get(item.id) || [];
      const primaryToken = uTokens[0];
      const displayClass = item.studentClass || primaryToken?.targetClass || primaryToken?.tokenCode || 'PPLG';
      const completedModulesCount = userProgressCountMap.get(item.id) || 0;
      const orientasiCount = userOrientasiCountMap.get(item.id) || 0;
      const tkaCount = userTkaCountMap.get(item.id) || 0;
      const tkaTopScore = userTkaTopScoreMap.get(item.id) ?? null;
      const literasiCount = userLiterasiCountMap.get(item.id) || 0;

      return {
        rank: index + 1,
        id: item.id,
        name: item.name,
        studentClass: displayClass,
        tokenCode: primaryToken?.tokenCode || null,
        tokenTitle: primaryToken?.tokenTitle || null,
        avatarUrl: item.avatarUrl,
        xp: item.xp,
        level: item.level,
        streakDays: item.streakDays,
        completedModulesCount,
        orientasiCount,
        tkaCount,
        tkaTopScore,
        literasiCount,
        isCurrentUser: currentUserId ? item.id === currentUserId : false,
      };
    });

    const currentUserRank = currentUserId 
      ? rankedList.find(u => u.id === currentUserId) || null 
      : null;

    const topLeaderboard = rankedList.slice(0, limit);

    return new Response(JSON.stringify({
      success: true,
      totalStudents: rankedList.length,
      leaderboard: topLeaderboard,
      currentUserRank,
      tokensList: allTokensList,
      timestamp: new Date().toISOString(),
    }), { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch (err: any) {
    console.error('Error fetching live leaderboard:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
