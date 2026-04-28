# WellFit – Mission History, Favorites & AR Side Quests

Stand: 2026-04-28
Status: Architekturanker fuer History/Favoriten bei Missionen und AR-Buddy-Nebenmissionen

## Zweck

Favoriten und History existieren bereits als Missionsbereiche. AR-Buddy-Nebenmissionen duerfen dort spaeter auftauchen, aber nicht falsch als abgeschlossene Hauptmissionen zaehlen.

## Vorhandene Bereiche

```txt
/missionen/favoriten
/missionen/history
```

## Favoriten

Favoriten koennen speichern:

```txt
Tagesmissionen
Wochenmissionen
Abenteuer
Challenges
Wettkaempfe
KI-MissionDrafts, wenn allowed/approved
```

AR-Buddy-Nebenmissionen sollten nur favorisiert werden, wenn daraus eine wiederholbare Lern-/Rallye-Aufgabe oder ein approved Draft entstanden ist.

## History

History kann spaeter anzeigen:

```txt
abgeschlossene Tagesmissionen
abgeschlossene Wochenmissionen
abgeschlossene Abenteuer
abgeschlossene Challenges
abgeschlossene Wettkaempfe
AR-Buddy Side Quest Events
```

## Side Quest Sonderregel

AR-Buddy-Nebenmissionen erscheinen in History als:

```txt
Side Quest Event
Evidence beantwortet
Reward geprueft
```

Nicht automatisch als:

```txt
Tagesmission abgeschlossen
Abenteuer abgeschlossen
Challenge abgeschlossen
```

## History Status fuer Side Quests

```txt
evidenceSubmitted
rewardPreviewed
rewardGranted
noRewardRepeatBlocked
manualReview
```

## Favoriten Status fuer KI-Drafts

```txt
kiDraftSaved
approvedMissionSaved
rejectedUnavailable
```

## Server-Grenze

```txt
Client darf History nicht als Reward-Autoritaet nutzen.
Client darf Favoriten nicht als Mission-Freigabe nutzen.
```

History und Favoriten sind Ansichten/Listen, keine Quelle der Wahrheit fuer Punkte.

## Naechste Schritte

- [ ] TypeScript-Typen fuer History/Favoriten Status definieren.
- [ ] Vorhandene Favoriten-/History-Seiten spaeter mit Status-Badges ausstatten.
- [ ] Server-/Rules-Konzept fuer History-Eintraege planen.
