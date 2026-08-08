# Changelog

Semua perubahan penting pada proyek **agunggumelarsaputra.com** akan dicatat dalam dokumen ini.
Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased] - Sesi Mendatang
- Opsi Hapus Akun siswa melalui panel Admin (`/admin/users`).
- Generator PDF Otomatis untuk Rekap Portofolio Skill Passport Siswa.

### 2026-08-08 — Rilis Materi Interaktif Formatif Orientasi PPLG 02–16
- Menambahkan katalog server-side `src/utils/orientasiInteractiveMaterials.ts` untuk 15 slug kanonik Modul 02–16, masing-masing dengan tepat dua aktivitas kontekstual; reader memasangnya melalui `InteractiveModuleMaterial.astro` sementara Markdown tetap menjadi bacaan rujukan dan Modul 01 tidak berubah.
- Renderer menggunakan tombol native, state aksesibel, `data-*`, dan script Astro scoped tanpa dependency client atau data eksternal. Batas formatif bersifat ketat: aktivitas tidak menyimpan data, tidak memanggil API, tidak memakai storage browser, tidak memberi XP, dan tidak mengubah gating atau membuka LKPD; hanya Quest checkpoint yang tetap menjadi gerbang progres/reward.
- Aktivitas `sequence` kini benar-benar dapat diurutkan ulang; detail instruksional setiap butir selalu terlihat, sedangkan umpan balik diberikan secara lokal saat siswa berinteraksi (untuk checklist melalui live region). Perilaku DOM lokal dipisahkan ke `src/utils/interactiveModuleMaterialBehavior.ts` agar renderer dapat diuji tanpa mengubah batas formatifnya.
- `SmartMarkdownWrapper.astro` adalah dependency reader yang tracked. Clean checkout wajib dapat menjalankan build tanpa menyalin file dari workspace lokal secara manual.
- Regression test executable berbasis Happy DOM memverifikasi reorder, validasi, serta state pilihan aksesibel pada sequence. `npm run test:orientasi` kini lulus 14/14; `npm run verify:orientasi-parity` PASS, dan `npm run build` menyelesaikan Astro server build (exit 0).
- `happy-dom` 20.11.2 dipakai hanya sebagai `devDependency` harness test dan sudah dipatch. `npm audit --omit=dev` melaporkan 0 critical, namun **bukan** audit global bersih: chain high yang tidak terkait masih ada melalui `@astrojs/vercel` → `@vercel/routing-utils` → `path-to-regexp` serta dependency `sharp`. Jadikan pembaruan dependency tersebut tindak lanjut pemeliharaan terpisah; tidak ada resolusi yang diklaim di rilis ini.
- Deployment `dpl_CMVnY7i2RtM2SWyz299bzXssAkT2` memang READY, tetapi hanya pada proyek standalone `orientasi-interactive-materials` di `https://orientasi-interactive-materials-5i6fvi902-agumelars-projects.vercel.app` dengan alias `https://orientasi-interactive-materials.vercel.app`; ini **bukan** deployment atau alias production kanonik `agunggumelarsaputra.com`.
- Koreksi smoke: request tanpa sesi ke `/pembelajaran` mengikuti redirect ke login; status akhirnya tidak membuktikan isi katalog. Karena itu tidak ada klaim valid bahwa katalog terproteksi bebas nama HTML/SQL/OOP dari pemeriksaan guest ini. `POST /api/gamification/claim-checkpoint` tanpa sesi tetap HTTP 401.
- Upaya deploy ulang ke proyek kanonik menciptakan `dpl_A8KAA1B3dC9oZb4XPcrEvUUnDW2Z` (`https://agunggumelarsaputra-qdw4qvsy3-agumelars-projects.vercel.app`), namun CLI timeout dan `vercel inspect` melaporkan status `UNKNOWN`, bukan READY. Alias yang tercatat hanya hostname otomatis Vercel, bukan `www.agunggumelarsaputra.com`; jangan menyebutnya rilis kanonik. Domain kanonik saat ini merespons `/` HTTP 200, sedangkan `/pembelajaran` tanpa sesi HTTP 302 ke login.
- Batas verifikasi: interaksi lengkap dan inspeksi katalog terproteksi tetap memerlukan akun siswa yang legitimate dan sudah enrollment. Tidak ada akun palsu atau bypass autentikasi yang digunakan pada rilis ini.

### 2026-08-08 — Penetapan Katalog Orientasi PPLG Saja
- Menghapus tiga materi bawaan di luar ruang lingkup Orientasi PPLG: `pengenalan-html5-smk`, `dasar-basis-data-sql`, dan `konsep-oop-javascript`.
- Menghapus konfigurasi Quest dan panduan LKPD ketiganya, sehingga katalog konten publik, konfigurasi pembelajaran, navigasi, progress, validasi API, serta dokumentasi kini konsisten hanya pada 16 modul kanonik Orientasi PPLG.
- Menambahkan regression test filesystem yang mewajibkan `src/content/pembelajaran/` memuat tepat 16 Markdown Orientasi PPLG. Materi HTML, SQL, dan OOP dapat ditambahkan kembali kelak sebagai mata pelajaran terpisah dengan kontrak, enrollment, dan policy server tersendiri—bukan sebagai bagian dari Orientasi PPLG.
- Verifikasi release: `npm run test:orientasi` lulus 10/10, parity guard PASS, dan `npm run build` berhasil. Deployment `dpl_HmmyLAphpkcsMXvFcFsiTEVshFUE` READY di `https://agunggumelarsaputra-bzwy6314z-agumelars-projects.vercel.app` dan teralias ke `https://www.agunggumelarsaputra.com`; smoke beranda/katalog HTTP 200 serta checkpoint tanpa sesi HTTP 401.

### 2026-08-08 — Submission Trust Boundary & Exactly-Once Reward Fix
- Memperkuat `/api/gamification/claim-checkpoint`: insert checkpoint dan atomic upsert XP kini dijalankan sebagai satu statement PostgreSQL berbasis data-modifying CTE. Error pada award XP akan me-rollback insert checkpoint, sehingga retry tetap dapat menerima reward tepat satu kali.
- Menambahkan `getApprovedSubmission()` sebagai katalog server untuk submission. Endpoint `/api/submissions/save` sekarang hanya menerima 16 slug Orientasi PPLG kanonik dengan jenis `lkpd` (+25 XP) atau `reflection` (+15 XP); slug/jenis arbitrer, `tokenId`, `score`, dan fallback reward dari klien tidak lagi dipercaya.
- Submission pertama dan reward XP juga digabung dalam satu statement CTE conflict-safe. Request paralel yang kalah pada unique key beralih ke jalur update idempoten, bukan unique violation HTTP 500, dan tidak memperoleh XP duplikat.
- Mempertahankan satu record submission per siswa/modul/jenis, isian LKPD/refleksi lama, nilai/feedback guru, penguncian KKM 73, serta alur remedial. Update remedial memakai kondisi database agar penilaian tuntas yang terjadi bersamaan tidak tertimpa.
- Menambahkan regression guard `tests/orientasi-submission-security.test.ts` dan memperkuat `tests/orientasi-checkpoint-atomicity.test.ts`. Siklus TDD dibuktikan RED 0/4 lalu GREEN 4/4; verifikasi pada clone rilis terisolasi lulus `npm run test:orientasi` 9/9, parity guard PASS, dan Astro build exit 0.
- Deployment production belum berubah: dua invocation `vercel --prod --yes` berhenti karena timeout lokal setelah 124 dan 304 detik sebelum job baru tercatat. `vercel ls` tetap menampilkan deployment sebelumnya `agunggumelarsaputra-cgcllt7b2-agumelars-projects.vercel.app` sebagai latest READY. Smoke baseline pada production lama: tiga halaman publik HTTP 200 serta POST checkpoint/submission tanpa sesi HTTP 401. Patch wajib dideploy ulang dari clone bersih setelah hambatan CLI selesai.

### 2026-08-08 — Orientasi PPLG Module Parity Release
- Kontrak pengalaman Modul 01 diterapkan pada seluruh Modul Orientasi PPLG 02–16: checkpoint Quest tiga tahap per modul, LKPD, jurnal refleksi, dan panduan KKTP kini menerima konteks materi masing-masing tanpa mengganti substansi Markdown.
- Reader bersama mempertahankan gating sekuensial antar-modul, urutan checkpoint → LKPD → refleksi → penyelesaian di `#btn-complete-lesson`, indikator progres 16 pertemuan, serta bypass untuk admin.
- `AntiCopyPasteGuardian` tetap memblokir paste, drop, `Ctrl/Cmd+V`, dan `Shift+Insert` pada jawaban belajar; identitas siswa dan URL bukti tetap diizinkan untuk ditempel.
- Verifikasi deterministik berhasil: `npm run verify:orientasi-parity` menghasilkan `Orientasi PPLG parity guard: PASS`, lalu `npm run build` menyelesaikan Astro server build (exit code 0).
- Production dideploy pada `https://agunggumelarsaputra-1l124rpo0-agumelars-projects.vercel.app` dan dialiaskan ke `https://www.agunggumelarsaputra.com`; pemeriksaan halaman publik tidak menemukan regresi.
- Batas verifikasi: alur terlindungi Modul 02 (locked state, checkpoint → LKPD → refleksi, tombol selesai, dan unlock Modul 03) belum diuji di production karena tidak tersedia sesi siswa uji yang sah. Uji tersebut harus dilakukan dengan akun siswa dan enrollment yang legitimate.

### 2026-08-08 — Checkpoint Reward Atomicity Security Fix
- Menutup race condition klaim checkpoint pertama: `user_submissions` kini memiliki unique key komposit `(user_id, lesson_slug, submission_type)`, dan `/api/gamification/claim-checkpoint` memakai `INSERT ... ON CONFLICT DO NOTHING RETURNING` sebagai satu-satunya arbiter reward pertama.
- XP hanya diberikan ketika insert checkpoint benar-benar menghasilkan baris baru. Mutasi `user_gamification` diubah menjadi atomic upsert/increment agar klaim sah pada checkpoint berbeda tidak mengalami lost update.
- Bootstrap skema production melakukan migrasi idempoten di bawah advisory lock dan table lock. Bila ada baris duplikat lama, satu baris hasil penilaian guru/versi terbaru dipertahankan sebelum unique index dibuat; koreksi XP historis tidak ditebak karena tabel submission tidak menyediakan ledger reward yang cukup untuk rekonsiliasi kausal.
- Menambahkan regression test `tests/orientasi-checkpoint-atomicity.test.ts`; siklus TDD diverifikasi RED pada skema lama lalu GREEN setelah patch.
- Verifikasi final lulus: focused guard 1/1, `npm run test:orientasi` 6/6, parity guard PASS, dan Astro server build exit 0. Deployment `dpl_7egFohXuhXB4jjVErKuogF3YBJFn` READY di `https://agunggumelarsaputra-cgcllt7b2-agumelars-projects.vercel.app` serta teralias ke `https://www.agunggumelarsaputra.com`; beranda dan leaderboard publik HTTP 200, checkpoint tanpa sesi HTTP 401, dan runtime logs tidak memuat error bootstrap skema.
- Catatan repository: ketergantungan reader `SmartMarkdownWrapper.astro` yang sebelumnya hanya ada secara lokal kini diambil kepemilikannya pada branch interaktivitas Orientasi. Clean checkout kembali dapat membangun reader tanpa menyalin file workspace secara manual.

### 2026-08-08 — Orientasi PPLG Server Authority & Structured LKPD Fix
- Memindahkan otorisasi checkpoint → LKPD → refleksi → completion ke policy server bersama. Ketiga endpoint mutasi kini memeriksa login, enrollment aktif, modul prasyarat, submission tahap sebelumnya, dan slug kanonik terhadap state database; `localStorage` hanya menjadi cache tampilan.
- `/api/gamification/claim-checkpoint` tidak lagi menerima `xpReward`, `quizId`, atau `tokenId` sebagai sumber kebenaran. Slug, ID Quest, token enrollment, dan reward 15 XP diturunkan dari katalog server; guest, database offline, dan slug arbitrer ditolak.
- Sidebar, denominator progres, prasyarat, serta tautan modul sebelumnya/berikutnya di reader dibatasi tepat pada 16 slug Orientasi PPLG kanonik.
- Mengganti satu textarea generik dengan skema LKPD terstruktur per Modul 02–16. Modul 02 kembali memiliki tiga profil profesi lengkap serta prioritas/dua langkah aksi; Modul 12 kembali memiliki latihan CER positif dan negatif dengan screenshot evidence terpisah.
- Menambahkan lima tes perilaku `npm run test:orientasi` serta memperkuat `npm run verify:orientasi-parity` untuk kontrak authority server, katalog kanonik, reward checkpoint, dan struktur LKPD.
- Verifikasi final lulus (5/5 tes, parity guard PASS, Astro server build exit 0) dan deployment production `dpl_69TnjsE2Fqc4KCv6f7ZqygUArjQe` READY di `https://agunggumelarsaputra-g2dztreej-agumelars-projects.vercel.app`, teralias ke `https://www.agunggumelarsaputra.com`. Smoke test publik mendapat HTTP 200 dan endpoint checkpoint tanpa login mendapat HTTP 401.
- Batas verifikasi tetap: interaksi lengkap dengan akun siswa/enrollment sah belum tersedia pada sesi ini.

## [2.6.6] - 2026-08-08
### Added & Enhanced
- **Sistem Proteksi Integritas Belajar Anti Copy-Paste (`AntiCopyPasteGuardian.astro`):**
  - **Penonaktifan Paste pada Isian Belajar:** Menonaktifkan fungsi *paste*, *drag-and-drop text*, dan shortcut keyboard (`Ctrl+V`, `Cmd+V`, `Shift+Insert`) pada seluruh `textarea` dan `input` jawaban tugas LKPD, kuis deskriptif, dan jurnal refleksi.
  - **Animasi & Umpan Balik Visual (*Shake Animation & Toast Warning*):** Menampilkan animasi getar (*shake warning*) pada kolom input yang dicegat beserta notifikasi *toast floating* yang elegan dan informatif: *"Wajib Diketik Mandiri (No Paste) — Untuk mengasah pemahaman konsep dan integritas belajar, isian ini wajib diketik sendiri."*
  - **Pengecualian Cerdas Kolom Identitas Siswa & URL Bukti:** Mempertahankan kebebasan *copy-paste* khusus pada kolom data identitas siswa (`Nama Lengkap`, `NIS / NISN`, `Kelas`, `Tanggal Pengerjaan`) serta kolom `URL Link Google Drive Portofolio / Repository`.
  - **Anotasi & Badge Visual:** Menambahkan penanda visual *"📋 Copy-Paste Diperbolehkan"* pada Bagian Identitas dan *"✍️ Wajib Diketik Mandiri (No Copy-Paste)"* pada Bagian LKPD dan Refleksi.

## [2.6.5] - 2026-08-08
### Added & Enhanced
- **Sistem Pembelajaran Sekuensial & Gating Modul Otomatis (*Sequential Module Progression*):**
  - **Penataan Tombol Tuntas Modul:** Menghapus tombol selesai dari tab awal dan meletakkannya secara eksklusif pada tab terakhir (**Tab 3: Jurnal Refleksi**), sehingga siswa harus melewati alur materi & kuis checkpoint, form LKPD, lalu mengisi jurnal refleksi sebelum menuntaskan modul.
  - **Gating Modul Antar-Pertemuan:** Modul berikutnya (Modul N+1) baru dapat dibuka dan diakses setelah modul sebelumnya (Modul N) selesai dituntaskan oleh siswa (Modul 1 selalu terbuka sebagai fondasi, dan akun Guru/Admin memiliki akses bypass penuh).
  - **Layar Proteksi & Gating Screen Interaktif:** Jika siswa mencoba membuka modul terkunci langsung melalui URL, halaman menampilkan status proteksi visual yang jelas beserta tombol navigasi instan kembali ke modul prasyarat yang belum selesai.
  - **Indikator Status & Progress Bar Mata Pelajaran:**
    - Di dalam modul (`[...slug].astro`): Tampilan *Progress Bar Mapel Orientasi PPLG* di bagian atas yang menghitung persentase dan jumlah modul yang telah diselesaikan secara dinamis.
    - Di katalog silabus (`orientasi-pplg.astro`): Tampilan kartu modul dengan 3 status visual (Modul Terkunci dengan border putus-putus 🔒, Modul Aktif berjalan dengan border aksen 🚀, dan Modul Selesai dengan badge centang hijau ✅).
    - Tombol *Lanjut ke Modul Berikutnya* otomatis aktif dan mengarahkan siswa ke pertemuan selanjutnya begitu modul dituntaskan.

## [2.6.4] - 2026-08-08
### Fixed & Standardized
- **Standardisasi Mutlak Nomenklatur Jurusan & Guru Pengampu (RPL):**
  - Menyelaraskan seluruh sebutan Rekayasa Perangkat Lunak menjadi singkatan resmi **RPL** (bukan PPLG).
  - Menetapkan peran & identitas pengajar sebagai **Guru Pengampu RPL / Guru Produktif RPL** pada seluruh dokumen sistem:
    - Aturan operasional agen (`AGENTS.md`).
    - Generator ekspor Excel guru (`src/utils/excelExport.ts`): Kop dokumen, tabel metadata, dan blok tanda tangan pengesahan guru pengampu.
    - Panel Admin Console (`src/pages/admin/index.astro`).
    - Komponen modul & visual pembelajaran (`InteractiveMaterialP1.astro`, `orientasi-pplg.astro`, `index.astro`, `cv.astro`, `Footer.astro`).
    - Koleksi materi pembelajaran markdown (`src/content/pembelajaran/`).
### Enhanced
- **Standardisasi Ekspor Dokumen Rekap Excel Guru Profesional (`src/utils/excelExport.ts`):**
  - Menyempurnakan ketiga format generator ekspor Excel (`Rekap Nilai Sesi / Token`, `Rekap Penilaian LKPD`, dan `Rekap Jurnal Refleksi`):
    - **Kop Surat Institusi Resmi:** Pemerintah Daerah Provinsi Jawa Barat, Dinas Pendidikan Cabang Dinas Wilayah VII, SMK Negeri 1 Rongga - Konsentrasi Keahlian Rekayasa Perangkat Lunak.
    - **Blok Pengesahan & Tanda Tangan Guru:** Kolom tanda tangan resmi lengkap dengan titimangsa (Bandung Barat), nama guru pengampu (*Agung Gumelar Saputra, S.Tr.T.*), dan jabatan fungsional.
    - **Tingkat Keterbacaan Tinggi (*High-Craft Layout*):** Penataan lebar kolom proporsional (*auto-fit*), *Zebra striping*, pemisahan *Executive Summary* statistik kelas, *freeze pane* pada header tabel, dan pewarnaan status kelulusan (KKM 73 Kompeten / Remedial) yang nyaman dibaca dan siap cetak (*Print-Ready*).

## [2.6.2] - 2026-08-08
### Fixed
- **Pembersihan & Reset Total State Gamifikasi Mini-Game Checkpoint (`InteractiveKnowledgeCheck.astro`):**
  - Memperbaiki fungsi `resetGame()` saat nyawa habis (*Game Over*) atau saat tombol *Coba Lagi / Mainkan Ulang Quest* ditekan.
  - Membersihkan semua timer aktif (`clearAllTimeouts`) untuk mencegah perpindahan ronde yang bocor/overlap saat game diulang.
  - Me-reset total seluruh status DOM kartu pasangan (menghilangkan border/bg jawaban lama, mengaktifkan kembali tombol `disabled: false`, mengembalikan ikon anak panah/centang semula, dan mengacak kembali posisi kolom kanan).
  - Me-reset tombol Mitos/Fakta Ronde 2 dan Opsi Soal Ronde 3 beserta kotak penjelasan feedback agar kembali ke kondisi awal yang bersih.

## [2.6.1] - 2026-08-08
### Added
- **Gamifikasi Mini-Game Checkpoint 3-Stage Quest (*Quizizz / Interactive Puzzle Experience*):**
  - Mengubah gerbang checkpoint menjadi **Tantangan Bertingkat 3 Ronde Interaktif**:
    1. **Ronde 1: 🧩 Puzzle Match Kartu Konsep** — Siswa mencocokkan 3 pasangan kartu konsep & fungsi praktis dengan animasi match hijau berkilau dan sound synthesizer arpeggio.
    2. **Ronde 2: 🕵️ Detektif Mitos vs Fakta Industri** — Siswa menganalisis studi kasus industri untuk membedakan fakta kompetensi dengan mitos keliru.
    3. **Ronde 3: 🚀 Tantangan Skenario Cepat (Speed Challenge)** — Soal situasional industri dengan efek streak combo (`🔥 Combo x2`, `🔥 Combo x3`).
  - **Sistem 3 Hati Nyawa (`❤️❤️❤️`):** Siswa memiliki 3 nyawa per sesi game dengan opsi instant retry jika nyawa habis.
  - **100% Otomatisasi Sistem (Tanpa Beban Penilaian Guru):** Checkpoint divalidasi dan dinilai 100% instan oleh sistem game (+15 XP) serta membuka gembok Tab LKPD secara mandiri tanpa pernah masuk ke antrean tugas manual guru.

### Fixed
- **Filter Tabel Evaluasi LKPD Guru di Panel Admin (`/admin`):**
  - Memperbaiki query filter `lkpdSubmissions` agar secara eksklusif hanya menampilkan kiriman bertipe `lkpd`, sehingga status otomatis checkpoint tidak lagi mengotori antrean penilaian guru.

---

## [2.6.0] - 2026-08-08
### Added
- **Gamifikasi Checkpoint & Sistem Gating Tab Berurutan (*Sequential Gated Tabs*):**
  - Mengganti tombol navigasi materi sederhana dengan **Gerbang Kuis Checkpoint Interaktif** (`InteractiveKnowledgeCheck.astro`) yang divalidasi secara konseptual di setiap modul pembelajaran (Modul 1 s/d 16).
  - Alur belajar bertingkat linier (*Linear Mastery Progression*):
    1. **Tab 1: Materi & Visual** (Terbuka bebas untuk dipelajari).
    2. **Tab 2: Form LKPD Interaktif** (Terkunci 🔒, baru terbuka 🔓 setelah kuis checkpoint dijawab dengan benar).
    3. **Tab 3: Jurnal Refleksi** (Terkunci 🔒, baru terbuka 🔓 setelah LKPD disimpan/dikumpulkan).
    4. **Tab 4: Panduan Kriteria Guru** (Rubrik KKTP).
  - Peringatan interaktif (*Animated Toast / Shake Alert*) jika siswa mencoba melompati tab sebelum menyelesaikan syarat gerbang.
  - Efek audio sintesis Web Audio API (chime positif) dan animasi konfeti visual saat menyelesaikan tantangan kuis checkpoint.
- **Papan Skor Langsung (*Classroom Live Scoreboard & Projector Mode*):**
  - **Live Score Widget (`LiveScoreWidget.astro`):** Widget papan peringkat *real-time* di sidebar modul yang menampilkan podium Top 3 dan posisi peringkat siswa saat ini dengan polling otomatis setiap 15 detik serta *instant refresh* saat checkpoint/LKPD diselesaikan.
  - **Layar Proyektor Kelas Fullscreen (`/admin/proyektor-leaderboard`):**
    - Halaman tampilan proyektor ruang kelas beresolusi tinggi dengan tema dark slate berdaya kontras tinggi (`#090d16`, `#111827`).
    - Podium 3 Juara (🥇 Juara 1 Gold, 🥈 Juara 2 Silver, 🥉 Juara 3 Bronze) berukuran besar dan tabel peringkat realtime peserta lainnya.
    - Filter Kelas (Semua Kelas, 10 RPL 1, 10 RPL 2), toggle suara lonceng saat poin siswa bertambah, dan tombol Layar Penuh (F11).
    - Polling snapy tiap 5 detik untuk menghidupkan suasana kompetisi belajar yang seru dan cair di dalam kelas.
  - **Endpoint API Gamifikasi Baru:**
    - `/api/gamification/claim-checkpoint`: Klaim reward +10 XP dan pencatatan verifikasi gerbang checkpoint.
    - `/api/leaderboard`: Peningkatan endpoint leaderboard dengan filter kelas dan identifikasi user rank saat ini.

---

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
