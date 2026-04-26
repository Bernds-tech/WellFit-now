# Flammi 3D / echte AR-Pipeline

## Zielbild

Flammi soll kein 2D-Emoji, kein verschobenes Bild und kein reines Kamera-Overlay sein, sondern ein kleiner animierter 3D-Drache, der im echten Raum erscheint.

Das Ziel ist ein echtes AR-Erlebnis:

- Rückkamera zeigt die reale Umgebung.
- Flammi wird als 3D-Charakter in den Raum gesetzt.
- Flammi bleibt an seiner Weltposition, auch wenn das Handy nach links/rechts/oben/unten geschwenkt wird.
- Flammi kann auf realen Flächen stehen: Boden, Couch, Tisch, Kastl.
- Flammi kann später zwischen erkannten Flächen navigieren: von der Couch springen, auf ein Kastl hüpfen, am Kratzbaum klettern.
- Schatten, Skalierung, Perspektive und Verdeckung sollen glaubwürdig wirken.

## Harte Erkenntnis aus Gerätetest

Der aktuelle /mobile/ar-Prototyp mit Three.js/WebGL ist nur ein Kamera-Overlay mit simuliertem Anker.

Er erfüllt folgende Dinge:

- Rückkamera funktioniert.
- 3D-Flammi wird über der Kamera angezeigt.
- Tap-/Rufen-/Laufen-/Anker-Bedienlogik ist testbar.
- Simulierter Anker zeigt, wie die Bedienung später funktionieren soll.

Er erfüllt NICHT das echte AR-Ziel:

- Kein World Tracking.
- Keine echte Boden-/Flächenerkennung.
- Kein echter Raumanker.
- Flammi bleibt nicht im Raum stehen, wenn das Handy geschwenkt wird.
- Keine realistische Navigation über Couch, Tisch, Kastl oder Kratzbaum.

## Technische Entscheidung

Für das gewünschte WellFit-Erlebnis reicht PWA + Kamera + Three.js nicht aus.

Ab jetzt gilt:

1. PWA/Three.js bleibt nur Demo-, UI- und Fallback-Schicht.
2. Echtes Flammi-AR muss über native AR umgesetzt werden.
3. Android-Ziel: ARCore.
4. iOS-Ziel: ARKit.
5. Unity wird geprüft, falls Cross-Plattform-AR, Animationen, Navigation und 3D-Asset-Pipeline schneller/stabiler werden.

## Native AR Mindestanforderungen

### World Tracking

- Kamera-Pose verfolgen.
- Gerätebewegung im Raum verstehen.
- Flammi bleibt an Weltkoordinaten statt Bildschirmkoordinaten.

### Plane Detection

Zu erkennen:

- Boden
- Tischflächen
- Couch-/Sitzflächen, soweit ARCore/ARKit sie als horizontale Flächen erkennt
- vertikale Flächen optional später

### Hit Test / Raycast

- Nutzer tippt auf reale Fläche.
- AR-System gibt Weltposition zurück.
- Flammi wird dort verankert.

### Anchor System

- Anker speichern.
- Flammi bleibt relativ zum Weltanker.
- Rufen löst oder übersteuert Anker.
- Mehrere mögliche Zielpunkte später.

### Navigation / Behavior

Stufe 1:

- Flammi bleibt am Anker.
- Flammi schaut zur Kamera.
- Flammi läuft in kleinem Radius um Anker.

Stufe 2:

- Flammi springt zwischen erkannten Flächenpunkten.
- Couch -> Boden.
- Boden -> Tisch/Kastl.
- Kleine Hop-/Climb-/Land-Animationen.

Stufe 3:

- Raum-Mesh / Scene Understanding, soweit Plattform unterstützt.
- Hindernis- und Höhenlogik.
- Klettern, Springen, Balancieren.
- Missionen mit echter Rauminteraktion.

## Nächste technische Stufe

### Sofort

- Browser-AR klar als Fallback markieren.
- Native AR als Hauptpfad starten.
- Capacitor/Native App-Schicht nicht nur für Sensoren, sondern auch für ARCore/ARKit planen.

### Android

- ARCore prüfen/integrieren.
- Native AR Activity oder Plugin aufbauen.
- Hit Test / Plane Detection implementieren.
- Flammi als GLB-Modell in ARCore-Szene rendern.

### iOS

- ARKit prüfen/integrieren.
- Native AR View / Plugin aufbauen.
- Raycast / Plane Detection implementieren.
- Flammi als GLB/RealityKit/SceneKit-Modell rendern.

### Cross-Plattform-Option

- Unity AR Foundation prüfen.
- Vorteil: ARCore + ARKit in einer AR-Pipeline.
- Vorteil: Animation Controller, Nav/State Machine, GLB/FBX-Assetpipeline.
- Nachteil: App-Größe, Build-Komplexität, Integration in bestehende App.

## Asset-Anforderung Flammi v1

Format:

- GLB/GLTF oder FBX je nach AR-Engine
- low-poly / mobile-optimiert
- Zielgröße unter 2–5 MB
- LODs später prüfen

Animationen:

- idle
- walk
- hop
- jumpDown
- climbUp
- land
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

## Produktregel

Der aktuelle WebGL-Flammi bleibt nur Test-/Fallback-Modus.

Der echte WellFit-AR-Buddy muss nativ mit ARCore/ARKit oder Unity AR Foundation umgesetzt werden, weil nur dort Weltanker und raumfeste Bewegung zuverlässig möglich sind.
