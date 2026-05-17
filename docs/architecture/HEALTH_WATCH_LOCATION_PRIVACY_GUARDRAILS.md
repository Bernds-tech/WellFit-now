# WellFit Health, Watch and Location Privacy Guardrails

Status: Beta-planend / Datenschutz- und Safety-Leitplanke
Stand: 2026-05-15

## Ziel

Diese Datei legt fest, wie WellFit mit Schritt-, Health-, Watch-, Kamera-, AR-, Standort- und Kinder-/Jugenddaten umgehen soll.

Grundsatz: Diese Daten duerfen WellFit unterstuetzen, aber nicht unkontrolliert zur Hauptmechanik, Reward-Autoritaet oder Missbrauchsquelle werden.

## Harte Beta-Abgrenzung

- Keine sensiblen Health-Daten als alleinige Reward-Grundlage.
- Keine Standortdaten als alleinige Reward-Grundlage.
- Keine Kamera-/AR-Daten als unkontrollierte Pflicht fuer alle Nutzer.
- Keine dauerhafte Hintergrundueberwachung ohne klare Einwilligung.
- Keine Kinder-/Jugenddaten ohne besondere Schutzlogik.
- Keine clientseitige Autoritaet fuer Punkte, XP, Rewards, Mission Completion oder Anti-Cheat.
- Keine finale Autoritaet fuer Leaderboards, Inventory Grants, Rare Items, Ledger-Writes oder payout-/tokennahe Entscheidungen aus Health-, Watch-, Kamera-, AR-, Standort-, Face- oder Motion-Signalen.
- Keine Erweiterung von Health-, Child-, Location-, Camera-, Face-, Motion-, Privacy- oder Consent-Daten ohne expliziten Human-Review, Datenminimierung, Einwilligungskonzept und Fallback.
- Alle rechtlich oder medizinisch sensiblen offenen Punkte bleiben `review_required`; diese Datei ersetzt keine Rechts-/Datenschutzpruefung und aktiviert keine Runtime-Logik.

## Data-Protection Review Pass 2026-05-15

Diese Dokumentationsrunde ist ausschliesslich eine Planungs-/Register-Klarstellung. Sie aktiviert keine Produktionsverfolgung, keine neue Datenerfassung, keine Consent-UI, keine Legaltext-Aenderung und keine Reward-/Mission-Authority.

| Datenbereich | Schutzstatus | Consent / Review | Speicher-/Minimierungsregel | Authority-Grenze | Fallback |
|---|---|---|---|---|---|
| Health- und Watch-Daten, HealthKit, Health Connect, Wearables | protected / `review_required` | Nur mit ausdruecklicher Einwilligung, Human-/Legal-/Privacy-Review und klarer Zweckbindung | Bevorzugt aggregierte Tages-/Wochenstatus oder grobe Kategorien; Rohdaten, medizinische Details und Langzeitprofile vermeiden | Nie direkte Reward-, Punkte-, XP-, Anti-Cheat- oder Mission-Completion-Autoritaet | Nutzer ohne Health-/Watch-Anbindung duerfen Basic-App, sichere Missionen und nicht-sensitive Fallbacks weiter nutzen |
| Kinder-, Minderjaehrigen-, Familien-, Guardian-, Schul- und Vereinsdaten | protected / `review_required` | Zusaetzliche Human-/Legal-/Privacy- und Child-Safety-Pruefung vor Umsetzung | Altersbaender statt exakter Geburtsdaten bevorzugen; keine unnötigen Familien-/Guardian-Details speichern | Keine direkte Reward-, PvP-, Leaderboard-, Rare-Item- oder Completion-Autoritaet aus Child-/Family-Daten | Altersgerechte, risikoarme App-Nutzung muss ohne pressure/shame und mit sicheren Alternativen moeglich bleiben |
| Exakter Standort, GPS, Radius, Safe-Zones, Checkpoints und Standortverlauf | protected / `review_required` | Nur fuer klar erklaerte Missionen, mit Einwilligung, Sicherheitspruefung und Fallback | So ungenau und kurzlebig wie moeglich; keine dauerhafte Standorthistorie als Default; Safe-Zones nur nach Review | Standort ist hoechstens Kontext-/Evidence-/Safety-Signal, nie allein finale Reward- oder Completion-Autoritaet | Bei Ablehnung keine komplette App-Sperre; ortsfreie Missionen oder manuelle/alternative Evidence anbieten, wo sinnvoll |
| Kamera, AR-Kamerabild, Pose, Face, Mimik, Biometrie, rohe Sensor-/Bild-/Videodaten | protected / `review_required` | Kamera-/Face-/Pose-/Biometrie-Nutzung nur nach expliziter Berechtigung, Consent-Konzept und Review | Rohbilder, Videos, Face Templates und biometrische Rohdaten duerfen nicht standardmaessig gespeichert werden; lokale/ephemere Verarbeitung bevorzugen | Kamera-/Face-/Pose-Signale duerfen nicht allein Rewards, Completion, Anti-Cheat, medizinische Aussagen oder Safety-Freigaben autorisieren | Bei verweigerter Kamera/Face/Pose soweit moeglich nicht-kamerabasierte Missionen, Demo-/Preview-Modi oder Lern-/Bewegungsalternativen anbieten |
| Browser-DeviceMotion, Beschleunigung, Rotation, einfache Schrittpeaks und Bewegungsheuristiken | weak context / `review_required` bei Erweiterung | Browserbewegungsdaten nur transparent und freiwillig nutzen; native Health-/Core-Motion-/Watch-Integration braucht separaten Review | Nur kurzlebige, aggregierte Plausibilitaetssignale; keine rohe Sensorhistorie als Default | DeviceMotion ist ein schwaches Kontext-/Plausibilitaetssignal und nie finale Reward-/Completion-/Anti-Cheat-Autoritaet | Bei Ablehnung oder schwacher Sensorqualitaet sichere manuelle, Lern- oder native-reviewpflichtige Alternativen nutzen |
| Consent-, Privacy- und Permission-Status | protected / `review_required` | Consent darf nicht implizit aus Nutzung abgeleitet werden; Zweck, Zeitpunkt, Daten, Widerruf und Alternative muessen erklaert sein | Nur notwendige Status-/Audit-Informationen speichern; keine versteckten Tracking- oder Dark-Pattern-Flows | Consent-Status autorisiert keine Rewards; er begrenzt nur erlaubte Verarbeitung | Verweigerung darf Basisnutzung nicht blockieren, wenn eine sichere Alternative moeglich ist |

### Cross-Cutting Review-Regeln

- Jede neue geschuetzte Datenverwendung braucht vor Implementierung: Zweckbindung, Datenminimierung, Consent-Konzept, Fallback, Retention-Loeschregel, Security-Regel, menschliche Produkt-/Legal-/Privacy-Pruefung und `review_required`-Status bis zur Freigabe.
- Protected Data darf nur als Kontext-, Plausibilitaets-, Safety- oder Evidence-Signal geplant werden. Finale Mission Completion, Rewards, XP, Punkte, Leaderboards, Inventory Grants, Rare Items, Anti-Cheat-Freigaben, Token-/Payout-/Payment-nahe Entscheidungen und medizinische Aussagen bleiben server-/reviewpflichtig und duerfen nicht aus einem einzelnen geschuetzten Signal entstehen.
- Raw Images, Videos, Face Data, Face Templates, biometrische Rohdaten, exakte Standortverlaeufe, Health-Rohdaten und Kinderdetaildaten sind Default-`do_not_store`, solange keine separate Human-/Legal-/Privacy-Freigabe mit Datenmodell und Loeschkonzept vorliegt.
- Diese Datei ist kein Datenschutztext fuer Nutzer und ersetzt keine AGB-/Datenschutz-/Impressum-Aenderung. Runtime-Legaltexte bleiben unveraendert, bis ein separater Review-Auftrag erteilt wird.


## Mobile/PWA Device-Test Datenschutzgrenzen 2026-05-15

Der Mobile/PWA-Geraetetest ist ein Dokumentations- und QA-Plan, keine Freigabe fuer neue Datenerfassung. Fuer Android Chrome, Samsung Internet, iPhone Safari und Desktop-Responsive-Smoke gilt:

- Kamera-Permission accepted/denied, MediaPipe Pose/Face-Ladezustand, DeviceMotion-Permission, WebGL/AR-Fallbacks und PWA-Install-Hinweise duerfen beobachtet und als `device_test_required` dokumentiert werden, aber nicht durch Runtime-Code, neue Consent-Flows oder neue Tracking-SDKs erweitert werden.
- Kamera-/Pose-/Face-/AR-/Motion-Signale bleiben lokal/ephemer bzw. beta-preview, soweit bereits vorhanden; Rohbilder, Videos, Face Templates, biometrische Rohdaten, exakte Standortdaten, Health-/Watch-Rohdaten und rohe Sensorhistorien duerfen in diesem Testplan nicht gespeichert oder als neue Felder geplant werden.
- Permission-Ablehnung ist ein normaler Testfall. Zukuenftige Tester sollen Fallbacks, Demo-/Lernmodi, Nicht-Kamera-Missionen und klare Fehlerhinweise dokumentieren, statt Nutzer zu Kamera, Motion, Health, Location, Wallet oder Zahlung zu draengen.
- DeviceMotion kann auf iOS, unsicheren Origins/weak contexts oder bestimmten Browsern fehlen oder eine Nutzerinteraktion erfordern; solche Unterschiede bleiben `device_test_required` oder `review_required`.
- WebGL/3D-Flammi- und AR-Kamera-Fallbacks duerfen visuell smoke-getestet werden, aber AR/canvas, Kamera-Frames, Pose-Skeletons, Buddy-Animationen und Missionstimer duerfen nicht strict-pixel-gematcht oder als compliance-/authority-relevante Beweise behandelt werden.
- Kein Testergebnis aus Kamera, Pose, Face, Motion, AR, PWA-Install, Health, Watch oder Location darf finale Rewards, XP, Punkte, Mission Completion, Anti-Cheat, Leaderboards, Inventory Grants, Rare Items, Token, Payments, Payouts oder medizinische Aussagen autorisieren.

## Datenkategorien

### Schritt- und Bewegungsdaten
Duerfen spaeter genutzt werden fuer:
- Plausibilitaet
- Kontext
- Motivation
- Fortschritt
- Missionsempfehlungen

Duerfen nicht alleine entscheiden ueber:
- finale Punktevergabe
- echte Rewards
- Mission Completion
- Anti-Cheat-Freigabe

### Health-/Fitnessdaten
Health-Daten sind sensibel.

Moegliche Beispiele:
- Aktivitaetsniveau
- Trainingserfahrung
- Belastbarkeit
- Gesundheitsbezogene Einschraenkungen
- Nutzerziele

Regel:
- Nur minimal speichern.
- Nur mit klarer Einwilligung verwenden.
- Nach Moeglichkeit in groben Kategorien statt Rohdaten speichern.
- Keine Diagnose, keine medizinische Bewertung.

### Watch-/Wearable-Daten
Watch-Daten koennen spaeter helfen bei:
- Streaks
- Bewegungskontext
- Plausibilitaetspruefung
- freiwilligen Challenges

Regel:
- Keine Pflicht fuer Beta.
- Keine Benachteiligung ohne Watch.
- Keine dauerhafte Ueberwachung als Standard.

### Standortdaten
Standort kann spaeter wichtig sein fuer:
- AR-Rallyes
- NFC-Orte
- lokale Challenges
- Outdoor-Missionen

Regel:
- Standort nur bei klarer Mission und Einwilligung.
- So wenig genau wie moeglich.
- Keine dauerhafte Standorthistorie ohne starken Grund.
- Standortdaten duerfen nicht direkt finale Rewards autorisieren.

### Kamera- und AR-Daten
Kamera/AR ist fuer Buddy, AR-Rallyes und visuelle Missionen wichtig.

Regel:
- Kamera nur nach ausdruecklicher Freigabe.
- AR-Daten fuer Beta moeglichst lokal/ephemer behandeln.
- Keine unnoetige Speicherung von Bild-/Videodaten.
- AR-Proof nur als Hinweis oder Evidence, nicht als alleinige finale Autoritaet.

### Kinder- und Jugenddaten
Besonders schutzbeduerftig.

Regel:
- Altersgruppen statt exakter Details bevorzugen.
- Keine riskante Uebermotivation.
- Keine Echtgeld-/Token-/Trading-/NFT-Funktionen in Mobile.
- Eltern-/Guardian-/Schul-/Vereinslogik spaeter gesondert planen.

## Reward- und Mission-Regel

Health-, Watch-, Kamera-, AR- und Standortdaten koennen spaeter in die Bewertung einfliessen als:
- Kontextsignal
- Plausibilitaetssignal
- Safety-Signal
- Empfehlungssignal
- Evidence-Signal

Sie duerfen fuer Beta nicht alleine sein:
- Reward-Autoritaet
- Punkte-Autoritaet
- XP-Autoritaet
- Anti-Cheat-Entscheidung
- Mission-Completion-Entscheidung

## Datenminimierung

Fuer Beta bevorzugen:
- Status statt Rohdaten
- Kategorien statt exakte Werte
- kurze Speicherung statt Langzeitverlauf
- Audit-Events statt private Rohdaten
- lokale Verarbeitung, wo moeglich

## Einwilligung und UI

Jede sensible Berechtigung braucht klare UI-Erklaerung:

- Warum wird sie gebraucht?
- Wann wird sie genutzt?
- Was passiert, wenn Nutzer ablehnen?
- Welche Alternative gibt es?

Ablehnung darf die App nicht komplett unbrauchbar machen, sofern die Funktion nicht zwingend darauf angewiesen ist.

## App-Store-Konformitaet

Mobile-App bleibt frei von:
- Token-Trading
- NFT-Marktplatz
- Presale-Funktionen
- Staking
- echten Auszahlungen
- spekulativen Finanzmechaniken


## Location Safety Guard Verbindung

Diese Privacy-Guardrails sind mit `docs/architecture/WELLFIT_LOCATION_SAFETY_GUARD.md` und `project-register/location-safety-guard.json` verbunden.

Standortdaten bleiben planning-only fuer Live-Verarbeitung, solange Consent, Datenschutz und Safety Rules nicht umgesetzt und geprueft sind. Verboten bleiben insbesondere Kinder-Standortfreigabe, genaue Standorthistorie ohne Consent, private Wohnorte als oeffentliche Missionen sowie Missionen in Strassen-/Bahn-/Risikobereichen.

## Datenbankbezug

Abzugleichen mit:

- `todolist/DATABASE_PLAN.md`
- `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`
- `docs/architecture/MISSION_DRAFT_SECURITY_PLAN.md`
- `docs/architecture/TRACKING_BUDDY_SERVER_EVENTS.md`
- `docs/architecture/AR_RIDDLE_FIRESTORE_SECURITY_PLAN.md`
- `docs/architecture/USER_POINTS_CLIENT_WRITE_REFACTOR.md`

## Offene Folgeaufgaben

- [ ] Konkrete Consent-Texte fuer Kamera, Standort, Health und Watch entwerfen.
- [ ] Datenmodell pruefen: Welche Health-/Watch-/Standortdaten werden wirklich fuer Beta benoetigt?
- [ ] Fallbacks fuer Nutzer ohne Berechtigungen definieren.
- [ ] Kinder-/Jugendschutzlogik als eigene Detaildatei vorbereiten.
- [ ] Mission- und Reward-Logik gegen diese Guardrails pruefen.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/NEXT_ACTIONS.md`, `todolist/DATABASE_PLAN.md`, `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`, `todolist/TODO_INDEX.md` und diese Datei. Arbeite Health-, Watch-, Standort-, Kamera- und Kinder-/Jugenddaten nur datensparsam und schutzorientiert weiter. Keine sensiblen Daten als alleinige Reward- oder Mission-Completion-Autoritaet verwenden. Neue Datenfelder immer mit Zweck, Einwilligung, Speicherlogik und Fallback dokumentieren.
