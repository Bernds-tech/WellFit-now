#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = path.join(ROOT, "project-register", "cross-reference-maintenance.json");
const WORK_MAP_PATH = path.join(ROOT, "todolist", "WORK_MAP.md");
const TODO_INDEX_PATH = path.join(ROOT, "todolist", "TODO_INDEX.md");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "cross-reference-maintenance-check.md");

const REQUIRED_CATEGORIES = [
  "route_added_or_changed",
  "api_added_or_changed",
  "feature_or_product_module_changed",
  "agent_script_added_or_changed",
  "quality_gate_changed",
  "roadmap_task_added_or_changed",
  "product_readiness_changed",
  "feedback_or_analytics_changed",
  "adaptive_user_insight_changed",
  "research_recommendation_changed",
  "internal_source_map_changed",
  "visual_regression_changed",
  "documentation_baseline_changed",
  "unity_or_ar_changed",
  "compliance_or_privacy_changed"
];

const REQUIRED_CATEGORY_FIELDS = [
  "requiredInspectFiles",
  "requiredUpdateTargets",
  "forbiddenAutoUpdates",
  "humanReviewRules"
];

const MAJOR_PROJECT_REGISTER_JSON = [
  "project-register/adaptive-user-insights.json",
  "project-register/agent-autopilot.json",
  "project-register/agent-follow-ups.json",
  "project-register/agent-task-queue.json",
  "project-register/agent-work-log.json",
  "project-register/agent-workflows.json",
  "project-register/apis.json",
  "project-register/cross-references.json",
  "project-register/cross-reference-maintenance.json",
  "project-register/decisions.json",
  "project-register/definition-of-done.json",
  "project-register/features.json",
  "project-register/feedback-analytics-loop.json",
  "project-register/internal-sources.json",
  "project-register/master-roadmap-tasks.json",
  "project-register/mission-buddy-economy-flow.json",
  "project-register/pages.json",
  "project-register/product-readiness.json",
  "project-register/product-rules.json",
  "project-register/progress-log.json",
  "project-register/research-recommendations.json",
  "project-register/risk-classifier.json",
  "project-register/routes.json",
  "project-register/todos.json",
  "project-register/user-feedback.json",
  "project-register/visual-regression.json"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function existsRelative(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isRepositoryPath(value) {
  if (typeof value !== "string") return false;
  if (!value.trim()) return false;
  if (value.includes("<") || value.includes(">")) return false;
  if (value.startsWith("node ") || value.startsWith("npm ") || value.startsWith("npx ") || value.startsWith("jq ")) return false;
  if (value.includes("**")) return false;
  return /^(AGENTS\.md|todolist\/|project-register\/|docs\/|scripts\/)/u.test(value);
}

function unique(values) {
  return [...new Set(values)];
}

function renderList(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "No items.";
}

function collectReferencedRepositoryPaths(register) {
  const paths = [];
  for (const file of asArray(register.sourceOfTruthFiles)) paths.push(file);
  if (isRepositoryPath(register.humanReadableSource)) paths.push(register.humanReadableSource);
  if (isRepositoryPath(register.analysisDocument)) paths.push(register.analysisDocument);
  if (isRepositoryPath(register.validationScript)) paths.push(register.validationScript);
  for (const category of asArray(register.changeCategories)) {
    for (const field of ["requiredInspectFiles", "requiredUpdateTargets"]) {
      for (const file of asArray(category[field])) paths.push(file);
    }
  }
  return unique(paths.filter(isRepositoryPath));
}

function main() {
  const failures = [];
  const warnings = [];
  const passes = [];
  let register;

  try {
    register = readJson(REGISTER_PATH);
    passes.push("cross-reference-maintenance.json parses as JSON.");
  } catch (error) {
    failures.push(`Unable to parse project-register/cross-reference-maintenance.json: ${error.message}`);
  }

  if (register) {
    for (const field of ["version", "updated", "purpose", "sourceOfTruthFiles", "changeCategories", "forbiddenAutoUpdates", "humanReviewRequiredCategories", "globalValidationRequirements", "examples"]) {
      if (register[field] === undefined || (Array.isArray(register[field]) && register[field].length === 0)) failures.push(`Register missing required top-level field: ${field}`);
      else passes.push(`Top-level field present: ${field}.`);
    }

    const categories = asArray(register.changeCategories);
    const categoryIds = new Set(categories.map((category) => category.id));

    for (const requiredCategory of REQUIRED_CATEGORIES) {
      if (!categoryIds.has(requiredCategory)) failures.push(`Missing required change category: ${requiredCategory}`);
      else passes.push(`Required change category exists: ${requiredCategory}.`);
    }

    for (const category of categories) {
      if (!category || typeof category !== "object") {
        failures.push("A changeCategories entry is not an object.");
        continue;
      }
      if (!category.id) failures.push("A changeCategories entry is missing id.");
      for (const field of REQUIRED_CATEGORY_FIELDS) {
        if (!Array.isArray(category[field]) || category[field].length === 0) failures.push(`Category ${category.id ?? "<missing-id>"} missing non-empty ${field}.`);
      }
      if (!Array.isArray(category.validationRequirements) || category.validationRequirements.length === 0) warnings.push(`Category ${category.id ?? "<missing-id>"} has no validationRequirements.`);
      if (!Array.isArray(category.examples) || category.examples.length === 0) warnings.push(`Category ${category.id ?? "<missing-id>"} has no examples.`);
    }

    const referencedPaths = collectReferencedRepositoryPaths(register);
    for (const relativePath of referencedPaths) {
      if (!existsRelative(relativePath)) failures.push(`Referenced file does not exist: ${relativePath}`);
    }
    if (referencedPaths.length > 0 && !referencedPaths.some((relativePath) => !existsRelative(relativePath))) passes.push(`All ${referencedPaths.length} referenced repository files exist.`);

    const workMap = fs.existsSync(WORK_MAP_PATH) ? fs.readFileSync(WORK_MAP_PATH, "utf8") : "";
    const todoIndex = fs.existsSync(TODO_INDEX_PATH) ? fs.readFileSync(TODO_INDEX_PATH, "utf8") : "";
    for (const requiredReference of [
      "project-register/cross-reference-maintenance.json",
      "docs/architecture/WELLFIT_CROSS_REFERENCE_MAINTENANCE.md",
      "scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs"
    ]) {
      if (!workMap.includes(requiredReference)) failures.push(`WORK_MAP.md does not reference ${requiredReference}.`);
      else passes.push(`WORK_MAP.md references ${requiredReference}.`);
      if (!todoIndex.includes(requiredReference)) failures.push(`TODO_INDEX.md does not reference ${requiredReference}.`);
      else passes.push(`TODO_INDEX.md references ${requiredReference}.`);
    }

    const coveredFiles = new Set();
    for (const category of categories) {
      for (const file of [...asArray(category.requiredInspectFiles), ...asArray(category.requiredUpdateTargets)]) {
        if (isRepositoryPath(file)) coveredFiles.add(file);
      }
    }
    for (const majorFile of MAJOR_PROJECT_REGISTER_JSON) {
      if (!coveredFiles.has(majorFile)) warnings.push(`Major project-register JSON lacks a cross-reference category: ${majorFile}`);
    }
    if (MAJOR_PROJECT_REGISTER_JSON.every((file) => coveredFiles.has(file))) passes.push("All major project-register JSON files are covered by at least one change category.");
  }

  const result = failures.length ? "FAIL" : warnings.length ? "PASS_WITH_WARNINGS" : "PASS";
  const report = `# Cross-Reference Maintenance Check\n\nGenerated: ${new Date().toISOString()}\nResult: ${result}\n\n## PASS\n\n${renderList(passes)}\n\n## FAIL\n\n${renderList(failures)}\n\n## WARNING\n\n${renderList(warnings)}\n\n## Safety rule\n\nThis checker validates the cross-reference maintenance framework only. It does not rewrite runtime product code, Unity files, protected compliance areas, or project registers.\n`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit cross-reference maintenance check complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${result}`);
  for (const failure of failures) console.log(`FAIL: ${failure}`);
  for (const warning of warnings) console.log(`WARNING: ${warning}`);
  if (failures.length) process.exit(1);
}

main();
