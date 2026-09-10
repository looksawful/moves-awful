# Editorial-flow deep audit — 2026-09-10

## Scope

This audit reviews MOVES AWFUL through the operating model used by `looksawful/looksawful-editorial`. It does **not** copy editorial prose rules into a Canvas library. It transfers the useful process contracts: source precedence, evidence extraction before mutation, read-only audit separation, locked properties, minimum relevant routing, critic/review passes, explicit evidence boundaries, stale-rule detection, and regression evals.

Audited sources include current `moves-awful@master`, its open issues/PRs, CI, local skills, tests, preview harness, and the richer `looksawful.ru` Moves integration. The Editorial reference set includes root discovery/source-order rules, writer/fact-extractor/critic flows, site-copy audit, terminology governance, claims policy, vendor routing, image orchestrator/registry, reference consistency, art direction, UI/web design, visual QA, runtime-specific image skills, image/editorial evals, and closure criteria.

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
| image orchestrator | minimum relevant MOVES workflow routing |
| visual QA | browser/screenshot evidence after automated behavior checks |
| eval fixtures | routing + invariant regression cases |
| closure criteria | issue/PR exit criteria backed by exact CI/browser/deploy evidence |

## Source precedence for engineering work

Highest to lowest for a task:

1. explicit current user instruction;
2. current production code plus an explicitly approved visual/API contract;
3. executable regression tests that encode still-current behavior;
4. current issue acceptance criteria and current project plan;
5. `AGENTS.md` and repository-local skills;
6. current README/docs;
7. `looksawful.ru` as production evidence for portable capabilities, not as authority over standalone visual math;
8. historical audits, stale issue checklists, old branches and old deployment state.

When a lower layer conflicts with a higher layer, record `ruleset_staleness` or `source_conflict` rather than forcing current code to satisfy obsolete prose.

## Current evidence ledger

### Proven on `master`

- Arc and Spiral accept caller-provided `{ src, title? }[]` data while retaining built-in demo data.
- mount/remount/stale async mount/disposal/visibility/reduced-motion behavior has dependency-free Node regression coverage.
- reduced motion renders statically and does not retain a perpetual RAF.
- `IntersectionObserver` gates continuous RAF near the viewport with a no-IO fallback.
- CI is read-only, pins checkout/setup-node actions by commit, runs `npm ci`, high-severity audit, syntax checks, Node tests, and Vite build.

### Proven only on PR #11 until merged

- `loading -> ready` caller-observable Canvas state.
- all-image-failure -> `error` and no RAF.

### Not yet proven

- deliberate/configurable DPR ceiling behavior;
- public Horizontal / Diagonal / Showcase Diagonal / Masonry variants;
- keyboard-operable variant demo and explicit Canvas fallback/accessibility contract;
- real browser screenshot evidence for every public variant/state;
- strict TypeScript core parity;
- React StrictMode adapter behavior and dependency isolation;
- traceable automated `master -> gh-pages` publication tied to exact source SHA.

## Findings

### F1 — RULESET_STALENESS — verification documentation contradicts the repository

`README.md`, `AGENTS.md`, and `.agents/skills/moves-verification/SKILL.md` still state that no dedicated test suite exists. Current `master` contains `tests/canvas-lifecycle.test.mjs`, `tests/canvas-viewport.test.mjs`, an `npm test` script, and CI executes it.

Required action: update the lower-priority prose to current executable reality. Do not delete tests to satisfy stale documentation.

### F2 — CHECK_GAP — `npm run check` does not cover all checked-in test source

`package.json` syntax-checks `tests/canvas-lifecycle.test.mjs` but omits `tests/canvas-viewport.test.mjs`; PR #11 adds a third test file that would also be omitted.

Required action: make the source gate cover all relevant JS/MJS files without creating a heavyweight lint stack.

### F3 — PROCESS_GAP — no executable guard prevents CI from mutating source

Current `master` CI is read-only, but PR #11 history used a temporary workflow with `contents: write` to patch production files and push its own commit before deleting itself. The final code can still be valid, but the mutation mechanism is unsafe and non-reviewable compared with normal branch commits.

Required action: add a repository policy/contract that ordinary CI and verification workflows remain read-only and do not patch/push production source. Release/deployment write permissions, when added, must be isolated and purpose-specific.

### F4 — STATE_GAP — explicit runtime state is not on `master`

PR #11 correctly established RED evidence: 18 existing tests pass and four state tests fail because `galleryState` is absent. The branch now contains a minimal implementation, but its latest workflow run is `action_required` because the implementation commit was produced by the temporary self-mutating workflow.

Required action: trigger normal read-only CI on a reviewed head, verify the state tests green, review the final diff, merge #11.

### F5 — DPR_CONTRACT_GAP

Standalone Arc/Spiral currently use uncapped device pixel ratio. The site integration deliberately caps DPR at 1.5. A site-specific constant should not be copied blindly because that changes standalone rendering cost/quality without standalone browser evidence.

Required action: expose a portable maximum-DPR option with a behavior-preserving default first, test the backing-store contract, then choose a lower demo/default cap only with browser evidence.

### F6 — VISUAL_PARITY_GAP

Only Arc and Spiral are public standalone variants. `looksawful.ru` has Horizontal, Diagonal, Showcase Diagonal and Masonry. These are useful production references, but copying the site runtime wholesale would also copy page/CMS assumptions and would risk changing Arc/Spiral authored math.

Required action: add new variants through a portable renderer boundary; lock existing Arc/Spiral visual configuration; characterize each new variant before calling it public.

### F7 — ACCESSIBILITY/DEMO_GAP

The standalone preview is two static sections. It has no optional variant-tab interaction, roving tab index, `aria-selected`, or documented fallback rule for essential content drawn only to Canvas.

Required action: build an accessible demo surface separately from core rendering. Core must not acquire site-level DOM ownership merely to make the demo convenient.

### F8 — VISUAL_EVIDENCE_GAP

Node tests prove lifecycle/state ownership but not pixel/browser correctness. There is no durable evidence record tying a visual capture to variant, state, viewport/container and source SHA.

Required action: add a small evidence schema/template and browser smoke path. Never describe Node mocks or a Vite build as visual proof.

### F9 — TEST_HARNESS_DUPLICATION

Lifecycle, viewport and state tests independently build overlapping fake DOM/Canvas/RAF/Image environments. With the third behavioral suite this duplication is now demonstrated rather than hypothetical.

Required action: extract test-only environment helpers. Do not use this as justification for premature production-runtime abstraction.

### F10 — PUBLIC TERMINOLOGY/API CONTRACT IS IMPLICIT

Variant names and item shape exist in code/issues, but there is no small canonical public-contract document/schema on the standalone side. This becomes risky before TypeScript because docs, demo and future adapters can drift.

Required action: define current supported variants, item shape, state vocabulary, lifecycle/disposer semantics, and option naming before the TS migration freezes them into types.

### F11 — TYPESCRIPT/REACT ARE PLANNED ARCHITECTURE, NOT CURRENT DEFECTS

Issues #6 and #7 and `docs/plans/2026-09-10-typescript-react-variants.md` define a sensible order: parity first, strict typed core second, React adapter third. They must not be pulled forward as incidental cleanup while parity/state contracts are moving.

Required action: implement after #5 portable contracts are stable. Keep one renderer implementation; React remains a peer dependency and adapter only.

### F12 — DEPLOYMENT_EVIDENCE_GAP

`master` is source and `gh-pages` is publication state, but there is no repository deployment workflow proving which source SHA produced the public preview. Therefore `Current public preview` is an overclaim.

Required action: add a purpose-specific Pages/deploy workflow after runtime parity is stable, record source SHA in the deployed artifact, and change wording to `GitHub Pages preview` until traceability exists.

### F13 — ROADMAP_STALENESS

Issue #1 still shows #2/#3 as unchecked despite both issues being completed. Its recommended order is historically useful but now stale.

Required action: update the roadmap after the current state/parity pass with completed gates and exact remaining order.

## Explicit non-findings / preserve decisions

- Do not copy the entire Editorial skill tree into MOVES.
- Do not import `looksawful.ru` Media Catalog IDs, CMS/page ownership, browser mockup chrome, global project selectors or production-only masonry profile.
- Do not migrate Arc/Spiral visual math while repairing lifecycle/tooling/documentation.
- Do not extract a generic production runtime merely because two files duplicate helpers; additional variants or the typed-core migration should supply the real reuse pressure.
- Do not add a large test framework while Node's built-in runner can enforce the contracts.

## Corrected workflow for all subsequent MOVES work

1. **Discover**: current branch/head, open issues/PRs, active CI, relevant local skill, current production implementation.
2. **Extract evidence**: distinguish proven behavior, desired behavior, visual locks, and unavailable evidence.
3. **Audit read-only**: report source conflicts/stale rules before editing.
4. **Define change contract**: objective, observable acceptance, locked properties, allowed variation, non-goals.
5. **RED**: add the smallest failing behavioral/contract test when behavior changes.
6. **Implement minimally**: normal reviewed branch commits only; no source-patching CI.
7. **Automated GREEN**: syntax/contracts/tests/build/security as applicable.
8. **Critic pass**: review for API drift, lifecycle ownership, hidden visual changes, stale docs and unsupported claims.
9. **Visual/browser QA** when observable rendering/interactions changed; record exact source SHA and dimensions/state.
10. **Update downstream truth**: README, skills, roadmap and issue status only after evidence exists.

## Audit conclusion

The current runtime is materially healthier than its documentation suggests. The most urgent work is not a rewrite: finish #11 safely, repair stale verification rules, add executable workflow-policy guards, then complete the remaining portable parity contracts. TypeScript, React and deployment should follow only after those contracts stop moving.
