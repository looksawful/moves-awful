# MOVES AWFUL agent instructions

This repository is a deliberately small Vite + vanilla JavaScript Canvas project. Preserve that simplicity unless the task explicitly requires a larger architectural change.

## Read first

1. Read `README.md`, `docs/public-contract.md` and `docs/deployment.md` when publication or release status matters.
2. Read the relevant project skill in `.agents/skills/`.
3. Inspect the current implementation before editing. Do not infer behavior from names or old notes.
4. Read `package.json` for the actual scripts and dependency versions.
5. If the task needs generic specialist guidance, inspect `skills/vendor/registry.yaml` and install only the relevant reviewed vendor skill. Repository-local rules remain authoritative.

## Repository contracts

- `master` is the source branch.
- `gh-pages` is generated publication state. Do not treat it as a stale feature branch and do not hand-edit it during ordinary source work.
- `.github/workflows/deploy.yml` is the canonical publisher. Ordinary CI success is not deployment success.
- A published release must be traceable to the exact full `master` SHA through public `source-sha.txt` and the deployment-run evidence.
- `docs/public-contract.md` is the compact consumer contract for the current Vanilla API. Internal renderer constants are not public options merely because they are documented or visible in source.
- `index.html` is the preview/mount harness, not a product application shell.
- `canvas-animations/arc.js` and `canvas-animations/spiral.js` are independent modules with explicit mount/dispose lifecycle.
- A new mount attempt owns the animation/canvas key immediately: it must invalidate an older active or pending lifecycle even when the new Canvas is missing or has no 2D context.
- Caller-provided `{ src, title? }` items replace the built-in demo dataset when supplied.
- Runtime state is caller-observable through `canvas.dataset.galleryState`: `loading`, then `ready` when at least one image is renderable, or `error` when none is renderable.
- `maxDpr` is an optional common mount option. Omitted or invalid values preserve device DPR; a finite positive value caps backing-store DPR without allowing effective DPR below `1`. Do not change the default DPR policy without browser evidence.
- Assets belong under `canvas-animations/assets/<animation>/` and should be referenced with `new URL(..., import.meta.url)` so Vite can resolve them. Bundled-reference integrity is a release gate.
- Preserve HMR cleanup, resize cleanup, visibility handling, viewport gating, image-cache behavior and disposal when changing runtime code.
- Preserve `prefers-reduced-motion`: static reduced-motion rendering must not keep a perpetual RAF loop alive.
- Library runtime must not inject global host-page CSS. Demo-only presentation belongs in `style.css`; reusable Arc label defaults/overrides belong to the renderer/CSS-variable contract.
- Ordinary verification workflows are read-only. They must not request `*: write`, use `permissions: write-all`, or run `git push`.
- Purpose-specific mutation is allowed only through explicitly named `deploy.yml`, `deploy.yaml`, `release.yml`, or `release.yaml` workflows; adding another mutating workflow requires changing and testing the policy deliberately.
- Do not introduce a framework, TypeScript migration, state library, generic animation engine or shared abstraction as incidental cleanup.
- Do not change visual parameters, labels or asset selection unless the task requires a visual change.

## Change discipline

- Keep patches narrow. This codebase does not benefit from speculative abstraction.
- Prefer deleting proven dead code to wrapping it in another layer.
- A third animation may justify extracting shared production Canvas lifecycle helpers; two similar files alone are not sufficient proof.
- Test-only shared environment plumbing under `tests/helpers/` is not permission to mirror that abstraction into production code.
- Do not silently replace Canvas 2D with DOM, SVG, WebGL or Three.js.
- Do not commit generated `dist/`, local logs, IDE state, `node_modules/` or installed `.agents/vendor/` copies.
- Do not edit `gh-pages` manually. Publication changes go through the canonical deployment workflow so generated output, source SHA and public smoke evidence stay linked.

## Verification

For ordinary source changes run, when the environment supports them:

```bash
npm ci
npm audit --audit-level=high
npm run check
npm test
npm run build
```

`npm run check` includes source/test syntax coverage and the checked-in GitHub Actions workflow policy. The dependency-free Node suite covers the modeled Canvas lifecycle, invalid remounts, viewport gating, runtime state, DPR option semantics, structural demo contracts, bundled asset references, deployment-contract structure and workflow-policy fixtures.

There is currently no full visual-regression suite, linter or typecheck. Never describe those nonexistent checks as passing, and never treat Node lifecycle tests as pixel-level browser evidence.

For visual/runtime changes, also verify the preview in a real browser at representative Arc and Spiral sizes and check console errors, resizing, tab visibility changes, viewport entry/exit and reduced-motion behavior. The deployment workflow supplies real-browser public readiness smoke for Arc/Spiral, but screenshot/pixel comparison remains separate evidence.

For a release, require all of the following:

1. source CI green on the exact release SHA;
2. deployment workflow green for that exact SHA;
3. public `source-sha.txt` equals that SHA;
4. public Arc and Spiral reach `data-gallery-state="ready"` in the deployment browser smoke;
5. bundled asset-integrity tests and Vite build are green.

If a required verification cannot run, record the exact blocker instead of substituting source inspection for runtime evidence.

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
