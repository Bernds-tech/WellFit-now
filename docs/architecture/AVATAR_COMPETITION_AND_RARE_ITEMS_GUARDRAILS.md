# WellFit Avatar Competition and Rare Items Guardrails

Status: Beta-planend / nicht produktiv freigeschaltet
Stand: 2026-05-12

## Ziel

Diese Datei definiert, wie spaetere Avatar-gegen-Avatar-Wettkaempfe, seltene Items und besondere Ausruestung in WellFit geplant werden duerfen.

Grundsatz:

> Avatare duerfen spaeter gegeneinander antreten, aber Sieger, Fairness, Items, Punkte und Fortschritt muessen serverseitig, auditierbar und intern bleiben. Keine NFTs, keine Token, keine Auszahlungen und keine handelbaren Vermoegenswerte in Beta/MVP.

## Erlaubtes Zielbild

Avatar-Duelle koennen spaeter zum Beispiel sein:

- Schwertkampf
- Ritterduell
- Trainingskampf
- Arena-Kampf
- Teamduell
- Buddy-/Avatar-Herausforderung
- Elementkampf, z. B. Feuer, Wasser, Natur, Licht
- Geschicklichkeits-/Reaktionsduell
- Strategie-Duell mit Items und Energie

Beispiel:

- Avatar A hat ein einfaches Schwert.
- Avatar B hat ein seltenes Schwert.
- Ein besonderes Item wie Excalibur kann nur durch seltene Aufgaben, Berg-Missionen, Abenteuer, Events oder schwere Checkpoint-Reihen verdient werden.
- Der Server prueft Level, Energie, Item-Zustand, Fairness und Cooldowns.
- Der Kampf wird als interner Draft simuliert und spaeter serverseitig entschieden.

## Harte Abgrenzung

In Beta/MVP gilt:

- Keine NFT-Items.
- Keine Token-Items.
- Kein Handel mit echtem Wert.
- Keine Auszahlung.
- Keine Wallet.
- Keine Blockchain-Transfers.
- Keine echten Kaeufe.
- Keine finale Client-Entscheidung ueber Sieger.
- Kein Pay-to-win.
- Keine Item-Mechanik, die Gesundheit, Bewegung oder Kinder-/Jugendschutz negativ beeinflusst.

## Item-Arten

### Normale interne Items

Beispiele:

- Holzschwert
- Trainingsschild
- einfacher Helm
- Basis-Ruestung
- Pflege-Item
- Energie-Snack fuer Buddy/Avatar als interner Sink

### Seltene interne Items

Beispiele:

- Excalibur
- Drachenklinge
- Sternenschild
- Bergkristall-Ruestung
- Feueramulett
- Avatar-Spezialskin
- seltene Arena-Trophaee

Seltene Items duerfen nur durch besondere, sichere und pruefbare Leistungen entstehen:

- schwere Abenteuer
- Berg-/Naturmissionen an sicheren Orten
- saisonale Events
- Checkpoint-Reihen
- Partner-Events
- langfristige Streaks
- besondere Lern-/Bewegungsleistungen

## Keine NFT-Aktivierung jetzt

Seltene Items koennen spaeter theoretisch tokenisiert oder als NFT bewertet werden. Das bleibt Backlog nach stabiler Beta.

Aktuell gilt:

- Items sind rein intern.
- Items sind nicht auszahlbar.
- Items sind nicht extern handelbar.
- Items haben keinen Echtgeldwert.
- Items duerfen nicht als Investment dargestellt werden.

## Fairness im Avatar-Duell

Avatar-Kaempfe duerfen nicht stumpf nur vom staerksten Item abhaengen.

Fairness-Signale:

- Avatar-Level
- Energie
- Hunger/Pflegezustand
- Bindung/Loyalitaet
- Item-Seltenheit
- Item-Zustand
- Cooldowns
- Erfahrungsrang
- Skill-/Strategiekomponente
- Matchmaking-Klasse
- Anti-Farming-Risiko

Beispiel:

Ein Avatar mit Excalibur darf nicht automatisch jeden Kampf gewinnen. Das Item kann Vorteile geben, aber Server-Fairness, Cooldown, Energie und Matchmaking muessen verhindern, dass seltene Items das System brechen.

## Kampfentscheidung

Spaeterer Serverpfad:

1. DuelRequested
2. DuelAccepted
3. AvatarStateSnapshotCreated
4. ItemLoadoutLocked
5. FairnessChecked
6. DuelSimulationCreated
7. ResultPreviewCreated
8. ManualReviewRequested optional
9. DuelResultApproved oder DuelVoided
10. InternalRewardOrItemEventCreated
11. Ledger/Audit geschrieben

Der Client darf nur anzeigen, vorbereiten und Animationen abspielen. Die finale Wahrheit liegt im Server-/Ledger-System.

## Item-Lock

Vor einem Avatar-Duell koennen Items spaeter intern gesperrt werden:

- Item ist im Inventar vorhanden.
- Item ist nicht bereits in anderem Duel gelockt.
- Item ist fuer diese Arena erlaubt.
- Item verursacht keinen Fairness-Bruch.
- Item bleibt bis Ergebnis, Review oder Void gesperrt.

## Seltene Fundorte und Aufgaben

Besondere Items koennen spaeter an spezielle reale Missionen gekoppelt werden.

Erlaubte Beispiele:

- Berg-Missionen an sicheren Wander-/Aussichtsorten
- Burgen oder historische Orte
- Museen oder Partner-Orte
- schwierige Checkpoint-Ketten
- saisonale Spezialevents
- sichere Naturpfade

Nicht erlaubt:

- gefaehrliche Orte
- Strassen, Autobahnen, Gleise
- private Orte ohne Freigabe
- riskante Kletter-/Absturzstellen
- Wasserflaechen ohne sichere Plattform

Siehe auch:

- `docs/architecture/CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md`
- `docs/architecture/COMPETITION_INTERNAL_STAKES_GUARDRAILS.md`
- `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md`
- `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`

## UI-Sprache

Erlaubt:

- Avatar-Duell
- Arena
- Ausruestung
- Item-Loadout
- seltenes internes Item
- Spezialaufgabe
- Fundort
- Server prueft Fairness
- Ergebnis wird geprueft

Vermeiden:

- NFT
- Token-Gewinn
- Echtgeldwert
- Investment
- Auszahlung
- Marktpreis
- Trading
- Spekulation

## Beta-Status

Aktuell duerfen Avatar-Duelle nur als Konzept, UI-Vorschau oder Architektur-Draft vorbereitet werden.

Nicht aktiv:

- echte Kampfberechnung
- echte Item-Locks
- echte Item-Transfers
- echte Punkte-Transfers
- NFT- oder Token-Items
- finale Siegerentscheidung

## Offene Folgeaufgaben

- [ ] Avatar-Duell-Datenmodell definieren.
- [ ] Item-Loadout-Draft definieren.
- [ ] Seltene Item-Kategorien definieren.
- [ ] Fairness-Score fuer Avatar-Duelle als Draft entwickeln.
- [ ] Server-Duell-Simulation als Preview planen.
- [ ] Item-Lock- und Void-Regeln definieren.
- [ ] Seltene Fundorte nur mit Checkpoint-Safety verknuepfen.
- [ ] Excalibur-/Rare-Item-Konzept als internes Beta-Item dokumentieren.

## KI-Fortsetzungs-Prompt

Bei Avatar-Duellen, Arena, seltenen Items, Schwertern, Ruestung, Excalibur, Item-Einsaetzen oder Avatar-Wettkaempfen zuerst diese Datei lesen. Keine NFTs, keine Token, keine echten Kaeufe, keine Auszahlungen, keine Wallets und keine finale Client-Autoritaet aktivieren. Avatar-Duelle nur als interne, serverseitig pruefbare Skill-/Fairness-/Item-Mechanik planen.