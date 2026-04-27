# Statusnotiz – RewardPreview v3 System Safety Caps Emulator OK

Datum: 2026-04-27
Repository: Bernds-tech/WellFit-now

## Block

RewardPreview v3 / System Safety Caps.

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
[x] `missionRewardPreview` liest `systemReserveSnapshots` serverseitig als read-only Systemzustand.
[x] `functions/lib/missionRewardPolicy.js` nutzt Policy-Version `preview-v3-system-safety-caps`.
[x] `MISSION_TYPE_CAPS` eingeführt.
[x] UserDailyCap wird als Policy-Grenze in `caps.userDailyCap` ausgegeben.
[x] MissionTypeCap wird in `caps.missionTypeCap` ausgegeben.
[x] AppliedCap wird in `caps.appliedCap` ausgegeben.
[x] SystemReserveMultiplier wird in `multipliers.systemReserveMultiplier` ausgegeben.

## Getestetes Verhalten

[x] Ohne SystemReserveSnapshot wird RewardPreview vorsichtig gedrosselt: `systemReserveMultiplier = 0.75`.
[x] Gesunder SystemReserveSnapshot setzt `systemReserveMultiplier = 1`.
[x] Blockierter SystemReserveSnapshot setzt `previewStatus = manual-review-required`.
[x] Blockierter SystemReserveSnapshot setzt `estimatedInternalPoints = 0`.
[x] Blockierter SystemReserveSnapshot setzt `estimatedXp = 0`.
[x] RewardPreview gibt `systemReserveSnapshotId` zurück.

## Sicherheitsstatus

[x] RewardPreview bleibt Simulation.
[x] Keine Auszahlung.
[x] Keine XP-Autorisierung.
[x] Keine Punkte-Autorisierung.
[x] Keine Token-Autorisierung.
[x] Keine finale Mission-Completion-Autorisierung.

## Hinweis

Die `PERMISSION_DENIED`-Meldungen im Rules-Test sind erwartete Positivsignale. Sie zeigen, dass direkte Client-Writes blockiert werden.

## Einschätzung

Dieser Block ist technisch wichtig, aber fuer Nutzer noch nicht sichtbar. Er verhindert spaeter, dass Rewards ohne Systemgesundheit, Tageslimit, MissionTypeCap oder Evidence-Qualitaet inflationaer simuliert oder spaeter ausgezahlt werden koennen.

## Nächste Empfehlung

Nach diesem Backend-Sicherheitsblock sollte ein sichtbarer Produkt-/UI-Block folgen, damit der Fortschritt im Browser erlebbarer wird. Empfohlen:

1. Mobile Missionen / Buddy / AR sichtbarer verbinden.
2. Evidence-/RewardPreview-Status als Debug-/Admin-Panel anzeigen.
3. Tagesmissionen von lokaler MVP-Logik schrittweise an serverseitige Preview anschließen, weiterhin ohne Auszahlung.
