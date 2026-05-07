# WellFit Buddy – Avatar Voice Personality Profiles

Status: Draft fuer spaetere Voice-/TTS-Tonalitaet pro Avatar-Profil
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Wenn der Buddy spaeter spricht, soll die Stimme/Tonalitaet zum Avatar passen.

Dabei bleibt Voice eine Ausgabe-/Interaktionsschicht. Sie entscheidet keine Rewards, Mission Completion oder Besitzlogik.

---

## Profilfelder

```txt
voiceProfileKey
personalityProfileKey
toneKey
speechRate
sentenceLength
ttsStyle
subtitleMode
childSafe
```

---

## Startprofile

### voice_friendly_playful

Geeignet fuer:

```txt
animal_dog_default
animal_rabbit_default
```

Eigenschaften:

```txt
toneKey: warm_playful
speechRate: medium
sentenceLength: short
ttsStyle: friendly
subtitleMode: on
childSafe: true
```

---

### voice_calm_curious

Geeignet fuer:

```txt
animal_cat_default
magic_creature_default
```

Eigenschaften:

```txt
toneKey: calm_soft
speechRate: slow_medium
sentenceLength: short
ttsStyle: calm
subtitleMode: on
childSafe: true
```

---

### voice_brave_adventure

Geeignet fuer:

```txt
fantasy_dragon_default
humanoid_knight_default
```

Eigenschaften:

```txt
toneKey: adventure_clear
speechRate: medium
sentenceLength: short_medium
ttsStyle: energetic
subtitleMode: on
childSafe: true
```

---

### voice_clear_helpful

Geeignet fuer:

```txt
robot_companion_default
```

Eigenschaften:

```txt
toneKey: clear_helpful
speechRate: medium
sentenceLength: short
ttsStyle: precise
subtitleMode: on
childSafe: true
```

---

## Untertitel-Regel

Auch wenn der Buddy spricht, soll Text optional sichtbar bleiben.

Gruende:

```txt
Barrierearmut
laute Umgebung
Nutzer ohne Ton
Kinder-/Familienmodus
bessere Verstaendlichkeit
```

---

## Voice-Ausgabe Beispiele

### callBuddyToUser

Message Key:

```txt
buddy.returning.default
```

TTS:

```txt
Ich komme zu dir.
```

### surfaceMissing

Message Key:

```txt
surface.showFreeArea.default
```

TTS:

```txt
Zeig mir kurz eine freie Flaeche.
```

### missingJumpBoost

Message Key:

```txt
ability.missing.jumpBoost
```

TTS:

```txt
Dafuer brauche ich spaeter eine Sprung-Faehigkeit.
```

---

## Verbindung zu bestehenden Profilen

```txt
AvatarProfile -> PersonalityProfile -> VoiceProfile -> MessageKey/TTS Style
```

Beispiel:

```txt
animal_dog_default -> friendly_playful -> voice_friendly_playful
robot_companion_default -> clear_helpful -> voice_clear_helpful
```

---

## Datenschutz und Nutzerkontrolle

Nutzer soll spaeter steuern koennen:

```txt
Buddy spricht an/aus
Untertitel an/aus
Voice-Lautstaerke
Push-to-Talk an/aus
Mikrofon-Erlaubnis
```

---

## Nicht erlaubt

VoiceProfile darf nicht steuern:

```txt
Rewards
XP
Punkte
Mission Completion
Token/WFT
NFTs
Item Ownership
Ability Ownership
Anti-Cheat
```

---

## Naechste Micro-Tasks nach Unity-Retest

[ ] VoiceProfileKey in AvatarProfile-Draft ergaenzen.
[ ] Product UI Message Keys mit Voice Output verbinden.
[ ] Push-to-Talk Consent Flow planen.
[ ] TTS-Provider erst spaeter auswaehlen.

---

## Status

[x] Voice Personality Profiles geplant.
[ ] Runtime-Umsetzung offen.
