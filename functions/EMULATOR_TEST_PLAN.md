# WellFit Functions Emulator Test Plan

## Ziel

Vor jedem Deployment muessen NFC-, Item-, Capability-, Tracking-, Buddy-, Context-, Mission-Evaluation-, Evidence-Review- und RewardPreview-Flows im Firebase Emulator getestet werden.

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
- `npm run evidence:emulator` benoetigt Auth-, Firestore- und Functions-Emulator.
- `npm run test:emulator` ist der verbindliche Gesamt-Test fuer smoke:nfc + rules:firestore + callable:emulator + mission:emulator + evidence:emulator.

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

`npm run check` prueft aktuell:

- `index.js`
- `lib/missionContext.js`
- `lib/missionRewardPolicy.js`
- `lib/missionEvidenceReview.js`
- `seed/demoItemsAndNfc.js`
- alle Emulator-Testskripte

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
WellFit Mission Evidence Review Emulator Test erfolgreich.
```

## Smoke-Test fuer NFC / Item / Capability

Terminal 2:

```bash
cd /var/www/WellFit-now/functions
npm run smoke:nfc
```

Das Script `test/emulatorNfcSmokeTest.js` prueft:

- Demo Items werden geseedet.
- Demo NFC Tags werden geseedet.
- rope_001 existiert.
- WF-DEMO-ROPE-TREE-001 wird validiert.
- userInventory bekommt rope_001.
- buddyCapabilities bekommt climbUp.
- falsche Mission wird mit mission-mismatch abgelehnt.

## Firestore Rules Smoke Test

Terminal 2:

```bash
cd /var/www/WellFit-now/functions
npm run rules:firestore
```

Das Script `test/firestoreRulesSmokeTest.js` prueft, dass kritische Collections clientseitig nicht manipuliert werden koennen.

Direkte Client-Writes muessen abgelehnt werden fuer:

- userInventory create
- buddyCapabilities create
- nfcTags read/write
- nfcScanEvents create/update
- nfcScanClaims read/write
- capabilityUnlockEvents create/update
- buddyItemUseEvents create/update
- trackingSessions create/update
- trackingProofEvents create/update
- missionBuddyEvents create/update
- missionContextEvaluations create/update
- missionCompletionEvaluations create/update
- missionRewardPreviews create/update
- missionEvidenceReviews create/update
- missionRewardPolicies create/update
- systemReserveSnapshots create/update
- missionRewardEvents create/update

Die `PERMISSION_DENIED`-Meldungen im Rules-Test sind erwartete Positivsignale.

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
- transaktionaler Claim wird fuer gueltigen NFC-Scan erzeugt.
- duplicate scan fuer denselben Nutzer, Tag und dieselbe Mission wird mit duplicate-scan abgelehnt.
- duplicate scan erzeugt keinen zweiten Claim.
- duplicate scan erzeugt kein zweites Inventory Item.
- Magnifier Flow vergibt magnifier_001 und scanObject.
- auditItemUse schreibt ein serverseitiges Audit-Event.
- createTrackingSession schreibt eine serverautorisierte Tracking-Session.
- recordTrackingProof schreibt ein serverautorisiertes Tracking-Proof-Event.
- recordTrackingProof fuer fremde Session wird blockiert.
- createMissionBuddyEvent schreibt ein serverautorisiertes Buddy-Event.
- Tracking-/Buddy-Callable-Flows setzen rewardAuthorized=false und missionCompletionAuthorized=false.
- falsche Mission wird mit mission-mismatch abgelehnt.

## Mission-/Context-/RewardPreview-Test

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
- missionRewardPreview schreibt `missionRewardPreviews`.
- missionRewardPreview autorisiert keine Rewards, XP, Punkte oder Token.
- Fremde Tracking-Sessions werden blockiert.
- Fremde RewardPreview-Versuche werden blockiert.
- Leere Completion Evaluation liefert `insufficient-evidence`.
- Firestore Rules blockieren direkte Client-Writes auf Evaluation- und Preview-Collections.

## Evidence Review / Proof-Quality-Drosselung-Test

Terminal 2:

```bash
cd /var/www/WellFit-now/functions
npm run evidence:emulator
```

Das Script `test/evidenceReviewEmulatorTest.js` prueft:

- reviewMissionEvidence schreibt `missionEvidenceReviews`.
- Evidence Review sammelt Tracking, Proof, Buddy, Context, Completion und RewardPreview.
- Evidence Review setzt `rewardAuthorized=false`.
- Evidence Review setzt `xpAuthorized=false`.
- Evidence Review setzt `pointsAuthorized=false`.
- Evidence Review setzt `tokenAuthorized=false`.
- Evidence Review setzt `missionCompletionAuthorized=false`.
- Leere Evidence Review liefert `insufficient-evidence`.
- Fremde Evidence wird blockiert.
- Owner-Read fuer eigene Evidence Reviews funktioniert.
- Fremder Read wird blockiert.
- Direkte Client-Writes auf `missionEvidenceReviews` werden blockiert.
- missionRewardPreview ohne Evidence Review wird mit `evidenceReviewMultiplier = 0.65` gedrosselt.
- Riskante Evidence Review setzt RewardPreview auf `manual-review-required`.
- Riskante Evidence Review setzt `estimatedInternalPoints = 0`.
- Riskante Evidence Review setzt `estimatedXp = 0`.

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

Darf NFC scannen und serverautorisierte Tracking-/Buddy-/Context-/Completion-/RewardPreview-/EvidenceReview-Flows ueber Callable Functions erzeugen, aber keine Seed-Daten, Items, Capabilities, NFC-Tags, Tracking-Sessions, Buddy-Events, Evaluations, Reviews, Previews, Claims oder RewardEvents direkt schreiben.

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

## Production Build nach erfolgreichem Test

Nach erfolgreichem Emulator-Gesamttest:

```bash
cd /var/www/WellFit-now
git fetch origin
git reset --hard origin/main
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
pm2 status
```

Erwartet:

```txt
Compiled successfully
Finished TypeScript
29/29 static pages generated
wellfit-now online
```

## Naechste technische Aufgabe

Nach EvidenceReview und Proof-Quality-Drosselung ist der naechste sinnvolle sichere Backend-Baustein:

- UserDailyCap vorbereiten.
- MissionTypeCap vorbereiten.
- SystemReserveSnapshot read-only in RewardPreview einbeziehen.
- Weiterhin keine produktive Auszahlung.
