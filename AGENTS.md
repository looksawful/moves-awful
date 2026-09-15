# MOVES AWFUL agent instructions

This repository is a deliberately small Vite + TypeScript/vanilla JavaScript Canvas project. Preserve that simplicity unless the task explicitly requires a larger architectural change.

## Read first

1. Read `README.md`, `docs/public-contract.md` and `docs/deployment.md` when publication or release status matters.
2. Read the relevant project skill in `.agents/skills/`.
3. Inspect the current implementation before editing. Do not infer behavior from names or old notes.
4. Read `package.json` and `tsconfig.json` for the actual verification and type contracts.
5. If the task needs generic specialist guidance, inspect `skills/vendor/registry.yaml` and install only the relevant reviewed vendor skill. Repository-local rules remain authoritative.

## Repository contracts

- `master` is the source branch.
- `gh-pages` is generated publication state. Do not hand-edit it during ordinary source work.
- `.github/workflows/deploy.yml` is the canonical publisher. Ordinary CI success is not deployment success.
- `docs/public-contract.md` is the compact consumer contract. Internal renderer constants are not public options merely because they are documented or visible in source.
- `canvas-animations/arc.ts` and `canvas-animations/spiral.ts` are the canonical renderer implementations.
- `canvas-animations/arc.js` and `canvas-animations/spiral.js` are stable thin JavaScript compatibility exports. Do not reintroduce parallel renderer logic into them.
- `canvas-animations/core/types.ts` owns shared type contracts. Shared types are not permission to invent a generic shared runtime without demonstrated reuse.
- `index.html` is the preview/mount harness, not a product application shell.
- A new mount attempt owns the animation/canvas key immediately: it must invalidate an older active or pending lifecycle even when the new Canvas is missing or has no 2D context.
- Caller-provided `{ src, title? }` items replace the built-in demo dataset when supplied.
- Runtime state is caller-observable through `canvas.dataset.galleryState`: `loading`, then `ready` when at least one image is renderable, or `error` when none is renderable.
- `maxDpr` is an optional common mount option. Omitted or invalid values preserve device DPR; a finite positive value caps backing-store DPR without allowing effective DPR below `1`.
- Assets belong under `canvas-animations/assets/<animation>/` and should be referenced from the canonical TypeScript module with `new URL(..., import.meta.url)` so Vite can resolve them.
- Preserve HMR cleanup, resize cleanup, visibility handling, viewport gating, image-cache behavior, runtime-state semantics and disposal when changing runtime code.
- Preserve `prefers-reduced-motion`: static reduced-motion rendering must not keep a perpetual RAF loop alive.
- Library runtime must not inject global host-page CSS. Demo-only presentation belongs in `style.css`.
- Ordinary verification workflows are read-only. They must not request write permissions or run `git push`.
- Purpose-specific mutation is allowed only through explicitly named deployment/release workflows covered by the repository workflow policy.
- Do not introduce React, another framework, state library or generic animation engine as incidental cleanup.
- Do not change visual parameters, labels, default data or DPR defaults as part of a typing/refactor task.

## Change discipline

- Use focused RED → GREEN tests for behavior or architecture-contract changes.
- Keep patches narrow and preserve the frozen public contract unless the task explicitly changes that contract.
- Prefer deleting superseded parallel implementation after verification to maintaining JS/TS renderer forks.
- Test-only shared environment plumbing under `tests/helpers/` is not permission to mirror that abstraction into production code.
- Do not silently replace Canvas 2D with DOM, SVG, WebGL or Three.js.
- Do not commit generated `dist/`, local logs, IDE state, `node_modules/` or installed `.agents/vendor/` copies.
- Do not edit `gh-pages` manually. Publication changes go through the canonical deployment workflow.

## Verification

For ordinary source changes run:

```bash
npm ci
npm audit --audit-level=high
npm run check
npm run typecheck
npm test
npm run build
```

`npm run typecheck` is a required strict TypeScript `noEmit` gate for the canonical Canvas implementation. Do not use `any` to silence migration errors.

`npm test` executes the Node regression suite for lifecycle, invalid remounts, stale ownership, viewport gating, runtime state, DPR semantics, structural demo contracts, asset ownership, workflow policy and the TypeScript architecture contract.

There is no full screenshot/pixel visual-regression suite or linter. Never call typecheck/Node tests pixel-level browser proof.

For visual/runtime changes, verify the preview in a real browser at representative Arc and Spiral sizes and exercise resizing, visibility, viewport entry/exit and reduced motion. The deployment workflow supplies public headless-browser readiness smoke, not screenshot comparison.

For a release, require source CI green on the exact source SHA, deployment workflow green for that SHA, public `source-sha.txt` convergence, public Arc/Spiral `ready` smoke, bundled asset integrity, strict typecheck and production build.

If required verification cannot run, record the exact blocker instead of substituting source inspection.

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
