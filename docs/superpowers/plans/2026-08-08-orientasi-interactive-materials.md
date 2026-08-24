# Orientasi Interactive Materials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Menjadikan materi Modul Orientasi PPLG 02–16 sama interaktifnya dengan Modul 01 melalui aktivitas formatif unik per modul, tanpa mengubah alur keamanan atau substansi pembelajaran.

**Architecture:** Katalog TypeScript menyimpan dua aktivitas per slug kanonik Modul 02–16. Satu komponen Astro merender primitive explore, scenario, sequence, dan checklist dari konfigurasi tersebut, sedangkan reader memasangnya hanya pada jalur Modul 02–16 dan menjadikan Markdown sebagai bacaan rujukan. Checkpoint tetap satu-satunya gerbang XP/progres.

**Tech Stack:** Astro 7 SSR, Astro Content Collections, TypeScript, Tailwind CSS 3, Node built-in test runner.

## Global Constraints

- Katalog aktif tetap tepat 16 CANONICAL_ORIENTASI_SLUGS; HTML, SQL, dan OOP tetap di luar scope.
- Modul 01 serta InteractiveMaterialP1.astro tidak diubah.
- Aktivitas tidak memanggil API, tidak menulis localStorage, tidak memberi XP, dan tidak membuka tab LKPD.
- Gunakan tombol native, feedback teks, state keyboard, dan aria-live/aria-pressed.
- Gunakan dark-slate berkontras tinggi; dilarang memakai gradien neon atau blur dekoratif berlebihan.
- Semua hasil dicatat pada changelog dan handover.

---

### Task 1: Katalog aktivitas materi Orientasi

**Files:**
- Create: src/utils/orientasiInteractiveMaterials.ts
- Create: tests/orientasi-interactive-materials.test.ts

**Interfaces:**
- Produces getOrientasiInteractiveMaterial(slug: OrientasiSlug): InteractiveMaterial.
- InteractiveMaterial memiliki slug, eyebrow, title, summary, dan tepat dua activities.
- InteractiveActivity memiliki id, kind, title, instruction, items, dan feedback; kind hanya explore | scenario | sequence | checklist.

- [ ] **Step 1: Write the failing test**

~~~ts
test('each Orientasi module after Module 01 has two valid formative activities', async () => {
  const { CANONICAL_ORIENTASI_SLUGS } = await import('../src/utils/orientasiPplgPolicy.ts');
  const { getOrientasiInteractiveMaterial } = await import('../src/utils/orientasiInteractiveMaterials.ts');
  for (const slug of CANONICAL_ORIENTASI_SLUGS.slice(1)) {
    const material = getOrientasiInteractiveMaterial(slug);
    assert.equal(material.activities.length, 2);
    assert.ok(material.activities.every((activity) => ['explore', 'scenario', 'sequence', 'checklist'].includes(activity.kind)));
  }
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: node --experimental-strip-types --test tests/orientasi-interactive-materials.test.ts
Expected: FAIL because orientasiInteractiveMaterials.ts does not exist.

- [ ] **Step 3: Implement the catalog**

| Slug suffix | Activity 1 | Activity 2 |
|---|---|---|
| 02-profesi-peluang-karier | explore 8 profesi | sequence handoff tim produk |
| 03-ekosistem-industri-pplg | explore 5 ekosistem | scenario cocokkan ekosistem |
| 04-matriks-skill-jenjang-karier | explore matriks skill | sequence roadmap karier |
| 05-job-fair-kelas | checklist strategi booth | scenario pertanyaan wawancara |
| 06-rencana-minat-awal | checklist SMART | scenario langkah pertama |
| 07-mind-map-profesi-pplg | explore cabang mind map | checklist relasi node |
| 08-finalisasi-validasi-or01 | checklist audit evidence | sequence validasi file/akses |
| 09-app-audit-produk-digital | explore lensa audit | scenario temuan user journey |
| 10-ui-ux-fungsi-produk | explore UI/UX/fungsi | scenario evaluasi desain |
| 11-framework-review-6-komponen | explore enam komponen | sequence prioritas review |
| 12-latihan-analisis-anotasi-visual | explore CER | scenario evidence visual |
| 13-review-show-peer-feedback | scenario feedback konstruktif | sequence Sandwich Feedback |
| 14-finalisasi-dokumen-review | checklist standar dokumen | scenario tindakan kualitas |
| 15-pengumpulan-validasi-or02 | checklist kesiapan portfolio | sequence pengumpulan evidence |
| 16-rekap-skill-clinic-refleksi | explore peta capaian | scenario komitmen berikutnya |

Setiap item memuat label, detail, dan feedback berbahasa Indonesia yang berlandaskan Markdown modulnya.

- [ ] **Step 4: Run focused test to verify it passes**

Run: node --experimental-strip-types --test tests/orientasi-interactive-materials.test.ts
Expected: PASS, mencakup seluruh 15 modul.

- [ ] **Step 5: Commit**

~~~bash
git add src/utils/orientasiInteractiveMaterials.ts tests/orientasi-interactive-materials.test.ts
git commit -m "feat: add orientasi interactive material catalog"
~~~

### Task 2: Renderer aktivitas formatif yang aksesibel

**Files:**
- Create: src/components/modul/InteractiveModuleMaterial.astro
- Modify: tests/orientasi-interactive-materials.test.ts

**Interfaces:**
- Consumes lessonSlug, moduleTitle, dan getOrientasiInteractiveMaterial().
- Produces #interactive-module-material, dua data-activity-id, dan feedback aria-live="polite".

- [ ] **Step 1: Extend failing test**

~~~ts
const source = await readFile('src/components/modul/InteractiveModuleMaterial.astro', 'utf8');
assert.match(source, /aria-live="polite"/);
assert.match(source, /data-activity-id/);
assert.doesNotMatch(source, /localStorage|fetch\(/);
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: node --experimental-strip-types --test tests/orientasi-interactive-materials.test.ts
Expected: FAIL because renderer does not exist.

- [ ] **Step 3: Implement the renderer**

Render title/summary and exactly two cards. Explore membuka detail item terpilih; scenario dan sequence memberi feedback setelah satu pilihan; checklist men-toggle aria-pressed secara lokal. Scope selector ke root komponen dan pakai textContent untuk feedback. Jangan render kontrol submit, XP, API, storage, atau navigasi/gating.

- [ ] **Step 4: Run focused test to verify it passes**

Run: node --experimental-strip-types --test tests/orientasi-interactive-materials.test.ts
Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/components/modul/InteractiveModuleMaterial.astro tests/orientasi-interactive-materials.test.ts
git commit -m "feat: render interactive orientasi material activities"
~~~

### Task 3: Integrasikan reader dan parity guard

**Files:**
- Modify: src/pages/pembelajaran/[...slug].astro
- Modify: scripts/verify-orientasi-pplg-parity.mjs
- Modify: tests/orientasi-interactive-materials.test.ts

**Interfaces:**
- Reader memakai InteractiveModuleMaterial hanya saat isOrientasiModule && !isModul1.
- Markdown Modul 02–16 tetap berada pada details berlabel Bacaan Rujukan & Materi Lengkap.

- [ ] **Step 1: Extend failing test**

~~~ts
const reader = await readFile('src/pages/pembelajaran/[...slug].astro', 'utf8');
assert.match(reader, /isOrientasiModule && !isModul1/);
assert.match(reader, /<InteractiveModuleMaterial/);
assert.match(reader, /Bacaan Rujukan & Materi Lengkap/);
assert.match(reader, /<InteractiveMaterialP1 user=\{user\} \/>/);
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: node --experimental-strip-types --test tests/orientasi-interactive-materials.test.ts
Expected: FAIL because reader masih langsung merender Markdown untuk Modul 02–16.

- [ ] **Step 3: Integrate renderer and guard**

Import renderer. Pertahankan branch Modul 01 persis seperti semula. Untuk Modul 02–16, render Markdown pada details lalu renderer, dan jangan ubah checkpoint, LKPD, refleksi, KKTP, locked screen, atau event listener. Tambahkan parity assertion untuk branch reader dan 15 katalog aktivitas.

- [ ] **Step 4: Run focused test and parity guard**

Run: node --experimental-strip-types --test tests/orientasi-interactive-materials.test.ts && npm run verify:orientasi-parity
Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/pages/pembelajaran/[...slug].astro scripts/verify-orientasi-pplg-parity.mjs tests/orientasi-interactive-materials.test.ts
git commit -m "feat: add interactive material flow to orientasi modules"
~~~

### Task 4: Release verification, handover, and deploy

**Files:**
- Modify: docs/CHANGELOG.md
- Modify: docs/ARCHITECTURE_AND_HANDOVER.md
- Modify: docs/superpowers/specs/2026-08-08-orientasi-interactive-materials-design.md

- [ ] **Step 1: Run full verification**

Run: npm run test:orientasi && npm run verify:orientasi-parity && npm run build
Expected: all tests PASS, parity reports PASS, Astro build exits 0.

- [ ] **Step 2: Update handover**

Record activity catalog, non-authoritative/formative boundary, test counts, clean-checkout dependency fix, deployment ID/alias, and limitation that full production interaction needs a legitimate student session.

- [ ] **Step 3: Deploy and smoke test**

Run: npx vercel --prod --yes
Expected: READY and aliased to https://www.agunggumelarsaputra.com.

Check / and /pembelajaran return HTTP 200, public catalog still contains no HTML/SQL/OOP, and unauthenticated checkpoint POST returns 401. Do not create a fake student or bypass authentication.

- [ ] **Step 4: Commit documentation**

~~~bash
git add docs/CHANGELOG.md docs/ARCHITECTURE_AND_HANDOVER.md docs/superpowers/specs/2026-08-08-orientasi-interactive-materials-design.md
git commit -m "docs: hand over orientasi interactive materials release"
~~~

## Plan Self-Review

- Coverage: Tasks 1–3 cover catalog, renderer, accessibility, reader integration, and parity. Task 4 covers verification, handover, deployment, and the authenticated-session limit.
- No placeholders: each task names exact files, interfaces, RED/GREEN commands, and commit scope.
- Type consistency: InteractiveMaterial and InteractiveActivity start in Task 1, feed Task 2, and are rendered only through lessonSlug in Task 3.
