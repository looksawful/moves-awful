import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const registryPath = resolve("skills/vendor/registry.yaml");
const installRoot = resolve(".agents/vendor");

const parseRegistry = (source) => {
  const records = [];
  let current = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.startsWith("- name:")) {
      if (current) records.push(current);
      current = { name: line.slice("- name:".length).trim() };
      continue;
    }

    if (!current) continue;

    for (const key of ["catalog_id", "repo", "ref", "source_path"]) {
      const prefix = `${key}:`;
      if (line.startsWith(prefix)) {
        current[key] = line.slice(prefix.length).trim();
      }
    }
  }

  if (current) records.push(current);
  return records;
};

const skills = parseRegistry(readFileSync(registryPath, "utf8"));
const requested = process.argv.slice(2);

if (requested.includes("--list") || requested.length === 0) {
  console.log("Available vendor skills:");
  for (const skill of skills) {
    console.log(`- ${skill.name} (${skill.catalog_id})`);
  }

  if (requested.length === 0) {
    console.log("\nInstall with: npm run skills:install -- <skill-name> [skill-name...] | --all");
  }
  process.exit(0);
}

const selected = requested.includes("--all")
  ? skills
  : requested.map((name) => {
      const skill = skills.find((candidate) => candidate.name === name);
      if (!skill) throw new Error(`Unknown vendor skill: ${name}`);
      return skill;
    });

mkdirSync(installRoot, { recursive: true });

for (const skill of selected) {
  for (const required of ["repo", "ref", "source_path"]) {
    if (!skill[required]) throw new Error(`${skill.name} is missing ${required} in registry.yaml`);
  }

  const temp = mkdtempSync(join(tmpdir(), `moves-awful-${skill.name}-`));
  const destination = join(installRoot, skill.name);

  try {
    execFileSync("git", ["clone", "--filter=blob:none", "--no-checkout", skill.repo, temp], {
      stdio: "inherit",
    });
    execFileSync("git", ["-C", temp, "fetch", "--depth", "1", "origin", skill.ref], {
      stdio: "inherit",
    });
    execFileSync("git", ["-C", temp, "checkout", "--detach", "FETCH_HEAD"], {
      stdio: "inherit",
    });

    const source = join(temp, skill.source_path);
    if (!existsSync(source)) throw new Error(`Skill source not found: ${skill.source_path}`);

    rmSync(destination, { recursive: true, force: true });
    cpSync(source, destination, { recursive: true });
    console.log(`Installed ${skill.name} -> ${destination}`);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
