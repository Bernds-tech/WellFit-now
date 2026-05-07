# WELLFIT – ADAPTIVE MISSION & INSIGHT AGENT

Status: Architektur-Grundlage
Kontext: Nutzeranalyse, Personalisierung, adaptive Missionen, Buddy-Motivation, KI-generierte Inhalte
Ziel: Eine getrennte Agentenrolle definieren, die Nutzersignale analysiert und daraus sichere, personalisierte Missionen, Buddy-Hinweise und neue Content-Ideen erzeugt.

---

## 1. Grundentscheidung

WellFit braucht neben dem Dev-Agent einen separaten Insight-/Mission-Agent.

Der Dev-Agent arbeitet am Repository, Code, Tests und Pull Requests.

Der Insight-/Mission-Agent arbeitet an Nutzeranalyse, Motivation, Missionsempfehlungen und Content-Generierung.

Wichtig:

Der Insight-Agent soll schreiben können, aber nicht direkt in produktiven Code oder sicherheitskritische Backendlogik.

Er schreibt stattdessen in kontrollierte Datenbereiche wie:

```txt
missionDrafts
missionTemplates
personalizedMissionSuggestions
buddyMotivationProfiles
userPreferenceSummaries
cohortInsightReports
aiGeneratedMissionIdeas
```

---

## 2. Warum getrennt vom Dev-Agent?

Der Insight-Agent braucht Nutzungs- und Präferenzsignale.

Der Dev-Agent braucht GitHub-/Code-Rechte.

Diese Rechte sollen getrennt bleiben:

```txt
Dev-Agent:
- darf GitHub lesen/schreiben,
- darf PRs erstellen,
- darf Tests vorbereiten,
- soll keine sensiblen Nutzerdaten lesen.

Insight-Agent:
- darf pseudonymisierte/aggregierte Nutzersignale auswerten,
- darf Missionen und Content-Vorschläge schreiben,
- soll keine GitHub-Schreibrechte haben,
- soll keine produktive Reward-/Punkte-/Completion-Autorität haben.
```

---

## 3. Was der Insight-Agent schreiben darf

### 3.1 Mission Drafts

Der Agent darf neue Missionen als Entwurf erzeugen:

```txt
missionDrafts/{draftId}
```

Beispiel:

```json
{
  "title": "Mini-Schatzsuche im Park",
  "targetAgeBand": "child_6_10",
  "missionType": "ar_walk_quiz",
  "estimatedMinutes": 12,
  "difficulty": "easy",
  "motivationStyle": "adventure_playful",
  "requiredEvidence": ["arCheckpoint", "quizAnswer"],
  "safetyFlags": ["parentRecommended", "daylightOnly"],
  "rewardMode": "previewOnly",
  "status": "draft"
}
```

### 3.2 Personalisierte Vorschläge

Der Agent darf pro Nutzer oder Kohorte Vorschläge speichern:

```txt
personalizedMissionSuggestions/{suggestionId}
```

Beispiel:

```json
{
  "userRef": "pseudonymousUserId",
  "reason": "likes_short_ar_missions_and_quizzes",
  "suggestedTemplateId": "ar_quiz_walk_short_v1",
  "confidence": 0.78,
  "expiresAt": "serverTimestamp + 24h",
  "status": "pendingPolicyCheck"
}
```

### 3.3 Buddy-Motivationsprofile

Der Agent darf Präferenzprofile ableiten:

```txt
buddyMotivationProfiles/{userIdOrPseudoId}
```

Beispiele:

```txt
playful_short
calm_supportive
adventure_fantasy
competitive_light
family_friendly
senior_gentle
```

### 3.4 Kohortenberichte

Der Agent darf aggregierte Reports schreiben:

```txt
cohortInsightReports/{reportId}
```

Beispiele:

```txt
Kinder 6–10 schließen AR-Schatzsuchen häufiger ab als reine Schrittmissionen.
Erwachsene brechen Missionen über 15 Minuten häufiger ab.
PvP ist nur bei aktiven Nutzern mit hohem Engagement sinnvoll.
Senioren bevorzugen kurze, klare Missionen ohne Zeitdruck.
```

---

## 4. Was der Insight-Agent nicht schreiben darf

Der Agent darf nicht direkt schreiben in:

```txt
userPointLedger
userXpLedger
missionRewardEvents
missionCompletionAuthorizations
jackpotSettlements
leaderboards
antiCheatDecisions
systemReserveSnapshots
paymentRecords
tokenTransactions
nftOwnershipRecords
```

Der Agent darf auch nicht:

```txt
Punkte gutschreiben.
XP gutschreiben.
Mission Completion autorisieren.
Rewards final berechnen.
Jackpot/Burn/Einsätze auslösen.
Anti-Cheat final entscheiden.
Mobile Token-/NFT-/Trading-Funktionen erzeugen.
medizinische Diagnosen ableiten.
Kinder/Health/Standort-Rohdaten ungefiltert exportieren.
```

---

## 5. Datenminimierung

Der Insight-Agent arbeitet bevorzugt mit abgeleiteten Signalen, nicht mit Rohdaten.

Nicht direkt verwenden:

```txt
Klarnamen
exakte GPS-Historie
Rohbilder / Videos
Gesundheitsrohdaten
private Nachrichten
Kinderdaten ohne Eltern-/Rechtsgrundlage
```

Besser verwenden:

```json
{
  "ageBand": "adult",
  "preferredMissionTypes": ["ar", "walking", "quiz"],
  "averageSessionMinutes": 8,
  "dropoffPattern": "long_missions_abandoned",
  "buddyTonePreference": "playful",
  "pvpInterest": "low",
  "completionStreakRisk": "medium"
}
```

---

## 6. Kontrollierter Schreibfluss

```txt
Nutzersignale / Kohortensignale
        ↓
Insight-Agent analysiert Präferenzen
        ↓
schreibt MissionDraft / Suggestion / MotivationProfile
        ↓
Policy Engine prüft Alter, Sicherheit, Kontext, Missbrauch, Tageszeit, Elternmodus
        ↓
Backend gibt freigegebene Vorschläge an App/Buddy
        ↓
Mission Completion und Rewards bleiben weiterhin serverseitig getrennt
```

---

## 7. Beispiel: personalisierte Mission

Nutzerprofil:

```json
{
  "ageBand": "adult",
  "likes": ["short_sessions", "ar", "fantasy", "quiz"],
  "dislikes": ["pvp", "long_workouts"],
  "bestTimeWindow": "evening_early",
  "averageCompletionMinutes": 7
}
```

Agent erstellt:

```json
{
  "title": "Der kleine Drachenhinweis",
  "type": "ar_quiz_walk",
  "durationMinutes": 7,
  "buddyTone": "fantasy_playful",
  "steps": [
    "Scanne eine sichere Fläche.",
    "Folge deinem Buddy zu einem AR-Hinweis.",
    "Beantworte eine kurze Wissensfrage.",
    "Schließe die Mission ohne Zeitdruck ab."
  ],
  "rewardMode": "serverPreviewOnly",
  "status": "pendingPolicyCheck"
}
```

Backend prüft danach:

```txt
Ist Mission altersgerecht?
Ist sie sicher?
Gibt es Elternmodus-Anforderungen?
Ist keine Paywall-Kette enthalten?
Ist der Reward nur Preview?
Sind Evidence-Anforderungen klar?
```

---

## 8. Similar-User-Logik

Der Agent darf ähnliche Nutzergruppen aus aggregierten Merkmalen bilden.

Beispiel:

```txt
Kohorte A:
- kurze Sessions
- AR bevorzugt
- Quiz positiv
- PvP niedrig
- hohe Completion bei Buddy-Fantasy-Texten
```

Daraus darf der Agent Vorschläge ableiten:

```txt
Zeige diesem Nutzer eher kurze AR-Quiz-Missionen mit spielerischem Buddy-Ton.
```

Grenzen:

```txt
Keine sensiblen Kategorien als Targeting ohne Rechtsgrundlage.
Keine Diskriminierung.
Keine manipulative Drucksprache.
Keine Diagnose-/Therapieableitung.
Keine heimliche Profilbildung ohne Consent, wenn rechtlich erforderlich.
```

---

## 9. Motivationstypen

Der Agent darf Motivationstypen als Produkt-/UX-Hilfe ableiten:

```txt
Explorer: liebt Entdecken, AR, Orte, Rätsel.
Achiever: reagiert auf Level, Fortschritt, Streaks.
Social: reagiert auf Familie, Freunde, Gruppen.
Calm: braucht sanfte, kurze Aufgaben.
Competitor: mag PvP und Ranglisten, aber nur fair und begrenzt.
Learner: bevorzugt Quiz, Bildung, Wissen.
Collector: mag Abzeichen, Items, Avatar-Entwicklung.
```

Diese Typen dürfen Missionsempfehlungen beeinflussen, aber keine finale Reward-/Punkte-Entscheidung treffen.

---

## 10. Integration mit Dev-Agent

Der Insight-Agent darf keine GitHub-Änderungen selbst schreiben.

Er kann aber einen Dev-Task erzeugen:

```txt
devAgentTaskQueue/{taskId}
```

Beispiel:

```json
{
  "type": "ui_improvement_request",
  "reason": "users_abandon_ar_onboarding_step_2",
  "suggestion": "Simplify AR scan instruction and add Buddy explanation.",
  "priority": "medium",
  "requiresHumanReview": true
}
```

Der Dev-Agent kann daraus später einen Branch/PR erstellen.

---

## 11. Empfohlene erste Micro-Tasks

```txt
[ ] Firestore-Collections für MissionDrafts und Suggestions planen.
[ ] TypeScript-Typen für MissionDraft, MissionSuggestion und MotivationProfile definieren.
[ ] Policy-Check-Stufen definieren: draft -> policyChecked -> approvedForSuggestion -> rejected.
[ ] Rules: Nutzer darf eigene Suggestions lesen, aber nicht schreiben.
[ ] Agent/Backend darf Drafts schreiben.
[ ] Rewards bleiben immer getrennt.
[ ] Keine MissionDrafts direkt als abgeschlossene Mission werten.
[ ] Keine Draft-Mission ohne Policy-Check in App anzeigen.
```

---

## 12. Fazit

Der Nutzeranalyse-Agent soll schreiben können, aber nur in kontrollierte Content-, Vorschlags- und Analysebereiche.

Er ist kein reiner Leser.

Er ist aber auch kein Reward-, Completion-, Economy- oder GitHub-Autoritätsagent.

Kernregel:

```txt
Insight-Agent erzeugt passende Missionen und Motivation.
Policy Engine und Backend prüfen Sicherheit.
Reward Engine entscheidet getrennt über Punkte/XP.
Dev-Agent ändert Code nur über PR.
```

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und die fuehrenden Dateien: `todolist/DATABASE_PLAN.md`, `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`.

Arbeite mit dieser Datei nur ergaenzend und nachvollziehbar. Loesche keine alten Aufgaben, Roadmap-Punkte, Statushinweise oder erledigten Eintraege. Markiere veraltete oder doppelte Punkte nur als `veraltet`, `duplikat`, `erledigt`, `offen` oder `zu pruefen`.

Wenn du offene Punkte aus dieser Datei uebernimmst, verlinke sie in `todolist/TODO_INDEX.md` oder uebertrage sie nach `todolist/NEXT_ACTIONS.md`. Dokumentiere erledigte Arbeit in `todolist/DONE_LOG.md`.

