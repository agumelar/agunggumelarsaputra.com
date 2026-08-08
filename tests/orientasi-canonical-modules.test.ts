import assert from 'node:assert/strict';
import test from 'node:test';

test('reader model keeps exactly the 16 canonical Orientasi modules in curriculum order', async () => {
  const { CANONICAL_ORIENTASI_SLUGS, selectCanonicalOrientasiModules } = await import('../src/utils/orientasiPplgPolicy.ts');
  const entries = [
    { id: 'dasar-basis-data-sql', data: { order: 1 } },
    ...CANONICAL_ORIENTASI_SLUGS.toReversed().map((id, index) => ({ id, data: { order: 100 - index } })),
    { id: 'pengenalan-html5-smk', data: { order: 2 } },
  ];

  assert.deepEqual(selectCanonicalOrientasiModules(entries).map((entry) => entry.id), CANONICAL_ORIENTASI_SLUGS);
  assert.equal(selectCanonicalOrientasiModules(entries).length, 16);
});
