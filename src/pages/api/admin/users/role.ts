import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

import { isTeacherEmail } from '../../../../utils/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  const currentUser = locals.user;

  if (!currentUser || currentUser.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Akses ditolak. Anda bukan Administrator/Guru.' }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    const { targetUserId, newRole } = await request.json();

    if (!targetUserId || !['student', 'admin'].includes(newRole)) {
      return new Response(JSON.stringify({ error: 'Data tidak valid.' }), { 
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

    if (isTeacherEmail(targetUser.email) && newRole === 'student') {
      return new Response(JSON.stringify({ error: 'Akun Guru Utama / Administrator Inti tidak dapat diturunkan menjadi Siswa demi keamanan sistem.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Update target user's role
    const [updated] = await db.update(users)
      .set({ role: newRole })
      .where(eq(users.id, Number(targetUserId)))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Pengguna tidak ditemukan.' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Role pengguna ${updated.name} berhasil diubah menjadi ${newRole}.`,
      user: { id: updated.id, name: updated.name, role: updated.role }
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
