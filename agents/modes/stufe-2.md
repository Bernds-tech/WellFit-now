# Stufe 2 - Kleine sichere Umsetzung

## Kurzbefehl

Wenn Bernd `Stufe 2` schreibt, gilt dieser Modus automatisch.

## Bedeutung

```txt
Kleine sichere Aenderungen + Dokumentation + begrenzte Tests
```

## Zweck

Stufe 2 ist fuer risikoarme Aenderungen gedacht, zum Beispiel Texte, Dokumentation, kleine UI-Korrekturen, offensichtliche Tippfehler, Index-/Todo-Ergaenzungen oder klar abgegrenzte Refactors ohne Produktlogik.

## Pflichtablauf

1. Ziel verstehen
2. Source-of-Truth-Dateien lesen
3. betroffene Dateien und Seiten identifizieren
4. bestehende Todos pruefen
5. kleine Aenderung in eigenem Branch/PR vorbereiten
6. relevante Dokumentation aktualisieren
7. Self Check kurz ausfuehren
8. passende lokale Checks nennen
9. kein Live-Deploy

## Erlaubt

- Dokumentationsdateien aktualisieren
- Todo-Index ergaenzen
- Tippfehler/Encoding-Texte beheben
- kleine UI-/Textkorrekturen
- PR-Kommentare und Arbeitsanker anlegen
- project-register ergaenzen

## Nicht erlaubt ohne Eskalation auf Stufe 3 oder 4

- komplexe Produktlogik umbauen
- APIs inhaltlich veraendern
- Firebase-/Firestore-Regeln verschaerfen
- Economy-/Reward-Autoritaet veraendern
- groessere Refactors
- Production Deploy

## Ergebnis

- kleiner PR oder konkrete Datei-Aenderung
- dokumentierte betroffene Dateien
- empfohlener Testbefehl
- naechster Schritt
