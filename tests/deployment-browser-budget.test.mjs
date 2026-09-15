import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const DEPLOY_WORKFLOW = new URL("../.github/workflows/deploy.yml", import.meta.url);

test("Pages smoke gives the public Canvas runtime at least 30 seconds of virtual time", async () => {
  const workflow = await readFile(DEPLOY_WORKFLOW, "utf8");
  const match = workflow.match(/--virtual-time-budget=(\d+)/);

  assert.ok(match, "deploy workflow must set a Chrome virtual-time budget");
  assert.ok(
    Number(match[1]) >= 30000,
    `expected at least 30000ms virtual-time budget, got ${match[1]}ms`,
  );
});
