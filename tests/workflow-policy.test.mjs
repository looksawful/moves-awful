import test from "node:test";
import assert from "node:assert/strict";

import {
  MUTATING_WORKFLOW_ALLOWLIST,
  validateWorkflowSource,
} from "../scripts/check-workflow-policy.mjs";

const readOnlyWorkflow = `name: CI
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
`;

test("ordinary read-only workflow is accepted", () => {
  assert.deepEqual(validateWorkflowSource("ci.yml", readOnlyWorkflow), []);
});

test("ordinary workflow with any write permission is rejected", () => {
  const workflow = `name: CI
permissions:
  contents: read
  pull-requests: write
jobs:
  verify:
    runs-on: ubuntu-latest
`;

  const violations = validateWorkflowSource("ci.yml", workflow);

  assert.equal(violations.length, 1);
  assert.match(violations[0], /write permission/i);
});

test("ordinary workflow using inline write permission is rejected", () => {
  const workflow = `name: CI
permissions: { contents: read, pull-requests: write }
jobs:
  verify:
    runs-on: ubuntu-latest
`;

  const violations = validateWorkflowSource("ci.yml", workflow);

  assert.equal(violations.length, 1);
  assert.match(violations[0], /write permission/i);
});

test("ordinary workflow using write-all is rejected", () => {
  const workflow = `name: CI
permissions: write-all
jobs:
  verify:
    runs-on: ubuntu-latest
`;

  const violations = validateWorkflowSource("ci.yml", workflow);

  assert.equal(violations.length, 1);
  assert.match(violations[0], /write-all/i);
});

test("ordinary workflow containing git push is rejected", () => {
  const workflow = `name: CI
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - run: git push origin HEAD:master
`;

  const violations = validateWorkflowSource("ci.yml", workflow);

  assert.equal(violations.length, 1);
  assert.match(violations[0], /git push/i);
});

test("explicit deployment/release allowlist is narrow and permits purpose-specific mutation", () => {
  assert.deepEqual(
    [...MUTATING_WORKFLOW_ALLOWLIST].sort(),
    ["deploy.yaml", "deploy.yml", "release.yaml", "release.yml"],
  );

  const deploymentWorkflow = `name: Deploy
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: git push origin HEAD:gh-pages
`;

  assert.deepEqual(validateWorkflowSource("deploy.yml", deploymentWorkflow), []);
  assert.notDeepEqual(validateWorkflowSource("ci.yml", deploymentWorkflow), []);
});
