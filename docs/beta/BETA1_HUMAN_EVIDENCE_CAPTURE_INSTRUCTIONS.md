# Beta-1 Human Evidence Capture Instructions

Status: human operator execution guide
Date: 2026-05-21

## Allgemeine Regeln

- Keine echten Namen, E-Mails oder sonstige PII im Repo.
- Screenshots nur mit sicheren Referenznamen dokumentieren (z. B. `safe-shot-001`).
- Keine sensiblen Inhalte committen.
- Bei P0/P1 sofort stoppen und Incident Path starten.

## Schritt-fuer-Schritt

1. **Desktop Responsive Smoke**: zentrale Live-Routen auf Desktop in mehreren Breiten pruefen; Pass/Fail/Blocked/Pending protokollieren.
2. **Android Chrome Smoke**: gleiche Kernrouten auf Android Chrome pruefen; Geraet/OS/Browser-Version notieren.
3. **iPhone Safari Smoke**: gleiche Kernrouten auf iPhone Safari pruefen; iOS/Safari-Version notieren.
4. **`/shop`**: Route laden, XP-only/kein Echtgeld pruefen, Ergebnis protokollieren.
5. **`/leaderboard`**: readonly Ansicht und keine PII-Leaks pruefen.
6. **`/analytics`**: own-view/keine sensitiven Leaks pruefen.
7. **`/marketplace`**: Preview-Route pruefen, kein Echtgeld/Trading.
8. **`/marktplatz`**: Alias-Aufruf und korrektes Routing pruefen.
9. **Dashboard Wallet/Ledger**: lesende Anzeige auf Konsistenz/Stabilitaet pruefen.
10. **Manual Seed Run**: nur gemaess `BETA1_MANUAL_DEMO_SEED_RUNBOOK.md`; Evidence Template ausfuellen.
11. **Guardian/Child Boundary**: kein Child-Standalone-Login, Guardian-Kontext pruefen.
12. **Support/Incident Path**: Severity/Stop-Conditions und role alias contact pruefen.

## Stop Conditions

- P0/P1 Befund
- Versuch, Evidence ohne echte Tests auf GREEN zu setzen
- Bedarf an PII oder sensiblen Screenshots
- Bedarf an Runtime-/Functions-/Rules-Aenderung fuer diesen Task
