# MOVES AWFUL agent instructions

This repository is a deliberately small Vite + vanilla JavaScript Canvas project. Preserve that simplicity unless the task explicitly requires a larger architectural change.

## Read first

1. Read `README.md`.
2. Read the relevant project skill in `.agents/skills/`.
3. Inspect the current implementation before editing. Do not infer behavior from names, dated audits or old roadmap text.
4. Read `package.json` for the actual scripts and dependency versions.
5. Read current GitHub Issues/PR evidence when the task depends on whether a behavior is implemented or only planned.
6. If the task needs generic specialist guidance, inspect `skills/vendor/registry.yaml` and install only the relevant reviewed vendor skill. Repository-local rules remain authoritative.

## Repository contracts

- `master` is the source branch.
- `gh-pages` is publication state. Do not treat it as a stale feature branch, and do not infer that it matches current `master` until issue #4 proves the publication path.
- `index.html` is the preview/mount harness, not a product application shell.
- `canvas-animations/arc.js` and `canvas-animations/spiral.js` are independent modules with explicit mount/dispose lifecycle.
- Both modules support built-in demo data and optional caller items shaped as `{ src, title? }`.
- Runtime state is observable as `canvas.dataset.galleryState` with `loading`, `ready` and `error` values.
- Continuous RAF activity is gated by document visibility, reduced-motion preference and viewport proximity when `IntersectionObserver` is available.
- Assets belong under `canvas-animations/assets/<animation>/` and should be referenced with `new URL(..., import.meta.url)` so Vite can resolve them.
- Preserve HMR cleanup hooks, resize cleanup, viewport-observer cleanup, visibility handling, image-cache behavior, runtime-state semantics and disposal when changing runtime code.
- Preserve `prefers-reduced-motion` static-render behavior. Improvements are welcome only when they remain behaviorally verified.
- Do not introduce a framework, TypeScript migration, state library, generic animation engine or shared abstraction as incidental cleanup.
- Do not change visual parameters, labels or default asset selection unless the task explicitly requires a visual change.

## Change discipline

- Keep patches narrow. This codebase does not benefit from speculative abstraction.
- For behavior changes, use a focused RED → GREEN test cycle before refactoring.
- Prefer deleting proven dead code to wrapping it in another layer.
- A third animation may justify extracting shared Canvas lifecycle helpers; two similar files alone are not sufficient proof.
- Do not silently replace Canvas 2D with DOM, SVG, WebGL or Three.js.
- Do not copy `looksawful.ru` Media Catalog IDs, CMS ownership, browser mockup chrome or global project selectors into the library core.
- Do not commit generated `dist/`, local logs, IDE state, `node_modules/` or installed `.agents/vendor/` copies.
- Do not edit `gh-pages` manually unless the task is explicitly deployment repair.

## Verification

For ordinary source changes run, when the environment supports them:

```bash
npm ci
npm audit --audit-level=high
npm run check
npm test
npm run build
```

The repository has a dependency-light Node behavioral suite covering lifecycle, remount/stale-mount ownership, reduced motion, visibility, resize, viewport gating, caller item input and runtime state. A green Node suite is not browser or screenshot evidence.

There is currently no dedicated real-browser automation suite, visual regression gate, linter or TypeScript typecheck. Never describe those checks as passing when they do not exist.

For rendering, lifecycle, sizing, accessibility or timing changes, also verify Arc and Spiral in a real browser at representative sizes. Check console errors, asset loading/error state, resizing, viewport enter/leave behavior, tab visibility changes and reduced-motion behavior. If browser evidence is unavailable, state that limitation explicitly rather than substituting source inspection.

For deployment work, verify the actual `master` → `gh-pages` mechanism and the published source revision. A successful `master` build alone does not prove the Pages preview was updated.

## Project skills

- `.agents/skills/moves-canvas-runtime/SKILL.md` — Canvas lifecycle, assets, performance and visual-runtime work.
- `.agents/skills/moves-verification/SKILL.md` — checks, regression discipline and release-readiness evidence.

## Installable vendor skills

Use `npm run skills:list` to see the reviewed set. Install only what the task needs with `npm run skills:install -- <skill-name>` when the execution environment allows Git/network access.

Current routes:

- `optimize-web-animations` — RAF/offscreen/performance/lifecycle work;
- `accessibility` — keyboard, reduced-motion and Canvas accessibility work;
- `typescript` — strict TypeScript migration and public type contracts.

Installed vendor copies are environment state, not repository source. Do not commit them, and never let generic vendor guidance override this file or the MOVES-specific skills.
