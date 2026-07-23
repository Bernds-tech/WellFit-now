# Beta 1 – Weekly Mission Review and WFXP Runtime

Stand: 2026-07-23
Status: Implementiert, vor Merge durch Build und vollständige Emulator-Suite zu bestätigen

## Zweck

Die Wochenmissionsseite darf keine Punkte, XP, Level oder Missionsabschlüsse mehr lokal berechnen oder als Erfolg in `localStorage` vormerken. Die drei Beta-1-Hauptmissionen verwenden denselben serverseitigen Mission-, Evidence-, Review-, Completion- und WFXP-Ledger-Pfad wie die bereits migrierten Tages- und Mobile-Missionen.

## Kanonischer Katalog

Quelle:

```text
functions/config/beta1-weekly-missions.json
```

Katalog:

```text
wellfit-beta1-weekly-missions
Version 1.0.0
Completion Policy: once-per-mission-per-vienna-week
Weekly Goal: 3
```

Missionen:

| Mission | Ziel | Katalogwert |
|---|---:|---:|
| `weekly-steps-50000` | 50.000 Schritte | 25 WFXP |
| `weekly-workouts-3` | 3 Workouts | 15 WFXP |
| `weekly-learning-5` | 5 Lernmodule | 25 WFXP |

Alle drei Missionen:

- sind in der ersten Beta nicht für Child Profiles freigegeben;
- verlangen `weekly-user-confirmation`;
- benötigen Admin-Review;
- verlangen keine Rohbilder oder Videos;
- haben keinen Geldwert;
- aktivieren keine Token-, NFT-, Wallet-Transfer- oder Cashout-Funktion.

## Laufzeitpfad

```text
Wochenmission auswählen
→ submitWeeklyMissionForReview
→ deterministischer Attempt pro Nutzer / Mission / Wien-Woche
→ deterministische Evidence-Revision
→ bestehende Admin Evidence Queue
→ adminReviewMissionEvidence
→ completeWeeklyMissionAttempt
→ xpLedgerEvents + ledgerEvents
→ xpWallets
→ missionCompletions + auditEvents
→ getWeeklyMissionProgress
```

## Wien-Wochengrenze

Der Server bestimmt die Kalenderwoche aus dem Datum in `Europe/Vienna` und bildet anschließend eine ISO-Woche von Montag bis Sonntag ab.

Beispiel:

```text
weekKey: 2026-W30
weekStartDateKey: 2026-07-20
weekEndDateKey: 2026-07-26
```

Der Browser liefert weder `weekKey` noch den Abschlusszeitraum als Autorität.

## Wiederholungsschutz

### Attempt

Für jede Kombination aus Nutzer, Mission und Wien-Woche gibt es eine deterministische Attempt-ID:

```text
weekly__{ownerUserId}__{weekKey}__{missionId}
```

Ein erneuter Klick verwendet denselben offenen Attempt. Nach einer abgelehnten Evidence wird eine neue deterministische Evidence-Revision erzeugt, nicht ein paralleler Reward-Pfad.

### WFXP-Ledger

Der finale Ledger-Schlüssel lautet:

```text
weekly_mission_completion__{ownerUserId}__{weekKey}__{missionId}
```

Selbst ein serverseitig injizierter zweiter Attempt kann dadurch keine zweite WFXP-Buchung für dieselbe Mission und Woche erzeugen.

## Fortschrittsprojektion

`getWeeklyMissionProgress` liest ausschließlich serverseitige Authority-Collections:

```text
missionAttempts
missionEvidence
missionCompletions
xpWallets
```

Daraus werden abgeleitet:

- gestartete Missionen der aktuellen Wien-Woche;
- abgeschlossene Missionen der aktuellen Wien-Woche;
- offene Attempts und Reviewstatus;
- 3-Missionen-Wochenziel;
- WFXP-Wallet-Saldo;
- Lifetime XP und Level.

Die Projektion besitzt keine Schreib- oder Reward-Autorität.

## Frontend-Migration

Entfernt wurden:

- `clientBetaProjection` als Wochenmissions-Erfolgsquelle;
- lokale Punkte- und XP-Erhöhung;
- lokale `wellfit-user`-Mutation;
- lokale Reward-History;
- lokale `alreadyRewarded`-Flags;
- der alte Dry-Run-Bridge `serverWeeklyMissionApi.ts`;
- die Anzeige statischer Fortschrittswerte.

Lokale Speicherung bleibt nur für Favoriten erlaubt. Favoriten haben keinen Einfluss auf Reward, Review, Completion oder WFXP.

## Adminbetrieb

Die Beta-1-Adminseite enthält einen eigenen Wochenmissions-Katalogblock. Nur ein Nutzer mit aktuellem Admin-Claim kann den Katalog veröffentlichen oder abgleichen.

Die bestehende Mission Evidence Review Queue wird unverändert wiederverwendet. Sie zeigt den Evidence-Typ und sichere Metadaten-Schlüssel, aber keine freien Metadatenwerte, Rohbilder, Videos oder Storage-Inhalte.

## Emulator-Akzeptanz

`functions/test/beta1WeeklyMissionProgressEmulatorTest.js` prüft unter anderem:

- Admin-only Katalogabgleich;
- exakt drei kanonische Missionen und Katalogwerte;
- Wien-Wochenstart und -ende;
- deterministische Attempt- und Evidence-Wiederverwendung;
- falschen Evidence-Typ;
- Eigentümerisolation;
- Blockade vor Admin-Review;
- exakte WFXP-Buchung nach Review;
- Completion-Idempotenz;
- Schutz vor injiziertem Doppel-Attempt;
- neue Evidence-Revision nach `needs-more-evidence`;
- Blockade veralteter Evidence;
- 3/3-Wochenziel und 65 WFXP Gesamtertrag;
- Child-Profile-Blockade;
- Ignorieren alter Wochenattempts;
- Abwesenheit von Legacy-`users.points`-/XP-Schreibvorgängen.

## Bewusst nicht Teil dieses Blocks

- keine automatische Messwertfreigabe ohne Evidence-Review;
- kein separater 50-Punkte-Wochenbonus;
- keine Wochenkiste mit wirtschaftlichem Wert;
- keine Tokenisierung, NFTs, Blockchain-Transfers oder Auszahlungen;
- keine Firebase-Produktivbereitstellung;
- keine Änderung von Produktionsdaten.
