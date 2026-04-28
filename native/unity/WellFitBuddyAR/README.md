# WellFitBuddyAR

Unity AR Foundation ist der Hauptpfad fuer das echte WellFit-Buddy-Erlebnis.

Dieses Projekt wird die native AR-Schicht fuer Android ARCore und iOS ARKit enthalten.

## Ziel

Der Buddy soll in der realen Welt verankert werden, sich auf erkannten Flaechen bewegen und als lebendiger KI-Begleiter wirken.

## Mindest-Prototyp v1

- AR Session
- XR Origin
- AR Camera
- AR Plane Manager
- AR Raycast Manager
- AR Anchor Manager
- Buddy Placeholder
- Idle Animation
- LookAtCamera Verhalten
- Tap auf Flaeche setzt Weltanker
- weiterer Tap bewegt Buddy zu realem Flaechenpunkt
- Buddy kann bei Hoehenunterschied zu Zielpunkt springen
- Buddy bleibt beim Schwenken des Handys an Weltposition

## Muss-Kriterien

Siehe:

```txt
docs/BUDDY_AR_MUST_CRITERIA.md
```

Kurzfassung:

- Buddy bleibt an realer Weltposition, wenn das Handy geschwenkt wird.
- Buddy kann auf Boden, Couch, Tisch, Kastl oder anderen erkannten Flaechen stehen.
- Buddy kann in der realen Umgebung laufen.
- Buddy kann von einer Flaeche herunter oder auf eine Flaeche springen.
- Buddy schaut zur Kamera beziehungsweise zum Nutzer.
- Buddy kann auf Objekte oder Orte aufmerksam machen.
- Buddy wirkt glaubwuerdig durch Skalierung, Perspektive, Schatten und spaeter Occlusion.
- Buddy kann Faehigkeiten abhaengig von Ausruestung einsetzen.

## Empfohlene Unity-Version

Unity 2022.3 LTS oder Unity 6 LTS pruefen.

Erste stabile Empfehlung fuer Projektstart: Unity 2022.3 LTS, weil LTS, AR Foundation und Mobile-Builds gut dokumentiert und breit erprobt sind.

## Warum dieses Verzeichnis noch kein vollstaendiges Unity-Projekt ist

Ein vollstaendiges Unity-Projekt sollte lokal mit Unity Hub erzeugt werden, damit Library-, ProjectSettings- und Package-Dateien korrekt zur installierten Unity-Version passen.

Dieses Repo enthaelt vorab:

- Architektur
- Bridge-Vertrag
- Controller-Spezifikation
- Szenenplan
- Gitignore-Regeln
- Entwicklerarbeitsgrundlage
- C#-Vorlagen fuer `Assets/Scripts/*.cs`

## Native Bridge Commands

Siehe:

```txt
docs/NATIVE_BRIDGE_COMMANDS.md
```

Wichtige Commands:

- `StartSession()`
- `StopSession()`
- `PlaceBuddyAtScreenPointJson(...)`
- `MoveBuddyToScreenPointJson(...)`
- `ResetBuddyPlacement()`
- `SuggestMissionJson(...)`
- `ExplainMissingCapabilityJson(...)`

Diese Commands sind Einstiegspunkte fuer die spaetere Android-/iOS-/App-Bridge. Unity meldet danach Events zurueck; Backend/App entscheiden Rewards, Mission Completion und Anti-Cheat.

## Naechste lokale Schritte

1. Unity Hub installieren.
2. Unity 2022.3 LTS installieren.
3. Projekt `WellFitBuddyAR` unter `native/unity/WellFitBuddyAR` erzeugen.
4. AR Foundation installieren.
5. ARCore XR Plugin installieren.
6. ARKit XR Plugin installieren.
7. XR Plugin Management aktivieren.
8. Szene `WellFitBuddyAR` anlegen.
9. AR Session, XR Origin, AR Camera, AR Plane Manager, AR Raycast Manager und AR Anchor Manager anlegen.
10. Buddy Placeholder anlegen.
11. C#-Vorlagen aus `Scripts/*.cs.txt` nach `Assets/Scripts/*.cs` kopieren.
12. Ersten Android ARCore Build testen.

## Erstes Android-ARCore-Runbook

Siehe:

```txt
docs/FIRST_ANDROID_ARCORE_RUNBOOK.md
```

Dieses Runbook beschreibt den ersten echten Handy-Test:

```txt
Handy-Kamera
→ ARCore erkennt Flaeche
→ erster Tap platziert Buddy
→ zweiter Tap bewegt Buddy
→ Buddy bleibt raumfest
```

## Buddy Placeholder Prefab

Siehe:

```txt
docs/BUDDY_PLACEHOLDER_PREFAB.md
```

Dieses Dokument beschreibt den ersten einfachen Buddy-Placeholder fuer den ARCore-Test. Der finale Drache kann spaeter als GLB/FBX-Prefab ersetzt werden.

## Vorlagen

Siehe:

```txt
Scripts/README.md
Scripts/*.cs.txt
```

Aktuelle Vorlagen:

- `WellFitNativeBridge.cs.txt`
- `BuddyInputController.cs.txt`
- `BuddyController.cs.txt`
- `BuddyAnchorController.cs.txt`
- `BuddyLookAtCamera.cs.txt`
- `BuddySurfaceNode.cs.txt`
- `BuddyNavigationController.cs.txt`
- `BuddyAbilityController.cs.txt`
- `BuddyKiGuideController.cs.txt`
- `BuddyDialogueEventBridge.cs.txt`
- `ArMissionHintMarker.cs.txt`

## Setup-Checkliste

Siehe:

```txt
docs/UNITY_SETUP_CHECKLIST.md
```

## Sicherheitsgrenze

Unity entscheidet nicht ueber Rewards, XP, Punkte, Token, Jackpot, Burn, Leaderboards oder Mission Completion.

Unity meldet nur AR-Events. Backend/App entscheidet ueber Mission, Evidence, Anti-Cheat und spaetere interne Rewards.
