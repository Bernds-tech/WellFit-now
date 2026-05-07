# WellFit Buddy – Surface Quality Draft

Status: Draft fuer spaetere AR-RayCast-/Plane-Quality-Verbesserung.

## Ziel

Der Buddy soll spaeter nicht nur irgendeine AR-Flaeche treffen, sondern einschaetzen koennen, ob eine Flaeche fuer Platzierung, Bewegung oder Rueckruf sinnvoll ist.

## Aktueller Stand

`BuddyAnchorController` nutzt aktuell AR Foundation Raycast mit:

```txt
TrackableType.PlaneWithinPolygon
```

Das ist fuer den ersten Test richtig. Es sagt aber noch nicht, ob die Flaeche gut, stabil, gross genug oder sinnvoll fuer Bewegung ist.

## Geplante Surface Quality

Spaeter moegliche Qualitaetswerte:

```txt
unknown
valid
weak
small
steep
unstable
blocked
notFound
```

## Geplante Diagnosefelder

```txt
surfaceId
trackableId
hitPosition
hitNormal
planeAlignment
estimatedPlaneSize
quality
reason
```

## Erste einfache Regeln

### valid

- Plane-Hit vorhanden.
- Zielpunkt liegt innerhalb Polygon.
- Hoehendifferenz innerhalb MovementPolicy.
- Ziel ist nicht zu weit entfernt.

### notFound

- Kein AR-RayCast-Hit.

### small

- Flaeche spaeter als zu klein erkannt.

### steep

- Flaeche spaeter als zu schraeg erkannt.

### unstable

- Tracking verliert Flaeche mehrfach.

## UX-Hinweise spaeter

Wenn keine passende Flaeche gefunden wird:

```txt
Zeig mir kurz den Boden oder eine freie Flaeche.
```

Wenn Flaeche zu weit weg ist:

```txt
Das ist noch zu weit fuer mich.
```

Wenn Flaeche zu hoch ist:

```txt
Dafuer brauche ich spaeter eine Sprung- oder Kletterfaehigkeit.
```

## Wichtig

Surface Quality bleibt lokale AR-Plausibilitaet. Sie ist kein Reward-Beweis und keine Mission-Completion-Autoritaet.

## Naechste Schritte nach Retest

1. Unity Compile/Android Retest abwarten.
2. Wenn Raycast stabil ist, `SurfaceQuality` als Diagnosefeld ergaenzen.
3. Plane-Missing-Hinweis zuerst nur im Debug-Overlay anzeigen.
4. Danach UI-Text spaeter in Produktdialog ueberfuehren.
