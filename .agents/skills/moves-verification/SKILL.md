---
name: moves-verification
description: Use before claiming MOVES AWFUL changes are ready, especially for Canvas runtime, assets, build or deployment-facing edits.
---

# MOVES AWFUL verification

Use evidence proportional to the change. Keep the project small, but do not call source inspection a test and do not call Node lifecycle evidence pixel-level browser proof.

## Fast source gate

For JavaScript or test-source changes:

```bash
npm run check
```

This syntax-checks both Canvas modules, repository helper scripts and every `tests/*.test.mjs` file.

## Behavior gate

For Canvas lifecycle, state, activity, accessibility-contract or demo-structure changes:

```bash
npm test
```

The dependency-free Node suite currently covers the modeled contracts for:

- normal mount/dispose and idempotent cleanup;
- remount ownership and stale async mounts;
- invalid replacement mounts when the Canvas disappears or has no 2D context;
- visibility and reduced-motion activity;
- viewport gating;
- caller-provided media items;
- `loading` / `ready` / `error` state;
- Arc host-style isolation;
- structural accessibility/responsive requirements of the demo.

These tests exercise controlled DOM/Canvas substitutes. They prove ownership/state behavior represented by the harness, not actual pixels, layout rendering or browser performance.

## Integration gate

For source, asset-path, HTML, CSS, Vite configuration or release-facing changes run:

```bash
npm ci
npm audit --audit-level=high
npm run check
npm test
npm run build
```

A successful Vite build confirms module resolution and production bundling. It does not prove animation appearance.

## Browser gate

Required when rendering, sizing, assets, accessibility, timing or performance changes depend on actual browser behavior:

- Arc and Spiral initialize without console errors;
- visible animations run and offscreen animations stop/resume as intended;
- images resolve and partial failures fall back without crashing the loop;
- narrow and desktop preview sizes remain usable;
- hidden-tab visibility pauses work and returning resumes cleanly;
- repeated mount/dispose does not leave listeners, observers or RAF loops behind;
- reduced-motion mode preserves a stable usable presentation;
- actual Canvas output remains visually correct for the change under review.

If browser execution is unavailable, state that boundary explicitly. Do not replace browser evidence with screenshots from an unrelated build or with source inspection.

## Deployment gate

`master` is source; `gh-pages` is publication state. Do not claim the public preview is updated merely because `master` builds. Verify the publication mechanism and the public preview when deployment is part of the task.

## Checks not present yet

The project currently has no dedicated browser-automation suite, linter or typecheck. Add one only when the relevant roadmap work or a concrete regression justifies it. Never report a nonexistent check as green.

## Failure handling

Record the exact failing command, relevant error and whether the failure predates the patch. For behavior changes, prefer RED -> GREEN evidence. Fix deterministic cleanup blockers before unrelated feature work, and never suppress a check merely to obtain a green result.
