export type StepCounterUpdate = {
  steps: number;
  magnitude: number;
  timestamp: number;
};

type StepCounterOptions = {
  onUpdate: (update: StepCounterUpdate) => void;
  onError?: (message: string) => void;
};

let lastPeakAt = 0;
let steps = 0;
let lastMagnitude = 0;
let baseline = 9.81;

const MIN_STEP_INTERVAL_MS = 320;
const MAX_STEP_INTERVAL_MS = 1800;
const PEAK_THRESHOLD = 1.15;

function getMotionEventName() {
  if (typeof window === "undefined") return null;
  if ("DeviceMotionEvent" in window) return "devicemotion";
  return null;
}

export async function requestStepCounterPermission() {
  if (typeof window === "undefined") return false;
  const DeviceMotion = (window as any).DeviceMotionEvent;
  if (DeviceMotion && typeof DeviceMotion.requestPermission === "function") {
    const response = await DeviceMotion.requestPermission();
    return response === "granted";
  }
  return Boolean(getMotionEventName());
}

export function createBrowserStepCounter(options: StepCounterOptions) {
  let active = false;

  const handleMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const x = acceleration.x ?? 0;
    const y = acceleration.y ?? 0;
    const z = acceleration.z ?? 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    baseline = baseline * 0.92 + magnitude * 0.08;
    const delta = Math.abs(magnitude - baseline);
    const now = Date.now();
    const interval = now - lastPeakAt;

    const isPeak = delta > PEAK_THRESHOLD && lastMagnitude <= PEAK_THRESHOLD;
    const validInterval = interval > MIN_STEP_INTERVAL_MS && interval < MAX_STEP_INTERVAL_MS;

    if (isPeak && validInterval) {
      steps += 1;
      lastPeakAt = now;
      options.onUpdate({ steps, magnitude: delta, timestamp: now });
    }

    if (lastPeakAt === 0 && delta > PEAK_THRESHOLD) {
      lastPeakAt = now;
    }

    lastMagnitude = delta;
  };

  return {
    async start() {
      const eventName = getMotionEventName();
      if (!eventName) {
        options.onError?.("Dieses Gerät unterstützt im Browser kein Bewegungs-Tracking.");
        return false;
      }

      const granted = await requestStepCounterPermission();
      if (!granted) {
        options.onError?.("Bewegungssensor wurde nicht freigegeben.");
        return false;
      }

      steps = 0;
      lastPeakAt = 0;
      lastMagnitude = 0;
      baseline = 9.81;
      active = true;
      window.addEventListener(eventName, handleMotion as EventListener);
      return true;
    },

    stop() {
      const eventName = getMotionEventName();
      if (eventName && active) window.removeEventListener(eventName, handleMotion as EventListener);
      active = false;
      return steps;
    },

    getSteps() {
      return steps;
    },
  };
}
