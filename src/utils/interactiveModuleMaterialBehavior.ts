import type { InteractiveActivity, InteractiveActivityItem } from './orientasiInteractiveMaterials.ts';

type SequencePresentationSource = Pick<InteractiveActivity, 'kind' | 'items'>;

export function getSequencePresentationItems(activity: SequencePresentationSource): InteractiveActivityItem[] {
  return activity.kind === 'sequence' ? [...activity.items].reverse() : activity.items;
}

export function initializeInteractiveModuleMaterial(root: HTMLElement): void {
  const feedback = root.querySelector<HTMLElement>('[aria-live="polite"]');

  root.querySelectorAll<HTMLButtonElement>('.interactive-material__choice').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest<HTMLElement>('[data-activity-id]');
      if (!feedback) return;

      const { kind, label, feedback: itemFeedback } = button.dataset;
      const choiceScope = card ?? root;
      const activityFeedback = choiceScope.querySelector<HTMLElement>('.interactive-material__activity-feedback');

      if (kind === 'checklist') {
        const isPressed = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', String(!isPressed));
        feedback.textContent = `${label}: ${!isPressed ? 'ditandai sebagai sudah dicek.' : 'tanda cek dibatalkan.'}`;
        return;
      }

      choiceScope.querySelectorAll<HTMLButtonElement>('.interactive-material__choice').forEach((choice) => {
        choice.setAttribute('aria-pressed', String(choice === button));
      });
      if (activityFeedback) activityFeedback.hidden = false;
      feedback.textContent = `${label}. ${itemFeedback}`;
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-sequence-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const sequenceItem = button.closest<HTMLElement>('[data-sequence-item]');
      const sequenceList = button.closest<HTMLElement>('[data-sequence]')?.querySelector<HTMLOListElement>('[data-sequence-list]');
      if (!sequenceItem || !sequenceList || !feedback) return;

      const isMovingUp = button.dataset.sequenceAction === 'up';
      const sibling = isMovingUp ? sequenceItem.previousElementSibling : sequenceItem.nextElementSibling;
      if (!sibling) {
        feedback.textContent = `Item ini sudah berada di posisi paling ${isMovingUp ? 'atas' : 'bawah'}.`;
        return;
      }

      if (isMovingUp) {
        sequenceList.insertBefore(sequenceItem, sibling);
        feedback.textContent = `${sequenceItem.dataset.itemLabel} dipindahkan satu posisi ke atas.`;
      } else {
        sequenceList.insertBefore(sibling, sequenceItem);
        feedback.textContent = `${sequenceItem.dataset.itemLabel} dipindahkan satu posisi ke bawah.`;
      }
    });
  });

  root.querySelectorAll<HTMLButtonElement>('.interactive-material__validate-sequence').forEach((button) => {
    button.addEventListener('click', () => {
      const sequence = button.closest<HTMLElement>('[data-sequence]');
      const sequenceList = sequence?.querySelector<HTMLOListElement>('[data-sequence-list]');
      if (!sequence || !sequenceList || !feedback) return;

      const correctOrder = JSON.parse(sequence.dataset.correctOrder ?? '[]') as string[];
      const currentOrder = [...sequenceList.querySelectorAll<HTMLElement>('[data-sequence-item]')]
        .map((item) => item.dataset.itemLabel);
      const isCorrect = correctOrder.length === currentOrder.length
        && correctOrder.every((item, index) => item === currentOrder[index]);

      feedback.textContent = isCorrect
        ? 'Urutan sudah tepat. Kamu dapat menjelaskan alurnya dengan baik.'
        : 'Urutan belum tepat. Periksa kembali langkah awal dan langkah akhir, lalu coba lagi.';
    });
  });
}
