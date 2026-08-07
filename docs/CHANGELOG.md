# Changelog

Semua perubahan penting pada proyek **agunggumelarsaputra.com** akan dicatat dalam dokumen ini.
Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased] - Sesi Mendatang
### Added
- Opsi Hapus Akun siswa melalui panel Admin (`/admin/users`).
- Generator PDF Otomatis untuk Rekap Portofolio Skill Passport Siswa.

---

## [2.4.0] - 2026-08-07
### Added
- **Sistem Evaluasi & Penilaian LKPD oleh Guru:**
  - **Panel Penilaian Terpadu (`/admin#submissions`):** Tabel pemantauan seluruh lembar kerja LKPD dan refleksi siswa dengan filter pencarian instan (nama/email/modul), filter kelas rombel, serta filter status penilaian (*Menunggu* / *Sudah Dinilai*).
  - **Modal Penilaian Guru Interaktif (`#grade-modal`):**
    - Penampil data jawaban & formulir terstruktur siswa (tabel audit, isian teks, array/JSON viewer, tautan bukti Google Drive).
    - Form penilaian guru: Skor Angka (0-100), Capaian KKTP (Level 0 - Level 4), serta Catatan & Evaluasi Konstruktif Guru.
  - **Backend API & Database Grading:**
    - Penambahan kolom `teacherScore`, `teacherLevel`, `teacherFeedback`, `gradedBy`, dan `gradedAt` pada tabel `user_submissions`.
    - Endpoint `/api/admin/submissions/grade.ts` untuk memvalidasi dan menyimpan penilaian guru.
    - Pembaruan endpoint `/api/submissions/get.ts` untuk mengembalikan status penilaian & feedback guru.
  - **Integrasi Dashboard Siswa (`/dashboard`):**
    - Section "Riwayat & Evaluasi Nilai LKPD Siswa" yang menampilkan seluruh riwayat pengerjaan modul siswa.
    - Status badge interaktif (⏳ *Menunggu Evaluasi Guru* / ⭐ *Skor & Nilai Tuntas*).
    - Card feedback guru yang memuat skor angka, level KKTP, serta pesan catatan evaluasi langsung dari guru.

---

## [2.3.0] - 2026-08-07
### Added
- **Interactive & Gamified Module Reader (`/pembelajaran/[...slug]`):**
  - **Sistem Tab Interaktif:** Pemisahan navigasi modul menjadi 4 Tab: (1) 📖 Materi & Konsep, (2) 📝 Form LKPD Interaktif, (3) 💭 Jurnal Refleksi Siswa, dan (4) 🎯 Panduan Kriteria Guru (KKTP & Tangga Level 0-4).
  - **Komponen Form LKPD Interaktif (`InteractiveLkpdP1.astro`):** Pengisian identitas, tabel dinamis audit teknologi 24 jam (+ tambah baris), input URL Google Drive dengan live validator format tautan, dan checklist verifikasi mandiri.
  - **Komponen Jurnal Refleksi Interaktif (`InteractiveReflectionForm.astro`):** 4 prompt refleksi mendalam terstruktur untuk evaluasi pemahaman mandiri siswa.
  - **Komponen Panduan Kriteria Guru (`KktpGuideCard.astro`):** Matriks referensi transparan bagi siswa mengenai standar penilaian guru (Level 0 - 4 dan target minimal Level 2).
  - **Komponen Micro Knowledge Check (`InteractiveKnowledgeCheck.astro`):** Checkpoint mini-kuis interaktif di sela materi dengan visual feedback instan dan reward XP.
  - **Database & API Submissions:**
    - Tabel `userSubmissions` di Drizzle ORM / Neon PostgreSQL.
    - Endpoint `/api/submissions/save` (menyimpan respons LKPD & Refleksi siswa serta otomatis menambahkan gamification XP).
    - Endpoint `/api/submissions/get` (mengambil riwayat & draft jawaban yang tersimpan).

### Added
- **Penyelesaian Lengkap Modul Pembelajaran Sprint 2 (OR-02):**
  - Modul 09: `orientasi-pplg-09-app-audit-produk-digital.md` (App Audit 3 Aplikasi Populer).
  - Modul 10: `orientasi-pplg-10-ui-ux-fungsi-produk.md` (Anatomi UI, UX & Komparasi Head-to-Head).
  - Modul 11: `orientasi-pplg-11-framework-review-6-komponen.md` (Kerangka Baku Analisis Software 6 Komponen).
  - Modul 12: `orientasi-pplg-12-latihan-analisis-anotasi-visual.md` (Metode CER & Screenshot Ber-Anotasi).
  - Modul 13: `orientasi-pplg-13-review-show-peer-feedback.md` (Lightning Talk 3 Menit & Peer Feedback Protokol).
  - Modul 14: `orientasi-pplg-14-finalisasi-dokumen-review.md` (Standarisasi Struktur PDF Laporan Review).
  - Modul 15: `orientasi-pplg-15-pengumpulan-validasi-or02.md` (Pengumpulan Google Drive & Validasi Level 0-4).
  - Modul 16: `orientasi-pplg-16-rekap-skill-clinic-refleksi.md` (Rekapitulasi Semester 1 & Skill Clinic).
- **Refinement Modul Pembelajaran Sprint 1 (OR-01):**
  - Modul 05: `orientasi-pplg-05-job-fair-kelas.md` (Simulasi Job Fair & Eksplorasi Booth).
  - Modul 06: `orientasi-pplg-06-rencana-minat-awal.md` (Peta Jalan Karier 3 Tahun Siswa).
  - Modul 07: `orientasi-pplg-07-mind-map-profesi-pplg.md` (Visualisasi Konsep & Desain Mind Map).
  - Modul 08: `orientasi-pplg-08-finalisasi-validasi-or01.md` (Validasi Sumatif & Portofolio Evidence OR-01).
- **Pembaruan Halaman Silabus Terpusat (`/pembelajaran/orientasi-pplg.astro`):**
  - Struktur 16 Modul Mandiri (8 Modul Sprint 1 + 8 Modul Sprint 2).
  - Kalkulasi total XP belajar diperbarui menjadi +240 XP.

---

## [2.1.0] - 2026-08-06
### Added
- **Sistem Enrollment Berbasis Token:**
  - Tabel `enrollmentTokens` dan `userEnrollments` di database Drizzle ORM.
  - Endpoint `/api/enroll` untuk validasi dan klaim token siswa per kelas atau target kurikulum.
  - Endpoint `/api/admin/tokens/create` dan panel manajemen token admin.
- **Katalog Pembelajaran Modular:**
  - Rombak halaman `/pembelajaran` menjadi Card Hub terpadu ("Orientasi PPLG").
  - Halaman silabus terpusat di `/pembelajaran/orientasi-pplg.astro` dengan sistem token-gating.
- **Konversi Modul Ajar (Pertemuan 1 - 8):**
  - Modul 1: `orientasi-pplg-01-pengantar-skill-passport.md`
  - Modul 2: `orientasi-pplg-02-profesi-peluang-karier.md`
  - Modul 3: `orientasi-pplg-03-ekosistem-industri-pplg.md`
  - Modul 4: `orientasi-pplg-04-matriks-skill-jenjang-karier.md`
  - Modul 5: `orientasi-pplg-05-mindmap-rencana-minat-or01.md`
  - Modul 6: `orientasi-pplg-06-produk-digital-app-audit.md`
  - Modul 7: `orientasi-pplg-07-framework-review-6-komponen.md`
  - Modul 8: `orientasi-pplg-08-validasi-evidence-or02-rekap.md`
- **Script Dev Server Lokal:**
  - `dev-server.mjs` dibuat untuk mengeksekusi Astro dev secara programatik di lingkungan Windows/Node.

### Changed
- Refinement desain UI/UX: Membuang semua elemen generik "AI slop" (gradien neon ungu/cyan, blur aura, glassmorphism berlebihan) dan menggantinya dengan desain solid, kontras tinggi, dan artisanal.
- Pembaruan gelar pengajar menjadi `Agung Gumelar Saputra, S.Tr.T.`.

### Fixed
- Stabilisasi build SSR dengan Vercel Adapter (`@astrojs/vercel`).

---

## [2.0.0] - 2026-08-05
### Added
- Integrasi Drizzle ORM & Neon Serverless PostgreSQL (`src/db/`).
- Autentikasi JWT Session Cookie (`ags_session`) & Google OAuth (Arctic).
- Proteksi route via Astro Middleware (`src/middleware.ts`).
- Fitur Gamifikasi (XP, Level, Streak harian).
- Simulator Tryout CBT TKA PPLG dengan timer dan rekap penilaian real-time.
