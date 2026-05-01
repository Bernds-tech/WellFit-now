# WellFit Buddy – Avatar Personality Profiles

Status: Draft fuer getrennte Persoenlichkeits-/Tonalitaetsprofile
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Buddy-Tonalitaet und Verhalten sollen je Avatar-Typ skalierbar bleiben.

Ein Hund, eine Katze, ein Drache, ein Roboter oder ein Ritter sollen spaeter unterschiedlich wirken, ohne dass Dialoglogik in grosse Controller eingebaut wird.

---

## Profilfelder

```txt
personalityProfileKey
toneKey
energyLevel
hintLength
formality
childSafe
familySafe
preferredHintStyle
```

---

## Startprofile

### friendly_playful

```txt
toneKey: warm
energyLevel: medium
hintLength: short
formality: low
childSafe: true
familySafe: true
preferredHintStyle: motivating
```

Geeignet fuer:

```txt
animal_dog_default
animal_rabbit_default
```

### calm_curious

```txt
toneKey: calm
energyLevel: low_medium
hintLength: short
formality: low
childSafe: true
familySafe: true
preferredHintStyle: observant
```

Geeignet fuer:

```txt
animal_cat_default
magic_creature_default
```

### brave_adventure

```txt
toneKey: adventure
energyLevel: medium_high
hintLength: short_medium
formality: low
childSafe: true
familySafe: true
preferredHintStyle: quest
```

Geeignet fuer:

```txt
fantasy_dragon_default
humanoid_knight_default
```

### clear_helpful

```txt
toneKey: clear
energyLevel: medium
hintLength: short
formality: medium
childSafe: true
familySafe: true
preferredHintStyle: precise
```

Geeignet fuer:

```txt
robot_companion_default
robot_scout_default
```

---

## Message-Key-Verbindung

PersonalityProfile soll spaeter nur beeinflussen:

```txt
welcher Message-Key gewaehlt wird
welcher fallbackText genutzt wird
wie lang ein Hinweis ist
ob der Hinweis spielerisch, ruhig oder sachlich wirkt
```

Nicht beeinflussen:

```txt
Rewards
Completion
Items
Faehigkeitsbesitz
Anti-Cheat
```

---

## Beispiel

Gleiche Situation:

```txt
surface.notFound.default
```

Moegliche Tonalitaeten:

```txt
friendly_playful: Zeig mir kurz eine freie Flaeche.
clear_helpful: Ich brauche eine erkannte Flaeche.
brave_adventure: Such mit mir eine sichere Flaeche.
```

---

## Implementierungsregel spaeter

Dialog-/Hint-System liest:

```txt
ProductHintState + PersonalityProfile + Locale
```

und erzeugt daraus sichtbaren Text.

---

## Nicht vor Unity-Retest

[!] Keine Runtime-Implementierung vor Compile-/Android-Retest.
[!] Keine Dialoglogik in bestehende grosse Controller einbauen.

---

## Status

[x] Personality-Profile getrennt geplant.
[ ] Runtime-Umsetzung offen.
