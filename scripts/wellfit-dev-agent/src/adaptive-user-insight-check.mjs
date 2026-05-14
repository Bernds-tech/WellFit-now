#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = path.join(ROOT, "project-register", "adaptive-user-insights.json");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "adaptive-user-insight-check.md");

const REQUIRED_ALLOWED_SIGNALS = [
  "mission_completion_rate_by_module",
  "mission_abandon_rate_by_module",
  "favorite_repeat_usage_counts",
  "aggregated_difficulty_feedback",
  "aggregate_route_module_satisfaction",
  "feature_request_clusters",
  "anonymized_sentiment_buckets",
  "buddy_interaction_counts_by_category",
  "aggregate_friction_categories",
  "aggregate_device_class_only",
  "aggregate_time_window_preference_only",
  "learning_play_style_labels"
];

const REQUIRED_FORBIDDEN_GROUPS = [
  { label: "health", terms: ["health", "heart", "diagnoses", "medications", "injuries", "symptoms"] },
  { label: "child/minor", terms: ["child", "minor", "school", "guardian"] },
  { label: "location", terms: ["exact location", "GPS", "addresses", "route history", "location traces"] },
  { label: "camera/biometric", terms: ["camera", "face", "biometric", "raw sensor"] },
  { label: "personal identifiers", terms: ["names", "emails", "user IDs", "device IDs"] },
  { label: "payment/token/wallet", terms: ["payment", "token", "wallet", "NFT"] }
];

const RAW_IDENTIFIER_TERMS = [
  "userId",
  "user_id",
  "userID",
  "email",
  "name",
  "deviceId",
  "device_id",
  "ipAddress",
  "ip_address",
  "walletAddress",
  "rawUserIdentifiers"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function hasAny(haystack, terms) {
  const normalized = haystack.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function add(results, name, passed, details) {
  results.push({ name, passed, details });
}

function renderResults(results) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${String(result.details).replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function main() {
  const results = [];
  let register = null;

  add(results, "adaptive-user-insights.json exists", fs.existsSync(REGISTER_PATH), fs.existsSync(REGISTER_PATH) ? "found" : "missing");

  if (fs.existsSync(REGISTER_PATH)) {
    try {
      register = readJson(REGISTER_PATH);
      add(results, "adaptive-user-insights.json parses", true, "valid JSON");
    } catch (error) {
      add(results, "adaptive-user-insights.json parses", false, error.message);
    }
  }

  if (register) {
    add(results, "activationState is planning_only", register.activationState === "planning_only", register.activationState ?? "missing");

    const signalIds = asArray(register.allowedAggregateSignals).map((signal) => signal.id);
    const missingSignals = REQUIRED_ALLOWED_SIGNALS.filter((signal) => !signalIds.includes(signal));
    add(results, "allowed aggregate signals are present", missingSignals.length === 0, missingSignals.length ? `missing: ${missingSignals.join(", ")}` : `${signalIds.length} signals`);

    const forbiddenText = asArray(register.forbiddenRawSensitiveFields).join("\n");
    const missingForbidden = REQUIRED_FORBIDDEN_GROUPS.filter((group) => !hasAny(forbiddenText, group.terms)).map((group) => group.label);
    add(results, "forbidden fields cover sensitive categories", missingForbidden.length === 0, missingForbidden.length ? `missing: ${missingForbidden.join(", ")}` : "health, child, location, camera/biometric, identifiers, payment/token/wallet covered");

    const thresholds = register.minimumSampleThresholds ?? {};
    const numericThresholds = Object.entries(thresholds).filter(([, value]) => typeof value === "number" && value > 0);
    add(results, "minimum sample thresholds exist", numericThresholds.length >= 5, numericThresholds.length ? `${numericThresholds.length} numeric thresholds` : "missing numeric thresholds");

    add(results, "explainability requirements exist", asArray(register.explainabilityRequirements).length >= 4, `${asArray(register.explainabilityRequirements).length} requirements`);

    const reviewTriggers = asArray(register.humanReviewRequiredTriggers).join("\n");
    const hasHighCritical = /high\s+or\s+critical|critical.*high|high.*critical/iu.test(reviewTriggers);
    add(results, "human-review-required triggers cover high/critical changes", hasHighCritical, hasHighCritical ? "high/critical trigger present" : "missing high/critical trigger");

    const summarySchema = register.agentVisibleSummarySchema ?? {};
    const summaryText = stringify(summarySchema);
    const forbiddenIdentifierFields = RAW_IDENTIFIER_TERMS.filter((term) => summaryText.includes(`\"${term}\"`) && !/forbidden|must not exist/i.test(String(summarySchema[term] ?? "")));
    const explicitForbidden = /rawUserIdentifiers[\s\S]*forbidden/i.test(summaryText) && /rawUserMessages[\s\S]*forbidden/i.test(summaryText);
    add(results, "agent-visible summaries exclude raw user identifiers", explicitForbidden && forbiddenIdentifierFields.length === 0, explicitForbidden ? "raw identifiers/messages explicitly forbidden" : "missing explicit forbidden summary fields");
  }

  const passed = results.every((result) => result.passed);
  const report = [
    "# Adaptive User Insight Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## Scope",
    "",
    "Validates planning-only adaptive user insight governance. This check does not activate tracking, analytics, runtime personalization, or user-data processing.",
    "",
    "## Results",
    "",
    renderResults(results),
    "",
    "## Required Standard",
    "",
    "- The register exists and parses as JSON.",
    "- activationState remains planning_only.",
    "- Only allowed aggregate signals are available to future agents.",
    "- Health, child, location, camera/biometric, personal identifier, payment/token/wallet data are forbidden.",
    "- Minimum sample thresholds, explainability requirements, and high/critical human-review triggers are present.",
    "- Agent-visible summary schemas explicitly forbid raw identifiers and raw messages."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit adaptive user insight check complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  for (const result of results) console.log(`${result.passed ? "OK" : "FAIL"}: ${result.name} (${result.details})`);
  if (!passed) process.exit(1);
}

main();
