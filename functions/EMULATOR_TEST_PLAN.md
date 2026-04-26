# WellFit Functions Emulator Test Plan

## Ziel

Vor jedem Deployment muessen NFC-, Item-, Capability-, Tracking-, Buddy-, Context- und Mission-Evaluation-Flows im Firebase Emulator getestet werden.

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
- `npm run check` und die Function-Tests werden im Functions-Ordner ausgefuehrt: `/var/www/WellFit-now/functions`.
- `npm run smoke:nfc` funktioniert erst, wenn der Firestore Emulator auf `127.0.0.1:8080` laeuft.
- `npm run callable:emulator` benoetigt Auth-, Firestore- und Functions-Emulator.
- `npm run mission:emulator` benoetigt Auth-, Firestore- und Functions-Emulator.
- `npm run test:emulator` ist der verbindliche Gesamt-Test fuer smoke:nfc + rules:firestore + callable:emulator + mission:emulator.

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

## Gesamt-Test

Terminal 2:

```bash
cd /var/www/WellFit-now/functions
npm run test:emulator
```

Erwartete Abschlussmeldungen:

```txt
WellFit Emulator NFC Smoke Test erfolgreich.
WellFit Firestore Rules Smoke Test erfolgreich.
WellFit Callable Functions Emulator Test erfolgreich.
WellFit Mission Completion Emulator Test erfolgreich.
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

## Mission-/Context-Evaluation-Test

Terminal 2:

```bash
cd /var/www/WellFit-now/functions
npm run mission:emulator
```

Das Script `test/missionCompletionEmulatorTest.js` prueft:

- evaluateMissionContext schreibt `missionContextEvaluations`.
- Sicherer Child-Kontext liefert `context-ok-for-review`.
- Riskanter Child-Kontext bei Nacht, ohne Parent-Mode, ausserhalb Radius und ohne Proof liefert `reject-or-parent-review`.
- Context Evaluation autorisiert keine Rewards.
- Context Evaluation autorisiert keine Mission Completion.
- createTrackingSession schreibt Tracking-Session.
- recordTrackingProof schreibt Tracking-Proof.
- createMissionBuddyEvent schreibt Buddy-Event.
- evaluateMissionCompletion schreibt `missionCompletionEvaluations`.
- Completion Evaluation bleibt `accepted=false`.
- Completion Evaluation autorisiert keine Rewards, XP oder Punkte.
- Fremde Tracking-Sessions werden blockiert.
- Leere Completion Evaluation liefert `insufficient-evidence`.
- Firestore Rules blockieren direkte Client-Writes auf `missionContextEvaluations` und `missionCompletionEvaluations`.

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

Darf NFC scannen und serverautorisierte Tracking-/Buddy-/Context-/Completion-Evaluation-Flows ueber Callable Functions erzeugen, aber keine Seed-Daten, Items, Capabilities, NFC-Tags, Tracking-Sessions, Buddy-Events oder Evaluationen direkt schreiben.

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

## Direkter Client Write muss verboten sein

Direkte Writes muessen abgelehnt werden fuer:

- userInventory create
- buddyCapabilities create
- nfcTags read/write
- nfcScanEvents create
- capabilityUnlockEvents create
- buddyItemUseEvents create
- trackingSessions create/update
- trackingProofEvents create/update
- missionBuddyEvents create/update
- missionContextEvaluations create/update
- missionCompletionEvaluations create/update

## Naechste technische Aufgabe

Erweiterten Emulator-Gesamttest nach Mission-Context-Ergaenzung ausfuehren. Danach kann der naechste sichere Backend-Baustein geplant werden: `missionRewardPolicies` als reine Policy-Datenstruktur ohne Auszahlung, oder ein erster `missionRewardPreview`-Stub, der Reward nur simuliert und weiterhin keine XP/Punkte autorisiert.
