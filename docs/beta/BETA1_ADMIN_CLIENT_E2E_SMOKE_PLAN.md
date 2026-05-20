# Beta-1 Admin + Client E2E Smoke Plan

Status: runtime-smoke-plan (docs + small UI guidance)
Date: 2026-05-20
Branch context: `runtime/beta1-admin-panel-e2e-smoke`

## 1) Ziel des Smoke-Slices
Dieser Smoke-Slice validiert den kleinsten End-to-End-Pfad zwischen bestehender Admin-Bedienoberflaeche und Client-Read-Projections:

- Admin bereitet Beta-1 Teststruktur ueber **bestehende Callables** vor.
- Dashboard liest danach nur **read-only** die serverseitigen Projections.
- Keine neue Server-Authority, keine neue Function, keine Rules-Aenderung.

## 2) Primaerer Testpfad (E2E Smoke)
1. **Admin Login mit `admin` claim**
   - Erwartung: Admin Guard erlaubt Zugriff.
   - Negativfall: ohne Claim bleibt Zugriff blockiert mit freundlicher Meldung.
2. **Admin oeffnet `/admin/beta1`**
   - Erwartung: Bestehende Forms sind sichtbar (Mission/Checkpoint/Glitch/Safety/XP).
3. **Admin erstellt Mission Draft** (`adminCreateMission`)
   - Erwartung: Callable akzeptiert valide Payload; UI zeigt Erfolg.
4. **Admin veroeffentlicht Mission** (`adminPublishMission`)
   - Erwartung: Publish wird serverseitig akzeptiert.
5. **Dashboard liest published missions**
   - Erwartung: Read projection listet veroeffentlichte Missionen.
6. **User sieht Mission in `Beta1ReadProjectionPanel`**
   - Erwartung: Mission erscheint in der Preview (read-only).

## 3) Sekundaere Testpfade
- **Checkpoint Create -> Dashboard checkpoint count**
  - Admin erstellt Checkpoint ueber bestehendes Callable.
  - Dashboard zeigt erhoehte Checkpoint-Anzahl in Read-Projections.

- **Glitch Schedule -> Dashboard glitch count**
  - Admin plant aktives Glitch Event ueber bestehendes Callable.
  - Dashboard zeigt aktive Glitch-Ereignisse in Read-Projections.

- **Safety Review -> nur Admin, keine User-Leaks**
  - Safety Review bleibt ausschliesslich im Admin-Kontext.
  - Im Dashboard wird **kein** Safety-Moderationsdetail exponiert.

- **XP Adjust -> Wallet/Ledger Projection sichtbar**
  - Admin fuehrt XP-Adjust mit Pflicht-Reason aus.
  - Dashboard zeigt Wallet/Ledger-Projektion read-only aktualisiert.

## 4) Erwartete Sicherheitsgrenzen
- Client liest nur sichere Projections.
- Admin UI ruft nur bestehende serverseitige Callables auf.
- Server bleibt finale Authority fuer Mission/XP/Glitch/Safety.
- Keine Firestore-Rules-Aenderung.
- Keine Firebase-Functions-Aenderung.
- Keine Token/NFT/Cashout/Payment/Blockchain-Felder.
- Keine oeffentlichen Child-Profile.

## 5) Manuelle Testdaten (nur Beispielwerte)

### Mission (Draft/Create)
- `title`: `Beta1 Vienna Walk Quest 01`
- `type`: `walk`
- `rewardXp`: `120`
- `childAllowed`: `true`

### Checkpoint
- `title`: `Stephansplatz Intro Point`
- `regionId`: `vienna`
- `locationId`: `vienna-demo-01`

### Glitch
- `regionId`: `lower-austria`
- `locationIds`: `lower-austria-demo-01,lower-austria-demo-02`
- `windowStart`: `2026-06-01T09:00:00Z`
- `windowEnd`: `2026-06-01T09:15:00Z`
- `multiplierCap`: `3`
- `maxParticipants`: `50`
- `reason`: `beta1 smoke event`

### XP Adjust
- `ownerUserId`: `beta1-tester-user-01`
- `delta`: `25`
- `reason`: `beta1 smoke validation`
- `idempotencyKey`: `beta1-smoke-xp-01`

## 6) Akzeptanzkriterien fuer 25-50 Beta-Tester
- Admin kann mindestens **5** Testmissionen vorbereiten.
- Dashboard zeigt published missions stabil an.
- XP Wallet/Ledger Anzeige bleibt stabil (kein UI-Ausfall).
- Permission denied wird freundlich angezeigt (kein Raw-Stacktrace-Leak).
- Keine Child Public Profiles im Client.
- Keine Token/Cashout/Payment-Felder in Admin- oder Dashboard-Slice.

## 7) Stop-Bedingungen (verbindlich)
Task wird gestoppt und nur berichtet, wenn:
1. E2E-Smoke nur mit neuer Function erreichbar waere.
2. E2E-Smoke nur mit Rules-Aenderung erreichbar waere.
3. Bestehende Callable-Contracts nicht ausreichen.
4. Dashboard-Projection neue Server-Authority brauchen wuerde.
5. Token/NFT/Cashout/Payment/SUI/WFT-Felder notwendig waeren.
6. Mehr als kleine UI-/Doku-Haertung noetig waere.
7. Automatisches echtes Seed-Writing noetig waere.

## 8) Ergebnis dieses Slices
- Plan dokumentiert den minimalen E2E-Smokepfad fuer Admin->Server->Client-Read.
- Runtime bleibt bei bestehender Sicherheitsarchitektur.
- Empfohlener naechster Branch nach diesem Slice:
  - `runtime/beta1-seed-demo-content-and-test-users`
