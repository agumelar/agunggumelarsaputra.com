import type { APIRoute } from 'astro';
import { Google } from 'arctic';
import { db, sql, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { users, userGamification } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { signToken, isSuperAdminEmail, isTeacherEmail } from '../../../../utils/auth';

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  if (!isDbConfigured()) {
    return new Response('Database belum terhubung di server.', { status: 503 });
  }
  await ensureDbInitialized();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const requestOrigin = new URL(request.url).origin;
  const siteUrl = requestOrigin || process.env.SITE_URL || 'https://agunggumelarsaputra.com';

  if (!clientId || !clientSecret) {
    return new Response('Google OAuth config missing', { status: 400 });
  }

  const google = new Google(clientId, clientSecret, `${siteUrl}/api/auth/callback/google`);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('google_oauth_state')?.value;
  const storedVerifier = cookies.get('google_code_verifier')?.value;

  if (!code || !state || !storedState || state !== storedState || !storedVerifier) {
    return new Response('OAuth state mismatch. Silakan buka halaman login kembali dan masuk ulang.', { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedVerifier);
    const googleUserRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });
    const googleUser = await googleUserRes.json();

    if (!googleUser || !googleUser.email) {
      return new Response('Gagal mendapatkan profil akun Google.', { status: 400 });
    }

    // Direct proactive patch for schema resilience
    if (sql) {
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS student_class TEXT`; } catch {}
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`; } catch {}
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`; } catch {}
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT`; } catch {}
      try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'`; } catch {}
    }

    const cleanEmail = googleUser.email.trim().toLowerCase();
    const isTargetSuperAdmin = isSuperAdminEmail(cleanEmail);
    const isTargetTeacher = isTeacherEmail(cleanEmail);
    const assignedRole = isTargetSuperAdmin ? 'superadmin' : isTargetTeacher ? 'teacher' : 'student';

    let existingUser: any = null;
    try {
      const rows = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      existingUser = rows[0] || null;
    } catch (queryErr) {
      console.warn('Drizzle select error, fallback to raw sql:', queryErr);
      if (sql) {
        const rawRows: any = await sql`SELECT * FROM users WHERE email = ${cleanEmail} LIMIT 1`;
        existingUser = rawRows[0] || null;
      }
    }

    if (!existingUser) {
      try {
        const [newUser] = await db.insert(users).values({
          name: googleUser.name || 'Siswa RPL',
          email: cleanEmail,
          googleId: googleUser.sub,
          role: assignedRole,
          avatarUrl: googleUser.picture,
        }).returning();
        existingUser = newUser;
      } catch (insertErr) {
        console.warn('Drizzle insert error, fallback to raw sql:', insertErr);
        if (sql) {
          const [newUser]: any = await sql`
            INSERT INTO users (name, email, google_id, role, avatar_url)
            VALUES (${googleUser.name || 'Siswa RPL'}, ${cleanEmail}, ${googleUser.sub}, ${assignedRole}, ${googleUser.picture})
            RETURNING *
          `;
          existingUser = newUser;
        }
      }

      if (existingUser) {
        try {
          await db.insert(userGamification).values({ userId: existingUser.id, xp: 0, level: 1 });
        } catch {
          if (sql) {
            try {
              await sql`INSERT INTO user_gamification (user_id, xp, level) VALUES (${existingUser.id}, 0, 1) ON CONFLICT (user_id) DO NOTHING`;
            } catch {}
          }
        }
      }
    } else {
      const updateData: any = {};
      if (isTargetSuperAdmin && existingUser.role !== 'superadmin') {
        updateData.role = 'superadmin';
      } else if (isTargetTeacher && existingUser.role !== 'teacher' && existingUser.role !== 'admin' && existingUser.role !== 'superadmin') {
        updateData.role = 'teacher';
      }
      if (!existingUser.googleId && !existingUser.google_id && googleUser.sub) {
        updateData.googleId = googleUser.sub;
      }
      if (!existingUser.avatarUrl && !existingUser.avatar_url && googleUser.picture) {
        updateData.avatarUrl = googleUser.picture;
      }

      if (Object.keys(updateData).length > 0) {
        try {
          const [updated] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, existingUser.id))
            .returning();
          if (updated) existingUser = updated;
        } catch {
          if (sql) {
            if (updateData.role) {
              await sql`UPDATE users SET role = ${updateData.role} WHERE id = ${existingUser.id}`;
              existingUser.role = updateData.role;
            }
            if (updateData.avatarUrl) {
              await sql`UPDATE users SET avatar_url = ${updateData.avatarUrl} WHERE id = ${existingUser.id}`;
              existingUser.avatar_url = updateData.avatarUrl;
            }
          }
        }
      }
    }

    const token = signToken({ 
      userId: existingUser.id, 
      email: existingUser.email, 
      name: existingUser.name, 
      role: existingUser.role 
    });
    cookies.set('ags_session', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return redirect('/dashboard');
  } catch (err: any) {
    console.error('Google OAuth Error:', err);
    return new Response(`Failed Google OAuth Callback: ${err.message || err}`, { status: 500 });
  }
};
