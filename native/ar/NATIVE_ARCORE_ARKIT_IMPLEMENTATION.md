# WellFit Native ARCore / ARKit Implementation

## Ziel

Falls Unity nicht genutzt wird, wird echte AR direkt nativ umgesetzt:

- Android ueber ARCore
- iOS ueber ARKit

Diese Schicht ersetzt den Browser-Anker durch echte Weltanker.

## Android ARCore Mindestumfang

- AR Session starten
- Camera Permission pruefen
- ARCore Availability pruefen
- Plane Detection aktivieren
- Hit Test auf Tap-Koordinate ausfuehren
- Anchor erzeugen
- Flammi GLB an Anchor rendern
- Flammi Animationen starten
- Anchor loesen oder aktualisieren

## iOS ARKit Mindestumfang

- ARSession starten
- Camera Permission pruefen
- ARWorldTrackingConfiguration aktivieren
- Plane Detection horizontal aktivieren
- Raycast auf Tap-Koordinate ausfuehren
- ARAnchor erzeugen
- Flammi Modell an Anchor rendern
- Flammi Animationen starten
- Anchor loesen oder aktualisieren

## Gemeinsame App-Bridge

Die Web/Mobile-Schicht spricht nicht direkt ARCore oder ARKit an. Sie spricht die gemeinsame NativeArBridge an.

Funktionen:

- getStatus
- startSession
- stopSession
- placeFlammiAtHitTest
- moveFlammiToAnchor
- makeFlammiPerform

## Datenmodell

Native Anchor:

- id
- label
- x, y, z
- rotationY
- surfaceType
- createdAt

Surface:

- id
- type horizontal oder vertical
- label floor, table, couch, shelf, wall oder unknown
- center
- extent
- confidence

## Flaechen-Label-Heuristik

Erste einfache Logik:

- sehr niedrige grosse horizontale Flaeche = floor
- mittlere horizontale Flaeche = table oder shelf
- niedrige weiche Zone kann als couch markiert werden, falls spaeter Scene Understanding oder Nutzerlabel vorhanden ist
- Standard = unknown

## Wichtige Grenze

ARCore und ARKit erkennen Flaechen, aber sie wissen nicht automatisch sicher, was Couch, Kastl oder Kratzbaum ist. Diese Labels brauchen spaeter Heuristik, Nutzerhilfe, Scene Understanding oder ML.

## Empfehlung

Direkt native AR ist technisch schlanker als Unity, aber Animation, Navigation und Asset-Workflow werden schwerer. Unity ist fuer Flammi als lebendigen 3D-Charakter wahrscheinlich produktiver.
