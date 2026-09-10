import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const testsDirectory = fileURLToPath(new URL("../tests/", import.meta.url));
const testFiles = readdirSync(testsDirectory)
  .filter((name) => name.endsWith(".test.mjs"))
  .sort();

if (!testFiles.length) {
  throw new Error("No tests/*.test.mjs files found.");
}

for (const testFile of testFiles) {
  execFileSync(process.execPath, ["--check", join(testsDirectory, testFile)], {
    stdio: "inherit",
  });
}
