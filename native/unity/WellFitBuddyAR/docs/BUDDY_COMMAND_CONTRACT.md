# WellFit Buddy – App/Backend to Unity Command Contract Draft

Status: Draft fuer skalierbare App-/Backend-zu-Unity-Kopplung
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Dieses Dokument definiert, welche Befehle App/Backend spaeter an Unity senden duerfen, ohne dass Unity Produkt-, Reward-, Economy- oder Security-Autoritaet bekommt.

Unity fuehrt Commands nur visuell/AR-seitig aus und meldet Events zurueck.

---

## Harte Regel

Commands an Unity duerfen niemals bedeuten:

- Mission abgeschlossen
- Reward verdient
- XP/Punkte gebucht
- Token/WFT ausgezahlt
- NFT erhalten
- Jackpot/Burn ausgefuehrt
- Leaderboard aktualisiert
- Anti-Cheat bestanden
- Item/Faehigkeit final freigeschaltet

Diese Entscheidungen bleiben bei App/Backend/Rules/Functions.

---

## Command-Uebersicht

Geplante Commands:

```txt
placeBuddy
moveBuddy
callBuddyToUser
resetPlacement
applyAbilityState
applyGuideSuggestion
clearGuide
setCompanionMode
setDebugMode
```

---

## 1. placeBuddy

Zweck:

Buddy an einem Screen-Point auf einer erkannten AR-Flaeche platzieren.

Beispiel:

```json
{
  "contractVersion": "buddy-command-v1",
  "command": "placeBuddy",
  "screenPoint": {
    "x": 0.5,
    "y": 0.5,
    "normalized": true
  },
  "source": "app"
}
```

Unity darf:

- AR-RayCast ausfuehren
- Buddy platzieren
- Anchor-/Surface-Event melden

Unity darf nicht:

- Placement als Mission Completion werten
- Reward ausloesen

---

## 2. moveBuddy

Zweck:

Buddy zu einer erkannten Ziel-Flaeche bewegen.

Beispiel:

```json
{
  "contractVersion": "buddy-command-v1",
  "command": "moveBuddy",
  "screenPoint": {
    "x": 0.58,
    "y": 0.62,
    "normalized": true
  },
  "requestedMovement": "walkOrJump",
  "source": "app"
}
```

Unity darf:

- Ziel ueber RayCast suchen
- lokale MovementPolicy anwenden
- Walk/Jump visualisieren
- Reject melden, wenn Ziel unplausibel ist

Unity darf nicht:

- Bewegung als Anti-Cheat-Beweis behandeln
- Bewegung als Reward-Autoritaet behandeln

---

## 3. callBuddyToUser

Zweck:

Buddy zu einer Flaeche nahe dem Nutzer/der Kamera rufen.

Beispiel:

```json
{
  "contractVersion": "buddy-command-v1",
  "command": "callBuddyToUser",
  "screenPoint": {
    "x": 0.5,
    "y": 0.35,
    "normalized": true
  },
  "reason": "user-button",
  "source": "app"
}
```

Unity darf:

- Ziel-Flaeche suchen
- Rueckruf visualisieren
- Auto-Return-/Return-Events melden

Unity darf nicht:

- Nutzernaehe als Mission Completion werten
- Companion-Radius als alleinigen Evidence-Beweis behandeln

---

## 4. resetPlacement

Zweck:

AR-Platzierungszustand zuruecksetzen.

Beispiel:

```json
{
  "contractVersion": "buddy-command-v1",
  "command": "resetPlacement",
  "reason": "user-reset",
  "source": "app"
}
```

Unity darf:

- lokalen Placement-State zuruecksetzen
- Debug-/UI-Event melden

Unity darf nicht:

- Buddy-Zustand serverseitig loeschen
- Avatar-Level/Ausruestung/Progress veraendern

---

## 5. applyAbilityState

Zweck:

App/Backend uebergibt Unity einen sichtbaren Faehigkeitsstatus.

Beispiel:

```json
{
  "contractVersion": "buddy-command-v1",
  "command": "applyAbilityState",
  "buddyId": "default_buddy",
  "abilities": {
    "climbUp": true,
    "jumpBoost": false,
    "fetchClue": true,
    "scanObject": true,
    "carry": false,
    "pointAtObject": true
  },
  "source": "app-backend-validated"
}
```

Unity darf:

- Faehigkeiten visualisieren
- fehlende Faehigkeiten erklaeren
- Nutzungsversuche als Events melden

Unity darf nicht:

- Faehigkeit kaufen, verdienen oder freischalten
- Itembesitz autorisieren

---

## 6. applyGuideSuggestion

Zweck:

App/Backend uebergibt Unity einen Guide-/Mission-Hinweis.

Beispiel:

```json
{
  "contractVersion": "buddy-command-v1",
  "command": "applyGuideSuggestion",
  "missionId": "ar_walk_001",
  "missionType": "movement",
  "difficulty": "easy",
  "rewardStatus": "preview-only",
  "hintText": "Lass uns eine sichere Flaeche suchen.",
  "requiredCapabilities": [],
  "source": "backend"
}
```

Unity darf:

- Hinweis anzeigen
- Buddy-Dialog visualisieren
- Missionsempfehlung als Event melden

Unity darf nicht:

- Mission final starten
- Mission abschliessen
- Reward vergeben

---

## 7. clearGuide

Zweck:

Aktuellen Guide-/Hinweiszustand in Unity leeren.

Beispiel:

```json
{
  "contractVersion": "buddy-command-v1",
  "command": "clearGuide",
  "reason": "user-dismissed",
  "source": "app"
}
```

Unity darf:

- lokalen Guide-Hinweis leeren
- Context-Updated-Event melden

---

## 8. setCompanionMode

Zweck:

Companion-Verhalten fuer Debug oder spaetere Produktmodi umstellen.

Beispiel:

```json
{
  "contractVersion": "buddy-command-v1",
  "command": "setCompanionMode",
  "mode": "nearUser",
  "autoReturnEnabled": true,
  "nearDistanceMeters": 2.0,
  "farDistanceMeters": 5.0,
  "source": "app"
}
```

Erlaubte Modi, Draft:

```txt
manualOnly
nearUser
returnWhenFar
debugAutoReturn
```

Unity darf:

- lokales Companion-Verhalten anzeigen/steuern
- Auto-Return visualisieren

Unity darf nicht:

- Companion-Modus als Reward-/Completion-Beweis verwenden

---

## 9. setDebugMode

Zweck:

Debug-Overlay nur fuer Dev/Test aktivieren oder deaktivieren.

Beispiel:

```json
{
  "contractVersion": "buddy-command-v1",
  "command": "setDebugMode",
  "enabled": true,
  "source": "dev-build"
}
```

Regel:

Produktbuilds sollen spaeter ohne Debug-Overlay laufen oder Debug per Build-Flag deaktivieren.

---

## Command Result Events

Jeder Command soll spaeter eines oder mehrere Events erzeugen koennen:

```txt
onBuddyCommandReceived
onBuddyCommandCompleted
onBuddyCommandRejected
onArError
```

Beispiel:

```json
{
  "contractVersion": "buddy-ar-v1",
  "eventName": "onBuddyCommandRejected",
  "command": "moveBuddy",
  "reason": "no-plane-hit",
  "source": "unity",
  "debugOnly": false
}
```

---

## Fehler-/Reject-Reasons

Geplante Reasons:

```txt
unknown-command
invalid-payload
missing-anchor-controller
missing-navigation-controller
no-plane-hit
buddy-not-placed
buddy-already-moving
target-too-far
height-too-large
jump-not-allowed
capability-missing
command-not-allowed-in-product
```

---

## Skalierbarkeitsregel

Neue Commands werden nicht direkt ad hoc in bestehende grosse Methoden geschrieben.

Ablauf fuer neue Commands:

1. Command in diesem Contract ergaenzen.
2. Payload definieren.
3. erlaubte Unity-Wirkung definieren.
4. verbotene Autoritaet definieren.
5. Event-/Reject-Verhalten definieren.
6. erst danach Runtime-Code ergaenzen.

---

## Naechste Micro-Tasks

[ ] Nach Unity-Retest pruefen, welche Commands bereits praktisch gebraucht werden.
[ ] `CallBuddyToUserJson` spaeter an diesen Command-Contract angleichen.
[ ] `ApplyAbilityStateJson` planen, aber erst nach Compile-/Android-Retest implementieren.
[ ] `ApplyGuideSuggestionJson` planen, aber erst nach Compile-/Android-Retest implementieren.
[ ] Eventnamen zentralisieren.
[ ] Debug-Command und Product-Command trennen.

---

## Status

Dieser Contract ist bewusst noch Draft. Er verhindert, dass Unity beim weiteren Ausbau unkontrolliert Produkt-/Economy- oder Backend-Verantwortung uebernimmt.
