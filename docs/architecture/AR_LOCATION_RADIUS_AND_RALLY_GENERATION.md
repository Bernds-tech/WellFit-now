# WellFit – AR Location Radius & Rally Generation

Stand: 2026-04-28
Status: Architekturanker fuer ortsnahe AR-Raetselrallyes und KI-Missionsgenerierung

## Zweck

AR-Raetselrallyes muessen immer zur aktuellen Umgebung des Nutzers passen. Der Nutzer soll nicht erst lange fahren muessen, um eine Aufgabe zu erleben.

Beispiele:

```txt
Waldrand
Park
Spielplatz
Museum
Stadtplatz
Burg
Zoo
Schulhof
Wohnumgebung mit sicheren oeffentlichen Punkten
```

## Grundregel

```txt
Rallyes starten in der Naehe des aktuellen Standorts.
Aufgaben liegen in erreichbarer Umgebung.
Radius, Schwierigkeit und Dauer passen zu Alter, Modus, Fitnesslevel und Sicherheit.
```

## Keine langen Zwangswege

Nicht erlaubt:

```txt
Nutzer muss eine Stunde fahren
Nutzer muss unsichere Orte aufsuchen
Nutzer muss Privatgrund betreten
Kind bekommt Erwachsenenroute
Senior bekommt zu lange Strecke
```

## Radius-Logik v1

Vorgeschlagene Startwerte:

```txt
Kinder/Familie: 100–500 m
Senioren: 100–700 m
Erwachsene kurz: 300 m–1.5 km
Erwachsene Outdoor: 1–5 km
Schule/Museum/Zoo: Gelaende-/POI-basiert
```

Der Algorithmus darf diese Werte anpassen, aber nur innerhalb von Sicherheits- und UX-Grenzen.

## KI-Rolle

Die KI darf selbststaendig Vorschlaege erzeugen:

```txt
Welche Aufgaben passen zur Umgebung?
Welche Reihenfolge ist sinnvoll?
Welche Frage passt zu Alter und Kontext?
Welche Schwierigkeit ist angemessen?
Welche Orte sind sicher und erreichbar?
```

Aber:

```txt
KI entscheidet keine Punkte
KI entscheidet keine finale Mission Completion
KI darf keine unsicheren Orte erzwingen
KI muss Serverregeln/Policy respektieren
```

## Server-/Policy-Rolle

Server/Backend kontrolliert:

```txt
Radiusgrenzen
Alters-/Familienmodus
Sicherheitsregeln
Wiederholschutz
Reward Policy
Caps
Evidence
Completion
Punkte-Ledger
```

## Rally Generation Input

```txt
userId
ageBand
parentMode
currentLocationHash oder grober Standort
allowedRadiusMeters
missionDurationTarget
mobilityMode = walk | wheelchair | bike | indoor | museum | school
interestTags
weatherContext optional
poiContext optional
questionHistorySummary
riskLevel
```

## Rally Generation Output

```txt
rallyDraftId
missionType
estimatedDurationMinutes
radiusMeters
waypoints
questionDrafts
safetyNotes
requiresServerApproval
rewardPreviewUnavailableUntilEvidence
```

## Waypoint-Regeln

Ein Waypoint muss:

```txt
oeffentlich oder sicher erreichbar sein
im erlaubten Radius liegen
keine Privatadresse offenlegen
keine Gefahrzone sein
optional barrierearm markiert sein
```

## Beziehung zu Question Memory

Vor dem Generieren neuer Fragen muss die KI/Policy beachten:

```txt
Was wurde hier schon gefragt?
Welche Objekte/POIs wurden bereits genutzt?
Welche Schwierigkeit ist faellig?
Welche Wiederholung ist blockiert?
```

## Beziehung zum Reward Algorithmus

Die Rallye-Generierung darf nur eine moegliche Schwierigkeit und Aufgabe vorschlagen.

Punkte entstehen erst spaeter:

```txt
Evidence -> Question Memory -> Reward Policy -> Server Ledger
```

## Akzeptanzkriterien v1

- [ ] Rallye bleibt im Nahbereich des Nutzers.
- [ ] Radius ist alters- und kontextsensibel.
- [ ] KI kann Aufgaben vorschlagen.
- [ ] Server/Policy kann Vorschlag ablehnen oder begrenzen.
- [ ] Keine Punktevergabe durch KI oder Client.
- [ ] Aufgabenhistorie wird beruecksichtigt.
- [ ] Keine langen Pflichtwege.
