# Android Native Activity Bridge – Health Connect & Step Counter

## Ziel

WellFit soll echte Handy-Chip-/Systemdaten lesen, statt sich nur auf Browser-DeviceMotion zu verlassen.

## Datenquellen

### 1. Health Connect

Zu lesen:

- StepsRecord
- DistanceRecord
- ActiveCaloriesBurnedRecord
- ExerciseSessionRecord optional später

Vorteile:

- Nutzerkontrollierter Consent
- kompatibel mit mehreren Fitness-/Health-Apps
- geeignet für Tages- und Wochenwerte

### 2. Android Step Counter Sensor

Sensor:

- Sensor.TYPE_STEP_COUNTER

Vorteile:

- direkte Schrittquelle vom Gerät
- gut für Live-Tracking

Einschränkung:

- geräteabhängig
- Reset seit Boot beachten
- nicht allein reward-autorisiert verwenden

## WellFit-Validierungslogik

Native Android Snapshot:

```ts
{
  source: "health-connect" | "android-step-counter",
  stepsToday: number,
  distanceMeters?: number,
  confidence: number,
  validationHints: string[]
}
```

Server prüft später:

- Zeitfenster
- Schrittfrequenz
- Geschwindigkeit
- Distanz
- Pose-/AR-Missionsdaten
- doppelte Sessions
- Fahrzeug-/Roller-Risiko

## Nächste Umsetzung

1. Capacitor Android Plattform erzeugen.
2. Native Kotlin Plugin `WellFitActivityPlugin` erstellen.
3. `requestPermissions()` für Health Connect bauen.
4. `getTodaySnapshot()` bauen.
5. Optional Live-StepCounter Stream ergänzen.
6. JS Bridge mit `nativeActivityBridge` verbinden.
