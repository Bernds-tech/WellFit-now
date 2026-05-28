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

## 2026-05-28 Admin-Center Login-Fallback und Inbox-ID-Fix

- Live-Stand nach Owner-Claim: Auth/Owner-Claim funktioniert (`authReady`, Firebase User, ID Token, Token Claims und `agentRoleClaim=owner` sind vorhanden; `adminCallableAuthReady=true`).
- Der Admin-Center Google-Login nutzt weiterhin Popup zuerst, faellt bei Popup-Closed/Popup-Blocked/Cancelled-Popup aber auf Redirect-Login zurueck und wertet das Redirect-Ergebnis beim Laden der Seite aus.
- Bei `auth/unauthorized-domain` zeigt die UI eine sichere Handlungsanweisung fuer Firebase Authentication -> Einstellungen -> Autorisierte Domains. UID, E-Mail und Tokens werden nicht angezeigt.
- Product-Evolution Inbox-Dokument-IDs werden slash-sicher erzeugt; originale `sourceDossierId`-Werte bleiben als Feld/Payload erhalten.
- Kein GitHub Runner, keine GitHub API, kein Branch/PR/Merge durch die App und kein Deploy in diesem PR.
- Nach Merge wegen `functions/lib/agentAdminRolesAudit.js` gezielt deployen: `firebase deploy --only functions:syncProductEvolutionFirstRunInbox --project wellfit-b7d27`; danach Frontend/Hosting-Deploy abwarten.
