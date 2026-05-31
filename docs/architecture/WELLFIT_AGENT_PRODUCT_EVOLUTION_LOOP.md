# WELLFIT AGENT PRODUCT EVOLUTION LOOP

Status: planning_only  
Owner review: required before any implementation

## 1) Zweck
Der Product Evolution Loop erweitert den bestehenden WellFit-Agentenbetrieb: Agents sollen nicht nur offene Tasks abarbeiten, sondern nach Abschluss offener Arbeit kontrolliert neue Verbesserungsmoeglichkeiten identifizieren.

## 2) Grundprinzip
- Internal-first.
- Canonical Truth first.
- Research report-only.
- Admin approval required.
- No autonomous protected runtime.
- No dark patterns.
- No Beta-1 token/cashout/blockchain activation.

## 3) Loop
1. Intake
2. Internal analysis
3. Gap detection
4. Opportunity generation
5. External research (report-only)
6. Scoring
7. Admin approval
8. Task proposal
9. Worker queue
10. PR/runner
11. Evidence
12. Repeat

## 4) Agent Rollen
- Backlog Executor
- Concept Gap Analyzer
- Product Research Agent
- Behavioral Design Agent
- Safety/Compliance Critic
- Opportunity Scoring Agent
- Proposal-to-Task Agent

## 5) Stop Conditions
Stop und eskalieren, wenn mindestens einer dieser Punkte zutrifft:
- Canonical Truth conflict
- protected child/health/location/privacy/legal area betroffen
- token/payment/cashout/blockchain Aktivierung notwendig
- manipulative/addictive/dark pattern Mechanik als Ziel
- medizinischer Claim erforderlich
- no source / hallucinated research
- no admin approval

## 6) Governance Boundaries
- Keine Runtime-Produktlogik in diesem Loop-Plan.
- Keine Functions/Firestore-Rules-Aenderung.
- Kein Auto-Merge/Auto-Deploy.
- Externe Recherche bleibt optional und report-only.
- Umsetzung erst nach Owner/Admin-Entscheid und Task-Proposal->Worker-Queue Uebergabe.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md` und `todolist/NEXT_ACTIONS.md`.

Beta-1 Canonical Truth Pflicht:
- Vor Beta-1 Governance-Aenderungen immer `project-register/wellfit-beta1-canonical-truth.json`, `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md` und `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md` lesen.
- Die drei Canonical-Truth-Dateien sind owner-protected/read-only fuer Agenten.
- Keine Aenderung an owner-protected Canonical-Truth-Dateien ohne explizite Owner-Freigabe.
- Falls Aenderung noetig: nur Vorschlag in `todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md` dokumentieren.

Produktgrenzen:
- WFP = interne Punkte in Beta-1.
- XP = Avatar-Fortschritt.
- WFT/SUI/Blockchain/Token/NFT/Payment/Cashout sind nicht Beta-1 aktiv.
- Keine echte GitHub API, kein echtes Deploy, Runner bleibt metadata_only, Admin/Owner approval erforderlich.
\n- 2026-05-23: Admin-Center Status-Buckets + Timeline-Felder (approved/rejected/blocked/in_progress/completed) erweitert; kein Deploy, keine GitHub-API-Neuimplementierung, keine Canonical-Truth-Aenderung.

- 2026-05-23: Post-merge cycle logic finalized: cycleResult=merged => nextCycleRequired=true => restart at concept/businessplan/repo/canonical-truth/internal sources analysis. repair_required blocks new feature tasks until fixed or halted_waiting_owner.

## First-Run Cycle Rule Update (2026-05-23)
- Nach jedem erfolgreich gemergten Agent-Task gilt `nextCycleRequired = true`.
- Reihenfolge der naechsten Analyse: Konzept -> Businessplan -> Repo -> Canonical Truth -> Dossiers -> Missionsideen -> Wirtschaftskreislauf -> Product Radar -> Risiken -> offene Beta-Readiness.
- Bei `repair_required`: keine neuen Feature-Dossiers; nur Repair/Conflict/Governance-Cleanup; maximal 3 Versuche; danach `halted_waiting_owner`.

- 2026-05-23: Admin-Center-Datasource-Sync: first-run output (`generatedDossiers`, `suggestedTaskQueue`, `recommendedApprovals`, `recommendedResearchMore`, `blockedItems`) wird als review-pflichtige Inbox-Quelle eingebunden; Pending-Counts und Listen laufen ueber identische Bucket-Logik.
- 2026-05-23: Wenn lokale Registereintraege noch keine Firestore-Mirror targetId tragen, bleiben Admin-Action-Buttons disabled mit Hinweis auf Inbox-Sync (Follow-up: `runtime/admin-center-product-evolution-dossier-inbox-sync`).


- 2026-05-24: Admin-Center zeigt Dossier/Bericht-Overlay, differenzierte Missing-States und Button-Sperrgruende fuer Product-Evolution Inbox-Eintraege (kein Runner/Deploy, keine Canonical-Truth-Aenderung).

- 2026-05-24: Admin-Center UX-Fix: Filterkarten zeigen wieder deutsche Labels, Dossier-Overlay zeigt strukturierte Felder/Dossierauszug, Inbox-Mirror-Matching priorisiert deterministische Keys; kein Runner/Deploy/GitHub-API-Start.

- 2026-05-24: Inbox-Sync repariert: registerSnapshot wird priorisiert wenn Mirror leer ist; Sync liefert created/updated/skipped + klare 0-Items-Message; Overlay zeigt Dossierauszug/Fallback-Fehler statt nur Metadaten; kein Runner/Deploy.

- 2026-05-24: Snapshot-Shape-Diagnose/Fix: Client zeigt localFirstRunCandidateCount/Keys + Collection-Counts; Sync uebergibt registerSnapshot explizit; Server erkennt mehrere Snapshot-Shapes inkl. output/data/run/result und object-map/string listen. Erwartung: bei sichtbaren PE-IDs ist created+updated+skipped > 0. Kein Runner/Branch/PR/Merge/Deploy.

- 2026-05-24: Admin-Center Inbox-Sync Diagnose erweitert: `syncProductEvolutionFirstRunInbox` liefert jetzt callableVersion/responseShapeVersion/server-input-Debug in jeder Response und akzeptiert Snapshot-Wrapping (`registerSnapshot`, `data.registerSnapshot`, `payload.registerSnapshot`) fuer Live-Mismatch-Analyse. Kein Deploy in diesem PR.
- 2026-05-25: Admin-Center Sync-Debug root cause fix: `sanitizeAdminResult` behielt bei `accepted=false` bisher nur `{accepted,message}` und verwarf Callable-Diagnosefelder (z.B. callableVersion/responseShapeVersion/serverCandidateCount). Fix: Sync-Callable nutzt jetzt eine preserve-diagnostics Client-Pfadfunktion; Diagnosefelder bleiben auch bei `accepted=false` sichtbar. Kein Runner/Branch/PR/Merge/Deploy/Firebase-Deploy in diesem PR.

- 2026-05-25: Root cause im Admin-Center-Sync behoben: Anzeige-Counts und Sync-Payload nutzten zuvor nicht zwingend dieselbe Snapshot-Quelle. Neu: `effectiveFirstRunRegisterSnapshot` ist die einzige Sync-Quelle (`firstRunRegisterSnapshot || firstRunOutput || reconstructedFromArrays`), inkl. Blocker-Meldung bei fehlender syncfaehiger Payload und Debug-Feldern `clientVisibleCandidateCount` vs `clientSendingCandidateCount`. Kein Runner/Branch/PR/Merge/Deploy durch Agent; kein Functions-Deploy noetig fuer diesen Client-Fix. Nach Merge: Frontend deployen/abwarten und live verifizieren.
- Naechster Schritt nach erfolgreichem Sync: `runtime/admin-center-task-proposal-to-worker-queue`.

- 2026-05-27: Admin-Center-Sync-Bugfix dokumentiert: Ursache war registerSnapshot-Key mit undefined/nicht verwertbarem Wert trotz sichtbarer Client-Kandidaten. Fix: JSON-sichere Snapshot-Uebergabe, persistente Client-Sendedebugfelder nach Serverantwort, robustere Backend-Payload-Erkennung (inkl. firstRunOutput/data/payload Varianten) und neue Diagnosefelder (registerSnapshotFieldPresent/registerSnapshotValueType/clientHasRegisterSnapshot/clientRegisterSnapshotKeys). Kein Runner/Branch/PR/Merge/Deploy. Nach Merge bei Functions-Aenderung gezieltes Deploy: `firebase deploy --only functions:syncProductEvolutionFirstRunInbox --project wellfit-b7d27`; Frontend/Hosting-Deploy abwarten. Naechster Schritt: `runtime/admin-center-task-proposal-to-worker-queue`.

- 2026-05-27: Auth-Readiness-Fix im Admin-Center: Root cause war Callable-Aufruf mit `auth:MISSING`. Admin-Callables werden nun clientseitig geblockt bis Firebase Auth/User/Token-Claims bereit sind; sichere Debug-Felder (`adminCallableAuthReady`, `firebaseUserPresent`, `idTokenAvailable`, `tokenClaimsLoaded`, `agentRoleClaim`, `lastAuthGuardMessage`) ohne UID/E-Mail/Token. Kein Runner/Branch/PR/Merge/Deploy im PR. Functions-Deploy nur falls `functions/lib/agentAdminRolesAudit.js` geaendert wird; zusaetzlich Frontend/Hosting-Deploy abwarten. Naechster Schritt: `runtime/admin-center-task-proposal-to-worker-queue`.

- 2026-05-27 Admin-Center Auth-Fix (PR #260 follow-up): Firebase Admin-Login/Session-Flow (Google Popup), Auth-State/Claims-Readiness und Logout im Admin-Center ergänzt; Admin-Callables bleiben ohne User/Token/Claim server-authority-konform blockiert. Kein Runner/Branch/PR/Merge/Deploy im PR.

- 2026-05-28: Admin-Center Login-/Inbox-ID-Fix: Auth/Owner-Claim ist live funktionsfaehig (`agentRoleClaim=owner`, `adminCallableAuthReady=true`). Google Popup-Login erhaelt einen Redirect-Fallback inklusive `getRedirectResult`-Auswertung und privacy-sicheren Meldungen; Product-Evolution Inbox-Dokument-IDs werden slash-sicher/idempotent erzeugt, waehrend `sourceDossierId` unveraendert im Dokumentfeld erhalten bleibt. Kein Runner/Branch-PR-Merge/Deploy im PR. Nach Merge gezielt Functions-Deploy fuer `syncProductEvolutionFirstRunInbox` und anschliessend Frontend/Hosting-Deploy einplanen. Naechster Schritt nach erfolgreichem Sync: `runtime/admin-center-task-proposal-to-worker-queue`.

## Autopilot priority order update (2026-05-31)

The Safety Sentinel must sort future Autopilot and Product-Evolution work in this order before any worker/runner automation is considered:

1. P0/P1 safety blockers.
2. Auth/deploy/build/merge blockers.
3. Agent-pipeline blockers.
4. Beta-1 core functions.
5. Public-beta functions including AR and the AI buddy.
6. B2B fiat/economic-loop extensions.
7. SUI, Dynamic Assets, token, WFT, payment, and cashout work only later and only after explicit Owner plus Legal/Policy approval.

AR and the AI buddy are public-beta product areas. SUI/WFT/token/payment/cashout are not part of Beta-1 activation. P0/P1 reset-safety work must be recommended before a Product-Evolution restart or worker automation. Dossiers may prepare metadata-only build orders, but they must not start GitHub, runner, branch, PR, merge, or deploy automation.

## Builder serial queue and public-beta order (2026-05-31)

- Builder work packages are metadata-only in `agentBuilderWorkPackages` and must stay serial for `serialGroup=main_repo` with `maxConcurrentWorkPackages=1`.
- Approved dossiers may be converted into waiting work packages, but this does not start a runner, create a branch, create a PR, merge, deploy, or call GitHub APIs.
- AI buddy and AR are public-beta product areas and can be considered after P0/P1 safety, build/deploy, and pipeline blockers are handled.
- SUI, WFT, token, payment, cashout, wallet trading, NFT, Dynamic Assets, and blockchain activation are not part of Beta-1 activation. They remain future topics behind explicit Owner plus Legal/Policy gates.
- Agents and builders must order proposals accordingly: public-beta AR/AI-buddy before any later token/Dynamic-Assets work, and token/payment/blockchain proposals must remain blocked/deferred unless separately approved.
