// Query LKPD submissions for class 10 RPL 3
import { neon } from '@neondatabase/serverless';
import path from 'path';

// Load env using Node.js built-in (Node 24+)
process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));

// Try multiple possible URL keys used by Vercel/Neon integrations
const URL_KEYS = [
  'POSTGRES_URL',
  'DATABASE_URL', 
  'POSTGRES_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'NEON_DATABASE_URL',
  'VERCEL_POSTGRES_URL',
  'POSTGRES_URL_NO_SSL',
  'POSTGRES_DATABASE_URL_UNPOOLED',
];

let dbUrl = '';
let usedKey = '';
for (const key of URL_KEYS) {
  const val = (process.env[key] || '').trim();
  if (val && (val.startsWith('postgres://') || val.startsWith('postgresql://'))) {
    dbUrl = val;
    usedKey = key;
    break;
  }
}

if (!dbUrl && process.env.POSTGRES_HOST && process.env.POSTGRES_USER) {
  const user = process.env.POSTGRES_USER;
  const pass = process.env.POSTGRES_PASSWORD || '';
  const host = process.env.POSTGRES_HOST;
  const db = process.env.POSTGRES_DATABASE || 'neondb';
  dbUrl = `postgres://${user}:${pass}@${host}/${db}?sslmode=require`;
  usedKey = 'Constructed from POSTGRES_HOST/USER/PASSWORD/DATABASE';
}

if (!dbUrl) {
  console.error('ERROR: No valid postgres:// connection URL found in .env.local');
  console.log('Available POSTGRES_ keys:', Object.keys(process.env).filter(k => k.includes('POSTGRES')).join(', '));
  process.exit(1);
}

console.log('Connected via:', usedKey);
const sql = neon(dbUrl);

async function main() {
  console.log('\n=== LKPD SUBMISSIONS - KELAS 10 RPL 3 ===\n');

  // 1. Get all LKPD submissions for 10 RPL 3
  const submissions = await sql`
    SELECT 
      us.id,
      us.user_id,
      u.name AS student_name,
      u.email,
      u.student_class,
      us.lesson_slug,
      us.submission_type,
      us.form_data,
      us.drive_url,
      us.score,
      us.teacher_score,
      us.teacher_level,
      us.teacher_feedback,
      us.status,
      us.submitted_at,
      us.updated_at,
      us.graded_at
    FROM user_submissions us
    JOIN users u ON us.user_id = u.id
    WHERE u.student_class = '10 RPL 3'
      AND us.submission_type = 'lkpd'
    ORDER BY us.lesson_slug, u.name
  `;

  if (submissions.length === 0) {
    console.log('⚠️  Belum ada LKPD yang dikumpulkan oleh siswa kelas 10 RPL 3.\n');
    
    // Show all classes that have submissions
    const classSummary = await sql`
      SELECT u.student_class, COUNT(*) as total,
        COUNT(CASE WHEN us.submission_type = 'lkpd' THEN 1 END) as lkpd_count,
        COUNT(CASE WHEN us.submission_type = 'reflection' THEN 1 END) as reflection_count
      FROM user_submissions us
      JOIN users u ON us.user_id = u.id
      WHERE u.student_class IS NOT NULL
      GROUP BY u.student_class
      ORDER BY u.student_class
    `;
    
    if (classSummary.length > 0) {
      console.log('📋 Kelas yang sudah ada submission:');
      for (const c of classSummary) {
        console.log(`  - ${c.student_class}: ${c.total} total (${c.lkpd_count} LKPD, ${c.reflection_count} Refleksi)`);
      }
    }

    // Show all 10 RPL 3 students registered
    const students = await sql`
      SELECT id, name, email, student_class, created_at 
      FROM users 
      WHERE student_class = '10 RPL 3'
      ORDER BY name
    `;
    
    if (students.length > 0) {
      console.log(`\n👥 Siswa kelas 10 RPL 3 yang terdaftar (${students.length} akun):`);
      for (const s of students) {
        console.log(`  - ${s.name} (${s.email}) — terdaftar: ${new Date(s.created_at).toLocaleDateString('id-ID')}`);
      }
    } else {
      console.log('\n👥 Belum ada akun siswa kelas 10 RPL 3 yang terdaftar.');
    }

    // Show all submissions summary by module
    const allSubs = await sql`
      SELECT us.lesson_slug, us.submission_type, u.student_class, COUNT(*) as cnt
      FROM user_submissions us
      JOIN users u ON us.user_id = u.id
      GROUP BY us.lesson_slug, us.submission_type, u.student_class
      ORDER BY us.lesson_slug, u.student_class
    `;
    if (allSubs.length > 0) {
      console.log('\n📊 Semua submissions yang ada di database:');
      for (const s of allSubs) {
        console.log(`  - ${s.lesson_slug} [${s.submission_type}] kelas ${s.student_class || 'N/A'}: ${s.cnt}`);
      }
    }
    return;
  }

  // Group by lesson slug
  const byModule = {};
  for (const sub of submissions) {
    if (!byModule[sub.lesson_slug]) byModule[sub.lesson_slug] = [];
    byModule[sub.lesson_slug].push(sub);
  }

  console.log(`📊 Total LKPD ditemukan: ${submissions.length}\n`);

  for (const [slug, subs] of Object.entries(byModule)) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`📘 MODUL: ${slug} (${subs.length} pengumpulan)`);
    console.log(`${'═'.repeat(70)}`);

    for (const sub of subs) {
      const graded = sub.teacher_score !== null && sub.teacher_score !== undefined;
      console.log(`\n  👤 ${sub.student_name} (${sub.email})`);
      console.log(`     Status     : ${graded ? '✅ Dinilai' : '⏳ Belum Dinilai'}`);
      if (graded) {
        console.log(`     Skor Guru  : ${sub.teacher_score}/100`);
        console.log(`     Level KKTP : ${sub.teacher_level || '-'}`);
        console.log(`     Feedback   : ${sub.teacher_feedback || '-'}`);
      }
      console.log(`     Dikumpulkan: ${new Date(sub.submitted_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
      console.log(`     Drive URL  : ${sub.drive_url || 'Tidak ada'}`);

      // Parse and show form data summary
      try {
        const fd = JSON.parse(sub.form_data || '{}');
        const keys = Object.keys(fd).filter(k => !['studentName', 'studentNis', 'studentClass', 'submissionDate'].includes(k));
        console.log(`     Fields     : ${keys.length} field isian`);
        
        // Show audit app data if present
        const appNames = Object.entries(fd).filter(([k]) => k.startsWith('app_name_')).map(([,v]) => v);
        if (appNames.length > 0) {
          console.log(`     Aplikasi   : ${appNames.join(', ')}`);
        }
        
        // Show activity title if present
        if (fd.activityTitle) console.log(`     Judul      : ${fd.activityTitle}`);
        if (fd.notes) console.log(`     Catatan    : ${fd.notes.substring(0, 100)}${fd.notes.length > 100 ? '...' : ''}`);
      } catch {}
    }
  }

  // Summary
  const graded = submissions.filter(s => s.teacher_score !== null);
  const pending = submissions.filter(s => s.teacher_score === null);
  console.log(`\n\n${'═'.repeat(70)}`);
  console.log('RINGKASAN KELAS 10 RPL 3');
  console.log(`${'═'.repeat(70)}`);
  console.log(`  Total LKPD       : ${submissions.length}`);
  console.log(`  Sudah Dinilai    : ${graded.length}`);
  console.log(`  Belum Dinilai    : ${pending.length}`);
  if (graded.length > 0) {
    const scores = graded.map(s => s.teacher_score);
    console.log(`  Rata-rata Nilai  : ${(scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1)}`);
  }
}

main().catch(err => {
  console.error('DB Error:', err.message);
  process.exit(1);
});
