import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

export type Beta1MissionReviewStatus =
  | "pending-server-review"
  | "approved"
  | "rejected"
  | "needs-more-evidence";

export type Beta1MissionCompletionStatus = "not-completed" | "completed";

export type Beta1MissionReviewSubmission = {
  attemptId: string;
  evidenceId: string;
  reviewStatus: "pending-server-review";
  missionCompletionAuthorized: false;
  xpAuthorized: false;
};

export type Beta1MissionAttemptStatus = {
  attemptId: string;
  evidenceId: string;
  missionId: string | null;
  attemptStatus: string;
  reviewStatus: Beta1MissionReviewStatus;
  serverValidationStatus: string;
  completionStatus: Beta1MissionCompletionStatus;
  canRequestCompletion: boolean;
  missionCompletionAuthorized: boolean;
  xpAuthorized: boolean;
  rewardXp: number;
  xpLedgerEventId: string | null;
  tokenAuthorized: false;
  cashoutAllowed: false;
  noMonetaryValue: true;
};

export type Beta1PendingDashboardMission = {
  version: 1;
  userId: string;
  missionId: string;
  missionTitle: string;
  attemptId: string;
  evidenceId: string;
  submittedAt: string;
  lastCheckedAt: string | null;
  attemptStatus: string;
  reviewStatus: Beta1MissionReviewStatus;
  completionStatus: Beta1MissionCompletionStatus;
  rewardXp: number;
};

export type Beta1MissionCompletionResult = {
  completionId: string;
  xpLedgerEventId: string;
  rewardXp: number;
  evidenceId: string;
  idempotent: boolean;
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

type GetMissionAttemptStatusResponse = Partial<Beta1MissionAttemptStatus> & {
  accepted?: boolean;
};

type CompleteMissionAttemptResponse = {
  accepted?: boolean;
  completionId?: string;
  xpLedgerEventId?: string;
  rewardXp?: number;
  evidenceId?: string;
  idempotent?: boolean;
  xpAuthorized?: boolean;
  missionCompletionAuthorized?: boolean;
  tokenAuthorized?: boolean;
};

const pendingMissionStorageKey = (userId: string) => `wellfit-beta1-pending-mission:${userId}`;

function callableErrorMessage(error: unknown, operation: "start" | "status" | "complete" = "start"): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();

  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, bevor du die Mission fortsetzt.";
  if (diagnostic.includes("permission-denied")) return "Diese Mission oder Evidence gehört nicht zu deinem Konto.";
  if (diagnostic.includes("not-found")) return "Der sichere Missionsvorgang wurde nicht gefunden.";
  if (diagnostic.includes("freigegebene mission evidence")) return "Die Evidence wartet noch auf eine serverseitige Freigabe.";
  if (diagnostic.includes("nicht publiziert") || diagnostic.includes("nicht mehr publiziert")) return "Die ausgewählte Mission ist nicht mehr verfügbar.";
  if (diagnostic.includes("failed-precondition")) {
    if (operation === "complete") return "Die Mission kann noch nicht abgeschlossen werden. Bitte zuerst den Reviewstatus aktualisieren.";
    return "Die Mission kann in ihrem aktuellen Status nicht fortgesetzt werden.";
  }
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Die sichere Missionsprüfung ist gerade nicht erreichbar.";
  if (operation === "status") return "Der Reviewstatus konnte nicht sicher geladen werden.";
  if (operation === "complete") return "Die Mission konnte nicht sicher abgeschlossen werden.";
  return "Die Mission konnte nicht sicher eingereicht werden.";
}

function requireSignedInUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("unauthenticated: Firebase user missing");
  return user;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function isMissionReviewStatus(value: unknown): value is Beta1MissionReviewStatus {
  return value === "pending-server-review"
    || value === "approved"
    || value === "rejected"
    || value === "needs-more-evidence";
}

export function readPendingDashboardMission(userId: string): Beta1PendingDashboardMission | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = window.localStorage.getItem(pendingMissionStorageKey(userId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Beta1PendingDashboardMission>;
    if (
      value.version !== 1
      || value.userId !== userId
      || typeof value.missionId !== "string"
      || typeof value.missionTitle !== "string"
      || typeof value.attemptId !== "string"
      || typeof value.evidenceId !== "string"
      || typeof value.submittedAt !== "string"
      || !isMissionReviewStatus(value.reviewStatus)
    ) {
      window.localStorage.removeItem(pendingMissionStorageKey(userId));
      return null;
    }
    return {
      version: 1,
      userId,
      missionId: value.missionId,
      missionTitle: value.missionTitle,
      attemptId: value.attemptId,
      evidenceId: value.evidenceId,
      submittedAt: value.submittedAt,
      lastCheckedAt: typeof value.lastCheckedAt === "string" ? value.lastCheckedAt : null,
      attemptStatus: asString(value.attemptStatus, "evidence-submitted"),
      reviewStatus: value.reviewStatus,
      completionStatus: value.completionStatus === "completed" ? "completed" : "not-completed",
      rewardXp: typeof value.rewardXp === "number" && Number.isFinite(value.rewardXp) ? Math.max(0, value.rewardXp) : 0,
    };
  } catch {
    window.localStorage.removeItem(pendingMissionStorageKey(userId));
    return null;
  }
}

export function writePendingDashboardMission(value: Beta1PendingDashboardMission) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(pendingMissionStorageKey(value.userId), JSON.stringify(value));
}

export function clearPendingDashboardMission(userId: string) {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.removeItem(pendingMissionStorageKey(userId));
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
    const clientVersion = "dashboard-beta1-review-v2";

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
    throw new Error(callableErrorMessage(error, "start"), { cause: error });
  }
}

export async function getDashboardMissionAttemptStatus(
  pending: Pick<Beta1PendingDashboardMission, "attemptId" | "evidenceId">,
): Promise<Beta1MissionAttemptStatus> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<
      { attemptId: string; evidenceId: string },
      GetMissionAttemptStatusResponse
    >(getFunctions(), "getMissionAttemptStatus");
    const result = await callable({ attemptId: pending.attemptId, evidenceId: pending.evidenceId });
    const data = result.data;
    if (
      !data.accepted
      || typeof data.attemptId !== "string"
      || typeof data.evidenceId !== "string"
      || !isMissionReviewStatus(data.reviewStatus)
    ) {
      throw new Error("failed-precondition: invalid mission status response");
    }
    return {
      attemptId: data.attemptId,
      evidenceId: data.evidenceId,
      missionId: typeof data.missionId === "string" ? data.missionId : null,
      attemptStatus: asString(data.attemptStatus, "unknown"),
      reviewStatus: data.reviewStatus,
      serverValidationStatus: asString(data.serverValidationStatus, "unknown"),
      completionStatus: data.completionStatus === "completed" ? "completed" : "not-completed",
      canRequestCompletion: data.canRequestCompletion === true,
      missionCompletionAuthorized: data.missionCompletionAuthorized === true,
      xpAuthorized: data.xpAuthorized === true,
      rewardXp: typeof data.rewardXp === "number" && Number.isFinite(data.rewardXp) ? Math.max(0, data.rewardXp) : 0,
      xpLedgerEventId: typeof data.xpLedgerEventId === "string" ? data.xpLedgerEventId : null,
      tokenAuthorized: false,
      cashoutAllowed: false,
      noMonetaryValue: true,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error, "status"), { cause: error });
  }
}

export async function completeDashboardMissionAttempt(attemptId: string): Promise<Beta1MissionCompletionResult> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<{ attemptId: string }, CompleteMissionAttemptResponse>(
      getFunctions(),
      "completeMissionAttempt",
    );
    const result = await callable({ attemptId });
    const data = result.data;
    if (
      !data.accepted
      || data.xpAuthorized !== true
      || data.missionCompletionAuthorized !== true
      || data.tokenAuthorized === true
      || typeof data.completionId !== "string"
      || typeof data.xpLedgerEventId !== "string"
      || typeof data.evidenceId !== "string"
    ) {
      throw new Error("failed-precondition: mission completion was not authorized");
    }
    return {
      completionId: data.completionId,
      xpLedgerEventId: data.xpLedgerEventId,
      rewardXp: typeof data.rewardXp === "number" ? Math.max(0, data.rewardXp) : 0,
      evidenceId: data.evidenceId,
      idempotent: data.idempotent === true,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error, "complete"), { cause: error });
  }
}
