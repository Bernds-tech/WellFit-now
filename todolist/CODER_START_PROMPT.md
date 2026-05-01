# WELLFIT – Coder-Start-Prompt für GPT/GitHub

Version: 1.2
Repository: Bernds-tech/WellFit-now
Quelle der Wahrheit: GitHub + todolist/ + WellFit Dev Agent

---

## Verwendung

Diesen Prompt verwenden, wenn ein neuer GPT-Coder über ChatGPT/GitHub mitarbeiten soll oder ein bestehender Coder sagt: "weiter".

Dieser Prompt wird ergänzt durch:

```txt
todolist/CHAT_START_AGENT_AND_CODER_ADDENDUM.md
scripts/wellfit-dev-agent/RUNBOOK_WHEN_TO_RUN_AGENT.md
scripts/wellfit-dev-agent/NEW_CODER_ENTRY_MESSAGE.md
```

Diese Ergänzungen dürfen bei neuen Coder-/Chat-Prompts nicht weggelassen werden.

---

## Erste Antwort, wenn ein Coder sagt "weiter" oder "ich will coden"

Wenn ein neuer Coder oder bestehender Coder im GPT-Chat sagt, dass er weitermachen oder coden will, nicht sofort Codearbeit zulassen.

Zuerst diese Einstiegsnachricht verwenden:

```txt
scripts/wellfit-dev-agent/NEW_CODER_ENTRY_MESSAGE.md
```

Der Coder soll zuerst im Repository/Projekt-Terminal ausführen:

```bash
npm run agent:validate
npm run agent:goal-check
npm run agent:coder-prompts
npm run agent:dry-run
```

Danach soll er im Chat die relevanten Outputs senden:

```txt
scripts/wellfit-dev-agent/output/alpha-goal-check.md
scripts/wellfit-dev-agent/output/dry-run-report.md
scripts/wellfit-dev-agent/output/coder-prompts/IDENTITY_GATE.md
```

Erst danach wird die Coder-Rolle geklärt und der passende Coder-Prompt verwendet.

---

## Pflicht vor jeder Codearbeit

Bevor ein GPT-Coder am Code oder auf GitHub weiterarbeitet, muss zuerst die Coder-Rolle geklärt werden.

Frage immer zuerst:

```txt
Welcher Coder bist du? Antworte exakt mit deiner registrierten Rolle, z. B. Coder 1, Coder 2, Coder 3 ...
```

Ohne gültige Coder-Rolle wird keine Aufgabe zugewiesen.

Aktuelle Startrollen:

```txt
Coder 1 = Mobile / AR / Buddy / Unity
Coder 2 = Backend / Firebase / Mission Completion / Security
Coder 3 = Website / UX / QA / Datenschutz / Dokumentation / Agent
```

Später können Coder 4, 5, 6 oder 15 ergänzt werden. Die gültigen Rollen stehen in:

```txt
scripts/wellfit-dev-agent/wellfit-agent.config.json
scripts/wellfit-dev-agent/coder-registry.schema.md
```

---

## Pflicht-Agentenlauf vor neuem Coder / neuem GPT-Codeblock

Wenn ein neuer Coder über GPT/GitHub mitmachen will, wenn ein neuer GPT-Chat mit Codearbeit beginnt, wenn ein Coder sagt "weiter" oder wenn unklar ist, wer woran arbeiten soll, zuerst ausführen:

```bash
npm run agent:validate
npm run agent:goal-check
npm run agent:coder-prompts
npm run agent:dry-run
```

Auch ausführen bei:

```txt
- neuer GPT-Chat mit Codearbeit
- neuer Coder kommt dazu
- Coder-Rolle wurde geändert
- ToDo-/Roadmap-Dateien wurden geändert
- vor einem neuen größeren Arbeitsblock
- wenn geprüft werden soll, ob WellFit noch auf Alpha-Kurs ist
```

Danach im Chat anzeigen bzw. verwenden:

```txt
scripts/wellfit-dev-agent/output/alpha-goal-check.md
scripts/wellfit-dev-agent/output/dry-run-report.md
scripts/wellfit-dev-agent/output/coder-prompts/IDENTITY_GATE.md
```

Nach Antwort des Coders den passenden Prompt verwenden:

```txt
Coder 1 -> scripts/wellfit-dev-agent/output/coder-prompts/coder1.md
Coder 2 -> scripts/wellfit-dev-agent/output/coder-prompts/coder2.md
Coder 3 -> scripts/wellfit-dev-agent/output/coder-prompts/coder3.md
```

Bei späteren Codern entsprechend `coder4.md`, `coder5.md`, usw.

---

## Source of Truth zuerst lesen

Jeder Coder liest zuerst:

```txt
todolist/CHAT_START_PROMPT.md
todolist/CHAT_START_AGENT_AND_CODER_ADDENDUM.md
todolist/AUTONOMOUS_ITERATION_MODE.md
todolist/README.md
todolist/J - NÄCHSTE EMPFOHLENE ARBEIT
docs/architecture/WELLFIT_ALPHA_SCOPE_CUT.md
scripts/wellfit-dev-agent/RUNBOOK_WHEN_TO_RUN_AGENT.md
scripts/wellfit-dev-agent/README.md
scripts/wellfit-dev-agent/NEW_CODER_ENTRY_MESSAGE.md
```

Je nach Rolle zusätzlich:

Coder 1:

```txt
todolist/H - MOBILE - AR - TRACKING - KI
todolist/H1 - NATIVE AR - ARCORE - ARKIT - UNITY
todolist/H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE
todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md
```

Coder 2:

```txt
todolist/F - FIREBASE  - REALTIME - MISSIONEN
todolist/G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS
todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN
docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md
functions/EMULATOR_TEST_PLAN.md
```

Coder 3:

```txt
todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL
scripts/wellfit-dev-agent/README.md
scripts/wellfit-dev-agent/RUNBOOK_WHEN_TO_RUN_AGENT.md
docs/architecture/WELLFIT_SELF_HOSTED_DEV_AGENT.md
```

---

## Alpha-Leitfrage

Bei jeder Aufgabe zuerst prüfen:

```txt
Hilft das direkt zur testbaren Alpha / zu den ersten Testläufen?
```

Wenn ja: priorisieren.
Wenn nein: nicht löschen, sondern mit `[>]` als später / Backlog markieren.

Alpha-Kern:

```txt
- Login / Registrierung / Nutzerprofil
- Mobile / AR / sichtbarer Buddy
- Missionen / Challenges spielbar
- interne Punkte / XP ohne Token
- Backend / Firebase / Security Rules / Completion
- Deployment / Debug / QA / Testläufe
- Datenschutz / App-Store-Konformität
```

---

## Harte Grenzen

```txt
- Keine Production Deployments ohne ausdrückliche Freigabe.
- Keine Secrets/API Keys ins Frontend.
- Keine Mobile Token-/NFT-/Trading-/Presale-Funktionen.
- Keine medizinischen Diagnosen.
- Keine harte Scham-/Drucksprache.
- Keine clientseitige Autorität für Punkte, XP, Rewards, Mission Completion, Jackpot, Burn, Leaderboards oder Anti-Cheat.
- Backend-/Reward-/Completion-/Firestore-Rules-Themen nur mit Review und Tests.
- Bestehende Arbeit anderer Coder nicht überschreiben.
```

---

## ToDo-/Roadmap-No-Delete-Policy

Der Agent und alle Coder dürfen ToDo-/Roadmap-Dateien nicht bereinigen, zusammenkürzen oder alte Punkte löschen.

Verboten:

```txt
[!] bestehende ToDo-Einträge löschen
[!] alte Roadmap-Abschnitte entfernen
[!] Visionseinträge entfernen, nur weil sie nicht Alpha-kritisch sind
[!] erledigte Einträge löschen
[!] blockierte Einträge löschen
```

Erlaubt:

```txt
[x] Statusmarker ändern: [ ] -> [x], [~], [!], [>]
[x] Priorität ändern
[x] neue Erkenntnisse ergänzen
[x] Hinweise / Risiken / Build-Notizen ergänzen
[x] Backlog mit [>] markieren
[x] Aufgaben in neue Abschnitte kopieren und als verschoben markieren
```

Grundregel:

```txt
Nicht löschen, sondern sichtbar umpriorisieren.
```

---

## Antwortformat für Coder

```txt
Coder X
Aktueller Fokus:
Gelesene Dateien:
Agentenlauf / Reports:
Geplante Micro-Tasks:
Betroffene Dateien:
Risiken / Review-Pflicht:
Umsetzung oder nächster sicherer Schritt:
Build-/Test-Hinweise:
```

---

## Kurzform für neue Chats

```txt
Neuer Coder / neuer GPT-Codeblock:
1. Einstiegsnachricht aus NEW_CODER_ENTRY_MESSAGE.md senden.
2. Coder führt aus:
   npm run agent:validate
   npm run agent:goal-check
   npm run agent:coder-prompts
   npm run agent:dry-run
3. Coder sendet Outputs.
4. Identity-Gate anzeigen.
5. Coder nennt Rolle.
6. passenden Coder-Prompt verwenden.
7. erst dann Codearbeit.
```
