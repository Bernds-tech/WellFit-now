import type { ActivityType, MotionSample } from "./motionTypes";

const STEP_THRESHOLD = 3.2;
const MIN_STEP_INTERVAL_MS = 280;
const MAX_STEP_INTERVAL_MS = 1800;

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

  if (cadence >= 55 && cadence <= 130 && accelerationVariance < 4.6) {
    return { activityType: "walking", confidence: 72, feedback: "Gehen erkannt. Schritte werden gezählt." };
  }

  if (cadence > 130 && accelerationVariance >= 2.2) {
    return { activityType: "running", confidence: 76, feedback: "Joggen/Laufen erkannt. Bewegungen sind dynamischer." };
  }

  if (cadence < 45 && averageAcceleration > 10.2 && averageRotation < 35) {
    return { activityType: "vehicle", confidence: 58, feedback: "Mögliche Fahrzeugbewegung. Schritte werden vorsichtig bewertet." };
  }

  if (cadence < 55 && averageRotation >= 35 && averageAcceleration > 9.8) {
    return { activityType: "motorbike", confidence: 48, feedback: "Mögliche Motorrad-/Rollerbewegung. Noch nicht als sichere Klassifikation nutzen." };
  }

  return { activityType: "unknown", confidence: 35, feedback: "Bewegung erkannt, aber noch nicht eindeutig klassifiziert." };
}
