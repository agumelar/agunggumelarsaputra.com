import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { isSuperAdminEmail, isSuperAdmin, canAccessAdminPanel } from '../../../../utils/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung di server.' }), { status: 503 });
  }
  await ensureDbInitialized();
  const currentUser = locals.user;

  // Check if caller is authenticated and has admin/teacher privilege
  if (!currentUser || (!canAccessAdminPanel(currentUser.role) && !isSuperAdminEmail(currentUser.email))) {
    return new Response(JSON.stringify({ 
      error: 'Akses ditolak. Anda tidak memiliki izin untuk mengelola akun pengguna.' 
    }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  const isCurrentSuperAdmin = isSuperAdmin(currentUser.role) || isSuperAdminEmail(currentUser.email);

  try {
    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'ID pengguna tidak valid.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, Number(targetUserId))).limit(1);
    if (!targetUser) {
      return new Response(JSON.stringify({ error: 'Pengguna tidak ditemukan.' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Protection 1: Cannot delete primary Super Admin
    if (isSuperAdminEmail(targetUser.email) || targetUser.role === 'superadmin') {
      return new Response(JSON.stringify({ 
        error: 'Akun Super Admin Utama terproteksi dan tidak dapat dihapus.' 
      }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Protection 2: Cannot delete own account through admin table
    if (targetUser.id === currentUser.userId) {
      return new Response(JSON.stringify({ 
        error: 'Anda tidak dapat menghapus akun Anda sendiri dari panel admin. Gunakan menu profil jika ingin menghapus akun sendiri.' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Protection 3: Regular teachers can only delete student accounts
    if (!isCurrentSuperAdmin && targetUser.role !== 'student') {
      return new Response(JSON.stringify({ 
        error: 'Guru hanya dapat menghapus akun siswa. Akun Guru/Admin hanya dapat dihapus oleh Super Admin.' 
      }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Delete user from DB (Cascades to user_gamification, user_progress, tka_attempts)
    await db.delete(users).where(eq(users.id, Number(targetUserId)));

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Akun ${targetUser.name} (${targetUser.email}) beserta seluruh riwayat nilainya berhasil dihapus secara permanen.` 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error saat menghapus akun pengguna.' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
