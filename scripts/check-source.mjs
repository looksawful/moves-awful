import { readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const extensions = new Set([".js", ".mjs"]);
const roots = ["canvas-animations", "scripts", "tests"];

const toRepoPath = (path) => relative(root, path).replaceAll("\\", "/");

const extensionOf = (name) => {
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index);
};

const collect = (repoPath) => {
  const absolute = join(root, repoPath);
  const files = [];

  for (const entry of readdirSync(absolute).sort()) {
    const candidate = join(absolute, entry);
    const stats = statSync(candidate);

    if (stats.isDirectory()) {
      files.push(...collect(toRepoPath(candidate)));
      continue;
    }

    if (extensions.has(extensionOf(entry))) {
      files.push(toRepoPath(candidate));
    }
  }

  return files;
};

const sources = ["vite.config.js", ...roots.flatMap(collect)].sort();

if (process.argv.includes("--list")) {
  process.stdout.write(`${sources.join("\n")}\n`);
  process.exit(0);
}

for (const source of sources) {
  const result = spawnSync(process.execPath, ["--check", source], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    process.exit(result.status ?? 1);
  }
}

console.log(`Syntax checked ${sources.length} JavaScript/MJS source files.`);
