# WellFit Buddy – Product UI Contract Draft

Status: Draft fuer skalierbare AR-Buddy-Produkt-UI
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Dieses Dokument trennt die spaetere Nutzer-/Produkt-UI klar vom aktuellen Unity-Debug-Overlay.

Der aktuelle `BuddyCallDebugController` ist nur fuer Entwicklung und Android-Retest gedacht. Die echte Nutzeroberflaeche braucht eine eigene, skalierbare, einfache und sichere UI-Schicht.

---

## Grundregel

Produkt-UI zeigt nur nutzerverstaendliche Hinweise und Aktionen.

Produkt-UI zeigt nicht:

- interne Debug-Diagnosen
- technische Controller-Fehler ungefiltert
- Eventpayloads
- Reward-/XP-/Token-Autoritaet
- NFT-/Trading-/Presale-Funktionen
- Anti-Cheat-Urteile

---

## Zielgruppen

Die AR-Buddy-Produkt-UI muss funktionieren fuer:

- Kinder
- Familien
- Erwachsene
- Senioren
- Schulen
- spaetere Partner-/Museums-/Tourismus-Missionen

Daher gelten:

- kurze Saetze
- klare Sprache
- freundliche Hinweise
- keine medizinischen Diagnosen
- keine ueberfordernde technische Anzeige

---

## Geplante Product-UI-Komponenten

### 1. BuddyProductHintView

Kurze allgemeine Hinweise anzeigen.

Beispiele:

```txt
Ich bin bereit.
Zeig mir kurz den Boden.
Das ist noch zu weit fuer mich.
Ich komme wieder zu dir.
```

### 2. BuddyProductActionPrompt

Eine konkrete Nutzeraktion bestaetigen oder anbieten.

Beispiele:

```txt
Soll ich zu dir kommen?
Soll ich zu diesem Punkt laufen?
Wollen wir diese Mission starten?
```

### 3. BuddyProductGuideBubble

Buddy spricht als Guide, Missionsfuehrer oder Hinweisgeber.

Beispiele:

```txt
Ich habe eine passende AR-Mission gefunden.
Da oben ist ein Hinweis.
Wir koennen zuerst eine sichere Flaeche suchen.
```

### 4. BuddyProductSurfaceHint

Surface-/Plane-Hinweise nutzerfreundlich anzeigen.

Beispiele:

```txt
Zeig mir kurz eine freie Flaeche.
Ich sehe den Boden noch nicht gut genug.
Halte die Kamera kurz ruhiger.
```

### 5. BuddyProductAbilityHint

Fehlende Faehigkeiten oder Ausruestung erklaeren, ohne Kaufdruck.

Beispiele:

```txt
Dafuer brauche ich spaeter eine Sprung-Faehigkeit.
Wir koennen einen anderen Weg suchen.
Vielleicht finden wir einen Hinweis in der Naehe.
```

### 6. BuddyProductSafetyHint

Sichere, altersgerechte AR-Nutzung unterstuetzen.

Beispiele:

```txt
Bleib bitte kurz stehen, wenn du dich umschaust.
Achte auf deine Umgebung.
Frag einen Erwachsenen, wenn du unsicher bist.
```

---

## Trennung von Debug und Produkt

### Debug-UI

```txt
zeigt Diagnosen
hat viele Buttons
ist nur fuer Entwickler/QA
kann OnGUI nutzen
wird per Dev-Flag oder Debug-Szene begrenzt
```

### Produkt-UI

```txt
zeigt kurze Hinweise
hat wenige klare Aktionen
ist nutzerfreundlich
ist lokalisiert/sprachfaehig
enthaelt keine technischen Debug-Daten
```

---

## Produkt-UI darf niemals autorisieren

[!] keine Punkte
[!] keine XP
[!] keine Rewards
[!] keine Mission Completion
[!] keine Token/WFT
[!] keine NFTs
[!] keine Jackpot-/Burn-Logik
[!] keine Leaderboards
[!] keine Anti-Cheat-Entscheidung
[!] keine Item-/Faehigkeitsfreischaltung

Produkt-UI zeigt nur Status/Hinweis, den App/Backend oder lokale AR-Schicht liefern.

---

## UI-State Draft

Spaeter moegliches Datenobjekt:

```json
{
  "contractVersion": "buddy-product-ui-v1",
  "hintType": "surfaceHint",
  "severity": "info",
  "messageKey": "surface.showFloor",
  "fallbackText": "Zeig mir kurz den Boden.",
  "allowedActions": ["retryScan"],
  "debugOnly": false
}
```

Geplante `hintType` Werte:

```txt
status
surfaceHint
movementHint
abilityHint
guideHint
safetyHint
errorHint
```

Geplante `severity` Werte:

```txt
info
success
warning
blocked
```

---

## Lokalisierung / Tonalitaet

Texte sollen spaeter nicht hart in vielen Unity-Dateien verstreut werden.

Geplant:

[ ] zentrale Message Keys
[ ] fallbackText fuer Testbuilds
[ ] spaetere App-/Backend- oder Localization-Anbindung
[ ] altersgerechte Varianten
[ ] Familien-/Kinder-Modus
[ ] neutrale Seniorentauglichkeit

Beispiel Message Keys:

```txt
surface.showFloor
surface.notFound
movement.tooFar
movement.tooHigh
buddy.returning
ability.missing.jumpBoost
guide.missionSuggested
safety.watchEnvironment
```

---

## UX-Regeln

1. Eine Meldung pro Moment, nicht mehrere technische Texte gleichzeitig.
2. Hinweis kurz halten.
3. Freundliche Sprache verwenden.
4. Kein Kaufdruck bei fehlender Faehigkeit.
5. Erst faire Alternative anbieten.
6. Bei Kindern klare Sicherheits-/Umgebungshinweise.
7. Debug-Fehler fuer Entwickler loggen, aber Nutzertext freundlich uebersetzen.

---

## Skalierungsregel

Neue Product-UI-Funktion erst aufnehmen, wenn definiert ist:

1. welcher HintType verwendet wird
2. welcher Message Key verwendet wird
3. ob sie Produkt oder Debug ist
4. welche User Action erlaubt ist
5. welches Event optional an App/Backend gemeldet wird
6. welche Autoritaet ausdruecklich ausgeschlossen ist

---

## Naechste Micro-Tasks

[ ] Nach Unity-Retest entscheiden, ob Produkt-Hinweise direkt in Unity oder teilweise App-seitig gerendert werden.
[ ] `BuddyProductHintView` planen, aber nicht vor Compile-Test implementieren.
[ ] Message-Key-Liste mit App-/Mobile-UI abstimmen.
[ ] Debug-Overlay nach erfolgreichem Test von Produkt-UI trennen.
[ ] Guide-/Ability-/Surface-Hinweise mit Contracts verbinden.

---

## Status

Dieser Contract ist bewusst ein Planungsdokument. Er schuetzt WellFit davor, aus dem aktuellen Debug-Overlay eine unskalierbare Produktseite zu machen.
