#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const WEBSITE_AGENTS_PATH = "project-register/website-agents.json";
const WEBSITE_READINESS_PATH = "project-register/website-readiness.json";
const ROUTES_PATH = "project-register/routes.json";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";

const REQUIRED_AGENTS = [
  "Website Completion Agent",
  "Route & Link Integrity Agent",
  "Mobile First Agent",
  "Visual Regression Website Agent",
  "Website Content Agent",
  "Trust & Compliance Agent",
  "Landingpage Conversion Agent",
  "SEO & Discovery Agent",
  "Beta Waitlist Agent",
  "Investor Page Agent",
  "Analytics & Experiment Agent",
  "Self-Improving Website Agent"
];

const REQUIRED_STATUSES = [
  "empty",
  "draft",
  "usable",
  "conversion_ready",
  "investor_ready",
  "beta_ready",
  "blocked",
  "review_required"
];

const REQUIRED_ROUTE_GROUPS = [
  "public_pages",
  "legal_pages",
  "desktop_beta_pages",
  "mobile_pwa_pages",
  "protected_or_review_required_pages"
];

const REQUIRED_ROUTES = [
  "/",
  "/register",
  "/datenschutz",
  "/agb",
  "/impressum",
  "/faq",
  "/hilfe",
  "/dashboard",
  "/buddy",
  "/missionen",
  "/missionen/tagesmissionen",
  "/missionen/wochenmissionen",
  "/missionen/abenteuer",
  "/challenge",
  "/missionen/wettkaempfe",
  "/punkte-shop",
  "/marktplatz",
  "/leaderboard",
  "/analytics",
  "/einstellungen",
  "/mobile",
  "/mobile/missionen",
  "/mobile/missionen/squat",
  "/mobile/buddy",
  "/mobile/analyse",
  "/mobile/bewegung",
  "/mobile/einstellungen",
  "/mobile/ar"
];

const PROTECTED_TOPIC_PATTERN = /(legal|agb|datenschutz|impressum|privacy|consent|health|child|token|nft|wallet|payment|purchase|payout|reward|points|economy|marketplace|mission_completion|anti_cheat|betting|competition|investor|public_claim|analytics|camera|ar|biometric|location|ai_buddy)/iu;
const SENSITIVE_ROUTE_PATTERN = /(datenschutz|agb|impressum|register|buddy|mission|challenge|wettkaempfe|punkte-shop|marktplatz|leaderboard|analytics|mobile\/analyse|mobile\/bewegung|mobile\/ar|mobile\/missionen\/squat)/iu;

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function addResult(results, name, passed, details) {
  results.push({ name, passed, details: String(details) });
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function collectRouteSet(routesRegister) {
  return new Set([
    ...asArray(routesRegister.publicPages),
    ...asArray(routesRegister.protectedAppPages),
    ...asArray(routesRegister.mobilePages),
    ...asArray(routesRegister.systemPages)
  ].map((entry) => entry.route).filter(Boolean));
}

function routeIsSensitive(entry) {
  const haystack = `${entry.route ?? ""} ${entry.routeGroup ?? ""} ${entry.readinessStatus ?? ""} ${asArray(entry.protectedTopics).join(" ")} ${asArray(entry.currentKnownGaps).join(" ")} ${entry.nextSafeTask ?? ""}`;
  return SENSITIVE_ROUTE_PATTERN.test(entry.route ?? "") || PROTECTED_TOPIC_PATTERN.test(haystack);
}

function renderResults(results) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.details.replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function main() {
  const results = [];
  let websiteAgents;
  let websiteReadiness;
  let routesRegister;

  for (const file of [WEBSITE_AGENTS_PATH, WEBSITE_READINESS_PATH, ROUTES_PATH, WORK_MAP_PATH, TODO_INDEX_PATH]) {
    addResult(results, `${file} exists`, fs.existsSync(path.join(ROOT, file)), fs.existsSync(path.join(ROOT, file)) ? "found" : "missing");
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

  try {
    routesRegister = readJson(ROUTES_PATH);
    addResult(results, `${ROUTES_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    addResult(results, `${ROUTES_PATH} parses as JSON`, false, error.message);
  }

  if (websiteAgents) {
    const agentNames = asArray(websiteAgents.agents).map((agent) => agent.name);
    const missingAgents = REQUIRED_AGENTS.filter((agent) => !agentNames.includes(agent));
    addResult(results, "required website agents exist", missingAgents.length === 0, missingAgents.length ? `missing: ${missingAgents.join(", ")}` : `${REQUIRED_AGENTS.length} agents present`);

    const incompleteAgents = asArray(websiteAgents.agents)
      .filter((agent) => REQUIRED_AGENTS.includes(agent.name))
      .filter((agent) => !hasNonEmptyString(agent.purpose) || !hasNonEmptyArray(agent.requiredInputs) || !hasNonEmptyArray(agent.allowedOutputs) || !hasNonEmptyArray(agent.allowedActions) || !hasNonEmptyArray(agent.forbiddenActions) || !hasNonEmptyString(agent.riskLevel) || !hasNonEmptyArray(agent.requiredChecks) || !hasNonEmptyArray(agent.humanReviewRequiredTriggers) || !hasNonEmptyArray(agent.relatedRouteGroups) || !hasNonEmptyArray(agent.relatedProjectRegisters) || !hasNonEmptyString(agent.doNotDuplicateWarning))
      .map((agent) => agent.name);
    addResult(results, "each website agent has required governance fields", incompleteAgents.length === 0, incompleteAgents.length ? `incomplete: ${incompleteAgents.join(", ")}` : "all required fields present");

    const safetyText = JSON.stringify(websiteAgents);
    const safeMode = /report_only/i.test(safetyText) && /auto_merge/i.test(safetyText) && /auto_repair/i.test(safetyText) && /deployment/i.test(safetyText);
    addResult(results, "website-agents registry is report-only and forbids automation activation", safeMode, safeMode ? "report-only/no auto-merge/no auto-repair/no deployment recorded" : "missing report-only automation boundaries");
  }

  if (websiteReadiness) {
    const statuses = Object.keys(websiteReadiness.readinessStatuses ?? {});
    const missingStatuses = REQUIRED_STATUSES.filter((status) => !statuses.includes(status));
    addResult(results, "required readiness statuses exist", missingStatuses.length === 0, missingStatuses.length ? `missing: ${missingStatuses.join(", ")}` : `${REQUIRED_STATUSES.length} statuses present`);

    const routeGroups = Object.keys(websiteReadiness.routeGroups ?? {});
    const missingGroups = REQUIRED_ROUTE_GROUPS.filter((group) => !routeGroups.includes(group));
    addResult(results, "required route groups exist", missingGroups.length === 0, missingGroups.length ? `missing: ${missingGroups.join(", ")}` : `${REQUIRED_ROUTE_GROUPS.length} route groups present`);

    const entries = asArray(websiteReadiness.routeEntries);
    const routeEntryMap = new Map(entries.map((entry) => [entry.route, entry]));
    const missingRoutes = REQUIRED_ROUTES.filter((route) => !routeEntryMap.has(route));
    addResult(results, "required route entries exist", missingRoutes.length === 0, missingRoutes.length ? `missing: ${missingRoutes.join(", ")}` : `${REQUIRED_ROUTES.length} required route entries present`);

    if (routesRegister) {
      const registeredRoutes = collectRouteSet(routesRegister);
      const invalidRouteRefs = entries
        .filter((entry) => entry.route !== "/challenge")
        .filter((entry) => !registeredRoutes.has(entry.route))
        .map((entry) => entry.route);
      const challengeEntry = routeEntryMap.get("/challenge");
      const challengeMapped = challengeEntry && challengeEntry.routeRegistryReference === "/missionen/challenge" && registeredRoutes.has("/missionen/challenge") && challengeEntry.routeRegistryStatus === "not_registered_review_required_alias";
      addResult(results, "route entries reference existing routes from routes.json where applicable", invalidRouteRefs.length === 0 && Boolean(challengeMapped), invalidRouteRefs.length ? `unregistered route entries: ${invalidRouteRefs.join(", ")}` : "all registered routes match; /challenge is a review-required alias to /missionen/challenge");
    }

    const incompleteEntries = entries
      .filter((entry) => !hasNonEmptyArray(entry.leadingFiles) || !hasNonEmptyString(entry.readinessStatus) || !hasNonEmptyArray(entry.relatedWebsiteAgents) || !hasNonEmptyString(entry.nextSafeTask) || !hasNonEmptyArray(entry.requiredChecks))
      .map((entry) => entry.route ?? "unknown");
    addResult(results, "each route entry has leadingFiles, readinessStatus, relatedWebsiteAgents, nextSafeTask, and requiredChecks", incompleteEntries.length === 0, incompleteEntries.length ? `incomplete: ${incompleteEntries.join(", ")}` : "all route entries complete");

    const missingReviewForSensitiveReady = entries
      .filter(routeIsSensitive)
      .filter((entry) => ["beta_ready", "conversion_ready"].includes(entry.readinessStatus) && entry.humanReviewRequired !== true)
      .map((entry) => entry.route);
    addResult(results, "sensitive route entries are not beta_ready or conversion_ready without review_required", missingReviewForSensitiveReady.length === 0, missingReviewForSensitiveReady.length ? `unsafe readiness: ${missingReviewForSensitiveReady.join(", ")}` : "sensitive entries remain review-gated");

    const unknownAgents = entries.flatMap((entry) => asArray(entry.relatedWebsiteAgents).filter((agentName) => !REQUIRED_AGENTS.includes(agentName)).map((agentName) => `${entry.route}:${agentName}`));
    addResult(results, "route entries reference known website agents", unknownAgents.length === 0, unknownAgents.length ? `unknown: ${unknownAgents.join(", ")}` : "all related agents known");
  }

  const workMap = fs.existsSync(path.join(ROOT, WORK_MAP_PATH)) ? readText(WORK_MAP_PATH) : "";
  const todoIndex = fs.existsSync(path.join(ROOT, TODO_INDEX_PATH)) ? readText(TODO_INDEX_PATH) : "";
  const frameworkFiles = [
    WEBSITE_AGENTS_PATH,
    WEBSITE_READINESS_PATH,
    "docs/architecture/WELLFIT_WEBSITE_AGENT_FRAMEWORK.md",
    "scripts/wellfit-dev-agent/src/website-agent-framework-check.mjs"
  ];
  const missingWorkMapRefs = frameworkFiles.filter((file) => !workMap.includes(file));
  const missingTodoIndexRefs = frameworkFiles.filter((file) => !todoIndex.includes(file));
  addResult(results, "Work Map references website agent framework files", missingWorkMapRefs.length === 0, missingWorkMapRefs.length ? `missing: ${missingWorkMapRefs.join(", ")}` : "all framework files referenced");
  addResult(results, "TODO Index references website agent framework files", missingTodoIndexRefs.length === 0, missingTodoIndexRefs.length ? `missing: ${missingTodoIndexRefs.join(", ")}` : "all framework files referenced");

  const ready = results.every((result) => result.passed);
  console.log("# Website Agent Framework Check");
  console.log("");
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies files: true");
  console.log("Never updates runtime pages: true");
  console.log("Never approves PRs: true");
  console.log("Never merges: true");
  console.log("Never repairs: true");
  console.log("Never deploys: true");
  console.log(`WEBSITE_AGENT_FRAMEWORK_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  console.log("");
  console.log(renderResults(results));

  if (!ready) process.exit(1);
}

main();
