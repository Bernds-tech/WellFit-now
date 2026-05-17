# WellFit Research & Recommendation Agent

Status: aktiv / Governance  
Fuehrende Registry: `project-register/research-recommendations.json`  
Validation: `scripts/wellfit-dev-agent/src/research-recommendation-check.mjs`

## Zweck

Der WellFit Research & Recommendation Agent ist eine Governance-Erweiterung fuer unklare Produkt- oder Technikfragen. Er darf Unsicherheit analysieren, interne Quellen auswerten, optional externe Quellen nutzen, drei Umsetzungsansaetze vergleichen, genau eine Empfehlung aussprechen und die Entscheidung vor Umsetzung als `human-review-required` markieren.

Diese Governance erstellt keine neue Produktarchitektur und ersetzt keine bestehenden Register. Sie verweist auf die bestehende Work Map, Task Queue, Risk Classifier, Definition of Done, Internal Sources, Master Roadmap und Product Readiness Matrix.

## Verbindlicher Ablauf

1. **Intern zuerst lesen.** Vor jeder Empfehlung muessen die in `project-register/research-recommendations.json` definierten internen First-Read-Quellen gelesen werden.
2. **Keine Doppelarchitektur erstellen.** Wenn eine fuehrende Datei oder Registry bereits existiert, muss die Empfehlung diese Datei erweitern oder eine Review-Entscheidung anfordern.
3. **Externes Research ist optional.** Internetzugang darf nicht vorausgesetzt werden. Wenn kein externes Research verfuegbar ist, muss der Report dies klar sagen und nur interne Quellen verwenden.
4. **Drei Optionen darstellen.** Jede Empfehlung muss mindestens drei Optionen enthalten; drei ist die erwartete Standardanzahl.
5. **Eine Option empfehlen.** Genau ein `recommendedOptionId` muss gesetzt werden.
6. **Risiko klassifizieren.** Die Risikologik verweist auf `project-register/risk-classifier.json`.
7. **Human Review vor Umsetzung.** Empfehlungen bleiben Review-Entscheidungen. High- und Critical-Risk-Empfehlungen duerfen nie ohne explizite menschliche Freigabe umgesetzt werden.

## Geschuetzte Bereiche

Der Agent darf keine Laufzeitlogik und keine geschuetzten Produktbereiche direkt veraendern. Dazu gehoeren insbesondere:

- Unity / PR #13 / `native/unity/WellFitBuddyAR/**`
- Token, NFT, Wallet, Payment, Purchase, Payout, Marketplace, Staking, Presale, Trading und Betting
- Reward Authority, finale Ledger Writes, Mission Completion Authority, Anti-Cheat und finanznahe Mechaniken
- Health, Watch, Child Safety, Location, Camera, Privacy, Consent, Medical-adjacent, Legal, Datenschutz, AGB, Impressum und Compliance


## Controlled-Curiosity-Flow

Controlled Curiosity erweitert die bestehende Research-Governance und baut keine neue Research-Architektur. Der Flow gilt, sobald eine Wissensluecke WellFit-Entscheidungen zu Roadmap, Website, Investorentext, Produktkonzept, geschuetzten Bereichen oder High-/Critical-Risk-Themen beeinflussen koennte.

1. **Wissensluecke erkennen.** Die Unsicherheit, intern gelesene Quellen, fehlende Evidenz, Dublettenrisiko und moegliche geschuetzte WellFit-Bereiche muessen dokumentiert werden.
2. **Research Proposal erstellen.** Vor externer Recherche wird ein Research Proposal mit Status `pending_approval` erstellt; automatische Internet-Recherche bleibt bis zur Freigabe blockiert.
3. **Proposal-Scope dokumentieren.** Das Proposal dokumentiert Zweck, erlaubte und verbotene Quellenarten, Risikoklasse, erwarteten Nutzen, betroffene WellFit-Bereiche, Schutzbereichsbewertung, Speicherort, Stop-Bedingungen und moegliche Adoption Targets.
4. **Admin-/Owner-Freigabe verlangen.** Low/Medium-Scopes koennen nur im erlaubten report-only Rahmen durch Admin Review freigegeben werden. High-, Critical- oder geschuetzte Bereiche brauchen explizite Owner-Freigabe fuer den exakten Research-Scope. System Agents duerfen keine eigene Freigabe erteilen.
5. **Research-Ergebnis speichern.** Ergebnisse werden als Dokument oder Report gespeichert und enthalten Proposal-/Freigabe-Referenz, Quellen, Quellenarten, Risiken, Grenzen, betroffene WellFit-Bereiche und Adoption-Status. Das Ergebnis erzeugt keine direkte Implementierungsberechtigung.
6. **Unabhaengige Quellen-/Risiko-Pruefung verlangen.** Eine zweite Pruefung bewertet Quellenqualitaet, Quellenunabhaengigkeit, Risikoklasse, geschuetzte Bereiche, Claims und Anwendbarkeit auf WellFit.
7. **Uebernahme erst nach Review erlauben.** Roadmap, Website, Investorentext oder Produktkonzept duerfen Research-Ergebnisse erst nach abgeschlossener Review-Freigabe uebernehmen; andernfalls bleiben sie interner Research-Kontext.

Automatische Internet-Recherche ist fuer High-/Critical-Risk- oder geschuetzte Bereiche ohne explizite Admin-/Owner-Freigabe blockiert. Critical- oder geschuetzte Research-Scopes verlangen Owner-Freigabe und Audit-Notiz.

## Report-Format

Ein Recommendation Report muss enthalten:

- Frage oder Unsicherheit und erkannte Wissensluecke
- intern gelesene Quellen und Erkenntnisse
- Research Proposal mit Zweck, Quellenarten, Risiko, erwartetem Nutzen, betroffenen WellFit-Bereichen und Freigabestatus
- Status externes Research: `not_available_internal_only`, `available_used_after_internal_review` oder `available_not_needed_after_internal_review`
- mindestens drei Optionen mit Pro/Contra, Evidenz, Risiko und Review-Status
- genau ein `recommendedOptionId`
- Empfehlungsbegruendung
- Risikoklasse: `low`, `medium`, `high` oder `critical`
- `humanReviewRequired`
- `implementationAllowed`
- gespeichertes Research-Ergebnis und Status der unabhaengigen Quellen-/Risiko-Pruefung
- Adoption-Status fuer Roadmap, Website, Investorentext oder Produktkonzept
- naechste sichere Aufgabe

## Validierung

`node scripts/wellfit-dev-agent/src/research-recommendation-check.mjs` prueft, dass die Registry existiert, valides JSON ist, den Internal-First-Ablauf erzwingt, externes Research optional laesst, mindestens drei Optionen verlangt, genau eine Empfehlung fordert, High/Critical-Risiken an Human Review bindet, geschuetzte Themen abdeckt und Controlled-Curiosity-Regeln in der Registry dokumentiert.

Der Check ist in `scripts/wellfit-dev-agent/src/quality-gate.mjs` eingebunden.

## KI-Fortsetzungs-Prompt

Lies `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md` und `project-register/research-recommendations.json`. Erstelle bei unklaren WellFit-Fragen nur einen Recommendation Report mit mindestens drei Optionen und genau einer Empfehlung. Nutze externe Quellen nur, wenn Internetzugang explizit verfuegbar ist und der Controlled-Curiosity-Gate fuer den konkreten Scope bestanden wurde; andernfalls melde `not_available_internal_only`. Markiere High-/Critical-Risk- oder geschuetzte Themen immer als `humanReviewRequired=true`, blockiere automatische Internet-Recherche ohne explizite Freigabe und implementiere oder uebernehme Research-Ergebnisse nicht ohne Review.
