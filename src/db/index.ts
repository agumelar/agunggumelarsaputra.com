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
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_slug TEXT NOT NULL,
        completed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tka_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        xp_earned INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    isInitialized = true;
  } catch (err) {
    console.error('Failed auto-init database tables:', err);
    throw err;
  }
}
