# WellFit Buddy – Companion Radius Contract Draft

Status: Draft fuer echten Companion-/Follow-User-Ausbau nach Android-Retest.

## Ziel

Der Buddy soll sich spaeter wie ein Begleiter verhalten: nah genug beim Nutzer bleiben, bei zu grossem Abstand zurueckkommen und trotzdem nicht staendig hektisch springen oder laufen.

## Aktueller Stand

`BuddyCompanionAutoReturnController` misst bereits eine horizontale Distanz zwischen Kamera und Buddy, hat Auto-Return, Cooldown, Far-only und Test-/Produkt-Distanz-Presets.

Aktuell ist es noch ein Test-/Debug-Flow und muss nach Retest weiter stabilisiert werden.

## Begriffe

```txt
nearDistanceMeters = Buddy ist nah genug.
farDistanceMeters  = Buddy ist zu weit weg und Rueckruf kann sinnvoll sein.
cooldown           = verhindert Rueckruf-Spam.
farOnly            = Rueckruf nur ausloesen, wenn Buddy wirklich weit weg ist.
```

## Geplante Companion States

```txt
idleNearUser
watchingUser
followingUser
returningToUser
waitingForSurface
blockedNoPlane
cooldown
```

## Regeln

### idleNearUser

Buddy steht nah genug beim Nutzer.

### watchingUser

Buddy schaut zum Nutzer, bewegt sich aber nicht.

### returningToUser

Buddy bewegt sich zur Ziel-Flaeche nahe beim Nutzer.

### waitingForSurface

Unity findet gerade keine passende Flaeche fuer Rueckruf.

### blockedNoPlane

Rueckruf wurde abgelehnt, weil keine AR-Flaeche gefunden wurde.

### cooldown

Rueckruf wurde kuerzlich angefordert und wird nicht sofort wiederholt.

## Nicht erlaubt

Companion Radius darf nicht direkt bedeuten:

- Mission abgeschlossen
- Nutzer war wirklich dort
- Reward verdient
- Anti-Cheat bestanden

Es ist nur lokale AR-Begleiterlogik.

## UX-Hinweise spaeter

Wenn Buddy zu weit weg ist:

```txt
Ich komme wieder zu dir.
```

Wenn keine Flaeche erkannt wird:

```txt
Zeig mir kurz den Boden oder eine freie Flaeche.
```

Wenn Buddy nah genug ist:

```txt
Ich bin bei dir.
```

## Naechste Schritte nach Retest

1. Pruefen, ob Distanzanzeige stabil ist.
2. Pruefen, ob Auto-Return nicht spammt.
3. Companion State als Diagnose einfuehren.
4. `returningToUser` sauber an Navigation gekoppelt halten.
5. Nach erfolgreichem Rueckruf optional Re-Anchor pruefen.
