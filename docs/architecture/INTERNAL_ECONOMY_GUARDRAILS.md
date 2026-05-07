# WellFit Internal Economy Guardrails

Status: Beta-planend / nicht produktiv freigeschaltet
Stand: 2026-05-07

## Ziel

Diese Datei definiert die internen Economy-Leitplanken fuer WellFit vor Blockchain, WFT, NFT, Trading oder Marketplace.

WellFit muss zuerst als internes Punkte-, XP-, Streak-, Reward- und Audit-System funktionieren. Echte Token-/NFT-/WFT-Mechaniken bleiben bis nach stabiler Alpha-/Beta-/Testphase getrennt.

## Harte Abgrenzung fuer Beta

- Keine echten Token-Auszahlungen.
- Keine echten NFT-Mints.
- Kein Trading.
- Kein Staking.
- Kein Marketplace mit echten Vermoegenswerten.
- Keine mobile Token-/NFT-/Presale-Funktion.
- Keine clientseitige Autoritaet fuer Punkte, XP, Rewards oder Mission Completion.

## Interne Beta-Begriffe

### Internal Points
Interne WellFit-Punkte fuer Demo, Motivation, Progress, Missionen und Balancing.

### XP
Erfahrungspunkte fuer Level, Streaks, Fortschritt und Avatar-/Buddy-Entwicklung.

### Reward Preview
Vorschau oder Simulation eines moeglichen Rewards. Nicht final autorisierend.

### Reward Event
Serverseitig erzeugtes Audit-Ereignis fuer spaetere Punkte-/XP-/Item-Logik.

### Economy Health Score
Interner Zustand der Punkteoekonomie. Dient spaeter zur Drosselung und Balancierung.

## Kern-Caps

### DailyEmissionCap
Maximale interne Punkte-/XP-Menge, die das System pro Tag insgesamt als Preview oder Beta-Reward ausgeben darf.

Zweck:
- Inflation begrenzen
- Missbrauch begrenzen
- Beta-Balancing vorbereiten
- spaetere Token-Logik simulieren, ohne echte Token auszugeben

### UserDailyCap
Maximale Punkte-/XP-Menge pro Nutzer pro Tag.

Zweck:
- Farming verhindern
- Extremnutzung drosseln
- Fairness sichern
- Kinder-/Jugend- und Health-Safety nicht durch Uebermotivation gefaehrden

### MissionTypeCap
Maximale Reward-Menge je Missionstyp.

Beispiele:
- Bewegung
- Lernen
- AR-Raetsel
- NFC-Scan
- Social Challenge
- Buddy-Guide-Mission

Zweck:
- verschiedene Missionstypen vergleichbar machen
- High-Risk-Missionen begrenzen
- Reward-Exploits verhindern

### EconomyHealthScore
Zusammenfassender Score fuer den Zustand der internen Economy.

Moegliche Signale:
- heutige Gesamtausgabe
- Ausgaben pro Nutzer
- Ausgaben pro Missionstyp
- auffaellige Wiederholungen
- Proof-Qualitaet
- Pattern-/Cooldown-Risiko
- manuelle Review-Quote
- abgelehnte Missionen

## Beta-Entscheidungsmatrix

| Situation | Ergebnis |
|---|---|
| niedrige Proof-Qualitaet | Reward drosseln oder Manual Review |
| hoher Cooldown-/Pattern-Risiko-Score | kein finaler Reward, nur Review |
| UserDailyCap erreicht | keine weitere Punkte-/XP-Ausgabe |
| MissionTypeCap erreicht | Reward fuer Missionstyp drosseln |
| DailyEmissionCap erreicht | globale Ausgabe stoppen oder stark reduzieren |
| EconomyHealthScore kritisch | nur Preview, keine finale Vergabe |

## Serverautoritaet

Alle finalen Entscheidungen muessen spaeter serverseitig erfolgen:

- Mission Completion
- Punktevergabe
- XP-Vergabe
- Streak-Vergabe
- Item-/Capability-Freischaltung
- Audit-Events
- Anti-Cheat-Entscheidungen
- Manual Review

Der Client darf fuer Beta nur anzeigen, vorschlagen, vorfiltern oder Demo-Zustaende darstellen.

## Kein Blockchain-Mix

Historische Solana/SPL-Unterlagen und neuere SUI/Dynamic-Objects-Unterlagen duerfen nicht vermischt werden.

Fuer Beta gilt:
- Chain-Entscheidung spaeter.
- WFT bleibt Konzept/Backlog.
- NFT bleibt Konzept/Backlog.
- 25-Mrd.-Supply-Logik nur als interne Simulation/Dokumentation.

## Datenbankbezug

Diese Guardrails muessen spaeter mit folgenden Bereichen abgeglichen werden:

- `todolist/DATABASE_PLAN.md`
- `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`
- `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md`
- `docs/architecture/AR_REWARD_LEDGER_EVENT.md`
- `docs/architecture/USER_POINTS_CLIENT_WRITE_REFACTOR.md`
- `docs/architecture/USER_ECONOMY_WRITE_SEARCH_NOTES.md`

## Offene Folgeaufgaben

- [ ] Konkrete Default-Werte fuer DailyEmissionCap definieren.
- [ ] Konkrete Default-Werte fuer UserDailyCap definieren.
- [ ] MissionTypeCap je Missionstyp definieren.
- [ ] EconomyHealthScore-Formel als Beta-Draft definieren.
- [ ] Datenmodell fuer Economy-Audit-Events finalisieren.
- [ ] Sicherstellen, dass Client keine Punkte/XP final schreiben darf.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/NEXT_ACTIONS.md`, `todolist/DATABASE_PLAN.md`, `todolist/TODO_INDEX.md` und diese Datei. Arbeite Economy-Themen nur als interne Beta-Planung weiter. Keine echten Token-, NFT-, Trading-, Marketplace-, Staking- oder WFT-Funktionen produktiv aktivieren. Wenn du neue Economy-Regeln ergaenzt, verlinke sie mit Datenbank-, Mission-, Reward- und Security-Dokumenten und dokumentiere Reviewpflichten im `DONE_LOG.md`.
