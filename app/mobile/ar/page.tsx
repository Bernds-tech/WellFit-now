"use client";

import CameraPermissionPanel from "../analyse/components/CameraPermissionPanel";
import CameraPreview from "../analyse/components/CameraPreview";
import { useCameraPreview } from "../analyse/hooks/useCameraPreview";
import ArBuddyOverlay from "./components/ArBuddyOverlay";
import ArStatusCard from "./components/ArStatusCard";

export default function MobileArPage() {
  const { videoRef, permissionState, errorMessage, startCamera, stopCamera } = useCameraPreview();
  const isCameraActive = permissionState === "granted";

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <CameraPreview videoRef={videoRef} permissionState={permissionState}>
        <ArBuddyOverlay isCameraActive={isCameraActive} />
      </CameraPreview>

      <ArStatusCard
        cameraActive={isCameraActive}
        message={
          isCameraActive
            ? "Flammi ist als Kamera-Overlay sichtbar. Als nächstes kommen Bodenanker, Laufwege, echte 3D-Assets und Interaktion."
            : errorMessage || "Starte die Kamera, um den AR-Testmodus zu sehen."
        }
      />

      {!isCameraActive && (
        <div className="absolute inset-x-3 bottom-4 z-30">
          <CameraPermissionPanel
            permissionState={permissionState}
            errorMessage={errorMessage}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
          />
        </div>
      )}

      {isCameraActive && (
        <div className="absolute inset-x-3 bottom-4 z-30 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={stopCamera}
            className="rounded-2xl bg-white/12 px-4 py-3 text-sm font-black text-white backdrop-blur-md"
          >
            Kamera stoppen
          </button>
          <button
            type="button"
            className="rounded-2xl bg-orange-400 px-4 py-3 text-sm font-black text-[#042f35]"
          >
            Flammi rufen
          </button>
        </div>
      )}
    </main>
  );
}
