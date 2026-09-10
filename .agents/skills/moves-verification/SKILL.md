---
name: moves-verification
description: Use before claiming MOVES AWFUL changes are ready, especially for Canvas runtime, assets, build or deployment-facing edits.
---

# MOVES AWFUL verification

Use evidence proportional to the change. Do not turn this small project into a laboratory, but do not call source inspection a test either.

## Fast source gate

For JavaScript changes:

```bash
npm run check
```

This syntax-checks the source/scripts covered by the package command without requiring a browser.

## Behavioral gate

For runtime behavior changes:

```bash
npm test
```

The current dependency-light Node suite covers Arc and Spiral lifecycle ownership, remounts, stale asynchronous mounts, RAF start/stop behavior, resize, document visibility, reduced motion, viewport proximity, portable caller items and `loading` / `ready` / `error` state.

Treat this as behavioral evidence for the modeled browser APIs. It is not real-browser rendering or visual evidence.

## Integration gate

For source, dependency, asset-path, HTML, CSS or Vite configuration changes run the complete chain:

```bash
npm ci
npm audit --audit-level=high
npm run check
npm test
npm run build
```

A successful Vite build confirms module resolution and production bundling. A successful high-severity audit confirms the configured npm vulnerability threshold. Neither proves animation appearance or Pages deployment freshness.

## Browser gate

Required when rendering, lifecycle, sizing, assets, accessibility or timing changes are intended to be called browser-verified:

- Arc mounts and animates without console errors.
- Spiral mounts and animates without console errors.
- gallery state reaches `ready` for renderable data and `error` when no image is renderable;
- partial image failure remains usable through placeholders;
- viewport enter/leave starts and stops continuous RAF without multiplying ownership;
- resize does not accumulate duplicate animation instances;
- hidden-tab visibility pauses work and returning resumes cleanly;
- repeated mount/dispose does not leave listeners, observers or RAF loops behind;
- reduced-motion mode preserves a stable frame and redraws when required;
- representative responsive preview sizes remain usable;
- dense-DPR behavior is checked whenever the DPR policy changes.

When screenshot evidence is produced, record the exact source SHA, variant, viewport/container size, browser and the state the capture is intended to prove. Do not silently update a visual baseline after a failure.

## HMR evidence

The Node lifecycle suite exercises the ownership invariants HMR depends on, including replacement mounts and idempotent disposal. That is not the same as running the Vite dev server and observing a real HMR cycle. Describe the former as tested lifecycle behavior and the latter only after browser/dev-server verification.

## Deployment gate

`master` is source; `gh-pages` is publication state. Do not claim the Pages preview is updated merely because `master` builds. Issue #4 owns the traceable publication mechanism. Deployment evidence must identify the source SHA represented by the publication state.

## Checks that still do not exist

There is currently no dedicated real-browser automation suite, screenshot regression gate, linter or TypeScript typecheck. Add one only when a concrete contract requires it. Never report a nonexistent check as green.

## Failure handling

Record the exact failing command, relevant error and whether the failure predates the patch. Preserve intentional TDD RED evidence when it proves the test could detect the missing behavior. Fix deterministic cleanup blockers before starting unrelated feature work. Do not suppress a check merely to obtain a green result.
