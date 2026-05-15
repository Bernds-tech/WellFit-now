# WellFit Health, Watch and Location Privacy Guardrails

Status: Beta-planend / Datenschutz- und Safety-Leitplanke
Stand: 2026-05-07

## Ziel

Diese Datei legt fest, wie WellFit mit Schritt-, Health-, Watch-, Kamera-, AR-, Standort- und Kinder-/Jugenddaten umgehen soll.

Grundsatz: Diese Daten duerfen WellFit unterstuetzen, aber nicht unkontrolliert zur Hauptmechanik, Reward-Autoritaet oder Missbrauchsquelle werden.

## Harte Beta-Abgrenzung

- Keine sensiblen Health-Daten als alleinige Reward-Grundlage.
- Keine Standortdaten als alleinige Reward-Grundlage.
- Keine Kamera-/AR-Daten als unkontrollierte Pflicht fuer alle Nutzer.
- Keine dauerhafte Hintergrundueberwachung ohne klare Einwilligung.
- Keine Kinder-/Jugenddaten ohne besondere Schutzlogik.
- Keine clientseitige Autoritaet fuer Punkte, XP, Rewards, Mission Completion oder Anti-Cheat.
- Keine finale Autoritaet fuer Leaderboards, Inventory Grants, Rare Items, Ledger-Writes oder payout-/tokennahe Entscheidungen aus Health-, Watch-, Kamera-, AR-, Standort-, Face- oder Motion-Signalen.
- Keine Erweiterung von Health-, Child-, Location-, Camera-, Face-, Motion-, Privacy- oder Consent-Daten ohne expliziten Human-Review, Datenminimierung, Einwilligungskonzept und Fallback.
- Alle rechtlich oder medizinisch sensiblen offenen Punkte bleiben `review_required`; diese Datei ersetzt keine Rechts-/Datenschutzpruefung und aktiviert keine Runtime-Logik.

## Datenkategorien

### Schritt- und Bewegungsdaten
Duerfen spaeter genutzt werden fuer:
- Plausibilitaet
- Kontext
- Motivation
- Fortschritt
- Missionsempfehlungen

Duerfen nicht alleine entscheiden ueber:
- finale Punktevergabe
- echte Rewards
- Mission Completion
- Anti-Cheat-Freigabe

### Health-/Fitnessdaten
Health-Daten sind sensibel.

Moegliche Beispiele:
- Aktivitaetsniveau
- Trainingserfahrung
- Belastbarkeit
- Gesundheitsbezogene Einschraenkungen
- Nutzerziele

Regel:
- Nur minimal speichern.
- Nur mit klarer Einwilligung verwenden.
- Nach Moeglichkeit in groben Kategorien statt Rohdaten speichern.
- Keine Diagnose, keine medizinische Bewertung.

### Watch-/Wearable-Daten
Watch-Daten koennen spaeter helfen bei:
- Streaks
- Bewegungskontext
- Plausibilitaetspruefung
- freiwilligen Challenges

Regel:
- Keine Pflicht fuer Beta.
- Keine Benachteiligung ohne Watch.
- Keine dauerhafte Ueberwachung als Standard.

### Standortdaten
Standort kann spaeter wichtig sein fuer:
- AR-Rallyes
- NFC-Orte
- lokale Challenges
- Outdoor-Missionen

Regel:
- Standort nur bei klarer Mission und Einwilligung.
- So wenig genau wie moeglich.
- Keine dauerhafte Standorthistorie ohne starken Grund.
- Standortdaten duerfen nicht direkt finale Rewards autorisieren.

### Kamera- und AR-Daten
Kamera/AR ist fuer Buddy, AR-Rallyes und visuelle Missionen wichtig.

Regel:
- Kamera nur nach ausdruecklicher Freigabe.
- AR-Daten fuer Beta moeglichst lokal/ephemer behandeln.
- Keine unnoetige Speicherung von Bild-/Videodaten.
- AR-Proof nur als Hinweis oder Evidence, nicht als alleinige finale Autoritaet.

### Kinder- und Jugenddaten
Besonders schutzbeduerftig.

Regel:
- Altersgruppen statt exakter Details bevorzugen.
- Keine riskante Uebermotivation.
- Keine Echtgeld-/Token-/Trading-/NFT-Funktionen in Mobile.
- Eltern-/Guardian-/Schul-/Vereinslogik spaeter gesondert planen.

## Reward- und Mission-Regel

Health-, Watch-, Kamera-, AR- und Standortdaten koennen spaeter in die Bewertung einfliessen als:
- Kontextsignal
- Plausibilitaetssignal
- Safety-Signal
- Empfehlungssignal
- Evidence-Signal

Sie duerfen fuer Beta nicht alleine sein:
- Reward-Autoritaet
- Punkte-Autoritaet
- XP-Autoritaet
- Anti-Cheat-Entscheidung
- Mission-Completion-Entscheidung

## Datenminimierung

Fuer Beta bevorzugen:
- Status statt Rohdaten
- Kategorien statt exakte Werte
- kurze Speicherung statt Langzeitverlauf
- Audit-Events statt private Rohdaten
- lokale Verarbeitung, wo moeglich

## Einwilligung und UI

Jede sensible Berechtigung braucht klare UI-Erklaerung:

- Warum wird sie gebraucht?
- Wann wird sie genutzt?
- Was passiert, wenn Nutzer ablehnen?
- Welche Alternative gibt es?

Ablehnung darf die App nicht komplett unbrauchbar machen, sofern die Funktion nicht zwingend darauf angewiesen ist.

## App-Store-Konformitaet

Mobile-App bleibt frei von:
- Token-Trading
- NFT-Marktplatz
- Presale-Funktionen
- Staking
- echten Auszahlungen
- spekulativen Finanzmechaniken

## Datenbankbezug

Abzugleichen mit:

- `todolist/DATABASE_PLAN.md`
- `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`
- `docs/architecture/MISSION_DRAFT_SECURITY_PLAN.md`
- `docs/architecture/TRACKING_BUDDY_SERVER_EVENTS.md`
- `docs/architecture/AR_RIDDLE_FIRESTORE_SECURITY_PLAN.md`
- `docs/architecture/USER_POINTS_CLIENT_WRITE_REFACTOR.md`

## Offene Folgeaufgaben

- [ ] Konkrete Consent-Texte fuer Kamera, Standort, Health und Watch entwerfen.
- [ ] Datenmodell pruefen: Welche Health-/Watch-/Standortdaten werden wirklich fuer Beta benoetigt?
- [ ] Fallbacks fuer Nutzer ohne Berechtigungen definieren.
- [ ] Kinder-/Jugendschutzlogik als eigene Detaildatei vorbereiten.
- [ ] Mission- und Reward-Logik gegen diese Guardrails pruefen.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/NEXT_ACTIONS.md`, `todolist/DATABASE_PLAN.md`, `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`, `todolist/TODO_INDEX.md` und diese Datei. Arbeite Health-, Watch-, Standort-, Kamera- und Kinder-/Jugenddaten nur datensparsam und schutzorientiert weiter. Keine sensiblen Daten als alleinige Reward- oder Mission-Completion-Autoritaet verwenden. Neue Datenfelder immer mit Zweck, Einwilligung, Speicherlogik und Fallback dokumentieren.
