# WellFit Stufe 4 - Autonomous Development Workflow

Status: aktiv / verbindlich fuer autonome Codex- und KI-Agenten  
Scope: Governance-, Planungs-, Dokumentations-, PR- und Preview-Prozess fuer WellFit-Stufe-4-Arbeit  
Fuehrende Registerdatei: `project-register/agent-workflows.json`

## Ziel

Dieser Workflow codifiziert den dauerhaften WellFit-Stufe-4-Ablauf:

```txt
Ziel verstehen -> Konzept pruefen -> Struktur ableiten -> Seiten erfassen -> Aufgaben erstellen -> Code bauen -> automatisch testen -> Fehler beheben -> Dokumentation aktualisieren -> Preview liefern -> Nutzerfeedback auswerten -> weiter optimieren
```

Er verhindert doppelte Architektur, parallele Systeme und unkontrollierte Produktlogik-Aenderungen. Er ergaenzt `agents/modes/stufe-4.md` als detaillierter, phasenbasierter Arbeitsstandard.

## Autonomiegrenze und Stufe-4-Teilmodi

`Stufe 4` ist kein pauschaler End-to-End-Autonomieauftrag. Jede Ausfuehrung muss vorab einer der folgenden Teilstufen zugeordnet werden. Die jeweils genannte Policy-Datei im `project-register/` ist vor Planung und Umsetzung verbindlich zu pruefen.

| Teilstufe | Bedeutung | Zustaendige Policy-Datei | Erlaubter Zielzustand | Harte Grenze |
| --- | --- | --- | --- | --- |
| `Stufe 4A` | Autonome Analyse und Task-Erstellung | `project-register/agent-autopilot.json` | Analyse, Risikoklasse, betroffene Dateien/Register, Definition-of-Done und naechster sicherer Task als Report | Keine Datei-Aenderungen durch den Dry-Run, kein PR-Zwang, kein Merge/Deploy |
| `Stufe 4B` | Autonome Docs-/Register-Aenderungen mit PR | `project-register/agent-workflows.json` | Kleine Governance-, Dokumentations-, Register- oder Report-only-Script-Aenderung mit Commit, PR und Handoff | Keine Runtime-Produktlogik, keine geschuetzten Bereiche, kein Merge/Deploy |
| `Stufe 4C` | Begrenzte Runtime-Aenderungen mit Allowlist | `project-register/approved-agent-build-runner-policy.json` | Nur vorab erlaubte, niedrig-riskante Runtime-Dateien aus einer expliziten Allowlist und mit passenden Checks | Keine nicht erlaubten Dateien, keine Schutzthemen, keine Reward-/Ledger-/Health-/Privacy-/Payment-Autoritaet |
| `Stufe 4D` | Sichere Auto-Reparaturen | `project-register/auto-repair-policy.json` | Eng begrenzte Reparatur eines validierten Fehlers, sofern Policy und Scope dies zulassen | Keine breiten Refactors, keine Testentfernung, keine Runtime-/Schutzbereichs-Ausweitung |
| `Stufe 4E` | Merge-Empfehlung | `project-register/auto-merge-policy.json` | Report-only Bewertung, ob ein PR fuer menschliche Merge-Pruefung geeignet wirkt | Keine automatische Freigabe, kein Merge, keine Branch- oder Repo-Settings-Aenderung |
| `Stufe 4F` | Auto-Merge, derzeit deaktiviert | `project-register/auto-merge-policy.json` | Kein aktiver Zielzustand; nur dokumentierte Deaktivierung und Stop fuer menschliche Freigabe | Auto-Merge ist deaktiviert und darf nicht ausgefuehrt oder durch andere Stufen implizit aktiviert werden |

Codex/KI-Agenten duerfen ohne ausdrueckliche menschliche Freigabe niemals:

- nach `main` mergen,
- live oder production deployen,
- PR #13 beruehren, mergen oder schliessen,
- Unity-Dateien unter `native/unity/WellFitBuddyAR` aendern,
- Produktlogik fuer Token, NFT, Wallet, Payment, Reward Authority, Health, Child Safety, Location, Privacy oder Compliance veraendern.

## Pflicht: Erste Dateien vor jeder Stufe-4-Arbeit lesen

Vor jeder Stufe-4-Umsetzung muessen mindestens diese Dateien gelesen werden:

- `AGENTS.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`
- `todolist/NEXT_ACTIONS.md`
- `project-register/routes.json`
- `project-register/apis.json`
- `project-register/features.json`

Je nach Arbeitsbereich sind zusaetzlich passende Dateien aus `agents/`, `project-register/`, `todolist/` und `docs/architecture/` zu lesen.

## Anti-Doppelarbeit-Regel

Wenn ein Feature, Thema, API-, Routen- oder Architekturthema bereits in `todolist/WORK_MAP.md` oder in den Projektregisterdateien existiert, muss dort weitergearbeitet und referenziert werden. Es darf keine parallele Implementierung, kein zweites Register und keine konkurrierende Architekturdatei erstellt werden.

Neue Aufgaben oder Registereintraege sind nur erlaubt, wenn nach Pruefung der bestehenden Work Map und Register keine passende fuehrende Stelle existiert.

## Pflichtchecks vor PR

Vor einem Pull Request muessen diese Checks ausgefuehrt oder mit konkretem Blocker dokumentiert werden:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm --prefix functions run check
npm run agent:quality-gate
```

Fehlschlaege duerfen nicht versteckt werden. Jeder Fehlschlag muss im PR und Abschlussbericht mit Ursache, Risikoeinschaetzung und naechstem Schritt genannt werden.

## Phasen

### 1. `understand_goal`

- **Purpose:** Ziel, Scope, Nicht-Ziele, Sicherheitsgrenzen und erwartetes Ergebnis eindeutig verstehen.
- **Required input files:** `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/NEXT_ACTIONS.md`, Nutzerauftrag.
- **Allowed actions:** Auftrag zusammenfassen, betroffene Produktbereiche markieren, branch-/statusrelevante Fakten pruefen, offene Rueckfragen als Risiko notieren.
- **Forbidden actions:** Code aendern, Produktlogik aendern, neue Architektur anlegen, ohne Branch auf `main` arbeiten.
- **Required output:** Kurzer Ziel- und Scope-Vermerk in Plan/PR/Report; klare Liste der erlaubten und ausgeschlossenen Arbeiten.
- **Risk gates:** Stoppen oder dokumentieren, wenn der Auftrag Compliance-, Reward-, Payment-, Token-, Health-, Child-, Location- oder Privacy-Logik veraendern wuerde.

### 2. `check_concepts`

- **Purpose:** Bestehende Konzepte, Work Map, TODOs und Register gegen Doppelarbeit pruefen.
- **Required input files:** `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/features.json`, `project-register/product-rules.json`, relevante `docs/architecture/*`.
- **Allowed actions:** Fuehrende Dateien identifizieren, passende bestehende Aufgaben/Features zuordnen, Risiken und Abhaengigkeiten notieren.
- **Forbidden actions:** Neue Konzepte neben bestehenden fuehrenden Dateien anlegen, veraltete Dateien loeschen, historische Entscheidungen ueberschreiben.
- **Required output:** Referenz auf die fuehrende Datei oder bewusste Entscheidung, warum ein neuer Eintrag notwendig ist.
- **Risk gates:** Kein Weiterbau, wenn ein bestehendes Konzept widerspricht oder eine menschliche Entscheidung fehlt.

### 3. `derive_structure`

- **Purpose:** Aus dem Ziel die vorhandene WellFit-Struktur, Modulgrenzen und betroffene Register ableiten.
- **Required input files:** `todolist/PROJECT_STRUCTURE.md`, `todolist/CODEBASE_FEATURE_MAP.md`, `project-register/cross-references.json`, `project-register/decisions.json`.
- **Allowed actions:** Vorhandene Ordner, Module, Register und TODO-Verweise kartieren; Aenderungsumfang minimal halten.
- **Forbidden actions:** Parallelmodule, zweite Design-Systeme, neue Shells, konkurrierende Datenmodelle oder redundante Register erstellen.
- **Required output:** Strukturentscheidung mit betroffenen Dateien/Registern und bewusst ausgeschlossenen Bereichen.
- **Risk gates:** Stoppen, wenn eine Aenderung Unity, PR #13, Compliance-kritische Logik oder nicht freigegebene Produktbereiche beruehren wuerde.

### 4. `inspect_existing_pages_routes_apis`

- **Purpose:** Alle betroffenen Seiten, Nebenseiten, Routen, APIs und Features erfassen, bevor gebaut wird.
- **Required input files:** `project-register/routes.json`, `project-register/pages.json`, `project-register/apis.json`, `project-register/features.json`, vorhandene App-/API-Routen.
- **Allowed actions:** Routen/API-Inventar lesen, betroffene Seiten/API-Bereiche im Plan nennen, bei UI-Arbeit Nebenseiten-Crawl oder Audit planen.
- **Forbidden actions:** Neue Routen oder APIs ohne Registereintrag und Sicherheitsreview anlegen; vorhandene Routen ignorieren.
- **Required output:** Betroffene Routen, APIs und Features im Aufgabenplan und PR-Report.
- **Risk gates:** API-Aenderungen erfordern Sicherheitsreview; Economy-/Reward-APIs duerfen keine finale Autoritaet aktivieren.

### 5. `create_task_plan`

- **Purpose:** Kleine, reviewbare Aufgaben aus Struktur und Risiken ableiten.
- **Required input files:** `todolist/NEXT_ACTIONS.md`, `project-register/todos.json`, `project-register/progress-log.json`, relevante Work-Map-Eintraege.
- **Allowed actions:** Bestehende Aufgaben weiterfuehren, neue Aufgaben nur bei fehlendem bestehendem Eintrag dokumentieren, Reihenfolge und Checks planen.
- **Forbidden actions:** Ungeprueft neue TODO-Dateien anlegen, grosse unscharfe Arbeitspakete starten, Safety-Gates ueberspringen.
- **Required output:** Aktualisierter Arbeitsplan mit Status, Testplan und Dokumentationspflicht.
- **Risk gates:** Kein Implementierungsschritt ohne definierte Tests/Checks und ohne Abgrenzung zu verbotenen Bereichen.

### 6. `implement_code`

- **Purpose:** Falls der Auftrag Codearbeit umfasst, die kleinste passende Aenderung in der bestehenden Architektur bauen.
- **Required input files:** Betroffene Quell-/Konfigurationsdateien, relevante Next.js-Dokumentation bei Next.js-API/Routing/Rendering/Build-Aenderungen, Work Map und Register.
- **Allowed actions:** Bestehende Module erweitern, gezielte Fixes umsetzen, Tests/Typen mitpflegen, Registereintraege vorbereiten.
- **Forbidden actions:** Produktlogik ausserhalb Scope aendern; Token/NFT/Wallet/Payment/Reward-Authority/Health/Child/Location/Privacy/Compliance-Logik aendern; Unity-Dateien beruehren; parallele Systeme bauen.
- **Required output:** Minimaler Diff mit klarer Zuordnung zu bestehendem Feature/Route/API.
- **Risk gates:** Sofort stoppen, wenn die Aenderung finale Reward-/Ledger-Autoritaet, echte Kaeufe, Secrets oder Live-Integrationen aktivieren wuerde.

### 7. `run_automatic_checks`

- **Purpose:** Automatisch pruefen, ob die Aenderung lint-, type-, build-, functions- und quality-gate-konform ist.
- **Required input files:** `package.json`, `functions/package.json`, `scripts/wellfit-dev-agent/*`, betroffene Test-/Config-Dateien.
- **Allowed actions:** Pflichtchecks ausfuehren, Ausgaben auswerten, Umgebungslimits dokumentieren.
- **Forbidden actions:** Fehlschlaege verschweigen, Tests entfernen, Checks ohne Begruendung ueberspringen.
- **Required output:** Checkliste mit Ergebnis fuer `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm --prefix functions run check`, `npm run agent:quality-gate`.
- **Risk gates:** PR darf Fehlschlaege enthalten, aber nur mit transparenter Ursache, Risiko und naechstem Fix-Schritt.

### 8. `fix_errors`

- **Purpose:** Gefundene Fehler analysieren, gezielt beheben und Checks wiederholen.
- **Required input files:** Check-Ausgaben, betroffene Dateien, `agents/failure-recovery-rules.md`.
- **Allowed actions:** Ursachenanalyse, minimaler Fix, erneuter Check, Blocker-Dokumentation.
- **Forbidden actions:** Fehler durch Entfernen wichtiger Tests/Regeln kaschieren, unzusammenhaengende Refactors starten, Safety-Regeln aufweichen.
- **Required output:** Behobene Fehler oder dokumentierter Blocker mit Ursache, betroffenen Dateien und naechstem Schritt.
- **Risk gates:** Bei widerspruechlichen Anforderungen oder fehlender menschlicher Entscheidung Blocker statt spekulativem Fix dokumentieren.

### 9. `update_documentation_and_registers`

- **Purpose:** Dokumentation und maschinenlesbare Register konsistent mit der Arbeit halten.
- **Required input files:** `todolist/TODO_INDEX.md`, `todolist/WORK_MAP.md`, `project-register/*.json`, relevante `docs/architecture/*`.
- **Allowed actions:** Relevante Register aktualisieren, Cross-References setzen, Progress Log/TODOs ergaenzen, neue Workflow-Dateien indexieren.
- **Forbidden actions:** Historische TODOs loeschen, fuehrende Dateien ohne Grund ersetzen, doppelte Architektur schaffen.
- **Required output:** Aktualisierte Dokumentation/Register oder bewusste Notiz, warum keine Aktualisierung noetig ist.
- **Risk gates:** Bei Governance-Aenderungen muessen Human-readable und machine-readable Quellen zusammenpassen.

### 10. `deliver_pr_and_preview_notes`

- **Purpose:** Reviewfaehigen PR mit Preview-/Testhinweisen liefern.
- **Required input files:** Git-Diff, Check-Ergebnisse, betroffene Register/Routen/APIs/Features, PR-Template falls vorhanden.
- **Allowed actions:** Commit erstellen, PR-Text mit Summary/Checks/Risiken/Next Task verfassen, Preview-Hinweise nennen.
- **Forbidden actions:** Main-Merge, Live-Deploy, versteckte Fehlschlaege, unklare Risiken, ungepruefte Behauptungen.
- **Required output:** Pull Request mit Ziel, geaenderten Dateien, Checks, Risiken, Preview-Hinweisen und naechstem empfohlenem Task.
- **Risk gates:** Kein Abschluss, wenn Commit ohne PR oder PR ohne Commit entsteht; kein Livegang ohne menschliche Freigabe.

### 11. `evaluate_user_feedback_if_available`

- **Purpose:** Vorliegendes Nutzerfeedback nach PR/Preview auswerten und in bestehende Aufgaben ueberfuehren.
- **Required input files:** Nutzerfeedback, `project-register/feedback-analytics-loop.json`, `project-register/todos.json`, relevante Feature-/Routenregister.
- **Allowed actions:** Feedback clustern, bestehende Aufgaben aktualisieren, neue Aufgaben nur bei fehlendem bestehendem Eintrag anlegen.
- **Forbidden actions:** Feedback als sofortige Produktfreigabe interpretieren, Safety-Gates ueberspringen, parallele Features starten.
- **Required output:** Feedback-Auswertung mit verknuepften bestehenden Aufgaben oder begruendetem neuen Registereintrag.
- **Risk gates:** Compliance- oder Safety-relevantes Feedback braucht menschliche Entscheidung vor Umsetzung.

### 12. `optimize_next_iteration`

- **Purpose:** Naechste kleine Iteration vorbereiten, ohne den aktuellen PR zu ueberladen.
- **Required input files:** PR-Ergebnis, Check-Ergebnisse, `todolist/NEXT_ACTIONS.md`, `project-register/progress-log.json`, `project-register/todos.json`.
- **Allowed actions:** Naechsten empfohlenen Task dokumentieren, Risiken/Blocker uebergeben, Folgearbeit in bestehende Register einsortieren.
- **Forbidden actions:** Scope creep im aktuellen PR, weitere Featurearbeit nach Abschluss ohne neuen Auftrag, Live-Deploy ohne Freigabe.
- **Required output:** Konkrete naechste Empfehlung und sauberer Handoff fuer den naechsten Agentenlauf.
- **Risk gates:** Keine weitere Iteration, wenn Tests/Build rot sind und kein dokumentierter Blocker/Plan existiert.

## Abschlussbericht-Pflicht

Jeder Stufe-4-Abschluss nennt:

- Branch-Name,
- geaenderte Dateien,
- gelesene fuehrende Dateien,
- Checks mit Ergebnis,
- bekannte Risiken/Blocker,
- ob Dependencies installiert wurden,
- Preview-/PR-Hinweise,
- naechste empfohlene Aufgabe.
