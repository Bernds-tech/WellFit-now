# WellFit Product Readiness Matrix

Status: aktiv / maschinenlesbare Produktbereitschafts-Matrix  
Fuehrende maschinenlesbare Datei: `project-register/product-readiness.json`  
Validation: `node scripts/wellfit-dev-agent/src/product-readiness-check.mjs`  
Updated: 2026-05-15

## Zweck

Diese Matrix macht den aktuellen WellFit-Produktstatus fuer kuenftige Codex/AI-Agenten maschinenlesbar und review-faehig. Sie hilft Agenten, vorhandene Module weiterzufuehren, sichere naechste Aufgaben zu waehlen und keine parallele Architektur fuer App-Shell, Missionen, Buddy, Economy, AR, Feedback oder Governance anzulegen.

Die Datei ist **Dokumentation / Register / Validation-only**. Sie aendert keine Produktlogik und ist keine Freigabe fuer Token, NFT, Wallet, Payment, Betting, Reward-Authority, Health, Child, Location, Privacy oder Compliance-Implementierungen.

## Fuehrende Dateien

- `project-register/product-readiness.json` ist die maschinenlesbare Source of Truth fuer Modulstatus, Risiko, fuehrende Dateien, Blocker, naechste sichere Tasks, Duplicate-Warnungen, Pruefungen und Human-Approval.
- `scripts/wellfit-dev-agent/src/product-readiness-check.mjs` validiert die Matrix.
- `scripts/wellfit-dev-agent/src/quality-gate.mjs` fuehrt die Validierung im Agent Quality Gate mit aus.
- `todolist/WORK_MAP.md` und `todolist/TODO_INDEX.md` verlinken die Matrix fuer Agenten-Navigation.
- Governance-/Inventory-/Autopilot-Register wie `project-register/repository-inventory.json`, `project-register/cross-reference-maintenance.json`, Batch-Autopilot-, Auto-Merge-/Auto-Repair-Policies sowie `project-register/progress-log.json` und `project-register/agent-work-log.json` liefern Evidenz fuer das Modul `agent_governance`, ohne Runtime-Produktcode freizugeben.

## Status-Skala

| Status | Bedeutung |
|---|---|
| `not_started` | Kein relevanter Repo-Start und kein belastbarer Arbeitsplan. |
| `concept_only` | Nur Konzept-/Quellenlage; keine Implementierung ausdenken. |
| `planned` | In Registern/Dokumentation geplant, aber nicht beta-belastbar umgesetzt. |
| `prototype` | Preview/Prototyp existiert; nur guardrail-konforme Weiterarbeit. |
| `active_beta` | Nutzbarer Beta-Bestand existiert; kleine sichere Iterationen moeglich. |
| `blocked` | Arbeit stoppen, bis der dokumentierte Blocker geloest ist. |
| `review_required` | Human/Product/Legal/Security Review vor materieller Umsetzung erforderlich. |
| `production_ready` | Nur mit expliziter Freigabe und Evidenz; kritische/sensitive Bereiche duerfen nicht automatisch hier landen. |

## Pflichtmodule

Die Matrix enthaelt mindestens diese Module:

- Landing / public website
- Registration / login
- Dashboard
- Missionen
- Tagesmissionen
- Wochenmissionen
- Abenteuer
- Wettkaempfe / PvP
- Buddy / KI buddy
- Mobile web
- Mobile AR fallback
- Unity / WellFitBuddyAR
- Economy preview / internal points
- Points shop
- Marketplace
- Leaderboard
- Analytics
- User feedback
- Firebase / backend / Firestore
- Legal / privacy / compliance
- Agent governance

## Sicherheitsregeln fuer Agenten

1. Vor Planung oder Umsetzung immer `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, die relevanten `project-register/*.json`-Dateien und diese Matrix lesen.
2. Bestehende fuehrende Dateien verwenden. Keine zweite App-Shell, Mission Engine, Reward Ledger, Economy Model, Buddy-KI Provider Layer, AR Authority Bridge, Feedback Pipeline oder Agent Governance anlegen.
3. Unity / `native/unity/WellFitBuddyAR` und PR #13 bleiben blockiert bzw. review-required, bis der Repository Owner explizit anderes sagt.
4. Token, NFT, Wallet, Payment, Presale, Trading, Staking, Payout, Betting, PvP-Stakes, finaler Reward Authority, Health, Child, Location, Camera, Privacy und Compliance sind geschuetzte Bereiche und brauchen Human Approval.
5. Internal points/XP und Economy-Preview duerfen Beta-UX simulieren, aber keine finale Ledger-/Reward-Autoritaet aktivieren.

## Research-Fallback-Regel

Wenn ein Agent aus internen Quellen keine sichere Implementierung ableiten kann, darf er **nicht raten** und darf nicht direkt implementieren.

Wenn Internetzugang explizit verfuegbar ist, darf der Agent externe Optionen recherchieren. Danach muss er vor jeder Implementierung:

1. **Drei Optionen** knapp zusammenfassen.
2. **Eine Option empfehlen** und die Gruende nennen.
3. Die Entscheidung als **human-review-required** markieren.
4. Auf Human Approval warten, wenn die Entscheidung sensible Bereiche oder Architektur betrifft.

Ohne diese Review-Markierung darf keine externe Recherche automatisch in Produktlogik, Compliance-Text, Economy, Health, Child, Location, AR, PvP oder Backend Authority umgesetzt werden.

## Validation

Direkt ausfuehrbar:

```bash
node scripts/wellfit-dev-agent/src/product-readiness-check.mjs
jq empty project-register/product-readiness.json
npm run agent:quality-gate
```

Die Validierung prueft insbesondere:

- `project-register/product-readiness.json` existiert und ist valides JSON.
- Alle Pflichtmodule existieren.
- Jedes Modul hat Status, Risiko-Level, fuehrende Dateien, naechste sichere Aufgabe und erforderliche Checks.
- Kein kritisches Modul ist `production_ready`.
- Unity / PR #13 bleibt `blocked` oder `review_required`.
- Token-/Wallet-/Payment-/Reward-Authority-nahe Bereiche sind nicht `production_ready`.

## Pflege-Regeln

- Status nur mit Evidenz, Checks und passenden Register-/Dokumentationsupdates anheben.
- Kritische oder compliance-sensitive Statuswechsel immer Human Approval dokumentieren.
- Wenn neue Produktmodule entstehen, zuerst pruefen, ob sie in bestehenden Bereichen abgebildet werden koennen.
- Neue Module nur anlegen, wenn sie nicht duplicate architecture sind und in `project-register/product-readiness.json`, `todolist/WORK_MAP.md` und `todolist/TODO_INDEX.md` referenziert werden.

## KI-Fortsetzungs-Prompt

Lies `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/product-readiness.json` und diese Datei, bevor du Modulstatus oder sichere Folgeaufgaben aenderst. Aktualisiere keine Produktlogik aus der Matrix heraus. Wenn ein Status, Risiko, Blocker oder Check geaendert wird, synchronisiere `project-register/product-readiness.json`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/agent-task-queue.json`, `project-register/agent-workflows.json` und fuehre `node scripts/wellfit-dev-agent/src/product-readiness-check.mjs` sowie `npm run agent:quality-gate` aus. Bei unklarer interner Quellenlage nicht raten; maximal drei externe Optionen recherchieren, eine empfehlen und die Entscheidung vor Umsetzung als `human-review-required` markieren.
