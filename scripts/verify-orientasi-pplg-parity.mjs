import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const contentDirectory = resolve(root, 'src/content/pembelajaran');
const reader = await readFile(resolve(root, 'src/pages/pembelajaran/[...slug].astro'), 'utf8');
const learningScene = await readFile(resolve(root, 'src/components/modul/OrientasiLearningScene.astro'), 'utf8');
const interactiveRenderer = await readFile(resolve(root, 'src/components/modul/InteractiveModuleMaterial.astro'), 'utf8');
const interactiveBehavior = await readFile(resolve(root, 'src/utils/interactiveModuleMaterialBehavior.ts'), 'utf8');
const checkpoints = await readFile(resolve(root, 'src/utils/moduleCheckpoints.ts'), 'utf8');
const lkpd = await readFile(resolve(root, 'src/components/modul/GeneralInteractiveLkpd.astro'), 'utf8');
const antiCopyPasteGuardian = await readFile(resolve(root, 'src/components/modul/AntiCopyPasteGuardian.astro'), 'utf8');
const checkpointRoute = await readFile(resolve(root, 'src/pages/api/gamification/claim-checkpoint.ts'), 'utf8');
const submissionRoute = await readFile(resolve(root, 'src/pages/api/submissions/save.ts'), 'utf8');
const completionRoute = await readFile(resolve(root, 'src/pages/api/progress/complete-lesson.ts'), 'utf8');
const { CANONICAL_ORIENTASI_SLUGS, getApprovedCheckpoint } = await import('../src/utils/orientasiPplgPolicy.ts');
const { getOrientasiInteractiveMaterial } = await import('../src/utils/orientasiInteractiveMaterials.ts');
const { getOrientasiLkpdSchema } = await import('../src/utils/orientasiLkpdSchemas.ts');
const expectedInteractiveActivityKinds = new Map([
  ['orientasi-pplg-02-profesi-peluang-karier', ['explore', 'sequence']],
  ['orientasi-pplg-03-ekosistem-industri-pplg', ['explore', 'scenario']],
  ['orientasi-pplg-04-matriks-skill-jenjang-karier', ['explore', 'sequence']],
  ['orientasi-pplg-05-job-fair-kelas', ['checklist', 'scenario']],
  ['orientasi-pplg-06-rencana-minat-awal', ['checklist', 'scenario']],
  ['orientasi-pplg-07-mind-map-profesi-pplg', ['explore', 'checklist']],
  ['orientasi-pplg-08-finalisasi-validasi-or01', ['checklist', 'sequence']],
  ['orientasi-pplg-09-app-audit-produk-digital', ['explore', 'scenario']],
  ['orientasi-pplg-10-ui-ux-fungsi-produk', ['explore', 'scenario']],
  ['orientasi-pplg-11-framework-review-6-komponen', ['explore', 'sequence']],
  ['orientasi-pplg-12-latihan-analisis-anotasi-visual', ['explore', 'scenario']],
  ['orientasi-pplg-13-review-show-peer-feedback', ['scenario', 'sequence']],
  ['orientasi-pplg-14-finalisasi-dokumen-review', ['checklist', 'scenario']],
  ['orientasi-pplg-15-pengumpulan-validasi-or02', ['checklist', 'sequence']],
  ['orientasi-pplg-16-rekap-skill-clinic-refleksi', ['explore', 'scenario']],
]);
const files = await readdir(contentDirectory);
const orientasi = files
  .filter((name) => /^orientasi-pplg-(0[1-9]|1[0-6])-.*\.md$/.test(name))
  .sort();

assert.equal(orientasi.length, 16, 'Harus ada tepat 16 Markdown Modul Orientasi PPLG.');
assert.deepEqual(orientasi.map((name) => name.replace(/\.md$/, '')), CANONICAL_ORIENTASI_SLUGS, 'Markdown Orientasi harus sama persis dengan katalog kanonik.');
assert.match(reader, /<InteractiveKnowledgeCheck/, 'Reader harus memasang checkpoint bersama.');
assert.match(reader, /<GeneralInteractiveLkpd/, 'Reader harus memasang LKPD generik untuk Modul 02–16.');
assert.match(reader, /\{isModul1 && \([\s\S]*data-reference-material[\s\S]*InteractiveMaterialP1/, 'Reader harus mempertahankan rujukan Modul 01 sebelum InteractiveMaterialP1.');
const module02Branch = reader.match(/\{isOrientasiModule && !isModul1 && \(([\s\S]*?)\)\}\s*<div class="space-y-4 pt-2" id="checkpoint-challenge-area">\s*<InteractiveKnowledgeCheck\b/)?.[1];
assert.ok(module02Branch, 'Cabang Modul 02–16 harus berakhir tepat pada batas checkpoint.');
assert.match(module02Branch, /<details\s+data-reference-material\b[\s\S]*?<Content\s*\/>[\s\S]*?<\/details>\s*<TeacherMessageCard\s+teacherMessage=\{orientasiMaterial!\.teacherMessage\}\s*\/>\s*<OrientasiLearningScene\s+lessonSlug=\{lessonSlug\}\s+moduleTitle=\{entry\.data\.title\}\s*\/>\s*<\/>\s*$/, 'Cabang Modul 02–16 harus menutup panel rujukan sebelum merender kartu guru dan scene.');
assert.doesNotMatch(module02Branch, /SmartMarkdownWrapper|InteractiveModuleMaterial/, 'Cabang Modul 02–16 tidak boleh memakai wrapper/renderer lama.');
assert.doesNotMatch(learningScene, /TeacherMessageCard|data-teacher-message/, 'Scene tidak boleh menduplikasi kartu pesan guru milik reader.');
assert.match(reader, /\{entry\.data\.teacherTip && \(!isOrientasiModule \|\| isModul1\) && \(/, 'teacherTip lama hanya boleh tampil pada Modul 01 dan rute non-Orientasi.');
assert.match(reader, /<InteractiveReflectionForm[\s\S]*moduleTitle=\{entry\.data\.title\}/, 'Refleksi harus menerima judul modul.');
assert.match(reader, /id="btn-complete-lesson"/, 'Reader harus menyediakan tombol tuntas.');
assert.match(reader, /<section id="panel-refleksi"[\s\S]*id="btn-complete-lesson"/, 'Tombol tuntas hanya berada di panel refleksi.');
assert.match(reader, /data-init-checkpoint=/, 'Reader harus menerima state checkpoint dari server.');
assert.match(reader, /data-init-lkpd=/, 'Reader harus menerima state LKPD dari server.');
assert.match(reader, /window\.addEventListener\('checkpoint-passed'/, 'Checkpoint harus membuka LKPD.');
assert.match(reader, /window\.addEventListener\('lkpd-submitted'/, 'LKPD harus membuka refleksi.');
assert.match(reader, /isCurrentModuleLocked/, 'Reader harus memeriksa gating modul.');
assert.match(reader, /user\?\.role !== 'admin'/, 'Admin harus mempertahankan bypass gating.');
assert.match(reader, /selectCanonicalOrientasiModules\(allModules\)/, 'Sidebar, prerequisite, next, dan progress harus memakai katalog 16 modul kanonik.');
assert.doesNotMatch(reader, /localStorage\.getItem\(`ags_(checkpoint|lkpd|reflection)_/, 'localStorage tidak boleh mengotorisasi tahapan belajar.');
assert.match(checkpointRoute, /getApprovedCheckpoint\(lessonSlug\)/, 'Checkpoint harus memvalidasi slug dan reward dari katalog server.');
assert.doesNotMatch(checkpointRoute, /Number\(xpReward\)|xpReward\s*=\s*10/, 'Checkpoint tidak boleh mempercayai reward dari klien.');
for (const route of [checkpointRoute, submissionRoute, completionRoute]) {
  assert.match(route, /authorizeOrientasiAction\(/, 'Setiap endpoint mutasi harus menjalankan otorisasi alur Orientasi di server.');
  assert.match(route, /getOrientasiServerState\(/, 'Setiap endpoint mutasi harus membaca state progres/enrollment dari server.');
}
assert.doesNotMatch(antiCopyPasteGuardian, /'groupmembers'|'studentgroup'|'token'|'tokencode'|'email'|'password'|'search'|'query'|'evidenceurl'|'repositoryurl'|'repourl'/, 'Hanya identitas siswa dan evidence yang digunakan form boleh diizinkan di dalam form pembelajaran.');
assert.doesNotMatch(antiCopyPasteGuardian, /el instanceof HTMLInputElement && el\.type === 'url'/, 'Tidak semua input URL boleh menerima paste.');
assert.match(antiCopyPasteGuardian, /'studentname'[\s\S]*'studentnis'[\s\S]*'studentclass'[\s\S]*'submissiondate'[\s\S]*'driveurl'[\s\S]*'evidencedriveurl'/, 'Identitas siswa dan URL evidence harus tetap diizinkan.');
assert.match(antiCopyPasteGuardian, /const isLearningTask = [\s\S]*if \(!isLearningTask\) \{[\s\S]*return true;[\s\S]*return false;/, 'Jawaban LKPD dan refleksi yang bukan pengecualian harus tetap diblokir.');

for (const filename of orientasi.slice(1)) {
  const slug = filename.replace(/\.md$/, '');
  assert.ok(checkpoints.includes(`'${slug}'`), `Checkpoint belum dikonfigurasi untuk ${slug}.`);
  assert.ok(lkpd.includes(`'${slug}'`), `Panduan LKPD belum dikonfigurasi untuk ${slug}.`);
}

assert.equal(getApprovedCheckpoint('slug-arbitrer'), null, 'Slug arbitrer harus ditolak policy checkpoint.');
assert.equal(getApprovedCheckpoint(CANONICAL_ORIENTASI_SLUGS[1]).xpReward, 15, 'Reward checkpoint harus berasal dari policy server.');
assert.equal(getOrientasiLkpdSchema(CANONICAL_ORIENTASI_SLUGS[1]).sections[0].fields.length, 12, 'Modul 02 harus mempertahankan tabel tiga profesi.');
assert.equal(getOrientasiLkpdSchema(CANONICAL_ORIENTASI_SLUGS[11]).sections.length, 2, 'Modul 12 harus mempertahankan dua latihan CER screenshot.');

assert.deepEqual([...expectedInteractiveActivityKinds.keys()], CANONICAL_ORIENTASI_SLUGS.slice(1), 'Katalog aktivitas harus mencakup tepat Modul 02–16 kanonik.');
for (const slug of CANONICAL_ORIENTASI_SLUGS.slice(1)) {
  const material = getOrientasiInteractiveMaterial(slug);
  assert.equal(material.activities.length, 2, `${slug} harus memiliki tepat dua aktivitas interaktif.`);
  assert.deepEqual(material.activities.map((activity) => activity.kind), expectedInteractiveActivityKinds.get(slug), `${slug} harus mempertahankan pasangan jenis aktivitas.`);
  assert.equal(new Set(material.activities.map((activity) => activity.id)).size, 2, `${slug} harus memiliki id aktivitas unik.`);
  for (const activity of material.activities) {
    assert.ok(activity.id.trim() && activity.title.trim() && activity.instruction.trim() && activity.feedback.trim(), `${slug} harus memiliki data aktivitas non-kosong.`);
    assert.ok(activity.items.length > 0, `${slug} harus memiliki item aktivitas.`);
    assert.equal(new Set(activity.items.map((item) => item.label)).size, activity.items.length, `${slug} harus memiliki label item unik.`);
    for (const item of activity.items) {
      assert.ok(item.label.trim() && item.detail.trim() && item.feedback.trim(), `${slug} harus memiliki item lengkap.`);
    }
    if (activity.kind === 'sequence') {
      assert.deepEqual(activity.correctOrder, activity.items.map((item) => item.label), `${slug} harus menyimpan urutan jawaban eksplisit.`);
    }
  }
}
assert.match(interactiveRenderer, /aria-pressed="false"/, 'Renderer harus memberi state awal aria-pressed false.');
assert.match(interactiveRenderer, /interactive-material__item-detail">\{item\.detail\}/, 'Renderer harus menampilkan detail setiap item.');
assert.match(interactiveRenderer, /data-correct-order/, 'Renderer urutan harus menerima urutan jawaban eksplisit.');
assert.match(interactiveRenderer, /data-sequence-action="up"[\s\S]*data-sequence-action="down"/, 'Renderer urutan harus memiliki kontrol pindah keyboard-accessible.');
assert.match(interactiveRenderer, /getSequencePresentationItems\(activity\)/, 'Renderer urutan harus menyajikan item dalam urutan latihan yang dikonfigurasi.');
assert.match(interactiveRenderer, /Periksa urutan[\s\S]*initializeInteractiveModuleMaterial/, 'Renderer urutan harus memasang perilaku validasi lokal.');
assert.match(interactiveBehavior, /Urutan sudah tepat[\s\S]*Urutan belum tepat/, 'Perilaku urutan harus memvalidasi jawaban dengan umpan balik jelas.');
assert.match(interactiveRenderer, /explore: 'Eksplorasi'[\s\S]*scenario: 'Pilih skenario'[\s\S]*sequence: 'Susun urutan'[\s\S]*checklist: 'Daftar cek'/, 'Label setiap jenis aktivitas harus dilokalkan.');

for (const filename of orientasi.slice(1)) {
  const slug = filename.replace(/\.md$/, '');
  const checkpointStart = checkpoints.indexOf(`'${slug}'`);
  const checkpointBlock = checkpoints.slice(checkpointStart, checkpoints.indexOf('\n  },', checkpointStart));
  assert.match(checkpointBlock, /stage1Match:/, `${slug} harus memiliki ronde Puzzle Match.`);
  assert.match(checkpointBlock, /stage2Detective:/, `${slug} harus memiliki ronde Mitos vs Fakta.`);
  assert.match(checkpointBlock, /stage3Speed:/, `${slug} harus memiliki ronde Skenario Cepat.`);
  assert.match(checkpointBlock, /xpReward:/, `${slug} harus memiliki reward XP.`);
}

for (const filename of orientasi.slice(1)) {
  const source = await readFile(resolve(contentDirectory, filename), 'utf8');
  for (const field of ['title:', 'description:', 'category:', 'order:', 'duration:', 'tags:']) {
    assert.ok(source.includes(field), `${filename} tidak memiliki frontmatter ${field}`);
  }
  assert.match(source, /Langkah Selanjutnya|Aktivitas Belajar/, `${filename} harus memandu aktivitas lanjutan siswa.`);
}

console.log('Orientasi PPLG parity guard: PASS');
