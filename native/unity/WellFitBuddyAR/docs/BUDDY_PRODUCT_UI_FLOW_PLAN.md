# WellFit Buddy – Product UI Flow Plan

Status: Draft fuer spaetere Nutzer-UI nach stabilem Unity Debug-Retest
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Dieses Dokument beschreibt die spaeteren Nutzer-Flows fuer die AR-Buddy-Produkt-UI.

Die Product-UI ist getrennt vom Debug-Overlay. Sie zeigt klare, kurze Hinweise und wenige einfache Aktionen. Sie enthaelt keine technischen Diagnosen und keine Reward-/Completion-Autoritaet.

---

## UI-Ebenen

```txt
Debug Overlay = Entwickler/QA
Product UI    = normale Nutzer
Backend/App   = Autoritaet fuer Rewards, Items, Missionen, Security
```

---

## Flow 1 – AR startet

### Ausgangslage

Nutzer oeffnet AR-Buddy.

### Product UI

```txt
Ich bin bereit.
Schau dich langsam um, damit ich eine Flaeche finde.
```

### Message Keys

```txt
buddy.ready.default
surface.scanMore.default
```

### Unity Events

```txt
onArReady
onArError falls AR nicht bereit ist
```

### Nicht erlaubt

- keine Mission starten
- keine Rewards
- keine Completion

---

## Flow 2 – Flaeche wird nicht gefunden

### Ausgangslage

Raycast findet keine Plane.

### Product UI

```txt
Ich sehe noch keine passende Flaeche.
Zeig mir kurz den Boden oder eine freie Flaeche.
```

### Message Keys

```txt
surface.notFound.default
surface.showFreeArea.default
```

### Unity Events

```txt
onArError
onBuddyActionRejected reason=no-plane-hit
```

### App-Verhalten

- Nutzerfreundlichen Hinweis anzeigen.
- Debug-Diagnose nur in Dev-UI.
- Kein Backend-Reward.

---

## Flow 3 – Buddy platzieren

### Ausgangslage

Nutzer tippt auf gueltige AR-Flaeche.

### Product UI

```txt
Ich bin da.
```

### Message Keys

```txt
buddy.placed.default
```

### Unity Events

```txt
onAnchorCreated
onBuddyPlaced
```

### App-Verhalten

- UI kann Buddy-Status auf platziert setzen.
- Event spaeter optional loggen.
- Keine Mission Completion.

---

## Flow 4 – Buddy bewegen

### Ausgangslage

Nutzer tippt auf neue gueltige Flaeche.

### Product UI

Beim Start:

```txt
Ich bin unterwegs.
```

Bei Ziel:

```txt
Ich bin angekommen.
```

### Message Keys

```txt
movement.started.default
movement.targetReached.default
```

Neue Message Key Empfehlung:

```txt
movement.started.default
Fallback: Ich bin unterwegs.
```

### Unity Events

```txt
onBuddyActionStarted
onBuddyReachedSurface
onBuddyActionCompleted
```

### App-Verhalten

- Lokale UI aktualisieren.
- Optional Event loggen.
- Keine Completion.

---

## Flow 5 – Ziel ist zu weit

### Ausgangslage

MovementPolicy lehnt Ziel ab.

### Product UI

```txt
Das ist noch zu weit fuer mich.
```

### Message Keys

```txt
movement.tooFar.default
```

### Unity Events

```txt
onBuddyActionRejected reason=target-too-far
```

### App-Verhalten

- Freundlicher Hinweis.
- Keine technische Meldung fuer Nutzer.
- Kein Reward.

---

## Flow 6 – Buddy rufen

### Ausgangslage

Nutzer tippt „Buddy rufen“.

### Product UI

```txt
Ich komme wieder zu dir.
```

Wenn keine Flaeche gefunden wird:

```txt
Zeig mir kurz eine freie Flaeche.
```

### Message Keys

```txt
buddy.returning.default
surface.showFreeArea.default
```

### Commands

```txt
callBuddyToUser
```

### Unity Events

```txt
onBuddyActionStarted action=returnToUser
onBuddyActionCompleted action=returnToUser
onBuddyActionRejected reason=no-plane-hit
```

---

## Flow 7 – Auto-Return / Companion Radius

### Ausgangslage

Buddy ist zu weit entfernt oder Auto-Return wird debug/testweise ausgeloest.

### Product UI

```txt
Ich komme wieder zu dir.
```

### Message Keys

```txt
buddy.returning.default
```

### App-Verhalten

- Product UI zeigt nur einfache Rueckkehrmeldung.
- Debug UI zeigt Distanz, Cooldown, Counters.

### Nicht erlaubt

Companion-Radius ist kein Completion-Beweis.

---

## Flow 8 – Fehlende Faehigkeit

### Ausgangslage

Buddy soll springen/klettern/scannen, aber AbilityState erlaubt es nicht.

### Product UI

```txt
Dafuer brauche ich spaeter eine Sprung-Faehigkeit.
Wir koennen einen anderen Weg suchen.
```

### Message Keys

```txt
ability.missing.jumpBoost
ability.alternative.default
```

### Unity Events

```txt
onBuddyCapabilityNeeded
onBuddyActionRejected reason=capability-missing
```

### App-/Backend-Verhalten

- Backend/App entscheidet Ability-State.
- Unity zeigt nur Hinweis.
- Kein Kaufdruck, keine automatische Freischaltung.

---

## Flow 9 – Guide Mission Suggestion

### Ausgangslage

App/Backend oder Debug gibt Missionsempfehlung an Unity.

### Product UI

```txt
Ich habe eine passende AR-Mission gefunden.
Wollen wir diese Mission starten?
```

### Message Keys

```txt
guide.missionSuggested.default
```

Neue Message Key Empfehlung:

```txt
guide.startPrompt.default
Fallback: Wollen wir diese Mission starten?
```

### Commands

```txt
applyGuideSuggestion
```

### Unity Events

```txt
onBuddyMissionSuggested
```

### Nicht erlaubt

Unity startet Mission nicht final und vergibt keine Rewards.

---

## Flow 10 – Sicherheits-/Umgebungshinweis

### Ausgangslage

Nutzer bewegt Kamera stark oder AR-Kontext erfordert ruhiges Verhalten.

### Product UI

```txt
Achte bitte auf deine Umgebung.
Bleib kurz stehen, wenn du dich umschaust.
```

### Message Keys

```txt
safety.watchEnvironment.default
safety.standStill.default
```

### App-Verhalten

- dezenter Hinweis
- keine harte Unterbrechung ausser bei spaeter definiertem Safety-Mode

---

## Product UI State Draft

```json
{
  "contractVersion": "buddy-product-ui-v1",
  "hintType": "movementHint",
  "severity": "info",
  "messageKey": "movement.targetReached.default",
  "fallbackText": "Ich bin angekommen.",
  "allowedActions": [],
  "debugOnly": false
}
```

---

## Product UI Prioritaeten

Wenn mehrere Hinweise gleichzeitig entstehen:

1. Safety
2. AR Error / Surface Missing
3. Movement Rejection
4. Ability Missing
5. Guide Suggestion
6. General Status

---

## Nicht vor Unity-Retest implementieren

[!] Keine Product-UI-Runtime vor Unity Compile-/Android-Retest.
[!] Keine Debug-UI in Product-UI ueberfuehren.
[!] Keine Rewards/Completion in Product-UI.

---

## Naechste Micro-Tasks nach Retest

[ ] Pruefen, welche Product-Hints im ersten echten Test gebraucht werden.
[ ] Message-Key-Liste mit Flow-Plan abgleichen.
[ ] `BuddyProductHintView` als kleine Komponente planen.
[ ] App-/Unity-Rendering-Entscheidung treffen.
[ ] Debug Overlay separat halten.
