# WELLFIT – ALPHA SCOPE CUT

Status: Verbindliche Produktentscheidung für testbare Alpha/Beta
Kontext: MVP-Fokus, AR-Buddy, Missionen, interne Punkte/XP, Backend-Sicherheit
Ziel: WellFit nicht als „alles auf einmal“ fertigstellen, sondern konsequent auf eine spielbare, sichere und testbare erste Version zuschneiden.

---

## 1. Leitfrage ab jetzt

Bei jeder Aufgabe gilt ab sofort:

```txt
Hilft das direkt zur testbaren Alpha?
```

Wenn ja:

```txt
Priorisieren.
```

Wenn nein:

```txt
Nicht löschen, sondern Backlog / später.
```

---

## 2. Alpha-Kern

Die erste fertige WellFit-Version braucht nicht alles.

Sie braucht zuerst:

```txt
1. stabile Mobile-/AR-App
2. funktionierenden sichtbaren KI-Buddy
3. spielbare Missionen / Challenges
4. interne Punkte / XP
5. serverseitige Reward- und Completion-Validierung
6. keine manipulierbare Client-Logik
7. einfache, schöne Nutzerführung
8. echte Tests mit Nutzern
```

---

## 3. Unbedingt nötig für Alpha / Beta

Ohne diese Bausteine ist WellFit kein belastbares Produkt:

```txt
[x] Login / Registrierung
[x] Nutzerprofil als Produktkern berücksichtigen
[x] Mobile-/AR-Grundfunktion priorisieren
[x] KI-Buddy als sichtbarer Begleiter priorisieren
[x] Missionen / Challenges als Game Loop priorisieren
[x] interne Punkte / XP priorisieren
[x] serverseitige Reward- und Completion-Logik priorisieren
[x] Firebase / Backend / Security Rules priorisieren
[x] Admin-/Debug-/QA-Grundlage priorisieren
[x] sauberes Deployment priorisieren
[x] Datenschutz / App-Store-Konformität berücksichtigen
```

Konkreter aktueller Fokus:

```txt
[ ] Unity AR-Buddy kompilieren
[ ] Android Build testen
[ ] Debug-Batch stabilisieren
[ ] Buddy platzieren / bewegen / rufen
[ ] Mission-/Guide-Events sicher melden
[ ] Backend bleibt Autorität
[ ] interne Punkteökonomie vorbereiten
[ ] keine echte Token-/NFT-/Trading-Funktion in Mobile
```

---

## 4. Wichtig, aber nicht Alpha-blockierend

Diese Punkte machen WellFit stärker, dürfen aber den ersten stabilen Build nicht blockieren:

```txt
[>] verschiedene Avatar-Tiere
[>] Avatar-Persönlichkeiten
[>] Voice-Interaktion
[>] Product-UI mit gesprochenem Buddy
[>] Backend Event Ingestion in voller Ausbaustufe
[>] volle Ability-/Item-Profile
[>] Surface Quality
[>] Tap-Zielmarker
[>] Re-Anchor-System
[>] Companion Radius final
[>] KI-Missionsvorschläge mit echtem Modell
```

Regel:

```txt
Nur umsetzen, wenn es den Alpha-Kern direkt stabiler macht.
Sonst verschieben.
```

---

## 5. Langfristige Vision, nicht Alpha-kritisch

Diese Punkte bleiben Vision/Backlog und sind nicht nötig, um WellFit zuerst fertig zu bekommen:

```txt
[>] echte NFTs
[>] echter WFT-Token
[>] Blockchain-Integration
[>] Marketplace
[>] Trading
[>] Staking
[>] DAO
[>] Voice Wake Word
[>] freier Voice Chat
[>] komplexe Avatar-Vererbung
[>] lebenslanger Avatar
[>] DePIN / Compute-as-a-Service
[>] B2B-Whitelabel-System
[>] große Partner-/Museum-/Städte-Module
```

Regel:

```txt
Nicht löschen.
Nicht in Alpha-Scope aufnehmen.
Nur als Erweiterungsbibliothek für später erhalten.
```

---

## 6. Phasenmodell

```txt
Phase 1: spielbare interne Alpha
Phase 2: AR-Buddy + Missionen stabil
Phase 3: interne Punkte/XP serverseitig
Phase 4: 100–500 echte Tester
Phase 5: 2.000–3.000 Tester
Phase 6: erst dann Token/NFT/Marketplace prüfen
```

---

## 7. Was ab jetzt verschoben wird

Für den aktuellen Fokus wird alles auf später gesetzt, was nicht direkt hilft bei:

```txt
AR-Buddy stabilisieren
Missionen spielbar machen
Punkte/XP sicher machen
Backend absichern
Mobile testen
```

Später / Backlog:

```txt
[>] NFT
[>] Token
[>] Marketplace
[>] DAO
[>] Staking
[>] DePIN
[>] B2B
[>] Voice Wake Word
[>] viele Avatar-Spezialzustände
[>] komplexe Wirtschaftssimulation
[>] große Partnerplattform
```

---

## 8. Konsequenz für den Dev-Agent

Der WellFit Dev Agent muss Alpha-Filter anwenden:

```txt
Wenn Aufgabe direkt Alpha hilft:
  priorisieren.
Wenn Aufgabe nicht direkt Alpha hilft:
  als Backlog markieren.
Wenn Aufgabe Backend/Reward/Security betrifft:
  review-required markieren.
Wenn ein zweiter Coder am Backend arbeitet:
  Backend-Dateien nicht autonom anfassen.
```

Aktueller Agent-Fokus:

```txt
[ ] Alpha-Scope beim Dry-Run berücksichtigen.
[ ] Nicht-Alpha-Aufgaben im Report sichtbar als Backlog markieren.
[ ] Backend-kritische Aufgaben nur als review-required markieren.
```

---

## 9. Konsequenz für Roadmap / ToDo

Bestehende ToDos werden nicht gelöscht.

Sie werden neu bewertet:

```txt
[ ] Alpha-kritisch / jetzt
[>] wichtig aber später
[>] langfristige Vision
[!] kritisch, aber nur mit Review / Backend-Autorität
```

---

## 10. Kurzfassung

WellFit wird nicht durch „alles“ fertig.

WellFit wird durch den stabilen Kern fertig:

```txt
Buddy
AR
Missionen
interne Punkte
Backend-Sicherheit
gute Mobile-UX
Tests
```

Alles andere bleibt Erweiterungsbibliothek für später.
