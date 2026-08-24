import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { canAccessAdminPanel, isSuperAdmin, isSuperAdminEmail } from '../../../../utils/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }
  await ensureDbInitialized();
  const currentUser = locals.user;

  // Check: Admin, Teacher, or Super Admin can reset student password
  if (!currentUser || !canAccessAdminPanel(currentUser.role)) {
    return new Response(JSON.stringify({ 
      error: 'Akses ditolak. Hanya Guru dan Administrator yang dapat mereset password siswa.' 
    }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    const { targetUserId, newPassword } = await request.json();

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'Target User ID wajib diisi.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return new Response(JSON.stringify({ error: 'Password baru minimal harus 6 karakter.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, Number(targetUserId))).limit(1);
    if (!targetUser) {
      return new Response(JSON.stringify({ error: 'Pengguna tidak ditemukan di database.' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Safety: Normal teachers cannot reset Super Admin passwords
    const isTargetSuperAdmin = isSuperAdmin(targetUser.role) || isSuperAdminEmail(targetUser.email);
    const isCurrentSuperAdmin = isSuperAdmin(currentUser.role) || isSuperAdminEmail(currentUser.email);

    if (isTargetSuperAdmin && !isCurrentSuperAdmin) {
      return new Response(JSON.stringify({ error: 'Hanya Super Admin yang dapat mereset akun Super Admin.' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Hash the new password with bcrypt
    const passwordHash = await bcrypt.hash(newPassword.trim(), 10);

    // Update user's password in database
    await db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, Number(targetUserId)));

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Password untuk akun "${targetUser.name}" (${targetUser.email}) berhasil direset menjadi: "${newPassword.trim()}". Berikan password ini kepada siswa.`,
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email }
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err: any) {
    console.error('Reset Password Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal mereset password di server.' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
