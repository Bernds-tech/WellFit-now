# WellFit – Buddy Mobile AR Product Integration Map

Status: Draft fuer spaetere Integration von Mobile AR, Unity Buddy, Product UI und Backend
Branch-Kontext: `wellfit/upload-local-unity-ar-buddy`
PR-Kontext: #13

---

## Zweck

Dieses Dokument zeigt, wie die bestehenden WellFit-Mobile-/AR-Bereiche spaeter mit dem Unity AR Buddy verbunden werden koennen.

Es ist ein Integrationsplan, keine Implementierung.

---

## Beteiligte Schichten

```txt
Mobile Web/App UI
Buddy KI API / Rules Fallback
Native/Unity Bridge
Unity AR Buddy
Product UI Hints
Event Router
Backend Event API
Mission/Reward Backend
```

---

## Grundsatz

Jede Schicht hat eine klare Aufgabe.

```txt
Mobile UI = Nutzerfuehrung und App-Kontext
Buddy KI = Vorschlaege und Textlogik
Unity = AR-Visualisierung und Events
Product UI = einfache Hinweise
Event Router = Ereignisse sortieren
Backend = Autoritaet und Audit
```

---

## Aktueller bekannter Stand

```txt
/mobile/ar besitzt AR-Guide-Panel
/api/buddy-ki existiert
Rules-Fallback existiert
Unity besitzt WellFitNativeBridge
Unity besitzt Debug-/Guide-/Ability-Events
```

Der echte Mobile-Unity-Bridge-Code wird erst nach Unity-Retest priorisiert.

---

## Ziel-Flow: Missionsempfehlung

1. Mobile UI fragt Buddy KI/API nach Vorschlag.
2. Backend/API liefert Mission Preview oder Fallback.
3. Mobile zeigt Text im App-UI.
4. Mobile sendet `applyGuideSuggestion` an Unity.
5. Unity zeigt Buddy-Guide-Hinweis.
6. Unity meldet `onBuddyMissionSuggested`.
7. Mobile Event Router entscheidet: UI Update, Log oder spaeter Backend Event.
8. Backend entscheidet spaeter ueber echte Completion/Rewards.

---

## Ziel-Flow: Buddy rufen

1. Nutzer tippt Product UI Button.
2. Mobile sendet `callBuddyToUser`.
3. Unity sucht AR-Flaeche und bewegt Buddy.
4. Unity meldet completed/rejected.
5. Mobile mapped Event auf Product UI Message Key.
6. Optional spaeter: Event logged-only an Backend.

---

## Ziel-Flow: Fehlende Faehigkeit

1. Backend/App kennt Ability-State.
2. Mobile sendet `applyAbilityState` an Unity.
3. Nutzer/Guide loest Ability-Versuch aus.
4. Unity meldet `onBuddyCapabilityNeeded` oder `onBuddyActionRejected`.
5. Mobile zeigt Product UI Hint.
6. App/Backend kann faire Alternative anbieten.
7. Keine automatische Freischaltung in Unity.

---

## Ziel-Flow: Surface fehlt

1. Unity Raycast findet keine Flaeche.
2. Unity meldet Reject/Error.
3. Mobile Event Router mapped auf `surface.notFound.default` oder `surface.showFreeArea.default`.
4. Product UI zeigt kurzen Hinweis.
5. Debug UI zeigt technische Details nur in Dev.

---

## Product UI Mapping

Beispiele:

```txt
onArReady -> buddy.ready.default
onBuddyPlaced -> buddy.placed.default
onBuddyActionCompleted + returnToUser -> buddy.nearUser.default
onBuddyActionRejected + no-plane-hit -> surface.notFound.default
onBuddyActionRejected + target-too-far -> movement.tooFar.default
onBuddyCapabilityNeeded + jumpBoost -> ability.missing.jumpBoost
onBuddyMissionSuggested -> guide.missionSuggested.default
```

---

## Event Router Aufgaben

Mobile Event Router soll spaeter:

```txt
Event validieren
debugOnly beachten
Product UI Message bestimmen
lokales Log schreiben
optional Backend Callable anstossen
keine Reward-/Completion-Entscheidung treffen
```

---

## Backend Kopplung

Backend-Event-API wird spaeter nur logged-only starten.

Verbindung zu:

```txt
BUDDY_BACKEND_EVENT_API_CONTRACT.md
BUDDY_EVENT_INGESTION_PLAN.md
BUDDY_BACKEND_STUB_READINESS_PLAN.md
```

---

## App Store / Mobile Grenzen

Mobile AR bleibt frei von:

```txt
Presale
Trading
Staking
NFT-Marktplatz
Token-Auszahlung
Investment-Kommunikation
```

---

## Implementierungsreihenfolge nach Unity-Retest

1. Unity Events bestaetigen.
2. Product UI Message Mapping finalisieren.
3. `callBuddyToUser` als erstes Mobile Command planen.
4. Event Router als App-Schicht planen.
5. AbilityState und GuideSuggestion spaeter ergaenzen.
6. Backend Event API logged-only vorbereiten.

---

## Offene Entscheidungen

[ ] Wird Product UI in Unity gerendert oder App-seitig ueberlagert?
[ ] Wie wird Unity in Mobile eingebettet?
[ ] Wie werden Events technisch aus Unity an App zurueckgegeben?
[ ] Welche Session-ID fuehrt Mobile?
[ ] Welche Events werden ueberhaupt an Backend gesendet?

---

## Status

[ ] Noch nicht implementieren.
[x] Integrationskarte definiert.
