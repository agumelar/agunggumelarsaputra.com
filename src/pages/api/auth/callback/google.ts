import type { APIRoute } from 'astro';
import { Google } from 'arctic';
import { db } from '../../../../db';
import { users, userGamification } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { signToken } from '../../../../utils/auth';

const google = new Google(
  process.env.GOOGLE_CLIENT_ID || '',
  process.env.GOOGLE_CLIENT_SECRET || '',
  `${process.env.SITE_URL || 'http://localhost:4321'}/api/auth/callback/google`
);

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('google_oauth_state')?.value;
  const storedVerifier = cookies.get('google_code_verifier')?.value;

  if (!code || !state || !storedState || state !== storedState || !storedVerifier) {
    return new Response('OAuth state mismatch', { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedVerifier);
    const googleUserRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });
    const googleUser = await googleUserRes.json();

    let [existingUser] = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);

    if (!existingUser) {
      [existingUser] = await db.insert(users).values({
        name: googleUser.name || 'Siswa PPLG',
        email: googleUser.email,
        googleId: googleUser.sub,
        avatarUrl: googleUser.picture,
      }).returning();

      await db.insert(userGamification).values({ userId: existingUser.id, xp: 0, level: 1 });
    }

    const token = signToken({ userId: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.role });
    cookies.set('ags_session', token, { path: '/', httpOnly: true, secure: import.meta.env.PROD, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });

    return redirect('/dashboard');
  } catch (err) {
    return new Response('Failed Google OAuth Callback', { status: 500 });
  }
};
