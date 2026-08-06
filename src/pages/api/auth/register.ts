import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../../db';
import { users, userGamification } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken, isSuperAdminEmail } from '../../../utils/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  await ensureDbInitialized();
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password || password.length < 6) {
      return new Response(JSON.stringify({ error: 'Input tidak valid. Password minimal 6 karakter.' }), { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Email sudah terdaftar.' }), { status: 400 });
    }

    const assignedRole = isSuperAdminEmail(cleanEmail) ? 'superadmin' : 'student';
    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({ 
      name, 
      email: cleanEmail, 
      passwordHash,
      role: assignedRole,
    }).returning();
    await db.insert(userGamification).values({ userId: newUser.id, xp: 0, level: 1 });

    const token = signToken({ userId: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });

    cookies.set('ags_session', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Terjadi kesalahan server.' }), { status: 500 });
  }
};
