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

test("public source marker has a bounded propagation budget of at least four minutes", () => {
  const source = readDeployWorkflow();
  const attemptsMatch = source.match(/MARKER_MAX_ATTEMPTS:\s*(\d+)/);
  const delayMatch = source.match(/MARKER_RETRY_DELAY_SECONDS:\s*(\d+)/);

  assert.ok(attemptsMatch, "deployment must declare MARKER_MAX_ATTEMPTS");
  assert.ok(delayMatch, "deployment must declare MARKER_RETRY_DELAY_SECONDS");

  const attempts = Number(attemptsMatch[1]);
  const delaySeconds = Number(delayMatch[1]);
  const budgetSeconds = attempts * delaySeconds;

  assert.ok(budgetSeconds >= 240, `marker propagation budget must be at least 240s, got ${budgetSeconds}s`);
  assert.ok(budgetSeconds <= 600, `marker propagation budget must stay bounded to 600s, got ${budgetSeconds}s`);
  expectPattern(source, /seq\s+1\s+"\$MARKER_MAX_ATTEMPTS"/, "marker polling must consume the declared attempt budget");
  expectPattern(source, /sleep\s+"\$MARKER_RETRY_DELAY_SECONDS"/, "marker polling must consume the declared retry delay");
});

test("deployment waits for every generated public asset before browser smoke", () => {
  const source = readDeployWorkflow();
  const assetGate = source.indexOf("Verify public generated assets");
  const browserGate = source.indexOf("Verify public Arc and Spiral ready state in headless Chrome");

  assert.ok(assetGate >= 0, "deployment must include a generated-asset propagation gate");
  assert.ok(browserGate > assetGate, "generated assets must be verified before browser smoke");
  expectPattern(source, /find\s+dist\s+-type\s+f/, "asset gate must derive its targets from the production dist tree");
  expectPattern(source, /RELATIVE_PATH/, "asset gate must preserve each generated relative path");
  expectPattern(source, /curl\s+-fsS[\s\S]*--retry/, "asset gate must retry transient public propagation failures");
});

test("deployment workflow verifies the public marker and both Canvas variants", () => {
  const source = readDeployWorkflow();

  expectPattern(source, /PUBLIC_URL:\s*https:\/\/looksawful\.github\.io\/moves-awful\//, "deployment must target the canonical public Pages URL");
  expectPattern(source, /MARKER_URL=.*source-sha\.txt/, "deployment must verify the public source marker derived from the public URL");
  expectPattern(source, /google-chrome|chromium|chrome/i, "deployment must use a real headless browser for public smoke evidence");
  expectPattern(source, /id=\\?"arc\\?"/, "public smoke must verify Arc by DOM id");
  expectPattern(source, /id=\\?"spiral\\?"/, "public smoke must verify Spiral by DOM id");
  expectPattern(source, /galleryState|data-gallery-state/, "public smoke must wait for the Canvas ready state");
});
