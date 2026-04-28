# WellFit – AR Riddle Emulator Test Plan

Stand: 2026-04-28
Status: Testplan fuer spaetere Firestore Rules / Functions Emulator Tests

## Zweck

Dieser Testplan beschreibt, welche Security- und Reward-Grenzen fuer AR-Riddle-Collections im Emulator geprueft werden muessen.

## Ziel

```txt
Client darf eigene Evidence mit sicheren false-Flags erstellen.
Client darf niemals Memory, Preview, Ledger oder Rally Drafts schreiben.
```

## Test Setup

Testnutzer:

```txt
userA = authenticated
userB = authenticated
unauthenticated = null auth
```

Collections:

```txt
arQuestionEvidence
arQuestionMemory
arRewardPreviews
arRewardLedgerEvents
arRallyDrafts
```

## Positive Tests

### 1. userA creates own safe evidence

Erwartung: erlaubt

```txt
collection: arQuestionEvidence
userId = userA.uid
eventType = arQuestionAnswered
rewardAuthorized = false
missionCompletionAuthorized = false
pointsGranted = false
```

### 2. userA reads own evidence

Erwartung: erlaubt

```txt
resource.data.userId == userA.uid
```

## Negative Tests

### 3. unauthenticated creates evidence

Erwartung: PERMISSION_DENIED

### 4. userA creates evidence for userB

Erwartung: PERMISSION_DENIED

### 5. userA creates evidence with rewardAuthorized=true

Erwartung: PERMISSION_DENIED

### 6. userA creates evidence with missionCompletionAuthorized=true

Erwartung: PERMISSION_DENIED

### 7. userA creates evidence with pointsGranted=true

Erwartung: PERMISSION_DENIED

### 8. userA creates evidence with points/xp fields

Felder:

```txt
points
xp
pointsGrantedAmount
xpGrantedAmount
ledgerEventId
rewardLedgerEventId
```

Erwartung: PERMISSION_DENIED

### 9. userA updates evidence after create

Erwartung: PERMISSION_DENIED

### 10. userA deletes evidence

Erwartung: PERMISSION_DENIED

### 11. userA writes arQuestionMemory

Erwartung: PERMISSION_DENIED

### 12. userA writes arRewardPreviews

Erwartung: PERMISSION_DENIED

### 13. userA writes arRewardLedgerEvents

Erwartung: PERMISSION_DENIED

### 14. userA writes arRallyDrafts

Erwartung: PERMISSION_DENIED

### 15. userA reads userB documents

Erwartung: PERMISSION_DENIED

## Server/Admin Tests

Spaeter mit Admin SDK / Functions:

- [ ] Server kann Question Memory schreiben.
- [ ] Server kann Reward Preview schreiben.
- [ ] Server kann Reward Ledger Event schreiben.
- [ ] Server kann Rally Draft erstellen.

## Build-Hinweis

Dieser Testplan ist noch kein ausgefuehrter Emulator-Test. Er muss spaeter in den vorhandenen Functions-/Rules-Testplan integriert werden.

## Sicherheitsziel

Jeder Versuch, Punkte oder Ledger clientseitig aus AR-Fragen zu erzeugen, muss blockiert werden.
