# WellFit – Buddy Mobile Unity Bridge Plan

Status: Draft fuer spaetere Mobile-App-zu-Unity-Integration
Branch-Kontext: `wellfit/upload-local-unity-ar-buddy`
PR-Kontext: #13

---

## Zweck

Dieses Dokument beschreibt die geplante Bruecke zwischen WellFit Mobile/App-Schicht und dem Unity AR Buddy.

Unity ist AR-/Visualisierungs-/Event-Schicht. Die Mobile/App-Schicht steuert Commands, zeigt Produktkontext und leitet Events kontrolliert an App/Backend weiter.

---

## Zielbild

```txt
Mobile App / Native Wrapper
        |
        | Commands
        v
Unity WellFitNativeBridge
        |
        | Visualisierung / AR / Buddy Bewegung
        v
Unity Events
        |
        | Rueckgabe an App
        v
Mobile App Event Router
        |
        | optional serverseitig
        v
Backend Callable Functions
```

---

## Verantwortlichkeiten

### Mobile/App

Darf:

- Nutzeraktionen starten
- Unity Commands senden
- Mission-/Guide-Kontext vom Backend holen
- Ability-State vom Backend/App-State an Unity uebergeben
- Unity Events anzeigen oder loggen
- Events spaeter an Backend Callable Functions senden

Darf nicht:

- Rewards/XP/Punkte clientseitig autorisieren
- Mission Completion clientseitig final entscheiden
- Anti-Cheat clientseitig final entscheiden
- Token-/NFT-/Trading-Funktionen in Mobile enthalten

### Unity

Darf:

- AR platzieren
- Buddy bewegen
- Hinweise visualisieren
- lokale AR-Plausibilitaet pruefen
- Events melden

Darf nicht:

- Rewards/XP/Punkte autorisieren
- Mission Completion autorisieren
- Token/WFT/NFT/Jackpot/Burn autorisieren
- Anti-Cheat entscheiden
- Item-/Faehigkeitsbesitz final entscheiden

### Backend

Darf:

- Mission-/Guide-Kontext validieren
- Ability-/Item-State bereitstellen
- Events serverseitig loggen
- Evidence pruefen
- Completion/Reward spaeter autorisieren

---

## Command-Fluss

### Beispiel: Buddy rufen

1. Nutzer tippt in Mobile UI auf „Buddy rufen“.
2. Mobile erstellt Command `callBuddyToUser`.
3. Mobile sendet Command an Unity Bridge.
4. Unity raycastet auf Flaeche nahe Bildschirmmitte.
5. Unity bewegt Buddy oder meldet Reject.
6. Mobile zeigt Produkt-Hinweis oder Debug-Diagnose.
7. Optional: Event wird spaeter an Backend geloggt.

---

## Geplante Mobile Command API

Pseudo-Interface:

```ts
type BuddyUnityCommand =
  | { command: "placeBuddy"; screenPoint: BuddyScreenPoint }
  | { command: "moveBuddy"; screenPoint: BuddyScreenPoint; requestedMovement?: "walkOrJump" }
  | { command: "callBuddyToUser"; screenPoint?: BuddyScreenPoint; reason: string }
  | { command: "resetPlacement"; reason: string }
  | { command: "applyAbilityState"; buddyId: string; abilities: BuddyAbilityState }
  | { command: "applyGuideSuggestion"; suggestion: BuddyGuideSuggestion }
  | { command: "clearGuide"; reason: string }
  | { command: "setCompanionMode"; mode: BuddyCompanionMode }
  | { command: "setDebugMode"; enabled: boolean };
```

---

## Geplante Event-Router API

Pseudo-Interface:

```ts
type BuddyUnityEvent = {
  contractVersion: "buddy-ar-v1";
  source: "unity";
  eventName: string;
  payloadType: string;
  debugOnly: boolean;
  requestId?: string;
  clientTimestampMs?: number;
  payload: Record<string, unknown>;
};
```

Mobile Event Router entscheidet:

```txt
Debug Event -> Debug UI / lokales Log
Product Event -> Product UI State
Evidence Candidate -> spaeter Callable Function, aber nur logged-only
Error Event -> freundliche UI-Meldung + Debug Log
```

---

## Product UI Mapping

Unity-Event oder App-Kontext wird auf Product-UI-Hinweis gemappt.

Beispiele:

```txt
onBuddyActionRejected + no-plane-hit
-> surface.notFound.default

onBuddyActionRejected + target-too-far
-> movement.tooFar.default

onBuddyCapabilityNeeded + jumpBoost
-> ability.missing.jumpBoost

onBuddyMissionSuggested
-> guide.missionSuggested.default
```

---

## Debug UI Mapping

Debug UI darf mehr Details zeigen:

- Eventname
- Payload preview
- Navigation reject reason
- Surface ID
- Anchor ID
- request/reject counters

Aber Debug UI bleibt getrennt von Product UI.

---

## Session-Konzept Draft

Mobile sollte spaeter eine AR-Session-ID fuehren:

```txt
arSessionId
startedAt
devicePlatform
unityBuildVersion
appVersion
debugMode
```

Events koennen diese Session-ID tragen.

---

## Offline-/No-Backend-Modus

Wenn Backend nicht erreichbar ist:

- Unity kann weiter lokal AR visualisieren.
- Mobile kann lokale Product-Hinweise anzeigen.
- Events werden nicht fuer Reward/Completion genutzt.
- Optional spaeter: lokale Queue, aber nur fuer Diagnose, nicht fuer Reward.

---

## App-Store-/Compliance-Hinweis

Mobile App bleibt frei von:

- Presale
- Trading
- Staking
- NFT-Marktplatz
- Token-Auszahlung
- Investment-/Finanzversprechen

AR-Buddy-Funktionen bleiben Bewegung, Guide, Hinweise, Mission Preview und interne Punkte-/XP-Produktlogik unter Backend-Autoritaet.

---

## Fehlerbehandlung

Unity-Fehler:

```txt
onArError
onBuddyActionRejected
onBuddyCommandRejected
```

Mobile zeigt Produkttext, nicht technische Rohdaten.

Beispiele:

```txt
ar-no-plane-hit -> Zeig mir kurz eine freie Flaeche.
buddy-not-placed -> Setz mich zuerst auf eine Flaeche.
buddy-already-moving -> Ich bin schon unterwegs.
```

---

## Nicht vor Unity-Retest implementieren

[!] Kein echter Mobile-Unity-Bridge-Code vor Unity Compile-/Android-Retest.
[!] Kein Event-Ingestion-Code vor bestaetigten Unity-Events.
[!] Keine Reward-/Completion-Kopplung.

---

## Naechste Micro-Tasks nach Unity-Retest

[ ] Bestaetigen, welche Unity-Bridge-Aufrufe wirklich funktionieren.
[ ] `callBuddyToUser` App-seitig als erstes Command planen.
[ ] Ability-State Command erst nach stabilem Debug-Test planen.
[ ] GuideSuggestion Command mit `/api/buddy-ki` abgleichen.
[ ] EventRouter als App-Schicht planen.
[ ] Product UI Mapping mit Message Keys verbinden.
