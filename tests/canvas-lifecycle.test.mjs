import assert from "node:assert/strict";
import test from "node:test";

import {
  CANVAS_VARIANTS,
  importFresh,
  installCanvasEnvironment,
} from "./helpers/canvas-environment.mjs";

const installEnvironment = (options = {}) =>
  installCanvasEnvironment({ devicePixelRatio: 2, ...options });

for (const variant of CANVAS_VARIANTS) {
  test(`${variant.name}: missing canvas returns a safe no-op lifecycle`, async () => {
    const env = installEnvironment({ canvasPresent: false });
    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id);

      assert.equal(typeof dispose, "function");
      assert.equal(env.pendingRafCount, 0);
      assert.equal(env.window.listenerCount("resize"), 0);
      assert.equal(env.document.listenerCount("visibilitychange"), 0);
      dispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: missing 2d context returns a safe no-op lifecycle`, async () => {
    const env = installEnvironment({ contextAvailable: false });
    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id);

      assert.equal(typeof dispose, "function");
      assert.equal(env.pendingRafCount, 0);
      assert.equal(env.window.listenerCount("resize"), 0);
      assert.equal(env.document.listenerCount("visibilitychange"), 0);
      dispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: caller-provided items replace the built-in demo dataset`, async () => {
    const env = installEnvironment();
    const customSrc = `https://example.test/${variant.name.toLowerCase()}.webp`;

    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id, {
        items: [{ src: customSrc, title: "Custom item" }],
      });

      assert.deepEqual(env.requestedImageUrls, [customSrc]);
      dispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: normal motion owns one RAF chain and dispose cancels it`, async () => {
    const env = installEnvironment();
    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id);

      assert.equal(env.pendingRafCount, 1);
      assert.equal(env.flushRaf(), 1);
      assert.equal(env.pendingRafCount, 1);

      dispose();
      dispose();
      assert.equal(env.pendingRafCount, 0);
      assert.equal(env.window.listenerCount("resize"), 0);
      assert.equal(env.document.listenerCount("visibilitychange"), 0);
      assert.equal(env.motionQuery.listenerCount("change"), 0);
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: remount replaces the previous active lifecycle`, async () => {
    const env = installEnvironment();
    try {
      const module = await importFresh(variant.moduleUrl);
      const firstDispose = await module[variant.mountName](env.canvas.id);
      assert.equal(env.pendingRafCount, 1);

      const secondDispose = await module[variant.mountName](env.canvas.id);
      assert.equal(env.pendingRafCount, 1, "remount must replace, not multiply, RAF ownership");
      assert.equal(env.window.listenerCount("resize"), 1);
      assert.equal(env.document.listenerCount("visibilitychange"), 1);
      assert.equal(env.motionQuery.listenerCount("change"), 1);

      firstDispose();
      assert.equal(env.pendingRafCount, 1, "stale disposer must not stop the replacement instance");

      secondDispose();
      assert.equal(env.pendingRafCount, 0);
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: stale async mount cannot become active`, async () => {
    const env = installEnvironment({ autoSettleImages: false });
    try {
      const module = await importFresh(variant.moduleUrl);
      const firstMount = module[variant.mountName](env.canvas.id);
      const secondMount = module[variant.mountName](env.canvas.id);

      await new Promise((resolve) => setImmediate(resolve));
      assert.ok(env.pendingImageCount > 0, "expected image loading to remain pending");
      assert.equal(env.pendingRafCount, 0);

      env.settleImages();
      const [firstDispose, secondDispose] = await Promise.all([firstMount, secondMount]);

      assert.equal(env.pendingRafCount, 1, "only the newest completed mount may own animation work");
      assert.equal(env.window.listenerCount("resize"), 1);
      assert.equal(env.document.listenerCount("visibilitychange"), 1);

      firstDispose();
      assert.equal(env.pendingRafCount, 1, "stale mount disposer must be a no-op");

      secondDispose();
      assert.equal(env.pendingRafCount, 0);
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: visibility stops and resumes exactly one normal-motion RAF chain`, async () => {
    const env = installEnvironment();
    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id);

      env.document.hidden = true;
      env.document.dispatch("visibilitychange");
      assert.equal(env.pendingRafCount, 0);

      env.document.hidden = false;
      env.document.dispatch("visibilitychange");
      assert.equal(env.pendingRafCount, 1);
      env.document.dispatch("visibilitychange");
      assert.equal(env.pendingRafCount, 1);

      dispose();
    } finally {
      env.restore();
    }
  });

  test(`${variant.name}: reduced motion renders statically without a perpetual RAF`, async () => {
    const env = installEnvironment({ reducedMotion: true });
    try {
      const module = await importFresh(variant.moduleUrl);
      const dispose = await module[variant.mountName](env.canvas.id);

      assert.ok(env.ctx.calls.clearRect > 0, "expected an initial static render");
      assert.equal(env.pendingRafCount, 0, "reduced motion must not keep a RAF scheduled");

      const clearsBeforeResize = env.ctx.calls.clearRect;
      env.canvas.clientWidth = 720;
      env.triggerResize();
      assert.ok(env.ctx.calls.clearRect > clearsBeforeResize, "resize must redraw the static frame");
      assert.equal(env.pendingRafCount, 0);

      env.motionQuery.setMatches(false);
      assert.equal(env.pendingRafCount, 1, "leaving reduced motion must start one RAF chain");

      env.motionQuery.setMatches(true);
      assert.equal(env.pendingRafCount, 0, "entering reduced motion must cancel animation work");

      dispose();
    } finally {
      env.restore();
    }
  });
}
