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

## Datenmodelle spaeter

### missionRewardPolicies

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

### missionContextEvaluations

- evaluationId
- userId
- missionId
- ageBand
- dayType
- timeWindow
- parentMode
- gpsSafetyStatus
- allowedRadiusMeters
- estimatedMinutes
- proofQualityScore
- antiCheatScore
- contextFitScore
- serverValidationStatus

### missionRewardEvents

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

### systemReserveSnapshots

- snapshotId
- reserveBalance
- dailyEmissionCap
- dailyBurnTarget
- rewardPoolAvailable
- systemHealthScore
- createdAt

## Sicherheitsregeln

- Client darf Mission Completion nicht final autorisieren.
- Client darf Reward nicht final berechnen.
- KI darf Reward nicht final bestimmen.
- Backend prueft Alter, Kontext, Beweise, Mission, Tageslimit und Systemreserve.
- Token-/WFT-/Burn-Logik bleibt ausserhalb der Mobile-App.
- Kinder- und Familienmissionen brauchen strengere Radius-/Zeit-/Eltern-Regeln.
