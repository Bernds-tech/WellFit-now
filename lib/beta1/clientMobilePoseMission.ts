import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import { finishTrackingSession, startTrackingSession } from "@/lib/tracking";
import { getClientTimeZone } from "@/lib/beta1/clientUserContext";
import {
  completeDashboardMissionAttempt,
  getDashboardMissionAttemptStatus,
  type Beta1MissionReviewStatus,
} from "@/lib/beta1/clientMissionCommands";
import type { Beta1DailyActiveAttempt } from "@/lib/beta1/clientDailyMissionProgress";

export const MOBILE_SQUAT_MISSION_ID = "daily-squats-15";
export const MOBILE_SQUAT_TARGET_REPS = 15;
export const MOBILE_SQUAT_REWARD_WFXP = 9;

export type MobileSquatPoseMetrics = {
  validReps: number;
  invalidReps: number;
  qualityScore: number;
  confidence: number;
  moodSignal?: string;
  exercise?: string;
};

export type MobilePoseMissionResult = {
  state: "submitted" | "pending-review" | "needs-rerun" | "completed";
  message: string;
  reviewStatus: Beta1MissionReviewStatus | null;
  rewardXp: number;
};

type StartMissionAttemptResponse = {
  accepted?: boolean;
  attemptId?: string;
  status?: string;
};

type SubmitMissionEvidenceResponse = {
  accepted?: boolean;
  evidenceId?: string;
  reviewStatus?: Beta1MissionReviewStatus;
};

function requireSignedInUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Bitte melde dich an, bevor du die Kniebeugen-Mission startest.");
  return user;
}

function createAppSessionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `mobile-squat-${Date.now()}`;
}

function callableErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, bevor du die Mission verwendest.";
  if (diagnostic.includes("bereits abgeschlossen")) return "Die Kniebeugen-Mission wurde an deinem lokalen Kalendertag bereits abgeschlossen.";
  if (diagnostic.includes("permission-denied")) return "Dieser Missions- oder Trackingvorgang gehört nicht zu deinem Konto.";
  if (diagnostic.includes("nicht publiziert")) return "Die Kniebeugen-Mission ist im Beta-1-Katalog noch nicht veröffentlicht.";
  if (diagnostic.includes("not-found")) return "Der sichere Missions- oder Trackingvorgang wurde nicht gefunden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Der sichere Missionsdienst ist gerade nicht erreichbar.";
  return message || "Die Kniebeugen-Mission konnte nicht sicher verarbeitet werden.";
}

function normalizeMetrics(input: MobileSquatPoseMetrics): MobileSquatPoseMetrics {
  return {
    validReps: Math.max(0, Math.min(250, Math.floor(Number(input.validReps) || 0))),
    invalidReps: Math.max(0, Math.min(250, Math.floor(Number(input.invalidReps) || 0))),
    qualityScore: Math.max(0, Math.min(100, Number(input.qualityScore) || 0)),
    confidence: Math.max(0, Math.min(1, Number(input.confidence) || 0)),
    moodSignal: input.moodSignal?.slice(0, 40),
    exercise: input.exercise?.slice(0, 80) || "squat",
  };
}

export async function submitMobileSquatPoseForReview(
  input: MobileSquatPoseMetrics,
): Promise<MobilePoseMissionResult> {
  requireSignedInUser();
  const metrics = normalizeMetrics(input);
  if (metrics.validReps < MOBILE_SQUAT_TARGET_REPS) {
    throw new Error(`Für die Einreichung sind ${MOBILE_SQUAT_TARGET_REPS} saubere Kniebeugen erforderlich.`);
  }

  try {
    const appSessionId = createAppSessionId();
    const startAttempt = httpsCallable<
      { missionId: string; appSessionId: string; clientVersion: string; timeZone: string },
      StartMissionAttemptResponse
    >(getFunctions(), "startMissionAttempt");
    const attemptResult = await startAttempt({
      missionId: MOBILE_SQUAT_MISSION_ID,
      appSessionId,
      clientVersion: "mobile-squat-beta1-v2",
      timeZone: getClientTimeZone(),
    });
    if (!attemptResult.data.accepted || !attemptResult.data.attemptId) {
      throw new Error("Der Missions-Attempt wurde vom Server nicht angenommen.");
    }

    const trackingSessionId = await startTrackingSession({
      source: "pose",
      activityType: "pose",
      missionId: MOBILE_SQUAT_MISSION_ID,
      missionTitle: "15 saubere Kniebeugen",
    });
    const proof = await finishTrackingSession({
      sessionId: trackingSessionId,
      targetReps: MOBILE_SQUAT_TARGET_REPS,
      validReps: metrics.validReps,
      invalidReps: metrics.invalidReps,
      qualityScore: metrics.qualityScore,
      confidence: metrics.confidence,
      moodSignal: metrics.moodSignal,
      exercise: metrics.exercise,
      notes: "On-device Pose-Auswertung. Rohbilder und Videos werden nicht gespeichert oder hochgeladen.",
    });

    const submitEvidence = httpsCallable<
      {
        attemptId: string;
        evidenceType: "daily-user-confirmation";
        appSessionId: string;
        clientVersion: string;
        metadata: Record<string, string | number | boolean>;
      },
      SubmitMissionEvidenceResponse
    >(getFunctions(), "submitMissionEvidence");
    const evidenceResult = await submitEvidence({
      attemptId: attemptResult.data.attemptId,
      evidenceType: "daily-user-confirmation",
      appSessionId,
      clientVersion: "mobile-squat-beta1-v2",
      metadata: {
        source: "mobile-pose",
        verificationMode: "on-device-pose-summary",
        trackingSessionId,
        trackingProofEventId: proof.proofEventId,
        targetReps: MOBILE_SQUAT_TARGET_REPS,
        validReps: metrics.validReps,
        invalidReps: metrics.invalidReps,
        qualityScore: metrics.qualityScore,
        confidence: metrics.confidence,
        exercise: metrics.exercise || "squat",
        rawMediaStored: false,
        rawMediaUploaded: false,
      },
    });
    if (!evidenceResult.data.accepted || !evidenceResult.data.evidenceId) {
      throw new Error("Die Pose-Evidence wurde vom Server nicht angenommen.");
    }

    return {
      state: "submitted",
      message: "Pose-Zusammenfassung wurde für deinen lokalen Kalendertag serverseitig gespeichert. Sie wartet auf Admin-Prüfung; WFXP werden erst nach Freigabe und Completion gebucht.",
      reviewStatus: evidenceResult.data.reviewStatus || "pending-server-review",
      rewardXp: 0,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function reconcileMobileSquatMission(
  activeAttempt: Beta1DailyActiveAttempt,
): Promise<MobilePoseMissionResult> {
  requireSignedInUser();
  if (!activeAttempt.evidenceId) {
    return {
      state: "needs-rerun",
      message: "Für den offenen Attempt fehlt eine Evidence. Wiederhole die 15 Kniebeugen und reiche eine neue Pose-Zusammenfassung ein.",
      reviewStatus: null,
      rewardXp: 0,
    };
  }

  try {
    const status = await getDashboardMissionAttemptStatus({
      attemptId: activeAttempt.attemptId,
      evidenceId: activeAttempt.evidenceId,
    });
    if (status.completionStatus === "completed") {
      return {
        state: "completed",
        message: `Mission ist abgeschlossen. +${status.rewardXp} WFXP wurden serverseitig verbucht.`,
        reviewStatus: status.reviewStatus,
        rewardXp: status.rewardXp,
      };
    }
    if (status.canRequestCompletion) {
      const completion = await completeDashboardMissionAttempt(activeAttempt.attemptId);
      return {
        state: "completed",
        message: `Mission abgeschlossen: +${completion.rewardXp} WFXP wurden im serverseitigen Ledger verbucht${completion.idempotent ? " (bereits vorhanden)" : ""}.`,
        reviewStatus: status.reviewStatus,
        rewardXp: completion.rewardXp,
      };
    }
    if (status.reviewStatus === "rejected" || status.reviewStatus === "needs-more-evidence") {
      return {
        state: "needs-rerun",
        message: status.reviewStatus === "rejected"
          ? "Die Pose-Evidence wurde abgelehnt. Wiederhole die 15 Kniebeugen für eine neue Einreichung."
          : "Für die Mission wird weitere Evidence benötigt. Wiederhole die 15 Kniebeugen für eine neue Einreichung.",
        reviewStatus: status.reviewStatus,
        rewardXp: 0,
      };
    }
    return {
      state: "pending-review",
      message: "Die Pose-Evidence wartet weiterhin auf Admin-Prüfung. Es wurden noch keine WFXP gutgeschrieben.",
      reviewStatus: status.reviewStatus,
      rewardXp: 0,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}