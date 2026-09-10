import assert from "node:assert/strict";
import test from "node:test";

const createEventTarget = () => ({
  addEventListener() {},
  removeEventListener() {},
});

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

const installEnvironment = ({ failImages = false, delayedImages = false } = {}) => {
  const originals = new Map();
  const setGlobal = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };

  const ctx = createContext();
  const canvas = {
    id: "state-canvas",
    dataset: {},
    clientWidth: 640,
    clientHeight: 360,
    width: 0,
    height: 0,
    getContext(kind) { return kind === "2d" ? ctx : null; },
  };

  const motionQuery = { ...createEventTarget(), matches: false };
  const document = {
    ...createEventTarget(),
    hidden: false,
    head: { appendChild() {} },
    fonts: { async load() {} },
    createElement() { return { textContent: "" }; },
    getElementById(id) { return id === canvas.id ? canvas : null; },
  };
  const window = {
    ...createEventTarget(),
    devicePixelRatio: 1,
    matchMedia() { return motionQuery; },
  };

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
      const settle = () => failImages ? this.onerror?.() : this.onload?.();
      if (delayedImages) pendingImages.push(settle);
      else queueMicrotask(settle);
    }
    get src() { return this._src; }
  }

  let nextRafId = 1;
  const rafCallbacks = new Map();
  const requestAnimationFrame = (callback) => {
    const id = nextRafId++;
    rafCallbacks.set(id, callback);
    return id;
  };
  const cancelAnimationFrame = (id) => rafCallbacks.delete(id);

  class FakeResizeObserver {
    observe() {}
    disconnect() {}
  }

  setGlobal("document", document);
  setGlobal("window", window);
  setGlobal("devicePixelRatio", 1);
  setGlobal("Image", FakeImage);
  setGlobal("requestAnimationFrame", requestAnimationFrame);
  setGlobal("cancelAnimationFrame", cancelAnimationFrame);
  setGlobal("ResizeObserver", FakeResizeObserver);
  setGlobal("IntersectionObserver", undefined);
  setGlobal("getComputedStyle", () => ({ getPropertyValue: () => "" }));

  return {
    canvas,
    get pendingRafCount() { return rafCallbacks.size; },
    settleImages() {
      const callbacks = pendingImages.splice(0);
      callbacks.forEach((callback) => callback());
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
  test(`${variant.name}: exposes loading then ready state`, async () => {
    const env = installEnvironment({ delayedImages: true });
    try {
      const module = await importFresh(variant.modulePath);
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
      const module = await importFresh(variant.modulePath);
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
