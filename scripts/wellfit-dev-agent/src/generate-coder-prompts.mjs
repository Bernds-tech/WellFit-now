#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AGENT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent");
const CONFIG_PATH = path.join(AGENT_DIR, "wellfit-agent.config.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function renderIdentityGate(config) {
  const coders = config.coderAssignment?.coders ?? [];
  const coderList = coders.map((coder) => `- ${coder.displayName}: ${coder.role}`).join("\n");

  return `# WellFit Agent Identity Gate

${config.identityGate?.requiredQuestion ?? "Bist du Coder 1, Coder 2 oder Coder 3?"}

## Warum diese Abfrage Pflicht ist

Der Agent weist Aufgaben nur zu, wenn klar ist, wer weiterarbeitet. Dadurch werden parallele Arbeiten getrennt und Backend-/AR-/Website-Aufgaben nicht vermischt.

## Gültige Rollen

${coderList}

## Regel

\`\`\`txt
Wenn die Antwort nicht exakt Coder 1, Coder 2 oder Coder 3 ist:
${config.identityGate?.unknownIdentityMessage ?? "Bitte zuerst Rolle nennen."}
\`\`\`

## Danach

Nach Identifikation wird ausschließlich der passende Prompt geladen:

\`\`\`txt
Coder 1 -> scripts/wellfit-dev-agent/output/coder-prompts/coder1.md
Coder 2 -> scripts/wellfit-dev-agent/output/coder-prompts/coder2.md
Coder 3 -> scripts/wellfit-dev-agent/output/coder-prompts/coder3.md
\`\`\`
`;
}

function renderCoderPrompt(config, coder) {
  const sourceFiles = config.sourceOfTruth.join("\n");
  const topicFiles = Object.entries(config.topicFiles ?? {})
    .map(([topic, files]) => `### ${topic}\n${files.map((file) => `- ${file}`).join("\n")}`)
    .join("\n\n");

  return `# WellFit Execution Prompt – ${coder.displayName}

Du bist ${coder.displayName}.

Rolle:

\`\`\`txt
${coder.role}
\`\`\`

## Pflicht vor jeder Arbeit

Bestätige zuerst exakt:

\`\`\`txt
Ich bin ${coder.displayName}.
\`\`\`

Wenn du nicht ${coder.displayName} bist, nicht weiterarbeiten. Fordere stattdessen die korrekte Rollenangabe an.

## Source of Truth zuerst lesen

\`\`\`txt
${sourceFiles}
\`\`\`

## Themenbezogene Dateien

${topicFiles}

## Alpha-Scope-Regel

Bei jeder Aufgabe zuerst prüfen:

\`\`\`txt
Hilft das direkt zur testbaren Alpha?
\`\`\`

Wenn nein: als Backlog markieren, nicht priorisieren.

## Deine Schwerpunktbereiche

\`\`\`txt
${(coder.focusKeywords ?? []).join(", ")}
\`\`\`

## Bereiche, die du vermeiden sollst

\`\`\`txt
${(coder.avoidKeywords ?? []).join(", ")}
\`\`\`

## Harte WellFit-Grenzen

\`\`\`txt
- Keine Production Deployments.
- Keine Secrets/API Keys ins Frontend.
- Keine Mobile Token-/NFT-/Trading-/Presale-Funktionen.
- Keine medizinischen Diagnosen.
- Keine harte Scham-/Drucksprache.
- Keine clientseitige Autorität für Punkte, XP, Rewards, Mission Completion, Jackpot, Burn, Leaderboards oder Anti-Cheat.
- Backend-/Reward-/Completion-/Firestore-Rules-Themen nur mit Review und Tests.
- Bestehende Arbeit anderer Coder nicht überschreiben.
\`\`\`

## Arbeitsweise

\`\`\`txt
1. Rolle bestätigen.
2. Source of Truth lesen.
3. Passende ToDo-/Architekturdateien lesen.
4. Aktuellen Alpha-Fokus prüfen.
5. Betroffene Dateien nennen.
6. 1–4 kleine Micro-Tasks planen.
7. Nur im eigenen Bereich arbeiten.
8. Risiken und Tests nennen.
\`\`\`

## Antwortformat

\`\`\`txt
${coder.displayName}
Aktueller Fokus:
Gelesene Dateien:
Geplante Micro-Tasks:
Betroffene Dateien:
Risiken / Review-Pflicht:
Umsetzung oder nächster sicherer Schritt:
Build-/Test-Hinweise:
\`\`\`
`;
}

function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Missing config: ${CONFIG_PATH}`);
  }

  const config = readJson(CONFIG_PATH);
  const outputRoot = path.join(ROOT, config.coderPromptOutputDir ?? "scripts/wellfit-dev-agent/output/coder-prompts");
  ensureDir(outputRoot);

  const identityGatePath = path.join(outputRoot, "IDENTITY_GATE.md");
  fs.writeFileSync(identityGatePath, renderIdentityGate(config), "utf8");

  for (const coder of config.coderAssignment?.coders ?? []) {
    fs.writeFileSync(path.join(outputRoot, `${coder.id}.md`), renderCoderPrompt(config, coder), "utf8");
  }

  console.log(`Generated identity gate and coder prompts in ${path.relative(ROOT, outputRoot)}`);
}

main();
