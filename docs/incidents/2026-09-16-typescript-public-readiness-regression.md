# Public Canvas readiness regression after TypeScript migration — 2026-09-16

## Incident

The strict TypeScript core migration merged to `master` as `769aa9430de1c2dc1c9f7dd63cfb6200069387f1` and passed ordinary source CI, but its automatic GitHub Pages deployment failed the final public-browser readiness gate.

Failed deployment run: `35033512850`.

## What passed

The deployment selected the exact source SHA and completed:

- `npm ci`;
- `npm audit --audit-level=high`;
- repository/workflow checks;
- strict `npm run typecheck`;
- all 66 Node behavioral/architecture tests;
- production Vite build;
- non-force `gh-pages` publication;
- public `source-sha.txt` convergence to `769aa9430de1c2dc1c9f7dd63cfb6200069387f1`;
- reachability checks for all 48 generated public files.

## What failed

Five headless-Chrome attempts, each with a 30-second virtual-time budget, serialized both public Canvas elements in `loading` state:

```html
<canvas id="arc" role="img" aria-labelledby="arc-title" data-gallery-state="loading">
<canvas id="spiral" role="img" aria-labelledby="spiral-title" data-gallery-state="loading">
```

The final gate therefore failed. Do not describe the current TypeScript source as having a green public-browser proof until a later deployment passes this same gate.

## Current debugging boundary

This is not a source-build, typecheck, Node-test, source-marker or generated-file reachability failure. The failing boundary is public browser runtime readiness after the generated bundle starts and sets both canvases to `loading`.

The previous proven public-browser baseline predates the TypeScript migration. The immediate investigation compares browser image/readiness behavior before and after `769aa943...`, gathers headless evidence from the generated production build, and changes production code only after a root cause is reproduced.

## Fix discipline

- no speculative renderer/visual changes;
- no React work until this public readiness regression is resolved or explicitly isolated;
- add focused RED evidence for the identified root cause where possible;
- retain the canonical deployment browser smoke as the final end-to-end proof;
- update this incident with the fixing PR, source SHA and green deployment run.
