# MOVES AWFUL Release Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move MOVES AWFUL from the current verified Vanilla baseline to a traceable release path without regressing Arc/Spiral animation, bundled media/assets, runtime lifecycle or the public mount contract.

**Architecture:** Preserve the current Canvas 2D renderers and public Vanilla contract as the release baseline. Add publication traceability and browser proof first, then treat TypeScript and React as compatibility-preserving adapters/migrations behind the same tested contract. Every behavior change uses RED -> GREEN evidence; deployment success is kept separate from source CI success.

**Tech Stack:** Vite 8.2.x, vanilla JavaScript/Canvas 2D, Node 22 test runner, GitHub Actions, GitHub Pages. TypeScript/React remain later tasks under issues #6/#7.

**Spec:** `docs/plans/2026-09-10-editorial-flow-remediation.md`

## Global Constraints

- Preserve Arc and Spiral visual geometry, timing, labels and bundled demo assets unless a dedicated visual task explicitly changes them.
- Preserve `mountArc(canvasId, options?)` and `mountSpiral(canvasId, options?)` behavior documented in `docs/public-contract.md`.
- Preserve portable `{ src, title? }[]`, `loading | ready | error`, reduced-motion static rendering, visibility/viewport gating, resize behavior, stale-mount protection, idempotent disposal and optional `maxDpr` semantics.
- Do not couple the standalone runtime to `looksawful.ru` Media Catalog/CMS/browser-mockup code.
- Ordinary CI remains read-only. Purpose-specific deployment may write only through an explicitly reviewed workflow.
- Source/build tests do not count as visual proof. Public deployment is not proven by a green source CI run.
- Release proof must identify the exact source SHA.

---

### Task 1: Traceable deployment contract

**Files:**
- Create: `tests/deployment-contract.test.mjs`
- Create: `.github/workflows/deploy.yml`
- Create: `docs/deployment.md`
- Modify: `README.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: current `npm ci`, `npm run check`, `npm test`, `npm run build`; `gh-pages` as publication state.
- Produces: manual `workflow_dispatch` publication of an explicit full `source_sha`, `source-sha.txt` in Pages output, preserved `gh-pages` history and a public Arc/Spiral smoke check.

- [ ] **Step 1: Write the failing deployment-contract test.**
  Assert that `deploy.yml` exists and contains: required `workflow_dispatch.inputs.source_sha`; exact-SHA checkout/verification; `npm ci`, high-severity audit, check, test and build; generated `dist` publication only; `.nojekyll`; `source-sha.txt`; non-force push to `gh-pages`; public marker polling; headless browser check for both `#arc` and `#spiral` reaching `data-gallery-state="ready"`.
- [ ] **Step 2: Run CI on the test-only commit and confirm RED because `deploy.yml` is absent.**
- [ ] **Step 3: Implement the minimal deployment workflow.**
  Use `contents: write`, explicit source SHA validation against `origin/master`, detached exact checkout, build, isolated publication worktree, normal push preserving history, public marker polling and Chrome-based smoke verification.
- [ ] **Step 4: Add deployment documentation and reconcile README/AGENTS wording.**
- [ ] **Step 5: Run branch CI and require install, audit, syntax/workflow policy, all Node tests and Vite build to pass.**
- [ ] **Step 6: Merge only after green PR evidence.**
- [ ] **Step 7: Verify the real deployment run and public source marker before closing #4.**

### Task 2: Real-browser release evidence

**Files:**
- Create or modify only the smallest browser-evidence helper/workflow needed after Task 1.
- Update: `docs/audits/` evidence record.

**Interfaces:**
- Consumes: exact deployed source SHA from Task 1.
- Produces: reproducible browser evidence for Arc/Spiral readiness and responsive/runtime states.

- [ ] Verify Arc and Spiral reach `ready` with no page-level console failure.
- [ ] Verify narrow and desktop layouts remain usable.
- [ ] Verify reduced-motion produces a stable frame without continuous RAF.
- [ ] Verify resize/backing-store behavior and representative `maxDpr` values.
- [ ] Verify all-error controlled input reaches `error` without continuous RAF where the harness can inject controlled items.
- [ ] Record browser/version, source SHA, viewport/container size, DPR and observable claim.

### Task 3: Asset/media integrity gate

**Files:**
- Test: focused repository test under `tests/`.
- Modify production files only if the test proves a concrete broken reference.

**Interfaces:**
- Consumes: bundled Arc/Spiral asset declarations and Vite URL resolution.
- Produces: deterministic proof that every bundled default media reference exists and no default dataset silently points at removed assets.

- [ ] Write a failing-first integrity test only if a broken/missing reference is found; otherwise add a characterization check without changing asset selection.
- [ ] Confirm Vite build still emits all referenced bundled media.
- [ ] Do not rename/recompress/replace visual assets as incidental cleanup.

### Task 4: Close portable parity scope (#5)

**Files:**
- Update: `docs/plans/2026-09-10-editorial-flow-remediation.md`
- Update: issue #5 with exact evidence.

**Interfaces:**
- Consumes: current Arc/Spiral public contract plus Task 2 browser proof.
- Produces: explicit decision whether additional site variants belong before the first release.

- [ ] Mark already completed portable parity: reduced-motion/static redraw, viewport gating, portable items, runtime state, accessibility baseline, `maxDpr` control and lifecycle evidence.
- [ ] Evaluate `horizontal`, `diagonal`, `showcase-diagonal`, `masonry` individually.
- [ ] Accept only variants with portable data/config plus behavioral and visual proof; otherwise record them as deferred rather than release blockers.
- [ ] Close #5 when the release scope is explicit and evidence-backed.

### Task 5: Strict TypeScript core (#6)

**Files:**
- Exact file split to be defined from the frozen public contract after Tasks 1-4.

**Interfaces:**
- Consumes: `docs/public-contract.md` and browser baseline.
- Produces: one canonical typed Canvas implementation plus a compatible Vanilla adapter.

- [ ] Add the smallest strict TypeScript toolchain and failing type/behavior tests first.
- [ ] Port contracts/lifecycle/renderers without visual math changes and without long-lived duplicate JS/TS renderer implementations.
- [ ] Preserve current Vanilla import/use path during the compatibility window.
- [ ] Require strict typecheck, Node behavior tests, build and browser parity before closing #6.

### Task 6: React adapter (#7)

**Files:**
- Exact adapter/test files defined after Task 5 stabilizes the typed core.

**Interfaces:**
- Consumes: canonical typed core.
- Produces: React entry point that is StrictMode-safe and does not leak React into Vanilla/core bundles.

- [ ] RED StrictMode mount/unmount/remount test.
- [ ] Minimal ref/effect adapter over the core.
- [ ] RED prop-update and stale-async tests, then minimal implementation.
- [ ] SSR-safe import proof and peer-dependency boundary proof.
- [ ] Browser proof that representative output matches the Vanilla baseline.

### Task 7: Release closure

**Files:**
- Update: README, release notes, roadmap/Notion and GitHub issues only after evidence is current.

**Interfaces:**
- Consumes: all accepted release gates above.
- Produces: release candidate/tag with exact source SHA, public preview marker and honest supported-consumption matrix.

- [ ] Re-run fresh CI on release source SHA.
- [ ] Re-run deployment against that exact SHA and verify `source-sha.txt` publicly.
- [ ] Re-check public Arc/Spiral smoke and asset/media integrity.
- [ ] Update #1 with completed/deferred items and exact run/SHA evidence.
- [ ] Close only issues whose acceptance criteria are actually met.
- [ ] Create release notes that distinguish current Vanilla support from any later TypeScript/React support not yet merged.

## Self-review

- Spec coverage: preserves existing runtime/public contracts, adds traceable publication, browser evidence, asset integrity, parity decision, TS/React tracks and final release closure.
- Placeholder scan: TypeScript/React exact file split is intentionally deferred until their prerequisite public contract/browser baseline exists; it is not an implementation placeholder for Tasks 1-4.
- Type consistency: current public names remain `mountArc`, `mountSpiral`, `{ src, title? }`, `maxDpr`, and `galleryState`.
