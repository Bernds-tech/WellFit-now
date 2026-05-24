export type AgentCenterBucket = "total"|"pending_approval"|"approved_ready"|"rejected"|"blocked"|"in_progress"|"completed"|"repair_required"|"halted_waiting_owner"|"checks_pending"|"checks_passed"|"checks_failed"|"pr_created"|"branch_ready"|"merged"|"cycle_restart_required"|"not_decidable_sync_needed";

export type AdminDecisionSummary = {
  plainTitle: string;
  plainSummary: string;
  whatWillChange: string;
  whySuggested: string;
  wellFitBenefit: string;
  userBenefit: string;
  businessBenefit: string;
  economyImpact: string;
  riskSummary: string;
  recommendation: string;
  nextStepAfterApproval: string;
  allowedFilesPreview: string;
  blockedFilesPreview: string;
  missingDecisionData: string[];
};

const IN_PROGRESS = new Set(["queued","worker_queue","ready_for_worker","claimed","running","checks_recorded","pr_prepared","runner_started","branch_created","files_committed","pr_created","checks_pending","checks_passed","in_progress","active"]);
const COMPLETED = new Set(["completed","done","merged","auto_merged","executed"]);
const REPAIR = new Set(["failed","checks_failed","repair_required","conflict"]);
const PENDING_STATUSES = new Set(["pending_approval", "pending_admin_approval", "review_required", "review", "revision_requested", "research_more", "proposed", "drafted"]);

function asLower(value: unknown){ return typeof value === "string" ? value.toLowerCase() : ""; }
function asText(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function listPreview(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return "fehlt";
  return value.map((item) => String(item)).filter(Boolean).slice(0, 6).join(", ");
}

function hasDecisionTarget(entry: Record<string, unknown>): boolean {
  return Boolean(asText(entry.mirrorTargetId) || asText(entry.inboxId) || asText(entry.firestoreDecisionTarget) || asText(entry.targetId));
}

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
  if (["rejected", "declined", "abgelehnt"].includes(status)) return "rejected";
  if (status === "approved" || status === "approved_ready") return "approved_ready";
  const explicitPending = PENDING_STATUSES.has(status);
  const flaggedForReview = entry.requiresAdminReview === true || entry.adminApprovalRequired === true;
  if (explicitPending || flaggedForReview) return "pending_approval";
  if (IN_PROGRESS.has(status) || entry.queuedAt || entry.workerStartedAt || entry.runnerJobCreatedAt) return "in_progress";
  if (!status) return "not_decidable_sync_needed";
  return status;
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
  if (["pending_approval"].includes(n)) return "pending_approval";
  return "not_decidable_sync_needed";
}

export const getMissionStatusBucket = getAgentStatusBucket;

export function buildAdminDecisionSummary(entry: Record<string, unknown>): AdminDecisionSummary {
  const missingDecisionData: string[] = [];
  const technical = (asText(entry.sourceLabel) === "Catalog" || asText(entry.listType).includes("catalog")) && !asText(entry.dossierId);
  const plainTitle = asText(entry.title) || asText(entry.name) || asText(entry.id) || "Unbenannter Eintrag";
  const plainSummary = asText(entry.summary) || asText(entry.plainSummary) || (technical ? "Technischer Registereintrag ohne Entscheidungsdossier." : "Zusammenfassung fehlt.");
  const whatWillChange = asText(entry.whatWillChange) || asText(entry.expectedChange) || asText(entry.nextAction) || "fehlt";
  const whySuggested = asText(entry.whySuggested) || asText(entry.whyNow) || asText(entry.reason) || "fehlt";
  const wellFitBenefit = asText(entry.wellFitBenefit) || asText(entry.forWellFitBenefitSummary) || "fehlt";
  const userBenefit = asText(entry.userBenefit) || asText(entry.expectedUserBenefit) || "fehlt";
  const businessBenefit = asText(entry.businessBenefit) || asText(entry.expectedBusinessBenefit) || "fehlt";
  const economyImpact = asText(entry.economyImpact) || asText(entry.internalEconomyRecommendation) || "fehlt";
  const riskSummary = asText(entry.riskSummary) || asText(entry.riskLevel) || "fehlt";
  const recommendation = asText(entry.recommendation) || asText(entry.recommendedDecision) || "fehlt";
  const nextStepAfterApproval = asText(entry.nextStepAfterApproval) || asText(entry.suggestedBranch) || "fehlt";
  const allowedFilesPreview = listPreview(entry.allowedFiles);
  const blockedFilesPreview = listPreview(entry.blockedFiles);

  for (const [field, val] of Object.entries({ whatWillChange, whySuggested, wellFitBenefit, userBenefit, businessBenefit, economyImpact, riskSummary, recommendation, nextStepAfterApproval })) {
    if (val === "fehlt") missingDecisionData.push(field);
  }
  if (!hasDecisionTarget(entry)) missingDecisionData.push("decisionTarget");
  if (technical) missingDecisionData.push("dossier");

  return { plainTitle, plainSummary, whatWillChange, whySuggested, wellFitBenefit, userBenefit, businessBenefit, economyImpact, riskSummary, recommendation, nextStepAfterApproval, allowedFilesPreview, blockedFilesPreview, missingDecisionData };
}

export function formatAdminDate(value: unknown): string {
  if (!value) return "—";
  if (typeof value === "object" && value && "toDate" in value && typeof (value as {toDate:()=>Date}).toDate === "function") value = (value as {toDate:()=>Date}).toDate();
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function deriveTimeline(entry: Record<string, unknown>) { return { createdAt: entry.createdAt, submittedAt: entry.submittedAt, waitingForApprovalAt: entry.waitingForApprovalAt, approvedAt: entry.approvedAt, rejectedAt: entry.rejectedAt, blockedAt: entry.blockedAt, revisionRequestedAt: entry.revisionRequestedAt, queuedAt: entry.queuedAt, runnerJobCreatedAt: entry.runnerJobCreatedAt, workerStartedAt: entry.workerStartedAt, runnerStartedAt: entry.runnerStartedAt, branchCreatedAt: entry.branchCreatedAt, prCreatedAt: entry.prCreatedAt, checksStartedAt: entry.checksStartedAt, checksPassedAt: entry.checksPassedAt, checksFailedAt: entry.checksFailedAt, repairRequiredAt: entry.repairRequiredAt, haltedAt: entry.haltedAt, resumedAt: entry.resumedAt, mergedAt: entry.mergedAt, completedAt: entry.completedAt, nextCycleRequiredAt: entry.nextCycleRequiredAt, nextCycleStartedAt: entry.nextCycleStartedAt, analysisRestartedAt: entry.analysisRestartedAt, lastStatusChangedAt: entry.lastStatusChangedAt }; }
