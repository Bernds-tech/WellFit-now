# CODEX PROMPT - Beta1 Points Shop Page

Branch: `runtime/beta1-points-shop-page`  
Status: prompt_only

## Ziel

Punkte-Shop Seite fuer Beta-1 (WFXP-only) als Read/Intent-Slice umsetzen, ohne clientseitige finale Kaufautoritaet.

## Scope

- WFXP-only Darstellung
- request-intent UI erlaubt
- read-only fallback wenn Authority fehlt

## Verboten

- Echtgeld/IAP-Felder
- Token/NFT/WFT/SUI/Blockchain-Felder
- Cashout/Wallet-Connect
- Functions/Rules Aenderungen in diesem Slice

## Server-Authority

Finale Spend/Kaufentscheidung bleibt serverseitig. Client darf nur anzeigen und Request-Intent ausloesen.

## Stop-Bedingungen

- neue Functions noetig
- Firestore Rules Aenderung noetig
- Echtgeld-/Token-/NFT-/IAP-Anforderung taucht auf

## Checks

- `npm run lint`
- `npm run build`
- `git diff --check`
- `npm run agent:quality-gate`
