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

## Emulator prerequisites and boundaries

- MissionDraft emulator tests require a local Firebase emulator setup with Firebase CLI, Java, free Auth/Firestore/Functions ports and local-only environment configuration.
- `npm --prefix functions run check` is only the Functions syntax check; it does not start emulators, publish Firestore rules, deploy Functions or prove MissionDraft runtime behavior.
- Full emulator execution must use running services and must remain local/demo-project only. Do not point MissionDraft tests at production data.
- A documentation-only pass may clarify these prerequisites, but must not edit `functions/**`, `firestore.rules`, `firebase.json`, deployment workflows or protected reward/mission-authority logic.

## Sicherheitsziel

```txt
KI und Client liefern Vorschlaege.
Server/Policy entscheidet, was sichtbar wird.
Keine MissionDrafts duerfen Punkte, XP, Completion oder Ledger autorisieren.
```

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und die fuehrenden Dateien: `todolist/DATABASE_PLAN.md`, `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`.

Arbeite mit dieser Datei nur ergaenzend und nachvollziehbar. Loesche keine alten Aufgaben, Roadmap-Punkte, Statushinweise oder erledigten Eintraege. Markiere veraltete oder doppelte Punkte nur als `veraltet`, `duplikat`, `erledigt`, `offen` oder `zu pruefen`.

Wenn du offene Punkte aus dieser Datei uebernimmst, verlinke sie in `todolist/TODO_INDEX.md` oder uebertrage sie nach `todolist/NEXT_ACTIONS.md`. Dokumentiere erledigte Arbeit in `todolist/DONE_LOG.md`.

