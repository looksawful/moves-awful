import assert from "node:assert/strict";
import test from "node:test";

import {
  CANVAS_VARIANTS,
  importFresh,
  installCanvasEnvironment,
} from "./helpers/canvas-environment.mjs";

for (const variant of CANVAS_VARIANTS) {
  test(`${variant.name}: omitted maxDpr preserves device DPR`, async () => {
    const env = installCanvasEnvironment({ devicePixelRatio: 3, reducedMotion: true });

    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}-dpr.webp`, title: "DPR" }],
      });

      assert.equal(env.canvas.width, env.canvas.clientWidth * 3);
      assert.equal(env.canvas.height, env.canvas.clientHeight * 3);
      dispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: maxDpr caps backing-store DPR without changing CSS size`, async () => {
    const env = installCanvasEnvironment({ devicePixelRatio: 3, reducedMotion: true });

    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}-capped.webp`, title: "Capped" }],
        maxDpr: 1.5,
      });

      assert.equal(env.canvas.width, env.canvas.clientWidth * 1.5);
      assert.equal(env.canvas.height, env.canvas.clientHeight * 1.5);

      env.canvas.clientWidth = 720;
      env.canvas.clientHeight = 400;
      env.triggerResize();
      assert.equal(env.canvas.width, 720 * 1.5);
      assert.equal(env.canvas.height, 400 * 1.5);

      dispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: maxDpr never lowers effective DPR below 1`, async () => {
    const env = installCanvasEnvironment({ devicePixelRatio: 3, reducedMotion: true });

    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}-min.webp`, title: "Minimum" }],
        maxDpr: 0.5,
      });

      assert.equal(env.canvas.width, env.canvas.clientWidth);
      assert.equal(env.canvas.height, env.canvas.clientHeight);
      dispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: maxDpr above device DPR does not increase backing-store DPR`, async () => {
    const env = installCanvasEnvironment({ devicePixelRatio: 3, reducedMotion: true });

    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id, {
        items: [{ src: `https://example.test/${variant.name.toLowerCase()}-upper.webp`, title: "Upper" }],
        maxDpr: 4,
      });

      assert.equal(env.canvas.width, env.canvas.clientWidth * 3);
      assert.equal(env.canvas.height, env.canvas.clientHeight * 3);
      dispose();
    } finally {
      env.restore();
    }
  });

  for (const invalidMaxDpr of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, "1.5"]) {
    test(`${variant.name}: invalid maxDpr ${String(invalidMaxDpr)} preserves device DPR`, async () => {
      const env = installCanvasEnvironment({ devicePixelRatio: 3, reducedMotion: true });

      try {
        const module = await importFresh(variant.moduleUrl);
        const dispose = await module[variant.mountName](env.canvas.id, {
          items: [{ src: `https://example.test/${variant.name.toLowerCase()}-invalid.webp`, title: "Invalid" }],
          maxDpr: invalidMaxDpr,
        });

        assert.equal(env.canvas.width, env.canvas.clientWidth * 3);
        assert.equal(env.canvas.height, env.canvas.clientHeight * 3);
        dispose();
      } finally {
        env.restore();
      }
    });
  }
}
