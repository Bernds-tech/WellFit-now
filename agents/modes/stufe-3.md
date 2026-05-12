# Stufe 3 - Umsetzung mit Tests und Preview

## Kurzbefehl

Wenn Bernd `Stufe 3` schreibt, gilt dieser Modus automatisch.

## Bedeutung

```txt
Code-/UI-/Feature-Aenderung + Tests + Dokumentation + Preview, aber ohne vollstaendigen autonomen Nebenseiten-Crawl
```

## Zweck

Stufe 3 ist fuer konkrete Entwicklungsaufgaben gedacht, bei denen Code, UI oder API-Logik angepasst werden darf, aber der Umfang klar begrenzt ist. Der Agent arbeitet strukturiert, testet und dokumentiert, muss aber nicht wie Stufe 4 das gesamte Projekt mit allen Nebenseiten vollstaendig durchlaufen.

## Pflichtablauf

1. Ziel verstehen
2. Source-of-Truth-Dateien lesen
3. betroffene Seiten/APIs/Features identifizieren
4. bestehende Todos pruefen
5. Code oder UI in eigenem Branch/PR aendern
6. relevante Tests ausfuehren oder nennen
7. Fehler im Aufgabenbereich beheben
8. Dokumentation und Register aktualisieren
9. Preview/Pull Request liefern
10. nicht live schalten

## Erlaubt

- UI-Komponenten anpassen
- klar begrenzte Feature-Arbeit
- API-Vorstufen und Preview-Logik bearbeiten
- Tests und Quality Gate vorbereiten/ausfuehren
- Dokumentation und Register aktualisieren

## Nicht erlaubt ohne ausdrueckliche Freigabe

- Production Deploy
- echte Economy-Autoritaet aktivieren
- echte Token-/NFT-/WFT-/Wallet-/Kauf-Funktionen aktivieren
- Firestore-Rules produktiv verschaerfen ohne Testplan
- grossflaechige Architekturumbauten ohne Decision Log

## Unterschied zu Stufe 4

Stufe 3 prueft alle direkt betroffenen Seiten und Abhaengigkeiten.

Stufe 4 prueft zusaetzlich systematisch Hauptseiten, Nebenseiten, Routenregister, APIs, Todo-Register, Cross-References, Self-Check und Dokumentation im Vollmodus.

## Ergebnis

- Pull Request oder klarer Patch
- Test-/Build-Hinweise
- Preview-Hinweis
- aktualisierte Dokumentation
- bekannte Restrisiken
