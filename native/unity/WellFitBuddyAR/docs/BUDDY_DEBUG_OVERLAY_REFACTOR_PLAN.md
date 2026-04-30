# WellFit Buddy – Debug Overlay Refactor Plan

Status: Plan fuer Refactor nach naechstem Unity Compile-/Android-Retest.

## Ausgangslage

`BuddyCallDebugController.cs` ist bewusst schnell gewachsen, weil fuer den Android-Retest viele Testbuttons und Diagnosen in einem Overlay gebraucht wurden.

Das ist fuer den naechsten Testlauf akzeptabel, aber nicht die Zielstruktur.

## Ziel

Das Debug-Overlay soll nach dem naechsten erfolgreichen Compile-/Android-Test in kleinere, wartbare Komponenten getrennt werden.

Zusaetzliches Ziel: Jede Debug-Seite muss skalierbar bleiben. Neue Tests, Missionstypen, Buddy-Faehigkeiten, Oberflaechen-Diagnosen oder KI-Guide-Aktionen duerfen nicht mehr dauerhaft in eine zentrale Monolith-Datei wachsen.

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
- Keine Fachlogik fuer Navigation, Faehigkeiten, Rewards, Missionen oder KI.

### BuddyDebugDiagnosticsPanel

- Anzeige von AutoReturn-/Navigation-/Anchor-/Bridge-/Ability-/Guide-Diagnosen.
- Diagnose an/aus.
- Diagnose-Reset.
- Spaeter nur noch Diagnose-DTOs anzeigen, nicht selbst Controllerlogik auswerten.

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

## Skalierbarkeitsregeln fuer Debug-Seiten

1. Eine Seite darf nur einen klaren Testbereich abdecken.
2. Neue Testbereiche bekommen eine neue Page-Komponente statt weitere 300 Zeilen im Root.
3. Gemeinsame Diagnose wird zentral gesammelt, aber fachlich getrennt angezeigt.
4. Button-Aktionen rufen Controller-Methoden auf, enthalten aber keine eigene Produktlogik.
5. Debug-UI darf keine Daten dauerhaft speichern.
6. Debug-UI darf keine Rewards, XP, Punkte, Token, NFTs, Mission Completion oder Anti-Cheat autorisieren.
7. Debug-UI muss spaeter per Build-Flag oder separate Dev-Szene deaktivierbar sein.
8. Produkt-UI und Debug-UI duerfen nicht vermischt werden.
9. Jede spaetere echte UI-Funktion braucht einen eigenen App-/Backend-Vertrag.
10. Wenn eine Debug-Seite mehr als einen Bildschirm braucht, wird sie paginiert statt vertikal endlos verlaengert.

## Skalierbares UI-Zielbild

Langfristig gibt es drei getrennte UI-Ebenen:

```txt
1. Produkt-UI
   Nutzer sieht nur klare, kindertaugliche und einfache AR-Hinweise.

2. Dev-Debug-UI
   Interne Tests fuer Placement, Movement, Ability, Guide, Events und Diagnosen.

3. Diagnose-/QA-Export
   Strukturierte Logs/Eventlisten fuer App-/Backend-/QA-Auswertung.
```

Die aktuelle `OnGUI`-Loesung gehoert nur zu Ebene 2 und ist nicht final.

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
- Keine weitere Debug-Page in `BuddyCallDebugController` stapeln.
- Keine produktive UI aus `OnGUI` ableiten.

## Naechste Schritte nach Test

1. Compile-Fehler beheben.
2. Button-/Overlay-Layout anhand Handy-Screenshot beurteilen.
3. Dann Root + DiagnosticsPanel extrahieren.
4. Danach Seiten einzeln extrahieren.
5. Danach Dev-Flag einfuehren.
6. Danach Produkt-UI separat planen: kurze Hinweise, keine Debug-Diagnosen, keine Economy-Autoritaet.
