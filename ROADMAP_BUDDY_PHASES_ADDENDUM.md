# WellFit – KI-Buddy 3-Phasen-Roadmap Addendum

Status: In To Do List.txt zu übernehmen
Kontext: WF-DASH-BUDDY-001 – Mein KI-Buddy Modul ausbauen
Ziel: Mein KI-Buddy wird in vielen kleinen, skalierbaren Dateien aufgebaut und später um Skeleton Tracking, Face Tracking, Übungszählung und Augmented Reality erweitert.

## Grundentscheidung

Der KI-Buddy ist kein reines Maskottchen, sondern ein lebendiger digitaler Begleiter mit Zuständen, Pflege, Konsequenzen, Bindung, Economy-Loop, Trainingserkennung und späterer AR-Präsenz im realen Raum.

Der Buddy darf Konsequenzen haben:
- Er kann müde werden.
- Er kann Pflege brauchen.
- Er kann Chaos machen.
- Er kann weglaufen.
- Er kann 1 bis 3 Tage weg sein.
- Er kann später von anderen Nutzern in AR gefunden werden.
- Er stirbt nicht endgültig, sondern öffnet eine Rückhol-, Pflege- oder Suchmechanik.

Keine endgültige clientseitige Autorität für Punkte, Rewards, Pflegezustand, Weglaufen, Rückholung, Inventory, Käufe oder Leaderboard-Wertungen.

## Architekturregel

Alles wird wie beim Dashboard in kleine Dateien aufgeteilt.

Geplante und teilweise umgesetzte Struktur für Phase 1:

```txt
app/buddy/page.tsx
app/buddy/types.ts
app/buddy/hooks/useBuddyState.ts
app/buddy/lib/buddyState.ts
app/buddy/lib/buddyEconomy.ts
app/buddy/lib/buddyCopy.ts
app/buddy/lib/buddyCare.ts
app/buddy/lib/buddyRecovery.ts
app/buddy/lib/buddyInventoryPreview.ts
app/buddy/components/BuddyPageHeader.tsx
app/buddy/components/BuddyMainGrid.tsx
app/buddy/components/BuddyHero.tsx
app/buddy/components/BuddyStats.tsx
app/buddy/components/BuddyActions.tsx
app/buddy/components/BuddyCarePanel.tsx
app/buddy/components/BuddyEvolution.tsx
app/buddy/components/BuddyStoryBox.tsx
app/buddy/components/BuddyHomePanel.tsx
app/buddy/components/BuddyRecoveryPanel.tsx
app/buddy/components/BuddyInventoryPreview.tsx
app/buddy/components/BuddyFutureModules.tsx
app/missionen/lib/missionBuddyBridge.ts
firestore.rules
firebase.json
```

Umgesetzte Struktur für Phase 2:

```txt
app/mobile/analyse/page.tsx
app/mobile/analyse/hooks/useCameraPreview.ts
app/mobile/analyse/hooks/usePoseExerciseTracking.ts
app/mobile/analyse/components/CameraPermissionPanel.tsx
app/mobile/analyse/components/CameraPreview.tsx
app/mobile/analyse/components/SkeletonOverlay.tsx
app/mobile/analyse/components/VisionCapabilityList.tsx
app/mobile/analyse/components/ExerciseCounterPanel.tsx
lib/vision/visionTypes.ts
lib/vision/visionCapabilities.ts
lib/vision/poseTracker.ts
lib/vision/faceTracker.ts
lib/vision/exerciseRules.ts
lib/vision/exerciseCounter.ts
lib/vision/moodSignalEngine.ts
lib/vision/buddyCoachFeedback.ts
```

Geplante nächste Struktur für Phase 2:

```txt
lib/vision/poseMissionCompletion.ts
lib/vision/visionWorker.ts
app/mobile/analyse/components/FaceSignalPanel.tsx
```

Geplante Struktur für Phase 3:

```txt
app/buddy/ar/page.tsx
app/buddy/ar/components/ARPermissionPanel.tsx
app/buddy/ar/components/ARScene.tsx
app/buddy/ar/components/ARBuddyStatus.tsx
app/buddy/ar/components/ARSearchPanel.tsx
lib/ar/arSession.ts
lib/ar/buddyPlacement.ts
lib/ar/buddyMovement.ts
lib/ar/arAnchors.ts
lib/ar/arTypes.ts
```

---

# VERBINDLICHE IDEALE PIPELINE – BUDDY VISION / ÜBUNGSQUALITÄT / STIMMUNG

Diese Pipeline ist ab jetzt die verbindliche technische und produktlogische Reihenfolge für Phase 2 und alle späteren AR-/Mission-Verbindungen.

## Task-ID: WF-BUDDY-VISION-PIPELINE-001
Status: [x] Technisch in Basis umgesetzt / Gerätetest und Build offen
Ziel: Der Avatar soll erkennen, ob der Nutzer Übungen sauber und ordentlich macht, wie die Übungsqualität ist und welche groben Stimmungssignale sichtbar sind, ohne medizinische Diagnosen zu erzeugen.

## Idealer Ablauf

```txt
Handykamera startet nach Zustimmung
↓
MediaPipe Pose Landmarker erkennt Körperpunkte
↓
MediaPipe Face Landmarker erkennt Gesichtssignale
↓
WellFit berechnet:
- Gelenkwinkel
- Bewegungstiefe
- Bewegungsumfang
- Tempo
- Stabilität
- Wiederholungsphasen
- grobe Stimmungssignale
↓
Exercise Counter entscheidet:
- gültige Wiederholung
- ungültige Wiederholung
- Qualitätsscore
- Feedback
↓
Buddy Coach erzeugt Feedback:
- sauber
- langsamer
- tiefer
- stabiler Rücken
- kurze Pause
- motivierender Kommentar
↓
trackingSessions speichert:
- exercise
- validReps
- invalidReps
- confidence
- qualityScore
- moodSignal
- duration
- source: pose
↓
Mission wird abgeschlossen oder fortgesetzt
↓
Mission-Buddy-Bridge vergibt Punkte und Buddy-Effekt
↓
Flammi reagiert sichtbar:
- Lob
- Sorge
- Motivation
- Bindung steigt
- Energie/Hunger/Stimmung verändern sich
```

## Technische Entscheidung

[x] Primärtechnologie für Körperanalyse: MediaPipe Pose Landmarker.
[x] Primärtechnologie für Gesichtssignale: MediaPipe Face Landmarker.
[x] Dependency @mediapipe/tasks-vision in package.json ergänzt.
[>] TensorFlow.js / MoveNet bleibt Plan B, falls MediaPipe auf Zielgeräten unzureichend läuft.

## Warum MediaPipe zuerst

[x] Gut geeignet für Echtzeit-Kamera und Landmark-Erkennung.
[x] Passend für Web/PWA-nahe Tests.
[x] Pose und Face können mit einer gemeinsamen Vision-Architektur vorbereitet werden.
[x] Erlaubt Gelenkwinkel-, Wiederholungs- und Haltungsauswertung.

## Grenzen bei Stimmungserkennung

Erlaubt:
[x] Gesicht sichtbar / nicht sichtbar.
[x] Blickrichtung grob.
[x] Konzentration grob.
[x] Anstrengung grob.
[x] Unruhe / Unsicherheit als vorsichtiges Signal.
[x] Buddy darf empathisch reagieren: „Mach kurz langsamer“, „Atme durch“, „Du wirkst konzentriert“.

Nicht erlaubt:
[!] Keine medizinische Diagnose.
[!] Keine psychologische Diagnose.
[!] Keine Aussagen wie depressiv, krank, Angststörung, Panik, Trauma.
[!] Keine Speicherung von Rohbildern oder Videos als Standard.
[!] Keine Face-/Mood-Analyse ohne explizite Zustimmung.

## Umsetzungsschritte nach Pipeline

[x] WF-BUDDY-POSE-001 – MediaPipe Pose Landmarker Dependency prüfen und anbinden.
[x] WF-BUDDY-POSE-002 – poseTracker.ts erstellen und Körperlandmarks aus Video lesen.
[x] WF-BUDDY-POSE-003 – SkeletonOverlay bauen: erkannte Körperpunkte visuell anzeigen.
[x] WF-BUDDY-EXERCISE-001 – exerciseRules.ts bauen: Kniebeuge als erste Übung.
[x] WF-BUDDY-EXERCISE-002 – Gelenkwinkel für Kniebeuge berechnen: Hüfte/Knie/Fuß.
[x] WF-BUDDY-EXERCISE-003 – Wiederholungsphasen erkennen: oben -> runter -> tief genug -> hoch.
[x] WF-BUDDY-EXERCISE-004 – validReps und invalidReps zählen.
[x] WF-BUDDY-EXERCISE-005 – qualityScore berechnen.
[x] WF-BUDDY-FACE-001 – MediaPipe Face Landmarker anbinden.
[x] WF-BUDDY-FACE-002 – faceTracker.ts erstellen: Gesicht sichtbar, grobe Mimiksignale.
[x] WF-BUDDY-MOOD-001 – moodSignalEngine.ts bauen: unknown, focused, motivated, strained, uneasy, tired, calm.
[x] WF-BUDDY-COACH-001 – buddyCoachFeedback.ts bauen: Buddy-Kommentare aus Übungsqualität + MoodSignal.
[x] WF-BUDDY-TRACKING-001 – TrackingSession mit validReps, invalidReps, qualityScore, moodSignal speichern.
[ ] WF-BUDDY-MISSION-001 – Pose-basierte Mission Completion mit Mission-Buddy-Bridge verbinden.
[ ] WF-BUDDY-WORKER-001 – MediaPipe Inference später in Web Worker verschieben, falls Performance auf Handy ruckelt.

---

# PHASE 1 – Mein KI-Buddy MVP / Produktkern

## Task-ID: WF-BUDDY-P1-001
Status: [x] Funktional umgesetzt / Build und manuelle Mobile-QA extern prüfen
Ziel: Mein KI-Buddy-Seite als eigenständige, hochwertige Produktseite bauen.

## Umsetzung

[x] Route angelegt: app/buddy/page.tsx.
[x] Sidebar-Link zu Mein KI-Buddy ergänzt.
[x] Layout an Dashboard-Stil angepasst: Sidebar, Farbwelt, Premium-Optik.
[x] Buddy-Hero gebaut: Name, Avatar, Level, Titel, Status, Stimmung.
[x] Buddy-Werte anzeigen: XP, Energie, Hunger, Stimmung, Sauberkeit, Bindung, Loyalität, Neugier.
[x] Buddy-Aktionen gebaut: Füttern, Pflegen, Spielen, Aufräumen, Rufen, Suchen.
[x] Buddy-Aktionslogik in useBuddyState ausgelagert.
[x] Firestore-Speicherung für Buddy-Aktionen vorbereitet.
[x] Buddy-Storybox gebaut: Tagesmodus, emotionale Beschreibung, kleine Ereignisse.
[x] Buddy-Evolution gebaut: Entwicklungspfad, nächste Stufe, Spezialfähigkeiten später.
[x] Buddy-Heimat vorbereitet: Drachenhorst.
[x] Weglauf-/Rückholmechanik visuell vorbereitet.
[x] Punkte-Ausgaben vorbereitet: Futter, Pflege, Spielzeug, Reinigungsset, Rückhol-Köder.
[x] Inventory-/Shop-Vorschau vorbereitet.
[x] Keine echte Token-/Krypto-Funktion eingebaut.
[x] Clientseitige Economy-Schreibpfade sind Produktbestandteil, müssen aber weiter gehärtet und perspektivisch servervalidiert werden.
[x] Mobile-Minimalstruktur vorbereitet: app/mobile.
[x] Firestore Rules für users, Buddy-Felder, missionBuddyEvents und trackingSessions als erste produktnahe Rules-Datei angelegt.
[x] firebase.json mit firestore.rules verknüpft.
[ ] Mobile-Ansicht manuell auf echten Geräten prüfen.
[ ] Build auf Server/GitHub Action prüfen.
[ ] Firestore Rules im Firebase Emulator oder Projekt testen/deployen.

---

# PHASE 1.1 – Missionen mit KI-Buddy verbinden

## Task-ID: WF-BUDDY-MISSION-LINK-001
Status: [x] Produktverbindung umgesetzt / nächster Schritt serverseitige Validierung
Ziel: Tagesmissionen und Mein KI-Buddy dürfen nicht getrennte Systeme bleiben. Mission Completion löst Punkte, Buddy-Reaktion und Event-Log aus.

## Umsetzung

[x] Mission-Buddy-Bridge angelegt: app/missionen/lib/missionBuddyBridge.ts.
[x] Bridge nutzt Firestore Transaction auf users/{userId}.
[x] Bridge prüft missionBuddyEvents vor Anwendung und verhindert doppelte Punkte-/Buddy-Effekte pro Nutzer, Tag und Mission.
[x] Mission Reward erhöht users.points.
[x] Buddy-Werte reagieren je nach Missionstyp: Energie, Hunger, Stimmung, Sauberkeit, Bindung, Loyalität, Neugier.
[x] Buddy status und dailyMode werden nach Effekt neu berechnet.
[x] Event-Log wird in missionBuddyEvents geschrieben.
[x] Tagesmission-Abschluss ruft applyMissionBuddyBridge auf.
[x] UI-Meldung zeigt, ob Effekt neu angewendet oder bereits angewendet wurde.

## Sicherheit

[!] Mission-Buddy-Bridge ist produktrelevante Logik, kein Wegwerf-MVP.
[x] Doppelte Reward-/Buddy-Anwendung wird über missionBuddyEvents in einer Firestore Transaction verhindert.
[x] Erste Firestore Rules für users, userDailyMissionState, userDailyStreaks, userLevels, missionBuddyEvents und trackingSessions angelegt.
[ ] Nächster Sicherheitsausbau: Cloud Function / Backend als Autorität für Mission Completion, Reward, Punkte, XP, Buddy-Effekt und Anti-Cheat.
[ ] Client darf langfristig nur Completion-/Tracking-Events senden.
[ ] missionBuddyEvents für Audit, Debugging, Anti-Cheat und Analytics nutzen.

## Mobile-Entscheidung

[x] Handy-App wird bewusst schlank gehalten.
[x] Handy-App Fokus: Missionen spielen, Buddy sehen/füttern, Nutzer analysieren, AR starten, wenige Einstellungen.
[x] PC-Web-Dashboard bleibt Steuerzentrale für Marktplatz, Leaderboard, Punkte-Shop, Analytics, Web3/Token später.

---

# PHASE 2 – Skeleton Tracking, Face Tracking, Übungszählung

## Task-ID: WF-BUDDY-P2-VISION-001
Status: [x] Basis implementiert / Build und Gerätetest offen
Ziel: Der Buddy kann den Nutzer über die Kamera analysieren, Übungen mitzählen und Feedback geben.

## Umsetzung

[x] Mobile-Analyse-Route angelegt: app/mobile/analyse/page.tsx.
[x] Kamera-Modul mit expliziter Zustimmung gebaut.
[x] Kamera startet nicht automatisch.
[x] Kamera-Preview mit getUserMedia vorbereitet.
[x] Kamera-Stop und Cleanup beim Verlassen umgesetzt.
[x] Vision-Typen ausgelagert: lib/vision/visionTypes.ts.
[x] Capability-Liste ausgelagert: lib/vision/visionCapabilities.ts.
[x] Ideale Pipeline als verbindliche Reihenfolge dokumentiert.
[x] MediaPipe Pose Landmarker angebunden.
[x] MediaPipe Face Landmarker angebunden.
[x] Skeleton Tracking angebunden.
[x] Skeleton Overlay gebaut.
[x] Kniebeuge als erste Übung umgesetzt.
[x] Gültige und ungültige Wiederholungen unterscheiden.
[x] qualityScore berechnen.
[x] moodSignal vorsichtig berechnen.
[x] Buddy-Coach-Feedback dynamisch anzeigen.
[x] Tracking-Ergebnis in trackingSessions speichern.
[x] Keine Bilder/Videos standardmäßig speichern.
[x] Keine medizinischen Diagnosen anzeigen.

## Tracking-Funktionen

[x] Körperpunkte erkennen: Kopf, Schultern, Ellbogen, Hände, Hüfte, Knie, Füße.
[x] Gelenkwinkel berechnen.
[x] Wiederholungen zählen.
[x] Saubere Bewegung validieren.
[x] Schlechte Wiederholungen nicht zählen.
[x] Face Tracking für grobe Mimiksignale vorbereitet.
[x] MoodSignal vorsichtig berechnen: focused, motivated, strained, uneasy, tired, calm, unknown.
[x] Feedback neutral und motivierend formulieren.

## Akzeptanzkriterien

[x] Kamera-Start funktioniert technisch über Browser-API, muss auf echten Geräten getestet werden.
[x] Analyse-Seite ist über /mobile/analyse erreichbar.
[x] Datenschutz- und Consent-Text ist vorbereitet.
[x] Ideale Pipeline ist in der Roadmap festgelegt.
[x] Skeleton kann über Overlay angezeigt werden.
[x] Gesichtssignale können über Face Landmarker verarbeitet werden.
[x] Mindestens eine Übung wird gezählt: Kniebeuge.
[x] Buddy gibt Feedback.
[x] TrackingSession kann gespeichert werden.
[ ] Build-Test ausführen.
[ ] Gerätetest auf Android/iPhone durchführen.
[ ] Mission-Buddy-Bridge wird bei pose-validierter Completion ausgelöst.

## Sicherheit / Datenschutz

[!] Rohbilder und Videos werden nicht standardmäßig gespeichert.
[!] Kamera, Mimik, Face Tracking, Pose Tracking und Health-Daten benötigen Zustimmung.
[!] Kinder-/Familienmodus später gesondert absichern.
[!] Keine medizinische Diagnose oder psychologische Bewertung.

---

# PHASE 3 – AR-Buddy im realen Raum

## Task-ID: WF-BUDDY-P3-AR-001
Status: [ ] Offen / Später nach Phase 2-Basis
Ziel: Nutzer sieht den Buddy durch die Handykamera im echten Raum herumlaufen.

## Umsetzung

[ ] AR-Technikentscheidung treffen: WebAR-Prototyp vs. native App / Unity / ARKit / ARCore.
[ ] AR-Kamera nur nach Zustimmung starten.
[ ] Boden-/Flächenerkennung vorbereiten.
[ ] Buddy als 3D-Objekt vorbereiten.
[ ] Buddy auf realer Fläche platzieren.
[ ] Buddy im Raum laufen lassen.
[ ] Tap-/Interaktion vorbereiten.
[ ] Buddy kann sich verstecken oder Spuren hinterlassen.
[ ] Weglauf-/Rückholmechanik mit AR verbinden.
[ ] Training mit Buddy später mit Skeleton Tracking verbinden.

---

# Neue Roadmap-Reihenfolge

PRIO 1:
[x] WF-BUDDY-MISSION-LINK-001 – Mission-Buddy-Bridge als Produktverbindung umgesetzt.
[x] WF-BUDDY-P1-001 – Mein KI-Buddy MVP funktional umgesetzt.
[x] WF-BUDDY-VISION-PIPELINE-001 – Ideale Vision-Pipeline technisch in Basis umgesetzt.
[x] WF-BUDDY-P2-VISION-001 – Pose/Face/Rep-Counting Basis implementiert.
[ ] Mobile-Layout / Build prüfen.
[ ] Firestore Rules deployen/testen.

PRIO 2:
[ ] Pose-validierte Mission Completion mit Mission-Buddy-Bridge verbinden.
[ ] Gerätetests Android/iPhone: Kamera, Pose, Face, Performance.
[ ] Web Worker prüfen, falls MediaPipe auf Handy ruckelt.

PRIO 3:
[ ] WF-BUDDY-P3-AR-001 – AR-Buddy im realen Raum vorbereiten.

Danach:
[ ] Marktplatz MVP.
[ ] Leaderboard MVP.
[ ] Punkte-Shop MVP.
[ ] Analytics & Stats MVP.
[>] Missionen erst danach weiter inhaltlich ausbauen.

# Hinweis zur To Do List.txt

Dieses Addendum muss bei der nächsten sicheren Roadmap-Dateiaktualisierung in To Do List.txt übernommen werden. Die zentrale To Do List.txt ist sehr groß und wurde vom GitHub-Connector nur gekürzt angezeigt; daher wird dieses Addendum weiterhin als sichere versionierte Roadmap-Ergänzung gepflegt und später vollständig übernommen.
