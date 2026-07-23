import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import {
  completeDashboardMissionAttempt,
  getDashboardMissionAttemptStatus,
  type Beta1MissionReviewStatus,
} from "@/lib/beta1/clientMissionCommands";

export type Beta1DailyActiveAttempt = {
  missionId: string;
  attemptId: string;
  startedDateKey: string | null;
  attemptStatus: string;
  evidenceId: string | null;
  reviewStatus: Beta1MissionReviewStatus | null;
  serverValidationStatus: string | null;
  canRequestCompletion: boolean;
};

export type Beta1DailyMissionProgress = {
  dateKey: string;
  catalogId: string;
  catalogVersion: string;
  completionPolicy: "once-per-mission-per-vienna-day";
  favoriteIds: string[];
  dailySlotIds: (string | null)[];
  startedMissionIds: string[];
  completedMissionIds: string[];
  activeAttempts: Beta1DailyActiveAttempt[];
  dailyGoal: number;
  goalCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  streakBonus: number;
  lastCompletedDate: string | null;
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  walletAvailable: boolean;
  progressAuthority: "server-read";
  noMonetaryValue: true;
};

export type Beta1DailyMissionActionResult = {
  kind: "submitted" | "resubmitted" | "pending" | "completed";
  message: string;
  rewardXp: number;
  reviewStatus: Beta1MissionReviewStatus | null;
};

type RawProgressResponse = Partial<Beta1DailyMissionProgress> & { accepted?: boolean };
type RawPreferencesResponse = {
  accepted?: boolean;
  favoriteIds?: unknown;
  dailySlotIds?: unknown;
};
type StartMissionAttemptResponse = {
  accepted?: boolean;
  attemptId?: string;
};
type SubmitMissionEvidenceResponse = {
  accepted?: boolean;
  evidenceId?: string;
  reviewStatus?: unknown;
};

function requireSignedInUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Bitte melde dich an, um Tagesmissionen sicher zu verwenden.");
  return user;
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

function asNonNegativeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function callableErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();

  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, um Tagesmissionen zu verwenden.";
  if (diagnostic.includes("bereits abgeschlossen")) return "Diese Tagesmission wurde heute bereits abgeschlossen.";
  if (diagnostic.includes("evidence-typ") || diagnostic.includes("evidence type")) return "Die Tagesmission akzeptiert nur die vorgesehene sichere Bestätigung.";
  if (diagnostic.includes("permission-denied")) return "Dieser Tagesmissionsvorgang gehört nicht zu deinem Konto.";
  if (diagnostic.includes("not-found")) return "Der Tagesmissionsvorgang wurde nicht gefunden.";
  if (diagnostic.includes("nicht publiziert")) return "Die Tagesmission ist serverseitig noch nicht veröffentlicht.";
  if (diagnostic.includes("failed-precondition")) return "Die Tagesmission kann in ihrem aktuellen Prüfstatus nicht fortgesetzt werden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Der sichere Tagesmissionsdienst ist gerade nicht erreichbar.";
  return message || "Die Tagesmission konnte nicht sicher verarbeitet werden.";
}

function parseActiveAttempts(value: unknown): Beta1DailyActiveAttempt[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    if (typeof item.missionId !== "string" || typeof item.attemptId !== "string") return [];
    return [{
      missionId: item.missionId,
      attemptId: item.attemptId,
      startedDateKey: typeof item.startedDateKey === "string" ? item.startedDateKey : null,
      attemptStatus: typeof item.attemptStatus === "string" ? item.attemptStatus : "started",
      evidenceId: typeof item.evidenceId === "string" ? item.evidenceId : null,
      reviewStatus: isReviewStatus(item.reviewStatus) ? item.reviewStatus : null,
      serverValidationStatus: typeof item.serverValidationStatus === "string" ? item.serverValidationStatus : null,
      canRequestCompletion: item.canRequestCompletion === true,
    }];
  });
}

function parseProgress(data: RawProgressResponse): Beta1DailyMissionProgress {
  if (!data.accepted || typeof data.dateKey !== "string") {
    throw new Error("Ungültige serverseitige Tagesmissions-Projektion.");
  }
  const slots = Array.isArray(data.dailySlotIds)
    ? data.dailySlotIds.map((entry) => typeof entry === "string" ? entry : null).slice(0, 3)
    : [];
  while (slots.length < 3) slots.push(null);

  return {
    dateKey: data.dateKey,
    catalogId: typeof data.catalogId === "string" ? data.catalogId : "wellfit-beta1-daily-missions",
    catalogVersion: typeof data.catalogVersion === "string" ? data.catalogVersion : "unknown",
    completionPolicy: "once-per-mission-per-vienna-day",
    favoriteIds: asStringArray(data.favoriteIds),
    dailySlotIds: slots,
    startedMissionIds: asStringArray(data.startedMissionIds),
    completedMissionIds: asStringArray(data.completedMissionIds),
    activeAttempts: parseActiveAttempts(data.activeAttempts),
    dailyGoal: Math.max(1, Math.floor(asNonNegativeNumber(data.dailyGoal, 3))),
    goalCompleted: data.goalCompleted === true,
    currentStreak: Math.floor(asNonNegativeNumber(data.currentStreak)),
    longestStreak: Math.floor(asNonNegativeNumber(data.longestStreak)),
    streakBonus: Math.floor(asNonNegativeNumber(data.streakBonus, 5)),
    lastCompletedDate: typeof data.lastCompletedDate === "string" ? data.lastCompletedDate : null,
    xp: Math.floor(asNonNegativeNumber(data.xp)),
    level: Math.max(1, Math.floor(asNonNegativeNumber(data.level, 1))),
    xpForCurrentLevel: Math.floor(asNonNegativeNumber(data.xpForCurrentLevel)),
    xpForNextLevel: Math.max(1, Math.floor(asNonNegativeNumber(data.xpForNextLevel, 100))),
    walletAvailable: data.walletAvailable === true,
    progressAuthority: "server-read",
    noMonetaryValue: true,
  };
}

async function submitEvidence(attemptId: string, missionId: string) {
  const callable = httpsCallable<
    {
      attemptId: string;
      evidenceType: "daily-user-confirmation";
      appSessionId: string;
      clientVersion: string;
      metadata: Record<string, string | boolean>;
    },
    SubmitMissionEvidenceResponse
  >(getFunctions(), "submitMissionEvidence");
  const appSessionId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `daily-${Date.now()}`;
  const result = await callable({
    attemptId,
    evidenceType: "daily-user-confirmation",
    appSessionId,
    clientVersion: "daily-missions-beta1-runtime-v1",
    metadata: {
      source: "daily-missions",
      missionId,
      requiresHumanReview: true,
      grantsClientReward: false,
    },
  });
  if (!result.data.accepted || typeof result.data.evidenceId !== "string" || !isReviewStatus(result.data.reviewStatus)) {
    throw new Error("Die Tagesmissions-Evidence wurde nicht sicher angenommen.");
  }
  return {
    evidenceId: result.data.evidenceId,
    reviewStatus: result.data.reviewStatus,
  };
}

export async function fetchDailyMissionProgress(): Promise<Beta1DailyMissionProgress> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<Record<string, never>, RawProgressResponse>(getFunctions(), "getDailyMissionProgress");
    const result = await callable({});
    return parseProgress(result.data);
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function saveDailyMissionPreferences(input: {
  favoriteIds: string[];
  dailySlotIds: (string | null)[];
}) {
  requireSignedInUser();
  try {
    const callable = httpsCallable<typeof input, RawPreferencesResponse>(getFunctions(), "saveDailyMissionPreferences");
    const result = await callable(input);
    if (!result.data.accepted) throw new Error("Server hat die Tagesauswahl nicht bestätigt.");
    return {
      favoriteIds: asStringArray(result.data.favoriteIds),
      dailySlotIds: Array.isArray(result.data.dailySlotIds)
        ? result.data.dailySlotIds.map((entry) => typeof entry === "string" ? entry : null).slice(0, 3)
        : input.dailySlotIds,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function submitDailyMissionForReview(missionId: string): Promise<Beta1DailyMissionActionResult> {
  requireSignedInUser();
  try {
    const startCallable = httpsCallable<{ missionId: string; clientVersion: string }, StartMissionAttemptResponse>(
      getFunctions(),
      "startMissionAttempt",
    );
    const startResult = await startCallable({ missionId, clientVersion: "daily-missions-beta1-runtime-v1" });
    if (!startResult.data.accepted || typeof startResult.data.attemptId !== "string") {
      throw new Error("Server hat den Tagesmissions-Attempt nicht bestätigt.");
    }
    const evidence = await submitEvidence(startResult.data.attemptId, missionId);
    return {
      kind: evidence.reviewStatus === "pending-server-review" ? "submitted" : "pending",
      message: evidence.reviewStatus === "approved"
        ? "Die bestehende Evidence ist bereits freigegeben. Bitte den Abschluss erneut prüfen."
        : "Mission wurde serverseitig gestartet. Deine Bestätigung wartet auf Admin-Prüfung; es wurden noch keine WFXP gutgeschrieben.",
      rewardXp: 0,
      reviewStatus: evidence.reviewStatus,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function reconcileDailyMissionAttempt(
  activeAttempt: Beta1DailyActiveAttempt,
): Promise<Beta1DailyMissionActionResult> {
  requireSignedInUser();
  try {
    if (
      !activeAttempt.evidenceId
      || activeAttempt.reviewStatus === "rejected"
      || activeAttempt.reviewStatus === "needs-more-evidence"
    ) {
      const evidence = await submitEvidence(activeAttempt.attemptId, activeAttempt.missionId);
      return {
        kind: "resubmitted",
        message: "Eine neue sichere Bestätigung wurde eingereicht. Der Vorgang wartet wieder auf Admin-Prüfung.",
        rewardXp: 0,
        reviewStatus: evidence.reviewStatus,
      };
    }

    const status = await getDashboardMissionAttemptStatus({
      attemptId: activeAttempt.attemptId,
      evidenceId: activeAttempt.evidenceId,
    });
    if (status.completionStatus === "completed") {
      return {
        kind: "completed",
        message: `Mission ist abgeschlossen. +${status.rewardXp} WFXP wurden serverseitig verbucht.`,
        rewardXp: status.rewardXp,
        reviewStatus: status.reviewStatus,
      };
    }
    if (status.reviewStatus === "rejected" || status.reviewStatus === "needs-more-evidence") {
      const evidence = await submitEvidence(activeAttempt.attemptId, activeAttempt.missionId);
      return {
        kind: "resubmitted",
        message: "Eine neue sichere Bestätigung wurde eingereicht. Der Vorgang wartet wieder auf Admin-Prüfung.",
        rewardXp: 0,
        reviewStatus: evidence.reviewStatus,
      };
    }
    if (status.canRequestCompletion) {
      const completion = await completeDashboardMissionAttempt(activeAttempt.attemptId);
      return {
        kind: "completed",
        message: `Mission abgeschlossen: +${completion.rewardXp} WFXP wurden im serverseitigen Ledger verbucht${completion.idempotent ? " (bereits vorhanden)" : ""}.`,
        rewardXp: completion.rewardXp,
        reviewStatus: status.reviewStatus,
      };
    }
    return {
      kind: "pending",
      message: "Die Mission wartet weiterhin auf Admin-Prüfung. Es wurden noch keine WFXP gutgeschrieben.",
      rewardXp: 0,
      reviewStatus: status.reviewStatus,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}
