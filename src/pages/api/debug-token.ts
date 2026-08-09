import type { APIRoute } from 'astro';
import { db } from '../../db';
import { userEnrollments, enrollmentTokens } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const enrollments = await db.select({
      id: userEnrollments.id,
      token: enrollmentTokens.token,
      title: enrollmentTokens.title,
      targetType: enrollmentTokens.targetType,
      targetSlug: enrollmentTokens.targetSlug,
      isActive: enrollmentTokens.isActive,
      expiresAt: enrollmentTokens.expiresAt,
    })
    .from(userEnrollments)
    .innerJoin(enrollmentTokens, eq(userEnrollments.tokenId, enrollmentTokens.id))
    .where(eq(userEnrollments.userId, 4));

    return new Response(JSON.stringify(enrollments), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
