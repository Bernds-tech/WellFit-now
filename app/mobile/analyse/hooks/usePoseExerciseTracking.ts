"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { analyzeSquatPose } from "@/lib/vision/exerciseRules";
import { initialExerciseCounterState, updateSquatCounter } from "@/lib/vision/exerciseCounter";
import { getBuddyCoachFeedback } from "@/lib/vision/buddyCoachFeedback";
import { createFaceTracker } from "@/lib/vision/faceTracker";
import { estimateMoodSignal } from "@/lib/vision/moodSignalEngine";
import { createPoseTracker } from "@/lib/vision/poseTracker";
import type { CameraPermissionState, ExerciseCounterState, PoseAnalysisResult, PoseLandmarks } from "@/lib/vision/visionTypes";

type PoseTrackerInstance = Awaited<ReturnType<typeof createPoseTracker>>;
type FaceTrackerInstance = Awaited<ReturnType<typeof createFaceTracker>>;

type UsePoseExerciseTrackingInput = {
  videoRef: RefObject<HTMLVideoElement | null>;
  permissionState: CameraPermissionState;
};

export function usePoseExerciseTracking({ videoRef, permissionState }: UsePoseExerciseTrackingInput) {
  const poseTrackerRef = useRef<PoseTrackerInstance | null>(null);
  const faceTrackerRef = useRef<FaceTrackerInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const counterRef = useRef<ExerciseCounterState>(initialExerciseCounterState);
  const [counter, setCounter] = useState<ExerciseCounterState>(initialExerciseCounterState);
  const [landmarks, setLandmarks] = useState<PoseLandmarks>({});
  const [analysis, setAnalysis] = useState<PoseAnalysisResult | null>(null);
  const [trackerStatus, setTrackerStatus] = useState("wartet auf Kamera");
  const [trackerError, setTrackerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startPoseTracking() {
      if (permissionState !== "granted" || !videoRef.current) {
        return;
      }

      setTrackerStatus("Vision-Modelle werden geladen...");
      setTrackerError(null);

      try {
        poseTrackerRef.current = await createPoseTracker();

        try {
          faceTrackerRef.current = await createFaceTracker();
        } catch {
          faceTrackerRef.current = null;
        }

        if (cancelled) return;

        setTrackerStatus(faceTrackerRef.current ? "Skeleton + Face Tracking aktiv" : "Skeleton Tracking aktiv");

        const tick = () => {
          const video = videoRef.current;
          const poseTracker = poseTrackerRef.current;

          if (!video || !poseTracker || video.readyState < 2) {
            animationFrameRef.current = requestAnimationFrame(tick);
            return;
          }

          const nextLandmarks = poseTracker.detect(video);
          const nextAnalysis = analyzeSquatPose(nextLandmarks);
          const faceSignal = faceTrackerRef.current?.detect(video);
          const moodSignal = faceSignal?.moodSignal ?? estimateMoodSignal({
            faceDetected: undefined,
            exerciseQualityScore: nextAnalysis.detected ? nextAnalysis.stabilityScore : 0,
            headStabilityScore: nextAnalysis.torsoLeanScore,
          });
          const nextCounter = updateSquatCounter(counterRef.current, nextAnalysis, moodSignal);
          const coachFeedback = getBuddyCoachFeedback(nextCounter);
          const enrichedCounter = { ...nextCounter, feedback: coachFeedback };

          counterRef.current = enrichedCounter;
          setLandmarks(nextLandmarks);
          setAnalysis(nextAnalysis);
          setCounter(enrichedCounter);
          animationFrameRef.current = requestAnimationFrame(tick);
        };

        animationFrameRef.current = requestAnimationFrame(tick);
      } catch (error) {
        setTrackerStatus("Pose Tracking nicht verfügbar");
        setTrackerError(error instanceof Error ? error.message : "Pose Tracking konnte nicht gestartet werden.");
      }
    }

    startPoseTracking();

    return () => {
      cancelled = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      poseTrackerRef.current?.close();
      faceTrackerRef.current?.close();
      poseTrackerRef.current = null;
      faceTrackerRef.current = null;
    };
  }, [permissionState, videoRef]);

  useEffect(() => {
    if (permissionState !== "granted") {
      counterRef.current = initialExerciseCounterState;
      setCounter(initialExerciseCounterState);
      setLandmarks({});
      setAnalysis(null);
      setTrackerStatus("wartet auf Kamera");
      setTrackerError(null);
    }
  }, [permissionState]);

  return {
    counter,
    landmarks,
    analysis,
    trackerStatus,
    trackerError,
  };
}
