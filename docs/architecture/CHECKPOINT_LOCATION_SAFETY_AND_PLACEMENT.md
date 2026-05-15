# WellFit Checkpoint Location Safety and Placement

Status: Beta-planend / verbindliche Sicherheitsgrundlage
Stand: 2026-05-15

## Ziel

Diese Datei definiert, wo WellFit-Checkpoints fuer Abenteuer, Challenges und Wettkaempfe entstehen duerfen.

Grundsatz:

> WellFit soll Menschen zu echten, sicheren und sinnvollen Orten bewegen. Checkpoints duerfen nicht an gefaehrlichen, unzugaenglichen oder rechtlich problematischen Orten liegen.

## Geltungsbereich

Diese Regeln gelten fuer:

- Abenteuer-Orte
- Challenge-Orte
- Wettkampf-Orte
- AR-Checkpoints
- QR-/NFC-/Scan-Orte
- spaetere Partner- und Sponsoring-Checkpoints

## Erlaubte Checkpoint-Orte

Checkpoints duerfen bevorzugt an Orten entstehen, die sicher, oeffentlich erreichbar und sinnvoll fuer Bewegung oder Erlebnis sind.

Beispiele:

- Brunnen
- Parks
- oeffentliche Plaetze
- Fussgaengerzonen
- breite Gehwege
- Promenaden
- Sportplaetze und Sportanlagen mit Freigabe
- Schulhoefe nur mit Schul-/Traegerfreigabe
- Museen
- Burgen
- Zoos und Tierparks
- Tourismusorte
- Aussichtsplaetze
- Gemeindeflaechen mit Freigabe
- Partnerstandorte mit ausdruecklicher Freigabe
- Indoor-Orte mit klarer Besucherfuehrung

## Verbotene Checkpoint-Orte

Checkpoints duerfen nicht an gefaehrlichen oder ungeeigneten Orten erzeugt werden.

Strikt verboten:

- Strassenmitte
- Autobahnen
- Schnellstrassen
- Bahn- oder Gleisanlagen
- Tunnel ohne sichere Fussgaengerbereiche
- Baustellen
- abgesperrte Bereiche
- private Grundstuecke ohne Freigabe
- Industrieanlagen ohne Freigabe
- Wasserflaechen, Flussmitte, See, Teich ohne sichere Plattform
- Klippen, steile Haenge, Absturzbereiche
- Kreuzungen mit hohem Verkehr
- Parkplaetze als Zielpunkt ohne sicheren Fussbereich
- Orte, die Nutzer zu riskantem Verhalten verleiten
- medizinisch, militaerisch oder behördlich sensible Bereiche

## Checkpoint-Radius

Produktziel:

- Normaler Checkpoint-Zielradius: ca. 20 Meter.
- Der Nutzer soll wirklich zum Ort gehen.
- Es soll nicht reichen, irgendwo in der Naehe oder auf halber Strecke zu sein.

Technische Beta-Toleranz:

- GPS kann je nach Geraet, Gebaeude, Wetter und Umgebung ungenau sein.
- Deshalb darf eine Beta-Pruefung intern kurzzeitig groessere Toleranzen verwenden.
- Diese Toleranz darf aber nicht zur Produktregel werden.

## Datenschutz- und Consent-Grenze 2026-05-15

Diese Datei beschreibt sichere Platzierung und spaetere Pruefregeln. Sie aktiviert keine Standorterfassung, keine Live-Ortung, keine Safe-Zone-Logik, keine Produktionstracking-Funktion und keine Legaltext-Aenderung.

- Exakter Standort, GPS-Koordinaten, Checkpoint-Radius, Safe-Zones, Bewegungsverlauf und Nutzernaehe zu Orten sind protected und bleiben `review_required`.
- Standort darf nur fuer eine klar erklaerte Mission, mit Einwilligung, Datenminimierung, kurzer Speicherdauer und Fallback geplant werden.
- Checkpoint-Standort oder Radius darf hoechstens Evidence-/Plausibilitaets-/Safety-Signal sein; keine finale Reward-, XP-, Punkte-, Anti-Cheat- oder Mission-Completion-Autoritaet darf allein aus GPS, Radius oder Safe-Zone abgeleitet werden.
- Ablehnung einer Standortberechtigung darf die sichere Basisnutzung der App nicht blockieren, wenn ortsfreie Missionen, manuelle Review, QR/NFC-Alternativen oder Lern-/Bewegungsfallbacks moeglich sind.
- Kinder-/Familien-/Schul-/Vereinsorte, Spielplaetze, private Flaechen, medizinisch/behoerdlich sensible Orte und partnerbezogene Safe-Zones brauchen Human-/Legal-/Privacy-/Safety-Review vor jeder Implementierung.
- Keine dauerhafte Standorthistorie, kein Live-Tracking, keine Produktionserfassung und keine erweiterten Partner-/Werbe-/Versicherungsdaten werden durch diese Dokumentationsrunde erlaubt.

## Sicherheitsfilter vor Checkpoint-Freigabe

Ein Checkpoint darf spaeter nur freigegeben werden, wenn mindestens diese Pruefungen positiv sind:

1. Der Ort liegt auf oder nahe einer sicheren Fussgaengerflaeche.
2. Der Ort ist nicht auf einer Strasse, Autobahn, Bahnlinie oder Wasserflaeche.
3. Der Ort ist oeffentlich erreichbar oder ausdruecklich durch Partner freigegeben.
4. Der Ort hat keine erkennbare Gefahr durch Verkehr, Absturz, Sperre oder Privatbereich.
5. Der Ort ist passend fuer die Zielgruppe, z. B. Kinder, Familien, Senioren oder Erwachsene.
6. Der Ort kann in der App erklaert werden, damit Nutzer wissen, warum sie dorthin gehen.

## Datenquellen spaeter

Moegliche Quellen fuer Checkpoint-Pruefung:

- Google Maps Places / Roads / Geocoding
- OpenStreetMap / Overpass
- Partnerdaten von Museen, Zoos, Gemeinden, Schulen, Tourismusstellen
- manuelle Admin-Freigabe
- Nutzer-Feedback und Reports
- spaetere KI-Plausibilitaetspruefung

Keine einzelne Datenquelle darf blind als finale Wahrheit gelten. Gefaehrliche Orte muessen durch mehrere Signale ausgeschlossen werden.

## Checkpoint-Statusmodell

Jeder Checkpoint soll spaeter einen Status haben:

- draft
- pending_review
- approved
- rejected
- disabled
- partner_verified
- temporarily_blocked

## Mindestfelder fuer Checkpoint-Datenmodell

- checkpointId
- title
- description
- category
- latitude
- longitude
- radiusMeters
- safetyStatus
- placementType
- allowedAudience
- source
- partnerId optional
- reviewedBy optional
- reviewedAt optional
- riskFlags
- createdAt
- updatedAt

## Risk Flags

Beispiele:

- near_road
- near_rail
- near_water
- private_property
- unsafe_crossing
- construction_area
- low_gps_quality
- child_safety_review_required
- senior_safety_review_required
- partner_permission_required

## Nutzerkomfort

Der Nutzer soll nicht dauernd bestaetigen muessen.

Ziel:

- Standort wird bei Abenteuer, Challenge und Wettkaempfen automatisch genutzt, wenn erlaubt.
- Die Karte zentriert automatisch auf den Nutzer.
- Die App schlaegt sichere Checkpoints in der Naehe vor.
- Die Sicherheitspruefung laeuft im Hintergrund.

## Beta-Regel

In der aktuellen Web-Beta duerfen Checkpoints sichtbar vorbereitet werden, aber finale Rewards bleiben serverseitig/draftbasiert.

Keine finale Mission Completion nur durch Client-Standort.

## Offene Folgeaufgaben

- [ ] Checkpoint-Datenmodell als Draft in Code/Schema vorbereiten.
- [ ] Sichere Checkpoint-Kategorien in Missionen/Abenteuer/Challenges/Wettkaempfe vereinheitlichen.
- [ ] 20-Meter-Radius als Zielwert in serverseitige Evidence-Pruefung aufnehmen.
- [ ] Safety-Risk-Flags fuer Orte definieren.
- [ ] Admin-/Partner-Freigabe fuer Checkpoints planen.
- [ ] Google/OSM/Partnerdaten-Pruefung als spaeteren Server-Draft planen.
- [ ] Nutzer-Report-Funktion fuer unsichere Checkpoints planen.

## KI-Fortsetzungs-Prompt

Bei allen Standort-, Karten-, Abenteuer-, Challenge-, Wettkampf- und AR-Ort-Themen diese Datei zuerst lesen. Keine Checkpoints auf Strassen, Autobahnen, Gleisen, Wasserflaechen, Privatgrund ohne Freigabe oder gefaehrlichen Orten planen. Checkpoints sollen sichere, sinnvolle reale Orte sein und langfristig auf ca. 20 Meter Zielradius geprueft werden. Keine finale Reward-Autoritaet im Client.