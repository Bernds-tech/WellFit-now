# WellFit Buddy – Guide Mission Contract Draft

Status: Draft fuer spaetere App-/Backend-zu-Unity-KI-Guide-Kopplung.

## Ziel

Der Buddy soll spaeter AR-Missionen, Hinweise und naechste Schritte vorschlagen koennen. Unity zeigt diese Vorschlaege nur an und meldet Interaktionen zurueck. Die eigentliche Missionslogik bleibt in App/Backend.

## Harte Regel

Unity darf keine Mission final starten, abschliessen oder belohnen.

Unity darf nur:

- Missionsempfehlung visualisieren
- fehlende Faehigkeit erklaeren
- Dialog/Hinweis anzeigen
- Nutzeraktion als Event melden

## Beispiel: Mission Suggestion Payload

```json
{
  "contractVersion": "buddy-guide-v1",
  "missionId": "ar_walk_001",
  "missionType": "movement",
  "reason": "nearby-safe-surface",
  "difficulty": "easy",
  "rewardStatus": "preview-only",
  "requiredCapabilities": [],
  "hintText": "Lass uns ein paar Schritte machen."
}
```

## Beispiel: Missing Capability Payload

```json
{
  "contractVersion": "buddy-guide-v1",
  "capabilityId": "jumpBoost",
  "reason": "capability-needed",
  "hintText": "Dafuer brauche ich spaeter eine Sprung-Faehigkeit."
}
```

## Guide Eventnamen

Aktuell genutzt oder geplant:

```txt
onBuddyMissionSuggested
onBuddyCapabilityNeeded
onBuddyContextUpdated
```

## Mission-Status in Unity

Unity kennt nur Preview-/UI-Status:

```txt
preview-only
suggested
shown
cleared
```

Nicht erlaubt:

```txt
completed
rewarded
verified
anti-cheat-passed
```

Diese Status duerfen nur App/Backend fuehren.

## App-/Backend-Verhalten spaeter

1. Backend erzeugt oder validiert Missionsvorschlag.
2. App sendet Vorschlag an Unity.
3. Unity zeigt Buddy-Guide-Dialog oder Markierung.
4. Nutzer reagiert in AR.
5. Unity meldet Event zurueck.
6. Backend entscheidet, ob daraus Evidence oder Completion-Pruefung entsteht.

## Lokaler Debug-Stand

Aktuell gibt es in Unity Debug-Buttons fuer:

```txt
Mission: Gehen
Mission: Scannen
Fehlt: Sprungboost
Guide leeren
```

Diese Buttons erzeugen nur Vorschau-/Diagnoseevents.

## Naechste Schritte nach Retest

1. Compile pruefen.
2. Guide-Seite im Overlay testen.
3. Eventnamen aus Unity-Konsole/Logcat verifizieren.
4. Danach Bridge-Methode fuer echte Guide-Payloads planen, z. B. `ApplyGuideSuggestionJson(...)`.
5. App-/Backend-Vertrag mit `/api/buddy-ki` abgleichen.
