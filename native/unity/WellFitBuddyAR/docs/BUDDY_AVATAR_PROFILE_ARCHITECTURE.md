# WellFit Buddy – Avatar Profile Architecture

Status: Draft fuer skalierbare Avatar-/Tier-/Buddy-Profile
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Dieses Dokument trennt die Avatar-Logik sauber von der allgemeinen AR-Buddy-Logik.

WellFit wird spaeter viele unterschiedliche Buddy-/Avatar-Typen haben: Tiere, Fantasiewesen, Roboter, menschliche Helden, magische Wesen und weitere Varianten.

Damit das skalierbar bleibt, darf es keinen einzigen grossen `BuddyController` geben, der alle Tierarten, Bewegungen, Faehigkeiten, Animationen und Persoenlichkeiten direkt enthaelt.

---

## Grundregel

Alle Avatare teilen sich die AR-Basislogik:

```txt
Placement
Anchor
Movement
Companion Radius
Call Buddy
Surface Navigation
Ability Events
Guide Events
Product UI Hints
```

Aber jeder Avatar-Typ bekommt ein eigenes Profil:

```txt
AvatarProfile
```

Das Profil beschreibt Aussehen, Bewegung, Groesse, erlaubte Faehigkeiten, Tonalitaet und Animationen.

---

## Trennung der Schichten

### Gemeinsame Buddy-Schicht

```txt
BuddyAnchorController
BuddyNavigationController
BuddyCompanionAutoReturnController
BuddyAbilityController
BuddyKiGuideController
WellFitNativeBridge
```

Diese Schicht ist fuer alle Avatare gleich.

### Avatar-Profil-Schicht

```txt
BuddyAvatarProfile
BuddyAvatarSpecies
BuddyAvatarMovementProfile
BuddyAvatarAbilityProfile
BuddyAvatarPersonalityProfile
BuddyAvatarVisualProfile
```

Diese Schicht unterscheidet Hund, Drache, Katze, Roboter usw.

### Visual-/Prefab-Schicht

```txt
Hund Prefab
Drache Prefab
Katze Prefab
Roboter Prefab
Ritter Prefab
Magisches Wesen Prefab
```

Diese Schicht enthaelt Modelle, Materialien, Animator, VFX und Sound.

---

## Geplante Avatar-Arten

Erste grosse Gruppen:

```txt
animal_dog
animal_cat
animal_bird
animal_horse
animal_rabbit
fantasy_dragon
fantasy_griffin
fantasy_magic_creature
humanoid_knight
humanoid_adventurer
robot_companion
robot_cyborg
```

Spaeter erweiterbar, ohne Kerncontroller umzubauen.

---

## AvatarProfile Draft

```json
{
  "profileId": "animal_dog_default",
  "species": "animal_dog",
  "displayName": "Hund",
  "scale": 1.0,
  "movementProfileId": "dog_ground_small",
  "abilityProfileId": "dog_basic_search",
  "personalityProfileId": "friendly_playful",
  "visualProfileId": "dog_placeholder_v1",
  "ageMode": "family-safe"
}
```

---

## Movement Profile Draft

```json
{
  "movementProfileId": "dog_ground_small",
  "walkSpeed": 0.55,
  "turnSpeed": 7.0,
  "jumpHeight": 0.12,
  "maxWalkDistanceMeters": 3.0,
  "maxJumpHeightDifferenceMeters": 0.25,
  "movementStyle": "walk-sniff-hop"
}
```

Beispiele:

```txt
Hund: laufen, schnuppern, kleine Hops
Katze: weich laufen, springen, neugierig schauen
Drache: laufen, huepfen, spaeter flattern
Roboter: rollen/gehen, scannen, piepen
Ritter: gehen/joggen, zeigen, tragen
Magisches Wesen: schweben/huepfen, leuchten
```

---

## Ability Profile Draft

```json
{
  "abilityProfileId": "dog_basic_search",
  "defaultAbilities": ["returnToUser", "pointAtObject"],
  "unlockableAbilities": ["fetchClue", "scanObject"],
  "blockedAbilities": ["carryHeavy", "fly"]
}
```

Wichtig:

Unity darf diese Faehigkeiten nur visualisieren. App/Backend entscheidet, welche Faehigkeiten ein Nutzer wirklich besitzt.

---

## Personality Profile Draft

```json
{
  "personalityProfileId": "friendly_playful",
  "tone": "freundlich",
  "energyLevel": "mittel",
  "childSafe": true,
  "defaultHintStyle": "kurz-und-motivierend"
}
```

Beispiele:

```txt
Hund: freundlich, verspielt, nah am Nutzer
Katze: neugierig, ruhig, elegant
Drache: mutig, fantasievoll, energiegeladen
Roboter: analytisch, hilfsbereit, klar
Ritter: mutig, beschuetzend, missionarisch
Magisches Wesen: ruhig, wundersam, sanft
```

---

## Visual Profile Draft

```json
{
  "visualProfileId": "dog_placeholder_v1",
  "prefabKey": "BuddyDogPlaceholder",
  "animatorKey": "DogAnimatorV1",
  "idleAnimation": "dog_idle",
  "walkAnimation": "dog_walk",
  "happyAnimation": "dog_happy",
  "jumpAnimation": "dog_hop",
  "lookTarget": "head"
}
```

---

## Warum diese Trennung wichtig ist

Ohne Profile wuerden spaeter alle Unterschiede direkt in Controller wandern:

```txt
if dog...
if cat...
if dragon...
if robot...
```

Das wuerde unskalierbar.

Mit Profilen bleibt der Kern stabil:

```txt
Controller liest Profil.
Profil steuert Parameter.
Prefab liefert Visuals.
Backend/App liefert Besitz-/State-Daten.
```

---

## Erste MVP-Profile

Fuer den MVP reichen zunaechst wenige Profile:

```txt
animal_dog_default
fantasy_dragon_default
robot_companion_default
humanoid_knight_default
animal_cat_default
magic_creature_default
```

Jedes Profil bekommt:

```txt
Scale
WalkSpeed
TurnSpeed
IdleStyle
MovementStyle
DefaultAbilities
UnlockableAbilities
PersonalityTone
ChildSafe Flag
PrefabKey
```

---

## Nicht im ersten Schritt

[>] keine echten 3D-Finalmodelle erzwingen
[>] keine NFT-Logik
[>] keine Token-Logik
[>] keine Marktplatz-Logik
[>] keine serverseitige Ownership-Implementierung
[>] keine komplexe Vererbung im Unity-Code

---

## Spaetere Datenquellen

Moegliche Quellen:

```txt
ScriptableObject in Unity fuer lokale Testprofile
JSON von App/Backend fuer produktnahe Profile
Firestore/Backend spaeter fuer User-spezifische Avatar-State-Daten
```

Empfehlung:

1. Unity lokal mit ScriptableObject/JSON testen.
2. App/Backend spaeter als Autoritaet fuer User-State.
3. Unity rendert nur sichtbaren Zustand.

---

## Security Boundary

AvatarProfile darf nicht autorisieren:

```txt
Punkte
XP
Rewards
Mission Completion
Token/WFT
NFTs
Item Ownership
Ability Ownership
Anti-Cheat
```

AvatarProfile darf nur visuelle und lokale Verhaltensparameter liefern.

---

## Naechste Micro-Tasks nach Unity-Retest

[ ] `BuddyAvatarProfile` als Datenstruktur planen.
[ ] Erstes lokales Placeholder-Profil fuer Dog/Dragon/Robot definieren.
[ ] Profile nicht direkt in bestehenden Controller hineinprogrammieren.
[ ] MovementController spaeter aus Profil speisen.
[ ] AbilityController spaeter aus App-/Backend-AbilityState plus AvatarProfile speisen.
[ ] PrefabKey-Konzept planen.

---

## Status

[x] Skalierbare Profiltrennung definiert.
[ ] Runtime-Implementierung erst nach Unity-Retest.
