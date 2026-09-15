# Public Canvas readiness regression after TypeScript migration — 2026-09-16

## Status

**Resolved.** Fix PR #32 merged as `61f0785d9a8013d16485648d168b1ab878d1f49b`. Canonical production deployment run `35034066091` completed successfully, including the final public headless-Chrome gate with both Arc and Spiral in `data-gallery-state="ready"`.

Tracking issue: #33, closed as completed.

## Incident

The strict TypeScript core migration merged to `master` as `769aa9430de1c2dc1c9f7dd63cfb6200069387f1` and passed ordinary source CI, but its automatic GitHub Pages deployment failed the final public-browser readiness gate.

Failed deployment run: `35033512850`.

## What passed in the failed deployment

The deployment selected the exact source SHA and completed:

- `npm ci`;
- `npm audit --audit-level=high`;
- repository/workflow checks;
- strict `npm run typecheck`;
- all Node behavioral/architecture tests;
- production Vite build;
- non-force `gh-pages` publication;
- public `source-sha.txt` convergence to `769aa9430de1c2dc1c9f7dd63cfb6200069387f1`;
- reachability checks for all 48 generated public files.

## Failure

Five headless-Chrome attempts, each with a 30-second virtual-time budget, serialized both public Canvas elements in `loading` state:

```html
<canvas id="arc" role="img" aria-labelledby="arc-title" data-gallery-state="loading">
<canvas id="spiral" role="img" aria-labelledby="spiral-title" data-gallery-state="loading">
```

The failure was therefore isolated to browser runtime readiness after the generated bundle started. It was not a source-build, typecheck, Node-test, source-marker or generated-file reachability failure.

## Root cause

The TypeScript loaders resolved each cached image promise from `image.onload`, but the handler first awaited optional `image.decode()` work:

```ts
image.onload = async () => {
  try {
    await image.decode?.();
  } catch {}
  resolve(image);
};
```

The `load` event already means the image is available for drawing. Awaiting `decode()` made gallery readiness depend on an optional optimization promise that can remain pending longer than the release smoke budget. Because Arc and Spiral wait for their image set with `Promise.all`, one or more stalled decode promises could keep the entire Canvas state in `loading` even after all generated image URLs were publicly reachable.

## TDD evidence

A focused regression was added for both variants: `onload` must allow the mount to reach `ready` even when `image.decode()` never settles.

RED:
- test-only commit `cc5db4b9a3ee52b37dfd99aeef077d0b306b3d2b`;
- Actions run `35033759562` failed exactly the new Arc and Spiral cases with timeout while the pre-existing suite remained green.

GREEN:
- PR #32 resolves the cached image promise directly from `load` and no longer awaits `decode()`;
- one-shot verification run `35033837284` passed install, high-severity audit, repository checks, strict typecheck, all Node tests and Vite build before committing the implementation;
- normal PR CI run `35033919154` passed the complete source gate;
- PR #32 merged as `61f0785d9a8013d16485648d168b1ab878d1f49b`.

## Production proof

Manual canonical deployment run `35034066091` selected exact source SHA:

`61f0785d9a8013d16485648d168b1ab878d1f49b`

Every release gate passed:

- exact source selection and `master` ancestry verification;
- clean install;
- high-severity npm audit;
- repository/workflow checks;
- strict TypeScript typecheck;
- all Node behavioral/architecture tests;
- production Vite build;
- generated `gh-pages` publication;
- public `source-sha.txt` convergence;
- verification of every generated public file;
- headless-Chrome public smoke with both Arc and Spiral reaching `data-gallery-state="ready"`.

## Scope of the fix

No renderer geometry, timing, assets, public options, default DPR behavior or visual styling changed. The fix removed an unnecessary readiness dependency on optional decode optimization work.

## Evidence boundary

This incident is closed because the exact fixing source passed the canonical public release browser gate. That proves deployed runtime readiness. It does not claim screenshot/pixel visual equivalence, which remains a separate evidence class when a visual contract requires it.
