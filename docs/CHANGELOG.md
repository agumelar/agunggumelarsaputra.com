# Changelog

Semua perubahan penting pada proyek **agunggumelarsaputra.com** akan dicatat dalam dokumen ini.
Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased] - Sesi Mendatang
### Added
- Opsi Hapus Akun siswa melalui panel Admin (`/admin/users`).
- Generator PDF Otomatis untuk Rekap Portofolio Skill Passport Siswa.

## [2.5.1] - 2026-08-08
### Changed
- **Penyempurnaan Tata Letak Modul Reader (`src/pages/pembelajaran/[...slug].astro`):**
  - Memindahkan blok akordeon **"📜 Bacaan Rujukan Silabus & Catatan Kurikulum Lengkap"** ke posisi paling atas pada tab panel Materi (`#panel-materi`).
  - Memperhalus visual outline summary & padding akordeon agar lebih elegan, bersih, dan mudah dibuka-tutup oleh siswa sebelum mendalami materi interaktif.

---

## [2.5.0] - 2026-08-08
### Added
- **Sistem Ekspor Rekap Nilai & Asesmen Resmi ke Format Excel (`.xlsx` via `exceljs`):**
  - **Desain Laporan Profesional Guru (High-Craft Format):**
    - Kop Resmi Lembaga (SMK Negeri 1 Rongga - Konsentrasi Keahlian PPLG).
    - Metadata Sesi Belajar (Guru Pengampu, Mata Pelajaran, Token Akses, Kelas Target, KKM 73, Tanggal Ekspor).
    - Kotak Ringkasan Statistik (Total Peserta, Peserta Ujian, Rata-rata Skor, Persentase Ketuntasan).
    - Tabel Data Siswa Berwarna Navy Modern (`#1E293B`), zebra-striping, conditional badge (Kompeten / Belum Kompeten / Menunggu), alignment rapi, dan auto-column fit.
    - Blok Tanda Tangan Resmi Pengesahan Guru Pengampu (`Agung Gumelar Saputra, S.Tr.T.`).
  - **Ekspor Rekap Sesi / Token Belajar:**
    - Endpoint API `/api/admin/tokens/export-excel` untuk mengunduh rekap evaluasi per token sesi/ujian.
    - Tombol `📥 Excel` langsung pada tabel manajemen token dan tombol `📥 Unduh Excel (.xlsx)` pada modal rekapitulasi.
  - **Ekspor Rekap Hasil LKPD Siswa:**
    - Endpoint API `/api/admin/submissions/export-excel` untuk mengunduh seluruh data penilaian tugas kerja praktik / LKPD siswa lengkap dengan skor, status KKM (73), dan catatan evaluasi guru.
    - Tombol `📥 Rekap LKPD (.xlsx)` pada header seksi Penilaian LKPD.
  - **Ekspor Rekap Jurnal Refleksi Pembelajaran:**
    - Endpoint API `/api/admin/reflections/export-excel` untuk mengunduh seluruh jurnal suara siswa (Q1 s/d Q4) dan umpan balik guru.
    - Tombol `📥 Rekap Refleksi (.xlsx)` pada header seksi Jurnal Refleksi.

---

## [2.4.4] - 2026-08-07
### Added
- **Pemisahan Terpadu Jurnal Refleksi Siswa dari Evaluasi LKPD di Dashboard Guru (`/admin`):**
  - **Seksi & Tabel Mandiri (`#reflections`):** Memisahkan data Jurnal Refleksi Pembelajaran ke dalam seksi terpisah khusus asesmen formatif kualitatif, sehingga tidak bercampur dengan portofolio kerja praktik / LKPD.
  - **Asesmen Kualitatif Murni (Tanpa Beban Skor Angka / KKM):** Jurnal refleksi difokuskan untuk menampung suara siswa (hal baru, pandangan portofolio vs ijazah, kendala teknis, dan komitmen belajar) serta tanggapan/apresiasi guru tanpa tuntutan angka KKM.
  - **Endpoint API Review Refleksi (`/api/admin/submissions/review.ts`):** Endpoint khusus untuk menyimpan tanggapan guru dan menandai status `reviewed`.
  - **Modal Tinjau Jurnal Refleksi (`#reflection-modal`):** Modal khusus dengan visualisasi 4 butir refleksi terstruktur, tautan Google Drive siswa, textarea tanggapan guru, dan tombol quick preset chip apresiasi.
  - **Pemisahan KPI Metrics & Hero Banner Admin:** Metrik dashboard kini menampilkan counter terpisah untuk LKPD (Menunggu Penilaian vs Dinilai) dan Refleksi (Baru vs Telah Ditinjau).
  - **Sistem Filter Independen:** Filter pencarian nama/email/slug, filter rombel/kelas, dan filter status kini bekerja secara independen pada tabel LKPD dan tabel Jurnal Refleksi.

---

## [2.4.3] - 2026-08-07
### Changed
- **Penyesuaian Standar KKM Orientasi PPLG (KKM: 73):**
  - Mengubah nilai ambang batas KKM dari 75 menjadi **73** pada seluruh ekosistem pembelajaran.
  - Penyesuaian ambang tuntas & penguncian otomatis formulir LKPD (`InteractiveLkpdP1.astro`, `GeneralInteractiveLkpd.astro`) menjadi $\ge 73$.
  - Penyesuaian ambang remedial LKPD menjadi $< 73$.
  - Proteksi server-side endpoint `/api/submissions/save.ts` kini menggunakan ambang batas 73.
  - Sinkronisasi indikator KKM pada panel Admin (`/admin`), rekap token (`/api/admin/tokens/report.ts`), dan dashboard riwayat siswa (`/dashboard/riwayat.astro`).

---

## [2.4.2] - 2026-08-07
### Added
- **Sistem Penguncian Portofolio & Remedial Terpadu (Mastery Learning):**
  - **Auto-Locking Modul Tuntas (Skor $\ge$ 75):**
    - Formulir LKPD (`InteractiveLkpdP1.astro` dan `GeneralInteractiveLkpd.astro`) otomatis dikunci (*disabled state*) setelah dinilai oleh Guru dan memenuhi standar KKM (75).
    - Tombol simpan draf & kirim dinonaktifkan dan digantikan dengan banner konfirmasi: *"Lembar Kerja Ini Telah Dinilai & Tuntas KKM (Formulir Terkunci sebagai Portofolio Resmi)"*.
    - Tombol tambah/hapus baris audit disembunyikan untuk menjaga integritas arsip portofolio siswa.
  - **Alur Remedial / Perbaikan (Skor < 75):**
    - Formulir tetap terbuka (*editable*) jika nilai belum mencapai KKM.
    - Banner evaluasi menampilkan status kuning/amber peringatan: *"Perlu Perbaikan / Remedial LKPD (Nilai di bawah KKM 75)"* lengkap dengan instruksi perbaikan dari catatan guru.
    - Tombol kirim berubah otomatis menjadi *"Simpan & Kirim Ulang Perbaikan LKPD"*.
  - **Proteksi Server-Side:**
    - Endpoint `/api/submissions/save.ts` memvalidasi `teacherScore` secara mutlak; jika `teacherScore >= 75`, mutasi data ditolak (HTTP 403 Forbidden).
    - Jika siswa mengirim ulang perbaikan (remedial), status pengumpulan direset kembali menjadi `submitted` agar guru dapat memeriksa perbaikan tersebut.
  - **Penyempurnaan Label Admin Table:** Kolom status pada `/admin#submissions` kini membedakan badge `✓ Tuntas (Kunci)` (hijau) dan `⚠️ Remedial` (kuning) secara instan.

---

## [2.4.1] - 2026-08-07
### Enhanced
- **Penyempurnaan Modal Periksa Nilai Guru (`/admin#submissions`):**
  - **Parsing Aman & Multi-Format:** Mengatasi issue serialisasi/stringification form data siswa dengan parser berlapis `parseFormDataSafe`.
  - **Visualisasi Terstruktur Jawaban Siswa:**
    - Tabel interaktif khusus untuk hasil audit aplikasi LKPD (No, Nama Aplikasi & Platform, Fitur Utama, Peran Pengembang RPL).
    - Kartu terpisah untuk butir-butir jurnal refleksi mandiri siswa (`q1` s/d `q4`).
    - Kartu identitas pengumpulan (Nama, NISN, Rombel/Kelas, Waktu Submit).
    - Callout khusus tautan Google Drive portofolio siswa.
  - **Preset Catatan Feedback Cepat:** Menambahkan tombol chip preset respons guru (*Kerja Luar Biasa*, *Analisis Tepat*, *Perlu Pendalaman*, *Tuntas KKM*) untuk mempercepat alur kerja koreksi.
  - **Indikator Status Skor Real-Time:** Penanda status ketercapaian KKM (75) yang berubah dinamis saat guru mengetikkan nilai angka.
  - **Keyboard & UX Shortcuts:** Dukungan penutupan modal via tombol `Esc` dan klik backdrop luar.

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
