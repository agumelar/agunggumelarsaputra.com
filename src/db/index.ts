import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

export function getDatabaseUrl(): string {
  const url = 
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL ||
    process.env.VERCEL_POSTGRES_URL ||
    '';
  return url.trim();
}

const connectionString = getDatabaseUrl();
export const sql = connectionString ? neon(connectionString) : null;
export const db = sql ? drizzle(sql, { schema }) : (null as any);

let isInitialized = false;
let initPromise: Promise<boolean> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(getDatabaseUrl() && sql);
}

export async function ensureDbInitialized(): Promise<{ success: boolean; message?: string }> {
  if (!isDbConfigured() || !sql) {
    return { 
      success: false, 
      message: 'POSTGRES_URL belum dikonfigurasi pada Vercel Environment Variables.' 
    };
  }

  if (isInitialized) {
    return { success: true };
  }

  if (initPromise) {
    const ok = await initPromise;
    return { success: ok };
  }

  initPromise = (async () => {
    try {
      // Execute consolidated DDL in one go to minimize serverless cold-start latency
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT,
          google_id TEXT UNIQUE,
          role TEXT NOT NULL DEFAULT 'student',
          student_class TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        ALTER TABLE users ADD COLUMN IF NOT EXISTS student_class TEXT;
        
        CREATE TABLE IF NOT EXISTS user_gamification (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          xp INTEGER NOT NULL DEFAULT 0,
          level INTEGER NOT NULL DEFAULT 1,
          streak_days INTEGER NOT NULL DEFAULT 1,
          last_active_date TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS enrollment_tokens (
          id SERIAL PRIMARY KEY,
          token TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          description TEXT,
          target_type TEXT NOT NULL DEFAULT 'all',
          target_slug TEXT,
          target_class TEXT NOT NULL DEFAULT 'Semua Kelas',
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_enrollments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_id INTEGER NOT NULL REFERENCES enrollment_tokens(id) ON DELETE CASCADE,
          enrolled_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL,
          lesson_slug TEXT NOT NULL,
          completed_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL;

        CREATE TABLE IF NOT EXISTS tka_attempts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL,
          score INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          correct_answers INTEGER NOT NULL,
          xp_earned INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        ALTER TABLE tka_attempts ADD COLUMN IF NOT EXISTS token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL;

        CREATE TABLE IF NOT EXISTS user_submissions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL,
          lesson_slug TEXT NOT NULL,
          submission_type TEXT NOT NULL,
          form_data TEXT NOT NULL,
          drive_url TEXT,
          score INTEGER,
          teacher_score INTEGER,
          teacher_level TEXT,
          teacher_feedback TEXT,
          graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          graded_at TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'submitted',
          submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS teacher_score INTEGER;
        ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS teacher_level TEXT;
        ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS teacher_feedback TEXT;
        ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
        ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP;
      `;

      isInitialized = true;
      return true;
    } catch (err) {
      console.error('Warning: Auto-init database tables error (will retry on demand):', err);
      return false;
    } finally {
      initPromise = null;
    }
  })();

  const success = await initPromise;
  return { success };
}
