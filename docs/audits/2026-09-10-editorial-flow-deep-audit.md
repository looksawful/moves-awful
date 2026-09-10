# Editorial-flow deep audit — 2026-09-10

## Scope

This audit reviews MOVES AWFUL through the operating model used by `looksawful/looksawful-editorial`. It does not copy prose-writing rules into a Canvas library. It transfers the useful process contracts: source precedence, evidence extraction before mutation, read-only audit separation, locked properties, minimum relevant routing, critic/review passes, explicit evidence boundaries, stale-rule detection, regression tests and closure criteria.

Audited sources include current MOVES code, issues/PRs, CI, local skills, tests, preview harness and the richer `looksawful.ru` Moves integration.

## Current status

Resolved or materially advanced during the 2026-09-10 hardening passes:

- **F1 verification documentation staleness:** resolved. README, AGENTS and MOVES verification/runtime skills acknowledge the Node behavioral suite and separate it from browser/visual evidence.
- **F2 source-check gap:** resolved. `scripts/check-tests.mjs` recursively discovers and syntax-checks `.mjs` sources under `tests/`, including shared helpers, and `npm run check` invokes it.
- **F3 ordinary CI mutation policy:** resolved by #15 / PR #17. `npm run check` rejects write permissions, `write-all` and `git push` in ordinary workflows while keeping a narrow exact deploy/release filename allowlist.
- **F4 explicit runtime state:** resolved. `loading / ready / error` is caller-observable and no RAF starts when no image is renderable.
- **F7 basic demo accessibility/responsiveness:** partially resolved. The standalone Canvas elements reuse the existing Arc/Spiral headings as accessible names/fallback text, and preview containers can scale below the old 768px Arc minimum. Variant-tab interaction remains a separate product decision.
- **F9 duplicated test harness plumbing:** implemented on #18 / PR #19. Canvas suites share `tests/helpers/canvas-environment.mjs`; scenario assertions remain in focused suites and production runtime is untouched.
- **F13 roadmap staleness:** resolved in issues #1/#5; completed runtime work is no longer listed as pending.
- **Lifecycle hardening beyond the original audit:** invalid replacement mounts invalidate older active/pending owners before Canvas/context validation.
- **Host-page isolation beyond the original audit:** Arc no longer injects a global `:root` style block when mounted.

Still open and worth implementing:

- **F5** standalone DPR contract/policy is unresolved;
- **F6/F8** extra variants and real-browser/visual evidence remain open;
- **F10** the public runtime/API contract remains distributed across README/issues rather than a compact canonical contract artifact;
- **F11/F12** TypeScript/React and publication remain planned/open.

## Source precedence for engineering work

Highest to lowest for a task:

1. explicit current user instruction;
2. current production code plus explicitly approved visual/API contracts;
3. executable regression tests that encode still-current behavior;
4. current issue acceptance criteria and current project plan;
5. `AGENTS.md` and repository-local skills;
6. current README/docs;
7. `looksawful.ru` as production evidence for portable capabilities, not authority over standalone visual math;
8. historical audits, stale issue checklists, old branches and old deployment state.

When a lower layer conflicts with a higher layer, record the stale rule/source conflict instead of forcing current code to satisfy obsolete prose.

## Current evidence ledger

### Proven at Node/CI level

- Arc and Spiral accept caller-provided `{ src, title? }[]` data while retaining built-in demo data.
- mount/remount/stale async mount/disposal/visibility/reduced-motion behavior has dependency-light Node regression coverage.
- invalid replacement mounts invalidate older active/pending ownership even when the replacement Canvas is missing or has no 2D context.
- reduced motion renders statically and does not retain a perpetual RAF.
- `IntersectionObserver` gates continuous RAF near the viewport with a no-observer fallback.
- explicit `loading / ready / error` state is caller-observable on the Canvas.
- all-image failure produces `error` and owns no RAF; partial image failures remain renderable through placeholders.
- Arc mount does not inject global host-page CSS.
- the preview has a structural Canvas text alternative and narrow-width responsive shell contract.
- ordinary verification workflow mutation policy is executable and covered by Node fixtures, including an inline-YAML write-permission regression.
- Canvas test suites share test-only environment plumbing without changing production runtime behavior.
- CI runs `npm ci`, high-severity npm audit, syntax/workflow policy checks, Node tests and Vite build.

### Not yet proven

- deliberate/configurable DPR ceiling behavior;
- public Horizontal / Diagonal / Showcase Diagonal / Masonry standalone variants;
- keyboard-operable variant-selector demo, if such a selector is adopted;
- real-browser screenshot evidence for every public variant/state;
- actual Vite dev-server HMR behavior as distinct from tested remount/disposal invariants;
- strict TypeScript core parity;
- React StrictMode adapter behavior and dependency isolation;
- traceable automated `master -> gh-pages` publication tied to exact source SHA.

## Findings

### F1 — RESOLVED — verification documentation contradicted the repository

Current documentation describes the dependency-free Node regression suite and explicitly distinguishes it from real-browser/visual evidence.

### F2 — RESOLVED — source check omitted checked-in test sources

`npm run check` uses `scripts/check-tests.mjs`, which recursively discovers and syntax-checks `.mjs` sources under `tests/` in deterministic order, including `tests/helpers/`.

### F3 — RESOLVED — ordinary CI mutation policy

PR #17 added a dependency-free checked-in workflow policy. Ordinary workflows reject block/inline write permissions, `permissions: write-all` and `git push`; mutation is allowlisted only for exact deploy/release filenames. The critic pass added a RED regression for inline flow-map permissions before merge.

### F4 — RESOLVED — explicit runtime state

Current contract: `loading -> ready` when at least one image renders; zero renderable images -> `error`; error owns no RAF; partial failure stays renderable.

### F5 — DPR CONTRACT GAP

Standalone Arc/Spiral currently use uncapped device pixel ratio. The site integration caps DPR at `1.5`, but copying that constant blindly would change standalone cost/quality without standalone evidence.

Preferred action: evaluate a portable `maxDpr` option or cap policy with focused behavioral coverage and real-browser quality/performance evidence before changing the default.

### F6 — VISUAL PARITY GAP

Only Arc and Spiral are public standalone variants. `looksawful.ru` also has Horizontal, Diagonal, Showcase Diagonal and Masonry.

Required action: evaluate variants individually. Preserve Arc/Spiral authored math. Do not copy site CMS/page assumptions. Browser evidence is required before a new variant is called visually approved/public.

### F7 — PARTIALLY RESOLVED — accessibility/demo contract

The preview provides basic Canvas accessible naming/fallback text and no longer requires an oversized Arc container on narrow viewports.

Still undecided: whether the standalone preview should become a variant-selector UI at all. If tabs are introduced later, keyboard navigation, selection semantics and focus management belong to that demo adapter, not the Canvas renderer core.

### F8 — VISUAL EVIDENCE GAP

Node tests prove lifecycle/state ownership but not pixel/browser correctness.

Required action: add a small browser smoke/evidence path and record exact source SHA, browser, variant/state, viewport/container size, DPR/reduced-motion state and what each capture proves.

### F9 — RESOLVED — test harness duplication

PR #19 extracts repeated fake global/EventTarget/Canvas/RAF/Image/ResizeObserver/IntersectionObserver plumbing into `tests/helpers/canvas-environment.mjs`. Lifecycle, invalid-remount, state, viewport and Arc host-style suites retain their own scenario assertions. The helper is test-only and the refactor changes no production Canvas files.

### F10 — PUBLIC TERMINOLOGY/API CONTRACT IS IMPLICIT

The portable item shape, state vocabulary and lifecycle semantics exist across code, README and issues, but there is no single compact public-contract artifact.

Required action: define supported variants, item shape, state vocabulary, lifecycle/disposer semantics and option naming before the TypeScript migration freezes them into types.

### F11 — TYPESCRIPT/REACT ARE PLANNED ARCHITECTURE, NOT CURRENT DEFECTS

Issues #6/#7 remain future tracks. They must not be pulled forward as incidental cleanup while #5/browser evidence/public contract work is still moving.

### F12 — DEPLOYMENT EVIDENCE GAP

`master` is source and `gh-pages` is publication state, but no repository mechanism currently proves which source SHA produced the public preview.

Required action: #4 must establish a purpose-specific publication path and traceable source SHA before README can call the preview current.

### F13 — RESOLVED — roadmap staleness

Issues #1/#5 reflect the implemented runtime foundation and the remaining evidence-gated work.

## Explicit preserve decisions

- Do not copy the entire Editorial skill tree into MOVES.
- Do not import `looksawful.ru` Media Catalog IDs, CMS/page ownership, browser mockup chrome, global project selectors or production-only masonry profile.
- Do not migrate Arc/Spiral visual math while repairing lifecycle/tooling/documentation.
- Do not extract a generic production runtime merely because two renderer files duplicate helpers.
- Shared fake-browser plumbing may live under `tests/helpers/`; production runtime ownership remains module-local until a real product-level reason changes it.
- Do not add a large test framework while Node's built-in runner can enforce the current contracts.
- Do not call structural HTML/CSS tests WCAG conformance or pixel-level evidence.

## Correct workflow for subsequent MOVES work

1. Discover current branch/head, issues/PRs, CI, local skills and production implementation.
2. Extract evidence: proven behavior, desired behavior, visual locks and unavailable evidence.
3. Audit read-only before mutation; identify stale rules/source conflicts.
4. Define the change contract: objective, observable acceptance, locked properties, allowed variation and non-goals.
5. For behavior changes, add the smallest failing test first and preserve RED evidence.
6. Implement minimally through normal reviewed branch commits.
7. Obtain automated GREEN: source checks, tests, build and security as applicable.
8. Run a critic pass for API drift, lifecycle ownership, hidden visual changes, stale docs and unsupported claims.
9. Run browser/visual QA when observable rendering/interactions change; record exact SHA/state/dimensions.
10. Update downstream truth only after evidence exists.

## Audit conclusion

The runtime, verification and test-harness foundations are materially ahead of the original baseline. The next engineering work should define the compact public contract and deliberate DPR policy, then obtain real-browser evidence before additional variants or the TypeScript/React tracks freeze observable behavior into a larger API surface. Publication remains a separate traceability task under #4.
