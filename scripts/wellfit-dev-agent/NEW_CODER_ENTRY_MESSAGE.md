# WellFit – Neue-Coder-Einstiegsnachricht

Status: verbindliche ChatGPT-Einstiegsnachricht für neue GPT-/GitHub-Coder

Diese Nachricht wird verwendet, wenn ein neuer Coder im WellFit-Projekt sagt:

```txt
Ich will weitermachen.
Lass mich weiter coden.
Ich bin bereit.
Ich mache auf GitHub weiter.
Ich übernehme den nächsten Task.
```

---

## Nachricht an den Coder

```txt
Bevor du am Code weitermachst, musst du zuerst den WellFit Dev Agent laufen lassen, damit wir sicher wissen:

1. ob die Agent-Konfiguration gültig ist,
2. ob WellFit noch auf Kurs zur ersten testbaren Alpha ist,
3. welche Coder-Prompts aktuell sind,
4. welche Aufgaben dir zugewiesen werden sollen.

Bitte führe im Repository/Projekt-Terminal aus:

npm run agent:validate
npm run agent:goal-check
npm run agent:coder-prompts
npm run agent:dry-run

Sende danach hier im Chat die relevanten Ausgaben bzw. Inhalte aus:

scripts/wellfit-dev-agent/output/alpha-goal-check.md
scripts/wellfit-dev-agent/output/dry-run-report.md
scripts/wellfit-dev-agent/output/coder-prompts/IDENTITY_GATE.md

Danach frage ich dich nach deiner Rolle:

Welcher Coder bist du? Antworte exakt mit deiner registrierten Rolle, z. B. Coder 1, Coder 2, Coder 3 ...

Erst nach deiner Rollenbestätigung bekommst du den passenden Coder-Prompt und darfst mit Codearbeit beginnen.
```

---

## Wichtig

Der Coder darf nicht direkt loslegen.

Reihenfolge ist immer:

```txt
1. Agent-Befehle ausführen.
2. Outputs in ChatGPT senden.
3. Identity-Gate beantworten.
4. passenden Coder-Prompt erhalten.
5. erst dann Codearbeit.
```

---

## Warum?

Der Agent prüft:

```txt
- Coder-Registry
- Identity-Gate
- Alpha-Zielkurs
- ToDo-No-Delete-Policy
- offene Aufgaben
- Risikoklassen
- passende Coder-Zuweisung
```

Damit wird verhindert, dass ein neuer GPT-Coder:

```txt
[!] falsche Aufgaben übernimmt
[!] Backend und AR-Arbeit vermischt
[!] alte ToDo-Prioritäten verwendet
[!] an NFT/Token/Marketplace arbeitet, obwohl Alpha wichtiger ist
[!] ToDo-/Roadmap-Punkte löscht
[!] Arbeit anderer Coder überschreibt
```

---

## Kurzform

```txt
Neuer Coder sagt: Ich will weitermachen.
GPT antwortet:
Führe zuerst aus:

npm run agent:validate
npm run agent:goal-check
npm run agent:coder-prompts
npm run agent:dry-run

Sende danach die Outputs aus alpha-goal-check.md, dry-run-report.md und IDENTITY_GATE.md.
Dann klären wir deine Coder-Rolle.
```
