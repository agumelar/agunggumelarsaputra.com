import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken, signToken, isSuperAdminEmail } from '../../../utils/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }
  await ensureDbInitialized();
  const token = cookies.get('ags_session')?.value;
  const sessionUser = token ? verifyToken(token) : null;

  if (!sessionUser) {
    return new Response(JSON.stringify({ error: 'Sesi login tidak valid atau telah berakhir.' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, studentClass, avatarUrl } = body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Nama lengkap harus diisi minimal 2 karakter.' }), { status: 400 });
    }

    // Validate class
    if (!studentClass || typeof studentClass !== 'string' || studentClass.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Harap pilih Kelas / Rombel Anda.' }), { status: 400 });
    }

    // Validate avatar
    if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'Harap unggah foto profil Anda (format JPG/PNG/WebP).' }), { status: 400 });
    }

    // Safety check: image data URL shouldn't be excessively large (e.g. max 500KB)
    if (avatarUrl.length > 700000) {
      return new Response(JSON.stringify({ error: 'Ukuran foto terlalu besar. Silakan pilih foto lain atau gunakan kompresi otomatis.' }), { status: 400 });
    }

    const cleanName = name.trim();
    const cleanClass = studentClass.trim().substring(0, 50);

    // Fetch user from DB
    const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUser.userId)).limit(1);
    if (!dbUser) {
      return new Response(JSON.stringify({ error: 'Pengguna tidak ditemukan di database.' }), { status: 404 });
    }

    let currentRole = dbUser.role;
    if (isSuperAdminEmail(dbUser.email)) {
      currentRole = 'superadmin';
    }

    // Update in database
    await db.update(users)
      .set({
        name: cleanName,
        studentClass: cleanClass,
        avatarUrl: avatarUrl,
      })
      .where(eq(users.id, dbUser.id));

    // Refresh JWT session cookie
    const newToken = signToken({
      userId: dbUser.id,
      email: dbUser.email,
      name: cleanName,
      role: currentRole,
    });

    cookies.set('ags_session', newToken, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profil dan foto berhasil disimpan! Selamat belajar.',
        user: {
          id: dbUser.id,
          name: cleanName,
          email: dbUser.email,
          studentClass: cleanClass,
          avatarUrl: avatarUrl,
          role: currentRole,
        },
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Complete Profile Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Terjadi kesalahan pada server.' }), { status: 500 });
  }
};
