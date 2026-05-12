# WellFit Competition Internal Stakes Guardrails

Status: Beta-planend / nicht produktiv freigeschaltet
Stand: 2026-05-12

## Ziel

Diese Datei definiert, wie WellFit-Wettkaempfe spaeter mit internen Punkte- oder Item-Einsaetzen funktionieren duerfen, ohne echte Wetten, Echtgeld, Auszahlung, Token, NFTs oder Gluecksspiel zu aktivieren.

Grundsatz:

> Wettkaempfe sind Skill-/Leistungsduelle zwischen Nutzern oder Avataren. Interne Punkte oder Items koennen spaeter als freiwilliger Duell-Einsatz vorgemerkt werden, aber sie sind kein Echtgeld, keine Auszahlung und kein handelbarer Vermoegenswert.

## Harte Abgrenzung

In Beta und MVP gilt:

- Keine echten Wetten.
- Keine Echtgeld-Einsaetze.
- Keine Auszahlungen.
- Keine Ruecktauschbarkeit in Geld.
- Keine Token.
- Keine NFTs.
- Keine Wallet.
- Kein Trading.
- Kein Staking.
- Kein Presale.
- Keine Zuschauerwetten.
- Keine zufallsbasierte Wettmechanik.
- Keine finale Client-Entscheidung ueber Sieger oder Punkte.

## Erlaubtes Zielbild

Ein spaeterer WellFit-Wettkampf darf so funktionieren:

1. Nutzer A und Nutzer B befinden sich am selben sicheren Checkpoint.
2. Beide sehen andere Nutzer, die am Checkpoint fuer Challenges offen sind.
3. Nutzer A fordert Nutzer B heraus.
4. Die Challenge ist skill-/leistungsbasiert, z. B.:
   - 10 Liegestuetze
   - Mathe-Speed
   - Sprint-Zeit
   - Reaktionsaufgabe
   - Quiz-/Wissensduell
   - Avatar-Duell mit Fairness-Regeln
5. Beide legen freiwillig einen internen Einsatz fest, z. B.:
   - 10 interne Punkte gegen 10 interne Punkte
   - ein internes Item gegen ein anderes internes Item
   - Punkte gegen Item nur nach spaeterem Balancing und Schutzregeln
6. Beide bestaetigen aktiv.
7. Der Einsatz wird serverseitig nur vorgemerkt/gelockt.
8. Die Challenge wird vor Ort gestartet.
9. Evidence wird gesammelt, z. B. Standort, Zeit, Kamera-/Pose-Proof, Antworten, Bewegung, Cooldown, Pattern-Check.
10. Der Server entscheidet spaeter Sieger, Abbruch, Review oder Void.
11. Das Ledger schreibt spaeter nur interne Punkte-/Item-Events, keine Auszahlungen.

## Begriffswahl

In der UI bevorzugt:

- Duell-Einsatz
- Teilnahme-Einsatz
- Herausfordern
- Annehmen
- Bestaetigen
- Einsatz sperren
- Ergebnis pruefen
- Server entscheidet

In der UI vermeiden:

- Wette
- Auszahlung
- Gewinn in Geld
- Cashout
- Quote
- Wettmarkt
- Buchmacher
- Jackpot mit Echtgeld-Bezug
- Trading
- Token-Gewinn

## Warum das kein Glücksspiel sein darf

WellFit-Wettkaempfe muessen als Skill-/Leistungsduelle geplant werden.

Nicht erlaubt:

- Zufall entscheidet den Sieger.
- Nutzer setzen auf fremde Personen als Zuschauer.
- Externe Marktquoten.
- Finanzielle Gewinnerwartung.
- Echtgeldwert-Kommunikation.
- Minderjaehrige in geldnahen Mechaniken.

Erlaubt als spaeterer interner Beta-Draft:

- Nutzer setzt auf eigene Leistung.
- Beide Teilnehmer stimmen dem gleichen Einsatz zu.
- Ergebnis basiert auf pruefbarer Leistung.
- Server prueft Evidence.
- Bei Unsicherheit: Manual Review oder Void.

## Checkpoint-Pflicht

Wettkaempfe mit Duell-Einsatz duerfen nur an sicheren Checkpoints starten.

Pflicht:

- sicherer realer Ort
- Zielradius ca. 20 Meter
- keine Strassen, Autobahnen, Gleise, Wasserflaechen oder Privatgrund ohne Freigabe
- Standort-Evidence nur als ein Signal, nie alleinige finale Wahrheit
- siehe `docs/architecture/CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md`

## Einsatzarten

### Interne Punkte

Punkte koennen spaeter als interner Duell-Einsatz vorgemerkt werden.

Regeln:

- Beide Nutzer muessen genug interne Punkte besitzen.
- Einsatz wird vor Challenge-Start gelockt.
- Kein negativer Kontostand.
- UserDailyCap und EconomyHealth muessen greifen.
- Bei Abbruch oder Review bleibt der Einsatz pending oder wird zurueckgegeben.

### Interne Items

Items koennen spaeter als interner Duell-Einsatz vorgemerkt werden.

Regeln:

- Nur nicht-sensible, interne Items.
- Keine NFTs in Beta.
- Keine extern handelbaren Items.
- Item muss im Nutzerinventar vorhanden sein.
- Item wird vor Challenge-Start gelockt.
- Bei Review bleibt es pending.
- Bei Void wird es zurueckgegeben.

### Punkte gegen Item

Punkte gegen Item ist riskanter und darf erst spaeter nach Balancing/Review aktiviert werden.

Regeln:

- nur nach stabiler Beta
- keine Geldwert-Kommunikation
- Fairness-/Wertkorridor erforderlich
- Schutz vor Ausnutzen neuer Nutzer

## Nicht jetzt: Zuschauer-Einsaetze

Zuschauer koennen spaeter zusehen.

Nicht aktivieren:

- Zuschauer setzen auf Nutzer.
- Zuschauer wetten auf Sieger.
- Zuschauer erhalten Auszahlungen.

Dieses Thema bleibt Backlog nach Beta, weil es regulatorisch und produktethisch viel riskanter ist.

## Server- und Ledger-Grundsatz

Jeder spaetere Duell-Einsatz braucht serverseitige Autoritaet:

- ChallengeCreated
- ChallengeAccepted
- StakeLocked
- EvidenceSubmitted
- ResultCalculated
- ManualReviewRequested
- ChallengeVoided
- StakeReleased
- PointsTransferredInternal
- ItemTransferredInternal
- LedgerCorrection

Der Client darf nur anzeigen und vorbereiten.

## Safety und Fairness

Pflichtregeln:

- aktive Bestaetigung beider Teilnehmer
- klare Challenge-Regeln vor Start
- Abbruch- und Void-Regel
- Cooldown gegen Farming
- Tageslimit fuer Einsaetze
- Alters-/Jugendschutz spaeter pruefen
- keine gesundheitsgefaehrdenden Ueberforderungen
- keine Beschimpfungs-/Mobbingmechaniken
- Report-Funktion spaeter planen

## Beta-Status

Aktuell darf in der App nur sichtbar vorbereitet werden:

- UI-Vorschau
- Checkpoint-Auswahl
- Challenge-Idee
- Evidence-Hinweis
- Serverpfad-Hinweis

Nicht aktiv:

- echte Stake-Locks
- echte Item-Transfers
- echte Punkte-Transfers zwischen Nutzern
- Zuschauer-Einsaetze
- finale Siegerentscheidung

## Offene Folgeaufgaben

- [ ] Datenmodell fuer Challenge-Duell und Duell-Einsatz definieren.
- [ ] Server-Draft fuer StakeLock ohne finale Persistenz planen.
- [ ] Evidence-Modell fuer Liegestuetze, Mathe, Sprint und Avatar-Duell definieren.
- [ ] Abbruch-/Void-/Review-Regeln definieren.
- [ ] Tageslimit fuer Duell-Einsaetze definieren.
- [ ] UI-Sprache auf Duell-Einsatz statt Wette festlegen.
- [ ] Item-Einsatz-Regeln und Inventory-Lock planen.
- [ ] Zuschauer-Einsaetze explizit im Backlog halten.

## KI-Fortsetzungs-Prompt

Bei Wettkaempfen, Checkpoints, Duellen, Einsaetzen, Punkten, Items oder Zuschauer-Modi zuerst diese Datei, `docs/architecture/CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md`, `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md` und `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md` lesen. Keine echten Wetten, keine Echtgeldwerte, keine Auszahlungen, keine Token, keine NFTs, keine Wallets und keine Zuschauerwetten aktivieren. Wettkaempfe nur als interne, serverseitig pruefbare Skill-/Leistungsduelle planen.