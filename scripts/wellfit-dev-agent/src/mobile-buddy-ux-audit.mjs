#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ROUTES = path.join(ROOT, "project-register", "routes.json");
const FEATURES = path.join(ROOT, "project-register", "features.json");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "mobile-buddy-ux-audit.md");

const requiredMobileRoutes = [
  "/mobile",
  "/mobile/analyse",
  "/mobile/ar",
  "/mobile/bewegung",
  "/mobile/buddy",
  "/mobile/einstellungen",
  "/mobile/missionen",
  "/mobile/missionen/squat"
];

const requiredBuddyRoutes = ["/buddy", "/mobile/buddy", "/mobile/ar"];
const requiredFeatureRules = {
  "FEATURE-MOBILE-WEB": ["touch-first", "performance-aware", "webgl-fallback-not-native-ar-authority"],
  "FEATURE-BUDDY": ["guide-and-emotional-binding", "no-reward-authority", "server-provider-only"]
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function routeList(items) {
  return (items ?? []).map((item) => typeof item === "string" ? item : item.route).filter(Boolean);
}

function findFeature(features, id) {
  return (features.features ?? []).find((item) => item.id === id);
}

function hasRules(feature, rules) {
  const actual = new Set(feature?.rules ?? []);
  return rules.filter((rule) => !actual.has(rule));
}

function pageExists(route) {
  const pagePath = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`;
  return fs.existsSync(path.join(ROOT, pagePath));
}

function readPage(route) {
  const pagePath = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`;
  const abs = path.join(ROOT, pagePath);
  return fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";
}

function main() {
  const issues = [];
  const warnings = [];

  for (const file of [ROUTES, FEATURES]) {
    if (!fs.existsSync(file)) issues.push(`Missing ${path.relative(ROOT, file)}`);
  }

  if (issues.length === 0) {
    const routes = readJson(ROUTES);
    const features = readJson(FEATURES);
    const mobileRoutes = new Set(routeList(routes.mobilePages));
    const allRoutes = new Set([
      ...routeList(routes.publicPages),
      ...routeList(routes.protectedAppPages),
      ...routeList(routes.mobilePages),
      ...routeList(routes.systemPages)
    ]);

    for (const route of requiredMobileRoutes) {
      if (!mobileRoutes.has(route)) issues.push(`Missing mobile route in register: ${route}`);
      if (!pageExists(route)) issues.push(`Missing mobile page file: ${route}`);
    }

    for (const route of requiredBuddyRoutes) {
      if (!allRoutes.has(route)) issues.push(`Missing buddy route in register: ${route}`);
      if (!pageExists(route)) issues.push(`Missing buddy page file: ${route}`);
    }

    for (const [featureId, rules] of Object.entries(requiredFeatureRules)) {
      const feature = findFeature(features, featureId);
      if (!feature) {
        issues.push(`Missing feature ${featureId}`);
        continue;
      }
      const missing = hasRules(feature, rules);
      for (const rule of missing) issues.push(`${featureId} missing rule ${rule}`);
    }

    const arPage = readPage("/mobile/ar");
    if (arPage) {
      const lower = arPage.toLowerCase();
      if (lower.includes("native ar") || lower.includes("arkit") || lower.includes("arcore")) {
        warnings.push("/mobile/ar references native AR terms; verify wording clearly says web fallback, not active native AR.");
      }
      if (!lower.includes("fallback") && !lower.includes("webgl") && !lower.includes("web")) {
        warnings.push("/mobile/ar should clearly document Web/PWA/visual fallback boundaries.");
      }
    }
  }

  const passed = issues.length === 0;
  const report = [
    "# Mobile / Buddy UX Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## Scope",
    "",
    "This audit validates registered mobile routes, Buddy routes and mobile/AR fallback guardrails. It does not modify UI, product logic, APIs, Firestore rules or user data.",
    "",
    "## Issues",
    "",
    issues.length ? issues.map((item) => `- ${item}`).join("\n") : "No blocking issues detected.",
    "",
    "## Warnings",
    "",
    warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "No warnings.",
    "",
    "## Required Standard",
    "",
    "- Mobile routes must exist and be registered.",
    "- Buddy routes must exist and be registered.",
    "- Mobile-Web must stay touch-first and performance-aware.",
    "- Web AR must be treated as fallback/preview, not native AR authority.",
    "- Buddy must not authorize rewards or completion."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit Mobile/Buddy UX audit complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Issues: ${issues.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (issues.length) for (const item of issues) console.log(`- ${item}`);
  if (!passed) process.exit(1);
}

main();
