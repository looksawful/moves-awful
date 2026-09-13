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
npm test
npm run build
```

A failed gate stops publication.

## Initial workflow proof

A push to `master` triggers this deployment workflow only when `.github/workflows/deploy.yml` itself changes. This exists so the first merged deployment workflow can prove the entire path. Ordinary source commits do not auto-deploy.

## Post-publication verification

After pushing `gh-pages`, the workflow waits for:

`https://looksawful.github.io/moves-awful/source-sha.txt`

to match the selected source SHA.

It then opens the public preview in headless Chrome and requires both `#arc` and `#spiral` canvases to reach `data-gallery-state="ready"`.

This public smoke proves that the deployed modules and bundled media initialize in a real browser. It is not pixel-level visual-regression evidence.

## Release evidence

A release record should include:

- source SHA;
- source CI run;
- deployment workflow run;
- resulting `gh-pages` commit;
- public `source-sha.txt` value;
- public Arc/Spiral browser-smoke result.

Do not describe a release as published merely because `master` CI is green.
