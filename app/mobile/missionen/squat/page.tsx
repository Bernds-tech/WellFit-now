"use client";

import { useEffect, useState } from "react";
import { applyMissionBuddyBridge } from "@/app/missionen/lib/missionBuddyBridge";
import type { DailyMission } from "@/app/missionen/tagesmissionen/missions";
import { finishTrackingSession, startTrackingSession } from "@/lib/tracking";
import CameraPreview from "../../analyse/components/CameraPreview";
import CameraPermissionPanel from "../../analyse/components/CameraPermissionPanel";
import SkeletonOverlay from "../../analyse/components/SkeletonOverlay";
import { useCameraPreview } from "../../analyse/hooks/useCameraPreview";
import { usePoseExerciseTracking } from "../../analyse/hooks/usePoseExerciseTracking";
import ArBuddyPreview from "./components/ArBuddyPreview";
import MissionRunHud from "./components/MissionRunHud";

const TARGET_REPS = 10;
const MOBILE_SQUAT_MISSION: DailyMission = {
  id: "mobile-squat-test",
  title: "10 saubere Kniebeugen",
  reward: 9,
  difficulty: "Mittel",
  description: "Mache 10 kontrollierte Kniebeugen vor der Handykamera. Saubere Ausführung zählt mehr als Geschwindigkeit.",
  duration: "3 Minuten",
  type: "Workout",
};

export default function MobileSquatMissionPage() {
  const { videoRef, permissionState, errorMessage, startCamera, stopCamera } = useCameraPreview();
  const { counter, landmarks, trackerStatus, trackerError } = usePoseExerciseTracking({ videoRef, permissionState });
  const [countdown, setCountdown] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSavingMission, setIsSavingMission] = useState(false);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (permissionState === "idle") {
      startCamera();
    }
  }, [permissionState, startCamera]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0 && isRunning === false && sessionMessage === "Countdown läuft...") {
      setIsRunning(true);
      setSessionMessage("Mission läuft. Mache 10 saubere Kniebeugen.");
    }
  }, [countdown, isRunning, sessionMessage]);

  useEffect(() => {
    if (counter.validReps >= TARGET_REPS && isRunning && !isCompleted) {
      setIsCompleted(true);
      setIsRunning(false);
      setSessionMessage("Ziel erreicht. Du kannst die Mission abschließen.");
    }
  }, [counter.validReps, isCompleted, isRunning]);

  const startMission = async () => {
    if (permissionState !== "granted") {
      await startCamera();
    }
    setIsCompleted(false);
    setIsRunning(false);
    setCountdown(5);
    setSessionMessage("Countdown läuft...");
  };

  const stopMission = () => {
    setIsRunning(false);
    setCountdown(0);
    setSessionMessage("Mission gestoppt. Kamera bleibt zur Ausrichtung sichtbar.");
  };

  const completeMission = async () => {
    setIsSavingMission(true);

    try {
      const sessionId = await startTrackingSession({
        source: "pose",
        activityType: "pose",
        missionId: MOBILE_SQUAT_MISSION.id,
        missionTitle: MOBILE_SQUAT_MISSION.title,
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
        notes: "Mobile Mission Run: 10 saubere Kniebeugen. Rohbilder und Videos werden nicht gespeichert.",
      });

      const bridgeResult = await applyMissionBuddyBridge({
        mission: MOBILE_SQUAT_MISSION,
        rewardPoints: MOBILE_SQUAT_MISSION.reward,
        source: "pose",
      });

      setIsCompleted(true);
      setIsRunning(false);
      setSessionMessage(
        bridgeResult.ok
          ? bridgeResult.alreadyApplied
            ? "Mission war heute bereits mit Flammi verbunden. Keine doppelte Punktevergabe."
            : `Mission gespeichert. +${MOBILE_SQUAT_MISSION.reward} Punkte. Flammi reagiert auf deine saubere Bewegung.`
          : "Mission gespeichert, aber Flammi-/Punkte-Sync konnte nicht abgeschlossen werden."
      );
    } catch (error) {
      setSessionMessage(error instanceof Error ? error.message : "Mission konnte nicht gespeichert werden.");
    } finally {
      setIsSavingMission(false);
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <CameraPreview videoRef={videoRef} permissionState={permissionState}>
        <SkeletonOverlay landmarks={landmarks} />
        <ArBuddyPreview isRunning={isRunning} />
      </CameraPreview>

      {permissionState !== "granted" && (
        <div className="absolute inset-x-3 top-3 z-30">
          <CameraPermissionPanel
            permissionState={permissionState}
            errorMessage={errorMessage || trackerError}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
          />
        </div>
      )}

      <div className="absolute left-3 top-3 z-20 rounded-2xl bg-[#042f35]/82 px-3 py-2 text-xs font-black text-cyan-100 backdrop-blur-md">
        {isSavingMission ? "Mission wird gespeichert..." : trackerStatus}
      </div>

      {sessionMessage && (
        <div className="absolute left-3 right-3 top-14 z-20 rounded-2xl bg-[#042f35]/82 p-3 text-xs font-bold leading-relaxed text-cyan-100 backdrop-blur-md">
          {sessionMessage}
        </div>
      )}

      <MissionRunHud
        countdown={countdown}
        isRunning={isRunning}
        isCompleted={isCompleted}
        counter={counter}
        targetReps={TARGET_REPS}
        onStart={startMission}
        onStop={stopMission}
        onComplete={completeMission}
      />
    </main>
  );
}
