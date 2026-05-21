# Beta-1 Manual Seed Evidence Template

Kopierbare Vorlage fuer manuelle Beta-1 Demo-Seed-Durchlaeufe (ohne automatische Writes).

## Header
- runId:
- adminOperatorPlaceholder:
- date (UTC):
- branch:
- environment (local/emulator/staging placeholder):
- notes:

## Evidence Tabelle

| runId | adminOperatorPlaceholder | date | itemType | templateKey | callableUsed | inputSummary | expectedResult | actualResult | status (pass/fail/blocked) | notes | screenshotRef (optional) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| beta1-seed-run-001 | admin-placeholder-01 | 2026-05-20 | mission | beta1-vie-move-001 | adminCreateMission | title=Vienna Ring Walk Intro, type=movement, rewardXp=120, childAllowed=true | accepted + success feedback | accepted=true + success shown | pass | no sensitive data | n/a |
| beta1-seed-run-001 | admin-placeholder-01 | 2026-05-20 | mission_publish | beta1-vie-move-001 | adminPublishMission | missionId=<placeholder> | published visible in projection | publish accepted | pass | projection checked | n/a |

## Safety Checklist (pro Lauf)
- [ ] Keine automatischen Writes verwendet.
- [ ] Keine neuen Functions erstellt.
- [ ] Keine Firestore Rules geaendert.
- [ ] Keine echten Personen-/Tester-Daten genutzt.
- [ ] Keine echten E-Mails, keine Secrets, keine Production-IDs.
- [ ] Keine Token/NFT/Payment/Cashout/IAP/Blockchain/SUI/WFT-Felder.
- [ ] Keine Child Public Profiles / kein Child Standalone Login.
