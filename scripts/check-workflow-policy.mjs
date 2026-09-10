import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

export const MUTATING_WORKFLOW_ALLOWLIST = new Set([
  "deploy.yml",
  "deploy.yaml",
  "release.yml",
  "release.yaml",
]);

const getIndent = (line) => line.match(/^\s*/)?.[0].length ?? 0;
const isIgnoredLine = (line) => {
  const trimmed = line.trim();
  return !trimmed || trimmed.startsWith("#");
};

const getPermissionsHeader = (line) => {
  const match = line.match(/^(\s*)permissions\s*:\s*([^#]*?)(?:\s+#.*)?$/i);

  if (!match) {
    return null;
  }

  return {
    indent: match[1].length,
    value: match[2].trim().toLowerCase(),
  };
};

export const validateWorkflowSource = (workflowPath, source) => {
  const workflowName = basename(workflowPath);

  if (MUTATING_WORKFLOW_ALLOWLIST.has(workflowName)) {
    return [];
  }

  const violations = [];
  const lines = String(source).split(/\r?\n/);
  let permissionsIndent = null;

  lines.forEach((line, index) => {
    if (isIgnoredLine(line)) {
      return;
    }

    const permissionsHeader = getPermissionsHeader(line);

    if (permissionsHeader) {
      permissionsIndent = permissionsHeader.value ? null : permissionsHeader.indent;

      if (permissionsHeader.value === "write-all") {
        violations.push(
          `${workflowName}:${index + 1} ordinary verification workflows cannot use permissions: write-all`,
        );
      }

      return;
    }

    if (permissionsIndent !== null) {
      const indent = getIndent(line);

      if (indent <= permissionsIndent) {
        permissionsIndent = null;
      } else {
        const permission = line.match(/^\s*[A-Za-z0-9_-]+\s*:\s*([A-Za-z-]+)\s*(?:#.*)?$/);

        if (permission?.[1]?.toLowerCase() === "write") {
          violations.push(
            `${workflowName}:${index + 1} ordinary verification workflows cannot request a write permission`,
          );
        }
      }
    }

    if (/\bgit\s+push\b/i.test(line)) {
      violations.push(
        `${workflowName}:${index + 1} ordinary verification workflows cannot run git push`,
      );
    }
  });

  return violations;
};

export const validateWorkflowDirectory = (workflowDirectory) => {
  const workflowFiles = readdirSync(workflowDirectory)
    .filter((name) => /\.ya?ml$/i.test(name))
    .sort();

  const violations = workflowFiles.flatMap((workflowFile) => {
    const workflowPath = join(workflowDirectory, workflowFile);
    const source = readFileSync(workflowPath, "utf8");
    return validateWorkflowSource(workflowFile, source);
  });

  return {
    workflowFiles,
    violations,
  };
};

const run = () => {
  const workflowDirectory = fileURLToPath(new URL("../.github/workflows/", import.meta.url));
  const { workflowFiles, violations } = validateWorkflowDirectory(workflowDirectory);

  if (violations.length) {
    console.error("Workflow policy violations:");
    violations.forEach((violation) => console.error(`- ${violation}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Workflow policy OK: ${workflowFiles.length} workflow(s) checked.`);
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run();
}
