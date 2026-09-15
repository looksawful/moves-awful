import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const assertExists = async (path) => {
  await access(new URL(`../${path}`, import.meta.url));
};

test("TypeScript core: strict toolchain and canonical TS modules exist", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const tsconfig = JSON.parse(await read("tsconfig.json"));

  assert.equal(tsconfig.compilerOptions.strict, true);
  assert.equal(tsconfig.compilerOptions.noEmit, true);
  assert.equal(packageJson.scripts.typecheck, "tsc -p tsconfig.json --noEmit");
  assert.match(String(packageJson.devDependencies.typescript), /^\^?5\.|^\^?6\./);

  await assertExists("canvas-animations/core/types.ts");
  await assertExists("canvas-animations/arc.ts");
  await assertExists("canvas-animations/spiral.ts");
});

test("TypeScript core: public JavaScript entry points are thin compatibility adapters", async () => {
  const arcAdapter = (await read("canvas-animations/arc.js")).trim();
  const spiralAdapter = (await read("canvas-animations/spiral.js")).trim();

  assert.equal(arcAdapter, 'export { mountArc } from "./arc.ts";');
  assert.equal(spiralAdapter, 'export { mountSpiral } from "./spiral.ts";');
});

test("TypeScript core: public discriminated variant contract is typed without any", async () => {
  const types = await read("canvas-animations/core/types.ts");
  const arc = await read("canvas-animations/arc.ts");
  const spiral = await read("canvas-animations/spiral.ts");

  assert.match(types, /variant:\s*"arc"/);
  assert.match(types, /variant:\s*"spiral"/);
  assert.match(types, /GalleryVariantOptions/);
  assert.doesNotMatch(`${types}\n${arc}\n${spiral}`, /\bany\b/);
});
