# WellFit – Nächste Aktionen

Status: Aktueller Arbeitsplan nach Split der To-do-Liste

---

## PRIO 1 – Stabilisierung sofort

[ ] Build nach letzten Änderungen ausführen:
    - todolist Split-Struktur
    - /mobile/einstellungen
    - /mobile/ar
    - /mobile/missionen/squat Bridge
    - Scroll-Fixes

```bash
cd /var/www/WellFit-now
git fetch origin
git reset --hard origin/main
npm install --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
pm2 status
```

[ ] PM2 restart prüfen.
[ ] Gerätetest Android/iPhone: QR, Mobile, Kamera, Pose, Face, Scroll, Mission Run.
[ ] HTTPS/Kamera/Sensor-Berechtigungen prüfen.
[ ] Prüfen, ob /mobile wirklich nicht mehr auf Desktop-Seiten springt.

---

## PRIO 2 – Mobile Mission stabilisieren

[ ] Kamera-Mission UX auf echtem Handy testen.
[ ] Wenn Kamera-Preview/HUD Höhe problematisch ist: Missions-HUD kompakter machen.
[ ] Mission Completion in Firestore prüfen:
    - trackingSessions
    - missionBuddyEvents
    - users.points
    - users.avatar / buddy state
[ ] Fehlerfälle sauberer anzeigen:
    - nicht eingeloggt
    - Kamera abgelehnt
    - MediaPipe lädt nicht
    - Firestore nicht erreichbar
    - Mission bereits heute angewendet
[ ] Nach erfolgreichem Abschluss optional Zurück-Button zu /mobile/missionen ergänzen.

---

## PRIO 3 – PWA sauberer machen

[ ] Eigenen QR-Code-Generator statt externem QR-Bilddienst.
[ ] PWA-Icons finalisieren.
[ ] Offline-/Cache-Strategie härten.
[ ] Native Sensorstrategie für spätere App-Store-Version dokumentieren.
[ ] Prüfen, ob Manifest scope /mobile für alle Testfälle passt.

---

## PRIO 4 – Firestore / Security härten

[ ] firestore.rules lokal oder im Firebase Emulator testen.
[ ] Rules für trackingSessions und missionBuddyEvents gegen Missbrauch prüfen.
[ ] Cloud Function für Mission Completion planen.
[ ] Client darf langfristig nur Beweise/Events senden, nicht Rewards final vergeben.
[ ] Anti-Cheat-Konzept für Pose, Bewegung und AR starten.

---

## PRIO 5 – AR-Technikentscheidung

[ ] WebAR vs. native App bewerten.
[ ] 3D-/Asset-Pipeline für Flammi definieren.
[ ] Bodenanker-/Raumverständnis-Konzept erstellen.
[ ] Prüfen: WebXR, Three.js, 8th Wall, Capacitor + native ARKit/ARCore, React Native/Expo, Unity.
[ ] Entscheidung dokumentieren, bevor echte AR-Missionen gebaut werden.

---

## PRIO 6 – Danach Desktop-Module

[ ] Marktplatz MVP.
[ ] Leaderboard MVP.
[ ] Punkte-Shop MVP.
[ ] Analytics & Stats MVP.
[>] Missionen erst danach weiter inhaltlich breit ausbauen.

---

## Nicht vergessen

[!] Bewegungs-/Schritt-Test ist bewusst später zu testen.
[!] Kein echter Token/WFT vor 2.000–3.000 Testern.
[!] Keine App-Store-kritischen Web3-Funktionen in Mobile.
[!] Keine medizinischen Diagnosen durch Buddy, Face Tracking oder MoodSignal.
