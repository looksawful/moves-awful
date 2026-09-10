import assert from "node:assert/strict";
import test from "node:test";

import {
  CANVAS_VARIANTS,
  importFresh,
  installCanvasEnvironment,
} from "./helpers/canvas-environment.mjs";

for (const variant of CANVAS_VARIANTS) {
  test(`${variant.name}: viewport observer gates continuous RAF work`, async () => {
    const env = installCanvasEnvironment({
      canvasId: "viewport-canvas",
      intersectionObserver: true,
    });

    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}.webp`, title: "Viewport" }],
      });

      assert.ok(env.viewportObserver, "expected the runtime to create an IntersectionObserver");
      assert.equal(env.viewportObserver.target, env.canvas);
      assert.equal(env.viewportObserver.options.rootMargin, "50% 0px");
      assert.equal(env.pendingRafCount, 0, "animation must wait until the canvas is near the viewport");

      env.viewportObserver.trigger(true);
      assert.equal(env.pendingRafCount, 1, "entering the viewport zone must start one RAF chain");

      env.viewportObserver.trigger(true);
      assert.equal(env.pendingRafCount, 1, "repeated visible callbacks must not multiply RAF ownership");

      env.viewportObserver.trigger(false);
      assert.equal(env.pendingRafCount, 0, "leaving the viewport zone must stop continuous RAF work");

      dispose();
      assert.equal(env.viewportObserver.disconnected, true);
    } finally {
      env.restore();
    }
  });
}
