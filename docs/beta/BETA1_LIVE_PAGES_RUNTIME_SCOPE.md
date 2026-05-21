# BETA1 Live Pages Runtime Scope

Stand: 2026-05-21  
Status: planning_only

## Rahmen

Diese Datei definiert den Runtime-Scope fuer Beta-1 Live-Seiten als Planungsgrundlage. In diesem PR werden keine Runtime-Seiten implementiert und keine globalen Styles angepasst.

## 1) Punkte-Shop

- routeCandidate: `/shop` oder `/dashboard/shop`
- Ziel der Seite: WFXP-basierte Einloesung in professionellem Shop-Rahmen, ohne Echtgeld- oder Token-Erwartung.
- Beta-1 erlaubte Daten: eigener WFXP-Stand, serverseitig freigegebene Item-Previews, Verfuegbarkeitsstatus, request-intent Status.
- verbotene Daten: Echtgeld-/IAP-Felder, Token/NFT/WFT/SUI/Blockchain-Felder, Cashout-Felder, sensitive Kinder- oder Standortdaten.
- UI-Komponenten: Shop-Header, Preis-/Verfuegbarkeitskarten, Katalogliste, Status-Badge, intent-Hinweis.
- Read-Projections: `walletBalanceProjection`, `shopCatalogProjection`, `shopIntentStatusProjection`.
- Server-Authority-Anforderungen: finaler Spend/Kauf ausschliesslich serverseitig; Client darf nur anzeigen + Kaufwunsch ausloesen.
- Firestore Rules Bedarf: bestehende read-guards + write-block fuer finale Authority auf Clientseite.
- Functions Bedarf: keine neuen Functions in diesem PR; falls finale Spend-Authority fehlt, im Runtime-PR nur read-only/intent-only.
- Risiko: mittel bis hoch (falsche Authority-Signale, Payment-Missverstaendnisse).
- erster Runtime-PR: `runtime/beta1-points-shop-page`.
- Stop-Bedingungen: stop bei Bedarf an neuen Functions/Rules, Echtgeld-/Token-Feldern oder clientseitiger finaler Authority.
- Design-Richtung: professioneller Shop mit klaren Preisen, Status und Verfuegbarkeit, ohne Casino-Optik.

## 2) Leaderboard

- routeCandidate: `/leaderboard` oder `/dashboard/leaderboard`
- Ziel der Seite: privacy-safe read-only Fortschrittsvergleich auf XP/Mission/Checkpoint-Basis.
- Beta-1 erlaubte Daten: XP/Mission/Checkpoint-Projections, pseudonymisierte Anzeigenamen, opt-out Flags.
- verbotene Daten: oeffentliche Kinderprofile, sensitive Standortdaten, Rohdaten zu Gesundheit, private Guardian-Daten.
- UI-Komponenten: professionelle Tabellen/Karten, privacy labels, opt-out states, ranks + trend badges.
- Read-Projections: `leaderboardProjection`, `missionCheckpointProjection`, `privacyOptOutProjection`.
- Server-Authority-Anforderungen: read-only Client; Ranking-Definition + Aggregation serverseitig.
- Firestore Rules Bedarf: read nur fuer erlaubte projections; kein client write fuer ranking authority.
- Functions Bedarf: keine neuen Functions in diesem PR; Runtime-PR stoppt bei fehlender projection authority.
- Risiko: hoch (Privacy/Child-Safety/Opt-out).
- erster Runtime-PR: `runtime/beta1-leaderboard-readonly`.
- Stop-Bedingungen: stop bei fehlendem Opt-out, fehlenden Privacy-Guards, no-public-child-profile Konflikten.
- Design-Richtung: sachliche Ranking-Tabelle/Karten statt Gewinner-/Jackpot-Inszenierung.

## 3) Analytics & Stats

- routeCandidate: `/analytics` oder `/dashboard/stats`
- Ziel der Seite: eigene Fortschritts-/Aktivitaetsansicht fuer Erwachsene und Guardian-Kontexte.
- Beta-1 erlaubte Daten: eigene Stats, anonymisierte Aggregates, mission/activity consistency indicators.
- verbotene Daten: Gesundheitsdiagnosen, Rohdaten anderer Nutzer, Kinder-Rohdaten, Standort-Rohdaten.
- UI-Komponenten: KPI cards, trend modules, activity consistency chart, explanatory notes.
- Read-Projections: `ownStatsProjection`, `anonymizedAggregateProjection`, `missionConsistencyProjection`.
- Server-Authority-Anforderungen: Datenminimierung + Aggregation serverseitig definiert; Client nur read.
- Firestore Rules Bedarf: read-begrenzte projektionen, kein clientseitiger raw data Zugriff.
- Functions Bedarf: keine neuen Functions in diesem PR; Runtime-PR stoppt wenn projections/consent boundaries fehlen.
- Risiko: hoch (Data protection, medical interpretation risk).
- erster Runtime-PR: `runtime/beta1-analytics-stats-own-view`.
- Stop-Bedingungen: stop bei Diagnose-Interpretation, raw-data Bedarf oder fehlender Consent-Grenze.
- Design-Richtung: modernes Dashboard, ruhige KPI-Darstellung, klarer Nutzen statt spielerische Reizueberflutung.

## 4) Marktplatz Preview

- routeCandidate: `/marketplace-preview` oder `/dashboard/marketplace-preview`
- Ziel der Seite: seriöser Platzhalter/Konzeptbereich fuer spaetere Richtung.
- Beta-1 erlaubte Daten: statische Preview-Inhalte, Roadmap-Hinweise, deaktivierte CTA-Erklaerungen.
- verbotene Daten: Buy/Sell, Trading, NFT/Token/WFT/SUI, Cashout, Wallet Connect, Echtgeldfluss.
- UI-Komponenten: Preview cards, disabled action modules, "kommt spaeter" Hinweise.
- Read-Projections: optional statische content projection; keine trading projections.
- Server-Authority-Anforderungen: keine Handelsauthority; keine Kauf-/Verkaufspfade.
- Firestore Rules Bedarf: keine Handelswrites; optional read-only content scope.
- Functions Bedarf: keine Functions in diesem PR und keine Handels-Functions im Beta-1-Scope.
- Risiko: mittel (Fehlinterpretation als echter Marketplace).
- erster Runtime-PR: `runtime/beta1-marketplace-preview-placeholder`.
- Stop-Bedingungen: stop wenn echter Handel, Wallet Connect oder Token/NFT-Integration impliziert wird.
- Design-Richtung: neutraler Konzeptbereich ohne Hype-/Crypto-Semantik.

## Prioritaet der Runtime-Slices

1. Punkte-Shop
2. Leaderboard
3. Analytics & Stats
4. Marktplatz Preview

## Globale Sicherheitsgrenzen

- WellFit-XP bleibt internal only.
- Keine Blockchain-/WFT-/SUI-Implementierung.
- Keine NFTs, kein Cashout, kein Real-Money-Shop, kein IAP.
- Kein DePIN, kein PvP-Stake, kein echter Marktplatz-Handel.
- Keine oeffentlichen Kinderprofile, kein Child Standalone Login.
- Keine clientseitige finale Autoritaet fuer XP/Mission/Shop/Inventory/Admin-Flows.
- Keine Pilotfreigabe ohne Human/Manual Evidence.

## Update 2026-05-21 - Runtime Slice umgesetzt: Punkte-Shop

- Branch: `runtime/beta1-points-shop-page`
- Route umgesetzt: `/shop` (`app/shop/page.tsx`) als professioneller Beta-1 Punkte-Shop.
- Datenbasis: read-only Projections aus `xpWallets`, `shopItems(status=published)`, `userInventory(ownerUserId=currentUser)` via bestehende Client-Read-Helpers.
- Shop-CTA bleibt intent-only (`Anfrage vormerken`) und deaktiviert; keine clientseitige finale Spend-/Purchase-Authority.
- Keine neuen Firebase Functions, keine Firestore Rules-Aenderung, keine Server-Authority-Aenderung.
- Next recommended branch: `runtime/beta1-leaderboard-readonly`.
