#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "code-inventory-report.md");

const SCAN_DIRS = [
  "app",
  "components",
  "config",
  "lib",
  "functions",
  "native",
  "public",
  "docs/architecture",
  "todolist",
];

const IGNORE_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".vercel",
  "Library",
  "Temp",
  "Logs",
  "Obj",
  "Build",
  "Builds",
  "UserSettings",
  "output",
]);

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cs", ".json", ".rules"]);
const DOC_EXTENSIONS = new Set([".md", ".txt"]);

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(relativeDir, result = []) {
  const absoluteDir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(absoluteDir)) return result;

  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if (IGNORE_DIR_NAMES.has(entry.name)) continue;

    const relativePath = normalizePath(path.join(relativeDir, entry.name));

    if (entry.isDirectory()) {
      walk(relativePath, result);
      continue;
    }

    if (!entry.isFile()) continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (CODE_EXTENSIONS.has(extension) || DOC_EXTENSIONS.has(extension)) {
      result.push(relativePath);
    }
  }

  return result;
}

function readTextSafe(relativePath) {
  try {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  } catch {
    return "";
  }
}

function countLines(content) {
  if (!content) return 0;
  return content.split(/\r?\n/u).length;
}

function classifyFile(file) {
  if (file.startsWith("app/") && file.endsWith("page.tsx")) return "app-route";
  if (file.startsWith("app/api/")) return "api-route";
  if (file.startsWith("app/") && file.includes("/components/")) return "app-component";
  if (file.startsWith("app/") && file.includes("/hooks/")) return "app-hook";
  if (file.startsWith("app/") && file.includes("/lib/")) return "app-lib";
  if (file.startsWith("components/")) return "shared-component";
  if (file.startsWith("lib/economy/")) return "economy-code";
  if (file.startsWith("lib/")) return "shared-lib";
  if (file.startsWith("config/")) return "config";
  if (file.startsWith("functions/")) return "backend-functions";
  if (file.startsWith("native/")) return "native-unity";
  if (file.startsWith("public/")) return "asset";
  if (file.startsWith("docs/architecture/")) return "architecture-doc";
  if (file.startsWith("todolist/")) return "project-memory";
  return "other";
}

function routeFromPage(file) {
  if (!file.startsWith("app/") || !file.endsWith("page.tsx")) return null;

  const route = file
    .replace(/^app/u, "")
    .replace(/\/page\.tsx$/u, "")
    .replace(/\\/gu, "/");

  return route === "" ? "/" : route;
}

function apiRouteFromFile(file) {
  if (!file.startsWith("app/api/") || !file.endsWith("route.ts")) return null;

  return file
    .replace(/^app/u, "")
    .replace(/\/route\.ts$/u, "")
    .replace(/\\/gu, "/");
}

function hasTerm(content, term) {
  return content.toLowerCase().includes(term.toLowerCase());
}

function collectFeatureFlags(filesWithContent) {
  const featureTerms = [
    "economyConfig",
    "totalSupply",
    "reserve",
    "getRewardRate",
    "getPriceRate",
    "createInternalRewardPreviewDecision",
    "LedgerEvent",
    "DailyEmissionCap",
    "UserDailyCap",
    "MissionTypeCap",
    "EconomyHealthScore",
    "tokenEnabled",
    "nftEnabled",
    "buddy-ki",
    "Firebase",
    "Firestore",
    "ARCore",
    "Unity",
    "Mission",
  ];

  return featureTerms.map((term) => {
    const matches = filesWithContent
      .filter(({ content }) => hasTerm(content, term))
      .map(({ file }) => file);

    return { term, matches };
  });
}

function renderList(items) {
  if (items.length === 0) return "- none";
  return items.map((item) => `- \`${item}\``).join("\n");
}

function renderFeatureTable(features) {
  return [
    "| Begriff / Logik | Treffer | Dateien |",
    "|---|---:|---|",
    ...features.map((feature) => {
      const files = feature.matches.slice(0, 8).map((file) => `\`${file}\``).join("<br>");
      const suffix = feature.matches.length > 8 ? `<br>+${feature.matches.length - 8} weitere` : "";
      return `| ${feature.term} | ${feature.matches.length} | ${files || "-"}${suffix} |`;
    }),
  ].join("\n");
}

function main() {
  const files = [...new Set(SCAN_DIRS.flatMap((dir) => walk(dir)))].sort();
  const filesWithContent = files.map((file) => ({ file, content: readTextSafe(file) }));
  const routes = files.map(routeFromPage).filter(Boolean).sort();
  const apiRoutes = files.map(apiRouteFromFile).filter(Boolean).sort();

  const byClass = files.reduce((acc, file) => {
    const key = classifyFile(file);
    acc[key] ??= [];
    acc[key].push(file);
    return acc;
  }, {});

  const totalLines = filesWithContent.reduce((sum, entry) => sum + countLines(entry.content), 0);
  const features = collectFeatureFlags(filesWithContent);
  const generatedAt = new Date().toISOString();

  const report = `# WellFit Code Inventory Report

Generated: ${generatedAt}
Mode: local inventory report

## Summary

- Scanned files: ${files.length}
- Total scanned lines: ${totalLines}
- App routes: ${routes.length}
- API routes: ${apiRoutes.length}
- Economy code files: ${(byClass["economy-code"] ?? []).length}
- Architecture docs: ${(byClass["architecture-doc"] ?? []).length}
- Project memory files: ${(byClass["project-memory"] ?? []).length}

## App Routes

${renderList(routes)}

## API Routes

${renderList(apiRoutes)}

## Code Areas

### Economy Code

${renderList(byClass["economy-code"] ?? [])}

### Dashboard Code

${renderList(files.filter((file) => file.startsWith("app/dashboard/")))}

### Mission Code

${renderList(files.filter((file) => file.startsWith("app/missionen/")))}

### Mobile Code

${renderList(files.filter((file) => file.startsWith("app/mobile/")))}

### Shared Lib

${renderList(byClass["shared-lib"] ?? [])}

### Config

${renderList(byClass.config ?? [])}

### Backend / Functions

${renderList(byClass["backend-functions"] ?? [])}

### Native / Unity

${renderList(byClass["native-unity"] ?? [])}

## Feature / Logic Search

${renderFeatureTable(features)}

## Important Findings

- The 25-billion internal points basis already exists in \`config/economy.ts\`.
- Reserve-based reward and price factors already exist in \`config/economy.ts\`.
- Token and NFT flags are currently disabled in \`config/economy.ts\`.
- Internal economy caps, ledger events, reward preview and dashboard economy display now exist under \`lib/economy/\` and \`app/dashboard/\`.
- This report does not modify source code.

## Recommended Next Actions

1. Review this report before building new features to avoid duplicate work.
2. If a feature already exists, extend the existing module instead of creating a parallel one.
3. Update \`todolist/MASTER_OPEN_DONE_LIST.md\` when a major code area is completed.
4. Re-run with \`npm run agent:code-inventory\` after large code changes.
`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log("WellFit code inventory complete: scripts/wellfit-dev-agent/output/code-inventory-report.md");
  console.log(`Scanned files: ${files.length}`);
  console.log(`App routes: ${routes.length}`);
  console.log(`API routes: ${apiRoutes.length}`);
  console.log(`Economy code files: ${(byClass["economy-code"] ?? []).length}`);
}

main();
