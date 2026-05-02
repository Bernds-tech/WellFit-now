# WELLFIT – Chat-Start Addendum: Dev Agent & Coder-Routing

Version: 1.0
Repository: Bernds-tech/WellFit-now
Kontext: Ergänzung zu `todolist/CHAT_START_PROMPT.md`, `todolist/NEXT_CHAT_HANDOFF_PROMPT.md` und `todolist/CODER_START_PROMPT.md`

---

## Zweck

Dieses Addendum verankert dauerhaft, wann der WellFit Dev Agent ausgeführt werden muss und wie neue GPT-/GitHub-Coder starten.

Es darf bei neuen Chat-Start- oder Coder-Prompts nicht weggelassen werden.

---

## Pflichtdateien zusätzlich zum normalen Chat-Start

Bei Codearbeit, GitHub-Arbeit, neuem Coder oder neuem GPT-Codeblock immer zusätzlich lesen:

```txt
todolist/CODER_START_PROMPT.md
scripts/wellfit-dev-agent/RUNBOOK_WHEN_TO_RUN_AGENT.md
scripts/wellfit-dev-agent/README.md
scripts/wellfit-dev-agent/coder-registry.schema.md
```

---

## Wann die Agent-Befehle ausgeführt werden müssen

Immer ausführen, wenn:

```txt
- ein neuer GPT-Chat mit Codearbeit beginnt
- ein neuer Coder dazukommt
- jemand über GPT/GitHub am Code weiterarbeiten will
- ein Coder sagt: weiter
- eine Coder-Rolle geändert wurde
- ToDo-/Roadmap-Dateien geändert wurden
- unklar ist, wer woran weiterarbeiten soll
- vor einem neuen größeren Arbeitsblock
- geprüft werden soll, ob WellFit noch auf Alpha-Kurs ist
```

Dann ausführen:

```bash
npm run agent:validate
npm run agent:goal-check
npm run agent:coder-prompts
npm run agent:dry-run
```

---

## Was danach im Chat angezeigt werden soll

Nach dem Agentenlauf sollen im ChatGPT sichtbar genutzt werden:

```txt
scripts/wellfit-dev-agent/output/alpha-goal-check.md
scripts/wellfit-dev-agent/output/dry-run-report.md
scripts/wellfit-dev-agent/output/coder-prompts/IDENTITY_GATE.md
```

Danach muss der GPT-/GitHub-Coder zuerst gefragt werden:

```txt
Welcher Coder bist du? Antworte exakt mit deiner registrierten Rolle, z. B. Coder 1, Coder 2, Coder 3 ...
```

Ohne gültige Coder-Rolle keine Codearbeit.

---

## Passender Coder-Prompt

Nach der Antwort wird ausschließlich der passende Prompt verwendet:

```txt
Coder 1 -> scripts/wellfit-dev-agent/output/coder-prompts/coder1.md
Coder 2 -> scripts/wellfit-dev-agent/output/coder-prompts/coder2.md
Coder 3 -> scripts/wellfit-dev-agent/output/coder-prompts/coder3.md
```

Bei späteren Codern entsprechend:

```txt
Coder 4 -> scripts/wellfit-dev-agent/output/coder-prompts/coder4.md
Coder 5 -> scripts/wellfit-dev-agent/output/coder-prompts/coder5.md
...
Coder 15 -> scripts/wellfit-dev-agent/output/coder-prompts/coder15.md
```

---

## Skalierung

Der Agent darf nicht starr auf drei Coder festgelegt werden.

Neue Coder werden registriert in:

```txt
scripts/wellfit-dev-agent/wellfit-agent.config.json
```

Die Regeln dazu stehen in:

```txt
scripts/wellfit-dev-agent/coder-registry.schema.md
```

Nach jeder Änderung an der Coder-Registry:

```bash
npm run agent:validate
npm run agent:coder-prompts
npm run agent:dry-run
```

---

## Alpha-Zielkurs

Der Agent soll immer prüfen, ob die nächsten Aufgaben direkt zur ersten testbaren WellFit-Alpha beitragen.

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

Nicht Alpha-kritisch und standardmäßig Backlog:

```txt
- NFT
- Token / WFT
- Blockchain
- Marketplace
- Trading
- Staking
- DAO
- DePIN
- B2B / Whitelabel
- komplexe Avatar-Vererbung
- lebenslanger Avatar
- große Partnerplattformen
```

---

## ToDo-/Roadmap-No-Delete-Policy

Der Agent und alle Coder dürfen ToDo-/Roadmap-Dateien nicht löschen oder bereinigen.

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

## Kurzform für jeden neuen Coder-Start

```txt
1. Agent ausführen:
   npm run agent:validate
   npm run agent:goal-check
   npm run agent:coder-prompts
   npm run agent:dry-run

2. Identity-Gate anzeigen.
3. Coder nennt Rolle.
4. Passenden Coder-Prompt verwenden.
5. Alpha-Zielkurs prüfen.
6. Erst dann Codearbeit.
```
