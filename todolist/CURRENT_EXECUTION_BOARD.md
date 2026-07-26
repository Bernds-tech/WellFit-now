# CURRENT EXECUTION BOARD - WELLFIT

Stand: 2026-07-26
Owner: Bernd / WellFit
Zweck: operatives Kontrollzentrum fuer den tatsaechlichen aktuellen Stand. Diese Datei dokumentiert, was erledigt ist, was gerade gebaut wird, was als Naechstes kommt, welche Abhaengigkeiten bestehen und welche Produktgrenzen nicht ueberschritten werden duerfen.

## Arbeitsregel

- Vor jeder groesseren Aenderung zuerst aktuellen Code, offene PRs, relevante TODOs, Architektur- und Readiness-Dateien pruefen.
- Nach jeder gemergten Aenderung dieses Board oder die fuehrenden Statusdateien aktualisieren.
- Erledigte Punkte nicht loeschen, sondern in `Erledigt` verschieben.
- Neue Ideen zuerst mit bestehenden Systemen, Registern und Agenten verknuepfen; keine Parallelarchitektur anlegen.
- Runtime-, Firebase-, Datenschutz-, Health-, Child-, Location-, Reward-, Payment-, Token-, NFT- und Unity-Aenderungen nur in klar begrenzten PRs.

## Aktueller Hauptfokus

### P0 - Oeffentliche Website professionell fertigstellen

Status: in Arbeit

Ziel:
- Landingpage auf `/` als hochwertige WellFit-Marken- und Produktseite fertigstellen.
- Bestehende Loginseite bleibt auf `/login`.
- Automatisches Staging-Deployment nach Merge auf `main` bleibt vorerst aktiv.

Aktuelle visuelle Entscheidung:
- dunkles Petrol/Tuerkis als Basis
- Cyan-/Teal-Lichtakzente
- Gelb/Orange aus dem WellFit-Logo als CTA- und Fortschrittsfarben
- cineastische Abenteuerwelt statt flacher Fitness-App-Optik
- Buddy als emotionales Zentrum; aktuell fox-/Fabelwesen-Richtung
- Produkttexte bleiben echtes HTML und werden nicht als flaches Mockup-Bild ausgeliefert

Naechste konkrete Umsetzungsschritte:

1. Generierte Premium-Assets kontrolliert in `public/landing/` aufnehmen und optimieren.
2. Hero-Hintergrund durch eine echte cineastische WellFit-Szene ersetzen.
3. Handy/Buddy/Portal/Checkpoint-Komposition responsiv einbetten.
4. Vier Hauptkarten visuell mit eigenen Assets ausstatten:
   - Bewege dich im Alltag
   - Sammle WFXP
   - Pflege deinen Buddy
   - Erlebe echte Missionen
5. Bereich `Was WellFit besonders macht` hochwertiger ausarbeiten:
   - Buddy wie ein Tamagotchi
   - Buergermeister & Community
   - Fuer viele Lebenslagen
   - Sichere Daten
6. Desktop, Tablet und Mobile pruefen.
7. Bildgroessen, WebP/AVIF, `sizes`, Lazy Loading und LCP optimieren.
8. Barrierefreiheit, Kontrast, Fokuszustand und Reduced Motion pruefen.
9. CSS-Zoom-Hilfskonstruktion wieder entfernen und die Zielgroessen direkt im Layout definieren.
10. Nach jedem Merge Live-Smoke-Test auf dem Staging-Server durchfuehren.

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

## Naechste Prioritaeten nach der Landingpage

### P1 - Website-Fertigstellung

- echte Unterseiten oder belastbare Section-Routen fuer alle Headerpunkte
- konsistente mobile Navigation
- Legal-/Trust-Seiten mit aktueller Produktrealitaet abgleichen
- SEO-Metadaten, OpenGraph, Sitemap und robots pruefen
- 404-/Error-/Loading-Zustaende vereinheitlichen
- Kontakt/Waitlist/Newsletter nur mit geprueftem Consent-Modell
- Domain und HTTPS fuer Staging/Preview einrichten

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

1. `CURRENT_PROJECT_STATE.md` und `NEXT_ACTIONS.md` enthalten noch viele Mai-Baselines und muessen schrittweise mit dem Juli-Stand synchronisiert werden.
2. Die Landingpage nutzt aktuell einen globalen landing-spezifischen CSS-`zoom` als Groessenkompensation. Das ist fuer finale Responsive-Qualitaet ungeeignet.
3. Generierte Mockup-Bilder sind noch nicht als kontrollierte optimierte Repo-Assets eingebunden.
4. Staging laeuft nur ueber HTTP und direkte IP; Domain/HTTPS fehlen.
5. Die VPS-Konfiguration ist fuer Staging ausreichend, aber nicht als finale Production-Infrastruktur freigegeben.
6. Firebase-Web-Konfiguration ist gesetzt; reale Backend-/Rules-/Functions-Release-Evidence muss getrennt betrachtet werden.
7. Offene PR #263 und geschuetzte Unity-PR #13 duerfen nicht vergessen werden.

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
- automatischer Staging-Deploy erfolgreich
- Live-Smoke-Test und Screenshot
- dieses Board oder fuehrende Statusdatei aktualisiert
