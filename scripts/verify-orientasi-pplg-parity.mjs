import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const contentDirectory = resolve(root, 'src/content/pembelajaran');
const reader = await readFile(resolve(root, 'src/pages/pembelajaran/[...slug].astro'), 'utf8');
const checkpoints = await readFile(resolve(root, 'src/utils/moduleCheckpoints.ts'), 'utf8');
const lkpd = await readFile(resolve(root, 'src/components/modul/GeneralInteractiveLkpd.astro'), 'utf8');
const antiCopyPasteGuardian = await readFile(resolve(root, 'src/components/modul/AntiCopyPasteGuardian.astro'), 'utf8');
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
assert.match(reader, /data-init-checkpoint=/, 'Reader harus menerima state checkpoint dari server.');
assert.match(reader, /data-init-lkpd=/, 'Reader harus menerima state LKPD dari server.');
assert.match(reader, /window\.addEventListener\('checkpoint-passed'/, 'Checkpoint harus membuka LKPD.');
assert.match(reader, /window\.addEventListener\('lkpd-submitted'/, 'LKPD harus membuka refleksi.');
assert.match(reader, /isCurrentModuleLocked/, 'Reader harus memeriksa gating modul.');
assert.match(reader, /user\?\.role !== 'admin'/, 'Admin harus mempertahankan bypass gating.');
assert.doesNotMatch(antiCopyPasteGuardian, /'groupmembers'|'studentgroup'|'token'|'tokencode'|'email'|'password'|'search'|'query'|'evidenceurl'|'repositoryurl'|'repourl'/, 'Hanya identitas siswa dan evidence yang digunakan form boleh diizinkan di dalam form pembelajaran.');
assert.doesNotMatch(antiCopyPasteGuardian, /el instanceof HTMLInputElement && el\.type === 'url'/, 'Tidak semua input URL boleh menerima paste.');
assert.match(antiCopyPasteGuardian, /'studentname'[\s\S]*'studentnis'[\s\S]*'studentclass'[\s\S]*'submissiondate'[\s\S]*'driveurl'[\s\S]*'evidencedriveurl'/, 'Identitas siswa dan URL evidence harus tetap diizinkan.');
assert.match(antiCopyPasteGuardian, /const isLearningTask = [\s\S]*if \(!isLearningTask\) \{[\s\S]*return true;[\s\S]*return false;/, 'Jawaban LKPD dan refleksi yang bukan pengecualian harus tetap diblokir.');

for (const filename of orientasi.slice(1)) {
  const slug = filename.replace(/\.md$/, '');
  assert.ok(checkpoints.includes(`'${slug}'`), `Checkpoint belum dikonfigurasi untuk ${slug}.`);
  assert.ok(lkpd.includes(`'${slug}'`), `Panduan LKPD belum dikonfigurasi untuk ${slug}.`);
}

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
