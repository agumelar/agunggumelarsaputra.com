import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
const sql = connectionString ? neon(connectionString) : null;
export const db = sql ? drizzle(sql, { schema }) : (null as any);

let isInitialized = false;

export async function ensureDbInitialized() {
  if (isInitialized) return;
  if (!sql) {
    throw new Error('Database Postgres belum dikonfigurasi. Variabel POSTGRES_URL belum diisi di Vercel Environment Variables.');
  }

  try {
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
    `;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS student_class TEXT;`;
    
    await sql`
      CREATE TABLE IF NOT EXISTS user_gamification (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        xp INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        streak_days INTEGER NOT NULL DEFAULT 1,
        last_active_date TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_id INTEGER NOT NULL REFERENCES enrollment_tokens(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL,
        lesson_slug TEXT NOT NULL,
        completed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    await sql`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL;`;

    await sql`
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
    `;
    await sql`ALTER TABLE tka_attempts ADD COLUMN IF NOT EXISTS token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL;`;

    isInitialized = true;
  } catch (err) {
    console.error('Failed auto-init database tables:', err);
    throw err;
  }
}
