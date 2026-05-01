# WellFit Coder Registry Schema

Status: Skalierbare Rollen-/Coder-Zuordnung

Der WellFit Dev Agent darf nicht fest auf 3 Coder verdrahtet sein.

Stattdessen gilt:

```txt
Coder-Rollen werden in `scripts/wellfit-dev-agent/wellfit-agent.config.json` unter `coderAssignment.coders` gepflegt.
```

Aktuell gibt es Coder 1 bis 3.

Später können Coder 4, 5, 6 oder 15 ergänzt werden, ohne die Agentenlogik neu zu bauen.

---

## Coder-Objekt

```json
{
  "id": "coder4",
  "displayName": "Coder 4",
  "selfNames": ["coder 4", "coder4", "c4"],
  "role": "Beispielrolle",
  "focusKeywords": ["keyword1", "keyword2"],
  "avoidKeywords": ["risk1", "risk2"]
}
```

## Pflichtfelder

```txt
id              eindeutige technische ID, z. B. coder4
displayName     sichtbarer Name, z. B. Coder 4
selfNames       erlaubte Antworten bei Identitätsabfrage
role            fachlicher Aufgabenbereich
focusKeywords   Begriffe, bei denen Aufgaben bevorzugt zugewiesen werden
avoidKeywords   Begriffe, die der Coder vermeiden soll
```

## Skalierungsregel

```txt
Neue Coder werden nur über die Registry ergänzt.
Der Agent muss alle Coder dynamisch aus der Registry lesen.
Keine hart codierten Coder-1/2/3-Verzweigungen im Agent-Code.
```

## GitHub-Pflichtregel

Sobald jemand auf GitHub etwas machen möchte, muss zuerst klar sein:

```txt
Welcher Coder bist du?
```

Gültige Antwort:

```txt
Coder 1
Coder 2
Coder 3
...
Coder 15
```

Wenn die Rolle nicht bekannt ist, darf keine Aufgabe übernommen werden.

---

## Empfohlene spätere Rollen

```txt
Coder 1  Mobile / AR / Buddy / Unity
Coder 2  Backend / Firebase / Mission Completion / Security
Coder 3  Website / UX / QA / Datenschutz / Dokumentation / Agent
Coder 4  Native App / Capacitor / App Store Builds
Coder 5  Unity Animation / Avatar Models / AR Scene
Coder 6  Testing / Emulator / CI / QA Automation
Coder 7  Security / Rules / Anti-Cheat Review
Coder 8  Mission Content / Gamification / UX Writing
Coder 9  Admin Dashboard / Monitoring
Coder 10 Legal / Datenschutz / App-Store Copy
Coder 11 Performance / Build / Deployment
Coder 12 Design System / UI Components
Coder 13 Analytics / Insight Agent
Coder 14 Documentation / Handoffs
Coder 15 Release Manager
```

Diese Rollen sind Vorschläge und können später angepasst werden.
