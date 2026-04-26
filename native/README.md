# WellFit Native Mobile Layer

Ziel: WellFit wird am Handy gespielt. Die Web-/Desktop-App bleibt Steuerzentrale. Native Android/iOS-Schichten liefern künftig echte Handy-Chip- und Health-Daten für Activity Recognition, während Rewards und Mission Completion serverseitig plausibilisiert werden.

## Aktuelle Entscheidung

- PWA bleibt Test- und Entwicklungsoberfläche.
- Capacitor wird als native App-Schale gestartet.
- Android: Health Connect + Android Step Counter Sensor.
- iOS: CoreMotion/CMPedometer + HealthKit.
- Browser-DeviceMotion bleibt nur Fallback und Plausibilitätssignal.
- Client darf keine finalen Rewards vergeben.

## Priorität der Bewegungsdaten

1. Native Health-/Chipdaten: Health Connect, HealthKit, CoreMotion, Android Step Counter.
2. Pose-/Kamera-Daten: MediaPipe, Übungsqualität, Wiederholungen.
3. Browser-DeviceMotion: nur Fallback/Testsignal.
4. Server-Plausibilisierung entscheidet final.

## Nächste technische Schritte

1. Capacitor-Projekt initialisieren und Plattformen erzeugen.
2. Android Health Connect Bridge implementieren.
3. Android Step Counter Sensor anbinden.
4. iOS CoreMotion/CMPedometer Bridge implementieren.
5. HealthKit Consent und Tageswerte anbinden.
6. Native Snapshots in Firestore TrackingSessions oder DailyActivity speichern.
7. Cloud Function für Mission Completion und Reward-Entscheidung bauen.
