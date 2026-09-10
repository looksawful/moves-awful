import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("demo canvases expose existing headings as accessible names and fallback text", async () => {
  const html = await readProjectFile("index.html");

  assert.match(
    html,
    /<canvas id="arc" role="img" aria-labelledby="arc-title">\s*Arc\s*<\/canvas>/,
  );
  assert.match(
    html,
    /<canvas id="spiral" role="img" aria-labelledby="spiral-title">\s*Spiral\s*<\/canvas>/,
  );
});

test("Arc preview scales to narrow containers instead of enforcing a 768px minimum", async () => {
  const css = await readProjectFile("style.css");
  const arcRule = css.match(/\.arc-cell\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.doesNotMatch(arcRule, /clamp\(768px/i);
  assert.match(arcRule, /width:\s*min\(100%,\s*1280px\)/i);
  assert.match(arcRule, /aspect-ratio:\s*1280\s*\/\s*860/i);
});
