import { getFunctions, httpsCallable } from "firebase/functions";
import { getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type {
  AdminAdjustXpInput,
  AdminCallableAuthState,
  AdminCallableResult,
  AdminCancelGlitchInput,
  AdminCreateCheckpointInput,
  AdminCreateMissionInput,
  AdminPublishMissionInput,
  AdminReviewSafetyReportInput,
  AdminScheduleGlitchInput,
  AdminUpdateMissionInput,
  AgentExecutionActionInput,
  AgentHandoffPromptCopiedInput,
  AgentHandoffPromptGenerateInput,
  AgentHandoffPromptGetInput,
  AgentPrHandoffInput,
  AgentWorkerQueueActionInput,
  AgentWorkerQueueChecksInput,
  AgentWorkerQueueCreateInput,
  AgentAutomationPolicyInput,
  AgentCenterDecisionInput,
  MissionCenterDecisionInput,
  AgentGithubCreatePullRequestInput,
  ApprovedInboxToTaskProposalInput,
  ProductEvolutionInboxSyncInput,
  TaskProposalWorkerQueueInput,
  WorkerQueueReleaseInput,
  WorkerQueueRunnerPreviewInput,
  WorkerQueueRunnerStartApprovalInput,
  ManualRunnerImplementationPlanInput,
  ManualRunnerImplementationPlanApprovalInput,
} from "./beta1AdminTypes";

function getAdminErrorCode(error: unknown): string {
  return typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code || "") : "";
}

function stringifyAdminErrorValue(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function getAdminErrorText(error: unknown): string {
  if (!(typeof error === "object" && error)) return "";
  const maybeError = error as { message?: unknown; details?: unknown };
  return [maybeError.message, maybeError.details].map(stringifyAdminErrorValue).join(" ");
}

function hasFirestoreIndexError(diagnostic: string): boolean {
  const lowerDiagnostic = diagnostic.toLowerCase();
  const hasFailedPrecondition = lowerDiagnostic.includes("failed_precondition") || lowerDiagnostic.includes("failed-precondition") || /(^|\D)9(\D|$)/.test(diagnostic);
  return lowerDiagnostic.includes("requires an index") || (hasFailedPrecondition && lowerDiagnostic.includes("index"));
}

function sanitizeAdminError(error: unknown, callableName?: string): string {
  const code = getAdminErrorCode(error);
  const text = getAdminErrorText(error);
  const diagnostic = `${code} ${text}`;
  const isWorkerRelease = callableName === "releaseWorkerQueueItemForWorker";
  if (hasFirestoreIndexError(diagnostic)) return "Firestore-Index fehlt. Bitte Index deployen oder in Firebase erstellen.";
  const isRunnerPreview = callableName === "previewRunnerPickupForWorkerQueueItem";
  const isRunnerStartApproval = callableName === "approveRunnerStartForWorkerQueueItem";
  if ((isWorkerRelease || isRunnerPreview || isRunnerStartApproval) && code.includes("invalid-argument")) return "Worker Queue ID fehlt.";
  if ((isWorkerRelease || isRunnerPreview || isRunnerStartApproval) && code.includes("not-found")) return "Worker Queue Eintrag nicht gefunden.";
  if (diagnostic.includes("automation_control_blocked")) return "Admin-Entscheidung ist durch Automation-Control blockiert.";
  if (diagnostic.includes("runnerJobId fehlt") || diagnostic.includes("runnerjobid fehlt")) return "Runner Job ID fehlt.";
  if (diagnostic.includes("Nur pending_runner_pickup darf einen Pickup-Contract erzeugen")) return "Nur pending_runner_pickup darf einen Pickup-Contract erzeugen.";
  if (diagnostic.includes("Sicherheitsflags verhindern Pickup-Contract")) return "Sicherheitsflags verhindern Pickup-Contract.";
  if (diagnostic.includes("runner_job_not_found")) return "Runner Job nicht gefunden.";
  if (diagnostic.includes("pickupContractId fehlt") || diagnostic.includes("pickupcontractid fehlt")) return "Pickup Contract ID fehlt.";
  if (diagnostic.includes("pickup_contract_not_found")) return "Pickup Contract nicht gefunden.";
  if (diagnostic.includes("Nur pickup_contract_created darf einen Implementierungsplan erzeugen")) return "Nur pickup_contract_created darf einen Implementierungsplan erzeugen.";
  if (diagnostic.includes("Sicherheitsflags verhindern Implementierungsplan")) return "Sicherheitsflags verhindern Implementierungsplan.";
  if (diagnostic.includes("Implementation Plan ID fehlt") || diagnostic.includes("implementationplanid fehlt")) return "Implementation Plan ID fehlt.";
  if (diagnostic.includes("implementation_plan_not_found")) return "Implementierungsplan nicht gefunden.";
  if (diagnostic.includes("Nur implementation_plan_created oder implementation_plan_review darf freigegeben werden")) return "Nur implementation_plan_created oder implementation_plan_review darf freigegeben werden.";
  if (diagnostic.includes("expectedFilesToTouch liegt außerhalb allowedFiles")) return "expectedFilesToTouch liegt außerhalb allowedFiles.";
  if (diagnostic.includes("expectedFilesToTouch trifft blockedFiles")) return "expectedFilesToTouch trifft blockedFiles.";
  if (diagnostic.includes("Sicherheitsflags verhindern Planfreigabe")) return "Sicherheitsflags verhindern Planfreigabe.";
  if (diagnostic.includes("workerQueueId fehlt") || diagnostic.includes("workerqueueid fehlt")) return "Worker Queue ID fehlt.";
  if (diagnostic.includes("worker_queue_item_not_found")) return "Worker Queue Eintrag nicht gefunden.";
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
  if (diagnostic.includes("inbox_not_approved") || diagnostic.includes("inbox_status_not_allowed")) return "Eintrag ist nicht approved.";
  if (diagnostic.includes("missing_approved_admin_decision")) return "Missing approved admin decision.";
  if (diagnostic.includes("incomplete_single_decision_contract")) return "Dossier unvollständig – die einmalige Entscheidung muss alle späteren Ausführungsschritte beschreiben.";
  if (diagnostic.includes("missing_decision_data")) return "Missing decision data.";
  if (diagnostic.includes("protected_scope_owner_required")) return "Protected scope owner required.";
  if (diagnostic.includes("center_inbox_not_decidable")) return "Eintrag ist nicht mehr entscheidbar.";
  if (diagnostic.includes("server_inbox_entry_not_found") || diagnostic.includes("inbox_not_found")) return "Server-Inbox-Eintrag nicht gefunden.";
  if (code.includes("not-found")) return "Eintrag nicht gefunden.";
  if (diagnostic.includes("inbox_mirror_missing") || diagnostic.includes("not_mirrored")) return "Eintrag ist noch nicht in der Inbox gespiegelt.";
  if (code.includes("permission-denied")) return "Keine Berechtigung für diese Admin-Aktion.";
  if (code.includes("unauthenticated")) return "Admin-Login erforderlich. Bitte neu anmelden oder Admin-Rolle prüfen.";
  if (code.includes("failed-precondition")) return "Eintrag konnte nicht entschieden werden. Bitte Status und Decision-Target prüfen.";
  return "Dieser Eintrag ist ein technischer Framework-Eintrag und nicht direkt freigabefähig.";
}
function sanitizeAdminResult(result: AdminCallableResult): AdminCallableResult { return result.accepted ? { ...result, message: undefined } : { ...result, accepted: false, message: result.message || "Eintrag konnte nicht entschieden werden. Bitte Inbox-Sync/Decision-Target prüfen." }; }

function buildAgentCenterDecisionPayload(input: AgentCenterDecisionInput): AgentCenterDecisionInput {
  return {
    ...input,
    targetType: "agent",
    targetId: input.targetId,
    inboxId: input.inboxId || input.targetId,
  };
}

let authHydrated = false;
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, () => {
    authHydrated = true;
  }, () => {
    authHydrated = true;
  });
}

export async function getAdminCallableAuthState(forceRefresh = false): Promise<AdminCallableAuthState> {
  const loadingMessage = "Admin-Authentifizierung wird geladen. Bitte kurz warten.";
  const loginMessage = "Admin-Login erforderlich. Bitte mit Firebase anmelden.";
  const roleMissingMessage = "Firebase Login vorhanden, aber Admin-Rolle fehlt oder wurde noch nicht geladen.";

  if (typeof window === "undefined") {
    return { authReady: false, firebaseUserPresent: false, firebaseUidPresent: false, idTokenAvailable: false, tokenClaimsLoaded: false, agentRoleClaim: null, adminCallableAuthReady: false, lastAuthGuardMessage: loadingMessage };
  }
  let user = null as typeof auth.currentUser;
  try {
    user = auth.currentUser;
  } catch {
    return { authReady: false, firebaseUserPresent: false, firebaseUidPresent: false, idTokenAvailable: false, tokenClaimsLoaded: false, agentRoleClaim: null, adminCallableAuthReady: false, lastAuthGuardMessage: loadingMessage };
  }
  if (!authHydrated && !user) {
    return { authReady: false, firebaseUserPresent: false, firebaseUidPresent: false, idTokenAvailable: false, tokenClaimsLoaded: false, agentRoleClaim: null, adminCallableAuthReady: false, lastAuthGuardMessage: loadingMessage };
  }
  if (!user) {
    return { authReady: true, firebaseUserPresent: false, firebaseUidPresent: false, idTokenAvailable: false, tokenClaimsLoaded: false, agentRoleClaim: null, adminCallableAuthReady: false, lastAuthGuardMessage: loginMessage };
  }
  try {
    const tokenResult = await getIdTokenResult(user, forceRefresh);
    const claims = tokenResult?.claims || {};
    const agentRole = typeof claims.agentRole === "string" ? claims.agentRole : null;
    const hasAdmin = Boolean(claims.admin === true || claims.isAdmin === true || agentRole);
    return {
      authReady: true,
      firebaseUserPresent: true,
      firebaseUidPresent: Boolean(user.uid),
      idTokenAvailable: Boolean(tokenResult?.token),
      tokenClaimsLoaded: true,
      agentRoleClaim: agentRole,
      adminCallableAuthReady: Boolean(tokenResult?.token) && hasAdmin,
      lastAuthGuardMessage: hasAdmin ? "" : roleMissingMessage,
    };
  } catch {
    return { authReady: true, firebaseUserPresent: true, firebaseUidPresent: Boolean(user.uid), idTokenAvailable: false, tokenClaimsLoaded: false, agentRoleClaim: null, adminCallableAuthReady: false, lastAuthGuardMessage: "Firebase Token/Claims werden noch geladen. Bitte kurz warten." };
  }
}

export async function assertAdminCallableAuthReady(): Promise<{ ok: true; state: AdminCallableAuthState } | { ok: false; state: AdminCallableAuthState; result: AdminCallableResult }> {
  const state = await getAdminCallableAuthState(true);
  if (state.adminCallableAuthReady) return { ok: true, state };
  const clientErrorCode = !state.authReady ? "client_auth_loading" : (!state.firebaseUserPresent ? "client_auth_missing" : "client_auth_not_ready");
  return { ok: false, state, result: { accepted: false, message: state.lastAuthGuardMessage || "Admin-Login erforderlich. Bitte mit Firebase anmelden.", clientErrorCode } };
}

async function callAdmin<TInput>(name: string, input: TInput): Promise<AdminCallableResult> {
  const authGuard = await assertAdminCallableAuthReady();
  if (!authGuard.ok) return authGuard.result;
  try { const callable = httpsCallable<TInput, AdminCallableResult>(getFunctions(), name); const result = await callable(input); return sanitizeAdminResult(result.data); } catch (error) { return { accepted: false, message: sanitizeAdminError(error, name), clientErrorCode: getAdminErrorCode(error) }; }
}
async function callAdminPreserveDiagnostics<TInput>(name: string, input: TInput): Promise<AdminCallableResult> {
  const authGuard = await assertAdminCallableAuthReady();
  if (!authGuard.ok) return { ...authGuard.result, callableName: name };
  try { const callable = httpsCallable<TInput, AdminCallableResult>(getFunctions(), name); const result = await callable(input); const data = (result.data || {}) as AdminCallableResult; return { ...data, accepted: Boolean(data.accepted), message: data.accepted ? undefined : (data.message || "Eintrag konnte nicht entschieden werden. Bitte Inbox-Sync/Decision-Target prüfen.") }; } catch (error) { const clientErrorCode = getAdminErrorCode(error); return { accepted: false, message: sanitizeAdminError(error, name), callableName: name, clientErrorCode }; }
}

// keep exported object
export const beta1AdminClient = {
  getAdminCallableAuthState,
  assertAdminCallableAuthReady,
  adminCreateMission: (input: AdminCreateMissionInput) => callAdmin("adminCreateMission", input),
  adminUpdateMission: (input: AdminUpdateMissionInput) => callAdmin("adminUpdateMission", input),
  adminPublishMission: (input: AdminPublishMissionInput) => callAdmin("adminPublishMission", input),
  adminCreateCheckpoint: (input: AdminCreateCheckpointInput) => callAdmin("adminCreateCheckpoint", input),
  adminScheduleGlitchEvent: (input: AdminScheduleGlitchInput) => callAdmin("adminScheduleGlitchEvent", input),
  cancelGlitchEvent: (input: AdminCancelGlitchInput) => callAdmin("cancelGlitchEvent", input),
  adminReviewSafetyReport: (input: AdminReviewSafetyReportInput) => callAdmin("adminReviewSafetyReport", { reportId: input.reportId, status: input.decision, reviewNote: input.reason }),
  adminAdjustXp: (input: AdminAdjustXpInput) => callAdmin("adminAdjustXp", input),
  prepareAgentTaskPrHandoff: (input: AgentPrHandoffInput) => callAdmin("prepareAgentTaskPrHandoff", { executionId: input.executionId, branchName: input.branchName, title: input.title, summary: input.summary }),
  markAgentTaskHandoffCreated: (input: AgentExecutionActionInput) => callAdmin("markAgentTaskHandoffCreated", { executionId: input.executionId }),
  blockAgentTaskExecution: (input: AgentExecutionActionInput) => callAdmin("blockAgentTaskExecution", { executionId: input.executionId, reason: input.reason }),
  listAgentTaskExecutions: (status?: string) => callAdmin("listAgentTaskExecutions", status ? { status } : {}),
  listAgentTaskProposals: (status?: string) => callAdmin("listAgentTaskProposals", status ? { status } : {}),
  createWorkerQueueItemFromTaskProposal: (input: TaskProposalWorkerQueueInput) => callAdmin("createWorkerQueueItemFromTaskProposal", input),
  listAgentTaskWorkerQueueItems: (status?: string) => callAdmin("listAgentTaskWorkerQueueItems", status ? { status } : {}),
  releaseWorkerQueueItemForWorker: (input: WorkerQueueReleaseInput) => callAdmin("releaseWorkerQueueItemForWorker", {
    workerQueueId: input.workerQueueId,
    targetId: input.targetId,
    id: input.id,
  }),
  previewRunnerPickupForWorkerQueueItem: (input: WorkerQueueRunnerPreviewInput) => callAdmin("previewRunnerPickupForWorkerQueueItem", {
    workerQueueId: input.workerQueueId,
    targetId: input.targetId,
    id: input.id,
  }),
  approveRunnerStartForWorkerQueueItem: (input: WorkerQueueRunnerStartApprovalInput) => callAdmin("approveRunnerStartForWorkerQueueItem", {
    workerQueueId: input.workerQueueId,
    targetId: input.targetId,
    id: input.id,
  }),
  listAgentRunnerJobs: (status?: string) => callAdmin("listAgentRunnerJobs", status ? { status } : {}),
  listAgentRunnerPickupContracts: (status?: string) => callAdmin("listAgentRunnerPickupContracts", status ? { status } : {}),
  createManualRunnerPickupContract: (input: { runnerJobId?: string; targetId?: string; id?: string }) => callAdmin("createManualRunnerPickupContract", {
    runnerJobId: input.runnerJobId,
    targetId: input.targetId,
    id: input.id,
  }),
  listAgentRunnerImplementationPlans: (status?: string) => callAdmin("listAgentRunnerImplementationPlans", status ? { status } : {}),
  createManualRunnerImplementationPlan: (input: ManualRunnerImplementationPlanInput) => callAdmin("createManualRunnerImplementationPlan", {
    pickupContractId: input.pickupContractId,
    targetId: input.targetId,
    id: input.id,
  }),
  approveManualRunnerImplementationPlan: (input: ManualRunnerImplementationPlanApprovalInput) => callAdmin("approveManualRunnerImplementationPlan", {
    implementationPlanId: input.implementationPlanId,
    targetId: input.targetId,
    id: input.id,
  }),
  generateAgentTaskCodexPrompt: (input: AgentHandoffPromptGenerateInput) => callAdmin("generateAgentTaskCodexPrompt", input),
  getAgentTaskCodexPrompt: (input: AgentHandoffPromptGetInput) => callAdmin("getAgentTaskCodexPrompt", input),
  markAgentTaskCodexPromptCopied: (input: AgentHandoffPromptCopiedInput) => callAdmin("markAgentTaskCodexPromptCopied", input),
  listAgentTaskHandoffPrompts: (executionId?: string) => callAdmin("listAgentTaskHandoffPrompts", executionId ? { executionId } : {}),
  createAgentWorkerQueueItem: (input: AgentWorkerQueueCreateInput) => callAdmin("createAgentWorkerQueueItem", input),
  claimAgentWorkerQueueItem: (input: AgentWorkerQueueActionInput) => callAdmin("claimAgentWorkerQueueItem", { workerQueueId: input.workerQueueId }),
  updateAgentWorkerQueueStatus: (input: AgentWorkerQueueActionInput) => callAdmin("updateAgentWorkerQueueStatus", { workerQueueId: input.workerQueueId, workerStatus: input.workerStatus }),
  recordAgentWorkerQueueChecks: (input: AgentWorkerQueueChecksInput) => callAdmin("recordAgentWorkerQueueChecks", input),
  markAgentWorkerPrPrepared: (input: AgentWorkerQueueActionInput) => callAdmin("markAgentWorkerPrPrepared", { workerQueueId: input.workerQueueId, prRef: input.prRef }),
  blockAgentWorkerQueueItem: (input: AgentWorkerQueueActionInput) => callAdmin("blockAgentWorkerQueueItem", { workerQueueId: input.workerQueueId, reason: input.reason }),
  listAgentWorkerQueueItems: (status?: string) => callAdmin("listAgentWorkerQueueItems", status ? { status } : {}),
  getAgentWorkerQueueItem: (workerQueueId: string) => callAdmin("getAgentWorkerQueueItem", { workerQueueId }),
  createAgentAutomationPolicy: (input: AgentAutomationPolicyInput) => callAdmin("createAgentAutomationPolicy", input),
  requestAgentAutoMerge: (input: AgentAutomationPolicyInput) => callAdmin("requestAgentAutoMerge", input),
  approveAgentAutoMerge: (input: AgentAutomationPolicyInput) => callAdmin("approveAgentAutoMerge", input),
  rejectAgentAutoMerge: (input: AgentAutomationPolicyInput) => callAdmin("rejectAgentAutoMerge", input),
  requestAgentDeploy: (input: AgentAutomationPolicyInput) => callAdmin("requestAgentDeploy", input),
  approveAgentDeploy: (input: AgentAutomationPolicyInput) => callAdmin("approveAgentDeploy", input),
  rejectAgentDeploy: (input: AgentAutomationPolicyInput) => callAdmin("rejectAgentDeploy", input),
  requestAgentQualityGateOverride: (input: AgentAutomationPolicyInput) => callAdmin("requestAgentQualityGateOverride", input),
  approveAgentQualityGateOverride: (input: AgentAutomationPolicyInput) => callAdmin("approveAgentQualityGateOverride", input),
  rejectAgentQualityGateOverride: (input: AgentAutomationPolicyInput) => callAdmin("rejectAgentQualityGateOverride", input),
  requestAgentProductionDeploySecondApproval: (input: AgentAutomationPolicyInput) => callAdmin("requestAgentProductionDeploySecondApproval", input),
  approveAgentProductionDeploySecondApproval: (input: AgentAutomationPolicyInput) => callAdmin("approveAgentProductionDeploySecondApproval", input),
  rejectAgentProductionDeploySecondApproval: (input: AgentAutomationPolicyInput) => callAdmin("rejectAgentProductionDeploySecondApproval", input),
  recordAgentAutomationExecutionMetadata: (input: AgentAutomationPolicyInput) => callAdmin("recordAgentAutomationExecutionMetadata", input),
  prepareAgentSupervisedRunnerJob: (input: AgentAutomationPolicyInput) => callAdmin("prepareAgentSupervisedRunnerJob", input),

  prepareAgentGithubRunnerJob: (input: AgentAutomationPolicyInput) => callAdmin("prepareAgentGithubRunnerJob", input),
  createAgentGithubBranch: (input: { jobId: string; githubBranchName: string; baseBranch?: string }) => callAdmin("createAgentGithubBranch", input),
  applyAgentGithubFileChanges: (input: { jobId: string; fileChanges: Array<{ path: string; content: string; changeType?: string; encoding?: string }>; commitMessage: string }) => callAdmin("applyAgentGithubFileChanges", input),
  createAgentGithubPullRequest: (input: AgentGithubCreatePullRequestInput) => callAdmin("createAgentGithubPullRequest", input),
  recordAgentGithubCheckStatus: (input: { jobId: string; allRequiredChecksPassed?: boolean; checkResultsSnapshot?: unknown[] }) => callAdmin("recordAgentGithubCheckStatus", input),
  refreshAgentGithubCheckStatus: (input: { jobId: string }) => callAdmin("refreshAgentGithubCheckStatus", input),
  approveAgentGithubAutoMerge: (input: { jobId: string }) => callAdmin("approveAgentGithubAutoMerge", input),
  executeAgentGithubAutoMergeMetadataOrReal: (input: { jobId: string }) => callAdmin("executeAgentGithubAutoMergeMetadataOrReal", input),
  blockAgentGithubRunnerJob: (input: { jobId: string; reason?: string }) => callAdmin("blockAgentGithubRunnerJob", input),
  listAgentGithubRunnerJobs: () => callAdmin("listAgentGithubRunnerJobs", {}),
  getAgentGithubRunnerJob: (jobId: string) => callAdmin("getAgentGithubRunnerJob", { jobId }),

  getAgentAutomationPolicy: (policyId: string) => callAdmin("getAgentAutomationPolicy", { policyId }),
  listAgentAutomationPolicies: (status?: string) => callAdmin("listAgentAutomationPolicies", status ? { status } : {}),
  getAgentAutomationControl: () => callAdmin("getAgentAutomationControl", {}),
  setAgentAutomationMode: (automationMode: string) => callAdmin("setAgentAutomationMode", { automationMode }),
  pauseAgentAutomation: () => callAdmin("pauseAgentAutomation", {}),
  resumeAgentAutomation: () => callAdmin("resumeAgentAutomation", {}),
  recordAgentAutomationMergeOutcome: (input: { prRef?: string; mergeStatus: string; reason?: string }) => callAdmin("recordAgentAutomationMergeOutcome", input),
  recordAgentAutomationRepairAttempt: (input: { prRef?: string; result: string; reason?: string }) => callAdmin("recordAgentAutomationRepairAttempt", input),
  resetAgentAutomationRepairCounter: () => callAdmin("resetAgentAutomationRepairCounter", {}),
  approveAgentAutomationContinueAfterHalt: () => callAdmin("approveAgentAutomationContinueAfterHalt", {}),

  approveAgentCenterProposal: (input: AgentCenterDecisionInput) => callAdmin("approveAgentCenterProposal", buildAgentCenterDecisionPayload(input)),
  rejectAgentCenterProposal: (input: AgentCenterDecisionInput) => callAdmin("rejectAgentCenterProposal", buildAgentCenterDecisionPayload(input)),
  requestRevisionAgentCenterProposal: (input: AgentCenterDecisionInput) => callAdmin("requestRevisionAgentCenterProposal", buildAgentCenterDecisionPayload(input)),
  blockAgentCenterProposal: (input: AgentCenterDecisionInput) => callAdmin("blockAgentCenterProposal", buildAgentCenterDecisionPayload(input)),
  markAgentCenterProposalForReview: (input: AgentCenterDecisionInput) => callAdmin("markAgentCenterProposalForReview", buildAgentCenterDecisionPayload(input)),
  approveMissionCenterProposal: (input: MissionCenterDecisionInput) => callAdmin("approveMissionCenterProposal", input),
  rejectMissionCenterProposal: (input: MissionCenterDecisionInput) => callAdmin("rejectMissionCenterProposal", input),
  requestRevisionMissionCenterProposal: (input: MissionCenterDecisionInput) => callAdmin("requestRevisionMissionCenterProposal", input),
  blockMissionCenterProposal: (input: MissionCenterDecisionInput) => callAdmin("blockMissionCenterProposal", input),
  markMissionCenterProposalForReview: (input: MissionCenterDecisionInput) => callAdmin("markMissionCenterProposalForReview", input),
  syncProductEvolutionFirstRunInbox: (input?: ProductEvolutionInboxSyncInput) => {
    const registerSnapshot = input?.registerSnapshot;
    const hasSnapshotObject = Boolean(registerSnapshot && typeof registerSnapshot === "object");
    return callAdminPreserveDiagnostics("syncProductEvolutionFirstRunInbox", {
      registerSnapshot,
      clientRequestShapeVersion: "agent-center-inbox-sync-client-v3",
      clientHasRegisterSnapshot: hasSnapshotObject,
      clientRegisterSnapshotKeys: hasSnapshotObject ? Object.keys(registerSnapshot as Record<string, unknown>) : [],
    });
  },

  regenerateProductEvolutionRevisionDossiers: (input?: ProductEvolutionInboxSyncInput) => {
    const registerSnapshot = input?.registerSnapshot;
    const hasSnapshotObject = Boolean(registerSnapshot && typeof registerSnapshot === "object");
    return callAdminPreserveDiagnostics("regenerateProductEvolutionRevisionDossiers", {
      registerSnapshot,
      clientRequestShapeVersion: "agent-center-revision-dossier-client-v1",
      clientHasRegisterSnapshot: hasSnapshotObject,
      clientRegisterSnapshotKeys: hasSnapshotObject ? Object.keys(registerSnapshot as Record<string, unknown>) : [],
    });
  },
  syncAgentCenterLocalRegistersInbox: () => callAdmin("syncAgentCenterLocalRegistersInbox", {}),
  listAgentCenterInboxItems: (filters?: { status?: string; sourceType?: string; recommendation?: string; listType?: string }) => callAdmin("listAgentCenterInboxItems", filters || {}),
  getAgentCenterInboxItem: (inboxId: string) => callAdmin("getAgentCenterInboxItem", { inboxId }),
  createAgentTaskProposalFromApprovedInboxItem: (input: ApprovedInboxToTaskProposalInput) => callAdmin("createAgentTaskProposalFromApprovedInboxItem", input),

};
