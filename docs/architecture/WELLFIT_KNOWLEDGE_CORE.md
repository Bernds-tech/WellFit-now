# WellFit Knowledge Core

Status: `reference_orientation`
Updated: 2026-05-17
Scope: Produkt- und Architekturorientierung ohne Runtime-Freigabe
Companion register: `project-register/wellfit-knowledge-core.json`
Concept Learning Agent: `project-register/concept-learning-agent.json`

## Zweck und Quellenprinzip

Der Knowledge Core ist eine kurze, referenzierende Orientierung fuer Produkt-, Architektur- und Agentenarbeit. Er buendelt dokumentierte WellFit-Grundannahmen, verweist aber auf bestehende Quellen statt sie blind zu duplizieren. Er ersetzt keine bestehenden Register, TODOs, Sicherheitsplaene, Freigaben oder Review-Prozesse.

Fuehrende Quellen fuer Details bleiben:

- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `project-register/product-rules.json`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`

Maschinenlesbare Begleit- und Agentenquellen:

- `project-register/wellfit-knowledge-core.json`
- `project-register/concept-learning-agent.json`
- `project-register/concept-learning-questions.json`

## Regel: Orientierung ist keine Runtime-Freigabe

Dieser Knowledge Core dient als Navigations- und Lernanker. Er ist **keine alleinige Freigabe** fuer Runtime-Aenderungen, Produktlogik, Reward-Autoritaet, Mission-Completion, Datenverarbeitung, Token-/Wallet-/Payment-Funktionen, Legal-Texte, Unity-/AR-Verhalten oder Deployments.

Jede Runtime-Aenderung braucht weiterhin die jeweils einschlaegigen Quellen, Register, AGENTS-Regeln, Sicherheitsgrenzen, Tests/Checks und explizite Review- bzw. Freigabeplanung.

## WellFit Vision

WellFit wird als Move-Learn-Social-Earn-Plattform verstanden, die Bewegung, Gesundheit, Lernen, Gamification, KI-Begleitung, Community, Missionen und spaetere Blockchain-/Token-Themen in kleinen, sicheren Ausbaustufen zusammenfuehrt. Die Beta-Prioritaet bleibt: bestehende App-Struktur stabilisieren, Dashboard/Missionen/Buddy/mobile Nutzung vorbereiten und keine produktiven Wallet-, Payment- oder Token-Funktionen aktivieren.

Referenzen:

- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/CODEBASE_FEATURE_MAP.md`

## Move-Learn-Social-Earn Prinzip

- **Move:** Bewegung, Mobile-Web, Missionen, Tages-/Wochenmissionen, Abenteuer, Challenge- und Analysepfade bilden den aktuellen Bewegungsfokus.
- **Learn:** Lernen entsteht durch Buddy-Hinweise, Missionserklaerungen, Feedback, Fortschrittsanzeigen und spaetere kontextbezogene Inhalte.
- **Social:** Community-, Leaderboard-, Challenge- und Wettkampfideen sind vorhanden, muessen aber privacy-aware und ohne ungesicherte Einsaetze, Auszahlungen oder globale Nutzer-Dumps weiterentwickelt werden.
- **Earn:** Earn bedeutet in der Beta interne Punkte/XP, Preview-Rewards und Spend-Preview. Es bedeutet aktuell **keine** echten Token, NFTs, Wallets, Payments, Payouts, Trading- oder Cashout-Funktionen.

Referenzen:

- `project-register/features.json`
- `project-register/product-rules.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/CURRENT_PROJECT_STATE.md`

## Buddy-Rolle

Der Buddy ist als emotionaler Guide, Begleiter und Lern-/Motivationsanker vorgesehen. Er darf Hinweise geben, Dialoge fuehren, Fortschritt erklaeren und Vorschlaege begleiten. Er darf keine finalen Rewards, XP, Mission-Completion, Anti-Cheat-Entscheidungen oder Economy-Auswirkungen autorisieren.

Referenzen:

- `project-register/product-rules.json`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/CURRENT_PROJECT_STATE.md`

## Missionen

Missionen sind ein zentrales Beta-Modul fuer Bewegung, Lernen, Fortschritt, Abenteuer, Challenge- und mobile Nutzung. Bestehende Missionen und Mission-APIs bleiben preview-/beta-orientiert, bis Completion, Evidence, Anti-Cheat und Reward-Autoritaet serverseitig und reviewt abgesichert sind.

Referenzen:

- `todolist/CODEBASE_FEATURE_MAP.md`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/CURRENT_PROJECT_STATE.md`

## Challenges

Challenges und Wettkaempfe sind als soziale und motivierende Erweiterung der Missionen angelegt. Sie duerfen in der aktuellen Orientierung nur als Beta-/Preview- oder Guardrail-Themen verstanden werden: keine echten Wetten, Auszahlungen, Cashouts, finalen Client-Rewards, Token-Rewards oder NFT-Rewards. Challenge-Fortschritt, Leaderboards und Wettbewerbsideen brauchen Datenschutz-, Anti-Cheat-, Evidence- und Server-Autoritaetspruefung, bevor daraus verbindliche Produktlogik entsteht.

Referenzen:

- `project-register/features.json`
- `project-register/product-rules.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `todolist/CURRENT_PROJECT_STATE.md`

## Interne Punkte/XP

Die aktuelle Oekonomie ist als interne Punkte-/XP-/Preview- und Draft-Struktur zu verstehen. Punkte-Shop, RewardPreview, SpendPreview, HealthPreview, UserProjection und Persistence-Status duerfen Orientierung und Beta-UX liefern, aber keine echten Token-, NFT-, Wallet-, Payment-, Payout- oder finalen Ledger-Aktionen ersetzen.

Referenzen:

- `project-register/product-rules.json`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/CURRENT_PROJECT_STATE.md`

## Spaetere Token/NFT-Grenzen

Token, NFTs, Wallets, WFT, Marktplatz-Trading, Auszahlungen, echte Kaeufe und Cashout bleiben Zukunftsthemen und sind im MVP/Beta-Kontext nicht aktiv. Spaetere Token-/NFT-Schritte duerfen erst nach stabiler interner Punkteoekonomie, serverseitiger Autoritaet, Ledger/Audit, rechtlicher Pruefung, Sicherheitsplanung und expliziter Freigabe vorbereitet werden. Marktplatz- und Item-Ideen bleiben bis dahin Placeholder, interne Sinks oder Guardrail-Dokumentation.

Referenzen:

- `project-register/product-rules.json`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/CURRENT_PROJECT_STATE.md`

## Safety Boundaries

Wichtige Grenzen betreffen insbesondere Client-Autoritaet, Reward-/XP-/Completion-Entscheidungen, Token/NFT/Wallet/Payment, Health-/Watch-/Location-/Camera-/Child-/Privacy-/Consent-/Legal-Themen, PvP-/Betting-/Payout-Mechaniken, Unity-/AR-Isolation und den Schutz bestehender TODO-/Planungsdateien. Der sichere Standard ist: Frontend darf vorschlagen und previewen; finale Autoritaet gehoert auf serverseitige, reviewte und getestete Pfade.

Referenzen:

- `project-register/product-rules.json`
- `project-register/mission-buddy-economy-flow.json`
- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/CURRENT_PROJECT_STATE.md`

## Nutzergruppen

Die Nutzergruppen sind aus den bestehenden Produktmodulen abzuleiten: Beta-App-Nutzerinnen und -Nutzer, mobile Touch-First-Nutzung, Bewegungs-, Lern- und Community-Szenarien, Dashboard-/Analytics-Nutzung, spaetere B2B-/Partnerfaelle sowie kuenftige AR-/Unity- und Economy-Ausbaustufen. Konkrete Segmentprioritaeten sollen nicht hier erfunden werden, sondern ueber Feature-Register, Projektstatus, Entscheidungen oder Concept-Learning-Fragen bestaetigt werden.

Referenzen:

- `project-register/features.json`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `project-register/concept-learning-questions.json`

## Offene Produktfragen

Offene Fragen sollen aus den bestehenden Status-, Feature- und Flow-Dateien fortgeschrieben werden, statt hier als neue Wahrheit zu entstehen. Besonders klaerungsbeduerftig bleiben:

1. Welche Beta-Nutzergruppe hat als naechstes Prioritaet?
2. Welche Mission- und Challenge-Flows duerfen nur previewen, und welche brauchen zuerst Server-/Evidence-/Anti-Cheat-Arbeit?
3. Welche Daten- und Consent-Grenzen gelten fuer Health, Watch, Standort, Kamera, AR und Kinder-/Jugendschutz?
4. Wann und unter welchen Reviews darf interne Punkte-/XP-Persistenz von Draft/Preview zu echter Server-Autoritaet wechseln?
5. Welche Bedingungen muessen vor Token-, NFT-, Wallet-, Payment-, Marktplatz- oder Payout-Arbeit erfuellt sein?
6. Welche B2B-/Partner- oder Community-Annahmen sind bereits entschieden und welche muessen Bernd/Owner klaeren?
7. Welche bestehenden Module sollen erweitert werden, statt neue Parallelmodule zu bauen?

Referenzen:

- `todolist/CURRENT_PROJECT_STATE.md`
- `project-register/product-rules.json`
- `project-register/features.json`
- `project-register/mission-buddy-economy-flow.json`
- `project-register/concept-learning-agent.json`
- `project-register/concept-learning-questions.json`

## Verbindung zum Concept Learning Agent

Der Concept Learning Agent nutzt diesen Knowledge Core und die maschinenlesbare Begleitdatei als report-only Lernanker. Seine Aufgabe ist, dokumentierte Fakten mit Quellen zu lesen, Unklarheiten zu erkennen, Bernd gezielte Fragen vorzubereiten, genehmigte Antworten in erlaubte Planungs-/Registerziele zu ueberfuehren und daraus nur nach Admin-Freigabe kleine Follow-up-Aufgaben abzuleiten.

Diese Verbindung aktiviert keine Runtime-Logik, keine Personalisierung, keine Rewards, keine Mission-Completion, keine Protected-Data-Verarbeitung, keine Token-/Wallet-/Payment-Funktion und keine Deployments.

Referenzen:

- `project-register/concept-learning-agent.json`
- `project-register/wellfit-knowledge-core.json`
- `project-register/concept-learning-questions.json`


## Product Memory Agent Speicherziele

Der Product Memory Agent darf Produktwissen als Review- und Planungsdaten vorschlagen und strukturieren. Er verwendet die Memory-Typen Produktvision, Bernd-Entscheidungen, offene Fragen, bestätigte Antworten, Agent-Erkenntnisse, abgelehnte Vorschläge, Sicherheitsgrenzen und nächste empfohlene Tasks.

Erlaubte Speicherziele sind:

- `project-register/decisions.json`
- `project-register/agent-follow-ups.json`
- `project-register/concept-learning-questions.json`
- `project-register/wellfit-knowledge-core.json`
- `docs/architecture/WELLFIT_KNOWLEDGE_CORE.md`

Diese Speicherziele sind nicht ausführend. Der Agent darf Memory vorschlagen, quellenbasiert sortieren und Follow-up-Kandidaten formulieren, aber keine geschützte Runtime-Aktion automatisch auslösen.

Referenzen:

- `project-register/product-memory-agent.json`
- `docs/architecture/WELLFIT_PRODUCT_MEMORY_AGENT.md`

## Pflegehinweis

Wenn sich Produktvision, Feature-Register, Mission-Buddy-Economy-Flow oder Projektstatus aendern, soll diese Datei nur als kurzer Wegweiser angepasst werden. Detailwissen bleibt in den verlinkten Quellen. Die maschinenlesbare Datei `project-register/wellfit-knowledge-core.json` soll synchron zur Struktur dieser Markdown-Datei bleiben.

## KI-Fortsetzungs-Prompt

Wenn du hier weiterarbeitest, lies zuerst `AGENTS.md`, `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/CODEBASE_FEATURE_MAP.md`, `project-register/product-rules.json`, `project-register/features.json`, `project-register/mission-buddy-economy-flow.json`, `project-register/wellfit-knowledge-core.json` und `project-register/concept-learning-agent.json`. Aktualisiere diese Datei nur als kurzen Wegweiser fuer vorhandenes Produktwissen; Detailwissen bleibt in den verlinkten Quellen. Keine App Runtime, keine Nutzerprofilierung, keine Firestore-Regeln, keine Firebase Functions, keine UI-Ausfuehrung und keine geschuetzten Produktentscheidungen aktivieren.

## Beta-1 Canonical-Truth Verweis

- Fuer Entscheidungen in WellFit Beta 1 ist `project-register/wellfit-beta1-canonical-truth.json` die fuehrende Quelle.
- Dieses Knowledge Core Dokument bleibt ein Orientierungs- und Kontextdokument und ersetzt die Beta-1-Canonical-Truth nicht.
- Ergaenzend: `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md` und `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md`.

