#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "mobile-viewport-audit.md");
const MOBILE_DIR = path.join(ROOT, "app", "mobile");
const EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);

function norm(filePath) { return filePath.split(path.sep).join("/"); }

function walk(dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, result);
    else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase())) result.push(norm(path.relative(ROOT, abs)));
  }
  return result;
}

function lineNumber(text, index) { return text.slice(0, index).split(/\r?\n/u).length; }

function scanFile(file) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  const lower = text.toLowerCase();
  const issues = [];
  const warnings = [];
  const isMobileArPage = file === "app/mobile/ar/page.tsx";
  const isMobileArComponent = file.startsWith("app/mobile/ar/components/");

  if (file.endsWith("page.tsx") && !lower.includes("mobile") && !lower.includes("touch")) {
    warnings.push({ file, line: 1, id: "missing-mobile-context", reason: "Mobile page should clearly carry mobile/touch context." });
  }

  if (/w-\[[0-9]{3,4}px\]|min-w-\[[0-9]{3,4}px\]|width:\s*[0-9]{3,4}px/iu.test(text)) {
    const match = /w-\[[0-9]{3,4}px\]|min-w-\[[0-9]{3,4}px\]|width:\s*[0-9]{3,4}px/iu.exec(text);
    warnings.push({ file, line: lineNumber(text, match.index), id: "fixed-wide-width", reason: "Review fixed wide width for horizontal scroll risk on mobile." });
  }

  if (/overflow-x-(scroll|auto)/u.test(text)) {
    const match = /overflow-x-(scroll|auto)/u.exec(text);
    warnings.push({ file, line: lineNumber(text, match.index), id: "horizontal-scroll", reason: "Intentional horizontal scrolling must be justified for mobile UX." });
  }

  if (/<button|role=["']button|<a\s/iu.test(text) && !/(aria-label|className=.*(px-|py-|h-)|min-h-|touch)/isu.test(text)) {
    warnings.push({ file, line: 1, id: "touch-target-review", reason: "Interactive elements should have clear touch target sizing or accessible label." });
  }

  if (isMobileArPage && !/(fallback|webgl|web|preview|browser-demo|kein echtes world tracking|kein echter raumanker)/iu.test(text)) {
    issues.push({ file, line: 1, id: "ar-fallback-missing", reason: "Mobile AR page must clearly communicate Web/PWA fallback boundaries." });
  }

  if ((isMobileArPage || isMobileArComponent) && /(arkit|arcore|native\s+ar)/iu.test(text) && !/(nicht\s+native|kein\s+native|fallback|preview|folgt\s+nativ|brauchen\s+wir\s+arcore\/arkit)/iu.test(text)) {
    warnings.push({ file, line: 1, id: "native-ar-wording", reason: "Native AR wording must be clearly framed as not active in this Web block." });
  }

  return { issues, warnings };
}

function main() {
  const files = walk(MOBILE_DIR).sort();
  const scanned = files.map(scanFile);
  const issues = scanned.flatMap((item) => item.issues);
  const warnings = scanned.flatMap((item) => item.warnings);
  const passed = issues.length === 0;

  const report = [
    "# Mobile Viewport / Touch / AR Fallback Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    `Scanned mobile files: ${files.length}`,
    `Blocking issues: ${issues.length}`,
    `Warnings: ${warnings.length}`,
    "",
    "## Blocking Issues",
    "",
    issues.length ? issues.map((item) => `- \`${item.file}:${item.line}\` ${item.id}: ${item.reason}`).join("\n") : "No blocking issues detected.",
    "",
    "## Warnings",
    "",
    warnings.length ? warnings.map((item) => `- \`${item.file}:${item.line}\` ${item.id}: ${item.reason}`).join("\n") : "No warnings.",
    "",
    "## Required Standard",
    "",
    "- Mobile pages should avoid unreviewed fixed wide widths and accidental horizontal scroll.",
    "- Touch targets and interactive elements require review-friendly sizing/accessibility hints.",
    "- Web AR route must clearly remain fallback/preview and not imply native AR authority.",
    "- AR subcomponents may be technical, but native AR wording must remain clearly framed as not active in this Web block.",
    "- This audit does not modify UI or product logic."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit mobile viewport audit complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Scanned mobile files: ${files.length}`);
  console.log(`Blocking issues: ${issues.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (issues.length) for (const item of issues) console.log(`- ${item.file}:${item.line} ${item.id}: ${item.reason}`);
  if (!passed) process.exit(1);
}

main();
