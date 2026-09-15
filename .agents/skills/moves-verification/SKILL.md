---
name: moves-verification
description: Use before claiming MOVES AWFUL changes are ready, especially for Canvas runtime, TypeScript, assets, build or deployment-facing edits.
---

# MOVES AWFUL verification

Use evidence proportional to the change. Keep the project small, but do not call source inspection a test and do not call Node lifecycle evidence pixel-level browser proof.

## Source gate

```bash
npm run check
npm run typecheck
```

`npm run check` syntax-checks the JavaScript compatibility entries, repository helper scripts and test sources, and validates checked-in GitHub Actions workflows against the repository workflow policy.

`npm run typecheck` runs strict TypeScript with `noEmit` over the canonical Canvas implementation and shared type contracts. Do not use `any` or a looser parallel config merely to make the migration green.

Ordinary verification workflows must remain read-only. Purpose-specific mutation is allowlisted only for the repository's explicit deployment/release workflow names.

## Behavior gate

For Canvas lifecycle, state, activity, demo-structure, type-architecture or repository-policy changes:

```bash
npm test
```

The Node suite covers modeled contracts for:

- normal mount/dispose and idempotent cleanup;
- remount ownership and stale asynchronous mounts;
- invalid replacement mounts;
- visibility, viewport and reduced-motion activity;
- caller-provided media items;
- `loading` / `ready` / `error` state;
- `maxDpr` semantics;
- Arc host-style/font boundary;
- structural accessibility/responsive requirements of the demo;
- bundled asset ownership;
- workflow/deployment policy;
- canonical strict TypeScript modules plus stable `.js` compatibility exports.

Tests that need fresh renderer module state import the canonical `.ts` modules directly. Compatibility entries are separately constrained to remain thin exports. Do not mistake module-cache behavior in a test wrapper for a production lifecycle regression.

## Integration gate

For source, dependency, asset, HTML, CSS, Vite, TypeScript configuration, workflow or release-facing changes run the complete chain:

```bash
npm ci
npm audit --audit-level=high
npm run check
npm run typecheck
npm test
npm run build
```

A successful Vite build confirms module resolution and production bundling. It does not prove animation appearance.

## Browser gate

Required when rendering, sizing, assets, accessibility, timing or performance changes depend on actual browser behavior:

- Arc and Spiral initialize without console errors;
- public `.js` compatibility entries drive the canonical TypeScript implementation;
- visible animations run and offscreen animations stop/resume as intended;
- images resolve and partial failures fall back without crashing the loop;
- narrow and desktop preview sizes remain usable;
- hidden-tab visibility pauses work and returning resumes cleanly;
- reduced-motion mode preserves a stable usable presentation;
- actual Canvas output remains visually correct for the change under review.

If browser execution is unavailable, state that boundary explicitly.

## Deployment gate

`master` is source; `gh-pages` is publication state. Do not claim the public preview is updated merely because `master` builds. The canonical deployment workflow must identify the exact source SHA and prove public marker/asset convergence plus Arc/Spiral browser readiness.

## Checks not present

The project currently has no full screenshot/pixel visual-regression suite or linter. Add one only when a concrete contract justifies it. Never report nonexistent checks as green.

## Failure handling

Record the exact failing command and whether failure is production behavior, migration/tooling behavior or a stale test-harness assumption. Preserve useful TDD RED evidence. Fix deterministic blockers rather than suppressing checks for a cosmetic green result.
