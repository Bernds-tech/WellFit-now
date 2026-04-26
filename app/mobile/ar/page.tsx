"use client";

import { useEffect, useMemo, useState } from "react";
import CameraPermissionPanel from "../analyse/components/CameraPermissionPanel";
import CameraPreview from "../analyse/components/CameraPreview";
import { useCameraPreview } from "../analyse/hooks/useCameraPreview";
import ArBuddyControls from "./components/ArBuddyControls";
import ArBuddyOverlay, { type ArBuddyMood, type ArBuddyPosition } from "./components/ArBuddyOverlay";
import ArStatusCard from "./components/ArStatusCard";

const safePositions: ArBuddyPosition[] = ["near", "center", "far"];
const tapMoods: ArBuddyMood[] = ["happy", "listening", "curious", "playful"];

const buddyMessages: Record<ArBuddyMood, string> = {
  idle: "Starte die Kamera und rufe Flammi in deinen Raum.",
  called: "Flammi kommt zu dir. Richte dein Handy ruhig auf den Boden oder freien Raum.",
  happy: "Flammi freut sich. Tippe ihn an, damit er reagiert.",
  listening: "Flammi hört dir zu und wartet auf deine nächste Aktion.",
  curious: "Flammi schaut sich deinen Raum neugierig an.",
  playful: "Flammi will spielen und hüpft durch den sicheren Bereich.",
  returning: "Flammi kommt zurück in deine Nähe.",
};

function getNextPosition(current: ArBuddyPosition): ArBuddyPosition {
  const currentIndex = safePositions.indexOf(current);
  return safePositions[(currentIndex + 1) % safePositions.length];
}

export default function MobileArPage() {
  const { videoRef, permissionState, errorMessage, startCamera, stopCamera } = useCameraPreview();
  const [buddyMood, setBuddyMood] = useState<ArBuddyMood>("idle");
  const [buddyPosition, setBuddyPosition] = useState<ArBuddyPosition>("near");
  const [tapCount, setTapCount] = useState(0);
  const [autoWalkEnabled, setAutoWalkEnabled] = useState(false);
  const isCameraActive = permissionState === "granted";

  useEffect(() => {
    if (!isCameraActive || !autoWalkEnabled) {
      return;
    }

    const walkTimer = window.setInterval(() => {
      setBuddyPosition((current) => getNextPosition(current));
      setBuddyMood((current) => (current === "returning" ? "called" : "playful"));
    }, 2800);

    return () => window.clearInterval(walkTimer);
  }, [autoWalkEnabled, isCameraActive]);

  const statusMessage = useMemo(() => {
    if (!isCameraActive) {
      return errorMessage || "Starte die Kamera, um den AR-Testmodus zu sehen.";
    }

    if (autoWalkEnabled) {
      return `${buddyMessages[buddyMood]} Automatische sichere Bewegung ist aktiv.`;
    }

    return buddyMessages[buddyMood];
  }, [autoWalkEnabled, buddyMood, errorMessage, isCameraActive]);

  const callBuddy = () => {
    if (!isCameraActive) {
      return;
    }

    setAutoWalkEnabled(false);
    setBuddyMood("returning");
    setBuddyPosition("near");
  };

  const startBuddyWalk = () => {
    if (!isCameraActive) {
      return;
    }

    setBuddyMood("playful");
    setAutoWalkEnabled(true);
    setBuddyPosition((current) => getNextPosition(current));
  };

  const handleBuddyTap = () => {
    if (!isCameraActive) {
      return;
    }

    const nextTapCount = tapCount + 1;
    setTapCount(nextTapCount);
    setBuddyMood(tapMoods[nextTapCount % tapMoods.length]);
    setBuddyPosition((current) => (nextTapCount % 2 === 0 ? getNextPosition(current) : current));
  };

  const resetBuddy = () => {
    setAutoWalkEnabled(false);
    setBuddyMood("idle");
    setBuddyPosition("near");
    setTapCount(0);
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
          onToggleWalk={autoWalkEnabled ? () => setAutoWalkEnabled(false) : startBuddyWalk}
        />
      )}
    </main>
  );
}
