# MOVES AWFUL

Small Vite + vanilla JavaScript Canvas 2D library for animated gallery layouts.

GitHub Pages preview: https://looksawful.github.io/moves-awful/

The Pages URL is publication state. It is not evidence that the deployed branch matches the current `master` source until the traceability work in issue #4 is complete.

## Current scope

The repository currently contains two independent Canvas 2D gallery variants:

- **Arc** — rotating image cards distributed along an arc, with card scaling, edge fading and labels.
- **Spiral** — image cards moving along a spiral with progressive scaling and alpha.

Both variants keep their built-in demo datasets and can also accept caller-provided items using the portable shape `{ src, title? }`.

This is intentionally a small Vite project. There is no framework, TypeScript core, generic animation engine or shared component runtime.

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
tests/
  canvas-lifecycle.test.mjs
  canvas-viewport.test.mjs
  canvas-state.test.mjs
```

`index.html` is the preview/mount harness. It mounts Arc and Spiral and registers HMR disposal during local development.

Each animation module currently owns:

- its default demo dataset and animation configuration;
- normalization of optional caller-provided gallery items;
- image loading, failure placeholders and URL-level promise caching;
- DPR-aware Canvas backing-store sizing;
- `requestAnimationFrame` ownership;
- resize and document-visibility handling;
- `prefers-reduced-motion` static-render behavior;
- `IntersectionObserver` viewport-proximity gating;
- observable `loading` / `ready` / `error` state on `canvas.dataset.galleryState`;
- mount/dispose cleanup and Vite HMR disposal hooks.

The Node behavioral suite exercises mount/dispose ownership, remounts, stale asynchronous mounts, RAF cancellation/resume, resize, visibility, reduced motion, viewport gating and runtime state. It does not replace real-browser or visual evidence.

Do not extract a shared runtime only to remove duplicated helpers. Shared ownership is justified when another consumer or a concrete maintenance problem makes it safer than the current module-local lifecycle.

## Portable item input

```js
mountArc("arc", {
  items: [
    { src: "/covers/one.webp", title: "One" },
    { src: "/covers/two.webp", title: "Two" },
  ],
});
```

`mountSpiral` accepts the same item shape. Omitting `items` preserves the built-in demo assets. Invalid entries without `src` are ignored. If no image can be rendered, the Canvas enters `error` state and continuous RAF work does not start. Partial image failure remains renderable through placeholders.

## Runtime activity

Continuous animation runs only while the mounted Canvas is near the viewport, the document is visible and reduced motion is not requested. The viewport observer uses a `50% 0px` root margin and falls back to active behavior when `IntersectionObserver` is unavailable.

Reduced-motion mode stops continuous RAF work and keeps a stable frame that can be redrawn after resize or activity changes.

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

Current verification chain:

```bash
npm ci
npm audit --audit-level=high
npm run check
npm test
npm run build
```

`npm run check` performs JavaScript syntax checks. `npm test` runs the dependency-light Node behavioral tests. `npm run build` verifies Vite production bundling and asset/module resolution.

There is no dedicated real-browser automation suite, screenshot regression gate, linter or TypeScript typecheck yet. A green Node/Vite CI run therefore proves those checks only; it does not prove visual parity or deployed Pages freshness.

## Agent workflow

Read `AGENTS.md` before editing. Project-specific skills live in `.agents/skills/` and define the Canvas runtime and verification contracts for this repository.

## Deployment

`master` is source and `gh-pages` is publication state. Do not edit `gh-pages` manually during unrelated source work. Issue #4 tracks a traceable source-to-publication path.

## Next-stage priorities

1. Complete the selected portable parity work in issue #5 without importing site-only Media Catalog or CMS ownership.
2. Add real-browser smoke and screenshot evidence for Arc, Spiral, runtime states, reduced motion and viewport activity.
3. Decide and test a deliberate maximum DPR policy for dense displays.
4. Resolve traceable `master` → `gh-pages` publication under issue #4.
5. Start the strict TypeScript core and React adapter tracks only after the current runtime contract and selected parity surface are characterized.
6. Add further gallery variants only with their own behavioral and visual evidence; do not copy the production-site implementation wholesale.
