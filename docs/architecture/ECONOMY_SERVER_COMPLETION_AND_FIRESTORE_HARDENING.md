# WellFit – Economy Server Completion and Firestore Hardening

Stand: 2026-05-09
Status: Security-Haertungsplan / Beta-Vorstufe

## Zweck

Diese Datei strukturiert den naechsten Sicherheitsausbau fuer interne Punkte, XP, Level, Avatar-Zustand und Mission Completion.

Ziel ist nicht, die Beta sofort zu brechen. Ziel ist, die aktuelle MVP-Client-Logik sauber zu markieren und den Zielpfad vorzubereiten:

```txt
RewardPreview -> Completion -> Ledger -> Audit -> Projection
```

## Harte Produktgrenzen

- Keine echten Token.
- Keine NFTs.
- Keine Wallet-Funktion.
- Keine Auszahlungen.
- Keine echten Kaeufe.
- Keine Presale-, Trading-, Staking- oder DAO-Funktion.
- Mobile/App-Store-Pfad bleibt geschuetzt.
- Interne Punkte bleiben die Beta-Waehrung.

## Aktueller Risikoanker

`firestore.rules` erlaubt aktuell im MVP noch Owner-Updates auf `users/{userId}` fuer Felder wie:

```txt
points
xp
level
avatar
energy
stepsToday
lastMissionCompletedAt
deviceLocation
```

Ausserdem sind folgende nutzernahe Fortschritts-Collections noch clientnah:

```txt
userDailyMissionState/{stateId}
userDailyStreaks/{userId}
userLevels/{userId}
```

Diese Rechte sind fuer die UI-/Beta-Prototypen entstanden. Sie duerfen nicht die finale Reward-, XP-, Level- oder Economy-Autoritaet bleiben.

## Bereits server-only gesperrte Collections

Die folgenden Collections sind in `firestore.rules` bereits fuer Client-Create/Update/Delete gesperrt und duerfen nur ueber Server-/Admin-/Cloud-Function-Pfade beschrieben werden:

```txt
missionRewardPreviews
missionRewardEvents
missionEvidenceReviews
missionPatternReviews
missionCooldownReviews
missionCompletionEvaluations
missionContextEvaluations
systemReserveSnapshots
trackingSessions
trackingProofEvents
userInventory
buddyCapabilities
capabilityUnlockEvents
buddyItemUseEvents
nfcScanEvents
```

## Neue Code-Struktur

Neue fuehrende Datei:

```txt
lib/economy/serverCompletionPlan.ts
```

Zweck:
- listet riskante Client-Schreibfelder
- beschreibt Zielstatus `server_only_target`
- definiert Completion-Stufen
- markiert server-only Collections
- stellt eine kompakte Plan-Zusammenfassung fuer API/UI/Docs bereit

Neue API:

```txt
app/api/economy/security-plan/route.ts
```

Zweck:
- gibt den aktuellen Security-/Completion-Plan lesbar aus
- aktiviert keine finale Punktebuchung
- aktiviert keine Tokens/NFTs/Wallets
- dient als Kontroll- und Dokumentations-Endpoint fuer die naechste Server-Stufe

## Zielarchitektur

### 1. Reward Preview

Der Server berechnet eine Preview:

```txt
requestedPoints
reserveAdjustedPoints
cappedPoints
status: preview_allowed | manual_review | blocked
ledgerEvent preview summary
```

Wichtig: Preview ist keine finale Punktegutschrift.

### 2. Completion Validation

Der Server prueft spaeter:

```txt
Auth / User
Mission ID / Mission Type
Evidence Summary
Cooldown Risk
Pattern Risk
Proof Quality
DailyEmissionCap
UserDailyCap
MissionTypeCap
Reserve/EconomyHealthScore
```

### 3. Ledger Event

Nur der Server schreibt das finale Event:

```txt
missionRewardEvents/{eventId}
```

oder fuer Ausgaben:

```txt
internalSpendEvents / pointsSpent ledger event
```

Das Ledger wird Quelle der Wahrheit.

### 4. Projection

User-Punkte, XP, Level, Avatar-Zustand und Streaks werden abgeleitete Ansichten:

```txt
LedgerEvents -> UserStats/UserBalance/UserLevel/UserAvatar projection
```

Der Client liest diese Ansichten, schreibt sie aber nicht final.

### 5. Audit / Review / Correction

Jede Review- oder Blockadeentscheidung muss auditierbar sein:

```txt
manual_review
blocked
rejected
correction
rollback
```

Falsche Buchungen werden durch Korrektur-Events repariert, nicht durch Client-Updates.

## Migrationsreihenfolge

### Stufe A – Markieren und vorbereiten

- [x] Riskante Client-Felder dokumentieren.
- [x] `serverCompletionPlan.ts` anlegen.
- [x] Security-Plan-API anlegen.
- [ ] Dashboard anzeigen lassen, dass finale Rewards serverseitig werden muessen.
- [ ] Tagesmissionen markieren: MVP-Client-Reward ist nur Beta-Bruecke.

### Stufe B – Server Completion bauen

- [ ] `app/api/economy/complete-mission/route.ts` vorbereiten.
- [ ] Auth-/User-Pruefung vorbereiten.
- [ ] Evidence-/Risk-/Cap-Payload definieren.
- [ ] Ledger-kompatibles Completion-Ergebnis definieren.
- [ ] Kein echter Token-/NFT-/Wallet-Pfad.

### Stufe C – Client umstellen

- [ ] Dashboard Mission Start ruft Server Completion statt direktem `users.points`-Patch.
- [ ] Buddy-Futter ruft Server Spend Completion statt direktem `users.points`-/`avatar`-Patch.
- [ ] Tagesmissionen schreiben Completion nur noch als Antrag/Server-Call.
- [ ] `userDailyMissionState`, `userDailyStreaks`, `userLevels` werden servernahe Projektionen.

### Stufe D – Rules haerten

Erst wenn Stufe B und C funktionieren:

- [ ] `points` aus client-writable User-Feldern entfernen.
- [ ] `xp` aus client-writable User-Feldern entfernen.
- [ ] `level` aus client-writable User-Feldern entfernen.
- [ ] `avatar.energy`, `avatar.hunger`, `avatar.level` nicht mehr final clientseitig schreiben.
- [ ] `lastMissionCompletedAt` nur noch serverseitig setzen.
- [ ] Emulator-Test: Client-Update auf `users.points` muss `PERMISSION_DENIED` ergeben.

## Betroffene aktuelle Client-Pfade

### Dashboard

```txt
app/dashboard/hooks/useDashboardActions.ts
```

Aktuell schreibt `persistUserPatch` per `setDoc(..., { merge: true })` in `users/{userId}`.

Betroffene Aktionen:
- Mission Start: `points`, `xp`, `stepsToday`, `level`, `avatar`
- Buddy Futter: `points`, `avatar.hunger`, SpendPreview Summary

Ziel:
- Preview bleibt UI-nah.
- Finale Buchung wandert zu Server Completion / Spend Completion.

### Tagesmissionen

```txt
app/missionen/tagesmissionen/useDailyMissionFirebase.ts
```

Aktuell schreibt die Hook:
- `userDailyMissionState`
- `userDailyStreaks`
- `userLevels`

Ziel:
- Tagesmissions-UI darf Zustand anzeigen und lokale Beta-Fallbacks behalten.
- Finale XP-/Level-/Streak-Autoritaet wandert serverseitig.

### Mission-Buddy-Bridge

```txt
app/missionen/lib/missionBuddyBridge.ts
```

Aktuell nutzt sie eine Firestore Transaction und schreibt:
- `users.points`
- `users.avatar`
- `users.lastMissionCompletedAt`
- `missionBuddyEvents`

Wichtig:
- Doppelte Anwendung wird verhindert.
- Trotzdem bleibt der Client-Aufruf fuer finale Punkte perspektivisch zu riskant.

Ziel:
- Mission-Buddy-Bridge wird Server-Completion-Teil oder Cloud-Function-nahe Logik.

## Akzeptanzkriterien fuer den naechsten Codeblock

Der naechste echte Codeblock gilt als erfolgreich, wenn:

- es einen servernahen Completion-Endpoint gibt
- dieser keine echten Tokens/NFTs/Wallets aktiviert
- er RewardPreview-Status respektiert
- er blocked/manual_review nicht final gutschreibt
- er ein Ledger-kompatibles Ergebnis liefert
- Dashboard/Tagesmissionen danach schrittweise auf diesen Pfad umgestellt werden koennen
- `firestore.rules` noch nicht zu frueh gebrochen werden

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/CODEBASE_FEATURE_MAP.md`, `todolist/MASTER_OPEN_DONE_LIST.md`, `todolist/TODO_INDEX.md` und diese Datei.

Arbeite als naechstes an der Server-Completion-Vorstufe fuer interne Punkte. Erweitere vorhandene Module in `lib/economy/**` und `app/api/economy/**`. Keine echten Token, NFTs, Wallets, Auszahlungen, echten Kaeufe oder Blockchain-Funktionen aktivieren. Aendere `firestore.rules` erst, wenn der Server-Completion-Pfad und UI-Fallbacks stabil sind.
