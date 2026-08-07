# Dokumentasi Arsitektur & Panduan Handover Proyek

> **Proyek:** `agunggumelarsaputra.com`  
> **Pemilik:** Agung Gumelar Saputra, S.Tr.T.  
> **Versi:** 2.1 (Fullstack Learning Hub & Vercel SSR)  
> **Terakhir Diperbarui:** 2026-08-07  

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
| `POST` | `/api/submissions/save` | Siswa | Simpan/update jawaban form LKPD & Refleksi siswa (+ XP) |
| `GET` | `/api/submissions/get` | Terautentikasi | Ambil riwayat & status penilaian LKPD siswa |
| `POST` | `/api/admin/submissions/grade` | Admin | Simpan skor angka, level KKTP, & feedback guru |
| `POST` | `/api/tka/submit` | Siswa | Kirim skor tryout TKA & simpan attempt |
| `GET` | `/api/leaderboard` | Publik | Mengambil data peringkat XP teratas |
| `POST` | `/api/admin/tokens/create` | Admin | Membuat token enrollment baru |
| `GET` | `/api/admin/tokens/list` | Admin | Melihat daftar semua token aktif/kedaluwarsa |
| `DELETE` | `/api/admin/tokens/[id]` | Admin | Menonaktifkan / menghapus token |

---

## 4. Standar Penulisan Konten Modul Pembelajaran (Content Collections)

Semua modul pembelajaran diletakkan di `src/content/pembelajaran/*.md`.

### Format Frontmatter Standar:
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

### Struktur Konten Modul Wajib:
1. **Target Capaian Pembelajaran (CP / TP)**
2. **Uraian Materi Konseptual & Praktis** (Gunakan ilustrasi, tabel, diagram, atau tips)
3. **Tips & Arahan Guru (Pak Agung)**: Disajikan dalam format quote/alert box elegan.
4. **Lembar Kerja Peserta Didik (LKPD)**: Pertanyaan evaluasi atau tugas mandiri/kelompok.
5. **Tombol "Tandai Selesai"**: Terhubung ke endpoint `/api/progress/complete` untuk pemberian XP.

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
1. Pastikan server lokal berjalan lancar: `node dev-server.mjs`
2. Validasi TypeScript & Content Collections: `npm run build`
3. Deploy ke Vercel: `vercel --prod`
