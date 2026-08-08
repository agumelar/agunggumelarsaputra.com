import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../db';
import { users, userGamification } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ 
      leaderboard: [],
      currentUserRank: null,
      message: 'Database belum terhubung.' 
    }), { status: 200 });
  }

  try {
    await ensureDbInitialized();
    const url = new URL(request.url);
    const classFilter = url.searchParams.get('class');
    const limit = Math.min(50, Math.max(5, Number(url.searchParams.get('limit')) || 10));
    const currentUserId = locals.user?.userId;

    let query = db.select({
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
    .where(eq(users.role, 'student'))
    .orderBy(desc(userGamification.xp));

    let allStudents = await query;

    // Filter by class if requested and not "all" / "Semua"
    if (classFilter && classFilter !== 'all' && classFilter !== 'Semua Kelas' && classFilter !== 'Semua') {
      allStudents = allStudents.filter(u => u.studentClass === classFilter);
    }

    // Assign ranking
    const rankedList = allStudents.map((item, index) => ({
      rank: index + 1,
      id: item.id,
      name: item.name,
      studentClass: item.studentClass || 'PPLG',
      avatarUrl: item.avatarUrl,
      xp: item.xp,
      level: item.level,
      streakDays: item.streakDays,
      isCurrentUser: currentUserId ? item.id === currentUserId : false,
    }));

    // Find current user rank
    const currentUserRank = currentUserId 
      ? rankedList.find(u => u.id === currentUserId) || null 
      : null;

    const topLeaderboard = rankedList.slice(0, limit);

    return new Response(JSON.stringify({
      success: true,
      totalStudents: rankedList.length,
      leaderboard: topLeaderboard,
      currentUserRank,
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
