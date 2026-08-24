# AGENTS.md — AI Agent Operating Guide & Project Blueprint

> **Proyek:** `agunggumelarsaputra.com` (Personal Website & RPL Learning Hub)  
> **Pemilik / Pengajar:** Agung Gumelar Saputra, S.Tr.T. (Guru Pengampu RPL SMKN 1 Rongga & Software Engineer)  
> **Target Deployment:** Vercel Serverless SSR (`https://agunggumelarsaputra.com`)  
> **Dokumentasi Lengkap:** Lihat [`docs/ARCHITECTURE_AND_HANDOVER.md`](./docs/ARCHITECTURE_AND_HANDOVER.md)

---

## 1. Core Directives & Brand Philosophy

1. **Gelar & Struktur Kurikulum Vokasi SMK:**
   - **Gelar:** `S.Tr.T.` (Sarjana Terapan Teknik). Pastikan tidak mengubah gelar atau profil tanpa instruksi eksplisit.
   - **Program Keahlian:** **Pengembangan Perangkat Lunak dan Gim (PPLG)**
   - **Konsentrasi Keahlian:** **Rekayasa Perangkat Lunak (RPL)**
   - **Peran Pemilik / Pengajar:** **Guru Pengampu RPL / Guru Produktif RPL** & Fullstack Software Engineer.
   - **ATURAN MUTLAK NOMENKLATUR:**
     - Ketika menyebut **Program Keahlian** -> Gunakan **Pengembangan Perangkat Lunak dan Gim (PPLG)** atau **PPLG**.
     - Ketika menyebut **Konsentrasi Keahlian / Rekayasa Perangkat Lunak** -> Singkatan resmi adalah **RPL** (BUKAN PPLG).
     - Penyebutan guru pengampu harus selalu **Guru Pengampu RPL** atau **Guru Produktif RPL**.
2. **Filosofi Desain (Anti AI-Slop & High-Craft):**
   - **TIDAK ADA AI SLOP:** Dilarang menggunakan gradien neon ungu-cyan acak, aura blur berlebih di background, teks bergradien menyilaukan, atau glassmorphism kabur yang menurunkan keterbacaan (*readability*).
   - **Desain Bersih & Solid:** Gunakan palet warna solid bernilai kontras tinggi (Dark slate `#090d16`, `#111827`, border halus `rgba(255,255,255,0.08)`, teks terang `#f3f4f6`).
   - **Artisanal & Human Feel:** Tipografi bersih (*Inter*, *Outfit*, *JetBrains Mono*), komponen fungsional dengan micro-interaction yang halus dan bermakna.
3. **Alur Kerja Interaksi & Brainstorming (ATURAN MUTLAK):**
   - Sebelum pengguna secara eksplisit mengatakan **"proses"** atau memberikan perintah eksekusi, seluruh interaksi berstatus **BRAINSTORMING** (eksplorasi ide, diskusi arsitektur, konseptualisasi fitur, tanya-jawab kebutuhan, dan perumusan rencana kerja).
   - Dilarang keras melakukan modifikasi kode/file secara sepihak sebelum ada instruksi *"proses"* dari pengguna.
4. **Aturan Deployment & Sinkronisasi Git (GitHub + Vercel):**
   - Setiap kali melakukan deployment:
     1. Jalankan `git add .` dan `git commit` dengan pesan commit yang jelas dan deskriptif.
     2. Lakukan `git push` ke repositori remote **GitHub**.
     3. Jalankan verifikasi build (`npm run build`).
     4. Jalankan deploy ke **Vercel Production** (`npx vercel --prod --yes` atau `vercel --prod`).
   - Berikan tautan production langsung (`https://agunggumelarsaputra.com`) untuk peninjauan hasil kerja.

---

## 2. Tech Stack & Environment

| Layer | Teknologi | Detail / Catatan |
|---|---|---|
| **Framework** | Astro v5 / v7 Server Mode (`output: 'server'`) | `@astrojs/vercel` serverless adapter |
| **Styling** | TailwindCSS v3.4 + `@tailwindcss/typography` | Vanilla CSS tokens & utility classes |
| **Database** | Neon Serverless PostgreSQL | `@neondatabase/serverless` + Drizzle ORM |
| **Auth** | JWT Session Cookie (`ags_session`) + BCrypt | `src/middleware.ts` & Arctic OAuth |
| **Content** | Astro Content Collections (Markdown/MDX) | `src/content/pembelajaran/*.md` |
| **Deployment** | Vercel CLI (`vercel --prod`) | Multi-environment / Production Edge |

---

## 3. Struktur Direktori Utama

```text
├── dev-server.mjs             # Script dev server lokal programatik (PORT 4321)
├── astro.config.mjs           # Konfigurasi Astro + Vercel Serverless
├── drizzle.config.ts          # Konfigurasi Drizzle ORM
├── docs/                      # Dokumentasi & Panduan Agent Handover
│   ├── ARCHITECTURE_AND_HANDOVER.md # Panduan Arsitektur & Operasional Lengkap
│   └── CHANGELOG.md           # Log perubahan riwayat fitur
├── src/
│   ├── content/
│   │   ├── pembelajaran/      # Modul materi kurikulum Orientasi PPLG (.md)
│   │   └── config.ts          # Skema koleksi konten pembelajaran & blog
│   ├── db/
│   │   ├── index.ts           # Koneksi database Neon Postgres via Drizzle
│   │   └── schema.ts          # Definisi tabel (users, tokens, progress, tka)
│   ├── layouts/               # BaseLayout, DashboardLayout, ModulLayout
│   ├── middleware.ts          # Proteksi route (/dashboard, /admin) via JWT cookie
│   ├── pages/
│   │   ├── index.astro        # Homepage (Profil, Hero, Showcase)
│   │   ├── login.astro        # Form login siswa/admin
│   │   ├── register.astro     # Form registrasi siswa
│   │   ├── dashboard/         # Dashboard belajar siswa & statistik XP
│   │   ├── admin/             # Panel admin & generator enrollment tokens
│   │   ├── pembelajaran/
│   │   │   ├── index.astro    # Hub Katalog Modul (1 Card Utama Orientasi PPLG)
│   │   │   ├── orientasi-pplg.astro # Silabus Terpusat & Pintu Masuk Token
│   │   │   ├── [slug].astro   # Reader Modul Pembelajaran
│   │   │   └── tka-pplg.astro # Simulator Ujian TKA PPLG
│   │   └── api/
│   │       ├── auth/          # Endpoint login, register, logout, google OAuth
│   │       ├── admin/         # CRUD Token & Analytics (Admin Only)
│   │       ├── enroll.ts      # Validasi & klaim token enrollment
│   │       ├── progress/      # Mark lesson complete & XP increment
│   │       └── tka/           # Submit skor TKA & update progress
└── .env.local                 # Variabel lingkungan database & secret keys
```

---

## 4. Database Schema Reference (`src/db/schema.ts`)

1. **`users`**: Akun siswa & admin (`role: 'student' | 'admin'`, `studentClass`, `passwordHash`, `googleId`).
2. **`userGamification`**: XP, Level (1-5), Daily Streak, Last Active.
3. **`enrollmentTokens`**: Token akses kelas (`token`, `targetType: 'orientasi-pplg' | 'tka' | 'module' | 'all'`, `targetClass`, `isActive`, `expiresAt`).
4. **`userEnrollments`**: Tabel asosiasi antara siswa (`userId`) dan token yang diklaim (`tokenId`).
5. **`userProgress`**: Status penyelesaian modul siswa per lesson slug.
6. **`tkaAttempts`**: Riwayat tryout TKA PPLG, skor, total pertanyaan, dan XP diperoleh.

---

## 5. Alur Kerja Modul Pembelajaran, Gating Sekuensial, & Token Enrollment

```text
[Siswa Membuka /pembelajaran]
        │
        ▼
[Card Utama: Orientasi PPLG] ──► Klik "Buka Modul & Silabus"
        │
        ▼
[/pembelajaran/orientasi-pplg]
   ├── Jika Belum Terdaftar (Unenrolled):
   │     └── Muncul Modal/Input Token: "Masukkan Token Akses dari Guru"
   │     └── Siswa memasukkan Token (misal: "OPPLG-XRPL1") ──► POST /api/enroll
   │     └── Token tervalidasi ──► Akses Modul Terbuka (Mengikuti Alur Sekuensial)
   │
   └── Jika Sudah Terdaftar (Enrolled):
         └── Tampil Bilah Progres Mata Pelajaran (Jumlah & % Modul Selesai)
         └── Kartu Modul memiliki 3 status visual:
               ├── 🔒 TERKUNCI: Modul N+1 jika Modul N belum diselesaikan siswa
               ├── 🚀 AKTIF: Modul berjalan yang siap dipelajari
               └── ✅ SELESAI: Modul yang telah tuntas ditandai selesai
```

### 5.1 Ketentuan Baku Alur Modul Pembelajaran (`[...slug].astro`):
1. **Gating Sekuensial Antar-Modul (Mutlak):**
   - **Modul 1** selalu terbuka sebagai fondasi awal.
   - **Modul $N+1$** terkunci hingga siswa menyelesaikan **Modul $N$** (tercatat di tabel `userProgress`).
   - Akun Guru / Admin (`role: 'admin'`) memiliki hak akses *bypass* untuk memeriksa seluruh modul kapan saja.
   - Jika siswa membuka URL modul terkunci secara langsung, sistem wajib menampilkan **Layar Proteksi (*Locked Card Screen*)** dengan tombol navigasi kembali ke modul prasyarat.

2. **Aturan 4 Tab Pembelajaran di Setiap Modul:**
   - **Tab 1: 📖 Materi & Visual:**
     - Berisi materi konseptual, diagram interaktif, dan panduan visual.
     - Di bagian bawah materi terdapat **Mini-Game / Kuis Checkpoint 3-Stage Quest** (sistem 3 nyawa, auto-reset total saat Game Over).
     - Menuntaskan kuis checkpoint membuka akses ke Tab 2.
   - **Tab 2: 📝 Form LKPD Interaktif (+25 XP):**
     - Form pengisian lembar kerja mandiri/kelompok.
     - Menyimpan form LKPD (POST `/api/submissions/save`) membuka akses ke Tab 3.
   - **Tab 3: 💭 Jurnal Refleksi (+15 XP) [TAB TERAKHIR UTAMA]:**
     - Form refleksi metakognitif siswa atas pembelajaran.
     - **ATURAN POSISI TOMBOL SELESAI:** Tombol **"Tandai Selesai & Buka Modul Selanjutnya"** (`#btn-complete-lesson`) **HANYA ADA DI TAB INI (Tab 3)** dan DILARANG diletakkan di tab sebelumnya.
     - Setelah diklik, sistem memicu POST `/api/progress/complete`, memperbarui live score/XP, dan menampilkan tombol aktif **"Lanjut ke Modul Selanjutnya ➔"**.
   - **Tab 4: 🎯 Panduan Kriteria Guru (KKTP):**
     - Rubrik penilaian ketercapaian kompetensi Level 0 (Belum), Level 1 (Mengingat), Level 2 (Mencoba), Level 3 (Mahir), hingga Level 4 (Kreatif).

3. **Bilah Progres Mata Pelajaran:**
   - Setiap modul menampilkan progress bar horizontal di header yang menghitung total modul selesai dibagi 16 modul Orientasi PPLG secara *real-time*.

4. **Integritas Pengerjaan & Proteksi Anti Copy-Paste (Mutlak):**
   - Seluruh isian jawaban LKPD, kuis deskriptif, dan jurnal refleksi siswa **DILARANG COPY-PASTE** dan **WAJIB DIKETIK MANDIRI**.
   - Sistem dilengkapi proteksi otomatis (`AntiCopyPasteGuardian.astro`) yang memblokir `paste`, `drop`, dan kombinasi tombol `Ctrl+V`/`Cmd+V`/`Shift+Insert` pada textarea dan input isian pembelajaran serta memberikan notifikasi toast peringatan.
   - **PENGECUALIAN:** Bagian **Identitas Siswa** (`studentName`, `studentNis`, `studentClass`, `submissionDate`) dan **URL Bukti Google Drive / Repository** (`driveUrl`, `evidenceDriveUrl`) tetap **DIPERBOLEHKAN COPY-PASTE**.

### 5.2 Alur Penilaian & Evaluasi LKPD oleh Guru (KKTP & Status Workflow)
1. **Status Transition**: `submitted` ➔ `graded` (Nilai disimpan ke `teacher_score`, `teacher_level`, `teacher_feedback`, `graded_at`).
2. **KKM Threshold (73)**:
   - **Skor ≥ 73 (Tuntas)**: Terkunci permanen dari resubmission siswa (`HTTP 403 Forbidden`).
   - **Skor < 73 (Remedial)**: Akses tetap terbuka. Jika siswa mengirimkan perbaikan, status otomatis kembali dari `graded` ke `submitted`.
3. **Skala Rubrik KKTP**:
   - `Level 0 (Belum Berkembang)`: Teks acak/kosong, drive url rusak/terkunci (< 73, Remedial)
   - `Level 1 (Mulai Berkembang)`: Data contoh default / peniruan tanpa analisis mandiri (< 73, Remedial)
   - `Level 2 (Mencoba ★)`: Tuntas KKM minimal (≥ 73)
   - `Level 3 (Mandiri ★★)`: Analisis mendalam & orisinal (≥ 85)
   - `Level 4 (Mahir & Mandiri ★★★)`: Standar industri & sangat komprehensif (≥ 95)


---

## 6. Lokasi Sumber Materi Pembelajaran (DOCX to MD)

Sumber rencana pembelajaran asli berada di lokal pemilik:
- **Direktori:** `E:\RPL\Bahan Ajar dan Administrasi\Kelas 10\Orientasi PPLG\2026-2027\Ganjil`
- **File Master:** `04_Master_Modul_Ajar_OrientasiPPLG_Kelas10_Semester1_2026-2027.docx`
- **Status Konversi:**
  - `01` - `08` (Sprint 1 / OR-01): **SELESAI** (`orientasi-pplg-01-...md` s/d `orientasi-pplg-08-...md`)
  - `09` - `16` (Sprint 2 / OR-02): **SELESAI** (`orientasi-pplg-09-...md` s/d `orientasi-pplg-16-...md`)

---

## 7. Command Cheat Sheet untuk AI Agent

```bash
# 1. Menjalankan Dev Server Lokal (Gunakan ini, jangan astro dev)
node dev-server.mjs

# 2. Build Check (Memastikan tidak ada error TypeScript/Astro)
npm run build

# 3. Deploy ke Vercel Production
vercel --prod
```

> ⚠️ **Catatan Penting untuk Agent Berikutnya:** Setiap kali menambahkan modul atau memodifikasi logika backend, selalu perbarui file [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) dan verifikasi build dengan `npm run build` sebelum mendeploy.
