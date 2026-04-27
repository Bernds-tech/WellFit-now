# WellFitBuddyAR – Handy ist das Zielgeraet

Stand: 2026-04-27

## Klare Trennung

Der fertige WellFit-Buddy soll auf dem Handy laufen.

- Zielgeraet: Android-Handy oder iPhone.
- Entwicklungswerkzeug: Unity Hub auf PC oder Laptop.
- Repository/Server: speichert Code, Roadmap, Tests und Website.

## Warum trotzdem Unity Hub auf einem PC/Laptop?

Unity Hub ist die Werkstatt, in der die Handy-App gebaut wird.

Das Handy ist danach das Testgelaende und spaeter das echte Nutzergeraet.

Einfaches Bild:

```txt
GitHub/Server = Bauplan und Lager
PC/Laptop mit Unity = Werkstatt zum Bauen der App
Handy = Zielgeraet, auf dem der Buddy wirklich in AR laeuft
```

## Was passiert auf dem Handy?

Auf dem Handy laufen:

- Kamera
- ARCore oder ARKit
- Bewegungssensoren
- Flaechenerkennung
- Raycast/Hit-Test
- Anchors
- Buddy-Rendering
- Buddy-Bewegung

Das Handy erkennt also:

- Boden
- Tisch
- Couch oder Sitzflaeche, falls als Flaeche erkannt
- Kastl oder andere horizontale Flaechen
- Handyschwenk und Bewegung im Raum

## Was macht der PC/Laptop?

Der PC/Laptop mit Unity:

- erzeugt das Unity-Projekt
- installiert AR Foundation
- installiert ARCore XR Plugin
- installiert ARKit XR Plugin
- baut daraus eine Android- oder iOS-App
- installiert diese App auf das Handy

Der PC/Laptop ist nicht das Produktziel. Er ist nur das Werkzeug.

## Was macht der Server?

Der Server:

- hostet WellFit Web/PWA
- fuehrt Build/PM2 fuer die Website aus
- fuehrt Firebase-/Functions-Tests aus
- speichert Backend-Logik
- entscheidet spaeter Mission Completion, Evidence, Anti-Cheat und interne Rewards

Der Server kann aber nicht selbst testen, ob ein Buddy wirklich auf deinem Tisch steht, weil er keine echte Handykamera und keine ARCore-/ARKit-Sensorik hat.

## Endziel

Der Nutzer braucht spaeter nur das Handy.

Er oeffnet WellFit, startet Buddy-AR und sieht den Buddy in der echten Umgebung.
