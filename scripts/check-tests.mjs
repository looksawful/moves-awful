import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const testsDirectory = fileURLToPath(new URL("../tests/", import.meta.url));

const collectMjsSources = (directory) =>
  readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectMjsSources(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".mjs") ? [entryPath] : [];
    })
    .sort((left, right) => relative(testsDirectory, left).localeCompare(relative(testsDirectory, right)));

const testSources = collectMjsSources(testsDirectory);
const testFiles = testSources.filter((sourcePath) => sourcePath.endsWith(".test.mjs"));

if (!testFiles.length) {
  throw new Error("No tests/**/*.test.mjs files found.");
}

for (const sourcePath of testSources) {
  execFileSync(process.execPath, ["--check", sourcePath], {
    stdio: "inherit",
  });
}
