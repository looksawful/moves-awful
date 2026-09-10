import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const toRepoPath = (path) => relative(root, path).replaceAll("\\", "/");

const collectFiles = (path) => {
  const absolute = join(root, path);
  const entries = readdirSync(absolute);
  const files = [];

  for (const entry of entries) {
    const candidate = join(absolute, entry);
    const stats = statSync(candidate);

    if (stats.isDirectory()) {
      files.push(...collectFiles(toRepoPath(candidate)));
      continue;
    }

    if (/\.(?:js|mjs)$/.test(entry)) {
      files.push(toRepoPath(candidate));
    }
  }

  return files;
};

const expectedSyntaxSources = () =>
  [
    "vite.config.js",
    ...collectFiles("canvas-animations"),
    ...collectFiles("scripts"),
    ...collectFiles("tests"),
  ].sort();

const ordinaryWorkflowFiles = () => {
  const workflowsDir = join(root, ".github", "workflows");

  return readdirSync(workflowsDir)
    .filter((name) => /\.ya?ml$/i.test(name))
    .filter((name) => !/(?:deploy|publish|release|pages)/i.test(name))
    .sort();
};

test("source check dynamically covers all first-party JavaScript and MJS sources", () => {
  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

  assert.match(
    packageJson.scripts?.check || "",
    /node\s+scripts\/check-source\.mjs/,
    "npm run check must delegate to the dynamic source checker",
  );

  const output = execFileSync(process.execPath, ["scripts/check-source.mjs", "--list"], {
    cwd: root,
    encoding: "utf8",
  });
  const listed = new Set(output.split(/\r?\n/).filter(Boolean));

  for (const source of expectedSyntaxSources()) {
    assert.ok(listed.has(source), `source checker omitted ${source}`);
  }
});

test("ordinary verification workflows remain read-only and never push source", () => {
  const workflows = ordinaryWorkflowFiles();

  assert.ok(workflows.length > 0, "expected at least one ordinary verification workflow");

  for (const workflow of workflows) {
    const content = readFileSync(join(root, ".github", "workflows", workflow), "utf8");

    assert.doesNotMatch(content, /contents\s*:\s*write/i, `${workflow} requests contents: write`);
    assert.doesNotMatch(content, /\bgit\s+push\b/i, `${workflow} pushes repository source`);
    assert.doesNotMatch(content, /\bgh\s+api\b[^\n]*(?:contents|git\/refs)/i, `${workflow} mutates repository contents/refs through gh api`);
  }
});
