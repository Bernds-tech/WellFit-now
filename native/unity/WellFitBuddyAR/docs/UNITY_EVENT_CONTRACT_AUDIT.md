# WellFitBuddyAR – Unity Event Contract Audit

Stand: 2026-04-28

## Zweck

Diese Notiz dokumentiert den Abgleich der Unity-C#-Vorlagen mit dem bestehenden WellFit AR Event Contract vor dem ersten Android-ARCore-Testbuild.

## Ergebnis

Die wichtigen Unity-Vorlagen wurden so angepasst, dass sie vorhandene Contract-Events verwenden.

### BuddyKiGuideController.cs.txt

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

### BuddyDialogueEventBridge.cs.txt

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

## Sicherheitsgrenze

Unity bleibt nur AR-Event-Sender. App und Backend entscheiden spaeter ueber Evidence, Completion und interne Fortschrittslogik.
