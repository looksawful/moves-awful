# MOVES AWFUL editorial deep-pass implementation plan

**Date:** 2026-09-10
**Branch:** `audit/editorial-deep-pass-2026-09-10`
**Base after runtime-state merge:** `734057bcc399ac4f06fe5fbcddbcab5b2081bc23`

## Goal

Reconcile MOVES AWFUL documentation, issue state and project knowledge with the current repository implementation, using `looksawful/looksawful-editorial` as the editorial method layer before making repository-facing wording changes.

This pass must not change visual math or widen product scope. Runtime changes discovered by the audit are split into separate TDD pull requests.

## Authority and editorial routing

Use the source order defined by LOOKSAWFUL EDITORIAL:

1. explicit user instruction;
2. current MOVES project canon in Notion reconciled with repository evidence;
3. current repository implementation and CI/PR evidence;
4. approved terminology / Editorial Policy;
5. older repository and Notion prose as historical evidence only.

Apply the relevant editorial flows in this order:

1. **fact / claim extraction** — separate observed repository state from planned work and interpretation;
2. **site-copy / corpus audit** — identify stale or contradictory wording by exact file/location;
3. **design terminology** — normalize `Moves Awful`, Canvas terminology, library/demo/runtime naming;
4. **editorial writer** — rewrite only after factual state is stable;
5. **critic** — check factual safety, specificity, evidence, relevance, compression and surface fit;
6. **plain English** — remove vague/corporate language without weakening technical precision;
7. **Russian infostyle / Nora Gal** — apply only to Russian Notion project summaries, not English source docs;
8. **claims recheck** — make sure verification language matches actual CI/browser evidence.

Flows routed out as not applicable to this task: Behance copy, CV/resume copy, translation, and image-generation skills. Image/visual skills become applicable only when browser screenshot evidence exists.

## Current evidence before edits

- `master@f192c6f` had green CI after portable items and viewport gating.
- PR #11 recorded an expected RED test run for `loading / ready / error` state, then a GREEN one-shot verification run covering install, high-severity audit, syntax, Node tests and production build.
- PR #11 merged as `734057b`.
- Issues #2 and #3 are closed; older docs that describe them as pending are stale.
- MOVES now has Node behavioral tests. Any prose saying no unit/behavioral suite exists is stale.
- No dedicated browser automation/screenshot regression suite is present yet.
- `gh-pages` publication traceability is still unresolved under #4.
- Portable parity #5 is partially complete: caller items, viewport gating, reduced-motion/visibility lifecycle and explicit runtime state are implemented; DPR cap, selected extra variants, demo accessibility and browser/screenshot evidence remain decisions/work.

## Task 1 — Correct repository documentation

Files:
- `README.md`
- `AGENTS.md`
- `.agents/skills/moves-verification/SKILL.md`
- `docs/audits/2026-09-10-editorial-and-site-parity.md`
- `docs/plans/2026-09-10-typescript-react-variants.md`

Required corrections:
- replace `Current public preview` with evidence-safe `GitHub Pages preview` until #4 is closed;
- remove statements that no Node test suite exists;
- list the actual verification chain: install → high-severity audit → syntax → Node tests → build;
- distinguish tested mount/dispose lifecycle from unverified real-browser/HMR visual evidence;
- document portable `{ src, title? }` input, viewport gating and `loading / ready / error` state;
- update priorities so completed #2/#3 work is not described as future work;
- keep React/TypeScript as separate planned tracks, not incidental cleanup.

## Task 2 — Correct GitHub roadmap state

Issues:
- #1 roadmap
- #5 parity

Update checklists and evidence links. Closed #2/#3 must be marked complete. #5 must record completed caller-data, viewport and state work, and retain only actual remaining parity tasks.

Do not close #5 until the selected remaining capabilities are implemented or explicitly rejected with rationale.

## Task 3 — Correct Notion project knowledge

Pages under `Пет проекты / MOVES AWFUL`:
- Current Snapshot
- Issues Knowledge Audit
- Audit / Retro / Roadmap
- Editorial, Site Parity & TS/React Plan

Update stale claims about missing tests, empty Issues/PR history, pending #2/#3 and absent portable parity features. Preserve historical decisions as history rather than silently rewriting them as current state.

## Task 4 — Runtime follow-ups discovered by audit

Separate PRs, each with RED → GREEN evidence:

1. configurable/deliberate DPR cap, using the production-site `1.5` cap as evidence but not copying it blindly;
2. minimal real-browser smoke/evidence harness for Arc/Spiral, runtime states, reduced motion and viewport behavior;
3. publication traceability for `master` → `gh-pages`;
4. extra variants only after each has its own rendering contract and visual evidence.

Do not mix these behavior changes into the editorial documentation PR.

## Verification for this documentation pass

- inspect diff for facts/claims/terminology only;
- run repository CI on the documentation PR even though runtime files are untouched;
- verify no production JavaScript/CSS/HTML changes are included;
- confirm GitHub issue and Notion state match the merged repository SHA after the pass.

## Completion criteria

- no known repository document claims that tests do not exist;
- no roadmap treats #2/#3 as open;
- README does not claim deployment parity without #4 evidence;
- #5 accurately distinguishes completed and remaining parity work;
- Notion current-state pages match GitHub evidence;
- a separate, evidence-backed runtime backlog remains for DPR, browser proof, publication and optional variants.
