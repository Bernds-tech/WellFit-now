# WellFit Buddy – Ability State Contract Draft

Status: Draft fuer spaetere App-/Backend-zu-Unity-Kopplung.

## Ziel

Der AR-Buddy kann spaeter unterschiedliche Faehigkeiten besitzen, z. B. klettern, springen, scannen, Hinweise holen, etwas tragen oder auf Ziele zeigen.

Unity darf diese Faehigkeiten visualisieren und testen, aber nicht autorisieren.

## Harte Regel

Unity entscheidet niemals, ob ein Nutzer eine Faehigkeit wirklich besitzt.

Die Autoritaet liegt bei:

```txt
App / Backend / Firestore Rules / serverseitiger Item- und Reward-Logik
```

Unity erhaelt spaeter nur einen sichtbaren Status, z. B.:

```json
{
  "contractVersion": "buddy-ability-v1",
  "userId": "server-controlled",
  "buddyId": "default_buddy",
  "abilities": {
    "climbUp": true,
    "jumpBoost": false,
    "fetchClue": true,
    "scanObject": true,
    "carry": false,
    "pointAtObject": true
  }
}
```

## Aktuelle Unity-Faehigkeiten

```txt
climbUp        = Buddy kann visuell nach oben springen/klettern.
jumpBoost      = Buddy kann einen staerkeren Sprung visualisieren.
fetchClue      = Buddy meldet ein Hinweis-holen-Event.
scanObject     = Buddy meldet ein Scan-Event.
carry          = Buddy meldet ein Tragen-/Aufheben-/Transport-Event.
pointAtObject  = Buddy meldet ein Zeigen-/Hinweisziel-Event.
```

## Bedeutung von carry

`carry` ist fuer spaetere AR-Missionen gedacht, bei denen der Buddy etwas symbolisch tragen, holen oder zu einem Ziel bewegen kann.

Beispiele:

- Buddy hebt virtuelles Objekt auf.
- Buddy bringt einen Hinweis zum Nutzer.
- Buddy transportiert ein Quest-Item in einer AR-Mission.

Aktuell: nur Event-/Diagnose-Test.

## Bedeutung von pointAtObject

`pointAtObject` ist fuer spaetere AR-Hinweise gedacht.

Beispiele:

- Buddy zeigt auf einen gefundenen Gegenstand.
- Buddy zeigt auf eine gescannte Flaeche.
- Buddy zeigt auf die naechste Mission oder den naechsten Wegpunkt.

Aktuell: nur Event-/Diagnose-Test.

## Unity Event-Verhalten

Wenn Faehigkeit vorhanden:

```txt
onBuddyActionStarted
```

Wenn Faehigkeit fehlt:

```txt
onBuddyActionRejected
reason=capability-missing
```

## App-/Backend-Verhalten spaeter

App/Backend sollten Unity-Faehigkeiten wie folgt behandeln:

1. Server prueft, welche Items/Faehigkeiten ein Nutzer besitzt.
2. App sendet Ability-State an Unity.
3. Unity zeigt nur das Ergebnis.
4. Unity meldet Nutzungsversuche als Event zurueck.
5. Backend entscheidet, ob daraus Mission Evidence entsteht.

## Nicht erlaubt

Unity darf nicht:

- eine Faehigkeit dauerhaft freischalten
- ein Item vergeben
- einen Kauf bestaetigen
- eine Mission abschliessen
- Rewards vergeben
- XP/Punkte buchen
- Anti-Cheat entscheiden

## Naechste Schritte

1. Nach Android-Retest pruefen, ob Ability-Diagnosen im Overlay korrekt sichtbar sind.
2. Danach `ApplyAbilityStateJson(...)` im Bridge-Layer planen.
3. Eventpayloads versionieren.
4. Backend-/App-Datenmodell fuer Buddy-Faehigkeiten definieren.
5. Spaeter echte Items/Faehigkeiten serverseitig anbinden.
