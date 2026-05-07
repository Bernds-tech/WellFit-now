# WellFit – Buddy Voice Interaction Architecture

Status: Draft fuer spaetere Sprachinteraktion mit dem AR-Buddy
Branch-Kontext: `wellfit/upload-local-unity-ar-buddy`
PR-Kontext: #13

---

## Zweck

Der WellFit-Buddy soll spaeter nicht nur schreiben oder Text anzeigen, sondern mit dem Nutzer sprechen und gesprochene Befehle verstehen koennen.

Dieses Dokument trennt Sprachaufnahme, Spracherkennung, Intent-Verstehen, Antwortgenerierung, Text-to-Speech und Unity-Visualisierung sauber voneinander.

---

## Zielbild

Nutzer sagt z. B.:

```txt
Buddy, komm her.
Was ist meine naechste Mission?
Zeig mir den Hinweis.
Warum kannst du da nicht hin?
```

Der Buddy kann antworten:

```txt
Ich komme zu dir.
Zeig mir kurz eine freie Flaeche.
Dafuer brauche ich spaeter eine Sprung-Faehigkeit.
Ich habe eine passende AR-Mission gefunden.
```

---

## Schichtenmodell

```txt
Microphone / Voice Input
        |
        v
Speech-to-Text / Wake Phrase / Intent Capture
        |
        v
App/Backend Intent Router
        |
        v
Buddy KI / Rules Fallback / Safety Layer
        |
        v
Command oder Product UI Hint
        |
        v
Unity AR Buddy visualisiert
        |
        v
Text-to-Speech / Voice Output
```

---

## Harte Grundregel

Sprache ist nur Eingabe- und Ausgabeschicht.

Gesprochene Befehle duerfen nicht direkt autorisieren:

```txt
Punkte
XP
Rewards
Mission Completion
Token/WFT
NFTs
Jackpot/Burn
Leaderboard
Anti-Cheat
Item Ownership
Ability Ownership
```

App/Backend bleiben Autoritaet.

---

## Verantwortlichkeiten

### Mobile/App

Darf:

- Mikrofonzugriff mit Consent starten
- Sprache aufnehmen
- Speech-to-Text lokal oder ueber erlaubten Provider anstossen
- Intent an Backend/App-Router geben
- erkannte Intents in Unity Commands umwandeln
- Text-to-Speech fuer Buddy-Antwort ausgeben

Darf nicht:

- Reward/Completion aus Sprachbefehl autorisieren
- heimlich dauerhaft mithoeren
- Audio ohne Consent senden

### Backend / Buddy KI

Darf:

- Intent klassifizieren
- sichere Antwort erzeugen
- Mission Preview vorschlagen
- fehlende Faehigkeiten erklaeren
- alters-/familiengerechte Sprache waehlen

Darf nicht:

- medizinische Diagnosen geben
- Reward/Completion ohne serverseitige Validierung freigeben

### Unity

Darf:

- Buddy-Reaktion visualisieren
- Mund-/Idle-/Look-Animation spaeter abspielen
- AR-Command ausfuehren, z. B. Buddy rufen
- Events melden

Darf nicht:

- Sprache selbst als Autoritaet behandeln
- Rewards/Completion/Economy entscheiden

---

## Voice Input Modi

### 1. Push-to-Talk

Nutzer drueckt Mikrofon-Button.

Vorteile:

```txt
klarer Consent
einfacher Datenschutz
weniger Fehlaktivierung
MVP-tauglich
```

Empfehlung fuer MVP.

### 2. Wake Phrase spaeter

Beispiel:

```txt
Hey Buddy
Buddy, komm her
```

Nur spaeter, mit klaren Datenschutz- und Plattformpruefungen.

### 3. Vollstaendiger Voice Chat spaeter

Freies Gespraech mit dem Buddy.

Nur spaeter, wenn Safety, Kosten, Latenz und Datenschutz geklaert sind.

---

## Voice Output Modi

### 1. Text + optional TTS

MVP-nahe:

- Text bleibt sichtbar
- TTS kann optional vorgelesen werden
- Nutzer kann Ton deaktivieren

### 2. TTS-first

Spaeter:

- Buddy spricht hauptsaechlich
- Text optional als Untertitel
- gut fuer AR-Immersion

### 3. Avatar Voice Personality

Spaeter:

- Hund/Drache/Roboter/Ritter koennen unterschiedliche Stimmen/Tonalitaeten haben
- Stimme folgt PersonalityProfile
- kinder-/familiengeeignet

---

## Intent-Kategorien

Erste geplante Intents:

```txt
callBuddyToUser
startSuggestedMission
askNextMission
askForHint
askWhyRejected
askMissingAbility
repeatLastHint
clearGuide
stopListening
muteBuddy
unmuteBuddy
```

---

## Beispiel-Intent: Buddy rufen

Gesprochene Varianten:

```txt
Buddy, komm her.
Komm zu mir.
Komm bitte zurueck.
```

Intent:

```json
{
  "intent": "callBuddyToUser",
  "confidence": 0.86,
  "source": "voice",
  "requiresConfirmation": false
}
```

App Command an Unity:

```txt
callBuddyToUser
```

Buddy Antwort:

```txt
Ich komme zu dir.
```

Message Key:

```txt
buddy.returning.default
```

---

## Beispiel-Intent: Fehlende Faehigkeit erklaeren

Gesprochene Varianten:

```txt
Warum kannst du da nicht hoch?
Was fehlt dir dafuer?
Kannst du springen?
```

Intent:

```json
{
  "intent": "askMissingAbility",
  "capabilityId": "jumpBoost",
  "source": "voice"
}
```

Buddy Antwort:

```txt
Dafuer brauche ich spaeter eine Sprung-Faehigkeit.
```

Message Key:

```txt
ability.missing.jumpBoost
```

---

## Beispiel-Intent: Naechste Mission

Gesprochene Varianten:

```txt
Was machen wir als naechstes?
Gib mir eine Mission.
Was ist meine naechste Aufgabe?
```

Intent:

```json
{
  "intent": "askNextMission",
  "source": "voice"
}
```

Backend/App:

- prueft Kontext
- nutzt Rules Fallback oder Buddy KI
- liefert Mission Preview

Unity:

- zeigt Vorschlag nur an
- keine Completion
- keine Rewards

---

## Datenschutz / Consent

Vor Voice Input erforderlich:

```txt
Mikrofon-Erlaubnis
klarer Hinweis, wann aufgenommen wird
Push-to-Talk als Standard
Ton stumm schaltbar
keine heimliche Daueraufnahme
Kinder-/Familienmodus besonders vorsichtig
```

Audio sollte im MVP moeglichst nicht dauerhaft gespeichert werden.

---

## Latenz-Ziel

Grobe Zielwerte:

```txt
Push-to-Talk Start: sofort sichtbar
Speech-to-Text: moeglichst unter 1-2 Sekunden
Buddy Antwort: moeglichst unter 2-4 Sekunden
Unity Animation: sofortige lokale Reaktion, auch wenn Antwort noch laedt
```

Fallback:

```txt
Ich denke kurz nach.
Ich habe dich nicht gut verstanden.
Versuch es bitte noch einmal.
```

---

## Offline / Fallback

Wenn Speech-/KI-Service nicht verfuegbar ist:

- einfache lokale Commands koennen weiter funktionieren, z. B. Buddy rufen
- komplexe Fragen fallen auf Text/UI oder Rules-Fallback zurueck
- keine Reward-/Completion-Auswirkung

---

## Verbindung zu bestehenden Contracts

Relevant:

```txt
BUDDY_COMMAND_CONTRACT.md
BUDDY_PRODUCT_UI_CONTRACT.md
BUDDY_PRODUCT_UI_MESSAGE_KEYS.md
BUDDY_PRODUCT_UI_FLOW_PLAN.md
BUDDY_MOBILE_UNITY_BRIDGE_PLAN.md
BUDDY_AVATAR_PERSONALITY_PROFILES.md
```

---

## Nicht im MVP

[>] dauerhafte Wake-Word-Erkennung
[>] freie Langzeitgespraeche ohne klare Grenzen
[>] Stimmenklonen
[>] medizinische Beratung
[>] automatische Belohnung durch Sprachbefehl
[>] heimliche Audio-Speicherung

---

## Naechste Micro-Tasks nach Unity-Retest

[ ] Voice Command Contract anlegen.
[ ] Voice Consent Flow fuer Mobile planen.
[ ] Push-to-Talk als ersten Modus definieren.
[ ] TTS-Ausgabe als optionalen Product-UI-Kanal planen.
[ ] Intent Mapping mit Command Contract verbinden.
[ ] PersonalityProfile mit Voice Tone verbinden.

---

## Status

[x] Spracharchitektur als getrennte Schicht definiert.
[ ] Keine Runtime-Implementierung vor Unity-Retest.
