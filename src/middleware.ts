import { defineMiddleware } from 'astro:middleware';
import { verifyToken, canAccessAdminPanel, isSuperAdminEmail } from './utils/auth';

const PROTECTED_ROUTES = ['/dashboard', '/pembelajaran', '/admin'];

export const onRequest = defineMiddleware(async (context, next) => {
  let user = null;
  try {
    const token = context.cookies.get('ags_session')?.value;
    user = token ? verifyToken(token) : null;
    if (user) {
      if (isSuperAdminEmail(user.email)) {
        user.role = 'superadmin';
      }
    }
  } catch {
    user = null;
  }
  context.locals.user = user;

  const url = new URL(context.request.url);
  const pathname = url.pathname;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  
  if (isProtected && !user) {
    return context.redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  // Admin and Teacher route protection
  if (pathname.startsWith('/admin') && !canAccessAdminPanel(user?.role)) {
    return context.redirect('/dashboard?error=unauthorized_admin');
  }

  return next();
});
