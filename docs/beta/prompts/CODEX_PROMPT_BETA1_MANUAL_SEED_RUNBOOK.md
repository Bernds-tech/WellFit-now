# CODEX PROMPT — Beta-1 Manual Demo Seed Runbook

## Branch-Vorschlag
`ops/beta1-manual-demo-seed-runbook`

## Ziel
Admin fuehrt ueber `/admin/beta1` **manuell** eine kontrollierte Demo-Seeding-Runde durch:
- 5-10 Missionen
- 3-5 Checkpoints
- 1-3 Glitches
- 5-8 ShopItems

## Verbindliche Grenzen
- Keine automatischen Firebase Writes.
- Keine neuen Firebase Functions.
- Keine Firestore Rules Aenderung.
- Keine echten Userdaten.
- Keine echten Tester-E-Mails.
- Keine Production-Firebase-IDs.
- Keine Token/NFT/Cashout/Payment/SUI/WFT Felder.

## Arbeitsweise
1. Vor Start aktuelle Guards in `lib/admin/beta1AdminValidation.ts` und vorhandene Smoke-Templates pruefen.
2. Demo-Werte aus `lib/admin/beta1DemoSeedTemplates.ts` als manuelle Eingabebasis nutzen.
3. Jede Admin-Aktion nur ueber bestehende Callables in `/admin/beta1` ausfuehren.
4. Nach jedem Block manuelle Evidence dokumentieren (Timestamp, Aktion, Ergebnis, ggf. Fehlermeldung ohne sensitive Details).
5. Bei Permission/Validation/Callable-Fehlern sofort stoppen und Fehlerbild dokumentieren.

## Evidence-Dokumentation
- Mission create/publish Nachweis (5-10 Eintraege)
- Checkpoint create Nachweis (3-5 Eintraege)
- Glitch schedule Nachweis (1-3 Eintraege, max 10 Minuten Fenster)
- ShopItem publish/read Nachweis (5-8 Eintraege)
- Dashboard Read-Projection Sichtbarkeit dokumentieren

## Stop-Regeln
Sofort abbrechen und nur reporten, wenn:
- Permission denied auf korrekten Admin-Flows
- Validation bricht legitime Demo-Daten
- Callable-Response inkonsistent oder serverseitig fehlerhaft
- neue Function oder Rules-Aenderung erforderlich waere
- nur automatisiertes Seed-Writing den Task loesen koennte
