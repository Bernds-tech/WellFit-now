#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const REPO_ROOT = resolve(dirname(new URL(import.meta.url).pathname), "../..");
const SOURCE_REF = "project-register/agent-product-evolution-first-run-output.json";
const OUTPUT_REF = "project-register/agent-product-evolution-decision-dossiers.json";
const SOURCE_MAP = new Map([
  ["docs/architecture/WELLFIT_AGENT_PRODUCT_EVOLUTION_FIRST_RUN_ANALYSIS.md", { kind: "analysis", recommendation: "research_more", riskLevel: "medium" }],
  ["todolist/AGENT_PRODUCT_OPPORTUNITY_PROPOSALS.md", { kind: "opportunities", recommendation: "approve", riskLevel: "medium" }],
  ["todolist/AGENT_MISSION_STORY_PROPOSALS.md", { kind: "missions", recommendation: "approve", riskLevel: "medium" }],
  ["todolist/AGENT_RESEARCH_SUMMARY_TEMPLATE.md", { kind: "research_template", recommendation: "revise", riskLevel: "medium" }],
  ["docs/beta/BETA1_PRODUCT_EVOLUTION_FIRST_RUN_READINESS_GAPS.md", { kind: "readiness_gaps", recommendation: "revise", riskLevel: "high" }],
]);
const DEFAULT_ALLOWED_FILES = ["docs/**", "todolist/**", "project-register/**"];
const DEFAULT_BLOCKED_FILES = ["app/**", "functions/**", "firestore.rules", "native/**", ".github/**"];
const DEFAULT_REQUIRED_CHECKS = ["npm run agent:validate", "npm run agent:quality-gate", "npm run lint", "npm run build", "git diff --check"];
const REQUIRED_DECISION_FIELDS = ["summary", "whatWillChange", "whySuggested", "wellFitBenefit", "userBenefit", "businessBenefit", "economyImpact", "riskSummary", "recommendation", "allowedFiles", "blockedFiles", "requiredChecks"];
const PROTECTED_OUTPUTS = new Set([
  "project-register/wellfit-beta1-canonical-truth.json",
  "docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md",
  "todolist/CODEX_CONTEXT_WELLFIT_BETA1.md",
]);

function repoPath(path) {
  return resolve(REPO_ROOT, path);
}

function normalizeRepoPath(path) {
  return relative(REPO_ROOT, repoPath(path)).replaceAll("\\", "/");
}

async function readJson(path) {
  return JSON.parse(await readFile(repoPath(path), "utf8"));
}

async function readTextIfPresent(path) {
  const absolute = repoPath(path);
  if (!existsSync(absolute)) return "";
  return readFile(absolute, "utf8");
}

function titleFromPath(path) {
  return path
    .split("/")
    .pop()
    .replace(/\.(md|json)$/i, "")
    .toLowerCase()
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function dossierIdFromPath(path, index) {
  const slug = path.replace(/\.(md|json)$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toUpperCase();
  return `PE-DOSSIER-${String(index + 1).padStart(2, "0")}-${slug.slice(0, 80)}`;
}

function clip(text, max = 520) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function firstParagraph(text) {
  return clip(text.split(/\n\s*\n/).map((part) => part.replace(/^#+\s*/, "").trim()).find((part) => part && !part.startsWith("```")) || "");
}

function extractSection(text, marker) {
  const index = text.indexOf(marker);
  if (index < 0) return "";
  return text.slice(index, index + 2600);
}

function extractLineValue(text, labels) {
  for (const line of text.split("\n")) {
    const clean = line.trim().replace(/^[-*]\s*/, "");
    const lower = clean.toLowerCase();
    for (const label of labels) {
      if (lower.startsWith(`${label.toLowerCase()}:`)) return clean.slice(clean.indexOf(":") + 1).trim();
    }
  }
  return "";
}

function extractBracketList(text, label, fallback) {
  const rx = new RegExp(`${label}\\s*:\\s*\\[([^\\]]*)\\]`, "i");
  const match = text.match(rx);
  if (!match) return fallback;
  const items = match[1].split(",").map((item) => item.trim()).filter(Boolean);
  return items.length ? items : fallback;
}

function buildContextDossier(path, text, meta, index) {
  const sourceDossierId = path;
  const base = {
    sourceDossierId,
    dossierId: dossierIdFromPath(path, index),
    title: titleFromPath(path),
    summary: firstParagraph(text),
    whatWillChange: "Lokales, strukturiertes Entscheidungsdossier aus vorhandenen Repo-Dokumenten erzeugen; keine Runtime-Produktlogik, kein Runner und kein Deploy.",
    whySuggested: "Der First-Run-Output referenziert diese Datei nur als String-Pfad; Admin-Entscheidungen brauchen fachliche Dossierfelder.",
    wellFitBenefit: "WellFit bekommt nachvollziehbare, admin-review-faehige Produktentwicklungsentscheidungen auf Basis vorhandener Register- und Planungsdaten.",
    userBenefit: "Nutzer profitieren indirekt von sicherer, gepruefter Produktplanung statt vorschneller oder unklarer Feature-Aktivierung.",
    businessBenefit: "Reviewbare Dossiers verbessern Priorisierung, Retention-Planung und Beta-Readiness ohne neue Compliance- oder Runtime-Risiken.",
    economyImpact: "Nur interne Beta-1 WFP/XP-Konzeption; keine Token-, NFT-, Cashout-, Payment- oder Blockchain-Aktivierung.",
    riskSummary: "Governance- und Scope-Risiko bleibt konservativ: Admin Approval erforderlich, protected Runtime/Canonical-Truth-Dateien blockiert.",
    recommendation: meta.recommendation,
    riskLevel: meta.riskLevel,
    allowedFiles: DEFAULT_ALLOWED_FILES,
    blockedFiles: DEFAULT_BLOCKED_FILES,
    requiredChecks: DEFAULT_REQUIRED_CHECKS,
    nextStep: "Admin prueft Dossier; bei Freigabe nur Task-Proposal/Handoff vorbereiten, kein automatisches Zustimmen, Mergen oder Deployen.",
    detailStatus: "structured",
    missingCriticalDecisionFields: [],
  };

  if (meta.kind === "opportunities") {
    const section = extractSection(text, "dossierId: PE-20260523-01") || text;
    base.title = "First Run Product Opportunity Dossiers";
    base.summary = extractLineValue(section, ["proposedChange"]) || base.summary;
    base.whatWillChange = extractLineValue(section, ["proposedChange"]) || base.whatWillChange;
    base.whySuggested = extractLineValue(section, ["whyNow"]) || base.whySuggested;
    base.wellFitBenefit = extractLineValue(section, ["WellFit benefit"]) || base.wellFitBenefit;
    base.userBenefit = extractLineValue(section, ["user benefit"]) || base.userBenefit;
    base.businessBenefit = extractLineValue(section, ["business benefit"]) || base.businessBenefit;
    base.economyImpact = [extractLineValue(section, ["WFP/XP economy impact"]), extractLineValue(section, ["internal economy impact"])].filter(Boolean).join("; ") || base.economyImpact;
    base.riskSummary = extractLineValue(section, ["risks"]) || base.riskSummary;
    base.recommendation = extractLineValue(section, ["recommendation"]) || base.recommendation;
    base.allowedFiles = extractBracketList(section, "allowedFiles", base.allowedFiles);
    base.blockedFiles = extractBracketList(section, "blockedFiles", base.blockedFiles);
    base.requiredChecks = extractBracketList(section, "requiredChecks", base.requiredChecks);
  }

  if (meta.kind === "missions") {
    base.title = extractLineValue(text, ["title"]) || "First Run Mission Story Proposal";
    base.summary = extractLineValue(text, ["storyPremise"]) || base.summary;
    base.whatWillChange = extractLineValue(text, ["missionMechanic"]) || base.whatWillChange;
    base.whySuggested = extractLineValue(text, ["whyItFitsWellFit"]) || base.whySuggested;
    base.userBenefit = extractLineValue(text, ["socialGoal"]) || base.userBenefit;
    base.economyImpact = extractLineValue(text, ["rewardModel"]) || base.economyImpact;
    base.riskSummary = extractLineValue(text, ["riskAssessment"]) || base.riskSummary;
    base.nextStep = extractLineValue(text, ["recommendedNextStep"]) || base.nextStep;
  }

  if (meta.kind === "analysis") {
    base.title = "Product Evolution First Run Analysis";
    base.summary = "Analyse-Lauf dokumentiert Produkt-, Governance- und Dossier-Status fuer WellFit Beta-1 ohne Runtime-Aenderungen.";
    base.whatWillChange = "Analyse- und Governance-Erkenntnisse werden als Admin-Entscheidungsdossier gespiegelt.";
    base.whySuggested = "Die Analyse nennt fehlenden konsolidierten First-Run Output und unstrukturierte Produktchancen als offene Luecken.";
    base.riskSummary = "Risiken: Legacy-Token/Cashout-Fokus, Umsetzung ohne Admin Approval und spekulative/privacy-kritische Trends.";
  }

  if (meta.kind === "readiness_gaps") {
    base.title = "Beta-1 Product Evolution First Run Readiness Gaps";
    base.summary = "Readiness-Gaps vor echten Testern: Human/Device Evidence, Manual Seed Run, Privacy/Guardian Review und Dossier-Inbox-Freigabe fehlen.";
    base.whatWillChange = "Gaps werden als Review-Dossier sichtbar, aber nicht automatisch freigegeben.";
    base.whySuggested = "Blockierende Evidence- und Freigabe-Luecken muessen vor echten Beta-Testern geklaert werden.";
    base.riskSummary = "High, weil Testerfreigabe, Privacy/Consent und Guardian/Child Boundaries betroffen sind; nur Planung, keine Runtime-Aenderung.";
    base.nextStep = "Revision/Owner-Review der Readiness-Gaps; fehlende Evidence-Matrix und Signoff-Dry-Run separat ausarbeiten.";
  }

  if (meta.kind === "research_template") {
    base.title = "Research Summary Template — Dossier Incomplete";
    base.summary = "Vorlage fuer spaetere Research Summaries; enthaelt Anforderungen, aber keine konkrete Quellenlage oder belastbare Findings.";
    base.whatWillChange = "";
    base.whySuggested = "Die Vorlage definiert Risk-Source-Filter, reicht aber allein nicht als fachliche Entscheidungsgrundlage.";
    base.wellFitBenefit = "Hilft spaeter, Research report-only und sicher zu strukturieren.";
    base.userBenefit = "Noch kein direkter Nutzereffekt, da kein konkretes geprueftes Proposal vorliegt.";
    base.businessBenefit = "Noch keine belastbare Finanz- oder Produktentscheidung moeglich.";
    base.economyImpact = "Nicht bewertbar ohne konkrete Findings; keine WFP/XP- oder Token/Payment-Aktivierung.";
    base.riskSummary = "Unvollstaendig: fehlende Quellen, Findings, Widersprueche, Confidence und konkrete Empfehlung.";
    base.recommendation = "revise";
    base.nextStep = "Konkreten Research Summary mit Quellen, Findings, Risiken, Confidence und WellFit-Empfehlung nachreichen.";
    base.detailStatus = "missing";
  }

  base.summary = clip(base.summary, 900);
  base.whatWillChange = clip(base.whatWillChange, 900);
  base.whySuggested = clip(base.whySuggested, 900);
  base.riskSummary = clip(base.riskSummary, 900);
  base.missingCriticalDecisionFields = computeMissing(base);
  if (base.missingCriticalDecisionFields.length) {
    base.detailStatus = "missing";
    base.recommendation = base.recommendation === "approve" ? "revise" : base.recommendation;
  }
  return base;
}

function computeMissing(dossier) {
  return REQUIRED_DECISION_FIELDS.filter((field) => {
    const value = dossier[field];
    if (Array.isArray(value)) return value.length === 0;
    return !String(value || "").trim();
  });
}

export async function buildDecisionDossiers({ sourceRef = SOURCE_REF, outputRef = OUTPUT_REF, write = true } = {}) {
  const source = await readJson(sourceRef);
  const generated = Array.isArray(source.generatedDossiers) ? source.generatedDossiers : [];
  const dossiers = [];
  for (const [index, entry] of generated.entries()) {
    if (typeof entry !== "string") {
      if (entry && typeof entry === "object") dossiers.push({ ...entry });
      continue;
    }
    const path = normalizeRepoPath(entry);
    const meta = SOURCE_MAP.get(path) || { kind: "unknown", recommendation: "revise", riskLevel: "medium" };
    const text = await readTextIfPresent(path);
    if (!text.trim()) {
      const missing = buildContextDossier(path, "", { ...meta, recommendation: "revise" }, index);
      missing.summary = `Quelle nicht gefunden oder leer: ${path}`;
      missing.detailStatus = "missing";
      missing.recommendation = "revise";
      missing.missingCriticalDecisionFields = ["sourceContent"];
      dossiers.push(missing);
      continue;
    }
    dossiers.push(buildContextDossier(path, text, meta, index));
  }

  const output = {
    createdAt: new Date().toISOString(),
    sourceRef,
    dossiers,
  };
  if (write) {
    if (PROTECTED_OUTPUTS.has(outputRef)) throw new Error(`Refusing to write owner-protected Canonical Truth file: ${outputRef}`);
    await writeFile(repoPath(outputRef), `${JSON.stringify(output, null, 2)}\n`);
  }
  return output;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const output = await buildDecisionDossiers();
  const complete = output.dossiers.filter((dossier) => dossier.detailStatus === "structured" && dossier.missingCriticalDecisionFields.length === 0).length;
  console.log(`Wrote ${OUTPUT_REF}: ${output.dossiers.length} dossiers (${complete} complete, ${output.dossiers.length - complete} incomplete/revise).`);
}
