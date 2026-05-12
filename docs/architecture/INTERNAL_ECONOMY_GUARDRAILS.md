# WellFit Internal Economy Guardrails

Status: Beta-planend / nicht produktiv freigeschaltet
Stand: 2026-05-12

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

## Checkpoint- und Vor-Ort-Grundsatz

Abenteuer, Challenges und Wettkaempfe sollen Nutzer zu echten Orten bewegen.

Produktgrundsatz:
- Ein Checkpoint ist ein echter Nahbereich, kein grober Stadtteil.
- Zielradius fuer normale Checkpoints: ca. 20 Meter um den realen Ort.
- Beta-Toleranz kann wegen GPS-Ungenauigkeit technisch groesser sein, darf aber nicht als Produktziel gelten.
- Nutzer sollen nicht nur die halbe Strecke gehen und dann irgendwo abschliessen koennen.
- Die spaetere Server-/KI-/Evidence-Pruefung muss Standort, Zeit, Bewegung und Proof-Qualitaet zusammen bewerten.

Spaeter moegliche Dynamik:
- Bei sehr hoher Nutzerdichte kann ein Checkpoint-Kreis temporär groesser werden.
- Bei normalem Betrieb bleibt der 20-Meter-Nahbereich das Ziel.
- Diese Dynamik darf erst nach stabiler Beta und Anti-Cheat-Pruefung aktiviert werden.

## Interne Gesamtmenge und Nachhaltigkeit

Die interne Economy simuliert derzeit eine maximale Gesamtmenge von 25 Milliarden internen Punkten.

Grundsatz:
- Punkte duerfen nicht nur ausgegeben werden.
- Punkte muessen ueber interne Sinks, Zugangsmechaniken, Goodies, Buddy-Pflege, Upgrades, kosmetische Items, Challenge-Starts, Abenteuer-Zugaenge und spaetere Systemgebuehren wieder in den Systembestand zurueckfliessen.
- Die interne Punkte-Reserve ist fuer Reward-Hoehe, Preise und EconomyHealthScore relevant.
- Das System muss auch bei sehr grosser Nutzerzahl stabil bleiben.

Skalierungsannahme:
- WellFit darf langfristig nicht nur fuer kleine Beta-Nutzerzahlen berechnet werden.
- Das Balancing muss gedanklich fuer Millionen bis Milliarden Nutzer tragfaehig sein.
- Auch bei theoretisch mehreren Milliarden Nutzern darf die Punkteausgabe nicht in eine unkontrollierte Inflation laufen.

## Reserve-, Emissions- und Sink-Logik

Die Punkteoekonomie muss spaeter mindestens diese Werte beruecksichtigen:

- totalPointSupply: 25.000.000.000 interne Punkte
- systemReservePoints: noch nicht ausgegebene oder zurueckgefuehrte Punkte
- circulatingUserPoints: Summe aller Nutzerbestaende
- dailyEmissionBudget: Tagesbudget fuer neue Rewards
- dailySinkReturn: Punkte, die am Tag ueber Sinks zurueckfliessen
- activeUsersDaily: aktive Nutzer pro Tag
- activeUsersMonthly: aktive Nutzer pro Monat
- economyHealthScore: Zustand aus Reserve, Ausgabe, Rueckfluss, Abuse-Risiko und Cap-Auslastung

Grundformel als Beta-Draft:

```text
effectiveDailyEmissionBudget = min(
  configuredDailyEmissionCap,
  reserveBasedDailyBudget + sinkReturnShare
)
```

Dabei gilt:
- Hohe Reserve und hoher Rueckfluss erlauben hoehere Rewards und guenstigere Goodies.
- Niedrige Reserve oder schwacher Rueckfluss drosseln Rewards und verteuern Sinks.
- Kritische Reserve stoppt neue hohe Rewards und schaltet mehr Aktionen auf Preview oder Manual Review.

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
- heutige Rueckfluesse ueber Sinks
- Reservequote gegen 25-Mrd.-Gesamtmenge
- aktive Nutzerzahl und Wachstumsrate
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
| Reservequote kritisch | Rewards drosseln, Preise/Sinks erhoehen, Reviewquote erhoehen |
| Sink-Rueckfluss zu niedrig | neue hohe Ausschüttungen vermeiden |
| Checkpoint-Distanz zu gross | keine finale Mission Completion, nur Route/Preview |

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
- Checkpoint-/Standort-Evidence
- Reserve-/Emission-/Sink-Balancing

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
- [ ] 25-Mrd.-Punkte-Reserve-/Rueckfluss-Formel als ausfuehrbaren Server-Draft definieren.
- [ ] Checkpoint-Distanzregel mit 20-Meter-Zielradius als serverseitige Evidence-Pruefung vorbereiten.
- [ ] Datenmodell fuer Economy-Audit-Events finalisieren.
- [ ] Sicherstellen, dass Client keine Punkte/XP final schreiben darf.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/NEXT_ACTIONS.md`, `todolist/DATABASE_PLAN.md`, `todolist/TODO_INDEX.md` und diese Datei. Arbeite Economy-Themen nur als interne Beta-Planung weiter. Keine echten Token-, NFT-, Trading-, Marketplace-, Staking- oder WFT-Funktionen produktiv aktivieren. Wenn du neue Economy-Regeln ergaenzt, verlinke sie mit Datenbank-, Mission-, Reward- und Security-Dokumenten und dokumentiere Reviewpflichten im `DONE_LOG.md`.
