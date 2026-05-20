# Beta-1 Admin Panel Integration Plan

Status: planning-only handoff artifact (no runtime changes)
Date: 2026-05-20
Branch context: `plan/beta1-server-api-read-projections-admin-panel`

## 1) Ziel
Das Admin Panel soll Missionen, Checkpoints, ShopItems, GlitchEvents und SafetyReports ueber bestehende serverseitige Flows verwalten, ohne Client-Sicherheitsgrenzen oder Server-Authority-Grenzen zu verletzen.

## 2) Admin-Funktionen (bestehend / geplant zu nutzen)
- `adminCreateMission`
- `adminUpdateMission`
- `adminPublishMission`
- `adminCreateCheckpoint`
- `adminScheduleGlitchEvent`
- `cancelGlitchEvent`
- `adminReviewSafetyReport`
- `adminAdjustXp`
- optional (nur planen): admin audit summary list/read projection

## 3) Admin-Rollen und Zwangsbedingungen
- `admin` custom claim ist Pflicht.
- Kein Normaluser-Zugriff.
- Auditability ist Pflicht fuer kritische Aktionen.
- XP-Adjustments nur mit verpflichtendem Reason.
- Keine real-money Felder.
- Keine token/NFT/cashout Felder.

## 4) Admin UI Plan (Screen -> callable -> controls)

| Admin screen | callable | required fields | validation | audit | risk level | tests needed |
| --- | --- | --- | --- | --- | --- | --- |
| Mission create | `adminCreateMission` | title, type, region/location refs, reward policy ref, child-safety flags | schema + required fields + safe-location constraints | create audit event with actor/timestamp | high | admin-claim required, invalid payload reject, no normal-user access |
| Mission update | `adminUpdateMission` | missionId + mutable draft fields | allowlist mutable fields, reject protected/final fields | update audit event + diff summary | high | admin-only, immutable/published restrictions respected |
| Mission publish | `adminPublishMission` | missionId, publishState | preflight checks (required mission fields + safety completeness) | publish audit trail | high | admin-only publish, no draft leakage to client read |
| Checkpoint create | `adminCreateCheckpoint` | checkpoint metadata, region, safe-location metadata | geo bounds/safe location validation | checkpoint creation audit | high | admin-only, unsafe payload rejected |
| Glitch schedule | `adminScheduleGlitchEvent` | region, start/end, multiplier, safety settings | region active + cap checks + time window checks | schedule audit event | high | admin-only, cap violations rejected |
| Glitch cancel | `cancelGlitchEvent` | glitchEventId, reason | existence/state checks + reason required | cancel audit trail | high | admin-only, cancel reason persisted |
| Safety review | `adminReviewSafetyReport` | reportId, decision, reason, optional actions | required reason + allowed decisions only | full moderation audit record | critical | admin-only, decision write integrity, no data overexposure |
| XP adjust | `adminAdjustXp` | ownerId/subject, amount delta, reason, ticket/reference | bounded amount + reason mandatory + no monetary semantics | ledger/audit dual logging | critical | admin-only, reason required, double-log integrity |
| Audit summaries (optional plan) | read projection only (no new callable in this step) | filters/date range/risk type | read-only query constraints | none new in this step | medium | admin-only read checks, pagination correctness |

## 5) Besonders schuetzen
- Child data: niemals oeffentlich, nur role/link-konform.
- Location data: nur safe projection, keine unkontrollierte Preisgabe.
- Camera/evidence data: minimal exposure, role-gated moderation.
- XP ledger adjustments: strikte reason/audit Pflicht.
- Reality Glitch scheduling: cap + region + cancel safety.
- Mayor share XP: keine clientseitige oder unautorisierte Manipulation.

## 6) Nicht in diesem Schritt
- Kein echtes Admin UI bauen.
- Kein App Router Umbau.
- Keine neuen Functions.
- Keine Firestore Rules Aenderung.
- Keine Deploys.

## Guardrails (verbindlich)
- WellFit-XP bleibt internal only.
- Keine Blockchain/WFT/SUI/NFT/Cashout/Real-Money/IAP.
- Keine clientseitige Autoritaet fuer XP/Mission/Shop/Inventory/Mayor/Glitch/Admin.
