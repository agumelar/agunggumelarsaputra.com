# Fullstack Student Learning Hub & Gamification Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `agunggumelarsaputra.com` into a 100% Free ($0) Fullstack Student Learning Hub & Gamification Portal with Student Login (Credentials + Google OAuth), Protected Courses, XP & Level Dashboard, CBT Drilling TKA, and Vercel Postgres integration.

**Architecture:** Astro v5 configured with `@astrojs/vercel` SSR adapter. Static SSG for public pages/lessons + Vercel Serverless Functions for API & Auth routes (`src/pages/api/`). Database queries managed via Drizzle ORM connecting to Vercel Postgres. Route protection handled via `src/middleware.ts`.

**Tech Stack:** Astro v5, `@astrojs/vercel`, TailwindCSS v3, Vercel Postgres (`@neondatabase/serverless`), Drizzle ORM (`drizzle-orm`, `drizzle-kit`), `bcryptjs`, `jsonwebtoken`, `arctic` (Google OAuth 2.0).

## Global Constraints

- Vercel Hobby Plan (100% Free / Rp 0): Pre-render lesson MDX pages statically; execute dynamic actions in Serverless API endpoints.
- Cookie-based HttpOnly Secure Sessions (`ags_session`).
- TypeScript strict types across Drizzle ORM schema and API endpoints.

---

### Task 1: Environment & Fullstack Package Dependencies Setup

**Files:**
- Modify: `package.json`, `astro.config.mjs`
- Create: `drizzle.config.ts`, `.env.example`

**Interfaces:**
- Consumes: Existing Astro v5 setup.
- Produces: Astro Vercel SSR Adapter + Drizzle Config + Environment Types.

- [ ] **Step 1: Install required fullstack dependencies**

```bash
npm install @astrojs/vercel drizzle-orm @neondatabase/serverless bcryptjs jsonwebtoken arctic
npm install -D drizzle-kit @types/bcryptjs @types/jsonwebtoken
```

- [ ] **Step 2: Update `astro.config.mjs` to enable `@astrojs/vercel` SSR Adapter**

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  integrations: [tailwind(), mdx()],
  site: 'https://agunggumelarsaputra.com',
});
```

- [ ] **Step 3: Create `drizzle.config.ts`**

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL || '',
  },
});
```

- [ ] **Step 4: Create `.env.example`**

```env
POSTGRES_URL="postgres://default:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="super-secret-jwt-key-change-this-in-production"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SITE_URL="http://localhost:4321"
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs drizzle.config.ts .env.example
git commit -m "chore: setup vercel adapter, drizzle orm, and fullstack auth dependencies"
```

---

### Task 2: Database Connection & Schema Definition

**Files:**
- Create: `src/db/schema.ts`, `src/db/index.ts`

**Interfaces:**
- Consumes: Vercel Postgres connection string.
- Produces: Drizzle ORM DB client instance `db` and exported table definitions (`users`, `userGamification`, `userProgress`, `tkaAttempts`).

- [ ] **Step 1: Create `src/db/schema.ts`**

```typescript
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  googleId: text('google_id').unique(),
  role: text('role').default('student').notNull(),
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

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonSlug: text('lesson_slug').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

export const tkaAttempts = pgTable('tka_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  xpEarned: integer('xp_earned').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

- [ ] **Step 2: Create `src/db/index.ts`**

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.POSTGRES_URL || 'postgres://placeholder:placeholder@localhost/db');
export const db = drizzle(sql, { schema });
```

- [ ] **Step 3: Commit**

```bash
git add src/db/schema.ts src/db/index.ts
git commit -m "feat: add drizzle database schema and connection setup"
```

---

### Task 3: Authentication Infrastructure (Middleware & Auth API Routes)

**Files:**
- Create: `src/middleware.ts`, `src/utils/auth.ts`, `src/pages/api/auth/register.ts`, `src/pages/api/auth/login.ts`, `src/pages/api/auth/logout.ts`, `src/pages/api/auth/google.ts`, `src/pages/api/auth/callback/google.ts`, `src/pages/api/auth/me.ts`

**Interfaces:**
- Consumes: `users` DB table, JWT credentials.
- Produces: `Astro.locals.user` session context, `ags_session` HTTP-Only cookie, Auth Endpoints.

- [ ] **Step 1: Create JWT & Session Helpers in `src/utils/auth.ts`**

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

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
```

- [ ] **Step 2: Create `src/middleware.ts`**

```typescript
import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './utils/auth';

const PROTECTED_ROUTES = ['/dashboard', '/pembelajaran'];
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/google', '/api/auth/callback/google'];

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
```

- [ ] **Step 3: Create `src/pages/api/auth/register.ts`**

```typescript
import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { users, userGamification } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../utils/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password || password.length < 6) {
      return new Response(JSON.stringify({ error: 'Input tidak valid. Password minimal 6 karakter.' }), { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Email sudah terdaftar.' }), { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({ name, email, passwordHash }).returning();
    await db.insert(userGamification).values({ userId: newUser.id, xp: 0, level: 1 });

    const token = signToken({ userId: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });

    cookies.set('ags_session', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Terjadi kesalahan server.' }), { status: 500 });
  }
};
```

- [ ] **Step 4: Create `src/pages/api/auth/login.ts`**

```typescript
import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../utils/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.passwordHash) {
      return new Response(JSON.stringify({ error: 'Email atau password salah.' }), { status: 400 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Email atau password salah.' }), { status: 400 });
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name, role: user.role });

    cookies.set('ags_session', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true, user: { id: user.id, name: user.name, email: user.email } }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 });
  }
};
```

- [ ] **Step 5: Create `src/pages/api/auth/logout.ts`**

```typescript
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('ags_session', { path: '/' });
  return redirect('/login');
};
```

- [ ] **Step 6: Create Google OAuth Endpoints (`google.ts` & `callback/google.ts`)**

`src/pages/api/auth/google.ts`:
```typescript
import type { APIRoute } from 'astro';
import { Google } from 'arctic';

const google = new Google(
  process.env.GOOGLE_CLIENT_ID || '',
  process.env.GOOGLE_CLIENT_SECRET || '',
  `${process.env.SITE_URL || 'http://localhost:4321'}/api/auth/callback/google`
);

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const state = Math.random().toString(36).substring(2);
  const codeVerifier = Math.random().toString(36).substring(2);

  cookies.set('google_oauth_state', state, { path: '/', httpOnly: true, maxAge: 600 });
  cookies.set('google_code_verifier', codeVerifier, { path: '/', httpOnly: true, maxAge: 600 });

  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);
  return redirect(url.toString());
};
```

`src/pages/api/auth/callback/google.ts`:
```typescript
import type { APIRoute } from 'astro';
import { Google } from 'arctic';
import { db } from '../../../../db';
import { users, userGamification } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { signToken } from '../../../../utils/auth';

const google = new Google(
  process.env.GOOGLE_CLIENT_ID || '',
  process.env.GOOGLE_CLIENT_SECRET || '',
  `${process.env.SITE_URL || 'http://localhost:4321'}/api/auth/callback/google`
);

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('google_oauth_state')?.value;
  const storedVerifier = cookies.get('google_code_verifier')?.value;

  if (!code || !state || !storedState || state !== storedState || !storedVerifier) {
    return new Response('OAuth state mismatch', { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedVerifier);
    const googleUserRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });
    const googleUser = await googleUserRes.json();

    let [existingUser] = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);

    if (!existingUser) {
      [existingUser] = await db.insert(users).values({
        name: googleUser.name || 'Siswa PPLG',
        email: googleUser.email,
        googleId: googleUser.sub,
        avatarUrl: googleUser.picture,
      }).returning();

      await db.insert(userGamification).values({ userId: existingUser.id, xp: 0, level: 1 });
    }

    const token = signToken({ userId: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.role });
    cookies.set('ags_session', token, { path: '/', httpOnly: true, secure: import.meta.env.PROD, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });

    return redirect('/dashboard');
  } catch (err) {
    return new Response('Failed Google OAuth Callback', { status: 500 });
  }
};
```

- [ ] **Step 7: Commit**

```bash
git add src/middleware.ts src/utils/auth.ts src/pages/api/auth/
git commit -m "feat: implement astro middleware, session auth, and google oauth endpoints"
```

---

### Task 4: UI Login & Register Pages

**Files:**
- Create: `src/pages/login.astro`, `src/pages/register.astro`

**Interfaces:**
- Consumes: `/api/auth/login`, `/api/auth/register`, `/api/auth/google`
- Produces: Interactive Authentication UI.

- [ ] **Step 1: Create `src/pages/login.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Masuk Siswa" description="Halaman Login Portal Learning Hub PPLG SMKN 1 Rongga">
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="card w-full max-w-md p-8 border-border/60 space-y-6 shadow-2xl bg-card/80 backdrop-blur">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-extrabold text-foreground">Selamat Datang 👋</h1>
        <p class="text-xs text-muted-foreground">Masuk untuk mengakses Student Learning Hub & Gamifikasi PPLG</p>
      </div>

      <div id="error-alert" class="hidden p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center"></div>

      <!-- Google OAuth Button -->
      <a href="/api/auth/google" class="btn btn-outline w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-sm border-border hover:bg-accent">
        <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
        Masuk dengan Google
      </a>

      <div class="flex items-center my-4">
        <div class="flex-grow border-t border-border/40"></div>
        <span class="px-3 text-[10px] text-muted-foreground uppercase font-mono">atau email</span>
        <div class="flex-grow border-t border-border/40"></div>
      </div>

      <!-- Email Password Form -->
      <form id="login-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-medium mb-1 text-foreground">Email Siswa</label>
          <input type="email" id="email" required class="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-blue-500" placeholder="siswa@smkn1rongga.sch.id" />
        </div>
        <div>
          <label class="block font-medium mb-1 text-foreground">Password</label>
          <input type="password" id="password" required class="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-blue-500" placeholder="••••••••" />
        </div>
        <button type="submit" class="btn btn-primary w-full py-2.5 font-bold bg-blue-600 hover:bg-blue-500 text-white">
          Masuk Portal
        </button>
      </form>

      <p class="text-center text-xs text-muted-foreground">
        Belum punya akun? <a href="/register" class="text-blue-400 font-semibold hover:underline">Daftar Akun Baru</a>
      </p>
    </div>
  </div>

  <script>
    const form = document.getElementById('login-form');
    const alert = document.getElementById('error-alert');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      alert?.classList.add('hidden');
      
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          window.location.href = '/dashboard';
        } else {
          if (alert) {
            alert.textContent = data.error || 'Gagal masuk.';
            alert.classList.remove('hidden');
          }
        }
      } catch (err) {
        if (alert) {
          alert.textContent = 'Koneksi bermasalah.';
          alert.classList.remove('hidden');
        }
      }
    });
  </script>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/register.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Daftar Siswa Baru" description="Buat Akun Portal Learning Hub PPLG SMKN 1 Rongga">
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="card w-full max-w-md p-8 border-border/60 space-y-6 shadow-2xl bg-card/80 backdrop-blur">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-extrabold text-foreground">Daftar Akun Siswa 🚀</h1>
        <p class="text-xs text-muted-foreground">Bergabunglah dalam Learning Hub & Gamifikasi PPLG</p>
      </div>

      <div id="error-alert" class="hidden p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center"></div>

      <form id="register-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-medium mb-1 text-foreground">Nama Lengkap</label>
          <input type="text" id="name" required class="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-blue-500" placeholder="Ahmad Rizky" />
        </div>
        <div>
          <label class="block font-medium mb-1 text-foreground">Email Siswa</label>
          <input type="email" id="email" required class="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-blue-500" placeholder="ahmad@smkn1rongga.sch.id" />
        </div>
        <div>
          <label class="block font-medium mb-1 text-foreground">Password (min 6 karakter)</label>
          <input type="password" id="password" required minlength="6" class="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-blue-500" placeholder="••••••••" />
        </div>
        <button type="submit" class="btn btn-primary w-full py-2.5 font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white">
          Daftar Sekarang
        </button>
      </form>

      <p class="text-center text-xs text-muted-foreground">
        Sudah memiliki akun? <a href="/login" class="text-blue-400 font-semibold hover:underline">Masuk Ke Portal</a>
      </p>
    </div>
  </div>

  <script>
    const form = document.getElementById('register-form');
    const alert = document.getElementById('error-alert');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      alert?.classList.add('hidden');
      
      const name = (document.getElementById('name') as HTMLInputElement).value;
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          window.location.href = '/dashboard';
        } else {
          if (alert) {
            alert.textContent = data.error || 'Gagal mendaftar.';
            alert.classList.remove('hidden');
          }
        }
      } catch (err) {
        if (alert) {
          alert.textContent = 'Koneksi bermasalah.';
          alert.classList.remove('hidden');
        }
      }
    });
  </script>
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/login.astro src/pages/register.astro
git commit -m "feat: add login and register UI pages"
```

---

### Task 5: Student Dashboard & Gamification Engine Integration

**Files:**
- Create: `src/pages/dashboard.astro`, `src/pages/api/progress/complete-lesson.ts`, `src/pages/api/tka/submit.ts`, `src/pages/api/leaderboard.ts`
- Modify: `src/components/Navigation.astro`

**Interfaces:**
- Consumes: `userGamification`, `userProgress`, `tkaAttempts`
- Produces: Protected Dashboard Page, Leaderboard, Progress & Exam submission APIs.

- [ ] **Step 1: Create `src/pages/api/progress/complete-lesson.ts`**

```typescript
import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { userGamification, userProgress } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { lessonSlug } = await request.json();
    const userId = locals.user.userId;

    const [existing] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonSlug, lessonSlug))).limit(1);

    if (existing) {
      return new Response(JSON.stringify({ message: 'Sudah diselesaikan sebelumnya.' }), { status: 200 });
    }

    await db.insert(userProgress).values({ userId, lessonSlug });

    let [stats] = await db.select().from(userGamification).where(eq(userGamification.userId, userId)).limit(1);
    if (!stats) {
      [stats] = await db.insert(userGamification).values({ userId, xp: 0, level: 1 }).returning();
    }

    const newXp = stats.xp + 15;
    const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;

    await db.update(userGamification)
      .set({ xp: newXp, level: newLevel, lastActiveDate: new Date() })
      .where(eq(userGamification.userId, userId));

    return new Response(JSON.stringify({ success: true, xpEarned: 15, newXp, newLevel }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
```

- [ ] **Step 2: Create `src/pages/api/tka/submit.ts`**

```typescript
import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { tkaAttempts, userGamification } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { score, totalQuestions, correctAnswers } = await request.json();
    const userId = locals.user.userId;

    const bonusXp = 10 + Math.round((score / 100) * 50);

    await db.insert(tkaAttempts).values({
      userId,
      score,
      totalQuestions,
      correctAnswers,
      xpEarned: bonusXp,
    });

    let [stats] = await db.select().from(userGamification).where(eq(userGamification.userId, userId)).limit(1);
    if (!stats) {
      [stats] = await db.insert(userGamification).values({ userId, xp: 0, level: 1 }).returning();
    }

    const newXp = stats.xp + bonusXp;
    const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;

    await db.update(userGamification)
      .set({ xp: newXp, level: newLevel, lastActiveDate: new Date() })
      .where(eq(userGamification.userId, userId));

    return new Response(JSON.stringify({ success: true, xpEarned: bonusXp, newXp, newLevel }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
```

- [ ] **Step 3: Create `src/pages/dashboard.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { db } from '../db';
import { userGamification, userProgress, tkaAttempts, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const user = Astro.locals.user;
if (!user) {
  return Astro.redirect('/login');
}

let [stats] = await db.select().from(userGamification).where(eq(userGamification.userId, user.userId)).limit(1);
if (!stats) {
  [stats] = await db.insert(userGamification).values({ userId: user.userId, xp: 0, level: 1 }).returning();
}

const completedLessons = await db.select().from(userProgress).where(eq(userProgress.userId, user.userId));
const examHistory = await db.select().from(tkaAttempts).where(eq(tkaAttempts.userId, user.userId)).orderBy(desc(tkaAttempts.createdAt)).limit(5);

const topUsers = await db.select({
  name: users.name,
  xp: userGamification.xp,
  level: userGamification.level,
}).from(userGamification)
  .innerJoin(users, eq(userGamification.userId, users.id))
  .orderBy(desc(userGamification.xp))
  .limit(5);
---

<BaseLayout title="Student Dashboard" description="Dashboard Gamifikasi Belajar Siswa PPLG">
  <section class="py-12 bg-gradient-to-b from-blue-950/20 via-background to-background">
    <div class="container-main space-y-8">
      
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <span class="text-xs text-cyan-400 font-mono">⚡ Student Portal Dashboard</span>
          <h1 class="text-3xl font-extrabold text-foreground">Halo, {user.name}! 👋</h1>
          <p class="text-xs text-muted-foreground">Siap melanjutkan petualangan kodingmu hari ini?</p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" class="btn btn-outline btn-sm text-red-400 border-red-500/30 hover:bg-red-500/10">
            Keluar Portal
          </button>
        </form>
      </div>

      <!-- Gamification Stats Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-5 rounded-xl bg-card border border-border/60 space-y-1">
          <span class="text-xs text-muted-foreground">Total Experience</span>
          <div class="text-3xl font-extrabold text-amber-400 font-mono">{stats.xp} XP</div>
        </div>
        <div class="p-5 rounded-xl bg-card border border-border/60 space-y-1">
          <span class="text-xs text-muted-foreground">Level Belajar</span>
          <div class="text-3xl font-extrabold text-emerald-400 font-mono">Lvl {stats.level}</div>
        </div>
        <div class="p-5 rounded-xl bg-card border border-border/60 space-y-1">
          <span class="text-xs text-muted-foreground">Modul Selesai</span>
          <div class="text-3xl font-extrabold text-blue-400 font-mono">{completedLessons.length}</div>
        </div>
        <div class="p-5 rounded-xl bg-card border border-border/60 space-y-1">
          <span class="text-xs text-muted-foreground">Ujian TKA Diikuti</span>
          <div class="text-3xl font-extrabold text-cyan-400 font-mono">{examHistory.length}</div>
        </div>
      </div>

      <!-- Dashboard Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left 2 Cols: Progress & Exam History -->
        <div class="lg:col-span-2 space-y-6">
          <div class="p-6 rounded-xl bg-card border border-border/60 space-y-4">
            <h2 class="text-lg font-bold text-foreground">🎯 Mulai Belajar & Simulasi</h2>
            <div class="flex flex-wrap gap-3">
              <a href="/pembelajaran" class="btn btn-primary font-semibold bg-blue-600 hover:bg-blue-500 text-white">
                📚 Buka Modul Learning Hub
              </a>
              <a href="/pembelajaran/tka-pplg" class="btn btn-outline border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10">
                🎯 Simulasi Drilling TKA PPLG
              </a>
            </div>
          </div>

          <!-- Exam History -->
          <div class="p-6 rounded-xl bg-card border border-border/60 space-y-4">
            <h2 class="text-lg font-bold text-foreground">📊 Riwayat Ujian TKA</h2>
            {examHistory.length === 0 ? (
              <p class="text-xs text-muted-foreground">Belum ada riwayat ujian. Ikuti simulasi TKA untuk mendapatkan XP bonus!</p>
            ) : (
              <div class="space-y-2">
                {examHistory.map((attempt) => (
                  <div class="p-3 rounded-lg bg-background border border-border/40 flex items-center justify-between text-xs">
                    <div>
                      <span class="font-bold text-foreground">Skor TKA: {attempt.score}/100</span>
                      <span class="text-[10px] text-muted-foreground block">Benar {attempt.correctAnswers} dari {attempt.totalQuestions} soal</span>
                    </div>
                    <span class="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">+{attempt.xpEarned} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <!-- Right 1 Col: Leaderboard -->
        <div class="space-y-6">
          <div class="p-6 rounded-xl bg-card border border-border/60 space-y-4">
            <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
              <span>🏆 Leaderboard Siswa</span>
            </h2>
            <div class="space-y-3">
              {topUsers.map((top, idx) => (
                <div class="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/40 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-mono text-[10px]">
                      {idx + 1}
                    </span>
                    <span class="font-semibold text-foreground">{top.name}</span>
                  </div>
                  <span class="font-mono text-amber-400 font-bold">{top.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Update `src/components/Navigation.astro` to reflect user session**

Replace lines 58-81 with session-aware badge & links for `/login` vs `/dashboard`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard.astro src/pages/api/progress/ src/pages/api/tka/ src/components/Navigation.astro
git commit -m "feat: implement student dashboard, xp progress API, and leaderboard"
```

---

### Task 6: Modernize Protected Learning Hub & Lesson Reader

**Files:**
- Modify: `src/pages/pembelajaran/index.astro`, `src/pages/pembelajaran/[...slug].astro`

**Interfaces:**
- Consumes: Astro Content Collections `pembelajaran`, `/api/progress/complete-lesson`
- Produces: Protected Dicoding/W3Schools style Lesson Reader with "Mark as Complete (+15 XP)" button.

- [ ] **Step 1: Update `src/pages/pembelajaran/[...slug].astro` with Complete Lesson Action**

Add a client-side button at the end of each lesson file to submit completion to `/api/progress/complete-lesson` and trigger an XP reward toast.

- [ ] **Step 2: Commit**

```bash
git add src/pages/pembelajaran/
git commit -m "feat: connect lesson reader to xp completion endpoint"
```

---

### Task 7: Integrate Drilling TKA PPLG Simulator with Postgres

**Files:**
- Modify: `src/pages/pembelajaran/tka-pplg.astro`

**Interfaces:**
- Consumes: Exam answers, `/api/tka/submit`
- Produces: Persistent exam results saved to DB.

- [ ] **Step 1: Update `tka-pplg.astro` to post score to `/api/tka/submit` on finish**

- [ ] **Step 2: Commit**

```bash
git add src/pages/pembelajaran/tka-pplg.astro
git commit -m "feat: save tka exam attempts to database"
```

---

### Task 8: Verification & End-to-End Build Test

- [ ] **Step 1: Run local typecheck and build check**

```bash
npm run build
```

Expected output: Clean compilation without errors, generating SSR server output for Vercel deployment.

- [ ] **Step 2: Final Commit**

```bash
git add .
git commit -m "chore: final fullstack learning hub build verification"
```
