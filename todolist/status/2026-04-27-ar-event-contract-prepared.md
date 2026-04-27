# Statusnotiz – AR Event Contract vorbereitet

Datum: 2026-04-27

## Ergebnis

[x] AR Event Contract angelegt.
[x] Scene Setup mit AR Event Contract verknuepft.
[x] Unity/App/Backend-Grenze klar dokumentiert.
[x] Events fuer Buddy-Platzierung, Aktionen, Dialog, Missionsempfehlung, Capability-Hinweise und Marker vorbereitet.

## Neue / aktualisierte Dateien

- `native/unity/WellFitBuddyAR/docs/AR_EVENT_CONTRACT.md`
- `native/unity/WellFitBuddyAR/docs/SCENE_SETUP.md`

## Wichtige Events

- `onArReady`
- `onPlaneDetected`
- `onAnchorCreated`
- `onBuddyPlaced`
- `onBuddyActionStarted`
- `onBuddyActionCompleted`
- `onBuddyActionRejected`
- `onBuddyReachedSurface`
- `onBuddyDialogueShown`
- `onBuddyMissionSuggested`
- `onBuddyCapabilityNeeded`
- `onArHintMarkerCreated`
- `onArHintMarkerFocused`
- `onArHintMarkerResolved`
- `onArError`

## Sicherheitsgrenze

Unity meldet nur AR-Ereignisse. Backend/App entscheidet ueber Mission, Evidence, Anti-Cheat, Completion und spaetere interne Rewards.

## Naechster Block

[ ] WellFit App Bridge Contract fuer NativeArBridge mit diesen Events abgleichen.
[ ] TypeScript Event Types fuer AR/Buddy Events ergaenzen.
[ ] Mobile UI vorbereiten, um AR-Events aus Unity spaeter entgegenzunehmen.
