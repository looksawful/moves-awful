# MOVES AWFUL TypeScript + React variant plan

Status: planned; no production migration authorized by this document alone.

## Goal

Keep MOVES AWFUL usable as a small standalone Canvas library while adding typed and React consumption paths without maintaining separate render-math implementations.

Target consumption model:

- Vanilla JavaScript remains a supported entry point during migration.
- TypeScript becomes the canonical typed core once the current runtime contract and selected portable parity surface are frozen by evidence.
- React is an adapter over the same typed core, not a second animation implementation.
- Consumers can choose a generic gallery with a `variant` option or narrow Arc/Spiral convenience exports.

## Current prerequisite state

Completed before this plan is executed:

- mount/dispose ownership and stale asynchronous mount behavior are covered by Node behavioral tests;
- reduced motion stops continuous RAF work and preserves static redraw;
- document visibility and resize lifecycle are behaviorally covered;
- viewport-proximity gating is implemented with `IntersectionObserver` and a no-observer fallback;
- portable caller items use `{ src, title? }` while built-in demo datasets remain supported;
- explicit `loading` / `ready` / `error` state is implemented.

Still required before the typed core should become canonical:

- finish the selected portable parity decisions in #5, especially DPR policy and whether any extra variants belong in the standalone library;
- obtain real-browser smoke/visual evidence for the current Arc/Spiral runtime and state/activity behavior;
- keep publication work in #4 separate from type migration unless packaging/deployment requires it.

## Required order

1. Complete the remaining library-level parity decisions in #5 without importing `looksawful.ru` Media Catalog/CMS ownership.
2. Add the smallest reliable real-browser evidence for Arc/Spiral, runtime state, resize, visibility, reduced motion and viewport activity.
3. Define the public portable item/config/lifecycle contracts that the typed core will freeze.
4. Port the canonical runtime to strict TypeScript with no `any` and no visual/math change.
5. Keep a Vanilla adapter that mounts the typed core into a caller-provided Canvas/container and returns an idempotent disposer.
6. Add a React adapter that owns mount/dispose through refs/effects and tolerates React StrictMode remounts without duplicate RAF/listener/observer ownership.
7. Add package/export boundaries only after both adapters are verified; do not publish a package merely to create architecture.
8. Resolve publication traceability in #4 against the final supported consumption path.

## Proposed boundaries

### Core

Owns:
- variants and render math;
- normalized configuration;
- portable item input;
- image loading/cache policy;
- Canvas sizing and redraw;
- activity state: viewport, visibility, reduced motion;
- observable runtime state;
- lifecycle/disposal.

Does not own:
- React;
- site MediaEntryId/Media Catalog;
- CMS/page copy;
- browser mockup chrome;
- global site selectors;
- publication branch mechanics.

### Vanilla adapter

Owns:
- caller-provided element/canvas lookup or direct element reference;
- conversion from public options to core runtime;
- mount/dispose API compatible with existing standalone usage where practical;
- no React dependency.

### React adapter

Owns:
- props/ref boundary;
- effect lifecycle;
- StrictMode-safe setup/cleanup;
- optional controlled `variant` prop;
- explicit behavior for prop-driven item/config changes;
- SSR-safe import/setup behavior;
- no duplicated renderer math or image-loading implementation.

React must be a peer dependency of the React adapter and must not become a dependency of the core/Vanilla path.

## Type targets

Use discriminated unions for variant-specific settings so invalid configuration combinations are unrepresentable.

Start with the currently supported Arc/Spiral contracts. Add Horizontal/Diagonal/Showcase/Masonry only through #5 with their own behavioral and visual evidence, not as an incidental consequence of TypeScript.

Preserve caller portability: the core accepts URLs/data, not `looksawful.ru` registry IDs.

Candidate public concepts to type explicitly:

- `GalleryItem = { src: string; title?: string }`;
- supported variant union;
- common runtime options;
- variant-specific configuration;
- runtime state `loading | ready | error`;
- mount result/disposer ownership;
- optional DPR policy if accepted under #5.

Do not expose internal maps, tokens or site-only types as public API merely because TypeScript makes them easy to name.

## Migration discipline

- Characterize any behavior not already covered before changing it.
- For new behavior, use a failing test first.
- Port implementation in small slices; avoid a simultaneous framework, rendering and API redesign.
- Preserve Arc/Spiral visual parameters and default asset selection during the type-only port.
- Do not maintain `.js` and `.ts` copies of the same renderer as long-lived parallel implementations.
- Keep generated declarations/build artifacts out of source unless packaging later requires them.

## Verification gates

- current JS behavioral suite green before port;
- real-browser baseline captured before type migration;
- TypeScript strict check green;
- no new `any`;
- focused runtime/lifecycle/state tests green;
- production Vite build green;
- Vanilla demo parity for every supported variant;
- React StrictMode mount/unmount/remount proof;
- reduced-motion, resize, visibility and offscreen behavior equivalent across adapters;
- bundle dependency check proving React is absent from the Vanilla/core path;
- browser screenshots/evidence tied to an exact source SHA for visually observable variants;
- no source/publication claim inferred solely from a successful build.

## Explicit non-goals

- no React rewrite of the repository demo before the core contract exists;
- no framework-specific render math;
- no site-specific CMS/media-catalog dependency;
- no generic animation engine;
- no renderer migration away from Canvas 2D;
- no automatic deletion of the Vanilla entry point when TypeScript lands;
- no extra variants smuggled into the TypeScript migration without #5 evidence.
