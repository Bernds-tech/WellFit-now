# WellFit Adaptive User Insight and Personalization Agent

Status: Planung / Governance-only  
Stand: 2026-05-14  
Register: `project-register/adaptive-user-insights.json`

## Ziel

Der Adaptive User Insight and Personalization Agent ist ein Planungsrahmen fuer kuenftige WellFit-Agenten. Er beschreibt, wie WellFit aus **aggregierten** Feedback-, Gameplay- und Engagement-Signalen lernen kann, ohne Rohdaten, sensible Daten oder identifizierende Nutzerinformationen an Codex-/AI-Agenten weiterzugeben.

Dieser Rahmen darf nur Empfehlungen erzeugen fuer:

- adaptive Missionen,
- Buddy-Ton und Buddy-Verhalten,
- Schwierigkeit und Session-Laenge,
- Produktverbesserungen,
- sichere Governance-Folgeaufgaben.

Er darf **keine** Live-Tracking-Funktion aktivieren, keine Drittanbieter-Analytics einfuehren und keine Runtime-Produktlogik veraendern.

## Quellen und Anschluss an bestehende Architektur

Der Rahmen erweitert die bestehende User-Feedback-, Product-Readiness-, Work-Map- und Agent-Governance-Struktur. Er ersetzt keine bestehende Architektur und erstellt kein paralleles System.

Fuehrende Quellen:

- `project-register/adaptive-user-insights.json`
- `project-register/user-feedback.json`
- `project-register/feedback-analytics-loop.json`
- `project-register/product-readiness.json`
- `project-register/agent-task-queue.json`
- `project-register/risk-classifier.json`
- `project-register/definition-of-done.json`
- `project-register/agent-workflows.json`
- `docs/architecture/USER_FEEDBACK_DATABASE_FLOW.md`
- `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`

## Planning-only: keine Live-Auswertung

`project-register/adaptive-user-insights.json` hat `activationState: planning_only`. Das bedeutet:

- keine Produktions-Writes,
- keine neuen Tracker,
- keine Drittanbieter-Analytics,
- keine Rohdatenverarbeitung durch Agenten,
- keine automatische Personalisierung in Runtime-Flows,
- keine Aenderung an Rewards, Token, Wallets, Payments, Mission Completion, Anti-Cheat, Health, Child, Location, Privacy oder Compliance-Logik.

Kuenftige Aktivierung waere ein separater, menschlich gepruefter Privacy-, Security-, Consent- und Product-Readiness-Schritt.

## Wie WellFit aus aggregiertem Verhalten lernt

Kuenftige Agenten duerfen nur mit unterdrueckten, anonymisierten und aggregierten Signalen arbeiten. Beispiele:

- Missions-Abschlussrate nach Modul,
- Missions-Abbruchrate nach Modul,
- Favorite-/Repeat-Nutzung als Zaehler,
- aggregiertes Schwierigkeitsfeedback,
- Routen-/Modul-Zufriedenheit als Bucket,
- Feature-Request-Cluster,
- anonymisierte Sentiment-Buckets,
- Buddy-Interaktionszaehler nach sicherer Kategorie,
- aggregierte Friktionskategorien,
- grobe Device-Class,
- grobe Zeitfenster-Praeferenz,
- Lern-/Spielstil-Labels, falls sie aus nicht-sensitivem Verhalten abgeleitet sind.

Agenten sehen keine Einzelereignisse, keine Nutzer-IDs, keine Rohtexte und keine sensiblen Felder. Kleine Gruppen werden durch Mindest-Schwellen unterdrueckt.

## Personalisierung ohne sensible Rohdaten

Personalisierung darf nur ueber kontrollierte Dimensionen vorgeschlagen werden:

- Motivation: gentle, playful, competitive, educational, social
- Challenge-Level: easier, balanced, harder
- Missionspraeferenz: indoor, outdoor, camera, AR, quiz, movement, family, solo
- Buddy-Ton: calm, funny, coach, explorer, mentor
- Session-Laenge: short, medium, long
- Friktionsgruende: too hard, too long, unclear, technical issue, privacy concern, low motivation

Diese Labels sind Planungs- und Empfehlungskategorien. Sie duerfen nicht als sensitive Profile, psychologische Zielgruppen oder versteckte Manipulationslogik genutzt werden.

## Mission-, Buddy- und Schwierigkeit-Anpassungen

### Missionen

Der Agent darf vorschlagen:

- kuerzere Varianten, wenn `too long` aggregiert auffaellt,
- leichtere Varianten, wenn Abbruchrate und `too hard` hoch sind,
- klarere Anleitungen, wenn `unclear` auffaellt,
- alternative nicht-Kamera-/nicht-Standort-Pfade, wenn Datenschutzbedenken auffallen,
- Indoor- oder Solo-Alternativen, wenn entsprechende Praeferenz-Buckets stark sind.

Der Agent darf nicht selbst Mission Completion, Rewards, Anti-Cheat oder Ledger-Entscheidungen aendern.

### Buddy

Der Agent darf vorschlagen:

- Buddy-Ton auf calm, funny, coach, explorer oder mentor auszurichten,
- erklaerende oder motivierende Hinweise zu verbessern,
- Friktion sicherer zu adressieren.

Der Agent darf nicht:

- manipulative psychologische Zielsteuerung nutzen,
- Nutzer schaemen oder unter Druck setzen,
- aus Verhalten sensible Schwachstellen ableiten,
- medizinische, kinderschutzbezogene oder privacy-sensitive Themen automatisieren.

### Schwierigkeit

Der Agent darf `easier`, `balanced` oder `harder` empfehlen, wenn Mindest-Samples erreicht sind und keine Safety- oder Fairness-Regel verletzt wird. Empfehlungen muessen immer reversibel, erklaerbar und menschlich pruefbar bleiben.

## Challenge- und Reward-Grenzen

Der Agent darf nur Vorschlaege fuer Pacing, Erklaerung und nicht-finanzielle Beta-UX machen. Er darf nicht direkt aendern:

- XP-/Punkte-/Reward-Autoritaet,
- Mission-Completion-Authority,
- Anti-Cheat,
- Token, NFT, Wallet, Payment, Staking, Payout, Betting oder Marketplace,
- finale Ledger-Entscheidungen.

High- oder Critical-Empfehlungen in diesen Bereichen muessen gestoppt und menschlich geprueft werden.

## Erklaerbarkeit

Jede Empfehlung muss enthalten:

1. genutzte aggregierte Signal-IDs,
2. Quelle/Register oder Architekturdatei,
3. angewendete Mindest-Sample-Schwelle,
4. betroffene Personalisierungsdimension,
5. Risiko-Level,
6. Human-Review-Status,
7. klare Begruendung in normaler Sprache,
8. explizite Bestaetigung, dass keine Rohdaten oder sensiblen Felder genutzt wurden.

Wenn ein Vorschlag nicht erklaert werden kann, darf er nicht an Agenten als umsetzbare Empfehlung gehen.

## Human-Approval-Gates

Menschliche Freigabe ist erforderlich, wenn:

- das Risiko `high` oder `critical` ist,
- Reward-, Economy-, Token-, NFT-, Wallet-, Payment-, Betting-, Mission-Completion- oder Anti-Cheat-Logik betroffen ist,
- Health-, Watch-, Child-, exact Location-, Camera-, Biometric-, Medical-, Privacy-, Consent-, Legal-, AGB-, Datenschutz-, Impressum- oder Compliance-Themen betroffen sind,
- ein neuer Tracker, Produktions-Write, Drittanbieter-Analytics oder Rohdatenprozess noetig waere,
- Mindest-Samples nicht erreicht werden,
- eine kleine Gruppe identifizierbar werden koennte,
- Rohtexte nur unredigiert vorliegen.

## Validierung

Die Planungs-Governance wird durch `scripts/wellfit-dev-agent/src/adaptive-user-insight-check.mjs` validiert und in `scripts/wellfit-dev-agent/src/quality-gate.mjs` eingebunden. Der Check prueft unter anderem:

- Register existiert und parst als JSON,
- `activationState` bleibt `planning_only`,
- erlaubte Aggregate sind vorhanden,
- verbotene Felder decken Health, Child, Location, Camera/Biometric, Identifikatoren und Payment/Token/Wallet ab,
- Mindest-Sample-Schwellen sind definiert,
- Erklaerbarkeit ist Pflicht,
- High/Critical-Human-Review ist definiert,
- agent-visible Summaries enthalten keine raw user identifiers.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/adaptive-user-insights.json`, `project-register/user-feedback.json`, `project-register/feedback-analytics-loop.json`, `project-register/product-readiness.json` und diese Datei. Nutze nur aggregierte, anonymisierte Signale oberhalb der Mindest-Schwellen. Erzeuge nur erklaerbare Empfehlungen. Aendere keine Runtime-Logik, keine Live-Tracker, keine Drittanbieter-Analytics und keine geschuetzten Health-, Child-, Location-, Camera-, Biometric-, Privacy-, Compliance-, Reward-, Token-, NFT-, Wallet- oder Payment-Bereiche ohne explizite menschliche Freigabe.
