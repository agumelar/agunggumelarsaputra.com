import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

export const DEFAULT_ADMIN_EMAILS = [
  'rplchatgptpro@gmail.com',
  'agunggumelarsaputra@gmail.com',
  'agunggumelar@smkn1rongga.sch.id',
];

export function getAdminEmails(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS 
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
    : [];
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase()), ...envAdmins]));
}

export function isTeacherEmail(email: string): boolean {
  if (!email) return false;
  const adminList = getAdminEmails();
  return adminList.includes(email.trim().toLowerCase());
}

export interface UserSessionPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export function signToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
  } catch {
    return null;
  }
}
