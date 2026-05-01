# WellFit Dev Agent – Wann ausführen?

Status: verbindliches Runbook für GPT-/GitHub-Coder-Einstieg

Dieses Runbook erklärt, wann Bernd oder ein Coder die Agent-Befehle ausführen soll.

---

## 1. Wichtigste Regel

Der Agent wird immer ausgeführt, wenn sich der Arbeitskontext verändert.

Besonders wichtig:

```txt
Wenn ein neuer Coder über GPT/GitHub mitarbeiten will,
immer zuerst den Agentenlauf starten.
```

---

## 2. Pflichtablauf, wenn ein neuer Coder dazukommt

Wenn jemand im ChatGPT sagt:

```txt
Ich mache jetzt weiter.
Ich bin neuer Coder.
Ich arbeite am Code.
Ich arbeite auf GitHub.
Ich übernehme Backend / AR / Website.
```

Dann gilt:

```bash
npm run agent:validate
npm run agent:goal-check
npm run agent:coder-prompts
npm run agent:dry-run
```

Danach im ChatGPT den passenden Prompt ausgeben oder einfügen:

```txt
scripts/wellfit-dev-agent/output/coder-prompts/IDENTITY_GATE.md
```

Der Coder muss dann antworten:

```txt
Coder 1
Coder 2
Coder 3
...
```

Danach bekommt er ausschließlich seinen passenden Prompt:

```txt
scripts/wellfit-dev-agent/output/coder-prompts/coder1.md
scripts/wellfit-dev-agent/output/coder-prompts/coder2.md
scripts/wellfit-dev-agent/output/coder-prompts/coder3.md
```

Bei späteren Codern entsprechend:

```txt
coder4.md
coder5.md
coder6.md
...
```

---

## 3. Wann muss `npm run agent:validate` ausgeführt werden?

Immer wenn:

```txt
[ ] ein neuer Coder eingetragen wurde
[ ] eine Coder-Rolle geändert wurde
[ ] selfNames geändert wurden
[ ] focusKeywords / avoidKeywords geändert wurden
[ ] Identity-Gate geändert wurde
[ ] ToDo-No-Delete-Policy geändert wurde
[ ] Agent-Konfiguration geändert wurde
```

Zweck:

```txt
prüfen, ob Registry, Rollen, Identity-Gate und No-Delete-Policy gültig sind.
```

---

## 4. Wann muss `npm run agent:goal-check` ausgeführt werden?

Immer wenn:

```txt
[ ] ein neuer Arbeitstag / neuer GPT-Chat beginnt
[ ] ein neuer Coder einsteigt
[ ] größere ToDo-/Roadmap-Änderungen passiert sind
[ ] jemand neue Features vorschlägt
[ ] Zweifel besteht, ob wir noch auf Alpha-Kurs sind
[ ] vor Sprint-/Tagesplanung
[ ] vor größeren Codearbeiten
```

Zweck:

```txt
prüfen, ob WellFit noch auf Kurs zur ersten testbaren Alpha ist.
```

Output:

```txt
scripts/wellfit-dev-agent/output/alpha-goal-check.md
```

---

## 5. Wann muss `npm run agent:coder-prompts` ausgeführt werden?

Immer wenn:

```txt
[ ] ein neuer Coder dazukommt
[ ] sich Coder-Rollen geändert haben
[ ] sich Source-of-Truth-Dateien geändert haben
[ ] sich Alpha-Scope geändert hat
[ ] neue Coder-Prompts gebraucht werden
[ ] ein GPT-Coder neu gestartet wird
```

Zweck:

```txt
Identity-Gate und Coder-spezifische GPT-Prompts neu erzeugen.
```

Output:

```txt
scripts/wellfit-dev-agent/output/coder-prompts/IDENTITY_GATE.md
scripts/wellfit-dev-agent/output/coder-prompts/coder1.md
scripts/wellfit-dev-agent/output/coder-prompts/coder2.md
scripts/wellfit-dev-agent/output/coder-prompts/coder3.md
```

---

## 6. Wann muss `npm run agent:dry-run` ausgeführt werden?

Immer wenn:

```txt
[ ] Aufgaben neu verteilt werden sollen
[ ] ein neuer Coder wissen soll, wo er weitermacht
[ ] vor einem neuen Arbeitsblock
[ ] nach Roadmap-/ToDo-Änderungen
[ ] nach Alpha-Zielkurs-Änderungen
[ ] wenn unklar ist, welcher Coder welche Aufgabe übernehmen soll
```

Zweck:

```txt
offene Aufgaben lesen, Alpha-Scope prüfen, Risiken markieren und Aufgaben den registrierten Codern zuweisen.
```

Output:

```txt
scripts/wellfit-dev-agent/output/dry-run-report.md
```

---

## 7. Standard-Befehl für Bernd

Wenn Bernd nicht sicher ist, ob der Agent neu laufen soll:

```bash
npm run agent:validate
npm run agent:goal-check
npm run agent:coder-prompts
npm run agent:dry-run
```

Das ist der sichere Gesamt-Ablauf.

---

## 8. Was soll im ChatGPT angezeigt werden?

Nach dem Agentenlauf sollen im ChatGPT sichtbar gemacht werden:

```txt
1. Ergebnis aus alpha-goal-check.md
2. Ergebnis aus dry-run-report.md
3. Identity-Gate-Frage
4. passender Coder-Prompt nach Antwort des Coders
```

ChatGPT soll den Coder zuerst fragen:

```txt
Welcher Coder bist du? Antworte exakt mit Coder 1, Coder 2, Coder 3 ...
```

Danach:

```txt
Wenn Coder 1 -> coder1.md verwenden.
Wenn Coder 2 -> coder2.md verwenden.
Wenn Coder 3 -> coder3.md verwenden.
Wenn unbekannt -> keine Aufgabe zuweisen.
```

---

## 9. Wann nicht ausführen?

Nicht nötig bei:

```txt
[ ] reiner kurzer Nachfrage ohne Codearbeit
[ ] kleiner Erklärung im Chat
[ ] wenn kein Coder, keine Roadmap und kein GitHub betroffen ist
```

Aber sobald GitHub/Code/ToDos betroffen sind:

```txt
Agent ausführen.
```

---

## 10. Kurzform

```txt
Neuer Coder?
→ validate
→ goal-check
→ coder-prompts
→ dry-run
→ Identity-Gate im Chat anzeigen
→ Coder nennt Rolle
→ passenden Prompt anzeigen
→ erst dann Codearbeit
```
