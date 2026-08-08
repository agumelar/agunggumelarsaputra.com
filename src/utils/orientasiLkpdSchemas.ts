import type { OrientasiSlug } from './orientasiPplgPolicy.ts';

export type LkpdFieldType = 'text' | 'textarea' | 'url';

export interface LkpdField {
  name: string;
  label: string;
  type?: LkpdFieldType;
  placeholder?: string;
  required?: boolean;
}

export interface LkpdSection {
  title: string;
  description?: string;
  fields: LkpdField[];
}

export interface OrientasiLkpdSchema {
  evidence: string;
  sections: LkpdSection[];
}

const textarea = (name: string, label: string, placeholder = ''): LkpdField => ({ name, label, type: 'textarea', placeholder, required: true });
const text = (name: string, label: string): LkpdField => ({ name, label, type: 'text', required: true });
const url = (name: string, label: string): LkpdField => ({ name, label, type: 'url', placeholder: 'https://drive.google.com/...', required: true });

const professionFields = [1, 2, 3].flatMap((number) => [
  text(`profession${number}Name`, `Profesi ${number} — nama profesi`),
  textarea(`profession${number}Responsibilities`, `Profesi ${number} — tugas dan tanggung jawab utama`),
  textarea(`profession${number}Tools`, `Profesi ${number} — bahasa atau tools yang wajib dipelajari`),
  textarea(`profession${number}Reason`, `Profesi ${number} — alasan ketertarikan`),
]);

export const ORIENTASI_LKPD_SCHEMAS: Partial<Record<OrientasiSlug, OrientasiLkpdSchema>> = {
  'orientasi-pplg-02-profesi-peluang-karier': {
    evidence: 'Tabel eksplorasi 3 profesi pilihan dan rencana belajar awal (PDF di Google Drive).',
    sections: [
      { title: 'B. Riset Mandiri 3 Profesi Pilihan', description: 'Lengkapi empat aspek untuk masing-masing dari tiga profesi.', fields: professionFields },
      { title: 'C. Pemetaan Rencana Belajar Awal', fields: [text('priorityProfession', 'Profesi prioritas utama'), textarea('actionStep1', 'Langkah konkret 1 minggu ini'), textarea('actionStep2', 'Langkah konkret 2 minggu ini')] },
    ],
  },
  'orientasi-pplg-03-ekosistem-industri-pplg': {
    evidence: 'Peta ekosistem industri dan analisis jalur kerja (PDF).',
    sections: [
      { title: 'B. Analisis Kasus Ekosistem Kerja', fields: [textarea('ecosystemComparison', 'Bandingkan startup, software house, corporate IT, freelancer, dan in-house IT'), textarea('caseDecision', 'Pilih ekosistem untuk studi kasus dan jelaskan alasannya')] },
      { title: 'C. Rencana Jalur Karier Pasca-SMK', fields: [textarea('careerRoute', 'Rute karier yang dipilih'), textarea('preparationPlan', 'Persiapan kompetensi dan portofolio')] },
    ],
  },
  'orientasi-pplg-04-matriks-skill-jenjang-karier': {
    evidence: 'Profil profesi dan matriks kebutuhan skill (PDF).',
    sections: [
      { title: 'B. Analisis Lowongan Kerja Nyata', fields: [text('vacancyRole', 'Nama posisi dan perusahaan'), textarea('vacancyRequirements', 'Tanggung jawab, hard skill, dan soft skill pada lowongan'), url('vacancyEvidenceUrl', 'URL sumber lowongan sebagai evidence')] },
      { title: 'C. Gap Analysis Diri', fields: [textarea('currentSkills', 'Skill yang sudah dimiliki'), textarea('skillGaps', 'Kesenjangan skill menuju posisi target'), textarea('gapActionPlan', 'Rencana menutup kesenjangan')] },
    ],
  },
  'orientasi-pplg-05-job-fair-kelas': {
    evidence: 'Catatan kunjungan job fair dan log wawasan karier.',
    sections: [{ title: 'Log Kunjungan Booth', fields: [textarea('boothOneNotes', 'Catatan booth profesi 1'), textarea('boothTwoNotes', 'Catatan booth profesi 2'), textarea('elevatorPitch', 'Naskah elevator pitch 30–60 detik')] }],
  },
  'orientasi-pplg-06-rencana-minat-awal': {
    evidence: 'Draft dokumen rencana minat awal siswa (PDF).',
    sections: [{ title: 'Rencana Minat Awal', fields: [text('targetProfession', 'Profesi yang menjadi target awal'), textarea('interestReasons', 'Alasan dan kekuatan diri yang mendukung'), textarea('learningRoadmap', 'Roadmap belajar bertahap'), textarea('firstMonthTargets', 'Target konkret 30 hari pertama')] }],
  },
  'orientasi-pplg-07-mind-map-profesi-pplg': {
    evidence: 'Mind map profesi PPLG ukuran A3 atau gambar digital PDF.',
    sections: [{ title: 'Rancangan Mind Map', fields: [text('centralProfession', 'Profesi pada pusat mind map'), textarea('skillBranches', 'Cabang hard skill dan soft skill'), textarea('toolBranches', 'Cabang bahasa, tools, dan hasil karya'), textarea('collaborationBranches', 'Cabang kolaborasi dengan profesi lain')] }],
  },
  'orientasi-pplg-08-finalisasi-validasi-or01': {
    evidence: 'Berkas final OR-01 yang sudah divalidasi dan dapat diakses guru.',
    sections: [{ title: 'Validasi Evidence OR-01', fields: [textarea('or01Inventory', 'Daftar evidence P2–P7 yang diperiksa'), textarea('revisionLog', 'Perbaikan yang dilakukan setelah validasi'), textarea('accessValidation', 'Hasil pengecekan nama file, folder, dan izin akses')] }],
  },
  'orientasi-pplg-09-app-audit-produk-digital': {
    evidence: 'Tabel App Audit untuk 3 aplikasi populer (PDF/GDoc).',
    sections: [{ title: 'Audit 3 Produk Digital', fields: [textarea('appOneAudit', 'Aplikasi 1 — pengguna, masalah, fungsi, dan nilai produk'), textarea('appTwoAudit', 'Aplikasi 2 — pengguna, masalah, fungsi, dan nilai produk'), textarea('appThreeAudit', 'Aplikasi 3 — pengguna, masalah, fungsi, dan nilai produk'), textarea('auditConclusion', 'Kesimpulan komparatif')] }],
  },
  'orientasi-pplg-10-ui-ux-fungsi-produk': {
    evidence: 'Catatan komparasi UI/UX dan fungsi produk digital (PDF).',
    sections: [{ title: 'Komparasi UI, UX, dan Fungsi', fields: [textarea('uiAnalysis', 'Analisis elemen User Interface'), textarea('uxAnalysis', 'Analisis alur User Experience'), textarea('functionAnalysis', 'Analisis fungsi utama produk'), textarea('improvementProposal', 'Usulan perbaikan berbasis temuan')] }],
  },
  'orientasi-pplg-11-framework-review-6-komponen': {
    evidence: 'Draf dokumen review enam komponen (PDF).',
    sections: [{ title: 'Draf Review Produk', fields: [text('productIdentity', 'Identitas produk digital'), textarea('targetAndProblem', 'Target pengguna dan problem statement'), textarea('keyFunctions', 'Fungsionalitas dan fitur kunci'), textarea('uiUxReview', 'Review UI/UX'), textarea('strengthsWeaknesses', 'Kelebihan dan kekurangan'), textarea('recommendation', 'Kesimpulan dan rekomendasi')] }],
  },
  'orientasi-pplg-12-latihan-analisis-anotasi-visual': {
    evidence: 'Dua screenshot beranotasi dengan analisis Claim–Evidence–Reasoning (PDF).',
    sections: [
      { title: '1. Bukti Visual Positif (Kelebihan)', fields: [url('positiveScreenshotUrl', 'URL screenshot dengan anotasi hijau'), textarea('positiveClaim', 'Claim positif'), textarea('positiveEvidence', 'Evidence positif'), textarea('positiveReasoning', 'Reasoning positif')] },
      { title: '2. Bukti Visual Negatif (Kendala)', fields: [url('negativeScreenshotUrl', 'URL screenshot dengan anotasi merah'), textarea('negativeClaim', 'Claim negatif'), textarea('negativeEvidence', 'Evidence negatif'), textarea('negativeReasoning', 'Reasoning negatif')] },
    ],
  },
  'orientasi-pplg-13-review-show-peer-feedback': {
    evidence: 'Log peer feedback beserta tindak lanjut revisi.',
    sections: [{ title: 'Review Show dan Peer Feedback', fields: [text('reviewerIdentity', 'Nama rekan pemberi masukan'), textarea('strengthFeedback', 'Masukan tentang kekuatan dokumen'), textarea('improvementFeedback', 'Masukan yang perlu diperbaiki'), textarea('feedbackResponse', 'Keputusan menerima/menolak masukan beserta alasan'), textarea('revisionPlan', 'Rencana revisi')] }],
  },
  'orientasi-pplg-14-finalisasi-dokumen-review': {
    evidence: 'Draf final dokumen laporan review enam komponen (PDF).',
    sections: [{ title: 'Finalisasi Dokumen Review', fields: [textarea('revisionSummary', 'Ringkasan revisi enam komponen'), textarea('cerValidation', 'Validasi konsistensi claim, evidence, dan reasoning'), textarea('layoutValidation', 'Validasi struktur, bahasa, anotasi, dan tata letak'), textarea('finalConclusion', 'Kesimpulan final review')] }],
  },
  'orientasi-pplg-15-pengumpulan-validasi-or02': {
    evidence: 'Berkas final OR-02 yang tervalidasi dan dapat diakses asesor.',
    sections: [{ title: 'Validasi Pengumpulan OR-02', fields: [textarea('or02Inventory', 'Daftar evidence P9–P14'), textarea('fileStandardCheck', 'Hasil pengecekan nama dan format file'), textarea('sharingAccessCheck', 'Hasil pengecekan akses Google Drive'), textarea('finalRevisionLog', 'Catatan revisi terakhir')] }],
  },
  'orientasi-pplg-16-rekap-skill-clinic-refleksi': {
    evidence: 'Rekap Skill Passport dan lembar refleksi akhir semester (PDF).',
    sections: [{ title: 'Rekap dan Skill Clinic', fields: [textarea('portfolioRecap', 'Rekap capaian OR-01 dan OR-02'), textarea('strongestEvidence', 'Evidence terkuat beserta alasan'), textarea('clinicProblem', 'Kendala utama yang dibawa ke Skill Clinic'), textarea('clinicResolution', 'Solusi dan tindak lanjut hasil Skill Clinic'), textarea('nextSemesterCommitment', 'Komitmen belajar semester berikutnya')] }],
  },
};

export function getOrientasiLkpdSchema(lessonSlug: OrientasiSlug): OrientasiLkpdSchema {
  const schema = ORIENTASI_LKPD_SCHEMAS[lessonSlug];
  if (!schema) throw new Error(`Skema LKPD belum tersedia untuk ${lessonSlug}.`);
  return schema;
}
