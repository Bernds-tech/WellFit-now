# WellFit Master Roadmap Import

Status: aktiv / Registry-Import  
Stand: 2026-05-14  
Fuehrende Dateien: `project-register/master-roadmap-tasks.json`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/internal-sources.json`, `project-register/product-readiness.json`, `project-register/agent-task-queue.json`

## Zweck

Diese Datei dokumentiert, wie die vom Nutzer bereitgestellte **WellFit Master Roadmap / Developer To-Do List** in die bestehenden WellFit-Agentenquellen importiert wurde. Der Import ist absichtlich **registry- und dokumentationsbasiert**. Er ersetzt nicht `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md` oder bestehende Architekturdateien.

## Import-Prinzip

- Die Roadmap wurde als historische und fortzufuehrende Quelle behandelt, nicht als neue Architektur-Autoritaet.
- Bestehende fuehrende Dateien bleiben fuehrend; der Import verlinkt auf sie.
- Bereits vorhandene Themen wurden in `project-register/master-roadmap-tasks.json` auf bestehende Work-Map-Themen und Product-Readiness-Module gemappt.
- Konflikt- oder Schutzbereiche wurden als `historicalOrReviewRequired`, `humanApprovalRequired` oder high/critical risk markiert.
- Runtime-Produktlogik, Unity-Dateien und Compliance-/Reward-/Health-/Privacy-/Token-Bereiche wurden nicht geaendert.

## Maschinenlesbare Registry

Die zentrale Importdatei ist:

- `project-register/master-roadmap-tasks.json`

Sie enthaelt:

- Version, Aktualisierungsdatum, Zweck und Quelllabel.
- Statusmarker-Legende fuer `[ ]`, `[x]`, `[~]`, `[!]`, `[>]`.
- Phasen und Task-Gruppen aus der Master Roadmap.
- Pro Task: Titel, Status, Phase, Topic, bereits erledigte Punkte, offene Punkte, Blocker, fuehrende Dateien, unterstuetzende Dateien, Work-Map-Mapping, Product-Readiness-Mapping, Risiko, Do-not-duplicate-Hinweise, naechster sicherer Arbeitsort, Human-Approval-Flag und Safe-Auto-Work-Flag.

## Schutz- und Review-Regeln

Folgende importierte Themen duerfen nicht als automatische sichere Produktarbeit behandelt werden:

- Token, NFT, Wallet, Payment, Purchase, Payout, Trading, Marketplace-Settlement, Staking oder Presale.
- Reward Authority, finale Mission Completion, finale Ledger-Writes, Anti-Cheat oder Rare-Item-Grants.
- Health, Watch, Child-Safety, Location, Camera, Face/Biometric oder Privacy/Consent.
- Unity / WellFitBuddyAR / PR #13.
- Legal, AGB, Datenschutz, Impressum oder Compliance-Claims.

Diese Bereiche sind in der Registry high/critical oder review-required markiert und verlangen menschliche Freigabe, bevor Runtime-Logik geaendert wird.

## Validierung

Der Import wird durch folgenden Check validiert:

- `scripts/wellfit-dev-agent/src/master-roadmap-task-check.mjs`

Der Check prueft:

- JSON-Parsing der Master-Roadmap-Registry.
- Erlaubte Statusmarker.
- Pflichtfelder je Task.
- Human Approval fuer high/critical risk.
- Kein `safeAutoWork=true` fuer Token/Wallet/Payment/Reward-Authority/Health/Child/Location/Privacy/Unity-Themen.
- Work-Map-Mapping oder `historicalOrReviewRequired=true` fuer jeden Task.
- PASS/FAIL/WARNING-Ausgabe fuer Agenten und Quality Gate.

Der Check ist in `scripts/wellfit-dev-agent/src/quality-gate.mjs` eingebunden.

## Sichere naechste Aufgaben aus dem Import

1. Registry-only Pflege: Roadmap-Tasks nach zukuenftigen PRs aktualisieren und mit Work Map/Product Readiness abgleichen.
2. Dokumentations-only Economy Guardrails: Caps, Audit-Events und EconomyHealthScore weiter in bestehenden Architekturdateien beschreiben, ohne finale Ledger-Writes zu aktivieren.
3. Planning-only Unity/AR Inventory: Roadmap-/Micro-Task-Kontext ausserhalb von `native/unity/WellFitBuddyAR` dokumentieren, ohne Unity-Dateien oder PR #13 zu beruehren.

## Nicht-Ziele

- Keine neue Roadmap-Architektur.
- Kein zweites TODO-System.
- Keine Runtime-Produktlogik.
- Keine Unity-Aenderungen.
- Keine Compliance-, Token-, Wallet-, Payment-, Health-, Child-, Location-, Privacy- oder Reward-Authority-Implementierung.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md` und `project-register/master-roadmap-tasks.json`. Nutze die Master-Roadmap-Registry nur als Import- und Mapping-Register. Wenn ein Roadmap-Punkt bereits in Work Map, Product Readiness oder bestehenden Architekturdateien existiert, verlinke ihn statt ihn zu duplizieren. High-/Critical-/Unity-/Privacy-/Reward-/Token-/Payment-Themen nur dokumentieren oder als Review-required markieren, bis eine explizite menschliche Freigabe vorliegt.
