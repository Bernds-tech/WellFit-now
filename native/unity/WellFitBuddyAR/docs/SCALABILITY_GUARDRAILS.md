# WellFitBuddyAR – Scalability Guardrails

Stand: 2026-04-27

## Ziel

Der KI-Buddy-/Unity-AR-Bereich muss von Anfang an skalierbar bleiben. Das bedeutet: keine riesigen Monolith-Dateien, keine vermischte Verantwortung und keine clientseitige Autoritaet fuer produktkritische Logik.

## Grundregeln

- [ ] Kleine, klar benannte Komponenten statt grosser Universal-Scripts.
- [ ] Unity rendert und meldet AR-Events, entscheidet aber keine Rewards oder Mission Completion.
- [ ] Backend/App bleiben Autoritaet fuer Evidence, Anti-Cheat, Completion und spaetere interne Rewards.
- [ ] Eventnamen und Payloads folgen `docs/AR_EVENT_CONTRACT.md`.
- [ ] Neue Buddy-Faehigkeiten werden als eigene Controller-/Policy-Erweiterungen geplant, nicht hart in UI oder Animationen verdrahtet.
- [ ] AR-Surface-, Anchor-, Marker-, Dialog- und Ability-Logik bleiben getrennt.

## Komponenten-Grenzen

### WellFitNativeBridge

- Sendet Events aus Unity an App/Backend.
- Nimmt einfache Befehle von App entgegen.
- Keine Reward-Logik.
- Keine Mission-Completion-Logik.

### BuddyAnchorController

- Raycast / Hit-Test.
- Anchor-Erstellung.
- Buddy-Platzierung.
- Keine Dialoglogik.
- Keine Reward-Logik.

### BuddyNavigationController

- WalkTo.
- JumpTo.
- Bewegung zwischen Surface Nodes.
- Keine Backend-Entscheidung.

### BuddyAbilityController

- Visualisiert Faehigkeiten.
- Meldet Action Started / Completed / Rejected.
- Prueft lokal nur, ob eine Capability im Clientzustand vorhanden ist.
- Backend entscheidet, ob Capability wirklich gueltig ist.

### BuddyKiGuideController

- Verwaltet Guide-Kontext, Missionsempfehlung und Mood.
- Darf Vorschlaege machen.
- Darf keine Rewards oder Completion autorisieren.

### BuddyDialogueEventBridge

- Dialogqueue und Dialogevents.
- Keine Mission- oder Rewardentscheidung.

### ArMissionHintMarker

- Visualisiert Hinweise und Orte.
- Meldet Marker-Events.
- Keine Completion-Entscheidung.

## Skalierbare Ordnerstruktur

```txt
Assets/
  Scenes/
  Scripts/
    Bridge/
    Buddy/
    Buddy/Abilities/
    Buddy/Navigation/
    Buddy/Dialog/
    AR/
    AR/Markers/
  Prefabs/
    Buddy/
    AR/
    UI/
  Materials/
  Models/
  Animations/
  ScriptableObjects/
```

Die aktuelle `Assets/Scripts`-Flachstruktur ist nur fuer den ersten Prototyp erlaubt. Sobald mehr als ca. 10 echte Scripts entstehen, wird in Unterordner aufgeteilt.

## Event-Skalierung

Alle Unity-Events sollen langfristig ein gemeinsames Envelope nutzen:

```json
{
  "eventId": "evt_...",
  "eventType": "buddyPlaced",
  "buddyId": "default",
  "missionId": "optional",
  "arSessionId": "optional",
  "anchorId": "optional",
  "surfaceId": "optional",
  "markerId": "optional",
  "capabilityId": "optional",
  "itemId": "optional",
  "payload": {}
}
```

## Performance-Regeln fuer Mobile AR

- [ ] Low-poly Buddy-Modelle.
- [ ] Kleine Texturen.
- [ ] Keine schweren Shader im ersten Prototyp.
- [ ] Kein unkontrolliertes Spawning von Markern, Anchors oder Surface Nodes.
- [ ] Alte Debug-Objekte entfernen oder poolen.
- [ ] Animations- und Materialanzahl begrenzen.
- [ ] Development Visuals spaeter fuer Production abschaltbar machen.

## Daten- und Privacy-Regeln

- [ ] Keine Roh-Kamera-Bilder ohne explizite Notwendigkeit speichern.
- [ ] AR-Events so datenarm wie moeglich halten.
- [ ] Standort-/Umgebungsdaten nur mit Consent und Zweckbindung nutzen.
- [ ] Kinder-/Familienmodus beruecksichtigen.

## Was vermieden werden muss

- [!] Ein einzelner grosser `BuddyManager`, der alles macht.
- [!] Unity-Scripts, die direkt Punkte oder Rewards gutschreiben.
- [!] Hardcodierte Missionen im Unity-Code.
- [!] Hardcodierte Preise, Token, Jackpot oder Burn in Unity.
- [!] Unbegrenzte Event- oder Marker-Erzeugung.
- [!] App-Store-kritische Token-/Trading-/NFT-Funktionen in Mobile.

## Nächster Skalierungsschritt

Wenn der erste ARCore-Prototyp laeuft:

1. Event Envelope in TypeScript und C# synchronisieren.
2. NativeArBridge um typed AR Events erweitern.
3. BuddyArEvents Backend-Collection vorbereiten.
4. Unity-Scripts in Unterordner nach Verantwortung aufteilen.
5. Performance-Budget fuer Buddy, Marker und Surfaces festlegen.
