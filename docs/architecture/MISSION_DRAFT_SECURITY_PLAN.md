# WellFit – Mission Draft Security Plan

Stand: 2026-04-28
Status: Security-Plan fuer KI-generierte MissionDrafts

## Zweck

KI-generierte Missionen duerfen nicht automatisch produktiv werden.

Ein MissionDraft ist nur ein Vorschlag.

## Grundsatz

```txt
KI erzeugt Draft
Server/Policy prueft Draft
nur erlaubte Drafts werden sichtbar
Reward/Completion/Ledger bleiben serverseitig
```

## Vorgeschlagene Collections

```txt
missionDrafts
missionDraftReviews
missionDraftApprovals
```

## missionDrafts

Zweck:

```txt
KI-, Server-, Kurator- oder Partner-Vorschlaege fuer Missionen.
```

Schreibrechte:

```txt
Client: kein write
KI-Client direkt: kein write
Server/Function: create/update
```

Leserechte:

```txt
Client liest nur allowed Drafts oder eigene freigegebene Vorschlaege
```

## missionDraftReviews

Zweck:

```txt
Policy-, Safety-, Alters-, Radius-, Reward- und Anti-Cheat-Pruefung.
```

Schreibrechte:

```txt
Client: kein write
Server: create/update
```

## missionDraftApprovals

Zweck:

```txt
Freigabe fuer Anzeige, Test oder produktive Nutzung.
```

Schreibrechte:

```txt
Client: kein write
Server/Admin/Curator: create/update je nach Rolle
```

## Draft Status

```txt
draft
needsReview
allowed
rejected
archived
```

## Harte Verbote

Ein Draft darf nicht enthalten oder ausloesen:

```txt
pointsGranted
xpGranted
rewardAuthorized=true
missionCompletionAuthorized=true
ledgerEventId
clientRewardDecision
```

## KI-Output muss normalisiert werden

KI darf freie Vorschlaege machen, aber Server muss normalisieren:

```txt
Kategorie
Alter
Radius
Sicherheitsnotiz
Dauer
Schwierigkeit
Reward Preview unavailable until Evidence
requiresServerApproval=true
```

## Partner-/Sponsor-Challenges

Partner koennen Challenges vorschlagen, aber:

```txt
Partner schreibt nicht direkt produktive Challenge
Server/Policy prueft Inhalt, Sicherheit, Alter, Radius, Reward und Branding
```

## Emulator-Testziele

- [ ] Client kann `missionDrafts` nicht schreiben.
- [ ] Client kann `missionDraftReviews` nicht schreiben.
- [ ] Client kann `missionDraftApprovals` nicht schreiben.
- [ ] Client kann keinen Draft mit `rewardAuthorized=true` erzeugen.
- [ ] Client kann keinen Draft mit Ledger-Feldern erzeugen.

## Beziehung zu vorhandenen Seiten

Vorhandene Seiten bleiben Container:

```txt
/missionen/tagesmissionen
/missionen/wochenmissionen
/missionen/abenteuer
/missionen/challenge
/missionen/wettkaempfe
```

Sie duerfen spaeter nur erlaubte/approved MissionDrafts anzeigen.

## Naechste Schritte

- [ ] Firestore Rules Draft fuer MissionDrafts erstellen.
- [ ] MissionDraft Emulator Testplan erstellen.
- [ ] MissionDraft Preview API planen.
- [ ] UI-Badge fuer Platzhalter/Draft/Approved Mission planen.
