# WellFit – Firestore Economy Rules Hardening Test Plan

Stand: 2026-07-23  
Status: Tagesmissions-Härtung aktiv

## Ziel

Firestore-Schreibrechte werden erst entfernt, nachdem der jeweilige Produktbereich einen geprüften Serverpfad verwendet. Die Tagesmissionsmigration ist abgeschlossen; die allgemeine `users/{userId}`-Kompatibilitätsbrücke bleibt vorerst separat bestehen.

## Aktuelle Regeln

### Sichere Profilfelder

Diese Felder dürfen weiterhin durch den Eigentümer gepflegt werden, solange sie keine Fortschritts- oder Reward-Autorität erzeugen:

```txt
updatedAt
lastLoginAt
profile
settings
consent
inventory
```

### Verbleibende allgemeine Kompatibilitätsfelder

```txt
points
avatar
lastMissionCompletedAt
xp
level
stepsToday
energy
deviceLocation
```

Diese Felder werden in diesem Schritt nicht gesperrt. Zuerst müssen alle noch aktiven Consumer inventarisiert und einzeln migriert werden.

### Tagesmissions-Collections

```txt
userDailyMissionState/{stateId}
userDailyStreaks/{userId}
userLevels/{userId}
```

Erwartung:

```txt
Eigentümer liest eigenes Dokument       ALLOW
Anderer Nutzer liest Dokument           DENY
Nicht angemeldeter Nutzer liest         DENY
Client erstellt Dokument                DENY
Client ändert Dokument                  DENY
Client löscht Dokument                   DENY
Server-Callable schreibt                ALLOW
```

Die aktive Tagesmissionsseite verwendet `saveDailyMissionPreferences` und `getDailyMissionProgress`. Abschluss, Streak und Level entstehen aus den serverseitigen Mission-Completions und der WFXP-Wallet.

## Prüfungen

### Statischer Regelcheck

```bash
npm run agent:firestore-economy-rules-check
```

Er prüft unter anderem:

- Rules Version 2 und Default-Deny
- Trennung sicherer Profilfelder von der verbleibenden allgemeinen Brücke
- Eigentümer-Read-Regeln der drei Tagescollections
- gesperrte Client-Schreibvorgänge der drei Tagescollections
- gesperrte Client-Schreibvorgänge weiterer Economy-Collections

### Regeln im Emulator

```bash
npm run agent:firestore-economy-rules-emulator-test
npm --prefix functions run beta1:rules
```

Der erste Test prüft die allgemeine Guardrail-Haltung. Der zweite Test legt Serverdaten unter deaktivierten Regeln an und prüft Eigentümer-, Fremdnutzer- und Anonymous-Zugriff sowie Create, Update und Delete.

### Vollständige Runtime-Regression

```bash
npm --prefix functions run beta1:test:emulator
npm run build
```

Die Suite muss weiterhin Preferences, Attempt, Evidence, Admin-Review, Completion, Tagesziel, Streak, WFXP-Buchung und Doppelvergütungsschutz abdecken. Der Produktbuild muss Next.js und TypeScript erfolgreich prüfen.

## Akzeptanzkriterien

- Der Tagesmissionsclient enthält keine direkten Firestore-Schreibvorgänge auf die drei Legacy-Collections.
- Eigentümer können bestehende Projektionen lesen.
- Andere und nicht angemeldete Nutzer erhalten keinen Zugriff.
- Client Create, Update und Delete werden abgewiesen.
- Die Callable-basierten Tagesmissionen bleiben vollständig funktionsfähig.
- Die allgemeine `users/{userId}`-Brücke wird nicht unbeabsichtigt verändert.
- Es erfolgt keine Produktionsbereitstellung.

## Nächster Schritt

Alle aktiven Schreibstellen auf den allgemeinen Kompatibilitätsfeldern werden nach Produktbereich inventarisiert. Danach wird jeweils der kleinste Consumer auf bestehende WFXP-, `userAvatars`- oder Serverprojektionspfade umgestellt. Ein Feld wird erst nach grüner Regression aus der Regel-Ausnahme entfernt.
