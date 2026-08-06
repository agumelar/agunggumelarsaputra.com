import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
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
    const { name, studentClass, currentPassword, newPassword } = body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Nama lengkap harus diisi minimal 2 karakter.' }), { status: 400 });
    }

    if (name.trim().length > 100) {
      return new Response(JSON.stringify({ error: 'Nama lengkap maksimal 100 karakter.' }), { status: 400 });
    }

    const cleanName = name.trim();
    const cleanClass = typeof studentClass === 'string' ? studentClass.trim().substring(0, 50) : null;

    // Fetch user from DB
    const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUser.userId)).limit(1);
    if (!dbUser) {
      return new Response(JSON.stringify({ error: 'Pengguna tidak ditemukan di database.' }), { status: 404 });
    }

    let passwordHashToUpdate: string | undefined = undefined;

    // If changing password
    if (newPassword) {
      if (newPassword.length < 6) {
        return new Response(JSON.stringify({ error: 'Kata sandi baru minimal 6 karakter.' }), { status: 400 });
      }

      // If user currently has a password, verify currentPassword
      if (dbUser.passwordHash) {
        if (!currentPassword) {
          return new Response(JSON.stringify({ error: 'Silakan masukkan kata sandi lama Anda.' }), { status: 400 });
        }
        const isMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
        if (!isMatch) {
          return new Response(JSON.stringify({ error: 'Kata sandi saat ini tidak cocok.' }), { status: 400 });
        }
      }

      passwordHashToUpdate = await bcrypt.hash(newPassword, 10);
    }

    // Determine current role
    let currentRole = dbUser.role;
    if (isSuperAdminEmail(dbUser.email)) {
      currentRole = 'superadmin';
    }

    // Update in database
    const updateData: any = {
      name: cleanName,
      studentClass: cleanClass,
      role: currentRole,
    };
    if (passwordHashToUpdate) {
      updateData.passwordHash = passwordHashToUpdate;
    }

    await db.update(users).set(updateData).where(eq(users.id, dbUser.id));

    // Sign new JWT token with updated profile
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
        message: 'Profil berhasil diperbarui.',
        user: {
          id: dbUser.id,
          name: cleanName,
          email: dbUser.email,
          studentClass: cleanClass,
          role: currentRole,
        },
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Profile Update Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Terjadi kesalahan pada server.' }), { status: 500 });
  }
};
