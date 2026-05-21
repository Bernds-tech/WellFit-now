# Beta-1 Manual Demo Seed Runbook

Status: manual_admin_runbook (no automatic writes)
Date: 2026-05-20
Branch context: `ops/beta1-manual-demo-seed-runbook`

## 1) Zweck
Dieses Runbook beschreibt die **manuelle, kontrollierte** Beta-1-Demo-Seed-Vorbereitung ueber `/admin/beta1`, damit Admins Demo-Missionen, Checkpoints, Glitches sowie optionale Shop-/Avatar-Items reproduzierbar vorbereiten koennen, ohne neue Runtime-Autoritaet einzufuehren.

## 2) Voraussetzungen
- Admin-Account mit `admin` claim und erfolgreicher Guard-Freigabe in `/admin/beta1`.
- Zugriff auf bestehende Beta-1 Admin UI und bestehende serverseitige Callables.
- Beta-1 Emulator-/CI-Status ist als gruen dokumentiert (oder bekannte Blocker sind transparent dokumentiert).
- Keine Production Writes ohne explizite Freigabe.
- Keine echten Tester-Daten, keine echten E-Mails, keine personenbezogenen Echtprofile.

## 3) Seed-Reihenfolge (manuell)
1. **Missionen**: 5-10 Eintraege.
2. **Checkpoints**: 3-5 Eintraege.
3. **Glitch Events**: 1-3 Eintraege.
4. **ShopItems**: 5-8 Eintraege, **nur falls** Admin-UI/Callable in der Umgebung vorhanden ist.
5. **Avatar/Cosmetic Items**: 5 Eintraege, **nur falls** Admin-UI/Callable in der Umgebung vorhanden ist.
6. **Testuser-Platzhalter**: nur dokumentieren, **nicht** anlegen.

> Stop sofort, wenn automatische Writes, neue Functions, Rules-Aenderungen oder sensitive Echtwerte erforderlich waeren.

## 4) Seed-Typen im Detail

### 4.1 Mission Seed (5-10)
- **Felder** (Admin Create + Publish):
  - `title`, `type`, `rewardXp`, `childAllowed` (Create)
  - `missionId` (Publish)
- **Beispielwerte (Template-Basis)**:
  - `missionKey`: `beta1-vie-move-001`
  - `title`: `Vienna Ring Walk Intro`
  - `type`: `movement`
  - `rewardXp`: `120`
  - `childAllowed`: `true`
- **Validierungsregeln (Client-Guard vor Callable)**:
  - Titel erforderlich, sinnvolle Mindestlaenge.
  - `type` muss in erlaubtem Mission-Type-Spektrum liegen.
  - `rewardXp` > 0 und innerhalb sicherer Grenzen.
  - Publish nur mit nicht-leerer `missionId`.
- **Erwartete Admin-UI-Rueckmeldung**:
  - Erfolg: `Aktion erfolgreich ausgefuehrt.`
  - Fehler: freundliche, nicht-sensitive Fehlermeldung (kein Stacktrace, keine Secrets).
- **Erwartete Dashboard-/Client-Read-Projektion**:
  - Published Mission erscheint in Mission-Read-Projections; ungepublishte Drafts nicht als published sichtbar.
- **Stop-Bedingungen**:
  - Permission denied trotz korrektem Admin-Claim.
  - Validierung blockiert legitime Demo-Daten aus Template ohne nachvollziehbaren Grund.
  - Publish-Flow nur mit neuen Functions/Rules moeglich.

### 4.2 Checkpoint Seed (3-5)
- **Felder**:
  - `title`, `regionId`, optional `locationId`.
- **Beispielwerte (Template-Basis)**:
  - `checkpointKey`: `cp-vie-demo-01`
  - `title`: `Vienna Public Square Intro`
  - `region`: `vienna`
- **Validierungsregeln**:
  - `title` erforderlich.
  - `regionId` darf nur erlaubte Regionen nutzen (z. B. `vienna`, `lower-austria`).
  - Keine sensitiven Echtkoordinaten/privaten Orte.
- **Erwartete Admin-UI-Rueckmeldung**:
  - Erfolgsmeldung nach Callable.
  - Bei Fehlern nur sichere Fehlerrueckgabe.
- **Erwartete Dashboard-/Client-Read-Projektion**:
  - Checkpoint-Count/Checkpoint-Liste in Read-Projections aktualisiert.
- **Stop-Bedingungen**:
  - Nur mit Rules-/Function-Aenderung fortsetzbar.
  - Standortdaten muessten in sensitive Echtkoordinaten wechseln.

### 4.3 Glitch Seed (1-3)
- **Felder**:
  - `regionId`, `locationIds[]`, `windowStart`, `windowEnd`, `multiplierCap`, `maxParticipants`, `reason`.
- **Beispielwerte (Template-Basis)**:
  - `glitchKey`: `glitch-vie-demo-01`
  - `regionId`: `vienna`
  - `locationIds`: `vie-demo-loc-01,vie-demo-loc-02`
  - `durationMinutes`: `10`
  - `multiplierCap`: `3`
- **Validierungsregeln**:
  - Zeitfenster maximal kurzer Demo-Rahmen (Smoke: 10 Minuten).
  - `reason` erforderlich.
  - Numerische Felder > 0 und in sicheren Testgrenzen.
- **Erwartete Admin-UI-Rueckmeldung**:
  - Erfolg nach Schedule-Callable.
  - Freundliche Fehler bei invaliden Eingaben oder Permission-Problemen.
- **Erwartete Dashboard-/Client-Read-Projektion**:
  - Active-Glitch-Count bzw. Event-Liste read-only sichtbar.
- **Stop-Bedingungen**:
  - Event nur mit neuer Authority/Function möglich.
  - Token/Cashout/Payment-/Stake-Felder scheinen erforderlich.

### 4.4 ShopItem Seed (5-8, nur falls vorhanden)
- **Felder** (falls callable vorhanden):
  - `itemKey`, `title`, `category`, `priceWfxp`, `rarity`, `childSuitable`.
- **Beispielwerte (Template-Basis)**:
  - `itemKey`: `shop-beta1-water-badge`
  - `title`: `Hydration Badge`
  - `category`: `booster_cosmetic`
  - `priceWfxp`: `45`
- **Validierungsregeln**:
  - Nur interne WFXP-/Cosmetic-Felder.
  - Keine Echtgeld-/Payment-/Token-/NFT-Felder.
- **Erwartete Admin-UI-Rueckmeldung**:
  - Erfolg oder sichere Fehlermeldung, ohne sensitive Details.
- **Erwartete Dashboard-/Client-Read-Projektion**:
  - Shop-Projektion listet nur erlaubte interne Demo-Items.
- **Stop-Bedingungen**:
  - Shop-Seed benoetigt Real-Money, IAP, Cashout oder Blockchain-Bezug.

### 4.5 Avatar/Cosmetic Seed (5, nur falls vorhanden)
- **Felder** (falls callable vorhanden):
  - `avatarItemKey`, `title`, `effectType`, `priceWfxp`, `childSuitable`.
- **Beispielwerte (Template-Basis)**:
  - `avatarItemKey`: `avatar-beta1-cap-vienna`
  - `title`: `Vienna Runner Cap`
  - `effectType`: `cosmetic_only`
  - `priceWfxp`: `150`
- **Validierungsregeln**:
  - Nur kosmetisch/intern; keine finalen Werttransfers.
- **Erwartete Admin-UI-Rueckmeldung**:
  - Erfolg oder klare Blockade mit sicherer Fehlermeldung.
- **Erwartete Dashboard-/Client-Read-Projektion**:
  - Inventory/Avatar-Projektion bleibt read-only und ohne sensitive Felder.
- **Stop-Bedingungen**:
  - Seed benoetigt neue Backend-Authority oder sensitive Personendaten.

### 4.6 Testuser-Platzhalter (nur Dokumentation)
- **Felder**:
  - `testerKey`, `status=planned` (nur Doku-Referenz).
- **Beispielwerte (Template-Basis)**:
  - `beta1-tester-001` ... `beta1-tester-025`.
- **Regel**:
  - Nicht im System anlegen; nur als Platzhalter in Evidence notieren.

## 5) Evidence-Protokoll (Pflicht)
Pro manueller Aktion eine Zeile erfassen:

| runId | adminOperatorPlaceholder | date | itemType | templateKey | callableUsed | inputSummary | expectedResult | actualResult | status (pass/fail/blocked) | notes | screenshotRef (optional) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| beta1-seed-run-001 | admin-placeholder-01 | 2026-05-20 | mission | beta1-vie-move-001 | adminCreateMission | title/type/rewardXp/childAllowed gesetzt | mission draft accepted | accepted=true | pass | no sensitive data | n/a |

Hinweis: Screenshots duerfen keine echten Nutzerdaten, Secrets oder Projekt-IDs enthalten.

## 6) Sicherheitsgrenzen (verbindlich)
- Keine automatischen Writes.
- Keine echten Personen oder Echtprofile.
- Keine Secrets.
- Keine Production Firebase Project IDs.
- Keine Token-/Cashout-/Payment-Felder.
- Keine Child Public Profiles.
- WellFit-XP bleibt internal only; keine Blockchain/NFT/WFT/SUI/Cashout/IAP/DePIN/PvP-Stake-Logik.
- Finale Autoritaet fuer Mission/XP/Shop/Inventory/Glitch/Admin bleibt serverseitig.

## 7) Go/No-Go Kriterien
**Go** nur wenn alle Punkte erfuellt sind:
1. Admin kann Seed-Aktionen ueber bestehende Flows ausfuehren.
2. Dashboard zeigt published missions in Read-Projections.
3. XP/Ledger-Projektionen bleiben stabil (kein UI-Crash).
4. Permission denied bleibt freundlich und leak-frei.
5. Keine sensiblen Daten werden angezeigt.

**No-Go / Stop & Report**, wenn eine Stop-Bedingung greift:
1. Automatisches Schreiben waere noetig.
2. Neue Firebase Functions waeren noetig.
3. Firestore Rules Aenderungen waeren noetig.
4. Echte personenbezogene Daten waeren noetig.
5. Echte sensible Orte/Koordinaten waeren noetig.
6. Token/NFT/Cashout/Payment/SUI/WFT-Felder waeren noetig.
