import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const deployWorkflowPath = fileURLToPath(
  new URL("../.github/workflows/deploy.yml", import.meta.url),
);

const readDeployWorkflow = () => readFileSync(deployWorkflowPath, "utf8");

test("deployment workflow is explicit, traceable and non-forcing", () => {
  const source = readDeployWorkflow();

  assert.match(source, /workflow_dispatch:/);
  assert.match(source, /source_sha:/);
  assert.match(source, /required:\s*true/);
  assert.match(source, /contents:\s*write/);
  assert.match(source, /inputs\.source_sha/);
  assert.match(source, /merge-base\s+--is-ancestor/);
  assert.match(source, /dist\/source-sha\.txt/);
  assert.match(source, /git\s+push\s+origin\s+HEAD:gh-pages/);
  assert.doesNotMatch(source, /git\s+push[^\n]*--force/);
});

test("deployment workflow does not auto-publish unrelated master commits", () => {
  const source = readDeployWorkflow();

  assert.match(source, /branches:\s*\[master\]/);
  assert.match(source, /paths:/);
  assert.match(source, /\.github\/workflows\/deploy\.yml/);
});

test("deployment workflow verifies the public source marker and Arc/Spiral readiness", () => {
  const source = readDeployWorkflow();

  assert.match(source, /source-sha\.txt/);
  assert.match(source, /google-chrome/);
  assert.match(source, /data-gallery-state=[\\"]ready[\\"]/);
  assert.match(source, /id=[\\"]arc[\\"]/);
  assert.match(source, /id=[\\"]spiral[\\"]/);
});
