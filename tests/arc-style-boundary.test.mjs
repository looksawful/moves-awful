import assert from "node:assert/strict";
import test from "node:test";

import {
  CANVAS_VARIANTS,
  importFresh,
  installCanvasEnvironment,
} from "./helpers/canvas-environment.mjs";

const arc = CANVAS_VARIANTS.find((variant) => variant.name === "Arc");

test("Arc mount does not inject global host-page styles", async () => {
  const env = installCanvasEnvironment({
    canvasId: "arc-style-canvas",
    reducedMotion: true,
  });

  try {
    const module = await importFresh(arc.moduleUrl);
    const dispose = await module[arc.mountName](env.canvas.id, {
      items: [{ src: "https://example.test/arc.webp", title: "Arc" }],
    });

    assert.equal(env.canvas.dataset.galleryState, "ready");
    assert.equal(env.appendedStyles, 0, "library mount must not append global style elements");
    dispose();
  } finally {
    env.restore();
  }
});
