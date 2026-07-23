"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  fetchDailyMissionProgress,
  type Beta1DailyActiveAttempt,
} from "@/lib/beta1/clientDailyMissionProgress";
import {
  MOBILE_SQUAT_MISSION_ID,
  MOBILE_SQUAT_REWARD_WFXP,
  MOBILE_SQUAT_TARGET_REPS,
  reconcileMobileSquatMission,
  submitMobileSquatPoseForReview,
} from "@/lib/beta1/clientMobilePoseMission";
import CameraPreview from "../../analyse/components/CameraPreview";
import CameraPermissionPanel from "../../analyse/components/CameraPermissionPanel";
import SkeletonOverlay from "../../analyse/components/SkeletonOverlay";
import { useCameraPreview } from "../../analyse/hooks/useCameraPreview";
import { usePoseExerciseTracking } from "../../analyse/hooks/usePoseExerciseTracking";
import ArBuddyPreview from "./components/ArBuddyPreview";
import MissionRunHud from "./components/MissionRunHud";

const MISSION_TITLE = "15 saubere Kniebeugen";

export default function MobileSquatMissionPage() {
  const { videoRef, permissionState, errorMessage, startCamera, stopCamera } = useCameraPreview();
  const {
    counter,
    landmarks,
    trackerStatus,
    trackerError,
    resetCounter,
  } = usePoseExerciseTracking({ videoRef, permissionState });
  const [countdown, setCountdown] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [targetReached, setTargetReached] = useState(false);
  const [serverCompleted, setServerCompleted] = useState(false);
  const [activeAttempt, setActiveAttempt] = useState<Beta1DailyActiveAttempt | null>(null);
  const [isSavingMission, setIsSavingMission] = useState(false);
  const [isLoadingServerState, setIsLoadingServerState] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const refreshServerState = useCallback(async () => {
    if (!auth.currentUser) {
      setActiveAttempt(null);
      setServerCompleted(false);
      return null;
    }
    const projection = await fetchDailyMissionProgress();
    const completed = projection.completedMissionIds.includes(MOBILE_SQUAT_MISSION_ID);
    const attempt = projection.activeAttempts.find((item) => item.missionId === MOBILE_SQUAT_MISSION_ID) ?? null;
    setServerCompleted(completed);
    setActiveAttempt(attempt);
    if (completed) setTargetReached(true);
    return { completed, attempt };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return;
      if (!user) {
        setIsLoadingServerState(false);
        setActiveAttempt(null);
        setServerCompleted(false);
        setSessionMessage("Bitte melde dich an. Ohne Login werden weder Evidence noch WFXP verarbeitet.");
        return;
      }
      setIsLoadingServerState(true);
      try {
        const state = await refreshServerState();
        if (cancelled) return;
        if (state?.completed) {
          setSessionMessage(`Mission heute bereits abgeschlossen. +${MOBILE_SQUAT_REWARD_WFXP} WFXP sind serverseitig verbucht.`);
        } else if (state?.attempt?.reviewStatus === "pending-server-review") {
          setSessionMessage("Eine Pose-Evidence wartet bereits auf Admin-Prüfung.");
        } else if (state?.attempt?.reviewStatus === "approved") {
          setSessionMessage("Evidence ist freigegeben. Nutze „Abschließen“ für die serverseitige WFXP-Completion.");
        } else if (state?.attempt?.reviewStatus === "rejected") {
          setSessionMessage("Die letzte Evidence wurde abgelehnt. Wiederhole die Mission für eine neue Einreichung.");
        } else if (state?.attempt?.reviewStatus === "needs-more-evidence") {
          setSessionMessage("Weitere Evidence ist erforderlich. Wiederhole die Mission für eine neue Einreichung.");
        }
      } catch (error) {
        if (!cancelled) setSessionMessage(error instanceof Error ? error.message : "Serverstatus konnte nicht geladen werden.");
      } finally {
        if (!cancelled) setIsLoadingServerState(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [refreshServerState]);

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
    if (countdown === 0 && !isRunning && sessionMessage === "Countdown läuft...") {
      setIsRunning(true);
      setSessionMessage(`Mission läuft. Mache ${MOBILE_SQUAT_TARGET_REPS} saubere Kniebeugen.`);
    }
  }, [countdown, isRunning, sessionMessage]);

  useEffect(() => {
    if (counter.validReps >= MOBILE_SQUAT_TARGET_REPS && isRunning && !targetReached) {
      setTargetReached(true);
      setIsRunning(false);
      setSessionMessage("Ziel erreicht. Die Pose-Zusammenfassung kann jetzt sicher zur Admin-Prüfung eingereicht werden.");
    }
  }, [counter.validReps, isRunning, targetReached]);

  const hasOpenReview = Boolean(
    activeAttempt
    && (activeAttempt.reviewStatus === "pending-server-review" || activeAttempt.reviewStatus === "approved"),
  );

  const startDisabled = isLoadingServerState || hasOpenReview;

  const actionLabel = useMemo(() => {
    if (serverCompleted) return "Erledigt";
    if (activeAttempt?.reviewStatus === "approved") return "Abschließen";
    if (activeAttempt?.reviewStatus === "pending-server-review") return "Status prüfen";
    if (activeAttempt?.reviewStatus === "rejected" || activeAttempt?.reviewStatus === "needs-more-evidence") {
      return targetReached ? "Neu einreichen" : "Wiederholen";
    }
    return targetReached ? "Einreichen" : "Fertig";
  }, [activeAttempt?.reviewStatus, serverCompleted, targetReached]);

  const startMission = async () => {
    if (!auth.currentUser) {
      setSessionMessage("Bitte melde dich an, bevor du die Mission startest.");
      return;
    }
    if (hasOpenReview) {
      setSessionMessage("Für diese Mission läuft bereits ein Review. Prüfe zuerst den Status.");
      return;
    }
    if (permissionState !== "granted") {
      await startCamera();
    }
    resetCounter();
    setTargetReached(false);
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
    if (isSavingMission || serverCompleted) return;
    if (!auth.currentUser) {
      setSessionMessage("Bitte melde dich an, bevor du Evidence oder WFXP verarbeitest.");
      return;
    }

    setIsSavingMission(true);
    try {
      const result = hasOpenReview && activeAttempt
        ? await reconcileMobileSquatMission(activeAttempt)
        : await submitMobileSquatPoseForReview({
            validReps: counter.validReps,
            invalidReps: counter.invalidReps,
            qualityScore: counter.qualityScore,
            confidence: counter.confidence,
            moodSignal: counter.moodSignal,
            exercise: counter.exercise,
          });
      await refreshServerState();
      if (result.state === "completed") {
        setServerCompleted(true);
        window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
      }
      if (result.state === "needs-rerun") setTargetReached(false);
      setIsRunning(false);
      setSessionMessage(result.message);
    } catch (error) {
      setSessionMessage(error instanceof Error ? error.message : "Mission konnte nicht sicher verarbeitet werden.");
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
        {isSavingMission ? "Server verarbeitet..." : isLoadingServerState ? "Serverstatus wird geladen..." : trackerStatus}
      </div>

      {sessionMessage && (
        <div className="absolute left-3 right-3 top-14 z-20 rounded-2xl bg-[#042f35]/82 p-3 text-xs font-bold leading-relaxed text-cyan-100 backdrop-blur-md">
          {sessionMessage}
        </div>
      )}

      <MissionRunHud
        missionTitle={MISSION_TITLE}
        countdown={countdown}
        isRunning={isRunning}
        targetReached={targetReached}
        serverCompleted={serverCompleted}
        hasOpenReview={hasOpenReview}
        reviewStatus={activeAttempt?.reviewStatus ?? null}
        isSavingMission={isSavingMission}
        startDisabled={startDisabled}
        actionLabel={actionLabel}
        counter={counter}
        targetReps={MOBILE_SQUAT_TARGET_REPS}
        onStart={startMission}
        onStop={stopMission}
        onComplete={completeMission}
      />
    </main>
  );
}
