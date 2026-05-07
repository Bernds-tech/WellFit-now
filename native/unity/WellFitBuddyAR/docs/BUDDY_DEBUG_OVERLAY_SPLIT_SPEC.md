# WellFit Buddy – Debug Overlay Split Specification

Status: Spezifikation fuer Refactor nach erfolgreichem Unity Compile-/Android-Retest
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

`BuddyCallDebugController.cs` ist fuer den aktuellen Android-Retest bewusst gross geworden. Diese Datei soll nach erfolgreichem Retest nicht weiter wachsen, sondern in kleine Debug-Komponenten aufgeteilt werden.

Dieses Dokument legt die Zielstruktur, Verantwortlichkeiten und Migrationsreihenfolge fest.

---

## Warum erst nach Retest?

Der aktuelle Debug-Batch wurde nach dem letzten erfolgreichen Android-Smoke-Test noch nicht lokal kompiliert/getestet.

Daher:

1. erst Unity Compile pruefen
2. Android-Retest ausfuehren
3. Fehler beheben
4. erst danach splitten

---

## Ziel-Dateistruktur

Empfohlene neue Dateien:

```txt
Assets/Scripts/Debug/BuddyDebugOverlayRoot.cs
Assets/Scripts/Debug/BuddyDebugDiagnosticsPanel.cs
Assets/Scripts/Debug/BuddyDebugReturnPage.cs
Assets/Scripts/Debug/BuddyDebugVisualPage.cs
Assets/Scripts/Debug/BuddyDebugAbilityPage.cs
Assets/Scripts/Debug/BuddyDebugGuidePage.cs
Assets/Scripts/Debug/BuddyDebugStyle.cs
Assets/Scripts/Debug/BuddyDebugControllerFinder.cs
Assets/Scripts/Debug/BuddyDebugContext.cs
```

Falls Unity-Meta-/Ordner-Risiko beim ersten Split vermieden werden soll, kann voruebergehend flach in `Assets/Scripts/` gearbeitet werden. Langfristig ist ein `Debug/` Unterordner sauberer.

---

## 1. BuddyDebugOverlayRoot

Verantwortung:

- Overlay sichtbar/unsichtbar
- compact/expanded
- Page Routing
- aktueller Status-Text
- gemeinsame `OnGUI` Einstiegsmethode
- keine Fachlogik

Nicht erlaubt:

- keine Auto-Return-Logik
- keine Ability-Logik
- keine Guide-Logik
- keine Product-UI
- keine Reward-/Completion-Logik

Pseudo-Aufbau:

```csharp
public class BuddyDebugOverlayRoot : MonoBehaviour
{
    BuddyDebugContext context;
    BuddyDebugStyle style;
    BuddyDebugDiagnosticsPanel diagnostics;
    BuddyDebugReturnPage returnPage;
    BuddyDebugVisualPage visualPage;
    BuddyDebugAbilityPage abilityPage;
    BuddyDebugGuidePage guidePage;
}
```

---

## 2. BuddyDebugContext

Verantwortung:

- gemeinsame Controller-Referenzen halten
- lastStatus verwalten
- aktuelle Page speichern
- Debug-/Diagnose-Flags halten

Moegliche Felder:

```txt
bridge
autoReturnController
buddyController
buddyLookAtCamera
buddyNavigationController
buddyAnchorController
buddyAbilityController
buddyKiGuideController
lastStatus
debugPage
showDiagnostics
compactMode
```

---

## 3. BuddyDebugControllerFinder

Verantwortung:

- Controller suchen
- doppelte `FindObjectOfType` Logik vermeiden
- Referenzen in `BuddyDebugContext` aktualisieren

Methoden Draft:

```txt
RefreshAll(BuddyDebugContext context)
FindBridge()
FindAnchorController()
FindNavigationController()
FindAbilityController()
FindGuideController()
FindBuddyController()
FindLookAtCamera()
```

---

## 4. BuddyDebugDiagnosticsPanel

Verantwortung:

- AutoReturn-Diagnose anzeigen
- Navigation-Diagnose anzeigen
- Anchor-Diagnose anzeigen
- Bridge-Diagnose anzeigen
- Ability-Diagnose anzeigen
- Guide-Diagnose anzeigen
- Diagnose reset ausloesen

Nicht erlaubt:

- keine Controller-Fachlogik
- keine Commands direkt ausfuehren ausser Reset-Diagnose

---

## 5. BuddyDebugReturnPage

Verantwortung:

Buttons:

```txt
Buddy rufen
Rueckruf testen
Auto AN/AUS
Nur weit weg AN/AUS
Timing schnell
Timing normal
Abstand Test
Abstand Produkt
```

Ruft nur vorhandene Methoden am bestehenden `BuddyCallDebugController`-Ersatz oder direkt an `bridge/autoReturnController` auf.

---

## 6. BuddyDebugVisualPage

Verantwortung:

Buttons:

```txt
Idle AN/AUS
Blick AN/AUS
Diagnose reset
```

Spaeter erweiterbar fuer:

```txt
Animation Idle
Animation Happy
Animation Hop
Scale Test
Material Test
```

Aber nur als Visual-Debug, nicht Product-UI.

---

## 7. BuddyDebugAbilityPage

Verantwortung:

Buttons:

```txt
Faehigkeiten AN/AUS
Scan testen
Hinweis holen testen
Tragen testen
Zeigen testen
Klettern testen
Sprung testen
Diagnose reset
```

Regel:

Ability Page darf nur Demo-/Diagnose-Events ausloesen. Sie darf nicht entscheiden, ob ein Nutzer eine Faehigkeit wirklich besitzt.

---

## 8. BuddyDebugGuidePage

Verantwortung:

Buttons:

```txt
Mission: Gehen
Mission: Scannen
Fehlt: Sprungboost
Guide leeren
Diagnose reset
```

Regel:

Guide Page darf nur Vorschau-/Debug-Events ausloesen. Keine Mission Completion, keine Rewards.

---

## 9. BuddyDebugStyle

Verantwortung:

Zentrale Layoutwerte:

```txt
buttonHeight
fontSizeButton
fontSizeLabel
panelPadding
rowGap
maxPanelWidth
compactHeight
expandedHeight
```

Ziel:

- kein verstreutes Layout in vielen Pages
- spaeter einfacher auf Handy-Screenshot reagieren

---

## 10. Migration in sicheren Schritten

### Schritt 1 – nach gruenem Retest

[ ] `BuddyDebugContext` anlegen.
[ ] `BuddyDebugStyle` anlegen.
[ ] Bestehendes Verhalten unveraendert lassen.

### Schritt 2

[ ] DiagnosticsPanel extrahieren.
[ ] Diagnoseanzeige aus Root entfernen.
[ ] Verhalten testen.

### Schritt 3

[ ] ReturnPage extrahieren.
[ ] Seite 1 testen.

### Schritt 4

[ ] VisualPage extrahieren.
[ ] Seite 2 testen.

### Schritt 5

[ ] AbilityPage extrahieren.
[ ] Seite 3 testen.

### Schritt 6

[ ] GuidePage extrahieren.
[ ] Seite 4 testen.

### Schritt 7

[ ] `BuddyCallDebugController.cs` entweder entfernen oder zu Kompatibilitaets-Wrapper umwandeln.
[ ] Bootstrap auf neuen Root zeigen lassen.

---

## 11. Akzeptanzkriterien

Nach Split muss weiterhin funktionieren:

[ ] Overlay erscheint.
[ ] Page Switching funktioniert.
[ ] Diagnose an/aus funktioniert.
[ ] Compact Mode funktioniert.
[ ] Buddy rufen funktioniert.
[ ] Auto-Return Tests funktionieren.
[ ] Visual Toggles funktionieren.
[ ] Ability Tests funktionieren.
[ ] Guide Tests funktionieren.
[ ] Keine Compile-Errors.
[ ] Keine NullReferenceExceptions bei nicht platziertem Buddy.

---

## 12. Dev-Flag Ziel

Spaeter:

```csharp
#if WELLFIT_DEBUG_AR
// Debug Overlay aktiv
#endif
```

oder:

```txt
Debug-Szene enthaelt Overlay.
Produkt-Szene enthaelt kein Debug-Overlay.
```

---

## 13. Nicht-Ziele

Dieser Split darf nicht gleichzeitig:

[!] Product-UI einfuehren.
[!] Reward-/Completion-Logik anfassen.
[!] Backend-Event-Ingestion einbauen.
[!] Prefabs riskant manuell umbauen.
[!] Scene-YAML gross patchen.

---

## 14. Ergebnis

Nach diesem Refactor ist das Debug-Overlay skalierbar:

- neue Pages koennen getrennt ergaenzt werden
- Diagnose bleibt zentral
- Product-UI bleibt getrennt
- Root bleibt klein
- Tests bleiben einfacher
