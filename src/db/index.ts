import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
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

// Detect whether connection is Neon Cloud HTTP or Universal Postgres (Supabase, Self-hosted VPS, Docker)
const isNeonCloud = connectionString.includes('.neon.tech');

let sqlClient: any = null;
let dbClient: any = null;

if (connectionString) {
  try {
    if (isNeonCloud) {
      sqlClient = neon(connectionString);
      dbClient = drizzleNeon(sqlClient, { schema });
    } else {
      sqlClient = postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        ssl: (connectionString.includes('sslmode=require') || connectionString.includes('ssl=true')) ? 'require' : false,
      });
      dbClient = drizzlePostgres(sqlClient, { schema });
    }
  } catch (initErr) {
    console.error('Database client initialization error:', initErr);
  }
}

export const sql = sqlClient;
export const db = dbClient;

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
      // 1. Users table & columns
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
          )
        `;
      } catch (userTableErr) {
        console.warn('Users table init notice:', userTableErr);
      }
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS student_class TEXT`; } catch {}
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`; } catch {}
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`; } catch {}
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT`; } catch {}
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'`; } catch {}

      // 2. User gamification table
      await sql`
        CREATE TABLE IF NOT EXISTS user_gamification (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          xp INTEGER NOT NULL DEFAULT 0,
          level INTEGER NOT NULL DEFAULT 1,
          streak_days INTEGER NOT NULL DEFAULT 1,
          last_active_date TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;

      // 3. Enrollment tokens table
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
        )
      `;

      // 4. User enrollments association table
      await sql`
        CREATE TABLE IF NOT EXISTS user_enrollments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_id INTEGER NOT NULL REFERENCES enrollment_tokens(id) ON DELETE CASCADE,
          enrolled_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;

      // 5. User progress table
      await sql`
        CREATE TABLE IF NOT EXISTS user_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL,
          lesson_slug TEXT NOT NULL,
          completed_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      try { await sql`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL`; } catch {}

      // 6. TKA attempts table
      await sql`
        CREATE TABLE IF NOT EXISTS tka_attempts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL,
          lesson_slug TEXT,
          attempt_number INTEGER NOT NULL DEFAULT 1,
          score INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          correct_answers INTEGER NOT NULL,
          xp_earned INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      try { await sql`ALTER TABLE tka_attempts ADD COLUMN IF NOT EXISTS token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL`; } catch {}
      try { await sql`ALTER TABLE tka_attempts ADD COLUMN IF NOT EXISTS lesson_slug TEXT`; } catch {}
      try { await sql`ALTER TABLE tka_attempts ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1`; } catch {}

      // 7. User submissions (LKPD & Reflection) table
      await sql`
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
        )
      `;

      // Safe column migration for existing user_submissions tables
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS token_id INTEGER REFERENCES enrollment_tokens(id) ON DELETE SET NULL`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS drive_url TEXT`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS score INTEGER`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS teacher_score INTEGER`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS teacher_level TEXT`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS teacher_feedback TEXT`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted'`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP NOT NULL DEFAULT NOW()`; } catch {}
      try { await sql`ALTER TABLE user_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()`; } catch {}

      // Serialize the one-time cleanup so existing duplicate submissions cannot
      // race the composite unique index creation across serverless instances.
      // Keep the most valuable/newest row (graded rows win), then enforce the
      // same identity declared by the Drizzle schema.
      await sql`
        DO $checkpoint_atomicity_migration$
        BEGIN
          PERFORM pg_advisory_xact_lock(hashtext('user_submissions_user_lesson_type_unique'));

          IF to_regclass('public.user_submissions_user_lesson_type_unique') IS NULL THEN
            LOCK TABLE user_submissions IN SHARE ROW EXCLUSIVE MODE;

            WITH ranked_submissions AS (
              SELECT
                id,
                ROW_NUMBER() OVER (
                  PARTITION BY user_id, lesson_slug, submission_type
                  ORDER BY
                    (teacher_score IS NOT NULL) DESC,
                    graded_at DESC NULLS LAST,
                    updated_at DESC NULLS LAST,
                    submitted_at DESC NULLS LAST,
                    id DESC
                ) AS duplicate_rank
              FROM user_submissions
            )
            DELETE FROM user_submissions AS duplicate
            USING ranked_submissions
            WHERE duplicate.id = ranked_submissions.id
              AND ranked_submissions.duplicate_rank > 1;

            CREATE UNIQUE INDEX IF NOT EXISTS user_submissions_user_lesson_type_unique
            ON user_submissions (user_id, lesson_slug, submission_type);
          END IF;
        END
        $checkpoint_atomicity_migration$
      `;

      // Literasi Reports table
      await sql`
        CREATE TABLE IF NOT EXISTS literasi_reports (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          week_number INTEGER NOT NULL DEFAULT 1,
          report_date TIMESTAMP NOT NULL DEFAULT NOW(),
          book_title TEXT NOT NULL,
          author TEXT NOT NULL,
          publisher TEXT NOT NULL,
          city TEXT NOT NULL,
          year INTEGER NOT NULL,
          page_count INTEGER NOT NULL,
          edition TEXT,
          summary TEXT NOT NULL,
          moral_message TEXT NOT NULL,
          self_checklist TEXT NOT NULL,
          writing_score INTEGER,
          presentation_score INTEGER,
          final_score INTEGER,
          teacher_feedback TEXT,
          graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          graded_at TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'submitted',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS edition TEXT`; } catch {}
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS self_checklist TEXT NOT NULL DEFAULT '[]'`; } catch {}
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS writing_score INTEGER`; } catch {}
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS presentation_score INTEGER`; } catch {}
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS final_score INTEGER`; } catch {}
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS teacher_feedback TEXT`; } catch {}
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL`; } catch {}
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP`; } catch {}
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted'`; } catch {}
      try { await sql`ALTER TABLE literasi_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()`; } catch {}

      // Literasi Peer Reviews table
      await sql`
        CREATE TABLE IF NOT EXISTS literasi_peer_reviews (
          id SERIAL PRIMARY KEY,
          report_id INTEGER NOT NULL REFERENCES literasi_reports(id) ON DELETE CASCADE,
          reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL,
          comment TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
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
