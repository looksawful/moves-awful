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
- [x] Task 2b — recursive test-source syntax gate covers root suites and `tests/helpers/`;
- [x] Task 2c — ordinary-CI mutation policy guard merged in #15 / PR #17;
- [x] lifecycle hardening — invalid replacement mounts invalidate older active/pending owners before target validation;
- [x] Arc host-style isolation — runtime no longer injects global `:root` CSS;
- [x] basic demo Canvas accessible naming/fallback and narrow-width responsive shell;
- [x] issue #1/#5 current-state checklists reconciled;
- [x] Task 3 — shared test-only Canvas environment implemented in #18 / PR #19 without production runtime changes;
- [x] Task 4a — compact Vanilla public contract defined in `docs/public-contract.md`;
- [x] Task 4b — common opt-in `maxDpr` implemented for Arc/Spiral with RED -> GREEN Node coverage and no default behavior change.

Next engineering checkpoint:
- [ ] Task 7 — obtain minimal real-browser/visual evidence;
- [ ] Task 4c — use that evidence before selecting any lower default DPR cap;
- [ ] Task 5 — evaluate additional variants individually after the evidence path exists.

## Task 1 — explicit runtime state — COMPLETE

Current contract:
- `loading -> ready` when at least one image is renderable;
- zero renderable images -> `error`;
- `error` starts no RAF;
- partial failures preserve placeholder behavior;
- stale mounts cannot overwrite current state.

## Task 2 — verification truth and policy contracts — COMPLETE

Implemented:
- README/AGENTS/local skills describe the actual Node behavioral suite and its evidence boundary;
- `scripts/check-tests.mjs` recursively syntax-checks `.mjs` sources under `tests/`, including shared helpers;
- CI runs clean install, high-severity audit, syntax/workflow policy gate, Node tests and Vite build;
- ordinary CI declares `permissions: contents: read`;
- `scripts/check-workflow-policy.mjs` rejects block/inline write permissions, `permissions: write-all` and `git push` in ordinary workflows;
- purpose-specific mutation is allowlisted only for exact `deploy.yml`, `deploy.yaml`, `release.yml`, and `release.yaml` filenames.

Acceptance: ordinary verification cannot silently become source-mutating CI without an explicit tested policy change.

## Task 3 — extract test-only environment helpers — COMPLETE

Files: `tests/helpers/canvas-environment.mjs` plus focused suites.

Implemented:
1. Green `master` CI was preserved as the refactor baseline.
2. Repeated fake EventTarget/Canvas/RAF/Image/ResizeObserver/IntersectionObserver/global restore/fresh-import plumbing moved into one test-only helper.
3. Lifecycle, invalid-remount, state, viewport and Arc host-style suites retain their own scenario assertions and intent.
4. `scripts/check-tests.mjs` recursively syntax-checks the helper as well as root suites.
5. No production Canvas file changed in the refactor.

Acceptance: less test harness drift without creating a production runtime abstraction.

## Task 4 — portable public contract and DPR policy — PARTIALLY COMPLETE

The canonical current Vanilla contract lives in `docs/public-contract.md` and covers:
- public variants `arc` and `spiral`;
- entry points `mountArc(canvasId, options?)` / `mountSpiral(canvasId, options?)`;
- item `{ src, title? }`;
- disposer/lifecycle ownership, including invalid replacement semantics;
- states `loading | ready | error`;
- visibility/reduced-motion/viewport activity behavior;
- Arc title CSS-variable override contract;
- common optional `maxDpr` mount option;
- explicit distinction between public mount options and internal authored renderer tuning.

Implemented DPR behavior:
1. RED tests proved both renderers ignored the proposed cap while preserving all previous cases.
2. `maxDpr` now caps backing-store DPR for finite positive numeric values.
3. Effective DPR never falls below `1` and never exceeds device DPR because of the option.
4. Omitted, zero, negative, `NaN`, non-finite and non-number values preserve historical device-DPR behavior.
5. Resize work reapplies the cap.
6. The default remains unchanged and uncapped.

Remaining DPR decision:
- verify representative device DPR / `maxDpr` combinations in real browsers;
- compare visual quality and cost before selecting any lower default;
- do not copy the site's `1.5` default blindly.

Acceptance for the additive control is complete; acceptance for changing the default remains evidence-gated.

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
- representative narrow/desktop sizes remain usable;
- representative device DPR and `maxDpr` combinations preserve acceptable output before any default cap is changed.

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
