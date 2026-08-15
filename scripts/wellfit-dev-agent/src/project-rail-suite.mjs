#!/usr/bin/env node

import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const NODE = process.execPath;
const steps = [
  {
    label: "Project Rail consistency check",
    script: "scripts/wellfit-dev-agent/src/project-rail-check.mjs",
  },
  {
    label: "Project Rail dashboard generator",
    script: "scripts/wellfit-dev-agent/src/project-rail-dashboard.mjs",
  },
  {
    label: "Project Rail dispatcher dry run",
    script: "scripts/wellfit-dev-agent/src/project-rail-dispatcher-dry-run.mjs",
  },
  {
    label: "Project Rail completion sync dry run",
    script: "scripts/wellfit-dev-agent/src/project-rail-completion-sync-dry-run.mjs",
  },
];

const results = steps.map((step) => {
  const result = spawnSync(NODE, [path.join(ROOT, step.script)], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });
  return {
    ...step,
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    ok: result.status === 0,
  };
});

for (const result of results) {
  process.stdout.write(`\n## ${result.label}\n`);
  process.stdout.write(result.stdout);
  if (result.stderr.trim()) process.stderr.write(result.stderr);
}

const ready = results.every((result) => result.ok);
process.stdout.write([
  "",
  "WellFit Project Rail Suite",
  "Mode: REPORT_ONLY_AND_DRY_RUN",
  "Never executes product tasks: true",
  "Never modifies project sources: true",
  `PROJECT_RAIL_SUITE_READY=${ready}`,
  "",
].join("\n"));
process.exitCode = ready ? 0 : 1;
