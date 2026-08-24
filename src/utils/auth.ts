import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

export const DEFAULT_SUPERADMIN_EMAILS = [
  'agumelarsaputra@gmail.com',
  'agunggumelarsaputra@gmail.com',
];

export function getSuperAdminEmails(): string[] {
  const envSuperAdmins = process.env.SUPERADMIN_EMAILS 
    ? process.env.SUPERADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
    : [];
  return Array.from(new Set([...DEFAULT_SUPERADMIN_EMAILS.map(e => e.toLowerCase()), ...envSuperAdmins]));
}

export function isSuperAdminEmail(email: string): boolean {
  if (!email) return false;
  const superAdminList = getSuperAdminEmails();
  return superAdminList.includes(email.trim().toLowerCase());
}

/** Check if a role has access to the Teacher & Admin Management Console */
export function canAccessAdminPanel(role?: string | null): boolean {
  if (!role) return false;
  return role === 'superadmin' || role === 'teacher' || role === 'admin';
}

/** Check if a role has root Super Admin privileges */
export function isSuperAdmin(role?: string | null): boolean {
  return role === 'superadmin';
}

export function getTeacherEmails(): string[] {
  const envTeachers = process.env.TEACHER_EMAILS 
    ? process.env.TEACHER_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
    : [];
  return Array.from(new Set([...getSuperAdminEmails(), ...envTeachers]));
}

/** Check if an email belongs to a Teacher or Admin */
export function isTeacherEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (isSuperAdminEmail(clean)) return true;
  const teacherList = getTeacherEmails();
  return teacherList.includes(clean);
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
