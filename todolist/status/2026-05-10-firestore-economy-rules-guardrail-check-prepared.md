# 2026-05-10 – Firestore Economy Rules Guardrail Check vorbereitet

Status: vorbereitet / lokaler Test ausstehend

## Zweck

Dieser Status dokumentiert den Abschluss der naechsten QA-Vorstufe nach Mega-Block 22.

Mega-Block 22 wurde gegen den aktuellen GitHub-Stand geprueft:

- `firestore.rules` trennt sichere Profilfelder von temporaeren Economy-MVP-Bruecken.
- `ledgerEvents`, `auditEvents`, `userEconomyProjections` und `pointsSinkEvents` sind clientseitig create/update/delete-denied.
- Owner-Read fuer server-only Economy-Collections laeuft ueber `resource.data.userId == request.auth.uid`.
- `users.points`, `users.xp`, `users.level`, `users.avatar`, `userDailyMissionState`, `userDailyStreaks` und `userLevels` bleiben bewusst noch nicht hart gesperrt, solange Dashboard/Tagesmissionen/Buddy-Futter auf MVP-Bruecken angewiesen sind.

## Neu gebaut

- `scripts/wellfit-dev-agent/src/firestore-economy-rules-check.mjs`
- `npm run agent:firestore-economy-rules-check`
- Integration in `scripts/wellfit-dev-agent/run-agent-full.ps1`
- Integration in `scripts/wellfit-dev-agent/src/quality-gate.mjs`
- Dokumentation in `todolist/LOCAL_AGENT_RUN_INSTRUCTIONS.md`
- Dokumentation in `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md`
- Dokumentation in `todolist/PROJECT_STRUCTURE.md`

## Was der Check prueft

- `rules_version = '2'`
- Default-Deny-Fallback existiert
- `hasOnlySafeUserProfileKeys()` existiert
- `hasOnlyTemporaryEconomyBridgeKeys()` existiert
- Safe Profile Keys bleiben erlaubt
- temporaere Economy Bridge Keys bleiben als Beta-Bruecke erlaubt
- `users/{userId}` update nutzt `hasOnlyUserWritableKeys()`
- `users/{userId}` delete bleibt denied
- `missionRewardEvents`, `missionRewardPreviews`, `missionCompletionEvaluations`, `ledgerEvents`, `auditEvents`, `userEconomyProjections`, `pointsSinkEvents` blockieren clientseitige Create/Update/Delete-Writes
- owner-read guard fuer server-only Economy-Collections ist vorhanden

## Nicht geaendert

- Keine harte Firestore-Sperre fuer aktuelle MVP-Bruecken aktiviert.
- Keine echten Firestore Writes aktiviert.
- Keine echten Token aktiviert.
- Keine NFTs aktiviert.
- Keine Wallet-Funktion aktiviert.
- Keine Auszahlungen aktiviert.
- Keine echten Kaeufe aktiviert.
- Keine Blockchain-Transfers aktiviert.
- Keine Unity-/AR-Dateien angefasst.

## Lokal zu testen

```powershell
cd C:\wellfit\WellFit-now
git pull
npm run agent:code-inventory
npm run agent:firestore-economy-rules-check
powershell -ExecutionPolicy Bypass -File scripts/wellfit-dev-agent/run-agent-full.ps1
npm run build
```

Erwartung:

- Firestore Economy Rules Check: PASS
- Quality Gate: PASS
- Build: gruen

## Live-Test

Kein Live-Test auf `wellfit-now.io` erforderlich. Dieser Block betrifft lokale Agent-/Rules-QA und keine sichtbare UI.

## Naechster Schritt

Echte Firebase-Emulator-Testdateien fuer die Allow-/Deny-Faelle aus `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md` vorbereiten.

## KI-Fortsetzungs-Prompt

Lies zuerst `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md`, `firestore.rules`, `scripts/wellfit-dev-agent/src/firestore-economy-rules-check.mjs`, `todolist/PROJECT_STRUCTURE.md` und `todolist/CODEBASE_FEATURE_MAP.md`. Baue als naechstes echte Emulator-/Rules-Testdateien, ohne `firestore.rules` hart zu sperren und ohne Token/NFT/Wallet/Kauf/Auszahlung/Blockchain-Funktionen zu aktivieren.
