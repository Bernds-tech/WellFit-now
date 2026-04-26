# iOS Native Activity Bridge – CoreMotion / CMPedometer / HealthKit

## Ziel

WellFit soll auf iPhone echte Bewegungs- und Schrittdaten aus der nativen iOS-Schicht lesen.

## Datenquellen

### 1. CoreMotion / CMPedometer

Zu lesen:

- steps
- distance
- currentPace optional
- currentCadence optional
- floorsAscended optional
- floorsDescended optional

Vorteile:

- direkte iPhone-Bewegungsdaten
- geeignet für Live- und Tageswerte

### 2. HealthKit

Zu lesen:

- stepCount
- distanceWalkingRunning
- activeEnergyBurned optional
- workouts optional später

Vorteile:

- systemweite Health-Daten
- Nutzer-Consent über Apple Health
- gute historische Tages-/Wochenwerte

## WellFit-Validierungslogik

Native iOS Snapshot:

```ts
{
  source: "core-motion" | "healthkit",
  stepsToday: number,
  distanceMeters?: number,
  activeEnergyKcal?: number,
  confidence: number,
  validationHints: string[]
}
```

Server prüft später:

- Zeitfenster
- Schrittfrequenz
- Distanz/Geschwindigkeit
- HealthKit vs. CoreMotion Plausibilität
- Pose-/AR-Missionsdaten
- doppelte Sessions
- Cheat-/Fahrzeugrisiko

## Nächste Umsetzung

1. Capacitor iOS Plattform erzeugen.
2. Native Swift Plugin `WellFitActivityPlugin` erstellen.
3. HealthKit Capabilities aktivieren.
4. `requestPermissions()` für HealthKit bauen.
5. `getTodaySnapshot()` über CMPedometer und HealthKit bauen.
6. JS Bridge mit `nativeActivityBridge` verbinden.
