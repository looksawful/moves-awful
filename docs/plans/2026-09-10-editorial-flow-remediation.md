# Editorial-flow remediation plan — 2026-09-10

Source audit: `docs/audits/2026-09-10-editorial-flow-deep-audit.md`.

This plan applies the useful operating model from `looksawful-editorial` without copying unrelated writing skills into MOVES AWFUL. Work is ordered so executable behavior and evidence precede architecture.

## Global invariants

Throughout every task:

- preserve Arc and Spiral visual parameters, timing, labels and default assets unless a task explicitly changes visual behavior;
- preserve one active lifecycle per animation/canvas key, invalid/stale replacement ownership, idempotent disposal, visibility/reduced-motion/viewport gating and image-cache failure eviction;
- keep `master` as source and `gh-pages` as publication state until #4 deliberately changes deployment mechanics;
- keep ordinary CI verification-only and read-only;
- do not introduce `looksawful.ru` Media Catalog/CMS/page dependencies;
- do not claim browser/visual/deploy evidence from Node mocks or a Vite build;
- use normal reviewed branch commits for source mutation. CI may verify or publish explicitly defined artifacts, not edit production source.

## Execution status

Completed:
- [x] Task 1 — explicit runtime state merged;
- [x] Task 2a — verification truth/docs reconciled;
- [x] Task 2b — dynamic syntax gate now covers every `tests/*.test.mjs` file;
- [x] lifecycle hardening — invalid replacement mounts invalidate older active/pending owners before target validation;
- [x] Arc host-style isolation — runtime no longer injects global `:root` CSS;
- [x] basic demo Canvas accessible naming/fallback and narrow-width responsive shell;
- [x] issue #1/#5 current-state checklists reconciled.

Next engineering checkpoint:
- [ ] Task 2c — add an executable ordinary-CI mutation policy guard;
- [ ] Task 3 — extract test-only harness helpers when extending the suite;
- [ ] Task 4 — compact public contract + deliberate/configurable DPR policy;
- [ ] Task 7 — minimal browser/visual evidence contract before additional variants or TypeScript migration.

## Task 1 — explicit runtime state — COMPLETE

Current contract:
- `loading -> ready` when at least one image is renderable;
- zero renderable images -> `error`;
- `error` starts no RAF;
- partial failures preserve placeholder behavior;
- stale mounts cannot overwrite current state.

## Task 2 — verification truth and policy contracts — PARTIAL

Completed:
- README/AGENTS/local skills describe the actual Node behavioral suite and its evidence boundary;
- `scripts/check-tests.mjs` discovers all `tests/*.test.mjs` files in deterministic order;
- CI runs clean install, high-severity audit, syntax gate, Node tests and Vite build;
- ordinary CI currently declares `permissions: contents: read`.

Remaining executable work:
1. Add a lightweight repository-contract test/script that rejects write-capable/source-patching/push behavior in ordinary verification workflows.
2. Allow narrowly scoped write permissions only in explicitly named release/deployment workflows when such workflows exist.
3. Keep the guard dependency-light and inspectable.

Acceptance: ordinary verification cannot silently become source-mutating CI.

## Task 3 — extract test-only environment helpers

Files: `tests/helpers/canvas-environment.mjs` plus focused suites.

Steps:
1. Record current test behavior before refactoring.
2. Extract only fake EventTarget/Canvas/RAF/Image/ResizeObserver/IntersectionObserver utilities that are genuinely repeated.
3. Keep scenario assertions and intent in individual test files.
4. Prove identical behavior and no production-runtime change.

Acceptance: less test harness drift without creating a production runtime abstraction.

## Task 4 — define portable public contract and deliberate DPR policy

Define the current public contract before TypeScript freezes it:
- variants `arc` and `spiral`;
- item `{ src, title? }`;
- disposer/lifecycle ownership, including invalid replacement semantics;
- states `loading | ready | error`;
- visibility/reduced-motion/viewport activity behavior;
- Arc title override contract;
- candidate configurable DPR ceiling.

For DPR work:
1. start with focused RED tests for any chosen option such as `maxDpr`;
2. invalid/non-positive values must fall back safely;
3. preserve current default appearance unless browser evidence supports a lower default cap;
4. verify representative DPR values in a real browser before changing a default.

Acceptance: callers can understand and, if implemented, deliberately bound DPR cost without a blind copy of the site's `1.5` value.

## Task 5 — additional portable variants

Candidates: `horizontal`, `diagonal`, `showcase-diagonal`, `masonry`.

Do not treat this as a mandatory batch. For every accepted variant require portable data/config, lifecycle/state parity, focused behavioral coverage where useful, real-browser visual evidence and no site CMS/browser-chrome ownership.

## Task 6 — standalone demo accessibility and variant controls — PARTIAL

Completed:
- existing Arc/Spiral headings provide Canvas accessible names/fallback text;
- preview containers scale below the previous oversized Arc minimum.

Conditional future work if the preview becomes a variant selector:
- appropriate tab semantics;
- roving tab index and keyboard navigation;
- visible focus;
- equivalent DOM text when essential content would otherwise live only in Canvas.

Do not add controls merely to imitate the production site.

## Task 7 — visual/browser evidence contract

Create the smallest reliable browser evidence path. Each evidence record should identify source SHA, browser/version, variant, runtime state, viewport/container size, DPR/reduced-motion state and the observable claim being proved.

Minimum checks before TypeScript migration:
- Arc and Spiral initialize without console errors;
- normal data reaches `ready`;
- controlled all-error input reaches `error` without continuous RAF;
- viewport enter/leave gates activity;
- reduced motion preserves a stable presentation;
- resize/backing-store behavior remains safe;
- representative narrow/desktop sizes remain usable.

Automated metadata validation is not visual proof.

## Task 8 — strict TypeScript core (#6)

Preconditions: selected #5 public contract is stable enough to type and a real-browser baseline exists.

Requirements: strict TS, no `any`, one canonical renderer implementation, Vanilla remains supported, no React dependency in core, no long-lived JS/TS duplicate renderers, behavioral/browser/build evidence preserved.

## Task 9 — React adapter (#7)

Precondition: typed core green. React remains a thin peer/dev dependency adapter over the same core. Require StrictMode-safe mount/unmount/remount behavior, SSR-safe import/setup where relevant and proof React does not leak into the Vanilla/core path.

## Task 10 — traceable publication (#4)

Audit current `gh-pages`, add purpose-specific deployment with minimum write permissions and pinned actions, build from an exact `master` SHA, publish generated output only, expose/store source SHA and verify the public preview against it. Ordinary CI remains read-only.

## Task 11 — downstream truth / closure

After each merged task, update only downstream truth affected by proven behavior. At final closure refresh #1, close #5/#6/#7/#4 only with exact evidence or explicit rejection rationale, remove stale work branches only after checking for unique commits, and run a final critic pass against the deep audit.
