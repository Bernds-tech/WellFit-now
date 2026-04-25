"use client";

import MobileBottomNav from "../components/MobileBottomNav";
import { visionCapabilities } from "@/lib/vision/visionCapabilities";
import type { ExerciseCounterState } from "@/lib/vision/visionTypes";
import CameraPermissionPanel from "./components/CameraPermissionPanel";
import CameraPreview from "./components/CameraPreview";
import ExerciseCounterPanel from "./components/ExerciseCounterPanel";
import VisionCapabilityList from "./components/VisionCapabilityList";
import { useCameraPreview } from "./hooks/useCameraPreview";

const initialCounter: ExerciseCounterState = {
  exercise: "squat",
  validReps: 0,
  invalidReps: 0,
  confidence: 0,
  feedback: "Starte die Kamera. Skeleton Tracking und echte Wiederholungszählung werden als nächster Schritt angebunden.",
  isTracking: false,
};

export default function MobileAnalysePage() {
  const { videoRef, permissionState, errorMessage, startCamera, stopCamera } = useCameraPreview();

  const counter: ExerciseCounterState = {
    ...initialCounter,
    confidence: permissionState === "granted" ? 15 : 0,
    feedback:
      permissionState === "granted"
        ? "Kamera läuft. Als nächstes wird Pose/Skeleton Tracking angebunden, damit saubere Kniebeugen gezählt werden können."
        : initialCounter.feedback,
    isTracking: permissionState === "granted",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#00aabe] to-[#00505a] pb-24 text-white">
      <section className="grid gap-4 px-4 pt-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <CameraPermissionPanel
            permissionState={permissionState}
            errorMessage={errorMessage}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
          />
          <ExerciseCounterPanel counter={counter} />
          <VisionCapabilityList capabilities={visionCapabilities} />
        </div>

        <CameraPreview videoRef={videoRef} permissionState={permissionState} />
      </section>

      <MobileBottomNav activeTab="scan" />
    </main>
  );
}
