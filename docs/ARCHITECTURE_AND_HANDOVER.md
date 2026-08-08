# Dokumentasi Arsitektur & Panduan Handover Proyek

> **Proyek:** `agunggumelarsaputra.com`  
> **Pemilik:** Agung Gumelar Saputra, S.Tr.T.  
> **Versi:** 2.1 (Fullstack Learning Hub & Vercel SSR)  
> **Terakhir Diperbarui:** 2026-08-08

---

## 1. Ikhtisar Arsitektur Sistem

Aplikasi ini dibangun menggunakan arsitektur modern berbasis **Astro v5 / v7 Server-Side Rendering (SSR)** yang berjalan di atas **Vercel Serverless Functions**, terhubung ke database **Neon Serverless PostgreSQL** menggunakan **Drizzle ORM**.

```mermaid
graph TD
    Client["Browser Siswa / Pengguna"]
    VercelEdge["Vercel Edge / Serverless Function (Astro SSR)"]
    NeonDB["Neon Serverless PostgreSQL"]
    ContentStore["Astro Content Collections (Markdown Modules)"]
    AdminPanel["Admin Dashboard (/admin)"]

    Client -->|HTTP Request / Cookie: ags_session| VercelEdge
    VercelEdge -->|Middleware Auth & Role Check| VercelEdge
    VercelEdge -->|Drizzle ORM Queries| NeonDB
    VercelEdge -->|Get Collection Query| ContentStore
    AdminPanel -->|Manage Tokens & View Analytics| VercelEdge
```

---

## 2. Struktur Data & Database Schema (`src/db/schema.ts`)

Database menggunakan PostgreSQL yang diakses via `@neondatabase/serverless` dan diatur oleh schema Drizzle:

### 2.1 Tabel `users`
Menyimpan identitas pengguna (siswa dan admin).
- `id` (Serial, PK)
- `name` (Text, Not Null)
- `email` (Text, Unique, Not Null)
- `passwordHash` (Text, Nullable jika login OAuth)
- `googleId` (Text, Unique, Nullable)
- `role` (Text, Default `'student'`, Nilai: `'student'` | `'admin'`)
- `studentClass` (Text, Nullable: misal `'10 RPL 1'`)
- `avatarUrl` (Text, Nullable)
- `createdAt` (Timestamp, Default `NOW()`)

### 2.2 Tabel `enrollment_tokens`
Token akses yang dibuat oleh admin untuk mengunci atau membatasi akses materi / ujian.
- `id` (Serial, PK)
- `token` (Text, Unique, Not Null, e.g., `'OPPLG-XRPL1'`)
- `title` (Text, Not Null, e.g., `'Akses Orientasi PPLG Kelas 10 RPL 1'`)
- `description` (Text, Nullable)
- `targetType` (Text, Default `'all'`, Nilai: `'orientasi-pplg'` | `'tka'` | `'module'` | `'all'`)
- `targetSlug` (Text, Nullable, diisi slug spesifik jika `targetType = 'module'`)
- `targetClass` (Text, Default `'Semua Kelas'`)
- `isActive` (Boolean, Default `true`)
- `createdBy` (Integer, FK -> `users.id`)
- `createdAt` (Timestamp, Default `NOW()`)
- `expiresAt` (Timestamp, Nullable)

### 2.3 Tabel `user_enrollments`
Menghubungkan user dengan token yang berhasil mereka klaim.
- `id` (Serial, PK)
- `userId` (Integer, FK -> `users.id`, Cascade Delete)
- `tokenId` (Integer, FK -> `enrollment_tokens.id`, Cascade Delete)
- `enrolledAt` (Timestamp, Default `NOW()`)

### 2.4 Tabel `user_gamification`
Menyimpan data gamifikasi belajar siswa.
- `id` (Serial, PK)
- `userId` (Integer, FK -> `users.id`, Unique)
- `xp` (Integer, Default 0)
- `level` (Integer, Default 1)
- `streakDays` (Integer, Default 1)
- `lastActiveDate` (Timestamp, Default `NOW()`)

### 2.5 Tabel `user_progress`
Mencatat histori penyelesaian modul per siswa.
- `id` (Serial, PK)
- `userId` (Integer, FK -> `users.id`)
- `tokenId` (Integer, FK -> `enrollment_tokens.id`, Nullable)
- `lessonSlug` (Text, Not Null, e.g., `'orientasi-pplg-01-pengantar-skill-passport'`)
- `completedAt` (Timestamp, Default `NOW()`)

### 2.6 Tabel `tka_attempts`
Mencatat hasil tes uji kemampuan akademik (TKA PPLG).
- `id` (Serial, PK)
- `userId` (Integer, FK -> `users.id`)
- `tokenId` (Integer, FK -> `enrollment_tokens.id`, Nullable)
- `score` (Integer, Not Null)
- `totalQuestions` (Integer, Not Null)
- `correctAnswers` (Integer, Not Null)
- `xpEarned` (Integer, Default 0)
- `createdAt` (Timestamp, Default `NOW()`)

### 2.7 Tabel `user_submissions`
Mencatat pengumpulan lembar kerja (LKPD & Refleksi) siswa beserta nilai dan catatan evaluasi guru.
- `id` (Serial, PK)
- `userId` (Integer, FK -> `users.id`, Cascade Delete)
- `tokenId` (Integer, FK -> `enrollment_tokens.id`, Nullable)
- `lessonSlug` (Text, Not Null, e.g., `'orientasi-pplg-01-pengantar-skill-passport'`)
- `submissionType` (Text, Default `'lkpd'`, Nilai: `'lkpd'` | `'reflection'` | `'project'`)
- `formData` (JSON, Not Null)
- `driveUrl` (Text, Nullable)
- `score` (Integer, Nullable)
- `teacherScore` (Integer, Nullable)
- `teacherLevel` (Text, Nullable)
- `teacherFeedback` (Text, Nullable)
- `gradedBy` (Integer, FK -> `users.id`, Nullable)
- `gradedAt` (Timestamp, Nullable)
- `status` (Text, Default `'submitted'`, Nilai: `'submitted'` | `'graded'` | `'needs_revision'`)
- `submittedAt` (Timestamp, Default `NOW()`)
- `updatedAt` (Timestamp, Default `NOW()`)
- Unique key komposit `(userId, lessonSlug, submissionType)`. Satu siswa hanya boleh memiliki satu record per jenis submission pada satu modul; penyimpanan ulang LKPD/refleksi memperbarui record tersebut.

`ensureDbInitialized()` adalah jalur migrasi runtime untuk deployment serverless. Migrasi unique key dijalankan idempoten di bawah PostgreSQL advisory lock. Pada instalasi lama, bootstrap mengunci tabel, merangking duplikat per key, mempertahankan baris yang sudah dinilai guru terlebih dahulu (kemudian versi terbaru), menghapus baris redundan, lalu membuat index `user_submissions_user_lesson_type_unique`. Setelah index tersedia, cold start berikutnya melewati cleanup berat. Jangan menghapus cleanup ini sebelum seluruh environment dipastikan memiliki index tersebut.

---

## 3. Spesifikasi API Endpoint

| Method | Endpoint | Hak Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/register` | Publik | Registrasi akun siswa baru |
| `POST` | `/api/auth/login` | Publik | Autentikasi email/password -> Set cookie `ags_session` |
| `POST` | `/api/auth/logout` | Terautentikasi | Menghapus session cookie |
| `GET` | `/api/auth/google` | Publik | Memulai OAuth flow Google |
| `GET` | `/api/auth/callback/google` | Publik | Callback Google OAuth -> Set cookie `ags_session` |
| `POST` | `/api/enroll` | Siswa | Klaim token enrollment untuk membuka akses materi |
| `POST` | `/api/progress/complete` | Siswa | Tandai modul selesai & tambahkan XP |
| `POST` | `/api/submissions/save` | Siswa | Simpan/update LKPD/refleksi Orientasi kanonik; reward first-submit +25/+15 XP |
| `GET` | `/api/submissions/get` | Terautentikasi | Ambil riwayat & status penilaian LKPD siswa |
| `POST` | `/api/admin/submissions/grade` | Admin | Simpan skor angka, level KKTP, & feedback guru |
| `POST` | `/api/tka/submit` | Siswa | Kirim skor tryout TKA & simpan attempt |
| `GET` | `/api/leaderboard` | Publik | Mengambil data peringkat XP teratas |
| `POST` | `/api/admin/tokens/create` | Admin | Membuat token enrollment baru |
| `GET` | `/api/admin/tokens/list` | Admin | Melihat daftar semua token aktif/kedaluwarsa |
| `DELETE` | `/api/admin/tokens/[id]` | Admin | Menonaktifkan / menghapus token |

---

## 4. Standar Penulisan & Arsitektur Modul Pembelajaran (`[...slug].astro`)

Ruang lingkup katalog aktif saat ini adalah **tepat 16 modul kanonik Orientasi PPLG** di `src/content/pembelajaran/*.md`, yang dirender melalui `src/pages/pembelajaran/[...slug].astro`. Materi bawaan HTML, SQL, dan OOP telah dihapus atas keputusan pemilik; jangan menambahkan kembali materi lintas mata pelajaran ke koleksi ini tanpa desain mata pelajaran, enrollment, policy server, dan dokumentasi terpisah.

### 4.1 Format Frontmatter Standar:
```yaml
---
title: "01. Pengantar Orientasi PPLG & Skill Passport"
description: "Pengenalan dasar dunia RPL/PPLG, profil lulusan, dan setup dokumen portofolio belajar (Skill Passport)."
category: "Orientasi PPLG"
order: 1
xpReward: 50
duration: "45 Menit"
targetType: "orientasi-pplg"
tags: ["PPLG", "Kurikulum Merdeka", "Skill Passport", "Kelas 10"]
---
```

### 4.2 Ketentuan Alur Pembelajaran Sekuensial & 4-Tab Reader:
1. **Gating Antar-Modul:**
   - Siswa harus menuntaskan **Modul $N$** sebelum **Modul $N+1$** dapat diakses (Modul 1 selalu terbuka, Guru/Admin memiliki hak bypass).
   - Akses URL langsung ke modul terkunci menampilkan **Layar Proteksi (*Locked Gating Card*)**.
2. **Struktur 4 Tab Sekuensial di Dalam Modul:**
   - **Tab 1 (Materi & Visual):** Pembahasan materi + **Mini-Game / Checkpoint Quest** (sistem 3 nyawa, auto-reset state saat gagal). Lolos checkpoint membuka Tab 2.
   - **Tab 2 (Form LKPD):** Form lembar kerja interaktif (+25 XP). Menyimpan jawaban membuka Tab 3.
   - **Tab 3 (Jurnal Refleksi - Tab Terakhir):** Form refleksi metakognitif (+15 XP).
     - **ATURAN POSISI TOMBOL SELESAI:** Tombol **"Tandai Selesai & Buka Modul Selanjutnya"** (`#btn-complete-lesson`) **HANYA ADA DI TAB REFLEKSI (Tab 3)** dan tidak boleh diletakkan di tab sebelumnya.
     - Mengklik tombol ini menyimpan data penyelesaian ke tabel `user_progress` dan memicu tombol **"Lanjut ke Modul Selanjutnya ➔"**.
   - **Tab 4 (Panduan KKTP):** Standar rubrik ketercapaian kompetensi Guru (Level 0 s/d Level 4).
3. **Bilah Progres Mata Pelajaran:**
   - Bilah progres dinamis (% & rasio modul selesai dari total 16 pertemuan) ditampilkan di header reader modul dan katalog utama `/pembelajaran/orientasi-pplg`.

### 4.3 Module Parity Verification & Continuation

**Sumber kebenaran.** `orientasi-pplg-01-pengantar-skill-passport` adalah acuan perilaku dan mutu untuk seluruh modul Orientasi PPLG. Keputusan ruang lingkup dan kontrak yang disetujui dicatat di `docs/superpowers/specs/2026-08-08-module-parity-design.md`; keduanya wajib dibaca sebelum menambah atau mengubah Modul 02–16.

**Kontrak bersama yang tidak boleh diputus.** Reader `src/pages/pembelajaran/[...slug].astro` memasang `InteractiveKnowledgeCheck`, `GeneralInteractiveLkpd`, `InteractiveReflectionForm`, `KktpGuideCard`, `LiveScoreWidget`, dan `AntiCopyPasteGuardian`. Daftar `CANONICAL_ORIENTASI_SLUGS` di `src/utils/orientasiPplgPolicy.ts` adalah sumber kebenaran tunggal untuk 16 modul, sidebar, progress denominator, prerequisite, previous, dan next. State awal dari server diteruskan melalui `data-init-checkpoint`, `data-init-lkpd`, dan `data-init-reflection`; nilai `ags_checkpoint_*`, `ags_lkpd_*`, dan `ags_reflection_*` di `localStorage` hanya cache tampilan dan dilarang menjadi bukti otorisasi. `InteractiveKnowledgeCheck` mengklaim reward melalui `POST /api/gamification/claim-checkpoint` lalu memancarkan `checkpoint-passed`; listener reader membuka LKPD. `GeneralInteractiveLkpd` menyimpan `submissionType: 'lkpd'` melalui `POST /api/submissions/save` lalu memancarkan `lkpd-submitted`; listener reader membuka refleksi. Refleksi menyimpan `submissionType: 'reflection'` ke endpoint yang sama. Hanya `#btn-complete-lesson` di panel refleksi yang boleh memanggil `POST /api/progress/complete-lesson` dan mengaktifkan navigasi modul berikutnya.

**Batas katalog yang dipaksakan.** Selain `CANONICAL_ORIENTASI_SLUGS`, tidak ada Markdown aktif, Quest, atau panduan LKPD yang boleh dipublikasikan melalui alur Orientasi. `tests/orientasi-canonical-modules.test.ts` memeriksa isi direktori konten secara langsung untuk mencegah materi lintas mata pelajaran masuk kembali tanpa disengaja. Bila HTML, SQL, atau OOP dikembangkan pada masa depan, jadikan masing-masing mata pelajaran terpisah—jangan memperluas policy Orientasi yang hanya menerima 16 slug ini.

**Integritas dan akses.** `authorizeOrientasiAction` dan `getOrientasiServerState` wajib dipanggil oleh endpoint checkpoint, submission, dan completion. Policy memeriksa slug kanonik, enrollment aktif/tidak kedaluwarsa, modul prasyarat, dan urutan submission dari database; admin hanya memperoleh bypass enrollment/prasyarat untuk inspeksi, bukan bypass urutan tahap aksi. `getApprovedCheckpoint` menurunkan Quest ID dan reward 15 XP di server. Reader menggunakan `isCurrentModuleLocked` sebagai proteksi UX, tetapi endpoint tetap menjadi batas keamanan final. `AntiCopyPasteGuardian` memblokir paste, drop, `Ctrl/Cmd+V`, dan `Shift+Insert` pada jawaban pembelajaran. Pengecualian dibatasi oleh allowlist eksplisit identitas dan URL evidence yang benar-benar dirender, termasuk URL lowongan/screenshot evidence terstruktur.

**Atomisitas reward checkpoint.** Endpoint checkpoint dilarang memakai pola `SELECT` lalu `INSERT` untuk menentukan first claim, maupun memisahkan insert pemenang dan award XP menjadi dua statement. Constraint komposit `user_submissions_user_lesson_type_unique` menjadi arbiter klaim, sedangkan satu data-modifying CTE PostgreSQL melakukan `INSERT ... ON CONFLICT DO NOTHING`, lalu atomic upsert XP yang mengambil sumber hanya dari row hasil insert. Seluruh statement rollback bila award gagal; retry tidak terkunci oleh checkpoint tanpa XP. Regression guard berada di `tests/orientasi-checkpoint-atomicity.test.ts`. Jika migrasi constraint gagal, klaim harus fail closed.

**Trust boundary dan concurrency submission.** `getApprovedSubmission()` adalah satu-satunya katalog yang boleh menentukan pasangan slug, jenis submission, action, dan reward. Saat ini hanya 16 slug `CANONICAL_ORIENTASI_SLUGS` dengan `lkpd` (+25 XP) atau `reflection` (+15 XP) yang sah. `/api/submissions/save` wajib selalu memuat `getOrientasiServerState()` dan menjalankan `authorizeOrientasiAction()`; jangan membuat jalur umum berdasarkan prefix slug. `tokenId`, `score`, dan reward dari body request tidak dipercaya. First-create submission dan reward XP berada dalam satu CTE PostgreSQL. Bila request paralel kalah pada unique key, handler membaca record pemenang lalu melakukan guarded update; XP tetap nol dan tidak ada unique violation 500. Record lama, grade/feedback, lock KKM 73, dan remedial tetap dipertahankan. Guarded update memakai kondisi `teacher_score IS NULL OR teacher_score < 73` agar grade tuntas yang masuk bersamaan tidak tertimpa. Regression guard berada di `tests/orientasi-submission-security.test.ts`.

**Batas verifikasi concurrency.** Guard yang ada memeriksa bentuk kontrak CTE dan policy, tetapi belum mengeksekusi dua request paralel terhadap PostgreSQL nyata. Jangan menjalankan eksperimen race terhadap database production. Tindak lanjut yang aman memerlukan URL database Neon khusus pengujian dan resettable, kemudian integration test untuk dua klaim checkpoint, dua first-submit LKPD/refleksi, dan race grading terhadap satu key komposit. Setelah credential test tersedia, tambahkan test tersebut ke CI lalu catat hasilnya di changelog dan handover.

**Kontrak LKPD terstruktur.** `src/utils/orientasiLkpdSchemas.ts` menyimpan section dan field khusus Modul 02–16; jangan menggantinya dengan satu `analysisSummary`. Setiap perubahan materi wajib memperbarui skema tugas dan evidence yang sesuai. Modul 02 memerlukan 3 × (nama profesi, tanggung jawab, tools, alasan), profesi prioritas, dan dua langkah aksi. Modul 12 memerlukan dua rangkaian terpisah screenshot URL + Claim + Evidence + Reasoning untuk bukti positif dan negatif.

**Urutan verifikasi wajib.** Jalankan focused guard `node --experimental-strip-types --test tests/orientasi-checkpoint-atomicity.test.ts tests/orientasi-submission-security.test.ts`, `npm run test:orientasi`, `npm run verify:orientasi-parity`, lalu `npm run build`. Tes menguji policy, trust boundary, conflict safety, dan kontrak atomisitas; guard parity memeriksa wiring endpoint/reader, 16 Markdown, katalog Quest/LKPD, posisi tombol selesai, dan kontrak gating. Setelah seluruhnya berhasil, deploy dengan `vercel --prod --yes`.

**Checklist modul baru/perubahan modul.**

- [ ] Markdown memiliki frontmatter valid dan panduan aktivitas yang mempertahankan konteks materi.
- [ ] Quest tiga tahap spesifik modul tersedia di `MODULE_GAMIFIED_QUESTS`.
- [ ] Struktur tugas dan evidence spesifik modul tersedia di `ORIENTASI_LKPD_SCHEMAS`; tidak diringkas menjadi textarea generik.
- [ ] Prompt refleksi dan indikator KKTP menerima judul/konteks modul.
- [ ] Anti-paste diterapkan pada jawaban, dengan pengecualian identitas dan URL bukti saja.
- [ ] Gating prasyarat, urutan event checkpoint/LKPD, dan lokasi tunggal tombol selesai tetap utuh.
- [ ] Changelog, spesifikasi, dan handover diperbarui.
- [ ] `npm run test:orientasi`, `npm run verify:orientasi-parity`, lalu `npm run build` berhasil.
- [ ] Focused checkpoint atomicity guard berhasil dan index `user_submissions_user_lesson_type_unique` tersedia pada database target.
- [ ] Production dideploy dan halaman publik diperiksa.

**Status production per 2026-08-08.** Final authority fix deployment `dpl_69TnjsE2Fqc4KCv6f7ZqygUArjQe` READY di `https://agunggumelarsaputra-g2dztreej-agumelars-projects.vercel.app` dan teralias ke `https://www.agunggumelarsaputra.com`. Lima tes policy lulus, guard parity PASS, Astro build berhasil, beranda publik HTTP 200, dan POST checkpoint tanpa login ditolak HTTP 401. Verifikasi interaksi terlindungi lengkap belum dilakukan karena tidak ada sesi siswa uji yang sah; lanjutkan dengan akun siswa terdaftar untuk menguji locked-state Modul 02, checkpoint → LKPD → refleksi, tombol selesai, dan terbukanya Modul 03. Jangan membypass autentikasi untuk menggantikan uji tersebut.

**Status checkpoint atomicity per 2026-08-08.** Patch commit `dc14eaf` dideploy sebagai `dpl_7egFohXuhXB4jjVErKuogF3YBJFn` (READY) dan teralias ke domain production. Request pertama ke leaderboard publik menjalankan `ensureDbInitialized()` tanpa error runtime, beranda/leaderboard merespons HTTP 200, dan checkpoint tanpa sesi merespons HTTP 401. Vercel CLI menyajikan nilai secret database sebagai `[REDACTED]`, sehingga query katalog index dari mesin lokal tidak tersedia; keberhasilan jalur migrasi production diverifikasi melalui cold-runtime request dan ketiadaan log error bootstrap. Ketergantungan reader `SmartMarkdownWrapper.astro` telah diambil kepemilikannya pada branch interaktivitas Orientasi setelah baseline clean checkout membuktikan import tersebut sebelumnya gagal di-build. Jangan menghapus atau menjadikan file itu untracked kembali.

**Status release Orientasi per 2026-08-08.** Hambatan deploy sebelumnya telah terselesaikan melalui deployment workspace langsung. Deployment production terbaru `dpl_HmmyLAphpkcsMXvFcFsiTEVshFUE` (commit katalog `db17097`, mencakup patch security `82624de`) READY di `https://agunggumelarsaputra-bzwy6314z-agumelars-projects.vercel.app` dan teralias ke `https://www.agunggumelarsaputra.com`. Verifikasi release: suite Orientasi 10/10, parity PASS, Astro build exit 0; smoke production beranda/katalog HTTP 200, tiga materi HTML/SQL/OOP tidak muncul di katalog, dan checkpoint tanpa sesi HTTP 401. Tetap gunakan akun siswa dengan enrollment sah bila hendak menguji alur autentikasi penuh.

---

## 5. Struktur Lengkap 16 Modul Pembelajaran (Sprint 1 & Sprint 2)

Bahan sumber DOCX terletak di:
`E:\RPL\Bahan Ajar dan Administrasi\Kelas 10\Orientasi PPLG\2026-2027\Ganjil\04_Master_Modul_Ajar_OrientasiPPLG_Kelas10_Semester1_2026-2027.docx`

### SPRINT 1: Wawasan Dunia Kerja & Profesi PPLG (OR-01)
- `orientasi-pplg-01-pengantar-skill-passport.md` (Pertemuan 1: Orientasi Mapel & Sistem Skill Passport)
- `orientasi-pplg-02-profesi-peluang-karier.md` (Pertemuan 2: 8 Profesi Utama & Sinergi Tim Industri PPLG)
- `orientasi-pplg-03-ekosistem-industri-pplg.md` (Pertemuan 3: Ekosistem Industri & Jalur Kerja PPLG)
- `orientasi-pplg-04-matriks-skill-jenjang-karier.md` (Pertemuan 4: Matriks Skill, Kurikulum RPL, & Jenjang Karier)
- `orientasi-pplg-05-job-fair-kelas.md` (Pertemuan 5: Job Fair Kelas PPLG & Eksplorasi Lintas Booth)
- `orientasi-pplg-06-rencana-minat-awal.md` (Pertemuan 6: Perumusan Rencana Minat Karier Awal 3 Tahun)
- `orientasi-pplg-07-mind-map-profesi-pplg.md` (Pertemuan 7: Desain & Visualisasi Mind Map Profesi PPLG)
- `orientasi-pplg-08-finalisasi-validasi-or01.md` (Pertemuan 8: Finalisasi & Validasi Asesmen Sumatif Skill Passport OR-01)

### SPRINT 2: Analisis & Review Produk Digital (OR-02)
- `orientasi-pplg-09-app-audit-produk-digital.md` (Pertemuan 9: App Audit – Membedah Produk Digital Sehari-hari)
- `orientasi-pplg-10-ui-ux-fungsi-produk.md` (Pertemuan 10: Anatomi UI, UX, & Analisis Komparasi Produk Digital)
- `orientasi-pplg-11-framework-review-6-komponen.md` (Pertemuan 11: Framework Review Produk Digital 6 Komponen Terstruktur)
- `orientasi-pplg-12-latihan-analisis-anotasi-visual.md` (Pertemuan 12: Latihan Analisis Terpandu & Anotasi Bukti Visual Screenshot)
- `orientasi-pplg-13-review-show-peer-feedback.md` (Pertemuan 13: Review Show & Peer Feedback Kolaboratif)
- `orientasi-pplg-14-finalisasi-dokumen-review.md` (Pertemuan 14: Finalisasi & Standarisasi Dokumen Review OR-02)
- `orientasi-pplg-15-pengumpulan-validasi-or02.md` (Pertemuan 15: Pengumpulan & Validasi Portofolio Skill Passport OR-02)
- `orientasi-pplg-16-rekap-skill-clinic-refleksi.md` (Pertemuan 16: Rekapitulasi Level, Skill Clinic, & Refleksi Akhir Semester 1)

---

## 6. Prosedur Pengujian & Deployment

### Menjalankan Server Lokal:
```bash
node dev-server.mjs
# Buka http://localhost:4321 di browser
```

### Build Check & Verifikasi:
```bash
npm run verify:orientasi-parity
npm run build
```

### Deploy ke Vercel Production:
```bash
vercel --prod
```

### Variabel Lingkungan (`.env.local` & Vercel Dashboard):
```env
POSTGRES_URL="postgres://default:xxx@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="kunci-rahasia-jwt-32-karakter-atau-lebih"
GOOGLE_CLIENT_ID="google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="google-oauth-client-secret"
SITE_URL="https://agunggumelarsaputra.com"
```

### Perintah Build & Deploy:
1. Jalankan guard kesetaraan: `npm run verify:orientasi-parity`
2. Validasi TypeScript & Content Collections: `npm run build`
3. Deploy ke Vercel: `vercel --prod --yes`
