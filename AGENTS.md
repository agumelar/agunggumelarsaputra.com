# AGENTS.md — AI Agent Operating Guide & Project Blueprint

> **Proyek:** `agunggumelarsaputra.com` (Personal Website & PPLG Learning Hub)  
> **Pemilik / Pengajar:** Agung Gumelar Saputra, S.Tr.T. (Guru RPL / PPLG SMKN 1 Rongga & Software Engineer)  
> **Target Deployment:** Vercel Serverless SSR (`https://agunggumelarsaputra.com`)  
> **Dokumentasi Lengkap:** Lihat [`docs/ARCHITECTURE_AND_HANDOVER.md`](./docs/ARCHITECTURE_AND_HANDOVER.md)

---

## 1. Core Directives & Brand Philosophy

1. **Gelar & Identitas Pemilik:**
   - **Gelar:** `S.Tr.T.` (Sarjana Terapan Teknik). Pastikan tidak mengubah gelar atau profil tanpa instruksi eksplisit.
   - **Peran:** Guru Produktif Rekayasa Perangkat Lunak (PPLG) & Fullstack Software Engineer.
2. **Filosofi Desain (Anti AI-Slop & High-Craft):**
   - **TIDAK ADA AI SLOP:** Dilarang menggunakan gradien neon ungu-cyan acak, aura blur berlebih di background, teks bergradien menyilaukan, atau glassmorphism kabur yang menurunkan keterbacaan (*readability*).
   - **Desain Bersih & Solid:** Gunakan palet warna solid bernilai kontras tinggi (Dark slate `#090d16`, `#111827`, border halus `rgba(255,255,255,0.08)`, teks terang `#f3f4f6`).
   - **Artisanal & Human Feel:** Tipografi bersih (*Inter*, *Outfit*, *JetBrains Mono*), komponen fungsional dengan micro-interaction yang halus dan bermakna.
3. **Aturan Deployment & Pengujian:**
   - **Langsung Deploy ke Production:** Tidak perlu menginstruksikan atau menunggu pengujian di localhost. Langsung jalankan build verification (`npm run build`) lalu deploy langsung ke production menggunakan `npx vercel --prod --yes` (atau `vercel --prod`).
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

## 5. Alur Kerja Modul Pembelajaran & Token Enrollment

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
   │     └── Token tervalidasi ──► Akses 16 Modul Terbuka
   │
   └── Jika Sudah Terdaftar (Enrolled):
         └── Seluruh modul (Modul 1 s/d 16) dapat diakses
         └── Progress baca & LKPD tersimpan ke database via POST /api/progress/complete
```

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
