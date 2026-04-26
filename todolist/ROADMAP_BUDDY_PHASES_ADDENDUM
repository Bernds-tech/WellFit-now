# WellFit – KI-Buddy 3-Phasen-Roadmap Addendum

Status: In To Do List.txt zu übernehmen
Kontext: WF-DASH-BUDDY-001 – Mein KI-Buddy Modul ausbauen
Ziel: Mein KI-Buddy wird in vielen kleinen, skalierbaren Dateien aufgebaut und schrittweise um Mobile-Test-App, Kamera/KI-Training, Bewegungsanalyse und Augmented Reality erweitert.

---

# 0. Grundentscheidung

Der KI-Buddy ist kein reines Maskottchen, sondern ein lebendiger digitaler Begleiter mit Zuständen, Pflege, Konsequenzen, Bindung, Economy-Loop, Trainingserkennung und späterer AR-Präsenz im realen Raum.

Der Buddy darf Konsequenzen haben:
- Er kann müde werden.
- Er kann Pflege brauchen.
- Er kann Chaos machen.
- Er kann weglaufen.
- Er kann 1 bis 3 Tage weg sein.
- Er kann später von anderen Nutzern in AR gefunden werden.
- Er stirbt nicht endgültig, sondern öffnet eine Rückhol-, Pflege- oder Suchmechanik.

Sicherheitsgrundsatz:
[!] Keine endgültige clientseitige Autorität für Punkte, Rewards, Pflegezustand, Weglaufen, Rückholung, Inventory, Käufe oder Leaderboard-Wertungen.
[!] Client darf in der Testphase schreiben, aber produktkritische Entscheidungen müssen später serverseitig validiert werden.

---

# 1. Architekturregel

Alles wird wie beim Dashboard in kleine Dateien aufgeteilt.

Aktuell umgesetzte Mobile-/Installationsstruktur:

```txt
app/components/AppInstallPrompt.tsx
app/components/PwaInstaller.tsx
public/manifest.webmanifest
public/sw.js
app/mobile/page.tsx
app/mobile/components/MobileBottomNav.tsx
app/mobile/components/MobileHeader.tsx
app/mobile/components/MobileFocusCards.tsx
app/mobile/components/MobileQuickActions.tsx
app/mobile/lib/mobileHome.ts
app/mobile/types.ts
```

Aktuell umgesetzte Mobile-Unterseiten:

```txt
app/mobile/missionen/page.tsx
app/mobile/missionen/squat/page.tsx
app/mobile/missionen/squat/components/MissionRunHud.tsx
app/mobile/missionen/squat/components/ArBuddyPreview.tsx
app/mobile/buddy/page.tsx
app/mobile/einstellungen/page.tsx
app/mobile/einstellungen/components/MobileSettingsPanel.tsx
app/mobile/analyse/page.tsx
app/mobile/bewegung/page.tsx
app/mobile/ar/page.tsx
app/mobile/ar/components/ArStatusCard.tsx
app/mobile/ar/components/ArBuddyOverlay.tsx
```

Aktuell umgesetzte Vision-/Sensor-Struktur:

```txt
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
lib/mobileMotion/motionTypes.ts
lib/mobileMotion/motionClassifier.ts
```

---

# 2. BUILD- UND DEPLOYMENT-STATUS

## Task-ID: WF-BUILD-VERIFY-001
Status: [x] Build nach QR-/Motion-Erweiterung erfolgreich am Server ausgeführt / erneuter Build nach letzten Mobile-Änderungen offen

Letzter bestätigter erfolgreicher Server-Test:

```txt
git fetch origin
git reset --hard origin/main
npm install --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
```

Ergebnis:
[x] npm install erfolgreich.
[x] Next.js Build erfolgreich.
[x] TypeScript erfolgreich.
[x] 24/24 statische Seiten generiert.
[x] Route /mobile/bewegung im Build enthalten.
[x] PM2 restart erfolgreich.
[x] wellfit-now online.
[x] npm verbose optional dependency Meldungen für fremde Plattformen sind auf Linux erwartbar und kein Buildfehler.
[!] npm audit meldete zuvor 2 moderate vulnerabilities.
[ ] npm audit prüfen und gezielt bewerten, nicht blind npm audit fix --force ausführen.
[ ] Build nach folgenden späteren Änderungen erneut prüfen: /mobile/einstellungen, /mobile/ar, /mobile/missionen/squat Buddy-Bridge, Scroll-Fixes.

---

# 3. Phase 1 – Mein KI-Buddy / Produktkern

## Task-ID: WF-BUDDY-P1-001
Status: [x] Funktional umgesetzt / Gerätetest offen

Ziel:
Mein KI-Buddy-Seite als starke Produktseite und mobile Kurzpflege aufbauen.

Umsetzung:
[x] Route /buddy vorhanden.
[x] Buddy-Werte definiert.
[x] Buddy-Zustände definiert.
[x] Buddy-Aktionen eingebaut.
[x] Buddy-Aktionslogik in Hook ausgelagert.
[x] Storybox eingebaut.
[x] Weglauf-/Chaos-Zustände vorbereitet.
[x] Mobile Buddy-Seite /mobile/buddy umgesetzt.
[x] Mobile Buddy-Aktionen: Füttern, Pflegen, Spielen, Aufräumen.
[x] Mission-Buddy-Bridge umgesetzt.
[x] Punkte-/Buddy-Reaktion nach Tagesmissionen umgesetzt.
[x] Punkte-/Buddy-Reaktion nach mobiler Kniebeugen-Mission umgesetzt.

Offen:
[ ] Mobile Buddy auf echten Geräten testen.
[ ] Firestore Rules für produktkritische Buddy-/Punktefelder weiter härten.
[ ] Servervalidierung über Cloud Function als nächster Sicherheitsausbau.

---

# 4. TESTINSTALLATION / APP AUFS HANDY LADEN

## Task-ID: WF-MOBILE-INSTALL-QR-001
Status: [x] Testflow und PWA-Grundlage umgesetzt / Gerätetest offen

Ziel:
Über den Button „App aufs Handy laden“ soll ein QR-Code geöffnet werden. Handy scannt QR und öffnet die mobile WellFit-Test-App.

Umsetzung:
[x] Sidebar-Button klickbar gemacht.
[x] AppInstallPrompt-Komponente gebaut.
[x] QR-Dialog öffnet sich über Sidebar.
[x] QR zeigt auf /mobile der aktuellen Domain.
[x] Link kann kopiert werden.
[x] HTTPS-Warnung ergänzt.
[x] Android-/iPhone-Installationshinweise ergänzt.
[x] PWA-beforeinstallprompt wird abgefangen, sofern Browser es unterstützt.
[x] PWA manifest erstellt: public/manifest.webmanifest.
[x] Service Worker erstellt: public/sw.js.
[x] Service Worker Registrierung erstellt: app/components/PwaInstaller.tsx.
[x] Mobile App bleibt innerhalb /mobile-Unterseiten.

Wichtige Grenze:
[!] QR-Code nutzt vorerst externen QR-Bilddienst für schnellen Test.
[!] Für Produktion eigenen QR-Code-Generator oder statischen QR ohne Drittanbieter verwenden.
[!] App-Store-Download ist noch nicht aktiv; aktuell ist es eine installierbare PWA-Test-App.

Offen:
[ ] Gerätetest QR-Code mit Android durchführen.
[ ] Gerätetest QR-Code mit iPhone/Safari durchführen.
[ ] PWA-Icongrößen finalisieren, Logo ggf. als echtes 192/512 Icon exportieren.
[ ] Service Worker Strategie später professionell ausbauen.

---

# 5. Mobile App Shell / Mobile-only Flow

## Task-ID: WF-MOBILE-SHELL-001
Status: [x] Mobile-only Teststruktur umgesetzt / Gerätetest offen

Ziel:
Handy-App bleibt schlank: Missionen spielen, Buddy sehen/füttern, Nutzer analysieren, AR starten, wenige Einstellungen.

Umsetzung:
[x] /mobile Startseite umgesetzt.
[x] /mobile/missionen umgesetzt.
[x] /mobile/buddy umgesetzt.
[x] /mobile/analyse umgesetzt.
[x] /mobile/bewegung umgesetzt.
[x] /mobile/einstellungen umgesetzt.
[x] /mobile/ar umgesetzt.
[x] Bottom Navigation korrigiert: Missionen, Buddy, Analyse, Setup.
[x] Mobile-Buttons führen nicht mehr auf Desktop-Seiten /missionen/tagesmissionen oder /buddy.
[x] Mobile-Seiten scrollbar gemacht: /mobile, /mobile/missionen, /mobile/analyse, /mobile/buddy, /mobile/bewegung, /mobile/einstellungen.

Offen:
[ ] Auf echten Handyhöhen prüfen, ob Bottom Navigation Inhalte überdeckt.
[ ] Kamera-Mission /mobile/missionen/squat auf Handy testen.
[ ] Mobile Browser/PWA Verhalten unter HTTPS prüfen.

---

# 6. Mobile Bewegung / Schrittzähler / Aktivitätserkennung

## Task-ID: WF-MOBILE-MOTION-001
Status: [~] Browser-Prototyp umgesetzt / Gerätetest bewusst später

Ziel:
Handy soll Bewegung analysieren und grob unterscheiden: Stillstand, Gehen, Joggen/Laufen, Auto/Fahrzeug, Motorrad/Roller.

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

Offen:
[ ] Gerätetest Android Browser / PWA später.
[ ] Gerätetest iPhone Safari / PWA später.
[ ] Schrittzählung gegen echte Gehstrecke vergleichen.
[ ] Fahrzeug-/Motorrad-Erkennung nur als Plausibilitätssignal nutzen.

---

# 7. Phase 2 – Kamera/KI-Training

## Task-ID: WF-BUDDY-VISION-PIPELINE-001
Status: [x] Technisch in Basis umgesetzt / Gerätetest offen

Ziel:
Buddy sieht den Nutzer, erkennt Übungsqualität, zählt Wiederholungen und gibt Feedback.

Umsetzung:
[x] Kamera-Permission umgesetzt.
[x] Kamera-Preview umgesetzt.
[x] MediaPipe Pose Landmarker angebunden.
[x] MediaPipe Face Landmarker angebunden.
[x] Skeleton Overlay gebaut.
[x] Erste Übung umgesetzt: Kniebeuge.
[x] Wiederholungsphasen erkannt: standing, descending, bottom, ascending.
[x] validReps / invalidReps eingebaut.
[x] qualityScore eingebaut.
[x] moodSignal vorsichtig eingebaut.
[x] Buddy-Coach-Feedback eingebaut.
[x] trackingSessions speichern Pose-Ergebnisse.
[x] Mobile Kamera-Mission /mobile/missionen/squat umgesetzt.
[x] Countdown, Stop-Button und Fertig-Button umgesetzt.
[x] Rest der App im Missionsmodus ausgeblendet.
[x] Mobile Kniebeugen-Mission speichert TrackingSession.
[x] Mobile Kniebeugen-Mission triggert Mission-Buddy-Bridge und Punkte/Buddy-Reaktion.

Sicherheits-/Datenschutzgrenzen:
[!] Rohbilder und Videos werden nicht standardmäßig gespeichert.
[!] Kamera, Mimik, Face Tracking, Pose Tracking und Health-Daten benötigen Zustimmung.
[!] Keine medizinische Diagnose oder psychologische Bewertung.
[!] Face/Mood-Signal ist nur vorsichtiges Spiel-/Coach-Signal, keine Diagnose.

Offen:
[ ] Gerätetest Android/iPhone durchführen.
[ ] Prüfen, ob MediaPipe auf 1–3 Zielgeräten flüssig läuft.
[ ] Web Worker prüfen, falls MediaPipe auf Handy ruckelt.
[ ] Weitere Übungen vorbereiten: Liegestütz, Plank, Hampelmann.
[ ] Cloud Function / Backend-Validierung für pose-validierte Completion planen.

---

# 8. Phase 3 – AR-Buddy

## Task-ID: WF-BUDDY-P3-AR-001
Status: [~] AR-Overlay-Prototyp umgesetzt / echte AR-Technikentscheidung offen

Ziel:
Buddy läuft sichtbar im echten Raum herum.

Umsetzung:
[x] /mobile/ar umgesetzt.
[x] Kamera-AR-Testmodus umgesetzt.
[x] Flammi als Kamera-Overlay sichtbar.
[x] AR-Statuskarte umgesetzt.
[x] Kamera stoppen / Flammi rufen UI vorbereitet.
[x] AR-Buddy-Platzhalter auch in Kamera-Mission sichtbar.

Noch nicht echte AR:
[ ] AR-Technikentscheidung treffen: WebAR-Prototyp vs. native App / Unity / ARKit / ARCore.
[ ] 3D-Buddy-Modell auswählen/erstellen.
[ ] Fläche/Boden erkennen.
[ ] Buddy mit Raumanker platzieren.
[ ] Buddy laufen lassen.
[ ] Tap-/Interaktion.
[ ] AR-Rückholmechanik.
[ ] AR-Training mit Skeleton Tracking verbinden.

Empfehlung:
[ ] Erst Mobile/Kamera-Gerätetest abschließen, dann AR-Technikentscheidung treffen.

---

# 9. Neue Roadmap-Reihenfolge ab jetzt

PRIO 1 – Stabilisierung
[ ] Build nach letzten Mobile-Änderungen erneut ausführen.
[ ] PM2 restart prüfen.
[ ] Gerätetest Android/iPhone: QR, Mobile, Kamera, Pose, Face, Scroll, Mission Run.
[ ] HTTPS/Kamera/Sensor-Berechtigungen prüfen.

PRIO 2 – Mobile Mission stabilisieren
[ ] Kamera-Mission UX auf echtem Handy testen.
[ ] Falls Kamera-Preview/HUD Höhe problematisch ist: Missions-HUD kompakter machen.
[ ] Mission Completion in Firestore prüfen: trackingSessions + missionBuddyEvents + users.points/avatar.
[ ] Fehlerfälle sauberer anzeigen: nicht eingeloggt, Kamera abgelehnt, MediaPipe lädt nicht.

PRIO 3 – App/PWA sauberer machen
[ ] Eigenen QR-Code-Generator statt externem QR-Bilddienst.
[ ] PWA-Icons finalisieren.
[ ] Offline-/Cache-Strategie härten.
[ ] Native Sensorstrategie für spätere App-Store-Version dokumentieren.

PRIO 4 – AR-Technikentscheidung
[ ] WebAR vs. native App bewerten.
[ ] 3D-/Asset-Pipeline für Flammi definieren.
[ ] Bodenanker-/Raumverständnis-Konzept erstellen.

Danach:
[ ] Marktplatz MVP.
[ ] Leaderboard MVP.
[ ] Punkte-Shop MVP.
[ ] Analytics & Stats MVP.
[>] Missionen erst danach weiter inhaltlich breit ausbauen.

---

# Hinweis zur To Do List.txt

Dieses Addendum muss bei der nächsten sicheren Roadmap-Dateiaktualisierung in To Do List.txt übernommen werden. Die zentrale To Do List.txt ist sehr groß und wurde vom GitHub-Connector nur gekürzt angezeigt; daher wird dieses Addendum weiterhin als sichere versionierte Roadmap-Ergänzung gepflegt und später vollständig übernommen.
