# CURRENT EXECUTION BOARD - WELLFIT

Stand: 2026-07-29
Owner: Bernd / WellFit
Zweck: operatives Kontrollzentrum fuer den tatsaechlichen aktuellen Stand. Diese Datei dokumentiert, was erledigt ist, was gerade gebaut wird, was als Naechstes kommt, welche Abhaengigkeiten bestehen und welche Produktgrenzen nicht ueberschritten werden duerfen.

Aktuelle Runtime-Quelle: `docs/status/WELLFIT_RUNTIME_STATE_2026-07-29.md`
Verbindlicher KI-Auftrag: `todolist/MASTER_PROMPT_FOR_AI.md`
Agent-/KI-Audit: `docs/architecture/WELLFIT_AGENT_AND_AI_RUNTIME_AUDIT_2026-07-29.md`

## Arbeitsregel

- Vor jeder groesseren Aenderung zuerst aktuellen Code, offene PRs, relevante TODOs, Architektur- und Readiness-Dateien pruefen.
- Nach jeder gemergten Aenderung dieses Board oder die fuehrenden Statusdateien aktualisieren.
- Erledigte Punkte nicht loeschen, sondern in `Erledigt` verschieben.
- Neue Ideen zuerst mit bestehenden Systemen, Registern und Agenten verknuepfen; keine Parallelarchitektur anlegen.
- Runtime-, Firebase-, Datenschutz-, Health-, Child-, Location-, Reward-, Payment-, Token-, NFT- und Unity-Aenderungen nur in klar begrenzten PRs.
- Immer zwischen `code_present`, `merged`, `deployed`, `configured` und `live_verified` unterscheiden.
- `CURRENT_PROJECT_STATE.md`, alte Statusdateien und die 16 externen Konzept-/Business-Quellen sind historischer Kontext, nicht der aktuelle Arbeitsauftrag.

## Aktueller Hauptfokus

### P0.1 - Source-of-Truth und Quality Gate stabilisieren

Status: im Audit-Branch umgesetzt; Commit/PR-Handoff offen

Ziel:
- zentrale Startreihenfolge, Runtime-Status, Register und TODOs auf denselben Stand bringen
- rote Quality-Gate-Befunde beheben, ohne Produktlogik oder geschuetzte Canonical Truth zu veraendern
- alte Aufgaben als historisch/erledigt/ersetzt markieren, nicht loeschen
- GitHub-Issues gegen den echten Stand triagieren

Konkrete Abnahmepunkte:

- [x] `npm run agent:quality-gate` in einem sauberen Worktree mit dem Audit-Diff erfolgreich
- [x] keine fehlenden Dateien im TODO-Index
- [x] Route `/login` registriert
- [x] veralteter Product-Readiness-Dateipfad korrigiert
- [x] Cash-out-Validator erkennt explizite `false`-/Sicherheitsfelder nicht als aktive Cash-out-Funktion
- [x] Firestore-Testplan nennt User-A/User-B-Isolation
- [x] historische Progress-/Work-Log-Eintraege schema-konform

### P0.2 - Kritische/hohe Produktionsabhaengigkeiten aktualisieren

Status: offen / eigener Dependency-Security-PR

`npm audit --omit=dev` meldete am 2026-07-29 fuer den aktuellen Lockfile-Stand:

- 1 critical
- 9 high
- 4 moderate

Direkt betroffen sind unter anderem `next` und `firebase`; transitive Befunde betreffen unter anderem `websocket-driver`, `@grpc/grpc-js`, `protobufjs`, `postcss` und `sharp`. `npm outdated` zeigt neuere kompatible/aktuelle Releases fuer Next.js und Firebase.

Naechste Aktion:

1. eigener Branch/PR nur fuer Dependency-Security
2. Next.js und `eslint-config-next` gemeinsam auf einen gefixten aktuellen 16.2.x-Stand heben
3. Firebase innerhalb des kompatiblen 12.x-Pfads aktualisieren und verbleibende transitive Advisories neu bewerten
4. Lockfile reproduzierbar aktualisieren; keine blinde `npm audit fix --force`-Major-Migration
5. Lint, TypeScript, Build, Functions, Quality Gate, Container und Live-Rollback pruefen
6. nicht behebbare transitive Befunde mit Exponierung, Compensating Controls und Upstream-Tracking dokumentieren

### P0.3 - Oeffentliche Legaltexte an reale Beta anpassen

Status: blockiert bis dedizierter Legal-/Privacy-Review-PR

Live verifizierter Konflikt:

- `/datenschutz`, `/agb` und `/impressum` beschreiben SUI, zkLogin, DePIN, WFT, NFTs, Tokenomics, Kryptoerwerb und MiCA
- diese Funktionen sind in der geschuetzten Beta-1-Wahrheit inaktiv

Naechste Aktion:

1. aktuelle Datenfluesse, Anbieter, Speicherfristen, Rechtsgrundlagen und Kontakt-/Unternehmensangaben mit Owner/Legal verifizieren
2. in einem eigenen PR nur die oeffentlichen Rechtstexte und ihre Tests aktualisieren
3. keine Token-/Investment-/Health-/Minor-Behauptungen ohne belegte Freigabe
4. danach Live-Smoke und Inhaltsabnahme dokumentieren

### P0.4 - Domain, HTTPS und Security Header

Status: offen

- Staging laeuft live auf `http://172.86.88.107`
- Domain/TLS fehlen
- CSP, Frame-Schutz, Referrer Policy, Permissions Policy und nach HTTPS HSTS fehlen
- `robots.txt`, `sitemap.xml` und `/.well-known/security.txt` liefern 404

Naechste Aktion:

1. Staging-Domain und Zertifikatsweg freigeben
2. Nginx-/Deploy-Aenderung mit Rollback separat umsetzen
3. Security Header zuerst report-only pruefen, dann schrittweise aktivieren
4. HTTP-zu-HTTPS, Health, Login, Register, Legal und Rollback live pruefen

### P0.5 - Agent-/GitHub-Runner-Autoritaet beweissicher begrenzen

Status: code vorhanden, operative Aktivierung nicht nachgewiesen

- `agent-automation-control` ist aus und Runtime-Autoritaet ist nicht erteilt
- Functions-Code kann jedoch real Branches, Dateien, PRs, Checks und Merges ueber GitHub ausfuehren
- veraltete Registertexte behaupten teilweise weiterhin, die API sei nicht implementiert

Naechste Aktion:

1. deployte Functions-Version und serverseitige Konfiguration inventarisieren
2. GitHub-App-/Token-Rechte und Branch Protection pruefen
3. Kill Switch, Approval-Bindung, Idempotenz, Replay-/Rate-Limits und Audit Evidence testen
4. Register erst danach auf den belegten Zustand synchronisieren
5. Auto-Merge, Auto-Repair und Deploy-Autoritaet bis zur Abnahme deaktiviert lassen

### Erledigt - Landingpage-Premiumphase

Status: Phase bis PR #362 am 2026-07-28 gemergt und live auf Staging

- Landingpage auf `/` als hochwertige WellFit-Marken- und Produktseite umgesetzt
- Login bleibt auf `/login`; Register- und Login-CTAs sind live
- Premium-Assets, Hero-/Buddy-Komposition und mehrere responsive Designrunden wurden ueber PRs #351 bis #362 integriert
- aktueller Live-Commit: `c0ef7d921ee1499cd20ffdd086ebca4050f1a189`
- Restarbeit ist keine erneute Landing-Neuentwicklung: CSS-`zoom` entfernen, Performance/A11y pruefen, SEO-Dateien und Unterseiten/Sections vervollstaendigen

## Erledigt - Infrastruktur und Deployment

- Ubuntu-24.04-Staging-VPS eingerichtet.
- Systemupdates, 2-GB-Swap, Nginx, Fail2ban und UFW aktiv.
- Docker Engine und Containerd installiert und getestet.
- eingeschraenkter Benutzer `wellfit-deploy` mit SSH-Key eingerichtet.
- gepinnter SSH-Host-Key in GitHub Environment hinterlegt.
- GitHub-Environment `staging` mit Server- und Firebase-Konfiguration eingerichtet.
- Docker-basierter Build in GitHub Actions; kein App-Build auf dem 1-GB-Server.
- SHA-256-gepruefte Release-Uebertragung und serverseitiger Aktivierungs-/Rollback-Pfad vorhanden.
- Nginx-Proxy und `/api/health` funktionieren.
- erster erfolgreicher Staging-Deploy abgeschlossen.
- Deployment nach Push/Merge auf `main` automatisiert.
- aktuelle Staging-Adresse: `http://172.86.88.107`

## Erledigt - Website-Grundstruktur

- oeffentliche Landingpage auf `/` angelegt.
- bestehende Auth-Seite nach `/login` verschoben.
- Header-Navigation vorhanden:
  - So funktioniert's
  - Erlebnisse
  - Dein Buddy
  - Fuer wen
  - Sicherheit
  - Ueber uns
- Registrierungs- und Login-CTAs verlinkt.
- Tamagotchi-artige Buddy-Pflege erklaert.
- Buergermeister-/Community-Idee als Roadmap und nicht als bereits aktive Funktion gekennzeichnet.
- Familien-/Kinder- und Community-Funktionen als geplant/reviewpflichtig gekennzeichnet.
- Sicherheits- und Datenschutzabschnitt vorhanden.
- mehrere Design- und Skalierungsrunden abgeschlossen.
- letzte Layout-Skalierung technisch auf `zoom: 1.38` gesetzt; als temporaere visuelle Zwischenloesung markiert.

## Erledigt - Produkt- und Backend-Grundlagen

- serverautoritatives Missions-Lifecycle-Modell fuer Tages-, Wochen-, Challenge- und Abenteuer-Missionen vorhanden.
- Missionshistorie serverseitig projiziert.
- interne WFXP bleiben nicht uebertragbare Fortschrittspunkte ohne Geldwert oder Cash-out.
- Datenschutzminimierte Admin-/Beta-Operations-Projektion vorhanden.
- Nutzer-/Settings-/Consent-Autoritaet weitgehend auf serverseitige Callables verlagert.
- Account-Export, Loeschanfrage und retry-sicherer Loeschprozessor vorbereitet.
- versionierte Firestore-Migrationen und kanonische Seeds vorhanden.
- geschuetzter Firebase-Backup-/Release-Workflow vorhanden, aber Infrastruktur/Freigaben bleiben separat.
- reproduzierbares Standalone-Docker-Release und Healthcheck vorhanden.

## Offene Pull Requests

### PR #263 - Add owner claim setup helper

Status: offen / pruefen

Inhalt:
- lokaler Helper fuer Owner-/Admin-Custom-Claims
- Dokumentation und TODO-/Register-Updates

Naechste Aktion:
- gegen aktuelle Admin-Claim- und Firebase-Release-Grenzen pruefen
- CI und Review-Threads pruefen
- nur mergen, wenn keine parallele Owner-/Admin-Claim-Logik entsteht

### PR #13 - Add local Unity AR Buddy companion project

Status: offen / geschuetzt

Regel:
- nicht nebenbei aendern oder mergen
- Unity/AR separat inventarisieren, testen und freigeben
- Reward-, Mission-Completion- und Anti-Cheat-Autoritaet bleibt serverseitig

## Naechste Prioritaeten nach den P0-Stabilisierungen

### P1 - Website-Fertigstellung

- echte Unterseiten oder belastbare Section-Routen fuer alle Headerpunkte
- konsistente mobile Navigation
- SEO-Metadaten, OpenGraph, Sitemap und robots pruefen
- 404-/Error-/Loading-Zustaende vereinheitlichen
- Kontakt/Waitlist/Newsletter nur mit geprueftem Consent-Modell
- CSS-`zoom` entfernen und Zielgroessen responsiv direkt definieren
- Bildgroessen, LCP, Fokuszustaende, Kontrast und Reduced Motion pruefen

### P1 - Beta-Readiness

- reale End-to-End-Smoke-Tests fuer Register, Login, Dashboard, Missionen, Buddy und Settings
- Mobile-Tests auf Android Chrome, Samsung Internet und iPhone Safari
- Human-Evidence fuer Kamera/AR/PWA vervollstaendigen
- Staging-Firebase-Backend-Funktionen und Rules gegen reale Umgebung pruefen
- Fehler-Monitoring, Container-/Nginx-Logs und einfache Uptime-Ueberwachung einrichten
- Backup-/Restore-Runbook praktisch testen

### P2 - Buddy und Spielsystem

- verbindliche Buddy-Art-/Charakterentscheidung mit Variantenlogik
- Buddy-Zustaende: Hunger, Energie, Stimmung, Pflege, Bindung, Level
- klare Pflegefrequenz ohne manipulative Dark Patterns
- Buddy-Sichtbarkeit im Dashboard, Missionen, Fortschritt und eigenem Buddy-Bereich
- Outfit-, Faehigkeits- und Sammelobjekt-Progression als interne Beta-Funktion
- KI-Buddy zuerst Rules-/Fallback-sicher; Modellprovider nur serverseitig und abschaltbar

### P2 - Missionen und Community

- Buergermeister-System fachlich definieren:
  - Rolle
  - Stadt-/Saisonaktionen
  - gemeinsame Ziele
  - Moderation und Freigaben
  - keine ungeprueften lokalen Missionen
- sichere reale Checkpoints und Publikationsworkflow
- Familien-/Freundesmissionen mit Datenschutz- und Guardian-Grenzen
- Community-Funktionen erst nach Moderations-, Melde- und Sperrkonzept

### P3 - Unity / AR

- PR #13 separat pruefen
- Unity-Projekt reproduzierbar bauen
- Android/iOS-AR-Voraussetzungen dokumentieren
- Buddy-Asset- und Animationspipeline definieren
- App/Backend-Vertrag fuer Buddy-Zustand und Missionen festlegen
- AR bleibt Darstellung und Interaktion; keine finale Reward-Autoritaet

### Spaeter - Blockchain / NFT / WFT

Status: deaktiviert / nicht Beta-relevant

- keine Aktivierung in Mobile oder aktueller Staging-Beta
- keine Wallet-, Trading-, Presale-, Payout- oder Cash-out-Funktion
- digitale Sammelobjekte zuerst als interne nicht-finanzielle Produktfunktion testen
- spaetere Blockchain-Entscheidung nur nach Produkt-, Rechts-, Datenschutz-, App-Store- und Sicherheitsreview

## Bekannte technische Risiken und Schulden

1. `CURRENT_PROJECT_STATE.md` und grosse Teile von `NEXT_ACTIONS.md` enthalten historische Mai-Baselines. Die aktive Juli-Sektion steht am Anfang; Altinhalte bleiben Nachweis, nicht Ausfuehrungsreihenfolge.
2. Die Landingpage nutzt aktuell einen globalen landing-spezifischen CSS-`zoom` als Groessenkompensation. Das ist fuer finale Responsive-Qualitaet ungeeignet.
3. Public Legaltexte widersprechen der deaktivierten WFT-/Blockchain-Grenze und brauchen einen dedizierten Review-PR.
4. Staging laeuft nur ueber HTTP und direkte IP; Domain/HTTPS fehlen.
5. Die VPS-Konfiguration ist fuer Staging ausreichend, aber nicht als finale Production-Infrastruktur freigegeben.
6. Firebase-Web-Konfiguration ist gesetzt; reale Backend-/Rules-/Functions-Release-Evidence muss getrennt betrachtet werden.
7. Offene PR #263 und geschuetzte Unity-PR #13 duerfen nicht vergessen werden.
8. Agent-/GitHub-Runner-Code kann externe Schreibaktionen ausfuehren; deployte Aktivierung und Rechte sind nicht verifiziert.
9. Buddy-KI ist live Rules-only; ein Modellprovider ist ohne zusaetzliche Safety-/Kosten-/Minor-Gates nicht freigabefaehig.

## Entscheidungs- und Dokumentationsdisziplin

Bei jeder neuen Idee dokumentieren:

- Welches Problem loest sie?
- Welche bestehende Datei, Route, Collection, Function oder Agent ist bereits verantwortlich?
- Wird etwas erweitert oder entsteht unnoetig ein paralleles System?
- Welche Daten werden verarbeitet?
- Wer hat finale Autoritaet: Client, Webserver oder Firebase Function?
- Welche Risiken entstehen fuer Health, Kinder, Standort, Kamera, Rewards oder Datenschutz?
- Ist die Funktion Beta, Roadmap oder deaktiviert?
- Welche Tests und Evidence sind vor Merge notwendig?
- Welche TODO-, Work-Map-, Readiness- oder Progress-Dateien muessen aktualisiert werden?

## Definition of Done fuer sichtbare Website-Aenderungen

- Code auf einem Feature-Branch
- responsive Desktop-/Tablet-/Mobile-Pruefung
- keine kaputten Links
- Lint und TypeScript erfolgreich
- Produktionsbuild erfolgreich
- Container-Build und Healthcheck erfolgreich
- keine Secrets oder geschuetzten Daten im Clientbundle
- PR mit klarer Beschreibung
- Merge erst nach gruenen Checks
- Merge auf `main` als automatischen externen Staging-Deploy behandeln
- automatischer Staging-Deploy erfolgreich
- Live-Smoke-Test und Screenshot
- dieses Board oder fuehrende Statusdatei aktualisiert

## GitHub-Issue-Triage

Die 16 offenen Issues wurden am 2026-07-29 gegen aktuellen Code, PRs und Runtime abgeglichen. Verbindliche Dispositionen und Ersatz-Scopes stehen in:

`docs/status/WELLFIT_GITHUB_ISSUE_TRIAGE_2026-07-29.md`

Issues nicht nur wegen ihres Alters loeschen. Erledigte/ersetzte Issues mit Evidence schliessen; offene Issues auf den aktuellen Docker-, Firebase-, Beta- und Safety-Stand umschreiben.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `docs/status/WELLFIT_RUNTIME_STATE_2026-07-29.md`, dieses Board und die geschuetzte Beta-1 Canonical Truth. Arbeite die P0-Punkte in Reihenfolge ab, jeweils auf einem eigenen Branch/PR. Unterscheide Code, Merge, Deploy, Konfiguration und Live-Evidence. Keine alten Landing-, Agent-, PM2-, WFT-/Blockchain- oder Missionsaufgaben ungeprueft wiederholen. Nach jedem Merge das Board, relevante Register und den Live-Smoke synchronisieren.
