import type { APIRoute } from 'astro';
import { Google } from 'arctic';
import { db, ensureDbInitialized } from '../../../../db';
import { users, userGamification } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { signToken, isSuperAdminEmail } from '../../../../utils/auth';

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  await ensureDbInitialized();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const requestOrigin = new URL(request.url).origin;
  const siteUrl = requestOrigin || process.env.SITE_URL || 'https://agunggumelarsaputra.com';

  if (!clientId || !clientSecret) {
    return new Response('Google OAuth config missing', { status: 400 });
  }

  const google = new Google(clientId, clientSecret, `${siteUrl}/api/auth/callback/google`);

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

    if (!googleUser || !googleUser.email) {
      return new Response('Gagal mendapatkan profil akun Google.', { status: 400 });
    }

    const cleanEmail = googleUser.email.trim().toLowerCase();
    const isTargetSuperAdmin = isSuperAdminEmail(cleanEmail);
    const assignedRole = isTargetSuperAdmin ? 'superadmin' : 'student';

    let [existingUser] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);

    if (!existingUser) {
      [existingUser] = await db.insert(users).values({
        name: googleUser.name || 'Siswa PPLG',
        email: cleanEmail,
        googleId: googleUser.sub,
        role: assignedRole,
        avatarUrl: googleUser.picture,
      }).returning();

      await db.insert(userGamification).values({ userId: existingUser.id, xp: 0, level: 1 });
    } else if (isTargetSuperAdmin && existingUser.role !== 'superadmin') {
      [existingUser] = await db.update(users)
        .set({ role: 'superadmin' })
        .where(eq(users.id, existingUser.id))
        .returning();
    }

    const token = signToken({ 
      userId: existingUser.id, 
      email: existingUser.email, 
      name: existingUser.name, 
      role: existingUser.role 
    });
    cookies.set('ags_session', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return redirect('/dashboard');
  } catch (err: any) {
    console.error('Google OAuth Error:', err);
    return new Response(`Failed Google OAuth Callback: ${err.message || err}`, { status: 500 });
  }
};
