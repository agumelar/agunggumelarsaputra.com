import { pgTable, serial, text, integer, timestamp, boolean, unique } from 'drizzle-orm/pg-core';

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
  lessonSlug: text('lesson_slug'),
  attemptNumber: integer('attempt_number').default(1).notNull(),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  xpEarned: integer('xp_earned').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userSubmissions = pgTable('user_submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenId: integer('token_id').references(() => enrollmentTokens.id, { onDelete: 'set null' }),
  lessonSlug: text('lesson_slug').notNull(),
  submissionType: text('submission_type').notNull(), // 'lkpd', 'reflection', 'kktp_self_assessment', 'quiz'
  formData: text('form_data').notNull(), // JSON string payload jawaban siswa
  driveUrl: text('drive_url'), // Link GDrive evidence (opsional)
  score: integer('score'), // Nilai / persentase ketercapaian jika ada
  teacherScore: integer('teacher_score'), // Nilai angka (0-100) dari Guru
  teacherLevel: text('teacher_level'), // Level KKTP ('Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4')
  teacherFeedback: text('teacher_feedback'), // Catatan masukan evaluasi dari Guru
  gradedBy: integer('graded_by').references(() => users.id, { onDelete: 'set null' }),
  gradedAt: timestamp('graded_at'),
  status: text('status').default('submitted').notNull(), // 'draft', 'submitted', 'graded'
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  unique('user_submissions_user_lesson_type_unique').on(
    table.userId,
    table.lessonSlug,
    table.submissionType,
  ),
]);

export const literasiReports = pgTable('literasi_reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  weekNumber: integer('week_number').default(1).notNull(),
  reportDate: timestamp('report_date').defaultNow().notNull(),
  bookTitle: text('book_title').notNull(),
  author: text('author').notNull(),
  publisher: text('publisher').notNull(),
  city: text('city').notNull(),
  year: integer('year').notNull(),
  pageCount: integer('page_count').notNull(),
  edition: text('edition'),
  summary: text('summary').notNull(),
  moralMessage: text('moral_message').notNull(),
  selfChecklist: text('self_checklist').notNull(), // JSON string array
  writingScore: integer('writing_score'), // Max 16
  presentationScore: integer('presentation_score'), // Max 20
  finalScore: integer('final_score'), // 0-100
  teacherFeedback: text('teacher_feedback'),
  gradedBy: integer('graded_by').references(() => users.id, { onDelete: 'set null' }),
  gradedAt: timestamp('graded_at'),
  status: text('status').default('submitted').notNull(), // 'submitted', 'graded'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const literasiPeerReviews = pgTable('literasi_peer_reviews', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').references(() => literasiReports.id, { onDelete: 'cascade' }).notNull(),
  reviewerId: integer('reviewer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1-5 stars
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
