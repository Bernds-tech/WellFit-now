export type AgentCenterBucket = "total"|"pending_approval"|"approved_ready"|"rejected"|"blocked"|"in_progress"|"completed"|"repair_required"|"halted_waiting_owner"|"checks_pending"|"checks_passed"|"checks_failed"|"pr_created"|"branch_ready"|"merged"|"cycle_restart_required";

const IN_PROGRESS = new Set(["queued","worker_queue","ready_for_worker","claimed","running","checks_recorded","pr_prepared","runner_started","branch_created","files_committed","pr_created","checks_pending","checks_passed","in_progress"]);
const COMPLETED = new Set(["completed","done","merged","auto_merged","executed"]);
const REPAIR = new Set(["failed","checks_failed","repair_required","conflict"]);

function asLower(value: unknown){ return typeof value === "string" ? value.toLowerCase() : ""; }

export function normalizeAgentCenterStatus(entry: Record<string, unknown>): string {
  const status = asLower(entry.status) || asLower(entry.githubRunnerStatus) || asLower(entry.workerStatus) || asLower(entry.runnerStatus);
  if (asLower(entry.automationMode) === "halted_waiting_owner" || entry.haltedAt) return "halted_waiting_owner";
  if (COMPLETED.has(status) || entry.mergedAt || entry.completedAt) return "completed";
  if (REPAIR.has(status) || entry.repairRequiredAt) return "repair_required";
  if (status === "checks_failed") return "checks_failed";
  if (status === "checks_pending" || entry.checksStartedAt) return "checks_pending";
  if (status === "checks_passed" || entry.checksPassedAt) return "checks_passed";
  if (status === "pr_created" || entry.prCreatedAt) return "pr_created";
  if (status === "branch_created" || entry.branchCreatedAt) return "branch_ready";
  if ((entry.nextCycleRequiredAt || entry.nextCycleRequired) && (entry.mergedAt || entry.completedAt || status === "merged")) return "cycle_restart_required";
  if (status === "blocked") return "blocked";
  if (status === "rejected" || status === "declined" || status === "abgelehnt") return "rejected";
  if (IN_PROGRESS.has(status) || entry.queuedAt || entry.workerStartedAt || entry.runnerJobCreatedAt) return "in_progress";
  if (status === "approved" || status === "approved_ready") return "approved_ready";
  if (status === "pending_admin_approval") return "pending_approval";
  if (status === "research_more") return "pending_approval";
  if (status === "review" || status === "review_required" || status === "revision_requested" || status === "proposed" || status === "drafted") return "pending_approval";
  if ((entry.requiresAdminReview === true || entry.adminApprovalRequired === true) && !["approved","approved_ready","rejected","blocked"].includes(status)) return "pending_approval";
  return status || "pending_approval";
}

export function getAgentStatusBucket(entry: Record<string, unknown>): AgentCenterBucket {
  const n = normalizeAgentCenterStatus(entry);
  if (["rejected"].includes(n)) return "rejected";
  if (["blocked"].includes(n)) return "blocked";
  if (["checks_failed"].includes(n)) return "checks_failed";
  if (["checks_pending"].includes(n)) return "checks_pending";
  if (["checks_passed"].includes(n)) return "checks_passed";
  if (["pr_created"].includes(n)) return "pr_created";
  if (["branch_ready"].includes(n)) return "branch_ready";
  if (["cycle_restart_required"].includes(n)) return "cycle_restart_required";
  if (["completed"].includes(n)) return "completed";
  if (["repair_required"].includes(n)) return "repair_required";
  if (["halted_waiting_owner"].includes(n)) return "halted_waiting_owner";
  if (["in_progress"].includes(n)) return "in_progress";
  if (["approved_ready"].includes(n)) return "approved_ready";
  return "pending_approval";
}

export const getMissionStatusBucket = getAgentStatusBucket;

export function formatAdminDate(value: unknown): string {
  if (!value) return "—";
  if (typeof value === "object" && value && "toDate" in value && typeof (value as {toDate:()=>Date}).toDate === "function") value = (value as {toDate:()=>Date}).toDate();
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function deriveTimeline(entry: Record<string, unknown>) {
  return {
    createdAt: entry.createdAt, submittedAt: entry.submittedAt, waitingForApprovalAt: entry.waitingForApprovalAt, approvedAt: entry.approvedAt,
    rejectedAt: entry.rejectedAt, blockedAt: entry.blockedAt, revisionRequestedAt: entry.revisionRequestedAt, queuedAt: entry.queuedAt,
    runnerJobCreatedAt: entry.runnerJobCreatedAt, workerStartedAt: entry.workerStartedAt, runnerStartedAt: entry.runnerStartedAt,
    branchCreatedAt: entry.branchCreatedAt, prCreatedAt: entry.prCreatedAt, checksStartedAt: entry.checksStartedAt,
    checksPassedAt: entry.checksPassedAt, checksFailedAt: entry.checksFailedAt, repairRequiredAt: entry.repairRequiredAt,
    haltedAt: entry.haltedAt, resumedAt: entry.resumedAt, mergedAt: entry.mergedAt, completedAt: entry.completedAt,
    nextCycleRequiredAt: entry.nextCycleRequiredAt, nextCycleStartedAt: entry.nextCycleStartedAt, analysisRestartedAt: entry.analysisRestartedAt,
    lastStatusChangedAt: entry.lastStatusChangedAt,
  };
}
