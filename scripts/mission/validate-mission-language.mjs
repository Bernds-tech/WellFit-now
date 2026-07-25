#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGETS = [
  "app/missionen/tagesmissionen",
  "app/missionen/wochenmissionen",
  "app/missionen/challenge",
  "app/missionen/abenteuer",
  "app/missionen/history",
  "components/mission",
  "lib/beta1/missionStatusPresentation.mjs",
  "lib/beta1/clientMissionHistory.ts",
  "functions/lib/beta1MissionHistory.js",
];
const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".ts", ".tsx"]);
const BLOCKED_PATTERNS = [
  { label: "Wien-Tag", pattern: /Wien-Tag/giu },
  { label: "Wien-Woche", pattern: /Wien-Woche/giu },
];
const ADOPTION_CONTRACTS = [
  {
    path: "app/missionen/challenge/page.tsx",
    required: ["getMissionStatusPresentation", "missionKind: \"challenge\"", "Serverstatus aktualisieren"],
    blocked: ["function reviewStatusLabel"],
  },
  {
    path: "app/missionen/challenge/ChallengeDetailsPanel.tsx",
    required: ["MissionLifecyclePanel", "presentation.actionLabel", "interne WFXP"],
    blocked: ["function reviewStatusLabel"],
  },
  {
    path: "app/missionen/abenteuer/page.tsx",
    required: ["getMissionStatusPresentation", "missionKind: \"adventure\"", "ADVENTURE_LIFECYCLE_STEPS", "Serverstatus aktualisieren"],
    blocked: ["function reviewLabel"],
  },
  {
    path: "app/missionen/history/page.tsx",
    required: ["fetchMissionHistory", "Server-Read", "Serververlauf aktualisieren", "Keine bestätigte Reward-WFXP-Buchung"],
    blocked: ["onSnapshot", "collection(db, \"history\")", "readClientMissionHistory", "subscribeClientMissionHistory", "client_beta_projection"],
  },
  {
    path: "lib/beta1/clientMissionHistory.ts",
    required: ["getMissionHistory", "progressAuthority !== \"server-read\"", "writesPerformed !== false", "recordIdentifiersIncluded !== false"],
    blocked: ["localStorage", "onSnapshot", "collection("],
  },
  {
    path: "functions/lib/beta1MissionHistory.js",
    required: ["getMissionHistory", "writesPerformed: false", "rawEvidenceIncluded: false", "recordIdentifiersIncluded: false", "server-inconsistent"],
    blocked: ["writeAudit", "runTransaction(", "transaction.set(", "transaction.update(", "transaction.delete(", "FieldValue.serverTimestamp", ".add("],
  },
];

function collect(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Mission quality target fehlt: ${relativePath}`);
  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return SOURCE_EXTENSIONS.has(path.extname(absolutePath)) ? [relativePath] : [];
  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(relativePath, entry.name);
    return entry.isDirectory() ? collect(child) : SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [child] : [];
  });
}

const files = [...new Set(TARGETS.flatMap(collect))].sort();
const failures = [];
for (const relativePath of files) {
  const content = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  for (const blocked of BLOCKED_PATTERNS) {
    blocked.pattern.lastIndex = 0;
    if (blocked.pattern.test(content)) failures.push(`${relativePath}: veraltete Regionsautorität '${blocked.label}'`);
  }
}

for (const contract of ADOPTION_CONTRACTS) {
  const content = fs.readFileSync(path.join(ROOT, contract.path), "utf8");
  for (const required of contract.required) {
    if (!content.includes(required)) failures.push(`${contract.path}: Lifecycle-Vertrag fehlt '${required}'`);
  }
  for (const blocked of contract.blocked) {
    if (content.includes(blocked)) failures.push(`${contract.path}: parallele oder unsichere Projektion ist nicht erlaubt '${blocked}'`);
  }
}

if (failures.length > 0) {
  console.error("Mission language validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

const lifecycleSource = fs.readFileSync(path.join(ROOT, "lib/beta1/missionStatusPresentation.mjs"), "utf8");
for (const required of [
  "Start",
  "Zugang",
  "Bestätigung",
  "Review",
  "WFXP",
  "Serverprojektion nicht verfügbar",
  "Bestehender Vorgang",
  "Challenge-Ort bereit",
  "Abenteuerzugang aktiv",
]) {
  if (!lifecycleSource.includes(required)) {
    throw new Error(`Kanonische Missionskommunikation fehlt: ${required}`);
  }
}

console.log(`Mission language validation erfolgreich (${files.length} Dateien geprüft).`);
