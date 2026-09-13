import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const deployWorkflowPath = fileURLToPath(new URL("../.github/workflows/deploy.yml", import.meta.url));

const readDeployWorkflow = () => readFileSync(deployWorkflowPath, "utf8");

const expectPattern = (source, pattern, message) => {
  assert.match(source, pattern, message);
};

test("deployment workflow publishes an explicit master source SHA with traceability", () => {
  const source = readDeployWorkflow();

  expectPattern(source, /workflow_dispatch\s*:/, "deployment must support explicit manual dispatch");
  expectPattern(source, /source_sha\s*:/, "deployment must accept a source_sha input");
  expectPattern(source, /required\s*:\s*true/, "source_sha must be required");
  expectPattern(source, /permissions\s*:[\s\S]*contents\s*:\s*write/, "deployment must declare the narrow contents write permission it needs");
  expectPattern(source, /git\s+merge-base\s+--is-ancestor/, "selected source SHA must be proven reachable from master");
  expectPattern(source, /git\s+checkout\s+--detach/, "build must use an exact detached source SHA");
  expectPattern(source, /npm\s+ci/, "deployment must install from the lockfile");
  expectPattern(source, /npm\s+audit\s+--audit-level=high/, "deployment must run the high-severity audit");
  expectPattern(source, /npm\s+run\s+check/, "deployment must run repository checks");
  expectPattern(source, /npm\s+test/, "deployment must run behavioral tests");
  expectPattern(source, /npm\s+run\s+build/, "deployment must build production output");
  expectPattern(source, /source-sha\.txt/, "published output must expose source-sha.txt");
  expectPattern(source, /\.nojekyll/, "published output must include .nojekyll");
  expectPattern(source, /gh-pages/, "deployment must publish to gh-pages");
  assert.doesNotMatch(source, /git\s+push[^\n]*--force/i, "deployment must preserve gh-pages history");
});

test("deployment workflow verifies the public marker and both Canvas variants", () => {
  const source = readDeployWorkflow();

  expectPattern(source, /looksawful\.github\.io\/moves-awful\/source-sha\.txt/, "deployment must verify the public source marker");
  expectPattern(source, /google-chrome|chromium|chrome/i, "deployment must use a real headless browser for public smoke evidence");
  expectPattern(source, /#arc/, "public smoke must verify Arc");
  expectPattern(source, /#spiral/, "public smoke must verify Spiral");
  expectPattern(source, /galleryState|data-gallery-state/, "public smoke must wait for the Canvas ready state");
});
