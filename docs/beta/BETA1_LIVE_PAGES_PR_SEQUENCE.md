# BETA1 Live Pages PR Sequence

Stand: 2026-05-21  
Status: planning_only

## PR 1 - Design Foundation Scope

- Branch: `runtime/beta1-professional-ui-foundation`
- Ziel: gemeinsame UI-Patterns fuer Cards/Tabellen/Badges/Sections im professionellen Beta-1-Stil.
- erlaubte Dateien: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`.
- verbotene Dateien: `functions/**`, `functions/lib/**`, `functions/test/**`, `firestore.rules`, `firebase.json`, `.github/**`, `native/**`, `public/**`.
- benoetigte Checks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:validate`.
- Stop-Bedingungen: stop bei Bedarf an Functions/Rules/Deploy/Secrets oder Runtime-Authority.
- Design-Ziel: weniger verspielt, bessere Typografie, klarere CTA-Hierarchie, reduzierte visuelle Last.
- Sicherheitsgrenzen: keine Token/NFT/Payment/Cashout/Blockchain-Funktionen; keine Pilotfreigabe.

## PR 2 - Punkte-Shop Runtime Slice

- Branch: `runtime/beta1-points-shop-page`
- Ziel: Punkte-Shop Route + Read-Projections + request-intent UI (WFXP-only, keine Client-Final-Authority).
- erlaubte Dateien: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`.
- verbotene Dateien: `functions/**`, `firestore.rules`, `firebase.json`, `.github/**`, `package*.json`, `native/**`.
- benoetigte Checks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:quality-gate`.
- Stop-Bedingungen: stop wenn neue Functions/Rules fuer finale Authority erforderlich sind.
- Design-Ziel: professioneller Shop ohne Casino-Optik, klare Preise/Verfuegbarkeit/Status.
- Sicherheitsgrenzen: kein Echtgeld, kein IAP, kein NFT/Token/WFT/SUI, kein Cashout.

## PR 3 - Leaderboard Runtime Slice

- Branch: `runtime/beta1-leaderboard-readonly`
- Ziel: privacy-safe read-only ranking/progress view auf Projektionen.
- erlaubte Dateien: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`.
- verbotene Dateien: `functions/**`, `firestore.rules`, `firebase.json`, `.github/**`, `native/**`.
- benoetigte Checks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:validate`.
- Stop-Bedingungen: stop bei fehlendem Opt-out oder no-public-child-profile Sicherung.
- Design-Ziel: sachliche Tabelle/Karten statt "Gewinner-Casino".
- Sicherheitsgrenzen: keine sensiblen Standortdaten, keine oeffentlichen Kinderprofile, keine Client-Authority.

## PR 4 - Analytics & Stats Runtime Slice

- Branch: `runtime/beta1-analytics-stats-own-view`
- Ziel: eigene Stats/Progress und anonymisierte Aggregates ohne Rohdaten/Diagnose.
- erlaubte Dateien: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`.
- verbotene Dateien: `functions/**`, `firestore.rules`, `firebase.json`, `.github/**`, `native/**`.
- benoetigte Checks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:quality-gate`.
- Stop-Bedingungen: stop bei Diagnose-Risiko oder Bedarf an sensiblen Raw-Daten.
- Design-Ziel: ruhiges KPI-Dashboard mit klarer Lesbarkeit.
- Sicherheitsgrenzen: keine Health-Diagnose, keine Child-/Location-Rohdaten, keine fremden Rohdaten.

## PR 5 - Marktplatz Preview Runtime Slice

- Branch: `runtime/beta1-marketplace-preview-placeholder`
- Ziel: Placeholder/Preview ohne Handel.
- erlaubte Dateien: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`.
- verbotene Dateien: `functions/**`, `firestore.rules`, `firebase.json`, `.github/**`, `native/**`.
- benoetigte Checks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:validate`.
- Stop-Bedingungen: stop wenn Buy/Sell, Wallet Connect, NFT/Token oder Cashout impliziert wird.
- Design-Ziel: seriöser "kommt spaeter" Konzeptbereich.
- Sicherheitsgrenzen: kein echter Handel, kein NFT/Token, kein Cashout, kein Wallet Connect.

## Reihenfolge-Empfehlung

1. `runtime/beta1-professional-ui-foundation`
2. `runtime/beta1-points-shop-page`
3. `runtime/beta1-leaderboard-readonly`
4. `runtime/beta1-analytics-stats-own-view`
5. `runtime/beta1-marketplace-preview-placeholder`
