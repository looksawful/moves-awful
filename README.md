# MOVES AWFUL

Small vanilla JavaScript / Canvas library and demo for reusable animated image galleries.

Published GitHub Pages preview: https://looksawful.github.io/moves-awful/

## Current scope

The repository currently contains two independent Canvas 2D animation modules:

- **Arc** — rotating image cards distributed along an arc, with card scaling, edge fading and labels.
- **Spiral** — image cards moving along a spiral with progressive scaling and alpha.

Both modules keep bundled demo media but can also accept caller-provided `{ src, title? }` items. This remains an intentionally small Vite project: no framework, TypeScript layer, runtime state library or component system is required by the current Vanilla path.

## Runtime contract

Each module owns its animation lifecycle and currently provides:

- one active lifecycle owner per animation/canvas key;
- stale async mount protection, including invalid replacement mounts;
- image loading with URL-level promise caching and placeholder fallback for partial failures;
- observable `loading`, `ready` and `error` state through `canvas.dataset.galleryState`;
- DPR-aware Canvas sizing;
- `requestAnimationFrame` ownership and cleanup;
- pause/resume behavior for document visibility;
- static rendering without perpetual RAF work under `prefers-reduced-motion`;
- `IntersectionObserver` gating so continuous RAF work stops away from the viewport, with a no-observer fallback;
- explicit disposal and Vite HMR cleanup.

The library does not inject global host-page CSS. Arc label styling can be overridden through `--arc-title-font-family`, `--arc-title-font-weight` and `--arc-title-color` on the Canvas or an ancestor. Without overrides, Arc uses the same Inter / 500 / white fallback previously used by the demo runtime.

Do not create a second shared runtime only to remove duplicated helpers unless a real third animation or measured maintenance problem justifies that abstraction.

## Architecture

```text
index.html
style.css
vite.config.js
canvas-animations/
  arc.js
  spiral.js
  assets/
    arc/
    spiral/
scripts/
  check-tests.mjs
  check-workflow-policy.mjs
  install-vendor-skills.mjs
tests/
```

`index.html` is the preview harness. It mounts each animation and handles HMR disposal during local development. The preview Canvas elements use their existing Arc/Spiral headings as accessible names and fallback text; the preview containers scale down without forcing an oversized minimum width.

## Arc configuration

| Parameter | Description |
| --- | --- |
| `slots` | visible cards on the arc |
| `speed` | animation speed |
| `radiusScale` | arc radius relative to canvas size |
| `cardBaseScale` | base card size |
| `cardMinScale` | minimum edge scale |
| `cardMaxBonus` | focus scale multiplier |
| `cardFocusPower` | focus falloff sharpness |
| `titleScale` | label font size relative to card |
| `titleOffsetY` | label vertical offset |
| `titleMaxWidth` | maximum label width in card widths |
| `edgeFadeStart` | edge fade start in normalized space |
| `edgeFadePower` | edge fade strength |

## Spiral configuration

| Parameter | Description |
| --- | --- |
| `speed` | animation speed |
| `turns` | spiral turn count |
| `cardScale` | base card size |
| `cardGrowthScale` | growth toward the outside of the trajectory |
| `radiusScale` | spiral radius relative to canvas size |
| `alphaScale` | alpha ramp along the trajectory |

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
npm test
npm run build
```

`npm run check` syntax-checks both Canvas modules, repository helper scripts and every `tests/*.test.mjs` file, then validates checked-in GitHub Actions workflows against the repository workflow policy. Ordinary verification workflows may not request write permissions or run `git push`; purpose-specific `deploy.*` and `release.*` workflows are the only explicit mutation allowlist. `npm test` runs the dependency-free Node regression suite covering mount/dispose behavior, invalid remounts, visibility, reduced motion, viewport gating, runtime state, Arc host-style isolation, structural demo contracts and workflow-policy fixtures. `npm run build` verifies Vite module resolution and production bundling.

CI also runs `npm audit --audit-level=high` after a clean install.

There is no dedicated browser-automation suite, linter or typecheck yet. Node tests prove the modeled runtime/contracts; they do not prove pixel-level browser appearance.

## Agent workflow

Read `AGENTS.md` before editing. Project-specific skills live in `.agents/skills/` and describe the Canvas runtime and verification rules for this codebase. Reviewed external specialist skills are listed in `skills/vendor/registry.yaml` and are installed only when the task needs them.

## Deployment

`master` is source and `gh-pages` is publication state. The link above is the published preview; do not assume it matches current `master` until the source-to-Pages path is explicitly verified under #4.

## Next-stage priorities

1. Continue #5 by evaluating the remaining portable production-site capabilities with browser evidence: DPR policy and the Horizontal, Diagonal, Showcase Diagonal and Masonry variants.
2. Complete #6 only after the Vanilla contracts stay stable: strict TypeScript core with a verified Vanilla adapter.
3. Complete #7 as a React adapter over the same typed core rather than a second renderer implementation.
4. Complete #4 by making the `master` → `gh-pages` publication path reproducible and traceable to a source SHA.
