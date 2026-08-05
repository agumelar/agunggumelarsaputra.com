import type { APIRoute } from 'astro';
import { Google } from 'arctic';

const google = new Google(
  process.env.GOOGLE_CLIENT_ID || '',
  process.env.GOOGLE_CLIENT_SECRET || '',
  `${process.env.SITE_URL || 'http://localhost:4321'}/api/auth/callback/google`
);

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const state = Math.random().toString(36).substring(2);
  const codeVerifier = Math.random().toString(36).substring(2);

  cookies.set('google_oauth_state', state, { path: '/', httpOnly: true, maxAge: 600 });
  cookies.set('google_code_verifier', codeVerifier, { path: '/', httpOnly: true, maxAge: 600 });

  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);
  return redirect(url.toString());
};
