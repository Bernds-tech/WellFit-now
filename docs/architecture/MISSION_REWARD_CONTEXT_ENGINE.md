# WellFit Mission Reward / Context / Payout Engine

## Ausgangslage im aktuellen Code

Aktuelle Tagesmissionen enthalten eine MVP-Rewardlogik:

- `app/missionen/tagesmissionen/missions.ts` definiert Basis-Rewards pro Mission.
- `app/missionen/tagesmissionen/rewardEngine.ts` berechnet aktuell:
  - Basisreward
  - Diversity Multiplier
  - Anti-Farming Multiplier
  - Streak Multiplier
- `MissionDetails.tsx` zeigt den Reward Breakdown.
- `useDailyMissionFirebase.ts` speichert Start/Completion, Streak, XP und Level.
- `todolist/F` schreibt bereits vor: Punktevergabe, Einsaetze, Jackpot und Burn muessen langfristig serverseitig abgesichert werden.

Diese Basis ist gut fuer MVP/UI, darf aber langfristig nicht finale Autoritaet sein.

## Beta-Safety-Grenze 2026-05-15

- MVP/Beta nutzt nur interne Punkte und XP; echte WFT-/Token-/NFT-/Blockchain-/Wallet-/Payment-/Trading-/Payout-/Presale-Logik bleibt deaktiviert und `review_required`.
- Mission Completion, Rewards, XP, Punkte, Leaderboards, Inventory Grants und Rare Items sind nicht client-authoritativ. UI- oder Clientwerte sind nur MVP-Anzeige, Simulation oder Preview.
- Serverseitige Backend-/Audit-/Ledger-Autoritaet ist das Zielbild, aber bis zu separater Freigabe nur geplant bzw. Stub/Preview; dieses Dokument aktiviert keine finalen Ledger-Writes und keine Produktionsauszahlung.
- Health-, Child-, Location-, Camera-, Face-, Motion-, Privacy- und Consent-Signale duerfen nur datensparsam, einwilligungsbasiert und reviewpflichtig erweitert werden und nie allein finale Reward-/Completion-Entscheidungen tragen.

## Ziel

Die finale Auszahlung / Punktevergabe / spaetere Token-nahe Bewertung wird durch eine serverseitige Mission Reward Engine entschieden.

Die KI darf Missionen, Dimensionen, Item-Bedarfe und Detours vorschlagen, aber nicht final bestimmen:

- Reward
- Auszahlung
- Token-/WFT-Bezug
- Burn
- Mission Completion
- Item Grant
- Leaderboard

## Zentrale Regel

Die Auszahlung orientiert sich nicht nur an der Mission selbst, sondern an einem validierten Kontext:

- Missionstyp
- Schwierigkeit
- Dauer
- Alter / Altersgruppe
- Tageszeit
- Wochentag / Schultag / Wochenende
- Eltern-/Familienmodus
- GPS-/Radius-Sicherheit
- erlaubter Bewegungsraum
- Tracking-/AR-/NFC-Beweise
- Anti-Cheat-Score
- Streak
- Diversity
- Anti-Farming
- Systemreserve / WellFit-Wallet
- Emissions-/Burn-Rhythmus
- Tageslimit
- Quest-Chain-Tiefe

## Protected-Data Authority Boundary 2026-05-15

Kontextsignale koennen spaeter nur dann in eine serverseitige Bewertung einfliessen, wenn sie datensparsam, consent-basiert, geprueft und nicht allein entscheidend sind. Diese Dokumentationsrunde aktiviert keine Produktionsdatenerfassung, keine Legaltext-Aenderung, keine Consent-UI und keine finale Authority.

| Signalbereich | Erlaubte Rolle im Zielbild | Verbotene Rolle | Review-/Consent-Grenze |
|---|---|---|---|
| Health, Watch, HealthKit, Health Connect, Wearables | Grober Kontext, Plausibilitaet, freiwillige Motivation | Direkte Reward-/Completion-/Anti-Cheat-/medizinische Autoritaet | `review_required`, explizite Einwilligung, Datenminimierung, Fallback |
| Child, Minor, Family, Guardian, School/Club | Alters-/Safety-Kontext fuer risikoarme Missionen | Druck, Shame, Payout/PvP/Leaderboard-/Rare-Item-Autoritaet | `review_required`, Child-Safety-/Legal-/Privacy-Review |
| Exact Location, GPS, Radius, Safe-Zone, Checkpoint | Sicherheits-/Evidence-Hinweis fuer Orte | Alleiniger Completion-/Reward-Beweis oder dauerhafte Standorthistorie | `review_required`, klare Mission, kurze Speicherung, Fallback |
| Camera, AR image, Pose, Face, Mimic, Biometric, raw sensor/image/video | Lokale/ephemere Assistance, Preview, optionale Evidence | Speicherung von Rohbildern/-videos/Face Data als Default oder finale Autoritaet | `review_required`, ausdrueckliche Berechtigung, do-not-store Default |
| Browser DeviceMotion / acceleration / rotation / simple steps | Schwaches Kontext-/Plausibilitaetssignal | Finaler Schritt-, Reward-, Completion- oder Anti-Cheat-Beweis | Transparent, freiwillig; native/Health/Core-Motion nur nach Review |
| Consent / Permission status | Verarbeitungsgrenze und Audit-Hinweis | Reward-Booster, Druckmittel oder versteckte Tracking-Erlaubnis | Zweck, Zeitpunkt, Widerruf, Alternative und minimale Speicherung klaeren |

Folge fuer Reward- und Mission-Policy:

- Protected Data darf keinen Multiplikator, Bonus, Ausschluss oder Abschluss allein ausloesen.
- Jede spaetere Policy muss mehrere serverseitig gepruefte Signale, Limits, Review-Pfade und Fallbacks kombinieren.
- Permission-Denial muss als normaler Zustand behandelt werden; soweit moeglich sind sichere Non-Camera-/Non-GPS-/Non-Health-Missionen oder manuelle Review-Pfade vorzusehen.
- Raw Images/Videos/Face Templates, exakte Standortverlaeufe, Health-Rohdaten und Child-Detaildaten bleiben Default-`do_not_store`, solange kein gesonderter Human-/Legal-/Privacy-Review mit Datenmodell vorliegt.


## Aktueller technischer Zwischenstand: Mission Context Evaluation

`evaluateMissionContext` ist als serverseitiger Context-Evaluation-Stub angelegt.

Die Bewertungslogik liegt bewusst ausgelagert in:

```txt
functions/lib/missionContext.js
```

Die Callable Function:

- verlangt Auth,
- verlangt `missionId`,
- bewertet Altersband, Tagesart, Tageszeit, Elternmodus, GPS-/Radius-Kontext, Proof-Qualitaet, Dauer und Radius,
- schreibt `missionContextEvaluations`,
- setzt `rewardAuthorized = false`,
- setzt `missionCompletionAuthorized = false`,
- gibt eine Empfehlung wie `context-ok-for-review`, `needs-review` oder `reject-or-parent-review` aus.

Sie entscheidet noch nicht final ueber Mission Completion, Reward, XP oder Punkte.

### missionContextEvaluations

- evaluationId
- userId
- missionId
- ageBand
- dayType
- timeWindow
- parentMode
- gpsSafetyStatus
- proofQuality
- allowedRadiusMeters
- radiusMeters
- estimatedMinutes
- requiresParentMode
- safetyScore
- contextFitScore
- proofQualityScore
- recommendation
- flags
- serverValidationStatus
- rewardAuthorized
- missionCompletionAuthorized
- createdAt
- updatedAt

Firestore Rules:

- Nutzer duerfen eigene Context-Evaluationen lesen.
- Fremde Context-Evaluationen sind blockiert.
- Client darf keine Context-Evaluation direkt erstellen, updaten oder loeschen.

## Aktueller technischer Zwischenstand: Mission Completion Evaluation Stub

`evaluateMissionCompletion` ist als sicherer serverseitiger Evaluation-Stub angelegt.

Der Stub:

- verlangt Auth,
- verlangt `missionId`,
- akzeptiert optionale Referenzen auf vorhandene Belege:
  - `trackingSessionId`,
  - `trackingProofEventId`,
  - `nfcScanEventId`,
  - `missionBuddyEventId`,
- prueft, ob diese Belege dem Nutzer gehoeren,
- prueft, ob Belege zur Mission passen,
- schreibt `missionCompletionEvaluations`,
- setzt `accepted = false`,
- setzt `rewardAuthorized = false`,
- setzt `missionCompletionAuthorized = false`,
- setzt `xpAuthorized = false`,
- setzt `pointsAuthorized = false`.

Dieser Stub ist absichtlich noch keine finale Mission-Completion-Engine. Er sammelt und normalisiert Beweise, erzwingt Ownership-/Mission-Konsistenz und schafft die Audit-Grundlage fuer spaetere Anti-Cheat- und Reward-Entscheidungen.

### missionCompletionEvaluations

- evaluationId
- userId
- missionId
- evidenceRefs
  - trackingSessionId optional
  - trackingProofEventId optional
  - nfcScanEventId optional
  - missionBuddyEventId optional
- evidenceCount
- preliminaryStatus
- serverValidationStatus
- accepted
- rejectionReason
- rewardAuthorized
- missionCompletionAuthorized
- xpAuthorized
- pointsAuthorized
- createdAt
- updatedAt

Firestore Rules:

- Nutzer duerfen eigene Evaluationen lesen.
- Fremde Evaluationen sind blockiert.
- Client darf keine Evaluation direkt erstellen, updaten oder loeschen.

## Aktueller technischer Zwischenstand: Mission Reward Policy / Reward Preview Stub

`missionRewardPreview` ist als sicherer serverseitiger Preview-Stub angelegt.

Die Policy-/Preview-Logik liegt bewusst ausgelagert in:

```txt
functions/lib/missionRewardPolicy.js
```

Der Stub:

- verlangt Auth,
- verlangt `missionId`,
- akzeptiert optionale Referenzen auf:
  - `contextEvaluationId`,
  - `completionEvaluationId`,
- prueft Ownership und Mission-Zugehoerigkeit dieser Evaluationen,
- waehlt eine sichere Preview-Policy nach Altersband,
- berechnet nur eine schaetzende Simulation interner Punkte/XP,
- schreibt `missionRewardPreviews`,
- setzt immer:
  - `accepted = false`,
  - `rewardAuthorized = false`,
  - `xpAuthorized = false`,
  - `pointsAuthorized = false`,
  - `tokenAuthorized = false`,
  - `missionCompletionAuthorized = false`,
  - `estimatedTokenEquivalent = null`,
  - `estimatedBurnEquivalent = null`.

Dieser Stub ist absichtlich keine Reward-Engine und keine Auszahlung. Er ist nur ein Preview-/Audit-Baustein, damit UI und Backend spaeter denselben sicheren Denkpfad nutzen koennen, ohne bereits Rewards freizugeben.

### missionRewardPreviews

- previewId
- userId
- missionId
- contextEvaluationId optional
- completionEvaluationId optional
- previewStatus
- missionType
- ageBand
- policy
- baseRewardPreview
- multipliers
- estimatedInternalPoints
- estimatedXp
- estimatedTokenEquivalent null
- estimatedBurnEquivalent null
- reason
- flags
- rewardAuthorized false
- xpAuthorized false
- pointsAuthorized false
- tokenAuthorized false
- missionCompletionAuthorized false
- serverValidationStatus
- createdAt
- updatedAt

Firestore Rules:

- Nutzer duerfen eigene RewardPreviews lesen.
- Fremde RewardPreviews sind blockiert.
- Client darf keine RewardPreview direkt erstellen, updaten oder loeschen.

## Geplante Policy-/System-Collections

### missionRewardPolicies

Aktuell als geplante/read-only Policy-Collection abgesichert. Client-Writes sind blockiert.

- policyId
- missionType
- ageBand
- baseRewardRange
- maxDailyReward
- maxQuestDepth
- allowedRadiusMeters
- requiresParentMode
- allowedTimeWindows
- proofRequirements
- antiFarmingRules
- systemReserveWeight
- version

### systemReserveSnapshots

Aktuell als geplante/read-only Systemgesundheits-Collection abgesichert. Client-Writes sind blockiert.

- snapshotId
- reserveBalance
- dailyEmissionCap
- dailyBurnTarget
- rewardPoolAvailable
- systemHealthScore
- createdAt

### missionRewardEvents

Aktuell als geplante Audit-Collection abgesichert. Nutzer duerfen eigene RewardEvents lesen, aber Client-Writes sind blockiert.

- rewardEventId
- userId
- missionId
- rootMissionId optional
- questChainId optional
- baseReward
- multipliers
- finalReward
- xpGranted
- internalPointsGranted
- tokenEquivalent optional webOnly
- burnEquivalent optional webOnly
- reserveSnapshotId optional
- serverValidationStatus
- createdAt

## Alters- und Sicherheitskontext

Ein 4-jaehriges Kind darf nicht denselben Missionsradius erhalten wie ein Jugendlicher oder Erwachsener.

### Leitplanken

- Kleinkind: nur sehr kurze, sichere Indoor-/Garten-/Eltern-nahe Missionen.
- Kind: kurze Missionen, kein Alleingang ueber Strassen, klare Elternfreigabe.
- Jugendlicher: groesserer Radius moeglich, aber Tageszeit und Umgebung beachten.
- Erwachsener: groesserer Bewegungsradius moeglich.
- Senior: Bewegungsintensitaet und Sicherheit anpassen.

GPS und Kontextdaten sind wichtig, duerfen aber nur mit Consent und Datenminimierung genutzt werden.

## Tageszeit und Wochenkontext

Die KI-/Mission-Engine muss unterscheiden:

- Sonntagvormittag mit Eltern: laengere Familien-/Wander-/Outdoor-Mission moeglich.
- Schultag 16:00 Uhr: kuerzere, sichere, schnell abschliessbare Mission.
- Abend/Nacht: keine weiten Outdoor-Kinder-Missionen.
- Wetter/Umgebung spaeter optional einbeziehbar.

## Quest Chains / Item-Detours

Wenn ein Item fehlt oder zu teuer ist, soll zuerst eine faire spielerische Alternative angeboten werden.

Beispiel:

1. Hauptmission braucht `rope_001`.
2. Nutzer besitzt `rope_001` nicht.
3. Buddy bietet Nebenmission an: "Wir koennen ein Kletterseil finden."
4. Nebenmission muss altersgerecht, sicher und tagesfaehig sein.
5. Backend validiert Completion.
6. Nutzer erhaelt Item oder temporaere Capability.
7. Nutzer kehrt zur Hauptmission zurueck.

Grenzen:

- maximal 1 bis 2 Nebenmissions-Ebenen pro Tagesmission
- keine endlosen Item-Ketten
- keine Paywall-Ketten
- klare Rueckkehr zur Hauptmission
- geschaetzte Gesamtzeit muss tagesfaehig bleiben

## Systemreserve / WellFit-Wallet / Emission

Spaetere Token-nahe Bewertung darf nicht nur von Nutzeraktion abhaengen.

Sie muss sich auch am WellFit-Systemzustand orientieren:

- Wie viele Token/WFT befinden sich in der WellFit-Reserve/Wallet?
- Welche maximale Tagesemission ist erlaubt?
- Welcher Anteil wird intern vergeben?
- Welcher Anteil wird spaeter verbrannt?
- Welcher Anteil bleibt in Reserve?
- Welche Missionstypen werden aktuell bevorzugt?
- Gibt es Anti-Farming-Drosselung?

Wichtig:

- In der Mobile-App bleibt es vorerst bei internen Punkten/XP.
- Keine echte Token-Ausschuettung vor Testphase.
- Echte Token-/Burn-/WFT-Logik nur serverseitig/Web-Dashboard/Smart Contract nach rechtlicher Pruefung.

## Vorgeschlagene Reward-Formel serverseitig

Die bestehende Formel bleibt als MVP-Grundlage erhalten:

```txt
baseReward
× diversityMultiplier
× antiFarmingMultiplier
× streakMultiplier
```

Spaeter erweitert:

```txt
validatedReward = baseReward
  × diversityMultiplier
  × antiFarmingMultiplier
  × streakMultiplier
  × ageSafetyMultiplier
  × contextFitMultiplier
  × proofQualityMultiplier
  × systemReserveMultiplier
  × questDepthLimiter
```

Danach wird serverseitig gecappt:

```txt
finalReward = min(validatedReward, userDailyCap, systemDailyEmissionCap, missionTypeCap)
```

## Sicherheitsregeln

- Client darf Mission Completion nicht final autorisieren.
- Client darf Reward nicht final berechnen.
- Client darf RewardPreview nicht direkt schreiben oder veraendern.
- KI darf Reward nicht final bestimmen.
- Backend prueft Alter, Kontext, Beweise, Mission, Tageslimit und Systemreserve.
- Token-/WFT-/Burn-Logik bleibt ausserhalb der Mobile-App.
- Kinder- und Familienmissionen brauchen strengere Radius-/Zeit-/Eltern-Regeln.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und die fuehrenden Dateien: `todolist/DATABASE_PLAN.md`, `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`.

Arbeite mit dieser Datei nur ergaenzend und nachvollziehbar. Loesche keine alten Aufgaben, Roadmap-Punkte, Statushinweise oder erledigten Eintraege. Markiere veraltete oder doppelte Punkte nur als `veraltet`, `duplikat`, `erledigt`, `offen` oder `zu pruefen`.

Wenn du offene Punkte aus dieser Datei uebernimmst, verlinke sie in `todolist/TODO_INDEX.md` oder uebertrage sie nach `todolist/NEXT_ACTIONS.md`. Dokumentiere erledigte Arbeit in `todolist/DONE_LOG.md`.

