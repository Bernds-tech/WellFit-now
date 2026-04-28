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

type CameraMode = "environment" | "user";

const safePositions: ArBuddyPosition[] = ["nearLeft", "center", "nearRight", "farRight", "center", "farLeft"];
const tapMoods: ArBuddyMood[] = ["happy", "listening", "curious", "playful"];

const buddyMessages: Record<ArBuddyMood, string> = {
  idle: "Starte die Rueckkamera. Dieser Modus ist nur die Browser-Demo; echter Raumanker kommt ueber Native AR.",
  called: "Flammi ist da. Du kannst UI, 3D-Modell und Bedienung testen. Echter Raumanker folgt nativ.",
  happy: "Flammi freut sich. Tippe ihn an, damit er weiter reagiert.",
  listening: "Flammi hoert zu. Fuer echte Raumbewegung brauchen wir ARCore/ARKit.",
  curious: "Flammi schaut sich um. In diesem Browser-Modus noch ohne echtes World Tracking.",
  playful: "Flammi laeuft sichtbar durch die Demo. Echtes Raumlaufen folgt in Unity AR.",
  returning: "Flammi kommt sichtbar zu dir zurueck.",
};

function getNextPosition(current: ArBuddyPosition): ArBuddyPosition {
  const currentIndex = safePositions.indexOf(current);
  return safePositions[(currentIndex + 1) % safePositions.length];
}

export default function MobileArPage() {
  const [cameraMode, setCameraMode] = useState<CameraMode>("environment");
  const { videoRef, permissionState, errorMessage, debugInfo, startCamera, stopCamera } = useCameraPreview({ facingMode: cameraMode });
  const [buddyMood, setBuddyMood] = useState<ArBuddyMood>("idle");
  const [buddyPosition, setBuddyPosition] = useState<ArBuddyPosition>("center");
  const [tapCount, setTapCount] = useState(0);
  const [autoWalkEnabled, setAutoWalkEnabled] = useState(false);
  const [anchorMode, setAnchorMode] = useState(false);
  const [anchor, setAnchor] = useState<ArScreenAnchor | null>(null);
  const [actionCount, setActionCount] = useState(0);
  const isCameraActive = permissionState === "granted";

  useEffect(() => {
    if (!isCameraActive || !autoWalkEnabled || anchor) return;
    const walkTimer = window.setInterval(() => {
      setBuddyPosition((current) => getNextPosition(current));
      setBuddyMood("playful");
      setActionCount((current) => current + 1);
    }, 950);
    return () => window.clearInterval(walkTimer);
  }, [anchor, autoWalkEnabled, isCameraActive]);

  const statusMessage = useMemo(() => {
    if (!isCameraActive) return errorMessage || "Starte die Rueckkamera, um die 3D-Flammi-Demo zu sehen.";
    if (anchorMode) return "Demo-Anker aktiv: Tippe im Kamerabild. Hinweis: Das ist noch kein echter Raumanker; echte Weltpositionen brauchen Native AR.";
    if (anchor && autoWalkEnabled) return `${buddyMessages[buddyMood]} Demo-Anker aktiv. Kein echtes World Tracking.`;
    if (anchor) return `${buddyMessages[buddyMood]} Demo-Anker gesetzt. Beim Schwenken bleibt er nicht raumfest.`;
    if (autoWalkEnabled) return `${buddyMessages[buddyMood]} Schritt: ${actionCount}`;
    return buddyMessages[buddyMood];
  }, [actionCount, anchor, anchorMode, autoWalkEnabled, buddyMood, errorMessage, isCameraActive]);

  const restartCamera = async (nextMode?: CameraMode) => {
    if (nextMode) setCameraMode(nextMode);
    stopCamera();
    window.setTimeout(() => {
      startCamera();
    }, 150);
  };

  const callBuddy = () => {
    if (!isCameraActive) return;
    setAnchor(null);
    setAnchorMode(false);
    setAutoWalkEnabled(false);
    setBuddyMood("returning");
    setActionCount((current) => current + 1);
    setBuddyPosition("farRight");
    window.setTimeout(() => {
      setBuddyPosition("center");
      setBuddyMood("called");
      setActionCount((current) => current + 1);
    }, 520);
  };

  const startBuddyWalk = () => {
    if (!isCameraActive) return;
    setAnchor(null);
    setAnchorMode(false);
    setBuddyMood("playful");
    setAutoWalkEnabled(true);
    setBuddyPosition("nearLeft");
    setActionCount((current) => current + 1);
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
    if (!anchor) setBuddyPosition((current) => getNextPosition(current));
  };

  const resetBuddy = () => {
    setAutoWalkEnabled(false);
    setAnchorMode(false);
    setAnchor(null);
    setBuddyMood("idle");
    setBuddyPosition("center");
    setTapCount(0);
    setActionCount(0);
  };

  const handleStopCamera = () => {
    resetBuddy();
    stopCamera();
  };

  const debugPanel = (
    <section className="rounded-[22px] border border-cyan-100/10 bg-[#042f35]/70 p-3 text-xs font-bold leading-relaxed text-cyan-50/70">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/55">Kamera Diagnose</p>
      <p>Modus: {cameraMode === "environment" ? "Rueckkamera" : "Frontkamera"}</p>
      <p>Status: {permissionState}</p>
      <p>Stream: {debugInfo.hasStream ? "ja" : "nein"} · Track: {debugInfo.trackState}</p>
      <p>Video: {debugInfo.videoWidth}×{debugInfo.videoHeight} · Ready: {debugInfo.readyState} · Paused: {debugInfo.paused ? "ja" : "nein"}</p>
      <p className="break-words">Kamera: {debugInfo.trackLabel}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => restartCamera("environment")} className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black text-white">Rueckkamera neu</button>
        <button type="button" onClick={() => restartCamera("user")} className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black text-white">Frontkamera testen</button>
        <button type="button" onClick={() => restartCamera()} className="rounded-full bg-cyan-300/20 px-3 py-2 text-[10px] font-black text-cyan-50">Stream neu verbinden</button>
      </div>
    </section>
  );

  if (!isCameraActive) {
    return (
      <main className="h-screen w-screen overflow-y-auto bg-black px-3 py-4 text-white">
        <div className="mx-auto flex min-h-full max-w-[560px] flex-col gap-4 pb-8">
          <ArStatusCard cameraActive={isCameraActive} message={statusMessage} floating={false} />
          <CameraPreview videoRef={videoRef} permissionState={permissionState} />
          {debugPanel}
          <ArBuddyEventPanel cameraActive={isCameraActive} floating={false} />
          <CameraPermissionPanel permissionState={permissionState} errorMessage={errorMessage} onStartCamera={startCamera} onStopCamera={handleStopCamera} />
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
        {debugPanel}
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
