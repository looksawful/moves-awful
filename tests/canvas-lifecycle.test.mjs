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
    dispatch(type, event = {}) {
      for (const listener of listeners.get(type) ?? []) listener(event);
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
};

const createContext = () => {
  const calls = { clearRect: 0, drawImage: 0, setTransform: 0 };
  const noop = () => {};
  const ctx = {
    calls,
    setTransform() { calls.setTransform += 1; },
    clearRect() { calls.clearRect += 1; },
    drawImage() { calls.drawImage += 1; },
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
  return ctx;
};

const installEnvironment = ({
  reducedMotion = false,
  canvasPresent = true,
  contextAvailable = true,
  autoLoadImages = true,
} = {}) => {
  const originals = new Map();
  const setGlobal = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };

  const windowEvents = createEventTarget();
  const documentEvents = createEventTarget();
  const motionEvents = createEventTarget();
  const motionQuery = {
    ...motionEvents,
    matches: reducedMotion,
    setMatches(matches) {
      this.matches = matches;
      this.dispatch("change", { matches });
    },
  };

  const ctx = createContext();
  const canvas = {
    id: "test-canvas",
    clientWidth: 640,
    clientHeight: 360,
    width: 0,
    height: 0,
    getContext(kind) {
      return kind === "2d" && contextAvailable ? ctx : null;
    },
  };

  const document = {
    ...documentEvents,
    hidden: false,
    head: { appendChild() {} },
    fonts: {
      check() { return true; },
      async load() {},
    },
    createElement() { return { textContent: "" }; },
    getElementById(id) {
      return canvasPresent && id === canvas.id ? canvas : null;
    },
  };

  const window = {
    ...windowEvents,
    devicePixelRatio: 2,
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

  let resizeObserver;
  class FakeResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      resizeObserver = this;
    }
    observe() {}
    disconnect() { this.disconnected = true; }
    trigger() { this.callback(); }
  }

  const pendingImages = [];
  class FakeImage {
    constructor() {
      this.width = 256;
      this.height = 256;
      this.decoding = "auto";
    }
    async decode() {}
    set src(value) {
      this._src = value;
      if (autoLoadImages) queueMicrotask(() => this.onload?.());
      else pendingImages.push(this);
    }
    get src() { return this._src; }
  }

  setGlobal("document", document);
  setGlobal("window", window);
  setGlobal("devicePixelRatio", 2);
  setGlobal("requestAnimationFrame", requestAnimationFrame);
  setGlobal("cancelAnimationFrame", cancelAnimationFrame);
  setGlobal("ResizeObserver", FakeResizeObserver);
  setGlobal("Image", FakeImage);
  setGlobal("getComputedStyle", () => ({ getPropertyValue: () => "" }));

  return {
    canvas,
    ctx,
    document,
    window,
    motionQuery,
    get pendingRafCount() { return rafCallbacks.size; },
    get pendingImageCount() { return pendingImages.length; },
    flushRaf(time = 16) {
      const pending = [...rafCallbacks.values()];
      rafCallbacks.clear();
      for (const callback of pending) callback(time);
      return pending.length;
    },
    resolveImages() {
      const images = pendingImages.splice(0);
      for (const image of images) image.onload?.();
    },
    triggerResize() { resizeObserver?.trigger(); },
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
  test(`${variant.name}: missing canvas returns a safe no-op lifecycle`, async () => {
    const env = installEnvironment({ canvasPresent: false });
    try {
      const module = await importFresh(variant.modulePath);
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
      const module = await importFresh(variant.modulePath);
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

  test(`${variant.name}: normal motion owns one RAF chain and dispose cancels it`, async () => {
    const env = installEnvironment();
    try {
      const module = await importFresh(variant.modulePath);
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
      const module = await importFresh(variant.modulePath);
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
    const env = installEnvironment({ autoLoadImages: false });
    try {
      const module = await importFresh(variant.modulePath);
      const firstMount = module[variant.mountName](env.canvas.id);
      const secondMount = module[variant.mountName](env.canvas.id);

      await Promise.resolve();
      assert.ok(env.pendingImageCount > 0, "expected image loading to remain pending");
      assert.equal(env.pendingRafCount, 0);

      env.resolveImages();
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
      const module = await importFresh(variant.modulePath);
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
      const module = await importFresh(variant.modulePath);
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
