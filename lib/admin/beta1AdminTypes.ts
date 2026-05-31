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
export type WorkerQueueReleaseInput = { workerQueueId?: string; targetId?: string; id?: string };
export type WorkerQueueRunnerPreviewInput = { workerQueueId?: string; targetId?: string; id?: string };
export type WorkerQueueRunnerStartApprovalInput = { workerQueueId?: string; targetId?: string; id?: string };
export type AgentWorkerQueueChecksInput = { workerQueueId: string; checks: Array<{ command: string; result: "pass" | "fail" | "blocked" | "skipped"; summary?: string; timestamp?: string }> };
export type AgentAutomationPolicyInput = { workerQueueId?: string; policyId?: string; environment?: "preview" | "staging" | "production"; reason?: string; secondApproval?: boolean };

export type AgentAutomationGetInput = { policyId: string };
export type AgentAutomationListInput = { status?: string };

export type AgentAutomationMode = "off" | "planning_only" | "supervised" | "runner_enabled" | "paused" | "repair_required" | "halted_waiting_owner";
export type AgentAutomationControl = { automationEnabled: boolean; automationMode: AgentAutomationMode; repairAttemptCount: number; maxRepairAttempts: number; ownerReviewRequired: boolean; lastMergeStatus?: string; lastPrRef?: string | null; lastFailureReason?: string | null; };
export type AgentMergeOutcome = { prRef?: string; mergeStatus: "merged" | "failed" | "conflict" | "checks_failed" | "blocked"; reason?: string; };
export type AgentRepairAttempt = { prRef?: string; result: "fixed" | "failed" | "blocked"; reason?: string; };


export type AgentExecutionMode = "manual_step_by_step" | "single_owner_decision";
export type AgentSingleDecisionStatus = "pending_single_decision" | "pending_single_decision_reapproval" | "single_decision_approved" | "single_decision_rejected" | "single_decision_revision_requested" | "single_decision_blocked" | "auto_progress_ready" | "auto_progress_in_progress" | "auto_progress_paused" | "auto_progress_failed" | "auto_progress_completed";
export type AgentExecutionContract = { executionContractVersion?: string; mode?: AgentExecutionMode; ownerDecisionRequiredOnce?: boolean; decisionCoversTaskProposal?: boolean; decisionCoversWorkerQueue?: boolean; decisionCoversRunnerJob?: boolean; decisionCoversPickupContract?: boolean; decisionCoversImplementationPlan?: boolean; decisionCoversFileWrites?: boolean; decisionCoversBranchCreation?: boolean; decisionCoversPrCreation?: boolean; decisionCoversMerge?: boolean; decisionCoversDeploy?: boolean; decisionCoversNative?: boolean; decisionCoversTokenPaymentBlockchain?: boolean };
export type AgentAllowedExecution = { fileWriteAllowed?: boolean; branchCreationAllowed?: boolean; prCreationAllowed?: boolean; mergeAllowed?: boolean; deployAllowed?: boolean; runnerStartAllowed?: boolean; automaticProgressAllowed?: boolean; requiresFurtherOwnerApproval?: boolean };
export type AgentForbiddenExecution = { nativeChangesAllowed?: boolean; tokenPaymentBlockchainAllowed?: boolean; secretsAllowedInDebug?: boolean; productionLiveSiteDeployAllowed?: boolean };
export type AgentExecutionEnvelope = { allowedFiles?: string[]; blockedFiles?: string[]; requiredChecks?: string[]; validationPlan?: string[]; rollbackPlan?: string[]; stopConditions?: string[]; maxRiskLevel?: string; targetEnvironment?: "test_main" | string; nextAutomaticSteps?: string[] };
export type AgentSingleDecisionExecutionFields = { mode?: AgentExecutionMode; singleDecisionStatus?: AgentSingleDecisionStatus | string; singleDecisionBlocker?: string; executionContractVersion?: string; executionContractMode?: AgentExecutionMode | string; executionContractHash?: string; stableContractFingerprint?: string; approvedExecutionContractVersion?: string; approvedExecutionContractHash?: string; approvalMode?: "single_owner_decision" | "manual_step_by_step" | string; approvalCoversAutomaticExecution?: boolean; requiresSingleDecisionReapproval?: boolean; reapprovalReason?: string; executionContract?: AgentExecutionContract; allowedExecution?: AgentAllowedExecution; forbiddenExecution?: AgentForbiddenExecution; executionEnvelope?: AgentExecutionEnvelope; validationPlan?: string[]; rollbackPlan?: string[]; stopConditions?: string[]; targetEnvironment?: "test_main" | string; nextAutomaticSteps?: string[] };

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
} & AgentSingleDecisionExecutionFields;

export type AgentTaskProposalStatus = "proposed" | "review_required" | "approved" | "rejected" | "executed" | "blocked" | "queued" | "queued_for_worker_review" | "running" | "completed" | "failed" | "repair_required" | string;
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
  workerQueueId?: string | null;
  lastWorkerQueueStatus?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastStatusChangedAt?: unknown;
} & AgentSingleDecisionExecutionFields;
export type AgentTaskProposalStatusCounts = { total: number; pending: number; approved: number; rejected: number; in_progress: number; completed: number; blocked: number };
export type AgentTaskProposalListResult = AdminCallableResult & { proposals?: AgentTaskProposal[]; items?: AgentTaskProposal[]; loadedCount?: number; statusCounts?: AgentTaskProposalStatusCounts };


export type AgentTaskWorkerQueueStatus = "pending_worker_review" | "queued_for_owner_review" | "queued_for_worker_review" | "ready_for_worker" | "previewed_for_runner" | "runner_start_approved" | "in_progress" | "completed" | "blocked" | "repair_required" | string;
export type AgentTaskWorkerQueueItem = {
  workerQueueId: string;
  taskProposalId?: string | null;
  pickupContractId?: string | null;
  title?: string;
  summary?: string;
  requestedAction?: string;
  sourceInboxId?: string | null;
  status?: AgentTaskWorkerQueueStatus;
  riskLevel?: string;
  allowedFiles?: string[];
  blockedFiles?: string[];
  requiredChecks?: string[];
  noRunnerStarted?: boolean;
  noBranchOrPrOrMerge?: boolean;
  noDeploy?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
} & AgentSingleDecisionExecutionFields;
export type AgentTaskWorkerQueueCounts = { total: number; waiting_review: number; waiting_owner: number; ready_for_worker: number; in_progress: number; completed: number; blocked: number; repair_required: number; unknown: number };
export type AgentTaskWorkerQueueListResult = AdminCallableResult & { items?: AgentTaskWorkerQueueItem[]; workerQueueItems?: AgentTaskWorkerQueueItem[]; loadedCount?: number; noRunnerStarted?: boolean; noBranchOrPrOrMerge?: boolean; noDeploy?: boolean };

export type ProductEvolutionFirstRunOutputSnapshot = Record<string, unknown>;
export type ApprovedInboxToTaskProposalInput = { inboxId: string; title?: string; reason?: string; suggestedBranch?: string };
export type TaskProposalWorkerQueueInput = { taskProposalId: string; workerStatus?: "queued_for_owner_review" | "pending_worker_review" };
export type TaskProposalWorkerQueueResult = AdminCallableResult & { taskProposalId?: string; proposalStatus?: string; workerQueueId?: string; workerStatus?: string; noRunnerStarted?: boolean; noBranchOrPrOrMerge?: boolean; noDeploy?: boolean };
export type WorkerQueueReleaseResult = AdminCallableResult & { workerQueueId?: string; status?: string; workerStatus?: string; ownerReleaseDecision?: string; noRunnerStarted?: boolean; noBranchOrPrOrMerge?: boolean; noDeploy?: boolean };
export type WorkerQueueRunnerPreview = {
  workerQueueId?: string | null;
  taskProposalId?: string | null;
  pickupContractId?: string | null;
  title?: string;
  requestedAction?: string;
  status?: string;
  riskLevel?: string;
  allowedFiles?: string[];
  blockedFiles?: string[];
  requiredChecks?: string[];
  plannedExecutionMode?: "preview_only";
  wouldCreateBranch?: boolean;
  wouldCreatePr?: boolean;
  wouldRunChecks?: boolean;
  wouldDeploy?: boolean;
  runnerStartAllowed?: boolean;
  nextRequiredOwnerAction?: "runner_start_approval_required";
  noRunnerStarted?: boolean;
  noBranchOrPrOrMerge?: boolean;
  noDeploy?: boolean;
  safetySummary?: string[];
};
export type WorkerQueueRunnerPreviewResult = AdminCallableResult & WorkerQueueRunnerPreview & { preview?: WorkerQueueRunnerPreview };


export type AgentRunnerJobStatus = "pending_runner_pickup" | "pickup_contract_created" | "implementation_plan_created" | "implementation_plan_review" | "implementation_plan_approved" | "runner_job_created" | "picked_up" | "planning" | "in_progress" | "completed" | "blocked" | "repair_required" | string;
export type AgentRunnerJob = {
  runnerJobId: string;
  workerQueueId?: string | null;
  taskProposalId?: string | null;
  pickupContractId?: string | null;
  title?: string;
  status?: AgentRunnerJobStatus;
  executionMode?: string;
  allowedFiles?: string[];
  blockedFiles?: string[];
  requiredChecks?: string[];
  riskLevel?: string;
  noRunnerStarted?: boolean;
  noBranchOrPrOrMerge?: boolean;
  noDeploy?: boolean;
  runnerStartAllowed?: boolean;
  requiresManualRunnerPickup?: boolean;
  createdAt?: unknown;
  ownerApprovedAt?: unknown;
  pickupContractCreatedAt?: unknown;
} & AgentSingleDecisionExecutionFields;
export type AgentRunnerJobCounts = { total: number; pending_runner_pickup: number; pickup_contract_created: number; planning: number; in_progress: number; completed: number; blocked: number; repair_required: number; unknown: number };
export type AgentRunnerJobListResult = AdminCallableResult & { items?: AgentRunnerJob[]; runnerJobs?: AgentRunnerJob[]; loadedCount?: number; noRunnerStarted?: boolean; noBranchOrPrOrMerge?: boolean; noDeploy?: boolean };

export type AgentRunnerPickupContract = {
  pickupContractId: string;
  runnerJobId?: string | null;
  workerQueueId?: string | null;
  taskProposalId?: string | null;
  title?: string;
  requestedAction?: string;
  allowedFiles?: string[];
  blockedFiles?: string[];
  requiredChecks?: string[];
  riskLevel?: string;
  status?: "pickup_contract_created" | "implementation_plan_created" | "implementation_plan_review" | "implementation_plan_approved" | "picked_up" | "planning" | "in_progress" | "completed" | "blocked" | "repair_required" | string;
  executionMode?: string;
  runnerStartAllowed?: boolean;
  requiresManualRunnerPickup?: boolean;
  noDeploy?: boolean;
  noMerge?: boolean;
  noAutoApproval?: boolean;
  branchCreationAllowed?: boolean;
  prCreationAllowed?: boolean;
  fileWriteAllowed?: boolean;
  nextStep?: string;
  createdAt?: string | null;
} & AgentSingleDecisionExecutionFields;
export type AgentRunnerPickupContractListResult = AdminCallableResult & { items?: AgentRunnerPickupContract[]; pickupContracts?: AgentRunnerPickupContract[]; loadedCount?: number; noDeploy?: boolean; noMerge?: boolean; runnerStartAllowed?: boolean; fileWriteAllowed?: boolean; branchCreationAllowed?: boolean; prCreationAllowed?: boolean };
export type ManualRunnerPickupContractInput = { runnerJobId?: string; id?: string; targetId?: string };
export type ManualRunnerPickupContractResult = AdminCallableResult & AgentRunnerPickupContract & { contract?: AgentRunnerPickupContract; message?: string };

export type AgentRunnerImplementationPlan = {
  implementationPlanId: string;
  pickupContractId?: string | null;
  runnerJobId?: string | null;
  workerQueueId?: string | null;
  taskProposalId?: string | null;
  title?: string;
  requestedAction?: string;
  status?: "implementation_plan_created" | "implementation_plan_review" | "implementation_plan_approved" | "planning" | "in_progress" | "completed" | "repair_required" | "blocked" | string;
  executionMode?: "manual_plan_only" | string;
  allowedFiles?: string[];
  blockedFiles?: string[];
  requiredChecks?: string[];
  riskLevel?: string;
  planSummary?: string;
  plannedSteps?: string[];
  expectedFilesToTouch?: string[];
  expectedOutputs?: string[];
  validationPlan?: string[];
  rollbackPlan?: string[];
  openQuestions?: string[];
  fileWriteAllowed?: boolean;
  branchCreationAllowed?: boolean;
  prCreationAllowed?: boolean;
  noDeploy?: boolean;
  noMerge?: boolean;
  requiresOwnerPlanApproval?: boolean;
  ownerPlanApprovedAt?: unknown;
  ownerPlanApprovalDecision?: string | null;
  nextStep?: string;
  createdAt?: unknown;
} & AgentSingleDecisionExecutionFields;
export type AgentRunnerImplementationPlanListResult = AdminCallableResult & { items?: AgentRunnerImplementationPlan[]; implementationPlans?: AgentRunnerImplementationPlan[]; loadedCount?: number; fileWriteAllowed?: boolean; branchCreationAllowed?: boolean; prCreationAllowed?: boolean; noDeploy?: boolean; noMerge?: boolean };
export type ManualRunnerImplementationPlanInput = { pickupContractId?: string; id?: string; targetId?: string };
export type ManualRunnerImplementationPlanResult = AdminCallableResult & AgentRunnerImplementationPlan & { plan?: AgentRunnerImplementationPlan; message?: string };
export type ManualRunnerImplementationPlanApprovalInput = { implementationPlanId?: string; id?: string; targetId?: string };
export type ManualRunnerImplementationPlanApprovalResult = AdminCallableResult & AgentRunnerImplementationPlan & { plan?: AgentRunnerImplementationPlan; message?: string };

export type WorkerQueueRunnerStartApprovalResult = AdminCallableResult & { runnerJobId?: string; workerQueueId?: string; taskProposalId?: string | null; status?: string; runnerJobStatus?: string; runnerStartApprovalDecision?: string; noRunnerStarted?: boolean; noBranchOrPrOrMerge?: boolean; noDeploy?: boolean; runnerStartAllowed?: boolean; requiresManualRunnerPickup?: boolean };

export type ApprovedInboxToTaskProposalResult = AdminCallableResult & { inboxId?: string; taskProposalId?: string; proposalStatus?: string; noRunnerStarted?: boolean; noBranchOrPrOrMerge?: boolean; noDeploy?: boolean };
export type ProductEvolutionInboxSyncInput = { registerSnapshot?: ProductEvolutionFirstRunOutputSnapshot | unknown; clientRequestShapeVersion?: string; clientHasRegisterSnapshot?: boolean; clientRegisterSnapshotKeys?: string[] };
export type ProductEvolutionRevisionDossierResult = AdminCallableResult & { scanned?: number; regenerated?: number; stillRevisionRequested?: number; sampleRegeneratedIds?: string[]; sampleRevisionBlocked?: Array<Record<string, unknown>>; sourceTrust?: string; noRunnerStarted?: boolean; noDeploy?: boolean; noMerge?: boolean };
export type ProductEvolutionInboxSyncResult = AdminCallableResult & { syncedCount?: number; idempotent?: boolean; created?: number; updated?: number; skipped?: number; skippedReasons?: Record<string, number>; sampleCreatedIds?: string[]; sampleSkipped?: Array<Record<string, unknown>>; serverSnapshotReceived?: boolean; serverSnapshotKeys?: string[]; serverCandidateCount?: number; serverCandidateCollections?: Array<{ listType: string; count: number; path?: string }>; callableName?: string; callableVersion?: string; responseShapeVersion?: string; serverTimestamp?: string; serverReceivedInputKeys?: string[]; hasRegisterSnapshot?: boolean; registerSnapshotType?: string; registerSnapshotKeys?: string[]; payloadUnwrappedFrom?: string; registerSnapshotFieldPresent?: boolean; registerSnapshotValueType?: string; clientHasRegisterSnapshot?: boolean; clientRegisterSnapshotKeys?: string[]; invalidInboxIdSanitized?: boolean; sourceDossierIdHadSlash?: boolean; contractUpgradeDetectedCount?: number; reapprovalRequiredCount?: number; sampleReapprovalRequiredIds?: string[]; currentExecutionContractHashPresent?: boolean; approvedExecutionContractHashPresent?: boolean; approvalCoversAutomaticExecution?: boolean };
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


export type AdminCenterDetailStatus = "missing"|"reference_only"|"structured"|"incomplete_single_decision_contract";
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
