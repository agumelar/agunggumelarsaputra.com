import assert from 'node:assert/strict';
import test from 'node:test';
import { Window } from 'happy-dom';
import { createFormHydrationGuard } from '../src/utils/formHydrationGuard.ts';

test('late form hydration cannot overwrite a student edit already made in the form', () => {
  const window = new Window();
  const form = window.document.createElement('form');
  const answer = window.document.createElement('textarea');
  form.append(answer);

  const guard = createFormHydrationGuard(form);
  answer.value = 'Jawaban yang sedang diketik siswa';
  answer.dispatchEvent(new window.Event('input', { bubbles: true }));

  assert.equal(guard.canApplyServerValues(), false);
});

test('initial server values can populate a form before the student edits it', () => {
  const window = new Window();
  const form = window.document.createElement('form');
  form.append(window.document.createElement('input'));

  const guard = createFormHydrationGuard(form);

  assert.equal(guard.canApplyServerValues(), true);
});
