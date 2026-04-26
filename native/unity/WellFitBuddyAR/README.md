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
- Buddy bleibt beim Schwenken des Handys an Weltposition

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

## Naechste lokale Schritte

1. Unity Hub installieren.
2. Unity 2022.3 LTS installieren.
3. Projekt `WellFitBuddyAR` unter `native/unity/WellFitBuddyAR` erzeugen.
4. AR Foundation installieren.
5. ARCore XR Plugin installieren.
6. ARKit XR Plugin installieren.
7. XR Plugin Management aktivieren.
8. Szene `WellFitBuddyAR` anlegen.
9. Bridge- und Controller-Skripte anhand `docs/` und `Scripts/`-Platzhaltern bauen.
