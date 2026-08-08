# Paritas Modul 01 untuk Modul 02–16 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Menjadikan Modul 02–16 memiliki urutan, informasi, dan kualitas interaksi setara Modul 01 tanpa menggenerikkan materi atau mengubah kontrak progres.

**Architecture:** Reader mempertahankan Markdown sebagai rujukan terlipat di atas, lalu merender pesan guru dan shell scene pembelajaran khusus Modul 02–16 sebelum Quest checkpoint. Katalog typed menyimpan hero, pesan guru, dan fakta scene per modul; renderer Astro hanya mengelola interaksi DOM lokal dan memakai perilaku urutan yang sudah diuji.

**Tech Stack:** Astro server rendering, TypeScript, Tailwind utility classes/CSS scoped, Node test runner, Happy DOM, Astro Content Collections, Vercel.

## Global Constraints

- Modul 01 tetap tidak berubah secara fungsional dan menjadi baseline visual/pedagogis.
- Urutan Modul 02–16 wajib: rujukan details → pesan Guru Pengampu RPL → hero/scene → Quest checkpoint.
- Semua fakta, contoh, dan feedback harus berasal dari Markdown Modul 02–16 terkait; jangan menulis materi generik atau klaim eksternal baru.
- Scene formatif tidak boleh memanggil API, menyimpan ke browser/database, memberi XP, membuka tab, atau mengubah gating.
- Gunakan dark slate kontras tinggi; dilarang gradien neon, blur dekoratif, dan glassmorphism.
- Aksesibilitas wajib memakai tombol native, focus-visible, label Indonesia yang jelas, dan aria-live untuk feedback.
- Pertahankan berkas pengguna yang tidak terkait di root: AGENTS.md, src/components/modul/InteractiveLkpdP1.astro, dan clean-md.cjs.

---

## File structure

| File | Responsibility |
|---|---|
| src/utils/orientasiInteractiveMaterials.ts | Data faktual hero, pesan guru, dan scene dua aktivitas untuk 15 modul. |
| src/components/modul/OrientasiLearningScene.astro | Shell hero dan visual scene Modul 02–16, memakai katalog tanpa API/persistence. |
| src/components/modul/TeacherMessageCard.astro | Kartu pesan Guru Pengampu RPL yang berdiri di luar Markdown rujukan. |
| src/pages/pembelajaran/[...slug].astro | Urutan reader rujukan → pesan guru → hero/scene → Quest. |
| src/utils/interactiveModuleMaterialBehavior.ts | Kontrak DOM lokal yang tetap dipakai untuk pilihan, checklist, dan sequence. |
| tests/orientasi-module-one-parity.test.ts | Policy/struktur/data regresi untuk paritas Modul 01. |
| tests/orientasi-interactive-materials-dom.test.ts | Behavior DOM pilihan dan sequence tanpa browser/network. |
| scripts/verify-orientasi-pplg-parity.mjs | Guard produksi atas urutan reader dan batas formatif. |
| docs/CHANGELOG.md, docs/ARCHITECTURE_AND_HANDOVER.md | Rekam perubahan, uji siswa sah, deployment, dan data uji. |

### Task 1: Model pembelajaran faktual per Modul 02–16

**Files:**
- Modify: src/utils/orientasiInteractiveMaterials.ts
- Create: tests/orientasi-module-one-parity.test.ts

**Consumes:** CANONICAL_ORIENTASI_SLUGS, OrientasiSlug, serta Markdown src/content/pembelajaran/orientasi-pplg-02-*.md sampai 16-*.md.

**Produces:** getOrientasiInteractiveMaterial(lessonSlug) yang mengembalikan hero, teacherMessage, dan dua scenes berisi label, detail, feedback, serta correctOrder bila tipe scene sequence.

- [ ] **Step 1: Write the failing test**

~~~ts
test('every Module 02–16 owns factual hero, teacher message, and two contextual scenes', () => {
  for (const slug of CANONICAL_ORIENTASI_SLUGS.slice(1)) {
    const material = getOrientasiInteractiveMaterial(slug);
    assert.ok(material.hero.context.length > 24);
    assert.ok(material.teacherMessage.message.length > 40);
    assert.equal(material.scenes.length, 2);
    assert.ok(material.scenes.every((scene) => scene.items.every((item) => item.detail.length > 12)));
  }
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: node --experimental-strip-types --test tests/orientasi-module-one-parity.test.ts
Expected: FAIL karena hero, teacherMessage, atau scenes belum ada pada katalog.

- [ ] **Step 3: Write minimal implementation**

~~~ts
type LearningHero = { code: string; sprint: string; context: string; objective: string };
type TeacherMessage = { title: 'Pesan Guru Pengampu RPL'; message: string; signature: string };
type LearningScene = {
  id: string; kind: 'explore' | 'scenario' | 'sequence' | 'checklist';
  title: string; instruction: string; feedback: string;
  items: Array<{ label: string; detail: string; feedback: string }>;
  correctOrder?: string[];
};
~~~

Isi data dengan peta berikut, memakai istilah yang telah ada dalam Markdown:

~~~text
02: delapan profesi/output kerja; handoff requirement→UI/UX→frontend/backend→QA
03: startup, software house, enterprise, freelancer, tim internal; pilih konteks skenario
04: hard/soft skill dan jenjang; roadmap kesiapan karier
05: booth profesi dan pertanyaan wawancara; prioritas eksplorasi
06: SMART dan langkah awal rencana tiga tahun
07: node profesi/tools/relasi; audit mind map
08: akses publik, format evidence, validasi OR-01
09: target user, fungsi, UI/UX, kelebihan/kekurangan; lensa App Audit
10: UI, UX, fungsionalitas; perbandingan aplikasi
11: enam komponen framework review; prioritas temuan
12: Claim, Evidence, Reasoning; bukti screenshot positif/negatif
13: apresiasi, saran, sandwich feedback; urutan penyampaian
14: standar dokumen, layout, rekomendasi; tindakan quality finding
15: evidence OR-02, tautan publik, kelengkapan portfolio; prosedur validasi
16: level Skill Passport, Skill Clinic, refleksi; komitmen semester berikutnya
~~~

- [ ] **Step 4: Run test to verify it passes**

Run: node --experimental-strip-types --test tests/orientasi-module-one-parity.test.ts
Expected: PASS dan semua 15 slug memiliki data non-generik/valid.

- [ ] **Step 5: Commit**

~~~bash
git add src/utils/orientasiInteractiveMaterials.ts tests/orientasi-module-one-parity.test.ts
git commit -m "feat: add factual Orientasi learning scenes"
~~~

### Task 2: Shell scene dan kartu pesan guru

**Files:**
- Create: src/components/modul/TeacherMessageCard.astro
- Create: src/components/modul/OrientasiLearningScene.astro
- Modify: src/utils/interactiveModuleMaterialBehavior.ts
- Modify: tests/orientasi-interactive-materials-dom.test.ts

**Consumes:** TeacherMessage dan LearningScene Task 1 serta getSequencePresentationItems().

**Produces:** TeacherMessageCard dan OrientasiLearningScene, keduanya bebas persistence; initializeInteractiveModuleMaterial(root) tetap menghidupkan pilihan/sequence secara scoped.

- [ ] **Step 1: Write the failing test**

~~~ts
test('scene feedback stays local and teacher message is not part of reference markup', async () => {
  const root = renderSceneFixture();
  initializeInteractiveModuleMaterial(root);
  root.querySelector<HTMLButtonElement>('[data-label="Frontend Developer"]')!.click();
  assert.match(root.querySelector('[role="status"]')!.textContent!, /Frontend/);
  assert.equal(root.querySelector('[data-teacher-message]')!.closest('details'), null);
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: node --experimental-strip-types --test tests/orientasi-interactive-materials-dom.test.ts
Expected: FAIL karena marker kartu guru/shell belum dirender.

- [ ] **Step 3: Write minimal implementation**

~~~astro
<!-- TeacherMessageCard.astro -->
<aside data-teacher-message aria-labelledby="teacher-message-title" class="teacher-message-card">
  <p>👨‍🏫 Pesan Guru Pengampu RPL</p>
  <h2 id="teacher-message-title">{message.title}</h2>
  <p>{message.message}</p>
  <p>{message.signature}</p>
</aside>
~~~

~~~astro
<!-- OrientasiLearningScene.astro -->
<section data-learning-scene class="learning-scene" aria-labelledby="learning-scene-title">
  <header><!-- code, sprint, context, h2 title, objective --></header>
  <div role="status" aria-live="polite"></div>
  <!-- render cards/sequence from material.scenes; use native buttons and data-* -->
</section>
~~~

Gunakan kelas scoped yang memberi hero berlapis, informasi mudah dipindai, ikon fungsional, area klik cukup, dan state selected; jangan memasukkan gradient/blur. Detail tiap item selalu terlihat sebelum pemilihan; feedback muncul setelah interaksi.

- [ ] **Step 4: Run test to verify it passes**

Run: node --experimental-strip-types --test tests/orientasi-interactive-materials-dom.test.ts
Expected: PASS untuk pilihan, detail, live feedback, urutan, boundary, validasi salah/benar.

- [ ] **Step 5: Commit**

~~~bash
git add src/components/modul/TeacherMessageCard.astro src/components/modul/OrientasiLearningScene.astro src/utils/interactiveModuleMaterialBehavior.ts tests/orientasi-interactive-materials-dom.test.ts
git commit -m "feat: render rich Orientasi learning scenes"
~~~

### Task 3: Integrasi reader dengan urutan Modul 01

**Files:**
- Modify: src/pages/pembelajaran/[...slug].astro
- Modify: tests/orientasi-module-one-parity.test.ts
- Modify: scripts/verify-orientasi-pplg-parity.mjs

**Consumes:** TeacherMessageCard, OrientasiLearningScene, dan katalog Task 1.

**Produces:** Reader yang mempertahankan Modul 01 namun memastikan Modul 02–16 memiliki urutan rujukan → pesan guru → scene → checkpoint.

- [ ] **Step 1: Write the failing test/guard**

~~~ts
assert.match(readerSource, /isOrientasiModule && !isModul1[\\s\\S]*<details[\\s\\S]*TeacherMessageCard[\\s\\S]*OrientasiLearningScene[\\s\\S]*InteractiveKnowledgeCheck/);
assert.doesNotMatch(readerSource, /isOrientasiModule && !isModul1[\\s\\S]*<SmartMarkdownWrapper>/);
~~~

- [ ] **Step 2: Run test/guard to verify it fails**

Run: npm run verify:orientasi-parity
Expected: FAIL karena reader masih memasang scene lama sebelum panel rujukan.

- [ ] **Step 3: Write minimal implementation**

~~~astro
{isOrientasiModule && !isModul1 && (
  <>
    <details data-reference-material><!-- Content Markdown --></details>
    <TeacherMessageCard message={material.teacherMessage} />
    <OrientasiLearningScene lessonSlug={lessonSlug} moduleTitle={entry.data.title} />
  </>
)}
~~~

Pastikan teacherTip header lama tidak menduplikasi pesan untuk Modul 02–16, tetapi Modul 01/non-Orientasi mempertahankan perilaku lama. Hapus pemakaian renderer lama hanya setelah seluruh import dan test berpindah.

- [ ] **Step 4: Run test/guard to verify it passes**

Run: node --experimental-strip-types --test tests/orientasi-module-one-parity.test.ts && npm run verify:orientasi-parity
Expected: PASS, termasuk urutan tepat dan batas formatif.

- [ ] **Step 5: Commit**

~~~bash
git add src/pages/pembelajaran/[...slug].astro tests/orientasi-module-one-parity.test.ts scripts/verify-orientasi-pplg-parity.mjs
git commit -m "feat: align Orientasi reader flow with Module 01"
~~~

### Task 4: Verifikasi, release, dan handover

**Files:**
- Modify: docs/CHANGELOG.md
- Modify: docs/ARCHITECTURE_AND_HANDOVER.md
- Modify: docs/superpowers/specs/2026-08-08-orientasi-pplg-module-one-parity-design.md

**Consumes:** Hasil Tasks 1–3 dan izin eksplisit pemilik untuk memakai akun siswa uji yang sudah enrollment.

**Produces:** Bukti test/deploy, hasil uji sesi siswa, dan catatan data uji sebelum rilis Senin.

- [ ] **Step 1: Run code validation**

~~~bash
npm run test:orientasi
npm run verify:orientasi-parity
npm run build
git -c core.whitespace=cr-at-eol diff --check
~~~

Expected: seluruh test PASS, parity PASS, Astro build exit 0, dan tidak ada whitespace selain CRLF policy workspace.

- [ ] **Step 2: Deploy canonical production**

~~~bash
npx vercel --prod --yes
npx vercel inspect <deployment-id> --json
~~~

Expected: readyState READY dan alias www.agunggumelarsaputra.com.

- [ ] **Step 3: Test factually with permitted student account**

1. Login dengan akun yang diberi pemilik dan pastikan enrollment Orientasi aktif.
2. Buka Modul 01 lalu Modul 02 setelah prasyarat diselesaikan menggunakan isian uji yang wajar dan jelas sebagai data test.
3. Periksa visual: reference di atas, pesan guru di luar reference, hero/scene terbaca, detail/feedback bekerja, Quest tetap satu-satunya pembuka Tab 2.
4. Catat slug, jenis data uji, XP/progres yang berubah, dan apakah perlu dibersihkan sebelum rilis Senin.
5. Logout setelah pengujian; jangan gunakan akun pihak lain atau bypass akses.

- [ ] **Step 4: Update documentation**

Catat scene per modul, hasil test/build, deployment ID/URL/alias, smoke public (200/302/401), hasil student test, serta data yang perlu dibersihkan bila ada.

- [ ] **Step 5: Commit**

~~~bash
git add docs/CHANGELOG.md docs/ARCHITECTURE_AND_HANDOVER.md docs/superpowers/specs/2026-08-08-orientasi-pplg-module-one-parity-design.md
git commit -m "docs: hand over Module 01 parity release"
~~~

