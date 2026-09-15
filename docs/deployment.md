# GitHub Pages deployment

`master` is the source branch. `gh-pages` is generated publication state.

The canonical publisher is `.github/workflows/deploy.yml`. Ordinary source CI remains read-only and does not imply that the public preview has been updated.

## What a deployment publishes

A deployment builds one exact `master` commit and publishes only the generated `dist/` tree plus:

- `.nojekyll`;
- `source-sha.txt`, containing the exact 40-character source commit SHA.

The workflow commits on top of the existing `gh-pages` history and never force-pushes it.

## Manual deployment

Run the **Deploy GitHub Pages** workflow with `workflow_dispatch` and provide the full 40-character `master` commit SHA in `source_sha`.

Before publication the workflow proves that the selected commit exists and is reachable from `origin/master`, checks it out detached and verifies the checkout SHA exactly.

It then runs:

```bash
npm ci
npm audit --audit-level=high
npm run check
npm run typecheck
npm test
npm run build
```

A failed gate stops publication.

## Workflow-change proof trigger

A push to `master` triggers this deployment workflow only when `.github/workflows/deploy.yml` itself changes. This exists so changes to the publisher can prove the entire path. Ordinary source commits do not auto-deploy.

## Post-publication verification

After pushing `gh-pages`, the workflow waits for:

`https://looksawful.github.io/moves-awful/source-sha.txt`

to match the selected source SHA.

The source marker alone is not enough. Pages/CDN propagation can expose the new marker before all public entrypoint/cache layers are serving one coherent generation.

The workflow therefore applies three separate public gates before calling a deployment verified:

1. **Generated-file reachability.** Enumerate every file from the exact production `dist/` tree and require each corresponding public URL to become reachable with bounded retries.
2. **Entrypoint byte coherence.** Hash fresh `dist/index.html`, derive its hashed JavaScript entry, then poll cache-busted public URLs until both public `index.html` bytes and the public JS entry bytes match the fresh build exactly. Browser smoke does not start until the public index also references that same hashed entry.
3. **Real-browser readiness.** Open the public preview in headless Chrome and require both `#arc` and `#spiral` canvases to reach `data-gallery-state="ready"` within the bounded cold-load budget.

On browser failure the workflow reports serialized Canvas state plus Chrome diagnostics without weakening the readiness requirement.

This public smoke proves that the deployed modules and bundled image media initialize in a real browser. It is not pixel-level visual-regression evidence.

## Verified proof deployments

Issue #4 is complete.

The original release-hardening proof was workflow run `34956827340`, which published source:

`90e863a00fa754a09f7b462a3eff5e33ab5afcc4`

That sequence established exact-source publication, generated-file reachability and public Canvas readiness.

After the strict TypeScript migration, deployment run `35033512850` exposed a new public-readiness regression even though source checks, publication, source marker and generated-file reachability had passed. That incident is recorded in `docs/incidents/2026-09-16-typescript-public-readiness-regression.md`.

The recovery sequence fixed the readiness boundary and strengthened the publisher rather than relaxing it. PR #35 added the entrypoint byte-coherence gate. Its merge produced source:

`c9490f50a12d414b63cf643c5e9eeecbe1deca6f`

Fresh post-merge source CI run `35034625027` was GREEN. Canonical deployment run `35034625046` was also GREEN and passed:

- exact source selection and `master` ancestry check;
- clean install;
- high-severity npm audit;
- repository/workflow checks;
- strict TypeScript check;
- full Node behavioral suite;
- Vite production build;
- generated publication staging and non-force `gh-pages` push;
- public source-marker convergence;
- reachability verification for every generated public file;
- exact byte coherence for public `index.html` and its hashed JS entry;
- headless-Chrome Arc and Spiral `ready` state.

As of that proof, the public preview is verified for exact source `c9490f50a12d414b63cf643c5e9eeecbe1deca6f`.

## Release evidence

A release record should include:

- source SHA;
- source CI run;
- deployment workflow run;
- resulting `gh-pages` commit;
- public `source-sha.txt` value;
- generated-public-file reachability result;
- public index/entry byte-coherence result;
- public Arc/Spiral browser-smoke result.

Do not describe a release as published merely because `master` CI is green. For visual changes, browser readiness is also not a substitute for screenshot/pixel comparison when such a visual contract is required.
