"use client";

import { useEffect, useMemo, useState } from "react";
import CameraPermissionPanel from "../analyse/components/CameraPermissionPanel";
import CameraPreview from "../analyse/components/CameraPreview";
import { useCameraPreview } from "../analyse/hooks/useCameraPreview";
import ArBuddyControls from "./components/ArBuddyControls";
import ArBuddyOverlay, { type ArBuddyMood, type ArBuddyPosition } from "./components/ArBuddyOverlay";
import type { ArScreenAnchor } from "./components/ArDragonScene";
import ArStatusCard from "./components/ArStatusCard";
import NativeArModeCard from "./components/NativeArModeCard";
import ArBuddyEventPanel from "./components/ArBuddyEventPanel";

const safePositions: ArBuddyPosition[] = ["nearLeft", "center", "farRight", "nearRight", "farLeft"];
const tapMoods: ArBuddyMood[] = ["happy", "listening", "curious", "playful"];

const buddyMessages: Record<ArBuddyMood, string> = {
  idle: "Starte die Rueckkamera. Dieser Modus ist nur die Browser-Demo; echter Raumanker kommt ueber Native AR.",
  called: "Flammi ist da. Du kannst UI, 3D-Modell und Bedienung testen. Echter Raumanker folgt nativ.",
  happy: "Flammi freut sich. Tippe ihn an, damit er weiter reagiert.",
  listening: "Flammi hoert zu. Fuer echte Raumbewegung brauchen wir ARCore/ARKit.",
  curious: "Flammi schaut sich um. In diesem Browser-Modus noch ohne echtes World Tracking.",
  playful: "Flammi laeuft in der Demo. Echte Bewegung ueber Couch, Boden und Moebel folgt in Native AR.",
  returning: "Flammi kommt sichtbar zu dir zurueck.",
};

function getNextPosition(current: ArBuddyPosition): ArBuddyPosition {
  const currentIndex = safePositions.indexOf(current);
  return safePositions[(currentIndex + 1) % safePositions.length];
}

export default function MobileArPage() {
  const { videoRef, permissionState, errorMessage, startCamera, stopCamera } = useCameraPreview({ facingMode: "environment" });
  const [buddyMood, setBuddyMood] = useState<ArBuddyMood>("idle");
  const [buddyPosition, setBuddyPosition] = useState<ArBuddyPosition>("nearLeft");
  const [tapCount, setTapCount] = useState(0);
  const [autoWalkEnabled, setAutoWalkEnabled] = useState(false);
  const [anchorMode, setAnchorMode] = useState(false);
  const [anchor, setAnchor] = useState<ArScreenAnchor | null>(null);
  const [actionCount, setActionCount] = useState(0);
  const isCameraActive = permissionState === "granted";

  useEffect(() => {
    if (!isCameraActive || !autoWalkEnabled || anchor) {
      return;
    }

    const walkTimer = window.setInterval(() => {
      setBuddyPosition((current) => getNextPosition(current));
      setBuddyMood("playful");
      setActionCount((current) => current + 1);
    }, 1400);

    return () => window.clearInterval(walkTimer);
  }, [anchor, autoWalkEnabled, isCameraActive]);

  const statusMessage = useMemo(() => {
    if (!isCameraActive) {
      return errorMessage || "Starte die Rueckkamera, um die 3D-Flammi-Demo zu sehen.";
    }

    if (anchorMode) {
      return "Demo-Anker aktiv: Tippe im Kamerabild. Hinweis: Das ist noch kein echter Raumanker; echte Weltpositionen brauchen Native AR.";
    }

    if (anchor && autoWalkEnabled) {
      return `${buddyMessages[buddyMood]} Demo-Anker aktiv. Kein echtes World Tracking.`;
    }

    if (anchor) {
      return `${buddyMessages[buddyMood]} Demo-Anker gesetzt. Beim Schwenken bleibt er nicht raumfest.`;
    }

    if (autoWalkEnabled) {
      return `${buddyMessages[buddyMood]} Demo-Bewegung aktiv. Wechsel: ${actionCount}`;
    }

    return buddyMessages[buddyMood];
  }, [actionCount, anchor, anchorMode, autoWalkEnabled, buddyMood, errorMessage, isCameraActive]);

  const callBuddy = () => {
    if (!isCameraActive) return;

    setAnchor(null);
    setAnchorMode(false);
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
    if (!isCameraActive) return;

    setBuddyMood("playful");
    setAutoWalkEnabled(true);
    setActionCount((current) => current + 1);
    if (!anchor) {
      setBuddyPosition((current) => getNextPosition(current));
    }
  };

  const stopBuddyWalk = () => {
    setAutoWalkEnabled(false);
    setBuddyMood("listening");
  };

  const handleSceneTap = (nextAnchor: ArScreenAnchor) => {
    if (!isCameraActive || !anchorMode) return;

    setAnchor(nextAnchor);
    setAnchorMode(false);
    setAutoWalkEnabled(false);
    setBuddyMood("called");
    setActionCount((current) => current + 1);
  };

  const handleBuddyTap = () => {
    if (!isCameraActive) return;

    const nextTapCount = tapCount + 1;
    setTapCount(nextTapCount);
    setActionCount((current) => current + 1);
    setBuddyMood(tapMoods[nextTapCount % tapMoods.length]);
    if (!anchor) {
      setBuddyPosition((current) => getNextPosition(current));
    }
  };

  const resetBuddy = () => {
    setAutoWalkEnabled(false);
    setAnchorMode(false);
    setAnchor(null);
    setBuddyMood("idle");
    setBuddyPosition("nearLeft");
    setTapCount(0);
    setActionCount(0);
  };

  const handleStopCamera = () => {
    resetBuddy();
    stopCamera();
  };

  if (!isCameraActive) {
    return (
      <main className="h-screen w-screen overflow-y-auto bg-black px-3 py-4 text-white">
        <div className="mx-auto flex min-h-full max-w-[560px] flex-col gap-4 pb-8">
          <ArStatusCard cameraActive={isCameraActive} message={statusMessage} floating={false} />

          <CameraPreview videoRef={videoRef} permissionState={permissionState} />

          <ArBuddyEventPanel cameraActive={isCameraActive} floating={false} />

          <CameraPermissionPanel
            permissionState={permissionState}
            errorMessage={errorMessage}
            onStartCamera={startCamera}
            onStopCamera={handleStopCamera}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-y-auto bg-black px-3 py-4 text-white">
      <div className="mx-auto flex min-h-full max-w-[560px] flex-col gap-4 pb-8">
        <ArStatusCard cameraActive={isCameraActive} message={statusMessage} floating={false} />

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
          <CameraPreview videoRef={videoRef} permissionState={permissionState}>
            <ArBuddyOverlay
              isCameraActive={isCameraActive}
              mood={buddyMood}
              position={buddyPosition}
              actionCount={actionCount}
              anchor={anchor}
              autoWalkEnabled={autoWalkEnabled}
              anchorMode={anchorMode}
              onBuddyTap={handleBuddyTap}
              onSceneTap={handleSceneTap}
            />
          </CameraPreview>
        </div>

        <ArBuddyControls
          floating={false}
          autoWalkEnabled={autoWalkEnabled}
          anchorMode={anchorMode}
          hasAnchor={Boolean(anchor)}
          onStopCamera={handleStopCamera}
          onCallBuddy={callBuddy}
          onToggleWalk={autoWalkEnabled ? stopBuddyWalk : startBuddyWalk}
          onToggleAnchorMode={() => setAnchorMode((current) => !current)}
          onClearAnchor={() => {
            setAnchor(null);
            setAnchorMode(false);
            setAutoWalkEnabled(false);
            setBuddyMood("listening");
          }}
        />

        <ArBuddyEventPanel cameraActive={isCameraActive} floating={false} />
        <NativeArModeCard floating={false} />
      </div>
    </main>
  );
}
