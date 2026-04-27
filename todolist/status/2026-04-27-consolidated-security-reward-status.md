# Konsolidierter Status – Mission Security / Reward Preview / Evidence

Datum: 2026-04-27
Repository: Bernds-tech/WellFit-now

## Zweck

Diese Statusdatei konsolidiert den tatsaechlich umgesetzten Stand nach den letzten Backend-/Security-Bloecken. Sie dient als Bruecke zu `F`, `G`, `J` und den Architekturdateien, falls die grossen Roadmap-Dateien nicht in einem Schritt ersetzt werden koennen.

## Umgesetzte Bloecke

### 1. MissionRewardPolicy + RewardPreview Stub

Status: [x] umgesetzt, getestet, gebaut

- `functions/lib/missionRewardPolicy.js` angelegt.
- `missionRewardPreview` Callable Function angelegt.
- `missionRewardPreviews` Collection eingefuehrt.
- `missionRewardPolicies` als read-only Policy-Modell abgesichert.
- `systemReserveSnapshots` als read-only Systemgesundheitsmodell abgesichert.
- `missionRewardEvents` als spaeteres Audit-Modell abgesichert.
- RewardPreview bleibt reine Simulation.
- Keine XP-, Punkte-, Reward-, Token- oder Completion-Autorisierung.

### 2. Transaktionaler NFC-Duplicate-Schutz

Status: [x] umgesetzt, getestet, gebaut

- `nfcScanClaims` Collection eingefuehrt.
- Claim-ID basiert auf `tagId + userId + missionId`.
- `validateNfcScan` nutzt Firestore-Transaction.
- Claim, Scan-Event, Inventory-Grant, Capability-Grant und UsageCount laufen atomar.
- Duplicate Scan erzeugt keinen zweiten Claim.
- Duplicate Scan erzeugt kein zweites Inventory Item.
- Client Read/Write auf `nfcScanClaims` komplett blockiert.

### 3. Mission Evidence Review v1

Status: [x] umgesetzt, getestet, gebaut

- `functions/lib/missionEvidenceReview.js` angelegt.
- `reviewMissionEvidence` Callable Function angelegt.
- `missionEvidenceReviews` Collection eingefuehrt.
- Owner-Read, keine Client-Writes.
- Bewertet Evidence aus:
  - `trackingSessions`
  - `trackingProofEvents`
  - `nfcScanEvents`
  - `missionBuddyEvents`
  - `missionContextEvaluations`
  - `missionCompletionEvaluations`
  - `missionRewardPreviews`
- Berechnet:
  - `evidenceTypes`
  - `evidenceCount`
  - `flags`
  - `plausibilityScore`
  - `proofQualityScore`
  - `antiCheatRiskScore`
  - `recommendation`
- Keine XP-, Punkte-, Reward-, Token- oder Completion-Autorisierung.

### 4. Proof-Quality-Drosselung in RewardPreview

Status: [x] umgesetzt, getestet, gebaut

- `missionRewardPreview` akzeptiert optional `evidenceReviewId`.
- Ohne Evidence Review wird RewardPreview vorsichtig gedrosselt: `evidenceReviewMultiplier = 0.65`.
- Schwache Evidence wird staerker gedrosselt.
- Riskante Evidence setzt Preview auf `manual-review-required`.
- Riskante Evidence setzt `estimatedInternalPoints = 0`.
- Riskante Evidence setzt `estimatedXp = 0`.
- Keine Auszahlung und keine Autorisierung.

## Tests

Zuletzt erfolgreich bestaetigt:

```txt
npm run check
npm run test:emulator
```

Teiltests erfolgreich:

```txt
WellFit Emulator NFC Smoke Test erfolgreich.
WellFit Firestore Rules Smoke Test erfolgreich.
WellFit Callable Functions Emulator Test erfolgreich.
WellFit Mission Completion Emulator Test erfolgreich.
WellFit Mission Evidence Review Emulator Test erfolgreich.
```

## Production Build / PM2

Zuletzt erfolgreich bestaetigt:

```txt
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
pm2 status
```

Ergebnis:

```txt
Compiled successfully
Finished TypeScript
29/29 static pages generated
wellfit-now online
```

## Roadmap-Auswirkung

### F - FIREBASE / REALTIME / MISSIONEN

Folgende Punkte sind nicht mehr offen, sondern technisch begonnen/umgesetzt:

- `missionRewardPolicies` vorbereitet.
- `missionRewardPreviews` eingefuehrt.
- `missionEvidenceReviews` eingefuehrt.
- `nfcScanClaims` eingefuehrt.
- `systemReserveSnapshots` als read-only Modell vorbereitet.
- `missionRewardEvents` als Audit-Modell vorbereitet.
- direkte Client-Writes auf diese Collections blockiert.

### G - REWARD SYSTEM / SYSTEM HEALTH / NEXT-GEN MECHANICS

Folgende Punkte sind nicht mehr offen:

- NFC Duplicate-Scan-Schutz transaktional/deterministisch abgesichert.
- Evidence Review als erster Sensor-Fusion-/Anti-Cheat-Zwischenlayer umgesetzt.
- Proof-Quality-Drosselung in RewardPreview umgesetzt.
- Belohnungen werden bei unsicheren Daten in der Preview gedrosselt.

Weiter offen:

- echte Anti-Cheat AI
- langfristige Pattern-Erkennung ueber mehrere Tage/Wochen
- echte Reward Engine
- echte serverseitige XP-/Punkte-Gutschrift
- SystemReserveSnapshot in Preview v3 einbeziehen
- UserDailyCap und MissionTypeCap vorbereiten

### J - NAECHSTE EMPFOHLENE ARBEIT

Der bisherige PRIO-3-Block ist teilweise abgeschlossen:

[x] NFC Duplicate-Scan-Schutz transaktional/deterministisch absichern.
[x] Pose/Motion/AR/NFC/GPS-Beweise in ein erstes Anti-Cheat-/Evidence-Modell ueberfuehren.
[x] Proof-Qualitaet mit Tracking-/NFC-/Context-/Completion-/RewardPreview-Daten verbinden.
[x] Reward-Drosselung bei unsicheren Daten vorbereiten.

Weiter offen:

[ ] Unplausible Sessions detaillierter markieren.
[ ] Wiederholtes Fake-/Pattern-Verhalten erkennen.
[ ] SystemReserveSnapshot in RewardPreview v3 einbeziehen.
[ ] UserDailyCap und MissionTypeCap vorbereiten.

## Verbindliche Sicherheitsregel bleibt bestehen

Alle neu eingefuehrten Bloecke bleiben ohne finale Autoritaet:

```txt
rewardAuthorized=false
xpAuthorized=false
pointsAuthorized=false
tokenAuthorized=false
missionCompletionAuthorized=false
```

Mobile bleibt weiterhin frei von Token-/Trading-/Presale-/NFT-Marktplatz-Funktionen.

## Neue Architekturdatei

Siehe:

```txt
docs/architecture/MISSION_EVIDENCE_REVIEW_PROOF_DAMPENING.md
```

## Naechster sinnvoller Entwicklungsblock

Empfohlene Reihenfolge:

1. UserDailyCap + MissionTypeCap als reine Preview-/Policy-Grenzen vorbereiten.
2. SystemReserveSnapshot read-only in RewardPreview v3 einbeziehen.
3. Unplausible Sessions detaillierter markieren.
4. Spaeter erst echte Reward Engine / XP-/Punkte-Gutschrift.
