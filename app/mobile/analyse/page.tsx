"use client";

import { useState } from "react";
import MobileBottomNav from "../components/MobileBottomNav";
import { finishTrackingSession, startTrackingSession } from "@/lib/tracking";
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
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const savePoseSession = async () => {
    setIsSavingSession(true);
    setSessionMessage(null);

    try {
      const sessionId = await startTrackingSession({
        source: "pose",
        activityType: "pose",
        missionId: "mobile-squat-test",
        missionTitle: "Kniebeugen-Test",
      });

      await finishTrackingSession({
        sessionId,
        eventsCount: counter.validReps + counter.invalidReps,
        validReps: counter.validReps,
        invalidReps: counter.invalidReps,
        qualityScore: counter.qualityScore,
        confidence: counter.confidence,
        moodSignal: counter.moodSignal,
        exercise: counter.exercise,
        notes: "Pose-basierter Kniebeugen-Test aus /mobile/analyse. Rohbilder und Videos werden nicht gespeichert.",
      });

      setSessionMessage("Training gespeichert. Diese Daten können später Missionen und Flammi-Reaktionen auslösen.");
    } catch (error) {
      setSessionMessage(error instanceof Error ? error.message : "Training konnte nicht gespeichert werden.");
    } finally {
      setIsSavingSession(false);
    }
  };

  return (
    <main className="h-screen overflow-y-auto bg-gradient-to-br from-[#00aabe] to-[#00505a] pb-32 text-white">
      <section className="grid gap-4 px-4 pt-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <CameraPermissionPanel
            permissionState={permissionState}
            errorMessage={errorMessage}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
          />
          <ExerciseCounterPanel
            counter={counter}
            trackerStatus={trackerStatus}
            trackerError={trackerError}
            isSavingSession={isSavingSession}
            sessionMessage={sessionMessage}
            onSaveSession={savePoseSession}
          />
          <VisionCapabilityList capabilities={visionCapabilities} />
        </div>

        <CameraPreview videoRef={videoRef} permissionState={permissionState}>
          <SkeletonOverlay landmarks={landmarks} />
        </CameraPreview>
      </section>

      <div className="h-8" />
      <MobileBottomNav activeTab="scan" />
    </main>
  );
}
