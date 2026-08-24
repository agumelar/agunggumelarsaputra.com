import assert from 'node:assert/strict';
import test from 'node:test';

test('checkpoint policy rejects arbitrary slugs and derives approved XP from the canonical catalog', async () => {
  const { getApprovedCheckpoint } = await import('../src/utils/orientasiPplgPolicy.ts');

  assert.equal(getApprovedCheckpoint('arbitrary-xp-farm'), null);
  assert.deepEqual(getApprovedCheckpoint('orientasi-pplg-02-profesi-peluang-karier'), {
    lessonSlug: 'orientasi-pplg-02-profesi-peluang-karier',
    quizId: 'quest-or02',
    xpReward: 15,
  });
});
