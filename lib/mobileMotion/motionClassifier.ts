import type { ActivityType, MotionSample, MotionValidationStatus } from "./motionTypes";

const STEP_THRESHOLD = 2.2;
const MIN_STEP_INTERVAL_MS = 260;
const MAX_STEP_INTERVAL_MS = 2100;

export function getAccelerationMagnitude(event: DeviceMotionEvent) {
  const acceleration = event.accelerationIncludingGravity ?? event.acceleration;
  const x = acceleration?.x ?? 0;
  const y = acceleration?.y ?? 0;
  const z = acceleration?.z ?? 0;
  return Math.sqrt(x * x + y * y + z * z);
}

export function getRotationMagnitude(event: DeviceMotionEvent) {
  const rotation = event.rotationRate;
  const alpha = rotation?.alpha ?? 0;
  const beta = rotation?.beta ?? 0;
  const gamma = rotation?.gamma ?? 0;
  return Math.sqrt(alpha * alpha + beta * beta + gamma * gamma);
}

export function shouldCountStep(input: {
  previousMagnitude: number;
  currentMagnitude: number;
  lastStepAt: number;
  timestamp: number;
}) {
  const delta = Math.abs(input.currentMagnitude - input.previousMagnitude);
  const interval = input.timestamp - input.lastStepAt;
  return delta >= STEP_THRESHOLD && interval >= MIN_STEP_INTERVAL_MS && interval <= MAX_STEP_INTERVAL_MS;
}

export function estimateCadence(steps: number, startedAt: number, now: number) {
  const minutes = Math.max((now - startedAt) / 60000, 0.01);
  return Math.round(steps / minutes);
}

export function classifyActivity(samples: MotionSample[], cadence: number): { activityType: ActivityType; confidence: number; feedback: string } {
  if (samples.length < 8) {
    return { activityType: "unknown", confidence: 10, feedback: "Sammle noch Bewegungsdaten." };
  }

  const averageAcceleration = samples.reduce((sum, sample) => sum + sample.accelerationMagnitude, 0) / samples.length;
  const averageRotation = samples.reduce((sum, sample) => sum + sample.rotationMagnitude, 0) / samples.length;
  const accelerationVariance = samples.reduce((sum, sample) => sum + Math.abs(sample.accelerationMagnitude - averageAcceleration), 0) / samples.length;

  if (cadence < 8 && accelerationVariance < 0.9) {
    return { activityType: "still", confidence: 74, feedback: "Gerät wirkt ruhig oder liegt still." };
  }

  if (cadence >= 35 && cadence <= 140 && accelerationVariance < 5.4) {
    return { activityType: "walking", confidence: 72, feedback: "Gehen erkannt. Schritte werden als Browser-Prototyp gezählt." };
  }

  if (cadence > 140 && accelerationVariance >= 2.2) {
    return { activityType: "running", confidence: 76, feedback: "Joggen/Laufen erkannt. Bewegungen sind dynamischer." };
  }

  if (cadence < 45 && averageAcceleration > 10.2 && averageRotation < 35) {
    return { activityType: "vehicle", confidence: 58, feedback: "Mögliche Fahrzeugbewegung. Nicht als sichere Schritte verwenden." };
  }

  if (cadence < 55 && averageRotation >= 35 && averageAcceleration > 9.8) {
    return { activityType: "motorbike", confidence: 48, feedback: "Mögliche Motorrad-/Rollerbewegung. Nicht als sichere Schritte verwenden." };
  }

  return { activityType: "unknown", confidence: 35, feedback: "Bewegung erkannt, aber noch nicht eindeutig klassifiziert." };
}

export function validateMotionPlausibility(input: {
  samplesCount: number;
  steps: number;
  cadence: number;
  activityType: ActivityType;
  confidence: number;
}): { validationStatus: MotionValidationStatus; validationFeedback: string } {
  if (input.samplesCount < 20) {
    return {
      validationStatus: "collecting",
      validationFeedback: "Noch zu wenige Sensordaten. Trage das Handy am Körper und bewege dich weiter.",
    };
  }

  if (input.activityType === "vehicle" || input.activityType === "motorbike") {
    return {
      validationStatus: "suspicious",
      validationFeedback: "Bewegung wirkt wie Fahrzeug/Roller. Für Rewards später serverseitig blockieren oder prüfen.",
    };
  }

  if (input.steps === 0 && input.cadence < 10) {
    return {
      validationStatus: "weak",
      validationFeedback: "Bewegung erkannt, aber keine stabilen Schritte. Handy näher am Körper tragen.",
    };
  }

  if (input.cadence > 220) {
    return {
      validationStatus: "suspicious",
      validationFeedback: "Schrittfrequenz ist unplausibel hoch. Später serverseitig als Cheat-Risiko markieren.",
    };
  }

  if ((input.activityType === "walking" || input.activityType === "running") && input.confidence >= 60) {
    return {
      validationStatus: "valid",
      validationFeedback: "Plausible Bewegung erkannt. Für echte Rewards später zusätzlich native Chipdaten und Serverprüfung nutzen.",
    };
  }

  return {
    validationStatus: "native-required",
    validationFeedback: "Browserdaten reichen nicht für sichere Rewards. Native Health-/Chipdaten sollten später ergänzt werden.",
  };
}
