# WellFit Pull Request

## Pflicht: Coder-Identität

Bevor an GitHub-Code gearbeitet wird, muss die Coder-Rolle klar sein.

```txt
Coder-Rolle: Coder __
```

Gültig sind nur Rollen aus:

```txt
scripts/wellfit-dev-agent/wellfit-agent.config.json
scripts/wellfit-dev-agent/coder-registry.schema.md
```

Ohne gültige Coder-Rolle darf dieser PR nicht gemerged werden.

---

## Alpha-Scope Check

```txt
[ ] Diese Änderung hilft direkt zur testbaren Alpha.
[ ] Falls nein: als Backlog/Doku markiert und nicht alpha-blockierend.
```

---

## Bereich

```txt
[ ] Coder 1 Bereich: Mobile / AR / Buddy / Unity
[ ] Coder 2 Bereich: Backend / Firebase / Mission Completion / Security
[ ] Coder 3 Bereich: Website / UX / QA / Datenschutz / Dokumentation / Agent
[ ] anderer registrierter Coder: __________________
```

---

## Was wurde geändert?

```txt
-
```

---

## Safety Checklist

```txt
[ ] Keine clientseitige Autorität für Punkte, XP, Rewards oder Mission Completion.
[ ] Keine clientseitige Autorität für Einsätze, Jackpot, Burn, Leaderboards oder Anti-Cheat.
[ ] Keine Token-, Presale-, Trading-, Staking- oder NFT-Marktplatz-Funktion in Mobile.
[ ] Keine Secrets/API Keys im Frontend.
[ ] Kein localStorage als Hauptspeicher für produktkritische Daten.
[ ] Keine medizinischen Diagnosen.
[ ] Keine harte Scham-/Drucksprache als Standard.
[ ] Keine Firestore-Rules-Lockerung ohne explizite Review.
[ ] Keine Production Deployments durch diesen PR.
```

---

## ToDo-/Roadmap-Regel

```txt
[ ] Keine ToDo- oder Roadmap-Einträge gelöscht.
[ ] Falls Priorität geändert wurde: alter Eintrag blieb sichtbar und wurde nur mit Status/Priorität ergänzt.
[ ] Neue Erkenntnisse wurden ergänzt, nicht ersetzt.
```

---

## Tests / Checks

```txt
[ ] npm run agent:dry-run
[ ] npm run lint
[ ] npm run build
[ ] cd functions && npm run check
[ ] Emulator Tests, falls betroffen
[ ] manuelle Mobile-/AR-/Browser-Prüfung, falls betroffen
```

---

## Review-Pflicht

```txt
[ ] Low Risk / Doku
[ ] UI / UX
[ ] Backend Review erforderlich
[ ] Security Review erforderlich
[ ] App-Store / Datenschutz Review erforderlich
```
