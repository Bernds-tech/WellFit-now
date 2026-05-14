#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ROUTES_PATH = path.join(ROOT, "project-register", "routes.json");
const OUTPUT_PATH = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "site-route-audit-report.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asRoutes(items) {
  return (items ?? []).map((item) => typeof item === "string" ? { route: item } : item).filter((item) => item && item.route);
}

function renderRows(title, rows) {
  return [
    `## ${title}`,
    "",
    rows.length ? rows.map((row) => `- \`${row.route}\` — ${row.area ?? "unclassified"}; auth: ${row.auth ?? "unknown"}; status: ${row.status ?? "unknown"}`).join("\n") : "No routes.",
    ""
  ].join("\n");
}

function main() {
  if (!fs.existsSync(ROUTES_PATH)) throw new Error("Missing project-register/routes.json");

  const register = readJson(ROUTES_PATH);
  const publicPages = asRoutes(register.publicPages);
  const mobilePages = asRoutes(register.mobilePages);
  const protectedPages = asRoutes(register.protectedAppPages);
  const systemPages = asRoutes(register.systemPages);
  const apiRoutes = (register.apiRoutes ?? []).map((route) => typeof route === "string" ? route : route.route).filter(Boolean);

  const requiredPublic = ["/", "/register", "/datenschutz", "/agb", "/impressum", "/faq", "/hilfe"];
  const requiredMobile = ["/mobile", "/mobile/analyse", "/mobile/ar", "/mobile/bewegung", "/mobile/buddy", "/mobile/einstellungen", "/mobile/missionen", "/mobile/missionen/squat"];
  const publicSet = new Set(publicPages.map((item) => item.route));
  const mobileSet = new Set(mobilePages.map((item) => item.route));
  const missingPublic = requiredPublic.filter((route) => !publicSet.has(route));
  const missingMobile = requiredMobile.filter((route) => !mobileSet.has(route));
  const protectedNeedsTestUser = protectedPages.filter((item) => (item.auth ?? "").includes("app-user") || (item.auth ?? "").includes("beta-preview"));

  const passed = missingPublic.length === 0 && missingMobile.length === 0;

  const report = [
    "# Stufe 4 Site Route Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## Summary",
    "",
    `- Public pages: ${publicPages.length}`,
    `- Mobile pages: ${mobilePages.length}`,
    `- Protected app pages: ${protectedPages.length}`,
    `- System pages: ${systemPages.length}`,
    `- API routes: ${apiRoutes.length}`,
    `- Missing required public pages: ${missingPublic.length}`,
    `- Missing required mobile pages: ${missingMobile.length}`,
    `- Protected pages needing test-user/Auth plan: ${protectedNeedsTestUser.length}`,
    "",
    renderRows("Public Pages", publicPages),
    renderRows("Mobile Pages", mobilePages),
    renderRows("Protected App Pages", protectedPages),
    renderRows("System Pages", systemPages),
    "## API Routes",
    "",
    apiRoutes.length ? apiRoutes.map((route) => `- \`${route}\``).join("\n") : "No API routes.",
    "",
    "## Missing Required Public Pages",
    "",
    missingPublic.length ? missingPublic.map((route) => `- \`${route}\``).join("\n") : "No missing required public pages.",
    "",
    "## Missing Required Mobile Pages",
    "",
    missingMobile.length ? missingMobile.map((route) => `- \`${route}\``).join("\n") : "No missing required mobile pages.",
    "",
    "## Protected Pages Test Plan",
    "",
    protectedNeedsTestUser.length ? protectedNeedsTestUser.map((item) => `- \`${item.route}\` requires a test user or documented auth blocker before full browser QA.`).join("\n") : "No protected pages needing auth plan detected.",
    "",
    "## Preview Rule",
    "",
    "Every Stufe-3/Stufe-4 PR must include either a preview link or a clear note explaining why no preview is available. Production deploy remains manual only.",
    "",
    "## Safety Notes",
    "",
    "- This route audit does not call external services.",
    "- This route audit does not log in or touch user data.",
    "- Protected routes are documented as test-user/Auth requirements, not auto-tested with real credentials."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log(`WellFit site route audit complete: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Public pages: ${publicPages.length}`);
  console.log(`Mobile pages: ${mobilePages.length}`);
  console.log(`Protected app pages: ${protectedPages.length}`);
  console.log(`API routes: ${apiRoutes.length}`);

  if (missingPublic.length) {
    console.log("Missing required public pages:");
    for (const route of missingPublic) console.log(`- ${route}`);
  }

  if (missingMobile.length) {
    console.log("Missing required mobile pages:");
    for (const route of missingMobile) console.log(`- ${route}`);
  }

  if (!passed) process.exit(1);
}

main();
