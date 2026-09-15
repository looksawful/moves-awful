# MOVES AWFUL

Small TypeScript + vanilla JavaScript Canvas library and demo for reusable animated image galleries.

Published GitHub Pages preview: https://looksawful.github.io/moves-awful/

## Current scope

The repository contains two public Canvas 2D gallery variants:

- **Arc** — rotating image cards distributed along an arc, with card scaling, edge fading and labels.
- **Spiral** — image cards moving along a spiral with progressive scaling and alpha.

The canonical renderer implementations are strict TypeScript in `canvas-animations/arc.ts` and `canvas-animations/spiral.ts`. The historical public JavaScript entry points remain stable as thin compatibility adapters:

- `canvas-animations/arc.js` → `mountArc`;
- `canvas-animations/spiral.js` → `mountSpiral`.

Both variants keep bundled demo media but can also accept caller-provided `{ src, title? }` items. There is still no framework, generic animation engine or React dependency in the core/Vanilla path.

The compact supported consumer API is defined in [`docs/public-contract.md`](docs/public-contract.md). Architecture migrations must consume that contract rather than redefine it from internal renderer constants.

## Runtime contract

Each variant currently provides:

- one active lifecycle owner per animation/canvas key;
- stale async mount protection, including invalid replacement mounts;
- image loading with URL-level promise caching and placeholder fallback for partial failures;
- observable `loading`, `ready` and `error` state through `canvas.dataset.galleryState`;
- DPR-aware Canvas sizing with optional `maxDpr` backing-store cap;
- `requestAnimationFrame` ownership and cleanup;
- pause/resume behavior for document visibility;
- static rendering without perpetual RAF work under `prefers-reduced-motion`;
- `IntersectionObserver` gating so continuous RAF work stops away from the viewport, with a no-observer fallback;
- explicit disposal and Vite HMR cleanup.

`maxDpr` is opt-in. Omitting it preserves device-DPR behavior; a finite positive value caps backing-store DPR while never lowering effective DPR below `1`. Invalid values are ignored. The standalone default remains unchanged deliberately.

The library does not inject global host-page CSS. Arc label styling can be overridden through `--arc-title-font-family`, `--arc-title-font-weight` and `--arc-title-color` on the Canvas or an ancestor. Without overrides, Arc keeps its established renderer-local fallbacks. Arc mount does not block image startup on host-managed font readiness.

## Architecture

```text
index.html
style.css
vite.config.js
tsconfig.json
canvas-animations/
  arc.js            # stable JS compatibility export
  arc.ts            # canonical Arc implementation
  spiral.js         # stable JS compatibility export
  spiral.ts         # canonical Spiral implementation
  core/
    types.ts         # shared public/runtime type contracts
  assets/
    arc/
    spiral/
scripts/
  check-tests.mjs
  check-workflow-policy.mjs
  install-vendor-skills.mjs
tests/
  helpers/
    canvas-environment.mjs
```

The shared TypeScript layer currently contains contracts/types, not a speculative generic renderer runtime. Arc and Spiral may still duplicate small implementation details when that keeps ownership clearer and safer.

`index.html` remains the preview harness. It imports the stable `.js` entry points, mounts both variants and handles HMR disposal during local development. Tests that require fresh module state import the canonical `.ts` modules directly so a compatibility wrapper cannot accidentally share a cached module instance between isolated scenarios.

## Mount options

Both public variants accept:

```js
{
  items?: Array<{ src: string, title?: string }>,
  maxDpr?: number
}
```

Example:

```js
const dispose = await mountArc("arc", {
  items: [{ src: "/cover.webp", title: "Example" }],
  maxDpr: 1.5,
});
```

See [`docs/public-contract.md`](docs/public-contract.md) for lifecycle, state, validation and DPR semantics.

## Development

```bash
git clone https://github.com/looksawful/moves-awful.git
cd moves-awful
npm ci
npm run dev -- --open
```

Repository checks:

```bash
npm run check
npm run typecheck
npm test
npm run build
```

`npm run check` syntax-checks the JavaScript compatibility entries, repository helper scripts and test sources, then validates checked-in GitHub Actions workflows against the repository workflow policy.

`npm run typecheck` runs strict TypeScript with `noEmit`. The canonical Canvas modules and shared type contracts must remain type-safe without `any`.

`npm test` runs the Node regression suite covering mount/dispose behavior, invalid remounts, stale async ownership, visibility, reduced motion, viewport gating, runtime state, DPR option semantics, Arc host-style isolation, structural demo contracts, workflow-policy fixtures, asset integrity and the TypeScript architecture contract.

`npm run build` verifies Vite module resolution and production bundling. CI also runs `npm audit --audit-level=high` after a clean install.

There is no full screenshot/pixel visual-regression suite or linter. Node tests and strict typecheck prove their modeled contracts; they do not prove pixel-level browser appearance. The deployment workflow adds real headless-browser readiness smoke for the published Arc and Spiral instances.

## Agent workflow

Read `AGENTS.md` before editing. Project-specific skills live in `.agents/skills/`. Reviewed external specialist skills are listed in `skills/vendor/registry.yaml` and are installed only when the task needs them.

## Deployment

`master` is source and `gh-pages` is generated publication state. The canonical publisher is `.github/workflows/deploy.yml`; ordinary source CI does not publish.

Manual publication requires the full 40-character `master` commit SHA. The workflow validates that exact SHA, runs install, security audit, repository checks, Node tests and production build, then publishes only generated output plus `.nojekyll` and `source-sha.txt`. Publication state preserves history.

After publication, the workflow waits for public `source-sha.txt` convergence, verifies every generated public file, then uses headless Chrome to require Arc and Spiral to reach `data-gallery-state="ready"`.

The publication path has already been proven end-to-end. See [`docs/deployment.md`](docs/deployment.md) for the release procedure and evidence boundary.

## Next-stage priorities

1. Preserve the current Arc/Spiral public contract while making the TypeScript implementation canonical and keeping the `.js` compatibility entries stable.
2. Complete #6 only after strict typecheck, Node behavioral tests, production build and browser/public readiness remain green with no renderer/default drift.
3. Complete #7 as a React adapter over the same typed core. React must remain a peer/adapter concern and must not leak into core/Vanilla runtime dependencies.
4. Treat Horizontal/Diagonal/Showcase/Masonry as future features, not unfinished migration work.
5. Add screenshot/pixel visual-regression infrastructure only when a concrete visual contract or future variant justifies it.
