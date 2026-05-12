#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "site-quality-audit-report.md");
const SCAN_DIRS = ["app", "components"];
const IGNORE_DIR_NAMES = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "coverage", "output"]);
const PAGE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);

const PROBLEMATIC_TERMS = [
  { term: "Auszahlung", severity: "P0", reason: "Auszahlung darf nicht als aktive Funktion erscheinen." },
  { term: "Wallet verbinden", severity: "P0", reason: "Wallet-Funktion bleibt bis nach Beta deaktiviert." },
  { term: "NFT kaufen", severity: "P0", reason: "NFT-Kauf darf nicht aktiv wirken." },
  { term: "Token kaufen", severity: "P0", reason: "Token-Kauf darf nicht aktiv wirken." },
  { term: "Cashout", severity: "P0", reason: "Cashout/Echtgeldsprache vermeiden." },
  { term: "echte Wette", severity: "P0", reason: "Echte Wetten duerfen nicht aktiv sein." },
  { term: "Presale", severity: "P1", reason: "Presale bleibt Backlog, nicht aktive UI." },
];

const CTA_TERMS = ["starten", "abschließen", "vorbereiten", "registrieren", "anpassen", "füttern", "prüfen", "laden", "öffnen"];
const SAFETY_TERMS = ["keine token", "keine nfts", "keine auszahlung", "interne beta", "interne punkte"];

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(relativeDir, result = []) {
  const absoluteDir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(absoluteDir)) return result;

  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if (IGNORE_DIR_NAMES.has(entry.name)) continue;

    const relativePath = normalizePath(path.join(relativeDir, entry.name));
    const absolutePath = path.join(ROOT, relativePath);

    if (entry.isDirectory()) {
      walk(relativePath, result);
      continue;
    }

    if (!entry.isFile()) continue;
    if (PAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) result.push(relativePath);
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

function routeFromPage(file) {
  if (!file.startsWith("app/") || !file.endsWith("page.tsx")) return null;
  const route = file.replace(/^app/u, "").replace(/\/page\.tsx$/u, "");
  return route === "" ? "/" : route;
}

function includesAny(content, terms) {
  const lower = content.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function lineNumberFor(content, term) {
  const lines = content.split(/\r?\n/u);
  const index = lines.findIndex((line) => line.toLowerCase().includes(term.toLowerCase()));
  return index >= 0 ? index + 1 : null;
}

function auditFile(file, content) {
  const findings = [];
  const isPage = file.endsWith("page.tsx");
  const lower = content.toLowerCase();
  const hasEconomyContext = ["punkte", "reward", "belohnung", "shop", "wett", "duell", "token", "nft", "wallet", "auszahlung"].some((term) => lower.includes(term));

  for (const item of PROBLEMATIC_TERMS) {
    if (lower.includes(item.term.toLowerCase())) {
      findings.push({
        severity: item.severity,
        file,
        line: lineNumberFor(content, item.term),
        title: `Problematischer Begriff: ${item.term}`,
        detail: item.reason,
      });
    }
  }

  if (isPage && !/<h1|<h2|text-5xl|text-4xl|text-3xl/u.test(content)) {
    findings.push({ severity: "P2", file, line: null, title: "Keine klare Hauptueberschrift erkannt", detail: "Seite sollte eine sichtbare H1/Hero-Ueberschrift haben." });
  }

  if (isPage && !includesAny(content, CTA_TERMS)) {
    findings.push({ severity: "P2", file, line: null, title: "Kein klarer CTA erkannt", detail: "Pruefen, ob die Seite eine klare Nutzeraktion braucht." });
  }

  if (hasEconomyContext && !includesAny(content, SAFETY_TERMS)) {
    findings.push({ severity: "P1", file, line: null, title: "Economy-Kontext ohne sichtbaren Beta-/Safety-Hinweis", detail: "Bei Punkten, Rewards, Shop, Duellen oder Token-Woertern sollte klar stehen: interne Beta, keine Token/NFT/Auszahlung." });
  }

  const imageWithoutAltMatches = [...content.matchAll(/<Image(?![^>]*\salt=)/gu)];
  for (const match of imageWithoutAltMatches) {
    findings.push({ severity: "P2", file, line: lineNumberFor(content.slice(0, match.index), "\n"), title: "Image ohne alt erkannt", detail: "Next/Image sollte fuer Accessibility einen Alt-Text haben." });
  }

  const emptyButtonMatches = [...content.matchAll(/<button[^>]*>\s*<\/button>/gu)];
  for (const match of emptyButtonMatches) {
    findings.push({ severity: "P2", file, line: lineNumberFor(content.slice(0, match.index), "\n"), title: "Leerer Button erkannt", detail: "Buttons brauchen sichtbaren Text oder aria-label." });
  }

  return findings;
}

function renderFinding(finding) {
  const location = finding.line ? `${finding.file}:${finding.line}` : finding.file;
  return `- **${finding.severity}** \`${location}\` — ${finding.title}: ${finding.detail}`;
}

function main() {
  const files = [...new Set(SCAN_DIRS.flatMap((dir) => walk(dir)))].sort();
  const appPages = files.filter((file) => file.startsWith("app/") && file.endsWith("page.tsx"));
  const routes = appPages.map(routeFromPage).filter(Boolean).sort();
  const findings = files.flatMap((file) => auditFile(file, readTextSafe(file)));
  const counts = findings.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
    return acc;
  }, {});
  const generatedAt = new Date().toISOString();
  const topFindings = findings.slice(0, 80);

  const report = `# WellFit Site Quality Audit Report

Generated: ${generatedAt}
Mode: local safe audit, no external calls, no tracking

## Summary

- Scanned code files: ${files.length}
- App pages: ${appPages.length}
- App routes: ${routes.length}
- Findings total: ${findings.length}
- P0: ${counts.P0 ?? 0}
- P1: ${counts.P1 ?? 0}
- P2: ${counts.P2 ?? 0}
- P3: ${counts.P3 ?? 0}

## App Routes

${routes.map((route) => `- \`${route}\``).join("\n") || "- none"}

## Findings

${topFindings.length > 0 ? topFindings.map(renderFinding).join("\n") : "- No local heuristic findings."}

${findings.length > topFindings.length ? `\n_Only first ${topFindings.length} findings shown. Total findings: ${findings.length}._\n` : ""}

## TODO Candidates

- Review P0/P1 findings before starting new feature work.
- For economy-related UI, keep visible wording: internal beta points, no tokens, no NFTs, no payout.
- Run Lighthouse/PageSpeed manually after major UI changes.
- Add Microsoft Clarity or analytics only after privacy and consent review.
- Use screenshots plus this report for human/AI UX review.

## Safety Notes

- This audit does not call external services.
- This audit does not track users.
- This audit does not modify application code.
- Findings are heuristics and require human review.

## Next Commands

\`npm run agent:site-quality\`
\`npm run agent:quality-gate\`
\`npm run build\`
`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log("WellFit site quality audit complete: scripts/wellfit-dev-agent/output/site-quality-audit-report.md");
  console.log(`Scanned code files: ${files.length}`);
  console.log(`App routes: ${routes.length}`);
  console.log(`Findings total: ${findings.length}`);
  console.log(`P0: ${counts.P0 ?? 0}`);
  console.log(`P1: ${counts.P1 ?? 0}`);
  console.log(`P2: ${counts.P2 ?? 0}`);
}

main();
