# WellFit Buddy – Product UI Message Keys Draft

Status: Draft fuer skalierbare, lokalisierbare AR-Buddy-Produkt-UI
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Dieses Dokument sammelt geplante Message Keys fuer die spaetere AR-Buddy-Produkt-UI.

Ziel: Nutzertexte sollen spaeter nicht hart in vielen Unity-Scripts verstreut werden. Stattdessen werden klare Message Keys mit Fallback-Texten genutzt.

---

## Grundregel

Produkttexte sollen:

- kurz sein
- freundlich sein
- altersgerecht bleiben
- technisch einfache Sprache nutzen
- keine Debug-Diagnosen anzeigen
- keine Rewards/XP/Punkte/Token/NFT/Completion autorisieren

---

## Message Key Struktur

Empfohlenes Schema:

```txt
<bereich>.<situation>.<variante>
```

Beispiele:

```txt
surface.showFloor.default
movement.tooFar.default
ability.missing.jumpBoost
buddy.returning.default
safety.watchEnvironment.default
```

---

## 1. Allgemeiner Buddy-Status

```txt
buddy.ready.default
Fallback: Ich bin bereit.

buddy.placed.default
Fallback: Ich bin da.

buddy.returning.default
Fallback: Ich komme wieder zu dir.

buddy.nearUser.default
Fallback: Ich bin bei dir.

buddy.waiting.default
Fallback: Ich warte kurz.
```

---

## 2. Surface / Plane Hinweise

```txt
surface.showFloor.default
Fallback: Zeig mir kurz den Boden.

surface.showFreeArea.default
Fallback: Zeig mir kurz eine freie Flaeche.

surface.notFound.default
Fallback: Ich sehe noch keine passende Flaeche.

surface.holdStill.default
Fallback: Halte die Kamera kurz ruhiger.

surface.scanMore.default
Fallback: Schau dich langsam ein bisschen um.
```

---

## 3. Movement Hinweise

```txt
movement.tooFar.default
Fallback: Das ist noch zu weit fuer mich.

movement.tooHigh.default
Fallback: Das ist gerade noch zu hoch fuer mich.

movement.alreadyMoving.default
Fallback: Ich bin schon unterwegs.

movement.targetReached.default
Fallback: Ich bin angekommen.

movement.noPath.default
Fallback: Da komme ich gerade nicht gut hin.
```

---

## 4. Ability Hinweise

```txt
ability.missing.jumpBoost
Fallback: Dafuer brauche ich spaeter eine Sprung-Faehigkeit.

ability.missing.climbUp
Fallback: Dafuer brauche ich spaeter eine Kletter-Faehigkeit.

ability.missing.scanObject
Fallback: Dafuer brauche ich spaeter eine Scan-Faehigkeit.

ability.missing.fetchClue
Fallback: Dafuer brauche ich spaeter eine Hinweis-Faehigkeit.

ability.alternative.default
Fallback: Wir koennen einen anderen Weg suchen.
```

---

## 5. Guide / Mission Hinweise

```txt
guide.missionSuggested.default
Fallback: Ich habe eine passende AR-Mission gefunden.

guide.walkMission.default
Fallback: Lass uns ein paar Schritte machen.

guide.scanMission.default
Fallback: Lass uns etwas in der Umgebung entdecken.

guide.hintNearby.default
Fallback: Vielleicht ist ein Hinweis in der Naehe.

guide.cleared.default
Fallback: Alles klar, ich merke mir das nicht weiter.
```

---

## 6. Safety Hinweise

```txt
safety.watchEnvironment.default
Fallback: Achte bitte auf deine Umgebung.

safety.standStill.default
Fallback: Bleib kurz stehen, wenn du dich umschaust.

safety.askAdult.default
Fallback: Frag einen Erwachsenen, wenn du unsicher bist.

safety.noRunning.default
Fallback: Lauf bitte nicht, waehrend du auf den Bildschirm schaust.
```

---

## 7. Error Hinweise fuer Produkt-UI

Technische Fehler werden intern geloggt. Produkt-UI zeigt nur einfache Hinweise.

```txt
error.arNotReady.default
Fallback: AR ist noch nicht bereit.

error.cameraPermission.default
Fallback: Die Kamera wird fuer AR gebraucht.

error.tryAgain.default
Fallback: Versuch es bitte noch einmal.

error.buddyNotPlaced.default
Fallback: Setz mich zuerst auf eine Flaeche.
```

---

## UI-State Beispiel

```json
{
  "contractVersion": "buddy-product-ui-v1",
  "hintType": "surfaceHint",
  "severity": "info",
  "messageKey": "surface.showFloor.default",
  "fallbackText": "Zeig mir kurz den Boden.",
  "allowedActions": ["retryScan"],
  "debugOnly": false
}
```

---

## Nicht erlaubt

Message Keys duerfen nicht genutzt werden, um Unity Product-UI Autoritaet zu geben fuer:

- Punkte
- XP
- Rewards
- Mission Completion
- Token/WFT
- NFTs
- Jackpot/Burn
- Leaderboards
- Anti-Cheat
- Item-/Faehigkeitsfreischaltung

---

## Naechste Micro-Tasks

[ ] Nach Unity-Retest entscheiden, ob Message Keys in Unity oder App-seitig gemappt werden.
[ ] Product-UI-Contract mit diesen Keys abgleichen.
[ ] Spaeter zentrale Localization-Datei planen.
[ ] Spaeter Kinder-/Familienmodus-Textvarianten ergaenzen.
