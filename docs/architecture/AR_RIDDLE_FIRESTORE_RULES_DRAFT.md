# WellFit – AR Riddle Firestore Rules Draft

Stand: 2026-04-28
Status: Entwurf fuer spaetere Umsetzung in `firestore.rules`

## Zweck

Dieser Entwurf beschreibt die konkreten Firestore-Regeln fuer AR-Fragen, Question Memory, Reward Preview, Reward Ledger und Rally Drafts.

Der direkte Patch in `firestore.rules` wurde im Connector blockiert. Deshalb wird dieser Review-Entwurf als sichere Arbeitsgrundlage abgelegt.

## Grundsatz

```txt
Client darf Evidence senden.
Client darf niemals Punkte, XP, Reward Preview, Question Memory oder Ledger schreiben.
```

## Helper: sichere Evidence-Erstellung

```txt
function isSafeArQuestionEvidenceCreate() {
  return isSignedIn()
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.eventType == 'arQuestionAnswered'
    && request.resource.data.rewardAuthorized == false
    && request.resource.data.missionCompletionAuthorized == false
    && request.resource.data.pointsGranted == false
    && !request.resource.data.keys().hasAny([
      'points',
      'xp',
      'pointsGrantedAmount',
      'xpGrantedAmount',
      'ledgerEventId',
      'rewardLedgerEventId'
    ]);
}
```

## Collection: arQuestionEvidence

```txt
match /arQuestionEvidence/{eventId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create: if isSafeArQuestionEvidenceCreate();
  allow update, delete: if false;
}
```

## Collection: arQuestionMemory

```txt
match /arQuestionMemory/{memoryId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create, update, delete: if false;
}
```

## Collection: arRewardPreviews

```txt
match /arRewardPreviews/{previewId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create, update, delete: if false;
}
```

## Collection: arRewardLedgerEvents

```txt
match /arRewardLedgerEvents/{ledgerEventId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create, update, delete: if false;
}
```

## Collection: arRallyDrafts

```txt
match /arRallyDrafts/{draftId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create, update, delete: if false;
}
```

## Erwartete Emulator-Testfaelle

- [ ] Client create `arQuestionEvidence` mit Flags false -> erlaubt.
- [ ] Client create `arQuestionEvidence` mit `rewardAuthorized=true` -> PERMISSION_DENIED.
- [ ] Client create `arQuestionEvidence` mit `missionCompletionAuthorized=true` -> PERMISSION_DENIED.
- [ ] Client create `arQuestionEvidence` mit `pointsGranted=true` -> PERMISSION_DENIED.
- [ ] Client write `arQuestionMemory` -> PERMISSION_DENIED.
- [ ] Client write `arRewardPreviews` -> PERMISSION_DENIED.
- [ ] Client write `arRewardLedgerEvents` -> PERMISSION_DENIED.
- [ ] Client write `arRallyDrafts` -> PERMISSION_DENIED.

## Wichtiger Hinweis zu bestehender User-Logik

In `firestore.rules` gibt es aktuell noch alte user-writable Felder wie `points`, `xp`, `level`, `energy` in `/users/{userId}`.

Das ist ein separater Refactor-Risikoanker:

```txt
Clientseitige Punkte-/XP-Schreibrechte muessen spaeter aus /users entfernt oder serverseitig ersetzt werden.
```

Fuer AR-Riddle gilt schon jetzt: keine neue Client-Punktevergabe hinzufuegen.
