# Admin Owner Claim Setup (lokal, sicher)

Dieses Setup-Skript setzt **einmalig** Firebase Custom Claims fuer einen bestehenden Auth-User:

- `admin: true`
- `agentRole: "owner"` (oder ENV-Override)

## Sicherheitsrahmen

- Server/Firebase Admin SDK bleibt Authority.
- Keine Frontend-Authority.
- Keine Runtime-Produktlogik wird geaendert.
- Keine UID, E-Mail, Tokens oder Secrets im Repository speichern.
- Keine Service-Account-JSONs committen.

## Voraussetzungen

- Node.js lokal verfuegbar
- Firebase Credentials ueber **Application Default Credentials** oder `GOOGLE_APPLICATION_CREDENTIALS`
- Ziel-User existiert bereits in Firebase Auth

## PowerShell Ablauf

```powershell
cd C:\wellfit\WellFit-now
$env:WELLFIT_OWNER_UID="..."
$env:WELLFIT_OWNER_ROLE="owner"
node scripts/admin/set-owner-claim.mjs
```

Hinweis:

- `WELLFIT_OWNER_UID` ist Pflicht.
- `WELLFIT_OWNER_ROLE` ist optional (Default: `owner`).

## Verifikation im Admin-Center

Danach:

1. Admin-Center oeffnen
2. Admin abmelden
3. Mit Google anmelden
4. Strg+F5
5. Pruefen:
   - `agentRoleClaim: owner`
   - `adminCallableAuthReady: true`
