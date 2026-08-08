import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const moduleOne = 'orientasi-pplg-01-pengantar-skill-passport';

test('submission policy only approves canonical LKPD and reflection rewards', async () => {
  const { getApprovedSubmission } = await import('../src/utils/orientasiPplgPolicy.ts');

  assert.deepEqual(getApprovedSubmission(moduleOne, 'lkpd'), {
    lessonSlug: moduleOne,
    submissionType: 'lkpd',
    action: 'lkpd',
    xpReward: 25,
  });
  assert.deepEqual(getApprovedSubmission(moduleOne, 'reflection'), {
    lessonSlug: moduleOne,
    submissionType: 'reflection',
    action: 'reflection',
    xpReward: 15,
  });
  assert.equal(getApprovedSubmission('arbitrary-xp-farm', 'lkpd'), null);
  assert.equal(getApprovedSubmission(moduleOne, 'checkpoint'), null);
  assert.equal(getApprovedSubmission(moduleOne, 'project'), null);
});

test('submission route fails closed through canonical policy and server state', async () => {
  const route = await readFile(resolve(root, 'src/pages/api/submissions/save.ts'), 'utf8');

  assert.match(route, /getApprovedSubmission\(lessonSlug, submissionType\)/);
  assert.match(route, /getOrientasiServerState\(userId, approvedSubmission\.lessonSlug\)/);
  assert.match(route, /authorizeOrientasiAction\(\{[\s\S]*lessonSlug: approvedSubmission\.lessonSlug,[\s\S]*action: approvedSubmission\.action/);
  assert.doesNotMatch(route, /submissionType === ['"]lkpd['"] \? 25 : submissionType === ['"]reflection['"] \? 15 : 10/);
  assert.doesNotMatch(route, /let trustedTokenId = tokenId/);
});

test('first submission creation is conflict-safe and couples XP to the winning insert', async () => {
  const route = await readFile(resolve(root, 'src/pages/api/submissions/save.ts'), 'utf8');

  assert.match(
    route,
    /WITH\s+inserted_submission\s+AS\s*\([\s\S]*INSERT INTO user_submissions[\s\S]*ON CONFLICT \(user_id, lesson_slug, submission_type\) DO NOTHING[\s\S]*rewarded_submission\s+AS\s*\([\s\S]*INSERT INTO user_gamification[\s\S]*SELECT[\s\S]*FROM inserted_submission[\s\S]*ON CONFLICT \(user_id\) DO UPDATE/,
    'First create dan XP harus atomik; hanya row INSERT pemenang yang menjadi sumber award.',
  );
  assert.match(
    route,
    /if \(!inserted\) \{[\s\S]*db\.select\(\)[\s\S]*\.from\(userSubmissions\)[\s\S]*db\.update\(userSubmissions\)/,
    'Conflict harus beralih ke jalur update idempoten, bukan dilempar sebagai unique violation 500.',
  );
});
