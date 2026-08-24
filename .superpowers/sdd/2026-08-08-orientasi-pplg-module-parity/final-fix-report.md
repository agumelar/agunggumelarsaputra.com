# Final Fix Report — Orientasi PPLG Module Parity

Tanggal: 2026-08-08
Status: Implemented, verified, deployed, and committed

## Scope

Satu gelombang perbaikan untuk empat temuan Important: authority server, cakupan 16 modul kanonik, pelestarian tugas LKPD khas, dan checkpoint reward/slug yang tidak boleh dipercaya dari klien.

## Systematic debugging: reproduction and root causes

### 1. Server-side sequential enforcement

- Reproduksi RED: `npm run test:orientasi` gagal pada tes `server rejects a student action...` karena `orientasiPplgPolicy.ts` belum ada. Audit route membuktikan `claim-checkpoint` memberi guest/offline success, `submissions/save` menerima tahap apa pun, dan `complete-lesson` hanya memeriksa duplikasi.
- Root cause: urutan tahap hanya dimiliki JavaScript reader/localStorage; endpoint tidak membaca enrollment, prerequisite, atau submission tahap sebelumnya.
- Fix: `authorizeOrientasiAction` + `getOrientasiServerState` menjadi policy/boundary bersama untuk ketiga endpoint. State berasal dari database. Admin hanya bypass enrollment/prerequisite untuk inspeksi; stage mutation tetap berurutan.

### 2. Canonical module scope

- Reproduksi RED: tes `reader model keeps exactly the 16 canonical...` gagal karena helper/katalog kanonik belum ada. Audit reader menunjukkan `allModules.sort(...)` memasukkan konten HTML, SQL, dan OOP ke sidebar/prerequisite/next/progress.
- Root cause: collection pembelajaran dipakai tanpa kurikulum allowlist.
- Fix: `CANONICAL_ORIENTASI_SLUGS` dan `selectCanonicalOrientasiModules` mengatur tepat 16 entry dalam urutan kurikulum; reader memakai hasil ini untuk seluruh navigasi dan denominator progres.

### 3. Structured unique LKPD

- Reproduksi RED: dua tes schema gagal karena `orientasiLkpdSchemas.ts` belum ada. Perbandingan git history menunjukkan Modul 02 sebelumnya memiliki tabel 3 profesi + prioritas + dua action step, dan Modul 12 memiliki dua latihan CER screenshot positif/negatif; komponen saat review hanya menyimpan `analysisSummary`.
- Root cause: refactor parity menyimpan copy prompt kontekstual tetapi meratakan model data semua LKPD menjadi satu textarea.
- Fix: `ORIENTASI_LKPD_SCHEMAS` mendefinisikan sections/fields/evidence khusus Modul 02–16 dan komponen merender serta memulihkan semua field secara dinamis. URL evidence yang benar-benar dirender ditambahkan ke allowlist anti-paste eksplisit.

### 4. Checkpoint slug and XP trust boundary

- Reproduksi RED: tes `checkpoint policy rejects arbitrary slugs...` gagal karena tidak ada server catalog. Audit menunjukkan route menerima arbitrary `lessonSlug`, `quizId`, `tokenId`, dan `xpReward`, lalu memakai `Number(xpReward)` untuk XP.
- Root cause: metadata reward dianggap data input, bukan keputusan server.
- Fix: `getApprovedCheckpoint` hanya menerima 16 slug kanonik dan menurunkan Quest ID/reward 15 XP di server. Client kini hanya mengirim `lessonSlug`; token ID juga diturunkan dari enrollment server.

## Red → green evidence

- RED: 5 tests, 0 pass, 5 fail (`ERR_MODULE_NOT_FOUND` untuk policy/schema yang menjadi kontrak baru), sebelum production implementation.
- GREEN: 5 tests, 5 pass, 0 fail setelah implementasi.
- Guard: `Orientasi PPLG parity guard: PASS` setelah ditambah wiring assertions dan behavioral policy/schema checks.

## Final verification

- `npm run test:orientasi`: exit 0; 5/5 pass.
- `npm run verify:orientasi-parity`: exit 0; PASS.
- `npm run build`: exit 0; Astro server build complete dengan `@astrojs/vercel`.
- `npx vercel --prod --yes`: exit 0; deployment `dpl_69TnjsE2Fqc4KCv6f7ZqygUArjQe`, READY.
- Production URL: `https://agunggumelarsaputra-g2dztreej-agumelars-projects.vercel.app`.
- Alias: `https://www.agunggumelarsaputra.com`.
- Smoke test: homepage HTTP 200 dan memuat nama situs; unauthenticated checkpoint POST HTTP 401.

## Files and contracts

- Policy/canonical catalog: `src/utils/orientasiPplgPolicy.ts`.
- DB state loader: `src/utils/orientasiPplgServer.ts`.
- Structured task catalog: `src/utils/orientasiLkpdSchemas.ts`.
- Behavior tests: `tests/orientasi-*.test.ts`.
- Static/integration guard: `scripts/verify-orientasi-pplg-parity.mjs`.

## Remaining concern

Tidak ada akun siswa uji/enrollment legitimate pada sesi ini. Oleh karena itu smoke test production belum menjalankan satu siklus terautentikasi penuh Modul 02 sampai Modul 03. Proteksi tersebut dibuktikan secara deterministik di policy tests dan endpoint wiring guard, tetapi verifikasi browser production dengan akun sah tetap menjadi tindak lanjut operasional.
