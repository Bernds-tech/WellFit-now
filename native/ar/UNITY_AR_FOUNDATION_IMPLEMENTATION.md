# WellFit Flammi AR - Unity AR Foundation Implementation

## Entscheidung

Fuer das gewuenschte Erlebnis mit Weltanker, Flaechenerkennung, Springen, Klettern und 3D-Animationen ist Unity AR Foundation der bevorzugte Hauptpfad, sofern Build-Komplexitaet und App-Groesse akzeptabel bleiben.

## Warum Unity AR Foundation

- Ein gemeinsamer AR-Codepfad fuer Android ARCore und iOS ARKit.
- Plane Detection fuer horizontale und vertikale Flaechen.
- Raycast beziehungsweise Hit-Test fuer Nutzer-Taps auf echte Flaechen.
- Anchor-System fuer raumfeste Flammi-Platzierung.
- Starke 3D-Asset- und Animationspipeline.
- Animator Controller fuer idle, walk, hop, jumpDown, climbUp, land und happy.
- Spaeter Navigation ueber erkannte Flaechenpunkte moeglich.

## Unity-Pakete

- AR Foundation
- ARCore XR Plugin
- ARKit XR Plugin
- XR Plugin Management
- Input System optional

## Szenenstruktur

Unity Scene: WellFitFlammiAR

Objekte:

- AR Session
- XR Origin beziehungsweise AR Session Origin
- AR Camera
- AR Plane Manager
- AR Raycast Manager
- AR Anchor Manager
- AR Occlusion Manager optional spaeter
- FlammiController
- FlammiNavigationController
- WellFitNativeBridge

## Bridge zur App

Minimaler Native-Bridge-Vertrag:

- startSession
- stopSession
- placeFlammiAtHitTest
- moveFlammiToAnchor
- makeFlammiPerform
- getStatus

Events zurueck an Web/App:

- onArReady
- onPlaneDetected
- onAnchorCreated
- onFlammiPlaced
- onFlammiActionStarted
- onFlammiActionCompleted
- onArError

## Flammi v1 Verhalten

Stufe 1:

- Nutzer scannt Raum.
- Erkannte Flaechen werden optional visuell markiert.
- Nutzer tippt auf Flaeche.
- Flammi erscheint dort.
- Flammi schaut zur Kamera.
- Flammi idle animiert.
- Nutzer tippt Flammi und Flammi startet happy animation.

Stufe 2:

- Flammi laeuft in kleinem Radius um Anker.
- Flammi springt von Ankerpunkt zu einem zweiten erkannten Flaechenpunkt.
- Einfache Hoehenlogik: hoeherer Zielpunkt bedeutet climbUp oder hop, niedriger Zielpunkt bedeutet jumpDown oder land.

Stufe 3:

- Mehrere Flaechenpunkte als Graph.
- Couch, Tisch, Boden und Kastl Labels als Heuristik ueber Flaechenhoehe und Groesse.
- Einfache Navigation zwischen Flaechen.
- Spaetere Missionen mit echter Rauminteraktion.

## Build-Schritte

1. Unity-Projekt unter native/unity/WellFitFlammiAR anlegen.
2. AR Foundation installieren.
3. Android und iOS Build Targets aktivieren.
4. Flammi-Platzhaltermodell importieren.
5. Animator Controller anlegen.
6. Native Bridge definieren.
7. Android ARCore Build testen.
8. iOS ARKit Build testen.
9. App-Integration mit WellFit Mobile Flow planen.

## Risiken

- App-Groesse steigt deutlich.
- CI/CD wird komplexer.
- Unity-Version muss fixiert werden.
- App Store und Play Store Permissions muessen sauber formuliert sein.
- Datenschutz: Kamera verarbeitet Raumdaten; keine Rohvideos standardmaessig speichern.

## Empfehlung

Unity AR Foundation als Hauptpfad starten. PWA/WebGL bleibt nur Fallback und Demo.
