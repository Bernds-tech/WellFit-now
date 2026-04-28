# WellFit – Mission UI Status Badges

Stand: 2026-04-28
Status: UI-/UX-Plan fuer Platzhalter, KI-Drafts und freigegebene Missionen

## Zweck

Die vorhandenen Missionsseiten enthalten aktuell Platzhalter/Container. Spaeter sollen KI-generierte MissionDrafts und approved Missionen dort erscheinen.

Die UI muss klar unterscheiden:

```txt
Platzhalter
KI-Vorschlag / Draft
In Pruefung
Freigegeben
Aktiv
Abgeschlossen
Abgelehnt / nicht verfuegbar
```

## Status-Werte

```txt
placeholder
kiDraft
needsReview
approved
active
completed
rejected
```

## Badge-Texte

```txt
placeholder -> Platzhalter
kiDraft -> KI-Vorschlag
needsReview -> In Pruefung
approved -> Freigegeben
active -> Aktiv
completed -> Abgeschlossen
rejected -> Nicht verfuegbar
```

## UX-Regeln

### Platzhalter

Darf zeigen:

```txt
Dieser Bereich ist vorbereitet.
Missionen werden spaeter durch den KI-Buddy erstellt.
```

Darf nicht zeigen:

```txt
Punkte garantiert
Mission abgeschlossen
Reward verfuegbar
```

### KI-Vorschlag / Draft

Darf zeigen:

```txt
Vorschlag vom Buddy
Noch nicht freigegeben
Preview
```

Darf nicht zeigen:

```txt
Fertige Mission
+ Punkte garantiert
```

### Freigegeben

Darf zeigen:

```txt
Mission kann gestartet werden
Reward wird nach Abschluss serverseitig geprueft
```

### Abgeschlossen

Darf erst nach Server-Completion angezeigt werden.

## Betroffene Seiten

```txt
/missionen/tagesmissionen
/missionen/wochenmissionen
/missionen/abenteuer
/missionen/challenge
/missionen/wettkaempfe
/missionen/favoriten
/missionen/history
```

## AR-Buddy-Nebenmissionen

AR-Buddy-Nebenmissionen sollten als Side Quest gekennzeichnet werden:

```txt
AR-Buddy Nebenmission
Zaehlt nicht als Tagesmission
Reward wird serverseitig geprueft
```

## Naechste Schritte

- [ ] TypeScript Status-Typ definieren.
- [ ] Badge-Komponente planen oder bestehende Mission Cards erweitern.
- [ ] Vorhandene Missionsseiten pruefen.
- [ ] Platzhaltertexte einheitlich machen.
