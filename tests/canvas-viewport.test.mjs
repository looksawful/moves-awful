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
  };
};

const installEnvironment = () => {
  const originals = new Map();
  const setGlobal = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };

  const noop = () => {};
  const ctx = {
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

  const canvas = {
    id: "viewport-canvas",
    dataset: {},
    clientWidth: 640,
    clientHeight: 360,
    width: 0,
    height: 0,
    getContext(kind) { return kind === "2d" ? ctx : null; },
  };

  const documentEvents = createEventTarget();
  const windowEvents = createEventTarget();
  const motionEvents = createEventTarget();
  const motionQuery = { ...motionEvents, matches: false };

  const document = {
    ...documentEvents,
    hidden: false,
    head: { appendChild() {} },
    fonts: { async load() {} },
    createElement() { return { textContent: "" }; },
    getElementById(id) { return id === canvas.id ? canvas : null; },
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
      queueMicrotask(() => this.onload?.());
    }
    get src() { return this._src; }
  }

  let viewportObserver;
  class FakeIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.disconnected = false;
      viewportObserver = this;
    }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    trigger(isIntersecting) {
      this.callback([{ target: this.target, isIntersecting }]);
    }
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
  setGlobal("Image", FakeImage);
  setGlobal("ResizeObserver", FakeResizeObserver);
  setGlobal("IntersectionObserver", FakeIntersectionObserver);
  setGlobal("getComputedStyle", () => ({ getPropertyValue: () => "" }));

  return {
    canvas,
    get pendingRafCount() { return rafCallbacks.size; },
    get viewportObserver() { return viewportObserver; },
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
  test(`${variant.name}: viewport observer gates continuous RAF work`, async () => {
    const env = installEnvironment();
    try {
      const module = await importFresh(variant.modulePath);
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
