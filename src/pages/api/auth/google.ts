import type { APIRoute } from 'astro';
import { Google } from 'arctic';

export const GET: APIRoute = async ({ cookies, redirect }) => {
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

  const google = new Google(
    clientId,
    clientSecret,
    `${process.env.SITE_URL || 'https://agunggumelarsaputracom.vercel.app'}/api/auth/callback/google`
  );

  const state = Math.random().toString(36).substring(2);
  const codeVerifier = Math.random().toString(36).substring(2);

  cookies.set('google_oauth_state', state, { path: '/', httpOnly: true, maxAge: 600 });
  cookies.set('google_code_verifier', codeVerifier, { path: '/', httpOnly: true, maxAge: 600 });

  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);
  return redirect(url.toString());
};
