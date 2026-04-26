"use client";

import MobileBottomNav from "../components/MobileBottomNav";
import { visionCapabilities } from "@/lib/vision/visionCapabilities";
import CameraPermissionPanel from "./components/CameraPermissionPanel";
import CameraPreview from "./components/CameraPreview";
import ExerciseCounterPanel from "./components/ExerciseCounterPanel";
import SkeletonOverlay from "./components/SkeletonOverlay";
import VisionCapabilityList from "./components/VisionCapabilityList";
import { useCameraPreview } from "./hooks/useCameraPreview";
import { usePoseExerciseTracking } from "./hooks/usePoseExerciseTracking";

export default function MobileAnalysePage() {
  const { videoRef, permissionState, errorMessage, startCamera, stopCamera } = useCameraPreview();
  const { counter, landmarks, trackerStatus, trackerError } = usePoseExerciseTracking({ videoRef, permissionState });

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
          <ExerciseCounterPanel counter={counter} trackerStatus={trackerStatus} trackerError={trackerError} />
          <VisionCapabilityList capabilities={visionCapabilities} />
        </div>

        <CameraPreview videoRef={videoRef} permissionState={permissionState}>
          <SkeletonOverlay landmarks={landmarks} />
        </CameraPreview>
      </section>

      <MobileBottomNav activeTab="scan" />
    </main>
  );
}
