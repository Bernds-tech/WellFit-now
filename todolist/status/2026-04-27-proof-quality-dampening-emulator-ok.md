# Statusnotiz – Proof-Quality-Drosselung Emulator OK

Datum: 2026-04-27
Repository: Bernds-tech/WellFit-now

## Block

Anti-Cheat / Sensor Fusion – Proof-Quality-Drosselung in `missionRewardPreview`.

## Ergebnis

[x] `npm run check` im Functions-Ordner erfolgreich.
[x] `npm run test:emulator` erfolgreich.
[x] NFC Smoke Test erfolgreich.
[x] Firestore Rules Smoke Test erfolgreich.
[x] Callable Functions Emulator Test erfolgreich.
[x] Mission Completion Emulator Test erfolgreich.
[x] Mission Evidence Review Emulator Test erfolgreich.

## Technischer Stand

[x] `missionRewardPreview` akzeptiert optional `evidenceReviewId`.
[x] `missionRewardPreview` liest eigene `missionEvidenceReviews` serverseitig.
[x] `functions/lib/missionRewardPolicy.js` enthält Proof-Quality-Drosselung.
[x] Ohne Evidence Review wird RewardPreview vorsichtig gedrosselt: `evidenceReviewMultiplier = 0.65`.
[x] Riskante Evidence Review setzt RewardPreview auf `manual-review-required`.
[x] Riskante Evidence Review setzt `estimatedInternalPoints = 0`.
[x] Riskante Evidence Review setzt `estimatedXp = 0`.
[x] Gedrosselte Preview autorisiert weiterhin keine Rewards, XP, Punkte, Token oder finale Mission Completion.
[x] Emulator-Test deckt die Drosselung ab.

## Sicherheitsstatus

[x] RewardPreview bleibt Simulation.
[x] EvidenceReview bleibt Review-/Audit-Logik.
[x] Keine Auszahlung.
[x] Keine XP-Autorisierung.
[x] Keine Punkte-Autorisierung.
[x] Keine Token-Autorisierung.
[x] Keine finale Mission-Completion-Autorisierung.

## Hinweise

[!] Die `PERMISSION_DENIED`-Meldungen im Rules-Test sind erwartete Positivsignale. Sie zeigen, dass direkte Client-Writes blockiert werden.
[!] Dieser Block ist noch keine finale Reward Engine.

## Nächster Schritt

Production Build + PM2 Restart:

```bash
cd /var/www/WellFit-now
git fetch origin
git reset --hard origin/main
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
pm2 status
```

Danach kann als nächster Entwicklungsblock die Roadmap-Konsolidierung in `F`, `G`, `J` und `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md` erfolgen.
