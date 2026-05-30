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
const REQUIRED_DECISION_FIELDS = ["summary", "whatWillChange", "whySuggested", "wellFitBenefit", "userBenefit", "businessBenefit", "economyImpact", "riskSummary", "recommendation", "recommendationLabel", "recommendationText", "allowedFiles", "blockedFiles", "requiredChecks"];
const RECOMMENDATION_COPY = {
  approve: {
    label: "Zur Zustimmung geeignet",
    text: "Der Vorschlag ist als begrenztes Dossier oder Planungsarbeit geeignet. Trotzdem wird nichts automatisch umgesetzt: Ein Admin muss bewusst zustimmen, danach entsteht nur der naechste klar begrenzte Arbeitsschritt.",
  },
  revise: {
    label: "Ueberarbeiten",
    text: "Bitte nicht zustimmen. Es fehlen noch verstaendliche Entscheidungsdaten, belastbare Begruendungen oder sichere Grenzen. Zuerst muss das Dossier nachgebessert werden.",
  },
  research_more: {
    label: "Weiter pruefen",
    text: "Weiter pruefen – noch nicht umsetzen. Dieser Vorschlag braucht zuerst ein reines Konzept- oder Research-Dossier. Es wird noch nichts in App, Funktionen, Standortlogik oder Produkt-Runtime gebaut.",
  },
  reject: {
    label: "Ablehnen",
    text: "Der Vorschlag soll nicht weiterverfolgt werden, solange die genannten Grenzen oder Risiken nicht grundsaetzlich geklaert sind.",
  },
};
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
      if (lower.startsWith(`${label.toLowerCase()}:`)) {
        const value = clean.slice(clean.indexOf(":") + 1).trim();
        if (value) return value;
      }
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

function recommendationCopy(recommendation) {
  return RECOMMENDATION_COPY[recommendation] || {
    label: "Manuell pruefen",
    text: `Technischer Empfehlungswert: ${recommendation || "fehlt"}. Bitte erst fachlich pruefen, bevor eine Entscheidung getroffen wird.`,
  };
}

function explainTerms(text) {
  let result = String(text || "").trim();
  if (!result) return result;
  const replacements = [
    [/AR-lite/gi, "AR-lite (einfache AR-/Umgebungsmission ohne volle Unity- oder Native-App-Abhaengigkeit)"],
    [/coarse location boundaries/gi, "nur grobe Ortsbereiche, keine praezise Standortverfolgung"],
    [/coarse area only/gi, "nur grobe Ortsbereiche, keine exakten Live-Standorte"],
    [/Unity-Abhaengigkeit/gi, "Unity-Abhaengigkeit (Abhaengigkeit vom separaten AR-/3D-Technikbereich)"],
    [/Unity bleibt isoliert/gi, "Unity bleibt isoliert (der separate AR-/3D-Technikbereich wird nicht mit dieser Web-Beta vermischt)"],
    [/native risk/gi, "Risiko durch tiefe Smartphone-/App-Integration"],
    [/XP progression via exploration chapters/gi, "XP (Erfahrungspunkte fuer Avatar-Fortschritt) durch Erkundungskapitel"],
    [/XP avatar progress/gi, "XP (Erfahrungspunkte fuer Avatar-Fortschritt)"],
    [/Avatar Progress/gi, "Avatar-Fortschritt"],
    [/XP-Fortschritt/gi, "XP-Fortschritt (Erfahrungspunkte fuer den Avatar)"],
    [/XP-first/gi, "zuerst XP (Erfahrungspunkte fuer den Avatar)"],
    [/\bXP\b(?! \()/g, "XP (Erfahrungspunkte fuer den Avatar)"],
    [/WFP internal only/gi, "WFP nur intern in der Beta"],
    [/\bWFP\b(?! \()/g, "WFP (interne Beta-Punkte; kein echtes Geld, kein Token, kein Cashout)"],
    [/capped completion bonus/gi, "begrenzter Abschlussbonus, damit Belohnungen nicht ausufern"],
    [/Reward-Caps/gi, "Belohnungsgrenzen"],
    [/Reward-Inflation/gi, "zu stark wachsende Belohnungen"],
    [/Reward-Loop/gi, "Belohnungskreislauf"],
    [/Sink-Mechanik/gi, "Mechanik zum kontrollierten Ausgeben oder Begrenzen interner Punkte"],
    [/privacy-safe/gi, "datenschutzschonend"],
    [/privacy\/location sensitivity/gi, "Datenschutz- und Standort-Sensibilitaet"],
    [/Privacy\/Consent/gi, "Datenschutz und Einwilligung"],
    [/Guardian\/Child Boundaries/gi, "Grenzen fuer Eltern-/Kinder-Schutz"],
    [/Child-Safety/gi, "Kindersicherheit"],
    [/health-adjacent wording/gi, "gesundheitsnahe Formulierungen"],
    [/child\/guardian wording/gi, "Formulierungen zu Kindern und Elternaufsicht"],
    [/no token\/cashout\/payment/gi, "kein Token, kein Cashout und keine Zahlung"],
    [/motivational pressure/gi, "zu starker Motivationsdruck"],
    [/Retention/gi, "Nutzerbindung"],
    [/B2B/gi, "B2B (Angebote fuer Firmen oder Partner)"],
    [/Runtime-Aenderungen/gi, "Aenderungen am laufenden Produkt"],
    [/Runtime-Produktlogik/gi, "Logik im laufenden Produkt"],
    [/Produkt-Runtime/gi, "laufenden Produktlogik"],
    [/Admin Approval/gi, "bewusste Admin-Zustimmung"],
    [/runner/gi, "Runner (automatisierter Arbeitslauf)"],
    [/Deployen/gi, "Veroeffentlichen"],
    [/Deploy/gi, "Deploy (Veroeffentlichung)"],
    [/research_more/gi, "Weiter pruefen – noch nicht umsetzen"],
  ];
  for (const [pattern, replacement] of replacements) result = result.replace(pattern, replacement);
  return result.replace(/\s+/g, " ").trim();
}

function applyReadableGerman(dossier) {
  const copy = recommendationCopy(dossier.recommendation);
  dossier.recommendationLabel = copy.label;
  dossier.recommendationText = copy.text;
  for (const field of ["title", "summary", "whatWillChange", "whySuggested", "wellFitBenefit", "userBenefit", "businessBenefit", "economyImpact", "riskSummary", "recommendationText", "nextStep"]) {
    dossier[field] = explainTerms(dossier[field]);
  }
  return dossier;
}

function buildContextDossier(path, text, meta, index) {
  const sourceDossierId = path;
  const base = {
    sourceDossierId,
    dossierId: dossierIdFromPath(path, index),
    title: titleFromPath(path),
    summary: firstParagraph(text),
    whatWillChange: "Es entsteht nur ein lokales, strukturiertes Entscheidungsdossier aus vorhandenen Repo-Dokumenten. Es gibt keine Aenderung an der Logik im laufenden Produkt, keinen automatisierten Arbeitslauf und keine Veroeffentlichung.",
    whySuggested: "Der First-Run-Output verweist bisher nur technisch auf diese Datei. Admins brauchen aber klare Entscheidungsfelder, damit sie verstehen, worueber sie zustimmen oder was sie ablehnen sollen.",
    wellFitBenefit: "WellFit bekommt nachvollziehbare Produktentscheidungen, die ein Admin pruefen kann, bevor Arbeit gestartet wird.",
    userBenefit: "Nutzer profitieren indirekt von sicherer, gepruefter Produktplanung statt vorschneller oder unklarer Feature-Aktivierung.",
    businessBenefit: "Verstaendliche Dossiers verbessern Priorisierung, Nutzerbindung und Beta-Bereitschaft, ohne neue Compliance- oder Produktrisiken zu erzeugen.",
    economyImpact: "Beta-1 Economy bleibt intern: WFP (interne Beta-Punkte; kein echtes Geld, kein Token, kein Cashout) und XP (Erfahrungspunkte fuer den Avatar). Keine Zahlung und keine Blockchain-Aktivierung.",
    riskSummary: "Das Risiko bleibt begrenzt: bewusste Admin-Zustimmung ist erforderlich; laufendes Produkt, Funktionen, Regeln, Native-App-Bereiche und owner-protected Canonical-Truth-Dateien bleiben blockiert.",
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
    base.title = "Produktchance: saisonale Familienmissionen als Entscheidungsvorlage";
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
    base.title = extractLineValue(text, ["title"]) || "Missionsgeschichte: Familien-Abenteuerpfad";
    base.summary = extractLineValue(text, ["storyPremise"]) || base.summary;
    base.whatWillChange = extractLineValue(text, ["missionMechanic"]) || base.whatWillChange;
    base.whySuggested = extractLineValue(text, ["whyItFitsWellFit"]) || base.whySuggested;
    base.userBenefit = extractLineValue(text, ["socialGoal"]) || base.userBenefit;
    base.economyImpact = extractLineValue(text, ["rewardModel"]) || base.economyImpact;
    base.riskSummary = extractLineValue(text, ["riskAssessment"]) || base.riskSummary;
    base.nextStep = extractLineValue(text, ["recommendedNextStep"]) || base.nextStep;
  }

  if (meta.kind === "analysis") {
    base.title = "Produktentwicklung: erste Analyse als Entscheidungsvorlage";
    base.summary = "Der Analyse-Lauf fasst Produktstatus, Governance und Dossier-Luecken fuer WellFit Beta-1 zusammen. Er nennt auch AR-lite Missionen mit groben Ortsbereichen als Chance, aber nur als Pruefthema. Er dient nur als Entscheidungsgrundlage und aendert nichts am laufenden Produkt.";
    base.whatWillChange = "Die Analyse-Ergebnisse werden in ein verstaendliches Admin-Dossier uebertragen. Daraus entsteht noch keine App-Funktion, kein Funktions-Deploy und keine automatische Umsetzung.";
    base.whySuggested = "Die Analyse nennt fehlende gebuendelte First-Run-Ergebnisse und noch unklare Produktchancen, darunter einfache AR-/Umgebungsmissionen ohne Unity-Abhaengigkeit und ohne praezise Standortverfolgung. Deshalb soll zuerst fachlich geprueft werden, welche Vorschlaege sicher weiterverfolgt werden duerfen.";
    base.riskSummary = "Risiken: alte Token- oder Cashout-Ideen koennten Beta-1 verwässern, Umsetzung ohne bewusste Admin-Zustimmung waere falsch, und Standort-/Datenschutzfragen sowie Risiken durch tiefe Smartphone-/App-Integration muessen zuerst geprueft werden.";
    base.nextStep = "Weiter pruefen: zuerst ein reines Konzept- oder Research-Dossier erstellen. Es wird noch nichts in App, Funktionen, Standortlogik oder Produkt-Runtime gebaut.";
  }

  if (meta.kind === "readiness_gaps") {
    base.title = "Beta-1 Bereitschaft: offene Pruefpunkte vor echten Testern";
    base.summary = "Vor echten Testern fehlen noch Nachweise mit Menschen und Geraeten, ein manueller Probelauf, Datenschutz-/Einwilligungspruefung, Eltern-/Kinder-Schutzpruefung und die Freigabe der Dossier-Inbox.";
    base.whatWillChange = "Diese offenen Punkte werden als Review-Dossier sichtbar. Sie werden nicht automatisch freigegeben und fuehren zu keiner Produktumsetzung.";
    base.whySuggested = "Bevor echte Beta-Tester eingeladen werden, muessen Nachweise, Schutzgrenzen und Freigaben verstaendlich dokumentiert sein.";
    base.riskSummary = "Hohes Risiko, weil Testerfreigabe, Datenschutz, Einwilligung und Eltern-/Kinder-Schutz betroffen sind. Das Dossier bleibt Planung und aendert nichts am laufenden Produkt.";
    base.nextStep = "Ueberarbeiten und vom Owner pruefen lassen; fehlende Nachweismatrix und Freigabe-Probelauf separat ausarbeiten.";
  }

  if (meta.kind === "research_template") {
    base.title = "Research-Vorlage: Dossier noch unvollstaendig";
    base.summary = "Das ist nur eine Vorlage fuer spaetere Recherche-Zusammenfassungen. Sie enthaelt Anforderungen, aber noch keine konkreten Quellen, Ergebnisse oder belastbaren Schlussfolgerungen.";
    base.whatWillChange = "Es wird nichts gebaut. Zuerst muss aus der Vorlage ein konkretes Dossier mit Quellen, Erkenntnissen und Risiken entstehen.";
    base.whySuggested = "Die Vorlage beschreibt, wie riskante Quellen gefiltert werden sollen. Allein reicht sie aber nicht als Entscheidungsgrundlage.";
    base.wellFitBenefit = "Hilft spaeter, Recherche sicher und nachvollziehbar zu strukturieren.";
    base.userBenefit = "Noch kein direkter Nutzereffekt, weil kein konkret gepruefter Vorschlag vorliegt.";
    base.businessBenefit = "Noch keine belastbare Produkt- oder Business-Entscheidung moeglich.";
    base.economyImpact = "Noch nicht bewertbar. Es gibt keine WFP- oder XP-Aktivierung und keine Token-, Zahlungs- oder Cashout-Funktion.";
    base.riskSummary = "Unvollstaendig: Es fehlen konkrete Quellen, Ergebnisse, Widersprueche, Sicherheit der Bewertung und eine klare Empfehlung.";
    base.recommendation = "revise";
    base.nextStep = "Konkrete Recherche-Zusammenfassung mit Quellen, Ergebnissen, Risiken, Bewertungs-Sicherheit und WellFit-Empfehlung nachreichen.";
    base.detailStatus = "missing";
  }

  applyReadableGerman(base);

  base.summary = clip(base.summary, 900);
  base.whatWillChange = clip(base.whatWillChange, 900);
  base.whySuggested = clip(base.whySuggested, 900);
  base.riskSummary = clip(base.riskSummary, 900);
  base.missingCriticalDecisionFields = computeMissing(base);
  if (meta.kind === "research_template") base.missingCriticalDecisionFields.push("concreteResearchFindings");
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
