import { defineMiddleware } from 'astro:middleware';
import { verifyToken, canAccessAdminPanel, isSuperAdminEmail, isTeacherEmail } from './utils/auth';


export const onRequest = defineMiddleware(async (context, next) => {
  let user = null;
  try {
    const token = context.cookies.get('ags_session')?.value;
    user = token ? verifyToken(token) : null;
    if (user) {
      if (isSuperAdminEmail(user.email)) {
        user.role = 'superadmin';
      } else if (isTeacherEmail(user.email) || user.role === 'teacher' || user.role === 'admin') {
        user.role = 'teacher';
      }
    }
  } catch {
    user = null;
  }
  context.locals.user = user;

  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Catalog page (/pembelajaran) is public for guests to browse,
  // but subroutes (/pembelajaran/orientasi-pplg, /pembelajaran/tka-pplg, /pembelajaran/[slug]) require login.
  const isProtectedSubroute = pathname.startsWith('/pembelajaran/') && pathname !== '/pembelajaran' && pathname !== '/pembelajaran/';
  const isProtected = pathname.startsWith('/dashboard') || isProtectedSubroute || (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin'));

  if (isProtected && !user) {
    return context.redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  // Admin and Teacher route protection (pages under /admin, API handles its own JSON auth)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin') && !canAccessAdminPanel(user?.role)) {
    return context.redirect('/dashboard?error=unauthorized_admin');
  }

  return next();
});
