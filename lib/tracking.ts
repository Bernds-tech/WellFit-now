import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

export type TrackingSource = "manual" | "mobile" | "googleFit" | "appleHealth" | "watch" | "pose";

export type StartTrackingInput = {
  source?: TrackingSource;
  missionId?: string;
  missionTitle?: string;
  activityType?: "steps" | "walking" | "running" | "workout" | "pose" | "manual";
};

export type FinishTrackingInput = {
  sessionId: string;
  targetReps?: number;
  stepsAggregated?: number;
  distanceAggregated?: number;
  eventsCount?: number;
  validReps?: number;
  invalidReps?: number;
  qualityScore?: number;
  confidence?: number;
  moodSignal?: string;
  exercise?: string;
  notes?: string;
};

export type TrackingProofResult = {
  sessionId: string;
  proofEventId: string;
  serverValidationStatus: string;
  idempotent: boolean;
  proofSummary?: {
    schemaVersion?: string;
    exercise?: string;
    targetReps?: number;
    validReps?: number;
    invalidReps?: number;
    qualityScore?: number;
    confidence?: number;
    moodSignal?: string | null;
    rawMediaStored?: boolean;
    rawMediaUploaded?: boolean;
    onDeviceAnalysis?: boolean;
  } | null;
};

type CreateTrackingSessionResponse = {
  accepted?: boolean;
  sessionId?: string;
  serverValidationStatus?: string;
};

type RecordTrackingProofResponse = {
  accepted?: boolean;
  proofEventId?: string;
  sessionId?: string;
  serverValidationStatus?: string;
  idempotent?: boolean;
  proofSummary?: TrackingProofResult["proofSummary"];
};

function requireSignedInUser() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Bitte zuerst registrieren oder einloggen.");
  return currentUser;
}

function callableSource(source?: TrackingSource): "mobile" | "manual-test" {
  return source === "manual" ? "manual-test" : "mobile";
}

function callableErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, bevor du Trackingdaten speicherst.";
  if (diagnostic.includes("permission-denied")) return "Diese Tracking-Session gehört nicht zu deinem Konto.";
  if (diagnostic.includes("not-found")) return "Die Tracking-Session wurde nicht gefunden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Der sichere Trackingdienst ist gerade nicht erreichbar.";
  return message || "Die Trackingdaten konnten nicht sicher gespeichert werden.";
}

function createAppSessionId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}`;
}

export async function startTrackingSession(input: StartTrackingInput = {}) {
  requireSignedInUser();
  const missionId = input.missionId?.trim();
  if (!missionId) throw new Error("Für die sichere Tracking-Session fehlt die Mission-ID.");

  try {
    const callable = httpsCallable<
      {
        missionId: string;
        source: "mobile" | "manual-test";
        proofType: "pose" | "motion";
        appSessionId: string;
        clientVersion: string;
      },
      CreateTrackingSessionResponse
    >(getFunctions(), "createTrackingSession");
    const proofType = input.activityType === "pose" || input.source === "pose" ? "pose" : "motion";
    const result = await callable({
      missionId,
      source: callableSource(input.source),
      proofType,
      appSessionId: createAppSessionId("tracking"),
      clientVersion: "mobile-tracking-callable-v1",
    });
    if (!result.data.accepted || !result.data.sessionId) {
      throw new Error("Tracking-Session wurde vom Server nicht angenommen.");
    }
    return result.data.sessionId;
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function finishTrackingSession(input: FinishTrackingInput): Promise<TrackingProofResult> {
  requireSignedInUser();
  const sessionId = input.sessionId.trim();
  if (!sessionId) throw new Error("Für den Tracking-Abschluss fehlt die Session-ID.");
  const poseProof = input.validReps !== undefined
    || input.invalidReps !== undefined
    || Boolean(input.exercise);

  try {
    const appSessionId = createAppSessionId("tracking-proof");
    if (poseProof) {
      const callable = httpsCallable<
        {
          sessionId: string;
          targetReps: number;
          validReps: number;
          invalidReps: number;
          qualityScore: number;
          confidence: number;
          moodSignal?: string;
          exercise?: string;
          appSessionId: string;
          clientVersion: string;
        },
        RecordTrackingProofResponse
      >(getFunctions(), "recordPoseTrackingProof");
      const result = await callable({
        sessionId,
        targetReps: Math.max(1, Math.floor(Number(input.targetReps || input.validReps || 1))),
        validReps: Math.max(0, Math.floor(Number(input.validReps || 0))),
        invalidReps: Math.max(0, Math.floor(Number(input.invalidReps || 0))),
        qualityScore: Math.max(0, Math.min(100, Number(input.qualityScore || 0))),
        confidence: Math.max(0, Math.min(1, Number(input.confidence || 0))),
        moodSignal: input.moodSignal,
        exercise: input.exercise,
        appSessionId,
        clientVersion: "mobile-tracking-callable-v1",
      });
      if (!result.data.accepted || !result.data.proofEventId) {
        throw new Error("Pose-Nachweis wurde vom Server nicht angenommen.");
      }
      return {
        sessionId,
        proofEventId: result.data.proofEventId,
        serverValidationStatus: result.data.serverValidationStatus || "pose-summary-received",
        idempotent: result.data.idempotent === true,
        proofSummary: result.data.proofSummary ?? null,
      };
    }

    const callable = httpsCallable<
      {
        sessionId: string;
        proofType: "motion";
        status: "completed";
        appSessionId: string;
        clientVersion: string;
      },
      RecordTrackingProofResponse
    >(getFunctions(), "recordTrackingProof");
    const result = await callable({
      sessionId,
      proofType: "motion",
      status: "completed",
      appSessionId,
      clientVersion: "mobile-tracking-callable-v1",
    });
    if (!result.data.accepted || !result.data.proofEventId) {
      throw new Error("Tracking-Nachweis wurde vom Server nicht angenommen.");
    }
    return {
      sessionId,
      proofEventId: result.data.proofEventId,
      serverValidationStatus: result.data.serverValidationStatus || "received",
      idempotent: result.data.idempotent === true,
      proofSummary: null,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}
