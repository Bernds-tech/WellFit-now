#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const REPORT_PATH = path.join(OUTPUT_DIR, "website-agent-backlog-report.md");

const BACKLOG_PATH = "project-register/website-agent-backlog.json";
const WEBSITE_AGENTS_PATH = "project-register/website-agents.json";
const WEBSITE_READINESS_PATH = "project-register/website-readiness.json";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";

const REQUIRED_STATUSES = [
  "open",
  "in_progress",
  "done",
  "blocked",
  "review_required",
  "device_test_required",
  "human_review_required",
  "stale",
  "duplicate",
  "superseded"
];

const REQUIRED_SEVERITIES = ["low", "medium", "high", "critical"];

const REQUIRED_FINDING_TYPES = [
  "website_completion_gap",
  "route_link_issue",
  "mobile_pwa_issue",
  "visual_layout_issue",
  "content_gap",
  "conversion_gap",
  "seo_gap",
  "trust_compliance_review",
  "beta_waitlist_gap",
  "investor_readiness_gap",
  "analytics_experiment_planning",
  "self_improvement_hypothesis",
  "protected_topic_review",
  "duplicate_architecture_risk"
];

const REQUIRED_ENTRY_FIELDS = [
  "id",
  "title",
  "status",
  "severity",
  "findingType",
  "route",
  "routeGroup",
  "sourceAgent",
  "sourceFiles",
  "relatedRegisters",
  "finding",
  "evidence",
  "recommendedAction",
  "nextSafeTask",
  "allowedFiles",
  "forbiddenFiles",
  "requiredChecks",
  "humanReviewRequired",
  "protectedTopics",
  "createdDate",
  "updatedDate"
];

const TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "relatedRegisters",
  "allowedStatuses",
  "severityLevels",
  "findingTypes",
  "routeGroups",
  "backlogEntrySchema",
  "reviewRequiredRules",
  "blockedRules",
  "followUpRules",
  "forbiddenAutoActions",
  "reportOutputSchema",
  "entries"
];

const PROTECTED_TOPIC_PATTERN = /(legal|privacy|datenschutz|agb|impressum|health|child|minor|token|nft|wallet|payment|purchase|payout|betting|reward|points|investor|analytics|public[_ -]?claim|consent|camera|biometric|location|mission[_ -]?completion|anti[_ -]?cheat|financial)/iu;

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function addResult(results, name, passed, details) {
  results.push({ name, passed, details: String(details) });
}

function includesAll(actual, required) {
  const actualSet = new Set(asArray(actual));
  return required.filter((item) => !actualSet.has(item));
}

function renderResults(results) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.details.replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function entryHasProtectedTopic(entry) {
  const haystack = [
    entry.status,
    entry.severity,
    entry.findingType,
    entry.route,
    entry.routeGroup,
    entry.title,
    entry.finding,
    entry.evidence,
    entry.recommendedAction,
    entry.nextSafeTask,
    ...asArray(entry.protectedTopics)
  ].join(" ");
  return PROTECTED_TOPIC_PATTERN.test(haystack) || asArray(entry.protectedTopics).length > 0;
}

function main() {
  const results = [];
  let backlog;
  let websiteAgents;
  let websiteReadiness;

  for (const file of [BACKLOG_PATH, WEBSITE_AGENTS_PATH, WEBSITE_READINESS_PATH, WORK_MAP_PATH, TODO_INDEX_PATH]) {
    addResult(results, `${file} exists`, fs.existsSync(path.join(ROOT, file)), fs.existsSync(path.join(ROOT, file)) ? "found" : "missing");
  }

  try {
    backlog = readJson(BACKLOG_PATH);
    addResult(results, `${BACKLOG_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    addResult(results, `${BACKLOG_PATH} parses as JSON`, false, error.message);
  }

  try {
    websiteAgents = readJson(WEBSITE_AGENTS_PATH);
    addResult(results, `${WEBSITE_AGENTS_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    addResult(results, `${WEBSITE_AGENTS_PATH} parses as JSON`, false, error.message);
  }

  try {
    websiteReadiness = readJson(WEBSITE_READINESS_PATH);
    addResult(results, `${WEBSITE_READINESS_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    addResult(results, `${WEBSITE_READINESS_PATH} parses as JSON`, false, error.message);
  }

  if (backlog) {
    const missingTopLevel = TOP_LEVEL_FIELDS.filter((field) => !(field in backlog));
    addResult(results, "required top-level backlog fields exist", missingTopLevel.length === 0, missingTopLevel.length ? `missing: ${missingTopLevel.join(", ")}` : `${TOP_LEVEL_FIELDS.length} fields present`);
    addResult(results, "activationState is report_only", backlog.activationState === "report_only", backlog.activationState ?? "missing");

    const missingStatuses = includesAll(backlog.allowedStatuses, REQUIRED_STATUSES);
    addResult(results, "allowedStatuses include required statuses", missingStatuses.length === 0, missingStatuses.length ? `missing: ${missingStatuses.join(", ")}` : `${REQUIRED_STATUSES.length} statuses present`);

    const missingSeverities = includesAll(backlog.severityLevels, REQUIRED_SEVERITIES);
    addResult(results, "severityLevels include required levels", missingSeverities.length === 0, missingSeverities.length ? `missing: ${missingSeverities.join(", ")}` : `${REQUIRED_SEVERITIES.length} levels present`);

    const missingFindingTypes = includesAll(backlog.findingTypes, REQUIRED_FINDING_TYPES);
    addResult(results, "findingTypes include required types", missingFindingTypes.length === 0, missingFindingTypes.length ? `missing: ${missingFindingTypes.join(", ")}` : `${REQUIRED_FINDING_TYPES.length} finding types present`);

    const schemaMissing = includesAll(backlog.backlogEntrySchema?.required, REQUIRED_ENTRY_FIELDS);
    addResult(results, "backlogEntrySchema requires all required fields", schemaMissing.length === 0, schemaMissing.length ? `missing: ${schemaMissing.join(", ")}` : `${REQUIRED_ENTRY_FIELDS.length} fields required`);

    const forbiddenActions = asArray(backlog.forbiddenAutoActions).join(" ");
    const forbiddenChecks = [
      ["never approves PRs", /approve PRs|approval/iu],
      ["never merges PRs", /merge PRs|auto-merge/iu],
      ["never repairs files", /auto-repair|repair/iu],
      ["never deploys", /deploy/iu],
      ["never modifies runtime pages", /runtime website|runtime page|app\/\*\*/iu]
    ];
    for (const [label, pattern] of forbiddenChecks) addResult(results, label, pattern.test(forbiddenActions), pattern.test(forbiddenActions) ? "declared" : "missing");
  }

  const agentNames = new Set(asArray(websiteAgents?.agents).map((agent) => agent.name).filter(Boolean));
  const readinessRoutes = new Set(asArray(websiteReadiness?.routeEntries).map((entry) => entry.route).filter(Boolean));
  const readinessGroups = new Set(Object.keys(websiteReadiness?.routeGroups ?? {}));
  readinessGroups.add("global");

  if (backlog) {
    const duplicateIds = asArray(backlog.entries)
      .map((entry) => entry.id)
      .filter((id, index, ids) => ids.indexOf(id) !== index);
    addResult(results, "entries have unique ids", duplicateIds.length === 0, duplicateIds.length ? `duplicates: ${[...new Set(duplicateIds)].join(", ")}` : `${asArray(backlog.entries).length} entries`);

    const invalidEntries = [];
    for (const entry of asArray(backlog.entries)) {
      const label = entry.id ?? "entry-without-id";
      const missingFields = REQUIRED_ENTRY_FIELDS.filter((field) => !(field in entry));
      if (missingFields.length) invalidEntries.push(`${label} missing fields: ${missingFields.join(", ")}`);

      const textFields = ["id", "title", "status", "severity", "findingType", "route", "routeGroup", "sourceAgent", "finding", "evidence", "recommendedAction", "nextSafeTask", "createdDate", "updatedDate"];
      const missingText = textFields.filter((field) => !hasText(entry[field]));
      if (missingText.length) invalidEntries.push(`${label} empty text fields: ${missingText.join(", ")}`);

      const arrayFields = ["sourceFiles", "relatedRegisters", "allowedFiles", "forbiddenFiles", "requiredChecks", "protectedTopics"];
      const nonArrays = arrayFields.filter((field) => !Array.isArray(entry[field]));
      if (nonArrays.length) invalidEntries.push(`${label} non-array fields: ${nonArrays.join(", ")}`);

      if (!asArray(backlog.allowedStatuses).includes(entry.status)) invalidEntries.push(`${label} invalid status: ${entry.status}`);
      if (!asArray(backlog.severityLevels).includes(entry.severity)) invalidEntries.push(`${label} invalid severity: ${entry.severity}`);
      if (!asArray(backlog.findingTypes).includes(entry.findingType)) invalidEntries.push(`${label} invalid findingType: ${entry.findingType}`);
      if (!agentNames.has(entry.sourceAgent)) invalidEntries.push(`${label} sourceAgent not in website-agents.json: ${entry.sourceAgent}`);
      if (entry.route !== "global" && !readinessRoutes.has(entry.route)) invalidEntries.push(`${label} route not in website-readiness.json and not global: ${entry.route}`);
      if (!readinessGroups.has(entry.routeGroup)) invalidEntries.push(`${label} routeGroup not recognized: ${entry.routeGroup}`);
      if (entry.route === "global" && entry.routeGroup !== "global") invalidEntries.push(`${label} global route must use global routeGroup`);

      const mustRequireHumanReview = entry.status === "review_required" || entry.status === "human_review_required" || entry.severity === "high" || entry.severity === "critical" || entryHasProtectedTopic(entry);
      if (mustRequireHumanReview && entry.humanReviewRequired !== true) invalidEntries.push(`${label} requires humanReviewRequired=true`);
    }
    addResult(results, "entries satisfy required schema and cross-register rules", invalidEntries.length === 0, invalidEntries.length ? invalidEntries.join("; ") : `${asArray(backlog.entries).length} entries valid`);
  }

  let workMapText = "";
  let todoIndexText = "";
  try { workMapText = readText(WORK_MAP_PATH); } catch {}
  try { todoIndexText = readText(TODO_INDEX_PATH); } catch {}

  const referencedFiles = [
    BACKLOG_PATH,
    "docs/architecture/WELLFIT_WEBSITE_AGENT_BACKLOG.md",
    "scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs"
  ];

  for (const file of referencedFiles) {
    addResult(results, `WORK_MAP references ${file}`, workMapText.includes(file), workMapText.includes(file) ? "referenced" : "missing");
    addResult(results, `TODO_INDEX references ${file}`, todoIndexText.includes(file), todoIndexText.includes(file) ? "referenced" : "missing");
  }

  const ready = results.every((result) => result.passed);
  const report = `# Website Agent Backlog Check\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nNever modifies runtime pages: true\nNever approves PRs: true\nNever merges PRs: true\nNever repairs files: true\nNever deploys: true\nWEBSITE_AGENT_BACKLOG_READY=${ready ? "true" : "false"}\nResult: ${ready ? "PASS" : "FAIL"}\n\n## Results\n\n${renderResults(results)}\n\n## Initial Backlog Summary\n\n${asArray(backlog?.entries).map((entry) => `- ${entry.id}: ${entry.title} (${entry.status}, ${entry.severity}, ${entry.findingType})`).join("\n") || "No entries parsed."}\n`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf8");

  console.log(`Website agent backlog check complete: ${path.relative(ROOT, REPORT_PATH)}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies runtime pages: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log(`WEBSITE_AGENT_BACKLOG_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  for (const result of results) console.log(`${result.passed ? "OK" : "FAIL"}: ${result.name} (${result.details})`);
  if (!ready) process.exit(1);
}

main();
