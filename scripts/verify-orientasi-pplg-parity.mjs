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

for (const filename of orientasi.slice(1)) {
  const slug = filename.replace(/\.md$/, '');
  const checkpointStart = checkpoints.indexOf(`'${slug}'`);
  const checkpointBlock = checkpoints.slice(checkpointStart, checkpoints.indexOf('\n  },', checkpointStart));
  assert.match(checkpointBlock, /stage1Match:/, `${slug} harus memiliki ronde Puzzle Match.`);
  assert.match(checkpointBlock, /stage2Detective:/, `${slug} harus memiliki ronde Mitos vs Fakta.`);
  assert.match(checkpointBlock, /stage3Speed:/, `${slug} harus memiliki ronde Skenario Cepat.`);
  assert.match(checkpointBlock, /xpReward:/, `${slug} harus memiliki reward XP.`);
}

console.log('Orientasi PPLG parity guard: PASS');
