# WellFit – Buddy Voice Command Contract

Status: Draft fuer spaetere Sprachbefehle an den AR-Buddy
Branch-Kontext: `wellfit/upload-local-unity-ar-buddy`
PR-Kontext: #13

---

## Zweck

Dieses Dokument definiert erste Sprach-Intents und deren Mapping auf sichere App-/Unity-Commands oder Product-UI-Hinweise.

Sprache ist eine Eingabeform. Sie ersetzt keine Backend-Autoritaet.

---

## Grundregel

Ein Voice Intent darf nur:

```txt
Command vorschlagen
Product Hint ausloesen
Guide-Frage stellen
UI-Aktion starten
```

Ein Voice Intent darf niemals direkt:

```txt
Punkte buchen
XP buchen
Reward vergeben
Mission abschliessen
Token/WFT ausgeben
NFT freischalten
Anti-Cheat entscheiden
Item/Faehigkeit freischalten
```

---

## Voice Intent Envelope

```json
{
  "contractVersion": "buddy-voice-v1",
  "source": "voice",
  "rawText": "Buddy komm her",
  "intent": "callBuddyToUser",
  "confidence": 0.86,
  "requiresConfirmation": false,
  "locale": "de-AT",
  "debugOnly": false
}
```

---

## Intent: callBuddyToUser

Beispiele:

```txt
Buddy komm her
Komm zu mir
Komm bitte zurueck
```

Aktion:

```txt
Unity Command: callBuddyToUser
Product Hint: buddy.returning.default
```

Confirmation:

```txt
false
```

---

## Intent: askNextMission

Beispiele:

```txt
Was machen wir als naechstes?
Gib mir eine Mission.
Was ist meine naechste Aufgabe?
```

Aktion:

```txt
App/Backend fragt Buddy-KI oder Rules-Fallback.
Danach optional Unity Command: applyGuideSuggestion
```

Product Hint:

```txt
guide.missionSuggested.default
```

Confirmation:

```txt
optional
```

---

## Intent: askForHint

Beispiele:

```txt
Gib mir einen Hinweis.
Wo ist der Hinweis?
Hilf mir kurz.
```

Aktion:

```txt
App/Backend prueft aktuellen Guide-/Mission-Kontext.
Unity zeigt nur Hinweis.
```

Product Hint:

```txt
guide.hintNearby.default
```

---

## Intent: askWhyRejected

Beispiele:

```txt
Warum geht das nicht?
Warum kommst du da nicht hin?
Was ist passiert?
```

Aktion:

```txt
App liest letzten Reject/Event-Kontext.
Product UI erklaert nutzerfreundlich.
```

Moegliche Mappings:

```txt
no-plane-hit -> surface.notFound.default
target-too-far -> movement.tooFar.default
height-too-large -> movement.tooHigh.default
capability-missing -> ability.missing.<capabilityId>
```

---

## Intent: askMissingAbility

Beispiele:

```txt
Was fehlt dir dafuer?
Kannst du springen?
Kannst du klettern?
```

Aktion:

```txt
App/Backend prueft AbilityState.
Unity/Product UI erklaert fehlende Faehigkeit.
```

Product Hint:

```txt
ability.missing.jumpBoost
ability.missing.climbUp
ability.alternative.default
```

---

## Intent: repeatLastHint

Beispiele:

```txt
Sag das nochmal.
Wiederhol den Hinweis.
Nochmal bitte.
```

Aktion:

```txt
App wiederholt letzten Product Hint oder Guide Text.
```

---

## Intent: clearGuide

Beispiele:

```txt
Lass das.
Abbrechen.
Stopp die Mission.
Zeig mir das nicht mehr.
```

Aktion:

```txt
Unity Command: clearGuide
```

Hinweis:

```txt
Nur Guide-/UI-Zustand leeren. Keine serverseitige Mission loeschen, ausser Backend bestaetigt es.
```

---

## Intent: muteBuddy / unmuteBuddy

Beispiele:

```txt
Sei leise.
Ton aus.
Sprich wieder.
Ton an.
```

Aktion:

```txt
App schaltet TTS-Ausgabe lokal aus/an.
```

Keine Unity-/Backend-Autoritaet noetig.

---

## Confidence-Regeln

```txt
confidence >= 0.80 -> direkt ausfuehrbar, wenn risikoarm
0.50 - 0.79 -> Rueckfrage/Confirmation
< 0.50 -> nicht verstanden
```

Nicht verstanden:

```txt
Ich habe dich nicht gut verstanden.
Versuch es bitte noch einmal.
```

Message Key Vorschlag:

```txt
voice.notUnderstood.default
```

---

## Confirmation-Regeln

Direkt moeglich:

```txt
callBuddyToUser
repeatLastHint
muteBuddy
unmuteBuddy
```

Bestaetigung sinnvoll:

```txt
startSuggestedMission
clearGuide
```

Backend-Pruefung noetig:

```txt
askNextMission
askForHint
askMissingAbility
```

---

## Locale / Sprache

Erste Zielsprachen:

```txt
de-AT
de-DE
en-US
en-GB
```

MVP:

```txt
de-AT/de-DE zuerst
```

---

## Datenschutz

Voice Commands brauchen:

```txt
Mikrofon-Consent
sichtbaren Aufnahmezustand
Push-to-Talk als erster Modus
Möglichkeit, Ton zu deaktivieren
keine heimliche Daueraufnahme
```

---

## Verbindung zu Commands

Voice Intent -> App Command -> Unity Command

Beispiel:

```txt
callBuddyToUser -> BUDDY_COMMAND_CONTRACT.callBuddyToUser
askNextMission -> /api/buddy-ki -> applyGuideSuggestion
askMissingAbility -> Product Hint + optional onBuddyCapabilityNeeded
```

---

## Nicht vor Retest implementieren

[!] Keine Voice Runtime vor Unity Compile-/Android-Retest.
[!] Kein Mikrofonzugriff ohne Consent-Flow.
[!] Keine direkte Reward-/Completion-Kopplung.

---

## Status

[x] Voice Intent Contract definiert.
[ ] Runtime-Implementierung offen.
