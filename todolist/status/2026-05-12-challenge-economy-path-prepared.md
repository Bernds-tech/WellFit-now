# Challenge Economy Path vorbereitet

Status: umgesetzt / Build noch lokal zu pruefen
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

## Naechster lokaler Test

```powershell
cd C:\wellfit\WellFit-now
git pull
npm run agent:code-inventory
npm run agent:quality-gate
npm run build
```

Danach live testen:

- `/missionen/challenge` oeffnen
- Standort muss automatisch funktionieren
- Challenge-Route vorbereiten klicken
- Challenge pruefen & abschliessen klicken
- Punkte muessen sich in der lokalen Beta-Projektion aendern
- Dashboard und Buddy muessen denselben Stand lesen

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/TODO_INDEX.md`, `todolist/CODEBASE_FEATURE_MAP.md`, `todolist/PROJECT_STRUCTURE.md` und diese Datei. Challenge ist jetzt economy-pfad-vorbereitet, aber noch nicht final serverpersistiert. Keine parallelen Challenge-Economy-Module bauen. Naechste Schritte muessen bestehende Economy-APIs, `clientBetaProjection`, Ledger-/Audit-/Projection-Drafts und Firestore-Hardening-Plaene weiterverwenden.