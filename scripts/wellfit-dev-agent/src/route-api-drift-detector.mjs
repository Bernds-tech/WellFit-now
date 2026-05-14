#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "route-api-drift-detector.md");
const ROUTES_JSON = path.join(ROOT, "project-register", "routes.json");
const APIS_JSON = path.join(ROOT, "project-register", "apis.json");
const FEATURES_JSON = path.join(ROOT, "project-register", "features.json");
const READINESS_JSON = path.join(ROOT, "project-register", "product-readiness.json");

const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "out", "dist", "build"]);
const SENSITIVE_ROUTE_PATTERN = /token|nft|wallet|payment|pay|purchase|payout|staking|presale|trading|marketplace|marktplatz|wettkaempfe|pvp|betting|reward|rewards|economy|health|child|kinder|location|privacy|datenschutz|legal|agb|impressum/iu;

function norm(filePath) {
  return filePath.split(path.sep).join("/");
}

function rel(filePath) {
  return norm(path.relative(ROOT, filePath));
}

function walk(dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, result);
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

function routeFromFile(absFile) {
  const relDir = norm(path.relative(APP_DIR, path.dirname(absFile)));
  const parts = relDir === "" ? [] : relDir.split("/");
  const routeParts = parts.filter((part) => !part.startsWith("(") && !part.startsWith("@"));
  const route = `/${routeParts.join("/")}`.replace(/\/+/gu, "/");
  if (route === "/") return "/";
  return route.endsWith("/") ? route.slice(0, -1) : route;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function flattenRouteEntries(register) {
  const groups = ["publicPages", "protectedAppPages", "mobilePages", "systemPages"];
  const entries = [];
  for (const group of groups) {
    for (const entry of asArray(register[group])) {
      if (typeof entry === "string") entries.push({ route: entry, group });
      else if (entry && typeof entry.route === "string") entries.push({ ...entry, group });
    }
  }
  return entries;
}

function flattenApiEntries(register) {
  return asArray(register.apiRoutes).flatMap((entry) => {
    if (typeof entry === "string") return [{ route: entry }];
    if (entry && typeof entry.route === "string") return [{ ...entry }];
    return [];
  });
}

function discover() {
  const files = walk(APP_DIR);
  const pages = files
    .filter((file) => path.basename(file) === "page.tsx")
    .filter((file) => !norm(path.relative(APP_DIR, file)).startsWith("api/"))
    .map((file) => ({ route: routeFromFile(file), file: rel(file), kind: "page" }))
    .sort((a, b) => a.route.localeCompare(b.route));
  const apis = files
    .filter((file) => path.basename(file) === "route.ts")
    .filter((file) => norm(path.relative(APP_DIR, file)).startsWith("api/"))
    .map((file) => ({ route: routeFromFile(file), file: rel(file), kind: "api" }))
    .sort((a, b) => a.route.localeCompare(b.route));
  return { pages, apis };
}

function featureLinks(featuresRegister) {
  const routeToFeatures = new Map();
  const apiToFeatures = new Map();
  for (const feature of asArray(featuresRegister.features)) {
    for (const route of asArray(feature.routes)) {
      if (!routeToFeatures.has(route)) routeToFeatures.set(route, []);
      routeToFeatures.get(route).push(feature.id ?? feature.name ?? "unknown-feature");
    }
    for (const api of [...asArray(feature.apis), ...asArray(feature.apiRoutes)]) {
      if (!apiToFeatures.has(api)) apiToFeatures.set(api, []);
      apiToFeatures.get(api).push(feature.id ?? feature.name ?? "unknown-feature");
    }
  }
  return { routeToFeatures, apiToFeatures };
}

function readinessLinks(readinessRegister) {
  const fileToModules = new Map();
  const routeToModules = new Map();
  for (const readinessModule of asArray(readinessRegister.modules)) {
    for (const leadingFile of asArray(readinessModule.leading_files)) {
      const normalized = norm(leadingFile);
      if (!fileToModules.has(normalized)) fileToModules.set(normalized, []);
      fileToModules.get(normalized).push(readinessModule.id);
      if (normalized === "app/page.tsx") {
        routeToModules.set("/", [...(routeToModules.get("/") ?? []), readinessModule.id]);
      } else if (normalized.startsWith("app/") && normalized.endsWith("/page.tsx")) {
        const route = `/${normalized.slice(4, -"/page.tsx".length)}`.replace(/\/+/gu, "/");
        routeToModules.set(route, [...(routeToModules.get(route) ?? []), readinessModule.id]);
      }
    }
  }
  return { fileToModules, routeToModules };
}

function hasMetadata(entry, kind) {
  if (kind === "api") return Boolean(entry.authority || asArray(entry.security).length || entry.riskLevel || entry.risk_level);
  return Boolean(entry.area || entry.auth || entry.status || entry.featureId || entry.feature || entry.riskLevel || entry.risk_level);
}

function isSafeToFailMissing(route) {
  return !route.includes("[") && !SENSITIVE_ROUTE_PATTERN.test(route);
}

function renderList(title, items, formatter = (item) => `- ${item}`) {
  return [`## ${title}`, "", items.length ? items.map(formatter).join("\n") : "No items.", ""].join("\n");
}

function main() {
  if (!fs.existsSync(APP_DIR)) throw new Error("Missing app directory.");
  const routesRegister = readJson(ROUTES_JSON);
  const apisRegister = readJson(APIS_JSON);
  const featuresRegister = readJson(FEATURES_JSON);
  const readinessRegister = readJson(READINESS_JSON);
  const { pages, apis } = discover();
  const registeredPageEntries = flattenRouteEntries(routesRegister);
  const registeredApiEntries = flattenApiEntries(apisRegister);
  const registeredPageRoutes = new Set(registeredPageEntries.map((entry) => entry.route));
  const registeredApiRoutes = new Set(registeredApiEntries.map((entry) => entry.route));
  const actualPageRoutes = new Set(pages.map((entry) => entry.route));
  const actualApiRoutes = new Set(apis.map((entry) => entry.route));
  const actualPageFilesByRoute = new Map(pages.map((entry) => [entry.route, entry.file]));
  const actualApiFilesByRoute = new Map(apis.map((entry) => [entry.route, entry.file]));
  const { routeToFeatures, apiToFeatures } = featureLinks(featuresRegister);
  const { fileToModules, routeToModules } = readinessLinks(readinessRegister);

  const missingPageRegistrations = pages.filter((entry) => !registeredPageRoutes.has(entry.route));
  const missingApiRegistrations = apis.filter((entry) => !registeredApiRoutes.has(entry.route));
  const safeMissingRegistrations = [...missingPageRegistrations, ...missingApiRegistrations].filter((entry) => isSafeToFailMissing(entry.route));
  const protectedMissingRegistrations = [...missingPageRegistrations, ...missingApiRegistrations].filter((entry) => !isSafeToFailMissing(entry.route));
  const stalePageRegistrations = registeredPageEntries.filter((entry) => entry.route !== "/_not-found" && !actualPageRoutes.has(entry.route));
  const staleApiRegistrations = registeredApiEntries.filter((entry) => !actualApiRoutes.has(entry.route));

  const pageMetadataWarnings = registeredPageEntries
    .filter((entry) => entry.route !== "/_not-found" && actualPageRoutes.has(entry.route))
    .flatMap((entry) => {
      const warnings = [];
      const file = actualPageFilesByRoute.get(entry.route);
      if (!routeToFeatures.has(entry.route)) warnings.push(`${entry.route}: no project-register/features.json route link`);
      if (!hasMetadata(entry, "page")) warnings.push(`${entry.route}: missing route register metadata`);
      if (file && !fileToModules.has(file) && !routeToModules.has(entry.route)) warnings.push(`${entry.route}: no product-readiness leading file/risk module link for ${file}`);
      return warnings;
    });
  const apiMetadataWarnings = registeredApiEntries
    .filter((entry) => actualApiRoutes.has(entry.route))
    .flatMap((entry) => {
      const warnings = [];
      const file = actualApiFilesByRoute.get(entry.route);
      if (!apiToFeatures.has(entry.route)) warnings.push(`${entry.route}: no project-register/features.json API link`);
      if (!hasMetadata(entry, "api")) warnings.push(`${entry.route}: missing API authority/security/risk metadata`);
      if (file && !fileToModules.has(file)) warnings.push(`${entry.route}: no product-readiness leading file/risk module link for ${file}`);
      return warnings;
    });

  const failed = safeMissingRegistrations.length > 0;
  const warningCount = protectedMissingRegistrations.length + stalePageRegistrations.length + staleApiRegistrations.length + pageMetadataWarnings.length + apiMetadataWarnings.length;
  const result = failed ? "FAIL" : warningCount > 0 ? "PASS_WITH_WARNINGS" : "PASS";
  const report = [
    "# Route/API Drift Detector",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${result}`,
    "",
    `Discovered app pages: ${pages.length}`,
    `Discovered API routes: ${apis.length}`,
    `Registered pages: ${registeredPageEntries.length}`,
    `Registered API routes: ${registeredApiEntries.length}`,
    "",
    renderList("FAIL - missing safe-to-classify route/API register entries", safeMissingRegistrations, (entry) => `- \`${entry.route}\` (${entry.file})`),
    renderList("WARNING - missing protected or unclear register entries", protectedMissingRegistrations, (entry) => `- \`${entry.route}\` (${entry.file})`),
    renderList("WARNING - register page entries whose files no longer exist", stalePageRegistrations, (entry) => `- \`${entry.route}\``),
    renderList("WARNING - register API entries whose files no longer exist", staleApiRegistrations, (entry) => `- \`${entry.route}\``),
    renderList("WARNING - route feature/risk metadata gaps", pageMetadataWarnings),
    renderList("WARNING - API feature/risk metadata gaps", apiMetadataWarnings),
    "## Safety rule",
    "",
    "This first detector is validation-only and never rewrites files. Missing route/API register entries fail only when the route is static and does not match protected high/critical keywords. Protected or unclear entries remain warnings so humans can classify them without auto-fixing sensitive areas."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");
  console.log(`WellFit route/API drift detector complete: ${rel(OUT)}`);
  console.log(`Result: ${result}`);
  console.log(`PASS: discovered ${pages.length} app pages and ${apis.length} API routes`);
  if (safeMissingRegistrations.length) console.log(`FAIL: missing safe-to-classify register entries: ${safeMissingRegistrations.map((entry) => entry.route).join(", ")}`);
  if (protectedMissingRegistrations.length) console.log(`WARNING: protected/unclear missing register entries: ${protectedMissingRegistrations.map((entry) => entry.route).join(", ")}`);
  if (stalePageRegistrations.length) console.log(`WARNING: stale page register entries: ${stalePageRegistrations.map((entry) => entry.route).join(", ")}`);
  if (staleApiRegistrations.length) console.log(`WARNING: stale API register entries: ${staleApiRegistrations.map((entry) => entry.route).join(", ")}`);
  if (pageMetadataWarnings.length) console.log(`WARNING: route metadata gaps: ${pageMetadataWarnings.length}`);
  if (apiMetadataWarnings.length) console.log(`WARNING: API metadata gaps: ${apiMetadataWarnings.length}`);
  if (failed) process.exit(1);
}

main();
