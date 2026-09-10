# MOVES AWFUL TypeScript + React variant plan

Status: planned; runtime prerequisites #2/#3 are complete, but no production TypeScript/React migration is authorized by this document alone.

## Goal

Keep MOVES AWFUL usable as a small standalone Canvas library while adding typed and React consumption paths without maintaining separate render-math implementations.

Target consumption model:

- Vanilla JavaScript remains a supported entry point during migration.
- TypeScript becomes the canonical typed core once behavioral parity is proven.
- React is an adapter over the same typed core, not a second animation implementation.
- Consumers can choose a generic gallery with a `variant` option or narrow Arc/Spiral convenience exports.

## Current prerequisite state

Completed and already covered by the standalone Node regression suite:

- mount/dispose and remount ownership;
- stale asynchronous mount protection;
- invalid replacement mount cleanup;
- reduced-motion static rendering without perpetual RAF;
- document-visibility activity control;
- viewport gating;
- caller-provided `{ src, title? }` data;
- observable `loading` / `ready` / `error` state.

Still evidence-gated before expanding the public variant surface:

- final standalone DPR policy;
- browser proof for visually observable behavior;
- decisions and evidence for Horizontal, Diagonal, Showcase Diagonal and Masonry under #5.

## Required order

1. Treat the completed #2/#3 runtime behavior plus current hardening tests as the migration baseline. New behavior must still start with a failing behavioral test when applicable.
2. Finish the #5 decisions that materially affect the typed public contract. Do not block typing on site-only features that are explicitly rejected.
3. Define portable item/config/lifecycle contracts without importing `looksawful.ru` Media Catalog types.
4. Port the core runtime to strict TypeScript with no `any` and no visual/math change.
5. Keep a Vanilla adapter that mounts the typed core into a caller-provided Canvas/container and returns an idempotent disposer.
6. Add a React adapter that owns mount/dispose through refs/effects and tolerates React StrictMode remounts without duplicate RAF/listener ownership.
7. Add package/export boundaries only after both adapters are verified; do not publish a package merely to create architecture.

## Proposed boundaries

### Core

Owns:

- variants and render math;
- normalized configuration;
- image loading/cache policy;
- Canvas sizing and redraw;
- activity state: viewport, visibility, reduced motion;
- lifecycle/disposal;
- runtime loading/ready/error state;
- portable item contract such as `{ src, title? }`.

Does not own:

- React;
- site MediaEntryId/Media Catalog;
- browser mockup chrome;
- page-level copy/CMS;
- global DOM selectors;
- global host-page stylesheet mutation.

### Vanilla adapter

Owns:

- caller-provided element/canvas lookup or direct element reference;
- conversion from public options to core runtime;
- mount/dispose API compatible with existing standalone usage where practical.

An attempted replacement mount must preserve the current ownership rule: the new attempt invalidates the older active/pending lifecycle even if its new target is missing or unusable.

### React adapter

Owns:

- props/ref boundary;
- effect lifecycle;
- StrictMode-safe setup/cleanup;
- optional controlled `variant` prop;
- no duplicated renderer math or image-loading implementation.

React must be a peer dependency of the React adapter and must not become a dependency of the core/Vanilla path.

## Type targets

Use discriminated unions for variant-specific settings so invalid configuration combinations are unrepresentable. Start with the currently supported Arc/Spiral contracts; add Horizontal/Diagonal/Showcase/Masonry only through the parity work tracked separately, not as an incidental consequence of TypeScript.

Preserve caller portability: the core accepts URLs/data, not `looksawful.ru` registry IDs.

## Verification gates

- current JS runtime suite green before and throughout the port;
- TypeScript strict check green;
- no new `any`;
- focused runtime/lifecycle tests green;
- production Vite build green;
- Vanilla demo parity for every supported variant;
- React StrictMode mount/unmount/remount proof;
- invalid-target remount behavior equivalent across supported adapters;
- reduced-motion, resize, visibility and offscreen behavior equivalent across adapters;
- bundle dependency check proving React is absent from the Vanilla/core path;
- browser screenshots/evidence tied to an exact source SHA for visually observable variants.

## Explicit non-goals

- no React rewrite of the repository demo before the core contract exists;
- no framework-specific render math;
- no site-specific CMS/media-catalog dependency;
- no generic animation engine;
- no renderer migration away from Canvas 2D;
- no automatic deletion of the Vanilla entry point when TypeScript lands.
