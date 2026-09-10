import assert from "node:assert/strict";
import test from "node:test";

const createEventTarget = () => {
  const listeners = new Map();

  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
};

const createContext = () => {
  const noop = () => {};

  return {
    setTransform: noop,
    clearRect: noop,
    drawImage: noop,
    measureText(text) { return { width: String(text).length * 8 }; },
    save: noop,
    restore: noop,
    beginPath: noop,
    roundRect: noop,
    moveTo: noop,
    lineTo: noop,
    quadraticCurveTo: noop,
    arc: noop,
    clip: noop,
    fill: noop,
    fillText: noop,
    translate: noop,
    rotate: noop,
  };
};

const installEnvironment = ({ delayedImages = false } = {}) => {
  const originals = new Map();
  const setGlobal = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };

  let canvasPresent = true;
  let contextAvailable = true;
  const ctx = createContext();
  const canvas = {
    id: "remount-canvas",
    dataset: {},
    clientWidth: 640,
    clientHeight: 360,
    width: 0,
    height: 0,
    getContext(kind) {
      return kind === "2d" && contextAvailable ? ctx : null;
    },
  };

  const windowEvents = createEventTarget();
  const documentEvents = createEventTarget();
  const motionEvents = createEventTarget();
  const motionQuery = { ...motionEvents, matches: false };

  const document = {
    ...documentEvents,
    hidden: false,
    head: { appendChild() {} },
    fonts: { async load() {} },
    createElement() { return { textContent: "" }; },
    getElementById(id) {
      return canvasPresent && id === canvas.id ? canvas : null;
    },
  };
  const window = {
    ...windowEvents,
    devicePixelRatio: 1,
    matchMedia() { return motionQuery; },
  };

  let nextRafId = 1;
  const rafCallbacks = new Map();
  const requestAnimationFrame = (callback) => {
    const id = nextRafId++;
    rafCallbacks.set(id, callback);
    return id;
  };
  const cancelAnimationFrame = (id) => rafCallbacks.delete(id);

  const pendingImages = [];
  class FakeImage {
    constructor() {
      this.width = 256;
      this.height = 256;
      this.naturalWidth = 256;
      this.naturalHeight = 256;
    }
    async decode() {}
    set src(value) {
      this._src = value;
      const settle = () => this.onload?.();
      if (delayedImages) pendingImages.push(settle);
      else queueMicrotask(settle);
    }
    get src() { return this._src; }
  }

  class FakeResizeObserver {
    observe() {}
    disconnect() {}
  }

  setGlobal("document", document);
  setGlobal("window", window);
  setGlobal("devicePixelRatio", 1);
  setGlobal("requestAnimationFrame", requestAnimationFrame);
  setGlobal("cancelAnimationFrame", cancelAnimationFrame);
  setGlobal("ResizeObserver", FakeResizeObserver);
  setGlobal("IntersectionObserver", undefined);
  setGlobal("Image", FakeImage);
  setGlobal("getComputedStyle", () => ({ getPropertyValue: () => "" }));

  return {
    canvas,
    window,
    document,
    setCanvasPresent(value) { canvasPresent = value; },
    setContextAvailable(value) { contextAvailable = value; },
    get pendingRafCount() { return rafCallbacks.size; },
    settleImages() {
      const pending = pendingImages.splice(0);
      pending.forEach((settle) => settle());
    },
    restore() {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
};

const importFresh = async (modulePath) => {
  const url = new URL(modulePath, import.meta.url);
  url.searchParams.set("test", `${Date.now()}-${Math.random()}`);
  return import(url.href);
};

const variants = [
  { name: "Arc", modulePath: "../canvas-animations/arc.js", mountName: "mountArc" },
  { name: "Spiral", modulePath: "../canvas-animations/spiral.js", mountName: "mountSpiral" },
];

for (const variant of variants) {
  test(`${variant.name}: invalid remount disposes the previous active lifecycle`, async () => {
    const env = installEnvironment();

    try {
      const module = await importFresh(variant.modulePath);
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
      const module = await importFresh(variant.modulePath);
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
      const module = await importFresh(variant.modulePath);
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
