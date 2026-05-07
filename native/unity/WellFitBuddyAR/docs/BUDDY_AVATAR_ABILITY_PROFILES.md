# WellFit Buddy – Avatar Ability Profiles

Status: Draft fuer getrennte Faehigkeitsprofile
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Avatar-Faehigkeiten sollen nicht fest in Unity-Controllern verdrahtet werden.

Jeder Avatar-Typ bekommt ein Faehigkeitsprofil. App/Backend entscheidet spaeter, welche Faehigkeiten ein Nutzer wirklich besitzt. Unity visualisiert nur den uebergebenen Zustand.

---

## Gemeinsame Faehigkeiten

```txt
returnToUser
pointAtObject
scanObject
fetchClue
revealHint
carry
climbUp
jumpBoost
protect
```

---

## Profilfelder

```txt
abilityProfileKey
baseVisualAbilities
unlockableVisualAbilities
blockedVisualAbilities
preferredMissionRoles
```

Wichtig:

```txt
baseVisualAbilities != serverseitiger Besitz
unlockableVisualAbilities != automatisch freigeschaltet
```

Diese Felder beschreiben nur, was fuer diesen Avatar-Typ visuell/konzeptionell passt.

---

## Startprofile

### dog_basic

```txt
baseVisualAbilities: returnToUser, pointAtObject
unlockableVisualAbilities: fetchClue, scanObject
blockedVisualAbilities: none
preferredMissionRoles: companion, search, family
```

### cat_basic

```txt
baseVisualAbilities: returnToUser, pointAtObject
unlockableVisualAbilities: jumpBoost, scanObject, revealHint
blockedVisualAbilities: carryHeavy
preferredMissionRoles: explore, hint, agility
```

### dragon_basic

```txt
baseVisualAbilities: returnToUser, pointAtObject
unlockableVisualAbilities: jumpBoost, revealHint, fetchClue, protect
blockedVisualAbilities: none
preferredMissionRoles: adventure, fantasy, guide
```

### robot_basic

```txt
baseVisualAbilities: returnToUser, scanObject
unlockableVisualAbilities: revealHint, pointAtObject, carry
blockedVisualAbilities: none
preferredMissionRoles: scan, analysis, guide
```

### knight_basic

```txt
baseVisualAbilities: returnToUser, pointAtObject, carry
unlockableVisualAbilities: climbUp, revealHint, protect
blockedVisualAbilities: none
preferredMissionRoles: adventure, guide, challenge
```

### magic_basic

```txt
baseVisualAbilities: returnToUser, revealHint
unlockableVisualAbilities: scanObject, pointAtObject, protect
blockedVisualAbilities: carryHeavy
preferredMissionRoles: hint, learning, story
```

---

## Server-/App-Grenze

Unity darf aus einem AbilityProfile nicht ableiten:

```txt
Nutzer besitzt Item
Nutzer besitzt Faehigkeit
Mission ist geloest
Reward ist verdient
```

App/Backend liefern spaeter den echten `BuddyAbilityState`.

---

## Zusammenspiel spaeter

```txt
AvatarProfile sagt: Diese Faehigkeiten passen grundsaetzlich zum Avatar.
Backend/App sagt: Diese Faehigkeiten besitzt der Nutzer jetzt wirklich.
Unity sagt: Ich visualisiere nur den sichtbaren Zustand und melde Events.
```

---

## Nicht vor Unity-Retest

[!] Keine Runtime-Implementierung vor Compile-/Android-Retest.
[!] Aktuelle Demo-Toggles nicht ersetzen, bevor Debug-Seite 3 getestet ist.

---

## Naechste Schritte nach Retest

[ ] `BuddyAvatarAbilityProfile` als Datenstruktur planen.
[ ] `BuddyAbilityState` vom Profil trennen.
[ ] Erst ein Profil mit Demo-State verbinden.
[ ] Ability-Debug-Seite danach testen.

---

## Status

[x] Faehigkeitsprofile getrennt geplant.
[ ] Runtime-Umsetzung offen.
