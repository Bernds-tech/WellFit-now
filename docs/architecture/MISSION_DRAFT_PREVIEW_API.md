# WellFit – MissionDraft Preview API

Stand: 2026-04-28
Status: Architekturanker fuer sichere Vorschau KI-generierter MissionDrafts

## Zweck

KI-generierte Missionen duerfen nicht sofort produktiv sichtbar oder belohnbar werden.

Diese Preview API beschreibt den sicheren ersten Pfad:

```txt
KI/Client fragt MissionDraft-Vorschlag an
Server normalisiert und prueft
Server gibt Preview zurueck
Noch keine Mission Completion
Noch keine Punkte
Noch kein Ledger
```

## Vorgeschlagener Endpoint

```txt
POST /api/missions/draft-preview
```

Alternative spaeter:

```txt
Callable Function: previewMissionDraft
```

## Request Input

```txt
userId
buddyId optional
requestedCategory optional
currentRoute optional
ageBand
parentMode optional
locationHash optional
allowedRadiusMeters optional
interestTags optional
availableTimeMinutes optional
sourceContext = ar | daily | weekly | adventure | challenge | competition | sponsor
```

## Server-Pruefung

Server prueft:

```txt
auth user
ageBand / parentMode
Radius und Standortnaehe
Kategorie
Safety
Wiederholungen
bestehende Missionen
G1-/Reward-Grenzen
App-Store-/Mobile-Grenzen
```

## Response Output

```txt
MissionDraft
```

Aber mit:

```txt
requiresServerApproval = true
rewardPreviewUnavailableUntilEvidence = true
status = draft | needsReview
```

## Nicht erlaubt

Die Preview darf nicht enthalten:

```txt
pointsGranted
xpGranted
rewardAuthorized=true
missionCompletionAuthorized=true
ledgerEventId
winnerUserId
payoutAmount
```

## UI-Verhalten

Erlaubt:

```txt
KI schlaegt Mission vor
UI zeigt: Vorschlag / Preview
Nutzer kann Interesse zeigen
Server kann spaeter erlauben
```

Nicht erlaubt:

```txt
UI zeigt Draft als fertige Mission
UI schreibt Punkte
UI markiert Mission abgeschlossen
```

## Beispiel

```txt
Nutzer steht im Park.
Buddy fragt Server nach Vorschlag.
Server erzeugt Draft: Natur-Raetselrallye 15 Minuten im Radius 500m.
UI zeigt: Vorschlag vom Buddy.
Noch kein Reward.
```

## Beziehung zu vorhandenen Seiten

Allowed/approved Drafts koennen spaeter in vorhandenen Bereichen erscheinen:

```txt
/missionen/tagesmissionen
/missionen/wochenmissionen
/missionen/abenteuer
/missionen/challenge
/missionen/wettkaempfe
```

## Naechste Schritte

- [ ] TypeScript Input/Output fuer MissionDraft Preview definieren.
- [ ] UI-Badge fuer Draft/Preview/Approved definieren.
- [ ] Firestore Rules spaeter um MissionDrafts erweitern.
- [ ] Emulator-Testplan spaeter implementieren.
