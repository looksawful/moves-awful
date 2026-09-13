import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const modules = [
  "canvas-animations/arc.js",
  "canvas-animations/spiral.js",
];

const localAssetPattern = /new URL\(["'](\.\/assets\/[^"']+)["'],\s*import\.meta\.url\)/g;

for (const modulePath of modules) {
  test(`${modulePath}: every bundled new URL asset reference exists`, () => {
    const absoluteModulePath = resolve(repositoryRoot, modulePath);
    const source = readFileSync(absoluteModulePath, "utf8");
    const references = [...source.matchAll(localAssetPattern)].map((match) => match[1]);

    assert.ok(references.length > 0, `${modulePath} must expose at least one bundled asset reference`);

    const missing = references.filter((reference) => {
      const assetPath = resolve(dirname(absoluteModulePath), reference);
      return !existsSync(assetPath);
    });

    assert.deepEqual(missing, [], `${modulePath} contains missing bundled asset references`);
  });
}
