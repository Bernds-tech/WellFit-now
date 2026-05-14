#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = process.cwd();
const VISUAL_REGISTER_PATH = path.join(ROOT, "project-register", "visual-regression.json");
const ROUTES_REGISTER_PATH = path.join(ROOT, "project-register", "routes.json");
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const REPORT_PATH = path.join(OUTPUT_DIR, "visual-route-smoke-check.md");
const REQUIRE = createRequire(import.meta.url);

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function routeItems(items) {
  return (items ?? []).map((item) => typeof item === "string" ? { route: item } : item).filter((item) => item && item.route);
}

function registeredRouteSet(routesRegister) {
  return new Set([
    ...routeItems(routesRegister.publicPages),
    ...routeItems(routesRegister.protectedAppPages),
    ...routeItems(routesRegister.mobilePages),
    ...routeItems(routesRegister.systemPages)
  ].map((item) => item.route));
}

function safeSlug(route) {
  if (route === "/") return "root";
  return route.replace(/^\//u, "").replace(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, "").toLowerCase() || "route";
}

function validateVisualRegister(visualRegister, routesRegister) {
  const registeredRoutes = registeredRouteSet(routesRegister);
  const groups = visualRegister.routeGroups ?? [];
  const routesToCheck = visualRegister.routesToCheck ?? [];
  const viewportNames = new Set(Object.keys(visualRegister.viewports ?? {}));
  const groupIds = new Set(groups.map((group) => group.id));
  const configuredRoutes = new Set();
  const issues = [];

  for (const group of groups) {
    if (!group.id) issues.push("Route group without id.");
    for (const route of group.routes ?? []) configuredRoutes.add(route);
  }

  for (const item of routesToCheck) {
    if (!item.route) issues.push("routesToCheck item without route.");
    if (item.route) configuredRoutes.add(item.route);
    if (item.group && !groupIds.has(item.group)) issues.push(`Route ${item.route} references unknown group ${item.group}.`);
    for (const viewport of item.viewports ?? []) {
      if (!viewportNames.has(viewport)) issues.push(`Route ${item.route} references unknown viewport ${viewport}.`);
    }
  }

  const missingRoutes = [...configuredRoutes].filter((route) => !registeredRoutes.has(route)).sort();
  for (const route of missingRoutes) issues.push(`Configured visual route is missing from project-register/routes.json: ${route}`);

  return { issues, missingRoutes, configuredRouteCount: configuredRoutes.size };
}

function resolveBrowserRunner() {
  const candidates = ["@playwright/test", "playwright"];
  for (const candidate of candidates) {
    try {
      REQUIRE.resolve(candidate);
      return candidate;
    } catch {
      // Continue checking optional runners. The visual check must not install dependencies.
    }
  }
  return null;
}

async function importBrowserRunner(runnerName) {
  if (!runnerName) return null;
  return import(runnerName).catch(() => null);
}

async function canReachBaseUrl(baseUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  return fetch(baseUrl, { method: "GET", signal: controller.signal }).then((response) => ({ ok: true, status: response.status })).catch((error) => ({ ok: false, error: error.message })).finally(() => clearTimeout(timeout));
}

function selectedBrowserRoutes(visualRegister) {
  const groupById = new Map((visualRegister.routeGroups ?? []).map((group) => [group.id, group]));
  return (visualRegister.routesToCheck ?? []).filter((item) => {
    const group = groupById.get(item.group);
    if (group?.requiresAuthPlan && !process.env.WELLFIT_VISUAL_INCLUDE_PROTECTED) return false;
    return item.screenshotRequiredOnUiChange || group?.defaultScreenshotRequired;
  });
}

async function runBrowserSmoke({ visualRegister, runnerModule, baseUrl }) {
  const chromium = runnerModule?.chromium;
  if (!chromium) return { result: "SKIPPED_BROWSER_UNAVAILABLE", screenshots: [], warnings: ["Resolved browser runner does not expose chromium."] };

  const artifactDir = path.join(ROOT, visualRegister.screenshotArtifactPolicy?.defaultOutputDirectory ?? "scripts/wellfit-dev-agent/output/visual-route-smoke-check/");
  fs.mkdirSync(artifactDir, { recursive: true });

  const screenshots = [];
  const warnings = [];
  const routes = selectedBrowserRoutes(visualRegister);
  const maxRoutes = Number.parseInt(process.env.WELLFIT_VISUAL_MAX_ROUTES ?? String(routes.length), 10);
  const limitedRoutes = routes.slice(0, Number.isFinite(maxRoutes) && maxRoutes > 0 ? maxRoutes : routes.length);
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    for (const routeConfig of limitedRoutes) {
      for (const viewportName of routeConfig.viewports ?? ["desktop"]) {
        const viewportConfig = visualRegister.viewports?.[viewportName];
        if (!viewportConfig) continue;
        const context = await browser.newContext({
          viewport: { width: viewportConfig.width, height: viewportConfig.height },
          deviceScaleFactor: viewportConfig.deviceScaleFactor ?? 1,
          isMobile: Boolean(viewportConfig.isMobile)
        });
        const page = await context.newPage();
        const target = new URL(routeConfig.route, baseUrl).toString();
        const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 15000 }).catch((error) => {
          warnings.push(`${routeConfig.route} (${viewportName}) navigation warning: ${error.message}`);
          return null;
        });
        if (response && response.status() >= 400) warnings.push(`${routeConfig.route} (${viewportName}) returned HTTP ${response.status()}.`);
        const filePath = path.join(artifactDir, `${routeConfig.group}-${viewportName}-${safeSlug(routeConfig.route)}.png`);
        await page.screenshot({ path: filePath, fullPage: true }).catch((error) => warnings.push(`${routeConfig.route} (${viewportName}) screenshot warning: ${error.message}`));
        if (fs.existsSync(filePath)) screenshots.push(path.relative(ROOT, filePath));
        await context.close();
      }
    }
  } catch (error) {
    return { result: "SKIPPED_BROWSER_UNAVAILABLE", screenshots, warnings: [...warnings, `Browser launch/smoke skipped: ${error.message}`] };
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }

  return { result: warnings.length ? "PASS_WITH_WARNINGS" : "PASS", screenshots, warnings };
}

function renderReport({ visualRegister, validation, result, reportOnly, runnerName, baseUrl, reachability, browserOutcome }) {
  const lines = [
    "# WellFit Visual Route Smoke Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${result}`,
    `Mode: ${reportOnly ? "REPORT_ONLY" : "STRICT"}`,
    "",
    "## Inputs",
    "",
    `- Visual register: \`${path.relative(ROOT, VISUAL_REGISTER_PATH)}\``,
    `- Route register: \`${path.relative(ROOT, ROUTES_REGISTER_PATH)}\``,
    `- Configured visual routes: ${validation.configuredRouteCount}`,
    `- Browser runner: ${runnerName ?? "none"}`,
    `- Base URL: ${baseUrl ?? "not checked"}`,
    "",
    "## Route Register Validation",
    "",
    validation.issues.length ? validation.issues.map((issue) => `- ${issue}`).join("\n") : "No route-register drift detected for configured visual routes.",
    "",
    "## Browser Smoke",
    "",
    reachability ? `- Base URL reachability: ${reachability.ok ? `reachable (HTTP ${reachability.status})` : `unreachable (${reachability.error})`}` : "- Base URL reachability: not checked",
    `- Browser result: ${browserOutcome?.result ?? "not run"}`,
    `- Screenshots: ${browserOutcome?.screenshots?.length ?? 0}`,
    "",
    browserOutcome?.screenshots?.length ? browserOutcome.screenshots.map((file) => `- \`${file}\``).join("\n") : "No screenshots generated.",
    "",
    "## Warnings",
    "",
    browserOutcome?.warnings?.length ? browserOutcome.warnings.map((warning) => `- ${warning}`).join("\n") : "No browser warnings.",
    "",
    "## Artifact Policy",
    "",
    `Screenshots are generated under \`${visualRegister.screenshotArtifactPolicy?.defaultOutputDirectory ?? "scripts/wellfit-dev-agent/output/visual-route-smoke-check/"}\` and must not be committed. The checker never rewrites product files.`
  ];
  return lines.join("\n");
}

async function main() {
  const reportOnly = hasFlag("--report-only");
  if (!fs.existsSync(VISUAL_REGISTER_PATH)) throw new Error("Missing project-register/visual-regression.json");
  if (!fs.existsSync(ROUTES_REGISTER_PATH)) throw new Error("Missing project-register/routes.json");

  const visualRegister = readJson(VISUAL_REGISTER_PATH);
  const routesRegister = readJson(ROUTES_REGISTER_PATH);
  const validation = validateVisualRegister(visualRegister, routesRegister);

  let result = validation.issues.length ? "FAIL" : "PASS";
  let runnerName = null;
  let baseUrl = null;
  let reachability = null;
  let browserOutcome = { result: "not run", screenshots: [], warnings: [] };

  if (!validation.issues.length) {
    runnerName = resolveBrowserRunner();
    if (!runnerName) {
      result = "SKIPPED_BROWSER_UNAVAILABLE";
      browserOutcome = { result, screenshots: [], warnings: ["No optional browser runner found. Install/use Playwright only in an explicitly prepared environment."] };
    } else {
      const runnerModule = await importBrowserRunner(runnerName);
      if (!runnerModule) {
        result = "SKIPPED_BROWSER_UNAVAILABLE";
        browserOutcome = { result, screenshots: [], warnings: [`Browser runner ${runnerName} could not be imported.`] };
      } else {
        baseUrl = process.env.WELLFIT_VISUAL_BASE_URL || visualRegister.browserRequirement?.fallbackBaseUrl || null;
        reachability = baseUrl ? await canReachBaseUrl(baseUrl) : null;
        if (!baseUrl || !reachability?.ok) {
          result = "SKIPPED_BASE_URL_UNAVAILABLE";
          browserOutcome = { result, screenshots: [], warnings: ["No reachable preview URL available. Set WELLFIT_VISUAL_BASE_URL after starting a local preview."] };
        } else {
          browserOutcome = await runBrowserSmoke({ visualRegister, runnerModule, baseUrl });
          result = browserOutcome.result;
        }
      }
    }
  }

  if (reportOnly && result === "FAIL") result = "REPORT_ONLY";

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, renderReport({ visualRegister, validation, result, reportOnly, runnerName, baseUrl, reachability, browserOutcome }), "utf8");

  console.log(`WellFit visual route smoke check complete: ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`Result: ${result}`);
  console.log(`Configured visual routes: ${validation.configuredRouteCount}`);
  console.log(`Browser runner: ${runnerName ?? "none"}`);
  if (browserOutcome.result === "SKIPPED_BROWSER_UNAVAILABLE") console.log("SKIPPED_BROWSER_UNAVAILABLE");
  if (browserOutcome.result === "SKIPPED_BASE_URL_UNAVAILABLE") console.log("SKIPPED_BASE_URL_UNAVAILABLE");
  for (const issue of validation.issues) console.log(`- ${issue}`);

  if (!reportOnly && result === "FAIL") process.exit(1);
}

main();
