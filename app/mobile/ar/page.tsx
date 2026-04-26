"use client";

import { useEffect, useMemo, useState } from "react";
import CameraPermissionPanel from "../analyse/components/CameraPermissionPanel";
import CameraPreview from "../analyse/components/CameraPreview";
import { useCameraPreview } from "../analyse/hooks/useCameraPreview";
import ArBuddyControls from "./components/ArBuddyControls";
import ArBuddyOverlay, { type ArBuddyMood, type ArBuddyPosition } from "./components/ArBuddyOverlay";
import ArStatusCard from "./components/ArStatusCard";

const safePositions: ArBuddyPosition[] = ["nearLeft", "center", "farRight", "nearRight", "farLeft"];
const tapMoods: ArBuddyMood[] = ["happy", "listening", "curious", "playful"];

const buddyMessages: Record<ArBuddyMood, string> = {
  idle: "Starte die Kamera und rufe Flammi in deinen Raum.",
  called: "Flammi ist da. Du kannst ihn antippen oder laufen lassen.",
  happy: "Flammi freut sich. Tippe ihn an, damit er weiter reagiert.",
  listening: "Flammi hört dir zu und wartet auf deine nächste Aktion.",
  curious: "Flammi schaut sich deinen Raum neugierig an.",
  playful: "Flammi hüpft sichtbar durch den sicheren Bereich.",
  returning: "Flammi kommt sichtbar zu dir zurück.",
};

function getNextPosition(current: ArBuddyPosition): ArBuddyPosition {
  const currentIndex = safePositions.indexOf(current);
  return safePositions[(currentIndex + 1) % safePositions.length];
}

export default function MobileArPage() {
  const { videoRef, permissionState, errorMessage, startCamera, stopCamera } = useCameraPreview();
  const [buddyMood, setBuddyMood] = useState<ArBuddyMood>("idle");
  const [buddyPosition, setBuddyPosition] = useState<ArBuddyPosition>("nearLeft");
  const [tapCount, setTapCount] = useState(0);
  const [autoWalkEnabled, setAutoWalkEnabled] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const isCameraActive = permissionState === "granted";

  useEffect(() => {
    if (!isCameraActive || !autoWalkEnabled) {
      return;
    }

    const walkTimer = window.setInterval(() => {
      setBuddyPosition((current) => getNextPosition(current));
      setBuddyMood("playful");
      setActionCount((current) => current + 1);
    }, 1400);

    return () => window.clearInterval(walkTimer);
  }, [autoWalkEnabled, isCameraActive]);

  const statusMessage = useMemo(() => {
    if (!isCameraActive) {
      return errorMessage || "Starte die Kamera, um den AR-Testmodus zu sehen.";
    }

    if (autoWalkEnabled) {
      return `${buddyMessages[buddyMood]} Automatische Bewegung aktiv. Wechsel: ${actionCount}`;
    }

    return buddyMessages[buddyMood];
  }, [actionCount, autoWalkEnabled, buddyMood, errorMessage, isCameraActive]);

  const callBuddy = () => {
    if (!isCameraActive) {
      return;
    }

    setAutoWalkEnabled(false);
    setBuddyMood("returning");
    setActionCount((current) => current + 1);
    setBuddyPosition((current) => (current === "nearLeft" ? "farRight" : "center"));

    window.setTimeout(() => {
      setBuddyPosition("nearLeft");
      setBuddyMood("called");
      setActionCount((current) => current + 1);
    }, 520);
  };

  const startBuddyWalk = () => {
    if (!isCameraActive) {
      return;
    }

    setBuddyMood("playful");
    setAutoWalkEnabled(true);
    setActionCount((current) => current + 1);
    setBuddyPosition((current) => getNextPosition(current));
  };

  const stopBuddyWalk = () => {
    setAutoWalkEnabled(false);
    setBuddyMood("listening");
  };

  const handleBuddyTap = () => {
    if (!isCameraActive) {
      return;
    }

    const nextTapCount = tapCount + 1;
    setTapCount(nextTapCount);
    setActionCount((current) => current + 1);
    setBuddyMood(tapMoods[nextTapCount % tapMoods.length]);
    setBuddyPosition((current) => getNextPosition(current));
  };

  const resetBuddy = () => {
    setAutoWalkEnabled(false);
    setBuddyMood("idle");
    setBuddyPosition("nearLeft");
    setTapCount(0);
    setActionCount(0);
  };

  const handleStopCamera = () => {
    resetBuddy();
    stopCamera();
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <CameraPreview videoRef={videoRef} permissionState={permissionState}>
        <ArBuddyOverlay
          isCameraActive={isCameraActive}
          mood={buddyMood}
          position={buddyPosition}
          actionCount={actionCount}
          onBuddyTap={handleBuddyTap}
        />
      </CameraPreview>

      <ArStatusCard cameraActive={isCameraActive} message={statusMessage} />

      {!isCameraActive && (
        <div className="absolute inset-x-3 bottom-4 z-30">
          <CameraPermissionPanel
            permissionState={permissionState}
            errorMessage={errorMessage}
            onStartCamera={startCamera}
            onStopCamera={handleStopCamera}
          />
        </div>
      )}

      {isCameraActive && (
        <ArBuddyControls
          autoWalkEnabled={autoWalkEnabled}
          onStopCamera={handleStopCamera}
          onCallBuddy={callBuddy}
          onToggleWalk={autoWalkEnabled ? stopBuddyWalk : startBuddyWalk}
        />
      )}
    </main>
  );
}
