#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "concept-to-code-gap-analyzer.md");
const INTERNAL_SOURCES_JSON = path.join(ROOT, "project-register", "internal-sources.json");
const READINESS_JSON = path.join(ROOT, "project-register", "product-readiness.json");
const WORK_MAP = path.join(ROOT, "todolist", "WORK_MAP.md");
const ACTIVE_STATUSES = new Set(["active_beta", "production_ready"]);
const DUPLICATE_RISK_PATTERN = /parallel|duplicate|zweite|second|new .*architecture|competing|do not create|do not duplicate|nicht.*dupliz|kein.*parallel/iu;

function norm(filePath) {
  return filePath.split(path.sep).join("/");
}

function rel(filePath) {
  return norm(path.relative(ROOT, filePath));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function pathExists(reference) {
  const normalized = norm(reference).replace(/\/$/u, "");
  if (!normalized) return false;
  if (fs.existsSync(path.join(ROOT, normalized))) return true;
  if (reference.endsWith("/")) return fs.existsSync(path.join(ROOT, reference));
  return false;
}

function lowerText(value) {
  return String(value ?? "").toLowerCase();
}

function containsReference(text, reference) {
  const normalized = norm(reference).replace(/\/$/u, "");
  if (!normalized) return false;
  const candidates = new Set([normalized, `\`${normalized}\``]);
  if (normalized.endsWith("/page.tsx")) candidates.add(normalized.slice(0, -"/page.tsx".length));
  if (normalized.endsWith("/route.ts")) candidates.add(normalized.slice(0, -"/route.ts".length));
  for (const candidate of candidates) {
    if (candidate && text.includes(candidate)) return true;
  }
  return false;
}

function moduleForReference(readinessModules, reference) {
  const normalized = norm(reference).replace(/\/$/u, "");
  return readinessModules.filter((readinessModule) => asArray(readinessModule.leading_files).some((leadingFile) => {
    const leading = norm(leadingFile).replace(/\/$/u, "");
    return leading === normalized || normalized.startsWith(`${leading}/`) || leading.startsWith(`${normalized}/`);
  }));
}

function groupTouchesActiveBeta(group, readinessModules) {
  const groupText = lowerText([group.id, group.name, ...asArray(group.topics)].join(" "));
  return readinessModules.some((readinessModule) => {
    if (!ACTIVE_STATUSES.has(readinessModule.status)) return false;
    const moduleText = lowerText(`${readinessModule.id} ${readinessModule.name}`);
    return groupText.includes(lowerText(readinessModule.id)) || moduleText.split(/[_\s/-]+/u).some((part) => part.length > 4 && groupText.includes(part));
  });
}

function renderList(title, items) {
  return [`## ${title}`, "", items.length ? items.map((item) => `- ${item}`).join("\n") : "No items.", ""].join("\n");
}

function main() {
  const internalSources = readJson(INTERNAL_SOURCES_JSON);
  const readiness = readJson(READINESS_JSON);
  const workMapText = readText(WORK_MAP);
  const readinessText = JSON.stringify(readiness, null, 2);
  const groups = asArray(internalSources.sourceGroups);
  const readinessModules = asArray(readiness.modules);
  const clearMappingGaps = [];
  const activeBetaGaps = [];
  const unmappedImplementationAreas = [];
  const duplicateArchitectureRisks = [];
  const sharedImplementationFiles = new Map();

  for (const group of groups) {
    const leadingFiles = asArray(group.leadingImplementationFiles);
    const supportFiles = asArray(group.supportingConceptFiles);
    const existingLeadingFiles = leadingFiles.filter(pathExists);
    const existingSupportFiles = supportFiles.filter(pathExists);
    const hasStartedText = asArray(group.alreadyStartedInRepo).some((item) => String(item).trim().length > 0);
    const hasClearMapping = hasStartedText && (existingLeadingFiles.length > 0 || existingSupportFiles.length > 0);
    if (!hasClearMapping) {
      const message = `${group.id}: no clear existing code/support mapping (${existingLeadingFiles.length} existing leading files, ${existingSupportFiles.length} existing support files)`;
      clearMappingGaps.push(message);
      if (groupTouchesActiveBeta(group, readinessModules)) activeBetaGaps.push(message);
    }

    for (const leadingFile of leadingFiles) {
      const normalized = norm(leadingFile).replace(/\/$/u, "");
      if (!sharedImplementationFiles.has(normalized)) sharedImplementationFiles.set(normalized, []);
      sharedImplementationFiles.get(normalized).push(group.id);
      const referencedInWorkMap = containsReference(workMapText, normalized);
      const referencedInReadiness = containsReference(readinessText, normalized) || moduleForReference(readinessModules, normalized).length > 0;
      if (!referencedInWorkMap && !referencedInReadiness) {
        unmappedImplementationAreas.push(`${group.id}: ${normalized} is not referenced in WORK_MAP.md or product-readiness.json`);
      }
    }

    const warningText = [group.name, ...asArray(group.doNotDuplicateWarnings), ...asArray(group.notYetImplemented)].join(" ");
    if (DUPLICATE_RISK_PATTERN.test(warningText)) {
      duplicateArchitectureRisks.push(`${group.id}: duplicate/parallel-system guardrail present; continue mapped files only`);
    }
  }

  for (const [implementationFile, groupIds] of sharedImplementationFiles.entries()) {
    if (groupIds.length > 2) duplicateArchitectureRisks.push(`${implementationFile}: shared by ${groupIds.length} concept groups (${groupIds.join(", ")})`);
  }

  const failed = activeBetaGaps.length > 0;
  const warningCount = clearMappingGaps.length + unmappedImplementationAreas.length + duplicateArchitectureRisks.length;
  const result = failed ? "FAIL" : warningCount > 0 ? "PASS_WITH_WARNINGS" : "PASS";
  const report = [
    "# Concept-to-Code Gap Analyzer",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${result}`,
    "",
    `Source groups checked: ${groups.length}`,
    `Product readiness modules checked: ${readinessModules.length}`,
    "",
    renderList("FAIL - active beta concept groups with no clear code/support mapping", activeBetaGaps),
    renderList("WARNING - concept groups with no clear code/support mapping", clearMappingGaps),
    renderList("WARNING - implementation areas not referenced in WORK_MAP.md or product-readiness.json", unmappedImplementationAreas),
    renderList("WARNING - likely duplicate architecture risks", duplicateArchitectureRisks),
    "## Safety rule",
    "",
    "This first analyzer is validation-only and never rewrites files. Concept gaps remain warnings unless they touch active beta modules. High and critical areas are reported as guardrail risks and must not be auto-fixed."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");
  console.log(`WellFit concept-to-code gap analyzer complete: ${rel(OUT)}`);
  console.log(`Result: ${result}`);
  console.log(`PASS: checked ${groups.length} source groups against WORK_MAP.md and product-readiness.json`);
  if (activeBetaGaps.length) console.log(`FAIL: active beta concept mapping gaps: ${activeBetaGaps.length}`);
  if (clearMappingGaps.length) console.log(`WARNING: concept mapping gaps: ${clearMappingGaps.length}`);
  if (unmappedImplementationAreas.length) console.log(`WARNING: implementation areas not referenced in maps: ${unmappedImplementationAreas.length}`);
  if (duplicateArchitectureRisks.length) console.log(`WARNING: likely duplicate architecture risks: ${duplicateArchitectureRisks.length}`);
  if (failed) process.exit(1);
}

main();
