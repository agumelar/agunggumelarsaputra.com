import assert from 'node:assert/strict';
import test from 'node:test';

test('server rejects a student action when enrollment, prerequisite, or previous stage is missing', async () => {
  const { authorizeOrientasiAction } = await import('../src/utils/orientasiPplgPolicy.ts');
  const base = {
    lessonSlug: 'orientasi-pplg-02-profesi-peluang-karier',
    role: 'student',
    isEnrolled: true,
    completedSlugs: ['orientasi-pplg-01-pengantar-skill-passport'],
    submissionTypes: ['checkpoint', 'lkpd', 'reflection'],
  };

  assert.equal(authorizeOrientasiAction({ ...base, isEnrolled: false, action: 'checkpoint' }).status, 403);
  assert.equal(authorizeOrientasiAction({ ...base, completedSlugs: [], action: 'checkpoint' }).status, 409);
  assert.equal(authorizeOrientasiAction({ ...base, submissionTypes: [], action: 'lkpd' }).status, 409);
  assert.equal(authorizeOrientasiAction({ ...base, submissionTypes: ['checkpoint'], action: 'reflection' }).status, 409);
  assert.equal(authorizeOrientasiAction({ ...base, submissionTypes: ['checkpoint', 'lkpd'], action: 'complete' }).status, 409);
  assert.equal(authorizeOrientasiAction({ ...base, action: 'complete' }).allowed, true);
});
