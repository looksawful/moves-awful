import assert from "node:assert/strict";
import test from "node:test";

const installEnvironment = () => {
  const originals = new Map();
  const setGlobal = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };

  let appendedStyles = 0;
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
    id: "arc-style-canvas",
    dataset: {},
    clientWidth: 640,
    clientHeight: 360,
    width: 0,
    height: 0,
    getContext(kind) { return kind === "2d" ? ctx : null; },
  };

  const eventTarget = { addEventListener() {}, removeEventListener() {} };
  const document = {
    ...eventTarget,
    hidden: false,
    head: { appendChild() { appendedStyles += 1; } },
    fonts: { async load() {} },
    createElement() { return { textContent: "" }; },
    getElementById(id) { return id === canvas.id ? canvas : null; },
  };
  const window = {
    ...eventTarget,
    devicePixelRatio: 1,
    matchMedia() { return { ...eventTarget, matches: true }; },
  };

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

  class FakeResizeObserver {
    observe() {}
    disconnect() {}
  }

  setGlobal("document", document);
  setGlobal("window", window);
  setGlobal("devicePixelRatio", 1);
  setGlobal("requestAnimationFrame", () => 1);
  setGlobal("cancelAnimationFrame", noop);
  setGlobal("ResizeObserver", FakeResizeObserver);
  setGlobal("IntersectionObserver", undefined);
  setGlobal("Image", FakeImage);
  setGlobal("getComputedStyle", () => ({ getPropertyValue: () => "" }));

  return {
    canvas,
    get appendedStyles() { return appendedStyles; },
    restore() {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
};

const importFresh = async () => {
  const url = new URL("../canvas-animations/arc.js", import.meta.url);
  url.searchParams.set("test", `${Date.now()}-${Math.random()}`);
  return import(url.href);
};

test("Arc mount does not inject global host-page styles", async () => {
  const env = installEnvironment();

  try {
    const { mountArc } = await importFresh();
    const dispose = await mountArc(env.canvas.id, {
      items: [{ src: "https://example.test/arc.webp", title: "Arc" }],
    });

    assert.equal(env.canvas.dataset.galleryState, "ready");
    assert.equal(env.appendedStyles, 0, "library mount must not append global style elements");
    dispose();
  } finally {
    env.restore();
  }
});
