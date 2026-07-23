# WellFit – Economy Server Completion and Firestore Hardening

Stand: 2026-07-23  
Status: aktive, stufenweise Sicherheitsmigration

## Zweck

Dieses Dokument beschreibt den aktuellen Autoritätspfad für interne WellFit-XP (`WFXP`) und die verbleibende Firestore-Härtung.

```txt
Client Request
  -> Server Attempt / Intent
  -> Evidence / Validation / Review
  -> Server Completion
  -> WFXP Ledger + Audit
  -> Owner-scoped Read Projection
```

WFXP sind interne Beta-Punkte ohne Geldwert. Es gibt in diesem Runtime-Pfad keine Tokenisierung, keine Auszahlung, kein NFT, kein Trading und keine Blockchain-Übertragung.

## Stand nach den Migrationen vom 23. Juli 2026

### Abgeschlossen

- Dashboard-Missionen schreiben keine Punkte, XP, Level oder Avatarwerte direkt.
- Mission Completion benötigt serverseitig freigegebene Evidence.
- WFXP werden idempotent im serverseitigen Ledger und Wallet verbucht.
- Das Dashboard liest den WFXP-Saldo aus der Beta-1-Wallet.
- Buddy-Futter läuft über serverseitigen Kauf-Intent, atomaren WFXP-Spend, Inventar und `userAvatars`.
- Die Tagesmissionsseite nutzt den kanonischen Katalog und den bestehenden Attempt/Evidence/Review/Completion-Pfad.
- Tagesziel, Streak und Level werden durch `getDailyMissionProgress` aus `missionCompletions` und `xpWallets` abgeleitet.
- Eine Tagesmission kann pro Nutzer und Europe/Vienna-Kalendertag nur einmal WFXP erzeugen.
- `userDailyMissionState`, `userDailyStreaks` und `userLevels` sind für Clients read-only.

### Noch offen

Die allgemeine Kompatibilitätsregel für `users/{userId}` erlaubt weiterhin einige alte Economy-Felder:

```txt
points
xp
level
stepsToday
lastMissionCompletedAt
avatar
energy
deviceLocation
```

Diese Brücke darf erst entfernt werden, wenn alle verbliebenen, nicht zu Dashboard-Missionen, Buddy-Care oder Tagesmissionen gehörenden UI-Pfade geprüft und auf Serverprojektionen umgestellt sind.

## Harte Produktgrenzen

- WFXP bleiben interne Beta-Punkte.
- Kein Geldwert und kein Cash-out.
- Keine echten Token oder Wallet-Transfers.
- Keine NFTs, Presales, Staking-, DAO- oder Trading-Funktionen.
- Keine Client-Autorität für Reward, Mission Completion, Wallet, Ledger, Streak oder Level.
- Geschützte Entscheidungen bleiben serverseitig und auditierbar.
- Firestore-Härtung erfolgt nur nach erfolgreicher UI- und Runtime-Migration.

## Autoritätsbereiche

### 1. Missionen

```txt
missions
missionAttempts
missionEvidence
missionCompletions
xpLedgerEvents
xpWallets
auditEvents
```

- `startMissionAttempt` startet oder verwendet einen bestehenden sicheren Attempt.
- `submitMissionEvidence` nimmt Evidence entgegen, autorisiert aber keine WFXP.
- `adminReviewMissionEvidence` entscheidet getrennt vom Nutzerclient.
- `completeMissionAttempt` erzeugt den Abschluss und die Ledgerbuchung idempotent.

### 2. Tagesmissionen

```txt
saveDailyMissionPreferences
getDailyMissionProgress
startMissionAttempt
submitMissionEvidence
adminReviewMissionEvidence
completeMissionAttempt
```

Die Tagesmissionsseite schreibt keine Abschluss-, XP-, Level-, Streak- oder Buddy-Werte. Lokaler Speicher enthält nur nicht-autorisierende Gast- beziehungsweise UI-Präferenzen.

Die serverseitige Projektion verwendet:

```txt
userDailyMissionState       nur Präferenzen, Server-Write
missionAttempts             Start-/Review-Lebenszyklus
missionEvidence             Evidence-Status
missionCompletions          abgeschlossene Missionen
xpWallets.lifetimeEarned    XP-/Level-Ableitung
```

Legacy-Collections bleiben für Eigentümer lesbar, aber Clientwrites sind gesperrt:

```txt
userDailyMissionState
userDailyStreaks
userLevels
```

### 3. Buddy Care

```txt
shopItems
shopPurchaseIntents
shopPurchaseEvents
xpLedgerEvents
xpWallets
userInventory
userAvatars
auditEvents
```

Der Client kann weder Saldo noch Inventargrant oder Buddy-Zustand direkt schreiben.

### 4. Allgemeine Nutzerprojektion

Die alte `/api/economy/user-projection`-Vorstufe bleibt nur für noch nicht migrierte Balance-/Avatar-Anzeigen bestehen. Sie ist keine finale Autorität. Für Tagesmissionen wird sie nicht mehr verwendet.

## Firestore-Regelstatus

### Client read-only / server write-only

```txt
userDailyMissionState
userDailyStreaks
userLevels
missionAttempts
missionEvidence
missionCompletions
xpWallets
xpLedgerEvents
ledgerEvents
auditEvents
userEconomyProjections
pointsSinkEvents
userInventory
userAvatars
shopPurchaseIntents
shopPurchaseEvents
```

Eigentümer beziehungsweise berechtigte Guardians dürfen nur die für sie vorgesehenen Dokumente lesen. Create, Update und Delete sind für Clients gesperrt.

### Noch temporär client-writable

```txt
users/{userId}
```

Nur die im Rule-Helper ausdrücklich aufgezählten Profil- und Bridge-Felder. Diese Ausnahme ist nicht die Zielarchitektur.

## Testanforderungen

Jede weitere Härtung benötigt mindestens:

1. statischen Regelcheck,
2. Firestore Rules Emulator Tests,
3. Callable-Emulatortests für den Ersatzpfad,
4. Next.js-/TypeScript-Produktbuild,
5. Prüfung auf Eigentümer-Isolation,
6. Prüfung von Create, Update und Delete,
7. Idempotenz- und Doppelvergütungsschutz.

Für die Tagescollections werden konkret geprüft:

```txt
Owner read                              ALLOW
Other-user read                         DENY
Anonymous read                          DENY
Client create                           DENY
Client update                           DENY
Client delete                           DENY
Callable preference/progress workflow   ALLOW
```

## Migrationsmatrix

| Bereich | Client-Read | Client-Write | Server-Autorität | Status |
|---|---:|---:|---:|---|
| Dashboard-Missionen | ja | nein | ja | abgeschlossen |
| WFXP Wallet/Ledger | ja, owner-scoped | nein | ja | abgeschlossen |
| Buddy Care | ja, owner-scoped | nein | ja | abgeschlossen |
| Tagesmissionen | Callable/owner read | nein | ja | abgeschlossen |
| Tages-Streak/Level | Callable/legacy owner read | nein | ja | abgeschlossen |
| Allgemeine `users`-Economy-Felder | ja | teilweise | teilweise | nächste Migrationsphase |

## Nächster sicherer Codeblock

1. Aktive Schreibstellen auf `users.points`, `users.xp`, `users.level`, `users.stepsToday`, `users.avatar` und `users.lastMissionCompletedAt` inventarisieren.
2. Nach Produktbereich gruppieren, statt alle Felder gleichzeitig zu sperren.
3. Den kleinsten noch aktiven Consumer auf bestehenden WFXP-/`userAvatars`-/Serverprojektionspfad umstellen.
4. Emulator- und Buildprüfungen ausführen.
5. Erst danach die zugehörigen Felder aus `hasOnlyTemporaryEconomyBridgeKeys()` entfernen.

Die allgemeine `users`-Brücke wird nicht aufgrund einer Dokumentationsannahme geschlossen, sondern ausschließlich nach nachgewiesener Runtime-Migration.
