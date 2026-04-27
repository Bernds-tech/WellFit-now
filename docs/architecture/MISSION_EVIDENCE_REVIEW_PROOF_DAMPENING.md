# WellFit Mission Evidence Review / Proof-Quality-Drosselung

Stand: 2026-04-27
Repository: Bernds-tech/WellFit-now

## Ziel

Dieses Dokument beschreibt den aktuellen sicheren Anti-Cheat-/Sensor-Fusion-Zwischenstand fuer Missionen, Rewards und Evidence.

Wichtig: Dieser Stand ist noch keine finale Reward Engine und keine finale Anti-Cheat-KI. Er ist ein auditierbarer serverseitiger Sicherheitslayer, der Beweise sammelt, Plausibilitaet bewertet und RewardPreview vorsichtig drosselt.

## Grundregel

Frontend, Mobile-App, KI und Unity duerfen keine produktkritischen Entscheidungen final autorisieren.

Sie duerfen spaeter nur Telemetrie, Evidence, UI-State und Vorschlaege liefern.

Backend / Firestore Rules / Cloud Functions bleiben Autoritaet fuer:

- Mission Completion
- Rewards
- XP
- Punkte
- Token-/WFT-Bezug
- Burn
- Jackpot
- Leaderboards
- Anti-Cheat
- Evidence Review

## Neue Kernbausteine

### 1. `nfcScanClaims`

`validateNfcScan` nutzt jetzt deterministische Claims:

```txt
claimId = tagId + userId + missionId
```

Damit wird ein NFC-Scan pro Nutzer, Tag und Mission transaktional abgesichert.

Die Firestore-Transaction umfasst:

- Claim-Erzeugung
- Scan-Event
- Inventory-Grant
- Capability-Grant
- Tag-Usage-Update

Sicherheitsstatus:

```txt
[x] Duplicate Scan erzeugt keinen zweiten Claim.
[x] Duplicate Scan erzeugt kein zweites Inventory Item.
[x] Claim Collection ist fuer Client Read/Write gesperrt.
[x] Callable-Test prueft Claim-Erzeugung und Duplicate-Schutz.
[x] Rules-Test prueft Client-Blockade.
```

### 2. `missionEvidenceReviews`

Neue Collection fuer serverseitige Evidence-/Anti-Cheat-Bewertung.

Callable Function:

```txt
reviewMissionEvidence
```

Helper:

```txt
functions/lib/missionEvidenceReview.js
```

Bewertete Evidence-Quellen:

- `trackingSessions`
- `trackingProofEvents`
- `nfcScanEvents`
- `missionBuddyEvents`
- `missionContextEvaluations`
- `missionCompletionEvaluations`
- `missionRewardPreviews`

Review-Felder:

- `evidenceReviewId`
- `userId`
- `missionId`
- `evidenceRefs`
- `evidenceTypes`
- `evidenceCount`
- `flags`
- `plausibilityScore`
- `proofQualityScore`
- `antiCheatRiskScore`
- `recommendation`
- `rewardAuthorized=false`
- `xpAuthorized=false`
- `pointsAuthorized=false`
- `tokenAuthorized=false`
- `missionCompletionAuthorized=false`
- `serverValidationStatus`
- `createdAt`
- `updatedAt`

Firestore Rules:

```txt
Owner-Read: ja
Client-Create: nein
Client-Update: nein
Client-Delete: nein
Fremder Read: nein
```

### 3. Proof-Quality-Drosselung in `missionRewardPreview`

`missionRewardPreview` akzeptiert jetzt optional:

```txt
evidenceReviewId
```

Wenn eine Evidence Review vorhanden ist, wird sie serverseitig gelesen und in die Preview-Formel einbezogen.

Helper:

```txt
functions/lib/missionRewardPolicy.js
```

Neue Policy-Version:

```txt
preview-v2-proof-quality
```

Neue Multiplier:

- `baseProofQualityMultiplier`
- `proofQualityMultiplier`
- `evidenceReviewMultiplier`

Drosselungslogik:

```txt
Keine Evidence Review:
  evidenceReviewMultiplier = 0.65
  previewStatus = dampened-missing-evidence-review

Schwache Evidence:
  evidenceReviewMultiplier = 0.35
  previewStatus = simulation-only / dampened

Riskante Evidence:
  evidenceReviewMultiplier = 0
  previewStatus = manual-review-required
  estimatedInternalPoints = 0
  estimatedXp = 0

Gute Evidence:
  evidenceReviewMultiplier = 1
  Preview bleibt normale Simulation
```

Hard Stops:

- `recommendation = insufficient-evidence`
- `recommendation = manual-review-required`
- `antiCheatRiskScore >= 75`
- `duplicate-scan-evidence`
- `context-rejected`

## Wichtige Sicherheitsgarantie

Auch mit EvidenceReview und Proof-Quality-Drosselung bleibt `missionRewardPreview` nur eine Simulation.

Es gilt weiterhin:

```txt
rewardAuthorized=false
xpAuthorized=false
pointsAuthorized=false
tokenAuthorized=false
missionCompletionAuthorized=false
estimatedTokenEquivalent=null
estimatedBurnEquivalent=null
```

## Emulator-Testabdeckung

`functions/package.json` enthaelt jetzt:

```txt
check
smoke:nfc
rules:firestore
callable:emulator
mission:emulator
evidence:emulator
test:emulator
```

Der verbindliche Gesamt-Test ist:

```bash
cd /var/www/WellFit-now/functions
npm run test:emulator
```

Erwartete Erfolgsmeldungen:

```txt
WellFit Emulator NFC Smoke Test erfolgreich.
WellFit Firestore Rules Smoke Test erfolgreich.
WellFit Callable Functions Emulator Test erfolgreich.
WellFit Mission Completion Emulator Test erfolgreich.
WellFit Mission Evidence Review Emulator Test erfolgreich.
```

## Getestete Sicherheitsfaelle

```txt
[x] Direkte Client-Writes auf kritische Collections werden blockiert.
[x] Direkte Client-Writes auf nfcScanClaims werden blockiert.
[x] Direkte Client-Writes auf missionEvidenceReviews werden blockiert.
[x] Fremde Tracking-Sessions werden blockiert.
[x] Fremde Evidence wird blockiert.
[x] RewardPreview ohne EvidenceReview wird gedrosselt.
[x] Riskante EvidenceReview setzt RewardPreview auf 0.
[x] Riskante EvidenceReview setzt PreviewStatus auf manual-review-required.
[x] Kein Flow autorisiert Rewards, XP, Punkte, Token oder finale Mission Completion.
```

## Aktueller Produktionsstatus

Zuletzt erfolgreich bestaetigt:

```txt
[x] npm run check
[x] npm run test:emulator
[x] NODE_OPTIONS="--max-old-space-size=768" npm run build
[x] pm2 restart wellfit-now --update-env
[x] pm2 status: wellfit-now online
[x] 29/29 statische Seiten generiert
```

## Naechste sinnvolle Ausbaustufen

### A. Evidence Quality v2

- Pose-/Motion-Scores detaillierter auswerten.
- NFC-Claim-Qualitaet mit Missionstyp verbinden.
- GPS-/Radius- und Zeitfenster staerker gewichten.
- Wiederholungsmuster pro Nutzer erkennen.

### B. RewardPreview v3

- UserDailyCap vorbereiten.
- MissionTypeCap vorbereiten.
- SystemReserveSnapshot read-only einbeziehen.
- Weiterhin keine Auszahlung.

### C. Final Mission Completion Engine spaeter

Erst nach weiterer Anti-Cheat-/Policy-Reife:

- serverseitige Completion-Entscheidung
- auditierbare RewardEvents
- echte XP-/Punkte-Gutschrift nur backendseitig
- Token-/WFT-Bezug erst nach Testphase und rechtlicher Pruefung

## Verweise

- `functions/index.js`
- `functions/lib/missionEvidenceReview.js`
- `functions/lib/missionRewardPolicy.js`
- `functions/test/evidenceReviewEmulatorTest.js`
- `functions/test/missionCompletionEmulatorTest.js`
- `functions/test/callableFunctionsEmulatorTest.js`
- `firestore.rules`
- `functions/EMULATOR_TEST_PLAN.md`
- `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md`
