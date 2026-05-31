export type AdminCallableResult = {
  accepted: boolean;
  message?: string;
  status?: string;
  missionId?: string;
  checkpointId?: string;
  glitchEventId?: string;
  reportId?: string;
  wallet?: unknown;
  callableName?: string;
  clientErrorCode?: string;
};

export type AdminCreateMissionInput = { title: string; type?: string; rewardXp: number; childAllowed: boolean; reason?: string };
export type AdminUpdateMissionInput = { missionId: string; title?: string; type?: string; rewardXp?: number; childAllowed?: boolean; reason?: string };
export type AdminPublishMissionInput = { missionId: string };
export type AdminCreateCheckpointInput = { title: string; regionId: string; locationId?: string; childAllowed?: boolean };
export type AdminScheduleGlitchInput = { regionId: string; locationIds: string[]; windowStart: string; windowEnd: string; multiplierCap: number; maxParticipants: number; reason?: string };
export type AdminCancelGlitchInput = { glitchEventId: string; reason: string };
export type AdminReviewSafetyReportInput = { reportId: string; decision: string; reason: string };
export type AdminAdjustXpInput = { ownerUserId: string; delta: number; reason: string; idempotencyKey?: string };


export type AgentPrHandoffInput = { executionId: string; branchName: string; title: string; summary: string };
export type AgentExecutionActionInput = { executionId: string; reason?: string };
export type AgentHandoffPromptGenerateInput = { executionId: string; commitMessage?: string; prTitle?: string };
export type AgentHandoffPromptGetInput = { handoffPromptId: string };
export type AgentHandoffPromptCopiedInput = { handoffPromptId: string };
export type AgentWorkerQueueCreateInput = { executionId: string; handoffPromptId: string; workerMode?: "manual_codex" | "supervised_agent" | "automated_low_risk_planned" };
export type AgentWorkerQueueActionInput = { workerQueueId: string; reason?: string; prRef?: string; workerStatus?: string };
export type AgentWorkerQueueChecksInput = { workerQueueId: string; checks: Array<{ command: string; result: "pass" | "fail" | "blocked" | "skipped"; summary?: string; timestamp?: string }> };
export type AgentAutomationPolicyInput = { workerQueueId?: string; policyId?: string; environment?: "preview" | "staging" | "production"; reason?: string; secondApproval?: boolean };

export type AgentAutomationGetInput = { policyId: string };
export type AgentAutomationListInput = { status?: string };

export type AgentAutomationMode = "off" | "planning_only" | "supervised" | "runner_enabled" | "paused" | "repair_required" | "halted_waiting_owner";
export type AgentAutomationControl = { automationEnabled: boolean; automationMode: AgentAutomationMode; repairAttemptCount: number; maxRepairAttempts: number; ownerReviewRequired: boolean; lastMergeStatus?: string; lastPrRef?: string | null; lastFailureReason?: string | null; };
export type AgentMergeOutcome = { prRef?: string; mergeStatus: "merged" | "failed" | "conflict" | "checks_failed" | "blocked"; reason?: string; };
export type AgentRepairAttempt = { prRef?: string; result: "fixed" | "failed" | "blocked"; reason?: string; };

export type AgentGithubRunnerStatus = "metadata_only"|"missing_server_config"|"github_api_not_implemented"|"branch_created"|"files_committed"|"pr_created"|"pr_blocked_no_changes"|"checks_pending"|"checks_passed"|"checks_failed"|"auto_merged"|"blocked"|"failed";

export type AgentCenterInboxStatus = "pending_approval" | "approved" | "rejected" | "revision_requested" | "blocked" | "synced_to_task_proposal";
export type AgentCenterInboxItem = {
  inboxId: string;
  sourceType: string;
  listType: string;
  title?: string;
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
  readableDecisionDossierSourceDossierId?: string | null;
  readableDecisionDossierId?: string | null;
  readableDossierInboxId?: string | null;
  supersededByReadableDecisionDossier?: boolean;
  legacyProductEvolutionSource?: string | null;
  adminCenterSourcePriority?: number;
  sourceDossierId?: string;
  sourceRef?: string;
  sourcePath?: string;
  nextStep?: string;
  detailStatus?: AdminCenterDetailStatus;
  missingCriticalDecisionFields?: string[];
  dossierIncomplete?: boolean;
  riskLevel?: string;
  waitingForApprovalAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  blockedAt?: string;
  revisionRequestedAt?: string;
  allowedFiles?: string[];
  blockedFiles?: string[];
  requiredChecks?: string[];
  runnerEligibility?: string;
  canonicalTruthProtected?: boolean;
  beta1Allowed?: boolean;
  status: AgentCenterInboxStatus;
  mirrorTargetId?: string;
};

export type AgentTaskProposalStatus = "proposed" | "review_required" | "approved" | "rejected" | "executed" | "blocked" | "queued" | "running" | "completed" | "failed" | "repair_required" | string;
export type AgentTaskProposal = {
  taskProposalId: string;
  proposalId?: string;
  title?: string;
  summary?: string;
  requestedAction?: string;
  sourceInboxId?: string | null;
  sourceDossierId?: string | null;
  sourceType?: string | null;
  status?: AgentTaskProposalStatus;
  allowedFiles?: string[];
  blockedFiles?: string[];
  requiredChecks?: string[];
  riskLevel?: string;
  recommendation?: string;
  targetTrack?: string | null;
  suggestedBranch?: string | null;
  noRunnerStarted?: boolean;
  noBranchOrPrOrMerge?: boolean;
  noDeploy?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastStatusChangedAt?: unknown;
};
export type AgentTaskProposalStatusCounts = { total: number; pending: number; approved: number; rejected: number; in_progress: number; completed: number; blocked: number };
export type AgentTaskProposalListResult = AdminCallableResult & { proposals?: AgentTaskProposal[]; items?: AgentTaskProposal[]; loadedCount?: number; statusCounts?: AgentTaskProposalStatusCounts };

export type ProductEvolutionFirstRunOutputSnapshot = Record<string, unknown>;
export type ApprovedInboxToTaskProposalInput = { inboxId: string; title?: string; reason?: string; suggestedBranch?: string };
export type ApprovedInboxToTaskProposalResult = AdminCallableResult & { inboxId?: string; taskProposalId?: string; proposalStatus?: string; noRunnerStarted?: boolean; noBranchOrPrOrMerge?: boolean; noDeploy?: boolean };
export type ProductEvolutionInboxSyncInput = { registerSnapshot?: ProductEvolutionFirstRunOutputSnapshot | unknown; clientRequestShapeVersion?: string; clientHasRegisterSnapshot?: boolean; clientRegisterSnapshotKeys?: string[] };
export type ProductEvolutionRevisionDossierResult = AdminCallableResult & { scanned?: number; regenerated?: number; stillRevisionRequested?: number; sampleRegeneratedIds?: string[]; sampleRevisionBlocked?: Array<Record<string, unknown>>; sourceTrust?: string; noRunnerStarted?: boolean; noDeploy?: boolean; noMerge?: boolean };
export type ProductEvolutionInboxSyncResult = AdminCallableResult & { syncedCount?: number; idempotent?: boolean; created?: number; updated?: number; skipped?: number; skippedReasons?: Record<string, number>; sampleCreatedIds?: string[]; sampleSkipped?: Array<Record<string, unknown>>; serverSnapshotReceived?: boolean; serverSnapshotKeys?: string[]; serverCandidateCount?: number; serverCandidateCollections?: Array<{ listType: string; count: number; path?: string }>; callableName?: string; callableVersion?: string; responseShapeVersion?: string; serverTimestamp?: string; serverReceivedInputKeys?: string[]; hasRegisterSnapshot?: boolean; registerSnapshotType?: string; registerSnapshotKeys?: string[]; payloadUnwrappedFrom?: string; registerSnapshotFieldPresent?: boolean; registerSnapshotValueType?: string; clientHasRegisterSnapshot?: boolean; clientRegisterSnapshotKeys?: string[]; invalidInboxIdSanitized?: boolean; sourceDossierIdHadSlash?: boolean };
export type LocalRegisterInboxSyncResult = AdminCallableResult & { syncedCount?: number; idempotent?: boolean };
export type AgentGithubFileChange = { path: string; content: string; changeType: "create" | "update"; encoding?: string };
export type AgentGithubApplyFileChangesInput = { jobId: string; fileChanges: AgentGithubFileChange[]; commitMessage: string };
export type AgentGithubPrResult = { prNumber?: number; prUrl?: string; status: AgentGithubRunnerStatus };
export type AgentGithubCheckResult = { name: string; status: string; conclusion?: string };
export type AgentGithubRunnerJob = { jobId:string; workerQueueId:string; policyId:string; githubRunnerStatus:AgentGithubRunnerStatus; githubBranchName?:string; githubPrRef?:string|null; githubPrUrl?:string|null; githubCommitSha?:string|null; realGithubIntegration?:boolean; };
export type AgentGithubRunnerActionInput = { jobId: string; workerQueueId?: string; policyId?: string; githubBranchName?: string; reason?: string; };
export type AgentGithubCreatePullRequestInput = { jobId: string; title: string; body: string; baseBranch?: string; };
export type AgentGithubCheckStatusInput = { jobId: string; allRequiredChecksPassed?: boolean; checkResultsSnapshot?: Array<{requiredCheck?:string;matchedGithubCheckName?:string|null;normalizedState?:string;source?:string;notes?:string}>; };


export type AdminCenterListFilter = "agent_total"|"agent_pending"|"agent_approved"|"agent_rejected"|"agent_blocked"|"agent_in_progress"|"agent_completed"|"agent_repair_required"|"agent_halted_waiting_owner"|"agent_cycle_restart_required"|"mission_total"|"mission_pending"|"mission_approved"|"mission_rejected"|"mission_blocked"|"mission_in_progress"|"mission_completed";
export type AgentCenterDecisionInput = { targetType: "agent"; targetId: string; inboxId?: string; sourceRef?: string; reason?: string; riskLevel?: string; };
export type MissionCenterDecisionInput = { targetType: "mission"; targetId: string; sourceRef?: string; reason?: string; riskLevel?: string; };
export type AgentCenterDecision = { decisionId: string; decision: "approved"|"rejected"|"revise"|"blocked"|"review"; targetId: string; targetType: "agent"; };
export type MissionCenterDecision = { decisionId: string; decision: "approved"|"rejected"|"revise"|"blocked"|"review"; targetId: string; targetType: "mission"; };


export type AdminCenterDetailStatus = "missing"|"reference_only"|"structured";
export type AdminCenterDossierDetail = {
  title?: string;
  summary?: string;
  problem?: string;
  proposedChange?: string;
  whyNow?: string;
  wellFitBenefit?: string;
  userBenefit?: string;
  businessBenefit?: string;
  economyImpact?: string;
  risks?: string;
  mitigation?: string;
  recommendation?: string;
  recommendationLabel?: string;
  recommendationText?: string;
  suggestedTaskProposal?: string;
};


export type AdminCallableAuthState = {
  authReady: boolean;
  firebaseUserPresent: boolean;
  firebaseUidPresent: boolean;
  idTokenAvailable: boolean;
  tokenClaimsLoaded: boolean;
  agentRoleClaim: string | null;
  adminCallableAuthReady: boolean;
  lastAuthGuardMessage?: string;
};
