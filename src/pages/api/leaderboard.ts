import type { APIRoute } from 'astro';
import { db } from '../../db';
import { users, userGamification } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const topUsers = await db.select({
      id: users.id,
      name: users.name,
      xp: userGamification.xp,
      level: userGamification.level,
    }).from(userGamification)
      .innerJoin(users, eq(userGamification.userId, users.id))
      .orderBy(desc(userGamification.xp))
      .limit(10);

    return new Response(JSON.stringify({ leaderboard: topUsers }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
