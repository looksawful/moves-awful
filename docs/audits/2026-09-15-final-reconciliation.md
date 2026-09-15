# Final editorial reconciliation — 2026-09-15

## Purpose

Close the deep Editorial/runtime reconciliation cycle against the repository state that actually exists after the 2026-09-10 hardening work and the 2026-09-13/15 release-path proof.

This audit follows the useful parts of the LOOKSAWFUL EDITORIAL operating model: evidence extraction before mutation, source precedence, precise terminology, explicit claim boundaries, critic review, stale-rule detection and downstream truth updates only after evidence exists.

It is a closure record, not a request to widen MOVES AWFUL into the full `looksawful.ru` gallery implementation.

## Authority order used

1. explicit current user requirements;
2. current `master` implementation and executable tests;
3. current issue/PR/Actions evidence;
4. `docs/public-contract.md`, `README.md`, `AGENTS.md` and repository-local skills;
5. current project Notion pages;
6. `looksawful.ru` as reference evidence for portable ideas, never as authority over standalone renderer math;
7. older audits/plans as historical evidence.

## Closure evidence

### Runtime and public API

Completed work now includes:

- dependency-light lifecycle coverage for Arc and Spiral;
- reduced-motion static rendering without perpetual RAF work;
- document-visibility activity sync;
- viewport-proximity RAF gating;
- portable caller items shaped as `{ src, title? }`;
- stale and invalid replacement-mount ownership protection;
- explicit `loading | ready | error` state;
- partial image-failure placeholders and no-RAF global error behavior;
- Arc host-style isolation;
- basic Canvas accessible naming/fallback and narrow responsive preview shells;
- a shared test-only Canvas environment without extracting a production runtime abstraction;
- `docs/public-contract.md` as the compact supported Vanilla contract;
- common opt-in `maxDpr` semantics without silently changing historical default DPR behavior.

The deeper hardening path is represented by merged PRs #9, #10, #11, #13, #14, #17, #19 and #21 plus their RED/GREEN CI evidence.

### Publication and real-browser readiness

Issue #4 is complete.

The canonical publisher is `.github/workflows/deploy.yml`. Successful deployment run `34956827340` published source `90e863a00fa754a09f7b462a3eff5e33ab5afcc4` and passed the complete publication chain:

1. exact source-SHA selection and ancestry verification;
2. clean install;
3. high-severity npm security audit;
4. repository/workflow checks;
5. Node behavioral tests;
6. production Vite build;
7. non-force `gh-pages` publication;
8. public `source-sha.txt` convergence;
9. public reachability verification for every generated file;
10. headless-Chrome proof that both Arc and Spiral reached `data-gallery-state="ready"`.

PRs #24–#28 hardened this path after real public evidence exposed propagation and cold-load timing boundaries. PR #27 also fixed a genuine Arc integration bug: mount no longer waits indefinitely for host-managed font readiness before image loading can start.

This is real-browser readiness evidence. It is not screenshot/pixel-diff evidence.

## Final decisions for the old parity backlog

### DPR default

Keep the historical default device-DPR behavior. `maxDpr` remains the supported opt-in cost-control mechanism.

Reason: the library now gives consumers explicit control without changing existing rendering output. The production site's `1.5` cap is useful evidence, but no standalone measurement currently justifies silently lowering the default for every consumer.

A future default change should be a new performance/visual task with representative-browser evidence, not unfinished parity debt.

### Variant-selector tabs

Do not add tabs to the current standalone two-surface Arc/Spiral preview merely to resemble the production site.

The existing preview already exposes both public variants directly with basic Canvas accessible naming/fallback. A selector becomes justified only if future public variants make one-at-a-time navigation materially better. At that point keyboard arrows, `aria-selected`, roving focus and appropriate native semantics become part of the demo adapter contract.

### Additional site variants

Horizontal, Diagonal, Showcase Diagonal and Masonry are not required for current standalone parity.

They remain possible future product features, each requiring its own portable contract, maintenance rationale and visual evidence. Not copying them is an explicit scope decision, not a missing fix.

### Visual-regression suite

Do not create a screenshot/pixel-diff suite as ritual infrastructure when no current visual change needs it.

The public deployment smoke proves deployed browser initialization. Pixel comparison should be added when a concrete visual contract, variant or DPR-default decision needs stable image evidence.

## Editorial-flow closure

The deep pass now satisfies the applicable Editorial flows:

- **fact/claim extraction:** repository behavior, planned architecture and publication state are separated;
- **claims safety:** Node, build, public-browser and pixel evidence are named as different evidence classes;
- **corpus audit:** stale README/AGENTS/skill/issue/Notion claims were reconciled;
- **terminology:** `Moves Awful`, Canvas runtime, gallery variant, Vanilla contract and publication state have stable meanings;
- **editorial writer / plain English:** current code-adjacent docs describe observed contracts rather than vague maturity claims;
- **critic:** unsupported `current preview`, `no tests`, pending #2/#3 and similar stale statements were removed or superseded;
- **Russian editorial flow:** the Notion project state was rewritten as current project knowledge without turning English engineering docs into translated duplicates.

Behance, resume, translation and image-generation flows remain correctly out of scope for this repository-maintenance task.

## Remaining future architecture

Issues #6 and #7 remain intentional future tracks, not unresolved defects from this audit:

- #6: strict TypeScript core while preserving the frozen Vanilla contract and verified Vanilla consumption path;
- #7: React adapter over that same typed core with StrictMode-safe lifecycle and no React dependency leakage into core/Vanilla.

They should consume `docs/public-contract.md` rather than redesign Arc/Spiral during migration.

## Evidence boundaries that remain deliberate

Current evidence does not claim:

- pixel-perfect screenshot regression across browsers/displays;
- a lower default DPR cap is visually superior;
- four additional production-site variants belong in the standalone library;
- TypeScript or React implementation already exists.

Those are future requirements only when explicitly selected.

## Closure conclusion

The original deep Editorial/runtime correction task is reconciled: repository contracts, issues, deployment evidence and Notion project knowledge agree on the current Arc/Spiral Vanilla library state. Publication traceability is no longer an open architecture gap. Remaining #6/#7 work is new architecture, and optional variants/visual-regression/default-DPR changes are future product choices rather than unfinished cleanup.