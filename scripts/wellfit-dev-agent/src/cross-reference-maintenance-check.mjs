#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_REL = "project-register/cross-reference-maintenance.json";
const REGISTER_PATH = path.join(ROOT, REGISTER_REL);
const OUTPUT_REL = "scripts/wellfit-dev-agent/output/cross-reference-maintenance-check.md";
const OUTPUT_PATH = path.join(ROOT, OUTPUT_REL);

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

const REQUIRED_WORK_MAP_REFERENCES = [
  "project-register/cross-reference-maintenance.json",
  "docs/architecture/WELLFIT_CROSS_REFERENCE_MAINTENANCE.md",
  "scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs"
];

const REQUIRED_TODO_INDEX_REFERENCES = REQUIRED_WORK_MAP_REFERENCES;

const MAJOR_PROJECT_REGISTER_JSON = [
  "project-register/agent-autopilot.json",
  "project-register/agent-task-queue.json",
  "project-register/agent-workflows.json",
  "project-register/agent-work-log.json",
  "project-register/progress-log.json",
  "project-register/product-readiness.json",
  "project-register/internal-sources.json",
  "project-register/master-roadmap-tasks.json",
  "project-register/research-recommendations.json",
  "project-register/adaptive-user-insights.json",
  "project-register/user-feedback.json",
  "project-register/feedback-analytics-loop.json",
  "project-register/features.json",
  "project-register/routes.json",
  "project-register/apis.json",
  "project-register/visual-regression.json",
  "project-register/cross-reference-maintenance.json"
];

function rel(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function readText(relativePath, results) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    results.fail.push(`Missing required text file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function addMissingReferences(results, fileLabel, fileText, requiredReferences) {
  for (const reference of requiredReferences) {
    if (!fileText.includes(reference)) results.fail.push(`${fileLabel} does not reference ${reference}.`);
  }
}

function readRegister(results) {
  if (!fs.existsSync(REGISTER_PATH)) {
    results.fail.push(`Missing registry: ${REGISTER_REL}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(REGISTER_PATH, "utf8"));
  } catch (error) {
    results.fail.push(`Registry is not valid JSON: ${error.message}`);
    return null;
  }
}

function validateTopLevel(data, results) {
  for (const field of ["version", "updated", "purpose"]) {
    if (!hasText(data?.[field])) results.fail.push(`Top-level field ${field} is missing or empty.`);
  }

  if (!data?.changeCategories || typeof data.changeCategories !== "object" || Array.isArray(data.changeCategories)) {
    results.fail.push("changeCategories must be an object.");
  }

  if (asArray(data?.sourceOfTruthFiles).length === 0) results.fail.push("sourceOfTruthFiles must be a non-empty array.");
  if (asArray(data?.validationRequirements).length === 0) results.fail.push("validationRequirements must be a non-empty array.");
}

function validateCategories(data, results) {
  const categories = data?.changeCategories ?? {};

  for (const categoryName of REQUIRED_CATEGORIES) {
    const category = categories[categoryName];
    if (!category) {
      results.fail.push(`Missing required change category: ${categoryName}`);
      continue;
    }

    if (!hasText(category.description)) results.fail.push(`${categoryName}.description is missing or empty.`);

    for (const field of REQUIRED_CATEGORY_FIELDS) {
      const value = category[field];
      if (!Array.isArray(value) || value.length === 0) {
        results.fail.push(`${categoryName}.${field} must be a non-empty array.`);
      }
    }

    if (asArray(category.validationRequirements).length === 0) {
      results.warn.push(`${categoryName}.validationRequirements is empty; category should normally document specific checks.`);
    }

    if (asArray(category.examples).length === 0) {
      results.warn.push(`${categoryName}.examples is empty; category should include at least one example.`);
    }
  }
}

function collectReferencedFiles(data) {
  const referenced = new Set();

  for (const file of asArray(data?.sourceOfTruthFiles)) referenced.add(file);

  for (const category of Object.values(data?.changeCategories ?? {})) {
    for (const field of ["requiredInspectFiles", "requiredUpdateTargets"]) {
      for (const file of asArray(category?.[field])) referenced.add(file);
    }
  }

  return [...referenced].filter((file) => hasText(file));
}

function validateReferencedFiles(data, results) {
  const references = collectReferencedFiles(data);
  for (const file of references) {
    if (!exists(file)) results.fail.push(`Referenced file does not exist: ${file}`);
  }
}

function validateWorkMapAndTodoIndex(results) {
  const workMap = readText("todolist/WORK_MAP.md", results);
  const todoIndex = readText("todolist/TODO_INDEX.md", results);

  addMissingReferences(results, "todolist/WORK_MAP.md", workMap, REQUIRED_WORK_MAP_REFERENCES);
  addMissingReferences(results, "todolist/TODO_INDEX.md", todoIndex, REQUIRED_TODO_INDEX_REFERENCES);
}

function validateMajorRegisterCoverage(data, results) {
  const categoryFiles = new Map();

  for (const [categoryName, category] of Object.entries(data?.changeCategories ?? {})) {
    const files = new Set([
      ...asArray(category.requiredInspectFiles),
      ...asArray(category.requiredUpdateTargets)
    ]);
    for (const file of files) {
      if (!categoryFiles.has(file)) categoryFiles.set(file, []);
      categoryFiles.get(file).push(categoryName);
    }
  }

  for (const file of MAJOR_PROJECT_REGISTER_JSON) {
    if (!exists(file)) {
      results.warn.push(`Major project-register JSON is listed for coverage but does not exist: ${file}`);
      continue;
    }

    const categories = categoryFiles.get(file) ?? [];
    if (categories.length === 0) {
      results.warn.push(`Major project-register JSON lacks a cross-reference category: ${file}`);
    }
  }
}

function renderList(items, fallback) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : fallback;
}

function writeReport(results) {
  const passed = results.fail.length === 0;
  const report = `# Cross-Reference Maintenance Check\n\nGenerated: ${new Date().toISOString()}\nResult: ${passed ? "PASS" : "FAIL"}\n\n## PASS\n\n${renderList(results.pass, "- No explicit pass details recorded.")}\n\n## FAIL\n\n${renderList(results.fail, "- No failures.")}\n\n## WARNING\n\n${renderList(results.warn, "- No warnings.")}\n`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log("Cross-reference maintenance check complete");
  console.log(`Report: ${rel(OUTPUT_PATH)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log("\nPASS");
  console.log(renderList(results.pass, "- No explicit pass details recorded."));
  console.log("\nFAIL");
  console.log(renderList(results.fail, "- No failures."));
  console.log("\nWARNING");
  console.log(renderList(results.warn, "- No warnings."));

  if (!passed) process.exit(1);
}

function main() {
  const results = { pass: [], fail: [], warn: [] };
  const data = readRegister(results);

  if (data) {
    validateTopLevel(data, results);
    validateCategories(data, results);
    validateReferencedFiles(data, results);
    validateMajorRegisterCoverage(data, results);
  }

  validateWorkMapAndTodoIndex(results);

  if (results.fail.length === 0) {
    results.pass.push(`${REGISTER_REL} parsed successfully.`);
    results.pass.push(`All ${REQUIRED_CATEGORIES.length} required change categories are present with required maintenance fields.`);
    results.pass.push("Referenced files exist.");
    results.pass.push("WORK_MAP.md and TODO_INDEX.md reference the cross-reference registry, doc, and validator.");
  }

  writeReport(results);
}

main();
