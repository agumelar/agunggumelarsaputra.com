import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  googleId: text('google_id').unique(),
  role: text('role').default('student').notNull(),
  studentClass: text('student_class'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userGamification = pgTable('user_gamification', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  xp: integer('xp').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  streakDays: integer('streak_days').default(1).notNull(),
  lastActiveDate: timestamp('last_active_date').defaultNow().notNull(),
});

export const enrollmentTokens = pgTable('enrollment_tokens', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  targetType: text('target_type').default('all').notNull(), // 'all', 'tka', 'module'
  targetSlug: text('target_slug'), // slug modul jika targetType = 'module'
  targetClass: text('target_class').default('Semua Kelas').notNull(), // '10 RPL 1', '10 RPL 2', dll
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

export const userEnrollments = pgTable('user_enrollments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenId: integer('token_id').references(() => enrollmentTokens.id, { onDelete: 'cascade' }).notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
});

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenId: integer('token_id').references(() => enrollmentTokens.id, { onDelete: 'set null' }),
  lessonSlug: text('lesson_slug').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

export const tkaAttempts = pgTable('tka_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenId: integer('token_id').references(() => enrollmentTokens.id, { onDelete: 'set null' }),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  xpEarned: integer('xp_earned').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
