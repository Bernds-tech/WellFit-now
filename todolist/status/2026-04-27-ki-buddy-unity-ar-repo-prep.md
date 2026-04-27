# Statusnotiz – KI-Buddy / Unity AR Repository-Vorbereitung

Datum: 2026-04-27

## Ergebnis

[x] Aktiver Fokus von Stufe 2 auf KI-Buddy / Unity AR Foundation umgestellt.
[x] H1 Roadmap aktualisiert.
[x] H2 Roadmap aktualisiert.
[x] J Roadmap auf KI-Buddy / Unity AR Foundation als naechsten Produktblock umgestellt.
[x] Handy als Zielgeraet klargestellt.
[x] PC/Laptop mit Unity Hub als Entwicklungswerkstatt erklaert.
[x] Android ARCore Build-Anleitung angelegt.
[x] Unity Setup Checklist angelegt.
[x] Buddy AR Muss-Kriterien angelegt.
[x] Assets/Scripts Copy Plan angelegt.
[x] Buddy KI Guide Datenmodell angelegt.

## Neue / aktualisierte Dateien

- `native/unity/WellFitBuddyAR/docs/BUDDY_AR_MUST_CRITERIA.md`
- `native/unity/WellFitBuddyAR/docs/UNITY_SETUP_CHECKLIST.md`
- `native/unity/WellFitBuddyAR/docs/HANDY_IS_TARGET_DEVICE.md`
- `native/unity/WellFitBuddyAR/docs/ANDROID_ARCORE_BUILD.md`
- `native/unity/WellFitBuddyAR/docs/ASSETS_SCRIPTS_COPY_PLAN.md`
- `docs/architecture/BUDDY_KI_GUIDE_DATA_MODEL.md`
- `native/unity/WellFitBuddyAR/README.md`
- `native/unity/WellFitBuddyAR/Scripts/README.md`

## C#-Vorlagen

- `WellFitNativeBridge.cs.txt`
- `BuddyController.cs.txt`
- `BuddyAnchorController.cs.txt`
- `BuddyLookAtCamera.cs.txt`
- `BuddySurfaceNode.cs.txt`
- `BuddyNavigationController.cs.txt`
- `BuddyAbilityController.cs.txt`
- `BuddyKiGuideController.cs.txt`
- `BuddyDialogueEventBridge.cs.txt`
- `ArMissionHintMarker.cs.txt`

## Naechste Schritte

[ ] Unity Hub lokal installieren/oeffnen.
[ ] Unity 2022.3 LTS installieren.
[ ] Projekt `WellFitBuddyAR` unter `native/unity/WellFitBuddyAR` lokal erzeugen.
[ ] AR Foundation installieren.
[ ] ARCore XR Plugin installieren.
[ ] ARKit XR Plugin installieren.
[ ] XR Plugin Management aktivieren.
[ ] Szene `WellFitBuddyAR` anlegen.
[ ] C#-Vorlagen nach `Assets/Scripts/*.cs` uebernehmen.
[ ] Ersten Android ARCore Build testen.

## Sicherheitsgrenze

Unity meldet nur AR-Events. Backend/App entscheidet Mission, Evidence, Anti-Cheat, Completion und spaetere interne Rewards.
