import ExcelJS from 'exceljs';

interface StudentReportItem {
  userId: number;
  name: string;
  email: string;
  studentClass: string;
  enrolledAt: Date | string | null;
  hasTakenExam: boolean;
  examScore: number | null;
  correctAnswers: number | null;
  totalQuestions: number | null;
  examSubmittedAt: Date | string | null;
  totalLessonsCompleted: number;
}

interface TokenReportData {
  token: {
    token: string;
    targetClass: string;
    targetType: string;
    createdAt?: Date | string | null;
  };
  stats: {
    totalEnrolled: number;
    totalExamTaken: number;
    avgScore: number;
    passCount: number;
    passRate: number;
  };
  students: StudentReportItem[];
  teacherName?: string;
  schoolName?: string;
}

const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatIndonesianDate(date: Date = new Date()): string {
  const day = date.getDate();
  const month = INDO_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatIndonesianDateTime(date: Date = new Date()): string {
  const day = date.getDate();
  const month = INDO_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}

/**
 * Generate a high-craft, professional Excel Workbook for Token Exam / Assessment Report
 */
export async function generateTokenExcelReport(data: TokenReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Agung Gumelar Saputra, S.Tr.T. - SMKN 1 Rongga';
  workbook.lastModifiedBy = 'PPLG Learning Hub System';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Rekap Nilai Siswa', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.6,
        bottom: 0.6,
        header: 0.3,
        footer: 0.3,
      },
    },
    views: [{ state: 'frozen', ySplit: 14 }], // Freeze header after metadata & table header
  });

  const primaryNavy = 'FF0F172A'; // Slate 900
  const headerFill = 'FF1E293B';  // Slate 800
  const subHeaderFill = 'FF334155'; // Slate 700
  const accentTeal = 'FF0D9488';  // Teal 600
  const lightBgZebra = 'FFF8FAFC'; // Slate 50
  const borderLight = 'FFE2E8F0';  // Slate 200
  const textDark = 'FF0F172A';
  const textMuted = 'FF64748B';

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };

  const doubleBottomBorder: Partial<ExcelJS.Borders> = {
    bottom: { style: 'double', color: { argb: 'FF0F172A' } },
  };

  // ==========================================
  // 1. KOP LAPORAN RESMI (Header Institusi)
  // ==========================================
  worksheet.mergeCells('A1:I1');
  const r1 = worksheet.getCell('A1');
  r1.value = 'PEMERINTAH DAERAH PROVINSI JAWA BARAT';
  r1.font = { name: 'Arial', size: 10, bold: true, color: { argb: textMuted } };
  r1.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:I2');
  const r2 = worksheet.getCell('A2');
  r2.value = 'DINAS PENDIDIKAN — CABANG DINAS PENDIDIKAN WILAYAH VII';
  r2.font = { name: 'Arial', size: 10, bold: true, color: { argb: textMuted } };
  r2.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A3:I3');
  const r3 = worksheet.getCell('A3');
  r3.value = 'SMK NEGERI 1 RONGGA';
  r3.font = { name: 'Arial', size: 14, bold: true, color: { argb: primaryNavy } };
  r3.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A4:I4');
  const r4 = worksheet.getCell('A4');
  r4.value = 'PROGRAM KEAHLIAN PPLG — KONSENTRASI KEAHLIAN REKAYASA PERANGKAT LUNAK (RPL)';
  r4.font = { name: 'Arial', size: 11, bold: true, color: { argb: accentTeal } };
  r4.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A5:I5');
  const r5 = worksheet.getCell('A5');
  r5.value = 'LAPORAN REKAPITULASI HASIL ASESMEN & EVALUASI BELAJAR SISWA';
  r5.font = { name: 'Arial', size: 12, bold: true, color: { argb: primaryNavy } };
  r5.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(5).border = doubleBottomBorder;

  // Spacing
  worksheet.addRow([]);

  // ==========================================
  // 2. METADATA & INFORMASI ADMINISTRASI
  // ==========================================
  const nowStr = formatIndonesianDateTime(new Date());
  const targetClass = data.token.targetClass || '-';
  const tokenCode = data.token.token;
  const teacher = data.teacherName || 'Agung Gumelar Saputra, S.Tr.T.';

  worksheet.getCell('A7').value = 'Mata Pelajaran / Sesi';
  worksheet.getCell('A7').font = { name: 'Arial', size: 9, bold: true, color: { argb: textDark } };
  worksheet.getCell('B7').value = ': Dasar-Dasar Kejuruan RPL';
  worksheet.getCell('B7').font = { name: 'Arial', size: 9, color: { argb: textDark } };

  worksheet.getCell('F7').value = 'Guru Pengampu RPL';
  worksheet.getCell('F7').font = { name: 'Arial', size: 9, bold: true, color: { argb: textDark } };
  worksheet.getCell('G7').value = `: ${teacher}`;
  worksheet.getCell('G7').font = { name: 'Arial', size: 9, bold: true, color: { argb: textDark } };

  worksheet.getCell('A8').value = 'Kode Token Sesi';
  worksheet.getCell('A8').font = { name: 'Arial', size: 9, bold: true, color: { argb: textDark } };
  worksheet.getCell('B8').value = `: ${tokenCode}`;
  worksheet.getCell('B8').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF2563EB' } }; // Blue accent

  worksheet.getCell('F8').value = 'Kriteria Ketuntasan Minimal (KKM)';
  worksheet.getCell('F8').font = { name: 'Arial', size: 9, bold: true, color: { argb: textDark } };
  worksheet.getCell('G8').value = ': 73 (Tuntas / Kompeten)';
  worksheet.getCell('G8').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF16A34A' } }; // Green accent

  worksheet.getCell('A9').value = 'Target Kelas / Rombel';
  worksheet.getCell('A9').font = { name: 'Arial', size: 9, bold: true, color: { argb: textDark } };
  worksheet.getCell('B9').value = `: ${targetClass}`;
  worksheet.getCell('B9').font = { name: 'Arial', size: 9, color: { argb: textDark } };

  worksheet.getCell('F9').value = 'Waktu Ekspor Laporan';
  worksheet.getCell('F9').font = { name: 'Arial', size: 9, bold: true, color: { argb: textDark } };
  worksheet.getCell('G9').value = `: ${nowStr}`;
  worksheet.getCell('G9').font = { name: 'Arial', size: 9, color: { argb: textMuted } };

  worksheet.addRow([]);

  // ==========================================
  // 3. STATISTIK RINGKASAN KELAS (EXECUTIVE SUMMARY)
  // ==========================================
  const summaryRow = worksheet.getRow(11);
  summaryRow.values = [
    'RINGKASAN KELAS',
    `Total Enroll: ${data.stats.totalEnrolled} Siswa`,
    `Ujian Selesai: ${data.stats.totalExamTaken} Siswa`,
    `Rata-Rata Nilai: ${data.stats.avgScore}`,
    `Tuntas (>= 73): ${data.stats.passCount} Siswa`,
    `Remedial (< 73): ${data.stats.totalExamTaken - data.stats.passCount} Siswa`,
    `Ketuntasan: ${data.stats.passRate}%`,
    '',
    ''
  ];
  worksheet.mergeCells('A11:A11');
  worksheet.mergeCells('G11:I11');

  for (let c = 1; c <= 9; c++) {
    const cell = summaryRow.getCell(c);
    cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: subHeaderFill } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  }
  summaryRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryNavy } };

  worksheet.addRow([]);

  // ==========================================
  // 4. TABEL UTAMA NILAI & PENGERJAAN SISWA
  // ==========================================
  const tableHeaderRowIndex = 13;
  const tableHeaderRow = worksheet.getRow(tableHeaderRowIndex);
  tableHeaderRow.values = [
    'NO',
    'NAMA LENGKAP SISWA',
    'EMAIL AKUN',
    'KELAS',
    'MODUL SELESAI',
    'JAWABAN BENAR',
    'NILAI SKOR',
    'STATUS KELULUSAN',
    'WAKTU SELESAI'
  ];
  tableHeaderRow.height = 28;

  for (let c = 1; c <= 9; c++) {
    const cell = tableHeaderRow.getCell(c);
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerFill } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  }

  // Data Rows
  let currentRowIndex = 14;

  if (!data.students || data.students.length === 0) {
    const emptyRow = worksheet.getRow(currentRowIndex);
    worksheet.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
    const emptyCell = emptyRow.getCell(1);
    emptyCell.value = 'Belum ada data siswa yang melakukan enroll pada token sesi ini.';
    emptyCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: textMuted } };
    emptyCell.alignment = { horizontal: 'center', vertical: 'middle' };
    emptyCell.border = thinBorder;
    emptyRow.height = 30;
    currentRowIndex++;
  } else {
    data.students.forEach((s, idx) => {
      const row = worksheet.getRow(currentRowIndex);
      const isEven = idx % 2 === 1;
      const rowBg = isEven ? lightBgZebra : 'FFFFFFFF';

      const isPass = s.examScore !== null && s.examScore >= 73;
      let statusText = 'BELUM UJIAN';
      let statusColor = textMuted;
      let statusBg = 'FFF1F5F9';

      if (s.hasTakenExam) {
        if (isPass) {
          statusText = 'KOMPETEN';
          statusColor = 'FF15803D'; // Green 700
          statusBg = 'FFDCFCE7';    // Green 100
        } else {
          statusText = 'BELUM KOMPETEN (REMEDIAL)';
          statusColor = 'FFB91C1C'; // Red 700
          statusBg = 'FFFEE2E2';    // Red 100
        }
      }

      const scoreDisplay = s.examScore !== null ? s.examScore : '-';
      const correctDisplay = s.correctAnswers !== null && s.totalQuestions !== null 
        ? `${s.correctAnswers} / ${s.totalQuestions}`
        : '-';

      let finishDateStr = '-';
      if (s.examSubmittedAt) {
        const d = new Date(s.examSubmittedAt);
        finishDateStr = `${d.getDate()} ${INDO_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }

      row.values = [
        idx + 1,
        s.name,
        s.email,
        s.studentClass || targetClass,
        s.totalLessonsCompleted || 0,
        correctDisplay,
        scoreDisplay,
        statusText,
        finishDateStr,
      ];

      row.height = 22;

      // Styling each cell in data row
      for (let c = 1; c <= 9; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Arial', size: 9, color: { argb: textDark } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };

        // Alignments
        if (c === 1) cell.alignment = { horizontal: 'center', vertical: 'middle' }; // No
        if (c === 2) cell.alignment = { horizontal: 'left', vertical: 'middle' };   // Nama
        if (c === 3) cell.alignment = { horizontal: 'left', vertical: 'middle' };   // Email
        if (c === 4) cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Kelas
        if (c === 5) cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Modul Selesai
        if (c === 6) cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Jawaban Benar
        if (c === 7) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Skor
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: s.examScore !== null ? (isPass ? 'FF16A34A' : 'FFDC2626') : textMuted } };
        }
        if (c === 8) {
          // Status
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: statusColor } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
        }
        if (c === 9) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Waktu
          cell.font = { name: 'Arial', size: 8.5, color: { argb: textMuted } };
        }
      }

      currentRowIndex++;
    });
  }

  // Spacing before signature
  currentRowIndex += 2;

  // ==========================================
  // 5. PENGESAHAN & TANDA TANGAN GURU PENGAMPU
  // ==========================================
  const signColStart = 7;
  const signDateStr = `Bandung Barat, ${formatIndonesianDate(new Date())}`;

  worksheet.getCell(`G${currentRowIndex}`).value = signDateStr;
  worksheet.getCell(`G${currentRowIndex}`).font = { name: 'Arial', size: 9.5, color: { argb: textDark } };
  worksheet.getCell(`G${currentRowIndex}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`G${currentRowIndex}:I${currentRowIndex}`);

  currentRowIndex++;
  worksheet.getCell(`G${currentRowIndex}`).value = 'Guru Pengampu Mata Pelajaran RPL,';
  worksheet.getCell(`G${currentRowIndex}`).font = { name: 'Arial', size: 9.5, bold: true, color: { argb: textDark } };
  worksheet.getCell(`G${currentRowIndex}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`G${currentRowIndex}:I${currentRowIndex}`);

  currentRowIndex += 4; // Space for signature

  worksheet.getCell(`G${currentRowIndex}`).value = teacher;
  worksheet.getCell(`G${currentRowIndex}`).font = { name: 'Arial', size: 10, bold: true, underline: true, color: { argb: textDark } };
  worksheet.getCell(`G${currentRowIndex}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`G${currentRowIndex}:I${currentRowIndex}`);

  currentRowIndex++;
  worksheet.getCell(`G${currentRowIndex}`).value = 'NIP. — / Guru Produktif RPL SMKN 1 Rongga';
  worksheet.getCell(`G${currentRowIndex}`).font = { name: 'Arial', size: 9, color: { argb: textMuted } };
  worksheet.getCell(`G${currentRowIndex}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`G${currentRowIndex}:I${currentRowIndex}`);

  // ==========================================
  // 6. AUTO-FIT COLUMN WIDTHS
  // ==========================================
  worksheet.getColumn(1).width = 6;   // No
  worksheet.getColumn(2).width = 30;  // Nama Lengkap Siswa
  worksheet.getColumn(3).width = 28;  // Email
  worksheet.getColumn(4).width = 14;  // Kelas
  worksheet.getColumn(5).width = 16;  // Modul Selesai
  worksheet.getColumn(6).width = 18;  // Jawaban Benar
  worksheet.getColumn(7).width = 14;  // Nilai Skor
  worksheet.getColumn(8).width = 26;  // Status Kelulusan
  worksheet.getColumn(9).width = 24;  // Waktu Selesai

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate a high-craft Excel report for LKPD submissions
 */
export async function generateLkpdSubmissionsExcel(submissions: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Agung Gumelar Saputra, S.Tr.T. - SMKN 1 Rongga';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Rekap Penilaian LKPD', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ state: 'frozen', ySplit: 13 }],
  });

  const primaryNavy = 'FF0F172A';
  const headerFill = 'FF1E293B';
  const lightBgZebra = 'FFF8FAFC';
  const textDark = 'FF0F172A';
  const textMuted = 'FF64748B';
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };

  // Kop
  worksheet.mergeCells('A1:H1');
  worksheet.getCell('A1').value = 'SMK NEGERI 1 RONGGA — PROGRAM KEAHLIAN PPLG / KONSENTRASI REKAYASA PERANGKAT LUNAK (RPL)';
  worksheet.getCell('A1').font = { name: 'Arial', size: 11, bold: true, color: { argb: primaryNavy } };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:H2');
  worksheet.getCell('A2').value = 'REKAPITULASI HASIL PENILAIAN LEMBAR KERJA PESERTA DIDIK (LKPD)';
  worksheet.getCell('A2').font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF0D9488' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.getCell('A4').value = 'Guru Pengampu RPL: Agung Gumelar Saputra, S.Tr.T.';
  worksheet.getCell('A4').font = { name: 'Arial', size: 9.5, bold: true };
  worksheet.getCell('A5').value = 'Standar KKM: 73 (Kompeten & Penguncian Portofolio)';
  worksheet.getCell('A5').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF16A34A' } };
  worksheet.getCell('F4').value = `Tanggal Ekspor: ${formatIndonesianDateTime(new Date())}`;
  worksheet.getCell('F4').font = { name: 'Arial', size: 9, color: { argb: textMuted } };

  // Table header
  const tableHeader = worksheet.getRow(7);
  tableHeader.values = [
    'NO',
    'NAMA SISWA',
    'KELAS',
    'MODUL PEMBELAJARAN',
    'STATUS PENILAIAN',
    'SKOR (KKM 73)',
    'CATATAN & FEEDBACK GURU',
    'WAKTU PENGUMPULAN'
  ];
  tableHeader.height = 26;

  for (let c = 1; c <= 8; c++) {
    const cell = tableHeader.getCell(c);
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerFill } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  }

  let rowIdx = 8;
  submissions.forEach((sub, i) => {
    const row = worksheet.getRow(rowIdx);
    const isEven = i % 2 === 1;
    const isPass = sub.teacherScore !== null && sub.teacherScore >= 73;
    
    let statusLabel = 'MENUNGGU PENILAIAN';
    let statusBg = 'FFFFFBEB';
    let statusFg = 'FFB45309';

    if (sub.teacherScore !== null) {
      if (isPass) {
        statusLabel = 'TUNTAS KKM (TERKUNCI)';
        statusBg = 'FFDCFCE7';
        statusFg = 'FF15803D';
      } else {
        statusLabel = 'REMEDIAL / PERLU PERBAIKAN';
        statusBg = 'FFFEE2E2';
        statusFg = 'FFB91C1C';
      }
    }

    const dateStr = sub.submittedAt ? formatIndonesianDateTime(new Date(sub.submittedAt)) : '-';

    row.values = [
      i + 1,
      sub.userName,
      sub.studentClass || '-',
      sub.lessonSlug,
      statusLabel,
      sub.teacherScore !== null ? sub.teacherScore : '-',
      sub.teacherNotes || '-',
      dateStr
    ];

    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Arial', size: 9, color: { argb: textDark } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? lightBgZebra : 'FFFFFFFF' } };
      cell.border = thinBorder;
      cell.alignment = { vertical: 'middle' };
      if (c === 1 || c === 3 || c === 8) cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (c === 5) {
        cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: statusFg } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
      if (c === 6) {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: isPass ? 'FF15803D' : 'FFDC2626' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    }

    rowIdx++;
  });

  // Spacing before signature
  rowIdx += 2;

  // Tanda Tangan Guru Pengampu LKPD
  const signDateStr = `Bandung Barat, ${formatIndonesianDate(new Date())}`;
  worksheet.getCell(`F${rowIdx}`).value = signDateStr;
  worksheet.getCell(`F${rowIdx}`).font = { name: 'Arial', size: 9.5, color: { argb: textDark } };
  worksheet.getCell(`F${rowIdx}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`F${rowIdx}:H${rowIdx}`);

  rowIdx++;
  worksheet.getCell(`F${rowIdx}`).value = 'Guru Pengampu Mata Pelajaran RPL,';
  worksheet.getCell(`F${rowIdx}`).font = { name: 'Arial', size: 9.5, bold: true, color: { argb: textDark } };
  worksheet.getCell(`F${rowIdx}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`F${rowIdx}:H${rowIdx}`);

  rowIdx += 4;

  worksheet.getCell(`F${rowIdx}`).value = 'Agung Gumelar Saputra, S.Tr.T.';
  worksheet.getCell(`F${rowIdx}`).font = { name: 'Arial', size: 10, bold: true, underline: true, color: { argb: textDark } };
  worksheet.getCell(`F${rowIdx}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`F${rowIdx}:H${rowIdx}`);

  rowIdx++;
  worksheet.getCell(`F${rowIdx}`).value = 'NIP. — / Guru Produktif RPL SMKN 1 Rongga';
  worksheet.getCell(`F${rowIdx}`).font = { name: 'Arial', size: 9, color: { argb: textMuted } };
  worksheet.getCell(`F${rowIdx}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`F${rowIdx}:H${rowIdx}`);

  worksheet.getColumn(1).width = 6;
  worksheet.getColumn(2).width = 28;
  worksheet.getColumn(3).width = 12;
  worksheet.getColumn(4).width = 24;
  worksheet.getColumn(5).width = 26;
  worksheet.getColumn(6).width = 16;
  worksheet.getColumn(7).width = 36;
  worksheet.getColumn(8).width = 24;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate a high-craft Excel report for Jurnal Refleksi submissions
 */
export async function generateReflectionsExcel(reflections: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Agung Gumelar Saputra, S.Tr.T. - SMKN 1 Rongga';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Jurnal Refleksi Siswa', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ state: 'frozen', ySplit: 7 }],
  });

  const primaryNavy = 'FF0F172A';
  const headerFill = 'FF1E293B';
  const lightBgZebra = 'FFF8FAFC';
  const textDark = 'FF0F172A';
  const textMuted = 'FF64748B';
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };

  // Kop
  worksheet.mergeCells('A1:J1');
  worksheet.getCell('A1').value = 'SMK NEGERI 1 RONGGA — PROGRAM KEAHLIAN PPLG / KONSENTRASI REKAYASA PERANGKAT LUNAK (RPL)';
  worksheet.getCell('A1').font = { name: 'Arial', size: 11, bold: true, color: { argb: primaryNavy } };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:J2');
  worksheet.getCell('A2').value = 'REKAPITULASI JURNAL REFLEKSI PEMBELAJARAN & SUARA SISWA (ASESMEN FORMATIF)';
  worksheet.getCell('A2').font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFDB2777' } }; // Pink 600
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.getCell('A4').value = 'Guru Pengampu RPL: Agung Gumelar Saputra, S.Tr.T.';
  worksheet.getCell('A4').font = { name: 'Arial', size: 9.5, bold: true };
  worksheet.getCell('A5').value = 'Sifat Asesmen: Kualitatif / Suara Siswa & Umpan Balik Guru';
  worksheet.getCell('A5').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFDB2777' } };
  worksheet.getCell('H4').value = `Tanggal Ekspor: ${formatIndonesianDateTime(new Date())}`;
  worksheet.getCell('H4').font = { name: 'Arial', size: 9, color: { argb: textMuted } };

  // Table header
  const tableHeader = worksheet.getRow(7);
  tableHeader.values = [
    'NO',
    'NAMA SISWA',
    'KELAS',
    'MODUL',
    'HAL BARU DIPELAJARI (Q1)',
    'URGENSI PORTOFOLIO (Q2)',
    'KENDALA & SOLUSI (Q3)',
    'KOMITMEN BELAJAR (Q4)',
    'TANGGAPAN / APRESIASI GURU',
    'STATUS & WAKTU'
  ];
  tableHeader.height = 28;

  for (let c = 1; c <= 10; c++) {
    const cell = tableHeader.getCell(c);
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerFill } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  }

  let rowIdx = 8;
  reflections.forEach((ref, i) => {
    const row = worksheet.getRow(rowIdx);
    const isEven = i % 2 === 1;
    const isReviewed = ref.status === 'reviewed';

    const dateStr = ref.submittedAt ? formatIndonesianDateTime(new Date(ref.submittedAt)) : '-';

    row.values = [
      i + 1,
      ref.userName,
      ref.studentClass || '-',
      ref.lessonSlug,
      ref.q1 || '-',
      ref.q2 || '-',
      ref.q3 || '-',
      ref.q4 || '-',
      ref.teacherFeedback || '-',
      `${isReviewed ? '✓ Ditinjau' : '⏳ Baru'}\n(${dateStr})`
    ];

    for (let c = 1; c <= 10; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Arial', size: 9, color: { argb: textDark } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? lightBgZebra : 'FFFFFFFF' } };
      cell.border = thinBorder;
      cell.alignment = { vertical: 'middle', wrapText: true };
      if (c === 1 || c === 3) cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (c === 10) {
        cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: isReviewed ? 'FFDB2777' : 'FFB45309' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }
    }

    rowIdx++;
  });

  // Spacing before signature
  rowIdx += 2;

  // Tanda Tangan Guru Pengampu Refleksi
  const signDateStr = `Bandung Barat, ${formatIndonesianDate(new Date())}`;
  worksheet.getCell(`H${rowIdx}`).value = signDateStr;
  worksheet.getCell(`H${rowIdx}`).font = { name: 'Arial', size: 9.5, color: { argb: textDark } };
  worksheet.getCell(`H${rowIdx}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`H${rowIdx}:J${rowIdx}`);

  rowIdx++;
  worksheet.getCell(`H${rowIdx}`).value = 'Guru Pengampu Mata Pelajaran RPL,';
  worksheet.getCell(`H${rowIdx}`).font = { name: 'Arial', size: 9.5, bold: true, color: { argb: textDark } };
  worksheet.getCell(`H${rowIdx}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`H${rowIdx}:J${rowIdx}`);

  rowIdx += 4;

  worksheet.getCell(`H${rowIdx}`).value = 'Agung Gumelar Saputra, S.Tr.T.';
  worksheet.getCell(`H${rowIdx}`).font = { name: 'Arial', size: 10, bold: true, underline: true, color: { argb: textDark } };
  worksheet.getCell(`H${rowIdx}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`H${rowIdx}:J${rowIdx}`);

  rowIdx++;
  worksheet.getCell(`H${rowIdx}`).value = 'NIP. — / Guru Produktif RPL SMKN 1 Rongga';
  worksheet.getCell(`H${rowIdx}`).font = { name: 'Arial', size: 9, color: { argb: textMuted } };
  worksheet.getCell(`H${rowIdx}`).alignment = { horizontal: 'center' };
  worksheet.mergeCells(`H${rowIdx}:J${rowIdx}`);

  worksheet.getColumn(1).width = 6;
  worksheet.getColumn(2).width = 24;
  worksheet.getColumn(3).width = 12;
  worksheet.getColumn(4).width = 20;
  worksheet.getColumn(5).width = 32;
  worksheet.getColumn(6).width = 32;
  worksheet.getColumn(7).width = 32;
  worksheet.getColumn(8).width = 32;
  worksheet.getColumn(9).width = 34;
  worksheet.getColumn(10).width = 22;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

