# WellFit Functions Emulator Test Plan

## Ziel

Vor jedem Deployment muessen NFC-, Item- und Capability-Flows im Firebase Emulator getestet werden.

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

## Vorbereitung

Im Repo-Root:

```bash
cd /var/www/WellFit-now
npm install --no-audit --no-fund
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

Darf NFC scannen, aber keine Seed-Daten, Items, Capabilities oder NFC-Tags direkt schreiben.

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

## Naechste technische Aufgabe

Automatisierte Callable-Function-Tests und Firestore-Rules-Tests ergaenzen. Der Smoke-Test ist ein erster pruefbarer Zwischenschritt, ersetzt aber noch nicht die vollstaendigen Security-Rule-Tests.
