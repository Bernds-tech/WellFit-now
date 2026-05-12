# Challenge Economy Path vorbereitet und getestet

Status: umgesetzt / lokal und sichtbar getestet
Datum: 2026-05-12

## Ziel

Challenge-Missionen wurden an denselben internen Economy-Pfad vorbereitet, der bereits fuer Tagesmissionen, Wochenmissionen und Abenteuer genutzt wird.

## Geaenderte / neue Dateien

- `app/missionen/challenge/serverChallengeEconomyApi.ts`
- `app/missionen/challenge/challengeData.ts`
- `app/missionen/challenge/ChallengeMapPanel.tsx`
- `app/missionen/challenge/ChallengeDetailsPanel.tsx`
- `app/missionen/challenge/page.tsx`

## Was eingebaut wurde

- Challenge-Daten wurden aus `page.tsx` ausgelagert.
- Karten-UI wurde in `ChallengeMapPanel.tsx` ausgelagert.
- Detail-UI wurde in `ChallengeDetailsPanel.tsx` ausgelagert.
- `page.tsx` ist jetzt kleiner und nutzt die zentrale `AppSidebar`.
- Challenge nutzt jetzt servernahe Economy-Vorstufen:
  - `/api/economy/reward-preview`
  - `/api/economy/complete-mission`
  - `/api/economy/user-projection`
  - `/api/economy/buddy-sync-preview`
- Nach erfolgreicher Completion wird `clientBetaProjection` geschrieben, damit Dashboard/Buddy denselben Beta-Stand lesen koennen.
- Server-Preview kann Reward cappen, Review verlangen oder blockieren.

## Test durch Bernd

Bernd hat lokal ausgefuehrt:

```powershell
cd C:\wellfit\WellFit-now
git pull
npm run agent:code-inventory
npm run agent:quality-gate
npm run build
```

Ergebnis:

- Code Inventory: PASS / Report erzeugt
- Scanned files: 429
- App routes: 30
- API routes: 9
- Economy code files: 18
- Quality Gate: PASS
- TODO index missing files: 0
- Firestore economy rules check: PASS
- Build: gruen
- TypeScript: gruen
- Static pages: 34/34

## Sichtbarer Live-/Beta-Test

Bernd hat `/missionen/challenge` sichtbar getestet:

- Dashboard Startpunkt: 238 interne Punkte
- Challenge-Route vorbereitet: Mathe-Speed
- Challenge pruefen & abschliessen geklickt
- Serverpfad meldete: Reward-Preview, Completion, Projection und Buddy-Sync-Preview genutzt
- Punkte stiegen von 238 auf 338 interne Punkte
- Dashboard zeigte danach 338 interne Punkte
- Zweiter Klick auf `Challenge pruefen & abschliessen` gab `Challenge bereits abgeschlossen: Mathe-Speed` aus
- Keine doppelte Punktegutschrift sichtbar

## Harte Grenzen

Nicht aktiviert:

- keine echten Token
- keine NFTs
- keine Wallets
- keine Auszahlungen
- keine echten Kaeufe
- keine Blockchain-Transfers
- keine finale Server-Persistenz
- keine harte Firestore-Sperre
- keine produktive 20m-Evidence-Entscheidung

## Offene Folgepunkte

- Buddy-Seite nach Challenge-Abschluss noch explizit live pruefen.
- Challenge-History/Favoriten spaeter an denselben Event-/History-Pfad anbinden.
- Finale Checkpoint-/20m-Evidence bleibt serverseitiger Folgeblock.
- Echte Ledger-/Audit-/Projection-Persistenz bleibt deaktiviert bis Server/Rules stabil sind.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/TODO_INDEX.md`, `todolist/CODEBASE_FEATURE_MAP.md`, `todolist/PROJECT_STRUCTURE.md` und diese Datei. Challenge ist jetzt economy-pfad-vorbereitet und lokal sichtbar getestet, aber noch nicht final serverpersistiert. Keine parallelen Challenge-Economy-Module bauen. Naechste Schritte muessen bestehende Economy-APIs, `clientBetaProjection`, Ledger-/Audit-/Projection-Drafts und Firestore-Hardening-Plaene weiterverwenden.