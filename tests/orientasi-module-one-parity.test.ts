import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Window } from 'happy-dom';

import { getOrientasiInteractiveMaterial } from '../src/utils/orientasiInteractiveMaterials.ts';
import { CANONICAL_ORIENTASI_SLUGS } from '../src/utils/orientasiPplgPolicy.ts';
import { renderAstroComponent } from './helpers/renderAstroComponent.ts';

const readerSource = await readFile(
  new URL('../src/pages/pembelajaran/[...slug].astro', import.meta.url),
  'utf8',
);
const learningSceneSource = await readFile(
  new URL('../src/components/modul/OrientasiLearningScene.astro', import.meta.url),
  'utf8',
);

const expectedTopicMarkers = {
  'orientasi-pplg-02-profesi-peluang-karier': { hero: ['delapan profesi', 'handoff'], scenes: ['Frontend Developer', 'Product Manager', 'QA Engineer'] },
  'orientasi-pplg-03-ekosistem-industri-pplg': { hero: ['startup', 'software house', 'enterprise', 'freelancer', 'tim internal'], scenes: ['Startup', 'Software House', 'Freelancer'] },
  'orientasi-pplg-04-matriks-skill-jenjang-karier': { hero: ['hard skill', 'soft skill', 'roadmap'], scenes: ['Hard skill', 'Soft skill', 'Mid/Senior/Lead'] },
  'orientasi-pplg-05-job-fair-kelas': { hero: ['booth', 'pertanyaan wawancara'], scenes: ['Tech stack', 'Tugas harian'] },
  'orientasi-pplg-06-rencana-minat-awal': { hero: ['SMART', 'tiga tahun'], scenes: ['Specific', 'Minat frontend'] },
  'orientasi-pplg-07-mind-map-profesi-pplg': { hero: ['node', 'tools', 'relasi'], scenes: ['Profesi pusat', 'Garis penghubung'] },
  'orientasi-pplg-08-finalisasi-validasi-or01': { hero: ['PDF', 'publik', 'OR-01'], scenes: ['Public Viewer', 'Uji link'] },
  'orientasi-pplg-09-app-audit-produk-digital': { hero: ['target pengguna', 'fungsi utama', 'UI/UX', 'kelebihan', 'kekurangan'], scenes: ['Fungsi utama', 'Keunggulan', 'Kekurangan'] },
  'orientasi-pplg-10-ui-ux-fungsi-produk': { hero: ['UI', 'UX', 'fungsi'], scenes: ['Teks tombol sulit dibaca', 'Pembayaran gagal diproses'] },
  'orientasi-pplg-11-framework-review-6-komponen': { hero: ['enam komponen', 'prioritas temuan'], scenes: ['Identitas produk', 'Kumpulkan bukti'] },
  'orientasi-pplg-12-latihan-analisis-anotasi-visual': { hero: ['Claim–Evidence–Reasoning', 'positif', 'negatif'], scenes: ['Alur berhasil', 'Pesan error'] },
  'orientasi-pplg-13-review-show-peer-feedback': { hero: ['apresiasi', 'saran', 'Sandwich Feedback'], scenes: ['Apresiasi spesifik', 'Kritik solutif'] },
  'orientasi-pplg-14-finalisasi-dokumen-review': { hero: ['standar', 'layout', 'rekomendasi'], scenes: ['Cover resmi', 'Rekomendasi solutif'] },
  'orientasi-pplg-15-pengumpulan-validasi-or02': { hero: ['OR-02', 'tautan publik', 'evidence'], scenes: ['Atur akses', 'Salin link'] },
  'orientasi-pplg-16-rekap-skill-clinic-refleksi': { hero: ['Skill Passport', 'Skill Clinic', 'refleksi'], scenes: ['Level 2', 'Semester genap'] },
} as const;

test('reader keeps Module 01 intact and couples the Module 02–16 reference-to-checkpoint order', () => {
  assert.match(
    readerSource,
    /\{isModul1 && \([\s\S]*data-reference-material[\s\S]*InteractiveMaterialP1/,
  );

  const module02Branch = readerSource.match(
    /\{isOrientasiModule && !isModul1 && \(([\s\S]*?)\)\}\s*<div class="space-y-4 pt-2" id="checkpoint-challenge-area">\s*<InteractiveKnowledgeCheck\b/,
  )?.[1];
  assert.ok(module02Branch, 'Reader must expose one coupled Module 02–16 branch ending at the checkpoint boundary.');
  assert.match(
    module02Branch,
    /<details\s+data-reference-material\b[\s\S]*?<Content\s*\/>[\s\S]*?<\/details>\s*<TeacherMessageCard\s+lessonSlug=\{lessonSlug\}\s+teacherMessage=\{orientasiMaterial!\.teacherMessage\}\s*\/>\s*<OrientasiLearningScene\s+lessonSlug=\{lessonSlug\}\s+moduleTitle=\{entry\.data\.title\}\s+moduleDuration=\{entry\.data\.duration\}\s*\/>\s*<\/>\s*$/,
  );
  assert.doesNotMatch(module02Branch, /SmartMarkdownWrapper|InteractiveModuleMaterial/);
  assert.doesNotMatch(learningSceneSource, /TeacherMessageCard|data-teacher-message/);
});

test('every Module 02–16 owns factual hero, teacher message, and two contextual scenes', () => {
  assert.deepEqual(Object.keys(expectedTopicMarkers), CANONICAL_ORIENTASI_SLUGS.slice(1));

  for (const slug of CANONICAL_ORIENTASI_SLUGS.slice(1)) {
    const material = getOrientasiInteractiveMaterial(slug);
    const markers = expectedTopicMarkers[slug];
    const heroText = `${material.hero.context} ${material.hero.objective}`.toLocaleLowerCase('id-ID');
    const sceneText = material.scenes
      .flatMap((scene) => [scene.title, scene.instruction, scene.feedback, ...scene.items.flatMap((item) => [item.label, item.detail, item.feedback])])
      .join(' ')
      .toLocaleLowerCase('id-ID');

    assert.ok(material.hero.context.length > 24, `${slug}: hero context`);
    assert.ok(material.hero.objective.length > 24, `${slug}: hero objective`);
    assert.ok(material.teacherMessage.message.length > 40, `${slug}: teacher message`);
    assert.equal(material.scenes.length, 2, `${slug}: scene count`);
    for (const marker of markers.hero) {
      assert.ok(heroText.includes(marker.toLocaleLowerCase('id-ID')), `${slug}: hero marker ${marker}`);
    }
    for (const marker of markers.scenes) {
      assert.ok(sceneText.includes(marker.toLocaleLowerCase('id-ID')), `${slug}: scene marker ${marker}`);
    }
    if (slug === 'orientasi-pplg-04-matriks-skill-jenjang-karier') {
      assert.equal(material.hero.sprint, 'Sprint 1 · Pertemuan 4 & 5', `${slug}: source sprint label`);
    }

    for (const scene of material.scenes) {
      assert.ok(scene.title.trim(), `${slug}: scene title`);
      assert.ok(scene.instruction.trim(), `${slug}: scene instruction`);
      assert.ok(scene.feedback.trim(), `${slug}: scene feedback`);
      assert.ok(scene.items.length > 0, `${slug}: scene items`);
      assert.ok(
        scene.items.every((item) => item.label.trim() && item.detail.length > 12 && item.feedback.trim()),
        `${slug}: contextual scene items`,
      );
      if (scene.kind === 'sequence') {
        assert.deepEqual(scene.correctOrder, scene.items.map((item) => item.label), `${slug}: sequence order`);
      }
    }
  }
});

test('active Astro renderer exposes duration, item-specific controls, local status, sequence controls, and no progression side effects', async () => {
  const componentUrl = new URL('../src/components/modul/OrientasiLearningScene.astro', import.meta.url);
  const sequenceRender = await renderAstroComponent(componentUrl, {
    lessonSlug: 'orientasi-pplg-02-profesi-peluang-karier',
    moduleTitle: 'Profesi dan Peluang Karier',
    moduleDuration: '2 JP (90 Menit)',
  });
  const checklistRender = await renderAstroComponent(componentUrl, {
    lessonSlug: 'orientasi-pplg-06-rencana-minat-awal',
    moduleTitle: 'Rencana Minat Awal',
    moduleDuration: '3 JP (135 Menit)',
  });
  const window = new Window();
  const document = window.document;
  document.body.innerHTML = sequenceRender.html + checklistRender.html;

  const roots = document.querySelectorAll<HTMLElement>('[data-learning-scene]');
  assert.equal(roots.length, 2);
  assert.equal(roots[0].querySelector('[data-module-duration]')?.textContent, '2 JP (90 Menit)');
  assert.equal(roots[1].querySelector('[data-module-duration]')?.textContent, '3 JP (135 Menit)');

  for (const root of roots) {
    for (const card of root.querySelectorAll<HTMLElement>('[data-activity-id]')) {
      assert.ok(card.querySelector(':scope > [role="status"][aria-live="polite"]'));
    }
    for (const control of root.querySelectorAll<HTMLButtonElement>('.interactive-material__choice')) {
      assert.equal(control.getAttribute('aria-pressed'), 'false');
      assert.ok(control.dataset.label);
      assert.ok(control.textContent.trim().endsWith(control.dataset.label));
      assert.match(control.textContent.trim(), /^(Lihat kaitan|Tandai) /);
    }
  }

  const sequence = roots[0].querySelector<HTMLElement>('[data-sequence]');
  assert.ok(sequence?.dataset.correctOrder);
  assert.ok(sequence.querySelector('[data-sequence-list]'));
  assert.ok(sequence.querySelector('[data-sequence-action="up"]'));
  assert.ok(sequence.querySelector('[data-sequence-action="down"]'));
  assert.ok(sequence.querySelector('.interactive-material__validate-sequence'));

  const activeArtifact = `${sequenceRender.source}\n${sequenceRender.html}`;
  assert.doesNotMatch(activeArtifact, /fetch\s*\(|localStorage|sessionStorage|\/api\/|\bXP\b|href=|data-switch-tab|checkpoint|progress|enrollment|locked/i);
  window.close();
});

test('TeacherMessageCard and learning-scene relationships use lesson-specific unique IDs', async () => {
  const teacherUrl = new URL('../src/components/modul/TeacherMessageCard.astro', import.meta.url);
  const sceneUrl = new URL('../src/components/modul/OrientasiLearningScene.astro', import.meta.url);
  const slugs = [
    'orientasi-pplg-02-profesi-peluang-karier',
    'orientasi-pplg-03-ekosistem-industri-pplg',
  ] as const;
  const rendered = await Promise.all(slugs.flatMap((lessonSlug) => [
    renderAstroComponent(teacherUrl, {
      lessonSlug,
      teacherMessage: getOrientasiInteractiveMaterial(lessonSlug).teacherMessage,
    }),
    renderAstroComponent(sceneUrl, {
      lessonSlug,
      moduleTitle: getOrientasiInteractiveMaterial(lessonSlug).title,
      moduleDuration: '2 JP (90 Menit)',
    }),
  ]));
  const window = new Window();
  const document = window.document;
  document.body.innerHTML = rendered.map(({ html }) => html).join('');

  const ids = [...document.querySelectorAll<HTMLElement>('[id]')].map((element) => element.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const labelledElement of document.querySelectorAll<HTMLElement>('[aria-labelledby]')) {
    const labelledBy = labelledElement.getAttribute('aria-labelledby');
    assert.ok(labelledBy && document.getElementById(labelledBy), labelledBy ?? 'missing aria-labelledby');
  }
  window.close();
});

test('Module 05 scenes implement an interest-based booth route and distinguish strong from weak interview questions', () => {
  const material = getOrientasiInteractiveMaterial('orientasi-pplg-05-job-fair-kelas');
  const [boothRoute, interviewQuality] = material.scenes;
  const boothText = [boothRoute.title, boothRoute.instruction, ...boothRoute.items.flatMap((entry) => [entry.label, entry.detail, entry.feedback])].join(' ').toLocaleLowerCase('id-ID');
  const interviewText = [interviewQuality.title, interviewQuality.instruction, ...interviewQuality.items.flatMap((entry) => [entry.label, entry.detail, entry.feedback])].join(' ').toLocaleLowerCase('id-ID');

  assert.equal(boothRoute.kind, 'scenario');
  assert.match(boothText, /minat/);
  assert.match(boothText, /tujuan/);
  assert.ok(boothRoute.items.every((entry) => /booth/i.test(`${entry.detail} ${entry.feedback}`)));
  assert.match(interviewText, /kuat|berkualitas/);
  assert.match(interviewText, /lemah|kurang spesifik/);
  assert.ok(interviewQuality.items.some((entry) => /kuat|berkualitas/i.test(entry.feedback)));
  assert.ok(interviewQuality.items.some((entry) => /lemah|kurang spesifik/i.test(entry.feedback)));
});
