# Penyamaan Modul Orientasi PPLG 02–16 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyamakan alur, integritas belajar, dan pengalaman interaktif Modul Orientasi PPLG 02–16 dengan Modul 01 tanpa menghilangkan substansi materi dan tugas unik tiap pertemuan.

**Architecture:** `src/pages/pembelajaran/[...slug].astro` tetap menjadi reader SSR tunggal yang mengambil data Content Collection di server, memeriksa progres dan akses pengguna, lalu me-render komponen interaktif. Konten khusus Modul 02–16 disediakan melalui Markdown, `MODULE_GAMIFIED_QUESTS`, dan `MODULE_LKPD_GUIDES`; komponen bersama menjalankan checkpoint, LKPD, refleksi, KKTP, anti-copy-paste, dan status tab.

**Tech Stack:** Astro 7 SSR, Astro Content Collections, TypeScript, TailwindCSS, Drizzle/Neon PostgreSQL, Node.js assertions, Vercel CLI 58.8.0.

## Global Constraints

- Modul 01 (`orientasi-pplg-01-pengantar-skill-passport`) adalah acuan perilaku dan kualitas untuk Modul 02–16.
- Materi, studi kasus, pertanyaan, dan bukti tugas tiap Modul 02–16 harus tetap spesifik pada pertemuannya.
- Tombol `#btn-complete-lesson` hanya boleh berada di Tab Jurnal Refleksi.
- Siswa tidak dapat melewati checkpoint, LKPD, refleksi, atau modul prasyarat; admin tetap memiliki bypass akses modul.
- Blokir paste, drop, `Ctrl/Cmd+V`, dan `Shift+Insert` pada jawaban pembelajaran; identitas siswa dan URL bukti tetap dapat ditempel.
- Jangan menimpa perubahan lokal yang belum di-commit. Tambahkan perubahan hanya setelah membandingkan diff yang ada.
- Setiap perubahan implementasi wajib memperbarui `docs/CHANGELOG.md` dan, jika kontrak/alur/operasional berubah, `docs/ARCHITECTURE_AND_HANDOVER.md`.
- Sebelum selesai, jalankan `npm run build` lalu deploy dengan `vercel --prod --yes`.

---

## File Structure

- Create: `scripts/verify-orientasi-pplg-parity.mjs` — pemeriksa regresi tanpa dependency untuk kontrak Modul 02–16.
- Modify: `package.json` — skrip `verify:orientasi-parity`.
- Modify: `src/utils/moduleCheckpoints.ts` — katalog Quest tiga tahap untuk setiap Modul 02–16.
- Modify: `src/components/modul/GeneralInteractiveLkpd.astro` — katalog LKPD spesifik modul dan perlakuan input identitas/evidence.
- Modify: `src/components/modul/InteractiveReflectionForm.astro` dan `src/components/modul/KktpGuideCard.astro` — konteks Modul 02–16 pada refleksi dan rubrik.
- Modify: `src/pages/pembelajaran/[...slug].astro` — kontrak reader, gating, urutan tab, dan posisi penyelesaian final.
- Modify: `src/content/pembelajaran/orientasi-pplg-02-*.md` hingga `orientasi-pplg-16-*.md` — materi dan petunjuk aktivitas khas tiap modul.
- Modify: `docs/CHANGELOG.md`, `docs/ARCHITECTURE_AND_HANDOVER.md`, dan dokumen spesifikasi ini — handover final yang dapat dilanjutkan sesi lain.

## Interfaces

- `getGamifiedQuestForModule(lessonSlug, moduleTitle)` menyediakan `GamifiedQuest` dengan `stage1Match.pairs`, `stage2Detective`, `stage3Speed`, dan `xpReward` untuk `InteractiveKnowledgeCheck`.
- `GeneralInteractiveLkpd` menerima `{ lessonSlug: string; moduleTitle: string; user: any }` dan mengirim `POST /api/submissions/save` dengan `submissionType: 'lkpd'`.
- `InteractiveReflectionForm` menerima `{ lessonSlug: string; moduleTitle?: string; user: any }` dan mengirim `POST /api/submissions/save` dengan `submissionType: 'reflection'`.
- `InteractiveKnowledgeCheck` mengirim `POST /api/gamification/claim-checkpoint` dan memancarkan `checkpoint-passed`.
- Reader menyimpan state server awal pada `data-init-checkpoint`, `data-init-lkpd`, serta `data-init-reflection`, lalu membuka tab melalui event `checkpoint-passed` dan `lkpd-submitted`.

---

### Task 1: Add a module-parity regression guard

**Files:**
- Create: `scripts/verify-orientasi-pplg-parity.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: reader, checkpoint catalog, general LKPD component, and the 16 Markdown files.
- Produces: `npm run verify:orientasi-parity`, exit code `0` only when all 16 modules and the shared contract are present.

- [ ] **Step 1: Run the missing parity command as the initial failing check**

Run: `npm run verify:orientasi-parity`

Expected: command fails because the npm entry and guard file do not exist yet.

- [ ] **Step 2: Write the parity guard**

Create `scripts/verify-orientasi-pplg-parity.mjs` with the following checks and add the matching npm script:

```js
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const contentDirectory = resolve(root, 'src/content/pembelajaran');
const reader = await readFile(resolve(root, 'src/pages/pembelajaran/[...slug].astro'), 'utf8');
const checkpoints = await readFile(resolve(root, 'src/utils/moduleCheckpoints.ts'), 'utf8');
const lkpd = await readFile(resolve(root, 'src/components/modul/GeneralInteractiveLkpd.astro'), 'utf8');
const files = await readdir(contentDirectory);
const orientasi = files
  .filter((name) => /^orientasi-pplg-(0[1-9]|1[0-6])-.*\.md$/.test(name))
  .sort();

assert.equal(orientasi.length, 16, 'Harus ada tepat 16 Markdown Modul Orientasi PPLG.');
assert.match(reader, /<InteractiveKnowledgeCheck/, 'Reader harus memasang checkpoint bersama.');
assert.match(reader, /<GeneralInteractiveLkpd/, 'Reader harus memasang LKPD generik untuk Modul 02–16.');
assert.match(reader, /<InteractiveReflectionForm[\s\S]*moduleTitle=\{entry\.data\.title\}/, 'Refleksi harus menerima judul modul.');
assert.match(reader, /id="btn-complete-lesson"/, 'Reader harus menyediakan tombol tuntas.');
assert.match(reader, /<section id="panel-refleksi"[\s\S]*id="btn-complete-lesson"/, 'Tombol tuntas hanya berada di panel refleksi.');

for (const filename of orientasi.slice(1)) {
  const slug = filename.replace(/\.md$/, '');
  assert.ok(checkpoints.includes(`'${slug}'`), `Checkpoint belum dikonfigurasi untuk ${slug}.`);
  assert.ok(lkpd.includes(`'${slug}'`), `Panduan LKPD belum dikonfigurasi untuk ${slug}.`);
}

console.log('Orientasi PPLG parity guard: PASS');
```

Add this exact entry to `scripts` in `package.json`:

```json
"verify:orientasi-parity": "node scripts/verify-orientasi-pplg-parity.mjs"
```

- [ ] **Step 3: Implement the guard and npm script**

Add the script and `package.json` entry exactly as above. Do not add test libraries or change application dependencies.

- [ ] **Step 4: Run the guard to verify it passes**

Run: `npm run verify:orientasi-parity`

Expected: `Orientasi PPLG parity guard: PASS`.

- [ ] **Step 5: Commit the independent regression guard**

```bash
git add package.json scripts/verify-orientasi-pplg-parity.mjs
git commit -m "test: guard orientasi module parity"
```

### Task 2: Complete the lesson-specific checkpoint and LKPD catalogs

**Files:**
- Modify: `src/utils/moduleCheckpoints.ts`
- Modify: `src/components/modul/GeneralInteractiveLkpd.astro`

**Interfaces:**
- Consumes: the fifteen Orientasi slugs from the parity guard.
- Produces: one three-stage `GamifiedQuest` and one descriptive LKPD guide per Module 02–16.

- [ ] **Step 1: Extend the guard with catalog-shape assertions**

After the slug loop in the parity guard, add these assertions:

```js
for (const filename of orientasi.slice(1)) {
  const slug = filename.replace(/\.md$/, '');
  const checkpointStart = checkpoints.indexOf(`'${slug}'`);
  const checkpointBlock = checkpoints.slice(checkpointStart, checkpoints.indexOf('\n  },', checkpointStart));
  assert.match(checkpointBlock, /stage1Match:/, `${slug} harus memiliki ronde Puzzle Match.`);
  assert.match(checkpointBlock, /stage2Detective:/, `${slug} harus memiliki ronde Mitos vs Fakta.`);
  assert.match(checkpointBlock, /stage3Speed:/, `${slug} harus memiliki ronde Skenario Cepat.`);
  assert.match(checkpointBlock, /xpReward:/, `${slug} harus memiliki reward XP.`);
}
```

- [ ] **Step 2: Run the guard to expose incomplete catalog**

Run: `npm run verify:orientasi-parity`

Expected: PASS only when every current record contains all three stages and an XP reward; otherwise the command fails with the first incomplete module name.

- [ ] **Step 3: Implement complete content-aware records**

For each key from `orientasi-pplg-02-profesi-peluang-karier` through `orientasi-pplg-16-rekap-skill-clinic-refleksi`:

- Set `moduleTitle` to the actual lesson title.
- Set `stage1Match` with exactly three `pairs` of concepts and functions found in that module's Markdown.
- Set `stage2Detective` to a true/false industry statement relevant to that meeting.
- Set `stage3Speed` to three scenario options with one correct decision and explanation.
- Keep the game mechanics unchanged: three lives, full state reset, checkpoint persistence, and `xpReward` claimed only through `/api/gamification/claim-checkpoint`.
- Add or retain exactly one `MODULE_LKPD_GUIDES[lessonSlug]` record with a module-specific `prompt`, `placeholder`, and `tip`.
- Preserve identity input IDs (`gen_studentName`, `gen_studentNis`, `gen_studentClass`, `gen_submissionDate`) and evidence ID `gen_driveUrl`; retain `data-allow-paste="true"` on them only.

- [ ] **Step 4: Verify the catalogs**

Run: `npm run verify:orientasi-parity`

Expected: PASS; all fifteen modules have a three-stage quest, XP reward, and LKPD guide.

- [ ] **Step 5: Commit catalogs**

```bash
git add src/utils/moduleCheckpoints.ts src/components/modul/GeneralInteractiveLkpd.astro
git commit -m "feat: align orientasi module quests and lkpd guides"
```

### Task 3: Normalize reader flow and shared reflection/KKTP behavior

**Files:**
- Modify: `src/pages/pembelajaran/[...slug].astro`
- Modify: `src/components/modul/InteractiveReflectionForm.astro`
- Modify: `src/components/modul/KktpGuideCard.astro`
- Modify: `src/components/modul/AntiCopyPasteGuardian.astro` only if a task input is missing from its explicit allow/block rules.

**Interfaces:**
- Consumes: database-derived submission state and browser events from checkpoint/LKPD components.
- Produces: the same sequential tab behavior for Module 01 and Modules 02–16, with module-specific reflection and KKTP copy.

- [ ] **Step 1: Extend the guard for sequential-flow ownership**

Add these exact assertions to the guard:

```js
assert.match(reader, /data-init-checkpoint=/, 'Reader harus menerima state checkpoint dari server.');
assert.match(reader, /data-init-lkpd=/, 'Reader harus menerima state LKPD dari server.');
assert.match(reader, /window\.addEventListener\('checkpoint-passed'/, 'Checkpoint harus membuka LKPD.');
assert.match(reader, /window\.addEventListener\('lkpd-submitted'/, 'LKPD harus membuka refleksi.');
assert.match(reader, /isCurrentModuleLocked/, 'Reader harus memeriksa gating modul.');
assert.match(reader, /user\?\.role !== 'admin'/, 'Admin harus mempertahankan bypass gating.');
```

- [ ] **Step 2: Run the guard to verify the ownership check**

Run: `npm run verify:orientasi-parity`

Expected: PASS only when the reader contains every required event and gating contract; otherwise the command identifies the missing contract.

- [ ] **Step 3: Implement the shared reader contract**

- Keep all `InteractiveKnowledgeCheck`, `GeneralInteractiveLkpd`, `InteractiveReflectionForm`, `KktpGuideCard`, `LiveScoreWidget`, and `AntiCopyPasteGuardian` imports in the shared reader.
- Pass `lessonSlug`, `entry.data.title`, and `user` into the generic LKPD and reflection components.
- Keep `#btn-complete-lesson` in `#panel-refleksi` only; retain its `POST /api/progress/complete-lesson` request and the `#btn-goto-next` state change on success.
- Keep the locked-card response for direct access to an unfinished prerequisite and the `user?.role !== 'admin'` bypass condition.
- Make reflection prompts use `moduleTitle` while preserving the four stored answer keys `q1`, `q2`, `q3`, and `q4`.
- Generate KKTP defaults from the module order: OR-01 for 1–8, OR-02 for 9–16, and pass the actual module title to its indicators.
- Preserve `AntiCopyPasteGuardian`'s allowance for identity and URL inputs and its blocking behavior inside LKPD/reflection forms.

- [ ] **Step 4: Verify flow ownership**

Run: `npm run verify:orientasi-parity`

Expected: PASS; the static contract guarantees the reader owns all sequential transitions and module gating.

- [ ] **Step 5: Commit reader and shared-component alignment**

```bash
git add src/pages/pembelajaran/[...slug].astro src/components/modul/InteractiveReflectionForm.astro src/components/modul/KktpGuideCard.astro src/components/modul/AntiCopyPasteGuardian.astro scripts/verify-orientasi-pplg-parity.mjs
git commit -m "feat: standardize orientasi learning flow"
```

### Task 4: Preserve and refine unique lesson content

**Files:**
- Modify: `src/content/pembelajaran/orientasi-pplg-02-profesi-peluang-karier.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-03-ekosistem-industri-pplg.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-04-matriks-skill-jenjang-karier.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-05-job-fair-kelas.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-06-rencana-minat-awal.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-07-mind-map-profesi-pplg.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-08-finalisasi-validasi-or01.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-09-app-audit-produk-digital.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-10-ui-ux-fungsi-produk.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-11-framework-review-6-komponen.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-12-latihan-analisis-anotasi-visual.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-13-review-show-peer-feedback.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-14-finalisasi-dokumen-review.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-15-pengumpulan-validasi-or02.md`
- Modify: `src/content/pembelajaran/orientasi-pplg-16-rekap-skill-clinic-refleksi.md`

**Interfaces:**
- Consumes: Content Collection schema in `src/content.config.ts`.
- Produces: 15 independent lesson documents rendered through the shared reader with valid `title`, `description`, `category`, `order`, `duration`, and `tags` frontmatter.

- [ ] **Step 1: Extend the guard to check module frontmatter and activity guidance**

Add this exact loop to the parity guard:

```js
for (const filename of orientasi.slice(1)) {
  const source = await readFile(resolve(contentDirectory, filename), 'utf8');
  for (const field of ['title:', 'description:', 'category:', 'order:', 'duration:', 'tags:']) {
    assert.ok(source.includes(field), `${filename} tidak memiliki frontmatter ${field}`);
  }
  assert.match(source, /Langkah Selanjutnya|Aktivitas Belajar/, `${filename} harus memandu aktivitas lanjutan siswa.`);
}
```

- [ ] **Step 2: Run the guard to verify the content contract**

Run: `npm run verify:orientasi-parity`

Expected: PASS only when each Markdown lesson has all required frontmatter and activity guidance; otherwise the command identifies the incomplete filename.

- [ ] **Step 3: Implement content-preserving refinements**

- Retain the original subject matter and sequence for each meeting.
- Ensure the activity guidance describes the same shared progression: complete Materi & Checkpoint, submit LKPD, submit Refleksi, then complete the module in Tab 3.
- Use `Pengembangan Perangkat Lunak dan Gim (PPLG)` only for the program and `Rekayasa Perangkat Lunak (RPL)` only for the concentration/teacher role.
- Keep all frontmatter valid for the existing Content Collection schema; do not add unrecognized fields without first updating `src/content.config.ts` and its parity guard.

- [ ] **Step 4: Verify content integrity**

Run: `npm run verify:orientasi-parity`

Expected: PASS; all 15 files satisfy Content Collection and activity-guidance checks.

- [ ] **Step 5: Commit lesson content**

```bash
git add src/content/pembelajaran/orientasi-pplg-0*.md src/content/pembelajaran/orientasi-pplg-1*.md scripts/verify-orientasi-pplg-parity.mjs
git commit -m "docs: align orientasi module learning guidance"
```

### Task 5: Verify, record handover, and deploy production

**Files:**
- Modify: `docs/CHANGELOG.md`
- Modify: `docs/ARCHITECTURE_AND_HANDOVER.md`
- Modify: `docs/superpowers/specs/2026-08-08-module-parity-design.md`

**Interfaces:**
- Consumes: passing parity guard and Astro build.
- Produces: production deployment and complete continuation notes for future sessions/agents.

- [ ] **Step 1: Add a release-ready changelog entry**

Under the current `[Unreleased]` section, add a dated entry that records: shared Module 01 contract applied to Modules 02–16, per-module three-stage quests, contextual LKPD/reflection/KKTP, sequential gating, anti-copy-paste exceptions, parity guard command, build result, deployment URL, and any remaining authenticated-production verification limitation.

- [ ] **Step 2: Update the handover document**

Add a dedicated “Module Parity Verification & Continuation” section to `docs/ARCHITECTURE_AND_HANDOVER.md` with:

- canonical source of truth: Module 01 and this approved design;
- `npm run verify:orientasi-parity` before `npm run build`;
- exact common component/event/API contract listed above;
- a checklist for future module creation: Markdown, quest, LKPD guide, reflection/KKTP context, anti-paste, gating, docs, build, deploy;
- production verification status and the need for a legitimate student test session to exercise protected interactions.

- [ ] **Step 3: Run all deterministic verification**

Run:

```bash
npm run verify:orientasi-parity
npm run build
```

Expected: both commands exit `0`; Astro reports a successful server build.

- [ ] **Step 4: Deploy verified production code**

Run: `vercel --prod --yes`

Expected: Vercel returns a successful production deployment URL for `https://agunggumelarsaputra.com`.

- [ ] **Step 5: Check production and record results**

- Visit the public production URL and verify no public-page regression.
- If an authorized student test session is available, verify Module 02's locked-state, checkpoint → LKPD → reflection flow, completion button, and next-module unlock.
- Record the actual deployment URL and verification result in the changelog/spec.

- [ ] **Step 6: Commit the final handover record**

```bash
git add docs/CHANGELOG.md docs/ARCHITECTURE_AND_HANDOVER.md docs/superpowers/specs/2026-08-08-module-parity-design.md docs/superpowers/plans/2026-08-08-orientasi-pplg-module-parity.md
git commit -m "docs: hand over orientasi module parity release"
```

---

### Task 6: Security follow-up — atomic checkpoint reward claim

**Files:**
- Modify: `src/db/schema.ts`, `src/db/index.ts`
- Modify: `src/pages/api/gamification/claim-checkpoint.ts`
- Create: `tests/orientasi-checkpoint-atomicity.test.ts`
- Modify: parity design, architecture handover, dan changelog

- [x] Tambahkan focused guard terlebih dahulu dan saksikan gagal karena composite uniqueness belum ada (RED).
- [x] Deklarasikan unique key `(userId, lessonSlug, submissionType)` di Drizzle dan migrasi runtime idempoten yang membersihkan duplicate lama secara deterministik.
- [x] Ganti `SELECT` → `INSERT` dengan `onConflictDoNothing(...).returning(...)`; award XP hanya bila insert mengembalikan row.
- [x] Ganti XP read/modify/write dengan atomic upsert/increment.
- [x] Jalankan focused guard kembali hingga lulus (GREEN).
- [x] Jalankan suite Orientasi, parity guard, dan build; deploy production; smoke test HTTP 200/401; catat deployment aktual di report release.
