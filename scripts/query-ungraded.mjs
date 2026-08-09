import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
if (!dbUrl || dbUrl === '[SENSITIVE]') {
  console.error('ERROR: POSTGRES_URL tidak tersedia atau masih masked.');
  process.exit(1);
}

const sql = neon(dbUrl);

// Query semua tugas kelas 10 RPL 1 yang belum dinilai (status = 'submitted')
const rows = await sql`
  SELECT 
    us.id,
    u.name AS student_name,
    u.email,
    u.student_class,
    us.lesson_slug,
    us.submission_type,
    us.drive_url,
    us.score AS auto_score,
    us.teacher_score,
    us.teacher_level,
    us.status,
    us.submitted_at
  FROM user_submissions us
  JOIN users u ON us.user_id = u.id
  WHERE u.student_class = '10 RPL 1'
    AND us.status = 'submitted'
  ORDER BY us.submitted_at DESC
`;

console.log(JSON.stringify(rows, null, 2));
console.log(`\nTotal tugas belum dinilai: ${rows.length}`);
