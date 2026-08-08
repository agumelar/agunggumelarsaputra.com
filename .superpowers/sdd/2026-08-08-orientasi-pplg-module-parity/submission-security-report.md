# Submission Security Continuation Report

**Tanggal:** 2026-08-08
**Status:** Implementasi dan verifikasi selesai; deployment production tertunda karena Vercel CLI timeout

## Temuan dan root cause

1. `/api/gamification/claim-checkpoint` menggunakan unique insert dan atomic XP upsert, tetapi keduanya merupakan dua statement. Jika upsert XP gagal setelah insert commit, retry melihat checkpoint sudah ada dan tidak pernah memberikan XP. Ini mencegah over-credit, tetapi belum exactly-once.
2. `/api/submissions/save` hanya menjalankan policy untuk string ber-prefix `orientasi-pplg-`. Slug lain dan tipe arbitrer masuk jalur umum dan menerima fallback reward 10/25/15 XP dari data request.
3. Submission pertama memakai `SELECT` lalu plain `INSERT`. Dua request paralel dapat sama-sama melihat kosong; pemenang insert, request lain menerima unique violation HTTP 500.
4. Mutasi XP submission memakai read/modify/write sehingga award sah yang paralel juga berisiko lost update.

## Siklus TDD

Guard dibuat sebelum production patch:

- `tests/orientasi-checkpoint-atomicity.test.ts` diperkuat agar menuntut insert checkpoint dan XP dalam satu statement CTE PostgreSQL.
- `tests/orientasi-submission-security.test.ts` ditambahkan untuk kontrak allowlist slug/type/reward, server-state authorization, first-create conflict-safe, dan XP yang hanya bersumber dari row insert pemenang.
- RED: focused command menghasilkan **0/4 pass, 4 fail** untuk sebab yang diharapkan.
- GREEN: command yang sama menghasilkan **4/4 pass** setelah implementasi minimal.

## Implementasi

- Checkpoint menggunakan satu data-modifying CTE: `inserted_checkpoint` melakukan `ON CONFLICT DO NOTHING`; `rewarded_checkpoint` mengambil input hanya dari row pemenang dan melakukan PostgreSQL-side atomic upsert. Kegagalan bagian mana pun me-rollback seluruh statement.
- `getApprovedSubmission()` hanya menyetujui 16 slug kanonik dan tipe `lkpd` (+25 XP) / `reflection` (+15 XP). Action dan reward diturunkan oleh server.
- `/api/submissions/save` selalu menjalankan `getOrientasiServerState()` dan `authorizeOrientasiAction()`. Body `tokenId`, `score`, reward, slug nonkanonik, dan tipe lain tidak menjadi otoritas.
- First-create submission dan award XP digabung dalam satu CTE. Request paralel yang kalah pada unique key menerima zero inserted rows, lalu membaca record pemenang dan melakukan update idempoten tanpa XP.
- Existing record tetap dipakai. Form data, URL evidence, token enrollment tepercaya, status, nilai, dan feedback guru dipertahankan. `teacher_score >= 73` tetap terkunci; remedial `< 73` kembali berstatus `submitted`. Guard kondisi pada UPDATE mencegah grade tuntas yang masuk bersamaan tertimpa.

## Verifikasi

Pada workspace dan diulang pada clone rilis terisolasi:

- Focused security tests: **4/4 PASS**.
- `npm run test:orientasi`: **9/9 PASS**.
- `npm run verify:orientasi-parity`: **PASS**.
- `npm run build`: **exit 0**, Astro server build complete.
- `git diff --check` pada file patch: tidak ada whitespace error (hanya peringatan normal LF/CRLF worktree Windows).

Clone rilis dibuat dari HEAD dan hanya ditambah file patch serta `SmartMarkdownWrapper.astro` yang sudah menjadi dependency reader production. Perubahan lokal unrelated pada AGENTS, konten, dan komponen LKPD tidak ikut clone/deploy staging.

## Deployment dan smoke

- Attempt 1 `npx vercel --prod --yes`: timeout lokal setelah **124 detik**; tidak ada deployment baru.
- Attempt 2 `npx vercel --prod --yes`: timeout lokal setelah **304 detik**; tidak ada deployment baru.
- Pemeriksaan `vercel ls agunggumelarsaputra.com --yes` setelah masing-masing attempt tetap menampilkan deployment sebelumnya `https://agunggumelarsaputra-cgcllt7b2-agumelars-projects.vercel.app` sebagai latest **READY**.
- Smoke baseline production lama:
  - `GET /`: HTTP **200**.
  - `GET /pembelajaran`: HTTP **200**.
  - `GET /pembelajaran/orientasi-pplg`: HTTP **200**.
  - unauthenticated `POST /api/gamification/claim-checkpoint`: HTTP **401**.
  - unauthenticated `POST /api/submissions/save`: HTTP **401**.

Smoke tersebut tidak membuktikan patch sudah live. Production deployment wajib diulang dan status READY/alias diverifikasi sebelum release dianggap selesai.

## Concerns / continuation

1. Deployment production adalah satu-satunya deliverable yang masih tertunda. Gunakan clone bersih agar perubahan unrelated tidak terunggah.
2. Tidak tersedia session siswa/enrollment sah untuk uji end-to-end first-submit/concurrency production; jangan membypass autentikasi. Regression guard dan PostgreSQL statement contract menjadi bukti lokal saat ini.
3. `npm ci` pada clone melaporkan 10 vulnerability dependency yang sudah ada (6 moderate, 4 high). Tidak dijalankan `npm audit fix` karena berada di luar scope dan dapat mengubah dependency secara breaking.
4. `SmartMarkdownWrapper.astro` masih untracked pada workspace utama walau reader tracked mengimpornya. Patch ini tidak mengambil kepemilikan file unrelated tersebut.
