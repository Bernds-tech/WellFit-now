# WellFit Location Safety Guard

Status: Planning-only / runtime-blockierend
Stand: 2026-05-17
Register: `project-register/location-safety-guard.json`
Validator: `scripts/wellfit-dev-agent/src/location-safety-guard-check.mjs`

## Zweck

Dieser Guard verbindet die vorhandenen Standort-, Checkpoint-, AR-Rallye- und Datenschutzdokumente zu einer verbindlichen Sicherheitsgrenze fuer Standortfunktionen.

Er aktiviert keine Live-Standortverarbeitung, keine Hintergrundortung, keine genaue Standorthistorie, keine Kinder-Standortfreigabe, keine Missionserzeugung an echten Orten und keine neue Reward-/Mission-Completion-Autoritaet.

## Verbundene Quellen

Dieser Guard ist mit folgenden fuehrenden Architekturdateien verbunden:

- `docs/architecture/CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md`
- `docs/architecture/AR_LOCATION_RADIUS_AND_RALLY_GENERATION.md`
- `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`

Bei Konflikten gilt die sicherste Auslegung: Standortfunktionen bleiben `planning_only` oder `review_required`, bis Consent, Datenschutz und Safety Rules umgesetzt und geprueft sind.

## Pruefbereiche

### 1. Keine gefaehrlichen Orte

WellFit-Missionen, Checkpoints, AR-Waypoints und Rallye-Ziele duerfen nicht an gefaehrlichen, gesperrten, unzugaenglichen oder sensiblen Orten platziert werden.

Blockierende Beispiele:

- Strassen, Kreuzungen, Autobahnen, Schnellstrassen und riskante Ueberquerungen
- Bahn-, Gleis- und Bahnhofssicherheitsbereiche ohne sichere Besucherfuehrung
- Baustellen, abgesperrte Bereiche, Industrieanlagen ohne Freigabe
- Wasserflaechen ohne sichere Plattform, Klippen, Absturzbereiche und andere Risikozonen
- medizinisch, militaerisch oder behoerdlich sensible Bereiche

### 2. Keine privaten Wohnorte als oeffentliche Missionen

Private Wohnorte duerfen nicht als oeffentliche Missionen, oeffentliche Checkpoints, Rallye-Ziele oder AR-Orte verwendet werden.

Blockierend sind insbesondere:

- private Wohnadressen
- Hauseingaenge, Wohnungen, Gaerten, Einfahrten oder Innenhoefe ohne explizite Freigabe
- private Safe-Zones oder Familienorte als oeffentlich sichtbare Ziele
- automatisch generierte POIs, die faktisch eine Privatadresse offenlegen koennten

### 3. Keine Kinder-Standortfreigabe

Dieser Guard erlaubt keine Kinder-Standortfreigabe und keine oeffentliche oder gruppenbezogene Sichtbarkeit von Kinderstandorten.

Bis eine gesonderte Guardian-/Schul-/Vereins-/Datenschutzpruefung umgesetzt ist, sind blockiert:

- Live-Standortfreigabe von Kindern
- oeffentliche Sichtbarkeit von Kinderstandorten
- unreviewtes Guardian-Tracking
- Standortfreigaben fuer Schule, Verein, Klasse, Gruppe oder Challenge

### 4. Keine genaue Standorthistorie ohne Consent

Genaue Standortdaten, GPS-Verlauf, Radiusnaehe und Bewegungsverlauf duerfen nicht dauerhaft gespeichert oder verarbeitet werden, solange Zweck, explizite Einwilligung, Datenminimierung, Speicherdauer, Loeschung und Fallbacks nicht dokumentiert und umgesetzt sind.

Planungsregel:

- So grob wie moeglich statt so genau wie moeglich.
- Ephemer/lokal bevorzugen, wenn ein Standortsignal ueberhaupt erforderlich ist.
- Keine Hintergrundortung oder kontinuierliche Historie ohne starken Zweck und Review.
- Keine Partner-, Werbe-, Versicherungs- oder Profiling-Nutzung aus Standortdaten.

### 5. Keine Missionen in Strassen-/Bahn-/Risikobereichen

Missionen, Checkpoints, AR-Waypoints und Rallye-Routen muessen so geplant werden, dass Nutzer nicht zu riskantem Verhalten verleitet werden.

Blockierend sind:

- Zielpunkte auf Fahrbahnen, Gleisen, Wasserflaechen oder riskanten Ueberwegen
- Routen, die riskante Querungen, gesperrte Bereiche oder gefaehrliche Annahmen erfordern
- Missionstexte, Timer, Rewards oder Wettbewerbsdruck, die Sicherheit untergraben
- clientseitige Standortlogik, die riskante Platzierungen final freigibt

## Runtime-Sperre

Keine Live-Standortverarbeitung aktivieren, bevor alle folgenden Punkte umgesetzt und geprueft sind:

1. Consent: klare UI-Erklaerung, freiwillige Einwilligung, Ablehnungsfallback und Widerruf.
2. Datenschutz: Zweckbindung, Datenminimierung, Speicherdauer, Loeschung, Zugriffsschutz und Dokumentation.
3. Safety Rules: blockierte Orte, private Wohnorte, Kinderstandorte, Strassen-/Bahn-/Risikobereiche und Review-Eskalation.
4. Server-/Policy-Grenze: Standort darf hoechstens Evidence-, Plausibilitaets- oder Safety-Signal sein und keine finale Reward-, XP-, Punkte-, Anti-Cheat- oder Mission-Completion-Autoritaet im Client erhalten.
5. Tests/Reviews: Validatoren, manuelle Review-Checkliste und Owner-/Legal-/Privacy-/Safety-Freigabe fuer jede Runtime-Datei.

## Erlaubter aktueller Umfang

Aktuell erlaubt sind nur:

- Planungsdokumentation
- Registerpflege
- Validatoren fuer Dokumentations- und Registerkonsistenz
- manuelle Review-Fragen
- blockierende Implementierungsnotizen

## Nicht-Ziele

Dieser Guard ist keine Freigabe fuer:

- Live-GPS, Hintergrundortung oder genaue Standorthistorie
- Kinder-Standortfreigabe
- oeffentliche Missionen an Privatadressen
- automatische Missionen in Strassen-, Bahn- oder Risikobereichen
- neue Firestore-, Functions-, App-Runtime-, Unity- oder UI-Consent-Implementierung
- finale Reward-, Punkte-, XP-, Anti-Cheat- oder Mission-Completion-Autoritaet aus Standortdaten

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `project-register/location-safety-guard.json`, `docs/architecture/CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md`, `docs/architecture/AR_LOCATION_RADIUS_AND_RALLY_GENERATION.md`, `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` und diese Datei. Arbeite nur planning-only weiter, solange kein explizit freigegebener Runtime-Scope mit Consent, Datenschutz, Safety Rules, Tests und Owner-Review vorliegt. Keine Live-Standortverarbeitung aktivieren.
