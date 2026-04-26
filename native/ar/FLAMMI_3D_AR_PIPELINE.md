# Flammi 3D / echte AR-Pipeline

## Zielbild

Flammi soll kein 2D-Emoji und kein verschobenes Bild sein, sondern ein kleiner animierter 3D-Drache, der im echten Raum erscheint.

Das Ziel ist ein AR-Erlebnis: Rückkamera zeigt die reale Umgebung, Flammi wird als 3D-Charakter in diesen Raum gesetzt, bewegt sich, reagiert und wirkt durch Schatten, Skalierung und später Bodenanker glaubwürdig.

## Aktueller Stand

Der aktuelle /mobile/ar-Prototyp ist ein Kamera-Overlay. Das ist technisch nützlich zum Testen von Kamera, UI, Controls und Interaktion, erfüllt aber noch nicht das finale AR-Ziel.

## Nächste technische Stufe

### Stufe 1: 3D-Flammi im Kamera-Overlay

- Drei.js / WebGL Renderer über der Rückkamera.
- Ein einfacher Low-Poly-Drache als glTF/GLB Asset.
- Idle-Animation: Atmen, Schwanz, Kopfbewegung.
- Walk/Hop-Animation: kleine Schritte oder Hüpfen.
- Tap-Reaktion: Blick zum Nutzer, Freude, Feuerfunke.
- Schatten-Ellipse unter Flammi.
- Perspektivische Skalierung: nah größer, fern kleiner.

### Stufe 2: WebAR / Raumanker-Prototyp

- WebXR prüfen, wo verfügbar.
- Fallback: Kamera + WebGL + simulierte Bodenebene.
- Hit-Test / Bodenpunkt, falls Browser unterstützt.
- Wenn WebXR nicht verfügbar: manuelle Platzierung über Bildschirm-Tap.

### Stufe 3: Native AR

- Android: ARCore über native App-Schicht.
- iOS: ARKit über native App-Schicht.
- Option: Unity nur, wenn die 3D-/AR-Komplexität stark steigt.

## Asset-Anforderung Flammi v1

Format:

- GLB bevorzugt
- low-poly / mobile-optimiert
- Zielgröße unter 2–5 MB
- Draco/Meshopt-Kompression später prüfen

Animationen:

- idle
- walk oder hop
- happy
- lookAround
- return
- optional fireSpark

Design:

- freundlicher kleiner Drache
- nicht bedrohlich
- klare WellFit-Farbwelt: Türkis, Orange, warmes Licht
- große Augen, emotional bindend
- kind-/familientauglich

## Technische Entscheidung

Der nächste Code-Schritt ist nicht mehr 2D-Emoji verbessern, sondern eine 3D-Flammi-Komponente mit WebGL/Three.js oder einer native-AR-fähigen Pipeline vorbereiten.

Die 2D-Version bleibt nur als Fallback, wenn WebGL/AR nicht verfügbar ist.
