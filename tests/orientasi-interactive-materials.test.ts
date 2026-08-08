import assert from 'node:assert/strict';
import test from 'node:test';

import { CANONICAL_ORIENTASI_SLUGS } from '../src/utils/orientasiPplgPolicy.ts';
import { getOrientasiInteractiveMaterial } from '../src/utils/orientasiInteractiveMaterials.ts';

const allowedKinds = new Set(['explore', 'scenario', 'sequence', 'checklist']);

test('every active Orientasi module after Module 01 has two supported interactive activities', () => {
  for (const slug of CANONICAL_ORIENTASI_SLUGS.slice(1)) {
    const material = getOrientasiInteractiveMaterial(slug);

    assert.equal(material.activities.length, 2, slug);
    for (const activity of material.activities) {
      assert.ok(allowedKinds.has(activity.kind), `${slug}: ${activity.kind}`);
    }
  }
});
