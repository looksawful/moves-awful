---
name: moves-canvas-runtime
description: Use for Arc/Spiral Canvas rendering, assets, animation lifecycle, resize, reduced motion and performance work in MOVES AWFUL.
---

# MOVES AWFUL Canvas runtime

Work with the existing Canvas 2D modules instead of importing a generic animation architecture.

## Read first

1. Read `AGENTS.md`, `README.md` and `docs/public-contract.md`.
2. Read the complete target module before changing its rendering or lifecycle.
3. Inspect the matching asset directory and preview dimensions in `style.css`.
4. Treat current visual parameters, timing, labels and default datasets as authored behavior unless the task explicitly changes them.

## Runtime contract

Each animation module owns its mount lifecycle. Preserve these properties:

- one active animation per animation/canvas key;
- every new mount attempt claims that key before target validation, so an invalid replacement also invalidates any older active or pending owner;
- deterministic, idempotent `dispose()` behavior;
- stale async image/font completion cannot reactivate an obsolete mount;
- no duplicate RAF loop after remount or HMR;
- resize listener/observer cleanup;
- `IntersectionObserver` viewport gating with a safe no-observer fallback;
- document visibility pause/resume;
- motion-preference listener cleanup;
- reduced motion renders a static frame without a perpetual RAF and redraws after relevant resize/state changes;
- image promises are cached by URL and evicted after load failure;
- caller-provided `{ src, title? }` items replace the built-in demo dataset when supplied;
- partial image failure keeps the runtime usable with placeholders; zero renderable images expose `error` and do not start RAF;
- `canvas.dataset.galleryState` exposes `loading`, then `ready` or `error`;
- DPR-aware backing-store sizing;
- optional `maxDpr` has identical Arc/Spiral semantics: omitted or invalid values preserve device DPR, finite positive values cap effective DPR, and effective DPR never falls below `1`.

`docs/public-contract.md` is the compact consumer contract. Do not infer new public mount options from internal renderer constants.

Do not add global singleton state outside the module unless cross-animation coordination is explicitly required.

## Rendering and assets

- Keep layout calculations in CSS when they concern the preview/container rather than drawing geometry.
- Keep Canvas geometry in the animation module.
- Reference bundled images with `new URL("./assets/...", import.meta.url).href`.
- Preserve square center-crop behavior unless the task is specifically about image fitting.
- Avoid per-frame DOM writes and avoid new layout reads beyond the existing canvas size contract.
- Library runtime must not inject global host-page styles. Demo styling belongs in `style.css`; reusable renderer defaults and CSS-variable overrides stay local to the renderer/host cascade.
- Do not raise device pixel ratio cost casually. `maxDpr` may bound it per mount, but changing the library's default DPR policy still requires browser evidence at representative display densities.

## Motion and accessibility

- `prefers-reduced-motion` must remain supported.
- Visibility and viewport changes must not leave hidden/offscreen RAF work running.
- Any lifecycle change must be tested for repeated mount/dispose and invalid replacement cycles, not only first-page load.
- Canvas must not silently become the only carrier of essential textual information. The demo currently reuses its Arc/Spiral headings as Canvas accessible names and fallback text; richer public variants may require a broader accessibility contract.

## Abstraction rule

Arc and Spiral intentionally duplicate a small lifecycle layer today. Do not extract shared production helpers simply because duplication exists. Extract only when a third consumer, the planned typed core, or a concrete maintenance bug demonstrates that shared ownership is cheaper and safer.

## Verification

Run the checks from `.agents/skills/moves-verification/SKILL.md`. For visual changes, additionally verify Arc and Spiral in a real browser at narrow and desktop bounds, resize the viewport, exercise viewport entry/exit, switch tab visibility and test reduced-motion mode. Node regression tests are necessary runtime evidence, but not pixel-level browser proof.
