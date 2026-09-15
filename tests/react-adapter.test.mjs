import assert from "node:assert/strict";
import test from "node:test";
import { setImmediate as delay } from "node:timers/promises";
import React, { StrictMode, createElement, createRef } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";

import { MovesCanvas } from "../react/index.ts";

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

const installReactCanvasEnvironment = ({ delayedImages = false } = {}) => {
  const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
    url: "https://example.test/",
  });
  const originals = new Map();
  const setGlobal = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };

  const ctx = createContext();
  Object.defineProperty(dom.window.HTMLCanvasElement.prototype, "clientWidth", {
    configurable: true,
    get() { return 640; },
  });
  Object.defineProperty(dom.window.HTMLCanvasElement.prototype, "clientHeight", {
    configurable: true,
    get() { return 360; },
  });
  dom.window.HTMLCanvasElement.prototype.getContext = function getContext(kind) {
    return kind === "2d" ? ctx : null;
  };

  const pendingImages = [];
  class FakeImage {
    constructor() {
      this.width = 256;
      this.height = 256;
      this.naturalWidth = 256;
      this.naturalHeight = 256;
      this.decoding = "async";
    }
    set src(value) {
      this._src = value;
      const settle = () => this.onload?.();
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

  const motionQuery = {
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  };
  dom.window.matchMedia = () => motionQuery;

  setGlobal("window", dom.window);
  setGlobal("document", dom.window.document);
  setGlobal("navigator", dom.window.navigator);
  setGlobal("HTMLElement", dom.window.HTMLElement);
  setGlobal("HTMLCanvasElement", dom.window.HTMLCanvasElement);
  setGlobal("Image", FakeImage);
  setGlobal("ResizeObserver", FakeResizeObserver);
  setGlobal("IntersectionObserver", undefined);
  setGlobal("requestAnimationFrame", requestAnimationFrame);
  setGlobal("cancelAnimationFrame", cancelAnimationFrame);
  setGlobal("devicePixelRatio", 1);
  setGlobal("getComputedStyle", () => ({ getPropertyValue: () => "" }));
  setGlobal("IS_REACT_ACT_ENVIRONMENT", true);

  return {
    rootElement: dom.window.document.getElementById("root"),
    get pendingRafCount() { return rafCallbacks.size; },
    settleImages() {
      const pending = pendingImages.splice(0);
      pending.forEach((settle) => settle());
    },
    restore() {
      dom.window.close();
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
};

const settleReactWork = async () => {
  await delay();
  await delay();
};

test("StrictMode mount/remount owns one RAF chain and unmount disposes it", async () => {
  const env = installReactCanvasEnvironment();
  try {
    const root = createRoot(env.rootElement);
    const canvasRef = createRef();

    await act(async () => {
      root.render(
        createElement(
          StrictMode,
          null,
          createElement(MovesCanvas, {
            ref: canvasRef,
            variant: "arc",
            items: [{ src: "https://example.test/arc.webp", title: "Arc" }],
            "aria-label": "Arc gallery",
          }),
        ),
      );
      await settleReactWork();
    });

    assert.ok(canvasRef.current instanceof HTMLCanvasElement);
    assert.equal(canvasRef.current.id, "", "React adapter must not require or mutate a global Canvas id");
    assert.equal(canvasRef.current.dataset.galleryState, "ready");
    assert.equal(env.pendingRafCount, 1, "StrictMode must converge to one active RAF chain");

    await act(async () => {
      root.unmount();
      await settleReactWork();
    });

    assert.equal(env.pendingRafCount, 0, "unmount must dispose the active Canvas runtime");
  } finally {
    env.restore();
  }
});
