import assert from "node:assert/strict";
import test from "node:test";

import {
  CANVAS_VARIANTS,
  importFresh,
  installCanvasEnvironment,
} from "./helpers/canvas-environment.mjs";

const installEnvironment = ({ failImages = false, delayedImages = false } = {}) =>
  installCanvasEnvironment({
    canvasId: "state-canvas",
    failImages,
    autoSettleImages: !delayedImages,
  });

for (const variant of CANVAS_VARIANTS) {
  test(`${variant.name}: exposes loading then ready state`, async () => {
    const env = installEnvironment({ delayedImages: true });
    try {
      const module = await importFresh(variant.moduleUrl);
      const mounting = module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}-ready.webp`, title: "Ready" }],
      });

      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(env.canvas.dataset.galleryState, "loading");

      env.settleImages();
      const dispose = await mounting;
      assert.equal(env.canvas.dataset.galleryState, "ready");
      assert.equal(env.pendingRafCount, 1);
      dispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: all image failures expose error state without starting RAF`, async () => {
    const env = installEnvironment({ failImages: true });
    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}-missing.webp`, title: "Missing" }],
      });

      assert.equal(env.canvas.dataset.galleryState, "error");
      assert.equal(env.pendingRafCount, 0);
      assert.equal(typeof dispose, "function");
      dispose();
    } finally {
      env.restore();
    }
  });
}
