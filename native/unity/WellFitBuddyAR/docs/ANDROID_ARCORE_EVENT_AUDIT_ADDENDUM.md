# WellFitBuddyAR – Android ARCore Event Audit Addendum

Stand: 2026-04-28

## Pflichtschritt vor erstem Android-ARCore-Build

Vor dem ersten Unity-Compile muessen die aktuellen C#-Vorlagen aus `Scripts/*.cs.txt` nach `Assets/Scripts/*.cs` kopiert werden.

macOS/Linux/Git Bash:

```bash
cd native/unity/WellFitBuddyAR
./tools/copy-scripts.sh
```

Windows PowerShell:

```powershell
cd native/unity/WellFitBuddyAR
./tools/copy-scripts.ps1
```

## Erwartete Erfolgsmeldung

```txt
Event contract audit passed
```

## Wenn der Audit fehlschlaegt

Keinen Android-Build starten.

Erst die gemeldeten alten Eventnamen in `Assets/Scripts/*.cs` oder den betroffenen `.cs.txt`-Vorlagen bereinigen und das Copy-Skript erneut ausfuehren.

## Hintergrund

Die Unity-Bridge, die Web-/PWA-Schicht und das Backend muessen dieselben AR-Eventnamen verwenden. Alte lokale Unity-Script-Kopien koennen sonst Events senden, die in der TypeScript-Bridge nicht vorgesehen sind.

## Aktuell blockierte alte Eventnamen

```txt
onBuddyGuideContextUpdated
onBuddyGuideStepExplained
onBuddyGuideContextCleared
onBuddyDialogueCleared
```

## Sicherheitsgrenze

Unity meldet nur AR-Ereignisse. App und Backend entscheiden spaeter ueber Evidence, Review, Completion und interne Fortschrittslogik.
