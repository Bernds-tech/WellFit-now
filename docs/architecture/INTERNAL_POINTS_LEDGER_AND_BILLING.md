# WellFit Internal Points Ledger and Billing

Status: Beta-planend / verbindliche Architekturgrundlage
Stand: 2026-05-07

## Ziel

Diese Datei beschreibt das interne Punkte-, XP-, Reward- und Abrechnungssystem von WellFit vor Tokenisierung.

Grundregel:

> Erst muss die interne Punkte- und Abrechnungslogik stabil funktionieren. Danach koennen Token die interne Logik ersetzen, spiegeln oder teilweise abbilden.

## Warum dieses Ledger wichtig ist

Ohne stabiles internes Ledger darf es keine echten Token geben.

Das Ledger beantwortet:
- Wer bekommt Punkte?
- Warum bekommt jemand Punkte?
- Welche Mission war Grundlage?
- Welche Evidence wurde verwendet?
- Welche Limits wurden geprueft?
- Welche Risiken wurden erkannt?
- Wurde gedrosselt, abgelehnt oder manuell geprueft?
- Wie wird eine falsche Buchung korrigiert?

## Grundprinzipien

- Server ist Autoritaet.
- Client darf nur anzeigen, vorschlagen oder Demo-Zustaende halten.
- Jede finale Punkte-/XP-/Reward-Buchung braucht ein Audit-Ereignis.
- Jede Buchung muss nachvollziehbar, korrigierbar und begrenzbar sein.
- Keine echte Auszahlung, kein WFT, kein NFT, kein Trading in der Beta.

## Ledger-Event-Typen

### MissionCompletionRequested
Ein Nutzer oder System fordert Mission Completion an.

### MissionCompletionApproved
Server bestaetigt eine Mission als erfolgreich.

### MissionCompletionRejected
Server lehnt eine Mission ab.

### RewardPreviewCreated
System erzeugt eine Reward-Vorschau ohne finale Autoritaet.

### PointsGranted
Server vergibt interne Punkte.

### XpGranted
Server vergibt XP.

### StreakUpdated
Server aktualisiert Streaks.

### CapApplied
Ein Cap wurde angewendet, z. B. DailyEmissionCap, UserDailyCap oder MissionTypeCap.

### ManualReviewRequested
Mission oder Reward muss manuell geprueft werden.

### LedgerCorrection
Eine falsche oder geaenderte Buchung wird korrigiert.

## Mindestfelder pro Ledger-Event

- event_id
- event_type
- user_id
- mission_id optional
- source_type
- source_id
- points_delta optional
- xp_delta optional
- streak_delta optional
- status
- reason_code
- evidence_summary
- risk_summary
- caps_applied
- created_at
- created_by
- correlation_id

## Statuswerte

- pending
- preview_only
- approved
- rejected
- throttled
- manual_review
- corrected
- voided

## Reason Codes

Beispiele:
- mission_completed
- proof_quality_low
- duplicate_evidence
- cooldown_active
- daily_user_cap_reached
- mission_type_cap_reached
- global_daily_cap_reached
- suspicious_pattern
- manual_review_required
- correction_applied

## Abrechnungslogik

### 1. Request
Mission oder System fordert eine Bewertung an.

### 2. Evidence Check
Server prueft Evidence, Kontext, Proof-Qualitaet und Duplikate.

### 3. Risk Check
Server prueft Pattern, Cooldown, Caps und EconomyHealthScore.

### 4. Decision
Server entscheidet:
- approved
- rejected
- throttled
- manual_review
- preview_only

### 5. Ledger Write
Server schreibt ein Audit-Event und ggf. Punkte-/XP-Aenderungen.

### 6. User Balance Projection
Ein separater aggregierter Stand kann fuer Anzeige berechnet werden.

## Balance darf nicht alleinige Wahrheit sein

Ein Nutzerstand wie `points_balance` darf nur eine Projektion sein.

Die Wahrheit liegt im Ledger:
- Summe der PointsGranted
- minus Korrekturen
- minus Ausgaben/Sinks
- plus/minus spaetere LedgerCorrection Events

## Caps und EconomyHealthScore

Jede Vergabe muss mit diesen Guardrails abgeglichen werden:

- DailyEmissionCap
- UserDailyCap
- MissionTypeCap
- EconomyHealthScore
- ProofQuality
- CooldownRisk
- PatternRisk

## Korrektur und Rollback

Keine Buchung wird hart geloescht.

Korrektur erfolgt ueber:
- LedgerCorrection
- voided status
- negative delta events
- reason_code
- audit trail

## Datenbankbezug

Abzugleichen mit:

- `todolist/DATABASE_PLAN.md`
- `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`
- `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md`
- `docs/architecture/AR_REWARD_LEDGER_EVENT.md`
- `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md`
- `docs/architecture/USER_POINTS_CLIENT_WRITE_REFACTOR.md`
- `docs/architecture/USER_ECONOMY_WRITE_SEARCH_NOTES.md`

## Token-Migration spaeter

Wenn das interne Ledger stabil ist, kann spaeter entschieden werden:

- Token ersetzt interne Punkte
- Token spiegelt interne Punkte
- nur bestimmte Reward-Arten werden tokenisiert
- Token bleibt nur Web-/PC-Dashboard
- Mobile zeigt nur sichere interne Werte

## Offene Folgeaufgaben

- [ ] Konkretes Ledger-Datenmodell fuer Firestore oder PostgreSQL definieren.
- [ ] User Balance Projection definieren.
- [ ] PointsGranted-/XpGranted-/StreakUpdated-Events als Draft-Schema beschreiben.
- [ ] Correction-/Rollback-Mechanik als Detaildatei vorbereiten.
- [ ] Client-Write-Verbot fuer Punkte/XP gegen vorhandene Rules pruefen.
- [ ] Mission Completion Pipeline mit Ledger verbinden.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/NEXT_ACTIONS.md`, `todolist/DATABASE_PLAN.md`, `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`, `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md`, `todolist/TODO_INDEX.md` und diese Datei. Arbeite Ledger- und Abrechnungsthemen nur serverseitig, auditierbar und korrigierbar weiter. Keine clientseitige finale Punkte-/XP-/Reward-Autoritaet. Keine echte Tokenisierung, bis das interne Ledger stabil und getestet ist.
