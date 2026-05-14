# WellFit Adaptive User Insight Agent

Status: geplant / `planning_only` Governance  
Fuehrende Registry: `project-register/adaptive-user-insights.json`  
Validation: `scripts/wellfit-dev-agent/src/adaptive-user-insight-check.mjs`

## Zweck

Der Adaptive User Insight Agent ist eine reine Governance- und Planungsgrenze fuer spaetere, datenschutzarme Aggregate-Insights. Er darf keine Live-Tracking-Funktion aktivieren, keine Produktlaufzeitlogik aendern und keine Rohdaten in Agentenreports sichtbar machen.

Die Registry beschreibt, welche anonymen oder redigierten Aggregatsignale kuenftig fuer Planungsentscheidungen zu Missionen, Buddy-Ton, Schwierigkeit, Challenges und interner Reward-Balance diskutiert werden duerfen. Sie ersetzt keine bestehende Architektur und erweitert nur die vorhandenen Governance-Dateien rund um Feedback, Analytics, Research/Recommendation, Product Readiness und Agent Quality Gate.

## Aktivierungsgrenze

`activationState` muss `planning_only` bleiben. Jede spaetere Implementierung braucht eine separate explizite Freigabe mit Privacy-, Consent-, Retention-, Server-Authority- und Compliance-Review.

## Erlaubte Signale

Erlaubt sind nur anonyme Kohorten- oder Aggregatsignale oberhalb der Mindestschwellen, zum Beispiel:

- Mission-Completion- und Abbruchraten nach Kohorte
- Schwierigkeitsband-Verteilungen
- Buddy-Interaktionskategorien als Zaehldaten
- Challenge-Teilnahme als Aggregat
- manuell gepruefte und redigierte Feedback-Tags
- Accessibility- und Onboarding-Friction-Kategorien als Aggregat

## Verbotene Roh- und Sensitivdaten

Agenten duerfen keine Rohdaten sehen. Verboten sind insbesondere rohe Nutzernachrichten ohne manuelle Review/Redaktion, Namen, E-Mails, User IDs, Device IDs, exakte Standorte, Gesundheitsdaten, Kinder-/Minderjaehrigendaten, Kamera-/Gesichts-/Biometrie-/Rohsensordaten, medizinische Claims, Payment-/Token-/Wallet-Daten und exakte Tagesroutinen, die eine Person identifizieren koennten.

## Adaptionsregeln

- **Missionen:** Nur planning-only Empfehlungen fuer Themenmix, Friction oder Schwierigkeit; keine per-user Mission-Targeting- oder Completion-Authority.
- **Buddy:** Nur aggregierte Ton-, Hilfestil- oder Onboarding-Empfehlungen; keine Rohchats, Diagnosen, medizinischen Aussagen oder sensiblen Profile.
- **Difficulty:** Nur konservative Aggregate-Empfehlungen; keine Runtime-Aenderung und keine geschuetzten Attribute.
- **Challenges/Rewards:** Nur Hinweise auf interne Balance-Pruefung; keine Token, NFT, Wallet, Payment, Betting, finale Rewards, Anti-Cheat, Rare Items oder Ledger Writes.

## Explainability und Human Review

Jede Agenten-zugelassene Zusammenfassung muss Sample Size, Kohortenfenster, Threshold-Status, genutzte Aggregatkategorien, ausgeschlossene sensible Felder, Limitationen und naechste sichere Aufgabe nennen. High- und Critical-Risk-Empfehlungen sowie reward-, privacy-, compliance-, health-, child-, location-, camera-/biometric- oder financial-adjacent Themen sind immer `humanReviewRequired` und `implementationAllowed=false`.

## Validierung

`node scripts/wellfit-dev-agent/src/adaptive-user-insight-check.mjs` prueft, dass die Registry existiert, valides JSON ist, `activationState=planning_only` bleibt, erlaubte Aggregatsignale und verbotene sensible Felder vorhanden sind, Mindestschwellen und Explainability-Regeln existieren, High-/Critical-Human-Review ausgeloest wird und Agent-visible Summaries keine Roh-User-IDs erlauben.

Der Check ist in `scripts/wellfit-dev-agent/src/quality-gate.mjs` eingebunden und ergaenzt den bestehenden Research-&-Recommendation-Check ohne ihn zu ersetzen.

## KI-Fortsetzungs-Prompt

Lies `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/adaptive-user-insights.json` und `project-register/research-recommendations.json`. Halte Adaptive User Insight auf `planning_only`. Verwende nur Aggregatsignale oberhalb der Mindestschwellen, gib keine Rohdaten oder Identifikatoren an Agenten weiter, aendere keine Runtime-Produktlogik und markiere High-/Critical- oder geschuetzte Empfehlungen als `humanReviewRequired=true` und `implementationAllowed=false`.
