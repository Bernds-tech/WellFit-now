# Beta 1 – Challenge Review and WFXP Runtime

Stand: 2026-07-23
Status: Implementiert, vor Merge durch Build und vollständige Emulator-Suite zu bestätigen

## Zweck

Die Challenge-Seite darf keine Punkte, XP, Level oder Missionsabschlüsse mehr lokal berechnen, in `localStorage` als wirtschaftlichen Erfolg markieren oder über Dry-Run-APIs als finale Belohnung darstellen. Die sechs Beta-1-Challenges verwenden denselben serverseitigen Mission-, Evidence-, Review-, Completion- und WFXP-Ledger-Pfad wie Tages-, Wochen- und Mobile-Missionen.

## Kanonischer Katalog

Quelle:

```text
functions/config/beta1-challenge-missions.json
```

Katalog:

```text
wellfit-beta1-challenge-missions
Version 1.0.0
Completion Policy: once-per-mission-per-user
Evidence Type: challenge-user-confirmation
```

Missionen:

| Mission | Kategorie | Katalogwert |
|---|---|---:|
| `challenge-balance-park` | Sport & Bewegung | 95 WFXP |
| `challenge-fitness-duel` | Fitness & Klarheit | 110 WFXP |
| `challenge-math-speed` | Wissen & Klarheit | 120 WFXP |
| `challenge-reaction-test` | Geschicklichkeit | 75 WFXP |
| `challenge-ar-find` | AR & Erlebnis | 140 WFXP |
| `challenge-mindset-flow` | Wellness & Mindset | 60 WFXP |

Alle sechs Missionen:

- sind in der ersten Beta nicht für Child Profiles freigegeben;
- verlangen `challenge-user-confirmation`;
- benötigen Admin-Review;
- verlangen keine Rohbilder oder Videos;
- haben keinen Geldwert;
- aktivieren keine Token-, NFT-, Wallet-Transfer- oder Cashout-Funktion.

## Laufzeitpfad

```text
Challenge auswählen
→ submitChallengeForReview
→ deterministischer Attempt pro Nutzer / Challenge
→ deterministische Evidence-Revision
→ bestehende Admin Evidence Queue
→ adminReviewMissionEvidence
→ completeChallengeAttempt
→ xpLedgerEvents + ledgerEvents
→ xpWallets
→ missionCompletions + auditEvents
→ getChallengeProgress
```

## Wiederholungsschutz

### Attempt

Für jede Kombination aus Nutzer und Challenge gibt es eine deterministische Attempt-ID:

```text
challenge__{ownerUserId}__{missionId}
```

Ein erneuter Klick verwendet denselben offenen Attempt. Nach einer abgelehnten Evidence wird eine neue deterministische Evidence-Revision erzeugt, nicht ein paralleler Reward-Pfad.

### WFXP-Ledger

Der finale Ledger-Schlüssel lautet:

```text
challenge_mission_completion__{ownerUserId}__{missionId}
```

Selbst ein serverseitig injizierter zweiter Attempt kann dadurch keine zweite WFXP-Buchung für dieselbe Challenge erzeugen.

## Fortschrittsprojektion

`getChallengeProgress` liest ausschließlich serverseitige Authority-Collections:

```text
missionAttempts
missionEvidence
missionCompletions
xpWallets
```

Daraus werden abgeleitet:

- gestartete Challenges;
- abgeschlossene Challenges;
- offene Attempts und Reviewstatus;
- WFXP-Wallet-Saldo;
- Lifetime XP und Level.

Die Projektion besitzt keine Schreib- oder Reward-Autorität.

## Frontend-Migration

Entfernt wurden:

- `clientBetaProjection` als Challenge-Erfolgsquelle;
- lokale Punkte- und XP-Erhöhung;
- lokale `wellfit-user`-Mutation;
- lokale Reward-History;
- permanente Browser-Abschlussflags;
- der alte Dry-Run-Bridge `serverChallengeEconomyApi.ts`;
- statischer 32-Prozent-Fortschritt.

Lokale Speicherung bleibt nur für Favoriten und die nichtwirtschaftliche Routenvorbereitung erlaubt. Diese Daten haben keinen Einfluss auf Reward, Review, Completion oder WFXP.

## Adminbetrieb

Die Beta-1-Adminseite enthält einen eigenen Challenge-Katalogblock. Nur ein Nutzer mit aktuellem Admin-Claim kann den Katalog veröffentlichen oder abgleichen.

Die bestehende Mission Evidence Review Queue wird unverändert wiederverwendet. Sie zeigt den Evidence-Typ und sichere Metadaten-Schlüssel, aber keine freien Metadatenwerte, Rohbilder, Videos oder Storage-Inhalte.

## Emulator-Akzeptanz

`functions/test/beta1ChallengeMissionProgressEmulatorTest.js` prüft unter anderem:

- Admin-only Katalogabgleich;
- exakt sechs kanonische Missionen und Katalogwerte;
- deterministische Attempt- und Evidence-Wiederverwendung;
- falschen Evidence-Typ;
- Eigentümerisolation;
- Blockade vor Admin-Review;
- exakte WFXP-Buchung nach Review;
- Completion-Idempotenz;
- Schutz vor injiziertem Doppel-Attempt;
- neue Evidence-Revision nach `needs-more-evidence`;
- Blockade veralteter Evidence;
- sechs abgeschlossene Challenges und 600 WFXP Gesamtertrag;
- Levelableitung aus dem Lifetime-Ledger;
- Child-Profile- und Unknown-Mission-Blockade;
- exakt sechs Reward-Ledger-Einträge;
- Abwesenheit von Legacy-`users.points`-/XP-Schreibvorgängen.

## Bewusst nicht Teil dieses Blocks

- keine automatische Challenge-Freigabe ohne Evidence-Review;
- keine Einsätze, Wetten oder Gewinnpools;
- keine Tokenisierung, NFTs, Blockchain-Transfers oder Auszahlungen;
- keine Firebase-Produktivbereitstellung;
- keine Änderung von Produktionsdaten.
