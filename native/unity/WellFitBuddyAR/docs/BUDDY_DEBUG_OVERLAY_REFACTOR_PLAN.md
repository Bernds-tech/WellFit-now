# WellFit Buddy – Debug Overlay Refactor Plan

Status: Plan fuer Refactor nach naechstem Unity Compile-/Android-Retest.

## Ausgangslage

`BuddyCallDebugController.cs` ist bewusst schnell gewachsen, weil fuer den Android-Retest viele Testbuttons und Diagnosen in einem Overlay gebraucht wurden.

Das ist fuer den naechsten Testlauf akzeptabel, aber nicht die Zielstruktur.

## Ziel

Das Debug-Overlay soll nach dem naechsten erfolgreichen Compile-/Android-Test in kleinere, wartbare Komponenten getrennt werden.

## Warum nicht sofort refaktorieren?

Der aktuelle Stand wurde nach dem letzten erfolgreichen Handy-Test noch nicht neu kompiliert. Ein Refactor vor dem Compile-Test wuerde neue Fehlerquellen erzeugen.

Daher Reihenfolge:

1. aktuellen Stand kompilieren
2. Android testen
3. Fehler beheben
4. erst dann Debug-Overlay refaktorieren

## Zielstruktur

Spaeter vorgeschlagene Dateien:

```txt
BuddyDebugOverlayRoot.cs
BuddyDebugDiagnosticsPanel.cs
BuddyDebugReturnPage.cs
BuddyDebugVisualPage.cs
BuddyDebugAbilityPage.cs
BuddyDebugGuidePage.cs
BuddyDebugStyle.cs
BuddyDebugControllerFinder.cs
```

## Verantwortlichkeiten

### BuddyDebugOverlayRoot

- Sichtbarkeit des Overlays.
- Page Routing.
- Gemeinsamer Status-Text.
- Gemeinsame Controller-Referenzen.

### BuddyDebugDiagnosticsPanel

- Anzeige von AutoReturn-/Navigation-/Anchor-/Bridge-/Ability-/Guide-Diagnosen.
- Diagnose an/aus.
- Diagnose-Reset.

### BuddyDebugReturnPage

- Buddy rufen.
- Rueckruf testen.
- Auto-Return toggeln.
- Far-only toggeln.
- Timing-Presets.
- Distanz-Presets.

### BuddyDebugVisualPage

- Idle Motion toggeln.
- Look-at-camera toggeln.
- spaeter weitere Visualtests.

### BuddyDebugAbilityPage

- Demo-Faehigkeiten toggeln.
- Scan testen.
- Hinweis holen testen.
- Klettern testen.
- Sprung testen.
- Tragen testen.
- Zeigen testen.

### BuddyDebugGuidePage

- Guide-Mission Gehen.
- Guide-Mission Scannen.
- Fehlende Faehigkeit erklaeren.
- Guide leeren.

### BuddyDebugStyle

- Buttonhoehen.
- Schriftgroessen.
- Abstaende.
- Panelgroessen.

### BuddyDebugControllerFinder

- Sucht Bridge, Anchor, Navigation, Ability, Guide, BuddyController, LookAt.
- Verhindert duplizierten `FindObjectOfType` Code.

## Build-Flag Ziel

Spaeter sollte das Debug-Overlay nur in Dev-Builds aktiv sein.

Moegliche Strategie:

```csharp
#if WELLFIT_DEBUG_AR
// Debug Overlay aktiv
#endif
```

Oder:

```txt
Separate Debug Scene fuer interne Tests.
Produkt-Szene ohne Debug-Overlay.
```

## Nicht anfassen vor naechstem Test

- Scene-YAML nicht manuell gross patchen.
- Prefab-Struktur nicht riskant veraendern.
- Keine grosse Code-Aufteilung vor Compile-Test.

## Naechste Schritte nach Test

1. Compile-Fehler beheben.
2. Button-/Overlay-Layout anhand Handy-Screenshot beurteilen.
3. Dann Root + DiagnosticsPanel extrahieren.
4. Danach Seiten einzeln extrahieren.
5. Danach Dev-Flag einfuehren.
