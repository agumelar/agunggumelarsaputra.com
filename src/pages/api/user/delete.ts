import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { isSuperAdminEmail } from '../../../utils/auth';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }
  await ensureDbInitialized();
  const sessionUser = locals.user;

  if (!sessionUser) {
    return new Response(JSON.stringify({ error: 'Tidak terotentikasi. Silakan masuk terlebih dahulu.' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // Protection: Root Super Admin cannot delete their account
  if (isSuperAdminEmail(sessionUser.email)) {
    return new Response(JSON.stringify({ 
      error: 'Akun Super Admin Utama (Pemilik Website) terproteksi dan tidak dapat dihapus.' 
    }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    const { confirmationText, password } = await request.json();

    // Verification 1: Confirmation text check
    if (!confirmationText || confirmationText.trim() !== 'HAPUS AKUN') {
      return new Response(JSON.stringify({ 
        error: 'Teks konfirmasi salah. Harap ketik "HAPUS AKUN" dengan huruf kapital persis.' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUser.userId)).limit(1);
    if (!dbUser) {
      return new Response(JSON.stringify({ error: 'Pengguna tidak ditemukan.' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Verification 2: If user has a password (registered with email/password), verify password
    if (dbUser.passwordHash && password) {
      const isValid = await bcrypt.compare(password, dbUser.passwordHash);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Kata sandi akun salah.' }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }

    // Delete user from DB (Cascades to all gamification, attempts, and progress records)
    await db.delete(users).where(eq(users.id, sessionUser.userId));

    // Clear session cookie
    cookies.delete('ags_session', { path: '/' });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Akun Anda beserta seluruh data riwayat belajar berhasil dihapus.' 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error saat menghapus akun.' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
