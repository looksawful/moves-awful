export const CANVAS_VARIANTS = Object.freeze([
  {
    name: "Arc",
    moduleUrl: new URL("../../canvas-animations/arc.js", import.meta.url).href,
    mountName: "mountArc",
  },
  {
    name: "Spiral",
    moduleUrl: new URL("../../canvas-animations/spiral.js", import.meta.url).href,
    mountName: "mountSpiral",
  },
]);

export const importFresh = async (moduleUrl) => {
  const url = new URL(moduleUrl);
  url.searchParams.set("test", `${Date.now()}-${Math.random()}`);
  return import(url.href);
};

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

  return {
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
};

export const installCanvasEnvironment = ({
  canvasId = "test-canvas",
  reducedMotion = false,
  canvasPresent = true,
  contextAvailable = true,
  autoSettleImages = true,
  failImages = false,
  intersectionObserver = false,
  devicePixelRatio = 1,
} = {}) => {
  const originals = new Map();
  const setGlobal = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };

  let currentCanvasPresent = canvasPresent;
  let currentContextAvailable = contextAvailable;
  let appendedStyles = 0;

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
    id: canvasId,
    dataset: {},
    clientWidth: 640,
    clientHeight: 360,
    width: 0,
    height: 0,
    getContext(kind) {
      return kind === "2d" && currentContextAvailable ? ctx : null;
    },
  };

  const document = {
    ...documentEvents,
    hidden: false,
    head: { appendChild() { appendedStyles += 1; } },
    fonts: {
      check() { return true; },
      async load() {},
    },
    createElement() { return { textContent: "" }; },
    getElementById(id) {
      return currentCanvasPresent && id === canvas.id ? canvas : null;
    },
  };

  const window = {
    ...windowEvents,
    devicePixelRatio,
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
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    trigger() { this.callback?.(); }
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

  const pendingImageSettlers = [];
  const requestedImageUrls = [];
  class FakeImage {
    constructor() {
      this.width = 256;
      this.height = 256;
      this.naturalWidth = 256;
      this.naturalHeight = 256;
      this.decoding = "auto";
    }
    async decode() {}
    set src(value) {
      this._src = value;
      requestedImageUrls.push(value);
      const settle = () => failImages ? this.onerror?.() : this.onload?.();

      if (autoSettleImages) queueMicrotask(settle);
      else pendingImageSettlers.push(settle);
    }
    get src() { return this._src; }
  }

  setGlobal("document", document);
  setGlobal("window", window);
  setGlobal("devicePixelRatio", devicePixelRatio);
  setGlobal("requestAnimationFrame", requestAnimationFrame);
  setGlobal("cancelAnimationFrame", cancelAnimationFrame);
  setGlobal("ResizeObserver", FakeResizeObserver);
  setGlobal("IntersectionObserver", intersectionObserver ? FakeIntersectionObserver : undefined);
  setGlobal("Image", FakeImage);
  setGlobal("getComputedStyle", () => ({ getPropertyValue: () => "" }));

  return {
    canvas,
    ctx,
    document,
    window,
    motionQuery,
    requestedImageUrls,
    get appendedStyles() { return appendedStyles; },
    get pendingRafCount() { return rafCallbacks.size; },
    get pendingImageCount() { return pendingImageSettlers.length; },
    get resizeObserver() { return resizeObserver; },
    get viewportObserver() { return viewportObserver; },
    setCanvasPresent(value) { currentCanvasPresent = value; },
    setContextAvailable(value) { currentContextAvailable = value; },
    flushRaf(time = 16) {
      const pending = [...rafCallbacks.values()];
      rafCallbacks.clear();
      for (const callback of pending) callback(time);
      return pending.length;
    },
    settleImages() {
      const pending = pendingImageSettlers.splice(0);
      pending.forEach((settle) => settle());
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
