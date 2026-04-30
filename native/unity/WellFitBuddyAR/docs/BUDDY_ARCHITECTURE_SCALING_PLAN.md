# WellFit Buddy – Architecture Scaling Plan

Status: Planungs- und Refactoring-Grundlage nach dem aktuellen Debug-Batch.
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

## Ziel

Der AR-Buddy soll langfristig skalierbar bleiben, auch wenn spaeter mehr Verhalten, Missionen, KI-Hinweise, Avatare, Ausruestung und Multiplayer-/Competition-Elemente dazukommen.

Dieses Dokument legt fest, welche Verantwortlichkeiten in Unity bleiben und welche bewusst ausserhalb von Unity liegen.

Zusaetzlich gilt: Die AR-/Buddy-Seite darf nicht zu einer einzigen grossen Debug-, Produkt- oder Controller-Seite anwachsen. Skalierung bedeutet getrennte Schichten, getrennte UI-Ebenen, kleine Controller, klare Contracts und serverseitige Autoritaet.

## Harte Architekturgrenze

Unity ist nur AR-/Visualisierungs-/Interaktionsschicht.

Unity darf niemals autorisieren:

- Punkte
- XP
- Rewards
- Mission Completion
- Token/WFT
- NFTs
- Jackpot/Burn
- Leaderboards
- Anti-Cheat
- Item-Freischaltungen
- Faehigkeits-Freischaltungen

App/Backend bleiben Autoritaet fuer Rewards, Items, Faehigkeiten, Completion, Economy und Security.

## Zielarchitektur

### 1. Bridge Layer

Datei aktuell:

```txt
Assets/Scripts/WellFitNativeBridge.cs
```

Verantwortung:

- Befehle von App/Native empfangen.
- Unity-Events an App/Native melden.
- JSON-Payloads minimal parsen.
- Diagnose fuer Eventanzahl und letztes Event bereitstellen.

Nicht erlaubt:

- Reward-Entscheidungen.
- Mission-Completion-Entscheidungen.
- Item-/Faehigkeitsbesitz autorisieren.

Zielausbau:

- Eventnamen zentralisieren.
- Payload-Struktur versionieren.
- Eventvertrag mit App/Backend dokumentieren.
- Spaeter Command-Handler pro Featuregruppe statt immer mehr Methoden in einer Datei.

### 2. AR Placement / Anchor Layer

Datei aktuell:

```txt
Assets/Scripts/BuddyAnchorController.cs
```

Verantwortung:

- AR-Raycasts.
- Plane-Hit-Erkennung.
- Buddy platzieren.
- Surface-/Anchor-Diagnosen.
- Move-/Recall-Ziel in Weltkoordinaten vorbereiten.

Zielausbau:

- Re-Anchor nach erfolgreicher Bewegung.
- Surface Quality Bewertung.
- Plane-Missing-Hinweise.
- Optional: persistente AR-Anker spaeter pruefen.
- SurfaceResolver/SurfaceQuality spaeter aus AnchorController auslagern.

### 3. Navigation Layer

Datei aktuell:

```txt
Assets/Scripts/BuddyNavigationController.cs
```

Verantwortung:

- WalkTo / JumpTo.
- Bewegungsgrenzen.
- Distanz- und Hoehendiagnose.
- Ablehnung von ungueltigen Bewegungen.

Zielausbau:

- MovementPolicy als eigene kleine Komponente.
- Duplicate-request guard.
- Bewegungszustand als kleine State Machine.
- Animation Hooks fuer Walk/Jump/Idle.

### 4. Companion Layer

Datei aktuell:

```txt
Assets/Scripts/BuddyCompanionAutoReturnController.cs
```

Verantwortung:

- Auto-Return.
- Distanz Kamera/Buddy.
- Timing/Cooldown.
- Near/Far-Presets fuer Tests.

Zielausbau:

- Echter Companion-Radius.
- Nutzernaehe ueber Kamera/Buddy-Distanz stabilisieren.
- Auto-follow spaeter mit MovementPolicy koppeln.
- CompanionState als eigenes Diagnose-/State-Objekt einfuehren.

### 5. Ability Layer

Datei aktuell:

```txt
Assets/Scripts/BuddyAbilityController.cs
```

Verantwortung:

- Nur visualisierte/diagnostische Faehigkeits-Events.
- Reject bei fehlender Faehigkeit melden.
- Demo-Faehigkeiten fuer Testbuild toggeln.

Wichtig:

Unity darf nicht entscheiden, ob ein Nutzer eine Faehigkeit wirklich besitzt. Das kommt spaeter aus App/Backend.

Zielausbau:

- Ability-State von Backend/App uebergeben.
- Lokale Anzeige aktualisieren.
- Faehigkeits-Events sauber versionieren.
- AbilityState als Datenobjekt statt einzelner Boolean-Felder wachsen lassen.

### 6. KI Guide Layer

Datei aktuell:

```txt
Assets/Scripts/BuddyKiGuideController.cs
```

Verantwortung:

- Guide-/Missionsempfehlungen visualisieren.
- Fehlende Faehigkeiten erklaeren.
- Preview-only Events senden.

Nicht erlaubt:

- Mission final starten/abschliessen.
- Rewards ausgeben.
- KI-Antwort als Autoritaet behandeln.

Zielausbau:

- App-/Backend-Missionsempfehlungen anzeigen.
- Dialogue/Event Bridge stabilisieren.
- Guide UI spaeter produktionsnah machen.
- GuideSuggestion/CapabilityHint als versionierte DTOs einfuehren.

### 7. Debug Layer

Datei aktuell:

```txt
Assets/Scripts/BuddyCallDebugController.cs
```

Status:

- Absichtlich gross geworden fuer schnellen Android-Retest.
- Enthalten: 4 Seiten, Diagnosen, Testbuttons, Toggles.

Zielausbau:

- Nach naechstem erfolgreichen Test in kleinere Dev-Komponenten splitten.
- Produktbuild per Dev-Flag oder Build-Define ohne Debug-Overlay bauen.
- Optional separate Debug-Szene behalten.
- Neue Debug-Seiten nur als eigene Page-Komponenten, nicht im Root weiterstapeln.

Empfohlene Split-Dateien spaeter:

```txt
BuddyDebugOverlayRoot.cs
BuddyDebugReturnPage.cs
BuddyDebugVisualPage.cs
BuddyDebugAbilityPage.cs
BuddyDebugGuidePage.cs
BuddyDebugDiagnosticsPanel.cs
BuddyDebugStyle.cs
BuddyDebugControllerFinder.cs
```

### 8. Product UI Layer

Datei aktuell:

```txt
noch nicht final getrennt
```

Verantwortung:

- Kurze, klare Nutzerhinweise in AR anzeigen.
- Kinder-/Familienmodus freundlich halten.
- Keine Debug-Diagnosen zeigen.
- Keine Economy-/Reward-/Completion-Autoritaet enthalten.

Zielausbau:

- Produkt-UI getrennt vom Debug-Overlay planen.
- Texte aus Contracts/Localization speisen.
- AR-Hinweise wie `Zeig mir kurz den Boden` oder `Das ist noch zu weit fuer mich` sauber zentralisieren.

## Skalierungsregel fuer neue Features

Neue Buddy-Funktionen duerfen nur aufgenommen werden, wenn sie in eine dieser Schichten passen:

1. Bridge
2. AR/Anchor
3. Navigation
4. Companion
5. Ability
6. KI Guide
7. Debug
8. Visual/Animation
9. Product UI

Wenn eine Funktion mehrere Schichten betrifft, muss sie in kleine Schritte zerlegt werden.

## Skalierbarkeitsregeln fuer Seiten und Controller

1. Keine neue Monolith-Seite fuer AR/Buddy/Debug.
2. Keine produktive UI direkt aus `OnGUI` ableiten.
3. Debug-UI, Produkt-UI und Event-/Backend-Vertraege bleiben getrennt.
4. Eine Datei soll eine klare Verantwortung haben.
5. Wenn ein Controller mehrere Featuregruppen steuert, wird nach erfolgreichem Test gesplittet.
6. Wiederverwendbare Daten werden als DTO/State-Objekt definiert, nicht als lose String-Payloads in vielen Dateien kopiert.
7. Neue Missionstypen, Avatarfaehigkeiten oder Surface-Regeln brauchen zuerst einen Contract oder eine Draft-Datei.
8. Unity-Events werden versioniert, bevor App/Backend sie produktiv auswerten.
9. Kein Client/Unity-Pfad darf wegen Skalierung zur Reward-/Completion-Autoritaet werden.
10. Nach jedem stabilen Testbatch wird entschieden: Feature stabilisieren, refaktorieren oder verwerfen – nicht endlos erweitern.

## Naechste sinnvolle Arbeit ohne Handy-Test

1. Eventvertrag dokumentieren.
2. Debug-Overlay-Refactor-Plan konkretisieren.
3. MovementPolicy-Schnittstelle planen.
4. Ability-State-Vertrag zwischen Backend/App und Unity planen.
5. KI-Guide-Eventvertrag planen.
6. Security Boundary in Unity-Dokumenten weiter klaeren.
7. Skalierbares Product-UI-Konzept fuer AR-Hinweise planen.
8. App-/Backend-Command-Vertrag fuer Buddy-Befehle vorbereiten.

## Naechste Arbeit mit Unity-Test

1. Unity oeffnen.
2. Compile pruefen.
3. Android Build starten.
4. Vier Debug-Seiten testen.
5. Fehler beheben.
6. Danach Refactor starten.
