# Firebase App Check Rollout für WellFit Beta 1

## Ziel

Firebase App Check ergänzt Authentifizierung, Firestore-Regeln, serverseitige Autorität, Geo-Prüfung und Abfragebudgets um eine weitere Herkunftsprüfung. App Check ersetzt keine Standortvalidierung und beweist nicht, dass GPS-Daten unverfälscht sind.

## Aktueller Codezustand

- Der Web-Client initialisiert App Check nur, wenn `NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY` gesetzt ist.
- Als Web-Provider wird reCAPTCHA Enterprise verwendet.
- Automatische Token-Aktualisierung ist aktiviert.
- Die Beta-1-Callables verwenden standardmäßig weiterhin die normale `onCall`-Signatur.
- Erst `BETA1_ENFORCE_APP_CHECK=true` aktiviert `enforceAppCheck: true` für die registrierten Beta-1-Callables.
- Lokale Builds und Emulatorläufe lassen beide Variablen leer beziehungsweise `false`.
- Replay Protection wird nicht global eingeschaltet, weil sie zusätzliche Latenz verursacht und nur für ausgewählte Hochrisiko-Endpunkte separat bewertet werden soll.

## Sichere Rollout-Reihenfolge

1. **Web-App registrieren**
   - Die produktive WellFit-Web-App in Firebase App Check registrieren.
   - Einen reCAPTCHA-Enterprise-Site-Key für die tatsächlichen Produktionsdomains konfigurieren.
   - Keine geheimen Server-Schlüssel als `NEXT_PUBLIC_` Variable verwenden.

2. **Client zuerst ausrollen**
   - `NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY` in der Hosting-/Deployment-Umgebung setzen.
   - `BETA1_ENFORCE_APP_CHECK=false` beibehalten.
   - Client ausrollen und sicherstellen, dass normale Login-, Mission-, Wallet-, Standort- und Admin-Abläufe funktionieren.

3. **Metriken beobachten**
   - App-Check-Metriken für gültige, ungültige und fehlende Tokens prüfen.
   - Web, installierte/PWA-Nutzung und alle künftig unterstützten Mobile-Clients getrennt bewerten.
   - Supportfälle, Browserkompatibilität und Unternehmensnetzwerke berücksichtigen.

4. **Enforcement freigeben**
   - Erst nach dokumentierter Freigabe `BETA1_ENFORCE_APP_CHECK=true` in der Functions-Umgebung setzen.
   - Functions kontrolliert deployen.
   - Kritische Flows unmittelbar erneut testen.

5. **Nachkontrolle und Rückfallplan**
   - Fehlerraten und blockierte legitime Clients überwachen.
   - Bei einem Rolloutproblem Enforcement wieder auf `false` setzen; Auth-, Ledger-, Geo- und Firestore-Schutz bleiben unabhängig davon aktiv.

## Nicht durch App Check gelöste Risiken

- manipulierte oder simulierte GPS-Koordinaten;
- kompromittierte oder gerootete Endgeräte;
- legitime Clients, die automatisiert missbraucht werden;
- fachliche Betrugslogik innerhalb eines gültigen Benutzerkontos;
- Replay-Risiken bei besonders sensiblen Einzelaktionen.

Diese Risiken werden weiterhin durch serverseitige Entfernungsprüfung, Evidence-Bindung, deterministische Idempotenz, WFXP-Ledger, Review-Prozesse, Query-Budgets und spätere gerätespezifische Attestierungs- beziehungsweise Anti-Fraud-Maßnahmen begrenzt.

## Offizielle Referenzen

- [Firebase App Check für Web mit reCAPTCHA Enterprise](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [App Check für Callable Functions und Replay Protection](https://firebase.google.com/docs/app-check/cloud-functions)
