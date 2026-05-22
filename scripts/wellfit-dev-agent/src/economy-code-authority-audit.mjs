#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "economy-code-authority-audit.md");
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "output"]);

const blockingPatterns = [
  { id: "wallet-connect", pattern: /wallet\s*verbinden|connectWallet|WalletConnect/iu, reason: "Wallet activation must not appear in active beta code." },
  { id: "token-buy", pattern: /token\s*kaufen|buyToken|purchaseToken/iu, reason: "Token purchase must remain inactive/backlog." },
  { id: "nft-buy", pattern: /nft\s*kaufen|buyNFT|purchaseNFT/iu, reason: "NFT purchase must remain inactive/backlog." },
  { id: "cashout", pattern: /cashout|auszahlung|withdraw/iu, reason: "Cashout/withdrawal must not be active." }
];

const warningPatterns = [
  { id: "direct-points-write", pattern: /\b(points|xp|level)\s*[:=]/iu, reason: "Review whether this is display/preview or final client authority." },
  { id: "firestore-write", pattern: /\b(setDoc|updateDoc|addDoc)\s*\(/u, reason: "Review Firestore write location and authority." },
  { id: "reward-final-wording", pattern: /final\s+reward|reward\s+authorized|mission\s+completed/iu, reason: "Review final reward/completion authority wording." }
];

const allowedNegativeCashoutPatterns = [
  /keine[^\n]{0,120}auszahlung(en)?/iu,
  /ohne[^\n]{0,120}auszahlung(en)?/iu,
  /nicht\s+auszahlbar/iu,
  /no[^\n]{0,120}cashout/iu,
  /no[^\n]{0,120}withdrawal/iu,
  /no[^\n]{0,120}payout/iu,
  /keine[^\n]{0,120}cashout/iu,
  /cashout\s*\/\s*echtgeldsprache\s+vermeiden/iu,
  /auszahlung(en)?[^\n]{0,120}(deaktiviert|inaktiv|nicht\s+aktiv|verboten|blockiert)/iu
];

function norm(filePath) { return filePath.split(path.sep).join("/"); }

function walk(relativeDir, result = []) {
  const absDir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(absDir)) return result;
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const rel = norm(path.join(relativeDir, entry.name));
    if (entry.isDirectory()) walk(rel, result);
    else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase())) result.push(rel);
  }
  return result;
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/u).length;
}

function lineAt(text, index) {
  const lines = text.split(/\r?\n/u);
  return lines[lineNumber(text, index) - 1] ?? "";
}

function isAllowedNegativeSafetyContext(patternId, line) {
  if (patternId !== "cashout") return false;
  return allowedNegativeCashoutPatterns.some((pattern) => pattern.test(line));
}

function scanFile(file) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  const issues = [];
  const warnings = [];

  for (const item of blockingPatterns) {
    const match = item.pattern.exec(text);
    if (match) {
      const line = lineAt(text, match.index);
      if (!isAllowedNegativeSafetyContext(item.id, line)) {
        issues.push({ file, line: lineNumber(text, match.index), id: item.id, reason: item.reason });
      }
    }
  }

  for (const item of warningPatterns) {
    const match = item.pattern.exec(text);
    if (match) warnings.push({ file, line: lineNumber(text, match.index), id: item.id, reason: item.reason });
  }

  return { issues, warnings };
}

function main() {
  const files = [...new Set(SCAN_DIRS.flatMap((dir) => walk(dir)))].sort();
  const results = files.map(scanFile);
  const issues = results.flatMap((item) => item.issues);
  const warnings = results.flatMap((item) => item.warnings);
  const passed = issues.length === 0;

  const report = [
    "# Economy Code Authority Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    `Scanned files: ${files.length}`,
    `Blocking issues: ${issues.length}`,
    `Warnings: ${warnings.length}`,
    "",
    "## Blocking Issues",
    "",
    issues.length ? issues.map((item) => `- \`${item.file}:${item.line}\` ${item.id}: ${item.reason}`).join("\n") : "No blocking issues detected.",
    "",
    "## Warnings",
    "",
    warnings.length ? warnings.slice(0, 80).map((item) => `- \`${item.file}:${item.line}\` ${item.id}: ${item.reason}`).join("\n") : "No warnings.",
    warnings.length > 80 ? `\n_Only first 80 warnings shown. Total warnings: ${warnings.length}._` : "",
    "",
    "## Required Standard",
    "",
    "- No active wallet/token/NFT/cashout code in beta.",
    "- Negative safety wording such as 'keine Auszahlung' or 'keine echten Auszahlungen' is allowed and should not fail the gate.",
    "- Firestore writes and points/xp/level assignments must be reviewed as preview, bridge or server-authority logic.",
    "- This audit does not modify product code."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit economy code authority audit complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Scanned files: ${files.length}`);
  console.log(`Blocking issues: ${issues.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (issues.length) for (const item of issues) console.log(`- ${item.file}:${item.line} ${item.id}: ${item.reason}`);
  if (!passed) process.exit(1);
}

main();
