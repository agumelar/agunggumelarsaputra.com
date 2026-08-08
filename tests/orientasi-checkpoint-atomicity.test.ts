import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');

test('checkpoint reward claim is guarded by one atomic submission insert', async () => {
  const [schema, databaseBootstrap, checkpointRoute] = await Promise.all([
    readFile(resolve(root, 'src/db/schema.ts'), 'utf8'),
    readFile(resolve(root, 'src/db/index.ts'), 'utf8'),
    readFile(resolve(root, 'src/pages/api/gamification/claim-checkpoint.ts'), 'utf8'),
  ]);

  assert.match(
    schema,
    /unique\(['"]user_submissions_user_lesson_type_unique['"]\)\.on\(\s*table\.userId,\s*table\.lessonSlug,\s*table\.submissionType,?\s*\)/,
    'Skema Drizzle harus mendeklarasikan uniqueness user + lesson + submission type.',
  );
  assert.match(
    databaseBootstrap,
    /ROW_NUMBER\(\) OVER \([\s\S]*PARTITION BY user_id, lesson_slug, submission_type[\s\S]*DELETE FROM user_submissions[\s\S]*duplicate_rank > 1/i,
    'Bootstrap harus membersihkan duplicate lama secara deterministik sebelum constraint dibuat.',
  );
  assert.match(
    databaseBootstrap,
    /CREATE UNIQUE INDEX IF NOT EXISTS user_submissions_user_lesson_type_unique[\s\S]*user_id, lesson_slug, submission_type/i,
    'Bootstrap production harus membuat composite unique index yang sama dengan skema Drizzle.',
  );
  assert.doesNotMatch(
    checkpointRoute,
    /db\.select\(\)[\s\S]*\.from\(userSubmissions\)/,
    'Checkpoint tidak boleh memakai SELECT terpisah untuk menentukan first claim.',
  );
  assert.match(
    checkpointRoute,
    /db\.insert\(userSubmissions\)[\s\S]*\.onConflictDoNothing\(\{\s*target:\s*\[\s*userSubmissions\.userId,\s*userSubmissions\.lessonSlug,\s*userSubmissions\.submissionType,?\s*\][\s\S]*\.returning\(/,
    'Checkpoint harus memakai conflict-safe insert dan RETURNING sebagai arbiter first claim.',
  );
  assert.match(
    checkpointRoute,
    /if \(inserted\) \{[\s\S]*db\.insert\(userGamification\)[\s\S]*\.onConflictDoUpdate\(/,
    'XP hanya boleh diberikan ketika insert checkpoint atomik benar-benar berhasil.',
  );
});
