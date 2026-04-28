# WellFit – Mission Types & AR Side Quests

Stand: 2026-04-28
Status: Architekturanker fuer vorhandene Missionsseiten, AR-Buddy-Nebenmissionen und Reward-Abgrenzung

## Zweck

WellFit hat bereits mehrere Missionsbereiche im Produkt angelegt. AR-Buddy-Fragen wie `Was ist das fuer ein Blatt?` duerfen nicht automatisch als Tagesmission, Wochenmission, Abenteuer, Challenge oder Wettkampf zaehlen.

Dieses Dokument trennt die vorhandenen Missionsseiten und die neuen AR-Buddy-Nebenmissionen.

## Vorhandene Routen / Seiten

```txt
/missionen/tagesmissionen
/missionen/wochenmissionen
/missionen/abenteuer
/missionen/challenge
/missionen/wettkaempfe
/missionen/favoriten
/missionen/history
```

Diese Seiten sollen nicht neu erstellt werden. Die neue Logik muss spaeter in diese vorhandenen Bereiche einsortiert werden.

## Missionstypen

```txt
Tagesmissionen
Wochenmissionen
Abenteuer
Challenges
Wettkaempfe
AR-Buddy-Nebenmissionen
```

## Tagesmissionen

Tagesmissionen sind kurze Tagesziele.

Beispiele:

```txt
Gehe 10.000 Schritte
Loese 3 kurze Fragen
Mache eine kleine Bewegungspause
```

Regel:

```txt
Nutzer kann pro Tag nur eine begrenzte Auswahl aktiv verfolgen, z. B. 3 Tagesmissionen.
```

AR-Buddy-Nebenfragen zaehlen nicht automatisch zu diesen 3 Tagesmissionen.

## Wochenmissionen

Wochenmissionen laufen ueber eine ganze Woche.

Beispiele:

```txt
Gehe 90.000 Schritte in einer Woche
Gehe 100.000 Schritte in einer Woche
Loese ueber die Woche mehrere Lern-/Bewegungsaufgaben
```

Regel:

```txt
Wochenmissionen akkumulieren Fortschritt ueber mehrere Tage.
```

## Abenteuer

Abenteuer sind groessere Erlebnis- oder Ortsmissionen.

Beispiele:

```txt
Zoo-Abenteuer
Park-Abenteuer
Burg-Abenteuer
Museum-Raetselrallye
Schwert finden
Hinweiskette loesen
```

Regel:

```txt
Abenteuer koennen aus mehreren AR-Fragen, Orten, Hinweisen, Gegenstaenden und Etappen bestehen.
```

Eine ortsnahe Raetselrallye kann als Abenteuer gelten, wenn Server/Policy sie diesem Bereich zuordnet.

## Challenges

Challenges sind gezielte Aufgaben, oft zeitlich begrenzt oder durch Partner/Sponsoren erweiterbar.

Beispiele:

```txt
Adidas Lauf-Challenge
Partner-Fitness-Challenge
Community-Challenge
Gesponserte Park-Challenge
```

Regel:

```txt
Partner koennen Challenges vorschlagen oder sponsorn, aber Reward, Punkte und Freischaltung bleiben serverseitig kontrolliert.
```

## Wettkaempfe

Wettkaempfe sind direkte Vergleiche zwischen Nutzern oder Avataren.

Beispiele:

```txt
Nutzer gegen Nutzer
Avatar gegen Avatar
Mathe-Duell
Liegestuetz-Duell
AR-Buddy-Kampf
```

Regel:

```txt
Wettkaempfe brauchen eigene Fairness-, Einsatz-, Matchmaking-, Anti-Cheat- und Reward-Regeln.
```

AR-Buddy-Nebenfragen sind keine Wettkaempfe.

## Favoriten und History

Favoriten und History sind Querschnittsbereiche:

```txt
Favoriten = gespeicherte oder gemerkte Missionen
History = abgeschlossene oder erledigte Missionen/Aufgaben
```

AR-Buddy-Nebenmissionen koennen spaeter in History auftauchen, aber nur als Side-Quest-/Evidence-/Mini-Aufgaben-Historie, nicht automatisch als abgeschlossene Hauptmission.

## AR-Buddy-Nebenmissionen

AR-Buddy-Nebenmissionen entstehen spontan im Nahbereich.

Beispiele:

```txt
Was ist das fuer ein Blatt?
Was ist das fuer ein Baum?
Was siehst du an diesem Ort?
Kleines Natur-/Wissensraetsel
```

Regel:

```txt
AR-Buddy-Nebenmissionen sind leichte Zusatzaufgaben und zaehlen nicht automatisch als Tagesmission, Wochenmission, Abenteuer, Challenge oder Wettkampf.
```

Sie erzeugen zuerst nur Evidence.

```txt
Evidence -> Question Memory -> Reward Policy -> Server Ledger
```

## Upgrade-Pfade

Eine AR-Buddy-Nebenmission kann spaeter Teil von etwas Groesserem werden, aber nur wenn Server/Policy das zuordnet:

```txt
Side Quest -> Abenteuer-Etappe
Side Quest -> Tagesbonus
Side Quest -> Standort-Rallye
Side Quest -> Lernserie
```

## Harte Grenze

```txt
Der Buddy darf Aufgaben vorschlagen.
Die KI darf Missionen draften.
Aber die Zuordnung, Punktehoehe, Completion und Reward-Freigabe gehoeren in Server/Policy.
```

## Naechste Schritte

- [ ] TypeScript Mission Category Types definieren.
- [ ] AR-Buddy-Nebenmission als eigene Kategorie abbilden.
- [ ] UI-Kennzeichnung fuer Nebenmission vs Hauptmission planen.
- [ ] Reward Policy um `missionCategory` erweitern.
- [ ] Question Memory auch nach Mission Category filtern.
