# WellFit – MissionDraft Emulator Test Plan

Stand: 2026-04-28
Status: Testplan fuer spaetere Firestore Rules / Functions Emulator Tests

## Zweck

Dieser Testplan prueft, dass KI-generierte MissionDrafts nicht clientseitig produktiv geschrieben oder manipuliert werden koennen.

## Collections

```txt
missionDrafts
missionDraftReviews
missionDraftApprovals
```

## Testnutzer

```txt
userA = authenticated
userB = authenticated
unauthenticated = null auth
```

## Positive Tests

### 1. userA reads allowed missionDraft

Erwartung: erlaubt, wenn:

```txt
resource.data.status == allowed
```

## Negative Tests

### 2. unauthenticated reads missionDraft

Erwartung: PERMISSION_DENIED

### 3. userA reads draft status missionDraft

Erwartung: PERMISSION_DENIED

```txt
resource.data.status == draft
```

### 4. userA creates missionDraft

Erwartung: PERMISSION_DENIED

### 5. userA updates missionDraft

Erwartung: PERMISSION_DENIED

### 6. userA deletes missionDraft

Erwartung: PERMISSION_DENIED

### 7. userA creates missionDraft with rewardAuthorized=true

Erwartung: PERMISSION_DENIED

### 8. userA creates missionDraft with missionCompletionAuthorized=true

Erwartung: PERMISSION_DENIED

### 9. userA creates missionDraft with pointsGranted/xpGranted

Erwartung: PERMISSION_DENIED

### 10. userA writes missionDraftReviews

Erwartung: PERMISSION_DENIED

### 11. userA writes missionDraftApprovals

Erwartung: PERMISSION_DENIED

## Server/Admin Tests spaeter

- [ ] Server can create missionDraft.
- [ ] Server can update review state.
- [ ] Server can approve allowed Draft.
- [ ] Server can reject unsafe Draft.

## Sicherheitsziel

```txt
KI und Client liefern Vorschlaege.
Server/Policy entscheidet, was sichtbar wird.
Keine MissionDrafts duerfen Punkte, XP, Completion oder Ledger autorisieren.
```
