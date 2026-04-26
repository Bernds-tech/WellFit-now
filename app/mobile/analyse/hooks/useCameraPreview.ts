"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraPermissionState } from "@/lib/vision/visionTypes";

type CameraFacingMode = "user" | "environment";

type UseCameraPreviewOptions = {
  facingMode?: CameraFacingMode;
};

export function useCameraPreview(options: UseCameraPreviewOptions = {}) {
  const { facingMode = "user" } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<CameraPermissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setPermissionState((current) => (current === "granted" ? "idle" : current));
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unsupported");
      setErrorMessage("Dieses Gerät oder dieser Browser unterstützt keine Kamera-Vorschau.");
      return;
    }

    setPermissionState("requesting");
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: facingMode === "environment" ? 1280 : 720 },
          height: { ideal: facingMode === "environment" ? 720 : 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setPermissionState("granted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kamera konnte nicht gestartet werden.";
      setPermissionState(message.toLowerCase().includes("permission") ? "denied" : "error");
      setErrorMessage(message);
    }
  }, [facingMode]);

  useEffect(() => stopCamera, [stopCamera]);

  return {
    videoRef,
    permissionState,
    errorMessage,
    startCamera,
    stopCamera,
  };
}
