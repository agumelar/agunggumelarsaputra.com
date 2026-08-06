import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { enrollmentTokens } from '../../../../db/schema';
import { canAccessAdminPanel } from '../../../../utils/auth';

function generateRandomToken(prefix: string = 'RPL'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix.toUpperCase()}-${rand}`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !canAccessAdminPanel(locals.user.role)) {
    return new Response(JSON.stringify({ error: 'Akses ditolak. Khusus Guru dan Admin.' }), { status: 403 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }

  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { title, description, targetType, targetSlug, targetClass, customToken, expiresAt } = body;

    if (!title || title.trim().length < 3) {
      return new Response(JSON.stringify({ error: 'Judul sesi token minimal 3 karakter.' }), { status: 400 });
    }

    let tokenCode = (customToken && customToken.trim()) 
      ? customToken.trim().toUpperCase().replace(/\s+/g, '-')
      : generateRandomToken(targetClass && targetClass !== 'Semua Kelas' ? targetClass.replace(/\s+/g, '') : 'AGS');

    let finalTargetType = targetType || 'all';
    let finalTargetSlug = targetSlug || null;
    if (targetType === 'orientasi-pplg') {
      finalTargetType = 'module';
      finalTargetSlug = 'orientasi-pplg';
    } else if (targetType === 'tka') {
      finalTargetType = 'tka';
      finalTargetSlug = 'tka-pplg';
    }

    const [newToken] = await db.insert(enrollmentTokens).values({
      token: tokenCode,
      title: title.trim(),
      description: description ? description.trim() : null,
      targetType: finalTargetType,
      targetSlug: finalTargetSlug,
      targetClass: targetClass || 'Semua Kelas',
      isActive: true,
      createdBy: locals.user.userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();

    return new Response(JSON.stringify({ success: true, token: newToken }), { status: 200 });
  } catch (err: any) {
    if (err.message && err.message.includes('unique')) {
      return new Response(JSON.stringify({ error: 'Kode token tersebut sudah pernah digunakan. Harap buat kode lain.' }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: err.message || 'Gagal membuat token.' }), { status: 500 });
  }
};
