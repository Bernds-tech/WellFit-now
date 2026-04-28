"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraPermissionState } from "@/lib/vision/visionTypes";

type CameraFacingMode = "user" | "environment";

type UseCameraPreviewOptions = {
  facingMode?: CameraFacingMode;
};

export type CameraPreviewDebugInfo = {
  facingMode: CameraFacingMode;
  hasStream: boolean;
  videoWidth: number;
  videoHeight: number;
  readyState: number;
  paused: boolean;
  trackState: string;
  trackLabel: string;
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

async function attachStreamToVideo(video: HTMLVideoElement, stream: MediaStream) {
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");

  if (video.srcObject !== stream) {
    video.srcObject = stream;
  }

  await new Promise<void>((resolve) => {
    if (video.readyState >= 1 && video.videoWidth > 0) {
      resolve();
      return;
    }

    const timeout = window.setTimeout(resolve, 900);
    video.onloadedmetadata = () => {
      window.clearTimeout(timeout);
      resolve();
    };
  });

  await video.play().catch((playError) => {
    console.warn("Camera stream attached, but video.play() was blocked", playError);
  });
}

export function useCameraPreview(options: UseCameraPreviewOptions = {}) {
  const { facingMode = "user" } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<CameraPermissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<CameraPreviewDebugInfo>({
    facingMode,
    hasStream: false,
    videoWidth: 0,
    videoHeight: 0,
    readyState: 0,
    paused: true,
    trackState: "none",
    trackLabel: "none",
  });

  const refreshDebugInfo = useCallback(() => {
    const video = videoRef.current;
    const track = streamRef.current?.getVideoTracks()[0];
    setDebugInfo({
      facingMode,
      hasStream: Boolean(streamRef.current),
      videoWidth: video?.videoWidth || 0,
      videoHeight: video?.videoHeight || 0,
      readyState: video?.readyState || 0,
      paused: video?.paused ?? true,
      trackState: track?.readyState || "none",
      trackLabel: track?.label || "none",
    });
  }, [facingMode]);

  const bindVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;

    if (!node) {
      refreshDebugInfo();
      return;
    }

    const stream = streamRef.current;
    if (!stream) {
      refreshDebugInfo();
      return;
    }

    attachStreamToVideo(node, stream).finally(() => {
      refreshDebugInfo();
      window.setTimeout(refreshDebugInfo, 500);
      window.setTimeout(refreshDebugInfo, 1200);
    });
  }, [refreshDebugInfo]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setPermissionState((current) => (current === "granted" ? "idle" : current));
    window.setTimeout(refreshDebugInfo, 0);
  }, [refreshDebugInfo]);

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

      if (videoRef.current) {
        await attachStreamToVideo(videoRef.current, stream);
      }

      setPermissionState("granted");
      refreshDebugInfo();
      window.setTimeout(refreshDebugInfo, 500);
      window.setTimeout(refreshDebugInfo, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kamera konnte nicht gestartet werden.";
      const lowerMessage = message.toLowerCase();
      setPermissionState(lowerMessage.includes("permission") || lowerMessage.includes("denied") || lowerMessage.includes("notallowed") ? "denied" : "error");
      setErrorMessage(message);
      refreshDebugInfo();
    }
  }, [facingMode, refreshDebugInfo, stopCamera]);

  useEffect(() => {
    const timer = window.setInterval(refreshDebugInfo, 1500);
    return () => window.clearInterval(timer);
  }, [refreshDebugInfo]);

  useEffect(() => {
    if (permissionState !== "granted") return;
    const stream = streamRef.current;
    const video = videoRef.current;
    if (!stream || !video) return;

    if (video.srcObject !== stream || video.videoWidth === 0 || video.paused) {
      attachStreamToVideo(video, stream).finally(() => {
        refreshDebugInfo();
        window.setTimeout(refreshDebugInfo, 500);
      });
    }
  }, [permissionState, refreshDebugInfo]);

  useEffect(() => stopCamera, [stopCamera]);

  return {
    videoRef: bindVideoRef,
    permissionState,
    errorMessage,
    debugInfo,
    startCamera,
    stopCamera,
  };
}
