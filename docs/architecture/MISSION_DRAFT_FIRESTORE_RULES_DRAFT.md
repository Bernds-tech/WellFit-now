# WellFit – MissionDraft Firestore Rules Draft

Stand: 2026-04-28
Status: Entwurf fuer spaetere Umsetzung in `firestore.rules`

## Zweck

MissionDrafts duerfen nicht direkt vom Client oder von einer ungeprueften KI produktiv geschrieben werden.

## Grundregel

```txt
Client darf MissionDrafts lesen, wenn erlaubt.
Client darf MissionDrafts nicht schreiben.
Server/Policy/Admin schreibt und prueft Drafts.
```

## Collections

```txt
missionDrafts
missionDraftReviews
missionDraftApprovals
```

## missionDrafts

```txt
match /missionDrafts/{draftId} {
  allow read: if isSignedIn()
    && resource.data.status == 'allowed';
  allow create, update, delete: if false;
}
```

Optional spaeter:

```txt
read eigene allowed/test Drafts
read kuratierte public Drafts
read partner Drafts nur bei Freigabe
```

## missionDraftReviews

```txt
match /missionDraftReviews/{reviewId} {
  allow read: if false;
  allow create, update, delete: if false;
}
```

Review-Daten sind serverintern.

## missionDraftApprovals

```txt
match /missionDraftApprovals/{approvalId} {
  allow read: if false;
  allow create, update, delete: if false;
}
```

Approvals sind server-/adminintern.

## Blockierte Felder in clientnahen Drafts

Ein Draft darf clientseitig nie Felder setzen wie:

```txt
rewardAuthorized
missionCompletionAuthorized
pointsGranted
xpGranted
ledgerEventId
rewardLedgerEventId
winnerUserId
payoutAmount
```

## Emulator-Testfaelle

- [ ] Client create `missionDrafts` -> PERMISSION_DENIED.
- [ ] Client update `missionDrafts` -> PERMISSION_DENIED.
- [ ] Client delete `missionDrafts` -> PERMISSION_DENIED.
- [ ] Client read allowed public draft -> erlaubt.
- [ ] Client read draft with `status=draft` -> PERMISSION_DENIED.
- [ ] Client write `missionDraftReviews` -> PERMISSION_DENIED.
- [ ] Client write `missionDraftApprovals` -> PERMISSION_DENIED.

## Bezug zu vorhandenen Seiten

Vorhandene Missionsseiten sollen spaeter nur allowed/approved Drafts anzeigen:

```txt
/missionen/tagesmissionen
/missionen/wochenmissionen
/missionen/abenteuer
/missionen/challenge
/missionen/wettkaempfe
```

## Naechster Schritt

- [ ] Emulator-Testplan fuer MissionDrafts erstellen.
- [ ] MissionDraft Preview API planen.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und die fuehrenden Dateien: `todolist/DATABASE_PLAN.md`, `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`.

Arbeite mit dieser Datei nur ergaenzend und nachvollziehbar. Loesche keine alten Aufgaben, Roadmap-Punkte, Statushinweise oder erledigten Eintraege. Markiere veraltete oder doppelte Punkte nur als `veraltet`, `duplikat`, `erledigt`, `offen` oder `zu pruefen`.

Wenn du offene Punkte aus dieser Datei uebernimmst, verlinke sie in `todolist/TODO_INDEX.md` oder uebertrage sie nach `todolist/NEXT_ACTIONS.md`. Dokumentiere erledigte Arbeit in `todolist/DONE_LOG.md`.

