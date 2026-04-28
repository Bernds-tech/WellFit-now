# WellFit – KI Buddy Mission Engine

Stand: 2026-04-28
Status: Architekturanker fuer KI-generierte Missionen in vorhandenen Missionsseiten

## Zweck

Die Seiten fuer Missionen existieren bereits. Die Missionen darin sind aktuell noch Platzhalter oder vorbereitete Container.

Die KI-Buddy-/Mission-Engine soll spaeter echte Missionen erzeugen, vorschlagen und in vorhandene Bereiche einsortieren.

## Vorhandene Zielbereiche

```txt
/missionen/tagesmissionen
/missionen/wochenmissionen
/missionen/abenteuer
/missionen/challenge
/missionen/wettkaempfe
/missionen/favoriten
/missionen/history
```

## Aufgabe der KI-Buddy-/Mission-Engine

Die Engine darf:

```txt
Missionen draften
ortsnahe Rallyes vorschlagen
altersgerechte Aufgaben formulieren
Schwierigkeit vorschlagen
Mission Category vorschlagen
Antwortoptionen vorschlagen
Buddy-Dialog vorschlagen
Partner-/Sponsor-Kontext beruecksichtigen
```

Die Engine darf nicht:

```txt
Mission final freigeben
Punktehoehe autorisieren
Reward-Ledger schreiben
Mission Completion autorisieren
Wettkampf-Sieger final bestimmen
Partner-Challenge ohne Serverfreigabe aktivieren
```

## Server-/Policy-Rolle

Server/Policy entscheidet:

```txt
Mission Category
Freigabe
Sichtbarkeit
Reward Policy
Caps
Anti-Cheat
Completion
Ledger
History-Eintrag
Favoriten-Verhalten
```

## Mission Draft Lifecycle

```txt
1. KI erzeugt MissionDraft
2. Server prueft Sicherheit, Kategorie, Alter, Radius, Wiederholung
3. Server markiert Draft als allowed / rejected / needsReview
4. UI zeigt nur erlaubte Drafts
5. Nutzer startet Mission oder Side Quest
6. Evidence entsteht
7. Reward Policy und Ledger entscheiden spaeter Punkte
```

## MissionDraft Mindestfelder

```txt
draftId
createdBy = ki-buddy | server | curator | partner
suggestedCategory
sourceContext = ar | location | daily | weekly | sponsor | competition
ageBand
parentMode optional
title
description
estimatedDurationMinutes
radiusMeters optional
questionDrafts optional
waypoints optional
safetyNotes
requiresServerApproval = true
rewardPreviewUnavailableUntilEvidence = true
status = draft | allowed | rejected | needsReview
```

## Kategorien

```txt
daily
weekly
adventure
challenge
competition
arSideQuest
```

## AR Side Quest Sonderregel

AR-Buddy-Nebenmissionen entstehen spontan und zaehlen nicht automatisch als Hauptmission.

Sie koennen spaeter durch Server/Policy zugeordnet werden:

```txt
Side Quest -> Abenteuer-Etappe
Side Quest -> Tagesbonus
Side Quest -> Standort-Rallye
Side Quest -> Lernserie
```

## Beispiele

### Tagesmission

```txt
Gehe heute 10.000 Schritte
```

### Wochenmission

```txt
Gehe 100.000 Schritte innerhalb einer Woche
```

### Abenteuer

```txt
Museum-Raetselrallye mit 5 Stationen
```

### Challenge

```txt
Adidas Parklauf Challenge
```

### Wettkampf

```txt
Mathe-Duell gegen anderen Nutzer
```

### AR Side Quest

```txt
Was ist das fuer ein Blatt?
```

## Security

Jeder MissionDraft ist zuerst nur ein Vorschlag.

```txt
Kein Draft vergibt Punkte.
Kein Draft schliesst Missionen ab.
Kein Draft schreibt Ledger.
```

## Naechste Schritte

- [ ] TypeScript-Typen fuer MissionDraft definieren.
- [ ] API/Function fuer Mission Draft Preview planen.
- [ ] Serverfreigabeprozess fuer Drafts planen.
- [ ] UI-Kennzeichnung fuer Platzhalter vs KI-generierte Missionen planen.
- [ ] History-/Favoriten-Verhalten fuer Side Quests definieren.
