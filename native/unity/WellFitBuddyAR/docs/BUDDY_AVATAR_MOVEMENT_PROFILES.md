# WellFit Buddy – Avatar Movement Profiles

Status: Draft fuer getrennte Bewegungsprofile
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Avatar-Bewegung soll nicht fest in einem gemeinsamen Controller verdrahtet werden.

Jeder Avatar-Typ bekommt spaeter ein Bewegungsprofil. Der gemeinsame Navigation Controller liest Parameter aus dem Profil.

---

## Gemeinsame Parameter

```txt
movementProfileKey
walkSpeed
turnSpeed
jumpHeight
maxWalkDistanceMeters
maxHeightDifferenceMeters
idleStyle
moveStyle
lookStyle
canUseGroundMovement
canUseHopMovement
canUseHoverVisual
```

---

## Startprofile

### dog_ground_basic

```txt
walkSpeed: medium
turnSpeed: fast
jumpHeight: low
maxWalkDistance: short
maxHeightDifference: low
idleStyle: soft_breathing
moveStyle: walk_short_hop
lookStyle: head_or_body_turn
```

### cat_ground_basic

```txt
walkSpeed: medium
turnSpeed: fast
jumpHeight: medium
maxWalkDistance: short
maxHeightDifference: medium
idleStyle: calm_watch
moveStyle: soft_walk_jump
lookStyle: head_focus
```

### dragon_ground_basic

```txt
walkSpeed: medium
turnSpeed: medium
jumpHeight: medium
maxWalkDistance: medium
maxHeightDifference: medium
idleStyle: breathing_bob
moveStyle: walk_hop_flutter
lookStyle: body_turn
```

### robot_basic

```txt
walkSpeed: slow_medium
turnSpeed: precise
jumpHeight: low
maxWalkDistance: short_medium
maxHeightDifference: low
idleStyle: pulse_idle
moveStyle: roll_or_step
lookStyle: sensor_turn
```

### knight_basic

```txt
walkSpeed: medium
turnSpeed: medium
jumpHeight: low
maxWalkDistance: medium
maxHeightDifference: low_medium
idleStyle: stand_ready
moveStyle: walk_jog
lookStyle: body_turn
```

### magic_basic

```txt
walkSpeed: medium
turnSpeed: smooth
jumpHeight: visual_only
maxWalkDistance: short_medium
maxHeightDifference: medium_visual
idleStyle: hover_pulse
moveStyle: hover_glide
lookStyle: smooth_face
```

---

## Implementierungsregel spaeter

Der Navigation Controller soll nicht wissen, ob ein Avatar Hund, Katze, Drache, Roboter oder Ritter ist.

Er soll nur lesen:

```txt
currentMovementProfile.walkSpeed
currentMovementProfile.turnSpeed
currentMovementProfile.jumpHeight
currentMovementProfile.maxWalkDistanceMeters
currentMovementProfile.maxHeightDifferenceMeters
```

---

## Nicht vor Unity-Retest

[!] Keine Runtime-Implementierung vor Compile-/Android-Retest.
[!] Keine bestehenden Movement-Werte ersetzen, bevor der aktuelle Debug-Batch getestet wurde.

---

## Naechste Schritte nach Retest

[ ] Lokale Datenstruktur `BuddyAvatarMovementProfile` planen.
[ ] Default-Profil auf aktuellen Placeholder mappen.
[ ] Erst ein Profil aktivieren, nicht alle gleichzeitig.
[ ] Bewegung nach jedem Profilwechsel testen.

---

## Status

[x] Bewegungsprofile getrennt geplant.
[ ] Runtime-Umsetzung offen.
