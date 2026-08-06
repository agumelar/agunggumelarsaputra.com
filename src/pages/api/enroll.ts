import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../db';
import { enrollmentTokens, userEnrollments, users } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Harap masuk (login) terlebih dahulu untuk mendaftar token sesi.' }), { status: 401 });
  }

  try {
    await ensureDbInitialized();
    const { tokenCode } = await request.json();

    if (!tokenCode || typeof tokenCode !== 'string' || tokenCode.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Kode token tidak valid.' }), { status: 400 });
    }

    const cleanToken = tokenCode.trim().toUpperCase();

    const [foundToken] = await db.select().from(enrollmentTokens).where(eq(enrollmentTokens.token, cleanToken)).limit(1);

    if (!foundToken) {
      return new Response(JSON.stringify({ error: 'Kode token tidak ditemukan atau salah. Silakan tanyakan ke guru pengampu.' }), { status: 404 });
    }

    if (!foundToken.isActive) {
      return new Response(JSON.stringify({ error: 'Sesi untuk token ini sudah dinonaktifkan atau ditutup oleh guru.' }), { status: 400 });
    }

    if (foundToken.expiresAt && new Date(foundToken.expiresAt) < new Date()) {
      return new Response(JSON.stringify({ error: 'Masa berlaku token ini sudah kadaluarsa.' }), { status: 400 });
    }

    const userId = locals.user.userId;

    // Check if student already enrolled
    const [existingEnrollment] = await db.select()
      .from(userEnrollments)
      .where(and(eq(userEnrollments.userId, userId), eq(userEnrollments.tokenId, foundToken.id)))
      .limit(1);

    if (!existingEnrollment) {
      await db.insert(userEnrollments).values({
        userId,
        tokenId: foundToken.id,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Berhasil enroll ke sesi: "${foundToken.title}" (${foundToken.targetClass})`,
      token: {
        id: foundToken.id,
        token: foundToken.token,
        title: foundToken.title,
        description: foundToken.description,
        targetType: foundToken.targetType,
        targetSlug: foundToken.targetSlug,
        targetClass: foundToken.targetClass,
      }
    }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Gagal memproses pendaftaran token.' }), { status: 500 });
  }
};
