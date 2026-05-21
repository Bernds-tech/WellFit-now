# Beta-1 Live Pages Readiness Plan

Stand: 2026-05-21  
Status: planning_only

## 1) Ziel

Die Beta-1-Live-Seiten fuer die erste geschlossene Testgruppe (25-50 Nutzer:innen) sauber, risikoarm und guardrail-konform vorbereiten - ohne Runtime-Implementierung in diesem PR.

## 2) Seiten

- Marktplatz
- Leaderboard
- Punkte-Shop
- Analytics & Stats

## 3) Readiness-Tabelle pro Seite

| Seite | routeCandidate | purpose | beta1AllowedData | forbiddenData | authorityBoundary | neededComponents | neededReadProjections | neededAdminInputs | testsNeeded | riskLevel | readyForRuntimeImplementation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Punkte-Shop | `/shop` oder `/dashboard/shop` | Beta-1 XP-basierte Reward-Einloesung | eigene XP, freigegebene Item-Previews, serverseitig freigegebene Availability Flags | Echtgeld, IAP, Token/NFT/Blockchain, Cashout, sensitive child/profile Rohdaten | Kaufabschluss nur serverseitig; Client nur intent/read | bestehende Shop-UI-Bloecke, Hinweisbanner fuer Beta-Limits, Audit-Hinweis | wallet/xp balance, catalog preview, purchase intent status read-only | Item-Katalogpflege, XP-Kostenpflege, Sichtbarkeitsflags | UI smoke, read projection checks, negative tests fuer verbotene Zahlungswege | medium | no |
| Leaderboard | `/leaderboard` oder `/dashboard/leaderboard` | Fortschritt/Challenge Ranking als read-only Ansicht | XP-/Mission-/Checkpoint-Projections, opt-in/opt-out Flags, pseudonymisierte Anzeigenamen | Child public profile details, genaue Standortdaten, Health-Rohdaten, private guardian data | Client read-only; finale Ranking-Authority serverseitig | leaderboard list, privacy labels, opt-out states | ranking summary, mission checkpoint counts, privacy-safe profile label | Moderations-/visibility Regeln, opt-out Verwaltung | privacy tests, opt-out tests, projection consistency tests | high | no |
| Analytics & Stats | `/analytics` oder `/dashboard/stats` | Eigene Aktivitaets-/Lernstatistik fuer Tester | own-user stats, anonymisierte aggregates, consent-safe trends | personenbezogene Rohdaten anderer, child/location raw, health diagnosis data | Client read-only; Aggregation/Filter serverseitig definiert | charts/cards, consent notes, fallback states | own stats projection, aggregate snapshot projection | KPI definitionen, aggregation windows, privacy wording | consent wording checks, data minimization tests, ui smoke | high | no |
| Marktplatz (Preview) | `/marketplace` oder `/dashboard/marketplace-preview` | Beta-Placeholder fuer spaetere Richtung, ohne Handel | statische Preview-Inhalte, roadmap-safe Teaser, disabled actions | NFT listing, token trading, buy/sell money flows, cashout, wallet connect | keine Handelsauthority; nur informational preview | placeholder cards, disabled CTA, explicit beta disclaimer | optional static projection only | Content moderation/wording Freigabe | disclaimer checks, click guard tests | medium | no |

## 4) Guardrails

### Marktplatz
- In Beta 1 **kein NFT-Marktplatz**.
- Kein echtes Kaufen/Verkaufen mit Geld.
- Nur interne Preview / spaeterer Platzhalter.
- Kein Cashout.
- Kein Token-Handel.

### Leaderboard
- Nur XP-/Mission-/Checkpoint-Read-Projections.
- Keine Child Public Profiles.
- Keine sensiblen Standortdaten.
- Opt-out/Privacy beachten.

### Punkte-Shop
- Nur WellFit-XP.
- Kein Echtgeld.
- Keine IAP.
- Keine NFT/Token.
- Kauf final nur serverseitig.

### Analytics & Stats
- Nur eigene User-Stats oder anonymisierte Aggregates.
- Keine personenbezogenen Rohdaten.
- Keine Kinder-/Location-Rohdaten.
- Keine Gesundheitsdiagnosen.

## 5) Prioritaet

1. Punkte-Shop
2. Leaderboard
3. Analytics & Stats
4. Marktplatz nur als Beta-Placeholder/Preview, kein echter Marketplace

## 6) Stop-Bedingungen

Sofort stoppen und als Blocker dokumentieren, wenn:

- echte Payments/Token/NFT benoetigt waeren
- Child Public Data benoetigt waere
- neue Server Authority benoetigt waere
- Firestore Rules Aenderungen benoetigt waeren
- PII/Aggregation unklar bleibt
