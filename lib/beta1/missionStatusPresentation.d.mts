export type MissionReviewStatus =
  | "pending-server-review"
  | "approved"
  | "rejected"
  | "needs-more-evidence";

export type MissionStatusTone = "neutral" | "info" | "warning" | "success" | "error";

export type MissionStatusState =
  | "login-required"
  | "loading"
  | "server-unavailable"
  | "ready"
  | "attempt-open"
  | "review-pending"
  | "review-approved"
  | "review-rejected"
  | "review-needs-more"
  | "completed"
  | "processing";

export type MissionStatusPresentation = Readonly<{
  state: MissionStatusState;
  title: string;
  detail: string;
  actionLabel: string;
  tone: MissionStatusTone;
  progress: number;
  completedStepCount: number;
  canResume: boolean;
  refreshRecommended: boolean;
  actionDisabled: boolean;
}>;

export type MissionLifecycleStep = Readonly<{
  key: "start" | "evidence" | "review" | "reward";
  label: string;
}>;

export const MISSION_LIFECYCLE_STEPS: readonly MissionLifecycleStep[];

export function normalizeMissionReviewStatus(value: unknown): MissionReviewStatus | null;

export function getMissionStatusPresentation(input?: {
  isAuthenticated?: boolean;
  ready?: boolean;
  progressSource?: "server" | "local";
  isStarted?: boolean;
  isCompleted?: boolean;
  actionBusy?: boolean;
  reviewStatus?: MissionReviewStatus | string | null;
}): MissionStatusPresentation;

export function formatMissionDateKey(dateKey?: string | null): string;
export function formatMissionTimeZone(timeZone?: string | null): string;
