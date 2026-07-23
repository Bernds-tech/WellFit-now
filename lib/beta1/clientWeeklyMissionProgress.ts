import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import {
  getDashboardMissionAttemptStatus,
  type Beta1MissionReviewStatus,
} from "@/lib/beta1/clientMissionCommands";
import {
  WEEKLY_MISSION_CATALOG_ID,
  WEEKLY_MISSION_CATALOG_VERSION,
  WEEKLY_MISSION_COMPLETION_POLICY,
  WEEKLY_MISSION_EVIDENCE_TYPE,
} from "@/app/missionen/wochenmissionen/missions";

export type Beta1WeeklyActiveAttempt = {
  missionId: string;
  attemptId: string;
  weekKey: string;
  attemptStatus: string;
  evidenceId: string | null;
  reviewStatus: Beta1MissionReviewStatus | null;
  serverValidationStatus: string | null;
  canRequestCompletion: boolean;
};

export type Beta1WeeklyMissionProgress = {
  weekKey: string;
  weekStartDateKey: string;
  weekEndDateKey: string;
  catalogId: typeof WEEKLY_MISSION_CATALOG_ID;
  catalogVersion: typeof WEEKLY_MISSION_CATALOG_VERSION;
  completionPolicy: typeof WEEKLY_MISSION_COMPLETION_POLICY;
  startedMissionIds: string[];
  completedMissionIds: string[];
  activeAttempts: Beta1WeeklyActiveAttempt[];
  weeklyGoal: number;
  goalCompleted: boolean;
  walletBalance: number;
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  walletAvailable: boolean;
  progressAuthority: "server-read";
  noMonetaryValue: true;
};

export type Beta1WeeklyMissionActionResult = {
  kind: "submitted" | "resubmitted" | "pending" | "completed";
  message: string;
  rewardXp: number;
  reviewStatus: Beta1MissionReviewStatus | null;
};

type AuthorityEnvelope = {
  accepted?: boolean;
  noMonetaryValue?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
};

type RawProgressResponse = Partial<Beta1WeeklyMissionProgress> & AuthorityEnvelope;

type SubmitWeeklyMissionResponse = AuthorityEnvelope & {
  attemptId?: string;
  evidenceId?: string;
  weekKey?: string;
  attemptStatus?: string;
  reviewStatus?: unknown;
  missionCompletionAuthorized?: boolean;
  xpAuthorized?: boolean;
  idempotent?: boolean;
};

type CompleteWeeklyMissionResponse = AuthorityEnvelope & {
  completionId?: string;
  xpLedgerEventId?: string;
  rewardXp?: number;
  evidenceId?: string;
  weekKey?: string;
  xpAuthorized?: boolean;
  missionCompletionAuthorized?: boolean;
  idempotent?: boolean;
};

function requireSignedInUser() {
  if (!auth.currentUser) throw new Error("Bitte melde dich an, um Wochenmissionen sicher zu verwenden.");
}

function isReviewStatus(value: unknown): value is Beta1MissionReviewStatus {
  return value === "pending-server-review"
    || value === "approved"
    || value === "rejected"
    || value === "needs-more-evidence";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function asNonNegativeInteger(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}

function validateAuthority(data: AuthorityEnvelope) {
  return data.accepted === true
    && data.noMonetaryValue === true
    && data.tokenAuthorized !== true
    && data.cashoutAllowed !== true;
}

function callableErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const details = typeof error === "object" && error && "details" in error
    ? String((error as { details?: unknown }).details ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${details} ${message}`.toLowerCase();

  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, um Wochenmissionen zu verwenden.";
  if (diagnostic.includes("bereits abgeschlossen") || diagnostic.includes("bereits belohnt")) return "Diese Wochenmission wurde in der aktuellen Wien-Woche bereits abgeschlossen.";
  if (diagnostic.includes("freigegebene wochenmissions-evidence")) return "Die Wochenmission wartet noch auf eine serverseitige Evidence-Freigabe.";
  if (diagnostic.includes("permission-denied")) return "Dieser Wochenmissionsvorgang gehört nicht zu deinem Konto.";
  if (diagnostic.includes("not-found")) return "Der Wochenmissionsvorgang wurde nicht gefunden.";
  if (diagnostic.includes("nicht sicher veroeffentlicht") || diagnostic.includes("nicht publiziert")) return "Der Wochenmissionskatalog ist serverseitig noch nicht veröffentlicht.";
  if (diagnostic.includes("current vienna week") || diagnostic.includes("aktuellen wien-woche")) return "Diese Wochenmission gehört nicht mehr zur aktuellen Wien-Woche.";
  if (diagnostic.includes("invalid weekly mission projection")) return "Die Wochenmissions-Projektion war unvollständig und wurde verworfen.";
  if (diagnostic.includes("failed-precondition")) return "Die Wochenmission kann in ihrem aktuellen Prüfstatus nicht fortgesetzt werden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Der sichere Wochenmissionsdienst ist gerade nicht erreichbar.";
  return message || "Die Wochenmission konnte nicht sicher verarbeitet werden.";
}

function parseActiveAttempts(value: unknown): Beta1WeeklyActiveAttempt[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    if (typeof item.missionId !== "string" || typeof item.attemptId !== "string" || typeof item.weekKey !== "string") return [];
    return [{
      missionId: item.missionId,
      attemptId: item.attemptId,
      weekKey: item.weekKey,
      attemptStatus: typeof item.attemptStatus === "string" ? item.attemptStatus : "started",
      evidenceId: typeof item.evidenceId === "string" ? item.evidenceId : null,
      reviewStatus: isReviewStatus(item.reviewStatus) ? item.reviewStatus : null,
      serverValidationStatus: typeof item.serverValidationStatus === "string" ? item.serverValidationStatus : null,
      canRequestCompletion: item.canRequestCompletion === true,
    }];
  });
}

function parseProgress(data: RawProgressResponse): Beta1WeeklyMissionProgress {
  if (
    !validateAuthority(data)
    || typeof data.weekKey !== "string"
    || typeof data.weekStartDateKey !== "string"
    || typeof data.weekEndDateKey !== "string"
    || data.catalogId !== WEEKLY_MISSION_CATALOG_ID
    || data.catalogVersion !== WEEKLY_MISSION_CATALOG_VERSION
    || data.completionPolicy !== WEEKLY_MISSION_COMPLETION_POLICY
    || data.progressAuthority !== "server-read"
  ) {
    throw new Error("invalid weekly mission projection");
  }

  return {
    weekKey: data.weekKey,
    weekStartDateKey: data.weekStartDateKey,
    weekEndDateKey: data.weekEndDateKey,
    catalogId: WEEKLY_MISSION_CATALOG_ID,
    catalogVersion: WEEKLY_MISSION_CATALOG_VERSION,
    completionPolicy: WEEKLY_MISSION_COMPLETION_POLICY,
    startedMissionIds: asStringArray(data.startedMissionIds),
    completedMissionIds: asStringArray(data.completedMissionIds),
    activeAttempts: parseActiveAttempts(data.activeAttempts),
    weeklyGoal: Math.max(1, asNonNegativeInteger(data.weeklyGoal, 3)),
    goalCompleted: data.goalCompleted === true,
    walletBalance: asNonNegativeInteger(data.walletBalance),
    xp: asNonNegativeInteger(data.xp),
    level: Math.max(1, asNonNegativeInteger(data.level, 1)),
    xpForCurrentLevel: asNonNegativeInteger(data.xpForCurrentLevel),
    xpForNextLevel: Math.max(1, asNonNegativeInteger(data.xpForNextLevel, 100)),
    walletAvailable: data.walletAvailable === true,
    progressAuthority: "server-read",
    noMonetaryValue: true,
  };
}

export async function fetchWeeklyMissionProgress(): Promise<Beta1WeeklyMissionProgress> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<Record<string, never>, RawProgressResponse>(
      getFunctions(),
      "getWeeklyMissionProgress",
    );
    const result = await callable({});
    return parseProgress(result.data);
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function submitWeeklyMissionForReview(missionId: string): Promise<Beta1WeeklyMissionActionResult> {
  requireSignedInUser();
  const normalizedMissionId = missionId.trim();
  if (!normalizedMissionId) throw new Error("Die Wochenmissions-ID fehlt.");
  try {
    const callable = httpsCallable<
      {
        missionId: string;
        clientVersion: string;
        appSessionId: string;
      },
      SubmitWeeklyMissionResponse
    >(getFunctions(), "submitWeeklyMissionForReview");
    const appSessionId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `weekly-${Date.now()}`;
    const result = await callable({
      missionId: normalizedMissionId,
      clientVersion: "weekly-missions-beta1-runtime-v1",
      appSessionId,
    });
    const data = result.data;
    if (
      !validateAuthority(data)
      || typeof data.attemptId !== "string"
      || typeof data.evidenceId !== "string"
      || typeof data.weekKey !== "string"
      || !isReviewStatus(data.reviewStatus)
      || data.missionCompletionAuthorized === true
      || data.xpAuthorized === true
    ) {
      throw new Error("failed-precondition: invalid weekly mission submission");
    }
    return {
      kind: data.reviewStatus === "pending-server-review" ? "submitted" : "pending",
      message: data.reviewStatus === "approved"
        ? "Die vorhandene Evidence ist bereits freigegeben. Bitte den Abschluss erneut prüfen."
        : "Wochenmission wurde serverseitig gestartet. Deine Bestätigung wartet auf Admin-Prüfung; es wurden noch keine WFXP gutgeschrieben.",
      rewardXp: 0,
      reviewStatus: data.reviewStatus,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

async function completeWeeklyMission(attemptId: string): Promise<{
  rewardXp: number;
  idempotent: boolean;
}> {
  const callable = httpsCallable<{ attemptId: string }, CompleteWeeklyMissionResponse>(
    getFunctions(),
    "completeWeeklyMissionAttempt",
  );
  const result = await callable({ attemptId });
  const data = result.data;
  if (
    !validateAuthority(data)
    || data.xpAuthorized !== true
    || data.missionCompletionAuthorized !== true
    || typeof data.completionId !== "string"
    || typeof data.xpLedgerEventId !== "string"
    || typeof data.evidenceId !== "string"
    || typeof data.weekKey !== "string"
  ) {
    throw new Error("failed-precondition: weekly mission completion was not authorized");
  }
  return {
    rewardXp: asNonNegativeInteger(data.rewardXp),
    idempotent: data.idempotent === true,
  };
}

export async function reconcileWeeklyMissionAttempt(
  activeAttempt: Beta1WeeklyActiveAttempt,
): Promise<Beta1WeeklyMissionActionResult> {
  requireSignedInUser();
  try {
    if (
      !activeAttempt.evidenceId
      || activeAttempt.reviewStatus === "rejected"
      || activeAttempt.reviewStatus === "needs-more-evidence"
    ) {
      const result = await submitWeeklyMissionForReview(activeAttempt.missionId);
      return {
        ...result,
        kind: "resubmitted",
        message: "Eine neue sichere Wochenbestätigung wurde eingereicht. Der Vorgang wartet wieder auf Admin-Prüfung.",
      };
    }

    const status = await getDashboardMissionAttemptStatus({
      attemptId: activeAttempt.attemptId,
      evidenceId: activeAttempt.evidenceId,
    });
    if (status.completionStatus === "completed") {
      return {
        kind: "completed",
        message: `Wochenmission ist abgeschlossen. +${status.rewardXp} WFXP wurden serverseitig verbucht.`,
        rewardXp: status.rewardXp,
        reviewStatus: status.reviewStatus,
      };
    }
    if (status.reviewStatus === "rejected" || status.reviewStatus === "needs-more-evidence") {
      const result = await submitWeeklyMissionForReview(activeAttempt.missionId);
      return {
        ...result,
        kind: "resubmitted",
        message: "Eine neue sichere Wochenbestätigung wurde eingereicht. Der Vorgang wartet wieder auf Admin-Prüfung.",
      };
    }
    if (status.canRequestCompletion) {
      const completion = await completeWeeklyMission(activeAttempt.attemptId);
      return {
        kind: "completed",
        message: `Wochenmission abgeschlossen: +${completion.rewardXp} WFXP wurden im serverseitigen Ledger verbucht${completion.idempotent ? " (bereits vorhanden)" : ""}.`,
        rewardXp: completion.rewardXp,
        reviewStatus: status.reviewStatus,
      };
    }
    return {
      kind: "pending",
      message: "Die Wochenmission wartet weiterhin auf Admin-Prüfung. Es wurden noch keine WFXP gutgeschrieben.",
      rewardXp: 0,
      reviewStatus: status.reviewStatus,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export { WEEKLY_MISSION_EVIDENCE_TYPE };
