---
name: moves-canvas-runtime
description: Use for Arc/Spiral Canvas rendering, assets, typed runtime contracts, animation lifecycle, resize, reduced motion and performance work in MOVES AWFUL.
---

# MOVES AWFUL Canvas runtime

Work with the existing Canvas 2D architecture instead of importing a generic animation system.

## Read first

1. Read `AGENTS.md`, `README.md` and `docs/public-contract.md`.
2. Read the canonical target implementation: `canvas-animations/arc.ts` or `canvas-animations/spiral.ts`.
3. Read `canvas-animations/core/types.ts` when changing a public/runtime type boundary.
4. Inspect the matching asset directory and preview dimensions in `style.css` for visual work.
5. Treat current visual parameters, timing, labels and default datasets as authored behavior unless the task explicitly changes them.

## Source boundary

- `.ts` files are canonical implementation.
- `.js` files are stable thin compatibility exports. Do not duplicate renderer/lifecycle code into them.
- Shared core types may express common contracts; do not extract a shared generic production runtime merely because Arc and Spiral contain similar local helpers.
- Keep the strict typecheck green without `any`.

## Runtime contract

Preserve these properties:

- one active animation per animation/canvas key;
- every new mount attempt claims that key before target validation;
- deterministic, idempotent `dispose()` behavior;
- stale async image/font completion cannot reactivate an obsolete mount;
- no duplicate RAF loop after remount or HMR;
- resize listener/observer cleanup;
- `IntersectionObserver` viewport gating with safe no-observer fallback;
- document visibility pause/resume;
- motion-preference listener cleanup;
- reduced motion renders a static frame without perpetual RAF and redraws after relevant resize/state changes;
- image promises are cached by URL and evicted after load failure;
- caller-provided `{ src, title? }` items replace the built-in demo dataset when supplied;
- partial image failure keeps the runtime usable with placeholders; zero renderable images expose `error` and do not start RAF;
- `canvas.dataset.galleryState` exposes `loading`, then `ready` or `error`;
- DPR-aware backing-store sizing;
- optional `maxDpr` has identical Arc/Spiral semantics and does not alter the default DPR policy when omitted.

`docs/public-contract.md` is authoritative for consumers. Typing/refactoring is not permission to expand it.

## Rendering and assets

- Keep preview/container layout in CSS and drawing geometry in the canonical TypeScript renderer.
- Reference bundled images with `new URL("./assets/...", import.meta.url).href`.
- Preserve square center-crop behavior unless the task is specifically about image fitting.
- Avoid per-frame DOM writes and unnecessary layout reads.
- Library runtime must not inject global host-page styles.
- Do not change authored geometry/timing/default DPR as incidental TypeScript or React work.

## Motion and accessibility

- `prefers-reduced-motion` must remain supported.
- Visibility and viewport changes must not leave hidden/offscreen RAF work running.
- Lifecycle changes require repeated mount/dispose and invalid replacement tests, not only first-page load.
- Canvas must not silently become the only carrier of essential textual information.

## Abstraction rule

Arc and Spiral may duplicate a small lifecycle layer. Extract shared implementation only when a real third consumer, the React adapter, or a concrete maintenance bug demonstrates that shared ownership is safer. A shared type is not by itself proof that shared runtime code is needed.

## Verification

Run the full chain from `.agents/skills/moves-verification/SKILL.md`. For behavior changes use focused RED → GREEN tests. For visual changes additionally verify Arc and Spiral in a real browser at narrow and desktop bounds, including viewport entry/exit, visibility and reduced motion. Typecheck and Node regression evidence are necessary, not pixel-level browser proof.
