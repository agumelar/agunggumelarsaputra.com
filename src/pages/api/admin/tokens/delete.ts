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
    const { tokenId } = await request.json();

    if (!tokenId) {
      return new Response(JSON.stringify({ error: 'ID Token tidak valid.' }), { status: 400 });
    }

    await db.delete(enrollmentTokens).where(eq(enrollmentTokens.id, tokenId));

    return new Response(JSON.stringify({ success: true, message: 'Token sesi berhasil dihapus.' }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Gagal menghapus token.' }), { status: 500 });
  }
};
