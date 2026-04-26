"use client";

import { useCallback, useRef, useState } from "react";
import { classifyActivity, estimateCadence, getAccelerationMagnitude, getRotationMagnitude, shouldCountStep } from "@/lib/mobileMotion/motionClassifier";
import type { MotionAnalysisState, MotionPermissionState, MotionSample } from "@/lib/mobileMotion/motionTypes";

const initialState: MotionAnalysisState = {
  permissionState: "idle",
  activityType: "unknown",
  steps: 0,
  cadence: 0,
  accelerationMagnitude: 0,
  rotationMagnitude: 0,
  confidence: 0,
  feedback: "Starte den Bewegungstest am Handy. Der Browser nutzt Bewegungssensoren, wenn das Gerät sie freigibt.",
};

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export function useMotionActivity() {
  const [state, setState] = useState<MotionAnalysisState>(initialState);
  const samplesRef = useRef<MotionSample[]>([]);
  const startedAtRef = useRef<number>(0);
  const previousMagnitudeRef = useRef(0);
  const lastStepAtRef = useRef(0);
  const stepsRef = useRef(0);
  const isListeningRef = useRef(false);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const timestamp = Date.now();
    const accelerationMagnitude = getAccelerationMagnitude(event);
    const rotationMagnitude = getRotationMagnitude(event);

    if (!startedAtRef.current) startedAtRef.current = timestamp;

    if (shouldCountStep({
      previousMagnitude: previousMagnitudeRef.current,
      currentMagnitude: accelerationMagnitude,
      lastStepAt: lastStepAtRef.current || timestamp - 1000,
      timestamp,
    })) {
      stepsRef.current += 1;
      lastStepAtRef.current = timestamp;
    }

    previousMagnitudeRef.current = accelerationMagnitude;

    const sample: MotionSample = { timestamp, accelerationMagnitude, rotationMagnitude };
    samplesRef.current = [...samplesRef.current.slice(-79), sample];
    const cadence = estimateCadence(stepsRef.current, startedAtRef.current, timestamp);
    const classification = classifyActivity(samplesRef.current, cadence);

    setState({
      permissionState: "granted",
      activityType: classification.activityType,
      steps: stepsRef.current,
      cadence,
      accelerationMagnitude: Math.round(accelerationMagnitude * 10) / 10,
      rotationMagnitude: Math.round(rotationMagnitude * 10) / 10,
      confidence: classification.confidence,
      feedback: classification.feedback,
    });
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("devicemotion", handleMotion);
    }
    isListeningRef.current = false;
    setState((current) => ({ ...current, feedback: "Bewegungstest gestoppt." }));
  }, [handleMotion]);

  const reset = useCallback(() => {
    samplesRef.current = [];
    startedAtRef.current = 0;
    previousMagnitudeRef.current = 0;
    lastStepAtRef.current = 0;
    stepsRef.current = 0;
    setState(initialState);
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined" || typeof DeviceMotionEvent === "undefined") {
      setState((current) => ({ ...current, permissionState: "unsupported", feedback: "Dieses Gerät oder dieser Browser unterstützt DeviceMotion nicht." }));
      return;
    }

    setState((current) => ({ ...current, permissionState: "requesting", feedback: "Bewegungssensor wird angefragt..." }));

    try {
      const MotionEvent = DeviceMotionEvent as DeviceMotionEventWithPermission;
      if (typeof MotionEvent.requestPermission === "function") {
        const permission = await MotionEvent.requestPermission();
        if (permission !== "granted") {
          setState((current) => ({ ...current, permissionState: "denied", feedback: "Bewegungssensor wurde nicht freigegeben." }));
          return;
        }
      }

      if (!isListeningRef.current) {
        startedAtRef.current = Date.now();
        window.addEventListener("devicemotion", handleMotion);
        isListeningRef.current = true;
      }

      setState((current) => ({ ...current, permissionState: "granted", feedback: "Bewegungssensor aktiv. Trage das Handy am Körper und gehe ein paar Schritte." }));
    } catch (error) {
      setState((current) => ({
        ...current,
        permissionState: "error" as MotionPermissionState,
        feedback: error instanceof Error ? error.message : "Bewegungssensor konnte nicht gestartet werden.",
      }));
    }
  }, [handleMotion]);

  return {
    state,
    start,
    stop,
    reset,
  };
}
