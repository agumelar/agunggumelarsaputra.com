# Desain Penyamaan Modul Orientasi PPLG 02–16

> **Status:** Diimplementasikan, diverifikasi, dan dideploy ke production
> **Tanggal:** 2026-08-08  
> **Acuan utama:** Modul 01 — `orientasi-pplg-01-pengantar-skill-passport`

## Tujuan

Menyamakan pengalaman belajar Modul Orientasi PPLG 02–16 dengan Modul 01 tanpa menghapus materi, tugas, contoh, maupun konteks pedagogis khas masing-masing modul.

## Ruang lingkup

Setiap modul harus mengikuti kontrak pengalaman Modul 01:

1. Alur empat tab yang konsisten: Materi & Visual, LKPD, Jurnal Refleksi, dan Panduan KKTP.
2. Checkpoint Quest tiga tahap pada materi, dengan tiga nyawa, reset penuh saat gagal, reward XP, dan pembuka akses Tab LKPD.
3. Tab LKPD interaktif dengan reward XP, validasi penyimpanan, serta pembuka akses Tab Refleksi.
4. Jurnal Refleksi sebagai satu-satunya lokasi tombol `#btn-complete-lesson`, yang menyelesaikan modul dan membuka modul berikutnya.
5. Tab KKTP sebagai panduan capaian Level 0–4.
6. Gating antar-modul, indikator status modul, progress mapel 16 pertemuan, live score, dan hak bypass admin.
7. `AntiCopyPasteGuardian` diterapkan pada jawaban belajar; identitas siswa dan URL bukti tetap dikecualikan.

Materi Markdown, studi kasus, pertanyaan LKPD/refleksi, dan bukti tugas dari Modul 02–16 tetap bersifat spesifik per pertemuan.

## Pendekatan yang disetujui

Sistem bersama berbasis Modul 01 digunakan sebagai standar. Reader modul dan komponen generik dikonfigurasi dari data/konten tiap modul, bukan dengan menyalin markup Modul 01 ke lima belas modul. Pendekatan ini menjaga keseragaman perilaku dan mencegah duplikasi logika.

## Batasan dan keamanan perubahan

- Workspace sudah mengandung perubahan lokal yang belum di-commit; perubahan tersebut diperlakukan sebagai pekerjaan pengguna dan tidak boleh ditimpa atau dihapus.
- Production hanya dapat diaudit hingga halaman login tanpa akun siswa uji. Verifikasi perilaku terautentikasi dilakukan setelah sesi browser memiliki akun uji yang sah atau melalui pengujian kode yang setara.
- Tidak ada perubahan pada gelar pemilik, nomenklatur PPLG/RPL, ataupun filosofi desain dark-slate berkontras tinggi.

## Tahap kerja

1. Audit struktur lokal Modul 01 terhadap Modul 02–16 dan catat selisih per modul.
2. Tetapkan kontrak konfigurasi bersama untuk checkpoint, LKPD, refleksi, dan KKTP.
3. Terapkan penyamaan bertahap tanpa mengubah substansi materi.
4. Verifikasi gating, tab, reward XP, anti-copy-paste, dan build Astro.
5. Deploy ke Vercel production menggunakan CLI yang telah terautentikasi, lalu cek hasil publik dan—bila tersedia akun uji—alur siswa terautentikasi.

## Dokumentasi dan handover wajib

Setiap perubahan implementasi wajib dicatat pada:

- `docs/CHANGELOG.md`: fitur, perbaikan, perubahan perilaku, dan hasil penting.
- `docs/ARCHITECTURE_AND_HANDOVER.md`: kontrak sistem, alur, endpoint, komponen, prosedur verifikasi/deployment, atau keputusan operasional yang berubah.
- Dokumen spesifikasi/rencana ini: keputusan ruang lingkup dan progres pekerjaan penyamaan modul.

Jika dokumen handover belum cukup untuk membuat agen atau sesi berikutnya dapat melanjutkan pekerjaan dengan aman, dokumentasi harus diperluas sebelum pekerjaan dinyatakan selesai.

## Kriteria penerimaan

- Modul 02–16 memberi pengalaman alur inti yang sama dengan Modul 01.
- Konten dan instruksi belajar unik setiap modul tidak hilang atau berubah secara tidak sengaja.
- Tidak ada bypass siswa terhadap urutan tab atau gating modul.
- Build `npm run build` berhasil.
- Deployment production berhasil dan perubahan terdokumentasi lengkap untuk handover sesi berikutnya.

## Hasil verifikasi dan deployment (2026-08-08)

### Security addendum: trust boundary dan concurrency submission

- Klaim checkpoint harus bersifat exactly-once pada dua sisi sekaligus: row checkpoint dan XP. Unique insert saja tidak cukup karena statement XP yang gagal sesudah insert akan membuat partial commit. Kontrak final memakai satu data-modifying CTE PostgreSQL yang menggabungkan insert conflict-safe dengan XP upsert.
- Endpoint submission tidak memiliki jalur generik. `getApprovedSubmission()` hanya menyetujui slug dari katalog 16 modul serta tipe `lkpd`/`reflection`, sekaligus menurunkan action dan reward dari server. Enrollment, prasyarat modul, dan urutan checkpoint → LKPD → refleksi tetap diperiksa dari state database.
- First-submit LKPD/refleksi memakai CTE insert+reward yang sama-sama atomik. Conflict pada request paralel bukan error: request yang kalah melakukan update record pemenang tanpa reward tambahan. Update tetap menjaga grade/feedback dan remedial; row dengan `teacher_score >= 73` dikunci, termasuk bila grade masuk bersamaan dengan update siswa.
- Input klien yang tidak lagi memiliki otoritas: `tokenId`, `score`, slug nonkanonik, tipe submission lain, dan nilai reward. Existing submission records tidak dimigrasikan atau dihapus oleh patch ini.
- Guard fokus: `tests/orientasi-checkpoint-atomicity.test.ts` dan `tests/orientasi-submission-security.test.ts`. RED awal 0/4 membuktikan ketiga celah; GREEN 4/4 membuktikan kontrak baru. Suite Orientasi bertambah menjadi 9 tes.
- Verifikasi clone rilis terisolasi berhasil: suite Orientasi 9/9, parity PASS, dan build exit 0. Deployment masih tertunda karena dua invocation Vercel CLI timeout sebelum mencatat job baru; production masih menjalankan deployment `agunggumelarsaputra-cgcllt7b2-agumelars-projects.vercel.app`. Smoke production lama (public 200, mutation tanpa sesi 401) adalah baseline saja dan harus diulang setelah patch benar-benar dideploy.

### Security addendum: atomisitas reward checkpoint

- Identity submission dibakukan menjadi `(user_id, lesson_slug, submission_type)` dan dipaksakan oleh unique index PostgreSQL, bukan oleh pre-check aplikasi.
- Klaim checkpoint memakai conflict-safe insert + `RETURNING`; hanya request pemenang yang memperoleh 15 XP. XP ditambahkan dengan atomic upsert untuk mencegah lost update antar-checkpoint.
- Migrasi runtime mempertahankan baris duplikat lama yang sudah dinilai atau paling baru sebelum membuat index, dengan advisory/table lock agar inisialisasi serverless paralel tetap aman.
- Duplikat submission historis dibersihkan, tetapi XP historis tidak dikurangi otomatis karena tidak ada reward ledger yang dapat membuktikan XP mana yang berasal dari race lama.
- Regression contract berada di `tests/orientasi-checkpoint-atomicity.test.ts` dan harus lulus sebelum parity guard/build/deploy.
- Release final: focused guard 1/1, suite Orientasi 6/6, parity PASS, build exit 0, dan deployment `dpl_7egFohXuhXB4jjVErKuogF3YBJFn` READY/teralias ke `www`. Smoke publik menghasilkan 200 untuk beranda/leaderboard dan 401 untuk checkpoint tanpa sesi.

### Final review fix: server authority dan pelestarian LKPD

- Batas kepercayaan dipindahkan ke server: enrollment aktif, prerequisite, serta checkpoint → LKPD → refleksi → completion dibaca dari database oleh policy bersama. Browser event/localStorage hanya memperbarui UX setelah response sukses.
- Daftar tepat 16 slug kanonik menjadi sumber navigasi/progress reader dan validasi checkpoint. Endpoint checkpoint menurunkan `quizId` dan reward 15 XP dari policy, bukan payload klien.
- Tugas Modul 02–16 dirender dari skema terstruktur. Struktur asli Modul 02 (tiga profesi + action plan) dan Modul 12 (dua latihan screenshot CER) menjadi regression fixture eksplisit.
- Verifikasi wajib kini mencakup `npm run test:orientasi` sebelum guard parity dan build.
- Final fix deployment `dpl_69TnjsE2Fqc4KCv6f7ZqygUArjQe` berstatus READY di [deployment URL](https://agunggumelarsaputra-g2dztreej-agumelars-projects.vercel.app) dan dialiaskan ke [domain production](https://www.agunggumelarsaputra.com). Smoke test beranda menghasilkan HTTP 200; klaim checkpoint tanpa login ditolak HTTP 401.

- `npm run verify:orientasi-parity` selesai dengan exit code `0` dan keluaran `Orientasi PPLG parity guard: PASS`.
- `npm run build` selesai dengan exit code `0`; Astro menghasilkan server build dengan adapter `@astrojs/vercel`.
- Vercel production deployment `dpl_49za4gEgo3PWAY6AiGkk2cUEiug2` READY di [deployment URL](https://agunggumelarsaputra-1l124rpo0-agumelars-projects.vercel.app) dan dialiaskan ke [domain production](https://www.agunggumelarsaputra.com).
- Pemeriksaan halaman publik pada domain production berhasil: beranda memuat judul, navigasi, hero, dan katalog modul tanpa regresi yang terlihat.
- Tidak ada sesi siswa uji yang sah pada saat release. Karena itu, pengujian production atas locked-state Modul 02, checkpoint → LKPD → refleksi, `#btn-complete-lesson`, dan terbukanya Modul 03 masih merupakan pekerjaan lanjutan yang harus dilakukan melalui akun siswa terdaftar dan enrollment legitimate—tanpa bypass autentikasi.
