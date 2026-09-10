# MOVES AWFUL public Vanilla contract

This document is the compact consumer contract for the current standalone Vanilla library. It describes supported public behavior, not every internal renderer constant.

## Supported variants and entry points

The public standalone variants are currently:

- Arc: `mountArc(canvasId, options?)` from `canvas-animations/arc.js`;
- Spiral: `mountSpiral(canvasId, options?)` from `canvas-animations/spiral.js`.

Both functions are asynchronous and resolve to a disposer function. Calling the disposer more than once is safe.

## Canvas target

`canvasId` identifies the Canvas element owned by that mount attempt.

A new mount attempt for the same variant and Canvas key immediately supersedes the older active or pending attempt. This ownership rule also applies when the replacement target is missing or cannot provide a 2D context: the older lifecycle must not remain active merely because the newer attempt cannot start.

A missing Canvas or unavailable 2D context returns a safe no-op disposer rather than leaving animation work active.

## Media items

Both variants accept the same portable item shape through `options.items`:

```js
{
  src: string,
  title?: string
}
```

When `options.items` is an array it replaces the bundled demo dataset for that mount. Items without a usable `src` are ignored. `title` is optional; Arc renders it when present, while Spiral currently treats it as portable metadata rather than visible text.

When `options.items` is omitted, each variant uses its bundled demo media.

## Runtime state

The target Canvas exposes runtime state through:

```js
canvas.dataset.galleryState
```

Supported values are:

- `loading`: media loading is in progress;
- `ready`: at least one media item is renderable;
- `error`: no media item is renderable.

An all-image failure reaches `error` and owns no continuous animation frame loop. Partial failures remain usable through the renderer placeholder behavior.

## Activity and lifecycle

The current runtime contract includes:

- at most one active lifecycle owner per variant/Canvas key;
- stale asynchronous mounts cannot replace newer ownership;
- disposal removes owned RAF work, resize/visibility/motion listeners and observers;
- hidden documents stop continuous animation work;
- `prefers-reduced-motion` produces a static presentation without a perpetual RAF loop;
- when `IntersectionObserver` exists, continuous work is gated by viewport proximity using the renderer's current observer policy;
- when `IntersectionObserver` is unavailable, the runtime falls back to the non-observer activity path.

These are behavioral contracts. Pixel appearance and browser performance require separate browser evidence.

## DPR control

Both variants accept the same optional mount option:

```js
{
  maxDpr?: number
}
```

`maxDpr` bounds Canvas backing-store pixel density without changing CSS layout size.

Rules:

- omitted: use the current device/environment DPR, preserving historical behavior;
- finite positive number: effective DPR is `min(deviceDpr, max(1, maxDpr))`;
- values below `1` therefore resolve to effective DPR `1`;
- values above device DPR do not increase device DPR;
- zero, negative, `NaN`, non-finite values and non-number values are ignored, preserving device-DPR behavior;
- the effective DPR is recalculated during render/resize work so the cap continues to apply after Canvas resizing.

There is intentionally no lower default DPR cap yet. Choosing a default such as `1.5` remains evidence-gated by real-browser visual/performance testing; the opt-in option does not silently change existing output.

## Arc title styling

Arc accepts host styling through these CSS custom properties on the Canvas or an ancestor:

- `--arc-title-font-family`;
- `--arc-title-font-weight`;
- `--arc-title-color`.

When absent, Arc uses its existing renderer-local fallbacks. Mounting the library must not inject a global host-page stylesheet.

## What is not public API

The internal Arc/Spiral geometry, timing constants and bundled demo datasets are implementation details unless a later version deliberately exposes them. The configuration tables in repository documentation describe current authored renderer parameters; they are not implied mount-option keys.

Horizontal, Diagonal, Showcase Diagonal and Masonry are not public standalone variants yet. Production-site implementations remain reference evidence only until each candidate earns a portable contract plus behavioral and real-browser visual evidence.

## Compatibility boundary

Future TypeScript and React work must consume this contract rather than silently redefine it. Contract changes should be explicit, tested and documented; architectural migration alone is not permission to alter lifecycle, media, state or DPR semantics.
