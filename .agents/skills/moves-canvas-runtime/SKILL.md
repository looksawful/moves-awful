---
name: moves-canvas-runtime
description: Use for Arc/Spiral Canvas rendering, portable item input, runtime state, animation lifecycle, viewport activity, resize, reduced motion and performance work in MOVES AWFUL.
---

# MOVES AWFUL Canvas runtime

Work with the existing Canvas 2D modules instead of importing a generic animation architecture.

## Read first

1. Read `AGENTS.md` and `README.md`.
2. Read the complete target module before changing its rendering or lifecycle.
3. Read the focused behavioral tests for the contract being changed.
4. Inspect the matching asset directory and preview dimensions in `style.css` when appearance or sizing is involved.
5. Treat current visual parameters, labels and default datasets as authored behavior unless the task explicitly changes them.

## Runtime contract

Each animation module owns its mount lifecycle. Preserve these properties:

- one active animation per animation/canvas key;
- idempotent `dispose()` behavior;
- no duplicate RAF loop after remount; HMR cleanup must call the same disposal boundary;
- stale asynchronous mounts must not replace a newer owner;
- resize listener/observer cleanup;
- `IntersectionObserver` viewport-proximity gating with no-observer fallback;
- document visibility pause/resume;
- motion-preference listener cleanup;
- reduced-motion static rendering without a perpetual RAF loop;
- image promises cached by URL and evicted after load failure;
- built-in demo data remains available when caller items are omitted;
- portable caller items use `{ src, title? }` and do not import site Media Catalog IDs;
- partial image failure remains renderable through placeholders;
- `canvas.dataset.galleryState` reports `loading`, `ready` or `error` without stale mounts overwriting newer state;
- no RAF starts when no image is renderable;
- DPR-aware backing-store sizing.

Do not add cross-module global singleton state unless cross-animation coordination is explicitly required.

## Rendering and assets

- Keep layout calculations in CSS when they concern the preview/container rather than drawing geometry.
- Keep Canvas geometry in the animation module.
- Reference bundled images with `new URL("./assets/...", import.meta.url).href`.
- Preserve square center-crop behavior unless the task is specifically about image fitting.
- Avoid per-frame DOM writes and new layout reads beyond the existing canvas size contract.
- Do not raise device-pixel-ratio cost casually. The production site currently caps the Moves gallery at `1.5`; that is evidence for evaluating a standalone cap, not authority to copy the value without a focused test and browser-quality check.

## Motion and accessibility

- `prefers-reduced-motion` must remain supported.
- Reduced motion stops continuous advancement and renders a stable frame; resize/activity changes must still be able to repaint it.
- `document.hidden` and offscreen/near-viewport transitions must not leave hidden RAF work running.
- When `IntersectionObserver` is unavailable, the fallback must remain usable rather than disabling animation entirely.
- Any lifecycle change must be tested for repeated mount/dispose and stale-mount ownership, not only a first-page load.
- Canvas must not become the sole carrier of essential content when new demo/accessibility work is added.

## State and failure semantics

Treat runtime state as caller-observable API:

- `loading`: asynchronous asset work for the current mount is pending;
- `ready`: at least one image is renderable; individual failures may use placeholders;
- `error`: no image is renderable, so continuous RAF must not start.

Do not convert a partial asset failure into global `error`. Do not let an older asynchronous mount overwrite the state of a newer mount.

## Abstraction rule

Arc and Spiral intentionally duplicate a small lifecycle layer today. Do not extract shared helpers simply because duplication exists. Extract only when a third consumer, typed core or concrete bug demonstrates that shared ownership is cheaper and safer.

Do not copy `looksawful.ru` Media Catalog IDs, CMS ownership, page selectors, browser chrome or site-only masonry profile into the library core.

## Verification

Run the checks from `.agents/skills/moves-verification/SKILL.md`.

For behavior changes, begin with a focused failing test and preserve the RED evidence before implementing the fix. For visual/DPR changes, additionally verify Arc and Spiral in a real browser at representative responsive bounds and display densities. For HMR claims, run an actual Vite dev-server HMR cycle rather than treating remount tests as identical evidence.
