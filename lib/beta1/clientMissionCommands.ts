import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

export type Beta1MissionReviewSubmission = {
  attemptId: string;
  evidenceId: string;
  reviewStatus: "pending-server-review";
  missionCompletionAuthorized: false;
  xpAuthorized: false;
};

type StartMissionAttemptResponse = {
  accepted?: boolean;
  attemptId?: string;
  status?: string;
  missionCompletionAuthorized?: boolean;
};

type SubmitMissionEvidenceResponse = {
  accepted?: boolean;
  evidenceId?: string;
  reviewStatus?: string;
  missionCompletionAuthorized?: boolean;
  xpAuthorized?: boolean;
};

function callableErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();

  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, bevor du eine Mission startest.";
  if (diagnostic.includes("permission-denied")) return "Diese Mission ist für dein Konto nicht freigegeben.";
  if (diagnostic.includes("not-found") || diagnostic.includes("nicht publiziert")) return "Die ausgewählte Mission ist nicht mehr verfügbar.";
  if (diagnostic.includes("failed-precondition")) return "Die Mission kann in ihrem aktuellen Status nicht gestartet werden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Die sichere Missionsprüfung ist gerade nicht erreichbar.";
  return "Die Mission konnte nicht sicher eingereicht werden.";
}

function requireSignedInUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("unauthenticated: Firebase user missing");
  return user;
}

export async function submitDashboardMissionForReview(missionId: string): Promise<Beta1MissionReviewSubmission> {
  requireSignedInUser();
  const normalizedMissionId = missionId.trim();
  if (!normalizedMissionId) throw new Error("invalid-argument: missionId missing");

  try {
    const functions = getFunctions();
    const startMissionAttempt = httpsCallable<
      { missionId: string; appSessionId: string; clientVersion: string },
      StartMissionAttemptResponse
    >(functions, "startMissionAttempt");
    const submitMissionEvidence = httpsCallable<
      {
        attemptId: string;
        evidenceType: string;
        appSessionId: string;
        clientVersion: string;
        metadata: Record<string, string | boolean>;
      },
      SubmitMissionEvidenceResponse
    >(functions, "submitMissionEvidence");

    const appSessionId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `dashboard-${Date.now()}`;
    const clientVersion = "dashboard-beta1-review-v1";

    const attemptResult = await startMissionAttempt({
      missionId: normalizedMissionId,
      appSessionId,
      clientVersion,
    });
    const attemptId = attemptResult.data.attemptId;
    if (!attemptResult.data.accepted || !attemptId) {
      throw new Error("failed-precondition: mission attempt was not accepted");
    }

    const evidenceResult = await submitMissionEvidence({
      attemptId,
      evidenceType: "dashboard-user-confirmation",
      appSessionId,
      clientVersion,
      metadata: {
        source: "dashboard",
        requiresHumanReview: true,
        grantsClientReward: false,
      },
    });
    const evidenceId = evidenceResult.data.evidenceId;
    if (!evidenceResult.data.accepted || !evidenceId || evidenceResult.data.reviewStatus !== "pending-server-review") {
      throw new Error("failed-precondition: mission evidence was not accepted for review");
    }

    return {
      attemptId,
      evidenceId,
      reviewStatus: "pending-server-review",
      missionCompletionAuthorized: false,
      xpAuthorized: false,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}
