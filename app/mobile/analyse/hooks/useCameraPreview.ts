"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraPermissionState } from "@/lib/vision/visionTypes";

type CameraFacingMode = "user" | "environment";

type UseCameraPreviewOptions = {
  facingMode?: CameraFacingMode;
};

async function requestCameraStream(facingMode: CameraFacingMode) {
  const preferredConstraints: MediaStreamConstraints = {
    video: {
      facingMode: { ideal: facingMode },
      width: { ideal: facingMode === "environment" ? 1280 : 720 },
      height: { ideal: facingMode === "environment" ? 720 : 1280 },
    },
    audio: false,
  };

  try {
    return await navigator.mediaDevices.getUserMedia(preferredConstraints);
  } catch (preferredError) {
    console.warn("Preferred camera constraints failed, retrying with simple video=true", preferredError);
    return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }
}

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
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setPermissionState((current) => (current === "granted" ? "idle" : current));
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unsupported");
      setErrorMessage("Dieses Gerät oder dieser Browser unterstützt keine Kamera-Vorschau.");
      return;
    }

    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      setPermissionState("unsupported");
      setErrorMessage("Die Kamera funktioniert im Browser nur über HTTPS oder localhost.");
      return;
    }

    setPermissionState("requesting");
    setErrorMessage(null);

    try {
      stopCamera();
      const stream = await requestCameraStream(facingMode);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        setPermissionState("granted");
        return;
      }

      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.srcObject = stream;

      const playPromise = video.play();
      if (playPromise) {
        await playPromise.catch((playError) => {
          console.warn("Camera stream attached, but video.play() was blocked", playError);
        });
      }

      setPermissionState("granted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kamera konnte nicht gestartet werden.";
      const lowerMessage = message.toLowerCase();
      setPermissionState(lowerMessage.includes("permission") || lowerMessage.includes("denied") || lowerMessage.includes("notallowed") ? "denied" : "error");
      setErrorMessage(message);
    }
  }, [facingMode, stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  return {
    videoRef,
    permissionState,
    errorMessage,
    startCamera,
    stopCamera,
  };
}
