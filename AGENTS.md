# MOVES AWFUL agent instructions

This repository is a deliberately small Vite + vanilla JavaScript Canvas project. Preserve that simplicity unless the task explicitly requires a larger architectural change.

## Read first

1. Read `README.md`.
2. Read the relevant project skill in `.agents/skills/`.
3. Inspect the current implementation before editing. Do not infer behavior from names or old notes.
4. Read `package.json` for the actual scripts and dependency versions.

## Repository contracts

- `master` is the source branch.
- `gh-pages` is publication state. Do not treat it as a stale feature branch.
- `index.html` is the preview/mount harness, not a product application shell.
- `canvas-animations/arc.js` and `canvas-animations/spiral.js` are independent modules with explicit mount/dispose lifecycle.
- Assets belong under `canvas-animations/assets/<animation>/` and should be referenced with `new URL(..., import.meta.url)` so Vite can resolve them.
- Preserve HMR cleanup, resize cleanup, visibility handling, image-cache behavior and disposal when changing runtime code.
- Preserve `prefers-reduced-motion` behavior. Improvements are welcome only when they remain deterministic and verified.
- Do not introduce a framework, TypeScript migration, state library, generic animation engine or shared abstraction as incidental cleanup.
- Do not change visual parameters, labels or asset selection unless the task requires a visual change.

## Change discipline

- Keep patches narrow. This codebase does not benefit from speculative abstraction.
- Prefer deleting proven dead code to wrapping it in another layer.
- A third animation may justify extracting shared Canvas lifecycle helpers; two similar files alone are not sufficient proof.
- Do not silently replace Canvas 2D with DOM, SVG, WebGL or Three.js.
- Do not commit generated `dist/`, local logs, IDE state or `node_modules/`.
- Do not edit `gh-pages` manually unless the task is explicitly deployment repair.

## Verification

For ordinary source changes run, when the environment supports them:

```bash
npm ci
npm run check
npm run build
```

There is currently no dedicated unit/browser test suite, linter or typecheck. Never describe nonexistent checks as passing.

For visual/runtime changes, also verify the public or local preview in a browser at representative Arc and Spiral sizes and check console errors, resizing, tab visibility changes and reduced-motion behavior.

If a required verification cannot run, record the exact blocker instead of substituting source inspection for runtime evidence.

## Project skills

- `.agents/skills/moves-canvas-runtime/SKILL.md` — Canvas lifecycle, assets, performance and visual-runtime work.
- `.agents/skills/moves-verification/SKILL.md` — checks, regression discipline and release-readiness evidence.
