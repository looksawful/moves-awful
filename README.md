# MOVES AWFUL

Small vanilla JavaScript / Canvas animation playground used to develop reusable visual motion experiments.

Current public preview: https://looksawful.github.io/moves-awful/

## Current scope

The repository currently contains two independent Canvas 2D animation modules:

- **Arc** — rotating image cards distributed along an arc, with card scaling, edge fading and labels.
- **Spiral** — image cards moving along a spiral with progressive scaling and alpha.

This is intentionally a small Vite project. There is no framework, TypeScript layer, runtime state library or component system.

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
```

`index.html` is the preview harness. It mounts each animation and handles HMR disposal during local development.

Each animation module owns:

- its asset list and animation configuration;
- image loading and caching;
- DPR-aware Canvas sizing;
- `requestAnimationFrame` lifecycle;
- resize and document-visibility handling;
- `prefers-reduced-motion` state;
- deterministic disposal and Vite HMR cleanup.

Do not create a second shared runtime only to remove duplicated helpers unless a real third animation or measured maintenance problem justifies that abstraction.

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

Arc label styling can be overridden through `--arc-title-font-family`, `--arc-title-font-weight` and `--arc-title-color`.

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

Available checks:

```bash
npm run check
npm run build
```

`npm run check` performs dependency-free JavaScript syntax checks for both animation modules. The build is the current integration-level project check.

There is currently no dedicated unit or browser test suite and no typecheck or linter. Do not report those checks as passing when they do not exist.

## Agent workflow

Read `AGENTS.md` before editing. Project-specific skills live in `.agents/skills/` and describe the Canvas runtime and verification rules for this codebase.

## Deployment

`gh-pages` is the publication branch and `master` is the source branch. Treat `gh-pages` as deployment state, not as a stale feature branch.

## Next-stage priorities

1. Keep the two existing animation contracts stable while integrating or extending them.
2. Add focused behavioral tests only when a stable behavior is worth locking down.
3. Improve reduced-motion/performance behavior if profiling shows continuous static RAF work is unnecessary.
4. Extract shared Canvas lifecycle helpers only when reuse is proven by additional modules or maintenance pressure.
