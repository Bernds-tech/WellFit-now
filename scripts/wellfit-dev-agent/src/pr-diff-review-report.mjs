#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "pr-diff-review-report.md");
const POLICY_PATH = path.join(ROOT, "project-register", "pr-diff-review-policy.json");
const INVENTORY_PATH = path.join(ROOT, "project-register", "repository-inventory.json");
const READINESS_PATH = path.join(ROOT, "project-register", "product-readiness.json");
const CROSS_REFERENCE_PATH = path.join(ROOT, "project-register", "cross-reference-maintenance.json");
const AUTO_MERGE_REPORT_PATH = path.join(OUTPUT_DIR, "auto-merge-eligibility-report.md");
const AUTO_REPAIR_REPORT_PATH = path.join(OUTPUT_DIR, "auto-repair-decision-report.md");
const POST_CREATION_REPORT_PATHS = [
  path.join(OUTPUT_DIR, "pr-post-creation-guard-report.md"),
  path.join(OUTPUT_DIR, "quality-gate-report.md")
];

function runGit(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8", shell: false });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

function readJson(absolutePath) {
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function readTextSafe(absolutePath) {
  if (!fs.existsSync(absolutePath)) return "";
  return fs.readFileSync(absolutePath, "utf8");
}

function normalizePath(filePath) {
  return filePath.replace(/\\/gu, "/").replace(/^\.\//u, "").trim();
}

function uniqueSorted(values) {
  return [...new Set(values.map(normalizePath).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function globToRegex(pattern) {
  const normalized = normalizePath(pattern);
  if (normalized === "**") return /^.*$/u;
  const escaped = normalized.replace(/[.+^${}()|[\]\\]/gu, "\\$&")
    .replace(/\*\*/gu, "__DOUBLE_STAR__")
    .replace(/\*/gu, "[^/]*")
    .replace(/__DOUBLE_STAR__/gu, ".*");
  return new RegExp(`^${escaped}$`, "u");
}

function matchesPattern(filePath, pattern) {
  const normalizedFile = normalizePath(filePath);
  const normalizedPattern = normalizePath(pattern);
  if (normalizedPattern.includes("PR #13")) return /PR #13|native\/unity|WellFitBuddyAR/iu.test(normalizedFile);
  return globToRegex(normalizedPattern).test(normalizedFile);
}

function getDefaultBaseRef() {
  const candidates = ["origin/main", "main", "origin/master", "master"];
  for (const candidate of candidates) {
    const result = runGit(["rev-parse", "--verify", candidate]);
    if (result.ok) return candidate;
  }
  return null;
}

function parseNameOnly(output) {
  return output.split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const tabParts = line.split("\t");
      return tabParts[tabParts.length - 1];
    });
}

function getChangedFiles(baseRef) {
  const files = [];
  const gitSources = [];

  if (baseRef) {
    const result = runGit(["diff", "--name-only", `${baseRef}...HEAD`]);
    if (result.ok) {
      files.push(...parseNameOnly(result.stdout));
      gitSources.push(`git diff --name-only ${baseRef}...HEAD`);
    } else {
      gitSources.push(`git diff --name-only ${baseRef}...HEAD failed: ${result.stderr.trim() || "unknown error"}`);
    }
  }

  for (const args of [["diff", "--name-only"], ["diff", "--name-only", "--cached"]]) {
    const result = runGit(args);
    if (result.ok) {
      files.push(...parseNameOnly(result.stdout));
      gitSources.push(`git ${args.join(" ")}`);
    } else {
      gitSources.push(`git ${args.join(" ")} failed: ${result.stderr.trim() || "unknown error"}`);
    }
  }

  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  if (untracked.ok) {
    files.push(...parseNameOnly(untracked.stdout));
    gitSources.push("git ls-files --others --exclude-standard");
  } else {
    gitSources.push(`git ls-files --others --exclude-standard failed: ${untracked.stderr.trim() || "unknown error"}`);
  }

  return { files: uniqueSorted(files), gitSources };
}

function classifyFile(filePath, policy) {
  const rules = policy.changedFileClassificationRules ?? [];
  const fallback = "unknown_or_review_required";
  for (const rule of rules) {
    if (rule.classification === fallback) continue;
    if ((rule.patterns ?? []).some((pattern) => matchesPattern(filePath, pattern))) return rule.classification;
  }
  return fallback;
}

function buildInventoryIndex(inventory) {
  const mapped = new Map();
  for (const entry of inventory.mapped_files ?? []) {
    if (entry?.path) mapped.set(normalizePath(entry.path), entry);
  }
  for (const group of inventory.file_groups ?? []) {
    for (const entry of group.files ?? []) {
      if (entry?.path && !mapped.has(normalizePath(entry.path))) mapped.set(normalizePath(entry.path), entry);
    }
  }
  return mapped;
}

function findProtectedPathMatches(files, policy, inventory) {
  const policyRules = policy.protectedPathRules ?? [];
  const inventoryRules = inventory.protected_paths ?? [];
  const matches = [];
  for (const file of files) {
    for (const rule of policyRules) {
      if (rule.pattern && matchesPattern(file, rule.pattern)) matches.push({ file, pattern: rule.pattern, source: "pr-diff-review-policy", reason: rule.reason ?? "protected path" });
    }
    for (const rule of inventoryRules) {
      if (rule.pattern && matchesPattern(file, rule.pattern)) matches.push({ file, pattern: rule.pattern, source: "repository-inventory", reason: rule.reason ?? "inventory protected path" });
    }
  }
  return matches;
}

function topicRegex(topic) {
  const escaped = topic.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&").replace(/\s+/gu, "\\s+");
  if (/^[a-z0-9 #]+$/iu.test(topic)) return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "iu");
  return new RegExp(escaped, "iu");
}

function getDiffText(baseRef) {
  const chunks = [];
  if (baseRef) {
    const result = runGit(["diff", "--unified=0", `${baseRef}...HEAD`]);
    if (result.ok) chunks.push(result.stdout);
  }
  for (const args of [["diff", "--unified=0"], ["diff", "--cached", "--unified=0"]]) {
    const result = runGit(args);
    if (result.ok) chunks.push(result.stdout);
  }
  return chunks.join("\n");
}

function findProtectedTopicMatches(files, diffText, policy) {
  const haystack = `${files.join("\n")}\n${diffText}`;
  return (policy.protectedTopicRules ?? [])
    .filter((topic) => topicRegex(topic).test(haystack))
    .map((topic) => ({ topic, source: "changed paths or diff text", note: "Report-only finding; governance/policy mentions still require explicit no-runtime-impact rationale." }));
}

function summarizeClassifications(classifiedFiles) {
  const summary = new Map();
  for (const entry of classifiedFiles) summary.set(entry.classification, (summary.get(entry.classification) ?? 0) + 1);
  return [...summary.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([classification, count]) => ({ classification, count }));
}

function findCrossReferenceImpact(classifiedFiles, crossReference) {
  const categories = crossReference.changeCategories ?? {};
  const impacts = [];
  const classes = new Set(classifiedFiles.map((entry) => entry.classification));
  const addCategory = (key, reason) => {
    if (categories[key]) impacts.push({ category: key, reason, requiredInspectFiles: categories[key].requiredInspectFiles ?? [], requiredUpdateTargets: categories[key].requiredUpdateTargets ?? [] });
  };

  if (classes.has("agent_script")) addCategory("agent_script_added_or_changed", "WellFit dev-agent script or output framework changed.");
  if (classifiedFiles.some((entry) => entry.file === "scripts/wellfit-dev-agent/src/quality-gate.mjs")) addCategory("quality_gate_changed", "Quality gate integration changed.");
  if (classes.has("registry_only")) addCategory("registry_changed", "Project-register governance or inventory policy changed.");
  if (classes.has("docs_only")) addCategory("architecture_doc_changed", "Documentation, architecture, TODO, or Work Map file changed.");
  if (classes.has("runtime_app")) addCategory("route_changed", "App route/runtime app path changed.");
  if (classes.has("runtime_component")) addCategory("component_changed", "Runtime component path changed.");
  if (classes.has("runtime_lib")) addCategory("runtime_lib_changed", "Runtime library path changed.");
  if (classes.has("firebase_functions")) addCategory("api_added_or_changed", "Firebase Functions/backend path changed.");
  if (classes.has("firestore_rules")) addCategory("firestore_rules_changed", "Firestore rules changed.");
  if (classes.has("native_unity")) addCategory("unity_or_ar_changed", "Unity/native path changed.");

  return impacts;
}

function findReadinessImpact(classifiedFiles, readiness) {
  const runtimeClasses = new Set(["runtime_app", "runtime_component", "runtime_lib", "firebase_functions", "firestore_rules", "public_assets", "package_manifest", "native_unity", "unknown_or_review_required"]);
  const hasRuntime = classifiedFiles.some((entry) => runtimeClasses.has(entry.classification));
  const touchedReadiness = classifiedFiles.some((entry) => entry.file === "project-register/product-readiness.json" || entry.file === "docs/architecture/WELLFIT_PRODUCT_READINESS_MATRIX.md");
  const protectedModules = (readiness.modules ?? []).filter((module) => module.protected === true || /protected|critical|human/i.test(`${module.riskLevel ?? ""} ${module.status ?? ""}`));
  return {
    likelyImpact: hasRuntime || touchedReadiness,
    touchedReadinessSource: touchedReadiness,
    reason: hasRuntime ? "Runtime/protected classifications can affect module readiness evidence." : touchedReadiness ? "Product readiness source changed directly." : "Docs/registry/agent changes appear to require readiness consideration only.",
    protectedModuleCount: protectedModules.length
  };
}

function findInventoryImpact(classifiedFiles, inventoryIndex) {
  return classifiedFiles.map((entry) => {
    const inventoryEntry = inventoryIndex.get(entry.file);
    return {
      file: entry.file,
      classification: entry.classification,
      mapped: Boolean(inventoryEntry),
      protected: Boolean(inventoryEntry?.protected),
      riskLevel: inventoryEntry?.risk_level ?? inventoryEntry?.riskLevel ?? "not_mapped"
    };
  });
}

function findTaskStatusImpact(classifiedFiles) {
  const needsEvidence = classifiedFiles.length > 0;
  const runtimeOrUnknown = classifiedFiles.filter((entry) => ["runtime_app", "runtime_component", "runtime_lib", "firebase_functions", "firestore_rules", "native_unity", "unknown_or_review_required"].includes(entry.classification));
  return {
    expected: needsEvidence,
    reason: runtimeOrUnknown.length ? "Runtime/protected/unknown changed files require task-status/work-log evidence plus human review." : "Governance/docs/register/script changes require task-status/work-log evidence and preserved TODO/status history.",
    runtimeOrUnknownFiles: runtimeOrUnknown.map((entry) => entry.file)
  };
}

function extractSignal(text, signalName) {
  const escaped = signalName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = text.match(new RegExp(`${escaped}=((?:true|false))`, "iu"));
  return match ? match[1].toLowerCase() : "not_available";
}

function buildExternalGuardReports() {
  const autoMergeText = readTextSafe(AUTO_MERGE_REPORT_PATH);
  const autoRepairText = readTextSafe(AUTO_REPAIR_REPORT_PATH);
  const postCreationText = POST_CREATION_REPORT_PATHS.map(readTextSafe).find(Boolean) ?? "";
  return {
    autoMerge: {
      signal: extractSignal(autoMergeText, "AUTO_MERGE_ELIGIBLE"),
      reportAvailable: Boolean(autoMergeText),
      note: "Report-only; not approval and not a merge action."
    },
    autoRepair: {
      signal: extractSignal(autoRepairText, "AUTO_REPAIR_ALLOWED"),
      reportAvailable: Boolean(autoRepairText),
      note: "Report-only; not authorization to repair files."
    },
    postCreationGuard: {
      signal: extractSignal(postCreationText, "PR_POST_CREATION_GUARD_READY"),
      reportAvailable: Boolean(postCreationText),
      note: "Report-only; post-PR mergeability evidence is expected after PR creation."
    }
  };
}

function renderList(items, renderItem = (item) => String(item)) {
  if (!items.length) return "- none";
  return items.map((item) => `- ${renderItem(item)}`).join("\n");
}

function renderMarkdown(data) {
  return `# WellFit PR Diff Review Report\n\nGenerated: ${data.generatedAt}\nMode: REPORT_ONLY\nActivation state: ${data.activationState}\nBase ref: ${data.baseRef ?? "not provided"}\nPR_DIFF_REVIEW_READY=${data.ready}\nPR_DIFF_REVIEW_NO_DIFF=${data.noDiff}\n\n## Non-Authorizing Boundary\n\n- Never approves PRs: true\n- Never merges PRs: true\n- Never enables auto-merge: true\n- Never repairs files: true\n- Never deploys: true\n- Never closes PRs: true\n- Never modifies runtime product code: true\n\n## Git Inputs\n\n${renderList(data.gitSources)}\n\n## Changed Files\n\n${renderList(data.classifiedFiles, (entry) => `\`${entry.file}\` — ${entry.classification}`)}\n\n## Classification Summary\n\n${renderList(data.classificationSummary, (entry) => `${entry.classification}: ${entry.count}`)}\n\n## Protected Path Findings\n\n${renderList(data.protectedPathFindings, (entry) => `\`${entry.file}\` matched \`${entry.pattern}\` (${entry.source}) — ${entry.reason}`)}\n\n## Protected Topic Findings\n\n${renderList(data.protectedTopicFindings, (entry) => `${entry.topic} — ${entry.note}`)}\n\n## Cross-Reference Impact\n\n${renderList(data.crossReferenceImpact, (entry) => `${entry.category}: ${entry.reason}`)}\n\n## Product Readiness Impact\n\n- Likely impact: ${data.productReadinessImpact.likelyImpact}\n- Touched readiness source: ${data.productReadinessImpact.touchedReadinessSource}\n- Protected module count in matrix: ${data.productReadinessImpact.protectedModuleCount}\n- Reason: ${data.productReadinessImpact.reason}\n\n## Repository Inventory Impact\n\n${renderList(data.repositoryInventoryImpact, (entry) => `\`${entry.file}\` — mapped=${entry.mapped}, protected=${entry.protected}, risk=${entry.riskLevel}`)}\n\n## Task Status / Work-Log Impact\n\n- Evidence expected: ${data.taskStatusImpact.expected}\n- Reason: ${data.taskStatusImpact.reason}\n- Runtime or unknown files: ${data.taskStatusImpact.runtimeOrUnknownFiles.length ? data.taskStatusImpact.runtimeOrUnknownFiles.map((file) => `\`${file}\``).join(", ") : "none"}\n\n## Auto-Merge Report\n\n- AUTO_MERGE_ELIGIBLE=${data.externalGuards.autoMerge.signal}\n- Report available: ${data.externalGuards.autoMerge.reportAvailable}\n- ${data.externalGuards.autoMerge.note}\n\n## Auto-Repair Report\n\n- AUTO_REPAIR_ALLOWED=${data.externalGuards.autoRepair.signal}\n- Report available: ${data.externalGuards.autoRepair.reportAvailable}\n- ${data.externalGuards.autoRepair.note}\n\n## Post-Creation Guard Report\n\n- PR_POST_CREATION_GUARD_READY=${data.externalGuards.postCreationGuard.signal}\n- Report available: ${data.externalGuards.postCreationGuard.reportAvailable}\n- ${data.externalGuards.postCreationGuard.note}\n\n## Human Review Required\n\n- Required: ${data.humanReviewRequired}\n- Reasons:\n${renderList(data.humanReviewReasons)}\n\n## Forbidden Auto Actions Confirmed\n\n${renderList(data.forbiddenAutoActionsConfirmed)}\n\n## Result\n\nPR_DIFF_REVIEW_READY=${data.ready}\nPR_DIFF_REVIEW_NO_DIFF=${data.noDiff}\n${data.noDiff ? "No-diff analysis result: SKIPPED_NO_DIFF (not a PR approval and not merge evidence).\\n" : ""}`;
}

function main() {
  const baseRefArg = process.argv.find((arg) => arg.startsWith("--base="));
  const positionalBase = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  const baseRef = baseRefArg ? baseRefArg.replace(/^--base=/u, "") : positionalBase ?? getDefaultBaseRef();

  const reasons = [];
  let policy;
  let inventory;
  let readiness;
  let crossReference;
  try {
    policy = readJson(POLICY_PATH);
    inventory = readJson(INVENTORY_PATH);
    readiness = readJson(READINESS_PATH);
    crossReference = readJson(CROSS_REFERENCE_PATH);
  } catch (error) {
    console.error(`Failed to read required PR diff review inputs: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  if (policy.activationState !== "report_only") reasons.push(`Policy activationState must be report_only; found ${policy.activationState}`);

  const { files, gitSources } = getChangedFiles(baseRef);
  const noDiff = files.length === 0;

  const classifiedFiles = files.map((file) => ({ file, classification: classifyFile(file, policy) }));
  const classificationSummary = summarizeClassifications(classifiedFiles);
  const inventoryIndex = buildInventoryIndex(inventory);
  const protectedPathFindings = findProtectedPathMatches(files, policy, inventory);
  const protectedTopicFindings = findProtectedTopicMatches(files, getDiffText(baseRef), policy);
  const crossReferenceImpact = findCrossReferenceImpact(classifiedFiles, crossReference);
  const productReadinessImpact = findReadinessImpact(classifiedFiles, readiness);
  const repositoryInventoryImpact = findInventoryImpact(classifiedFiles, inventoryIndex);
  const taskStatusImpact = findTaskStatusImpact(classifiedFiles);
  const externalGuards = buildExternalGuardReports();

  const humanReviewReasons = [];
  if (protectedPathFindings.length) humanReviewReasons.push("Protected path matches were detected.");
  if (protectedTopicFindings.length) humanReviewReasons.push("Protected topic mentions were detected in changed paths or diff text; governance/reporting mentions need no-runtime-impact rationale.");
  const reviewClasses = classifiedFiles.filter((entry) => ["runtime_app", "runtime_component", "runtime_lib", "firebase_functions", "firestore_rules", "public_assets", "package_manifest", "github_workflow", "native_unity", "unknown_or_review_required"].includes(entry.classification));
  if (reviewClasses.length) humanReviewReasons.push(`Review-required classifications detected: ${[...new Set(reviewClasses.map((entry) => entry.classification))].join(", ")}.`);
  const unmapped = repositoryInventoryImpact.filter((entry) => !entry.mapped);
  if (unmapped.length) humanReviewReasons.push(`Repository inventory has unmapped changed files: ${unmapped.map((entry) => entry.file).join(", ")}.`);
  if (productReadinessImpact.likelyImpact) humanReviewReasons.push("Product readiness impact or direct readiness source change was detected.");
  if (noDiff) humanReviewReasons.push("No changed files were detected; PR diff review is not applicable for this analysis/no-diff run.");
  if (!humanReviewReasons.length) humanReviewReasons.push("No protected/runtime/unknown impact detected; normal human PR review still applies before merge.");

  const ready = reasons.length === 0;
  const forbiddenAutoActionsConfirmed = policy.forbiddenAutoActions ?? [];
  const data = {
    generatedAt: new Date().toISOString(),
    activationState: policy.activationState,
    baseRef,
    ready,
    noDiff,
    gitSources,
    classifiedFiles,
    classificationSummary,
    protectedPathFindings,
    protectedTopicFindings,
    crossReferenceImpact,
    productReadinessImpact,
    repositoryInventoryImpact,
    taskStatusImpact,
    externalGuards,
    humanReviewRequired: humanReviewReasons.length > 0,
    humanReviewReasons,
    forbiddenAutoActionsConfirmed
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, renderMarkdown(data), "utf8");

  console.log(`WellFit PR diff review report written: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never enables auto-merge: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log(`Changed files: ${files.length}`);
  console.log(`No-diff analysis: ${noDiff}`);
  console.log(`Protected path findings: ${protectedPathFindings.length}`);
  console.log(`Protected topic findings: ${protectedTopicFindings.length}`);
  console.log(`Human review required: ${data.humanReviewRequired}`);
  console.log(`PR_DIFF_REVIEW_READY=${ready}`);
  console.log(`PR_DIFF_REVIEW_NO_DIFF=${noDiff}`);
  if (!ready) {
    for (const reason of reasons) console.log(`- ${reason}`);
    process.exit(1);
  }
}

main();
