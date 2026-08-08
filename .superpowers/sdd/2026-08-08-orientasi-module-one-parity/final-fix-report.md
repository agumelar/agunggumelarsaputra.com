# Final fix report — Module 01 parity review findings

## Status

Implementation and local verification are complete for every item in `final-fix-brief.md`. Release status remains **BLOCKED** externally by Vercel `TEAM_ACCESS_REQUIRED`; this wave did not deploy, run a student account flow, or mutate student data.

## Implemented fixes

1. `OrientasiLearningScene` now requires a typed `moduleDuration: string` prop. The Module 02–16 reader branch passes `entry.data.duration`, and the hero exposes a visible, labelled duration badge.
2. Regression protection now targets the active Astro component rather than the unused `InteractiveModuleMaterial` renderer. The new test helper compiles the real `.astro` source, renders it through `AstroContainer`, and inspects the resulting HTML in Happy DOM.
3. The active-markup test covers item-specific choice/checklist labels, initial `aria-pressed="false"`, local polite status regions, sequence order/list/up/down/validate controls, and absence of fetch/storage/API/XP/navigation/gating behavior.
4. DOM behavior coverage uses real rendered scene markup and exercises scenario feedback/state, checklist toggle feedback/state, multi-root initialization, and the existing sequence reorder/validation behavior.
5. Both reference summaries now expose a high-contrast amber `focus-visible` outline and offset. The former bare `outline-none` class was removed.
6. `TeacherMessageCard` and `OrientasiLearningScene` IDs are derived from `lessonSlug`; each `aria-labelledby` relationship resolves uniquely when multiple instances are combined. The client initializer processes every `[data-learning-scene]` root.
7. Module 05 now implements its approved intentional map using only its Markdown source: an interest/goal-based booth route followed by strong-versus-weak interview-question decisions.
8. The parity verification script now guards `OrientasiLearningScene` and no longer treats the retired renderer as the source of truth.
9. Review hardening makes scene initialization idempotent with a `WeakSet`: rescanning the document does not duplicate listeners on existing roots, while roots added later still initialize. The no-side-effect guard now includes the imported active behavior source as well as component source and rendered HTML.

## TDD evidence

Initial focused RED run failed for the intended missing contracts:

- multi-root initializer export absent;
- reader did not pass duration or `lessonSlug` to active components;
- rendered active component had no `[data-learning-scene]` roots or duration badge;
- repeated renderer/card IDs collided;
- reference summaries lacked replacement focus styling;
- Module 05 lacked an explicit goal-based route and weak-question decisions.

After minimal production changes, the focused suite passed 10/10. The new tests exercise the real compiled/rendered Astro component rather than a hand-authored markup fixture.

The follow-up review regression reproduced duplicate handlers by initializing the same roots twice: scenario/checklist state toggled back to `false`, and a sequence control moved two positions. After the idempotency guard, the same tests pass while also proving that a late-added root initializes. A temporary unreachable `fetch('/api/progress')` mutation in the active behavior source made the no-side-effect test fail as intended; the mutation was removed immediately after that RED proof.

## Verification evidence

- `node --experimental-strip-types --test tests/orientasi-interactive-materials-dom.test.ts tests/orientasi-interactive-materials.test.ts tests/orientasi-module-one-parity.test.ts` — 10/10 PASS.
- `npm run test:orientasi` — 20/20 PASS.
- `npm run verify:orientasi-parity` — `Orientasi PPLG parity guard: PASS`.
- `npm run build` — Astro/Vercel server build exit 0.
- `git -c core.whitespace=cr-at-eol diff --check` — exit 0; only expected LF→CRLF worktree notices were printed.

## Scope and release boundary

No server API, database, authentication, enrollment, XP, progress/gating, Quest, LKPD, reflection, content Markdown, or server policy logic changed. Module 01 functional behavior remains intact. No Vercel command or student test was run.

The truthful release record remains unchanged: deployment `dpl_EiYNktHu2XLAsiHfGVdcDA8sS5Ui` is `BLOCKED` with `TEAM_ACCESS_REQUIRED`, has no canonical `www` alias, and cannot support a valid student production claim.

## Concern

The active-markup harness includes a small test-only compatibility fallback because the installed `@astrojs/compiler-rs` emits `createMetadata` while the installed `astro/compiler-runtime` does not export it. The fallback only supplies compiler metadata during isolated component rendering; it now asserts that every expected compiler rewrite occurs exactly once (and that generated style/relative imports are fully handled). The normal project build remains the authoritative compiler integration check and passes independently.
