# WellFit Dev Agent Safety Checklist

Diese Checkliste ist Pflicht für alle späteren Agentenläufe.

## Harte Sicherheitsregeln

```txt
[ ] Keine clientseitige Autorität für Punkte, XP, Rewards oder Mission Completion.
[ ] Keine clientseitige Autorität für Einsätze, Jackpot, Burn, Leaderboards oder Anti-Cheat.
[ ] Keine Token-, Presale-, Trading-, Staking- oder NFT-Marktplatz-Funktion in Mobile.
[ ] Keine Secrets/API Keys im Frontend.
[ ] Kein localStorage als Hauptspeicher für produktkritische Daten.
[ ] Keine medizinischen Diagnosen.
[ ] Keine harte Scham-/Drucksprache als Standard.
[ ] Keine neuen großen Monolith-Dateien.
[ ] Keine Firestore-Rules-Lockerung ohne explizite Review.
[ ] Keine Production Deployments.
[ ] Keine Verarbeitung sensibler Nutzer-/Kinder-/Health-/Standort-Rohdaten.
```

## Review-Pflichtige Bereiche

```txt
[!] firestore.rules
[!] functions/**
[!] app/api/**
[!] lib/**reward**
[!] lib/**mission**
[!] lib/**economy**
[!] lib/**antiCheat**
[!] app/mobile/**
[!] app/missionen/**
```

## Erlaubte erste Aufgaben

```txt
[x] Doku-/Roadmap-Reports.
[x] offene ToDo-Aufgaben extrahieren.
[x] Micro-Task-Plan erzeugen.
[x] Safety-Risiken je Task markieren.
[x] Website-/Doku-Vorschläge vorbereiten.
[x] PR-Beschreibungen vorbereiten.
```

## Nicht erlaubte autonome Aufgaben

```txt
[!] Punkte gutschreiben.
[!] XP gutschreiben.
[!] Rewards aktivieren.
[!] Mission Completion freigeben.
[!] Jackpot/Burn/Einsätze aktivieren.
[!] Anti-Cheat-Entscheidungen ändern.
[!] Token-/NFT-/Trading-Funktionen einbauen.
[!] Firestore Rules lockern.
[!] Produktion deployen.
```
