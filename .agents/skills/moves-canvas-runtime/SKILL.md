---
name: moves-canvas-runtime
description: Use for Arc/Spiral Canvas rendering, assets, animation lifecycle, resize, reduced motion and performance work in MOVES AWFUL.
---

# MOVES AWFUL Canvas runtime

Work with the existing Canvas 2D modules instead of importing a generic animation architecture.

## Read first

1. Read `AGENTS.md` and `README.md`.
2. Read the complete target module before changing its rendering or lifecycle.
3. Inspect the matching asset directory and preview dimensions in `style.css`.
4. Treat current visual parameters and labels as authored behavior unless the task explicitly changes them.

## Runtime contract

Each animation module owns its mount lifecycle. Preserve these properties:

- one active animation per animation/canvas key;
- deterministic `dispose()` behavior;
- no duplicate RAF loop after remount or HMR;
- resize listener/observer cleanup;
- document visibility pause/resume;
- motion-preference listener cleanup;
- image promises cached by URL and evicted after load failure;
- DPR-aware backing-store sizing;
- graceful placeholder rendering when an image cannot load.

Do not add global singleton state outside the module unless cross-animation coordination is explicitly required.

## Rendering and assets

- Keep layout calculations in CSS when they concern the preview/container rather than drawing geometry.
- Keep Canvas geometry in the animation module.
- Reference bundled images with `new URL("./assets/...", import.meta.url).href`.
- Preserve square center-crop behavior unless the task is specifically about image fitting.
- Avoid per-frame DOM writes and avoid new layout reads beyond the existing canvas size contract.
- Do not raise device pixel ratio cost casually. If introducing a DPR cap, verify visual quality at representative display densities.

## Motion and accessibility

- `prefers-reduced-motion` must remain supported.
- A reduced-motion improvement may render a stable frame instead of continuously advancing animation, but must still repaint after resize or relevant state changes.
- Visibility changes should not leave a hidden RAF loop running.
- Any lifecycle change must be tested for repeated mount/dispose cycles, not only a first-page load.

## Abstraction rule

Arc and Spiral intentionally duplicate a small lifecycle layer today. Do not extract shared helpers simply because duplication exists. Extract only when a third consumer or a concrete bug demonstrates that shared ownership is cheaper and safer.

## Verification

Run the checks from `.agents/skills/moves-verification/SKILL.md`. For visual changes, additionally verify Arc and Spiral in a browser at their current responsive bounds, resize the viewport, switch tab visibility and exercise reduced-motion mode.
