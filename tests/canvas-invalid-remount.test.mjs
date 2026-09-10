import assert from "node:assert/strict";
import test from "node:test";

import {
  CANVAS_VARIANTS,
  importFresh,
  installCanvasEnvironment,
} from "./helpers/canvas-environment.mjs";

const installEnvironment = ({ delayedImages = false } = {}) =>
  installCanvasEnvironment({
    canvasId: "remount-canvas",
    autoSettleImages: !delayedImages,
  });

for (const variant of CANVAS_VARIANTS) {
  test(`${variant.name}: invalid remount disposes the previous active lifecycle`, async () => {
    const env = installEnvironment();

    try {
      const module = await importFresh(variant.moduleUrl);
      const firstDispose = await module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}.webp`, title: "Active" }],
      });

      assert.equal(env.pendingRafCount, 1);
      assert.equal(env.window.listenerCount("resize"), 1);
      assert.equal(env.document.listenerCount("visibilitychange"), 1);

      env.setCanvasPresent(false);
      const invalidDispose = await module[variant.mountName](env.canvas.id);

      assert.equal(typeof invalidDispose, "function");
      assert.equal(env.pendingRafCount, 0, "a newer mount attempt must invalidate the old RAF owner");
      assert.equal(env.window.listenerCount("resize"), 0);
      assert.equal(env.document.listenerCount("visibilitychange"), 0);

      firstDispose();
      invalidDispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: invalid remount invalidates an older pending async mount`, async () => {
    const env = installEnvironment({ delayedImages: true });

    try {
      const module = await importFresh(variant.moduleUrl);
      const firstMount = module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}-pending.webp`, title: "Pending" }],
      });

      await new Promise((resolve) => setImmediate(resolve));
      env.setCanvasPresent(false);
      const invalidDispose = await module[variant.mountName](env.canvas.id);

      env.settleImages();
      const staleDispose = await firstMount;

      assert.equal(env.pendingRafCount, 0, "the stale async mount must not reactivate after target invalidation");
      assert.equal(env.window.listenerCount("resize"), 0);
      assert.equal(env.document.listenerCount("visibilitychange"), 0);

      staleDispose();
      invalidDispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: unavailable 2d context also invalidates the previous active lifecycle`, async () => {
    const env = installEnvironment();

    try {
      const module = await importFresh(variant.moduleUrl);
      const firstDispose = await module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}-context.webp`, title: "Context" }],
      });

      assert.equal(env.pendingRafCount, 1);
      env.setContextAvailable(false);
      const invalidDispose = await module[variant.mountName](env.canvas.id);

      assert.equal(env.pendingRafCount, 0);
      assert.equal(env.window.listenerCount("resize"), 0);
      assert.equal(env.document.listenerCount("visibilitychange"), 0);

      firstDispose();
      invalidDispose();
    } finally {
      env.restore();
    }
  });
}
