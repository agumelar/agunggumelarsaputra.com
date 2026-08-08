import assert from 'node:assert/strict';
import test from 'node:test';

import { getOrientasiInteractiveMaterial } from '../src/utils/orientasiInteractiveMaterials.ts';
import { CANONICAL_ORIENTASI_SLUGS } from '../src/utils/orientasiPplgPolicy.ts';

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
