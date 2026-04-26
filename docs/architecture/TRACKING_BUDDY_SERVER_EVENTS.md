# WellFit Tracking / Buddy Server Event Flows

## Ziel

`trackingSessions`, `trackingProofEvents` und `missionBuddyEvents` sind serverautorisierte Collections. Der Client darf diese Daten nicht direkt schreiben oder veraendern.

Die App darf nur Telemetrie, Beweise und Buddy-Interaktionen an Callable Functions senden. Cloud Functions schreiben daraus auditierbare Events.

## Aktuelle Callable Functions

### createTrackingSession

Erzeugt eine serverseitige Tracking-Session fuer eine Mission.

Eigenschaften:

- Auth erforderlich.
- `missionId` ist Pflicht.
- Quelle wird auf erlaubte Werte begrenzt.
- Proof-Type wird auf erlaubte Werte begrenzt.
- Setzt `serverValidationStatus = pending`.
- Setzt `rewardAuthorized = false`.
- Setzt `missionCompletionAuthorized = false`.

Diese Function startet nur eine Beweiskette. Sie autorisiert keine Mission Completion und keinen Reward.

### recordTrackingProof

Haengt ein Proof-Event an eine vorhandene Tracking-Session.

Eigenschaften:

- Auth erforderlich.
- Session muss existieren.
- Session muss dem Nutzer gehoeren.
- Fremde Nutzer werden blockiert.
- Schreibt `trackingProofEvents`.
- Erhoeht `trackingSessions.proofEventCount`.
- Setzt `serverValidationStatus = received` beziehungsweise `proof-received`.
- Setzt `rewardAuthorized = false`.
- Setzt `missionCompletionAuthorized = false`.

Diese Function sammelt Beweise, entscheidet aber noch nicht final ueber Gueltigkeit, Reward oder Mission Completion.

### createMissionBuddyEvent

Schreibt ein serverseitiges Buddy-/Mission-Event.

Beispiele:

- Buddy hat eine Mission erklaert.
- Buddy hat eine Aktion vorgeschlagen.
- Buddy-Aktion wurde angefordert.
- Buddy-Aktion wurde abgeschlossen.
- Itembedarf wurde angezeigt.
- Hinweis wurde gezeigt.

Eigenschaften:

- Auth erforderlich.
- `missionId` ist Pflicht.
- Event-Type wird auf erlaubte Werte begrenzt.
- Status wird auf erlaubte Werte begrenzt.
- Setzt `serverValidationStatus = recorded`.
- Setzt `rewardAuthorized = false`.
- Setzt `missionCompletionAuthorized = false`.

Diese Function ist ein Audit-/UX-/Telemetry-Flow, keine Reward-Autoritaet.

## Firestore Rules

Direkte Client-Writes sind blockiert fuer:

- `trackingSessions`
- `trackingProofEvents`
- `missionBuddyEvents`

Owner-Read ist erlaubt, damit Nutzer spaeter eigene Sessions, Proofs und Buddy-Events sehen koennen.

Fremde Daten bleiben blockiert.

## Sicherheitsgrenze

Diese neuen Callable Functions duerfen nicht verwechselt werden mit finaler Mission-Completion- oder Reward-Logik.

Weiterhin gilt:

- Client darf Mission Completion nicht final autorisieren.
- Client darf Reward nicht final berechnen.
- Buddy darf empfehlen, erklaeren und Ereignisse erzeugen.
- Backend entscheidet spaeter final ueber Mission Completion, Rewards, XP, Punkte und Anti-Cheat.
- WFT-/Token-/Burn-Logik bleibt ausserhalb der Mobile-App.

## Naechster Schritt

Auf dieser Grundlage kann spaeter geplant werden:

- `validateMissionCompletion`
- `evaluateMissionContext`
- `calculateMissionReward`
- `createMissionRewardEvent`
- `getSystemReserveSnapshot`

Diese Functions muessen deutlich strenger sein als die aktuellen Proof-/Audit-Flows und Alter, Kontext, GPS-/Radius-Sicherheit, Elternmodus, Beweisqualitaet, Anti-Cheat, Tageslimits und Systemreserve beruecksichtigen.
