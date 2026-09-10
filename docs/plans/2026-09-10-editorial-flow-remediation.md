# Editorial-flow remediation plan — 2026-09-10

Source audit: `docs/audits/2026-09-10-editorial-flow-deep-audit.md`.

This plan applies the useful operating model from `looksawful-editorial` without copying unrelated writing skills into MOVES AWFUL. Work is ordered so behavior is characterized before architecture freezes it into public types/adapters.

## Global invariants

Throughout every task:

- preserve Arc and Spiral visual parameters, labels and default assets unless the task explicitly changes visual behavior;
- preserve one active lifecycle per animation/canvas key, stale-mount rejection, idempotent disposal, visibility/reduced-motion/viewport gating and image-cache failure eviction;
- keep `master` as source and `gh-pages` as publication state until #4 deliberately changes deployment mechanics;
- keep ordinary CI verification-only and `contents: read`;
- do not introduce `looksawful.ru` Media Catalog/CMS/page dependencies;
- do not claim browser/visual/deploy evidence from Node mocks or a Vite build;
- use normal branch commits for source mutation. CI may verify or publish explicitly defined artifacts, not edit production source.

## Task 1 — finish explicit runtime state PR #11

Files: existing branch `temp-dependency-refresh`, `canvas-animations/arc.js`, `canvas-animations/spiral.js`, `tests/canvas-state.test.mjs`.

Steps:
1. Keep the already-recorded RED run where the four state tests fail only because state is absent.
2. Review current implementation against the accepted contract.
3. Add/adjust only tests necessary for stale mounts, partial failure or error-state lifecycle if an actual gap is found.
4. Trigger normal read-only CI on the final branch head.
5. Require `npm audit --audit-level=high`, `npm run check`, `npm test`, `npm run build` green.
6. Review final diff for visual changes and self-mutating workflow residue.
7. Merge #11 when green.

Acceptance: `loading -> ready`; zero renderable images -> `error`; error owns no RAF; partial failures preserve placeholder behavior; no visual-math change.

## Task 2 — repair verification truth and add policy contracts

Branch: start fresh from post-#11 `master`.

Files: `package.json`, `README.md`, `AGENTS.md`, `.agents/skills/moves-verification/SKILL.md`, new lightweight repository-contract test/script.

Steps:
1. Add failing contract assertions for current test inventory and CI read-only policy.
2. Make `npm run check` cover all relevant checked-in JS/MJS sources, including lifecycle/viewport/state tests and repository tooling.
3. Remove stale claims that no unit/runtime test suite exists; distinguish Node runtime tests from browser automation.
4. Add a guard that rejects `contents: write` or source-patching/push behavior in ordinary CI verification workflows.
5. Run full CI.

Acceptance: documentation matches executable reality; source gate cannot silently omit newly added test files; ordinary CI mutation is mechanically guarded.

## Task 3 — extract test-only environment helpers

Files: `tests/helpers/canvas-environment.mjs` plus lifecycle/viewport/state suites.

Steps:
1. Characterize current suite counts/behavior.
2. Extract only fake EventTarget/Canvas/RAF/Image/ResizeObserver/IntersectionObserver utilities shared by at least three suites.
3. Keep assertions and scenario intent in the individual test files.
4. Prove identical test behavior and no production-file changes.

Acceptance: less harness drift without creating a production runtime abstraction.

## Task 4 — define portable public contract and configurable DPR ceiling

Files: current Arc/Spiral modules, tests, docs/API contract.

Steps:
1. Define current public contract: variants `arc` and `spiral`; item `{ src, title? }`; disposer lifecycle; states `loading|ready|error`; options including `maxDpr`.
2. Add RED tests proving a supplied `maxDpr` caps backing-store dimensions and invalid/non-positive values fall back safely.
3. Implement configuration without changing the existing default rendering behavior.
4. Document why the default remains behavior-preserving until browser evidence supports a lower global cap.
5. Run full CI and browser evidence if available.

Acceptance: caller can deliberately bound DPR cost; current default appearance is unchanged.

## Task 5 — backport additional portable variants

Target variants: `horizontal`, `diagonal`, `showcase-diagonal`, `masonry`.

Steps per variant:
1. Extract the portable render math and defaults from the `looksawful.ru` Moves profile only.
2. Record preserve/vary/avoid contract before implementation.
3. Add behavioral tests for mount/state/lifecycle/data input and variant-specific deterministic layout invariants that do not pretend to be pixel tests.
4. Implement one variant at a time; do not modify Arc/Spiral math.
5. Once the third public renderer exists, reevaluate shared runtime extraction based on actual reuse. Prefer a small lifecycle/sizing/image-loading core over duplicated copies if it reduces ownership bugs.
6. Add browser screenshot evidence before declaring a new variant visually approved/public.

Acceptance: every public variant has portable data input, lifecycle/state parity and visual evidence; no site CMS dependencies.

## Task 6 — standalone demo accessibility and variant controls

Files: `index.html`, `style.css`, demo-only JS/module, tests/browser evidence.

Steps:
1. Keep core renderers independent of demo DOM ownership.
2. Add tabs for public variants with `role=tablist`, `aria-selected`, roving `tabIndex`, Left/Right/Home/End keyboard behavior and visible focus.
3. Define Canvas accessibility boundary: provide an accessible gallery label and require equivalent DOM text when item titles/content are essential.
4. Add reduced-motion/visibility-aware autoplay only if autoplay is retained; controls must not depend on animation timing.
5. Add DOM-level tests where practical and browser evidence for keyboard behavior.

Acceptance: demo is keyboard-operable and does not rely on Canvas as the sole essential-text carrier.

## Task 7 — visual evidence contract

Files: new `docs/evidence/README.md`, optional `docs/evidence/manifest.schema.json` or simple validated JSON format, verification script.

Each record includes:
- source SHA;
- variant;
- runtime state;
- viewport and container dimensions;
- DPR/reduced-motion state;
- artifact path/reference;
- observable claim proved by the capture.

Automated structural validation may check metadata. It must not call metadata proof of visual correctness.

Acceptance: visual claims can be traced to exact runtime evidence instead of prose memory.

## Task 8 — strict TypeScript core (#6)

Precondition: selected #5 portable parity contracts are stable.

Steps:
1. Add strict TS config/typecheck as RED/green migration gate.
2. Define discriminated variant unions and portable item/state/lifecycle types.
3. Migrate shared lifecycle/image/sizing core first without visual/math change.
4. Migrate renderers one by one while keeping the Vanilla consumption path working.
5. No `any`; no React dependency; no duplicated JS/TS renderer implementations kept in parallel after migration.
6. Preserve browser/build/runtime evidence.

Acceptance: TypeScript is canonical core, Vanilla remains supported, visual/runtime parity stays proven.

## Task 9 — React adapter (#7)

Precondition: Task 8 green.

Steps:
1. Add React as peer/dev dependency only for adapter verification.
2. Build a thin ref/effect wrapper over the same typed mount/dispose core.
3. Add StrictMode mount/unmount/remount tests proving no duplicate RAF/listeners.
4. Prove SSR-safe import boundary where required.
5. Verify core/Vanilla output does not pull React into its bundle.

Acceptance: one render implementation, React adapter only, StrictMode-safe lifecycle.

## Task 10 — traceable publication (#4)

Precondition: runtime/public variants intended for publication are green.

Steps:
1. Audit current `gh-pages` contents and history; do not overwrite manually.
2. Add purpose-specific deploy workflow with minimum write permissions and pinned actions.
3. Build from exact `master` SHA and embed/export that SHA in publication metadata.
4. Deploy generated output only; ordinary CI remains read-only.
5. Verify published preview and recorded source SHA match.
6. Change README wording from `GitHub Pages preview` to `current` only when traceability is actually proven.

Acceptance: public preview is traceable to an exact source commit and reproducible through repository automation.

## Task 11 — downstream truth / roadmap closure

After each merged task, update only downstream documentation affected by proven behavior. At the end:

- refresh issue #1 checkboxes/order;
- close #5/#6/#7/#4 only with exact evidence or explicit rejection rationale;
- remove stale/superseded work branches after checking for unique commits;
- ensure README, AGENTS and local skills describe current checks and supported consumption paths;
- run a final critic pass against the deep audit so no stale claim survives merely because the code moved faster than the prose.
