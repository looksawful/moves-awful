import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createDemoPlayback } from "../scripts/demo-playback.mjs";

const settle = () => new Promise((resolve) => setImmediate(resolve));

class FakeButton extends EventTarget {
  hidden = true;
  textContent = "";
  attributes = new Map();
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  click() { this.dispatchEvent(new Event("click")); }
}

const createHarness = ({ mount = async () => () => {}, reducedMotion = false } = {}) => {
  const button = new FakeButton();
  const status = { textContent: "" };
  const canvas = { id: "arc", dataset: { galleryState: "ready" } };
  const listeners = new Set();
  const motionQuery = {
    matches: reducedMotion,
    addEventListener(event, listener) { if (event === "change") listeners.add(listener); },
    removeEventListener(event, listener) { if (event === "change") listeners.delete(listener); },
    setReduced(matches) { this.matches = matches; for (const listener of listeners) listener(); },
  };
  const controller = createDemoPlayback({
    button, status, canvas, label: "Arc", mount, motionQuery,
  });
  return { button, status, canvas, controller, motionQuery, listeners };
};

test("pause, replay, and cleanup do not leave mounted animation work", async () => {
  let mounts = 0;
  let disposals = 0;
  const h = createHarness({ mount: async () => {
    mounts += 1;
    return () => { disposals += 1; };
  } });
  await settle();
  assert.equal(mounts, 1);
  assert.equal(h.button.hidden, false);
  assert.equal(h.button.getAttribute("aria-label"), "Pause Arc animation");
  assert.equal(h.status.textContent, "Playing");

  h.button.click();
  assert.equal(disposals, 1);
  assert.equal(h.button.getAttribute("aria-label"), "Play Arc animation");
  assert.equal(h.status.textContent, "Paused");

  h.button.click();
  await settle();
  assert.equal(mounts, 2);
  assert.equal(h.status.textContent, "Playing");

  h.controller.dispose();
  h.controller.dispose();
  assert.equal(disposals, 2);
  h.button.click();
  await settle();
  assert.equal(mounts, 2, "disposed UI must never remount");
  assert.equal(h.listeners.size, 0);
});

test("pausing while images load disposes the stale async mount", async () => {
  let resolveMount;
  let disposals = 0;
  const h = createHarness({
    mount: () => new Promise((resolve) => { resolveMount = resolve; }),
  });
  await settle();
  h.button.click();
  resolveMount(() => { disposals += 1; });
  await settle();
  assert.equal(disposals, 1);
  assert.equal(h.status.textContent, "Paused");
  h.controller.dispose();
});

test("reduced motion announces a static frame and leaves the pause action hidden", async () => {
  const h = createHarness({ reducedMotion: true });
  await settle();
  assert.equal(h.button.hidden, true);
  assert.equal(h.status.textContent, "Static preview (reduced motion)");
  h.motionQuery.setReduced(false);
  assert.equal(h.button.hidden, false);
  assert.equal(h.status.textContent, "Playing");
  h.controller.dispose();
});

test("image loading failures show an actionable retry rather than fake playback", async () => {
  let tries = 0;
  const h = createHarness({
    mount: async () => {
      tries += 1;
      h.canvas.dataset.galleryState = tries === 1 ? "error" : "ready";
      return () => {};
    },
  });
  await settle();
  assert.equal(h.status.textContent, "Preview unavailable");
  assert.equal(h.button.getAttribute("aria-label"), "Retry Arc animation");
  h.button.click();
  await settle();
  assert.equal(tries, 2);
  assert.equal(h.status.textContent, "Playing");
  h.controller.dispose();
});

test("standalone demo exposes an H1, source, API docs, portfolio, and real pause buttons", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<h1[^>]*>Moves Awful<\/h1>/);
  assert.match(html, /https:\/\/github\.com\/looksawful\/moves-awful/);
  assert.match(html, /docs\/public-contract\.md/);
  assert.match(html, /https:\/\/www\.looksawful\.ru\/work\/moves-awful\//);
  assert.match(html, /<button[^>]+data-playback="arc"/);
  assert.match(html, /<button[^>]+data-playback="spiral"/);
});

test("unexpected mount result is a retryable error, not endless loading", async () => {
  const h = createHarness({ mount: async () => undefined });
  await settle();
  assert.equal(h.status.textContent, "Preview unavailable");
  assert.equal(h.button.getAttribute("aria-label"), "Retry Arc animation");
  h.controller.dispose();
});

test("late resolution from an earlier mount never disposes the resumed mount", async () => {
  let resolveFirst;
  const disposed = [];
  let starts = 0;
  const h = createHarness({ mount: () => {
    starts += 1;
    return starts === 1
      ? new Promise((resolve) => { resolveFirst = resolve; })
      : Promise.resolve(() => { disposed.push("second"); });
  } });
  await settle();
  h.button.click();
  h.button.click();
  await settle();
  assert.equal(starts, 2);
  resolveFirst(() => { disposed.push("first"); });
  await settle();
  assert.deepEqual(disposed, ["first"]);
  assert.equal(h.status.textContent, "Playing");
  h.controller.dispose();
  assert.deepEqual(disposed, ["first", "second"]);
});
