# MOVES AWFUL TypeScript + React variant plan

Status: planned. Runtime, public-contract, parity and publication prerequisites are complete; the next implementation sequence is **#6 TypeScript core → #7 React adapter**.

## Goal

Keep MOVES AWFUL usable as a small standalone Canvas library while adding typed and React consumption paths without maintaining separate render-math implementations.

Target consumption model:

- Vanilla JavaScript remains a supported entry point during migration.
- TypeScript becomes the canonical typed core once parity is proven.
- React is an adapter over the same typed core, not a second animation implementation.
- Current standalone public variants remain Arc and Spiral unless a future feature explicitly adds more.

## Prerequisites — complete

The current standalone contract is frozen in `docs/public-contract.md` and already includes:

- mount/dispose and remount ownership;
- stale asynchronous mount protection;
- invalid replacement-mount cleanup;
- reduced-motion static rendering without perpetual RAF;
- document-visibility activity control;
- viewport gating;
- caller-provided `{ src, title? }` data;
- observable `loading / ready / error` state;
- opt-in `maxDpr` with unchanged historical default DPR behavior;
- verified source-to-`gh-pages` publication;
- public Arc/Spiral `ready` evidence in headless Chrome.

Issues #2, #3, #4 and #5 are complete. Additional production-site variants are not migration prerequisites.

## Required order

1. Start #6 from the current `docs/public-contract.md`; do not invent a new API during typing.
2. Add the smallest strict TypeScript toolchain and make typecheck a normal read-only CI gate.
3. Preserve all current Node behavioral, asset, workflow and deployment contract tests throughout the port.
4. Port public types and pure calculations first where this reduces risk.
5. Port lifecycle, activity, state and image-loading code without changing behavior.
6. Port Arc and Spiral renderer math without visual/default changes.
7. Expose a typed Vanilla adapter that preserves current JavaScript-facing usage.
8. Remove superseded parallel JS renderer code only after imports, tests, demo, build and browser readiness prove the typed path is canonical.
9. Start #7 only after #6 is complete.
10. Implement React as a thin adapter over the typed core, with StrictMode-safe lifecycle and SSR-safe imports.

## Proposed boundaries

### Core

Owns:

- Arc/Spiral variants and render math;
- normalized configuration;
- image loading/cache policy;
- Canvas sizing and redraw;
- activity state: viewport, visibility, reduced motion;
- lifecycle/disposal;
- runtime `loading / ready / error` state;
- portable item contract such as `{ src, title? }`;
- `maxDpr` semantics.

Does not own:

- React;
- site `MediaEntryId` / Media Catalog;
- browser mockup chrome;
- page-level copy/CMS;
- global DOM selectors;
- global host-page stylesheet mutation.

### Vanilla adapter

Owns:

- caller-provided element/canvas lookup or direct element reference;
- conversion from public options to core runtime;
- mount/dispose API compatible with the current public contract.

An attempted replacement mount must preserve the current ownership rule: the new attempt invalidates the older active/pending lifecycle even if its new target is missing or unusable.

### React adapter

Owns:

- props/ref boundary;
- effect lifecycle;
- StrictMode-safe setup/cleanup;
- prop-driven items/variant/config updates through an explicit deterministic contract;
- no duplicated renderer math or image-loading implementation.

React must be a peer dependency of the React adapter and must not become a dependency of the core/Vanilla path.

## Type targets

Use discriminated unions for variant-specific settings so invalid configuration combinations are unrepresentable. Start with Arc and Spiral only. Horizontal, Diagonal, Showcase Diagonal and Masonry remain future features, not hidden TypeScript-migration scope.

Preserve caller portability: the core accepts URLs/data, not `looksawful.ru` registry IDs.

## Verification gates

### #6 TypeScript core

- strict typecheck GREEN;
- no new `any`;
- current Node lifecycle/runtime/state/DPR/asset/workflow/deployment tests GREEN;
- production Vite build GREEN;
- Vanilla public contract preserved;
- no React dependency in core/Vanilla;
- public/browser readiness for Arc and Spiral remains GREEN;
- no visual/math/default-DPR drift.

### #7 React adapter

- React adapter tests GREEN, including StrictMode mount/unmount/remount;
- stale async mount protection preserved;
- prop-driven updates have an explicit tested contract;
- SSR/import safety proven: module evaluation does not require `window` or `document`;
- core/Vanilla tests and typecheck remain GREEN;
- React is a peer dependency and does not leak into core/Vanilla bundles;
- representative browser evidence confirms the adapter drives the same Canvas core.

## Explicit non-goals

- no React rewrite of renderer math;
- no framework-specific renderer implementation;
- no new gallery variants as incidental migration work;
- no site-specific CMS/Media Catalog dependency;
- no generic animation engine;
- no renderer migration away from Canvas 2D;
- no automatic deletion of the Vanilla entry point;
- no default DPR change disguised as migration cleanup.

## Completion

The plan is complete when #6 makes TypeScript the canonical core with a verified Vanilla adapter, then #7 adds React over that same core without parallel renderer logic or dependency leakage.
