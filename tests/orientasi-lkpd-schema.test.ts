import assert from 'node:assert/strict';
import test from 'node:test';

test('Module 02 preserves three profession records and its concrete action plan', async () => {
  const { getOrientasiLkpdSchema } = await import('../src/utils/orientasiLkpdSchemas.ts');
  const schema = getOrientasiLkpdSchema('orientasi-pplg-02-profesi-peluang-karier');
  const names = schema.sections.flatMap((section) => section.fields.map((field) => field.name));

  assert.deepEqual(names.filter((name) => /^profession[123](Name|Responsibilities|Tools|Reason)$/.test(name)).length, 12);
  assert.ok(names.includes('priorityProfession'));
  assert.ok(names.includes('actionStep1'));
  assert.ok(names.includes('actionStep2'));
});

test('Module 12 preserves separate positive and negative CER screenshot exercises', async () => {
  const { getOrientasiLkpdSchema } = await import('../src/utils/orientasiLkpdSchemas.ts');
  const schema = getOrientasiLkpdSchema('orientasi-pplg-12-latihan-analisis-anotasi-visual');
  const names = schema.sections.flatMap((section) => section.fields.map((field) => field.name));

  assert.deepEqual(names, [
    'positiveScreenshotUrl', 'positiveClaim', 'positiveEvidence', 'positiveReasoning',
    'negativeScreenshotUrl', 'negativeClaim', 'negativeEvidence', 'negativeReasoning',
  ]);
});
