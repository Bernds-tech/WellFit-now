#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "Dockerfile",
  ".dockerignore",
  "next.config.ts",
  "app/api/health/route.ts",
  ".github/workflows/container-build.yml",
  "infra/runtime/compose.standalone.yml",
  "infra/runtime/README.md",
  "scripts/runtime/validate-runtime-env.mjs",
  "scripts/runtime/create-release-manifest.mjs",
  "project-register/apis.json",
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function check(results, name, passed, details) {
  results.push({ name, passed: Boolean(passed), details });
}

function main() {
  const results = [];
  for (const file of requiredFiles) {
    check(results, `Required file ${file}`, fs.existsSync(path.join(ROOT, file)), file);
  }

  if (results.some((result) => !result.passed)) {
    for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}`);
    process.exit(1);
  }

  const nextConfig = read("next.config.ts");
  const dockerfile = read("Dockerfile");
  const dockerignore = read(".dockerignore");
  const healthRoute = read("app/api/health/route.ts");
  const workflow = read(".github/workflows/container-build.yml");
  const compose = read("infra/runtime/compose.standalone.yml");
  const manifestScript = read("scripts/runtime/create-release-manifest.mjs");
  const apiRegister = JSON.parse(read("project-register/apis.json"));

  check(results, "Next.js standalone output", /output:\s*["']standalone["']/.test(nextConfig), "next.config.ts");
  check(results, "Container uses dependency/build/runtime stages", /AS dependencies/i.test(dockerfile) && /AS builder/i.test(dockerfile) && /AS runner/i.test(dockerfile), "Dockerfile stages");
  check(results, "Container runs as non-root user", /USER\s+nextjs/.test(dockerfile), "USER nextjs");
  check(results, "Container starts standalone server", /CMD\s*\[\s*["']node["']\s*,\s*["']server\.js["']\s*\]/.test(dockerfile), "node server.js");
  check(results, "Container does not embed server provider secrets", !/(OPENAI_API_KEY|SERVICE_ACCOUNT|PRIVATE_KEY|FIREBASE_ADMIN|DATABASE_PASSWORD)/.test(dockerfile), "server-only credential names absent from Dockerfile");
  check(results, "Container context excludes environment files", /^\.env$/m.test(dockerignore) && /^\.env\.\*$/m.test(dockerignore), ".dockerignore");
  check(results, "Container context excludes Git history", /^\.git$/m.test(dockerignore), ".dockerignore");
  check(results, "Compose uses a read-only root filesystem", /read_only:\s*true/.test(compose), "compose.standalone.yml");
  check(results, "Compose drops Linux capabilities", /cap_drop:\s*\n\s*-\s*ALL/.test(compose), "compose.standalone.yml");
  check(results, "Compose provides an ephemeral Next.js cache", /\/app\/\.next\/cache:rw,noexec,nosuid/.test(compose), "compose.standalone.yml");
  check(results, "Server provider key is runtime-only", /OPENAI_API_KEY:\s*\$\{OPENAI_API_KEY:-\}/.test(compose) && !/OPENAI_API_KEY/.test(dockerfile), "compose runtime interpolation only");
  check(results, "Health endpoint is no-store", /Cache-Control["']?:\s*["']no-store/.test(healthRoute), "health response headers");
  check(results, "Health endpoint declares no deployment", /deploymentPerformedByEndpoint:\s*false/.test(healthRoute), "health response body");
  check(results, "Health endpoint declares no database write", /databaseWritePerformedByEndpoint:\s*false/.test(healthRoute), "health response body");
  check(results, "Health endpoint is registered", Array.isArray(apiRegister.apiRoutes) && apiRegister.apiRoutes.some((entry) => entry.route === "/api/health" && entry.authority === "status-only-no-write"), "project-register/apis.json");
  check(results, "Workflow never pushes a Docker image", /push:\s*false/.test(workflow) && !/docker\s+push/i.test(workflow), "container-build.yml");
  check(results, "Workflow contains no deployment command", !/(firebase\s+deploy|gcloud\s+run\s+deploy|kubectl\s+apply|\bssh\b|\bscp\b)/i.test(workflow), "container-build.yml");
  check(results, "Workflow tests a read-only non-root runtime", /--read-only/.test(workflow) && /docker exec wellfit-web-ci id -u/.test(workflow), "container-build.yml");
  check(results, "Workflow provides an ephemeral Next.js cache", /--tmpfs \/app\/\.next\/cache:rw,noexec,nosuid/.test(workflow), "container-build.yml");
  check(results, "Portable artifact is manual-only", /github\.event_name\s*==\s*['"]workflow_dispatch['"]/.test(workflow), "workflow condition");
  check(results, "Release manifest records no deployment", /productionDataWritten:\s*false/.test(manifestScript) && /databaseMigrationPerformed:\s*false/.test(manifestScript), "release manifest defaults");
  check(results, "Release manifest does not include environment values", !/Object\.fromEntries\s*\(\s*Object\.entries\s*\(\s*process\.env/.test(manifestScript), "no environment dump");

  const passed = results.every((result) => result.passed);
  console.log(`WellFit runtime package check: ${passed ? "PASS" : "FAIL"}`);
  for (const result of results) {
    console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name} (${result.details})`);
  }
  if (!passed) process.exit(1);
}

main();
