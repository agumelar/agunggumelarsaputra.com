import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../../../db';
import { enrollmentTokens } from '../../../../db/schema';
import { canAccessAdminPanel } from '../../../../utils/auth';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !canAccessAdminPanel(locals.user.role)) {
    return new Response(JSON.stringify({ error: 'Akses ditolak.' }), { status: 403 });
  }

  try {
    await ensureDbInitialized();
    const { tokenId, isActive } = await request.json();

    if (!tokenId) {
      return new Response(JSON.stringify({ error: 'ID Token tidak valid.' }), { status: 400 });
    }

    await db.update(enrollmentTokens)
      .set({ isActive: Boolean(isActive) })
      .where(eq(enrollmentTokens.id, tokenId));

    return new Response(JSON.stringify({ success: true, isActive: Boolean(isActive) }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Gagal mengubah status token.' }), { status: 500 });
  }
};
