# WellFit Knowledge Core

Status: `reference_orientation`
Updated: 2026-05-17
Scope: Produkt- und Architekturorientierung ohne Runtime-Freigabe

## Zweck und Quellenprinzip

Der Knowledge Core ist eine kurze, referenzierende Orientierung fuer Produkt-, Architektur- und Agentenarbeit. Er buendelt keine neuen Produktentscheidungen und ersetzt keine bestehenden Register, TODOs, Sicherheitsplaene oder Review-Prozesse.

Fuehrende Quellen fuer Details bleiben:

- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `project-register/product-rules.json`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`

## Regel: Orientierung ist keine Runtime-Freigabe

Dieser Knowledge Core dient als Navigations- und Lernanker. Er ist **keine alleinige Freigabe** fuer Runtime-Aenderungen, Produktlogik, Reward-Autoritaet, Mission-Completion, Datenverarbeitung, Token-/Wallet-/Payment-Funktionen, Legal-Texte, Unity-/AR-Verhalten oder Deployments.

Jede Runtime-Aenderung braucht weiterhin die jeweils einschlaegigen Quellen, Register, AGENTS-Regeln, Sicherheitsgrenzen, Tests/Checks und explizite Review- bzw. Freigabeplanung.

## Produktvision

WellFit wird als Move-Learn-Social-Earn-Plattform verstanden, die Bewegung, Gesundheit, Lernen, Gamification, KI-Begleitung, Community, Missionen und spaetere Blockchain-/Token-Themen in kleinen, sicheren Ausbaustufen zusammenfuehrt. Details und Prioritaeten stehen im Master-Prompt und im aktuellen Projektstatus.

Referenzen:

- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/CURRENT_PROJECT_STATE.md`

## Zielgruppen

Die Zielgruppen sind aus den bestehenden Produktmodulen abzuleiten: Nutzerinnen und Nutzer der Beta-App, mobile Touch-First-Nutzung, Lern-/Bewegungs- und Community-Szenarien, spaetere B2B-/Partnerfaelle sowie kuenftige AR-/Unity- und Economy-Ausbaustufen. Konkrete Zielgruppenentscheidungen sollen nicht hier dupliziert werden, sondern aus Feature-Register, Statusdateien und kuenftigen Produktbriefings referenziert werden.

Referenzen:

- `project-register/features.json`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/CODEBASE_FEATURE_MAP.md`

## Kernmodule

Der aktuelle Kern umfasst vor allem Landing/Register, Dashboard, Missionen, Buddy, Mobile-Web, Analytics, Punkte-Shop, Marktplatz-Placeholder, Legal/Hilfe und Economy-Preview-APIs. Die verbindliche Modul-, Routen- und API-Uebersicht liegt in Feature-Map und Feature-Register.

Referenzen:

- `todolist/CODEBASE_FEATURE_MAP.md`
- `project-register/features.json`

## Buddy-Rolle

Der Buddy ist als emotionaler Guide, Begleiter und Lern-/Motivationsanker vorgesehen. Er darf Hinweise geben, Dialoge fuehren und Vorschlaege begleiten, aber keine finalen Rewards, XP, Mission-Completion, Anti-Cheat-Entscheidungen oder Economy-Auswirkungen autorisieren.

Referenzen:

- `project-register/product-rules.json`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/CURRENT_PROJECT_STATE.md`

## Missionen

Missionen sind ein zentrales Beta-Modul fuer Bewegung, Lernen, Fortschritt, Challenge-/Abenteuer- und mobile Nutzung. Bestehende Missionen und Mission-APIs bleiben preview-/beta-orientiert, bis Completion, Evidence, Anti-Cheat und Reward-Autoritaet serverseitig und reviewt abgesichert sind.

Referenzen:

- `todolist/CODEBASE_FEATURE_MAP.md`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/CURRENT_PROJECT_STATE.md`

## Interne Punkteoekonomie

Die aktuelle Oekonomie ist als interne Punkte-/XP-/Preview- und Draft-Struktur zu verstehen. Punkte-Shop, RewardPreview, SpendPreview, HealthPreview, UserProjection und Persistence-Status duerfen Orientierung und Beta-UX liefern, aber keine echten Token-, NFT-, Wallet-, Payment-, Payout- oder finalen Ledger-Aktionen ersetzen.

Referenzen:

- `project-register/product-rules.json`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/CURRENT_PROJECT_STATE.md`

## Sicherheitsgrenzen

Wichtige Grenzen betreffen insbesondere Client-Autoritaet, Reward-/XP-/Completion-Entscheidungen, Token/NFT/Wallet/Payment, Health-/Watch-/Location-/Camera-/Child-/Privacy-/Legal-Themen, PvP-/Betting-/Payout-Mechaniken, Unity-/AR-Isolation und den Schutz bestehender TODO-/Planungsdateien.

Referenzen:

- `project-register/product-rules.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/CURRENT_PROJECT_STATE.md`

## Zukunftsthemen

Zukunftsthemen bleiben stufenweise und reviewpflichtig: echtes serverseitiges Ledger, gehaertete Mission-Completion, Anti-Cheat, sichere Reward- und Spend-Persistenz, Avatar-/Inventar-/Rare-Item-Logik, Marktplatz, Token-/NFT-/Wallet-Optionen, B2B-Module, Native/Unity-AR und weitere Agenten-/Governance-Schichten.

Referenzen:

- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`

## Offene Fragen

Offene Fragen sollen aus den bestehenden Status-, Feature- und Flow-Dateien fortgeschrieben werden, statt hier als neue Wahrheit zu entstehen. Besonders klaerungsbeduerftig bleiben Server-Autoritaet, Daten- und Consent-Grenzen, Economy-Persistenz, geschuetzte Themen, konkrete Beta-Zielgruppen, Release-Reihenfolge und welche Zukunftsthemen wann in Runtime uebergehen duerfen.

Referenzen:

- `todolist/CURRENT_PROJECT_STATE.md`
- `project-register/product-rules.json`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`

## Fragen, die der Concept Learning Agent Bernd stellen soll

Bernd soll keine Runtime-Aenderungen ableiten, sondern klaerende Konzeptfragen sammeln, zum Beispiel:

1. Welche Nutzergruppe hat fuer die naechste Beta-Etappe Prioritaet, und welche Quelle bestaetigt das?
2. Welches bestehende Modul oder Register ist fuer eine neue Idee die primaere Heimat?
3. Ist die Idee rein dokumentarisch, preview-only oder eine Runtime-Aenderung mit Reviewpflicht?
4. Beruehrt die Idee Rewards, XP, Mission-Completion, Anti-Cheat, Punkte-Shop oder Ledger-Autoritaet?
5. Beruehrt die Idee Token, NFT, Wallet, Payment, Auszahlung, Marktplatz, Betting oder finanzielle Aehnlichkeit?
6. Beruehrt die Idee Health, Watch, Standort, Kamera, Kinder-/Jugendschutz, Consent, Datenschutz oder Legal-Texte?
7. Welche bestehenden Routen, APIs oder Module aus Feature-Map und Feature-Register muessen erweitert werden, statt ein Parallelmodul zu bauen?
8. Welche Sicherheitsgrenze aus `product-rules.json` oder `mission-buddy-economy-flow.json` blockiert oder begrenzt die Idee?
9. Welche minimalen Tests, Checks oder Dokumentationsupdates waeren vor einer Umsetzung erforderlich?
10. Was ist die kleinste sichere naechste Aufgabe, die keine bestehende Autoritaetsgrenze ueberschreitet?

## Pflegehinweis

Wenn sich Produktvision, Feature-Register, Mission-Buddy-Economy-Flow oder Projektstatus aendern, soll diese Datei nur als kurzer Wegweiser angepasst werden. Detailwissen bleibt in den verlinkten Quellen.
