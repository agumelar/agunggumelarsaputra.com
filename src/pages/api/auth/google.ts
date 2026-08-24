import type { APIRoute } from 'astro';
import { Google, generateState, generateCodeVerifier } from 'arctic';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(
      `<html><body style="font-family:sans-serif;background:#090d16;color:#f3f4f6;padding:2rem;text-align:center;">
        <div style="max-width:500px;margin:4rem auto;background:#111827;padding:2rem;border-radius:1rem;border:1px solid #374151;">
          <h2 style="color:#f87171;">Google OAuth belum dikonfigurasi</h2>
          <p style="color:#9ca3af;font-size:14px;">Variabel <code>GOOGLE_CLIENT_ID</code> & <code>GOOGLE_CLIENT_SECRET</code> belum diisi di Environment Variables Vercel.</p>
          <a href="/login" style="display:inline-block;margin-top:1rem;padding:0.6rem 1.2rem;background:#2563eb;color:#fff;text-decoration:none;border-radius:0.5rem;font-weight:bold;">← Kembali ke Login</a>
        </div>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const requestOrigin = new URL(request.url).origin;
  const siteUrl = requestOrigin || process.env.SITE_URL || 'https://agunggumelarsaputra.com';
  const google = new Google(clientId, clientSecret, `${siteUrl}/api/auth/callback/google`);

  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  cookies.set('google_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 10,
  });

  cookies.set('google_code_verifier', codeVerifier, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 10,
  });

  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);
  return redirect(url.toString());
};
