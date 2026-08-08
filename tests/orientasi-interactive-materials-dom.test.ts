import assert from 'node:assert/strict';
import test from 'node:test';
import { Window } from 'happy-dom';

import { getSequencePresentationItems, initializeInteractiveModuleMaterial } from '../src/utils/interactiveModuleMaterialBehavior.ts';
import { getOrientasiInteractiveMaterial } from '../src/utils/orientasiInteractiveMaterials.ts';

const material = getOrientasiInteractiveMaterial('orientasi-pplg-02-profesi-peluang-karier');
const sequenceActivity = material.activities.find((activity) => activity.kind === 'sequence');
assert.ok(sequenceActivity?.correctOrder);
const correctOrder = [...sequenceActivity.correctOrder];

function renderSceneFixture() {
  const root = document.createElement('section');
  root.innerHTML = `<aside data-teacher-message></aside><div role="status" aria-live="polite"></div><button class="interactive-material__choice" data-kind="explore" data-label="Frontend Developer" data-detail="Mengubah desain menjadi antarmuka web responsif." data-feedback="Frontend menghubungkan rancangan ke antarmuka." aria-pressed="false">Frontend Developer</button>`;
  return root;
}

test('scene choice announces feedback and preserves the teacher message outside details', () => {
  const window = new Window();
  globalThis.document = window.document;
  const root = renderSceneFixture();

  initializeInteractiveModuleMaterial(root);
  root.querySelector<HTMLButtonElement>('[data-label="Frontend Developer"]')!.click();

  assert.match(root.querySelector('[role="status"]')!.textContent!, /Frontend/);
  assert.equal(root.querySelector('[data-teacher-message]')!.closest('details'), null);
  assert.equal(root.querySelector('[aria-pressed]')!.getAttribute('aria-pressed'), 'true');
  window.close();
});

test('sequence renderer script reorders, validates, and keeps selection state accessible', () => {
  const window = new Window();
  const document = window.document;
  document.body.innerHTML = `
    <section id="interactive-module-material">
      <div aria-live="polite" role="status"></div>
      <article data-activity-id="sequence-activity">
        <div data-sequence data-correct-order='${JSON.stringify(correctOrder)}'>
          <ol class="interactive-material__sequence-list" data-sequence-list>
            ${getSequencePresentationItems(sequenceActivity).map((item) => `
              <li data-sequence-item data-item-label="${item.label}">
                <button type="button" data-sequence-action="up">Naik</button>
                <button type="button" data-sequence-action="down">Turun</button>
              </li>
            `).join('')}
          </ol>
          <button type="button" class="interactive-material__validate-sequence">Periksa urutan</button>
        </div>
      </article>
      <article data-activity-id="scenario-activity">
        <button type="button" class="interactive-material__choice" data-kind="scenario" data-label="Pilihan A" data-feedback="Umpan balik A" aria-pressed="false">Pilihan A</button>
        <button type="button" class="interactive-material__choice" data-kind="scenario" data-label="Pilihan B" data-feedback="Umpan balik B" aria-pressed="false">Pilihan B</button>
        <p class="interactive-material__activity-feedback" hidden>Umpan balik aktivitas</p>
      </article>
    </section>
  `;

  const root = document.querySelector<HTMLElement>('#interactive-module-material');
  assert.ok(root);
  initializeInteractiveModuleMaterial(root);

  const sequenceLabels = () => [...root.querySelectorAll<HTMLElement>('[data-sequence-item]')]
    .map((item) => item.dataset.itemLabel);
  const feedback = root.querySelector<HTMLElement>('[aria-live="polite"]');
  assert.ok(feedback);
  assert.deepEqual(sequenceLabels(), [...correctOrder].reverse());
  const topLabel = correctOrder.at(-1);
  const bottomLabel = correctOrder[0];
  const middleLabel = correctOrder[Math.floor(correctOrder.length / 2)];
  assert.ok(topLabel && bottomLabel && middleLabel);

  const clickSequence = (label: string, action: 'up' | 'down') => {
    const button = root.querySelector<HTMLButtonElement>(`[data-item-label="${label}"] [data-sequence-action="${action}"]`);
    assert.ok(button, `${label} must have ${action} control`);
    button.click();
  };

  clickSequence(topLabel, 'up');
  assert.match(feedback.textContent, /paling atas/);
  clickSequence(bottomLabel, 'down');
  assert.match(feedback.textContent, /paling bawah/);
  assert.deepEqual(sequenceLabels(), [...correctOrder].reverse());

  clickSequence(middleLabel, 'down');
  assert.notDeepEqual(sequenceLabels(), [...correctOrder].reverse());
  clickSequence(middleLabel, 'up');
  assert.deepEqual(sequenceLabels(), [...correctOrder].reverse());

  root.querySelector<HTMLButtonElement>('.interactive-material__validate-sequence')?.click();
  assert.match(feedback.textContent, /Urutan belum tepat/);

  for (const [targetIndex, label] of correctOrder.entries()) {
    while (sequenceLabels().indexOf(label) > targetIndex) clickSequence(label, 'up');
  }
  assert.deepEqual(sequenceLabels(), correctOrder);
  root.querySelector<HTMLButtonElement>('.interactive-material__validate-sequence')?.click();
  assert.match(feedback.textContent, /Urutan sudah tepat/);

  const choices = root.querySelectorAll<HTMLButtonElement>('.interactive-material__choice');
  assert.equal(choices[0].getAttribute('aria-pressed'), 'false');
  assert.equal(choices[1].getAttribute('aria-pressed'), 'false');
  choices[0].click();
  assert.equal(choices[0].getAttribute('aria-pressed'), 'true');
  assert.equal(choices[1].getAttribute('aria-pressed'), 'false');
  choices[1].click();
  assert.equal(choices[0].getAttribute('aria-pressed'), 'false');
  assert.equal(choices[1].getAttribute('aria-pressed'), 'true');

  window.close();
});
