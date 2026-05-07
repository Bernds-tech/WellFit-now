# WellFit Buddy – Post-Retest Implementation Backlog

Status: Backlog fuer die Zeit nach Unity Compile-/Android-Retest
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Dieses Dokument legt die sichere Reihenfolge fuer die Umsetzung nach dem naechsten Unity Compile-/Android-Retest fest.

Bis der Retest erfolgt ist, bleibt dieses Dokument Planung. Es ist keine Runtime-Aenderung.

---

## Reihenfolge nach Retest

### 1. Compile zuerst

Wenn Unity Compile rot ist:

```txt
Nur Compile-Fehler beheben.
Keine Features.
Keine Refactors.
```

Betroffene Dateien nach Fehlermeldung.

---

### 2. Runtime-Fehler danach

Wenn Build startet, aber Runtime-Fehler auftreten:

```txt
Nur Runtime-Fehler beheben.
Keine neuen Features.
```

Wahrscheinliche Bereiche:

```txt
BuddyCallDebugController.cs
BuddyDebugSceneBootstrap.cs
BuddyCompanionAutoReturnController.cs
BuddyAnchorController.cs
BuddyAbilityController.cs
BuddyKiGuideController.cs
```

---

### 3. Debug Overlay splitten

Wenn Compile und Android-Test groesstenteils gruen sind:

Ziel:

```txt
BuddyCallDebugController.cs nicht weiter vergroessern.
```

Reihenfolge:

```txt
BuddyDebugContext
BuddyDebugStyle
BuddyDebugDiagnosticsPanel
BuddyDebugReturnPage
BuddyDebugVisualPage
BuddyDebugAbilityPage
BuddyDebugGuidePage
BuddyDebugOverlayRoot
```

Referenz:

```txt
BUDDY_DEBUG_OVERLAY_SPLIT_SPEC.md
```

---

### 4. Product UI getrennt vorbereiten

Erst nach stabilem Debug-Overlay:

```txt
BuddyProductHintView
BuddyProductActionPrompt
BuddyProductGuideBubble
BuddyProductSurfaceHint
BuddyProductAbilityHint
BuddyProductSafetyHint
```

Referenzen:

```txt
BUDDY_PRODUCT_UI_CONTRACT.md
BUDDY_PRODUCT_UI_MESSAGE_KEYS.md
BUDDY_PRODUCT_UI_FLOW_PLAN.md
```

---

### 5. Event Envelope vorbereiten

Erst wenn Eventnamen aus dem Retest bestaetigt sind:

```txt
BuddyEventEnvelope
BuddyCommandEnvelope
BuddyStateEnvelope
BuddyEventNames
```

Referenz:

```txt
BUDDY_EVENT_STATE_VERSIONING_PLAN.md
```

---

### 6. Mobile Bridge priorisieren

Erstes sinnvolles App->Unity Command:

```txt
callBuddyToUser
```

Danach:

```txt
applyAbilityState
applyGuideSuggestion
clearGuide
setCompanionMode
```

Referenz:

```txt
BUDDY_MOBILE_UNITY_BRIDGE_PLAN.md
BUDDY_COMMAND_CONTRACT.md
```

---

### 7. Backend Event API erst spaeter

Backend-Event-API wird erst vorbereitet, wenn Unity Eventnamen stabil sind.

Referenzen:

```txt
BUDDY_BACKEND_EVENT_API_CONTRACT.md
BUDDY_EVENT_INGESTION_PLAN.md
```

---

## Nicht gleichzeitig machen

[!] Debug-Split nicht mit Product-UI vermischen.
[!] Product-UI nicht mit Backend-Ingestion vermischen.
[!] Backend-Ingestion nicht mit Reward/Completion vermischen.
[!] Event-Versionierung nicht vor bestaetigten Unity-Events produktiv nutzen.

---

## Akzeptanz fuer naechsten Umsetzungsschritt

Ein Schritt gilt erst als abgeschlossen, wenn:

```txt
Unity Compile gruen
Android Build startet
betroffene Debug-Seite funktioniert
keine neue Reward-/Completion-Autoritaet entstanden ist
```

---

## Status

[ ] Retest offen.
[ ] Backlog noch nicht implementiert.
[x] Reihenfolge definiert.
