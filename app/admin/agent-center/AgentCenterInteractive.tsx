"use client";

import { useEffect, useMemo, useState } from "react";

import { getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";

import safetyDossierRegister from "@/project-register/agent-safety-dossiers.json";
import conversationIdeaDossierRegister from "@/project-register/agent-conversation-idea-dossiers.json";
import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import { buildAdminDecisionSummary, buildServerInboxCounts, deriveTimeline, formatAdminDate, getAgentStatusBucket, getMissionStatusBucket, getServerInboxStatusBucket } from "@/lib/admin/agentCenterStatus";
import type { AdminCallableAuthState, AdminCenterDetailStatus, AdminCenterListFilter, AgentCenterDecisionInput, AgentCenterInboxItem, MissionCenterDecisionInput, ApprovedInboxToTaskProposalResult, AgentTaskProposal, AgentTaskProposalListResult, ProductEvolutionInboxSyncResult, TaskProposalWorkerQueueResult, ProductEvolutionRevisionDossierResult, AgentTaskWorkerQueueItem, AgentTaskWorkerQueueListResult, AgentRunnerJob, AgentRunnerJobListResult, AgentRunnerPickupContract, AgentRunnerPickupContractListResult, ManualRunnerPickupContractResult, AgentRunnerImplementationPlan, AgentRunnerImplementationPlanListResult, ManualRunnerImplementationPlanResult, ManualRunnerImplementationPlanApprovalResult, WorkerQueueReleaseResult, WorkerQueueRunnerPreview, WorkerQueueRunnerPreviewResult, WorkerQueueRunnerStartApprovalResult, AgentCenterPipelineResetResult, AgentSafetyDossier, AgentCenterAutopilotSnapshot, AgentCenterAutopilotSnapshotResult, BuilderWorkPackage, PrepareBuilderWorkPackageResult, ConversationIdeaDossier, ConversationIdeaDecisionResult, PrepareGithubBuilderBranchPrResult } from "@/lib/admin/beta1AdminTypes";
import { auth } from "@/lib/firebase";

type DetailSections = Record<string, string>;
const SAFETY_DOSSIERS = (safetyDossierRegister.dossiers || []) as AgentSafetyDossier[];
const STATIC_CONVERSATION_IDEA_DOSSIERS = (conversationIdeaDossierRegister.dossiers || []) as ConversationIdeaDossier[];
const P1_RESET_SAFETY_DOSSIER = SAFETY_DOSSIERS.find((dossier) => dossier.id === "safety-p1-agent-center-reset-scope-archive-v1") || SAFETY_DOSSIERS[0];
const CONVERSATION_DOSSIER_SOURCE_TYPE = "conversation_idea";
const normalizeConversationIdeaDossierForDisplay = (dossier: ConversationIdeaDossier, source: "seed" | "server"): ConversationIdeaDossier => {
  const dossierId = asText(dossier.dossierId || dossier.sourceDossierId || dossier.id || dossier.seedDossierId || dossier.serverDossierId);
  const status = asText(dossier.status || dossier.ownerDecisionStatus) || "pending_approval";
  return {
    ...dossier,
    id: dossierId,
    dossierId,
    sourceDossierId: asText(dossier.sourceDossierId || dossierId) || dossierId,
    sourceDossierType: CONVERSATION_DOSSIER_SOURCE_TYPE,
    source,
    serverDossierId: source === "server" ? asText(dossier.serverDossierId || dossier.id || dossierId) || dossierId : asText(dossier.serverDossierId) || null,
    seedDossierId: source === "seed" ? asText(dossier.seedDossierId || dossierId) || dossierId : asText(dossier.seedDossierId) || null,
    ownerDecisionStatus: asText(dossier.ownerDecisionStatus || status) || status,
    status,
    noRuntimeChanges: dossier.noRuntimeChanges !== false,
    noRunnerStarted: dossier.noRunnerStarted !== false,
    noBranchOrPrOrMerge: dossier.noBranchOrPrOrMerge !== false,
    noDeploy: dossier.noDeploy !== false,
    noTokenPaymentBlockchain: dossier.noTokenPaymentBlockchain !== false,
  };
};
const isVisibleConversationIdeaDossier = (dossier: ConversationIdeaDossier): boolean => Boolean(asText(dossier.dossierId) && asText(dossier.title || dossier.shortSummary || dossier.plainLanguageSummary));
type Row = Record<string, unknown> & {
  id?: string;
  title?: string;
  status?: string;
  visibleListSource?: "server_inbox" | "local_snapshot";
  listType?: string;
  sourceDossierId?: string;
  dossierId?: string;
  detailStatus?: AdminCenterDetailStatus | "partial_structured";
  detailText?: string;
  detailSections?: DetailSections;
  summary?: string;
  plainSummary?: string;
  what?: string;
  whatWillChange?: string;
  why?: string;
  whySuggested?: string;
  wellFitBenefit?: string;
  wellfitBenefit?: string;
  userBenefit?: string;
  economyImpact?: string;
  risk?: string;
  riskSummary?: string;
  recommendation?: string;
  recommendationLabel?: string;
  recommendationText?: string;
  readableDossierInboxId?: string | null;
  supersededByReadableDecisionDossier?: boolean;
  legacyProductEvolutionSource?: string | null;
  adminCenterSourcePriority?: number;
  nextStep?: string;
  priority?: string;
  shortSummary?: string;
  plainLanguageSummary?: string;
  problem?: string;
  proposedChange?: string;
  whyNow?: string;
  financialBenefit?: string;
  internalEconomyImpact?: string;
  risks?: string[];
  riskLevel?: string;
  affectedAreas?: string[];
  affectedFiles?: string[];
  sources?: string[];
  ownerDecisionRequired?: boolean;
  nextPipelineStep?: string;
  whyFirst?: string;
  afterApproval?: string;
  protectedData?: string[];
  noRuntimeChanges?: boolean;
  noTokenPaymentBlockchain?: boolean;
  noRunnerStarted?: boolean;
  noBranchOrPrOrMerge?: boolean;
  noDeploy?: boolean;
  sourceType?: string;
  sourceRef?: string;
  sourcePath?: string;
  dossierRef?: string;
  dossierIncomplete?: boolean;
  missingCriticalDecisionFields?: string[];
  hasDossierDetails?: boolean;
  hasReportDetails?: boolean;
  inboxId?: string;
  mirrorTargetId?: string;
  allowedFiles?: string[];
  blockedFiles?: string[];
  requiredChecks?: string[];
  mode?: string;
  singleDecisionStatus?: string;
  singleDecisionBlocker?: string;
  executionContract?: Record<string, unknown>;
  allowedExecution?: Record<string, unknown>;
  forbiddenExecution?: Record<string, unknown>;
  executionEnvelope?: Record<string, unknown>;
  validationPlan?: string[];
  rollbackPlan?: string[];
  stopConditions?: string[];
  targetEnvironment?: string;
  nextAutomaticSteps?: string[];
  executionContractVersion?: string;
  executionContractMode?: string;
  executionContractHash?: string;
  stableContractFingerprint?: string;
  approvedExecutionContractVersion?: string;
  approvedExecutionContractHash?: string;
  approvalMode?: string;
  approvalCoversAutomaticExecution?: boolean;
  requiresSingleDecisionReapproval?: boolean;
  reapprovalReason?: string;
  autoProgressStatus?: string;
};

type DataProps = { agents: Row[]; missions: Row[]; stats: Partial<Record<AdminCenterListFilter, number>> };
type ServerInboxFilter = "server_total" | "server_pending" | "server_approved" | "server_rejected" | "server_blocked" | "server_revision_requested" | "server_synced_to_task_proposal";
type TaskProposalFilter = "task_total" | "task_pending" | "task_approved" | "task_rejected" | "task_in_progress" | "task_completed" | "task_blocked";
type TaskProposalBucket = "pending" | "approved" | "rejected" | "in_progress" | "completed" | "blocked" | "unknown";
type WorkerQueueFilter = "worker_total" | "worker_waiting_review" | "worker_waiting_owner" | "worker_ready" | "worker_in_progress" | "worker_completed" | "worker_blocked" | "worker_repair_required";
type WorkerQueueBucket = "waiting_review" | "waiting_owner" | "ready_for_worker" | "in_progress" | "completed" | "blocked" | "repair_required" | "unknown";
type RunnerJobBucket = "pending_runner_pickup" | "pickup_contract_created" | "implementation_plan_created" | "planning" | "in_progress" | "completed" | "blocked" | "repair_required" | "unknown";
type PickupContractBucket = "planning_open" | "implementation_plan_created" | "implementation_plan_review" | "implementation_plan_approved" | "planning" | "completed" | "blocked" | "repair_required" | "unknown";
type BuilderQueueFilter = "builder_total" | "builder_waiting" | "builder_next_up" | "builder_active" | "builder_blocked" | "builder_repair_required" | "builder_completed" | "builder_paused";
type BuilderQueueBucket = "waiting" | "next_up" | "active" | "blocked" | "repair_required" | "completed" | "paused" | "proposed" | "cancelled" | "unknown";
type ActiveListFilter = AdminCenterListFilter | ServerInboxFilter | TaskProposalFilter | WorkerQueueFilter | BuilderQueueFilter;

const SERVER_FILTER_TO_BUCKET: Record<ServerInboxFilter, ReturnType<typeof getServerInboxStatusBucket> | "total"> = { server_total: "total", server_pending: "pending_approval", server_approved: "approved", server_rejected: "rejected", server_blocked: "blocked", server_revision_requested: "revision_requested", server_synced_to_task_proposal: "synced_to_task_proposal" };
const SERVER_FILTER_LABELS: Record<ServerInboxFilter, string> = { server_total: "Server-Inbox gesamt", server_pending: "Server: wartet auf Freigabe", server_approved: "Server: freigegeben", server_rejected: "Server: abgelehnt", server_blocked: "Server: blockiert", server_revision_requested: "Server: Überarbeitung angefordert", server_synced_to_task_proposal: "Server: Task Proposal erzeugt" };
const SERVER_FILTER_KEYS = Object.keys(SERVER_FILTER_TO_BUCKET) as ServerInboxFilter[];
const isServerInboxFilter = (value: ActiveListFilter): value is ServerInboxFilter => value.startsWith("server_");
const TASK_PROPOSAL_FILTER_TO_BUCKET: Record<TaskProposalFilter, TaskProposalBucket | "total"> = { task_total: "total", task_pending: "pending", task_approved: "approved", task_rejected: "rejected", task_in_progress: "in_progress", task_completed: "completed", task_blocked: "blocked" };
const TASK_PROPOSAL_FILTER_LABELS: Record<TaskProposalFilter, string> = { task_total: "Task Proposals gesamt", task_pending: "Task Proposals: warten/pending", task_approved: "Task Proposals: freigegeben", task_rejected: "Task Proposals: abgelehnt", task_in_progress: "Task Proposals: in Arbeit", task_completed: "Task Proposals: fertig", task_blocked: "Task Proposals: blockiert" };
const TASK_PROPOSAL_FILTER_KEYS = Object.keys(TASK_PROPOSAL_FILTER_TO_BUCKET) as TaskProposalFilter[];
const isTaskProposalFilter = (value: ActiveListFilter): value is TaskProposalFilter => value.startsWith("task_");


const WORKER_QUEUE_FILTER_TO_BUCKET: Record<WorkerQueueFilter, WorkerQueueBucket | "total"> = { worker_total: "total", worker_waiting_review: "waiting_review", worker_waiting_owner: "waiting_owner", worker_ready: "ready_for_worker", worker_in_progress: "in_progress", worker_completed: "completed", worker_blocked: "blocked", worker_repair_required: "repair_required" };
const WORKER_QUEUE_FILTER_LABELS: Record<WorkerQueueFilter, string> = { worker_total: "Worker Queue gesamt", worker_waiting_review: "Wartet auf Review", worker_waiting_owner: "Wartet auf Owner", worker_ready: "Bereit für Worker", worker_in_progress: "In Arbeit", worker_completed: "Fertig", worker_blocked: "Blockiert", worker_repair_required: "Repair Required" };
const WORKER_QUEUE_FILTER_KEYS = Object.keys(WORKER_QUEUE_FILTER_TO_BUCKET) as WorkerQueueFilter[];
const isWorkerQueueFilter = (value: ActiveListFilter): value is WorkerQueueFilter => value.startsWith("worker_");
const BUILDER_QUEUE_FILTER_TO_BUCKET: Record<BuilderQueueFilter, BuilderQueueBucket | "total"> = { builder_total: "total", builder_waiting: "waiting", builder_next_up: "next_up", builder_active: "active", builder_blocked: "blocked", builder_repair_required: "repair_required", builder_completed: "completed", builder_paused: "paused" };
const BUILDER_QUEUE_FILTER_LABELS: Record<BuilderQueueFilter, string> = { builder_total: "Builder Queue gesamt", builder_waiting: "Bauaufträge: warten", builder_next_up: "Bauaufträge: next_up", builder_active: "Bauaufträge: aktiv", builder_blocked: "Bauaufträge: blockiert", builder_repair_required: "Bauaufträge: Repair", builder_completed: "Bauaufträge: fertig", builder_paused: "Bauaufträge: pausiert" };
const BUILDER_QUEUE_FILTER_KEYS = Object.keys(BUILDER_QUEUE_FILTER_TO_BUCKET) as BuilderQueueFilter[];
const isBuilderQueueFilter = (value: ActiveListFilter): value is BuilderQueueFilter => value.startsWith("builder_");

const FILTER_TO_BUCKET: Record<AdminCenterListFilter, "total" | ReturnType<typeof getAgentStatusBucket>> = { agent_total: "total", agent_pending: "pending_approval", agent_approved: "approved_ready", agent_rejected: "rejected", agent_blocked: "blocked", agent_in_progress: "in_progress", agent_completed: "completed", agent_repair_required: "repair_required", agent_halted_waiting_owner: "halted_waiting_owner", agent_cycle_restart_required: "cycle_restart_required", mission_total: "total", mission_pending: "pending_approval", mission_approved: "approved_ready", mission_rejected: "rejected", mission_blocked: "blocked", mission_in_progress: "in_progress", mission_completed: "completed" };
const FILTER_LABELS: Record<AdminCenterListFilter, string> = { agent_total: "Alle Agenten/Register gesamt", agent_pending: "Register/Legacy: Warten", agent_approved: "Register/Legacy: Freigegeben", agent_rejected: "Register/Legacy: Abgelehnt", agent_blocked: "Register/Legacy: Blockiert", agent_in_progress: "Register/Legacy: In Arbeit", agent_completed: "Register/Legacy: Fertig", agent_repair_required: "Register/Legacy: Repair Required", agent_halted_waiting_owner: "Register/Legacy: Wartet auf Owner", agent_cycle_restart_required: "Register/Legacy: Nächster Zyklus", mission_total: "Missionsvorschläge gesamt", mission_pending: "Missionen: Warten auf Freigabe", mission_approved: "Missionen: Freigegeben", mission_rejected: "Missionen: Abgelehnt", mission_blocked: "Missionen: Blockiert", mission_in_progress: "Missionen: In Arbeit", mission_completed: "Missionen: Fertig" };
const FILTER_KEYS = Object.keys(FILTER_TO_BUCKET) as AdminCenterListFilter[];

  const asText = (value: unknown): string => (typeof value === "string" ? value : "");
const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : []);

function getTaskProposalBucket(proposal: AgentTaskProposal): TaskProposalBucket {
  const status = String(proposal.status || "").toLowerCase();
  if (["proposed", "review_required", "pending", "pending_approval", "draft"].includes(status)) return "pending";
  if (["approved", "approved_ready", "approved_for_work"].includes(status)) return "approved";
  if (["rejected", "declined"].includes(status)) return "rejected";
  if (["queued", "queued_for_worker_review", "queued_for_owner_review", "pending_worker_review", "ready_for_worker", "claimed", "running", "checks_recorded", "pr_prepared", "in_progress"].includes(status)) return "in_progress";
  if (["completed", "done", "executed"].includes(status)) return "completed";
  if (["blocked", "failed", "repair_required"].includes(status)) return "blocked";
  return "unknown";
}

function buildTaskProposalCounts(proposals: AgentTaskProposal[]) {
  const counts: Record<TaskProposalBucket, number> & { total: number } = { total: proposals.length, pending: 0, approved: 0, rejected: 0, in_progress: 0, completed: 0, blocked: 0, unknown: 0 };
  proposals.forEach((proposal) => { counts[getTaskProposalBucket(proposal)] += 1; });
  return counts;
}

function getWorkerQueueBucket(item: AgentTaskWorkerQueueItem): WorkerQueueBucket {
  const status = String(item.status || "").toLowerCase();
  if (["pending_worker_review", "queued_for_worker_review"].includes(status)) return "waiting_review";
  if (status === "queued_for_owner_review") return "waiting_owner";
  if (["ready_for_worker", "previewed_for_runner", "runner_start_approved"].includes(status)) return "ready_for_worker";
  if (["in_progress", "claimed", "running", "checks_recorded", "pr_prepared"].includes(status)) return "in_progress";
  if (status === "completed") return "completed";
  if (["blocked", "failed"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  return "unknown";
}

function buildWorkerQueueCounts(items: AgentTaskWorkerQueueItem[]) {
  const counts: Record<WorkerQueueBucket, number> & { total: number } = { total: items.length, waiting_review: 0, waiting_owner: 0, ready_for_worker: 0, in_progress: 0, completed: 0, blocked: 0, repair_required: 0, unknown: 0 };
  items.forEach((item) => { counts[getWorkerQueueBucket(item)] += 1; });
  return counts;
}


function getBuilderQueueBucket(item: BuilderWorkPackage): BuilderQueueBucket {
  const status = String(item.status || "").toLowerCase();
  if (status === "approved_waiting") return "waiting";
  if (status === "next_up") return "next_up";
  if (status === "active_metadata_only") return "active";
  if (["blocked_by_existing_active_work", "blocked_by_failed_checks", "blocked_by_stale_base"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  if (status === "completed_metadata_only") return "completed";
  if (status === "paused_by_owner") return "paused";
  if (status === "proposed") return "proposed";
  if (status === "cancelled") return "cancelled";
  return "unknown";
}

function buildBuilderQueueCounts(items: BuilderWorkPackage[]) {
  const counts: Record<BuilderQueueBucket, number> & { total: number } = { total: items.length, waiting: 0, next_up: 0, active: 0, blocked: 0, repair_required: 0, completed: 0, paused: 0, proposed: 0, cancelled: 0, unknown: 0 };
  items.forEach((item) => { counts[getBuilderQueueBucket(item)] += 1; });
  return counts;
}

function getRunnerJobBucket(item: AgentRunnerJob): RunnerJobBucket {
  const status = String(item.status || "").toLowerCase();
  if (["pending_runner_pickup", "runner_job_created"].includes(status)) return "pending_runner_pickup";
  if (status === "pickup_contract_created") return "pickup_contract_created";
  if (status === "implementation_plan_created" || status === "implementation_plan_review" || status === "implementation_plan_approved") return "implementation_plan_created";
  if (["picked_up", "planning"].includes(status)) return "planning";
  if (["in_progress", "claimed", "running"].includes(status)) return "in_progress";
  if (["completed", "done"].includes(status)) return "completed";
  if (["blocked", "failed"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  return "unknown";
}

function buildRunnerJobCounts(items: AgentRunnerJob[]) {
  const counts: Record<RunnerJobBucket, number> & { total: number } = { total: items.length, pending_runner_pickup: 0, pickup_contract_created: 0, implementation_plan_created: 0, planning: 0, in_progress: 0, completed: 0, blocked: 0, repair_required: 0, unknown: 0 };
  items.forEach((item) => { counts[getRunnerJobBucket(item)] += 1; });
  return counts;
}


function getPickupContractBucket(item: AgentRunnerPickupContract): PickupContractBucket {
  const status = String(item.status || "").toLowerCase();
  if (status === "pickup_contract_created") return "planning_open";
  if (status === "implementation_plan_created") return "implementation_plan_created";
  if (status === "implementation_plan_review") return "implementation_plan_review";
  if (status === "implementation_plan_approved") return "implementation_plan_approved";
  if (["picked_up", "planning", "in_progress"].includes(status)) return "planning";
  if (["completed", "done"].includes(status)) return "completed";
  if (["blocked", "failed"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  return "unknown";
}

function buildPickupContractCounts(items: AgentRunnerPickupContract[]) {
  const counts: Record<PickupContractBucket, number> & { total: number } = { total: items.length, planning_open: 0, implementation_plan_created: 0, implementation_plan_review: 0, implementation_plan_approved: 0, planning: 0, completed: 0, blocked: 0, repair_required: 0, unknown: 0 };
  items.forEach((item) => { counts[getPickupContractBucket(item)] += 1; });
  return counts;
}


function canApproveImplementationPlan(plan: AgentRunnerImplementationPlan) {
  const status = String(plan.status || "implementation_plan_created").toLowerCase();
  return status === "implementation_plan_created" || status === "implementation_plan_review";
}

function getImplementationPlanNextStep(plan: AgentRunnerImplementationPlan) {
  if (String(plan.status || "").toLowerCase() === "implementation_plan_approved") return "kontrolliertes Dateiänderungs-Paket vorbereiten";
  return plan.nextStep || "Owner muss den Implementierungsplan separat freigeben.";
}

function extractPickupContracts(result: AgentRunnerPickupContractListResult): AgentRunnerPickupContract[] {
  const contracts = Array.isArray(result.pickupContracts) ? result.pickupContracts : [];
  const items = Array.isArray(result.items) ? result.items : [];
  return contracts.length > 0 ? contracts : items;
}

function extractRunnerJobs(result: AgentRunnerJobListResult): AgentRunnerJob[] {
  const runnerJobs = Array.isArray(result.runnerJobs) ? result.runnerJobs : [];
  const items = Array.isArray(result.items) ? result.items : [];
  return runnerJobs.length > 0 ? runnerJobs : items;
}

function extractImplementationPlans(result: AgentRunnerImplementationPlanListResult): AgentRunnerImplementationPlan[] {
  const plans = Array.isArray(result.implementationPlans) ? result.implementationPlans : [];
  const items = Array.isArray(result.items) ? result.items : [];
  return plans.length > 0 ? plans : items;
}

function extractWorkerQueueItems(result: AgentTaskWorkerQueueListResult): AgentTaskWorkerQueueItem[] {
  const workerQueueItems = Array.isArray(result.workerQueueItems) ? result.workerQueueItems : [];
  const items = Array.isArray(result.items) ? result.items : [];
  return workerQueueItems.length > 0 ? workerQueueItems : items;
}


function extractTaskProposals(result: AgentTaskProposalListResult): AgentTaskProposal[] {
  const proposals = Array.isArray(result.proposals) ? result.proposals : [];
  const items = Array.isArray(result.items) ? result.items : [];
  return proposals.length > 0 ? proposals : items;
}

function safeResponseKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.keys(value as Record<string, unknown>).filter((key) => !/uid|email|token/i.test(key)).sort();
}

const firstText = (...values: unknown[]): string => { for (const value of values) { const text = asText(value).trim(); if (text) return text; } return ""; };
const SINGLE_DECISION_BLOCKER = "Dossier unvollständig – die einmalige Entscheidung muss alle späteren Ausführungsschritte beschreiben.";
const SINGLE_DECISION_ALLOWED_FILES = ["docs/**", "todolist/**", "project-register/**", "app/**", "functions/**", "firestore.rules", ".github/**"];
const SINGLE_DECISION_BLOCKED_FILES = ["native/**"];
const SINGLE_DECISION_STOP_CONDITIONS = ["file_outside_allowedFiles_required", "blockedFiles_required", "native_required", "token_payment_blockchain_required", "secrets_or_identity_in_debug", "required_checks_failed", "merge_conflict", "deploy_failed", "dossier_data_missing", "target_environment_not_test_main", "production_live_site_impacted"];

const objectValue = (value: unknown): Record<string, unknown> => (value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {});
const boolValue = (source: Record<string, unknown>, key: string): boolean => source[key] === true;
const includesAll = (values: string[], required: string[]): boolean => required.every((value) => values.includes(value));
const getExecutionEnvelope = (row: Row) => objectValue(row.executionEnvelope);
const getContractAllowedFiles = (row: Row): string[] => asStringArray(getExecutionEnvelope(row).allowedFiles).length ? asStringArray(getExecutionEnvelope(row).allowedFiles) : asStringArray(row.allowedFiles);
const getContractBlockedFiles = (row: Row): string[] => asStringArray(getExecutionEnvelope(row).blockedFiles).length ? asStringArray(getExecutionEnvelope(row).blockedFiles) : asStringArray(row.blockedFiles);
const getContractRequiredChecks = (row: Row): string[] => asStringArray(getExecutionEnvelope(row).requiredChecks).length ? asStringArray(getExecutionEnvelope(row).requiredChecks) : asStringArray(row.requiredChecks);
const getValidationPlan = (row: Row): string[] => asStringArray(row.validationPlan).length ? asStringArray(row.validationPlan) : asStringArray(getExecutionEnvelope(row).validationPlan);
const getRollbackPlan = (row: Row): string[] => asStringArray(row.rollbackPlan).length ? asStringArray(row.rollbackPlan) : asStringArray(getExecutionEnvelope(row).rollbackPlan);
const getStopConditions = (row: Row): string[] => asStringArray(row.stopConditions).length ? asStringArray(row.stopConditions) : asStringArray(getExecutionEnvelope(row).stopConditions);
const getNextAutomaticSteps = (row: Row): string[] => asStringArray(row.nextAutomaticSteps).length ? asStringArray(row.nextAutomaticSteps) : asStringArray(getExecutionEnvelope(row).nextAutomaticSteps);
const getTargetEnvironment = (row: Row): string => asText(row.targetEnvironment || getExecutionEnvelope(row).targetEnvironment);
const getCurrentExecutionContractHash = (row: Row): string => asText(row.executionContractHash || row.stableContractFingerprint);
const isLegacyApprovedReapprovalRequired = (row: Row): boolean => row.requiresSingleDecisionReapproval === true || asText(row.singleDecisionStatus) === "pending_single_decision_reapproval";
const contractApprovalMatchesCurrent = (row: Row): boolean => Boolean(asText(row.approvalMode) === "single_owner_decision" && row.approvalCoversAutomaticExecution === true && getCurrentExecutionContractHash(row) && asText(row.approvedExecutionContractHash) === getCurrentExecutionContractHash(row) && !isLegacyApprovedReapprovalRequired(row));
const AUTO_PROGRESS_CONTRACT_BLOCKED = "Automatische Ausführung blockiert: Der aktuelle Ausführungsvertrag wurde noch nicht einmalig freigegeben.";

const validateSingleDecisionExecutionContract = (row: Row) => {
  const executionContract = objectValue(row.executionContract);
  const allowedExecution = objectValue(row.allowedExecution);
  const forbiddenExecution = objectValue(row.forbiddenExecution);
  const envelope = getExecutionEnvelope(row);
  const allowedFiles = getContractAllowedFiles(row);
  const blockedFiles = getContractBlockedFiles(row);
  const requiredChecks = getContractRequiredChecks(row);
  const validationPlan = getValidationPlan(row);
  const rollbackPlan = getRollbackPlan(row);
  const stopConditions = getStopConditions(row);
  const nextAutomaticSteps = getNextAutomaticSteps(row);
  const missing: string[] = [];
  if (!asText(row.title)) missing.push("title");
  if (!firstText(row.summary, row.plainSummary, row.detailSections?.summary)) missing.push("summary");
  if (!firstText(row.what, row.whatWillChange, row.detailSections?.what, row.detailSections?.proposedChange)) missing.push("what");
  if (!firstText(row.why, row.whySuggested, row.detailSections?.why, row.detailSections?.whyNow)) missing.push("why");
  if (!firstText(row.wellFitBenefit, row.wellfitBenefit, row.detailSections?.wellFitBenefit)) missing.push("wellFitBenefit");
  if (!firstText(row.userBenefit, row.detailSections?.userBenefit)) missing.push("userBenefit");
  if (!firstText(row.economyImpact, row.detailSections?.economyImpact)) missing.push("economyImpact");
  if (!firstText(row.risk, row.riskSummary, row.detailSections?.risk, row.detailSections?.risks)) missing.push("risk");
  if (!firstText(row.recommendationText, row.recommendationLabel, row.recommendation, row.detailSections?.recommendation)) missing.push("recommendation");
  if (executionContract.mode !== "single_owner_decision") missing.push("executionContract.mode");
  if (!asText(row.executionContractVersion || executionContract.executionContractVersion)) missing.push("executionContractVersion");
  if (!getCurrentExecutionContractHash(row)) missing.push("executionContractHash");
  for (const key of ["ownerDecisionRequiredOnce", "decisionCoversTaskProposal", "decisionCoversWorkerQueue", "decisionCoversRunnerJob", "decisionCoversPickupContract", "decisionCoversImplementationPlan", "decisionCoversFileWrites", "decisionCoversBranchCreation", "decisionCoversPrCreation", "decisionCoversMerge", "decisionCoversDeploy"]) if (!boolValue(executionContract, key)) missing.push(`executionContract.${key}`);
  if (executionContract.decisionCoversNative !== false) missing.push("executionContract.decisionCoversNative");
  if (executionContract.decisionCoversTokenPaymentBlockchain !== false) missing.push("executionContract.decisionCoversTokenPaymentBlockchain");
  for (const key of ["fileWriteAllowed", "branchCreationAllowed", "prCreationAllowed", "mergeAllowed", "deployAllowed", "runnerStartAllowed", "automaticProgressAllowed"]) if (!boolValue(allowedExecution, key)) missing.push(`allowedExecution.${key}`);
  if (allowedExecution.requiresFurtherOwnerApproval !== false) missing.push("allowedExecution.requiresFurtherOwnerApproval");
  if (forbiddenExecution.nativeChangesAllowed !== false) missing.push("forbiddenExecution.nativeChangesAllowed");
  if (forbiddenExecution.tokenPaymentBlockchainAllowed !== false) missing.push("forbiddenExecution.tokenPaymentBlockchainAllowed");
  if (forbiddenExecution.secretsAllowedInDebug !== false) missing.push("forbiddenExecution.secretsAllowedInDebug");
  if (forbiddenExecution.productionLiveSiteDeployAllowed !== false) missing.push("forbiddenExecution.productionLiveSiteDeployAllowed");
  if (!includesAll(allowedFiles, SINGLE_DECISION_ALLOWED_FILES)) missing.push("allowedFiles");
  if (!includesAll(blockedFiles, SINGLE_DECISION_BLOCKED_FILES)) missing.push("blockedFiles");
  if (requiredChecks.length === 0) missing.push("requiredChecks");
  if (validationPlan.length === 0) missing.push("validationPlan");
  if (rollbackPlan.length === 0) missing.push("rollbackPlan");
  if (!includesAll(stopConditions, SINGLE_DECISION_STOP_CONDITIONS)) missing.push("stopConditions");
  if (!asText(envelope.maxRiskLevel)) missing.push("maxRiskLevel");
  if (getTargetEnvironment(row) !== "test_main") missing.push("targetEnvironment");
  if (nextAutomaticSteps.length === 0) missing.push("nextAutomaticSteps");
  const uniqueMissing = Array.from(new Set(missing));
  return { isSingleDecision: executionContract.mode === "single_owner_decision" || asText(row.mode) === "single_owner_decision", isComplete: uniqueMissing.length === 0, missing: uniqueMissing, blocker: uniqueMissing.length ? SINGLE_DECISION_BLOCKER : "" };
};
const getDecisionDetails = (row: Row) => {
  const contractValidation = validateSingleDecisionExecutionContract(row);
  const allowedFiles = contractValidation.isSingleDecision ? getContractAllowedFiles(row) : asStringArray(row.allowedFiles);
  const blockedFiles = contractValidation.isSingleDecision ? getContractBlockedFiles(row) : asStringArray(row.blockedFiles);
  const requiredChecks = contractValidation.isSingleDecision ? getContractRequiredChecks(row) : asStringArray(row.requiredChecks);
  const details = {
    title: firstText(row.title, row.id),
    summary: firstText(row.shortSummary, row.summary, row.plainLanguageSummary, row.plainSummary, row.detailSections?.summary, row.detailText),
    what: firstText(row.proposedChange, row.what, row.whatWillChange, row.detailSections?.what, row.detailSections?.proposedChange),
    why: firstText(row.whyNow, row.why, row.whySuggested, row.detailSections?.why, row.detailSections?.whyNow),
    wellFitBenefit: firstText(row.wellFitBenefit, row.wellfitBenefit, row.detailSections?.wellFitBenefit),
    userBenefit: firstText(row.userBenefit, row.detailSections?.userBenefit),
    economyImpact: firstText(row.internalEconomyImpact, row.economyImpact, row.detailSections?.economyImpact),
    risk: firstText(asStringArray(row.risks).join("\n"), row.risk, row.riskSummary, row.detailSections?.risk, row.detailSections?.risks),
    recommendationLabel: firstText(row.recommendationLabel, row.recommendation, row.detailSections?.recommendation),
    recommendationText: firstText(row.recommendationText, row.recommendationLabel, row.recommendation, row.detailSections?.recommendation),
    recommendation: firstText(row.recommendationText, row.recommendationLabel, row.recommendation, row.detailSections?.recommendation),
    recommendationDebug: firstText(row.recommendation, row.detailSections?.recommendation),
    source: firstText(row.sourceRef, row.sourcePath, row.dossierRef, row.sourceType),
    nextStep: firstText(row.nextPipelineStep, row.nextStep, "Approved Inbox → Task Proposal. Kein Runner/Deploy automatisch."),
    allowedFiles: allowedFiles.length ? allowedFiles : asStringArray(row.affectedFiles), blockedFiles, requiredChecks,
    validationPlan: getValidationPlan(row), rollbackPlan: getRollbackPlan(row), stopConditions: getStopConditions(row), nextAutomaticSteps: getNextAutomaticSteps(row),
    targetEnvironment: getTargetEnvironment(row), singleDecision: contractValidation,
  };
  const manualMissing = [!details.summary ? "summary" : "", !details.what ? "what" : "", !details.why ? "why" : "", !details.wellFitBenefit ? "wellFitBenefit" : "", !details.userBenefit ? "userBenefit" : "", !details.economyImpact ? "economyImpact" : "", !details.risk ? "risk" : "", !details.recommendation ? "recommendation" : "", allowedFiles.length === 0 ? "allowedFiles" : "", blockedFiles.length === 0 ? "blockedFiles" : "", requiredChecks.length === 0 ? "requiredChecks" : ""].filter(Boolean);
  const missing = contractValidation.isSingleDecision ? contractValidation.missing : manualMissing;
  return { ...details, missing, isComplete: missing.length === 0, detailStatus: contractValidation.isSingleDecision && missing.length > 0 ? "incomplete_single_decision_contract" : (missing.length === 0 ? "structured" : "missing") };
};
const isMissionFilter = (value: ActiveListFilter): value is Extract<AdminCenterListFilter, `mission_${string}`> => value.startsWith("mission_");

const POPUP_REDIRECT_FALLBACK_CODES = new Set(["auth/popup-closed-by-user", "auth/popup-blocked", "auth/cancelled-popup-request"]);
const UNAUTHORIZED_DOMAIN_CODE = "auth/unauthorized-domain";

const getFirebaseAuthErrorCode = (error: unknown): string => (typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code || "") : "");
const getSafeAdminDecisionErrorCode = (error: unknown): string => (typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code || "") : "");
const getSafeAdminDecisionErrorText = (error: unknown): string => {
  if (!(typeof error === "object" && error)) return "";
  const maybeError = error as { message?: unknown; details?: unknown };
  return [maybeError.message, maybeError.details].map((value) => String(value || "")).join(" ");
};
const getSafeAdminDecisionFailureMessage = (resultMessage?: string, errorCode?: string): string => {
  const code = errorCode || "";
  const message = String(resultMessage || "").trim();
  const diagnostic = `${code} ${message}`;
  if (code === "client_auth_loading") return "Admin-Authentifizierung wird geladen. Bitte kurz warten.";
  if (code === "client_auth_missing") return "Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.";
  if (code === "client_auth_not_ready") return "Admin-Rolle fehlt oder wurde noch nicht geladen.";
  if (diagnostic.includes("automation_control_blocked")) return "Admin-Entscheidung ist durch Automation-Control blockiert.";
  if (diagnostic.includes("workerQueueId fehlt") || diagnostic.includes("workerqueueid fehlt")) return "Worker Queue ID fehlt.";
  if (diagnostic.includes("worker_queue_item_not_found") || message === "Worker Queue Eintrag nicht gefunden.") return "Worker Queue Eintrag nicht gefunden.";
  if (diagnostic.includes("Nur ready_for_worker oder previewed_for_runner kann als Runner-Pickup Preview geprüft werden")) return "Nur ready_for_worker oder previewed_for_runner kann als Runner-Pickup Preview geprüft werden.";
  if (diagnostic.includes("Nur ready_for_worker kann als Runner-Pickup Preview geprüft werden")) return "Nur ready_for_worker kann als Runner-Pickup Preview geprüft werden.";
  if (diagnostic.includes("Nur ready_for_worker oder previewed_for_runner darf")) return "Nur ready_for_worker oder previewed_for_runner darf für manuellen Runner-Pickup freigegeben werden.";
  if (diagnostic.includes("Status erlaubt diese Freigabe nicht")) return "Status erlaubt diese Freigabe nicht.";
  if (diagnostic.includes("Pflichtdaten fehlen")) return "Pflichtdaten fehlen: allowedFiles/blockedFiles/requiredChecks.";
  if (diagnostic.includes("Sicherheitsflags verhindern Runner-Pickup Preview")) return "Sicherheitsflags verhindern Runner-Pickup Preview.";
  if (diagnostic.includes("Sicherheitsflags verhindern Runner-Start-Freigabe")) return "Sicherheitsflags verhindern Runner-Start-Freigabe.";
  if (diagnostic.includes("Sicherheitsflags verhindern Freigabe")) return "Sicherheitsflags verhindern Freigabe.";
  if (diagnostic.includes("Owner-protected Bereich blockiert")) return "Owner-protected Bereich blockiert.";
  if (diagnostic.includes("worker_queue_release_blocked:status_not_releasable")) return "Status erlaubt diese Freigabe nicht.";
  if (diagnostic.includes("worker_queue_release_blocked") && (diagnostic.includes("allowedFiles") || diagnostic.includes("blockedFiles") || diagnostic.includes("requiredChecks"))) return "Pflichtdaten fehlen: allowedFiles/blockedFiles/requiredChecks.";
  if (diagnostic.includes("worker_queue_release_blocked") && (diagnostic.includes("noRunnerStarted") || diagnostic.includes("runnerStarted") || diagnostic.includes("noBranchOrPrOrMerge") || diagnostic.includes("branch_pr_merge") || diagnostic.includes("noDeploy") || diagnostic.includes("deploy"))) return "Sicherheitsflags verhindern Freigabe.";
  if (diagnostic.includes("inbox_not_approved") || diagnostic.includes("inbox_status_not_allowed") || message === "Eintrag ist nicht approved.") return "Eintrag ist nicht approved.";
  if (diagnostic.includes("missing_approved_admin_decision") || message === "Missing approved admin decision.") return "Missing approved admin decision.";
  if (diagnostic.includes("missing_decision_data") || message === "Missing decision data.") return "Missing decision data.";
  if (diagnostic.includes("protected_scope_owner_required") || message === "Protected scope owner required.") return "Protected scope owner required.";
  if (diagnostic.includes("center_inbox_not_decidable") || message === "Eintrag ist nicht mehr entscheidbar.") return "Eintrag ist nicht mehr entscheidbar.";
  if (diagnostic.includes("server_inbox_entry_not_found") || diagnostic.includes("inbox_not_found") || message === "Server-Inbox-Eintrag nicht gefunden.") return "Server-Inbox-Eintrag nicht gefunden.";
  if (diagnostic.includes("conversation_dossier_id_missing")) return "Dossier-ID fehlt.";
  if (diagnostic.includes("conversation_dossier_not_approved")) return "Dossier ist nicht approved.";
  if (diagnostic.includes("conversation_seed_dossier_not_materialized")) return "Seed-Dossier nicht materialisiert.";
  if (diagnostic.includes("conversation_builder_work_package_exists")) return "Work Package existiert bereits.";
  if (diagnostic.includes("conversation_reapproval_required") || diagnostic.includes("blocked_by_reapproval_required")) return "Reapproval erforderlich.";
  if (diagnostic.includes("conversation_guard_blocked") || diagnostic.includes("open_previous_blocker") || diagnostic.includes("repair_limit_reached")) return "Guard blockiert.";
  if (diagnostic.includes("conversation_dossier_not_found")) return "Conversation-Dossier nicht gefunden.";
  if (code.includes("not-found")) return "Eintrag nicht gefunden.";
  if (diagnostic.includes("inbox_mirror_missing") || diagnostic.includes("not_mirrored")) return "Eintrag ist noch nicht in der Inbox gespiegelt.";
  if (code.includes("permission-denied")) return "Keine Berechtigung für diese Admin-Aktion.";
  if (code.includes("unauthenticated")) return "Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.";
  if (message && message.length <= 140 && !message.includes("@") && !message.toLowerCase().includes("token") && !message.toLowerCase().includes("uid")) return message;
  if (code.includes("failed-precondition")) return "Eintrag konnte nicht entschieden werden. Bitte Status und Decision-Target prüfen.";
  return "Eintrag konnte nicht entschieden werden. Bitte Inbox-Sync/Decision-Target prüfen.";
};
const getSafeAdminDecisionMessage = (error: unknown): string => {
  const code = getSafeAdminDecisionErrorCode(error);
  const text = getSafeAdminDecisionErrorText(error);
  return getSafeAdminDecisionFailureMessage(text, code);
};
const shouldUseRedirectFallback = (error: unknown): boolean => POPUP_REDIRECT_FALLBACK_CODES.has(getFirebaseAuthErrorCode(error));
const getSafeGoogleLoginMessage = (error: unknown): string => {
  const code = getFirebaseAuthErrorCode(error);
  if (code === UNAUTHORIZED_DOMAIN_CODE) return "Diese Domain ist in Firebase Authentication noch nicht autorisiert. Bitte Firebase Auth → Einstellungen → Autorisierte Domains prüfen.";
  if (POPUP_REDIRECT_FALLBACK_CODES.has(code)) return "Popup-Login fehlgeschlagen. Redirect-Login wird verwendet.";
  return "Firebase-Login fehlgeschlagen. Bitte erneut versuchen.";
};



const readableDossierPriority = (row: Row): number => {
  const listType = asText(row.listType);
  if (listType === "decisionDossiers" && asText(row.recommendationLabel)) return 0;
  if (asText(row.recommendationLabel) || asText(row.recommendationText)) return 10;
  if (row.supersededByReadableDecisionDossier === true || asText(row.legacyProductEvolutionSource)) return 90;
  return 50;
};

const compareReadableDossierRows = (a: Row, b: Row): number => {
  const explicitA = typeof a.adminCenterSourcePriority === "number" ? a.adminCenterSourcePriority : readableDossierPriority(a);
  const explicitB = typeof b.adminCenterSourcePriority === "number" ? b.adminCenterSourcePriority : readableDossierPriority(b);
  if (explicitA !== explicitB) return explicitA - explicitB;
  if (readableDossierPriority(a) !== readableDossierPriority(b)) return readableDossierPriority(a) - readableDossierPriority(b);
  return asText(a.title).localeCompare(asText(b.title), "de");
};

export default function AgentCenterInteractive({
  data,
  firstRunRegisterSnapshot = {},
  firstRunRegisterSnapshotKeys = [],
  firstRunOutput,
}: {
  data: DataProps;
  firstRunRegisterSnapshot?: Record<string, unknown>;
  firstRunRegisterSnapshotKeys?: string[];
  firstRunOutput?: Record<string, unknown>;
}) {
  const [active, setActive] = useState<ActiveListFilter>("server_pending");
  const [feedback, setFeedback] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [inboxItems, setInboxItems] = useState<AgentCenterInboxItem[]>([]);
  const [taskProposals, setTaskProposals] = useState<AgentTaskProposal[]>([]);
  const [workerQueueItems, setWorkerQueueItems] = useState<AgentTaskWorkerQueueItem[]>([]);
  const [runnerJobs, setRunnerJobs] = useState<AgentRunnerJob[]>([]);
  const [pickupContracts, setPickupContracts] = useState<AgentRunnerPickupContract[]>([]);
  const [implementationPlans, setImplementationPlans] = useState<AgentRunnerImplementationPlan[]>([]);
  const [agentSnapshot, setAgentSnapshot] = useState<AgentCenterAutopilotSnapshot | null>(null);
  const [detailRow, setDetailRow] = useState<Row | null>(null);
  const [taskProposalDetail, setTaskProposalDetail] = useState<AgentTaskProposal | null>(null);
  const [workerQueueDetail, setWorkerQueueDetail] = useState<AgentTaskWorkerQueueItem | null>(null);
  const [runnerPickupPreview, setRunnerPickupPreview] = useState<WorkerQueueRunnerPreview | null>(null);
  const [runnerJobDetail, setRunnerJobDetail] = useState<AgentRunnerJob | null>(null);
  const [pickupContractDetail, setPickupContractDetail] = useState<AgentRunnerPickupContract | null>(null);
  const [implementationPlanDetail, setImplementationPlanDetail] = useState<AgentRunnerImplementationPlan | null>(null);
  const [syncDebug, setSyncDebug] = useState<Record<string, unknown>>({});
  const [authDebug, setAuthDebug] = useState<AdminCallableAuthState>({ authReady: false, firebaseUserPresent: false, firebaseUidPresent: false, idTokenAvailable: false, tokenClaimsLoaded: false, agentRoleClaim: null, adminCallableAuthReady: false, lastAuthGuardMessage: "" });
  const [authActionPending, setAuthActionPending] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async () => {
      const state = await beta1AdminClient.getAdminCallableAuthState(false);
      setAuthDebug(state);
      if (state.adminCallableAuthReady) {
        void refreshTaskProposals();
        void refreshWorkerQueueItems();
        void refreshRunnerJobs();
        void refreshPickupContracts();
        void refreshImplementationPlans();
        void refreshAgentSnapshot();
      }
    });
    return () => unsubscribe();
    // refreshTaskProposals is intentionally invoked from the auth observer so the
    // Admin Center loads proposals exactly when callable auth becomes ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function resolveRedirectLogin() {
      try {
        const result = await getRedirectResult(auth);
        if (cancelled) return;
        if (result?.user) {
          const state = await beta1AdminClient.getAdminCallableAuthState(true);
          if (cancelled) return;
          setAuthDebug(state);
          setFeedback(state.adminCallableAuthReady ? "Admin-Login erfolgreich." : (state.lastAuthGuardMessage || "Firebase Login vorhanden, aber Admin-Rolle fehlt oder wurde noch nicht geladen."));
        }
      } catch (error) {
        if (!cancelled) setFeedback(getSafeGoogleLoginMessage(error));
      }
    }
    resolveRedirectLogin();
    return () => { cancelled = true; };
  }, []);


  const localSnapshotRows = useMemo(() => ({
    agents: data.agents.map((row) => ({ ...row, visibleListSource: "local_snapshot" as const })),
    missions: data.missions.map((row) => ({ ...row, visibleListSource: "local_snapshot" as const })),
  }), [data.agents, data.missions]);

  const serverInboxRows = useMemo<Row[]>(() => inboxItems.map((item) => {
    const row: Row = {
      ...item,
      id: item.inboxId,
      inboxId: item.inboxId,
      mirrorTargetId: item.mirrorTargetId,
      status: item.status,
      visibleListSource: "server_inbox",
      hasReportDetails: false,
    };
    const details = getDecisionDetails(row);
    return {
      ...row,
      hasDossierDetails: Boolean(details.title || details.summary || details.what || details.recommendation),
      detailStatus: details.isComplete ? "structured" : "missing",
      missingCriticalDecisionFields: details.missing,
      dossierIncomplete: !details.isComplete,
    };
  }), [inboxItems]);
  const visibleListSource: "server_inbox" | "local_snapshot" | "task_proposals" | "worker_queue" | "builder_queue" = isBuilderQueueFilter(active) ? "builder_queue" : (isWorkerQueueFilter(active) ? "worker_queue" : (isTaskProposalFilter(active) ? "task_proposals" : (isServerInboxFilter(active) ? "server_inbox" : "local_snapshot")));
  const activeCountSource: "server_inbox" | "legacy_register" | "mission_proposals" | "task_proposals" | "worker_queue" | "builder_queue" = isBuilderQueueFilter(active) ? "builder_queue" : (isWorkerQueueFilter(active) ? "worker_queue" : (isTaskProposalFilter(active) ? "task_proposals" : (isServerInboxFilter(active) ? "server_inbox" : (isMissionFilter(active) ? "mission_proposals" : "legacy_register"))));
  const serverInboxCounts = useMemo(() => buildServerInboxCounts(serverInboxRows), [serverInboxRows]);
  const serverInboxPendingCount = serverInboxCounts.pending_approval;
  const taskProposalCounts = useMemo(() => buildTaskProposalCounts(taskProposals), [taskProposals]);
  const workerQueueCounts = useMemo(() => buildWorkerQueueCounts(workerQueueItems), [workerQueueItems]);
  const runnerJobCounts = useMemo(() => buildRunnerJobCounts(runnerJobs), [runnerJobs]);
  const pickupContractCounts = useMemo(() => buildPickupContractCounts(pickupContracts), [pickupContracts]);
  const builderWorkPackages = useMemo(() => agentSnapshot?.builderWorkPackages || [], [agentSnapshot]);
  const conversationIdeaDossiers = useMemo(() => {
    const byId = new Map<string, ConversationIdeaDossier>();
    for (const seed of STATIC_CONVERSATION_IDEA_DOSSIERS) {
      const normalized = normalizeConversationIdeaDossierForDisplay(seed, "seed");
      if (isVisibleConversationIdeaDossier(normalized)) byId.set(normalized.dossierId, normalized);
    }
    for (const server of agentSnapshot?.conversationIdeaDossiers || []) {
      const normalized = normalizeConversationIdeaDossierForDisplay(server, "server");
      if (!isVisibleConversationIdeaDossier(normalized)) continue;
      const seed = byId.get(normalized.dossierId);
      byId.set(normalized.dossierId, seed ? { ...seed, ...normalized, title: normalized.title || seed.title, shortSummary: normalized.shortSummary || seed.shortSummary, plainLanguageSummary: normalized.plainLanguageSummary || seed.plainLanguageSummary } : normalized);
    }
    return Array.from(byId.values());
  }, [agentSnapshot]);
  const builderQueueCounts = useMemo(() => buildBuilderQueueCounts(builderWorkPackages), [builderWorkPackages]);

  const visibleTaskProposals = useMemo(() => {
    const sorted = [...taskProposals].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    if (!isTaskProposalFilter(active)) return [];
    const bucket = TASK_PROPOSAL_FILTER_TO_BUCKET[active];
    if (bucket === "total") return sorted;
    return sorted.filter((proposal) => getTaskProposalBucket(proposal) === bucket);
  }, [active, taskProposals]);

  const visibleBuilderWorkPackages = useMemo(() => {
    const sorted = [...builderWorkPackages].sort((a, b) => Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0));
    if (!isBuilderQueueFilter(active)) return [];
    const bucket = BUILDER_QUEUE_FILTER_TO_BUCKET[active];
    if (bucket === "total") return sorted;
    return sorted.filter((item) => getBuilderQueueBucket(item) === bucket);
  }, [active, builderWorkPackages]);

  const visibleWorkerQueueItems = useMemo(() => {
    const sorted = [...workerQueueItems].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    if (!isWorkerQueueFilter(active)) return [];
    const bucket = WORKER_QUEUE_FILTER_TO_BUCKET[active];
    if (bucket === "total") return sorted;
    return sorted.filter((item) => getWorkerQueueBucket(item) === bucket);
  }, [active, workerQueueItems]);

  const visible = useMemo(() => {
    if (isTaskProposalFilter(active) || isWorkerQueueFilter(active) || isBuilderQueueFilter(active)) return [];
    if (isServerInboxFilter(active)) {
      const bucket = SERVER_FILTER_TO_BUCKET[active];
      const sorted = [...serverInboxRows].sort(compareReadableDossierRows);
      if (bucket === "total") return sorted;
      return sorted.filter((row) => getServerInboxStatusBucket(row) === bucket);
    }

    const missionMode = isMissionFilter(active);
    const bucket = FILTER_TO_BUCKET[active];
    const list = missionMode ? localSnapshotRows.missions : localSnapshotRows.agents;
    const sorted = [...list].sort(compareReadableDossierRows);
    if (bucket === "total") return sorted;
    return sorted.filter((row) => (missionMode ? getMissionStatusBucket(row) : getAgentStatusBucket(row)) === bucket);
  }, [active, localSnapshotRows, serverInboxRows]);

  const snapshotResolution = useMemo(() => {
    const snapshotFromProp = firstRunRegisterSnapshot && typeof firstRunRegisterSnapshot === "object" ? firstRunRegisterSnapshot : null;
    const outputSnapshot = firstRunOutput && typeof firstRunOutput === "object" ? firstRunOutput : null;
    const candidate = snapshotFromProp && Object.keys(snapshotFromProp).length > 0
      ? snapshotFromProp
      : (outputSnapshot && Object.keys(outputSnapshot).length > 0 ? outputSnapshot : null);
    if (candidate) return { source: snapshotFromProp === candidate ? "firstRunRegisterSnapshot" : "firstRunOutput", snapshot: candidate };
    const reconstructed = {
      runId: asText(snapshotFromProp?.runId ?? outputSnapshot?.runId),
      createdAt: asText(snapshotFromProp?.createdAt ?? outputSnapshot?.createdAt),
      sourceScope: asText(snapshotFromProp?.sourceScope ?? outputSnapshot?.sourceScope),
      analysisInputs: snapshotFromProp?.analysisInputs ?? outputSnapshot?.analysisInputs ?? {},
      generatedDossiers: Array.isArray(snapshotFromProp?.generatedDossiers) ? snapshotFromProp.generatedDossiers : (Array.isArray(outputSnapshot?.generatedDossiers) ? outputSnapshot.generatedDossiers : []),
      recommendedApprovals: Array.isArray(snapshotFromProp?.recommendedApprovals) ? snapshotFromProp.recommendedApprovals : (Array.isArray(outputSnapshot?.recommendedApprovals) ? outputSnapshot.recommendedApprovals : []),
      decisionDossiers: Array.isArray(snapshotFromProp?.decisionDossiers) ? snapshotFromProp.decisionDossiers : (Array.isArray(outputSnapshot?.decisionDossiers) ? outputSnapshot.decisionDossiers : []),
      recommendedRejections: Array.isArray(snapshotFromProp?.recommendedRejections) ? snapshotFromProp.recommendedRejections : (Array.isArray(outputSnapshot?.recommendedRejections) ? outputSnapshot.recommendedRejections : []),
      recommendedResearchMore: Array.isArray(snapshotFromProp?.recommendedResearchMore) ? snapshotFromProp.recommendedResearchMore : (Array.isArray(outputSnapshot?.recommendedResearchMore) ? outputSnapshot.recommendedResearchMore : []),
      suggestedTaskQueue: Array.isArray(snapshotFromProp?.suggestedTaskQueue) ? snapshotFromProp.suggestedTaskQueue : (Array.isArray(outputSnapshot?.suggestedTaskQueue) ? outputSnapshot.suggestedTaskQueue : []),
      blockedItems: Array.isArray(snapshotFromProp?.blockedItems) ? snapshotFromProp.blockedItems : (Array.isArray(outputSnapshot?.blockedItems) ? outputSnapshot.blockedItems : []),
      nextCycleStart: snapshotFromProp?.nextCycleStart ?? outputSnapshot?.nextCycleStart ?? null,
      requiresAdminReview: snapshotFromProp?.requiresAdminReview ?? outputSnapshot?.requiresAdminReview ?? true,
      noRuntimeChanges: snapshotFromProp?.noRuntimeChanges ?? outputSnapshot?.noRuntimeChanges ?? true,
      missionStoryProposals: Array.isArray(snapshotFromProp?.missionStoryProposals) ? snapshotFromProp.missionStoryProposals : (Array.isArray(outputSnapshot?.missionStoryProposals) ? outputSnapshot.missionStoryProposals : []),
      snapshotMeta: snapshotFromProp?.snapshotMeta ?? outputSnapshot?.snapshotMeta ?? {},
    } as Record<string, unknown>;
    const hasArrays = ["decisionDossiers", "generatedDossiers", "recommendedApprovals", "recommendedResearchMore", "suggestedTaskQueue", "blockedItems"].some((key) => Array.isArray(reconstructed[key]) && (reconstructed[key] as unknown[]).length > 0);
    return hasArrays ? { source: "reconstructedFromArrays", snapshot: reconstructed } : { source: "missing", snapshot: null };
  }, [firstRunOutput, firstRunRegisterSnapshot]);

  const canRunRevisionDossierGenerator = authDebug.agentRoleClaim === "owner" || authDebug.agentRoleClaim === "admin_operator" || authDebug.agentRoleClaim === "admin";

  const snapshotStats = useMemo(() => {
    const snapshot = snapshotResolution.snapshot && typeof snapshotResolution.snapshot === "object" ? snapshotResolution.snapshot : {};
    const keys = firstRunRegisterSnapshotKeys.length > 0 ? firstRunRegisterSnapshotKeys : Object.keys(snapshot);
    const toCount = (value: unknown) => Array.isArray(value) ? value.length : (value && typeof value === "object" ? Object.keys(value as Record<string, unknown>).length : 0);
    const suggestedTaskQueueCount = toCount((snapshot as Record<string, unknown>).suggestedTaskQueue);
    const generatedDossiersCount = toCount((snapshot as Record<string, unknown>).generatedDossiers);
    const recommendedApprovalsCount = toCount((snapshot as Record<string, unknown>).recommendedApprovals);
    const decisionDossiersCount = toCount((snapshot as Record<string, unknown>).decisionDossiers);
    const recommendedResearchMoreCount = toCount((snapshot as Record<string, unknown>).recommendedResearchMore);
    const blockedItemsCount = toCount((snapshot as Record<string, unknown>).blockedItems);
    return {
      hasFirstRunOutput: keys.length > 0,
      localFirstRunKeys: keys,
      suggestedTaskQueueCount,
      generatedDossiersCount,
      recommendedApprovalsCount,
      recommendedResearchMoreCount,
      blockedItemsCount,
      decisionDossiersCount,
      localFirstRunCandidateCount: decisionDossiersCount + suggestedTaskQueueCount + generatedDossiersCount + recommendedApprovalsCount + recommendedResearchMoreCount + blockedItemsCount,
    };
  }, [firstRunRegisterSnapshotKeys, snapshotResolution.snapshot]);

  async function ensureAdminAuthReady(): Promise<boolean> {
    const state = await beta1AdminClient.getAdminCallableAuthState(true);
    setAuthDebug(state);
    if (!state.authReady) {
      setFeedback("Admin-Authentifizierung wird geladen. Bitte kurz warten.");
      return false;
    }
    if (!state.adminCallableAuthReady) {
      setFeedback(state.lastAuthGuardMessage || "Admin-Login erforderlich. Bitte mit Firebase anmelden.");
      return false;
    }
    return true;
  }


  async function loginWithGoogle() {
    setAuthActionPending(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      const state = await beta1AdminClient.getAdminCallableAuthState(true);
      setAuthDebug(state);
      setFeedback(state.adminCallableAuthReady ? "Admin-Login erfolgreich." : (state.lastAuthGuardMessage || "Firebase Login vorhanden, aber Admin-Rolle fehlt oder wurde noch nicht geladen."));
    } catch (error) {
      const message = getSafeGoogleLoginMessage(error);
      setFeedback(message);
      if (shouldUseRedirectFallback(error)) {
        await signInWithRedirect(auth, provider);
        return;
      }
    } finally {
      setAuthActionPending(false);
    }
  }

  async function logoutAdmin() {
    setAuthActionPending(true);
    try {
      await signOut(auth);
      const state = await beta1AdminClient.getAdminCallableAuthState(false);
      setAuthDebug(state);
      setFeedback("Admin abgemeldet. Admin-Callables sind wieder gesperrt.");
    } catch {
      setFeedback("Admin-Abmeldung fehlgeschlagen.");
    } finally {
      setAuthActionPending(false);
    }
  }


  async function refreshAgentSnapshot() {
    setSyncDebug((prev) => ({ ...prev, agentSnapshotLoadAttempted: true, agentSnapshotLoadAccepted: false, agentSnapshotLoadError: "" }));
    if (!(await ensureAdminAuthReady())) {
      const safeMessage = "Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.";
      setSyncDebug((prev) => ({ ...prev, agentSnapshotLoadError: safeMessage }));
      setFeedback(`Agent Snapshot konnte nicht geladen werden: ${safeMessage}`);
      return;
    }
    setBusy(true);
    try {
      const result = await beta1AdminClient.getAgentCenterAutopilotSnapshot() as AgentCenterAutopilotSnapshotResult;
      const accepted = Boolean(result.accepted);
      const snapshot = result.snapshot || null;
      setSyncDebug((prev) => ({
        ...prev,
        agentSnapshotLoadAttempted: true,
        agentSnapshotLoadAccepted: accepted,
        agentSnapshotLoadError: accepted ? "" : getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode),
        agentSnapshotVersion: snapshot?.snapshotVersion || "-",
        agentSnapshotCreatedAt: snapshot?.snapshotCreatedAt || "-",
        agentSnapshotNextAction: snapshot?.nextRecommendedAction || "-",
        agentSnapshotBuilderCount: snapshot?.builderWorkPackageCounts?.total ?? 0,
        agentSnapshotApprovedDossiers: snapshot?.agentCenterCounts?.approvedDossiers ?? 0,
      }));
      if (!accepted || !snapshot) {
        const safeMessage = getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode);
        setAgentSnapshot(null);
        setFeedback(`Agent Snapshot konnte nicht geladen werden: ${safeMessage}`);
        setSyncStatus(`Agent Snapshot konnte nicht geladen werden: ${safeMessage}`);
        return;
      }
      setAgentSnapshot(snapshot);
      setSyncStatus(`Agent Snapshot geladen: ${snapshot.snapshotCreatedAt || "jetzt"}. Screenshots sind für Queue/Counts nicht mehr nötig.`);
    } catch (error) {
      const safeMessage = getSafeAdminDecisionMessage(error);
      setAgentSnapshot(null);
      setSyncDebug((prev) => ({ ...prev, agentSnapshotLoadAccepted: false, agentSnapshotLoadError: safeMessage }));
      setFeedback(`Agent Snapshot konnte nicht geladen werden: ${safeMessage}`);
      setSyncStatus(`Agent Snapshot konnte nicht geladen werden: ${safeMessage}`);
    } finally {
      setBusy(false);
    }
  }

  async function refreshTaskProposals() {
    setSyncDebug((prev) => ({
      ...prev,
      taskProposalLoadAttempted: true,
      taskProposalLoadAccepted: false,
      taskProposalLoadError: "",
    }));
    if (!(await ensureAdminAuthReady())) {
      const safeMessage = "Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.";
      setSyncDebug((prev) => ({ ...prev, taskProposalLoadError: safeMessage }));
      setFeedback(`Task Proposals konnten nicht geladen werden: ${safeMessage}`);
      return;
    }
    setBusy(true);
    try {
      const result = await beta1AdminClient.listAgentTaskProposals() as AgentTaskProposalListResult;
      const proposals = extractTaskProposals(result);
      const counts = buildTaskProposalCounts(proposals);
      const accepted = Boolean(result.accepted);
      const responseKeys = safeResponseKeys(result);
      setSyncDebug((prev) => ({
        ...prev,
        taskProposalLoadAttempted: true,
        taskProposalLoadAccepted: accepted,
        taskProposalLoadedCount: Number(result.loadedCount ?? proposals.length),
        taskProposalResponseKeys: responseKeys,
        taskProposalLoadError: accepted ? "" : getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode),
        taskProposalPendingCount: counts.pending,
        taskProposalNoRunnerStartedVisible: proposals.some((proposal) => proposal.noRunnerStarted === true),
        taskProposalNoBranchOrPrOrMergeVisible: proposals.some((proposal) => proposal.noBranchOrPrOrMerge === true),
        taskProposalNoDeployVisible: proposals.some((proposal) => proposal.noDeploy === true),
      }));
      if (!accepted) {
        const safeMessage = getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode);
        setTaskProposals([]);
        setFeedback(`Task Proposals konnten nicht geladen werden: ${safeMessage}`);
        setSyncStatus(`Task Proposals konnten nicht geladen werden: ${safeMessage}`);
        return;
      }
      setTaskProposals(proposals);
      setSyncStatus(`Task Proposals geladen: ${proposals.length}. Review/Worker-Queue-Vorbereitung möglich; kein Runner, kein Deploy.`);
    } catch (error) {
      const safeMessage = getSafeAdminDecisionMessage(error);
      setTaskProposals([]);
      setSyncDebug((prev) => ({
        ...prev,
        taskProposalLoadAccepted: false,
        taskProposalLoadError: safeMessage,
      }));
      setFeedback(`Task Proposals konnten nicht geladen werden: ${safeMessage}`);
      setSyncStatus(`Task Proposals konnten nicht geladen werden: ${safeMessage}`);
    } finally {
      setBusy(false);
    }
  }

  async function refreshWorkerQueueItems() {
    setSyncDebug((prev) => ({
      ...prev,
      workerQueueLoadAttempted: true,
      workerQueueLoadAccepted: false,
      workerQueueLoadError: "",
    }));
    if (!(await ensureAdminAuthReady())) {
      const safeMessage = "Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.";
      setSyncDebug((prev) => ({ ...prev, workerQueueLoadError: safeMessage }));
      setFeedback(`Worker Queue konnte nicht geladen werden: ${safeMessage}`);
      return;
    }
    setBusy(true);
    try {
      const result = await beta1AdminClient.listAgentTaskWorkerQueueItems() as AgentTaskWorkerQueueListResult;
      const items = extractWorkerQueueItems(result);
      const accepted = Boolean(result.accepted);
      const responseKeys = safeResponseKeys(result);
      setSyncDebug((prev) => ({
        ...prev,
        workerQueueLoadAttempted: true,
        workerQueueLoadAccepted: accepted,
        workerQueueLoadedCount: Number(result.loadedCount ?? items.length),
        workerQueueResponseKeys: responseKeys,
        workerQueueLoadError: accepted ? "" : getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode),
        workerQueueNoRunnerStartedVisible: items.some((item) => item.noRunnerStarted === true),
        workerQueueNoBranchOrPrOrMergeVisible: items.some((item) => item.noBranchOrPrOrMerge === true),
        workerQueueNoDeployVisible: items.some((item) => item.noDeploy === true),
      }));
      if (!accepted) {
        const safeMessage = getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode);
        setWorkerQueueItems([]);
        setFeedback(`Worker Queue konnte nicht geladen werden: ${safeMessage}`);
        setSyncStatus(`Worker Queue konnte nicht geladen werden: ${safeMessage}`);
        return;
      }
      setWorkerQueueItems(items);
      setSyncStatus(`Worker Queue geladen: ${items.length}. Review-only; kein Runner, kein Branch, kein PR, kein Merge, kein Deploy.`);
    } catch (error) {
      const safeMessage = getSafeAdminDecisionMessage(error);
      setWorkerQueueItems([]);
      setSyncDebug((prev) => ({
        ...prev,
        workerQueueLoadAccepted: false,
        workerQueueLoadError: safeMessage,
      }));
      setFeedback(`Worker Queue konnte nicht geladen werden: ${safeMessage}`);
      setSyncStatus(`Worker Queue konnte nicht geladen werden: ${safeMessage}`);
    } finally {
      setBusy(false);
    }
  }

  async function refreshInbox() {
    if (!(await ensureAdminAuthReady())) return;
    setBusy(true);
    try {
      const result = await beta1AdminClient.listAgentCenterInboxItems() as unknown as { items?: AgentCenterInboxItem[] };
      const items = Array.isArray(result.items) ? result.items : [];
      setInboxItems(items);
      setSyncDebug((prev) => ({
        ...prev,
        serverInboxLoadedCount: items.length,
        serverInboxPendingCount: items.filter((item) => item.status === "pending_approval").length,
      }));
      setSyncStatus(`Server-Inbox geladen: ${items.length} Einträge.${items.length > 0 ? " Server-Inbox wird als sichtbare Liste verwendet." : " Sync erzeugte keine Inbox-Einträge. Lokale Snapshot-Kandidaten bleiben Fallback."}`);
    } finally {
      setBusy(false);
    }
  }

  async function runSync() {
    if (!(await ensureAdminAuthReady())) return;
    setBusy(true);
    try {
      const effectiveFirstRunRegisterSnapshot = snapshotResolution.snapshot;
      const sendingCandidateCount = snapshotStats.localFirstRunCandidateCount;
      const hasSnapshot = Boolean(effectiveFirstRunRegisterSnapshot && typeof effectiveFirstRunRegisterSnapshot === "object" && Object.keys(effectiveFirstRunRegisterSnapshot).length > 0 && sendingCandidateCount > 0);
      if (!hasSnapshot) {
        setSyncStatus("First-Run-Snapshot ist nicht syncfähig geladen. Anzeige-Counts vorhanden, aber Snapshot-Payload fehlt.");
        setFeedback("Sync abgebrochen: registerSnapshot fehlt im Client.");
        setSyncDebug({
          clientSendingRegisterSnapshot: false,
          clientSendingRegisterSnapshotKeys: [],
          clientSendingRegisterSnapshotType: snapshotResolution.source === "missing" ? "-" : typeof effectiveFirstRunRegisterSnapshot,
          clientSendingCandidateCount: 0,
          clientVisibleCandidateCount: snapshotStats.localFirstRunCandidateCount,
          clientSnapshotSource: snapshotResolution.source,
        });
        return;
      }
      const snapshotToSend = JSON.parse(JSON.stringify(effectiveFirstRunRegisterSnapshot)) as Record<string, unknown>;
      const hasSerializedSnapshot = Boolean(snapshotToSend && typeof snapshotToSend === "object" && !Array.isArray(snapshotToSend));
      const serializedCandidateCount = hasSerializedSnapshot
        ? ["decisionDossiers", "generatedDossiers", "recommendedApprovals", "recommendedResearchMore", "suggestedTaskQueue", "blockedItems"]
          .map((key) => {
            const value = snapshotToSend[key];
            return Array.isArray(value) ? value.length : 0;
          })
          .reduce((sum, value) => sum + value, 0)
        : 0;
      if (!hasSerializedSnapshot || serializedCandidateCount <= 0) {
        setSyncStatus("First-Run-Snapshot ist nicht syncfähig serialisiert. Bitte Snapshot-Quelle prüfen.");
        setFeedback("Sync abgebrochen: registerSnapshot konnte nicht JSON-sicher als Objekt mit Kandidaten serialisiert werden.");
        setSyncDebug((prev) => ({
          ...prev,
          clientSendingRegisterSnapshot: false,
          clientSendingRegisterSnapshotKeys: [],
          clientSendingRegisterSnapshotType: hasSerializedSnapshot ? "object" : typeof snapshotToSend,
          clientSendingCandidateCount: serializedCandidateCount,
          clientVisibleCandidateCount: snapshotStats.localFirstRunCandidateCount,
          clientSnapshotSource: snapshotResolution.source,
        }));
        return;
      }

      setSyncDebug((prev) => ({
        ...prev,
        clientSendingRegisterSnapshot: true,
        clientSendingRegisterSnapshotKeys: Object.keys(snapshotToSend),
        clientSendingRegisterSnapshotType: "object",
        clientSendingCandidateCount: serializedCandidateCount,
        clientVisibleCandidateCount: snapshotStats.localFirstRunCandidateCount,
        clientSnapshotSource: snapshotResolution.source,
      }));

      const result = await beta1AdminClient.syncProductEvolutionFirstRunInbox({ registerSnapshot: snapshotToSend }) as ProductEvolutionInboxSyncResult;
      const created = Number(result.created ?? 0);
      const updated = Number(result.updated ?? 0);
      const skipped = Number(result.skipped ?? 0);
      const reasons = Object.entries(result.skippedReasons || {}).filter(([, count]) => Number(count) > 0).map(([reason, count]) => `${reason}:${count}`).join(", ");
      const samples = (result.sampleCreatedIds || []).slice(0, 3).join(", ");
      const skippedSample = (result.sampleSkipped || []).slice(0, 2).map((entry) => JSON.stringify(entry)).join(" | ");
      setSyncDebug((prev) => ({
        ...prev,
        callableName: result.callableName || "",
        callableVersion: result.callableVersion || "",
        responseShapeVersion: result.responseShapeVersion || "",
        serverTimestamp: result.serverTimestamp || "",
        serverReceivedInputKeys: result.serverReceivedInputKeys || [],
        hasRegisterSnapshot: result.hasRegisterSnapshot,
        registerSnapshotType: result.registerSnapshotType || "",
        registerSnapshotKeys: result.registerSnapshotKeys || [],
        registerSnapshotFieldPresent: result.registerSnapshotFieldPresent,
        registerSnapshotValueType: result.registerSnapshotValueType || "",
        clientHasRegisterSnapshot: result.clientHasRegisterSnapshot,
        clientRegisterSnapshotKeys: result.clientRegisterSnapshotKeys || [],
        payloadUnwrappedFrom: result.payloadUnwrappedFrom || "",
        serverSnapshotReceived: result.serverSnapshotReceived,
        serverSnapshotKeys: result.serverSnapshotKeys || [],
        serverCandidateCount: result.serverCandidateCount ?? 0,
        serverCandidateCollections: result.serverCandidateCollections || [],
        skippedReasons: result.skippedReasons || {},
        sampleCreatedIds: result.sampleCreatedIds || [],
        sampleSkipped: result.sampleSkipped || [],
        invalidInboxIdSanitized: result.invalidInboxIdSanitized,
        sourceDossierIdHadSlash: result.sourceDossierIdHadSlash,
        contractUpgradeDetectedCount: result.contractUpgradeDetectedCount ?? 0,
        reapprovalRequiredCount: result.reapprovalRequiredCount ?? 0,
        sampleReapprovalRequiredIds: result.sampleReapprovalRequiredIds || [],
        currentExecutionContractHashPresent: result.currentExecutionContractHashPresent ?? false,
        approvedExecutionContractHashPresent: result.approvedExecutionContractHashPresent ?? false,
        approvalCoversAutomaticExecution: result.approvalCoversAutomaticExecution ?? false,
      }));
      if (result.clientErrorCode === "client_auth_missing") {
        setSyncStatus("Auth-Fehler: Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.");
      } else if (result.invalidInboxIdSanitized) {
        setSyncStatus(`Firestore-ID-Fehler: ${result.message || "Inbox-ID konnte nicht sicher erzeugt werden."}`);
      } else {
        setSyncStatus(result.message || (created + updated > 0 ? `Inbox synchronisiert: ${created} erstellt, ${updated} aktualisiert, ${skipped} übersprungen.` : "Shape-Fehler: Keine syncbaren Einträge gefunden."));
      }
      const shapeMismatch = snapshotStats.localFirstRunCandidateCount > 0 && created + updated + skipped === 0;
      setFeedback(`Sync Debug → created:${created}, updated:${updated}, skipped:${skipped}${reasons ? `, reasons:${reasons}` : ""}${samples ? `, sampleCreatedIds:${samples}` : ""}${skippedSample ? `, sampleSkipped:${skippedSample}` : ""}${shapeMismatch ? ` | Client hat ${snapshotStats.localFirstRunCandidateCount} Kandidaten gesendet, Server hat 0 verarbeitet. Snapshot-Shape passt nicht.` : ""}`);
      if (result.accepted || created + updated + skipped > 0) {
        await refreshInbox();
      }
    } finally {
      setBusy(false);
    }
  }

  async function runRevisionDossierGenerator() {
    if (!(await ensureAdminAuthReady())) return;
    if (!canRunRevisionDossierGenerator) {
      setFeedback("Revision-Dossier-Generator ist nur für Owner/Admin sichtbar.");
      return;
    }
    setBusy(true);
    try {
      const effectiveFirstRunRegisterSnapshot = snapshotResolution.snapshot;
      const hasSnapshot = Boolean(effectiveFirstRunRegisterSnapshot && typeof effectiveFirstRunRegisterSnapshot === "object" && Object.keys(effectiveFirstRunRegisterSnapshot).length > 0);
      const snapshotToSend = hasSnapshot ? JSON.parse(JSON.stringify(effectiveFirstRunRegisterSnapshot)) as Record<string, unknown> : {};
      const result = await beta1AdminClient.regenerateProductEvolutionRevisionDossiers({ registerSnapshot: snapshotToSend }) as ProductEvolutionRevisionDossierResult;
      const regenerated = Number(result.regenerated ?? 0);
      const stillRevisionRequested = Number(result.stillRevisionRequested ?? 0);
      setSyncDebug((prev) => ({
        ...prev,
        revisionScanned: result.scanned ?? 0,
        revisionRegenerated: regenerated,
        revisionStillRequested: stillRevisionRequested,
        revisionSourceTrust: result.sourceTrust || "",
        revisionNoRunnerStarted: result.noRunnerStarted,
        revisionNoDeploy: result.noDeploy,
        revisionNoMerge: result.noMerge,
      }));
      setSyncStatus(result.message || `Revision-Dossiers: ${regenerated} wieder pending_approval, ${stillRevisionRequested} bleiben revision_requested.`);
      setFeedback(`Revision-Dossiers neu erzeugt: scanned:${result.scanned ?? 0}, pending_approval:${regenerated}, revision_requested:${stillRevisionRequested}. Keine Zustimmung, kein Runner, kein Deploy, kein Merge.`);
      await refreshInbox();
    } catch (error) {
      setFeedback(`Revision fehlgeschlagen: ${getSafeAdminDecisionMessage(error)}`);
    } finally {
      setBusy(false);
    }
  }

  function buttonReason(_action: "approve" | "reject" | "revise" | "block", row: Row): string {
    const status = String(row.status || "").toLowerCase();
    const hasInbox = Boolean(asText(row.inboxId));
    const protectedScope = row.canonicalTruthProtected === true || status === "protected_scope" || String(row.runnerEligibility || "") === "protected_scope" || String(row.recommendation || "") === "protected_scope";

    if (!hasInbox) return "Server-Inbox-Eintrag fehlt";
    if (!authDebug.adminCallableAuthReady) return "Admin-Auth fehlt";
    if (status === "blocked" || protectedScope) return "Eintrag blockiert";
    const reapprovalRequired = isLegacyApprovedReapprovalRequired(row);
    if (status !== "pending_approval" && !(reapprovalRequired && status === "approved" && _action === "approve")) return "Status erlaubt diese Aktion nicht";
    if (_action === "approve") {
      const details = getDecisionDetails(row);
      if (details.singleDecision.isSingleDecision && !details.singleDecision.isComplete) return SINGLE_DECISION_BLOCKER;
      if (details.missing.length > 0) return "Dossier unvollständig – zuerst Überarbeiten wählen";
    }

    return "";
  }

  function taskProposalButtonReason(row: Row): string {
    const status = String(row.status || "").toLowerCase();
    const inboxId = asText(row.inboxId);
    if (!inboxId) return "Server-Inbox-Eintrag fehlt";
    if (!authDebug.adminCallableAuthReady) return "Admin-Auth fehlt";
    if (status !== "approved") return "Eintrag ist nicht approved.";
    if (((row.executionContract && row.executionContract.mode) || row.mode) === "single_owner_decision" && !contractApprovalMatchesCurrent(row)) return AUTO_PROGRESS_CONTRACT_BLOCKED;
    return "";
  }


  async function refreshPickupContracts() {
    setSyncDebug((prev) => ({ ...prev, pickupContractLoadAttempted: true, pickupContractLoadAccepted: false, pickupContractLoadError: "" }));
    if (!(await ensureAdminAuthReady())) {
      const safeMessage = "Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.";
      setSyncDebug((prev) => ({ ...prev, pickupContractLoadError: safeMessage }));
      setFeedback(`Pickup Contracts konnten nicht geladen werden: ${safeMessage}`);
      return;
    }
    setBusy(true);
    try {
      const result = await beta1AdminClient.listAgentRunnerPickupContracts() as AgentRunnerPickupContractListResult;
      const items = extractPickupContracts(result);
      const accepted = Boolean(result.accepted);
      setSyncDebug((prev) => ({
        ...prev,
        pickupContractLoadAttempted: true,
        pickupContractLoadAccepted: accepted,
        pickupContractLoadedCount: Number(result.loadedCount ?? items.length),
        pickupContractLoadError: accepted ? "" : getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode),
      }));
      if (!accepted) {
        const safeMessage = getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode);
        setPickupContracts([]);
        setFeedback(`Pickup Contracts konnten nicht geladen werden: ${safeMessage}`);
        setSyncStatus(`Pickup Contracts konnten nicht geladen werden: ${safeMessage}`);
        return;
      }
      setPickupContracts(items);
      setSyncStatus(`Pickup Contracts geladen: ${items.length}. Planungsfreigabe, keine Dateiänderung.`);
    } catch (error) {
      const safeMessage = getSafeAdminDecisionMessage(error);
      setPickupContracts([]);
      setSyncDebug((prev) => ({ ...prev, pickupContractLoadAccepted: false, pickupContractLoadError: safeMessage }));
      setFeedback(`Pickup Contracts konnten nicht geladen werden: ${safeMessage}`);
      setSyncStatus(`Pickup Contracts konnten nicht geladen werden: ${safeMessage}`);
    } finally {
      setBusy(false);
    }
  }


  async function refreshImplementationPlans() {
    setSyncDebug((prev) => ({ ...prev, implementationPlanLoadAttempted: true, implementationPlanLoadAccepted: false }));
    if (!(await ensureAdminAuthReady())) {
      const safeMessage = "Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.";
      setFeedback(`Implementation Plans konnten nicht geladen werden: ${safeMessage}`);
      return;
    }
    setBusy(true);
    try {
      const result = await beta1AdminClient.listAgentRunnerImplementationPlans() as AgentRunnerImplementationPlanListResult;
      const items = extractImplementationPlans(result);
      const accepted = Boolean(result.accepted);
      setSyncDebug((prev) => ({
        ...prev,
        implementationPlanLoadAttempted: true,
        implementationPlanLoadAccepted: accepted,
        implementationPlanLoadedCount: Number(result.loadedCount ?? items.length),
      }));
      if (!accepted) {
        const safeMessage = getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode);
        setImplementationPlans([]);
        setFeedback(`Implementation Plans konnten nicht geladen werden: ${safeMessage}`);
        return;
      }
      setImplementationPlans(items);
    } catch (error) {
      const safeMessage = getSafeAdminDecisionMessage(error);
      setImplementationPlans([]);
      setFeedback(`Implementation Plans konnten nicht geladen werden: ${safeMessage}`);
    } finally {
      setBusy(false);
    }
  }

  async function createManualRunnerImplementationPlan(contract: AgentRunnerPickupContract) {
    const pickupContractId = asText(contract.pickupContractId);
    setSyncDebug((prev) => ({
      ...prev,
      lastImplementationPlanCreated: false,
      lastImplementationPlanIdPresent: false,
      lastImplementationPlanStatus: pickupContractId ? "started" : "blocked_client",
      lastImplementationPlanMessage: pickupContractId ? "Implementierungsplan wird erzeugt …" : "Pickup Contract ID fehlt.",
      lastImplementationPlanFileWriteAllowed: "-",
      lastImplementationPlanBranchCreationAllowed: "-",
      lastImplementationPlanPrCreationAllowed: "-",
      lastImplementationPlanNoDeploy: "-",
      lastImplementationPlanNoMerge: "-",
    }));
    if (!pickupContractId) {
      setFeedback("Pickup Contract ID fehlt.");
      return;
    }
    setBusy(true);
    setFeedback("Implementierungsplan wird erzeugt …");
    try {
      const result = await beta1AdminClient.createManualRunnerImplementationPlan({ pickupContractId }) as ManualRunnerImplementationPlanResult;
      const accepted = Boolean(result.accepted);
      const plan = result.plan || result;
      const implementationPlanId = asText(plan.implementationPlanId);
      const safeMessage = accepted ? "Implementierungsplan erzeugt. Noch keine Dateiänderung gestartet." : `Implementierungsplan konnte nicht erzeugt werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastImplementationPlanCreated: accepted,
        lastImplementationPlanIdPresent: Boolean(implementationPlanId),
        lastImplementationPlanStatus: result.status || (accepted ? "implementation_plan_created" : "failed"),
        lastImplementationPlanMessage: safeMessage,
        lastImplementationPlanFileWriteAllowed: plan.fileWriteAllowed ?? "-",
        lastImplementationPlanBranchCreationAllowed: plan.branchCreationAllowed ?? "-",
        lastImplementationPlanPrCreationAllowed: plan.prCreationAllowed ?? "-",
        lastImplementationPlanNoDeploy: plan.noDeploy ?? "-",
        lastImplementationPlanNoMerge: plan.noMerge ?? "-",
      }));
    } catch (error) {
      const safeMessage = `Implementierungsplan konnte nicht erzeugt werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastImplementationPlanCreated: false,
        lastImplementationPlanIdPresent: false,
        lastImplementationPlanStatus: "error",
        lastImplementationPlanMessage: safeMessage,
        lastImplementationPlanFileWriteAllowed: "-",
        lastImplementationPlanBranchCreationAllowed: "-",
        lastImplementationPlanPrCreationAllowed: "-",
        lastImplementationPlanNoDeploy: "-",
        lastImplementationPlanNoMerge: "-",
      }));
    } finally {
      try {
        await refreshPickupContracts();
        await refreshImplementationPlans();
      } finally {
        setBusy(false);
      }
    }
  }

  async function approveManualRunnerImplementationPlan(plan: AgentRunnerImplementationPlan) {
    const implementationPlanId = asText(plan.implementationPlanId);
    setSyncDebug((prev) => ({
      ...prev,
      lastImplementationPlanApprovalAction: "approve",
      lastImplementationPlanApprovalAccepted: false,
      lastImplementationPlanApprovalStatus: implementationPlanId ? "started" : "blocked_client",
      lastImplementationPlanApprovalMessage: implementationPlanId ? "Implementierungsplan-Freigabe wird gespeichert …" : "Implementation Plan ID fehlt.",
      lastImplementationPlanApprovalIdPresent: Boolean(implementationPlanId),
      lastImplementationPlanApprovalFileWriteAllowed: "-",
      lastImplementationPlanApprovalBranchCreationAllowed: "-",
      lastImplementationPlanApprovalPrCreationAllowed: "-",
      lastImplementationPlanApprovalNoDeploy: "-",
      lastImplementationPlanApprovalNoMerge: "-",
    }));
    if (!implementationPlanId) {
      setFeedback("Implementation Plan ID fehlt.");
      return;
    }
    setBusy(true);
    setFeedback("Implementierungsplan-Freigabe wird gespeichert …");
    try {
      const result = await beta1AdminClient.approveManualRunnerImplementationPlan({ implementationPlanId }) as ManualRunnerImplementationPlanApprovalResult;
      const accepted = Boolean(result.accepted);
      const approvedPlan = result.plan || result;
      const safeMessage = accepted ? "Implementierungsplan freigegeben. Noch keine Dateiänderung gestartet." : `Implementierungsplan konnte nicht freigegeben werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastImplementationPlanApprovalAction: "approve",
        lastImplementationPlanApprovalAccepted: accepted,
        lastImplementationPlanApprovalStatus: approvedPlan.status || (accepted ? "implementation_plan_approved" : "failed"),
        lastImplementationPlanApprovalMessage: safeMessage,
        lastImplementationPlanApprovalIdPresent: Boolean(approvedPlan.implementationPlanId || implementationPlanId),
        lastImplementationPlanApprovalFileWriteAllowed: approvedPlan.fileWriteAllowed ?? "-",
        lastImplementationPlanApprovalBranchCreationAllowed: approvedPlan.branchCreationAllowed ?? "-",
        lastImplementationPlanApprovalPrCreationAllowed: approvedPlan.prCreationAllowed ?? "-",
        lastImplementationPlanApprovalNoDeploy: approvedPlan.noDeploy ?? "-",
        lastImplementationPlanApprovalNoMerge: approvedPlan.noMerge ?? "-",
      }));
    } catch (error) {
      const safeMessage = `Implementierungsplan konnte nicht freigegeben werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastImplementationPlanApprovalAction: "approve",
        lastImplementationPlanApprovalAccepted: false,
        lastImplementationPlanApprovalStatus: "error",
        lastImplementationPlanApprovalMessage: safeMessage,
        lastImplementationPlanApprovalIdPresent: Boolean(implementationPlanId),
        lastImplementationPlanApprovalFileWriteAllowed: "-",
        lastImplementationPlanApprovalBranchCreationAllowed: "-",
        lastImplementationPlanApprovalPrCreationAllowed: "-",
        lastImplementationPlanApprovalNoDeploy: "-",
        lastImplementationPlanApprovalNoMerge: "-",
      }));
    } finally {
      try {
        await refreshPickupContracts();
        await refreshImplementationPlans();
      } finally {
        setBusy(false);
      }
    }
  }

  async function createManualRunnerPickupContract(job: AgentRunnerJob) {
    const runnerJobId = asText(job.runnerJobId);
    setSyncDebug((prev) => ({
      ...prev,
      lastPickupContractCreated: false,
      lastPickupContractIdPresent: false,
      lastPickupContractStatus: runnerJobId ? "started" : "blocked_client",
      lastPickupContractMessage: runnerJobId ? "Pickup-Contract wird erzeugt …" : "Runner Job ID fehlt.",
      lastPickupContractRunnerStartAllowed: "-",
      lastPickupContractFileWriteAllowed: "-",
      lastPickupContractBranchCreationAllowed: "-",
      lastPickupContractPrCreationAllowed: "-",
      lastPickupContractNoDeploy: "-",
      lastPickupContractNoMerge: "-",
    }));
    if (!runnerJobId) {
      setFeedback("Runner Job ID fehlt.");
      return;
    }
    setBusy(true);
    setFeedback("Pickup-Contract wird erzeugt …");
    try {
      const result = await beta1AdminClient.createManualRunnerPickupContract({ runnerJobId }) as ManualRunnerPickupContractResult;
      const accepted = Boolean(result.accepted);
      const safeMessage = accepted ? "Pickup-Contract erzeugt. Noch keine Ausführung gestartet." : `Pickup-Contract konnte nicht erzeugt werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastPickupContractCreated: accepted,
        lastPickupContractIdPresent: Boolean(result.pickupContractId),
        lastPickupContractStatus: result.status || (accepted ? "pickup_contract_created" : "failed"),
        lastPickupContractMessage: safeMessage,
        lastPickupContractRunnerStartAllowed: result.runnerStartAllowed ?? "-",
        lastPickupContractFileWriteAllowed: result.fileWriteAllowed ?? "-",
        lastPickupContractBranchCreationAllowed: result.branchCreationAllowed ?? "-",
        lastPickupContractPrCreationAllowed: result.prCreationAllowed ?? "-",
        lastPickupContractNoDeploy: result.noDeploy ?? "-",
        lastPickupContractNoMerge: result.noMerge ?? "-",
      }));
    } catch (error) {
      const safeMessage = `Pickup-Contract konnte nicht erzeugt werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({ ...prev, lastPickupContractCreated: false, lastPickupContractIdPresent: false, lastPickupContractStatus: "error", lastPickupContractMessage: safeMessage }));
    } finally {
      try {
        await refreshRunnerJobs();
        await refreshPickupContracts();
      } finally {
        setBusy(false);
      }
    }
  }

  async function refreshRunnerJobs() {
    setSyncDebug((prev) => ({
      ...prev,
      runnerJobLoadAttempted: true,
      runnerJobLoadAccepted: false,
      runnerJobLoadError: "",
    }));
    if (!(await ensureAdminAuthReady())) {
      const safeMessage = "Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.";
      setSyncDebug((prev) => ({ ...prev, runnerJobLoadError: safeMessage }));
      setFeedback(`Runner Jobs konnten nicht geladen werden: ${safeMessage}`);
      return;
    }
    setBusy(true);
    try {
      const result = await beta1AdminClient.listAgentRunnerJobs() as AgentRunnerJobListResult;
      const items = extractRunnerJobs(result);
      const accepted = Boolean(result.accepted);
      const responseKeys = safeResponseKeys(result);
      setSyncDebug((prev) => ({
        ...prev,
        runnerJobLoadAttempted: true,
        runnerJobLoadAccepted: accepted,
        runnerJobLoadedCount: Number(result.loadedCount ?? items.length),
        runnerJobResponseKeys: responseKeys,
        runnerJobLoadError: accepted ? "" : getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode),
      }));
      if (!accepted) {
        const safeMessage = getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode);
        setRunnerJobs([]);
        setFeedback(`Runner Jobs konnten nicht geladen werden: ${safeMessage}`);
        setSyncStatus(`Runner Jobs konnten nicht geladen werden: ${safeMessage}`);
        return;
      }
      setRunnerJobs(items);
      setSyncStatus(`Runner Jobs geladen: ${items.length}. Wartet auf manuellen Runner-Pickup; kein Runner gestartet.`);
    } catch (error) {
      const safeMessage = getSafeAdminDecisionMessage(error);
      setRunnerJobs([]);
      setSyncDebug((prev) => ({ ...prev, runnerJobLoadAccepted: false, runnerJobLoadError: safeMessage }));
      setFeedback(`Runner Jobs konnten nicht geladen werden: ${safeMessage}`);
      setSyncStatus(`Runner Jobs konnten nicht geladen werden: ${safeMessage}`);
    } finally {
      setBusy(false);
    }
  }


  function conversationDossierId(row: ConversationIdeaDossier | Row): string {
    return asText((row as Row).dossierId || (row as Row).sourceDossierId || (row as Row).id || (row as Row).seedDossierId || (row as Row).serverDossierId);
  }

  function existingConversationWorkPackage(row: ConversationIdeaDossier | Row): BuilderWorkPackage | undefined {
    const ids = [conversationDossierId(row), asText((row as Row).sourceDossierId), asText((row as Row).seedDossierId), asText((row as Row).serverDossierId)].filter(Boolean);
    return builderWorkPackages.find((item) => ids.includes(asText(item.sourceDossierId)));
  }

  async function decideConversationIdea(row: ConversationIdeaDossier | Row, decision: "approve" | "reject" | "revision_requested" | "block") {
    const dossierId = conversationDossierId(row);
    if (!dossierId) {
      setFeedback("Conversation-Idee kann nicht entschieden werden: Dossier-ID fehlt.");
      return;
    }
    if (!authDebug.adminCallableAuthReady) {
      setFeedback("Conversation-Idee kann nicht entschieden werden: Admin-Auth fehlt.");
      return;
    }
    const label = decision === "approve" ? "freigegeben" : decision === "reject" ? "abgelehnt" : decision === "revision_requested" ? "zur Überarbeitung markiert" : "blockiert";
    setBusy(true);
    setFeedback(`Conversation-Idee wird ${label} …`);
    try {
      const result = await beta1AdminClient.decideConversationIdeaDossier({ dossierId, decision, reason: `admin_center_${decision}` }) as ConversationIdeaDecisionResult;
      const message = result.accepted
        ? `Conversation-Idee ${label}. Status: ${result.status || "aktualisiert"}. Keine GitHub-/Runner-/Branch-/PR-/Merge-/Deploy-Aktion gestartet.`
        : `Conversation-Idee konnte nicht entschieden werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(message);
      setSyncStatus(message);
      if (result.accepted) setDetailRow((prev) => prev && conversationDossierId(prev) === dossierId ? { ...prev, status: result.status, decision } : prev);
    } catch (error) {
      const message = `Conversation-Idee konnte nicht entschieden werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(message);
      setSyncStatus(message);
    } finally {
      try {
        await refreshAgentSnapshot();
      } finally {
        setBusy(false);
      }
    }
  }

  async function prepareConversationBuilderWorkPackage(row: ConversationIdeaDossier | Row) {
    const dossierId = conversationDossierId(row);
    const status = String((row as Row).status || "").toLowerCase();
    if (!dossierId) {
      setFeedback("Conversation-Bauauftrag kann nicht vorbereitet werden: Dossier-ID fehlt.");
      return;
    }
    if (!authDebug.adminCallableAuthReady) {
      setFeedback("Conversation-Bauauftrag kann nicht vorbereitet werden: Admin-Auth fehlt.");
      return;
    }
    if (status !== "approved") {
      setFeedback("Nur freigegebene Conversation-Ideen können als Bauauftrag vorbereitet werden.");
      return;
    }
    setBusy(true);
    setFeedback("Conversation-Bauauftrag wird metadata-only vorbereitet …");
    try {
      const result = await beta1AdminClient.prepareBuilderWorkPackageFromConversationDossier({ dossierId, sourceDossierId: asText((row as Row).sourceDossierId), seedDossierId: asText((row as Row).seedDossierId), serverDossierId: asText((row as Row).serverDossierId) }) as PrepareBuilderWorkPackageResult;
      const workPackageId = asText(result.workPackageId || result.workPackage?.workPackageId);
      const reapproval = result.reapprovalRequired || result.workPackage?.reapprovalRequired;
      const message = result.accepted
        ? result.existing
          ? `Bauauftrag bereits vorbereitet.${workPackageId ? ` workPackageId: ${workPackageId}` : ""} Status: ${result.status || result.workPackage?.status || "approved_waiting"}. Keine GitHub-/Runner-/Branch-/PR-/Merge-/Deploy-Aktion gestartet.`
          : `Conversation-Bauauftrag vorbereitet.${workPackageId ? ` workPackageId: ${workPackageId}` : ""} Status: ${result.status || result.workPackage?.status || "approved_waiting"}${reapproval ? " · Owner-Reapproval erforderlich, nicht next_up." : ""}. Keine GitHub-/Runner-/Branch-/PR-/Merge-/Deploy-Aktion gestartet.`
        : `Conversation-Bauauftrag konnte nicht vorbereitet werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(message);
      setSyncStatus(message);
      if (result.accepted) setActive("builder_waiting");
    } catch (error) {
      const message = `Conversation-Bauauftrag konnte nicht vorbereitet werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(message);
      setSyncStatus(message);
    } finally {
      try {
        await refreshAgentSnapshot();
      } finally {
        setBusy(false);
      }
    }
  }

  function builderWorkPackageButtonReason(row: Row): string {
    const inboxId = asText(row.inboxId);
    const status = String(row.status || "").toLowerCase();
    if (!inboxId) return "Server-Inbox-Eintrag fehlt";
    if (!authDebug.adminCallableAuthReady) return "Admin-Auth fehlt";
    if (status !== "approved") return "Nur freigegebene Dossiers können als Bauauftrag vorbereitet werden.";
    return "";
  }

  function builderPrPrepareButtonReason(item: BuilderWorkPackage): string {
    const status = String(item.status || "").toLowerCase();
    if (!authDebug.adminCallableAuthReady) return "Admin-Auth fehlt";
    if (!item.workPackageId) return "Work Package ID fehlt";
    if (!["next_up", "approved_waiting"].includes(status)) return "Nur next_up oder approved_waiting kann Branch/PR vorbereiten.";
    if (item.reapprovalRequired === true) return "Reapproval erforderlich";
    if (item.ownerApproved !== true || item.ownerDecisionPersistent !== true || item.approvedForSerialExecution !== true) return "Owner-/Serial-Freigabe fehlt";
    return "";
  }

  async function prepareGithubBuilderBranchPr(item: BuilderWorkPackage) {
    const reason = builderPrPrepareButtonReason(item);
    if (reason) {
      setFeedback(reason);
      return;
    }
    setBusy(true);
    setFeedback("Branch/PR wird nach Guards vorbereitet — kein Merge, kein Deploy …");
    try {
      const result = await beta1AdminClient.prepareGithubBuilderBranchPrFromWorkPackage({ workPackageId: item.workPackageId }) as PrepareGithubBuilderBranchPrResult;
      const safeMessage = result.accepted
        ? `Builder-PR-Plan vorbereitet: ${result.builderPrPlan?.branchName || item.branchName || item.workPackageId}. Kein Merge, kein Deploy.`
        : `Branch/PR-Vorbereitung blockiert: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({ ...prev, lastBuilderWorkPackageStatus: result.status || (result.accepted ? "branch_pr_plan_created" : "blocked"), lastBuilderWorkPackageMessage: safeMessage, lastBuilderNoDeploy: result.noAutoDeploy ?? true, lastBuilderNoTokenPaymentBlockchain: result.noTokenPaymentBlockchain ?? true }));
    } catch (error) {
      const safeMessage = `Branch/PR-Vorbereitung fehlgeschlagen: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
    } finally {
      try {
        await refreshAgentSnapshot();
      } finally {
        setBusy(false);
      }
    }
  }

  async function prepareBuilderWorkPackage(row: Row) {
    const inboxId = asText(row.inboxId);
    const reason = builderWorkPackageButtonReason(row);
    setSyncDebug((prev) => ({
      ...prev,
      lastBuilderWorkPackageCreated: false,
      lastBuilderWorkPackageIdPresent: false,
      lastBuilderWorkPackageStatus: reason ? "blocked_client" : "started",
      lastBuilderWorkPackageMessage: reason || "Bauauftrag wird metadata-only vorbereitet …",
      lastBuilderNoRunnerStarted: "-",
      lastBuilderNoBranchOrPrOrMerge: "-",
      lastBuilderNoDeploy: "-",
      lastBuilderNoTokenPaymentBlockchain: "-",
    }));
    if (reason) {
      setFeedback(reason);
      return;
    }
    setBusy(true);
    setFeedback("Bauauftrag wird metadata-only vorbereitet …");
    try {
      const result = await beta1AdminClient.prepareBuilderWorkPackageFromApprovedDossier({ dossierId: inboxId }) as PrepareBuilderWorkPackageResult;
      const accepted = Boolean(result.accepted);
      const workPackageId = asText(result.workPackageId || result.workPackage?.workPackageId);
      const safeMessage = accepted
        ? `Bauauftrag vorbereitet.${workPackageId ? ` workPackageId: ${workPackageId}` : ""} Status: ${result.status || result.workPackage?.status || "approved_waiting"}. Keine GitHub-Aktion gestartet.`
        : `Bauauftrag konnte nicht vorbereitet werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastBuilderWorkPackageCreated: accepted,
        lastBuilderWorkPackageIdPresent: Boolean(workPackageId),
        lastBuilderWorkPackageStatus: result.status || result.workPackage?.status || (accepted ? "approved_waiting" : "failed"),
        lastBuilderWorkPackageMessage: safeMessage,
        lastBuilderNoRunnerStarted: result.noRunnerStarted ?? "-",
        lastBuilderNoBranchOrPrOrMerge: result.noBranchOrPrOrMerge ?? "-",
        lastBuilderNoDeploy: result.noDeploy ?? "-",
        lastBuilderNoTokenPaymentBlockchain: result.noTokenPaymentBlockchain ?? "-",
      }));
      if (accepted) setActive("builder_waiting");
    } catch (error) {
      const safeMessage = `Bauauftrag konnte nicht vorbereitet werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({ ...prev, lastBuilderWorkPackageCreated: false, lastBuilderWorkPackageIdPresent: false, lastBuilderWorkPackageStatus: "error", lastBuilderWorkPackageMessage: safeMessage }));
    } finally {
      try {
        await refreshAgentSnapshot();
      } finally {
        setBusy(false);
      }
    }
  }

  async function createTaskProposal(row: Row) {
    const inboxId = asText(row.inboxId);
    const reason = taskProposalButtonReason(row);
    setSyncDebug((prev) => ({
      ...prev,
      lastTaskProposalCreated: false,
      lastTaskProposalIdPresent: false,
      lastTaskProposalStatus: reason ? "blocked_client" : "started",
      lastTaskProposalMessage: reason || "Task Proposal wird erzeugt …",
      lastTaskProposalNoRunnerStarted: "-",
      lastTaskProposalNoBranchOrPrOrMerge: "-",
      lastTaskProposalNoDeploy: "-",
    }));
    if (reason) {
      setFeedback(reason);
      return;
    }

    setBusy(true);
    setFeedback("Task Proposal wird erzeugt …");
    try {
      const result = await beta1AdminClient.createAgentTaskProposalFromApprovedInboxItem({ inboxId }) as ApprovedInboxToTaskProposalResult;
      const accepted = Boolean(result.accepted);
      const taskProposalId = asText(result.taskProposalId);
      const safeMessage = accepted
        ? `Task Proposal erzeugt.${taskProposalId ? ` taskProposalId: ${taskProposalId}` : ""}`
        : `Task Proposal konnte nicht erzeugt werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      if (accepted) setActive("task_total");
      setSyncDebug((prev) => ({
        ...prev,
        lastTaskProposalCreated: accepted,
        lastTaskProposalIdPresent: Boolean(taskProposalId),
        lastTaskProposalStatus: result.proposalStatus || result.status || (accepted ? "created" : "failed"),
        lastTaskProposalMessage: safeMessage,
        lastTaskProposalNoRunnerStarted: result.noRunnerStarted ?? "-",
        lastTaskProposalNoBranchOrPrOrMerge: result.noBranchOrPrOrMerge ?? "-",
        lastTaskProposalNoDeploy: result.noDeploy ?? "-",
      }));
    } catch (error) {
      const safeMessage = `Task Proposal konnte nicht erzeugt werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastTaskProposalCreated: false,
        lastTaskProposalIdPresent: false,
        lastTaskProposalStatus: "error",
        lastTaskProposalMessage: safeMessage,
        lastTaskProposalNoRunnerStarted: "-",
        lastTaskProposalNoBranchOrPrOrMerge: "-",
        lastTaskProposalNoDeploy: "-",
      }));
    } finally {
      try {
        await refreshInbox();
        await refreshTaskProposals();
      } finally {
        setBusy(false);
      }
    }
  }

  function workerQueueButtonReason(proposal: AgentTaskProposal): string {
    const status = String(proposal.status || "proposed").toLowerCase();
    const taskProposalId = asText(proposal.taskProposalId || proposal.proposalId);
    if (!taskProposalId) return "Task-Proposal-ID fehlt";
    if (!authDebug.adminCallableAuthReady) return "Admin-Auth fehlt";
    if (!["proposed", "review_required"].includes(status)) return "Nur proposed/review_required kann vorbereitet werden.";
    return "";
  }

  function workerQueueReleaseButtonReason(item: AgentTaskWorkerQueueItem): string {
    const status = String(item.status || "pending_worker_review").toLowerCase();
    if (!item.workerQueueId) return "Worker-Queue-ID fehlt";
    if (!authDebug.adminCallableAuthReady) return "Admin-Auth fehlt";
    if (!["pending_worker_review", "queued_for_owner_review"].includes(status)) return "Status erlaubt diese Freigabe nicht";
    if (!item.allowedFiles?.length || !item.blockedFiles?.length || !item.requiredChecks?.length) return "Safety-Listen oder requiredChecks fehlen";
    if (item.noRunnerStarted !== true || item.noBranchOrPrOrMerge !== true || item.noDeploy !== true) return "Safety-Flags sind nicht vollständig true";
    return "";
  }

  function runnerPickupPreviewButtonReason(item: AgentTaskWorkerQueueItem): string {
    const status = String(item.status || "pending_worker_review").toLowerCase();
    if (!item.workerQueueId) return "Worker-Queue-ID fehlt";
    if (!authDebug.adminCallableAuthReady) return "Admin-Auth fehlt";
    if (!["ready_for_worker", "previewed_for_runner"].includes(status)) return "Nur ready_for_worker oder previewed_for_runner kann als Runner-Pickup Preview geprüft werden.";
    if (!item.allowedFiles?.length || !item.blockedFiles?.length || !item.requiredChecks?.length) return "Safety-Listen oder requiredChecks fehlen";
    if (item.noRunnerStarted !== true || item.noBranchOrPrOrMerge !== true || item.noDeploy !== true) return "Safety-Flags sind nicht vollständig true";
    return "";
  }


  function runnerStartApprovalButtonReason(item: AgentTaskWorkerQueueItem): string {
    const status = String(item.status || "pending_worker_review").toLowerCase();
    if (!item.workerQueueId) return "Worker-Queue-ID fehlt";
    if (!authDebug.adminCallableAuthReady) return "Admin-Auth fehlt";
    if (!["ready_for_worker", "previewed_for_runner"].includes(status)) return "Nur ready_for_worker oder previewed_for_runner darf freigegeben werden.";
    if (!item.allowedFiles?.length || !item.blockedFiles?.length || !item.requiredChecks?.length) return "Safety-Listen oder requiredChecks fehlen";
    if (item.noRunnerStarted !== true || item.noBranchOrPrOrMerge !== true || item.noDeploy !== true) return "Safety-Flags sind nicht vollständig true";
    return "";
  }

  async function previewRunnerPickupForWorkerQueueItem(item: AgentTaskWorkerQueueItem) {
    const reason = runnerPickupPreviewButtonReason(item);
    const previewPayload = { workerQueueId: item.workerQueueId };
    setSyncDebug((prev) => ({
      ...prev,
      lastRunnerPreviewAction: "preview_runner_pickup",
      lastRunnerPreviewAccepted: false,
      lastRunnerPreviewStatus: reason ? "blocked_client" : "started",
      lastRunnerPreviewMessage: reason || "Runner-Pickup Preview wird erstellt …",
      lastRunnerPreviewWorkerQueueIdPresent: Boolean(previewPayload.workerQueueId),
      lastRunnerPreviewNoRunnerStarted: "-",
      lastRunnerPreviewNoBranchOrPrOrMerge: "-",
      lastRunnerPreviewNoDeploy: "-",
      lastRunnerPreviewWouldCreateBranch: "-",
      lastRunnerPreviewWouldCreatePr: "-",
      lastRunnerPreviewWouldDeploy: "-",
      lastRunnerPreviewRunnerStartAllowed: "-",
    }));
    if (reason) {
      setFeedback(reason);
      return;
    }

    setBusy(true);
    setFeedback("Runner-Pickup Preview wird erstellt …");
    try {
      const result = await beta1AdminClient.previewRunnerPickupForWorkerQueueItem(previewPayload) as WorkerQueueRunnerPreviewResult;
      const accepted = Boolean(result.accepted);
      const preview = result.preview || result;
      const safeMessage = accepted
        ? "Runner-Pickup Preview bereit. Keine Ausführung gestartet."
        : `Runner-Pickup Preview konnte nicht erstellt werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      if (accepted) setRunnerPickupPreview(preview);
      setSyncDebug((prev) => ({
        ...prev,
        lastRunnerPreviewAction: "preview_runner_pickup",
        lastRunnerPreviewAccepted: accepted,
        lastRunnerPreviewStatus: preview.status || (accepted ? "preview_ready" : "failed"),
        lastRunnerPreviewMessage: safeMessage,
        lastRunnerPreviewWorkerQueueIdPresent: Boolean(preview.workerQueueId || previewPayload.workerQueueId),
        lastRunnerPreviewNoRunnerStarted: preview.noRunnerStarted ?? result.noRunnerStarted ?? "-",
        lastRunnerPreviewNoBranchOrPrOrMerge: preview.noBranchOrPrOrMerge ?? result.noBranchOrPrOrMerge ?? "-",
        lastRunnerPreviewNoDeploy: preview.noDeploy ?? result.noDeploy ?? "-",
        lastRunnerPreviewWouldCreateBranch: preview.wouldCreateBranch ?? result.wouldCreateBranch ?? "-",
        lastRunnerPreviewWouldCreatePr: preview.wouldCreatePr ?? result.wouldCreatePr ?? "-",
        lastRunnerPreviewWouldDeploy: preview.wouldDeploy ?? result.wouldDeploy ?? "-",
        lastRunnerPreviewRunnerStartAllowed: preview.runnerStartAllowed ?? result.runnerStartAllowed ?? "-",
      }));
    } catch (error) {
      const safeMessage = `Runner-Pickup Preview konnte nicht erstellt werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastRunnerPreviewAction: "preview_runner_pickup",
        lastRunnerPreviewAccepted: false,
        lastRunnerPreviewStatus: "error",
        lastRunnerPreviewMessage: safeMessage,
        lastRunnerPreviewWorkerQueueIdPresent: Boolean(previewPayload.workerQueueId),
        lastRunnerPreviewNoRunnerStarted: "-",
        lastRunnerPreviewNoBranchOrPrOrMerge: "-",
        lastRunnerPreviewNoDeploy: "-",
        lastRunnerPreviewWouldCreateBranch: "-",
        lastRunnerPreviewWouldCreatePr: "-",
        lastRunnerPreviewWouldDeploy: "-",
        lastRunnerPreviewRunnerStartAllowed: "-",
      }));
    } finally {
      try {
        await refreshWorkerQueueItems();
      } finally {
        setBusy(false);
      }
    }
  }


  async function approveRunnerStartForWorkerQueueItem(item: AgentTaskWorkerQueueItem) {
    const reason = runnerStartApprovalButtonReason(item);
    const approvalPayload = { workerQueueId: item.workerQueueId };
    setSyncDebug((prev) => ({
      ...prev,
      lastRunnerStartApprovalAction: "approve_runner_start_manual_pickup",
      lastRunnerStartApprovalAccepted: false,
      lastRunnerStartApprovalStatus: reason ? "blocked_client" : "started",
      lastRunnerStartApprovalMessage: reason || "Runner-Start-Freigabe wird gespeichert …",
      lastRunnerStartApprovalWorkerQueueIdPresent: Boolean(approvalPayload.workerQueueId),
      lastRunnerStartApprovalRunnerJobIdPresent: false,
      lastRunnerStartApprovalNoRunnerStarted: "-",
      lastRunnerStartApprovalNoBranchOrPrOrMerge: "-",
      lastRunnerStartApprovalNoDeploy: "-",
    }));
    if (reason) {
      setFeedback(reason);
      return;
    }
    setBusy(true);
    setFeedback("Runner-Start-Freigabe wird gespeichert …");
    try {
      const result = await beta1AdminClient.approveRunnerStartForWorkerQueueItem(approvalPayload) as WorkerQueueRunnerStartApprovalResult;
      const accepted = Boolean(result.accepted);
      const runnerJobId = asText(result.runnerJobId);
      const safeMessage = accepted
        ? `Runner-Start-Freigabe gespeichert. Kein Runner gestartet.${runnerJobId ? ` runnerJobId: ${runnerJobId}` : ""}`
        : `Runner-Start-Freigabe konnte nicht gespeichert werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastRunnerStartApprovalAction: "approve_runner_start_manual_pickup",
        lastRunnerStartApprovalAccepted: accepted,
        lastRunnerStartApprovalStatus: result.status || result.runnerJobStatus || (accepted ? "runner_start_approved" : "failed"),
        lastRunnerStartApprovalMessage: safeMessage,
        lastRunnerStartApprovalWorkerQueueIdPresent: Boolean(result.workerQueueId || approvalPayload.workerQueueId),
        lastRunnerStartApprovalRunnerJobIdPresent: Boolean(runnerJobId),
        lastRunnerStartApprovalNoRunnerStarted: result.noRunnerStarted ?? "-",
        lastRunnerStartApprovalNoBranchOrPrOrMerge: result.noBranchOrPrOrMerge ?? "-",
        lastRunnerStartApprovalNoDeploy: result.noDeploy ?? "-",
      }));
      if (accepted) setActive("worker_ready");
    } catch (error) {
      const safeMessage = `Runner-Start-Freigabe konnte nicht gespeichert werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastRunnerStartApprovalAction: "approve_runner_start_manual_pickup",
        lastRunnerStartApprovalAccepted: false,
        lastRunnerStartApprovalStatus: "error",
        lastRunnerStartApprovalMessage: safeMessage,
        lastRunnerStartApprovalWorkerQueueIdPresent: Boolean(approvalPayload.workerQueueId),
        lastRunnerStartApprovalRunnerJobIdPresent: false,
        lastRunnerStartApprovalNoRunnerStarted: "-",
        lastRunnerStartApprovalNoBranchOrPrOrMerge: "-",
        lastRunnerStartApprovalNoDeploy: "-",
      }));
    } finally {
      try {
        await refreshWorkerQueueItems();
        await refreshRunnerJobs();
      } finally {
        setBusy(false);
      }
    }
  }

  async function releaseWorkerQueueItemForWorker(item: AgentTaskWorkerQueueItem) {
    const reason = workerQueueReleaseButtonReason(item);
    const releasePayload = { workerQueueId: item.workerQueueId };
    const payloadTargetPresent = Boolean(releasePayload.workerQueueId);
    setSyncDebug((prev) => ({
      ...prev,
      lastWorkerReleaseAction: "release_for_worker",
      lastWorkerReleasePayloadTargetPresent: payloadTargetPresent,
      lastWorkerReleaseTargetIdPresent: false,
      lastWorkerReleaseWorkerQueueIdPresent: Boolean(releasePayload.workerQueueId),
      lastWorkerReleaseBackendCode: "-",
      lastWorkerReleaseBackendMessage: "-",
      lastWorkerReleaseAccepted: false,
      lastWorkerReleaseStatus: reason ? "blocked_client" : "started",
      lastWorkerReleaseMessage: reason || "Worker-Freigabe wird gespeichert …",
      lastWorkerReleaseNoRunnerStarted: "-",
      lastWorkerReleaseNoBranchOrPrOrMerge: "-",
      lastWorkerReleaseNoDeploy: "-",
    }));
    if (reason) {
      setFeedback(reason);
      return;
    }

    setBusy(true);
    setFeedback("Worker-Freigabe wird gespeichert …");
    try {
      const result = await beta1AdminClient.releaseWorkerQueueItemForWorker(releasePayload) as WorkerQueueReleaseResult;
      const accepted = Boolean(result.accepted);
      const releaseStatus = result.workerStatus || result.status || (accepted ? "ready_for_worker" : "failed");
      const backendMessage = result.message || "-";
      const safeMessage = accepted
        ? "Worker-Freigabe gespeichert. Status: ready_for_worker."
        : `Worker-Freigabe konnte nicht gespeichert werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastWorkerReleaseAction: "release_for_worker",
        lastWorkerReleasePayloadTargetPresent: payloadTargetPresent,
        lastWorkerReleaseTargetIdPresent: false,
        lastWorkerReleaseWorkerQueueIdPresent: Boolean(releasePayload.workerQueueId),
        lastWorkerReleaseBackendCode: result.clientErrorCode || "-",
        lastWorkerReleaseBackendMessage: backendMessage,
        lastWorkerReleaseAccepted: accepted,
        lastWorkerReleaseStatus: releaseStatus,
        lastWorkerReleaseMessage: safeMessage,
        lastWorkerReleaseNoRunnerStarted: result.noRunnerStarted ?? "-",
        lastWorkerReleaseNoBranchOrPrOrMerge: result.noBranchOrPrOrMerge ?? "-",
        lastWorkerReleaseNoDeploy: result.noDeploy ?? "-",
      }));
      if (accepted) setActive("worker_ready");
    } catch (error) {
      const backendCode = getSafeAdminDecisionErrorCode(error) || "-";
      const backendMessage = getSafeAdminDecisionErrorText(error) || "-";
      const safeMessage = `Worker-Freigabe konnte nicht gespeichert werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastWorkerReleaseAction: "release_for_worker",
        lastWorkerReleasePayloadTargetPresent: payloadTargetPresent,
        lastWorkerReleaseTargetIdPresent: false,
        lastWorkerReleaseWorkerQueueIdPresent: Boolean(releasePayload.workerQueueId),
        lastWorkerReleaseBackendCode: backendCode,
        lastWorkerReleaseBackendMessage: backendMessage,
        lastWorkerReleaseAccepted: false,
        lastWorkerReleaseStatus: "error",
        lastWorkerReleaseMessage: safeMessage,
        lastWorkerReleaseNoRunnerStarted: "-",
        lastWorkerReleaseNoBranchOrPrOrMerge: "-",
        lastWorkerReleaseNoDeploy: "-",
      }));
    } finally {
      try {
        await refreshWorkerQueueItems();
      } finally {
        setBusy(false);
      }
    }
  }

  async function prepareWorkerQueueFromTaskProposal(proposal: AgentTaskProposal) {
    const taskProposalId = asText(proposal.taskProposalId || proposal.proposalId);
    const reason = workerQueueButtonReason(proposal);
    setSyncDebug((prev) => ({
      ...prev,
      lastWorkerQueueCreated: false,
      lastWorkerQueueIdPresent: false,
      lastWorkerQueueStatus: reason ? "blocked_client" : "started",
      lastWorkerQueueMessage: reason || "Worker Queue wird vorbereitet …",
      lastWorkerQueueNoRunnerStarted: "-",
      lastWorkerQueueNoBranchOrPrOrMerge: "-",
      lastWorkerQueueNoDeploy: "-",
    }));
    if (reason) {
      setFeedback(reason);
      return;
    }

    setBusy(true);
    setFeedback("Worker Queue wird vorbereitet …");
    try {
      const result = await beta1AdminClient.createWorkerQueueItemFromTaskProposal({ taskProposalId }) as TaskProposalWorkerQueueResult;
      const accepted = Boolean(result.accepted);
      const workerQueueId = asText(result.workerQueueId);
      const safeMessage = accepted
        ? `Worker Queue vorbereitet.${workerQueueId ? ` workerQueueId: ${workerQueueId}` : ""}`
        : `Worker Queue konnte nicht vorbereitet werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastWorkerQueueCreated: accepted,
        lastWorkerQueueIdPresent: Boolean(workerQueueId),
        lastWorkerQueueStatus: result.workerStatus || result.proposalStatus || (accepted ? "prepared" : "failed"),
        lastWorkerQueueMessage: safeMessage,
        lastWorkerQueueNoRunnerStarted: result.noRunnerStarted ?? "-",
        lastWorkerQueueNoBranchOrPrOrMerge: result.noBranchOrPrOrMerge ?? "-",
        lastWorkerQueueNoDeploy: result.noDeploy ?? "-",
      }));
      if (accepted) setActive("worker_waiting_review");
    } catch (error) {
      const safeMessage = `Worker Queue konnte nicht vorbereitet werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastWorkerQueueCreated: false,
        lastWorkerQueueIdPresent: false,
        lastWorkerQueueStatus: "error",
        lastWorkerQueueMessage: safeMessage,
        lastWorkerQueueNoRunnerStarted: "-",
        lastWorkerQueueNoBranchOrPrOrMerge: "-",
        lastWorkerQueueNoDeploy: "-",
      }));
    } finally {
      try {
        await refreshTaskProposals();
        await refreshWorkerQueueItems();
      } finally {
        setBusy(false);
      }
    }
  }

  async function archiveAndResetAgentCenterPipelineData() {
    if (!(await ensureAdminAuthReady())) return;

    setBusy(true);
    setFeedback("Reset derzeit aus Sicherheitsgründen nur als Prüfung verfügbar.");
    try {
      const result = await beta1AdminClient.archiveAndResetAgentCenterPipelineData({
        reason: "Admin Center safety preview before scoped reset implementation",
        dryRun: true,
        previewOnly: true,
      }) as AgentCenterPipelineResetResult;
      const accepted = Boolean(result.accepted);
      const archiveRunId = asText(result.archiveRunId);
      const deletedCounts = result.deletedCounts && typeof result.deletedCounts === "object" ? result.deletedCounts : {};
      const archivedCounts = result.archivedCounts && typeof result.archivedCounts === "object" ? result.archivedCounts : {};
      const safeMessage = accepted
        ? result.message || "Reset derzeit aus Sicherheitsgründen nur als Prüfung verfügbar."
        : `Agent-Center-Testdaten konnten nicht geprüft werden: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncStatus(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastAgentCenterResetAccepted: accepted,
        lastAgentCenterResetArchiveRunIdPresent: Boolean(archiveRunId),
        lastAgentCenterResetMessage: safeMessage,
        lastAgentCenterResetDeletedCountsPresent: Object.keys(deletedCounts).length > 0,
        lastAgentCenterResetArchivedCountsPresent: Object.keys(archivedCounts).length > 0,
        lastAgentCenterResetNoRunnerStarted: result.noRunnerStarted ?? "-",
        lastAgentCenterResetNoBranchOrPrOrMerge: result.noBranchOrPrOrMerge ?? "-",
        lastAgentCenterResetNoDeploy: result.noDeploy ?? "-",
        lastAgentCenterResetSkippedCollections: Array.isArray(result.skippedCollections) ? result.skippedCollections : [],
      }));
      if (accepted) setActive("server_total");
    } catch (error) {
      const safeMessage = `Agent-Center-Testdaten konnten nicht geprüft werden: ${getSafeAdminDecisionMessage(error)}`;
      setFeedback(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastAgentCenterResetAccepted: false,
        lastAgentCenterResetArchiveRunIdPresent: false,
        lastAgentCenterResetMessage: safeMessage,
        lastAgentCenterResetDeletedCountsPresent: false,
        lastAgentCenterResetNoRunnerStarted: "-",
        lastAgentCenterResetNoBranchOrPrOrMerge: "-",
        lastAgentCenterResetNoDeploy: "-",
      }));
    } finally {
      setBusy(false);
    }
  }

  async function generateFreshAgentProposals() {
    setFeedback("Frische Agent-Vorschläge werden als Dossiers/Vorschläge vorbereitet. Kein Runner, kein Branch, kein PR, kein Merge, kein Deploy.");
    await runSync();
  }

  async function decide(kind: "agent" | "mission", action: "approve" | "reject" | "revise" | "block", row: Row) {
    const actionLabel = { approve: "Zustimmen", reject: "Ablehnen", revise: "Überarbeiten", block: "Blockieren" }[action];
    const reason = buttonReason(action, row);
    const inboxId = asText(row.inboxId);
    setSyncDebug((prev) => ({
      ...prev,
      lastDecisionAction: action,
      lastDecisionTargetIdPresent: Boolean(inboxId),
      lastDecisionAccepted: false,
      lastDecisionStatus: reason ? "blocked_client" : "started",
      lastDecisionMessage: reason || `Entscheidung wird gespeichert: ${actionLabel} …`,
      lastDecisionErrorCode: "",
    }));
    if (reason) {
      setFeedback(reason);
      return;
    }

    const agentMap = { approve: beta1AdminClient.approveAgentCenterProposal, reject: beta1AdminClient.rejectAgentCenterProposal, revise: beta1AdminClient.requestRevisionAgentCenterProposal, block: beta1AdminClient.blockAgentCenterProposal };
    const missionMap = { approve: beta1AdminClient.approveMissionCenterProposal, reject: beta1AdminClient.rejectMissionCenterProposal, revise: beta1AdminClient.requestRevisionMissionCenterProposal, block: beta1AdminClient.blockMissionCenterProposal };

    setBusy(true);
    setFeedback(`Entscheidung wird gespeichert: ${actionLabel} …`);
    try {
      const result = kind === "agent"
        ? await agentMap[action]({ targetType: "agent", targetId: inboxId, inboxId, reason: action } satisfies AgentCenterDecisionInput)
        : await missionMap[action]({ targetType: "mission", targetId: inboxId, reason: action } satisfies MissionCenterDecisionInput);
      const accepted = Boolean(result.accepted);
      const safeMessage = accepted ? `Entscheidung gespeichert: ${actionLabel}.` : `Entscheidung fehlgeschlagen: ${getSafeAdminDecisionFailureMessage(result.message, result.clientErrorCode)}`;
      setFeedback(safeMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastDecisionAction: action,
        lastDecisionTargetIdPresent: Boolean(inboxId),
        lastDecisionAccepted: accepted,
        lastDecisionStatus: result.status || (accepted ? "accepted" : "failed"),
        lastDecisionMessage: safeMessage,
        lastDecisionErrorCode: result.clientErrorCode || "",
      }));
    } catch (error) {
      const safeMessage = getSafeAdminDecisionMessage(error);
      const safeErrorCode = getSafeAdminDecisionErrorCode(error);
      const feedbackMessage = `Entscheidung fehlgeschlagen: ${safeMessage}`;
      setFeedback(feedbackMessage);
      setSyncDebug((prev) => ({
        ...prev,
        lastDecisionAction: action,
        lastDecisionTargetIdPresent: Boolean(inboxId),
        lastDecisionAccepted: false,
        lastDecisionStatus: "error",
        lastDecisionMessage: feedbackMessage,
        lastDecisionErrorCode: safeErrorCode,
      }));
    } finally {
      try {
        await refreshInbox();
        await refreshTaskProposals();
      } finally {
        setBusy(false);
      }
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-white/12 bg-slate-950/35 p-4">
      {P1_RESET_SAFETY_DOSSIER && (
        <div className="rounded-xl border border-red-300/50 bg-red-500/10 p-4 text-sm text-red-50">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-red-200/80">Autopilot / Safety Empfehlungen</p>
              <h2 className="mt-1 text-lg font-semibold">Nächster empfohlener Schritt</h2>
              <p className="mt-1 font-semibold">{P1_RESET_SAFETY_DOSSIER.title}</p>
              <p className="mt-1 text-red-50/85">{P1_RESET_SAFETY_DOSSIER.shortSummary}</p>
            </div>
            <span className="rounded-full border border-red-200/60 px-3 py-1 text-xs font-semibold">Priorität {P1_RESET_SAFETY_DOSSIER.priority}</span>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded border border-white/15 bg-black/15 p-3">
              <p className="font-semibold">Warum zuerst?</p>
              <p className="mt-1 text-red-50/80">{P1_RESET_SAFETY_DOSSIER.whyFirst || P1_RESET_SAFETY_DOSSIER.recommendation}</p>
            </div>
            <div className="rounded border border-white/15 bg-black/15 p-3">
              <p className="font-semibold">Was passiert nach Freigabe?</p>
              <p className="mt-1 text-red-50/80">{P1_RESET_SAFETY_DOSSIER.afterApproval || P1_RESET_SAFETY_DOSSIER.nextPipelineStep}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="cursor-pointer rounded border border-red-100/70 px-3 py-1 text-red-50" onClick={() => setDetailRow({ ...(P1_RESET_SAFETY_DOSSIER as unknown as Row), id: P1_RESET_SAFETY_DOSSIER.id, sourceDossierId: P1_RESET_SAFETY_DOSSIER.id, sourceType: "safety_dossier", listType: "safety_blocker", hasDossierDetails: true, hasReportDetails: true, visibleListSource: "local_snapshot" })}>Dossier öffnen</button>
            <button className="cursor-pointer rounded border border-amber-200/70 px-3 py-1 text-amber-100" onClick={() => setFeedback("Metadata-only vorbereitet: kein Runner, kein Branch/PR/Merge, kein Deploy und keine GitHub-Automation gestartet.")}>Als Bauauftrag vorbereiten</button>
          </div>
          <p className="mt-2 text-xs text-red-100/80">Status: {P1_RESET_SAFETY_DOSSIER.status} · Empfehlung: vor neuen Agent-Vorschlägen beheben · noRunnerStarted/noBranchOrPrOrMerge/noDeploy bleiben {String(P1_RESET_SAFETY_DOSSIER.noRunnerStarted && P1_RESET_SAFETY_DOSSIER.noBranchOrPrOrMerge && P1_RESET_SAFETY_DOSSIER.noDeploy)}.</p>
        </div>
      )}
      <div className="flex gap-2">
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={runSync}>Product-Evolution Inbox synchronisieren</button>
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={refreshInbox}>Server-Inbox neu laden</button>
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={refreshTaskProposals}>Task Proposals neu laden</button>
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={refreshWorkerQueueItems}>Worker Queue ansehen</button>
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={refreshRunnerJobs}>Runner Jobs ansehen</button>
        <button disabled={busy} className="cursor-pointer rounded border border-cyan-300/70 px-2 py-1 text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50" onClick={refreshAgentSnapshot}>Agent-Snapshot neu laden</button>
        <button disabled={busy} className="cursor-pointer rounded border border-amber-300/70 px-2 py-1 text-amber-100 disabled:cursor-not-allowed disabled:opacity-50" onClick={archiveAndResetAgentCenterPipelineData}>Reset-Prüfung anzeigen</button>
        <button disabled className="cursor-not-allowed rounded border border-slate-500/70 px-2 py-1 text-slate-300 opacity-60" title="P1-Safety-Dossier zuerst beheben; keine frischen Agent-Vorschläge in diesem Schritt." onClick={generateFreshAgentProposals}>Frische Agent-Vorschläge erzeugen</button>
        {canRunRevisionDossierGenerator && <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={runRevisionDossierGenerator}>Revision-Dossiers neu erzeugen</button>}
      </div>
      <p className="text-xs text-amber-100">Reset derzeit aus Sicherheitsgründen nur als Prüfung verfügbar. Der Button löst keinen destruktiven Delete aus; ungescopte Pipeline-Daten dürfen nicht gelöscht werden.</p>
      <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-4 text-xs text-cyan-50">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="uppercase tracking-[0.2em] text-cyan-100/80">Agent Snapshot / Bauarbeiter-Sicht</p>
            <h2 className="mt-1 text-lg font-semibold">Was der Agent aktuell sieht</h2>
            <p className="mt-1 text-cyan-50/80">Bereinigter Admin-Telemetry-Snapshot: Counts, Safety, Queue und Blocker ohne E-Mails, Tokens, Secrets, Sessiondaten oder ungekürzte Payloads.</p>
          </div>
          <button disabled={busy} className="cursor-pointer rounded border border-cyan-100/70 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={refreshAgentSnapshot}>Agent-Snapshot neu laden</button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded border border-white/15 bg-black/15 p-3"><p className="font-semibold">Letzte Snapshot-Zeit</p><p>{agentSnapshot?.snapshotCreatedAt || "Noch nicht geladen"}</p></div>
          <div className="rounded border border-white/15 bg-black/15 p-3"><p className="font-semibold">Nächste empfohlene Aktion</p><p>{agentSnapshot?.nextRecommendedAction || "Snapshot laden, dann freigegebene Dossiers prüfen."}</p></div>
          <div className="rounded border border-white/15 bg-black/15 p-3"><p className="font-semibold">Aktive Blocker</p><p>{agentSnapshot?.lastKnownBlocker || String(agentSnapshot?.builderQueueGuard?.pauseReason || "Keine im Snapshot erkannt")}</p></div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <p className="rounded border border-white/15 p-2">Freigegebene Dossiers: {agentSnapshot?.agentCenterCounts?.approvedDossiers ?? serverInboxCounts.approved}</p>
          <p className="rounded border border-white/15 p-2">Builder warten: {builderQueueCounts.waiting}</p>
          <p className="rounded border border-white/15 p-2">next_up: {builderQueueCounts.next_up}</p>
          <p className="rounded border border-white/15 p-2">Builder aktiv: {builderQueueCounts.active}</p>
          <p className="rounded border border-white/15 p-2">Builder blockiert/Repair: {builderQueueCounts.blocked + builderQueueCounts.repair_required}</p>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <p className="rounded border border-white/15 p-2">completed: {builderQueueCounts.completed}</p>
          <p className="rounded border border-white/15 p-2">repair_required: {builderQueueCounts.repair_required}</p>
          <p className="rounded border border-white/15 p-2">Conversation-Ideen: {conversationIdeaDossiers.length}</p>
        </div>
        <div className="mt-3 rounded border border-emerald-300/30 bg-emerald-500/10 p-3 text-emerald-50">
          <p className="font-semibold">Warum keine neue Freigabe nötig?</p>
          <p>Owner-Freigaben bleiben persistent gültig, solange kein Reapproval-Guard greift: Scope-/Dateiänderung, blockedFiles, requiredChecks, Canonical Truth, Token/Payment/Cashout/SUI/WFT, Health/Child/Location/Camera/Face/Sensitive Data, stale mainSha/Konflikt oder Safety-Sentinel-Blocker.</p>
        </div>
        <p className="mt-3 text-cyan-100/80">Warum keine Screenshots mehr nötig sein sollten: {agentSnapshot?.screenshotsNoLongerNeededReason || "Der Button liest nur den sanitized Snapshot und startet nichts."}</p>
        <p className="mt-2 text-amber-100">Autopilot: {agentSnapshot?.autopilotControl?.mode || "planning_only"} · enabled: {String(agentSnapshot?.autopilotControl?.enabled ?? false)} · paused: {String(agentSnapshot?.autopilotControl?.paused ?? false)} · echte GitHub-Automation bleibt aus.</p>
        <pre className="mt-3 max-h-52 overflow-auto rounded border border-white/15 bg-black/20 p-2 text-[11px] text-cyan-50/85">{JSON.stringify(agentSnapshot ? { snapshotCreatedAt: agentSnapshot.snapshotCreatedAt, agentCenterCounts: agentSnapshot.agentCenterCounts, taskProposalCounts: agentSnapshot.taskProposalCounts, workerQueueCounts: agentSnapshot.workerQueueCounts, builderWorkPackageCounts: agentSnapshot.builderWorkPackageCounts, conversationIdeaDossierCounts: agentSnapshot.conversationIdeaDossierCounts, builderQueueGuard: agentSnapshot.builderQueueGuard, autopilotControl: agentSnapshot.autopilotControl, nextRecommendedAction: agentSnapshot.nextRecommendedAction, noRunnerStarted: agentSnapshot.noRunnerStarted, noBranchOrPrOrMerge: agentSnapshot.noBranchOrPrOrMerge, noDeploy: agentSnapshot.noDeploy, noTokenPaymentBlockchain: agentSnapshot.noTokenPaymentBlockchain } : { status: "not_loaded" }, null, 2)}</pre>
      </div>
      {!authDebug.firebaseUserPresent && (
        <div className="rounded border border-amber-300/60 bg-amber-500/10 p-2 text-xs">
          <p>Admin-Login erforderlich. Bitte mit Firebase anmelden.</p>
          <button disabled={authActionPending} className="mt-2 cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={loginWithGoogle}>Mit Google anmelden</button>
        </div>
      )}
      {authDebug.firebaseUserPresent && (
        <div className="rounded border border-cyan-300/40 bg-cyan-500/10 p-2 text-xs">
          {!authDebug.adminCallableAuthReady && <p>Firebase Login vorhanden, aber Admin-Rolle fehlt oder wurde noch nicht geladen.</p>}
          <button disabled={authActionPending} className="mt-2 cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={logoutAdmin}>Admin abmelden</button>
        </div>
      )}
      {syncStatus && <p className="text-xs">{syncStatus}</p>}
      {feedback && <p className="text-xs">{feedback}</p>}
      {!snapshotStats.hasFirstRunOutput && <p className="text-xs text-amber-300">First-Run-Output wurde nicht in die Admin-Komponente geladen.</p>}
      <div className="rounded border border-white/20 p-2 text-xs">
        <p>Client snapshot candidates: {snapshotStats.localFirstRunCandidateCount}</p>
        <p>Client snapshot keys: [{snapshotStats.localFirstRunKeys.join(", ")}]</p>
        <p>clientVisibleCandidateCount: {snapshotStats.localFirstRunCandidateCount}</p>
        <p>authReady: {String(authDebug.authReady)}</p>
        <p>adminCallableAuthReady: {String(authDebug.adminCallableAuthReady)}</p>
        <p>firebaseUserPresent: {String(authDebug.firebaseUserPresent)}</p>
        <p>agentRoleClaim: {String(authDebug.agentRoleClaim || "-")}</p>
        <p>serverInboxLoadedCount: {String(syncDebug.serverInboxLoadedCount ?? serverInboxRows.length)}</p>
        <p>serverInboxPendingCount: {String(syncDebug.serverInboxPendingCount ?? serverInboxPendingCount)}</p>
        <p>taskProposalLoadAttempted: {String(syncDebug.taskProposalLoadAttempted ?? false)}</p>
        <p>taskProposalLoadAccepted: {String(syncDebug.taskProposalLoadAccepted ?? "-")}</p>
        <p>taskProposalLoadedCount: {String(syncDebug.taskProposalLoadedCount ?? taskProposals.length)}</p>
        <p>taskProposalResponseKeys: [{((syncDebug.taskProposalResponseKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>taskProposalLoadError: {String(syncDebug.taskProposalLoadError || "-")}</p>
        <p>workerQueueLoadAttempted: {String(syncDebug.workerQueueLoadAttempted ?? false)}</p>
        <p>workerQueueLoadAccepted: {String(syncDebug.workerQueueLoadAccepted ?? "-")}</p>
        <p>workerQueueLoadedCount: {String(syncDebug.workerQueueLoadedCount ?? workerQueueItems.length)}</p>
        <p>workerQueueResponseKeys: [{((syncDebug.workerQueueResponseKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>workerQueueLoadError: {String(syncDebug.workerQueueLoadError || "-")}</p>
        <p>workerQueueNoRunnerStartedVisible: {String(syncDebug.workerQueueNoRunnerStartedVisible ?? "-")}</p>
        <p>workerQueueNoBranchOrPrOrMergeVisible: {String(syncDebug.workerQueueNoBranchOrPrOrMergeVisible ?? "-")}</p>
        <p>workerQueueNoDeployVisible: {String(syncDebug.workerQueueNoDeployVisible ?? "-")}</p>
        <p>lastWorkerQueueCreated: {String(syncDebug.lastWorkerQueueCreated ?? "-")}</p>
        <p>lastWorkerQueueIdPresent: {String(syncDebug.lastWorkerQueueIdPresent ?? "-")}</p>
        <p>lastWorkerQueueStatus: {String(syncDebug.lastWorkerQueueStatus || "-")}</p>
        <p>lastWorkerQueueMessage: {String(syncDebug.lastWorkerQueueMessage || "-")}</p>
        <p>lastWorkerQueueNoRunnerStarted: {String(syncDebug.lastWorkerQueueNoRunnerStarted ?? "-")}</p>
        <p>lastWorkerQueueNoBranchOrPrOrMerge: {String(syncDebug.lastWorkerQueueNoBranchOrPrOrMerge ?? "-")}</p>
        <p>lastWorkerQueueNoDeploy: {String(syncDebug.lastWorkerQueueNoDeploy ?? "-")}</p>
        <p>lastWorkerReleaseAction: {String(syncDebug.lastWorkerReleaseAction || "-")}</p>
        <p>lastWorkerReleasePayloadTargetPresent: {String(syncDebug.lastWorkerReleasePayloadTargetPresent ?? "-")}</p>
        <p>lastWorkerReleaseTargetIdPresent: {String(syncDebug.lastWorkerReleaseTargetIdPresent ?? "-")}</p>
        <p>lastWorkerReleaseWorkerQueueIdPresent: {String(syncDebug.lastWorkerReleaseWorkerQueueIdPresent ?? "-")}</p>
        <p>lastWorkerReleaseBackendCode: {String(syncDebug.lastWorkerReleaseBackendCode || "-")}</p>
        <p>lastWorkerReleaseBackendMessage: {String(syncDebug.lastWorkerReleaseBackendMessage || "-")}</p>
        <p>lastWorkerReleaseAccepted: {String(syncDebug.lastWorkerReleaseAccepted ?? "-")}</p>
        <p>lastWorkerReleaseStatus: {String(syncDebug.lastWorkerReleaseStatus || "-")}</p>
        <p>lastWorkerReleaseMessage: {String(syncDebug.lastWorkerReleaseMessage || "-")}</p>
        <p>lastWorkerReleaseNoRunnerStarted: {String(syncDebug.lastWorkerReleaseNoRunnerStarted ?? "-")}</p>
        <p>lastWorkerReleaseNoBranchOrPrOrMerge: {String(syncDebug.lastWorkerReleaseNoBranchOrPrOrMerge ?? "-")}</p>
        <p>lastWorkerReleaseNoDeploy: {String(syncDebug.lastWorkerReleaseNoDeploy ?? "-")}</p>
        <p>lastRunnerPreviewAction: {String(syncDebug.lastRunnerPreviewAction ?? "-")}</p>
        <p>lastRunnerPreviewAccepted: {String(syncDebug.lastRunnerPreviewAccepted ?? "-")}</p>
        <p>lastRunnerPreviewStatus: {String(syncDebug.lastRunnerPreviewStatus ?? "-")}</p>
        <p>lastRunnerPreviewMessage: {String(syncDebug.lastRunnerPreviewMessage ?? "-")}</p>
        <p>lastRunnerPreviewWorkerQueueIdPresent: {String(syncDebug.lastRunnerPreviewWorkerQueueIdPresent ?? "-")}</p>
        <p>lastRunnerPreviewNoRunnerStarted: {String(syncDebug.lastRunnerPreviewNoRunnerStarted ?? "-")}</p>
        <p>lastRunnerPreviewNoBranchOrPrOrMerge: {String(syncDebug.lastRunnerPreviewNoBranchOrPrOrMerge ?? "-")}</p>
        <p>lastRunnerPreviewNoDeploy: {String(syncDebug.lastRunnerPreviewNoDeploy ?? "-")}</p>
        <p>lastRunnerPreviewWouldCreateBranch: {String(syncDebug.lastRunnerPreviewWouldCreateBranch ?? "-")}</p>
        <p>lastRunnerPreviewWouldCreatePr: {String(syncDebug.lastRunnerPreviewWouldCreatePr ?? "-")}</p>
        <p>lastRunnerPreviewWouldDeploy: {String(syncDebug.lastRunnerPreviewWouldDeploy ?? "-")}</p>
        <p>lastRunnerPreviewRunnerStartAllowed: {String(syncDebug.lastRunnerPreviewRunnerStartAllowed ?? "-")}</p>
        <p>lastRunnerStartApprovalAction: {String(syncDebug.lastRunnerStartApprovalAction ?? "-")}</p>
        <p>lastRunnerStartApprovalAccepted: {String(syncDebug.lastRunnerStartApprovalAccepted ?? "-")}</p>
        <p>lastRunnerStartApprovalStatus: {String(syncDebug.lastRunnerStartApprovalStatus ?? "-")}</p>
        <p>lastRunnerStartApprovalMessage: {String(syncDebug.lastRunnerStartApprovalMessage ?? "-")}</p>
        <p>lastRunnerStartApprovalWorkerQueueIdPresent: {String(syncDebug.lastRunnerStartApprovalWorkerQueueIdPresent ?? "-")}</p>
        <p>lastRunnerStartApprovalRunnerJobIdPresent: {String(syncDebug.lastRunnerStartApprovalRunnerJobIdPresent ?? "-")}</p>
        <p>lastRunnerStartApprovalNoRunnerStarted: {String(syncDebug.lastRunnerStartApprovalNoRunnerStarted ?? "-")}</p>
        <p>lastRunnerStartApprovalNoBranchOrPrOrMerge: {String(syncDebug.lastRunnerStartApprovalNoBranchOrPrOrMerge ?? "-")}</p>
        <p>lastRunnerStartApprovalNoDeploy: {String(syncDebug.lastRunnerStartApprovalNoDeploy ?? "-")}</p>
        <p>runnerJobLoadAttempted: {String(syncDebug.runnerJobLoadAttempted ?? false)}</p>
        <p>runnerJobLoadAccepted: {String(syncDebug.runnerJobLoadAccepted ?? "-")}</p>
        <p>runnerJobLoadedCount: {String(syncDebug.runnerJobLoadedCount ?? runnerJobs.length)}</p>
        <p>runnerJobResponseKeys: [{((syncDebug.runnerJobResponseKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>runnerJobLoadError: {String(syncDebug.runnerJobLoadError || "-")}</p>
        <p>pickupContractLoadAttempted: {String(syncDebug.pickupContractLoadAttempted ?? false)}</p>
        <p>pickupContractLoadAccepted: {String(syncDebug.pickupContractLoadAccepted ?? "-")}</p>
        <p>pickupContractLoadedCount: {String(syncDebug.pickupContractLoadedCount ?? pickupContracts.length)}</p>
        <p>lastPickupContractCreated: {String(syncDebug.lastPickupContractCreated ?? "-")}</p>
        <p>lastPickupContractIdPresent: {String(syncDebug.lastPickupContractIdPresent ?? "-")}</p>
        <p>lastPickupContractStatus: {String(syncDebug.lastPickupContractStatus || "-")}</p>
        <p>lastPickupContractMessage: {String(syncDebug.lastPickupContractMessage || "-")}</p>
        <p>lastPickupContractRunnerStartAllowed: {String(syncDebug.lastPickupContractRunnerStartAllowed ?? "-")}</p>
        <p>lastPickupContractFileWriteAllowed: {String(syncDebug.lastPickupContractFileWriteAllowed ?? "-")}</p>
        <p>lastPickupContractBranchCreationAllowed: {String(syncDebug.lastPickupContractBranchCreationAllowed ?? "-")}</p>
        <p>lastPickupContractPrCreationAllowed: {String(syncDebug.lastPickupContractPrCreationAllowed ?? "-")}</p>
        <p>lastPickupContractNoDeploy: {String(syncDebug.lastPickupContractNoDeploy ?? "-")}</p>
        <p>lastPickupContractNoMerge: {String(syncDebug.lastPickupContractNoMerge ?? "-")}</p>
        <p>implementationPlanLoadAttempted: {String(syncDebug.implementationPlanLoadAttempted ?? false)}</p>
        <p>implementationPlanLoadAccepted: {String(syncDebug.implementationPlanLoadAccepted ?? "-")}</p>
        <p>implementationPlanLoadedCount: {String(syncDebug.implementationPlanLoadedCount ?? implementationPlans.length)}</p>
        <p>lastImplementationPlanCreated: {String(syncDebug.lastImplementationPlanCreated ?? "-")}</p>
        <p>lastImplementationPlanIdPresent: {String(syncDebug.lastImplementationPlanIdPresent ?? "-")}</p>
        <p>lastImplementationPlanStatus: {String(syncDebug.lastImplementationPlanStatus || "-")}</p>
        <p>lastImplementationPlanMessage: {String(syncDebug.lastImplementationPlanMessage || "-")}</p>
        <p>lastImplementationPlanFileWriteAllowed: {String(syncDebug.lastImplementationPlanFileWriteAllowed ?? "-")}</p>
        <p>lastImplementationPlanBranchCreationAllowed: {String(syncDebug.lastImplementationPlanBranchCreationAllowed ?? "-")}</p>
        <p>lastImplementationPlanPrCreationAllowed: {String(syncDebug.lastImplementationPlanPrCreationAllowed ?? "-")}</p>
        <p>lastImplementationPlanNoDeploy: {String(syncDebug.lastImplementationPlanNoDeploy ?? "-")}</p>
        <p>lastImplementationPlanNoMerge: {String(syncDebug.lastImplementationPlanNoMerge ?? "-")}</p>
        <p>taskProposalPendingCount: {String(syncDebug.taskProposalPendingCount ?? taskProposalCounts.pending)}</p>
        <p>taskProposalNoRunnerStartedVisible: {String(syncDebug.taskProposalNoRunnerStartedVisible ?? "-")}</p>
        <p>taskProposalNoBranchOrPrOrMergeVisible: {String(syncDebug.taskProposalNoBranchOrPrOrMergeVisible ?? "-")}</p>
        <p>taskProposalNoDeployVisible: {String(syncDebug.taskProposalNoDeployVisible ?? "-")}</p>
        <p>revisionRegenerated: {String(syncDebug.revisionRegenerated ?? "-")}</p>
        <p>revisionStillRequested: {String(syncDebug.revisionStillRequested ?? "-")}</p>
        <p>revisionNoRunnerStarted: {String(syncDebug.revisionNoRunnerStarted ?? "-")}</p>
        <p>revisionNoDeploy: {String(syncDebug.revisionNoDeploy ?? "-")}</p>
        <p>revisionNoMerge: {String(syncDebug.revisionNoMerge ?? "-")}</p>
        <p>visibleListSource: {visibleListSource}</p>
        <p>activeCountSource: {activeCountSource}</p>
        <p>lastDecisionAction: {String(syncDebug.lastDecisionAction || "-")}</p>
        <p>lastDecisionTargetIdPresent: {String(syncDebug.lastDecisionTargetIdPresent ?? "-")}</p>
        <p>lastDecisionAccepted: {String(syncDebug.lastDecisionAccepted ?? "-")}</p>
        <p>lastDecisionStatus: {String(syncDebug.lastDecisionStatus || "-")}</p>
        <p>lastDecisionMessage: {String(syncDebug.lastDecisionMessage || "-")}</p>
        <p>lastDecisionErrorCode: {String(syncDebug.lastDecisionErrorCode || "-")}</p>
        <p>lastTaskProposalCreated: {String(syncDebug.lastTaskProposalCreated ?? "-")}</p>
        <p>lastTaskProposalIdPresent: {String(syncDebug.lastTaskProposalIdPresent ?? "-")}</p>
        <p>lastTaskProposalStatus: {String(syncDebug.lastTaskProposalStatus || "-")}</p>
        <p>lastTaskProposalMessage: {String(syncDebug.lastTaskProposalMessage || "-")}</p>
        <p>lastTaskProposalNoRunnerStarted: {String(syncDebug.lastTaskProposalNoRunnerStarted ?? "-")}</p>
        <p>lastTaskProposalNoBranchOrPrOrMerge: {String(syncDebug.lastTaskProposalNoBranchOrPrOrMerge ?? "-")}</p>
        <p>lastTaskProposalNoDeploy: {String(syncDebug.lastTaskProposalNoDeploy ?? "-")}</p>
        <p>agentSnapshotLoadAccepted: {String(syncDebug.agentSnapshotLoadAccepted ?? "-")}</p>
        <p>agentSnapshotCreatedAt: {String(syncDebug.agentSnapshotCreatedAt || "-")}</p>
        <p>agentSnapshotNextAction: {String(syncDebug.agentSnapshotNextAction || "-")}</p>
        <p>agentSnapshotBuilderCount: {String(syncDebug.agentSnapshotBuilderCount ?? builderQueueCounts.total)}</p>
        <p>lastBuilderWorkPackageCreated: {String(syncDebug.lastBuilderWorkPackageCreated ?? "-")}</p>
        <p>lastBuilderWorkPackageIdPresent: {String(syncDebug.lastBuilderWorkPackageIdPresent ?? "-")}</p>
        <p>lastBuilderWorkPackageStatus: {String(syncDebug.lastBuilderWorkPackageStatus || "-")}</p>
        <p>lastBuilderWorkPackageMessage: {String(syncDebug.lastBuilderWorkPackageMessage || "-")}</p>
        <p>lastBuilderNoRunnerStarted: {String(syncDebug.lastBuilderNoRunnerStarted ?? "-")}</p>
        <p>lastBuilderNoBranchOrPrOrMerge: {String(syncDebug.lastBuilderNoBranchOrPrOrMerge ?? "-")}</p>
        <p>lastBuilderNoDeploy: {String(syncDebug.lastBuilderNoDeploy ?? "-")}</p>
        <p>lastBuilderNoTokenPaymentBlockchain: {String(syncDebug.lastBuilderNoTokenPaymentBlockchain ?? "-")}</p>
        <p>lastAgentCenterResetAccepted: {String(syncDebug.lastAgentCenterResetAccepted ?? "-")}</p>
        <p>lastAgentCenterResetArchiveRunIdPresent: {String(syncDebug.lastAgentCenterResetArchiveRunIdPresent ?? "-")}</p>
        <p>lastAgentCenterResetMessage: {String(syncDebug.lastAgentCenterResetMessage || "-")}</p>
        <p>lastAgentCenterResetDeletedCountsPresent: {String(syncDebug.lastAgentCenterResetDeletedCountsPresent ?? "-")}</p>
        <p>lastAgentCenterResetNoRunnerStarted: {String(syncDebug.lastAgentCenterResetNoRunnerStarted ?? "-")}</p>
        <p>lastAgentCenterResetNoBranchOrPrOrMerge: {String(syncDebug.lastAgentCenterResetNoBranchOrPrOrMerge ?? "-")}</p>
        <p>lastAgentCenterResetNoDeploy: {String(syncDebug.lastAgentCenterResetNoDeploy ?? "-")}</p>
        <p>lastAuthGuardMessage: {String(authDebug.lastAuthGuardMessage || "-")}</p>
        <p>clientSendingRegisterSnapshot: {String(syncDebug.clientSendingRegisterSnapshot ?? "-")}</p>
        <p>clientSendingRegisterSnapshotKeys: [{((syncDebug.clientSendingRegisterSnapshotKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>clientSendingRegisterSnapshotType: {String(syncDebug.clientSendingRegisterSnapshotType || "-")}</p>
        <p>clientSendingCandidateCount: {String(syncDebug.clientSendingCandidateCount ?? "-")}</p>
        <p>clientSnapshotSource: {String(syncDebug.clientSnapshotSource || snapshotResolution.source || "-")}</p>
        {Number(syncDebug.clientSendingCandidateCount ?? snapshotStats.localFirstRunCandidateCount) !== snapshotStats.localFirstRunCandidateCount && <p className="text-amber-300">UI zeigt {snapshotStats.localFirstRunCandidateCount} Kandidaten, sendet aber {Number(syncDebug.clientSendingCandidateCount ?? 0)} Kandidaten. Snapshot-Quelle prüfen.</p>}
        <p>suggestedTaskQueue: {snapshotStats.suggestedTaskQueueCount}</p>
        <p>decisionDossiers: {snapshotStats.decisionDossiersCount}</p>
        <p>generatedDossiers: {snapshotStats.generatedDossiersCount}</p>
        <p>recommendedApprovals: {snapshotStats.recommendedApprovalsCount}</p>
        <p>recommendedResearchMore: {snapshotStats.recommendedResearchMoreCount}</p>
        <p>blockedItems: {snapshotStats.blockedItemsCount}</p>
        <p>callableName: {String(syncDebug.callableName || "-")}</p>
        <p>callableVersion: {String(syncDebug.callableVersion || "-")}</p>
        <p>responseShapeVersion: {String(syncDebug.responseShapeVersion || "-")}</p>
        <p>serverTimestamp: {String(syncDebug.serverTimestamp || "-")}</p>
        <p>serverReceivedInputKeys: [{((syncDebug.serverReceivedInputKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>hasRegisterSnapshot: {String(syncDebug.hasRegisterSnapshot ?? "-")}</p>
        <p>registerSnapshotType: {String(syncDebug.registerSnapshotType || "-")}</p>
        <p>registerSnapshotKeys: [{((syncDebug.registerSnapshotKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>registerSnapshotFieldPresent: {String(syncDebug.registerSnapshotFieldPresent ?? "-")}</p>
        <p>registerSnapshotValueType: {String(syncDebug.registerSnapshotValueType || "-")}</p>
        <p>clientHasRegisterSnapshot: {String(syncDebug.clientHasRegisterSnapshot ?? "-")}</p>
        <p>clientRegisterSnapshotKeys: [{((syncDebug.clientRegisterSnapshotKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>payloadUnwrappedFrom: {String(syncDebug.payloadUnwrappedFrom || "-")}</p>
        <p>serverSnapshotReceived: {String(syncDebug.serverSnapshotReceived ?? "-")}</p>
        <p>serverSnapshotKeys: [{((syncDebug.serverSnapshotKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>serverCandidateCount: {String(syncDebug.serverCandidateCount ?? "-")}</p>
        <p>serverCandidateCollections: {JSON.stringify(syncDebug.serverCandidateCollections || [])}</p>
        <p>skippedReasons: {JSON.stringify(syncDebug.skippedReasons || {})}</p>
        <p>invalidInboxIdSanitized: {String(syncDebug.invalidInboxIdSanitized ?? "-")}</p>
        <p>sourceDossierIdHadSlash: {String(syncDebug.sourceDossierIdHadSlash ?? "-")}</p>
        <p>sampleCreatedIds: {JSON.stringify(syncDebug.sampleCreatedIds || [])}</p>
        <p>sampleSkipped: {JSON.stringify(syncDebug.sampleSkipped || [])}</p>
        {!String(syncDebug.callableVersion || "") && <p className="text-amber-300">Backend-Callable liefert keine Version. Wahrscheinlich läuft noch eine alte Functions-Version. Bitte Functions deployen.</p>}
        {String(syncDebug.callableVersion || "") !== "" && <p className="text-emerald-300">Backend-Callable-Version erkannt: {String(syncDebug.callableVersion)}</p>}
        {(String(syncDebug.callableVersion || "") === "" || String(syncDebug.responseShapeVersion || "") === "") && <p className="text-amber-300">Frontend ist neuer als Backend. Bitte Firebase Functions deployen oder Backend-Callable prüfen.</p>}
        {String(syncDebug.clientErrorCode || "") !== "client_auth_missing" && String(syncDebug.callableVersion || "") !== "" && String(syncDebug.responseShapeVersion || "") !== "" && Number(syncDebug.serverCandidateCount || 0) === 0 && snapshotStats.localFirstRunCandidateCount > 0 && <p className="text-amber-300">Backend ist aktuell, aber Snapshot-Struktur wird nicht verarbeitet. Siehe serverSnapshotKeys/serverCandidateCollections.</p>}
      </div>

      <div className="space-y-2 text-xs">
        <p className="text-cyan-100">Builder Work Packages / agentBuilderWorkPackages — seriell, Branch/PR nur nach Guards; kein Merge, kein Deploy.</p>
        <div className="flex flex-wrap gap-2">
          {BUILDER_QUEUE_FILTER_KEYS.map((key) => {
            const activeCard = active === key;
            const bucket = BUILDER_QUEUE_FILTER_TO_BUCKET[key];
            const count = bucket === "total" ? builderQueueCounts.total : builderQueueCounts[bucket];
            return (
              <button key={key} onClick={() => setActive(key)} className={`cursor-pointer rounded border px-2 py-1 ${activeCard ? "border-cyan-300 bg-cyan-400/10 text-cyan-100 ring-1 ring-orange-300/60" : "border-white/25 hover:border-white/60 hover:bg-white/5"}`}>
                {BUILDER_QUEUE_FILTER_LABELS[key]} ({count})
              </button>
            );
          })}
        </div>
        <p className="text-cyan-100">Agent Worker Queue / agentTaskWorkerQueue — Review-only, startet keinen Runner.</p>
        <div className="flex flex-wrap gap-2">
          {WORKER_QUEUE_FILTER_KEYS.map((key) => {
            const activeCard = active === key;
            const bucket = WORKER_QUEUE_FILTER_TO_BUCKET[key];
            const count = bucket === "total" ? workerQueueCounts.total : workerQueueCounts[bucket];
            return (
              <button key={key} onClick={() => setActive(key)} className={`cursor-pointer rounded border px-2 py-1 ${activeCard ? "border-cyan-300 bg-cyan-400/10 text-cyan-100 ring-1 ring-orange-300/60" : "border-white/25 hover:border-white/60 hover:bg-white/5"}`}>
                {WORKER_QUEUE_FILTER_LABELS[key]} ({count})
              </button>
            );
          })}
        </div>
        <p className="pt-2 text-cyan-100">Agent Task Proposals / agentTaskProposals — Read-only Review, erzeugt keine Worker Queue und startet keinen Runner.</p>
        <div className="flex flex-wrap gap-2">
          {TASK_PROPOSAL_FILTER_KEYS.map((key) => {
            const activeCard = active === key;
            const bucket = TASK_PROPOSAL_FILTER_TO_BUCKET[key];
            const count = bucket === "total" ? taskProposalCounts.total : taskProposalCounts[bucket];
            return (
              <button key={key} onClick={() => setActive(key)} className={`cursor-pointer rounded border px-2 py-1 ${activeCard ? "border-emerald-300 bg-emerald-400/10 text-emerald-100 ring-1 ring-orange-300/60" : "border-white/25 hover:border-white/60 hover:bg-white/5"}`}>
                {TASK_PROPOSAL_FILTER_LABELS[key]} ({count})
              </button>
            );
          })}
        </div>
        <p className="pt-2 text-cyan-100">Server-Inbox / agentCenterInbox — zählt nur geladene Server-Inbox-Einträge und filtert die sichtbare Server-Liste.</p>
        <div className="flex flex-wrap gap-2">
          {SERVER_FILTER_KEYS.map((key) => {
            const activeCard = active === key;
            const bucket = SERVER_FILTER_TO_BUCKET[key];
            const count = bucket === "total" ? serverInboxCounts.total : serverInboxCounts[bucket];
            return (
              <button key={key} onClick={() => setActive(key)} className={`cursor-pointer rounded border px-2 py-1 ${activeCard ? "border-cyan-300 bg-cyan-400/10 text-cyan-100 ring-1 ring-orange-300/60" : "border-white/25 hover:border-white/60 hover:bg-white/5"}`}>
                {SERVER_FILTER_LABELS[key]} ({count})
              </button>
            );
          })}
        </div>
        <p className="pt-2 text-white/65">Register/Legacy-Agenten und Missionsvorschläge — separate Register-/Snapshot-Zähler, nicht die Server-Inbox.</p>
        <div className="flex flex-wrap gap-2">
          {FILTER_KEYS.map((key) => {
            const activeCard = active === key;
            return (
              <button key={key} onClick={() => setActive(key)} className={`cursor-pointer rounded border px-2 py-1 ${activeCard ? "border-cyan-300 bg-cyan-400/10 text-cyan-100 ring-1 ring-orange-300/60" : "border-white/25 hover:border-white/60 hover:bg-white/5"}`}>
                {FILTER_LABELS[key]} ({data.stats[key] ?? 0})
              </button>
            );
          })}
        </div>
      </div>

      {isWorkerQueueFilter(active) && (
        <div className="space-y-3">
          {visibleWorkerQueueItems.map((item) => (
            <article key={item.workerQueueId} className="rounded border border-cyan-200/25 bg-cyan-400/5 p-3 text-xs">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-mono text-cyan-100/75">workerQueueId: {item.workerQueueId || "—"}</p>
                  <p className="font-mono text-emerald-100/75">taskProposalId: {item.taskProposalId || "—"}</p>
                  <b>{item.title || "Unbenanntes Worker Queue Item"}</b>
                  <p className="mt-1 whitespace-pre-wrap">{item.summary || item.requestedAction || "Keine Zusammenfassung hinterlegt."}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <span className="rounded-full border border-white/20 px-2 py-1">Status: {item.status || "pending_worker_review"}</span>
                  <span className="rounded-full border border-white/20 px-2 py-1">Risiko: {item.riskLevel || "medium"}</span>
                  <span className="rounded-full border border-emerald-300/50 px-2 py-1">noRunnerStarted: {String(item.noRunnerStarted === true)}</span>
                  <span className="rounded-full border border-emerald-300/50 px-2 py-1">noBranchOrPrOrMerge: {String(item.noBranchOrPrOrMerge === true)}</span>
                  <span className="rounded-full border border-emerald-300/50 px-2 py-1">noDeploy: {String(item.noDeploy === true)}</span>
                </div>
              </div>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div><dt className="font-semibold">allowedFiles</dt><dd>{(item.allowedFiles || []).join(", ") || "—"}</dd></div>
                <div><dt className="font-semibold">blockedFiles</dt><dd>{(item.blockedFiles || []).join(", ") || "—"}</dd></div>
                <div><dt className="font-semibold">requiredChecks</dt><dd>{(item.requiredChecks || []).join(", ") || "—"}</dd></div>
              </dl>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="cursor-pointer rounded border border-cyan-300/70 px-2 py-1 text-cyan-100" onClick={() => setWorkerQueueDetail(item)}>Worker Queue ansehen</button>
                {["ready_for_worker", "previewed_for_runner"].includes(String(item.status || "").toLowerCase()) && (
                  <button title={runnerPickupPreviewButtonReason(item) || "Runner-Pickup prüfen"} className="cursor-pointer rounded border border-orange-300/70 px-2 py-1 text-orange-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(runnerPickupPreviewButtonReason(item))} onClick={() => previewRunnerPickupForWorkerQueueItem(item)}>Runner-Pickup prüfen</button>
                )}
                {["ready_for_worker", "previewed_for_runner"].includes(String(item.status || "").toLowerCase()) && (
                  <button title={runnerStartApprovalButtonReason(item) || "Runner-Start freigeben"} className="cursor-pointer rounded border border-amber-300/70 px-2 py-1 text-amber-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(runnerStartApprovalButtonReason(item))} onClick={() => approveRunnerStartForWorkerQueueItem(item)}>Runner-Start freigeben</button>
                )}
                {["pending_worker_review", "queued_for_owner_review"].includes(String(item.status || "").toLowerCase()) && (
                  <button title={workerQueueReleaseButtonReason(item) || "Für Worker freigeben"} className="cursor-pointer rounded border border-emerald-300/70 px-2 py-1 text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(workerQueueReleaseButtonReason(item))} onClick={() => releaseWorkerQueueItemForWorker(item)}>Für Worker freigeben</button>
                )}
              </div>
            </article>
          ))}
          {visibleWorkerQueueItems.length === 0 && <p className="rounded border border-white/15 p-3 text-xs text-white/70">Keine Worker Queue Items für diesen Filter geladen.</p>}
        </div>
      )}


      <div className="space-y-3 rounded border border-amber-300/25 bg-amber-400/5 p-3 text-xs">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-amber-100">Agent Runner Jobs / agentRunnerJobs — wartet auf manuellen Runner-Pickup, startet keinen Runner.</h3>
            <p className="text-amber-50/80">Read-only Liste. Diese Ansicht erzeugt keinen Runner, Branch, PR, Merge oder Deploy.</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="rounded-full border border-white/20 px-2 py-1">Runner Jobs gesamt: {runnerJobCounts.total}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Pending Runner Pickup: {runnerJobCounts.pending_runner_pickup}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Pickup Contract Created: {runnerJobCounts.pickup_contract_created}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Implementation Plan Created: {runnerJobCounts.implementation_plan_created}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Planung: {runnerJobCounts.planning}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">In Arbeit: {runnerJobCounts.in_progress}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Fertig: {runnerJobCounts.completed}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Blockiert: {runnerJobCounts.blocked}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Repair Required: {runnerJobCounts.repair_required}</span>
          </div>
        </div>
        {runnerJobs.map((job) => (
          <article key={job.runnerJobId} className="rounded border border-amber-200/25 bg-amber-400/5 p-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-amber-100/75">runnerJobId: {job.runnerJobId || "—"}</p>
                <p className="font-mono text-cyan-100/75">workerQueueId: {job.workerQueueId || "—"}</p>
                <p className="font-mono text-emerald-100/75">taskProposalId: {job.taskProposalId || "—"}</p>
                <b>{job.title || "Unbenannter Runner Job"}</b>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <span className="rounded-full border border-white/20 px-2 py-1">Status: {job.status || "pending_runner_pickup"}</span>
                <span className="rounded-full border border-white/20 px-2 py-1">executionMode: {job.executionMode || "owner_approved_manual_pickup"}</span>
                <span className="rounded-full border border-emerald-300/50 px-2 py-1">noRunnerStarted: {String(job.noRunnerStarted === true)}</span>
                <span className="rounded-full border border-emerald-300/50 px-2 py-1">noBranchOrPrOrMerge: {String(job.noBranchOrPrOrMerge === true)}</span>
                <span className="rounded-full border border-emerald-300/50 px-2 py-1">noDeploy: {String(job.noDeploy === true)}</span>
                <span className="rounded-full border border-orange-300/50 px-2 py-1">runnerStartAllowed: {String(job.runnerStartAllowed === true)}</span>
                <span className="rounded-full border border-orange-300/50 px-2 py-1">requiresManualRunnerPickup: {String(job.requiresManualRunnerPickup === true)}</span>
              </div>
            </div>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div><dt className="font-semibold">allowedFiles</dt><dd>{(job.allowedFiles || []).join(", ") || "—"}</dd></div>
              <div><dt className="font-semibold">blockedFiles</dt><dd>{(job.blockedFiles || []).join(", ") || "—"}</dd></div>
              <div><dt className="font-semibold">requiredChecks</dt><dd>{(job.requiredChecks || []).join(", ") || "—"}</dd></div>
            </dl>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="cursor-pointer rounded border border-amber-300/70 px-2 py-1 text-amber-100" onClick={() => setRunnerJobDetail(job)}>Runner Job ansehen</button>
              {String(job.status || "").toLowerCase() === "pending_runner_pickup" && (
                <button className="cursor-pointer rounded border border-cyan-300/70 px-2 py-1 text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy} onClick={() => createManualRunnerPickupContract(job)}>Pickup-Contract erzeugen</button>
              )}
            </div>
          </article>
        ))}
        {runnerJobs.length === 0 && <p className="rounded border border-white/15 p-3 text-white/70">Keine Runner Jobs geladen.</p>}
      </div>



      <div className="space-y-3 rounded border border-cyan-300/25 bg-cyan-400/5 p-3 text-xs">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-cyan-100">Runner Pickup Contracts — Planungsfreigabe, keine Dateiänderung.</h3>
            <p className="text-cyan-50/80">Diese Contracts erlauben nur einen Umsetzungsplan. Kein Branch, PR, Merge, Deploy oder Datei-Write.</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="rounded-full border border-white/20 px-2 py-1">Pickup Contracts gesamt: {pickupContractCounts.total}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Planung offen: {pickupContractCounts.planning_open}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Plan erstellt: {pickupContractCounts.implementation_plan_created}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Plan Review: {pickupContractCounts.implementation_plan_review}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Plan freigegeben: {pickupContractCounts.implementation_plan_approved}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">In Planung: {pickupContractCounts.planning}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Fertig: {pickupContractCounts.completed}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Blockiert: {pickupContractCounts.blocked}</span>
            <span className="rounded-full border border-white/20 px-2 py-1">Repair Required: {pickupContractCounts.repair_required}</span>
          </div>
        </div>
        {pickupContracts.map((contract) => (
          <article key={contract.pickupContractId} className="rounded border border-cyan-200/25 bg-cyan-400/5 p-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-cyan-100/75">pickupContractId: {contract.pickupContractId || "—"}</p>
                <p className="font-mono text-amber-100/75">runnerJobId: {contract.runnerJobId || "—"}</p>
                <b>{contract.title || "Unbenannter Pickup Contract"}</b>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <span className="rounded-full border border-white/20 px-2 py-1">Status: {contract.status || "pickup_contract_created"}</span>
                <span className="rounded-full border border-orange-300/50 px-2 py-1">runnerStartAllowed: {String(contract.runnerStartAllowed === true)}</span>
                <span className="rounded-full border border-orange-300/50 px-2 py-1">fileWriteAllowed: {String(contract.fileWriteAllowed === true)}</span>
                <span className="rounded-full border border-orange-300/50 px-2 py-1">branchCreationAllowed: {String(contract.branchCreationAllowed === true)}</span>
                <span className="rounded-full border border-orange-300/50 px-2 py-1">prCreationAllowed: {String(contract.prCreationAllowed === true)}</span>
                <span className="rounded-full border border-emerald-300/50 px-2 py-1">noDeploy: {String(contract.noDeploy === true)}</span>
                <span className="rounded-full border border-emerald-300/50 px-2 py-1">noMerge: {String(contract.noMerge === true)}</span>
              </div>
            </div>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div><dt className="font-semibold">allowedFiles</dt><dd>{(contract.allowedFiles || []).join(", ") || "—"}</dd></div>
              <div><dt className="font-semibold">blockedFiles</dt><dd>{(contract.blockedFiles || []).join(", ") || "—"}</dd></div>
              <div><dt className="font-semibold">requiredChecks</dt><dd>{(contract.requiredChecks || []).join(", ") || "—"}</dd></div>
            </dl>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="cursor-pointer rounded border border-cyan-300/70 px-2 py-1 text-cyan-100" onClick={() => setPickupContractDetail(contract)}>Pickup Contract ansehen</button>
              {String(contract.status || "").toLowerCase() === "pickup_contract_created" && (
                <button className="cursor-pointer rounded border border-emerald-300/70 px-2 py-1 text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy} onClick={() => createManualRunnerImplementationPlan(contract)}>Implementierungsplan erzeugen</button>
              )}
            </div>
          </article>
        ))}
        {pickupContracts.length === 0 && <p className="rounded border border-white/15 p-3 text-white/70">Keine Pickup Contracts geladen.</p>}
      </div>


      <div className="space-y-3 rounded border border-emerald-300/25 bg-emerald-400/5 p-3 text-xs">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-emerald-100">Runner Implementation Plans — Planungsdokumente, keine Dateiänderung.</h3>
            <p className="text-emerald-50/80">Diese Pläne sind Owner-Review-Dokumente. Sie starten keinen Runner und ändern keine Dateien.</p>
          </div>
          <span className="rounded-full border border-white/20 px-2 py-1">Implementation Plans gesamt: {implementationPlans.length}</span>
        </div>
        {implementationPlans.map((plan) => (
          <article key={plan.implementationPlanId} className="rounded border border-emerald-200/25 bg-emerald-400/5 p-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-emerald-100/75">implementationPlanId: {plan.implementationPlanId || "—"}</p>
                <p className="font-mono text-cyan-100/75">pickupContractId: {plan.pickupContractId || "—"}</p>
                <b>{plan.title || "Unbenannter Implementierungsplan"}</b>
                <p className="mt-1 whitespace-pre-wrap">{plan.planSummary || "Keine Zusammenfassung hinterlegt."}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <span className="rounded-full border border-white/20 px-2 py-1">Status: {plan.status || "implementation_plan_created"}</span>
                <span className="rounded-full border border-orange-300/50 px-2 py-1">fileWriteAllowed: {String(plan.fileWriteAllowed === true)}</span>
                <span className="rounded-full border border-orange-300/50 px-2 py-1">branchCreationAllowed: {String(plan.branchCreationAllowed === true)}</span>
                <span className="rounded-full border border-orange-300/50 px-2 py-1">prCreationAllowed: {String(plan.prCreationAllowed === true)}</span>
                <span className="rounded-full border border-emerald-300/50 px-2 py-1">noDeploy: {String(plan.noDeploy === true)}</span>
                <span className="rounded-full border border-emerald-300/50 px-2 py-1">noMerge: {String(plan.noMerge === true)}</span>
              </div>
            </div>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div><dt className="font-semibold">plannedSteps</dt><dd>{(plan.plannedSteps || []).join(" · ") || "—"}</dd></div>
              <div><dt className="font-semibold">expectedFilesToTouch</dt><dd>{(plan.expectedFilesToTouch || []).join(", ") || "—"}</dd></div>
              <div><dt className="font-semibold">validationPlan</dt><dd>{(plan.validationPlan || []).join(" · ") || "—"}</dd></div>
              <div><dt className="font-semibold">rollbackPlan</dt><dd>{(plan.rollbackPlan || []).join(" · ") || "—"}</dd></div>
              <div><dt className="font-semibold">Nächster Schritt</dt><dd>{getImplementationPlanNextStep(plan)}</dd></div>
            </dl>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="cursor-pointer rounded border border-emerald-300/70 px-2 py-1 text-emerald-100" onClick={() => setImplementationPlanDetail(plan)}>Implementierungsplan ansehen</button>
              {canApproveImplementationPlan(plan) && <button className="cursor-pointer rounded border border-cyan-300/70 px-2 py-1 text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy} onClick={() => approveManualRunnerImplementationPlan(plan)}>Implementierungsplan freigeben</button>}
            </div>
          </article>
        ))}
        {implementationPlans.length === 0 && <p className="rounded border border-white/15 p-3 text-white/70">Keine Implementation Plans geladen.</p>}
      </div>


      <section className="space-y-3 rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 p-4 text-xs text-fuchsia-50">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="uppercase tracking-[0.2em] text-fuchsia-100/80">Conversation / Ideen-Dossiers</p>
            <h2 className="mt-1 text-lg font-semibold">Gesprächswünsche als Admin-Dossiers</h2>
            <p className="mt-1 text-fuchsia-50/80">Statische Seed-Dossiers plus sanitized Server-Dossiers aus agentConversationIdeaDossiers. Alles bleibt metadata-only: kein Runner, kein Branch/PR/Merge, kein Deploy.</p>
          </div>
          <span className="rounded-full border border-fuchsia-200/50 px-2 py-1">{conversationIdeaDossiers.length} sichtbar</span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {conversationIdeaDossiers.map((dossier) => (
            <article key={dossier.dossierId} className="rounded border border-white/15 bg-black/10 p-3">
              <b>{dossier.title}</b>
              <p>{dossier.shortSummary || dossier.plainLanguageSummary}</p>
              <p>Status: {dossier.status || "pending_approval"} · Owner: {dossier.ownerDecisionStatus || dossier.status || "pending_approval"} · Risiko: {dossier.riskLevel || "medium"}</p>
              <p>Quelle: {dossier.source || "seed"} · Dossier: {dossier.dossierId} · Source: {dossier.sourceDossierId} · Pipeline: {dossier.suggestedPipelineStep || dossier.nextPipelineStep || "owner_review"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="cursor-pointer rounded border border-white/30 px-2 py-1" onClick={() => setDetailRow(dossier as unknown as Row)}>Dossier öffnen</button>
                <button className="cursor-pointer rounded border border-emerald-300/70 px-2 py-1 text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !authDebug.adminCallableAuthReady} onClick={() => decideConversationIdea(dossier, "approve")}>Zustimmen</button>
                <button className="cursor-pointer rounded border border-red-200/70 px-2 py-1 text-red-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !authDebug.adminCallableAuthReady} onClick={() => decideConversationIdea(dossier, "reject")}>Ablehnen</button>
                <button className="cursor-pointer rounded border border-amber-200/70 px-2 py-1 text-amber-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !authDebug.adminCallableAuthReady} onClick={() => decideConversationIdea(dossier, "revision_requested")}>Überarbeiten</button>
                <button className="cursor-pointer rounded border border-white/30 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !authDebug.adminCallableAuthReady} onClick={() => decideConversationIdea(dossier, "block")}>Blockieren</button>
                {(() => {
                  const existing = existingConversationWorkPackage(dossier);
                  const approved = String(dossier.status || dossier.ownerDecisionStatus || "").toLowerCase() === "approved";
                  const disabled = busy || !authDebug.adminCallableAuthReady || !approved || Boolean(existing);
                  const title = existing ? "Bauauftrag bereits vorbereitet" : (!conversationDossierId(dossier) ? "Dossier-ID fehlt" : (!approved ? "Dossier ist nicht approved" : "Als Bauauftrag vorbereiten"));
                  return <button title={title} className="cursor-pointer rounded border border-cyan-300/70 px-2 py-1 text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled} onClick={() => prepareConversationBuilderWorkPackage(dossier)}>{existing ? "Bauauftrag bereits vorbereitet" : "Als Bauauftrag vorbereiten"}</button>;
                })()}
              </div>
              <p className="mt-2 text-fuchsia-100/80">Flags: noRuntimeChanges={String(dossier.noRuntimeChanges !== false)} · noRunnerStarted={String(dossier.noRunnerStarted !== false)} · noBranchOrPrOrMerge={String(dossier.noBranchOrPrOrMerge !== false)} · noDeploy={String(dossier.noDeploy !== false)} · noTokenPaymentBlockchain={String(dossier.noTokenPaymentBlockchain !== false)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-orange-300/30 bg-orange-500/10 p-4 text-xs text-orange-50">
        <p className="uppercase tracking-[0.2em] text-orange-100/80">Post-Merge Prüfung</p>
        <h2 className="mt-1 text-lg font-semibold">Verification Plan</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <p className="rounded border border-white/15 p-2">Letzte Prüfung: {formatAdminDate(builderWorkPackages.find((item) => item.lastVerificationAt)?.lastVerificationAt)}</p>
          <p className="rounded border border-white/15 p-2">Nächste erforderliche Prüfung: {builderWorkPackages.find((item) => item.verificationRequired !== false && item.verificationStatus !== "passed")?.title || "Snapshot laden / keine offene Prüfung"}</p>
          <p className="rounded border border-white/15 p-2">Fehler: {builderWorkPackages.find((item) => item.verificationFailureReason)?.verificationFailureReason || "keine im Snapshot"}</p>
          <p className="rounded border border-white/15 p-2">Repair-Dossier notwendig? {String(builderWorkPackages.some((item) => item.verificationStatus === "failed" && item.createsRepairDossierOnFailure !== false))}</p>
        </div>
      </section>
      {isBuilderQueueFilter(active) && (
        <div className="space-y-3">
          {visibleBuilderWorkPackages.map((item) => (
            <div key={item.workPackageId} className="rounded border border-white/20 p-3 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <b>{item.sequenceNumber ? `#${item.sequenceNumber} · ` : ""}{item.title || "Unbenannter Bauauftrag"}</b>
                  <p>{item.shortSummary || "metadata-only Builder Work Package"}</p>
                  <p>Work Package ID: {item.workPackageId} · Quelle: {item.sourceDossierType || "—"}/{item.sourceDossierId || "—"}</p>
                  <p>Status: {item.status || "approved_waiting"} · next_up={String(String(item.status || "") === "next_up")} · serialGroup: {item.serialGroup || "main_repo"} · baseBranch: {item.baseBranch || "main"}</p>
                  <p>baseSha: {item.baseSha || item.sourceMainShaAtApproval || "—"} · branchName: {item.branchName || item.builderPrPlan?.branchName || "—"} · PR URL: {item.prUrl || "—"}</p>
                  <p>GitHub write ready? {String(item.githubWriteReady === true)} · Guard Status: {String((item.guardStatus as { ok?: unknown } | null | undefined)?.ok ?? "—")} · GitHub Status: {item.githubWriteStatus || "—"}</p>
                  <p>Required Checks: {(item.requiredChecks || []).join(" · ") || "—"}</p>
                  <p>Repair: {item.repairAttemptCount ?? 0}/{item.maxRepairAttempts ?? 3} · Stop/Pause: {item.automationPaused ? "ja" : "nein"}</p>
                  <p>Owner Decision: {item.ownerDecisionStatus || "approved"} · ownerDecisionPersistent={String(item.ownerDecisionPersistent !== false)} · reapprovalRequired={String(item.reapprovalRequired === true)} · executionOrder={item.executionOrder ?? item.sequenceNumber ?? "—"}</p>
                  <p>Revalidation: {item.revalidationStatus || "pending"} · sourceMainSha={item.sourceMainShaAtApproval || "—"} · currentMainSha={item.currentMainShaAtLastValidation || "—"}</p>
                  <p>Checks: {item.checkStatus || item.verificationStatus || "pending"} · adminSnapshotRequired={String(item.adminSnapshotRequired !== false)} · uiSmokeSnapshotRequired={String(item.uiSmokeSnapshotRequired !== false)} · repairDossierOnFailure={String(item.createsRepairDossierOnFailure !== false)}</p>
                  <p>Nächste Aktion: {item.recommendedNextAction || "Warten; keine GitHub-/Runner-/Deploy-Aktion."}</p>
                  <p>Safety: noAutoMerge={String(item.noAutoMerge !== false)} · noAutoDeploy={String(item.noAutoDeploy !== false)} · noDeploy={String(item.noDeploy)} · noTokenPaymentBlockchain={String(item.noTokenPaymentBlockchain)}</p>
                  <p className="text-amber-200">Kein Merge, kein Deploy. Erstellt nur Plan/Branch/PR nach Guards.</p>
                  <button className="mt-2 cursor-pointer rounded border border-cyan-300/70 px-2 py-1 text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50" title={builderPrPrepareButtonReason(item) || "Branch/PR vorbereiten"} disabled={busy || Boolean(builderPrPrepareButtonReason(item))} onClick={() => prepareGithubBuilderBranchPr(item)}>Branch/PR vorbereiten</button>
                </div>
                <span className="rounded-full border border-white/20 px-2 py-1">{getBuilderQueueBucket(item)}</span>
              </div>
            </div>
          ))}
          {visibleBuilderWorkPackages.length === 0 && <p className="rounded border border-white/15 p-3 text-xs text-white/70">Keine Builder Work Packages für diesen Filter geladen. Snapshot neu laden.</p>}
        </div>
      )}

      {isTaskProposalFilter(active) && (
        <div className="space-y-3">
          {visibleTaskProposals.map((proposal) => (
            <article key={proposal.taskProposalId || proposal.proposalId} className="rounded border border-emerald-200/25 bg-emerald-400/5 p-3 text-xs">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-mono text-emerald-100/75">taskProposalId: {proposal.taskProposalId || proposal.proposalId || "—"}</p>
                  <b>{proposal.title || "Unbenanntes Task Proposal"}</b>
                  <p className="mt-1 whitespace-pre-wrap">{proposal.summary || proposal.requestedAction || "Keine Zusammenfassung hinterlegt."}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <span className="rounded-full border border-white/20 px-2 py-1">Status: {proposal.status || "proposed"}</span>
                  <span className="rounded-full border border-white/20 px-2 py-1">Risiko: {proposal.riskLevel || "medium"}</span>
                  <span className="rounded-full border border-emerald-300/50 px-2 py-1">noRunnerStarted: {String(proposal.noRunnerStarted === true)}</span>
                  <span className="rounded-full border border-emerald-300/50 px-2 py-1">noBranchOrPrOrMerge: {String(proposal.noBranchOrPrOrMerge === true)}</span>
                  <span className="rounded-full border border-emerald-300/50 px-2 py-1">noDeploy: {String(proposal.noDeploy === true)}</span>
                </div>
              </div>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div><dt className="font-semibold">sourceInboxId</dt><dd className="break-words font-mono text-cyan-100/75">{proposal.sourceInboxId || "—"}</dd></div>
                <div><dt className="font-semibold">recommendation</dt><dd>{proposal.recommendation || "—"}</dd></div>
                <div><dt className="font-semibold">createdAt</dt><dd>{formatAdminDate(proposal.createdAt)}</dd></div>
                <div><dt className="font-semibold">allowedFiles</dt><dd>{(proposal.allowedFiles || []).join(", ") || "—"}</dd></div>
                <div><dt className="font-semibold">blockedFiles</dt><dd>{(proposal.blockedFiles || []).join(", ") || "—"}</dd></div>
                <div><dt className="font-semibold">requiredChecks</dt><dd>{(proposal.requiredChecks || []).join(", ") || "—"}</dd></div>
              </dl>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="cursor-pointer rounded border border-emerald-300/70 px-2 py-1 text-emerald-100" onClick={() => setTaskProposalDetail(proposal)}>Task Proposal ansehen</button>
                {["proposed", "review_required"].includes(String(proposal.status || "proposed").toLowerCase()) && (() => {
                  const reason = workerQueueButtonReason(proposal);
                  return (
                    <button title={reason || "Worker Queue vorbereiten"} className="cursor-pointer rounded border border-cyan-300/70 px-2 py-1 text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(reason)} onClick={() => prepareWorkerQueueFromTaskProposal(proposal)}>Worker Queue vorbereiten</button>
                  );
                })()}
                {asText(proposal.workerQueueId) && <span className="rounded border border-cyan-300/40 px-2 py-1 text-cyan-100">workerQueueId: {asText(proposal.workerQueueId)}</span>}
              </div>
            </article>
          ))}
          {visibleTaskProposals.length === 0 && <p className="rounded border border-white/15 p-3 text-xs text-white/70">Keine Task Proposals für diesen Filter geladen.</p>}
        </div>
      )}

      {!isTaskProposalFilter(active) && !isWorkerQueueFilter(active) && <div className="space-y-3">
        {visible.map((row) => {
          const summary = buildAdminDecisionSummary(row);
          const timeline = deriveTimeline(row);
          const missionMode = !isServerInboxFilter(active) && isMissionFilter(active);
          const decisionKind = row.visibleListSource === "server_inbox" ? "agent" : (missionMode ? "mission" : "agent");
          const hasInbox = Boolean(asText(row.inboxId));
          const decisionDetails = getDecisionDetails(row);
          const missing = Array.isArray(row.missingCriticalDecisionFields) ? row.missingCriticalDecisionFields : decisionDetails.missing;
          const approveReason = buttonReason("approve", row);
          const rejectReason = buttonReason("reject", row);
          const blockReason = buttonReason("block", row);
          const reviseReason = buttonReason("revise", row);
          const taskProposalReason = taskProposalButtonReason(row);
          const reapprovalRequired = isLegacyApprovedReapprovalRequired(row);
          const canShowTaskProposalAction = String(row.status || "").toLowerCase() === "approved" && !reapprovalRequired;
          const decisionBlocker = approveReason || rejectReason || blockReason || reviseReason;

          return (
            <div key={String(row.id || row.title)} className="rounded border p-3 text-xs">
              <b>{summary.plainTitle}</b>
              <p>{decisionDetails.summary || summary.plainSummary || "Dossier vorhanden – Details ansehen"}</p>
              <p>Status: {String(row.status || "pending_approval")} · Inbox: {hasInbox ? "synchronisiert" : "Noch nicht synchronisiert"}</p>
              {asText(row.recommendationLabel) && <p className="text-emerald-200">Empfehlung: {asText(row.recommendationLabel)}</p>}
              {row.supersededByReadableDecisionDossier === true && <p className="text-amber-200">Legacy/alte Quelle: lesbares Decision-Dossier wird bevorzugt ({asText(row.readableDossierInboxId) || "decisionDossiers"}).</p>}
              {reapprovalRequired && <div className="mt-2 rounded border border-amber-300/50 bg-amber-300/10 p-2 text-amber-100"><p className="font-semibold">Alte Freigabe erkannt</p><p>Diese Freigabe gilt nur für den alten eingeschränkten Vertrag.</p><p>Für automatische Ausführung ist eine neue einmalige Entscheidung nötig.</p><p>{asText(row.reapprovalReason) || "Dieser Vorschlag wurde früher mit einem alten, engen Vertrag freigegeben. Für automatische Ausführung ist eine neue einmalige Entscheidung auf Basis des vollständigen Ausführungsvertrags nötig."}</p></div>}
              <p>inboxId: {hasInbox ? asText(row.inboxId) : "—"}</p>
              <p>Warum Buttons ggf. gesperrt: {decisionBlocker || (missing.length > 0 ? `Dossierdaten unvollständig (${missing.join(", ")})` : "entscheidbar")}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                <button className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={!row.hasDossierDetails && !row.hasReportDetails} onClick={() => setDetailRow(row)}>Dossier ansehen (konkrete Entscheidungsvorlage)</button>
                <button className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={!row.hasReportDetails} onClick={() => setDetailRow(row)}>Bericht ansehen (übergeordnete Analyse / Hintergrundbericht)</button>
                <button title={approveReason || (reapprovalRequired ? "Single-Decision neu freigeben" : "Zustimmen")} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(approveReason)} onClick={() => decide(decisionKind, "approve", row)}>{reapprovalRequired ? "Single-Decision neu freigeben" : "Zustimmen"}</button>
                <button title={rejectReason || "Ablehnen"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(rejectReason)} onClick={() => decide(decisionKind, "reject", row)}>Ablehnen</button>
                <button title={reviseReason || "Überarbeiten"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(reviseReason)} onClick={() => decide(decisionKind, "revise", row)}>Überarbeiten</button>
                <button title={blockReason || "Blockieren"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(blockReason)} onClick={() => decide(decisionKind, "block", row)}>Blockieren</button>
                {canShowTaskProposalAction && <button title={taskProposalReason || "Task Proposal erzeugen"} className="cursor-pointer rounded border border-emerald-300/70 px-2 text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(taskProposalReason)} onClick={() => createTaskProposal(row)}>Task Proposal erzeugen</button>}
                {canShowTaskProposalAction && <button title={builderWorkPackageButtonReason(row) || "Bauauftrag vorbereiten"} className="cursor-pointer rounded border border-cyan-300/70 px-2 text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(builderWorkPackageButtonReason(row))} onClick={() => prepareBuilderWorkPackage(row)}>Bauauftrag vorbereiten</button>}
                {decisionBlocker && <p className="w-full text-amber-300">Sperrgrund: {decisionBlocker}</p>}
                {canShowTaskProposalAction && taskProposalReason && <p className="w-full text-amber-300">Task-Proposal-Sperrgrund: {taskProposalReason}</p>}
              </div>
              <p>Wartet seit: {formatAdminDate(timeline.waitingForApprovalAt)}</p>
            </div>
          );
        })}
      </div>}





      {implementationPlanDetail && (() => {
        const fileList = (label: string, values: string[] | undefined) => (<div><p className="mt-2 font-semibold">{label}</p>{values && values.length > 0 ? <ul className="list-disc pl-5">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>—</p>}</div>);
        const info = (label: string, value: string | undefined | null) => (<div><p className="mt-2 font-semibold">{label}</p><p className="whitespace-pre-wrap">{value || "—"}</p></div>);
        return (
          <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setImplementationPlanDetail(null)}>
            <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg bg-slate-900 p-4 text-xs text-white" onClick={(event) => event.stopPropagation()}>
              <div className="sticky top-0 mb-2 flex justify-between bg-slate-900 pb-2">
                <h3 className="text-base font-semibold">Implementierungsplan ansehen · {implementationPlanDetail.title || implementationPlanDetail.implementationPlanId}</h3>
                <button className="cursor-pointer rounded border px-2" onClick={() => setImplementationPlanDetail(null)}>Schließen</button>
              </div>
              <p className="font-mono text-emerald-100/75">implementationPlanId: {implementationPlanDetail.implementationPlanId || "—"}</p>
              <p className="font-mono text-cyan-100/75">pickupContractId: {implementationPlanDetail.pickupContractId || "—"}</p>
              <p>Status: {implementationPlanDetail.status || "implementation_plan_created"} · executionMode: {implementationPlanDetail.executionMode || "manual_plan_only"}</p>
              {info("Was soll geplant werden?", implementationPlanDetail.planSummary)}
              {fileList("Geplante Schritte", implementationPlanDetail.plannedSteps)}
              {fileList("Welche Dateien könnten später betroffen sein?", implementationPlanDetail.expectedFilesToTouch)}
              {fileList("Was ist die Prüfung?", implementationPlanDetail.validationPlan)}
              {fileList("Wie wird zurückgerollt?", implementationPlanDetail.rollbackPlan)}
              <div className="mt-3 rounded border border-orange-300/40 bg-orange-400/10 p-3 text-orange-50">
                <p className="font-semibold">Was passiert jetzt NICHT?</p>
                <ul className="list-disc pl-5"><li>Keine Dateiänderung</li><li>Kein Branch</li><li>Kein PR</li><li>Kein Merge</li><li>Kein Deploy</li></ul>
                <p className="mt-2">fileWriteAllowed: {String(implementationPlanDetail.fileWriteAllowed === true)}</p>
                <p>branchCreationAllowed: {String(implementationPlanDetail.branchCreationAllowed === true)}</p>
                <p>prCreationAllowed: {String(implementationPlanDetail.prCreationAllowed === true)}</p>
                <p>noDeploy: {String(implementationPlanDetail.noDeploy === true)}</p>
                <p>noMerge: {String(implementationPlanDetail.noMerge === true)}</p>
              </div>
              {info("Nächster Schritt", getImplementationPlanNextStep(implementationPlanDetail))}
            </div>
          </div>
        );
      })()}

      {pickupContractDetail && (() => {
        const fileList = (label: string, values: string[] | undefined) => (<div><p className="mt-2 font-semibold">{label}</p>{values && values.length > 0 ? <ul className="list-disc pl-5">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>—</p>}</div>);
        return (
          <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setPickupContractDetail(null)}>
            <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg bg-slate-900 p-4 text-xs text-white" onClick={(event) => event.stopPropagation()}>
              <div className="sticky top-0 mb-2 flex justify-between bg-slate-900 pb-2">
                <h3 className="text-base font-semibold">Pickup Contract ansehen · {pickupContractDetail.title || pickupContractDetail.pickupContractId}</h3>
                <button className="cursor-pointer rounded border px-2" onClick={() => setPickupContractDetail(null)}>Schließen</button>
              </div>
              <p className="font-mono text-cyan-100/75">pickupContractId: {pickupContractDetail.pickupContractId || "—"}</p>
              <p className="font-mono text-amber-100/75">runnerJobId: {pickupContractDetail.runnerJobId || "—"}</p>
              <p>Status: {pickupContractDetail.status || "pickup_contract_created"} · executionMode: {pickupContractDetail.executionMode || "manual_runner_pickup_contract"}</p>
              {fileList("allowedFiles", pickupContractDetail.allowedFiles)}
              {fileList("blockedFiles", pickupContractDetail.blockedFiles)}
              {fileList("requiredChecks", pickupContractDetail.requiredChecks)}
              <div className="mt-3 rounded border border-cyan-300/40 bg-cyan-400/10 p-3 text-cyan-50">
                <p className="font-semibold">Was darf der Runner jetzt tun?</p>
                <ul className="list-disc pl-5"><li>Nur Umsetzungsplan erstellen</li></ul>
                <p className="mt-3 font-semibold">Was darf er jetzt NICHT tun?</p>
                <ul className="list-disc pl-5"><li>Keine Dateien ändern</li><li>Kein Branch</li><li>Kein PR</li><li>Kein Merge</li><li>Kein Deploy</li></ul>
                <p className="mt-3 font-semibold">Nächster Schritt:</p>
                <p>Owner muss Implementierungsplan separat freigeben.</p>
                <p className="mt-2">runnerStartAllowed: {String(pickupContractDetail.runnerStartAllowed === true)}</p>
                <p>fileWriteAllowed: {String(pickupContractDetail.fileWriteAllowed === true)}</p>
                <p>branchCreationAllowed: {String(pickupContractDetail.branchCreationAllowed === true)}</p>
                <p>prCreationAllowed: {String(pickupContractDetail.prCreationAllowed === true)}</p>
                <p>noDeploy: {String(pickupContractDetail.noDeploy === true)}</p>
                <p>noMerge: {String(pickupContractDetail.noMerge === true)}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {runnerJobDetail && (() => {
        const fileList = (label: string, values: string[] | undefined) => (<div><p className="mt-2 font-semibold">{label}</p>{values && values.length > 0 ? <ul className="list-disc pl-5">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>—</p>}</div>);
        const info = (label: string, value: string | undefined | null) => (<div><p className="mt-2 font-semibold">{label}</p><p className="whitespace-pre-wrap">{value || "—"}</p></div>);
        return (
          <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setRunnerJobDetail(null)}>
            <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg bg-slate-900 p-4 text-xs text-white" onClick={(event) => event.stopPropagation()}>
              <div className="sticky top-0 mb-2 flex justify-between bg-slate-900 pb-2">
                <h3 className="text-base font-semibold">Runner Job ansehen · {runnerJobDetail.title || runnerJobDetail.runnerJobId}</h3>
                <button className="cursor-pointer rounded border px-2" onClick={() => setRunnerJobDetail(null)}>Schließen</button>
              </div>
              <p className="font-mono text-amber-100/75">runnerJobId: {runnerJobDetail.runnerJobId || "—"}</p>
              <p className="font-mono text-cyan-100/75">workerQueueId: {runnerJobDetail.workerQueueId || "—"}</p>
              <p className="font-mono text-emerald-100/75">taskProposalId: {runnerJobDetail.taskProposalId || "—"}</p>
              <p>Status: {runnerJobDetail.status || "pending_runner_pickup"} · executionMode: {runnerJobDetail.executionMode || "owner_approved_manual_pickup"}</p>
              {info("Was darf der Runner später tun?", runnerJobDetail.title || "Manueller Runner-Pickup darf separat gestartet werden.")}
              {fileList("Welche Dateien darf er ändern?", runnerJobDetail.allowedFiles)}
              {fileList("Welche Dateien sind blockiert?", runnerJobDetail.blockedFiles)}
              {fileList("Welche Checks sind Pflicht?", runnerJobDetail.requiredChecks)}
              <div className="mt-3 rounded border border-orange-300/40 bg-orange-400/10 p-3 text-orange-50">
                <p className="font-semibold">Was passiert jetzt NICHT?</p>
                <ul className="list-disc pl-5">
                  <li>Kein Runner-Start</li>
                  <li>Kein Branch</li>
                  <li>Kein PR</li>
                  <li>Kein Merge</li>
                  <li>Kein Deploy</li>
                </ul>
                <p className="mt-2">noRunnerStarted: {String(runnerJobDetail.noRunnerStarted === true)}</p>
                <p>noBranchOrPrOrMerge: {String(runnerJobDetail.noBranchOrPrOrMerge === true)}</p>
                <p>noDeploy: {String(runnerJobDetail.noDeploy === true)}</p>
                <p>runnerStartAllowed: {String(runnerJobDetail.runnerStartAllowed === true)}</p>
                <p>requiresManualRunnerPickup: {String(runnerJobDetail.requiresManualRunnerPickup === true)}</p>
              </div>
              {info("Nächster Schritt", "Manueller Runner-Pickup muss separat gestartet werden.")}
            </div>
          </div>
        );
      })()}

      {runnerPickupPreview && (() => {
        const fileList = (label: string, values: string[] | undefined) => (<div><p className="mt-2 font-semibold">{label}</p>{values && values.length > 0 ? <ul className="list-disc pl-5">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>—</p>}</div>);
        const info = (label: string, value: string | undefined | null) => (<div><p className="mt-2 font-semibold">{label}</p><p className="whitespace-pre-wrap">{value || "—"}</p></div>);
        return (
          <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setRunnerPickupPreview(null)}>
            <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg bg-slate-900 p-4 text-xs text-white" onClick={(event) => event.stopPropagation()}>
              <div className="sticky top-0 mb-2 flex justify-between bg-slate-900 pb-2">
                <h3 className="text-base font-semibold">Runner-Pickup Preview</h3>
                <button className="cursor-pointer rounded border px-2" onClick={() => setRunnerPickupPreview(null)}>Schließen</button>
              </div>
              <p className="font-mono text-cyan-100/75">workerQueueId: {runnerPickupPreview.workerQueueId || "—"}</p>
              <p className="font-mono text-emerald-100/75">taskProposalId: {runnerPickupPreview.taskProposalId || "—"}</p>
              <p>Status: {runnerPickupPreview.status || "ready_for_worker"} · Risiko: {runnerPickupPreview.riskLevel || "medium"}</p>
              {info("Was soll der Runner später tun?", runnerPickupPreview.requestedAction || runnerPickupPreview.title || "Preview-only Runner-Pickup prüfen.")}
              {fileList("Welche Dateien darf er ändern?", runnerPickupPreview.allowedFiles)}
              {fileList("Welche Dateien sind blockiert?", runnerPickupPreview.blockedFiles)}
              {fileList("Welche Checks sind Pflicht?", runnerPickupPreview.requiredChecks)}
              <div className="mt-3 rounded border border-orange-300/40 bg-orange-400/10 p-3 text-orange-50">
                <p className="font-semibold">Was würde NICHT passieren?</p>
                <ul className="list-disc pl-5">
                  <li>Kein Runner-Start</li>
                  <li>Kein Branch</li>
                  <li>Kein PR</li>
                  <li>Kein Merge</li>
                  <li>Kein Deploy</li>
                </ul>
                <p className="mt-2">wouldCreateBranch: {String(runnerPickupPreview.wouldCreateBranch === true)}</p>
                <p>wouldCreatePr: {String(runnerPickupPreview.wouldCreatePr === true)}</p>
                <p>wouldDeploy: {String(runnerPickupPreview.wouldDeploy === true)}</p>
                <p>runnerStartAllowed: {String(runnerPickupPreview.runnerStartAllowed === true)}</p>
              </div>
              {info("Nächster Schritt", "Owner muss Runner-Start separat freigeben.")}
            </div>
          </div>
        );
      })()}

      {workerQueueDetail && (() => {
        const fileList = (label: string, values: string[] | undefined) => (<div><p className="mt-2 font-semibold">{label}</p>{values && values.length > 0 ? <ul className="list-disc pl-5">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>—</p>}</div>);
        const info = (label: string, value: string | undefined | null) => (<div><p className="mt-2 font-semibold">{label}</p><p className="whitespace-pre-wrap">{value || "—"}</p></div>);
        return (
          <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setWorkerQueueDetail(null)}>
            <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg bg-slate-900 p-4 text-xs text-white" onClick={(event) => event.stopPropagation()}>
              <div className="sticky top-0 mb-2 flex justify-between bg-slate-900 pb-2">
                <h3 className="text-base font-semibold">Worker Queue ansehen · {workerQueueDetail.title || workerQueueDetail.workerQueueId}</h3>
                <button className="cursor-pointer rounded border px-2" onClick={() => setWorkerQueueDetail(null)}>Schließen</button>
              </div>
              <p className="font-mono text-cyan-100/75">workerQueueId: {workerQueueDetail.workerQueueId || "—"}</p>
              <p className="font-mono text-emerald-100/75">taskProposalId: {workerQueueDetail.taskProposalId || "—"}</p>
              <p>Status: {workerQueueDetail.status || "pending_worker_review"} · Risiko: {workerQueueDetail.riskLevel || "medium"}</p>
              {info("Was soll gemacht werden?", workerQueueDetail.requestedAction || workerQueueDetail.summary)}
              {info("Warum?", workerQueueDetail.summary)}
              {fileList("Welche Dateien dürfen geändert werden?", workerQueueDetail.allowedFiles)}
              {fileList("Welche Dateien sind blockiert?", workerQueueDetail.blockedFiles)}
              {fileList("Welche Checks sind Pflicht?", workerQueueDetail.requiredChecks)}
              <div className="mt-3 rounded border border-emerald-300/40 bg-emerald-400/10 p-3 text-emerald-50">
                <p className="font-semibold">Sicherheitsstatus: Kein Runner, kein Deploy, kein Merge.</p>
                <p>noRunnerStarted: {String(workerQueueDetail.noRunnerStarted === true)}</p>
                <p>noBranchOrPrOrMerge: {String(workerQueueDetail.noBranchOrPrOrMerge === true)}</p>
                <p>noDeploy: {String(workerQueueDetail.noDeploy === true)}</p>
              </div>
              {info("Nächster Schritt", "Owner muss Runner-Freigabe separat erteilen. Diese Ansicht startet keinen Runner und erzeugt keinen Branch, PR, Merge oder Deploy.")}
              <p className="mt-2">createdAt: {formatAdminDate(workerQueueDetail.createdAt)}</p>
            </div>
          </div>
        );
      })()}

      {taskProposalDetail && (() => {
        const fileList = (label: string, values: string[] | undefined) => (<div><p className="mt-2 font-semibold">{label}</p>{values && values.length > 0 ? <ul className="list-disc pl-5">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>—</p>}</div>);
        const info = (label: string, value: string | undefined | null) => (<div><p className="mt-2 font-semibold">{label}</p><p className="whitespace-pre-wrap">{value || "—"}</p></div>);
        return (
          <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setTaskProposalDetail(null)}>
            <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg bg-slate-900 p-4 text-xs text-white" onClick={(event) => event.stopPropagation()}>
              <div className="sticky top-0 mb-2 flex justify-between bg-slate-900 pb-2">
                <h3 className="text-base font-semibold">Task Proposal ansehen · {taskProposalDetail.title || taskProposalDetail.taskProposalId}</h3>
                <button className="cursor-pointer rounded border px-2" onClick={() => setTaskProposalDetail(null)}>Schließen</button>
              </div>
              <p className="font-mono text-cyan-100/75">taskProposalId: {taskProposalDetail.taskProposalId || taskProposalDetail.proposalId || "—"}</p>
              <p>Status: {taskProposalDetail.status || "proposed"} · Risiko: {taskProposalDetail.riskLevel || "medium"}</p>
              <p>sourceInboxId: {taskProposalDetail.sourceInboxId || "—"}</p>
              {info("Was soll gemacht werden?", taskProposalDetail.requestedAction || taskProposalDetail.summary)}
              {info("Warum?", taskProposalDetail.recommendation || taskProposalDetail.summary)}
              {fileList("Welche Dateien dürfen geändert werden?", taskProposalDetail.allowedFiles)}
              {fileList("Welche Dateien sind blockiert?", taskProposalDetail.blockedFiles)}
              {fileList("Welche Checks sind Pflicht?", taskProposalDetail.requiredChecks)}
              {info("Was passiert als nächstes?", "Admin prüft dieses Task Proposal manuell. Für proposed/review_required kann eine Worker Queue vorbereitet werden; Runner, Branch, PR, Merge und Deploy bleiben deaktiviert.")}
              <div className="mt-3 rounded border border-emerald-300/40 bg-emerald-400/10 p-3 text-emerald-50">
                <p className="font-semibold">Sicherheitsstatus: Kein Runner, kein Deploy, kein Merge.</p>
                <p>noRunnerStarted: {String(taskProposalDetail.noRunnerStarted === true)}</p>
                <p>noBranchOrPrOrMerge: {String(taskProposalDetail.noBranchOrPrOrMerge === true)}</p>
                <p>noDeploy: {String(taskProposalDetail.noDeploy === true)}</p>
              </div>
              <p className="mt-2">createdAt: {formatAdminDate(taskProposalDetail.createdAt)}</p>
            </div>
          </div>
        );
      })()}

      {detailRow && (() => {
        const details = getDecisionDetails(detailRow);
        const fileList = (label: string, values: string[]) => (<div><p className="mt-2 font-semibold">{label}</p>{values.length > 0 ? <ul className="list-disc pl-5">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>—</p>}</div>);
        const info = (label: string, value: string) => (<div><p className="mt-2 font-semibold">{label}</p><p className="whitespace-pre-wrap">{value || "—"}</p></div>);
        const executionContract = objectValue(detailRow.executionContract);
        const allowedExecution = objectValue(detailRow.allowedExecution);
        const forbiddenExecution = objectValue(detailRow.forbiddenExecution);
        const isConversationIdeaDetail = asText(detailRow.type) === "conversation_idea_dossier" || Boolean(asText(detailRow.dossierId) && asText(detailRow.suggestedPipelineStep).includes("conversation_idea"));
        const conversationDetailStatus = String(detailRow.status || "pending_approval").toLowerCase();
        const allowedLabel = (value: boolean) => value ? "erlaubt" : "nicht erlaubt";
        const decisionAllows = [
          ["Task Proposal", executionContract.decisionCoversTaskProposal === true],
          ["Worker Queue", executionContract.decisionCoversWorkerQueue === true],
          ["Runner Job", executionContract.decisionCoversRunnerJob === true],
          ["Pickup Contract", executionContract.decisionCoversPickupContract === true],
          ["Implementierungsplan", executionContract.decisionCoversImplementationPlan === true],
          ["Dateiänderungen", allowedExecution.fileWriteAllowed === true && executionContract.decisionCoversFileWrites === true],
          ["Branch", allowedExecution.branchCreationAllowed === true && executionContract.decisionCoversBranchCreation === true],
          ["PR", allowedExecution.prCreationAllowed === true && executionContract.decisionCoversPrCreation === true],
          ["Merge", allowedExecution.mergeAllowed === true && executionContract.decisionCoversMerge === true],
          ["Deploy", allowedExecution.deployAllowed === true && executionContract.decisionCoversDeploy === true],
          ["app/**", details.allowedFiles.includes("app/**")],
          ["functions/**", details.allowedFiles.includes("functions/**")],
          ["firestore.rules", details.allowedFiles.includes("firestore.rules")],
          [".github/**", details.allowedFiles.includes(".github/**")],
          ["native/**", forbiddenExecution.nativeChangesAllowed === true || !details.blockedFiles.includes("native/**")],
          ["Token/Payment/Blockchain", forbiddenExecution.tokenPaymentBlockchainAllowed === true],
        ];
        return (
        <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setDetailRow(null)}>
          <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg bg-slate-900 p-4 text-xs text-white" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 mb-2 flex justify-between bg-slate-900 pb-2">
              <h3 className="text-base font-semibold">{details.title || "Dossier"}</h3>
              <button className="cursor-pointer rounded border px-2" onClick={() => setDetailRow(null)}>Schließen</button>
            </div>
            <p>Dossier-ID: {String(detailRow.sourceDossierId || "—")}</p>
            <p>Quelle: {details.source || "—"}</p>
            <p>Source Type: {String(detailRow.sourceType || "—")} · List Type: {String(detailRow.listType || "—")}</p>
            <p>Status: {String(detailRow.status || "pending_approval")}</p>
            {isConversationIdeaDetail && <div className="mt-2 flex flex-wrap gap-2 rounded border border-fuchsia-200/30 bg-fuchsia-400/10 p-2">
              <button className="cursor-pointer rounded border border-emerald-300/70 px-2 py-1 text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !authDebug.adminCallableAuthReady} onClick={() => decideConversationIdea(detailRow, "approve")}>Zustimmen</button>
              <button className="cursor-pointer rounded border border-red-200/70 px-2 py-1 text-red-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !authDebug.adminCallableAuthReady} onClick={() => decideConversationIdea(detailRow, "reject")}>Ablehnen</button>
              <button className="cursor-pointer rounded border border-amber-200/70 px-2 py-1 text-amber-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !authDebug.adminCallableAuthReady} onClick={() => decideConversationIdea(detailRow, "revision_requested")}>Überarbeiten</button>
              <button className="cursor-pointer rounded border border-white/30 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !authDebug.adminCallableAuthReady} onClick={() => decideConversationIdea(detailRow, "block")}>Blockieren</button>
              <button className="cursor-pointer rounded border border-cyan-300/70 px-2 py-1 text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !authDebug.adminCallableAuthReady || conversationDetailStatus !== "approved"} onClick={() => prepareConversationBuilderWorkPackage(detailRow)}>Als Bauauftrag vorbereiten</button>
            </div>}
            <p>Detailstatus: {details.isComplete ? "structured" : "missing"}</p>
            {isLegacyApprovedReapprovalRequired(detailRow) && <div className="mt-2 rounded border border-amber-300/50 bg-amber-300/10 p-2 text-amber-100"><p className="font-semibold">Alte Freigabe erkannt</p><p>Diese Freigabe gilt nur für den alten eingeschränkten Vertrag.</p><p>Für automatische Ausführung ist eine neue einmalige Entscheidung nötig.</p><p>{asText(detailRow.reapprovalReason) || "Dieser Vorschlag wurde früher mit einem alten, engen Vertrag freigegeben. Für automatische Ausführung ist eine neue einmalige Entscheidung auf Basis des vollständigen Ausführungsvertrags nötig."}</p></div>}
            {details.singleDecision.isSingleDecision && <p>Contract: {asText(detailRow.executionContractVersion) || "—"} · Hash vorhanden: {String(Boolean(getCurrentExecutionContractHash(detailRow)))} · Approved Hash passt: {String(contractApprovalMatchesCurrent(detailRow))}</p>}
            {!details.isComplete && <div className="mt-2 rounded border border-amber-300/50 bg-amber-300/10 p-2 text-amber-100"><p className="font-semibold">Dossierdaten unvollständig</p><p>Fehlende Entscheidungsfelder: {details.missing.join(", ")}</p><p>Sperrgrund: {details.singleDecision.isSingleDecision ? SINGLE_DECISION_BLOCKER : "Dossier unvollständig – zuerst Überarbeiten wählen."}</p></div>}
            {details.singleDecision.isSingleDecision && <div className="mt-3 rounded border border-cyan-300/40 bg-cyan-400/10 p-3 text-cyan-50">
              <p className="font-semibold">Diese eine Entscheidung erlaubt</p>
              <p className="text-cyan-50/80">{details.singleDecision.isComplete ? "Zustimmen bedeutet: einmalige Owner-Freigabe für diesen Vertrag." : SINGLE_DECISION_BLOCKER}</p>
              <dl className="mt-2 grid gap-1 sm:grid-cols-2">{decisionAllows.map(([label, value]) => <div key={String(label)} className="flex justify-between gap-3"><dt>{String(label)}</dt><dd className={value ? "text-emerald-200" : "text-amber-200"}>{allowedLabel(Boolean(value))}</dd></div>)}</dl>
              <p className="mt-3 font-semibold">Automatische Stop-Bedingungen</p>
              {details.stopConditions.length > 0 ? <ul className="list-disc pl-5">{details.stopConditions.map((value) => <li key={value}>{value}</li>)}</ul> : <p>—</p>}
              <p className="mt-3 font-semibold">Zielumgebung</p>
              <p>{details.targetEnvironment === "test_main" ? "Testseite/main" : (details.targetEnvironment || "—")}</p>
              <p>Keine echte Live-/Produktionsübernahme ohne separaten späteren Prozess.</p>
            </div>}
            {info("Was ist das Problem?", firstText(detailRow.problem, details.summary))}
            {info("Laienverständliche Kurzfassung", firstText(detailRow.plainLanguageSummary, details.summary))}
            {info("Was soll geändert/gebaut werden?", details.what)}
            {info("Warum ist das sinnvoll?", details.why)}
            {info("Vorteil für WellFit", details.wellFitBenefit)}
            {info("Finanziell/operativer Nutzen", firstText(detailRow.financialBenefit))}
            {info("Nutzen für User", details.userBenefit)}
            {info("Interner Economy Impact", details.economyImpact)}
            {info("Welche Risiken bleiben?", details.risk)}
            {info("Empfehlung", details.recommendationLabel)}
            {details.recommendationText && details.recommendationText !== details.recommendationLabel && info("Empfehlungstext", details.recommendationText)}
            {details.recommendationDebug && details.recommendationDebug !== details.recommendationLabel && details.recommendationDebug !== details.recommendationText && info("Technischer Empfehlungswert (Debug)", details.recommendationDebug)}
            {detailRow.supersededByReadableDecisionDossier === true && info("Legacy/alte Quelle", `Dieser technische Eintrag wurde durch ein lesbares Decision-Dossier ergaenzt: ${asText(detailRow.readableDossierInboxId) || "decisionDossiers"}`)}
            {fileList("Welche Nutzer-/Produktdaten werden geschützt?", asStringArray(detailRow.protectedData))}
            {fileList("Betroffene Bereiche", asStringArray(detailRow.affectedAreas))}
            {fileList("Betroffene/erlaubte Dateien", details.allowedFiles)}
            {fileList("Blockierte Dateien", details.blockedFiles)}
            {fileList("Required Checks", details.requiredChecks)}
            {info("Quelle", `${details.source || "—"}${detailRow.sourceDossierId ? ` · ${detailRow.sourceDossierId}` : ""}`)}
            {info("Nächster Schritt nach Zustimmung", details.nextStep)}
            {info("Safety-Grenzen", `noRuntimeChanges:${String(detailRow.noRuntimeChanges === true)} · noTokenPaymentBlockchain:${String(detailRow.noTokenPaymentBlockchain === true)} · noRunnerStarted:${String(detailRow.noRunnerStarted === true)} · noBranchOrPrOrMerge:${String(detailRow.noBranchOrPrOrMerge === true)} · noDeploy:${String(detailRow.noDeploy === true)}`)}
          </div>
        </div>
        );
      })()}
    </section>
  );
}
