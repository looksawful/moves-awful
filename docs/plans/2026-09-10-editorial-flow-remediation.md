# Editorial-flow remediation plan — 2026-09-10

Source audit: `docs/audits/2026-09-10-editorial-flow-deep-audit.md`.

This plan applies the useful operating model from `looksawful-editorial` without copying unrelated writing skills into MOVES AWFUL. Work is ordered so executable behavior and evidence precede architecture.

## Global invariants

Throughout every task:

- preserve Arc and Spiral visual parameters, labels and default assets unless a task explicitly changes visual behavior;
- preserve one active lifecycle per animation/canvas key, stale-mount rejection, idempotent disposal, visibility/reduced-motion/viewport gating and image-cache failure eviction;
- keep `master` as source and `gh-pages` as publication state until #4 deliberately changes deployment mechanics;
- keep ordinary CI verification-only and read-only;
- do not introduce `looksawful.ru` Media Catalog/CMS/page dependencies;
- do not claim browser/visual/deploy evidence from Node mocks or a Vite build;
- use normal reviewed branch commits for source mutation. CI may verify or publish explicitly defined artifacts, not edit production source.

## Execution status

Completed:
- [x] Task 1 — explicit runtime state PR #11 merged;
- [x] documentation portion of Task 2 — stale verification/roadmap wording corrected on the editorial deep-pass branch;
- [x] issue #1 and #5 current-state checklists reconciled;
- [x] MOVES Notion current-state pages reconciled with current GitHub/runtime evidence.

Next engineering checkpoint:
- [ ] finish Task 2 executable source/CI policy guards;
- [ ] Task 3 test-only harness extraction;
- [ ] Task 4 public contract + configurable DPR ceiling;
- [ ] Task 7 minimal browser/visual evidence contract before additional variants or TypeScript migration.

## Task 1 — explicit runtime state — COMPLETE

PR #11 established and merged the contract:
- `loading -> ready` when at least one image is renderable;
- zero renderable images -> `error`;
- `error` starts no RAF;
- partial failures preserve placeholder behavior;
- stale mounts cannot overwrite the current state;
- Arc/Spiral visual math and default assets were unchanged.

Merged runtime-state commit: `734057bcc399ac4f06fe5fbcddbcab5b2081bc23`.

## Task 2 — repair verification truth and add policy contracts — PARTIAL

Documentation corrections are complete on the current editorial deep-pass branch:
- README acknowledges Node behavioral tests and separates them from browser evidence;
- AGENTS defines the current verification chain and TDD discipline;
- MOVES verification/runtime skills reflect caller items, viewport gating and runtime state;
- issue #1/#5 and Notion no longer treat #2/#3 as pending.

Remaining executable work:

Files: `package.json`, CI workflow(s), new lightweight repository-contract test/script if needed.

Steps:
1. Add a failing contract assertion showing `npm run check` currently omits `tests/canvas-viewport.test.mjs` and `tests/canvas-state.test.mjs`.
2. Make `npm run check` cover all relevant checked-in JS/MJS sources without a heavyweight lint stack.
3. Add a guard that rejects write-capable/source-patching behavior in ordinary verification workflows. Purpose-specific deployment workflows may have narrowly scoped write permissions later.
4. Run high-severity audit, syntax/source gate, Node tests and production build.

Acceptance: docs and executable checks agree; newly added test files cannot silently fall outside the source gate; ordinary CI mutation is mechanically rejected.

## Task 3 — extract test-only environment helpers

Files: `tests/helpers/canvas-environment.mjs` plus lifecycle/viewport/state suites.

Steps:
1. Record current suite behavior/counts before refactoring.
2. Extract only fake EventTarget/Canvas/RAF/Image/ResizeObserver/IntersectionObserver utilities shared by the three suites.
3. Keep assertions and scenario intent in individual test files.
4. Prove identical behavior and no production-file changes.

Acceptance: less harness drift without creating a production runtime abstraction.

## Task 4 — define portable public contract and configurable DPR ceiling

Files: current Arc/Spiral modules, tests, compact API contract documentation.

Steps:
1. Define the current public contract: variants `arc` and `spiral`; item `{ src, title? }`; disposer lifecycle; states `loading|ready|error`; current activity behavior; options including candidate `maxDpr`.
2. Add RED tests proving supplied `maxDpr` caps backing-store dimensions and invalid/non-positive values fall back safely.
3. Implement configuration without changing existing default rendering behavior.
4. Document why the default remains behavior-preserving until browser evidence supports a lower global cap.
5. Run the complete verification chain.
6. Verify representative DPR values in a real browser before adopting a lower default cap.

Acceptance: callers can deliberately bound DPR cost; current default appearance is unchanged; any lower default is evidence-backed rather than copied from the site.

## Task 5 — additional portable variants

Candidate variants: `horizontal`, `diagonal`, `showcase-diagonal`, `masonry`.

Do not treat this as a mandatory batch.

Steps per accepted variant:
1. Extract only portable render math/defaults from the `looksawful.ru` Moves profile.
2. Record preserve/vary/avoid contract before implementation.
3. Add behavioral tests for mount/state/lifecycle/data input and deterministic non-pixel invariants where useful.
4. Implement one variant at a time; do not modify Arc/Spiral math.
5. Once a third public renderer exists, reevaluate shared runtime extraction based on actual reuse.
6. Add browser screenshot evidence before calling the variant visually approved/public.

Acceptance: every accepted public variant has portable data input, lifecycle/state parity and visual evidence; rejected variants have explicit rationale; no site CMS dependencies are introduced.

## Task 6 — standalone demo accessibility and variant controls

This task is conditional on the preview becoming a variant selector rather than remaining two independent surfaces.

If implemented:
1. keep core renderers independent of demo DOM ownership;
2. add `role=tablist`, `aria-selected`, roving `tabIndex`, Left/Right/Home/End keyboard behavior and visible focus;
3. define Canvas accessibility boundary and equivalent DOM text when item titles/content are essential;
4. gate any demo autoplay by viewport/visibility/reduced motion;
5. add DOM/browser evidence for keyboard behavior.

Acceptance: demo is keyboard-operable and does not rely on Canvas as the sole carrier of essential content.

## Task 7 — visual/browser evidence contract

Files: new `docs/evidence/README.md`, optional small manifest/schema and a minimal browser smoke path.

Each evidence record should identify:
- source SHA;
- browser/version or automation runtime;
- variant;
- runtime state;
- viewport and container dimensions;
- DPR and reduced-motion state;
- artifact path/reference;
- observable claim proved by the run/capture.

Minimum browser checks before TypeScript migration:
- Arc and Spiral initialize without console errors;
- normal data reaches `ready`;
- controlled all-error input reaches `error` without continuous RAF;
- viewport enter/leave gates activity;
- reduced motion preserves a stable presentation;
- resize updates backing-store/rendering safely;
- representative responsive sizes remain usable.

Automated metadata validation must not be described as proof of visual correctness.

## Task 8 — strict TypeScript core (#6)

Preconditions: selected #5 portable contract is stable and a real-browser baseline exists.

Steps:
1. add strict TS config/typecheck as a migration gate;
2. define variant/item/state/lifecycle types;
3. migrate shared lifecycle/image/sizing core without visual/math change;
4. migrate renderers one by one while preserving Vanilla consumption;
5. no `any`; no React dependency; no long-lived duplicated JS/TS renderer implementations;
6. preserve Node/browser/build evidence.

Acceptance: TypeScript is the canonical core, Vanilla remains supported, visual/runtime parity remains demonstrated.

## Task 9 — React adapter (#7)

Precondition: Task 8 green.

Steps:
1. add React as peer/dev dependency only for adapter verification;
2. build a thin ref/effect wrapper over the same typed mount/dispose core;
3. add StrictMode mount/unmount/remount tests proving no duplicate RAF/listeners/observers;
4. prove SSR-safe import boundary where required;
5. verify core/Vanilla output does not pull React into its bundle.

Acceptance: one render implementation, React adapter only, StrictMode-safe lifecycle.

## Task 10 — traceable publication (#4)

Precondition: runtime/public variants intended for publication are stable enough to publish deliberately.

Steps:
1. audit current `gh-pages` contents/history; do not overwrite manually;
2. add purpose-specific deploy workflow with minimum write permissions and pinned actions;
3. build from an exact `master` SHA and expose/store that SHA in publication metadata;
4. deploy generated output only; ordinary CI remains read-only;
5. verify public preview and recorded source SHA match;
6. only then consider stronger README wording than `GitHub Pages preview`.

Acceptance: public preview is traceable to an exact source commit and reproducible through repository automation.

## Task 11 — downstream truth / closure

After each merged task, update only downstream documentation affected by proven behavior.

At final closure:
- refresh issue #1 order/checkmarks;
- close #5/#6/#7/#4 only with exact evidence or explicit rejection rationale;
- remove stale/superseded work branches only after checking for unique commits;
- ensure README, AGENTS and local skills describe current checks and supported consumption paths;
- run a final critic pass against the deep audit so no stale claim survives because code moved faster than prose.
