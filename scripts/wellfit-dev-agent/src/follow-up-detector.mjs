#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const REQUIRED_FILES = [
  "todolist/WORK_MAP.md",
  "todolist/CURRENT_PROJECT_STATE.md",
  "project-register/agent-task-queue.json",
  "project-register/risk-classifier.json"
];
const RISK_ORDER = ["low", "medium", "high", "critical"];

const CATEGORY_RULES = [
  {
    id: "api_proposal",
    label: "API proposal",
    riskPattern: "api_planning_or_non_authority_api_change",
    keywords: [/api proposal/iu, /futureApiProposal/u, /API-Route/iu, /app\/api\//u],
    paths: ["project-register/apis.json", "app/api/"]
  },
  {
    id: "firestore_collection_proposal",
    label: "Firestore collection proposal",
    riskPattern: "firebase_functions_or_firestore_rules_change",
    keywords: [/firestoreProposal/u, /Firestore collection/iu, /collection proposal/iu, /firestore\.rules/u],
    paths: ["firestore.rules", "project-register/user-feedback.json", "functions/"]
  },
  {
    id: "route_added",
    label: "Route added or changed",
    riskPattern: "existing_ui_route_fix",
    keywords: [/route added/iu, /route register/iu, /app\/[^\s`]+\/page\.tsx/u],
    paths: ["project-register/routes.json", "project-register/pages.json", "app/"]
  },
  {
    id: "register_changed",
    label: "Register changed",
    riskPattern: "json_registry_metadata_sync",
    keywords: [/project-register\//u, /register changed/iu, /registry/iu],
    paths: ["project-register/"]
  },
  {
    id: "feedback_plan_added",
    label: "Feedback plan added",
    riskPattern: "feedback_or_analytics_planning_without_live_tracking",
    keywords: [/feedback plan/iu, /user-feedback/u, /feedback analytics/iu, /futureApiProposal/u],
    paths: ["project-register/user-feedback.json", "project-register/feedback-analytics-loop.json", "docs/architecture/USER_FEEDBACK_DATABASE_FLOW.md"]
  },
  {
    id: "mission_economy_touched",
    label: "Mission or economy touched",
    riskPattern: "mission_completion_or_anti_cheat_adjacent_change",
    keywords: [/mission/iu, /economy/iu, /reward/iu, /XP\b/u, /points/iu],
    paths: ["lib/economy/", "app/api/economy/", "lib/mission", "project-register/features.json"]
  },
  {
    id: "ui_route_touched",
    label: "UI route touched",
    riskPattern: "existing_ui_route_fix",
    keywords: [/UI route/iu, /page\.tsx/u, /dashboard/iu, /mobile/iu],
    paths: ["app/", "components/", "project-register/routes.json", "project-register/pages.json"]
  },
  {
    id: "governance_changed",
    label: "Governance changed",
    riskPattern: "markdown_documentation_alignment",
    keywords: [/AGENTS\.md/u, /governance/iu, /agent-workflows/u, /quality gate/iu, /definition-of-done/u],
    paths: ["AGENTS.md", "agents/", "todolist/", "docs/architecture/WELLFIT_AGENT", "project-register/agent-"]
  }
];

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readOptional(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  return readText(relativePath);
}

function gitChangedFiles() {
  const result = spawnSync("git", ["diff", "--name-only", "HEAD"], { cwd: ROOT, encoding: "utf8", shell: false });
  if (result.status !== 0) return [];
  return result.stdout.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
}

function riskFromPattern(riskClassifier, pattern) {
  for (const [level, config] of Object.entries(riskClassifier.riskLevels ?? {})) {
    if ((config.patterns ?? []).includes(pattern)) return level;
  }
  return "low";
}

function maxRisk(...levels) {
  return levels.filter(Boolean).sort((a, b) => RISK_ORDER.indexOf(b) - RISK_ORDER.indexOf(a))[0] ?? "low";
}

function protectedAreaMatches(riskClassifier, changedFiles) {
  const changedFileText = changedFiles.join("\n");
  const matches = [];
  for (const area of riskClassifier.protectedAreas ?? []) {
    const keywordHit = (area.keywords ?? []).some((keyword) => new RegExp(`\\b${String(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "iu").test(changedFileText));
    const pathHit = (area.paths ?? []).some((pattern) => {
      const prefix = pattern.replace(/\*\*.*$/u, "").replace(/\*.*$/u, "");
      return prefix && changedFiles.some((file) => file.startsWith(prefix));
    });
    if (keywordHit || pathHit) matches.push(area);
  }
  return matches;
}

function detectCategories(riskClassifier, sources, changedFiles) {
  const haystack = `${Object.values(sources).filter(Boolean).join("\n")}\n${changedFiles.join("\n")}`;
  return CATEGORY_RULES.flatMap((rule) => {
    const keywordHit = rule.keywords.some((keyword) => keyword.test(haystack));
    const pathHit = rule.paths.some((prefix) => changedFiles.some((file) => file.startsWith(prefix) || file === prefix));
    if (!keywordHit && !pathHit) return [];
    const protectedMatches = protectedAreaMatches(riskClassifier, changedFiles);
    const baseRisk = riskFromPattern(riskClassifier, rule.riskPattern);
    const riskLevel = maxRisk(baseRisk, ...protectedMatches.map((match) => match.classification));
    const allowedByDefault = riskClassifier.riskLevels?.[riskLevel]?.allowedByDefault === true;
    return [{
      id: rule.id,
      label: rule.label,
      riskLevel,
      autoApproved: allowedByDefault && !["high", "critical"].includes(riskLevel),
      reviewRequired: !allowedByDefault || ["high", "critical"].includes(riskLevel),
      reason: pathHit ? "Matched changed file path or register path." : "Matched source/register keyword.",
      protectedMatches: protectedMatches.map((match) => match.id)
    }];
  });
}

function main() {
  for (const file of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(ROOT, file))) throw new Error(`Required source file missing: ${file}`);
  }

  const sources = {
    "todolist/WORK_MAP.md": readText("todolist/WORK_MAP.md"),
    "todolist/CURRENT_PROJECT_STATE.md": readText("todolist/CURRENT_PROJECT_STATE.md"),
    "project-register/agent-task-queue.json": readText("project-register/agent-task-queue.json"),
    "project-register/internal-sources.json": readOptional("project-register/internal-sources.json"),
    "project-register/user-feedback.json": readOptional("project-register/user-feedback.json")
  };
  const riskClassifier = readJson("project-register/risk-classifier.json");
  const changedFiles = gitChangedFiles();
  const detections = detectCategories(riskClassifier, sources, changedFiles);

  console.log("WellFit Follow-up Detector");
  console.log("Result: REPORT_ONLY");
  console.log("Rewrite mode: disabled. This first version does not modify files.");
  console.log("");
  console.log("Sources read:");
  for (const [file, value] of Object.entries(sources)) console.log(`- ${file}: ${value === null ? "not present" : "read"}`);
  console.log("");
  console.log("Changed files considered:");
  if (changedFiles.length === 0) console.log("- None from git diff against HEAD; source registers were still scanned.");
  else for (const file of changedFiles) console.log(`- ${file}`);
  console.log("");
  console.log("Detected follow-up categories:");
  if (detections.length === 0) console.log("- None detected.");
  else for (const item of detections) {
    console.log(`- ${item.label} (${item.id})`);
    console.log(`  - Risk: ${item.riskLevel}`);
    console.log(`  - Auto-approved: ${item.autoApproved ? "yes" : "no"}`);
    console.log(`  - Review required: ${item.reviewRequired ? "yes" : "no"}`);
    console.log(`  - Reason: ${item.reason}`);
    if (item.protectedMatches.length) console.log(`  - Protected matches: ${item.protectedMatches.join(", ")}`);
  }
  console.log("");
  console.log("Guardrail: high and critical follow-ups are never auto-approved by this script.");
}

main();
