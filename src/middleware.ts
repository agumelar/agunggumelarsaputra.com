import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './utils/auth';

const PROTECTED_ROUTES = ['/dashboard', '/pembelajaran'];

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get('ags_session')?.value;
  const user = token ? verifyToken(token) : null;
  context.locals.user = user;

  const url = new URL(context.request.url);
  const pathname = url.pathname;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  
  if (isProtected && !user) {
    return context.redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  return next();
});
