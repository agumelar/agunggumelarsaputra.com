import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { literasiReports, users } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { canAccessAdminPanel } from '../../../utils/auth';

export const GET: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !canAccessAdminPanel(locals.user.role)) {
    return new Response('Unauthorized. Akses khusus Guru/Admin.', { status: 403 });
  }

  if (!isDbConfigured()) {
    return new Response('Database belum terkonfigurasi.', { status: 503 });
  }

  await ensureDbInitialized();

  try {
    const url = new URL(request.url);
    const filterClass = url.searchParams.get('class');

    const reports = await db.select({
      id: literasiReports.id,
      studentName: users.name,
      studentEmail: users.email,
      studentClass: users.studentClass,
      weekNumber: literasiReports.weekNumber,
      reportDate: literasiReports.reportDate,
      bookTitle: literasiReports.bookTitle,
      author: literasiReports.author,
      publisher: literasiReports.publisher,
      year: literasiReports.year,
      pageCount: literasiReports.pageCount,
      writingScore: literasiReports.writingScore,
      presentationScore: literasiReports.presentationScore,
      finalScore: literasiReports.finalScore,
      status: literasiReports.status,
      teacherFeedback: literasiReports.teacherFeedback,
    }).from(literasiReports)
      .innerJoin(users, eq(literasiReports.userId, users.id))
      .orderBy(desc(literasiReports.reportDate));

    let filtered = reports;
    if (filterClass) {
      filtered = reports.filter(r => (r.studentClass || '').toLowerCase().includes(filterClass.toLowerCase()));
    }

    // Generate CSV Output
    const headers = [
      'No',
      'Nama Siswa',
      'Email',
      'Kelas',
      'Minggu Ke',
      'Tanggal Pengumpulan',
      'Judul Buku',
      'Pengarang',
      'Penerbit',
      'Tahun',
      'Jumlah Halaman',
      'Skor Menulis (Max 16)',
      'Skor Presentasi (Max 20)',
      'Nilai Akhir RESIK (0-100)',
      'Status Penilaian',
      'Catatan Guru'
    ];

    const rows = filtered.map((r, idx) => [
      idx + 1,
      `"${(r.studentName || '').replace(/"/g, '""')}"`,
      `"${(r.studentEmail || '').replace(/"/g, '""')}"`,
      `"${(r.studentClass || '-').replace(/"/g, '""')}"`,
      r.weekNumber,
      new Date(r.reportDate).toLocaleDateString('id-ID'),
      `"${(r.bookTitle || '').replace(/"/g, '""')}"`,
      `"${(r.author || '').replace(/"/g, '""')}"`,
      `"${(r.publisher || '').replace(/"/g, '""')}"`,
      r.year,
      r.pageCount,
      r.writingScore ?? '-',
      r.presentationScore ?? '-',
      r.finalScore ?? '-',
      r.status === 'graded' ? 'Sudah Dinilai' : 'Belum Dinilai',
      `"${(r.teacherFeedback || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="REKAP_RABU_LITERASI_RESIK_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error('Error exporting literasi CSV:', err);
    return new Response('Gagal memproses file rekap CSV.', { status: 500 });
  }
};
