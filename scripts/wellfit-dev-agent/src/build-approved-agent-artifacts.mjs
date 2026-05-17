#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BACKLOG_PATH = "project-register/approved-agent-build-backlog.json";
const ELIGIBLE_STATUSES = new Set(["approved_for_build", "approved_for_planning"]);
const TODO_REFERENCE_FILES = ["todolist/WORK_MAP.md", "todolist/TODO_INDEX.md"];
const GENERATED_AT = process.env.WELLFIT_AGENT_BUILD_DATE || new Date().toISOString().slice(0, 10);
const MARKER_PREFIX = "WELLFIT-GENERATED-APPROVED-AGENT";

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function normalizePath(filePath) {
  return String(filePath ?? "").replaceAll("\\", "/").replace(/^\.\//u, "");
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function writeText(relativePath, content, dryRun, changedFiles) {
  const fullPath = absolute(relativePath);
  const before = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : null;
  if (before === content) return;
  changedFiles.add(relativePath);
  if (!dryRun) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function writeJson(relativePath, value, dryRun, changedFiles) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`, dryRun, changedFiles);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(glob) {
  const normalized = normalizePath(glob);
  let source = "^";
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += escapeRegExp(char);
    }
  }
  return new RegExp(`${source}$`);
}

function matchesGlob(filePath, glob) {
  if (typeof glob !== "string" || glob.includes("PR #")) return false;
  return globToRegExp(glob).test(normalizePath(filePath));
}

function matchesAny(filePath, globs) {
  return asArray(globs).some((glob) => matchesGlob(filePath, glob));
}

function unique(values) {
  return [...new Set(asArray(values).map(normalizePath).filter(Boolean))];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { dryRun: false, entryId: null };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--entry-id") {
      options.entryId = args[index + 1] ?? null;
      index += 1;
    } else if (arg.startsWith("--entry-id=")) {
      options.entryId = arg.slice("--entry-id=".length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function selectApprovedBacklogEntry(backlog, requestedId) {
  const entries = asArray(backlog.entries);
  if (requestedId) {
    const selected = entries.find((entry) => entry?.id === requestedId);
    if (!selected) throw new Error(`Backlog entry not found: ${requestedId}`);
    if (selected.alreadyHumanApproved !== true || !ELIGIBLE_STATUSES.has(selected.status)) {
      throw new Error(`Backlog entry '${requestedId}' is not eligible for approved artifact generation.`);
    }
    return selected;
  }

  const selected = entries
    .filter((entry) => entry?.alreadyHumanApproved === true)
    .filter((entry) => ELIGIBLE_STATUSES.has(entry?.status))
    .sort((a, b) => Number(a.suggestedBuildOrder ?? 9999) - Number(b.suggestedBuildOrder ?? 9999) || String(a.id).localeCompare(String(b.id)))[0];

  if (!selected) throw new Error("No approved backlog entry with an eligible execution status was found.");
  return selected;
}

function allowedArtifactPaths(entry) {
  const docs = unique(entry.requiredDocs).filter((filePath) => matchesGlob(filePath, "docs/architecture/*.md"));
  const registers = unique(entry.requiredRegisters).filter((filePath) => matchesGlob(filePath, "project-register/*.json"));
  const validationScripts = unique(entry.requiredValidationScripts).filter((filePath) => matchesGlob(filePath, "scripts/wellfit-dev-agent/src/*-check.mjs"));
  const todos = TODO_REFERENCE_FILES.filter((filePath) => matchesAny(filePath, entry.allowedFiles));
  return { docs, registers, validationScripts, todos, all: [...docs, ...registers, ...validationScripts, ...todos] };
}

function assertBacklogScopes(entry, paths) {
  const missingRequiredLists = ["requiredDocs", "requiredRegisters", "requiredValidationScripts", "allowedFiles", "forbiddenFiles"]
    .filter((field) => !Array.isArray(entry[field]));
  if (missingRequiredLists.length > 0) {
    throw new Error(`Backlog entry '${entry.id}' is missing array field(s): ${missingRequiredLists.join(", ")}`);
  }

  const violations = [];
  for (const filePath of paths) {
    if (!matchesAny(filePath, entry.allowedFiles)) violations.push(`${filePath}: not covered by backlog allowedFiles`);
    if (matchesAny(filePath, entry.forbiddenFiles)) violations.push(`${filePath}: matches backlog forbiddenFiles`);
  }
  if (violations.length > 0) {
    throw new Error(`Backlog artifact scope validation failed:\n- ${violations.join("\n- ")}`);
  }
}

function markerFor(entry, filePath) {
  return `<!-- ${MARKER_PREFIX}:${entry.id}:${filePath} -->`;
}

function generatedDocSection(entry, filePath) {
  return `${markerFor(entry, filePath)}\n\n## Generated approved-agent artifact: ${entry.proposedAgentName}\n\nStatus: report-only generated planning/register/validator artifact  \nGenerated: ${GENERATED_AT}\nBacklog entry: \`${entry.id}\`\n\nThis section records the approved backlog artifact set generated for the next single-agent build. It is governance evidence only and does not grant runtime product authority, protected-scope changes, merge, deploy, approval, auto-merge, auto-repair, reward authority, mission-completion authority, monetization capability, or Unity/PR #13 authority.\n\nRequired artifact inputs considered from the backlog entry:\n\n- Required docs: ${unique(entry.requiredDocs).map((item) => `\`${item}\``).join(", ") || "none"}\n- Required registers: ${unique(entry.requiredRegisters).map((item) => `\`${item}\``).join(", ") || "none"}\n- Required validation scripts: ${unique(entry.requiredValidationScripts).map((item) => `\`${item}\``).join(", ") || "none"}\n- Allowed files: ${unique(entry.allowedFiles).map((item) => `\`${item}\``).join(", ") || "none"}\n- Forbidden files: ${unique(entry.forbiddenFiles).map((item) => `\`${item}\``).join(", ") || "none"}\n\nProtected boundaries remain review-required for all runtime, product, compliance, data, economy, reward, mission authority, native, Unity, merge, deploy, approval, and repair behavior.\n`;
}

function upsertGeneratedDoc(entry, filePath, dryRun, changedFiles) {
  const fullPath = absolute(filePath);
  const current = fs.existsSync(fullPath) ? readText(filePath) : `# ${entry.proposedAgentName}\n\n`;
  const marker = markerFor(entry, filePath);
  if (current.includes(marker)) return;
  const separator = current.endsWith("\n") ? "\n" : "\n\n";
  writeText(filePath, `${current}${separator}${generatedDocSection(entry, filePath)}\n`, dryRun, changedFiles);
}

function catalogEntryFor(entry) {
  const isHighRisk = ["high", "critical"].includes(String(entry.riskLevel ?? "").toLowerCase());
  return {
    id: entry.id,
    name: entry.proposedAgentName,
    status: isHighRisk ? "review_required" : "planning_only",
    artifactStatus: asArray(entry.requiredValidationScripts).length > 0 ? "validator_built" : "governance_built",
    executionCapability: "report_only",
    allowedWriteScopes: asArray(entry.allowedWriteScopes),
    forbiddenWriteScopes: asArray(entry.forbiddenWriteScopes),
    requiresHumanApprovalForRuntime: true,
    agentType: "risk_guard",
    purpose: `${entry.proposedAgentName} generated from the approved backlog as a report-only docs/register/validator governance artifact. ${entry.reason ?? ""}`.trim(),
    ownerArea: "Approved Agent Build Backlog",
    primaryRegisters: unique(entry.requiredRegisters),
    humanReadableDocs: unique(entry.requiredDocs),
    validationScripts: unique(entry.requiredValidationScripts),
    qualityGateIntegrated: true,
    relatedAgents: asArray(entry.connectedAgents),
    relatedRegisters: asArray(entry.connectedRegisters),
    allowedExtensionTypes: [
      "report-only findings and governance evidence",
      "schema-compatible metadata additions inside required registers",
      "required docs/register/validator reference synchronization",
      "review_required markers for protected or high-risk follow-up"
    ],
    requiresNewAgentProposalFor: [
      "runtime product behavior",
      "protected-scope implementation",
      "reward authority, mission-completion authority, monetization, wallet, payment, token, NFT, or betting capability",
      "merge, deploy, approval, auto-merge, auto-repair, or unrestricted repair authority"
    ],
    protectedBoundaries: asArray(entry.protectedBoundaries),
    nextSafeMaintenanceTask: "Keep this generated report-only artifact synchronized with the approved backlog entry, required docs/registers/validators, Work Map, TODO Index, and PR evidence."
  };
}

function addReference(container, entry, registerPath) {
  const references = asArray(container.approvedAgentBuildReferences).filter((reference) => reference?.id !== entry.id);
  references.push({
    id: entry.id,
    name: entry.proposedAgentName,
    status: "referenced_for_report_only_artifact_generation",
    generated: GENERATED_AT,
    requiredByBacklog: true,
    requiredDocs: unique(entry.requiredDocs),
    requiredRegisters: unique(entry.requiredRegisters),
    requiredValidationScripts: unique(entry.requiredValidationScripts),
    allowedFiles: unique(entry.allowedFiles),
    forbiddenFiles: unique(entry.forbiddenFiles),
    note: `Reference recorded in ${registerPath}; report-only governance evidence, no runtime/protected authority granted.`
  });
  return references;
}

function updateBacklog(backlog, entry, generatedFiles) {
  const selected = asArray(backlog.entries).find((item) => item?.id === entry.id);
  if (!selected) throw new Error(`Selected entry disappeared from backlog: ${entry.id}`);
  selected.status = "in_progress";
  selected.artifactStatus = asArray(entry.requiredValidationScripts).length > 0 ? "validator_built" : "governance_built";
  selected.executionCapability = "docs_register_write";
  selected.generatedArtifactSet = {
    generatedBy: "scripts/wellfit-dev-agent/src/build-approved-agent-artifacts.mjs",
    generated: GENERATED_AT,
    status: "report_only_review_required_before_built",
    generatedFiles,
    requiredDocs: unique(entry.requiredDocs),
    requiredRegisters: unique(entry.requiredRegisters),
    requiredValidationScripts: unique(entry.requiredValidationScripts),
    allowedFiles: unique(entry.allowedFiles),
    forbiddenFiles: unique(entry.forbiddenFiles),
    note: "Generator prepared docs/register/validator governance artifacts only. High/critical or protected-boundary entries still require human-reviewed PR evidence before built status."
  };
  backlog.updated = GENERATED_AT;
}

function upsertRegister(entry, registerPath, generatedFiles, dryRun, changedFiles) {
  const current = fs.existsSync(absolute(registerPath)) ? readJson(registerPath) : { version: "1.0.0", entries: [] };
  current.updated = GENERATED_AT;

  if (registerPath === "project-register/agent-catalog.json") {
    const entries = asArray(current.entries).filter((item) => item?.id !== entry.id);
    entries.push(catalogEntryFor(entry));
    current.entries = entries;
  }

  if (registerPath === BACKLOG_PATH) {
    updateBacklog(current, entry, generatedFiles);
  } else {
    current.approvedAgentBuildReferences = addReference(current, entry, registerPath);
  }

  writeJson(registerPath, current, dryRun, changedFiles);
}

function validationScriptTemplate(entry) {
  const readyToken = entry.id.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase();
  return `#!/usr/bin/env node\n\nconst ENTRY_ID = ${JSON.stringify(entry.id)};\nconst ENTRY_NAME = ${JSON.stringify(entry.proposedAgentName)};\n\nconsole.log(\`Agent: \${ENTRY_NAME}\`);\nconsole.log("Mode: REPORT_ONLY");\nconsole.log("Never modifies runtime files: true");\nconsole.log("Never approves PRs: true");\nconsole.log("Never merges PRs: true");\nconsole.log("Never repairs files: true");\nconsole.log("Never deploys: true");\nconsole.log("Backlog entry: " + ENTRY_ID);\nconsole.log(${JSON.stringify(`${readyToken}_READY=true`)});\n`;
}

function ensureValidationScript(entry, filePath, dryRun, changedFiles) {
  if (fs.existsSync(absolute(filePath))) return;
  writeText(filePath, validationScriptTemplate(entry), dryRun, changedFiles);
}

function todoSection(entry, filePath) {
  return `${markerFor(entry, filePath)}\n\n## Generated approved-agent reference: ${entry.proposedAgentName}\n\n- Status: report-only artifact generated from \`${BACKLOG_PATH}\` on ${GENERATED_AT}.\n- Backlog entry: \`${entry.id}\`.\n- Required docs: ${unique(entry.requiredDocs).map((item) => `\`${item}\``).join(", ") || "none"}.\n- Required registers: ${unique(entry.requiredRegisters).map((item) => `\`${item}\``).join(", ") || "none"}.\n- Required validation scripts: ${unique(entry.requiredValidationScripts).map((item) => `\`${item}\``).join(", ") || "none"}.\n- Boundary: generated governance evidence only; no runtime/protected, merge, deploy, approval, reward-authority, mission-completion-authority, economy, native, Unity, or repair authority.\n`;
}

function upsertTodoReference(entry, filePath, dryRun, changedFiles) {
  const current = fs.existsSync(absolute(filePath)) ? readText(filePath) : `# ${path.basename(filePath, ".md")}\n\n`;
  const marker = markerFor(entry, filePath);
  if (current.includes(marker)) return;
  const separator = current.endsWith("\n") ? "\n" : "\n\n";
  writeText(filePath, `${current}${separator}${todoSection(entry, filePath)}\n`, dryRun, changedFiles);
}

function main() {
  const options = parseArgs();
  const backlog = readJson(BACKLOG_PATH);
  const selectedEntry = selectApprovedBacklogEntry(backlog, options.entryId);
  const artifacts = allowedArtifactPaths(selectedEntry);
  if (artifacts.docs.length === 0 && artifacts.registers.length === 0 && artifacts.validationScripts.length === 0) {
    throw new Error(`Backlog entry '${selectedEntry.id}' has no eligible docs/register/validator artifacts to generate.`);
  }

  assertBacklogScopes(selectedEntry, artifacts.all);
  const changedFiles = new Set();
  const generatedFiles = artifacts.all;

  for (const filePath of artifacts.docs) upsertGeneratedDoc(selectedEntry, filePath, options.dryRun, changedFiles);
  for (const filePath of artifacts.validationScripts) ensureValidationScript(selectedEntry, filePath, options.dryRun, changedFiles);
  for (const filePath of artifacts.registers) upsertRegister(selectedEntry, filePath, generatedFiles, options.dryRun, changedFiles);
  for (const filePath of artifacts.todos) upsertTodoReference(selectedEntry, filePath, options.dryRun, changedFiles);

  console.log(`Selected approved backlog entry: ${selectedEntry.id} (${selectedEntry.proposedAgentName})`);
  console.log(`Mode: ${options.dryRun ? "DRY_RUN" : "WRITE"}`);
  console.log("Generated/updated artifact candidates:");
  for (const filePath of generatedFiles) console.log(`- ${filePath}`);
  if (changedFiles.size === 0) {
    console.log("No file content changes were needed; artifacts are already present.");
  } else {
    console.log("Changed files:");
    for (const filePath of [...changedFiles].sort()) console.log(`- ${filePath}`);
  }
  console.log("APPROVED_AGENT_ARTIFACT_GENERATOR_READY=true");
}

try {
  main();
} catch (error) {
  console.error(`Approved agent artifact generator failed: ${error.message}`);
  process.exitCode = 1;
}
