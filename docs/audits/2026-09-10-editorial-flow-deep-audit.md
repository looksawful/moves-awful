# Editorial-flow deep audit — 2026-09-10

## Scope

This audit reviews MOVES AWFUL through the operating model used by `looksawful/looksawful-editorial`. It does **not** copy prose-writing rules into a Canvas library. It transfers the useful process contracts: source precedence, evidence extraction before mutation, read-only audit separation, locked properties, minimum relevant routing, critic/review passes, explicit evidence boundaries, stale-rule detection, regression tests and closure criteria.

Audited sources include current MOVES code, issues/PRs, CI, local skills, tests, preview harness and the richer `looksawful.ru` Moves integration. Editorial references include source-order rules, fact/claim extraction, critic, site-copy audit, terminology governance, claims policy, vendor routing and visual/reference QA concepts.

## Current status

The initial deep audit was written while PR #11 was still open. The following findings are now resolved or materially advanced:

- **F1 verification documentation staleness:** resolved on the current documentation branch; README, AGENTS and MOVES verification skill now acknowledge Node behavioral tests and separate them from browser evidence.
- **F4 explicit runtime state:** resolved; PR #11 merged as `734057bcc399ac4f06fe5fbcddbcab5b2081bc23` with `loading / ready / error` state and no RAF when no image is renderable.
- **F13 roadmap staleness:** resolved in GitHub issue #1; #2 and #3 are marked complete and the active order now starts with remaining #5 parity/browser work.

Still open and worth implementing:

- **F2** source check omits some checked-in test files;
- **F3** ordinary CI mutation policy is documented but not mechanically guarded;
- **F5** standalone DPR contract/policy is unresolved;
- **F6/F7/F8** extra variants, demo accessibility and real-browser/visual evidence remain open decisions/work;
- **F9** duplicated test harness helpers are now demonstrated across three suites;
- **F10** public runtime/API contract remains mostly implicit in README/issues rather than a compact canonical contract artifact;
- **F11/F12** TypeScript/React and publication remain planned/open.

## Editorial flow model translated to MOVES

| Editorial mechanism | MOVES equivalent |
| --- | --- |
| source hierarchy | runtime/API/visual contract precedence |
| fact extractor | evidence ledger before implementation |
| audit-only mode | inspect/report before mutating production code |
| writer semantic layer | change contract: objective, observable behavior, exclusions |
| claims policy | do not claim runtime/browser/deploy evidence that was not produced |
| terminology governance | public API and variant naming contract |
| reference consistency | lock Arc/Spiral visual math and approved assets during non-visual work |
| art-direction preserve/vary/avoid | explicit visual invariants before new variants |
| visual QA | browser/screenshot evidence after automated behavior checks |
| eval fixtures | routing + invariant regression cases |
| closure criteria | issue/PR exit criteria backed by exact CI/browser/deploy evidence |

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

When a lower layer conflicts with a higher layer, record stale rules/source conflict rather than forcing current code to satisfy obsolete prose.

## Current evidence ledger

### Proven at Node/CI level

- Arc and Spiral accept caller-provided `{ src, title? }[]` data while retaining built-in demo data.
- mount/remount/stale async mount/disposal/visibility/reduced-motion behavior has dependency-light Node regression coverage.
- reduced motion renders statically and does not retain a perpetual RAF.
- `IntersectionObserver` gates continuous RAF near the viewport with a no-observer fallback.
- explicit `loading / ready / error` state is caller-observable on the Canvas.
- all-image failure produces `error` and owns no RAF; partial image failures remain renderable through placeholders.
- CI runs `npm ci`, high-severity npm audit, syntax checks, Node tests and Vite build.

### Not yet proven

- deliberate/configurable DPR ceiling behavior;
- public Horizontal / Diagonal / Showcase Diagonal / Masonry standalone variants;
- keyboard-operable variant demo and explicit Canvas fallback/accessibility contract;
- real-browser screenshot evidence for every public variant/state;
- actual Vite dev-server HMR behavior as distinct from tested remount/disposal invariants;
- strict TypeScript core parity;
- React StrictMode adapter behavior and dependency isolation;
- traceable automated `master -> gh-pages` publication tied to exact source SHA.

## Findings

### F1 — RESOLVED — verification documentation contradicted the repository

Old README/AGENTS/verification-skill prose said no test suite existed. The repository now has lifecycle, viewport and state Node suites. The current documentation branch corrects the prose and explicitly distinguishes Node behavioral evidence from browser/visual evidence.

### F2 — CHECK_GAP — `npm run check` omits checked-in test source

`package.json` currently syntax-checks `tests/canvas-lifecycle.test.mjs` but omits `tests/canvas-viewport.test.mjs` and `tests/canvas-state.test.mjs`.

Required action: make the source gate cover all relevant checked-in JS/MJS without introducing a heavyweight lint stack.

### F3 — PROCESS_GAP — CI read-only policy is not mechanically guarded

Current ordinary CI is read-only, but PR #11 history used a temporary write-capable workflow to patch and push source before deleting itself. The final runtime implementation is valid and verified, but the mutation mechanism is not an acceptable ordinary verification pattern.

Required action: keep ordinary verification workflows `contents: read` and add a lightweight repository contract check that rejects write permissions/source-patching/push behavior outside explicitly named release/deployment workflows.

### F4 — RESOLVED — explicit runtime state

PR #11 merged as `734057bcc399ac4f06fe5fbcddbcab5b2081bc23` after preserving RED evidence and obtaining a GREEN verification run. Current contract: `loading -> ready` when at least one image renders; zero renderable images -> `error`; error owns no RAF; partial failure stays renderable.

### F5 — DPR_CONTRACT_GAP

Standalone Arc/Spiral currently use uncapped device pixel ratio. The site integration deliberately caps DPR at `1.5`, but copying that constant blindly would change standalone cost/quality without standalone evidence.

Preferred action: first expose/test a portable `maxDpr` option with behavior-preserving default semantics. A lower default cap can be adopted only after real-browser quality/performance evidence.

### F6 — VISUAL_PARITY_GAP

Only Arc and Spiral are public standalone variants. `looksawful.ru` also has Horizontal, Diagonal, Showcase Diagonal and Masonry.

Required action: evaluate variants individually. Preserve Arc/Spiral authored math. Do not copy site CMS/page assumptions. Browser evidence is required before a new variant is called visually approved/public.

### F7 — ACCESSIBILITY/DEMO_GAP

The standalone preview remains two static sections. It has no optional variant-tab interaction, roving tab index, `aria-selected`, or documented essential-content fallback rule for Canvas.

Required action: keep demo accessibility separate from core DOM ownership. Add controls only if the preview actually becomes a variant selector.

### F8 — VISUAL_EVIDENCE_GAP

Node tests prove lifecycle/state ownership but not pixel/browser correctness.

Required action: add a small browser smoke/evidence path and record exact source SHA, browser, variant/state, viewport/container size, DPR/reduced-motion state and what each capture proves.

### F9 — TEST_HARNESS_DUPLICATION

Lifecycle, viewport and state suites independently build overlapping fake DOM/Canvas/RAF/Image environments. With three suites, the reuse pressure is real.

Required action: extract **test-only** environment helpers while keeping scenario assertions in their individual suites. Do not use this as an excuse for premature production runtime abstraction.

### F10 — PUBLIC TERMINOLOGY/API CONTRACT IS IMPLICIT

The portable item shape, state vocabulary and lifecycle semantics exist across code, README and issues, but there is no single compact public-contract artifact.

Required action: define supported variants, item shape, state vocabulary, lifecycle/disposer semantics and option naming before the TypeScript migration freezes them into types.

### F11 — TYPESCRIPT/REACT ARE PLANNED ARCHITECTURE, NOT CURRENT DEFECTS

Issues #6/#7 remain sensible future tracks. They must not be pulled forward as incidental cleanup while #5/browser evidence/public contract work is still moving.

### F12 — DEPLOYMENT_EVIDENCE_GAP

`master` is source and `gh-pages` is publication state, but no repository mechanism currently proves which source SHA produced the public preview.

Required action: #4 must establish a purpose-specific publication path and traceable source SHA before README can call the preview current.

### F13 — RESOLVED — roadmap staleness

Issue #1 has been updated: #2/#3 are complete, portable items/viewport/state work is recorded, and remaining work begins with #5/browser evidence rather than replaying completed runtime tasks.

## Explicit preserve decisions

- Do not copy the entire Editorial skill tree into MOVES.
- Do not import `looksawful.ru` Media Catalog IDs, CMS/page ownership, browser mockup chrome, global project selectors or production-only masonry profile.
- Do not migrate Arc/Spiral visual math while repairing lifecycle/tooling/documentation.
- Do not extract a generic production runtime merely because two renderer files duplicate helpers.
- Do not add a large test framework while Node's built-in runner can enforce the contracts.

## Correct workflow for subsequent MOVES work

1. **Discover** current branch/head, issues/PRs, CI, local skill and production implementation.
2. **Extract evidence**: proven behavior, desired behavior, visual locks and unavailable evidence.
3. **Audit read-only**: identify stale rules/source conflicts before editing.
4. **Define change contract**: objective, observable acceptance, locked properties, allowed variation, non-goals.
5. **RED**: add the smallest failing behavioral/contract test for behavior changes.
6. **Implement minimally** through normal reviewed branch commits.
7. **Automated GREEN**: source checks, tests, build, security as applicable.
8. **Critic pass**: API drift, lifecycle ownership, hidden visual changes, stale docs and unsupported claims.
9. **Browser/visual QA** when observable rendering/interactions change; record exact SHA/state/dimensions.
10. **Update downstream truth** only after evidence exists.

## Audit conclusion

The runtime foundation is now materially ahead of the original documentation. The next engineering work should fix the source-check/policy gaps, reduce test-harness drift, define the portable public contract, then tackle DPR/browser evidence. TypeScript, React and publication come after those contracts stop moving.