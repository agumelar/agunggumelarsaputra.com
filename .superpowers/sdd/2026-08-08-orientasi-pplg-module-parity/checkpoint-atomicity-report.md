# Checkpoint Atomicity Security Patch Report

**Tanggal:** 2026-08-08

**Status:** Implementasi, verifikasi, dan deployment production selesai

**Commit implementasi:** `dc14eaf` (`fix: make checkpoint rewards atomic`)

## Root cause

`POST /api/gamification/claim-checkpoint` memakai pola `SELECT` → `INSERT` untuk menentukan klaim pertama. Tanpa uniqueness komposit pada `user_submissions`, dua request paralel dapat sama-sama membaca kondisi “belum ada”, membuat dua row checkpoint, dan keduanya memberikan XP. XP juga diperbarui melalui read/modify/write sehingga klaim sah yang berbarengan dapat mengalami lost update.

## Siklus TDD

Focused guard dibuat lebih dahulu di `tests/orientasi-checkpoint-atomicity.test.ts`.

- RED: `node --experimental-strip-types --test tests/orientasi-checkpoint-atomicity.test.ts` gagal pada assertion bahwa skema belum memiliki unique identity `(userId, lessonSlug, submissionType)`.
- GREEN: command yang sama lulus 1/1 setelah constraint, migration bootstrap, conflict-safe insert, dan conditional XP award diterapkan.

Guard menangkap mutasi berikut: constraint skema hilang, cleanup/index production hilang, handler kembali memakai pre-select, `ON CONFLICT ... RETURNING` hilang, atau XP dipindahkan ke luar cabang insert pemenang.

## Implementasi

- `src/db/schema.ts`: unique key bernama `user_submissions_user_lesson_type_unique` pada `(userId, lessonSlug, submissionType)`.
- `src/db/index.ts`: migration runtime idempoten memakai advisory lock; hanya saat index belum ada, tabel dikunci, duplicate dirangking, row yang sudah dinilai/terbaru dipertahankan, row redundan dihapus, lalu unique index dibuat.
- `src/pages/api/gamification/claim-checkpoint.ts`: menghapus pre-select dan memakai Drizzle `onConflictDoNothing({ target: [...] }).returning(...)`; hanya request yang menerima row baru dapat memberikan XP.
- XP memakai atomic `INSERT ... ON CONFLICT DO UPDATE` dengan penambahan di sisi PostgreSQL, sehingga klaim checkpoint berbeda tidak saling menimpa.

Duplicate submission historis dibersihkan secara deterministik. XP historis tidak dikurangi otomatis karena tidak tersedia reward ledger yang dapat membuktikan bagian XP mana yang berasal dari race lama; menebak koreksi berisiko merusak XP sah.

## Verifikasi

- Focused atomicity guard: **1/1 PASS**.
- `npm run test:orientasi`: **6/6 PASS**.
- `npm run verify:orientasi-parity`: **PASS**.
- `npm run build`: **exit 0**, Astro server build complete.
- `git diff --cached --check`: tidak menemukan whitespace error sebelum commit.

## Deployment dan smoke

- Deployment final: `dpl_7egFohXuhXB4jjVErKuogF3YBJFn`.
- URL deployment: `https://agunggumelarsaputra-cgcllt7b2-agumelars-projects.vercel.app`.
- Status: **READY**; alias mencakup `https://www.agunggumelarsaputra.com` dan apex.
- Beranda production: HTTP **200**.
- `GET /api/leaderboard`: HTTP **200** dan memicu cold-runtime `ensureDbInitialized()`.
- Runtime error logs setelah bootstrap: tidak ada.
- `POST /api/gamification/claim-checkpoint` tanpa session dengan JSON: HTTP **401**.

Percobaan deployment pertama dari detached worktree (`dpl_DEAqSuNVop1FUVP3DaiSsAfxRjbZ`) diblokir Vercel karena metadata Git worktree tidak membawa repository origin. Percobaan clean clone berikutnya (`dpl_H1enP5xF3cBoUFLP11hSCALxtNvZ`) menemukan dependency repository yang sudah ada: reader tracked mengimpor `SmartMarkdownWrapper.astro`, sedangkan file itu masih untracked. Deployment final memakai clean clone commit patch ditambah salinan file lokal tersebut tanpa memasukkannya ke commit keamanan.

## Concerns / tindak lanjut

1. `src/components/modul/SmartMarkdownWrapper.astro` harus ditetapkan kepemilikannya dan di-commit dalam task terpisah; clean checkout saat ini tidak dapat build tanpa file lokal tersebut. Patch keamanan sengaja tidak mengambil alih perubahan unrelated.
2. Vercel CLI mengembalikan secret database sebagai `[REDACTED]`, jadi katalog index tidak dapat di-query langsung dari mesin lokal. Jalur migration production terverifikasi lewat cold-runtime request sukses dan ketiadaan log error bootstrap.
3. Constraint baru mencegah duplicate LKPD/reflection juga. Dua submit identik yang benar-benar simultan dapat membuat request yang kalah menerima conflict/500 karena endpoint submission masih memakai pre-select lalu insert; tidak ada duplicate row/XP, tetapi conflict-safe UX untuk endpoint tersebut layak menjadi hardening terpisah.
4. Uji concurrency end-to-end dengan session siswa/enrollment sah belum dilakukan karena tidak ada kredensial uji. Jangan membypass authentication untuk menggantikannya.
