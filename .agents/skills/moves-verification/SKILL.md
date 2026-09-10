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

This must syntax-check both Canvas modules without requiring a browser.

## Integration gate

For any source, asset-path, HTML, CSS or Vite configuration change:

```bash
npm ci
npm run check
npm run build
```

A successful Vite build confirms module resolution and production bundling. It does not prove animation behavior or visual correctness.

## Browser gate

Required when rendering, lifecycle, sizing, assets, accessibility or timing changes:

- Arc mounts and animates without console errors.
- Spiral mounts and animates without console errors.
- images resolve; failed images fall back without crashing the loop;
- viewport resize does not accumulate duplicate animation instances;
- hidden-tab visibility pauses work and returning resumes cleanly;
- repeated mount/dispose does not leave listeners, observers or RAF loops behind;
- reduced-motion mode preserves a stable, usable presentation;
- current responsive preview sizes remain usable.

## Deployment gate

`master` is source; `gh-pages` is publication state. Do not claim the public preview is updated merely because `master` builds. Verify the actual publication mechanism or public preview when deployment is part of the task.

## Missing checks

The project currently has no dedicated unit test suite, browser automation suite, linter or typecheck. If a task needs one of those forms of evidence, either add a narrowly justified check or state that the evidence is unavailable. Never report a nonexistent check as green.

## Failure handling

Record the exact failing command, relevant error and whether the failure predates the patch. Fix deterministic cleanup blockers before starting unrelated feature work. Do not suppress a check just to obtain a green result.
