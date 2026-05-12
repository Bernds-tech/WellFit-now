# Stufe 1 - Analyse und Dokumentation

## Kurzbefehl

Wenn Bernd `Stufe 1` schreibt, gilt dieser Modus automatisch.

## Bedeutung

```txt
Analyse + Bestandsaufnahme + Dokumentation, ohne Codeaenderung
```

## Zweck

Stufe 1 ist fuer sichere Analyseaufgaben gedacht. Der Agent darf lesen, pruefen, dokumentieren und Empfehlungen abgeben, aber keine Produktlogik oder UI veraendern.

## Pflichtablauf

1. Ziel verstehen
2. bestehende Source-of-Truth-Dateien lesen
3. betroffene Seiten, APIs, Features und Todos erfassen
4. bestehende Dokumentation und offene Aufgaben pruefen
5. Risiken, Dopplungen und offene Entscheidungen dokumentieren
6. Vorschlag fuer naechste Schritte erstellen
7. keine Produktlogik aendern
8. kein Live-Deploy

## Erlaubt

- Repository analysieren
- Routen/API-/Feature-Register pruefen
- Todo-Dopplungen erkennen
- Decision-Log-Vorschlaege vorbereiten
- Dokumentationsvorschlaege machen
- Risiken und Blocker beschreiben

## Nicht erlaubt

- Code veraendern
- Firebase-/Firestore-Regeln veraendern
- UI umbauen
- APIs veraendern
- Production Deploy
- Secrets lesen oder offenlegen

## Ergebnis

- Analysebericht
- betroffene Dateien/Routen/APIs
- Risiken
- offene Entscheidungen
- empfohlene naechste Stufe
