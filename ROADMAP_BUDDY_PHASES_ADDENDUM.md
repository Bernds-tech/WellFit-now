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

Umgesetzte Test-/Installationsstruktur:

```txt
app/components/AppInstallPrompt.tsx
app/mobile/page.tsx
app/mobile/analyse/page.tsx
app/mobile/bewegung/page.tsx
app/mobile/bewegung/hooks/useMotionActivity.ts
app/mobile/bewegung/components/MotionActivityPanel.tsx
lib/mobileMotion/motionTypes.ts
lib/mobileMotion/motionClassifier.ts
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

---

# BUILD- UND DEPLOYMENT-STATUS

## Task-ID: WF-BUILD-VERIFY-001
Status: [x] Build erfolgreich am Server ausgeführt

Server-Ergebnis vom letzten Testlauf:

```txt
git fetch origin
git reset --hard origin/main
npm install
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
```

Ergebnis:
[x] Next.js Build erfolgreich.
[x] TypeScript erfolgreich.
[x] 23/23 statische Seiten generiert.
[x] PM2 restart erfolgreich.
[x] wellfit-now online.
[!] npm audit meldet 2 moderate vulnerabilities.
[ ] npm audit prüfen und gezielt bewerten, nicht blind npm audit fix --force ausführen.

---

# TESTINSTALLATION / APP AUFS HANDY LADEN

## Task-ID: WF-MOBILE-INSTALL-QR-001
Status: [x] Testflow umgesetzt / Produkt-QR später intern ersetzen
Ziel: Über den Button „App aufs Handy laden“ soll ein QR-Code geöffnet werden, den das Handy scannt. Danach öffnet sich die WellFit-Mobile-Testoberfläche.

Umsetzung:
[x] Sidebar-Button klickbar gemacht.
[x] AppInstallPrompt-Komponente gebaut.
[x] QR-Dialog öffnet sich über Sidebar.
[x] QR zeigt auf /mobile der aktuellen Domain.
[x] Link kann kopiert werden.
[x] PWA-beforeinstallprompt wird abgefangen, sofern Browser es unterstützt.
[x] Hinweis für „Zum Home-Bildschirm hinzufügen“ vorbereitet.
[!] QR-Code nutzt vorerst externen QR-Bilddienst für schnellen Test.
[ ] Für Produktion eigenen QR-Code-Generator oder statischen QR ohne Drittanbieter verwenden.
[ ] PWA manifest und Icons final ergänzen.
[ ] Service Worker / Offline-Verhalten später prüfen.

---

# MOBILE BEWEGUNG / SCHRITTZÄHLER / AKTIVITÄTSERKENNUNG

## Task-ID: WF-MOBILE-MOTION-001
Status: [~] Browser-Prototyp umgesetzt / native App-Sensorik später erforderlich
Ziel: Handy soll Bewegung analysieren und grob unterscheiden: Stillstand, Gehen, Joggen/Laufen, Auto/Fahrzeug, Motorrad/Roller.

Umsetzung:
[x] /mobile/bewegung angelegt.
[x] DeviceMotion-Permission vorbereitet.
[x] iOS-requestPermission berücksichtigt.
[x] Start/Stop/Reset eingebaut.
[x] Beschleunigungsmagnitude aus DeviceMotion berechnet.
[x] Rotationsmagnitude aus DeviceMotion berechnet.
[x] Einfache Schrittzählung über Beschleunigungspeaks eingebaut.
[x] Cadence Schritte/min berechnet.
[x] Grobe Aktivitätsklassifikation eingebaut: still, walking, running, vehicle, motorbike, unknown.
[x] Mobile-Home-Schnellstart „Bewegung testen“ ergänzt.

Wichtige Grenze:
[!] Browser-Sensoren sind nur ein Test-Prototyp.
[!] Auto/Motorrad-Klassifikation ist nur grob und nicht als sichere Autorität nutzbar.
[!] Für App-Store-Version native APIs einplanen:
    - iOS: Core Motion / CMPedometer / CMMotionActivity
    - Android: Activity Recognition / SensorManager / Health Connect je nach Zweck
[!] Für Rewards, Missionen und Anti-Cheat darf langfristig nicht allein der Client entscheiden.

Nächste Schritte:
[ ] Gerätetest Android Browser / PWA.
[ ] Gerätetest iPhone Safari / PWA.
[ ] Prüfen, ob DeviceMotion nur unter HTTPS funktioniert.
[ ] Schrittzählung gegen echte Gehstrecke vergleichen.
[ ] Fahrzeug-/Motorrad-Erkennung nicht für Rewards verwenden, nur als Plausibilitätssignal.

---

# VERBINDLICHE IDEALE PIPELINE – BUDDY VISION / ÜBUNGSQUALITÄT / STIMMUNG

## Task-ID: WF-BUDDY-VISION-PIPELINE-001
Status: [x] Technisch in Basis umgesetzt / Gerätetest und weiterer Build offen

[x] MediaPipe Pose Landmarker angebunden.
[x] MediaPipe Face Landmarker angebunden.
[x] Kniebeuge als erste Übung umgesetzt.
[x] Skeleton Overlay gebaut.
[x] validReps / invalidReps / qualityScore / moodSignal eingebaut.
[x] trackingSessions speichern Pose-Ergebnisse.
[ ] Pose-validierte Mission Completion mit Mission-Buddy-Bridge verbinden.
[ ] Gerätetest Android/iPhone durchführen.
[ ] Web Worker prüfen, falls MediaPipe auf Handy ruckelt.

---

# Neue Roadmap-Reihenfolge

PRIO 1:
[x] WF-BUILD-VERIFY-001 – Build vor QR-/Motion-Erweiterung erfolgreich.
[x] WF-MOBILE-INSTALL-QR-001 – QR-Testflow umgesetzt.
[~] WF-MOBILE-MOTION-001 – Browser-Bewegungstest umgesetzt, Gerätetest offen.
[x] WF-BUDDY-VISION-PIPELINE-001 – Vision-Pipeline technisch in Basis umgesetzt.
[ ] Build nach QR-/Motion-Erweiterung prüfen.
[ ] Gerätetests Android/iPhone: QR, Mobile, Kamera, Pose, Face, Bewegung.

PRIO 2:
[ ] Pose-validierte Mission Completion mit Mission-Buddy-Bridge verbinden.
[ ] PWA manifest / Icons / Installierbarkeit finalisieren.
[ ] Native Sensorstrategie für spätere App-Store-Version dokumentieren.

PRIO 3:
[ ] WF-BUDDY-P3-AR-001 – AR-Buddy im realen Raum vorbereiten.

# Hinweis zur To Do List.txt

Dieses Addendum muss bei der nächsten sicheren Roadmap-Dateiaktualisierung in To Do List.txt übernommen werden. Die zentrale To Do List.txt ist sehr groß und wurde vom GitHub-Connector nur gekürzt angezeigt; daher wird dieses Addendum weiterhin als sichere versionierte Roadmap-Ergänzung gepflegt und später vollständig übernommen.
