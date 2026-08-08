export interface FormHydrationGuard {
  canApplyServerValues(): boolean;
  markUserEdit(): void;
}

/**
 * Keeps a delayed draft response from replacing a learner's first keystroke.
 * Browser form events are the source of truth: programmatic hydration does
 * not emit them, while typing, choosing, and form-button interactions do.
 */
export function createFormHydrationGuard(form: HTMLFormElement | null): FormHydrationGuard {
  let hasUserEdit = false;
  const markUserEdit = () => {
    hasUserEdit = true;
  };

  form?.addEventListener('input', markUserEdit);
  form?.addEventListener('change', markUserEdit);
  form?.addEventListener('click', (event) => {
    if ((event.target as Element).closest('button')) markUserEdit();
  });

  return {
    canApplyServerValues: () => !hasUserEdit,
    markUserEdit,
  };
}
