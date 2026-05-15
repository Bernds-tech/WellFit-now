#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "repository-inventory-check.md");

const SCAN_ROOTS = ["app", "components", "lib", "functions", "project-register", "todolist", "docs", "scripts", "public", "native"];
const EXCLUDED_SEGMENTS = new Set([".git", "node_modules", ".next", "out", "dist", "build", "coverage", ".turbo"]);
const EXCLUDED_PATH_PREFIXES = ["scripts/wellfit-dev-agent/output/"];
const EXCLUDED_UNITY_SEGMENTS = new Set(["Library", "Temp", "Obj", "Logs", "Build", "Builds"]);
const PROTECTED_PATTERNS = [
  /^app\//u,
  /^components\//u,
  /^lib\//u,
  /^functions\//u,
  /^firestore\.rules$/u,
  /^native\/unity\/WellFitBuddyAR\//u,
  /(^|\/)(wallet|token|nft|payment|payments|purchase|payout|marketplace|staking|presale|trading|betting|pvp|reward|rewards|health|child|children|location|privacy|datenschutz|legal|agb|impressum)(\/|\.|-|_|$)/iu
];
const DUPLICATE_STALE_PATTERN = /(^|\/)(old|stale|duplicate|deprecated|legacy|backup|copy|archiv|archive|handoff|status)(\/|\.|-|_|$)/iu;

function norm(value) {
  return value.split(path.sep).join("/");
}

function rel(filePath) {
  return norm(path.relative(ROOT, filePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function readText(relativePath, results) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    results.fail.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath, results) {
  const text = readText(relativePath, results);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    results.fail.push(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function shouldExclude(relativePath) {
  const parts = relativePath.split("/");
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => relativePath.startsWith(prefix))) return true;
  if (parts.some((part) => EXCLUDED_SEGMENTS.has(part))) return true;
  if (relativePath.startsWith("native/unity/WellFitBuddyAR/") && parts.some((part) => EXCLUDED_UNITY_SEGMENTS.has(part))) return true;
  return false;
}

function walk(relativeDir, files = []) {
  const absoluteDir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(absoluteDir)) return files;

  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const full = path.join(absoluteDir, entry.name);
    const relativePath = rel(full);
    if (shouldExclude(relativePath)) continue;
    if (entry.isDirectory()) walk(relativePath, files);
    else if (entry.isFile()) files.push(relativePath);
  }

  return files;
}

function scanFiles() {
  return SCAN_ROOTS.flatMap((root) => walk(root)).sort((a, b) => a.localeCompare(b));
}

function routeFromPage(file) {
  const withoutPrefix = file.slice("app/".length);
  const withoutSuffix = withoutPrefix === "page.tsx" ? "" : withoutPrefix.slice(0, -"/page.tsx".length);
  const routeParts = withoutSuffix.split("/").filter(Boolean).filter((part) => !part.startsWith("(") && !part.startsWith("@"));
  const route = `/${routeParts.join("/")}`.replace(/\/+/gu, "/");
  return route === "/" ? "/" : route.replace(/\/$/u, "");
}

function routeFromApi(file) {
  const withoutPrefix = file.slice("app/api".length);
  const withoutSuffix = withoutPrefix.slice(0, -"/route.ts".length);
  const route = `/api${withoutSuffix}`.replace(/\/+/gu, "/");
  return route === "/api" ? "/api" : route.replace(/\/$/u, "");
}

function flattenRouteEntries(routesRegister) {
  return ["publicPages", "protectedAppPages", "mobilePages", "systemPages"].flatMap((group) => asArray(routesRegister?.[group]).map((entry) => {
    if (typeof entry === "string") return { route: entry, group };
    return { ...entry, group };
  })).filter((entry) => typeof entry.route === "string");
}

function flattenApiEntries(apisRegister) {
  return asArray(apisRegister?.apiRoutes).map((entry) => (typeof entry === "string" ? { route: entry } : entry)).filter((entry) => typeof entry?.route === "string");
}

function collectProductReadinessFiles(readiness) {
  const files = new Map();
  for (const readinessModule of asArray(readiness?.modules)) {
    for (const file of [...asArray(readinessModule.leading_files), ...asArray(readinessModule.supporting_files)]) {
      const normalized = norm(file);
      if (!files.has(normalized)) files.set(normalized, []);
      files.get(normalized).push(readinessModule.id ?? "unknown_module");
    }
  }
  return files;
}

function isProtected(file) {
  return PROTECTED_PATTERNS.some((pattern) => pattern.test(file));
}

function findReferences(file, workMap, readinessFiles, inventory) {
  const refs = [];
  if (workMap.includes(file)) refs.push("todolist/WORK_MAP.md");
  if (readinessFiles.has(file)) refs.push("project-register/product-readiness.json");
  for (const mapped of asArray(inventory?.mapped_files)) {
    if (mapped?.path === file) refs.push("project-register/repository-inventory.json:mapped_files");
  }
  return [...new Set(refs)];
}

function findDuplicateBasenames(files) {
  const basenames = new Map();
  for (const file of files) {
    const basename = path.basename(file).toLowerCase();
    if (!basenames.has(basename)) basenames.set(basename, []);
    basenames.get(basename).push(file);
  }

  return [...basenames.entries()]
    .filter(([, paths]) => paths.length > 1)
    .flatMap(([basename, paths]) => paths.map((file) => ({ file, reason: `basename also appears in ${paths.length - 1} other path(s): ${basename}` })));
}

function renderList(items, formatter = (item) => `- ${item}`, fallback = "- None.") {
  return items.length ? items.map(formatter).join("\n") : fallback;
}

function main() {
  const results = { pass: [], fail: [], warning: [] };
  const workMap = readText("todolist/WORK_MAP.md", results);
  const readiness = readJson("project-register/product-readiness.json", results);
  const routes = readJson("project-register/routes.json", results);
  const apis = readJson("project-register/apis.json", results);
  const inventory = exists("project-register/repository-inventory.json") ? readJson("project-register/repository-inventory.json", results) : null;

  const files = scanFiles();
  const readinessFiles = collectProductReadinessFiles(readiness);
  const pageFiles = files.filter((file) => /^app\/.*page\.tsx$/u.test(file) && !file.startsWith("app/api/"));
  const apiFiles = files.filter((file) => /^app\/api\/.*route\.ts$/u.test(file));
  const registeredRoutes = new Set(flattenRouteEntries(routes).map((entry) => entry.route));
  const registeredApis = new Set(flattenApiEntries(apis).map((entry) => entry.route));

  const discoveredRoutes = pageFiles.map((file) => ({ file, route: routeFromPage(file) }));
  const discoveredApis = apiFiles.map((file) => ({ file, route: routeFromApi(file) }));
  const unmappedFiles = files.filter((file) => findReferences(file, workMap, readinessFiles, inventory).length === 0);
  const protectedFiles = files.filter(isProtected);
  const staleCandidates = files.filter((file) => DUPLICATE_STALE_PATTERN.test(file)).map((file) => ({ file, reason: "path contains a stale/duplicate/status/archive marker; review before deletion or consolidation" }));
  const duplicateCandidates = findDuplicateBasenames(files).filter(({ file }) => /\.(md|json|tsx?|mjs|js)$/iu.test(file));
  const routeGaps = discoveredRoutes.filter(({ route }) => !registeredRoutes.has(route));
  const apiGaps = discoveredApis.filter(({ route }) => !registeredApis.has(route));

  if (files.length > 0) results.pass.push(`Scanned ${files.length} files across ${SCAN_ROOTS.join(", ")}.`);
  else results.fail.push("Repository scan found no files in required scope.");

  if (protectedFiles.length > 0) results.pass.push(`Reported ${protectedFiles.length} protected/read-only files without modifying them.`);
  if (unmappedFiles.length > 0) results.warning.push(`${unmappedFiles.length} scanned files are not referenced by WORK_MAP.md, product-readiness.json, or repository-inventory.json mapped_files.`);
  if (routeGaps.length > 0) results.warning.push(`${routeGaps.length} app page route(s) are not present in project-register/routes.json.`);
  if (apiGaps.length > 0) results.warning.push(`${apiGaps.length} API route(s) are not present in project-register/apis.json.`);
  if (staleCandidates.length > 0) results.warning.push(`${staleCandidates.length} stale/status/archive candidate(s) need review before consolidation.`);
  if (duplicateCandidates.length > 0) results.warning.push(`${duplicateCandidates.length} duplicate basename candidate(s) need review before consolidation.`);

  if (inventory) {
    for (const field of ["version", "updated", "purpose", "scan_scope", "excluded_paths", "protected_paths", "file_groups", "mapped_files", "unmapped_files", "stale_duplicate_candidates", "module_topic_assignments", "leading_register_doc_links", "recommended_follow_up_actions"]) {
      if (inventory[field] === undefined) results.fail.push(`repository-inventory.json is missing top-level field: ${field}`);
    }
  } else {
    results.warning.push("project-register/repository-inventory.json does not exist yet; create it for persistent machine-readable coverage.");
  }

  const passed = results.fail.length === 0;
  const report = `# WellFit Repository Inventory Check\n\nGenerated: ${new Date().toISOString()}\nResult: ${passed ? "PASS" : "FAIL"}\n\n## PASS\n\n${renderList(results.pass)}\n\n## FAIL\n\n${renderList(results.fail)}\n\n## WARNING\n\n${renderList(results.warning)}\n\n## Protected Files\n\n${renderList(protectedFiles.slice(0, 200), (file) => `- \`${file}\``, protectedFiles.length > 200 ? "- List truncated in console report; see repository-inventory.json for persistent grouping." : "- None.")}\n\n## Unmapped Files\n\n${renderList(unmappedFiles.slice(0, 250), (file) => `- \`${file}\``, unmappedFiles.length > 250 ? "- List truncated in report. Re-run or inspect repository-inventory.json for a curated persistent list." : "- None.")}\n\n## App Route Register Gaps\n\n${renderList(routeGaps, (item) => `- \`${item.route}\` from \`${item.file}\``)}\n\n## API Register Gaps\n\n${renderList(apiGaps, (item) => `- \`${item.route}\` from \`${item.file}\``)}\n\n## Stale / Duplicate Candidates\n\n${renderList([...staleCandidates, ...duplicateCandidates].slice(0, 250), (item) => `- \`${item.file}\` — ${item.reason}`)}\n\n## Notes\n\n- This check is report-only and does not rewrite files.\n- Warnings are expected during repository inventory work; use them to update existing registers instead of creating parallel architecture.\n`;

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, report, "utf8");

  console.log("WellFit repository inventory check complete");
  console.log(`Report: ${rel(OUTPUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  for (const item of results.pass) console.log(`PASS: ${item}`);
  for (const item of results.warning) console.log(`WARNING: ${item}`);
  for (const item of results.fail) console.log(`FAIL: ${item}`);

  if (!passed) process.exit(1);
}

main();
