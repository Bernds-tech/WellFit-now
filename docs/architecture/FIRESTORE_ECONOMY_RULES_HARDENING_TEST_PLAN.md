# WellFit – Firestore Economy Rules Hardening Test Plan

Stand: 2026-05-10
Status: Testplan / Vorbereitung, noch keine harte Sperre

## Zweck

Dieser Testplan beschreibt, wie die Firestore-Regeln fuer interne Punkte, XP, Level, Avatar-Zustand, Tagesmissionen und Server-Ledger schrittweise gehaertet werden.

Wichtig: Dieser Plan aktiviert noch keine harte Sperre fuer die aktuelle Beta-UI. Dashboard, Tagesmissionen und Buddy-Futter nutzen noch temporaere MVP-Bruecken.

## Aktueller Rules-Stand

In `firestore.rules` sind die User-Update-Felder jetzt logisch getrennt:

```txt
hasOnlySafeUserProfileKeys()
hasOnlyTemporaryEconomyBridgeKeys()
hasOnlyUserWritableKeys()
```

### Safe Profile Keys

Diese Felder koennen voraussichtlich client-writable bleiben, solange sie keine Reward-/Economy-Autoritaet haben:

```txt
updatedAt
lastLoginAt
profile
settings
consent
inventory
```

### Temporary Economy Bridge Keys

Diese Felder sind aktuell noch Beta-/MVP-kompatibel, muessen aber spaeter server-only werden:

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

### Temporary Mission Progress Collections

Diese Collections sind aktuell noch owner-writable und muessen spaeter aus Server-Ledger-Projektionen entstehen:

```txt
userDailyMissionState/{stateId}
userDailyStreaks/{userId}
userLevels/{userId}
```

## Bereits server-only gesperrte Collections

Diese Collections duerfen schon jetzt nicht vom Client erstellt/geaendert/geloescht werden:

```txt
missionBuddyEvents
trackingSessions
trackingProofEvents
missionContextEvaluations
missionCompletionEvaluations
missionRewardPreviews
missionEvidenceReviews
missionPatternReviews
missionCooldownReviews
missionRewardPolicies
systemReserveSnapshots
missionRewardEvents
ledgerEvents
auditEvents
userEconomyProjections
pointsSinkEvents
itemDefinitions
userInventory
buddyCapabilities
nfcTags
nfcScanEvents
nfcScanClaims
capabilityUnlockEvents
buddyItemUseEvents
```

## Server-only Collections aus Mega-Block 21

Die folgenden Collections bilden den Zielpfad fuer echte interne Punkte-Persistenz ab. Sie duerfen vom Client nur gelesen werden, wenn `resource.data.userId == request.auth.uid`; Create/Update/Delete bleibt clientseitig verboten.

```txt
ledgerEvents/{ledgerEventId}
auditEvents/{auditEventId}
userEconomyProjections/{projectionId}
pointsSinkEvents/{sinkEventId}
```

Geplanter serverseitiger Datenfluss:

```txt
RewardPreview -> Completion -> Ledger -> Audit -> UserProjection
SpendPreview -> PointsSink -> Ledger -> Audit -> UserProjection
```

Diese Collections sind noch nicht echt beschrieben. Die APIs liefern aktuell nur Dry-Run-/Draft-Bundles und `writeNow: false`.


## Backend-readiness Review vom 2026-05-15

Status: `review_required` fuer Produktionsautoritaet. Dieser Dokumentationspass hat keine Firestore Rules, Functions, API-Routen, Deployments oder Produktionsdaten geaendert.

Abgrenzung der Checks:

- Root-App-Checks (`npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run agent:quality-gate`) pruefen Web-App- und Governance-Baseline.
- `npm --prefix functions run check` ist ein Functions-Syntax-/Static-Parse-Check fuer vorhandene JavaScript-Dateien. Er startet keine Emulatoren, prueft keine produktive Rules-Autoritaet und beweist keine Final-Ledger-Persistenz.
- Emulator-Tests brauchen lokal laufende Firebase Emulator Services, Java, Firebase CLI, freie Ports, Projekt-/Demo-Kontext und lokale Environment-Konfiguration. Fehlen diese Voraussetzungen, ist das ein Umgebungslimit und kein Freibrief fuer Rules-/Functions-/Deployment-Aenderungen.

Persistenz-/Autoritaetsstand:

- `/api/economy/*` bleibt laut Register Preview-/Draft-/Status-/Projection-Read-Preview, solange keine separate Human-Approval-Entscheidung eine Backend-/Rules-/Audit-Umstellung autorisiert.
- `ledgerEvents`, `auditEvents`, `userEconomyProjections`, `pointsSinkEvents`, finale Punkteausgaben, Inventory Grants, Leaderboards, Anti-Cheat, Reward Authority und Mission Completion bleiben server-reviewed und duerfen nicht client-authoritativ werden.
- Jede Aktivierung finaler Writes benoetigt vorab einen genehmigten Backend-/Rules-/Emulator-/Audit-Plan; unklare Punkte bleiben `review_required`.

## Ausfuehrbare Guardrail-Vorstufe

Mega-Block 23 fuegt einen statischen Agent-Check hinzu:

```powershell
npm run agent:firestore-economy-rules-check
```

Output:

```txt
scripts/wellfit-dev-agent/output/firestore-economy-rules-check.md
```

Der Check prueft die aktuelle Beta-Rules-Haltung:

```txt
Safe Profile Helper vorhanden
Temporary Economy Bridge Helper vorhanden
users/{uid} update nutzt hasOnlyUserWritableKeys()
users/{uid} delete bleibt DENY
userDailyMissionState / userDailyStreaks / userLevels existieren als temporaere MVP-Bruecken
missionRewardEvents create/update/delete -> DENY
missionRewardPreviews create/update/delete -> DENY
missionCompletionEvaluations create/update/delete -> DENY
ledgerEvents create/update/delete -> DENY
auditEvents create/update/delete -> DENY
userEconomyProjections create/update/delete -> DENY
pointsSinkEvents create/update/delete -> DENY
owner-read guard fuer server-only Economy-Collections vorhanden
```

Wichtig: Dieser statische Check ersetzt keine Firebase-Emulator-Tests. Er verhindert nur, dass die aktuelle Rules-Datei versehentlich die geplante Beta-Haltung verliert.

## Ausfuehrbarer Firebase-Emulator-Test

Mega-Block 24 fuegt einen separaten Emulator-Test hinzu:

```powershell
npm run agent:firestore-economy-rules-emulator-test
```

Vorher muss in einem zweiten Terminal der Emulator laufen:

```powershell
npm run emulators
```

Voraussetzungen fuer diesen Test sind Firebase CLI, Java, freie lokale Emulator-Ports und eine lokale Entwicklungsumgebung ohne Produktionsdaten. Wenn der Emulator wegen Login-, Java- oder Port-Konflikten nicht startet, ist das als Umgebungslimit zu dokumentieren; es ist kein Grund, Firestore Rules, Functions-Code, Deployment-Konfiguration oder Reward-/Mission-Autoritaet in derselben Aufgabe zu aendern.

Der Test nutzt Firebase Auth + Firestore Emulator und prueft die wichtigsten Stufe-1-Faelle:

```txt
/users/{uid} create owner doc -> ALLOW
/users/{uid}.profile update -> ALLOW
/users/{uid}.settings update -> ALLOW
/users/{uid}.points update -> ALLOW temporaere MVP-Bruecke
/userDailyMissionState write -> ALLOW temporaere MVP-Bruecke
/missionRewardEvents create -> DENY
/missionRewardPreviews create -> DENY
/missionCompletionEvaluations create -> DENY
/ledgerEvents create -> DENY
/auditEvents create -> DENY
/userEconomyProjections create -> DENY
/pointsSinkEvents create -> DENY
/users/{uid} delete -> DENY
other user cannot update owner profile -> DENY
signed-out user cannot write user doc -> DENY
```

Wichtig: Dieser Emulator-Test ist bewusst nicht Teil von `agent:quality-gate`, weil er einen laufenden Emulator in einem separaten Terminal braucht.

## Zielzustand nach Server-Persistenz

Sobald Server-Ledger-Persistenz aktiv ist, soll gelten:

```txt
Client darf Profil/Settings/Consent schreiben.
Client darf keine finalen Punkte/XP/Level/Avatar-Economy-Werte schreiben.
Client darf Mission Completion nur an Server-API melden.
Server schreibt Ledger/Audit/Projection.
Client liest Projektionen.
```

## Emulator-Teststufen

### Stufe 1 – aktueller Beta-Kompatibilitaetstest

Ziel: Sicherstellen, dass die aktuelle Beta nicht gebrochen ist.

Erwartung:

```txt
/users/{uid}.profile update -> ALLOW
/users/{uid}.settings update -> ALLOW
/users/{uid}.points update -> ALLOW vorerst noch MVP-Bruecke
/userDailyMissionState/{uid}_YYYY-MM-DD update -> ALLOW vorerst noch MVP-Bruecke
/missionRewardEvents create -> DENY
/missionRewardPreviews create -> DENY
/missionCompletionEvaluations create -> DENY
/ledgerEvents create -> DENY
/auditEvents create -> DENY
/userEconomyProjections create -> DENY
/pointsSinkEvents create -> DENY
/userInventory create -> DENY
/buddyCapabilities create -> DENY
```

### Stufe 2 – server-only Persistenz aktivieren

Vorbedingung:

```txt
Server schreibt RewardPreview/Completion/Ledger/Audit/Projection.
Dashboard und Tagesmissionen lesen Projektionen oder API-Ergebnis.
Buddy-Futter nutzt serverseitige Punkte-Sink-Logik.
```

Dann Rules-Ziel:

```txt
/users/{uid}.points update -> DENY
/users/{uid}.xp update -> DENY
/users/{uid}.level update -> DENY
/users/{uid}.avatar.energy/hunger/level update -> DENY als finale Autoritaet
/users/{uid}.lastMissionCompletedAt update -> DENY
/userDailyMissionState write -> DENY oder nur nichtkritische UI-Auswahl erlauben
/userDailyStreaks write -> DENY
/userLevels write -> DENY
```

### Stufe 3 – Regression nach Härtung

Nach Rules-Haertung pruefen:

```txt
Dashboard laedt ohne Fehler.
Tagesmissionen zeigen Zustand.
Mission Completion blockiert keine UI hart, sondern nutzt Serverpfad.
Punkte/XP/Level werden aus Server-Projektionen gelesen.
MissionRewardEvents bleiben client-write-denied.
LedgerEvents/AuditEvents/UserEconomyProjections/PointsSinkEvents bleiben client-write-denied.
```

## Akzeptanzkriterien fuer erste harte Rules-Aenderung

Die erste echte harte Rules-Aenderung darf erst passieren, wenn:

- `app/api/economy/complete-mission` echte server-only Persistenz vorbereitet oder aktiv hat.
- Dashboard nicht mehr auf direkte `users.points`-Writes angewiesen ist.
- Tagesmissionen nicht mehr auf direkte `userLevels`-/`userDailyStreaks`-Writes als Autoritaet angewiesen sind.
- Buddy-Futter nicht mehr direkt `users.points` als finale Ausgabe schreibt.
- Emulator-Test fuer DENY/ALLOW-Faelle vorbereitet ist.
- Lokaler Build und Quality Gate PASS sind.

## Nicht tun

- Keine sofortige Sperre von `users.points`, solange Dashboard/Tagesmissionen noch MVP-Bruecken nutzen.
- Keine echten Token, NFTs, Wallets, Transfers, Auszahlungen oder echten Kaeufe aktivieren.
- Keine Unity-/Native-AR-Dateien in diesem Hauptchat bearbeiten.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/CODEBASE_FEATURE_MAP.md`, `todolist/PROJECT_STRUCTURE.md`, `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md`, `scripts/wellfit-dev-agent/src/firestore-economy-rules-emulator-test.mjs` und diese Datei.

Arbeite als naechstes an Erweiterungen der Emulator-Tests, z. B. `userInventory create -> DENY`, `buddyCapabilities create -> DENY` und spaeter Stufe-2-Tests fuer server-only Persistenz. Aendere `firestore.rules` nur dann hart, wenn Dashboard, Tagesmissionen und Buddy-Futter nicht mehr auf direkte Client-Writes fuer Punkte/XP/Level/Avatar angewiesen sind. Keine echten Token/NFT/Wallet/Transfers/Auszahlungen aktivieren.
