# WellFit Agenten-Modi

Diese Datei beschreibt die vier festen Arbeitsstufen fuer WellFit-Agenten.

## Stufe 1 - Analyse und Dokumentation

```txt
Analyse + Bestandsaufnahme + Dokumentation, ohne Codeaenderung
```

Nutzen:
- wenn zuerst nur geprueft, verstanden und dokumentiert werden soll
- keine Codeaenderung
- kein Live-Deploy

Datei: `agents/modes/stufe-1.md`

---

## Stufe 2 - Kleine sichere Umsetzung

```txt
Kleine sichere Aenderungen + Dokumentation + begrenzte Tests
```

Nutzen:
- kleine Text-/Dokumentations-/Index-/UI-Korrekturen
- keine komplexe Produktlogik
- kein Live-Deploy

Datei: `agents/modes/stufe-2.md`

---

## Stufe 3 - Umsetzung mit Tests und Preview

```txt
Code-/UI-/Feature-Aenderung + Tests + Dokumentation + Preview
```

Nutzen:
- klar begrenzte Entwicklungsarbeit
- betroffene Seiten/API-Bereiche pruefen
- PR/Preview liefern
- kein Live-Deploy

Datei: `agents/modes/stufe-3.md`

---

## Stufe 4 - Vollmodus

```txt
autonom arbeiten, Nebenseiten pruefen, Fehler beheben, dokumentieren, Preview liefern, nicht live schalten
```

Bedeutung:

```txt
Agent + Selbstkorrektur + Nebenseiten-Crawl
```

Nutzen:
- komplexe Ziele
- alle betroffenen Seiten und Nebenseiten beruecksichtigen
- Fehler selbst korrigieren
- Dokumentation/Register aktualisieren
- Preview liefern
- nicht live schalten

Datei: `agents/modes/stufe-4.md`

---

## Grundregel

Je hoeher die Stufe, desto mehr Autonomie und Pruefpflicht.

- Stufe 1 = verstehen und dokumentieren
- Stufe 2 = kleine sichere Aenderung
- Stufe 3 = begrenzte Umsetzung mit Tests/Preview
- Stufe 4 = autonomer Vollmodus mit Nebenseiten-Crawl und Selbstkorrektur
