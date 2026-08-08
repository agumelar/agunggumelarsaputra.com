import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { CANONICAL_ORIENTASI_SLUGS } from '../src/utils/orientasiPplgPolicy.ts';
import { getOrientasiInteractiveMaterial } from '../src/utils/orientasiInteractiveMaterials.ts';

const allowedKinds = new Set(['explore', 'scenario', 'sequence', 'checklist']);
const expectedActivityKinds = {
  'orientasi-pplg-02-profesi-peluang-karier': ['explore', 'sequence'],
  'orientasi-pplg-03-ekosistem-industri-pplg': ['explore', 'scenario'],
  'orientasi-pplg-04-matriks-skill-jenjang-karier': ['explore', 'sequence'],
  'orientasi-pplg-05-job-fair-kelas': ['checklist', 'scenario'],
  'orientasi-pplg-06-rencana-minat-awal': ['checklist', 'scenario'],
  'orientasi-pplg-07-mind-map-profesi-pplg': ['explore', 'checklist'],
  'orientasi-pplg-08-finalisasi-validasi-or01': ['checklist', 'sequence'],
  'orientasi-pplg-09-app-audit-produk-digital': ['explore', 'scenario'],
  'orientasi-pplg-10-ui-ux-fungsi-produk': ['explore', 'scenario'],
  'orientasi-pplg-11-framework-review-6-komponen': ['explore', 'sequence'],
  'orientasi-pplg-12-latihan-analisis-anotasi-visual': ['explore', 'scenario'],
  'orientasi-pplg-13-review-show-peer-feedback': ['scenario', 'sequence'],
  'orientasi-pplg-14-finalisasi-dokumen-review': ['checklist', 'scenario'],
  'orientasi-pplg-15-pengumpulan-validasi-or02': ['checklist', 'sequence'],
  'orientasi-pplg-16-rekap-skill-clinic-refleksi': ['explore', 'scenario'],
} as const;

test('every active Orientasi module after Module 01 has complete and expected interactive activities', () => {
  assert.deepEqual(Object.keys(expectedActivityKinds), CANONICAL_ORIENTASI_SLUGS.slice(1));

  for (const slug of CANONICAL_ORIENTASI_SLUGS.slice(1)) {
    const material = getOrientasiInteractiveMaterial(slug);

    assert.equal(material.activities.length, 2, slug);
    assert.deepEqual(material.activities.map((activity) => activity.kind), expectedActivityKinds[slug], slug);
    assert.equal(new Set(material.activities.map((activity) => activity.id)).size, 2, `${slug}: activity ids unique`);
    for (const activity of material.activities) {
      assert.ok(activity.id.trim(), `${slug}: activity id`);
      assert.ok(activity.title.trim(), `${slug}: activity title`);
      assert.ok(activity.instruction.trim(), `${slug}: activity instruction`);
      assert.ok(activity.feedback.trim(), `${slug}: activity feedback`);
      assert.ok(allowedKinds.has(activity.kind), `${slug}: ${activity.kind}`);
      assert.ok(activity.items.length > 0, `${slug}: items`);
      assert.equal(new Set(activity.items.map((item) => item.label)).size, activity.items.length, `${slug}: item labels unique`);
      for (const item of activity.items) {
        assert.ok(item.label.trim() && item.detail.trim() && item.feedback.trim(), `${slug}: complete item`);
      }
      if (activity.kind === 'sequence') {
        assert.deepEqual(activity.correctOrder, activity.items.map((item) => item.label), `${slug}: correct order`);
      }
    }
  }
});

test('interactive material renderer keeps feedback local and accessible', async () => {
  const source = await readFile(
    new URL('../src/components/modul/InteractiveModuleMaterial.astro', import.meta.url),
    'utf8',
  );
  const behaviorSource = await readFile(
    new URL('../src/utils/interactiveModuleMaterialBehavior.ts', import.meta.url),
    'utf8',
  );

  assert.match(source, /aria-live="polite"/);
  assert.match(source, /data-activity-id/);
  assert.match(source, /aria-pressed="false"/);
  assert.match(source, /interactive-material__item-detail">\{item\.detail\}/);
  assert.match(source, /data-correct-order/);
  assert.match(source, /<ol class="interactive-material__sequence-list" data-sequence-list/);
  assert.match(source, /data-sequence-action="up"/);
  assert.match(source, /data-sequence-action="down"/);
  assert.match(source, /Periksa urutan/);
  assert.match(source, /getSequencePresentationItems\(activity\)/);
  assert.match(source, /initializeInteractiveModuleMaterial/);
  assert.match(behaviorSource, /Urutan sudah tepat/);
  assert.match(behaviorSource, /Urutan belum tepat/);
  assert.match(source, /explore: 'Eksplorasi'[\s\S]*scenario: 'Pilih skenario'[\s\S]*sequence: 'Susun urutan'[\s\S]*checklist: 'Daftar cek'/);
  assert.doesNotMatch(source, /localStorage/);
  assert.doesNotMatch(source, /fetch\s*\(/);
});

test('reader mounts canonical Module 02–16 activities while preserving Module 01', async () => {
  const source = await readFile(
    new URL('../src/pages/pembelajaran/[...slug].astro', import.meta.url),
    'utf8',
  );

  assert.match(source, /import InteractiveModuleMaterial from '..\/..\/components\/modul\/InteractiveModuleMaterial\.astro';/);
  assert.match(
    source,
    /\{isOrientasiModule && !isModul1 && \(\s*<>\s*<InteractiveModuleMaterial\s+lessonSlug=\{lessonSlug\}\s+moduleTitle=\{entry\.data\.title\}\s+\/>[\s\S]*?<details[\s\S]*?Bacaan Rujukan & Materi Lengkap[\s\S]*?<Content \/>[\s\S]*?<\/details>\s*<\/>\s*\)\}/,
  );
  assert.match(source, /\{isModul1 \?\s*\(\s*<InteractiveMaterialP1 user=\{user\} \/>\s*\)/);
});
