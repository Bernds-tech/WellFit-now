# Local Admin Owner Claim Setup (einmalig)

Dieses Setup setzt **lokal** Firebase Auth Custom Claims für den Owner-User.
Es werden **keine** UID, E-Mail, Tokens, Secrets oder Service-Account-Dateien ins Repository geschrieben.

## Ziel-Claims

```json
{
  "admin": true,
  "agentRole": "owner"
}
```

## Voraussetzungen

1. In der Firebase Console zu **Authentication** wechseln.
2. Den gewünschten User öffnen und die **UID** kopieren.
3. Lokal Admin-Credentials bereitstellen:
   - entweder per `GOOGLE_APPLICATION_CREDENTIALS` (Pfad zu Service-Account-JSON)
   - oder per Application Default Credentials (ADC)
4. Sicherstellen, dass `firebase-admin` lokal im Projekt verfügbar ist (aktuell über `functions/package.json`).

## Ausführung (PowerShell)

```powershell
$env:WELLFIT_OWNER_UID="..."
$env:WELLFIT_OWNER_ROLE="owner"
node scripts/admin/set-owner-claim.mjs
```

Hinweise:
- `WELLFIT_OWNER_ROLE` ist optional, Standard ist `owner`.
- Das Script bricht ab, wenn `WELLFIT_OWNER_UID` fehlt.
- Das Script gibt keine vollständige UID aus (nur `UID vorhanden: ja`).

## Danach im Admin-Center

1. Admin abmelden.
2. Mit Google erneut anmelden.
3. `Strg+F5` ausführen.
4. Product-Evolution Inbox synchronisieren.

## Sicherheitsrahmen

- Nur lokales Helper-Script, keine Frontend-Authority.
- Server/Firebase Admin bleibt Authority.
- Keine Runtime-Produktlogik geändert.
- Keine Aktivierung von Token/NFT/Payment/SUI/WFT.
