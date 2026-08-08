import assert from 'node:assert/strict';
import test from 'node:test';

import { getOrientasiInteractiveMaterial } from '../src/utils/orientasiInteractiveMaterials.ts';
import { CANONICAL_ORIENTASI_SLUGS } from '../src/utils/orientasiPplgPolicy.ts';

test('every Module 02–16 owns factual hero, teacher message, and two contextual scenes', () => {
  for (const slug of CANONICAL_ORIENTASI_SLUGS.slice(1)) {
    const material = getOrientasiInteractiveMaterial(slug);

    assert.ok(material.hero.context.length > 24, `${slug}: hero context`);
    assert.ok(material.hero.objective.length > 24, `${slug}: hero objective`);
    assert.ok(material.teacherMessage.message.length > 40, `${slug}: teacher message`);
    assert.equal(material.scenes.length, 2, `${slug}: scene count`);

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
