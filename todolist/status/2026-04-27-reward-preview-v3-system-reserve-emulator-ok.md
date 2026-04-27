# Statusnotiz – RewardPreview v3 SystemReserve Emulator OK

Datum: 2026-04-27
Repository: Bernds-tech/WellFit-now

## Block

Stufe 1 – RewardPreview v3 / System Safety Caps / SystemReserveSnapshot.

## Ergebnis

[x] `npm run check` im Functions-Ordner erfolgreich.
[x] `npm run test:emulator` erfolgreich.
[x] NFC Smoke Test erfolgreich.
[x] Firestore Rules Smoke Test erfolgreich.
[x] Callable Functions Emulator Test erfolgreich.
[x] Mission Completion Emulator Test erfolgreich.
[x] Mission Evidence Review Emulator Test erfolgreich.

## Technischer Stand

[x] `missionRewardPreview` akzeptiert optional `systemReserveSnapshotId`.
[x] `missionRewardPreview` liest `systemReserveSnapshots` serverseitig.
[x] `functions/lib/missionRewardPolicy.js` nutzt Policy-Version `preview-v3-system-safety-caps`.
[x] `MISSION_TYPE_CAPS` eingeführt.
[x] UserDailyCap wird als Preview-/Policy-Grenze ausgegeben.
[x] MissionTypeCap wird als Preview-/Policy-Grenze ausgegeben.
[x] AppliedCap wird ausgegeben.
[x] SystemReserveMultiplier wird ausgegeben.
[x] Ohne SystemReserveSnapshot wird die Preview systemseitig vorsichtig gedrosselt.
[x] Gesunder SystemReserveSnapshot setzt `systemReserveMultiplier = 1`.
[x] Blockierter SystemReserveSnapshot setzt `previewStatus = manual-review-required`.
[x] Blockierter SystemReserveSnapshot setzt `estimatedInternalPoints = 0`.
[x] Blockierter SystemReserveSnapshot setzt `estimatedXp = 0`.

## Sicherheitsstatus

[x] RewardPreview bleibt Simulation.
[x] Keine echte Auszahlung.
[x] Keine XP-Autorisierung.
[x] Keine Punkte-Autorisierung.
[x] Keine Token-Autorisierung.
[x] Keine finale Mission-Completion-Autorisierung.
[x] Client-Writes auf kritische Collections bleiben blockiert.

## Hinweis

Die `PERMISSION_DENIED`-Meldungen im Rules-Test sind erwartete Positivsignale. Sie zeigen, dass direkte Client-Writes blockiert werden.

## Roadmap-Auswirkung

Stufe 1 ist weiter fortgeschritten:

[x] UserDailyCap als Preview-/Policy-Cap begonnen.
[x] MissionTypeCap als Preview-/Policy-Cap begonnen.
[x] SystemReserveSnapshot read-only in RewardPreview v3 einbezogen.

Weiter offen in Stufe 1:

[ ] Production Build + PM2 für diesen Stand bestätigen.
[ ] Unplausible Sessions detaillierter markieren.
[ ] Wiederholtes Fake-/Pattern-Verhalten erkennen.
[ ] Device-/Session-Muster erkennen.
[ ] Cooldown-/Rate-Limit-Grundlage vorbereiten.

## Nächster Schritt

Production Build + PM2:

```bash
cd /var/www/WellFit-now
git fetch origin
git reset --hard origin/main
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
pm2 status
```
