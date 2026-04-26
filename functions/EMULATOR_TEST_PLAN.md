# WellFit Functions Emulator Test Plan

## Ziel

Vor jedem Deployment muessen NFC-, Item-, Capability-, Tracking- und Buddy-Event-Flows im Firebase Emulator getestet werden.

Produktionsdeployment ist blockiert, bis diese Tests erfolgreich sind.

## Wichtige Voraussetzungen

Der Firebase Firestore Emulator benoetigt Java.

Auf Ubuntu Server installieren:

```bash
sudo apt update
sudo apt install -y openjdk-17-jre-headless
java -version
```

Wichtig:

- `npm run emulators` wird im Repo-Root ausgefuehrt: `/var/www/WellFit-now`.
- `npm run check` und `npm run smoke:nfc` werden im Functions-Ordner ausgefuehrt: `/var/www/WellFit-now/functions`.
- `npm run smoke:nfc` funktioniert erst, wenn der Firestore Emulator auf `127.0.0.1:8080` laeuft.
- `npm run callable:emulator` benoetigt Auth-, Firestore- und Functions-Emulator.
- `npm run test:emulator` ist der verbindliche Gesamt-Test fuer smoke:nfc + rules:firestore + callable:emulator.

## Vorbereitung

Im Repo-Root:

```bash
cd /var/www/WellFit-now
npm install --include=dev --no-audit --no-fund
```

Im Functions-Ordner:

```bash
cd /var/www/WellFit-now/functions
npm install --no-audit --no-fund
npm run check
```

## Emulator starten

Terminal 1 offen lassen:

```bash
cd /var/www/WellFit-now
npm run emulators
```

Alternative nur Firestore:

```bash
cd /var/www/WellFit-now
npm run emulators:firestore
```

## Smoke-Test fuer NFC / Item / Capability

Terminal 2:

```bash
cd /var/www/WellFit-now/functions
npm run smoke:nfc
```

Voraussetzung:

```txt
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

Das Script `test/emulatorNfcSmokeTest.js` prueft:

- Demo Items werden geseedet.
- Demo NFC Tags werden geseedet.
- rope_001 existiert.
- WF-DEMO-ROPE-TREE-001 wird validiert.
- userInventory bekommt rope_001.
- buddyCapabilities bekommt climbUp.
- falsche Mission wird mit mission-mismatch abgelehnt.

## Callable-Function-Edge-Case-Test

Terminal 2:

```bash
cd /var/www/WellFit-now/functions
npm run callable:emulator
```

Das Script `test/callableFunctionsEmulatorTest.js` prueft echte Callable HTTP-Endpunkte im Emulator:

- seedDemoItemsAndNfc mit Admin-Claim erfolgreich.
- seedDemoItemsAndNfc ohne Admin-Claim verboten.
- missing-public-code wird abgelehnt.
- tag-not-found wird abgelehnt.
- revoked NFC Tag wird mit tag-revoked abgelehnt.
- inactive NFC Tag wird mit tag-not-active abgelehnt.
- falscher Nutzer wird mit user-not-allowed abgelehnt.
- usageLimit erreicht wird mit usage-limit-reached abgelehnt.
- gueltiger Rope Flow vergibt rope_001 und climbUp.
- duplicate scan fuer denselben Nutzer, Tag und dieselbe Mission wird mit duplicate-scan abgelehnt.
- duplicate scan erzeugt kein zweites Inventory Item.
- Magnifier Flow vergibt magnifier_001 und scanObject.
- auditItemUse schreibt ein serverseitiges Audit-Event.
- createTrackingSession schreibt eine serverautorisierte Tracking-Session.
- recordTrackingProof schreibt ein serverautorisiertes Tracking-Proof-Event.
- recordTrackingProof fuer fremde Session wird blockiert.
- createMissionBuddyEvent schreibt ein serverautorisiertes Buddy-Event.
- Tracking-/Buddy-Callable-Flows setzen rewardAuthorized=false und missionCompletionAuthorized=false.
- falsche Mission wird mit mission-mismatch abgelehnt.

## Testnutzer

### Admin-Nutzer

Muss Custom Claim besitzen:

```json
{
  "admin": true
}
```

Nur Admin darf `seedDemoItemsAndNfc` ausfuehren.

### Normaler Nutzer

Darf NFC scannen und serverautorisierte Tracking-/Buddy-Events ueber Callable Functions erzeugen, aber keine Seed-Daten, Items, Capabilities, NFC-Tags, Tracking-Sessions oder Buddy-Events direkt schreiben.

## Testdaten durch Seed Function

Callable Function:

```txt
seedDemoItemsAndNfc
```

Erwartete Items:

- rope_001
- magnifier_001
- small_backpack_001

Erwartete NFC-Tags:

- WF-DEMO-ROPE-TREE-001
- WF-DEMO-MAGNIFIER-LEAF-001

## Testfall 1 - Admin Seed erfolgreich

Input:

```json
{}
```

Auth:

```json
{
  "uid": "admin-user",
  "token": { "admin": true }
}
```

Erwartung:

- accepted = true
- itemDefinitions enthaelt rope_001
- itemDefinitions enthaelt magnifier_001
- itemDefinitions enthaelt small_backpack_001
- nfcTags enthaelt demo_nfc_rope_tree_001
- nfcTags enthaelt demo_nfc_magnifier_leaf_001

## Testfall 2 - Normaler Nutzer darf nicht seeden

Auth:

```json
{
  "uid": "normal-user",
  "token": {}
}
```

Erwartung:

- permission-denied
- keine neuen Seed-Daten

## Testfall 3 - Gueltiger Kletterseil NFC Scan

Callable Function:

```txt
validateNfcScan
```

Input:

```json
{
  "publicCode": "WF-DEMO-ROPE-TREE-001",
  "missionId": "demo_tree_clue_001",
  "deviceId": "test-device-001",
  "appSessionId": "test-session-001"
}
```

Auth:

```json
{
  "uid": "normal-user"
}
```

Erwartung:

- accepted = true
- grantedItemId = rope_001
- grantedCapabilityId = climbUp
- userInventory enthaelt rope_001 fuer normal-user
- buddyCapabilities enthaelt normal-user_default_climbUp
- capabilityUnlockEvents enthaelt completed Event
- nfcScanEvents enthaelt validated Event
- nfcTags/demo_nfc_rope_tree_001.usageCount wurde erhoeht

## Testfall 4 - Falsche Mission

Input:

```json
{
  "publicCode": "WF-DEMO-ROPE-TREE-001",
  "missionId": "wrong_mission"
}
```

Erwartung:

- accepted = false
- rejectionReason = mission-mismatch
- nfcScanEvents enthaelt rejected Event
- kein Item Grant
- kein Capability Unlock

## Testfall 5 - Fehlender NFC Code

Input:

```json
{}
```

Erwartung:

- accepted = false
- rejectionReason = missing-public-code

## Testfall 6 - Unbekannter NFC Code

Input:

```json
{
  "publicCode": "UNKNOWN-CODE"
}
```

Erwartung:

- accepted = false
- rejectionReason = tag-not-found

## Testfall 7 - auditItemUse erfolgreich

Input:

```json
{
  "buddyId": "default",
  "inventoryItemId": "inv_test",
  "itemId": "rope_001",
  "capabilityId": "climbUp",
  "missionId": "demo_tree_clue_001",
  "arSessionId": "ar_test_session_001",
  "status": "completed"
}
```

Erwartung:

- accepted = true
- buddyItemUseEvents enthaelt completed Event

## Testfall 8 - Direkter Client Write muss verboten sein

Direkte Writes muessen abgelehnt werden fuer:

- userInventory create
- buddyCapabilities create
- nfcTags read/write
- nfcScanEvents create
- capabilityUnlockEvents create
- buddyItemUseEvents create
- trackingSessions create/update
- missionBuddyEvents create/update

## Testfall 9 - Revoked NFC Tag

Input:

```json
{
  "publicCode": "WF-DEMO-REVOKED-001",
  "missionId": "demo_tree_clue_001"
}
```

Erwartung:

- accepted = false
- rejectionReason = tag-revoked
- kein Item Grant
- kein Capability Unlock

## Testfall 10 - Inactive NFC Tag

Input:

```json
{
  "publicCode": "WF-DEMO-INACTIVE-001",
  "missionId": "demo_tree_clue_001"
}
```

Erwartung:

- accepted = false
- rejectionReason = tag-not-active
- kein Item Grant
- kein Capability Unlock

## Testfall 11 - Falscher Nutzer

Input:

```json
{
  "publicCode": "WF-DEMO-USER-LOCKED-001",
  "missionId": "demo_tree_clue_001"
}
```

Erwartung:

- accepted = false
- rejectionReason = user-not-allowed
- kein Item Grant
- kein Capability Unlock

## Testfall 12 - Usage Limit erreicht

Input:

```json
{
  "publicCode": "WF-DEMO-LIMIT-001",
  "missionId": "demo_tree_clue_001"
}
```

Erwartung:

- accepted = false
- rejectionReason = usage-limit-reached
- kein Item Grant
- kein Capability Unlock

## Testfall 13 - Duplicate Scan

Input:

```json
{
  "publicCode": "WF-DEMO-ROPE-TREE-001",
  "missionId": "demo_tree_clue_001"
}
```

Ablauf:

- Erster Scan wird akzeptiert.
- Zweiter Scan desselben Nutzers fuer denselben Tag und dieselbe Mission wird abgelehnt.

Erwartung zweiter Scan:

- accepted = false
- rejectionReason = duplicate-scan
- kein zweites Inventory Item
- kein zweiter Capability Unlock noetig

## Testfall 14 - Magnifier Flow / scanObject

Input:

```json
{
  "publicCode": "WF-DEMO-MAGNIFIER-LEAF-001",
  "missionId": "demo_leaf_quiz_001"
}
```

Erwartung:

- accepted = true
- grantedItemId = magnifier_001
- grantedCapabilityId = scanObject
- buddyCapabilities enthaelt normal-user_default_scanObject

## Testfall 15 - createTrackingSession

Input:

```json
{
  "missionId": "demo_tree_clue_001",
  "source": "mobile",
  "proofType": "motion",
  "deviceId": "tracking-device-001"
}
```

Erwartung:

- accepted = true
- trackingSessions enthaelt serverseitiges Dokument fuer Nutzer
- serverValidationStatus = pending
- rewardAuthorized = false
- missionCompletionAuthorized = false

## Testfall 16 - recordTrackingProof

Input:

```json
{
  "sessionId": "<server-created-session-id>",
  "proofType": "motion",
  "status": "completed"
}
```

Erwartung:

- accepted = true
- trackingProofEvents enthaelt serverseitiges Proof Event
- trackingSessions.proofEventCount wird erhoeht
- rewardAuthorized = false
- missionCompletionAuthorized = false
- fremder Nutzer darf Proof nicht fuer fremde Session schreiben

## Testfall 17 - createMissionBuddyEvent

Input:

```json
{
  "missionId": "demo_tree_clue_001",
  "buddyId": "default",
  "eventType": "buddyActionRequested",
  "status": "requested",
  "itemId": "rope_001",
  "capabilityId": "climbUp"
}
```

Erwartung:

- accepted = true
- missionBuddyEvents enthaelt serverseitiges Dokument fuer Nutzer
- rewardAuthorized = false
- missionCompletionAuthorized = false

## Naechste technische Aufgabe

Erweiterten Emulator-Gesamttest nach Tracking-/Buddy-Callable-Ergaenzung ausfuehren. Danach Mission-Completion-Backend-Flow planen. Die neuen Tracking-/Buddy-Callables sind nur Audit-/Proof-Pfade und ersetzen keine finale Anti-Cheat-, Reward- oder Mission-Completion-Entscheidung.
