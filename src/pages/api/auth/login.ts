import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../utils/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  await ensureDbInitialized();
  try {
    const { email, password } = await request.json();

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.passwordHash) {
      return new Response(JSON.stringify({ error: 'Email atau password salah.' }), { status: 400 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Email atau password salah.' }), { status: 400 });
    }

    const ADMIN_EMAILS = [
      'rplchatgptpro@gmail.com',
      'agunggumelarsaputra@gmail.com',
      'agunggumelar@smkn1rongga.sch.id'
    ];
    let userRole = user.role;
    if (ADMIN_EMAILS.includes(user.email.toLowerCase()) && user.role !== 'admin') {
      await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id));
      userRole = 'admin';
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name, role: userRole });

    cookies.set('ags_session', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true, user: { id: user.id, name: user.name, email: user.email } }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 });
  }
};
