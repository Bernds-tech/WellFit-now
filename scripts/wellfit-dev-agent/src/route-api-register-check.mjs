#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "route-api-register-check.md");
const ROUTES_JSON = path.join(ROOT, "project-register", "routes.json");
const APIS_JSON = path.join(ROOT, "project-register", "apis.json");

const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "out", "dist", "build"]);

function norm(filePath) {
  return filePath.split(path.sep).join("/");
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
  const rel = norm(path.relative(APP_DIR, path.dirname(absFile)));
  const parts = rel === "" ? [] : rel.split("/");
  const routeParts = parts.filter((part) => !part.startsWith("(") && !part.startsWith("@"));
  const route = `/${routeParts.join("/")}`.replace(/\/+/g, "/");
  if (route === "/") return "/";
  return route.endsWith("/") ? route.slice(0, -1) : route;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function flattenRouteRegister(register) {
  const groups = ["publicPages", "protectedAppPages", "mobilePages", "systemPages"];
  const routes = [];
  for (const group of groups) {
    for (const entry of register[group] ?? []) {
      if (typeof entry === "string") routes.push(entry);
      else if (entry && typeof entry.route === "string") routes.push(entry.route);
    }
  }
  return [...new Set(routes)].sort();
}

function flattenApiRegister(register) {
  const routes = [];
  for (const entry of register.apiRoutes ?? []) {
    if (typeof entry === "string") routes.push(entry);
    else if (entry && typeof entry.route === "string") routes.push(entry.route);
  }
  return [...new Set(routes)].sort();
}

function renderList(title, items) {
  return [`## ${title}`, "", items.length ? items.map((item) => `- \`${item}\``).join("\n") : "No items.", ""].join("\n");
}

function main() {
  if (!fs.existsSync(APP_DIR)) throw new Error("Missing app directory.");
  if (!fs.existsSync(ROUTES_JSON)) throw new Error("Missing project-register/routes.json.");
  if (!fs.existsSync(APIS_JSON)) throw new Error("Missing project-register/apis.json.");

  const allFiles = walk(APP_DIR);
  const pageRoutes = allFiles
    .filter((file) => path.basename(file) === "page.tsx" || path.basename(file) === "page.ts")
    .map((file) => routeFromFile(file, "page"))
    .filter((route) => !route.startsWith("/api"));

  const apiRoutes = allFiles
    .filter((file) => path.basename(file) === "route.ts" || path.basename(file) === "route.tsx")
    .filter((file) => norm(path.relative(APP_DIR, file)).startsWith("api/"))
    .map((file) => routeFromFile(file, "api"));

  const actualPages = [...new Set(pageRoutes)].sort();
  const actualApis = [...new Set(apiRoutes)].sort();
  const registeredPages = flattenRouteRegister(readJson(ROUTES_JSON));
  const registeredApis = flattenApiRegister(readJson(APIS_JSON));

  const missingPageRegistrations = actualPages.filter((route) => !registeredPages.includes(route));
  const stalePageRegistrations = registeredPages.filter((route) => route !== "/_not-found" && !actualPages.includes(route));
  const missingApiRegistrations = actualApis.filter((route) => !registeredApis.includes(route));
  const staleApiRegistrations = registeredApis.filter((route) => !actualApis.includes(route));

  const passed = missingPageRegistrations.length === 0 && missingApiRegistrations.length === 0;

  const report = [
    "# Route/API Register Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    `Actual app pages: ${actualPages.length}`,
    `Actual API routes: ${actualApis.length}`,
    `Registered pages: ${registeredPages.length}`,
    `Registered API routes: ${registeredApis.length}`,
    "",
    renderList("Missing page registrations", missingPageRegistrations),
    renderList("Missing API registrations", missingApiRegistrations),
    renderList("Stale page registrations", stalePageRegistrations),
    renderList("Stale API registrations", staleApiRegistrations),
    "## Rule",
    "",
    "A new app page or API route must be added to project-register before Stufe 4 work can be considered complete.",
    "Stale entries are reported for review but do not currently fail the gate."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit route/API register check complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Actual app pages: ${actualPages.length}`);
  console.log(`Actual API routes: ${actualApis.length}`);

  if (missingPageRegistrations.length) {
    console.log("Missing page registrations:");
    for (const route of missingPageRegistrations) console.log(`- ${route}`);
  }
  if (missingApiRegistrations.length) {
    console.log("Missing API registrations:");
    for (const route of missingApiRegistrations) console.log(`- ${route}`);
  }
  if (stalePageRegistrations.length) {
    console.log("Stale page registrations:");
    for (const route of stalePageRegistrations) console.log(`- ${route}`);
  }
  if (staleApiRegistrations.length) {
    console.log("Stale API registrations:");
    for (const route of staleApiRegistrations) console.log(`- ${route}`);
  }

  if (!passed) process.exit(1);
}

main();
