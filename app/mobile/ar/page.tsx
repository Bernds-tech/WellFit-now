"use client";

import { useState } from "react";
import CameraPermissionPanel from "../analyse/components/CameraPermissionPanel";
import CameraPreview from "../analyse/components/CameraPreview";
import { useCameraPreview } from "../analyse/hooks/useCameraPreview";
import ArBuddyOverlay, { type ArBuddyMood } from "./components/ArBuddyOverlay";
import ArStatusCard from "./components/ArStatusCard";

type BuddyPosition = "near" | "center" | "far";

const buddyMessages: Record<ArBuddyMood, string> = {
  idle: "Starte die Kamera und rufe Flammi in deinen Raum.",
  called: "Flammi kommt zu dir. Richte dein Handy ruhig auf den Boden oder freien Raum.",
  happy: "Flammi freut sich. Tippe ihn an, damit er reagiert.",
  listening: "Flammi hört dir zu und wartet auf deine nächste Aktion.",
};

export default function MobileArPage() {
  const { videoRef, permissionState, errorMessage, startCamera, stopCamera } = useCameraPreview();
  const [buddyMood, setBuddyMood] = useState<ArBuddyMood>("idle");
  const [buddyPosition, setBuddyPosition] = useState<BuddyPosition>("near");
  const isCameraActive = permissionState === "granted";

  const callBuddy = () => {
    if (!isCameraActive) {
      return;
    }

    setBuddyMood("called");
    setBuddyPosition((current) => {
      if (current === "near") return "center";
      if (current === "center") return "far";
      return "near";
    });
  };

  const handleBuddyTap = () => {
    if (!isCameraActive) {
      return;
    }

    setBuddyMood((current) => (current === "happy" ? "listening" : "happy"));
  };

  const resetBuddy = () => {
    setBuddyMood("idle");
    setBuddyPosition("near");
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

      <ArStatusCard
        cameraActive={isCameraActive}
        message={
          isCameraActive
            ? buddyMessages[buddyMood]
            : errorMessage || "Starte die Kamera, um den AR-Testmodus zu sehen."
        }
      />

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
        <div className="absolute inset-x-3 bottom-4 z-30 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleStopCamera}
            className="rounded-2xl bg-white/12 px-4 py-3 text-sm font-black text-white backdrop-blur-md"
          >
            Kamera stoppen
          </button>
          <button
            type="button"
            onClick={callBuddy}
            className="rounded-2xl bg-orange-400 px-4 py-3 text-sm font-black text-[#042f35] shadow-[0_12px_30px_rgba(251,146,60,0.28)]"
          >
            Flammi rufen
          </button>
        </div>
      )}
    </main>
  );
}
