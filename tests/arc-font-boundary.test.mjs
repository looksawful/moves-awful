import assert from "node:assert/strict";
import test from "node:test";

import { importFresh, installCanvasEnvironment } from "./helpers/canvas-environment.mjs";

const ARC_MODULE = new URL("../canvas-animations/arc.js", import.meta.url).href;

test("Arc: unresolved host font loading does not block image loading or mount readiness", async () => {
  const env = installCanvasEnvironment({ autoSettleImages: false });

  try {
    // A reusable Canvas library must not let an unrelated host font promise
    // keep its runtime in `loading` forever. The renderer can use the browser's
    // fallback font while host-managed font loading proceeds independently.
    env.document.fonts.load = () => new Promise(() => {});

    const module = await importFresh(ARC_MODULE);
    const mounting = module.mountArc(env.canvas.id, {
      items: [{ src: "https://example.test/arc-font-boundary.webp", title: "Boundary" }],
    });

    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(env.canvas.dataset.galleryState, "loading");
    assert.equal(
      env.pendingImageCount,
      1,
      "Arc must start image loading without waiting for host font readiness",
    );

    env.settleImages();
    const dispose = await mounting;

    assert.equal(env.canvas.dataset.galleryState, "ready");
    assert.equal(env.pendingRafCount, 1);
    dispose();
  } finally {
    env.restore();
  }
});
