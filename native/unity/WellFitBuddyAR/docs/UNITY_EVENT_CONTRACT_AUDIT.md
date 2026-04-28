# WellFitBuddyAR – Unity Event Contract Audit

Stand: 2026-04-28

## Zweck

Diese Notiz dokumentiert den Abgleich der Unity-C#-Vorlagen mit dem bestehenden WellFit AR Event Contract vor dem ersten Android-ARCore-Testbuild.

Unity, Web-/PWA-Fallback, TypeScript-Bridge und spaeter Backend-Evidence-Pfade sollen dieselben Eventnamen sprechen.

## Ergebnis

Die wichtigen Unity-Vorlagen wurden so angepasst, dass sie vorhandene Contract-Events verwenden.

## Erlaubte Unity-Events fuer v1

Diese Eventnamen sind fuer die aktuellen Unity-Vorlagen vorgesehen:

```txt
onArReady
onPlaneDetected
onAnchorCreated
onBuddyPlaced
onBuddyActionStarted
onBuddyActionCompleted
onBuddyActionRejected
onBuddyReachedSurface
onBuddyContextUpdated
onBuddyDialogueShown
onBuddyDialogueCompleted
onBuddyMissionSuggested
onBuddyCapabilityNeeded
onBuddyMissionProgress
onArHintMarkerCreated
onArHintMarkerFocused
onArHintMarkerResolved
onArError
```

## Aktuell blockierte Alt-Events

Diese alten oder nicht typisierten Eventnamen duerfen nicht mehr in `Assets/Scripts/*.cs` auftauchen:

```txt
onBuddyGuideContextUpdated
onBuddyGuideStepExplained
onBuddyGuideContextCleared
onBuddyDialogueCleared
```

Die Copy-Skripte pruefen diese Namen automatisch nach dem Kopieren.

## BuddyKiGuideController.cs.txt

Verwendete Eventnamen:

```txt
onBuddyContextUpdated
onBuddyDialogueShown
onBuddyMissionProgress
onBuddyMissionSuggested
onBuddyCapabilityNeeded
```

Nicht mehr verwenden:

```txt
onBuddyGuideContextUpdated
onBuddyGuideStepExplained
onBuddyGuideContextCleared
```

## BuddyDialogueEventBridge.cs.txt

Verwendete Eventnamen:

```txt
onBuddyDialogueShown
onBuddyDialogueCompleted
```

Ein geloeschter oder geleerter Dialog wird als `onBuddyDialogueCompleted` mit Status `cleared` gemeldet.

Nicht mehr verwenden:

```txt
onBuddyDialogueCleared
```

## Build-Hinweis

Vor dem Kopieren nach Unity sollte darauf geachtet werden, dass `Assets/Scripts/*.cs` aus den aktuellen `.cs.txt`-Vorlagen erzeugt wird und keine alten Script-Kopien mit alten Eventnamen im Unity-Projekt verbleiben.

Pflicht-Erfolgsmeldung der Copy-Skripte:

```txt
Event contract audit passed
```

## Sicherheitsgrenze

Unity bleibt nur AR-Event-Sender. App und Backend entscheiden spaeter ueber Evidence, Completion und interne Fortschrittslogik.

Unity darf keine Rewards, XP, Punkte, WFT/Token, Jackpot, Burn, Leaderboards oder finale Mission Completion autorisieren.
