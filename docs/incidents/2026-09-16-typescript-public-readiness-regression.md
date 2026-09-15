# Public Canvas readiness regression after TypeScript migration — 2026-09-16

**Status:** resolved.

## Incident

The strict TypeScript core migration merged to `master` as `769aa9430de1c2dc1c9f7dd63cfb6200069387f1` and passed ordinary source CI, but its automatic GitHub Pages deployment failed the final public-browser readiness gate.

Failed deployment run: `35033512850`.

The failed run successfully completed install, high-severity audit, repository/workflow checks, strict typecheck, all 66 Node behavioral/architecture tests, production Vite build, non-force `gh-pages` publication, `source-sha.txt` convergence and reachability checks for all 48 generated public files. The failure boundary was later: five headless-Chrome attempts serialized both public canvases in `loading` state.

```html
<canvas id="arc" role="img" aria-labelledby="arc-title" data-gallery-state="loading">
<canvas id="spiral" role="img" aria-labelledby="spiral-title" data-gallery-state="loading">
```

## Root cause and runtime fix

PR #32, `fix: do not block gallery readiness on image.decode`, removed a readiness dependency that was stronger than the browser contract required.

After an image fires `load`, it is already drawable. The migrated loader still awaited optional `image.decode()`. In the affected public headless environment that additional promise could remain unsettled long enough to keep both mounts in `loading` despite successful image delivery.

TDD evidence for the fix:

- RED commit `cc5db4b9a3ee52b37dfd99aeef077d0b306b3d2b`, Actions run `35033759562`;
- implementation commit `539326452bed73a1c3c01716c0861e3f964ed52d`;
- one-shot GREEN verification run `35033837284`;
- normal PR CI GREEN run `35033919154`;
- PR #32 merged as `61f0785d9a8013d16485648d168b1ab878d1f49b`.

The fix changed readiness sequencing only. Renderer geometry, assets, public item/config contracts, styles and DPR behavior were not redesigned.

## Browser isolation proof

A branch-only diagnostic workflow then built the current production bundle, served it through local Vite preview and opened it in real headless Chrome with the same 30-second virtual-time class used by the deployment smoke.

Diagnostic run `35034190530`, job `104599380341`, was GREEN: both Arc and Spiral reached `data-gallery-state="ready"`.

That separated canonical bundle/runtime behavior from remaining Pages/CDN publication coherence risk.

## Deployment hardening

PR #35 added a public-entrypoint coherence gate before browser smoke.

The earlier deployment already required:

1. exact source selection;
2. source CI-equivalent checks;
3. non-force publication;
4. public `source-sha.txt` convergence;
5. HTTP reachability of every freshly generated public file;
6. public Arc/Spiral headless-Chrome readiness.

The incident demonstrated that a marker and a set of individually reachable files can still be insufficient evidence that the public entrypoint is serving one coherent generation. PR #35 therefore added a bounded cache-busted gate that requires:

- public `index.html` bytes to match fresh `dist/index.html`;
- the public index to reference the same hashed JS entry as the fresh build;
- public JS entry bytes to match the fresh generated entry;
- browser smoke to start only after those conditions hold.

TDD evidence:

- RED head `fdd1cef389d1825e224b51b9916f4ac0b438a35e`, CI run `35034502699`: 68 tests passed and the one new deployment-coherence contract failed exactly as intended;
- GREEN head `37990e4b906be1dfdacefb7a2c3497763e6374e8`, CI run `35034578003`: install, audit, checks, strict typecheck, all 69 tests and production build passed;
- PR #35 merged as source `c9490f50a12d414b63cf643c5e9eeecbe1deca6f`.

## Final production proof

Post-merge ordinary CI run `35034625027` passed on `c9490f50a12d414b63cf643c5e9eeecbe1deca6f`.

Canonical GitHub Pages deployment run `35034625046` then passed every step on the same source SHA, including:

- exact source selection and master ancestry check;
- clean install;
- high-severity npm audit;
- repository/workflow checks;
- strict TypeScript check;
- full Node behavioral suite;
- production build;
- non-force `gh-pages` publication;
- public source-marker convergence;
- reachability of every generated public file;
- byte coherence of public `index.html` and the hashed JS entry with the fresh build;
- public Arc and Spiral both reaching `data-gallery-state="ready"` in headless Chrome.

The public preview therefore has fresh end-to-end readiness proof for source:

`c9490f50a12d414b63cf643c5e9eeecbe1deca6f`

## Resolution

The incident is closed. The release gate was not weakened to make the deployment green; it became stricter and then passed.

React work in #7 is no longer blocked by this incident. Future public-readiness claims must continue to distinguish ordinary source CI from exact public deployment evidence, because apparently even a green build can still find creative ways to lie by omission.
