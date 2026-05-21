# CODEX PROMPT - Beta-1 Live Pages Runtime Plan

## Branch

`plan/beta1-live-pages-runtime-scope`

## Ziel

Runtime-Scope fuer Marktplatz, Leaderboard, Punkte-Shop, Analytics & Stats in kleine, getrennte und reviewbare PRs schneiden.

## Nicht Ziel

- Keine direkte Runtime-Implementierung in diesem Schritt.
- Keine Functions-/Rules-Aenderung ohne explizite Folgefreigabe.

## Datenregeln pro Seite

- **Punkte-Shop:** nur WellFit-XP read/client; kein Echtgeld, kein IAP, kein NFT/Token; purchase final serverseitig.
- **Leaderboard:** read-only projections fuer XP/Mission/Checkpoints; keine Child Public Profiles, keine sensiblen Standortdaten.
- **Analytics & Stats:** own-user stats oder anonymisierte aggregates; keine personenbezogenen Rohdaten, keine Kinder-/Location-Rohdaten, keine Diagnostik.
- **Marktplatz:** nur Placeholder/Preview; kein Token/NFT/Cashout/Real-Money-Handel.

## Reihenfolge

1. Punkte-Shop read/client + vorhandene server purchase intent authority pruefen
2. Leaderboard read-only projections
3. Analytics own stats
4. Marktplatz placeholder only

## Stop Conditions

Sofort stoppen und reporten, wenn:

- neue authority/functions/rules noetig sind
- token/nft/payment/cashout erforderlich wird
- child public data erforderlich wird
- PII-/aggregation boundary unklar bleibt
