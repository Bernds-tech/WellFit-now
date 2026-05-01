# WellFit Buddy – Avatar Profile Registry Draft

Status: Draft fuer getrennte Avatar-Profile
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

WellFit soll mehrere Avatar-Gruppen unterstuetzen. Damit das skalierbar bleibt, werden Profile getrennt von der gemeinsamen AR-Buddy-Logik gepflegt.

Die gemeinsamen Controller sollen Profilwerte lesen, aber keine Avatar-Gruppe hart im Code verzweigen.

---

## Gemeinsame AR-Buddy-Logik

Diese Logik bleibt fuer alle Profile gleich:

```txt
Placement
Anchor
Navigation
Companion Radius
Call Buddy
Guide Events
Ability Events
Product Hints
```

---

## Profilabhaengige Werte

Diese Werte kommen spaeter aus Profilen:

```txt
profileId
avatarGroup
avatarType
displayName
scaleKey
movementProfileKey
abilityProfileKey
personalityProfileKey
visualProfileKey
prefabKey
```

---

## Start-Registry

Erste neutrale Profil-IDs:

```txt
animal_dog_default
animal_cat_default
fantasy_dragon_default
robot_companion_default
humanoid_knight_default
magic_creature_default
```

---

## Profiltrennung

Neue Avatar-Typen werden nicht direkt in grosse Controller eingebaut.

Ablauf:

1. Profil-ID anlegen.
2. Bewegungsprofil definieren.
3. Faehigkeitsprofil definieren.
4. Persoenlichkeitsprofil definieren.
5. Visual-/Prefab-Key definieren.
6. Gemeinsame Controller lesen nur diese Werte.

---

## Beispielstruktur

```txt
profileId: animal_dog_default
avatarGroup: animal
avatarType: dog
scaleKey: small_medium
movementProfileKey: dog_ground_basic
abilityProfileKey: dog_basic
personalityProfileKey: friendly_playful
visualProfileKey: dog_placeholder_v1
prefabKey: BuddyDogPlaceholder
```

---

## Weitere Beispielprofile

```txt
profileId: animal_cat_default
avatarGroup: animal
avatarType: cat
movementProfileKey: cat_ground_basic
abilityProfileKey: cat_basic
visualProfileKey: cat_placeholder_v1
prefabKey: BuddyCatPlaceholder

profileId: fantasy_dragon_default
avatarGroup: fantasy
avatarType: dragon
movementProfileKey: dragon_ground_basic
abilityProfileKey: dragon_basic
visualProfileKey: dragon_placeholder_v1
prefabKey: BuddyDragonPlaceholder

profileId: robot_companion_default
avatarGroup: robot
avatarType: companion
movementProfileKey: robot_basic
abilityProfileKey: robot_basic
visualProfileKey: robot_placeholder_v1
prefabKey: BuddyRobotPlaceholder

profileId: humanoid_knight_default
avatarGroup: humanoid
avatarType: knight
movementProfileKey: knight_basic
abilityProfileKey: knight_basic
visualProfileKey: knight_placeholder_v1
prefabKey: BuddyKnightPlaceholder

profileId: magic_creature_default
avatarGroup: magic
avatarType: creature
movementProfileKey: magic_basic
abilityProfileKey: magic_basic
visualProfileKey: magic_placeholder_v1
prefabKey: BuddyMagicPlaceholder
```

---

## Nicht im gemeinsamen Controller speichern

```txt
Avatar-spezifische Geschwindigkeit
Avatar-spezifische Animationen
Avatar-spezifische Prefab-Namen
Avatar-spezifische Standardfaehigkeiten
Avatar-spezifische Dialogtonalitaet
```

Diese Informationen gehoeren in Profile oder spaeter in App-/Backend-State.

---

## Dauerhafte Grenze

Profile duerfen nur visuelle und lokale Verhaltensparameter liefern.

App/Backend bleiben fuer produktrelevante Entscheidungen zustaendig.

---

## Status

[x] Profil-Registry als Draft angelegt.
[ ] Details nach Unity-Retest schrittweise ergaenzen.
[ ] Runtime-Implementierung erst nach Unity-Retest.
