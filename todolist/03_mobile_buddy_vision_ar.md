# WellFit – Mobile, KI-Buddy, Vision und AR

Quelle: Version 2.8 + aktueller Mobile/Buddy/Vision/AR-Code-Stand

---

## 1. KI-Buddy Produktkern

TASK-ID: WF-BUDDY-P1-001
STATUS: [x] Funktional umgesetzt / Gerätetest offen

Ziel:
Mein KI-Buddy-Seite als starke Produktseite und mobile Kurzpflege aufbauen.

Erledigt:
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

## 2. Testinstallation / App aufs Handy laden

TASK-ID: WF-MOBILE-INSTALL-QR-001
STATUS: [x] Testflow und PWA-Grundlage umgesetzt / Gerätetest offen

Ziel:
Über den Button „App aufs Handy laden“ soll ein QR-Code geöffnet werden. Handy scannt QR und öffnet die mobile WellFit-Test-App.

Erledigt:
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

Grenzen:
[!] QR-Code nutzt vorerst externen QR-Bilddienst für schnellen Test.
[!] Für Produktion eigenen QR-Code-Generator oder statischen QR ohne Drittanbieter verwenden.
[!] App-Store-Download ist noch nicht aktiv; aktuell ist es eine installierbare PWA-Test-App.

Offen:
[ ] Gerätetest QR-Code mit Android durchführen.
[ ] Gerätetest QR-Code mit iPhone/Safari durchführen.
[ ] PWA-Icongrößen finalisieren, Logo ggf. als echtes 192/512 Icon exportieren.
[ ] Service Worker Strategie später professionell ausbauen.

---

## 3. Mobile App Shell / Mobile-only Flow

TASK-ID: WF-MOBILE-SHELL-001
STATUS: [x] Mobile-only Teststruktur umgesetzt / Gerätetest offen

Ziel:
Handy-App bleibt schlank: Missionen spielen, Buddy sehen/füttern, Nutzer analysieren, AR starten, wenige Einstellungen.

Erledigt:
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

## 4. Kamera/KI-Training

TASK-ID: WF-BUDDY-VISION-PIPELINE-001
STATUS: [x] Technisch in Basis umgesetzt / Gerätetest offen

Ziel:
Buddy sieht den Nutzer, erkennt Übungsqualität, zählt Wiederholungen und gibt Feedback.

Erledigt:
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

## 5. Mobile Bewegung / Schrittzähler / Aktivitätserkennung

TASK-ID: WF-MOBILE-MOTION-001
STATUS: [~] Browser-Prototyp umgesetzt / Gerätetest bewusst später

Ziel:
Handy soll Bewegung analysieren und grob unterscheiden: Stillstand, Gehen, Joggen/Laufen, Auto/Fahrzeug, Motorrad/Roller.

Erledigt:
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

Grenzen:
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

## 6. AR-Buddy

TASK-ID: WF-BUDDY-P3-AR-001
STATUS: [~] AR-Overlay-Prototyp umgesetzt / echte AR-Technikentscheidung offen

Ziel:
Buddy läuft sichtbar im echten Raum herum.

Erledigt:
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

## 7. Buddy-Charaktere und Sicherheit

TASK-ID: WF-BUDDY-CHAR-001
STATUS: [ ] Offen

[ ] Mehrere Buddy-Charaktere definieren.
[ ] Verhalten abhängig von Userdaten, Aktivität, Schlaf, Stress, Stimmung, Fortschritt.
[ ] Charakter kann sich entwickeln.
[ ] Reaktionen bleiben motivierend und nicht manipulierend.

TASK-ID: WF-BUDDY-SAFETY-001
STATUS: [ ] Offen

[ ] Keine Diagnosen.
[ ] Keine Therapieempfehlungen.
[ ] Keine Scham-/Drucksprache als Standard.
[ ] Motivation positiv formulieren.
[ ] Bei Beschwerden Arzt/Expertin empfehlen.
[ ] Hinweis: ersetzt keine medizinische Beratung.
