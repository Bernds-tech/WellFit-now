# WellFit Blockchain and Token Migration Guardrails

Status: verbindliche Architekturleitplanke / Beta-Backlog
Stand: 2026-05-07

## Ziel

Diese Datei legt fest, wann und wie Blockchain, WFT, NFTs und Token-Mechaniken spaeter in WellFit eingefuehrt werden duerfen.

Grundregel von Bernd:

> Blockchain und Token kommen erst, wenn das interne Punkte- und Abrechnungssystem funktioniert. Die internen Punkte werden spaeter technisch durch Token ersetzt oder gespiegelt.

## Verbindliche Reihenfolge

### Phase 1: Interne Punkte und XP

WellFit nutzt zuerst nur interne Punkte, XP, Streaks, Badges, Missionserfolge und Demo-Rewards.

Ziel:
- Produktlogik testen
- Nutzerverhalten verstehen
- Missbrauch erkennen
- Reward-Balancing lernen
- Datenbankmodell stabilisieren
- Abrechnung intern nachvollziehbar machen

### Phase 2: Internes Ledger und Abrechnung

Bevor echte Token kommen, muss ein internes Ledger stabil funktionieren.

Pflichtbestandteile:
- serverseitige Punktebuchungen
- XP-Buchungen
- Streak-Buchungen
- Mission-Completion-Audit
- Reward-Event-Audit
- UserDailyCap
- MissionTypeCap
- DailyEmissionCap
- EconomyHealthScore
- manuelle Review-Pfade
- Korrektur-/Rollback-Logik

### Phase 3: Token-Simulation

Erst wenn Phase 1 und 2 stabil sind, wird intern simuliert, wie Punkte spaeter in Token-Logik ueberfuehrt werden koennten.

Beispiele:
- interne Punkte entsprechen spaeter einer Token-Einheit oder Teilmenge
- Reward-Events werden token-kompatibel strukturiert
- Supply-/Reserve-/Emission-Logik wird nur simuliert
- keine echten On-Chain-Transfers

### Phase 4: Chain-Entscheidung

Erst nach stabiler Alpha-/Beta-/Testphase wird entschieden, welche Chain genutzt wird.

Wichtig:
- Solana/SPL-Unterlagen nicht mit SUI/Dynamic-Objects-Unterlagen vermischen.
- Chain-Entscheidung spaeter treffen.
- Architektur so schreiben, dass Chain austauschbar bleibt.

### Phase 5: Token ersetzt oder spiegelt interne Punkte

Wenn das interne System stabil ist, koennen Token spaeter:
- interne Punkte ersetzen
- interne Punkte spiegeln
- nur bestimmte Reward-Arten abbilden
- nur Web-/PC-Dashboard betreffen
- Mobile-App weiterhin frei von Trading/Presale/NFT-Marktplatz halten

## Harte Beta-Regel

Fuer Beta gilt:

- keine echten Token
- keine echten WFT-Transfers
- keine echten NFTs
- kein Trading
- kein Staking
- kein Marketplace mit echten Vermoegenswerten
- kein Presale in Mobile
- keine App-Store-kritische Finanzmechanik

## Interne Punkte als Vorstufe

Interne Punkte sind nicht nur Demo. Sie sind die fachliche Vorlage fuer spaetere Token-Logik.

Das interne System muss bereits zeigen:
- wer bekommt was
- warum bekommt jemand etwas
- wann wird etwas gedrosselt
- wann wird etwas verweigert
- wann braucht es Review
- wie wird Missbrauch erkannt
- wie wird Korrektur dokumentiert

## Abrechnung muss zuerst funktionieren

Vor Tokenisierung muessen diese Fragen intern beantwortet sein:

- Wie wird eine Mission final abgeschlossen?
- Wer autorisiert Punkte/XP?
- Welche Evidence ist ausreichend?
- Wie werden Tageslimits geprueft?
- Wie werden Missionstypen begrenzt?
- Wie werden Audit-Events gespeichert?
- Wie werden fehlerhafte Buchungen korrigiert?
- Wie verhindert WellFit Farming, Bots und Exploits?

## Mobile-App-Abgrenzung

Mobile darf spaeter nutzen:
- Anzeige interner Punkte
- Fortschritt
- Level
- Streaks
- Buddy-Feedback
- Missionserfolg

Mobile darf fuer Beta und bis zur gesonderten Freigabe nicht nutzen:
- Token-Trading
- NFT-Marktplatz
- Presale
- Staking
- echte Auszahlung
- spekulative Finanzmechanik

## Datenbank- und Backend-Bezug

Diese Datei ist abzugleichen mit:

- `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`
- `todolist/DATABASE_PLAN.md`
- `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`
- `docs/architecture/AR_REWARD_LEDGER_EVENT.md`
- `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md`
- `docs/architecture/USER_POINTS_CLIENT_WRITE_REFACTOR.md`
- `docs/architecture/USER_ECONOMY_WRITE_SEARCH_NOTES.md`

## Offene Folgeaufgaben

- [ ] Internes Punkte-Ledger fachlich finalisieren.
- [ ] Abrechnungslogik fuer Punkte, XP, Streaks und Rewards definieren.
- [ ] Korrektur-/Rollback-Logik fuer falsche Buchungen definieren.
- [ ] Token-Simulation erst nach stabilem internen Ledger planen.
- [ ] Chain-Entscheidung ausdruecklich als spaeteres Backlog markieren.
- [ ] Mobile-App-Abgrenzung gegen App-Store-Risiken pruefen.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/NEXT_ACTIONS.md`, `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`, `todolist/DATABASE_PLAN.md`, `todolist/TODO_INDEX.md` und diese Datei. Arbeite Blockchain-, WFT-, Token- und NFT-Themen nur als spaetere Migrationsplanung weiter. Fuer Beta gilt: internes Punkte- und Abrechnungssystem zuerst. Keine echten Token-, NFT-, Trading-, Staking-, Marketplace- oder Presale-Funktionen produktiv aktivieren. Wenn du Token-Logik beschreibst, erklaere immer, welche interne Punkte-/Ledger-Logik vorher stabil funktionieren muss.
