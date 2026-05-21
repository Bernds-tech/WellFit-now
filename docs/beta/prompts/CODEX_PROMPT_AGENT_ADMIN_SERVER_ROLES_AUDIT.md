# CODEX PROMPT - Agent Admin Server Roles Audit

## Branch

`runtime/agent-admin-server-roles-audit`

## Ziel

Backend-/Rules-/Audit-Konzept fuer serverseitige Rollenpruefung und Agent-Admin-Freigabelogik umsetzen - **nur nach expliziter Freigabe**.

## Wichtig vor Start

- Bis zur expliziten Freigabe: planning/report-only.
- Keine Auto-Merge-/Deploy-Mechanik.
- Keine protected scopes ohne separaten Review.

## Erlaubte spaetere Dateien (nur nach Freigabe)

- `functions/**`
- `firestore.rules`
- `lib/admin/**`
- `app/admin/**`
- `tests/emulator` (falls vorhanden)

## Harte Stop Conditions

Sofort stoppen und reporten, wenn:

1. Scope ueber erlaubte Pfade hinausgeht.
2. Token/NFT/Payment/Cashout/Blockchain-Funktionen betroffen sind.
3. Child/Health/Location/Privacy/Legal-Daten ohne Reviewplan erweitert werden.
4. Reward-/XP-Ledger-/Mission-Completion-Autoritaet clientseitig landen wuerde.
5. Audit-Pflicht serverseitig nicht erzwingbar ist.
6. Auto-Merge/Auto-Deploy gefordert wird.

## Pflicht-Grenzen

- Keine protected scopes ohne Human Review.
- Keine Runtime-Autonomie ohne serverseitige Rollenchecks + Audit.
- PR-Handoff und Human-Merge bleiben Pflicht.
