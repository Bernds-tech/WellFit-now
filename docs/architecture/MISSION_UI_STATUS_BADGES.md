# WellFit – Mission UI Status Badges

Stand: 2026-04-28
Status: UI-/UX-Plan und erste Umsetzung fuer Platzhalter, KI-Drafts und freigegebene Missionen

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

## Umsetzung 2026-04-28

```txt
[x] TypeScript Status-Typ definiert: lib/missions/missionUiStatusTypes.ts
[x] Gemeinsame Status-Helper ergaenzt: getMissionUiStatusDefinition, getMissionUiStatusLabel, isMissionUiStatusStartable.
[x] Gemeinsame Notice-Texte ergaenzt: MISSION_PLACEHOLDER_NOTICE und MISSION_SERVER_REWARD_NOTICE.
[x] canGrantReward bleibt typisiert false.
[x] Badge-Komponente angelegt: app/missionen/components/MissionStatusBadge.tsx.
[x] Sicherer Missionsseiten-Wrapper angelegt: app/missionen/components/PreparedMissionPage.tsx.
[x] Vorhandene Missionsseiten auf Platzhalter-/Containerstatus vorbereitet:
    - app/missionen/tagesmissionen/page.tsx
    - app/missionen/wochenmissionen/page.tsx
    - app/missionen/abenteuer/page.tsx
    - app/missionen/challenge/page.tsx
    - app/missionen/wettkaempfe/page.tsx
    - app/missionen/favoriten/page.tsx
    - app/missionen/history/page.tsx
```

## UX-Regeln

### Platzhalter

Darf zeigen:

```txt
Dieser Bereich ist vorbereitet.
Missionen werden spaeter durch den KI-Buddy erstellt.
Rewards werden serverseitig geprueft.
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

- [x] TypeScript Status-Typ definieren.
- [x] Badge-Komponente planen oder bestehende Mission Cards erweitern.
- [x] Vorhandene Missionsseiten pruefen.
- [x] Platzhaltertexte einheitlich machen.
- [ ] Build lokal/Server pruefen.
- [ ] Spaeter allowed/approved MissionDrafts aus serverseitiger Preview API anzeigen.
