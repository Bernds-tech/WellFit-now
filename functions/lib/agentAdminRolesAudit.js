const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");
const { optionalString, requiredString } = require("./beta1Runtime");

const ALLOWED_TARGET_TRACKS = ["docs_register", "runtime_ui", "runtime_backend", "live_page", "evidence", "blocked"];
const PROPOSAL_STATUSES = ["proposed", "review_required", "pending", "pending_approval", "approved", "approved_ready", "approved_for_work", "rejected", "declined", "queued", "queued_for_worker_review", "queued_for_owner_review", "pending_worker_review", "ready_for_worker", "claimed", "running", "checks_recorded", "pr_prepared", "in_progress", "executed", "completed", "done", "blocked", "failed", "repair_required"];
const APPROVAL_STATUSES = ["approved", "rejected", "revoked"];
const EXECUTION_STATUSES = ["queued", "running", "completed", "failed", "blocked"];
const CHECK_RESULTS = ["pass", "fail", "blocked", "skipped"];
const HANDOFF_PROMPT_STATUSES = ["generated", "copied", "superseded", "blocked"];
const WORKER_QUEUE_STATUSES = ["queued_for_owner_review", "queued_for_worker_review", "pending_worker_review", "ready_for_worker", "previewed_for_runner", "runner_start_approved", "in_progress", "claimed", "running", "checks_recorded", "pr_prepared", "blocked", "failed", "completed", "repair_required"];
const RUNNER_JOB_STATUSES = ["pending_runner_pickup", "pickup_contract_created", "implementation_plan_created", "implementation_plan_review", "implementation_plan_approved", "runner_job_created", "picked_up", "planning", "in_progress", "completed", "blocked", "repair_required"];
const RUNNER_PICKUP_CONTRACT_STATUSES = ["pickup_contract_created", "implementation_plan_created", "implementation_plan_review", "implementation_plan_approved", "picked_up", "planning", "in_progress", "completed", "blocked", "repair_required"];
const RUNNER_IMPLEMENTATION_PLAN_STATUSES = ["implementation_plan_created", "implementation_plan_review", "implementation_plan_approved", "planning", "in_progress", "completed", "repair_required", "blocked"];
const WORKER_QUEUE_MODES = ["manual_codex", "supervised_agent", "automated_low_risk_planned"];
const BUILDER_WORK_PACKAGE_STATUSES = ["proposed", "approved_waiting", "active_metadata_only", "blocked_by_existing_active_work", "blocked_by_failed_checks", "blocked_by_stale_base", "repair_required", "completed_metadata_only", "cancelled", "paused_by_owner"];
const BUILDER_SERIAL_GROUP = "main_repo";
const BUILDER_MAX_REPAIR_ATTEMPTS = 3;
const CHECK_RESULT_VALUES = ["pass", "fail", "blocked", "skipped"];
const BLOCKED_PROTECTED_SCOPES = new Set(["token", "nft", "payment", "cashout", "blockchain", "sui", "wft", "child", "health", "location", "privacy", "legal"]);

const CANONICAL_TRUTH_PROTECTED_FILES = [
  "project-register/wellfit-beta1-canonical-truth.json",
  "docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md",
  "todolist/CODEX_CONTEXT_WELLFIT_BETA1.md",
];
const CANONICAL_TRUTH_PROPOSAL_FILE = "todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md";

const AGENT_CENTER_PIPELINE_RESET_BLOCKED_MESSAGE = "Reset blockiert: ungescopte Pipeline-Daten dürfen nicht gelöscht werden. Bitte Safe-Reset-Scope und bereinigte Archivierung freigeben.";
const AGENT_CENTER_PIPELINE_DELETE_COLLECTIONS = [
  "agentCenterInbox",
  "agentCenterDecisions",
  "agentTaskProposals",
  "agentTaskWorkerQueue",
  "agentRunnerJobs",
  "agentRunnerPickupContracts",
  "agentRunnerImplementationPlans",
  "agentControlledFileWritePackages",
  "agentRunnerImplementationPlanApprovals",
];
const AGENT_CENTER_PIPELINE_PROTECTED_COLLECTIONS = new Set([
  "agentSystemRegisters",
  "agentCatalogMirror",
  "approvedAgentBuildBacklogMirror",
  "agentCenterMissionProposals",
  "agentTaskApprovals",
  "agentTaskExecutions",
  "agentTaskHandoffPrompts",
  "agentTaskAuditLog",
  "agentTaskAutomationPolicies",
  "agentTaskSupervisedRunnerJobs",
  "agentAutomationControl",
  "missions",
  "users",
  "rewards",
]);


function buildAgentCenterPipelineResetSafetyDecision(input = {}) {
  const dryRun = input.dryRun !== false;
  const previewOnly = input.previewOnly !== false;
  const confirmResetText = optionalString(input.confirmResetText, 120);
  const requestedDestructiveDelete = Boolean(
    confirmResetText ||
    input.dryRun === false ||
    input.previewOnly === false ||
    input.deleteRequested === true
  );
  const safeScopeApproved = input.safeResetScopeApproved === true && typeof input.safeResetScopeId === "string" && input.safeResetScopeId.trim().startsWith("safe-reset-scope:");
  const sanitizedArchiveSnapshotsApproved = input.sanitizedArchiveSnapshotsApproved === true && input.archivePayloadSnapshotMode === "sanitized_full_payload_before_delete";
  const blockedReasons = [];

  if (requestedDestructiveDelete) blockedReasons.push("destructive_delete_requested");
  if (confirmResetText) blockedReasons.push("confirm_reset_text_is_not_safe_scope");
  if (!safeScopeApproved) blockedReasons.push("safe_reset_scope_missing_or_not_approved");
  if (!sanitizedArchiveSnapshotsApproved) blockedReasons.push("sanitized_payload_snapshots_not_approved");
  blockedReasons.push("pipeline_collections_are_unscoped_preview_only");

  return {
    accepted: !requestedDestructiveDelete,
    blocked: true,
    deletionBlocked: true,
    dryRun: true,
    previewOnly: true,
    deleteAllowed: false,
    requestedDestructiveDelete,
    safeScopeApproved,
    sanitizedArchiveSnapshotsApproved,
    blockedReasons: Array.from(new Set(blockedReasons)),
    skippedReasons: Array.from(new Set(blockedReasons)),
    safetyStatus: "blocked_unscoped_pipeline_delete",
    recommendedNextAction: "Safe-Reset-Scope definieren, ungescopte Collections ausschliessen und echte bereinigte Payload-Snapshots vor jedem Delete freigeben.",
    message: AGENT_CENTER_PIPELINE_RESET_BLOCKED_MESSAGE,
  };
}

function buildAgentCenterPipelineResetScope() {
  return AGENT_CENTER_PIPELINE_DELETE_COLLECTIONS.map((collectionName) => ({
    collectionName,
    action: "preview_collection_counts_only",
    reason: "unsafe_unscoped_delete_blocked_until_safe_reset_scope_exists",
  }));
}

async function previewAgentCenterPipelineCollection(db, collectionName) {
  const countSnapshot = await db.collection(collectionName).count().get();
  const count = Number((countSnapshot.data() || {}).count || 0);
  return {
    collectionName,
    count,
    sampleIds: [],
  };
}

const INBOX_STATUSES = ["pending_approval", "approved", "rejected", "revision_requested", "blocked", "synced_to_task_proposal"];
const INBOX_DECISION_PRESERVED_STATUSES = new Set(["approved", "rejected", "blocked", "revision_requested", "synced_to_task_proposal"]);
const INBOX_SOURCE_TYPES = ["product_evolution_first_run", "opportunity_dossier", "mission_story", "research_summary", "product_radar", "legacy_catalog", "backlog", "proposal"];
const INBOX_LIST_TYPES = ["generatedDossiers", "decisionDossiers", "suggestedTaskQueue", "recommendedApprovals", "recommendedResearchMore", "blockedItems", "missionStoryProposals", "productOpportunityProposals"];

function getAgentTaskProposalStatusBucket(statusValue) {
  const status = String(statusValue || "").toLowerCase();
  if (["proposed", "review_required", "pending", "pending_approval", "draft"].includes(status)) return "pending";
  if (["approved", "approved_ready", "approved_for_work"].includes(status)) return "approved";
  if (["rejected", "declined"].includes(status)) return "rejected";
  if (["queued", "queued_for_worker_review", "queued_for_owner_review", "pending_worker_review", "ready_for_worker", "claimed", "running", "checks_recorded", "pr_prepared", "in_progress"].includes(status)) return "in_progress";
  if (["completed", "done", "executed"].includes(status)) return "completed";
  if (["blocked", "failed", "repair_required"].includes(status)) return "blocked";
  return "pending";
}


function getStatusCountsByBucket(items, bucketFn, buckets) {
  const counts = { total: 0 };
  for (const bucket of buckets) counts[bucket] = 0;
  counts.unknown = 0;
  for (const item of Array.isArray(items) ? items : []) {
    counts.total += 1;
    const bucket = bucketFn(item) || "unknown";
    if (Object.prototype.hasOwnProperty.call(counts, bucket)) counts[bucket] += 1;
    else counts.unknown += 1;
  }
  return counts;
}

function getWorkerQueueStatusBucket(statusValue) {
  const status = String(statusValue || "").toLowerCase();
  if (["pending_worker_review", "queued_for_worker_review"].includes(status)) return "waiting_review";
  if (status === "queued_for_owner_review") return "waiting_owner";
  if (["ready_for_worker", "previewed_for_runner", "runner_start_approved"].includes(status)) return "ready_for_worker";
  if (["in_progress", "claimed", "running", "checks_recorded", "pr_prepared"].includes(status)) return "in_progress";
  if (status === "completed") return "completed";
  if (["blocked", "failed"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  return "unknown";
}

function getRunnerJobStatusBucket(statusValue) {
  const status = String(statusValue || "").toLowerCase();
  if (status === "pending_runner_pickup") return "pending_runner_pickup";
  if (status === "pickup_contract_created") return "pickup_contract_created";
  if (status === "implementation_plan_created") return "implementation_plan_created";
  if (["implementation_plan_review", "implementation_plan_approved", "picked_up", "planning"].includes(status)) return "planning";
  if (status === "in_progress") return "in_progress";
  if (status === "completed") return "completed";
  if (["blocked", "failed"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  return "unknown";
}

function getPickupContractStatusBucket(statusValue) {
  const status = String(statusValue || "").toLowerCase();
  if (status === "pickup_contract_created") return "planning_open";
  if (status === "implementation_plan_created") return "implementation_plan_created";
  if (status === "implementation_plan_review") return "implementation_plan_review";
  if (status === "implementation_plan_approved") return "implementation_plan_approved";
  if (["picked_up", "planning", "in_progress"].includes(status)) return "planning";
  if (status === "completed") return "completed";
  if (["blocked", "failed"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  return "unknown";
}

function getImplementationPlanStatusBucket(statusValue) {
  const status = String(statusValue || "").toLowerCase();
  if (status === "implementation_plan_created") return "created";
  if (status === "implementation_plan_review") return "review";
  if (status === "implementation_plan_approved") return "approved";
  if (["planning", "in_progress"].includes(status)) return "planning";
  if (status === "completed") return "completed";
  if (["blocked", "failed"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  return "unknown";
}

function getBuilderWorkPackageStatusBucket(statusValue) {
  const status = String(statusValue || "").toLowerCase();
  if (status === "active_metadata_only") return "active";
  if (status === "approved_waiting") return "waiting";
  if (["proposed"].includes(status)) return "proposed";
  if (["blocked_by_existing_active_work", "blocked_by_failed_checks", "blocked_by_stale_base"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  if (status === "completed_metadata_only") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "paused_by_owner") return "paused";
  return "unknown";
}

function sanitizeTelemetryText(value, maxLength = 320) {
  if (value === undefined || value === null) return null;
  const text = String(value).replace(/[\r\n\t]+/g, " ").trim();
  if (!text) return null;
  return text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, "[redacted-email]").slice(0, maxLength);
}

function sanitizeTelemetryList(value, maxItems = 20, maxLength = 180) {
  return parseStringList(value || [], maxItems, maxLength).map((entry) => sanitizeTelemetryText(entry, maxLength)).filter(Boolean);
}

function sanitizeTelemetryObject(value, depth = 0) {
  if (value === undefined || value === null) return value;
  if (typeof value === "string") return sanitizeTelemetryText(value, 500);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.slice(0, 10).map((entry) => sanitizeTelemetryObject(entry, depth + 1));
  if (typeof value !== "object") return sanitizeTelemetryText(value, 160);
  if (depth >= 2) return "[truncated]";
  const denied = /(email|mail|token|secret|auth|session|uid|userId|ownerUid|payload|health|child|location|camera|gps|lat|lng|longitude|latitude)/i;
  const safe = {};
  for (const [key, nested] of Object.entries(value).slice(0, 40)) {
    if (denied.test(key)) {
      safe[key] = "[redacted]";
    } else {
      safe[key] = sanitizeTelemetryObject(nested, depth + 1);
    }
  }
  return safe;
}

function buildDefaultAutopilotControl() {
  return {
    enabled: false,
    mode: "planning_only",
    maxConcurrentWorkPackages: 1,
    stopOnFailedCheck: true,
    stopOnMergeConflict: true,
    maxRepairAttempts: BUILDER_MAX_REPAIR_ATTEMPTS,
    paused: false,
    pauseReason: "metadata_only_default_no_real_github_automation",
    lastOwnerDecisionAt: null,
    nextRecommendedAction: "Owner kann freigegebene Dossiers in serialisierte metadata-only Bauauftraege ueberfuehren. Keine GitHub-/Runner-/Deploy-Automation aktiv.",
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
    noTokenPaymentBlockchain: true,
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function getAutopilotControl(db) {
  const ref = db.collection("agentAutomationControl").doc("autopilot");
  const snap = await ref.get();
  if (!snap.exists) {
    const defaults = buildDefaultAutopilotControl();
    await ref.set(defaults, { merge: true });
    return { ref, data: { ...defaults, updatedAt: null } };
  }
  return { ref, data: { ...buildDefaultAutopilotControl(), ...(snap.data() || {}) } };
}

function sanitizeAutopilotControl(control) {
  const data = control && typeof control === "object" ? control : {};
  const mode = ["off", "proposal_only", "planning_only", "builder_metadata_only"].includes(String(data.mode || "")) ? String(data.mode) : "planning_only";
  return {
    enabled: data.enabled === true,
    mode,
    maxConcurrentWorkPackages: 1,
    stopOnFailedCheck: data.stopOnFailedCheck !== false,
    stopOnMergeConflict: data.stopOnMergeConflict !== false,
    maxRepairAttempts: BUILDER_MAX_REPAIR_ATTEMPTS,
    paused: data.paused === true,
    pauseReason: sanitizeTelemetryText(data.pauseReason, 240),
    lastOwnerDecisionAt: sanitizeTelemetryObject(data.lastOwnerDecisionAt),
    nextRecommendedAction: sanitizeTelemetryText(data.nextRecommendedAction, 400) || "Freigegebene Dossiers prüfen und bei Bedarf metadata-only Bauauftrag vorbereiten.",
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
    noTokenPaymentBlockchain: true,
  };
}

function mapSafeAgentCenterDossierDoc(doc) {
  const data = doc.data ? (doc.data() || {}) : (doc || {});
  return {
    id: sanitizeTelemetryText(data.inboxId || data.id || data.sourceDossierId || (doc.id || ""), 180),
    inboxId: sanitizeTelemetryText(data.inboxId || doc.id, 180),
    sourceDossierId: sanitizeTelemetryText(data.sourceDossierId, 180),
    sourceDossierType: sanitizeTelemetryText(data.sourceType || data.listType || data.type, 120),
    title: sanitizeTelemetryText(data.title, 220),
    shortSummary: sanitizeTelemetryText(data.shortSummary || data.summary || data.plainSummary || data.whatWillChange, 500),
    status: sanitizeTelemetryText(data.status, 80),
    priority: sanitizeTelemetryText(data.priority, 40),
    riskLevel: sanitizeTelemetryText(data.riskLevel, 80),
    allowedFiles: sanitizeTelemetryList(data.allowedFiles || data.allowedWriteScopes || [], 30, 260),
    blockedFiles: sanitizeTelemetryList(data.blockedFiles || data.blockedWriteScopes || [], 30, 260),
    requiredChecks: sanitizeTelemetryList(data.requiredChecks || [], 30, 260),
    recommendedNextAction: sanitizeTelemetryText(data.recommendation || data.nextStep || data.nextPipelineStep, 400),
  };
}

function mapSafeBuilderWorkPackageDoc(doc) {
  const data = doc.data ? (doc.data() || {}) : (doc || {});
  return {
    workPackageId: sanitizeTelemetryText(data.workPackageId || doc.id, 180),
    sourceDossierId: sanitizeTelemetryText(data.sourceDossierId, 180),
    sourceDossierType: sanitizeTelemetryText(data.sourceDossierType, 120),
    title: sanitizeTelemetryText(data.title, 220),
    shortSummary: sanitizeTelemetryText(data.shortSummary, 500),
    ownerApproved: data.ownerApproved === true,
    ownerApprovedAt: sanitizeTelemetryObject(data.ownerApprovedAt),
    ownerApprovedByRole: sanitizeTelemetryText(data.ownerApprovedByRole, 80),
    priority: sanitizeTelemetryText(data.priority, 40),
    sequenceNumber: Number(data.sequenceNumber || 0),
    status: sanitizeTelemetryText(data.status, 80),
    serialGroup: sanitizeTelemetryText(data.serialGroup, 80) || BUILDER_SERIAL_GROUP,
    baseBranch: sanitizeTelemetryText(data.baseBranch, 80) || "main",
    baseSha: sanitizeTelemetryText(data.baseSha, 120),
    allowedFiles: sanitizeTelemetryList(data.allowedFiles || [], 40, 260),
    blockedFiles: sanitizeTelemetryList(data.blockedFiles || [], 40, 260),
    requiredChecks: sanitizeTelemetryList(data.requiredChecks || [], 40, 260),
    maxRepairAttempts: BUILDER_MAX_REPAIR_ATTEMPTS,
    repairAttemptCount: Number(data.repairAttemptCount || 0),
    noParallelExecution: true,
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
    noTokenPaymentBlockchain: true,
    automationPaused: data.automationPaused === true,
    recommendedNextAction: sanitizeTelemetryText(data.recommendedNextAction, 400),
  };
}

function buildBuilderQueueGuardState(packages, autopilotControl) {
  const safePackages = Array.isArray(packages) ? packages : [];
  const active = safePackages.filter((wp) => String(wp.status || "") === "active_metadata_only");
  const blocking = safePackages.filter((wp) => ["blocked_by_existing_active_work", "blocked_by_failed_checks", "blocked_by_stale_base", "repair_required", "paused_by_owner"].includes(String(wp.status || "")));
  const repairLimitHit = safePackages.some((wp) => Number(wp.repairAttemptCount || 0) >= BUILDER_MAX_REPAIR_ATTEMPTS || String(wp.status || "") === "repair_required");
  const failedOrBlocking = blocking.length > 0 || safePackages.some((wp) => ["blocked", "failed"].includes(String(wp.status || "")));
  const paused = Boolean(autopilotControl && autopilotControl.paused) || repairLimitHit || failedOrBlocking;
  const reason = repairLimitHit ? "repair_limit_reached" : (failedOrBlocking ? "open_blocker" : (active.length > 1 ? "more_than_one_active_work_package" : (autopilotControl && autopilotControl.pauseReason) || null));
  return {
    serialGroup: BUILDER_SERIAL_GROUP,
    maxConcurrentWorkPackages: 1,
    activeCount: active.length,
    hasActiveWorkPackage: active.length > 0,
    queuePaused: paused,
    pauseReason: sanitizeTelemetryText(reason, 240),
    automationPaused: paused,
    lastKnownBlocker: blocking[0] ? sanitizeTelemetryText(`${blocking[0].workPackageId || "work_package"}:${blocking[0].status || "blocked"}`, 260) : null,
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
    noTokenPaymentBlockchain: true,
  };
}

function buildBuilderWorkPackageFromDossier({ dossier, dossierId, actorRole, sequenceNumber, baseSha }) {
  const source = dossier && typeof dossier === "object" ? dossier : {};
  const allowedFiles = sanitizeTelemetryList(source.allowedFiles || source.allowedWriteScopes || source.affectedFiles || [], 80, 260);
  const blockedFiles = sanitizeTelemetryList(source.blockedFiles || source.blockedWriteScopes || source.forbiddenFiles || [], 80, 260);
  const requiredChecks = sanitizeTelemetryList(source.requiredChecks || source.checks || source.validationCommands || [], 80, 260);
  return {
    sourceDossierId: sanitizeTelemetryText(source.sourceDossierId || dossierId, 180) || dossierId,
    sourceDossierType: sanitizeTelemetryText(source.sourceType || source.listType || source.type || "agent_center_inbox", 120) || "agent_center_inbox",
    title: sanitizeTelemetryText(source.title, 220) || `Bauauftrag ${dossierId}`,
    shortSummary: sanitizeTelemetryText(source.shortSummary || source.summary || source.plainSummary || source.whatWillChange || source.recommendation, 800) || "Owner-freigegebenes Dossier als metadata-only Bauauftrag vorbereitet.",
    ownerApproved: true,
    ownerApprovedAt: source.approvedAt || null,
    ownerApprovedByRole: sanitizeTelemetryText(source.approvedByRole || actorRole, 80) || actorRole,
    priority: sanitizeTelemetryText(source.priority, 40) || "P2",
    sequenceNumber,
    status: "approved_waiting",
    serialGroup: BUILDER_SERIAL_GROUP,
    baseBranch: "main",
    baseSha: sanitizeTelemetryText(baseSha || source.baseSha, 120),
    allowedFiles,
    blockedFiles,
    requiredChecks,
    maxRepairAttempts: BUILDER_MAX_REPAIR_ATTEMPTS,
    repairAttemptCount: 0,
    noParallelExecution: true,
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
    noTokenPaymentBlockchain: true,
    recommendedNextAction: "Warten, bis alle vorherigen Work Packages abgeschlossen und Checks gruen sind. Keine GitHub-/Runner-/Deploy-Aktion starten.",
  };
}

function buildAgentTaskProposalStatusCounts(proposals) {
  const statusCounts = { total: 0, pending: 0, approved: 0, rejected: 0, in_progress: 0, completed: 0, blocked: 0 };
  for (const proposal of Array.isArray(proposals) ? proposals : []) {
    statusCounts.total += 1;
    const bucket = getAgentTaskProposalStatusBucket(proposal && proposal.status);
    if (Object.prototype.hasOwnProperty.call(statusCounts, bucket)) statusCounts[bucket] += 1;
  }
  return statusCounts;
}



const SINGLE_DECISION_BLOCKER_MESSAGE = "Dossier unvollständig – die einmalige Entscheidung muss alle späteren Ausführungsschritte beschreiben.";
const SINGLE_DECISION_DETAIL_STATUS = "incomplete_single_decision_contract";
const EXECUTION_MODES = ["manual_step_by_step", "single_owner_decision"];
const SINGLE_DECISION_STATUSES = ["pending_single_decision", "pending_single_decision_reapproval", "single_decision_approved", "single_decision_rejected", "single_decision_revision_requested", "single_decision_blocked", "auto_progress_ready", "auto_progress_in_progress", "auto_progress_paused", "auto_progress_failed", "auto_progress_completed"];
const SINGLE_DECISION_REAPPROVAL_REASON = "Dieser Vorschlag wurde früher mit einem alten, engen Vertrag freigegeben. Für automatische Ausführung ist eine neue einmalige Entscheidung auf Basis des vollständigen Ausführungsvertrags nötig.";
const AUTO_PROGRESS_CONTRACT_BLOCKED_MESSAGE = "Automatische Ausführung blockiert: Der aktuelle Ausführungsvertrag wurde noch nicht einmalig freigegeben.";
const CONTRACT_FINGERPRINT_FIELDS = ["executionContract", "allowedExecution", "forbiddenExecution", "executionEnvelope", "allowedFiles", "blockedFiles", "requiredChecks", "validationPlan", "rollbackPlan", "stopConditions", "targetEnvironment", "nextAutomaticSteps"];
const SINGLE_DECISION_REQUIRED_ALLOWED_FILES = ["docs/**", "todolist/**", "project-register/**", "app/**", "functions/**", "firestore.rules", ".github/**"];
const SINGLE_DECISION_REQUIRED_BLOCKED_FILES = ["native/**"];
const SINGLE_DECISION_REQUIRED_STOP_CONDITIONS = [
  "file_outside_allowedFiles_required",
  "blockedFiles_required",
  "native_required",
  "token_payment_blockchain_required",
  "secrets_or_identity_in_debug",
  "required_checks_failed",
  "merge_conflict",
  "deploy_failed",
  "dossier_data_missing",
  "target_environment_not_test_main",
  "production_live_site_impacted"
];
const SINGLE_DECISION_REQUIRED_NEXT_STEPS = ["task_proposal", "worker_queue", "runner_job", "pickup_contract", "implementation_plan", "file_write_branch_pr_merge_deploy_if_allowed"];

function hasOwn(obj, key) {
  return Boolean(obj && typeof obj === "object" && Object.prototype.hasOwnProperty.call(obj, key));
}

function readNested(obj, path) {
  let cur = obj;
  for (const part of path.split(".")) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

function requireBoolean(obj, path, expected, missing) {
  const value = readNested(obj, path);
  if (value !== expected) missing.push(path);
}

function requireNonEmptyTextValue(value, field, missing) {
  if (!sanitizeInboxText(value, 2000)) missing.push(field);
}

function requireNonEmptyText(obj, paths, field, missing) {
  const value = paths.map((path) => readNested(obj, path)).find((candidate) => sanitizeInboxText(candidate, 2000));
  if (!sanitizeInboxText(value, 2000)) missing.push(field);
}

function requireListContainsAll(list, required, field, missing) {
  const actual = parseStringList(list || [], 120, 260).map((entry) => String(entry || "").trim());
  for (const requiredEntry of required) {
    if (!actual.includes(requiredEntry)) missing.push(`${field}:${requiredEntry}`);
  }
  if (!actual.length) missing.push(field);
}

function requireNonEmptyList(list, field, missing) {
  if (!parseStringList(list || [], 120, 1000).length) missing.push(field);
}

function validateSingleDecisionExecutionContract(dossier) {
  const source = dossier && typeof dossier === "object" ? dossier : {};
  const executionContract = source.executionContract && typeof source.executionContract === "object" ? source.executionContract : null;
  const allowedExecution = source.allowedExecution && typeof source.allowedExecution === "object" ? source.allowedExecution : null;
  const forbiddenExecution = source.forbiddenExecution && typeof source.forbiddenExecution === "object" ? source.forbiddenExecution : null;
  const executionEnvelope = source.executionEnvelope && typeof source.executionEnvelope === "object" ? source.executionEnvelope : null;
  const missing = [];

  for (const [field, paths] of Object.entries({
    title: ["title"],
    summary: ["summary", "plainSummary"],
    what: ["what", "whatWillChange", "proposedChange"],
    why: ["why", "whySuggested", "whyNow"],
    wellfitBenefit: ["wellFitBenefit", "wellfitBenefit"],
    userBenefit: ["userBenefit"],
    economyImpact: ["economyImpact"],
    risk: ["risk", "riskSummary", "risks"],
    recommendation: ["recommendation", "recommendationText", "recommendationLabel"],
  })) requireNonEmptyText(source, paths, field, missing);

  if (!executionContract) missing.push("executionContract");
  if (!allowedExecution) missing.push("allowedExecution");
  if (!forbiddenExecution) missing.push("forbiddenExecution");
  if (!executionEnvelope) missing.push("executionEnvelope");
  const nextAutomaticSteps = parseStringList(source.nextAutomaticSteps || (executionEnvelope && executionEnvelope.nextAutomaticSteps) || [], 80, 1000);
  requireNonEmptyList(nextAutomaticSteps, "nextAutomaticSteps", missing);
  for (const nextStep of SINGLE_DECISION_REQUIRED_NEXT_STEPS) {
    if (!nextAutomaticSteps.includes(nextStep)) missing.push(`nextAutomaticSteps:${nextStep}`);
  }

  if (executionContract) {
    requireNonEmptyTextValue(executionContract.executionContractVersion, "executionContract.executionContractVersion", missing);
    if (executionContract.mode !== "single_owner_decision") missing.push("executionContract.mode");
    for (const field of ["ownerDecisionRequiredOnce", "decisionCoversTaskProposal", "decisionCoversWorkerQueue", "decisionCoversRunnerJob", "decisionCoversPickupContract", "decisionCoversImplementationPlan", "decisionCoversFileWrites", "decisionCoversBranchCreation", "decisionCoversPrCreation", "decisionCoversMerge", "decisionCoversDeploy"]) requireBoolean(executionContract, field, true, missing);
    requireBoolean(executionContract, "decisionCoversNative", false, missing);
    requireBoolean(executionContract, "decisionCoversTokenPaymentBlockchain", false, missing);
  }
  if (allowedExecution) {
    for (const field of ["fileWriteAllowed", "branchCreationAllowed", "prCreationAllowed", "mergeAllowed", "deployAllowed", "runnerStartAllowed", "automaticProgressAllowed"]) requireBoolean(allowedExecution, field, true, missing);
    requireBoolean(allowedExecution, "requiresFurtherOwnerApproval", false, missing);
  }
  if (forbiddenExecution) {
    requireBoolean(forbiddenExecution, "nativeChangesAllowed", false, missing);
    requireBoolean(forbiddenExecution, "tokenPaymentBlockchainAllowed", false, missing);
    requireBoolean(forbiddenExecution, "secretsAllowedInDebug", false, missing);
    if (hasOwn(forbiddenExecution, "productionLiveSiteDeployAllowed")) requireBoolean(forbiddenExecution, "productionLiveSiteDeployAllowed", false, missing);
    else missing.push("forbiddenExecution.productionLiveSiteDeployAllowed");
  }
  if (executionEnvelope) {
    requireListContainsAll(executionEnvelope.allowedFiles || source.allowedFiles, SINGLE_DECISION_REQUIRED_ALLOWED_FILES, "executionEnvelope.allowedFiles", missing);
    requireListContainsAll(executionEnvelope.blockedFiles || source.blockedFiles, SINGLE_DECISION_REQUIRED_BLOCKED_FILES, "executionEnvelope.blockedFiles", missing);
    requireNonEmptyList(executionEnvelope.requiredChecks || source.requiredChecks, "executionEnvelope.requiredChecks", missing);
    requireNonEmptyList(executionEnvelope.validationPlan, "executionEnvelope.validationPlan", missing);
    requireNonEmptyList(executionEnvelope.rollbackPlan, "executionEnvelope.rollbackPlan", missing);
    requireNonEmptyList(executionEnvelope.stopConditions, "executionEnvelope.stopConditions", missing);
    requireNonEmptyTextValue(executionEnvelope.maxRiskLevel, "executionEnvelope.maxRiskLevel", missing);
    if (executionEnvelope.targetEnvironment !== "test_main") missing.push("executionEnvelope.targetEnvironment");
  }
  requireListContainsAll(source.allowedFiles || (executionEnvelope && executionEnvelope.allowedFiles), SINGLE_DECISION_REQUIRED_ALLOWED_FILES, "allowedFiles", missing);
  requireListContainsAll(source.blockedFiles || (executionEnvelope && executionEnvelope.blockedFiles), SINGLE_DECISION_REQUIRED_BLOCKED_FILES, "blockedFiles", missing);
  requireNonEmptyList(source.requiredChecks || (executionEnvelope && executionEnvelope.requiredChecks), "requiredChecks", missing);
  requireNonEmptyList(source.validationPlan || (executionEnvelope && executionEnvelope.validationPlan), "validationPlan", missing);
  requireNonEmptyList(source.rollbackPlan || (executionEnvelope && executionEnvelope.rollbackPlan), "rollbackPlan", missing);
  requireNonEmptyList(source.stopConditions || (executionEnvelope && executionEnvelope.stopConditions), "stopConditions", missing);
  if ((source.targetEnvironment || (executionEnvelope && executionEnvelope.targetEnvironment)) !== "test_main") missing.push("targetEnvironment");

  const stopConditions = parseStringList(source.stopConditions || (executionEnvelope && executionEnvelope.stopConditions) || [], 120, 1000);
  for (const stopCondition of SINGLE_DECISION_REQUIRED_STOP_CONDITIONS) {
    if (!stopConditions.includes(stopCondition)) missing.push(`stopConditions:${stopCondition}`);
  }

  const missingUnique = Array.from(new Set(missing));
  return {
    approvable: missingUnique.length === 0,
    complete: missingUnique.length === 0,
    missing: missingUnique,
    detailStatus: missingUnique.length === 0 ? "structured" : SINGLE_DECISION_DETAIL_STATUS,
    blocker: missingUnique.length === 0 ? "" : SINGLE_DECISION_BLOCKER_MESSAGE,
    mode: "single_owner_decision",
    singleDecisionStatus: missingUnique.length === 0 ? "pending_single_decision" : "single_decision_blocked",
  };
}

function stableContractValue(value) {
  if (Array.isArray(value)) return value.map(stableContractValue);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((acc, key) => {
      const nested = stableContractValue(value[key]);
      if (nested !== undefined) acc[key] = nested;
      return acc;
    }, {});
  }
  if (value === undefined) return undefined;
  return value;
}

function buildExecutionContractFingerprintSource(dossier) {
  const source = dossier && typeof dossier === "object" ? dossier : {};
  return CONTRACT_FINGERPRINT_FIELDS.reduce((acc, field) => {
    const value = stableContractValue(source[field]);
    if (value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)) acc[field] = value;
    return acc;
  }, {});
}

function buildExecutionContractHash(dossier) {
  const canonical = JSON.stringify(stableContractValue(buildExecutionContractFingerprintSource(dossier)));
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

function buildExecutionContractApprovalFields(dossier) {
  const source = dossier && typeof dossier === "object" ? dossier : {};
  const executionContract = source.executionContract && typeof source.executionContract === "object" ? source.executionContract : {};
  const executionContractVersion = sanitizeInboxText(source.executionContractVersion || executionContract.executionContractVersion, 120);
  const executionContractMode = sanitizeInboxText(source.executionContractMode || source.mode || executionContract.mode, 80) || "manual_step_by_step";
  const executionContractHash = buildExecutionContractHash({ ...source, executionContract });
  return { executionContractVersion, executionContractMode, executionContractHash, stableContractFingerprint: executionContractHash };
}

function contractApprovalCoversCurrentExecutionContract(source) {
  const doc = source && typeof source === "object" ? source : {};
  const currentHash = sanitizeInboxText(doc.executionContractHash || doc.stableContractFingerprint, 120);
  return Boolean(sanitizeInboxText(doc.approvalMode, 80) === "single_owner_decision" && doc.approvalCoversAutomaticExecution === true && currentHash && sanitizeInboxText(doc.approvedExecutionContractHash, 120) === currentHash && doc.requiresSingleDecisionReapproval !== true);
}

function buildSingleDecisionReapprovalState({ existingData, currentContractFields }) {
  const existing = existingData && typeof existingData === "object" ? existingData : {};
  const current = currentContractFields && typeof currentContractFields === "object" ? currentContractFields : {};
  const existingStatus = sanitizeInboxText(existing.status, 40);
  const currentMode = sanitizeInboxText(current.executionContractMode, 80);
  const currentHash = sanitizeInboxText(current.executionContractHash, 120);
  const approvedHash = sanitizeInboxText(existing.approvedExecutionContractHash, 120);
  const legacyApproved = existingStatus === "approved" && currentMode === "single_owner_decision" && (sanitizeInboxText(existing.approvalMode, 80) !== "single_owner_decision" || !approvedHash || approvedHash !== currentHash || existing.approvalCoversAutomaticExecution !== true);
  return { requiresSingleDecisionReapproval: legacyApproved, reapprovalReason: legacyApproved ? SINGLE_DECISION_REAPPROVAL_REASON : "", singleDecisionStatus: legacyApproved ? "pending_single_decision_reapproval" : null, autoProgressStatus: legacyApproved ? "auto_progress_paused" : null, contractUpgradeDetected: existingStatus === "approved" && currentMode === "single_owner_decision" && approvedHash !== currentHash };
}

const REVISION_DOSSIER_REQUIRED_FIELDS = ["what", "why", "wellFitBenefit", "userBenefit", "economyImpact", "risk", "recommendation"];
const REVISION_DOSSIER_LIST_FIELDS = ["allowedFiles", "blockedFiles", "requiredChecks"];
const REVISION_DOSSIER_MESSAGE = "Revision konnte nicht ausreichend begründet werden.";

function buildRevisionDefaultRequiredChecks({ allowedFiles, sourceType }) {
  const checks = ["npm run agent:validate", "npm run lint", "git diff --check"];
  const lowerFiles = (allowedFiles || []).map((file) => String(file || "").toLowerCase());
  if (lowerFiles.some((file) => file.startsWith("app/") || file.startsWith("lib/admin/"))) checks.splice(2, 0, "npm run build");
  if (lowerFiles.some((file) => file.startsWith("functions/")) || sourceType === "proposal") checks.push("npm --prefix functions run check");
  return Array.from(new Set(checks));
}

function getRevisionMissingFields(dossier) {
  const missing = [];
  for (const field of REVISION_DOSSIER_REQUIRED_FIELDS) {
    if (!sanitizeInboxText(dossier && dossier[field], 1200)) missing.push(field);
  }
  for (const field of REVISION_DOSSIER_LIST_FIELDS) {
    if (!parseStringList(dossier && dossier[field], 80, 260).length) missing.push(field);
  }
  return missing;
}

function isCompleteDecisionDossier(dossier) {
  const mode = String((dossier && dossier.executionContract && dossier.executionContract.mode) || (dossier && dossier.mode) || "manual_step_by_step");
  if (mode === "single_owner_decision" || (dossier && dossier.executionContract)) return validateSingleDecisionExecutionContract(dossier).approvable;
  return getRevisionMissingFields(dossier).length === 0;
}

function findRevisionSourcePayload({ inbox, registerSnapshot }) {
  const sourceDossierId = sanitizeInboxText(inbox && inbox.sourceDossierId, 180);
  const listType = sanitizeInboxText(inbox && inbox.listType, 80);
  if (!registerSnapshot || typeof registerSnapshot !== "object") return null;
  const collections = getFirstRunCandidateCollections(registerSnapshot);
  const normalizedSource = sourceDossierId.toLowerCase();
  for (const collection of collections) {
    if (listType && collection.listType !== listType) continue;
    for (const raw of collection.items) {
      const normalized = normalizeFirstRunEntry(raw, collection.listType);
      const ids = [normalized.sourceDossierId, normalized.dossierId, normalized.id, normalized.title, normalized.sourceRef].map((value) => sanitizeInboxText(value, 240).toLowerCase()).filter(Boolean);
      if (ids.includes(normalizedSource)) return { payload: normalized, listType: collection.listType, collectionPath: collection.path };
    }
  }
  for (const collection of collections) {
    for (const raw of collection.items) {
      const normalized = normalizeFirstRunEntry(raw, collection.listType);
      const ids = [normalized.sourceDossierId, normalized.dossierId, normalized.id, normalized.title, normalized.sourceRef].map((value) => sanitizeInboxText(value, 240).toLowerCase()).filter(Boolean);
      if (ids.includes(normalizedSource)) return { payload: normalized, listType: collection.listType, collectionPath: collection.path };
    }
  }
  return null;
}

function buildProductEvolutionRevisionDossier({ inbox, sourcePayload, sourceMeta }) {
  const source = { ...(inbox || {}), ...(sourcePayload || {}) };
  const sourceDossierId = sanitizeInboxText(source.sourceDossierId || (inbox && inbox.sourceDossierId), 180);
  const sourceType = sanitizeInboxText(source.sourceType || (inbox && inbox.sourceType), 120) || "product_evolution_first_run";
  const listType = sanitizeInboxText((sourceMeta && sourceMeta.listType) || source.listType || (inbox && inbox.listType), 80) || "generatedDossiers";
  const title = firstPresentText(source, ["title", "name", "headline", "label", "dossierTitle"], 240) || sourceDossierId;
  const summary = firstPresentText(source, ["summary", "plainSummary", "description", "abstract", "sourcePayloadSummary", "overview"], 1200);
  const what = firstPresentText(source, ["what", "whatWillChange", "requestedAction", "proposedChange", "change", "task", "scope"], 1200);
  const why = firstPresentText(source, ["why", "whySuggested", "reason", "whyNow", "rationale", "motivation"], 1200);
  const wellFitBenefit = firstPresentText(source, ["wellFitBenefit", "wellfitBenefit", "wellFitValue", "platformBenefit", "businessBenefit", "businessValue"], 1200);
  const userBenefit = firstPresentText(source, ["userBenefit", "memberBenefit", "playerBenefit", "customerBenefit"], 1200);
  const economyImpact = firstPresentText(source, ["economyImpact", "rewardImpact", "wfpImpact", "xpImpact", "economy"], 1200);
  const risk = firstPresentText(source, ["risk", "riskSummary", "risks", "riskAssessment", "safetyRisk"], 1200);
  const allowedFiles = firstPresentList(source, ["allowedFiles", "allowedWriteScopes", "allowedPaths", "affectedFiles", "files"], 80, 260);
  const blockedFiles = firstPresentList(source, ["blockedFiles", "blockedWriteScopes", "forbiddenFiles", "protectedFiles", "blockedPaths"], 80, 260);
  const requiredChecks = firstPresentList(source, ["requiredChecks", "checks", "qualityChecks", "requiredCommands", "validationCommands"], 80, 260);
  const recommendation = listType === "recommendedResearchMore" ? "research_more" : (firstPresentText(source, ["recommendation", "recommendedDecision", "decisionRecommendation"], 80) || "approve");
  const completeCandidate = { what, why, wellFitBenefit, userBenefit, economyImpact, risk, recommendation, allowedFiles, blockedFiles, requiredChecks };
  const sourceHasEnoughNarrative = Boolean(summary && what && why && wellFitBenefit && userBenefit && economyImpact && risk);
  const hydratedRequiredChecks = requiredChecks.length ? requiredChecks : (sourceHasEnoughNarrative && allowedFiles.length ? buildRevisionDefaultRequiredChecks({ allowedFiles, sourceType }) : []);
  const executionFields = extractExecutionContractFields(source);
  const dossier = {
    title,
    summary,
    plainSummary: summary,
    what,
    whatWillChange: what,
    why,
    whySuggested: why,
    wellFitBenefit,
    userBenefit,
    economyImpact,
    risk,
    riskSummary: risk,
    recommendation,
    allowedFiles,
    blockedFiles,
    requiredChecks: hydratedRequiredChecks,
    sourceDossierId,
    sourceType,
    listType,
    sourceRef: sanitizeInboxText(source.sourceRef || (inbox && inbox.sourceRef), 260),
    nextStep: firstPresentText(source, ["nextStep", "nextSteps", "suggestedTaskProposal", "handoff"], 1200) || "Nach Admin-Zustimmung manuell als Task Proposal weiterführen. Kein Runner, Deploy, Merge oder automatische Zustimmung.",
    ...Object.fromEntries(Object.entries(executionFields).filter(([, value]) => value !== null && value !== "" && !(Array.isArray(value) && value.length === 0))),
    revisionSourceDossierId: sourceDossierId,
    revisionSourceCollectionPath: sanitizeInboxText(sourceMeta && sourceMeta.collectionPath, 120),
  };
  const missing = getRevisionMissingFields(dossier);
  return { dossier, missing, complete: missing.length === 0, sourceHasEnoughNarrative, completeCandidate };
}

function extractExecutionContractFields(source) {
  const safeSource = source && typeof source === "object" ? source : {};
  const executionEnvelope = safeSource.executionEnvelope && typeof safeSource.executionEnvelope === "object" ? safeSource.executionEnvelope : {};
  const executionContract = safeSource.executionContract && typeof safeSource.executionContract === "object" ? safeSource.executionContract : null;
  const approvalFields = buildExecutionContractApprovalFields({ ...safeSource, executionContract });
  return {
    executionContract,
    allowedExecution: safeSource.allowedExecution && typeof safeSource.allowedExecution === "object" ? safeSource.allowedExecution : null,
    forbiddenExecution: safeSource.forbiddenExecution && typeof safeSource.forbiddenExecution === "object" ? safeSource.forbiddenExecution : null,
    executionEnvelope: safeSource.executionEnvelope && typeof safeSource.executionEnvelope === "object" ? safeSource.executionEnvelope : null,
    mode: sanitizeInboxText(safeSource.mode || (safeSource.executionContract && safeSource.executionContract.mode) || "", 80),
    executionContractVersion: approvalFields.executionContractVersion,
    executionContractMode: approvalFields.executionContractMode,
    executionContractHash: approvalFields.executionContractHash,
    stableContractFingerprint: approvalFields.stableContractFingerprint,
    approvedExecutionContractVersion: sanitizeInboxText(safeSource.approvedExecutionContractVersion, 120),
    approvedExecutionContractHash: sanitizeInboxText(safeSource.approvedExecutionContractHash, 120),
    approvalMode: sanitizeInboxText(safeSource.approvalMode, 80),
    approvalCoversAutomaticExecution: safeSource.approvalCoversAutomaticExecution === true,
    requiresSingleDecisionReapproval: safeSource.requiresSingleDecisionReapproval === true,
    reapprovalReason: sanitizeInboxText(safeSource.reapprovalReason, 1200),
    targetEnvironment: sanitizeInboxText(safeSource.targetEnvironment || executionEnvelope.targetEnvironment || "", 80),
    validationPlan: firstPresentList(safeSource, ["validationPlan", "executionEnvelope.validationPlan"], 80, 1000),
    rollbackPlan: firstPresentList(safeSource, ["rollbackPlan", "executionEnvelope.rollbackPlan"], 80, 1000),
    stopConditions: firstPresentList(safeSource, ["stopConditions", "executionEnvelope.stopConditions"], 120, 1000),
    nextAutomaticSteps: firstPresentList(safeSource, ["nextAutomaticSteps", "executionEnvelope.nextAutomaticSteps"], 80, 1000),
    taskProposalPlan: safeSource.taskProposalPlan || null,
    workerQueuePlan: safeSource.workerQueuePlan || null,
    runnerJobPlan: safeSource.runnerJobPlan || null,
    pickupContractPlan: safeSource.pickupContractPlan || null,
    implementationPlan: safeSource.implementationPlan || null,
    fileWritePlan: safeSource.fileWritePlan || null,
    branchPlan: safeSource.branchPlan || null,
    prPlan: safeSource.prPlan || null,
    mergePlan: safeSource.mergePlan || null,
    deployPlan: safeSource.deployPlan || null,
    tokenPaymentBlockchainPlan: safeSource.tokenPaymentBlockchainPlan || null,
    nativePlan: safeSource.nativePlan || null,
  };
}

function touchesCanonicalTruthProtectedFiles(files) {
  const normalized = parseStringList(files, 120, 260).map((f) => String(f || "").trim().toLowerCase());
  const protectedSet = new Set(CANONICAL_TRUTH_PROTECTED_FILES.map((f) => f.toLowerCase()));
  return normalized.filter((file) => protectedSet.has(file));
}

function assertCanonicalTruthChangeAllowed({ files, actorRole, ownerApprovalFlag, HttpsError }) {
  const touched = touchesCanonicalTruthProtectedFiles(files);
  if (!touched.length) return touched;
  const ownerApproved = actorRole === "owner" && ownerApprovalFlag === true;
  if (!ownerApproved) {
    throw new HttpsError("failed-precondition", `Canonical Truth owner-only: ${touched.join(", ")}. Verwende nur ${CANONICAL_TRUTH_PROPOSAL_FILE} fuer Vorschlaege.`);
  }
  return touched;
}

function buildCanonicalTruthPromptGuardrail() {
  return [
    "Canonical Truth Pflicht:",
    "- Lies vor Arbeitsbeginn: project-register/wellfit-beta1-canonical-truth.json, docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md, todolist/CODEX_CONTEXT_WELLFIT_BETA1.md.",
    "- WFP = interne WellFit Punkte in Beta-1.",
    "- XP = Avatar-Fortschritt (nicht spendable).",
    "- WFT/SUI/Blockchain/Presale/Token/NFT/Payment/Cashout/Wallet-Trading sind NICHT Beta-1.",
    "- Die drei Canonical-Truth-Dateien sind owner-only/read-only fuer Agents.",
    "- Keine autonomen Aenderungen ohne explizite Owner-Freigabe (ownerCanonicalTruthApproval=true).",
    `- Wenn Aenderungsbedarf besteht: nur Vorschlag in ${CANONICAL_TRUTH_PROPOSAL_FILE} dokumentieren.`,
  ].join("\n");
}

const BASE_REQUIRED_CHECKS = ["npm run agent:validate", "npm run agent:quality-gate", "npm run lint", "git diff --check"];
const FUNCTION_SCOPE_MARKERS = ["runtime_backend", "functions", "firestore"];
const UI_SCOPE_MARKERS = ["runtime_ui", "live_page", "ui", "app", "components"];
const AUTOMATION_POLICY_STATUSES = ["policy_draft", "waiting_for_checks", "waiting_for_admin_decision", "approved_for_auto_merge", "approved_for_staging_deploy", "approved_for_production_deploy", "rejected", "blocked", "executed_metadata_only"];
const AUTOMATION_STATUSES = ["not_requested", "merge_requested", "merge_approved", "deploy_requested", "deploy_approved", "automation_blocked", "metadata_executed"];
const DEPLOY_ENVIRONMENTS = ["none", "preview", "staging", "production"];

const AUTOMATION_MODES = ["off", "planning_only", "supervised", "runner_enabled", "paused", "repair_required", "halted_waiting_owner"];

function buildDefaultAutomationControl() { return { automationEnabled:false, automationMode:"off", currentCycleId:null, lastPrRef:null, lastMergeStatus:"unknown", lastFailureReason:null, repairAttemptCount:0, maxRepairAttempts:3, ownerReviewRequired:false, pausedBy:null, pausedAt:null, resumedBy:null, resumedAt:null, updatedAt:FieldValue.serverTimestamp() }; }
async function getGlobalAutomationControl(db){ const ref=db.collection('agentAutomationControl').doc('global'); const snap=await ref.get(); if(!snap.exists){ const d=buildDefaultAutomationControl(); await ref.set(d,{merge:true}); return {ref,data:{...d,maxRepairAttempts:3,repairAttemptCount:0}};} return {ref,data:snap.data()||{}}; }
function shouldHaltAfterRepairAttempts(control){ return Number(control.repairAttemptCount||0) >= Number(control.maxRepairAttempts||3); }
function assertAutomationMayStartNewWork(control, HttpsError, taskType){ const mode=String(control.automationMode||'off'); const allowedBlocked=['repair_task','conflict_resolution','governance_cleanup']; if(['paused','halted_waiting_owner'].includes(mode)) throw new HttpsError('failed-precondition', 'Automation pausiert/angehalten.'); if(mode==='repair_required' && !allowedBlocked.includes(String(taskType||''))) throw new HttpsError('failed-precondition','Nur Repair/Governance/Conflict erlaubt.'); if(!control.automationEnabled && !allowedBlocked.includes(String(taskType||''))) throw new HttpsError('failed-precondition','Automation nicht freigegeben.'); }
function assertAutomationMayContinue(control, HttpsError, taskType){ return assertAutomationMayStartNewWork(control,HttpsError,taskType); }
function assertRepairAttemptAllowed(control,HttpsError){ if(shouldHaltAfterRepairAttempts(control)) throw new HttpsError('failed-precondition','Repair-Limit erreicht. Owner Review erforderlich.'); }
function buildCycleStartChecklist(){ return ["internal_sources_analysis","repo_status_analysis","canonical_truth_comparison","quality_gate_known_blockers_check","open_tasks_and_dossiers_check","admin_approval_check"]; }

const HIGH_RISK_FILE_PREFIXES = ["functions/", ".github/"];
const { isProtectedBranchName, githubApiImplementationAvailable, buildGithubRunnerCapability, createGithubBranch, getGithubFile, putGithubFile, createGithubPullRequest, listGithubCheckRunsOrCommitStatuses, mergeGithubPullRequest, getGithubPullRequest } = require("./agentGithubRunner");
const HIGH_RISK_EXACT_FILES = ["firestore.rules", "package.json", "package-lock.json"];

function isSafeBranchName(branchName) {
  return /^[A-Za-z0-9._\/-]+$/.test(branchName) && !branchName.includes("..") && !branchName.startsWith("/") && !branchName.endsWith("/");
}

function buildRequiredChecks({ targetTrack, allowedFiles }) {
  const checks = new Set(BASE_REQUIRED_CHECKS);
  const allowed = (allowedFiles || []).map((entry) => String(entry || "").toLowerCase());
  const track = String(targetTrack || "").toLowerCase();
  const touchesFunctions = FUNCTION_SCOPE_MARKERS.some((marker) => track.includes(marker)) || allowed.some((file) => file.startsWith("functions/") || file === "firestore.rules");
  const touchesUi = UI_SCOPE_MARKERS.some((marker) => track.includes(marker)) || allowed.some((file) => file.startsWith("app/") || file.startsWith("components/") || file.startsWith("lib/admin/"));
  if (touchesFunctions) checks.add("npm --prefix functions run check");
  if (touchesUi) checks.add("npm run build");
  return Array.from(checks);
}

function validateWorkerStatusTransition(currentStatus, nextStatus) {
  const allowedTransitions = {
    ready_for_worker: ["claimed", "blocked", "failed"],
    claimed: ["running", "blocked", "failed"],
    running: ["checks_recorded", "blocked", "failed"],
    checks_recorded: ["pr_prepared", "completed", "blocked", "failed"],
    pr_prepared: ["completed", "blocked", "failed"],
    blocked: [],
    failed: [],
    completed: [],
  };
  return (allowedTransitions[currentStatus] || []).includes(nextStatus);
}


function getWorkerQueueReleaseTargetId(data) {
  return optionalString(data && (data.workerQueueId || data.targetId || data.id), 180);
}

function buildWorkerQueueReleaseFailureMessage(missing) {
  const reasons = Array.isArray(missing) ? missing : [];
  if (reasons.includes("status_not_releasable")) return "Status erlaubt diese Freigabe nicht.";
  const missingRequired = reasons.filter((reason) => ["allowedFiles", "blockedFiles", "requiredChecks"].includes(reason));
  if (missingRequired.length) return `Pflichtdaten fehlen: ${missingRequired.join("/")}.`;
  if (reasons.includes("owner_protected_scope")) return "Owner-protected Bereich blockiert.";
  if (reasons.some((reason) => ["noRunnerStarted", "runnerStarted", "noBranchOrPrOrMerge", "branch_pr_merge", "noDeploy", "deploy"].includes(reason))) return "Sicherheitsflags verhindern Freigabe.";
  return "Worker-Freigabe fehlgeschlagen.";
}

function buildWorkerQueueReleaseDecision(item) {
  const currentStatus = optionalString(item && (item.workerStatus || item.status), 80) || "pending_worker_review";
  const allowedFiles = parseStringList((item && item.allowedFiles) || [], 80, 260);
  const blockedFiles = parseStringList((item && item.blockedFiles) || [], 80, 260);
  const requiredChecks = parseStringList((item && item.requiredChecks) || [], 80, 260);
  const protectedScopes = parseStringList((item && item.protectedScopes) || [], 80, 260);
  const missing = [];
  if (!["pending_worker_review", "queued_for_owner_review"].includes(currentStatus)) missing.push("status_not_releasable");
  if (!allowedFiles.length) missing.push("allowedFiles");
  if (!blockedFiles.length) missing.push("blockedFiles");
  if (!requiredChecks.length) missing.push("requiredChecks");
  if (touchesCanonicalTruthProtectedFiles(allowedFiles).length || protectedScopes.some((scope) => BLOCKED_PROTECTED_SCOPES.has(String(scope || "").toLowerCase()))) missing.push("owner_protected_scope");
  if (item && item.noRunnerStarted === false) missing.push("noRunnerStarted");
  if (item && item.runnerStarted === true) missing.push("runnerStarted");
  if (item && item.noBranchOrPrOrMerge === false) missing.push("noBranchOrPrOrMerge");
  if (item && (item.branchCreated === true || item.prCreated === true || item.merged === true || item.autoMerge === true)) missing.push("branch_pr_merge");
  if (item && item.noDeploy === false) missing.push("noDeploy");
  if (item && (item.deployStarted === true || item.autoDeploy === true)) missing.push("deploy");
  return {
    releasable: missing.length === 0,
    currentStatus,
    nextStatus: "ready_for_worker",
    missing,
    allowedFiles,
    blockedFiles,
    requiredChecks,
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
    failureMessage: buildWorkerQueueReleaseFailureMessage(missing),
  };
}

function buildRunnerPickupPreviewFailureMessage(missing) {
  const reasons = Array.isArray(missing) ? missing : [];
  if (reasons.includes("workerQueueId")) return "Worker Queue ID fehlt.";
  if (reasons.includes("status_not_ready_for_worker")) return "Nur ready_for_worker oder previewed_for_runner kann als Runner-Pickup Preview geprüft werden.";
  const missingRequired = reasons.filter((reason) => ["allowedFiles", "blockedFiles", "requiredChecks"].includes(reason));
  if (missingRequired.length) return `Pflichtdaten fehlen: ${missingRequired.join("/")}.`;
  if (reasons.some((reason) => ["noRunnerStarted", "runnerStarted", "noBranchOrPrOrMerge", "branch_pr_merge", "noDeploy", "deploy"].includes(reason))) return "Sicherheitsflags verhindern Runner-Pickup Preview.";
  return "Runner-Pickup Preview blockiert.";
}

function buildRunnerPickupPreviewDecision(item, workerQueueIdOverride) {
  const workerQueueId = optionalString(workerQueueIdOverride || (item && item.workerQueueId), 180);
  const currentStatus = optionalString(item && (item.workerStatus || item.status), 80) || "pending_worker_review";
  const allowedFiles = parseStringList((item && item.allowedFiles) || [], 80, 260);
  const blockedFiles = parseStringList((item && item.blockedFiles) || [], 80, 260);
  const requiredChecks = parseStringList((item && item.requiredChecks) || [], 80, 260);
  const missing = [];
  if (!workerQueueId) missing.push("workerQueueId");
  if (!["ready_for_worker", "previewed_for_runner"].includes(currentStatus)) missing.push("status_not_ready_for_worker");
  if (!allowedFiles.length) missing.push("allowedFiles");
  if (!blockedFiles.length) missing.push("blockedFiles");
  if (!requiredChecks.length) missing.push("requiredChecks");
  if (item && item.noRunnerStarted === false) missing.push("noRunnerStarted");
  if (item && item.runnerStarted === true) missing.push("runnerStarted");
  if (item && item.noBranchOrPrOrMerge === false) missing.push("noBranchOrPrOrMerge");
  if (item && (item.branchCreated === true || item.prCreated === true || item.merged === true || item.autoMerge === true)) missing.push("branch_pr_merge");
  if (item && item.noDeploy === false) missing.push("noDeploy");
  if (item && (item.deployStarted === true || item.autoDeploy === true)) missing.push("deploy");
  return {
    previewable: missing.length === 0,
    currentStatus,
    missing,
    failureMessage: buildRunnerPickupPreviewFailureMessage(missing),
    preview: {
      workerQueueId: workerQueueId || null,
      taskProposalId: optionalString(item && (item.taskProposalId || item.proposalId), 180) || null,
      title: optionalString(item && (item.title || item.taskTitle), 240) || (workerQueueId ? `Worker Queue ${workerQueueId}` : "Worker Queue"),
      requestedAction: optionalString(item && item.requestedAction, 1200) || optionalString(item && item.summary, 1200) || "",
      status: currentStatus,
      riskLevel: normalizeRiskLevel((item && item.riskLevel) || "medium"),
      allowedFiles,
      blockedFiles,
      requiredChecks,
      plannedExecutionMode: "preview_only",
      wouldCreateBranch: false,
      wouldCreatePr: false,
      wouldRunChecks: false,
      wouldDeploy: false,
      runnerStartAllowed: false,
      nextRequiredOwnerAction: "runner_start_approval_required",
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
      safetySummary: ["Kein Runner gestartet", "Kein Branch erstellt", "Kein PR erstellt", "Kein Merge", "Kein Deploy"],
    },
  };
}


function buildRunnerStartApprovalFailureMessage(missing) {
  const reasons = Array.isArray(missing) ? missing : [];
  if (reasons.includes("workerQueueId")) return "Worker Queue ID fehlt.";
  if (reasons.includes("status_not_approvable")) return "Nur ready_for_worker oder previewed_for_runner darf für manuellen Runner-Pickup freigegeben werden.";
  const missingRequired = reasons.filter((reason) => ["allowedFiles", "blockedFiles", "requiredChecks"].includes(reason));
  if (missingRequired.length) return `Pflichtdaten fehlen: ${missingRequired.join("/")}.`;
  if (reasons.some((reason) => ["noRunnerStarted", "runnerStarted", "noBranchOrPrOrMerge", "branch_pr_merge", "noDeploy", "deploy"].includes(reason))) return "Sicherheitsflags verhindern Runner-Start-Freigabe.";
  return "Runner-Start-Freigabe blockiert.";
}

function buildRunnerStartApprovalDecision(item, workerQueueIdOverride) {
  const workerQueueId = optionalString(workerQueueIdOverride || (item && item.workerQueueId), 180);
  const currentStatus = optionalString(item && (item.workerStatus || item.status), 80) || "pending_worker_review";
  const allowedFiles = parseStringList((item && item.allowedFiles) || [], 80, 260);
  const blockedFiles = parseStringList((item && item.blockedFiles) || [], 80, 260);
  const requiredChecks = parseStringList((item && item.requiredChecks) || [], 80, 260);
  const missing = [];
  if (!workerQueueId) missing.push("workerQueueId");
  if (!["ready_for_worker", "previewed_for_runner"].includes(currentStatus)) missing.push("status_not_approvable");
  if (!allowedFiles.length) missing.push("allowedFiles");
  if (!blockedFiles.length) missing.push("blockedFiles");
  if (!requiredChecks.length) missing.push("requiredChecks");
  if (item && item.noRunnerStarted === false) missing.push("noRunnerStarted");
  if (item && item.runnerStarted === true) missing.push("runnerStarted");
  if (item && item.noBranchOrPrOrMerge === false) missing.push("noBranchOrPrOrMerge");
  if (item && (item.branchCreated === true || item.prCreated === true || item.merged === true || item.autoMerge === true)) missing.push("branch_pr_merge");
  if (item && item.noDeploy === false) missing.push("noDeploy");
  if (item && (item.deployStarted === true || item.autoDeploy === true)) missing.push("deploy");
  return {
    approvable: missing.length === 0,
    currentStatus,
    nextStatus: "runner_start_approved",
    missing,
    failureMessage: buildRunnerStartApprovalFailureMessage(missing),
    runnerJob: {
      workerQueueId: workerQueueId || null,
      taskProposalId: optionalString(item && (item.taskProposalId || item.proposalId), 180) || null,
      title: optionalString(item && (item.title || item.taskTitle), 240) || (workerQueueId ? `Worker Queue ${workerQueueId}` : "Worker Queue"),
      summary: optionalString(item && item.summary, 1200) || "",
      requestedAction: optionalString(item && item.requestedAction, 1200) || optionalString(item && item.summary, 1200) || "",
      status: "pending_runner_pickup",
      executionMode: "owner_approved_manual_pickup",
      allowedFiles,
      blockedFiles,
      requiredChecks,
      riskLevel: normalizeRiskLevel((item && item.riskLevel) || "medium"),
      sourceInboxId: optionalString(item && item.sourceInboxId, 180) || null,
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
      runnerStartAllowed: false,
      requiresManualRunnerPickup: true,
    },
  };
}

function buildManualRunnerImplementationPlanFailureMessage(missing) {
  const reasons = Array.isArray(missing) ? missing : [];
  if (reasons.includes("pickupContractId")) return "Pickup Contract ID fehlt.";
  if (reasons.includes("status_not_pickup_contract_created")) return "Nur pickup_contract_created darf einen Implementierungsplan erzeugen.";
  const missingRequired = reasons.filter((reason) => ["allowedFiles", "blockedFiles", "requiredChecks"].includes(reason));
  if (missingRequired.length) return `Pflichtdaten fehlen: ${missingRequired.join("/")}.`;
  if (reasons.some((reason) => ["runnerStartAllowed", "fileWriteAllowed", "branchCreationAllowed", "prCreationAllowed", "noDeploy", "noMerge"].includes(reason))) return "Sicherheitsflags verhindern Implementierungsplan.";
  return "Implementierungsplan blockiert.";
}

function buildFamilyAdventureImplementationPlanContent(contract) {
  const title = optionalString(contract && contract.title, 240) || "Familien Abenteuerpfad Woche";
  const isFamilyAdventure = title.toLowerCase().includes("familien abenteuerpfad");
  if (isFamilyAdventure) {
    return {
      planSummary: "Es wird ein laienverständlicher 5-Tage-Familien-Abenteuerpfad als Dokumentations- und Konzeptplan vorbereitet. Jeder Tag kombiniert eine kleine Bewegungsaufgabe, einen Mini-Lernimpuls und ein soziales Check-in. Es entsteht noch keine App-Umsetzung und es werden keine Produktdateien geändert.",
      plannedSteps: [
        "Rahmen und Zielgruppe für die Familien-Abenteuerpfad-Woche beschreiben.",
        "Fünf Tagesstationen skizzieren: pro Tag eine kleine sichere Bewegungsaufgabe, ein Mini-Lernimpuls und ein soziales Check-in.",
        "Dokumentieren, dass erwartete spätere Dateien nur unter docs/**, todolist/** oder project-register/** liegen dürfen.",
        "Sperren ausdrücklich festhalten: app/**, functions/**, firestore.rules, native/** und .github/** bleiben unangetastet.",
        "Prüfplan, offene Fragen und Rollback für eine spätere Owner-Freigabe notieren."
      ],
      expectedFilesToTouch: ["docs/**", "todolist/**", "project-register/**"],
      expectedOutputs: [
        "Ein freigabefähiges Konzeptdokument für die 5-Tage-Familien-Abenteuerpfad-Woche.",
        "Eine kurze TODO-/Register-Notiz für den Owner-Review, falls später freigegeben.",
        "Keine App-, Functions-, Firestore-Rules-, native-App- oder GitHub-Actions-Änderung."
      ],
      validationPlan: [
        "Prüfen, dass der Plan nur Dokumentation/Konzept beschreibt und keine App-Umsetzung startet.",
        "Prüfen, dass expectedFilesToTouch ausschließlich docs/**, todolist/** oder project-register/** enthält.",
        "Pflichtchecks für eine spätere Umsetzung festhalten: npm run agent:validate, npm run agent:quality-gate, npm run lint, npm run build und git diff --check."
      ],
      rollbackPlan: [
        "Falls der Owner den Plan nicht freigibt, bleibt der Contract im Planungsstand und es wird keine Datei geändert.",
        "Falls ein Plan-Dokument korrigiert werden muss, wird nur das Plan-Dokument ersetzt oder auf repair_required gesetzt.",
        "Es gibt keinen Branch, PR, Merge oder Deploy, der zurückgerollt werden müsste."
      ],
      openQuestions: [
        "Soll der spätere Konzepttext eher für Eltern, Kinder oder interne Planung formuliert werden?",
        "Soll die Woche einen Natur-, Stadt- oder Zuhause-Schwerpunkt bekommen?",
        "Welche Sicherheits-/Altersgrenzen soll der Owner vor einer späteren Umsetzung ergänzen?"
      ],
    };
  }
  return {
    planSummary: "Manueller Implementierungsplan: Der Pickup Contract wird in einen reviewbaren Plan übersetzt. Es werden keine Dateien geändert, kein Branch erstellt, kein PR geöffnet, kein Merge und kein Deploy ausgelöst.",
    plannedSteps: ["Ziel und Scope aus dem Pickup Contract zusammenfassen.", "Erwartete spätere Dateien gegen allowedFiles und blockedFiles abgleichen.", "Prüf-, Rollback- und offene Fragen für den Owner-Review dokumentieren."],
    expectedFilesToTouch: parseStringList(contract && contract.allowedFiles || [], 80, 260),
    expectedOutputs: ["Owner-reviewbarer Implementierungsplan", "Keine Dateiänderung", "Keine Ausführung"],
    validationPlan: ["Plan gegen allowedFiles/blockedFiles/requiredChecks prüfen.", "Sicherheitsflags bestätigen: fileWriteAllowed=false, branchCreationAllowed=false, prCreationAllowed=false, noDeploy=true, noMerge=true."],
    rollbackPlan: ["Plan auf repair_required setzen oder verwerfen; keine Produktänderung muss zurückgerollt werden."],
    openQuestions: [],
  };
}

function buildManualRunnerImplementationPlanDecision(contract, pickupContractIdOverride) {
  const pickupContractId = optionalString(pickupContractIdOverride || (contract && contract.pickupContractId), 180);
  const currentStatus = optionalString(contract && contract.status, 80) || "pickup_contract_created";
  const allowedFiles = parseStringList((contract && contract.allowedFiles) || [], 80, 260);
  const blockedFiles = parseStringList((contract && contract.blockedFiles) || [], 80, 260);
  const requiredChecks = parseStringList((contract && contract.requiredChecks) || [], 80, 260);
  const missing = [];
  if (!pickupContractId) missing.push("pickupContractId");
  if (currentStatus !== "pickup_contract_created") missing.push("status_not_pickup_contract_created");
  if (!allowedFiles.length) missing.push("allowedFiles");
  if (!blockedFiles.length) missing.push("blockedFiles");
  if (!requiredChecks.length) missing.push("requiredChecks");
  if (contract && contract.runnerStartAllowed === true) missing.push("runnerStartAllowed");
  if (contract && contract.fileWriteAllowed === true) missing.push("fileWriteAllowed");
  if (contract && contract.branchCreationAllowed === true) missing.push("branchCreationAllowed");
  if (contract && contract.prCreationAllowed === true) missing.push("prCreationAllowed");
  if (contract && contract.noDeploy === false) missing.push("noDeploy");
  if (contract && contract.noMerge === false) missing.push("noMerge");
  const content = buildFamilyAdventureImplementationPlanContent(contract || {});
  return {
    plannable: missing.length === 0,
    currentStatus,
    missing,
    failureMessage: buildManualRunnerImplementationPlanFailureMessage(missing),
    plan: {
      pickupContractId: pickupContractId || null,
      runnerJobId: optionalString(contract && contract.runnerJobId, 180) || null,
      workerQueueId: optionalString(contract && contract.workerQueueId, 180) || null,
      taskProposalId: optionalString(contract && contract.taskProposalId, 180) || null,
      title: optionalString(contract && contract.title, 240) || (pickupContractId ? `Pickup Contract ${pickupContractId}` : "Pickup Contract"),
      requestedAction: optionalString(contract && contract.requestedAction, 1200) || "Create a manual implementation plan only.",
      status: "implementation_plan_created",
      executionMode: "manual_plan_only",
      allowedFiles,
      blockedFiles,
      requiredChecks,
      riskLevel: normalizeRiskLevel((contract && contract.riskLevel) || "medium"),
      planSummary: content.planSummary,
      plannedSteps: content.plannedSteps,
      expectedFilesToTouch: content.expectedFilesToTouch,
      expectedOutputs: content.expectedOutputs,
      validationPlan: content.validationPlan,
      rollbackPlan: content.rollbackPlan,
      openQuestions: content.openQuestions,
      fileWriteAllowed: false,
      branchCreationAllowed: false,
      prCreationAllowed: false,
      noDeploy: true,
      noMerge: true,
      requiresOwnerPlanApproval: true,
      nextStep: "Owner must approve implementation plan before any file write or branch creation.",
    },
  };
}


function buildManualRunnerImplementationPlanApprovalFailureMessage(missing) {
  const reasons = Array.isArray(missing) ? missing : [];
  if (reasons.includes("implementationPlanId")) return "Implementation Plan ID fehlt.";
  if (reasons.includes("status_not_approvable")) return "Nur implementation_plan_created oder implementation_plan_review darf freigegeben werden.";
  const missingRequired = reasons.filter((reason) => ["planSummary", "plannedSteps", "expectedFilesToTouch", "validationPlan", "rollbackPlan", "allowedFiles", "blockedFiles", "requiredChecks"].includes(reason));
  if (missingRequired.length) return `Pflichtdaten fehlen: ${missingRequired.join("/")}.`;
  if (reasons.includes("expectedFilesToTouch_outside_allowedFiles")) return "expectedFilesToTouch liegt außerhalb allowedFiles.";
  if (reasons.includes("expectedFilesToTouch_inside_blockedFiles")) return "expectedFilesToTouch trifft blockedFiles.";
  if (reasons.some((reason) => ["fileWriteAllowed", "branchCreationAllowed", "prCreationAllowed", "noDeploy", "noMerge"].includes(reason))) return "Sicherheitsflags verhindern Planfreigabe.";
  return "Implementierungsplan-Freigabe blockiert.";
}

function buildManualRunnerImplementationPlanApprovalDecision(plan, implementationPlanIdOverride) {
  const implementationPlanId = optionalString(implementationPlanIdOverride || (plan && plan.implementationPlanId), 180);
  const currentStatus = optionalString(plan && plan.status, 80) || "implementation_plan_created";
  const allowedFiles = parseStringList((plan && plan.allowedFiles) || [], 80, 260);
  const blockedFiles = parseStringList((plan && plan.blockedFiles) || [], 80, 260);
  const requiredChecks = parseStringList((plan && plan.requiredChecks) || [], 80, 260);
  const plannedSteps = parseStringList((plan && plan.plannedSteps) || [], 80, 1000);
  const expectedFilesToTouch = parseStringList((plan && plan.expectedFilesToTouch) || [], 80, 260);
  const validationPlan = parseStringList((plan && plan.validationPlan) || [], 80, 1000);
  const rollbackPlan = parseStringList((plan && plan.rollbackPlan) || [], 80, 1000);
  const planSummary = optionalString(plan && plan.planSummary, 2000);
  const missing = [];
  if (!implementationPlanId) missing.push("implementationPlanId");
  if (!["implementation_plan_created", "implementation_plan_review"].includes(currentStatus)) missing.push("status_not_approvable");
  if (!planSummary) missing.push("planSummary");
  if (!plannedSteps.length) missing.push("plannedSteps");
  if (!expectedFilesToTouch.length) missing.push("expectedFilesToTouch");
  if (!validationPlan.length) missing.push("validationPlan");
  if (!rollbackPlan.length) missing.push("rollbackPlan");
  if (!allowedFiles.length) missing.push("allowedFiles");
  if (!blockedFiles.length) missing.push("blockedFiles");
  if (!requiredChecks.length) missing.push("requiredChecks");
  if (expectedFilesToTouch.length && allowedFiles.length && !expectedFilesStayWithinAllowedFiles(expectedFilesToTouch, allowedFiles)) missing.push("expectedFilesToTouch_outside_allowedFiles");
  if (expectedFilesToTouch.length && blockedFiles.length && !expectedFilesAvoidBlockedFiles(expectedFilesToTouch, blockedFiles)) missing.push("expectedFilesToTouch_inside_blockedFiles");
  if (plan && plan.fileWriteAllowed === true) missing.push("fileWriteAllowed");
  if (plan && plan.branchCreationAllowed === true) missing.push("branchCreationAllowed");
  if (plan && plan.prCreationAllowed === true) missing.push("prCreationAllowed");
  if (plan && plan.noDeploy === false) missing.push("noDeploy");
  if (plan && plan.noMerge === false) missing.push("noMerge");
  return {
    approvable: missing.length === 0,
    currentStatus,
    missing,
    failureMessage: buildManualRunnerImplementationPlanApprovalFailureMessage(missing),
    approvalUpdate: {
      status: "implementation_plan_approved",
      ownerPlanApprovalDecision: "approved_for_file_write_preparation",
      fileWriteAllowed: false,
      branchCreationAllowed: false,
      prCreationAllowed: false,
      noDeploy: true,
      noMerge: true,
      nextStep: "Prepare controlled file-write package. Owner approval still required before branch or PR.",
    },
    safeFlags: { fileWriteAllowed: false, branchCreationAllowed: false, prCreationAllowed: false, noDeploy: true, noMerge: true },
    allowedFiles,
    blockedFiles,
    requiredChecks,
  };
}

function buildManualRunnerPickupContractFailureMessage(missing) {
  const reasons = Array.isArray(missing) ? missing : [];
  if (reasons.includes("runnerJobId")) return "Runner Job ID fehlt.";
  if (reasons.includes("status_not_pending_runner_pickup")) return "Nur pending_runner_pickup darf einen Pickup-Contract erzeugen.";
  const missingRequired = reasons.filter((reason) => ["allowedFiles", "blockedFiles", "requiredChecks"].includes(reason));
  if (missingRequired.length) return `Pflichtdaten fehlen: ${missingRequired.join("/")}.`;
  if (reasons.some((reason) => ["runnerStartAllowed", "requiresManualRunnerPickup", "noDeploy", "noMerge", "noAutoApproval", "fileWriteAllowed", "branchCreationAllowed", "prCreationAllowed"].includes(reason))) return "Sicherheitsflags verhindern Pickup-Contract.";
  return "Pickup-Contract blockiert.";
}

function buildManualRunnerPickupContractDecision(item, runnerJobIdOverride) {
  const runnerJobId = optionalString(runnerJobIdOverride || (item && item.runnerJobId), 180);
  const currentStatus = optionalString(item && item.status, 80) || "pending_runner_pickup";
  const allowedFiles = parseStringList((item && item.allowedFiles) || [], 80, 260);
  const blockedFiles = parseStringList((item && item.blockedFiles) || [], 80, 260);
  const requiredChecks = parseStringList((item && item.requiredChecks) || [], 80, 260);
  const missing = [];
  if (!runnerJobId) missing.push("runnerJobId");
  if (currentStatus !== "pending_runner_pickup") missing.push("status_not_pending_runner_pickup");
  if (!allowedFiles.length) missing.push("allowedFiles");
  if (!blockedFiles.length) missing.push("blockedFiles");
  if (!requiredChecks.length) missing.push("requiredChecks");
  if (item && item.runnerStartAllowed === true) missing.push("runnerStartAllowed");
  if (item && item.requiresManualRunnerPickup !== true) missing.push("requiresManualRunnerPickup");
  if (item && item.noDeploy === false) missing.push("noDeploy");
  if (item && (item.noMerge === false || item.merged === true || item.mergeAllowed === true || item.autoMerge === true)) missing.push("noMerge");
  if (item && (item.noAutoApproval === false || item.autoApproval === true || item.autoApproved === true || item.autoApprove === true)) missing.push("noAutoApproval");
  if (item && item.fileWriteAllowed === true) missing.push("fileWriteAllowed");
  if (item && item.branchCreationAllowed === true) missing.push("branchCreationAllowed");
  if (item && item.prCreationAllowed === true) missing.push("prCreationAllowed");
  return {
    contractable: missing.length === 0,
    currentStatus,
    missing,
    failureMessage: buildManualRunnerPickupContractFailureMessage(missing),
    contract: {
      runnerJobId: runnerJobId || null,
      workerQueueId: optionalString(item && item.workerQueueId, 180) || null,
      taskProposalId: optionalString(item && item.taskProposalId, 180) || null,
      title: optionalString(item && item.title, 240) || (runnerJobId ? `Runner Job ${runnerJobId}` : "Runner Job"),
      requestedAction: optionalString(item && item.requestedAction, 1200) || optionalString(item && item.summary, 1200) || "Manual runner may create an implementation plan only.",
      allowedFiles,
      blockedFiles,
      requiredChecks,
      riskLevel: normalizeRiskLevel((item && item.riskLevel) || "medium"),
      status: "pickup_contract_created",
      executionMode: "manual_runner_pickup_contract",
      runnerStartAllowed: false,
      requiresManualRunnerPickup: true,
      noDeploy: true,
      noMerge: true,
      noAutoApproval: true,
      branchCreationAllowed: false,
      prCreationAllowed: false,
      fileWriteAllowed: false,
      nextStep: "Manual runner may create an implementation plan only.",
    },
  };
}

function normalizeCheckEntries(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 80).map((entry) => ({
    command: optionalString(entry && entry.command, 240),
    result: optionalString(entry && entry.result, 30) || "skipped",
    summary: optionalString(entry && entry.summary, 1000) || null,
    timestamp: entry && entry.timestamp ? entry.timestamp : null,
  })).filter((entry) => entry.command && CHECK_RESULT_VALUES.includes(entry.result));
}


function requireRole(request, HttpsError, allowedRoles) {
  if (!request.auth || !request.auth.uid) throw new HttpsError("unauthenticated", "Login erforderlich.");
  const actorRole = optionalString(request.auth.token && request.auth.token.agentRole, 80);
  if (!actorRole || !allowedRoles.includes(actorRole)) throw new HttpsError("permission-denied", "Rolle nicht berechtigt.");
  return { actorId: request.auth.uid, actorRole };
}

function parseStringList(value, maxEntries = 80, maxLength = 240) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => optionalString(entry, maxLength)).filter(Boolean).slice(0, maxEntries);
}


function normalizePlanScopePattern(value) {
  return String(value || "").trim().replace(/^\.\//, "").replace(/\\/g, "/").replace(/\/+$/g, "");
}

function scopePatternContainsCandidate(scopePattern, candidatePattern) {
  const scope = normalizePlanScopePattern(scopePattern);
  const candidate = normalizePlanScopePattern(candidatePattern);
  if (!scope || !candidate) return false;
  if (scope === "**" || scope === "*") return true;
  if (scope === candidate) return true;
  if (scope.endsWith("/**")) {
    const prefix = scope.slice(0, -3);
    return candidate === prefix || candidate.startsWith(`${prefix}/`) || candidate.startsWith(`${prefix}/**`);
  }
  return false;
}

function scopePatternIntersectsCandidate(scopePattern, candidatePattern) {
  return scopePatternContainsCandidate(scopePattern, candidatePattern) || scopePatternContainsCandidate(candidatePattern, scopePattern);
}

function expectedFilesStayWithinAllowedFiles(expectedFilesToTouch, allowedFiles) {
  return expectedFilesToTouch.every((candidate) => allowedFiles.some((allowed) => scopePatternContainsCandidate(allowed, candidate)));
}

function expectedFilesAvoidBlockedFiles(expectedFilesToTouch, blockedFiles) {
  return expectedFilesToTouch.every((candidate) => !blockedFiles.some((blocked) => scopePatternIntersectsCandidate(blocked, candidate)));
}

function normalizeRiskLevel(value) {
  const risk = optionalString(value, 40) || "medium";
  return ["low", "medium", "high", "critical"].includes(risk) ? risk : "medium";
}

function sanitizeInboxText(value, max = 600) {
  return optionalString(value, max) || "";
}

function stableDocIdHash(value) {
  const text = String(value || "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function sanitizeFirestoreDocIdPart(value, maxLength = 180) {
  const fallback = "unknown";
  const raw = sanitizeInboxText(value, Math.max(maxLength * 2, 240));
  let sanitized = raw
    .replace(/[\\/]+/g, "__")
    .replace(/[\u0000-\u001f\u007f#?%[\]*`'"<>|{}^~]+/g, "_")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_.:]+|[-_.:]+$/g, "");
  if (!sanitized || sanitized === "." || sanitized === "..") sanitized = fallback;
  if (sanitized.length > maxLength) {
    const hash = stableDocIdHash(sanitized);
    const prefixLength = Math.max(1, maxLength - hash.length - 1);
    sanitized = `${sanitized.slice(0, prefixLength)}-${hash}`;
  }
  return sanitized || fallback;
}

function buildAgentCenterInboxId({ sourceType, sourceDossierId, listType }) {
  const sourcePrefix = sourceType === "product_evolution_first_run" ? "product-evolution-first-run" : sanitizeFirestoreDocIdPart(sourceType || "agent-center", 80);
  const safeDossierId = sanitizeFirestoreDocIdPart(sourceDossierId, 180);
  const safeListType = sanitizeFirestoreDocIdPart(listType, 80);
  const inboxId = `${sourcePrefix}:${safeDossierId}:${safeListType}`;
  return {
    inboxId,
    invalidInboxIdSanitized: inboxId.includes("/") || inboxId.includes("\\"),
    sourceDossierIdHadSlash: /[\\/]/.test(String(sourceDossierId || "")),
  };
}

function extractProductEvolutionId(value) {
  const text = sanitizeInboxText(value, 240);
  const match = text.match(/(PE-\d{8}-\d+)/i);
  return match ? match[1].toUpperCase() : "";
}
function normalizeFirstRunEntry(entry, listType) {
  const item = typeof entry === "string" ? { sourceDossierId: entry, dossierId: entry, id: entry, title: entry } : (entry || {});
  const sourceDossierId = sanitizeInboxText(
    item.sourceDossierId
    || item.dossierId
    || item.id
    || item.sourceDossier
    || extractProductEvolutionId(item.title),
    180,
  ) || extractProductEvolutionId(item.id) || extractProductEvolutionId(item.title);
  const normalizedId = sanitizeInboxText(item.id || sourceDossierId || extractProductEvolutionId(item.title), 180);
  const normalizedTitle = sanitizeInboxText(item.title || item.name || sourceDossierId || normalizedId, 240);
  return {
    ...item,
    id: normalizedId,
    sourceDossierId,
    dossierId: sanitizeInboxText(item.dossierId || sourceDossierId || normalizedId, 180),
    title: normalizedTitle,
    listType: sanitizeInboxText(item.listType || listType, 80),
    sourceRef: sanitizeInboxText(item.sourceRef, 240),
  };
}


function toArrayOrObjectValues(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function getByPath(root, path) {
  let cur = root;
  for (const part of path.split('.')) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

function firstPresentText(source, keys, max = 1200) {
  for (const key of keys) {
    const text = sanitizeInboxText(getByPath(source, key), max);
    if (text) return text;
  }
  return "";
}

function firstPresentList(source, keys, maxEntries = 80, maxLength = 260) {
  for (const key of keys) {
    const list = parseStringList(getByPath(source, key), maxEntries, maxLength);
    if (list.length) return list;
  }
  return [];
}

function buildInboxDecisionDetails(payload, { sourceType, listType, sourceDossierId, allowedFiles, blockedFiles, requiredChecks }) {
  const title = firstPresentText(payload, ["title", "name", "headline", "label", "dossierTitle"], 240) || sourceDossierId;
  const summary = firstPresentText(payload, ["summary", "plainSummary", "description", "abstract", "sourcePayloadSummary", "overview"], 1200);
  const what = firstPresentText(payload, ["what", "whatWillChange", "requestedAction", "proposedChange", "change", "task", "scope"], 1200);
  const why = firstPresentText(payload, ["why", "whySuggested", "reason", "whyNow", "rationale", "motivation"], 1200);
  const wellFitBenefit = firstPresentText(payload, ["wellFitBenefit", "wellfitBenefit", "wellFitValue", "platformBenefit"], 1200);
  const userBenefit = firstPresentText(payload, ["userBenefit", "memberBenefit", "playerBenefit", "customerBenefit"], 1200);
  const economyImpact = firstPresentText(payload, ["economyImpact", "rewardImpact", "wfpImpact", "xpImpact", "economy"], 1200);
  const risk = firstPresentText(payload, ["risk", "riskSummary", "risks", "riskAssessment", "safetyRisk"], 1200);
  const recommendation = listType === "recommendedResearchMore" ? "research_more" : (firstPresentText(payload, ["recommendation", "recommendedDecision", "decisionRecommendation"], 80) || "approve");
  const recommendationLabel = firstPresentText(payload, ["recommendationLabel", "recommendation.label", "decisionLabel"], 160) || recommendation;
  const recommendationText = firstPresentText(payload, ["recommendationText", "recommendation.text", "decisionText"], 1200) || recommendationLabel;
  const nextStep = firstPresentText(payload, ["nextStep", "nextSteps", "suggestedTaskProposal", "handoff"], 1200) || "Approved Inbox → Task Proposal. Kein Runner/Deploy automatisch.";
  const executionFields = extractExecutionContractFields(payload);
  const contractFields = buildExecutionContractApprovalFields({ ...payload, allowedFiles, blockedFiles, requiredChecks, ...executionFields });
  const singleDecisionValidation = executionFields.mode === "single_owner_decision" || executionFields.executionContract ? validateSingleDecisionExecutionContract({ ...payload, allowedFiles, blockedFiles, requiredChecks, ...executionFields }) : null;
  const missingCriticalDecisionFields = [];
  for (const [field, value] of Object.entries({ summary, what, why, wellFitBenefit, userBenefit, economyImpact, risk, recommendation, recommendationLabel, recommendationText })) if (!value) missingCriticalDecisionFields.push(field);
  if (!allowedFiles.length) missingCriticalDecisionFields.push("allowedFiles");
  if (!blockedFiles.length) missingCriticalDecisionFields.push("blockedFiles");
  if (!requiredChecks.length) missingCriticalDecisionFields.push("requiredChecks");
  const mergedMissing = singleDecisionValidation ? Array.from(new Set([...missingCriticalDecisionFields, ...singleDecisionValidation.missing])) : missingCriticalDecisionFields;
  return { title, summary, plainSummary: summary, what, whatWillChange: what, why, whySuggested: why, wellFitBenefit, userBenefit, economyImpact, risk, riskSummary: risk, recommendation, recommendationLabel, recommendationText, sourceDossierId, sourceType, listType, allowedFiles, blockedFiles, requiredChecks, nextStep, ...contractFields, ...Object.fromEntries(Object.entries(executionFields).filter(([, value]) => value !== null && value !== "" && !(Array.isArray(value) && value.length === 0))), singleDecisionStatus: singleDecisionValidation ? singleDecisionValidation.singleDecisionStatus : "", singleDecisionBlocker: singleDecisionValidation ? singleDecisionValidation.blocker : "", detailStatus: singleDecisionValidation ? singleDecisionValidation.detailStatus : (mergedMissing.length ? "missing" : "structured"), missingCriticalDecisionFields: mergedMissing, dossierIncomplete: mergedMissing.length > 0 };
}

function getFirstRunCandidateCollections(snapshot) {
  const candidates = [];
  const seen = new Set();
  const specs = [
    ["decisionDossiers","decisionDossiers"],
    ["dossiers","decisionDossiers"],
    ["generatedDossiers","generatedDossiers"],
    ["suggestedTaskQueue","suggestedTaskQueue"],
    ["recommendedApprovals","recommendedApprovals"],
    ["recommendedResearchMore","recommendedResearchMore"],
    ["blockedItems","blockedItems"],
    ["output.decisionDossiers","decisionDossiers"],
    ["output.dossiers","decisionDossiers"],
    ["output.generatedDossiers","generatedDossiers"],
    ["output.suggestedTaskQueue","suggestedTaskQueue"],
    ["output.recommendedApprovals","recommendedApprovals"],
    ["output.recommendedResearchMore","recommendedResearchMore"],
    ["output.blockedItems","blockedItems"],
    ["data.decisionDossiers","decisionDossiers"],
    ["data.dossiers","decisionDossiers"],
    ["data.generatedDossiers","generatedDossiers"],
    ["data.suggestedTaskQueue","suggestedTaskQueue"],
    ["data.recommendedApprovals","recommendedApprovals"],
    ["data.recommendedResearchMore","recommendedResearchMore"],
    ["data.blockedItems","blockedItems"],
    ["run.decisionDossiers","decisionDossiers"],
    ["run.dossiers","decisionDossiers"],
    ["run.generatedDossiers","generatedDossiers"],
    ["run.suggestedTaskQueue","suggestedTaskQueue"],
    ["run.recommendedApprovals","recommendedApprovals"],
    ["run.recommendedResearchMore","recommendedResearchMore"],
    ["run.blockedItems","blockedItems"],
    ["result.decisionDossiers","decisionDossiers"],
    ["result.dossiers","decisionDossiers"],
    ["result.generatedDossiers","generatedDossiers"],
    ["result.suggestedTaskQueue","suggestedTaskQueue"],
    ["result.recommendedApprovals","recommendedApprovals"],
    ["result.recommendedResearchMore","recommendedResearchMore"],
    ["result.blockedItems","blockedItems"],
  ];
  for (const [path, listType] of specs) {
    const value = getByPath(snapshot, path);
    const items = toArrayOrObjectValues(value);
    if (!items.length) continue;
    const key = `${path}:${listType}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({ path, listType, items });
  }
  return candidates;
}
function normalizeDossierLookupText(value) {
  return sanitizeInboxText(value, 600).toLowerCase().replace(/[^a-z0-9äöüß]+/gi, " ").replace(/\s+/g, " ").trim();
}

function getReadableDossierKeys(item) {
  return [item.sourceDossierId, item.dossierId, item.id, item.title, item.sourceRef]
    .map((value) => normalizeDossierLookupText(value))
    .filter(Boolean);
}

function significantDossierTokens(item) {
  const text = normalizeDossierLookupText([item.title, item.summary, item.plainSummary, item.whatWillChange, item.whySuggested].filter(Boolean).join(" "));
  const stop = new Set(["der", "die", "das", "und", "oder", "mit", "fuer", "für", "eine", "einen", "als", "nur", "ohne", "noch", "nicht", "dossier", "proposal", "entscheidungsvorlage", "produktentwicklung"]);
  return new Set(text.split(" ").filter((token) => token.length >= 5 && !stop.has(token)).slice(0, 80));
}

function buildReadableDecisionDossierLookup(collections) {
  const byKey = new Map();
  const readableDossiers = [];
  for (const collection of collections || []) {
    if (collection.listType !== "decisionDossiers") continue;
    for (const raw of collection.items || []) {
      const item = normalizeFirstRunEntry(raw, collection.listType);
      if (item.detailStatus && item.detailStatus !== "structured") continue;
      if (!sanitizeInboxText(item.recommendationLabel, 120) && !sanitizeInboxText(item.recommendationText, 1200)) continue;
      const entry = { item, listType: collection.listType, sourceDossierId: item.sourceDossierId, tokens: significantDossierTokens(item) };
      readableDossiers.push(entry);
      for (const key of getReadableDossierKeys(item)) byKey.set(key, entry);
    }
  }
  return { byKey, readableDossiers };
}

function findReadableDecisionDossierForItem(item, listType, lookup) {
  if (listType === "decisionDossiers" || !lookup) return null;
  for (const key of getReadableDossierKeys(item)) {
    if (lookup.byKey.has(key)) return lookup.byKey.get(key);
  }
  const itemTokens = significantDossierTokens(item);
  if (!itemTokens.size) return null;
  let best = null;
  for (const candidate of lookup.readableDossiers || []) {
    let score = 0;
    for (const token of itemTokens) if (candidate.tokens.has(token)) score += 1;
    const recommendation = sanitizeInboxText(item.recommendation, 80);
    if (recommendation && recommendation === sanitizeInboxText(candidate.item.recommendation, 80)) score += 2;
    if (!best || score > best.score) best = { ...candidate, score };
  }
  return best && best.score >= 3 ? best : null;
}

function overlayReadableDecisionDossierFields(item, listType, readableMatch) {
  if (!readableMatch || !readableMatch.item) return item;
  const readable = readableMatch.item;
  const readableInboxIdInfo = buildAgentCenterInboxId({ sourceType: "product_evolution_first_run", sourceDossierId: readable.sourceDossierId, listType: "decisionDossiers" });
  return {
    ...item,
    title: readable.title || item.title,
    summary: readable.summary || item.summary,
    plainSummary: readable.plainSummary || readable.summary || item.plainSummary,
    whatWillChange: readable.whatWillChange || item.whatWillChange,
    whySuggested: readable.whySuggested || item.whySuggested,
    wellFitBenefit: readable.wellFitBenefit || item.wellFitBenefit,
    userBenefit: readable.userBenefit || item.userBenefit,
    businessBenefit: readable.businessBenefit || item.businessBenefit,
    economyImpact: readable.economyImpact || item.economyImpact,
    riskSummary: readable.riskSummary || item.riskSummary,
    recommendation: readable.recommendation || item.recommendation,
    recommendationLabel: readable.recommendationLabel || item.recommendationLabel,
    recommendationText: readable.recommendationText || item.recommendationText,
    nextStep: readable.nextStep || item.nextStep,
    allowedFiles: Array.isArray(readable.allowedFiles) && readable.allowedFiles.length ? readable.allowedFiles : item.allowedFiles,
    blockedFiles: Array.isArray(readable.blockedFiles) && readable.blockedFiles.length ? readable.blockedFiles : item.blockedFiles,
    requiredChecks: Array.isArray(readable.requiredChecks) && readable.requiredChecks.length ? readable.requiredChecks : item.requiredChecks,
    readableDecisionDossierSourceDossierId: readable.sourceDossierId || null,
    readableDecisionDossierId: readable.dossierId || readable.id || null,
    readableDossierInboxId: readableInboxIdInfo.inboxId,
    supersededByReadableDecisionDossier: true,
    legacyProductEvolutionSource: listType,
    adminCenterSourcePriority: 90,
  };
}

function toInboxStatusByListType(listType) {
  if (listType === "blockedItems") return "blocked";
  return "pending_approval";
}


const INBOX_SYNC_CALLABLE_NAME = "syncProductEvolutionFirstRunInbox";
const INBOX_SYNC_CALLABLE_VERSION = "2026-05-30-readable-decision-dossiers-v5";
const INBOX_SYNC_RESPONSE_SHAPE_VERSION = "agent-center-inbox-sync-v5";

function resolveRegisterSnapshot(requestData) {
  const source = requestData && typeof requestData === "object" ? requestData : {};
  const directRegisterSnapshotPresent = Object.prototype.hasOwnProperty.call(source, "registerSnapshot");
  if (directRegisterSnapshotPresent) {
    const value = source.registerSnapshot;
    if (value === undefined || value === null) {
      return { registerSnapshot: value, payloadUnwrappedFrom: "registerSnapshot_empty", registerSnapshotValueType: value === null ? "null" : "undefined", registerSnapshotFieldPresent: true };
    }
    return { registerSnapshot: value, payloadUnwrappedFrom: "registerSnapshot", registerSnapshotValueType: Array.isArray(value) ? "array" : typeof value, registerSnapshotFieldPresent: true };
  }
  const candidates = [
    ["firstRunRegisterSnapshot", source.firstRunRegisterSnapshot],
    ["firstRunOutput", source.firstRunOutput],
    ["productEvolutionFirstRunOutput", source.productEvolutionFirstRunOutput],
    ["data.registerSnapshot", source.data && source.data.registerSnapshot],
    ["data.firstRunRegisterSnapshot", source.data && source.data.firstRunRegisterSnapshot],
    ["data.firstRunOutput", source.data && source.data.firstRunOutput],
    ["payload.registerSnapshot", source.payload && source.payload.registerSnapshot],
    ["payload.firstRunRegisterSnapshot", source.payload && source.payload.firstRunRegisterSnapshot],
    ["payload.firstRunOutput", source.payload && source.payload.firstRunOutput],
  ];
  for (const [path, value] of candidates) {
    if (value !== undefined && value !== null) {
      return { registerSnapshot: value, payloadUnwrappedFrom: path, registerSnapshotValueType: Array.isArray(value) ? "array" : typeof value, registerSnapshotFieldPresent: false };
    }
  }
  return { registerSnapshot: undefined, payloadUnwrappedFrom: "none", registerSnapshotValueType: "undefined", registerSnapshotFieldPresent: false };
}

function buildInboxSyncDiagnostics({ requestData, registerSnapshot, collections, serverCandidateCount, payloadUnwrappedFrom, registerSnapshotFieldPresent, registerSnapshotValueType }) {
  const hasRegisterSnapshot = Boolean(registerSnapshot && typeof registerSnapshot === "object");
  return {
    callableName: INBOX_SYNC_CALLABLE_NAME,
    callableVersion: INBOX_SYNC_CALLABLE_VERSION,
    responseShapeVersion: INBOX_SYNC_RESPONSE_SHAPE_VERSION,
    serverTimestamp: new Date().toISOString(),
    serverReceivedInputKeys: requestData && typeof requestData === "object" ? Object.keys(requestData) : [],
    hasRegisterSnapshot,
    registerSnapshotType: hasRegisterSnapshot ? (Array.isArray(registerSnapshot) ? "array" : typeof registerSnapshot) : (registerSnapshotValueType || "undefined"),
    registerSnapshotKeys: hasRegisterSnapshot && !Array.isArray(registerSnapshot) ? Object.keys(registerSnapshot) : [],
    registerSnapshotFieldPresent: Boolean(registerSnapshotFieldPresent),
    registerSnapshotValueType: registerSnapshotValueType || "undefined",
    clientHasRegisterSnapshot: Boolean(requestData && requestData.clientHasRegisterSnapshot),
    clientRegisterSnapshotKeys: Array.isArray(requestData && requestData.clientRegisterSnapshotKeys) ? requestData.clientRegisterSnapshotKeys.slice(0, 80).map((entry) => sanitizeInboxText(entry, 120)).filter(Boolean) : [],
    payloadUnwrappedFrom: payloadUnwrappedFrom || "none",
    serverCandidateCount: Number(serverCandidateCount || 0),
    serverCandidateCollections: (collections || []).map((c) => ({ listType: c.listType, count: c.items.length, path: c.path })),
  };
}
function hasProtectedFileScope(files) {
  const lower = (files || []).map((f) => String(f || "").toLowerCase());
  return lower.some((f) => HIGH_RISK_EXACT_FILES.includes(f) || HIGH_RISK_FILE_PREFIXES.some((prefix) => f.startsWith(prefix)));
}

function classifyAutomationRisk(workerItem) {
  const allowedFiles = parseStringList(workerItem.allowedFiles || []);
  const protectedScopes = parseStringList(workerItem.protectedScopes || [], 40, 80);
  const riskyScopes = ["xp", "ledger", "mission", "shop", "admin", "child", "privacy", "health", "location", "legal", "secrets", "deploy"]
    .filter((needle) => protectedScopes.some((scope) => String(scope).toLowerCase().includes(needle)));
  const highRisk = hasProtectedFileScope(allowedFiles) || riskyScopes.length > 0;
  const docsOnly = allowedFiles.length > 0 && allowedFiles.every((f) => f.startsWith("docs/") || f.startsWith("project-register/") || f.startsWith("todolist/"));
  return { riskLevel: docsOnly && !highRisk ? "low" : (highRisk ? "high" : "medium"), protectedScopes: protectedScopes.concat(riskyScopes), docsOnly, highRisk };
}

function summarizeChecks(workerItem) {
  const checks = normalizeCheckEntries(workerItem.checks || []);
  const requiredChecks = parseStringList(workerItem.requiredChecks || [], 80, 240);
  const commands = new Set(checks.map((c) => c.command));
  const allRequiredChecksPassed = requiredChecks.length ? requiredChecks.every((cmd) => commands.has(cmd) && checks.some((c) => c.command === cmd && c.result === "pass")) : true;
  const quality = checks.find((c) => c.command === "npm run agent:quality-gate");
  const qualityGatePassed = quality ? quality.result === "pass" : false;
  return { checks, requiredChecks, allRequiredChecksPassed, qualityGatePassed };
}

function canRequestAutoMerge(workerItem) {
  const risk = classifyAutomationRisk(workerItem);
  const checkSummary = summarizeChecks(workerItem);
  if (risk.highRisk) return { allowed: false, reason: "protected_scope" };
  if (!checkSummary.allRequiredChecksPassed) return { allowed: false, reason: "checks_failed" };
  return { allowed: true, reason: "ok", ...risk, ...checkSummary };
}

function canApproveAutoMerge(policy, actorRole) {
  if (!["owner", "agent_supervisor"].includes(actorRole)) return { allowed: false, reason: "role_denied" };
  if (policy.riskLevel === "high") return { allowed: false, reason: "high_risk_manual" };
  if (!policy.allRequiredChecksPassed || !policy.qualityGatePassed) return { allowed: false, reason: "checks_failed" };
  return { allowed: true, reason: "ok" };
}

function canRequestAutoDeploy(workerItem, environment) {
  if (!DEPLOY_ENVIRONMENTS.includes(environment) || environment === "none") return { allowed: false, reason: "invalid_environment" };
  const mergeGate = canRequestAutoMerge(workerItem);
  if (!mergeGate.allowed) return mergeGate;
  return { allowed: true, reason: "ok" };
}

function canApproveDeploy(policy, actorRole, environment) {
  if (!["owner", "agent_supervisor"].includes(actorRole)) return { allowed: false, reason: "role_denied" };
  if (!policy.autoDeployRequested) return { allowed: false, reason: "deploy_not_requested" };
  if (!policy.allRequiredChecksPassed) return { allowed: false, reason: "checks_failed" };
  if (!policy.qualityGatePassed && !policy.qualityGateOverrideApproved) return { allowed: false, reason: "quality_gate_failed" };
  if (policy.status === "blocked") return { allowed: false, reason: "policy_blocked" };
  if (environment === "production") {
    if (actorRole !== "owner") return { allowed: false, reason: "owner_only" };
    if (!policy.productionDeploySecondApprovalApproved) return { allowed: false, reason: "waiting_second_approval" };
  }
  return { allowed: true, reason: "ok" };
}

function assertProtectedScopesAllowed({ protectedScopes, approvalScope, actorRole, HttpsError }) {
  const blocked = protectedScopes.filter((scope) => BLOCKED_PROTECTED_SCOPES.has(scope.toLowerCase()));
  if (!blocked.length) return;
  const explicitlyAllowed = approvalScope.some((scope) => scope === "allow_protected_scopes");
  if (actorRole !== "owner" || !explicitlyAllowed) {
    throw new HttpsError("failed-precondition", `Protected scope blockiert: ${blocked.join(", ")}`);
  }
}

async function writeAgentAudit(db, payload) {
  const ref = db.collection("agentTaskAuditLog").doc();
  const doc = {
    auditId: ref.id,
    actorId: payload.actorId,
    actorRole: payload.actorRole,
    action: payload.action,
    proposalId: payload.proposalId || null,
    approvalId: payload.approvalId || null,
    executionId: payload.executionId || null,
    promptRef: payload.promptRef || null,
    allowedFiles: payload.allowedFiles || [],
    blockedFiles: payload.blockedFiles || [],
    riskLevel: payload.riskLevel || "medium",
    result: payload.result || "ok",
    evidenceRef: payload.evidenceRef || null,
    checksum: payload.checksum || null,
    createdAt: FieldValue.serverTimestamp(),
  };
  await ref.set(doc);
  return doc;
}

function registerAgentAdminRolesAudit(exportsTarget, { db, onCall, HttpsError }) {
  function buildCodexHandoffPrompt({ execution, proposal, requiredChecks, allowedFiles, blockedFiles, protectedScopes, branchName, commitMessage, prTitle, reportRequirements }) {
    const targetTrack = optionalString(proposal.targetTrack, 80) || "blocked";
    const guardrailByTrack = {
      docs_register: "Nur Docs/Register Aenderungen; keine Runtime-/Authority-Logik aendern.",
      runtime_ui: "Nur UI-Runtime; keine serverseitige Authority, keine Reward-Autorisierung im Client.",
      runtime_backend: "Functions/Rules nur in freigegebenem Scope und mit Checks/Testpflicht.",
      live_page: "Live-Page Guardrails einhalten; keine Token/Cashout/Payment/NFT/Marketplace-Handelslogik.",
      evidence: "Nur Evidence/Docs Updates; kein produktiver Runtime-Flow.",
      blocked: "BLOCKED targetTrack: keine Ausfuehrung erlaubt.",
    };
    const lines = [
      "1) Kontext",
      `Execution ${execution.executionId} ist approved + queued + ready_for_handoff. Prompt dient nur manuellem Codex-Handoff.`,
      "",
      "2) Ziel",
      execution.handoffSummary || "Sicherer, auditierbarer Handoff ohne Auto-Run.",
      "",
      "3) Branch",
      `Arbeite NICHT auf main. Nutze exakt Branch: ${branchName}`,
      "",
      "4) Pflichtlektuere",
      "- AGENTS.md",
      "- docs/beta/BETA1_AGENT_ADMIN_AND_LIVE_READINESS_MASTERPLAN.md",
      "- docs/beta/AGENT_ADMIN_SERVER_ROLES_AUDIT_PLAN.md",
      "- project-register/wellfit-beta1-canonical-truth.json",
      "- docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md",
      "- todolist/CODEX_CONTEXT_WELLFIT_BETA1.md",
      "",
      "4b) Beta-1 Canonical-Truth Guardrail",
      ...buildCanonicalTruthPromptGuardrail().split("\n"),
      "",
      "5) Erlaubte Dateien",
      ...(allowedFiles.length ? allowedFiles.map((f) => `- ${f}`) : ["- (keine)"]),
      "",
      "6) Verbotene Dateien",
      ...(blockedFiles.length ? blockedFiles.map((f) => `- ${f}`) : ["- (keine)"]),
      "",
      "7) Aufgaben",
      execution.handoffTitle || "Implementiere nur den freigegebenen Scope.",
      "",
      "8) Sicherheitsgrenzen",
      "- Kein Auto-Run, kein GitHub API Call, kein Auto-Merge, kein Auto-Deploy.",
      "- Human merge required bleibt true.",
      `- Track Guardrail: ${guardrailByTrack[targetTrack] || guardrailByTrack.blocked}`,
      ...(protectedScopes.length ? [`- Protected scopes explizit blockiert ohne separate Freigabe: ${protectedScopes.join(", ")}`] : ["- Keine protected scopes freigegeben."]),
      "",
      "9) Stop-Bedingungen",
      "- Stop bei Bedarf von Auto-Run/Auto-Merge/Auto-Deploy/GitHub-API.",
      "- Stop bei unsicherer Rollenpruefung, fehlendem Audit-Write oder Scope-Eskalation.",
      "",
      "10) Checks",
      ...requiredChecks.map((c) => `- ${c}`),
      "",
      "11) Commit",
      `- ${commitMessage}`,
      "",
      "12) PR-Titel",
      `- ${prTitle}`,
      "",
      "13) Bericht",
      ...reportRequirements.map((r) => `- ${r}`),
    ];
    return lines.join("\n");
  }
  exportsTarget.createAgentTaskProposal = onCall(async (request) => {
    const automationControl = (await getGlobalAutomationControl(db)).data;
    assertAutomationMayStartNewWork(automationControl, HttpsError, optionalString(request.data && request.data.taskType, 80));
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "admin_operator", "agent_supervisor"]);
    const data = request.data || {};
    const ref = db.collection("agentTaskProposals").doc();
    const proposal = {
      proposalId: ref.id,
      title: requiredString(data.title, "title", HttpsError, 200),
      promptRef: requiredString(data.promptRef, "promptRef", HttpsError, 240),
      requestedBy: actorId,
      requestedByRole: actorRole,
      requestedAction: requiredString(data.requestedAction, "requestedAction", HttpsError, 500),
      targetTrack: ALLOWED_TARGET_TRACKS.includes(optionalString(data.targetTrack, 80)) ? optionalString(data.targetTrack, 80) : "blocked",
      riskLevel: normalizeRiskLevel(data.riskLevel),
      allowedFiles: parseStringList(data.allowedFiles),
      blockedFiles: parseStringList(data.blockedFiles),
      protectedScopes: parseStringList(data.protectedScopes, 40, 80),
      ownerCanonicalTruthApproval: data.ownerCanonicalTruthApproval === true,
      status: "proposed",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    assertCanonicalTruthChangeAllowed({ files: proposal.allowedFiles, actorRole, ownerApprovalFlag: proposal.ownerCanonicalTruthApproval, HttpsError });
    await ref.set(proposal);
    await writeAgentAudit(db, { actorId, actorRole, action: "proposal_created", proposalId: ref.id, promptRef: proposal.promptRef, allowedFiles: proposal.allowedFiles, blockedFiles: proposal.blockedFiles, riskLevel: proposal.riskLevel, result: "created" });
    return { accepted: true, proposalId: ref.id, status: proposal.status };
  });

  exportsTarget.reviewAgentTaskProposal = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const data = request.data || {};
    const proposalId = requiredString(data.proposalId, "proposalId", HttpsError, 180);
    const status = optionalString(data.status, 40) || "review_required";
    const snap = await db.collection("agentTaskProposals").doc(proposalId).get();
    const proposal = snap.data() || {};
    assertCanonicalTruthChangeAllowed({ files: proposal.allowedFiles || [], actorRole, ownerApprovalFlag: proposal.ownerCanonicalTruthApproval === true, HttpsError });
    if (!PROPOSAL_STATUSES.includes(status)) throw new HttpsError("invalid-argument", "Ungültiger Proposal-Status.");
    await db.collection("agentTaskProposals").doc(proposalId).set({ status, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "proposal_reviewed", proposalId, result: status });
    return { accepted: true, proposalId, status };
  });

  exportsTarget.approveAgentTaskProposal = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor"]);
    const data = request.data || {};
    const proposalId = requiredString(data.proposalId, "proposalId", HttpsError, 180);
    const proposalSnap = await db.collection("agentTaskProposals").doc(proposalId).get();
    if (!proposalSnap.exists) throw new HttpsError("not-found", "Proposal nicht gefunden.");
    const proposal = proposalSnap.data() || {};
    const approvalScope = parseStringList(data.approvalScope, 40, 120);
    assertProtectedScopesAllowed({ protectedScopes: proposal.protectedScopes || [], approvalScope, actorRole, HttpsError });
    const ownerCanonicalTruthApproval = proposal.ownerCanonicalTruthApproval === true || data.ownerCanonicalTruthApproval === true;
    const finalApprovedAllowedFiles = parseStringList(
      data.approvedAllowedFiles && data.approvedAllowedFiles.length ? data.approvedAllowedFiles : proposal.allowedFiles
    );
    assertCanonicalTruthChangeAllowed({ files: finalApprovedAllowedFiles, actorRole, ownerApprovalFlag: ownerCanonicalTruthApproval, HttpsError });
    const approvalRef = db.collection("agentTaskApprovals").doc();
    const approval = {
      approvalId: approvalRef.id, proposalId, approverId: actorId, approverRole: actorRole, approvalScope,
      approvedAllowedFiles: finalApprovedAllowedFiles,
      approvedBlockedFiles: parseStringList(data.approvedBlockedFiles && data.approvedBlockedFiles.length ? data.approvedBlockedFiles : proposal.blockedFiles),
      approvalExpiresAt: data.approvalExpiresAt || null,
      ownerCanonicalTruthApproval,
      status: "approved", reason: optionalString(data.reason, 500) || "server-approved", createdAt: FieldValue.serverTimestamp(),
    };
    await approvalRef.set(approval);
    await db.collection("agentTaskProposals").doc(proposalId).set({ status: "approved", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "proposal_approved", proposalId, approvalId: approvalRef.id, promptRef: proposal.promptRef || null, allowedFiles: approval.approvedAllowedFiles, blockedFiles: approval.approvedBlockedFiles, riskLevel: proposal.riskLevel || "medium", result: "approved" });
    return { accepted: true, proposalId, approvalId: approvalRef.id, status: "approved" };
  });

  exportsTarget.rejectAgentTaskProposal = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor"]);
    const data = request.data || {};
    const proposalId = requiredString(data.proposalId, "proposalId", HttpsError, 180);
    const reason = optionalString(data.reason, 500) || "rejected";
    const approvalRef = db.collection("agentTaskApprovals").doc();
    const status = optionalString(data.status, 40) || "rejected";
    if (!APPROVAL_STATUSES.includes(status)) throw new HttpsError("invalid-argument", "Ungültiger Approval-Status.");
    await approvalRef.set({ approvalId: approvalRef.id, proposalId, approverId: actorId, approverRole: actorRole, approvalScope: [], approvedAllowedFiles: [], approvedBlockedFiles: [], status, reason, createdAt: FieldValue.serverTimestamp() });
    await db.collection("agentTaskProposals").doc(proposalId).set({ status: "rejected", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "proposal_rejected", proposalId, approvalId: approvalRef.id, result: status });
    return { accepted: true, proposalId, approvalId: approvalRef.id, status };
  });

  exportsTarget.queueAgentTaskExecution = onCall(async (request) => {
    const automationControl = (await getGlobalAutomationControl(db)).data;
    assertAutomationMayStartNewWork(automationControl, HttpsError, optionalString(request.data && request.data.taskType, 80));
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "agent_executor_service"]);
    const data = request.data || {};
    const proposalId = requiredString(data.proposalId, "proposalId", HttpsError, 180);
    const approvalId = requiredString(data.approvalId, "approvalId", HttpsError, 180);
    const approvalSnap = await db.collection("agentTaskApprovals").doc(approvalId).get();
    if (!approvalSnap.exists) throw new HttpsError("failed-precondition", "Approval fehlt.");
    const approval = approvalSnap.data() || {};
    if (approval.proposalId !== proposalId || approval.status !== "approved") throw new HttpsError("failed-precondition", "Approval nicht freigegeben.");
    const proposalSnap = await db.collection("agentTaskProposals").doc(proposalId).get();
    const proposal = proposalSnap.data() || {};
    assertCanonicalTruthChangeAllowed({ files: approval.approvedAllowedFiles || proposal.allowedFiles || [], actorRole, ownerApprovalFlag: approval.ownerCanonicalTruthApproval === true || proposal.ownerCanonicalTruthApproval === true, HttpsError });
    const executionRef = db.collection("agentTaskExecutions").doc();
    const status = optionalString(data.status, 40) || "queued";
    if (!EXECUTION_STATUSES.includes(status)) throw new HttpsError("invalid-argument", "Ungültiger Execution-Status.");
    const execution = { executionId: executionRef.id, proposalId, approvalId, executorType: ["codex", "agent", "human"].includes(optionalString(data.executorType, 40)) ? optionalString(data.executorType, 40) : "agent", branchName: requiredString(data.branchName, "branchName", HttpsError, 200), commitSha: optionalString(data.commitSha, 120), prRef: optionalString(data.prRef, 200), status, startedAt: FieldValue.serverTimestamp(), completedAt: null, checkSummary: optionalString(data.checkSummary, 800) || null, prHandoffStatus: "not_ready", handoffBranchName: null, handoffTitle: null, handoffSummary: null, requiredChecks: [], allowedFilesSnapshot: approval.approvedAllowedFiles || [], blockedFilesSnapshot: approval.approvedBlockedFiles || [], protectedScopesSnapshot: [], handoffCreatedAt: null, humanMergeRequired: true };
    await executionRef.set(execution);
    await writeAgentAudit(db, { actorId, actorRole, action: "execution_queued", proposalId, approvalId, executionId: executionRef.id, allowedFiles: approval.approvedAllowedFiles || [], blockedFiles: approval.approvedBlockedFiles || [], result: status });
    return { accepted: true, executionId: executionRef.id, status };
  });

  exportsTarget.recordAgentTaskCheckResult = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "agent_executor_service"]);
    const data = request.data || {};
    const executionId = requiredString(data.executionId, "executionId", HttpsError, 180);
    const executionSnap = await db.collection("agentTaskExecutions").doc(executionId).get();
    if (!executionSnap.exists) throw new HttpsError("not-found", "Execution nicht gefunden.");
    const execution = executionSnap.data() || {};
    const result = optionalString(data.result, 30) || "skipped";
    if (!CHECK_RESULTS.includes(result)) throw new HttpsError("invalid-argument", "Ungültiges Check-Result.");
    const checkRef = db.collection("agentTaskCheckResults").doc();
    await checkRef.set({ checkId: checkRef.id, executionId, command: requiredString(data.command, "command", HttpsError, 240), result, summary: optionalString(data.summary, 1000) || null, createdAt: FieldValue.serverTimestamp() });
    await writeAgentAudit(db, { actorId, actorRole, action: "check_recorded", proposalId: execution.proposalId || null, approvalId: execution.approvalId || null, executionId, result });
    return { accepted: true, checkId: checkRef.id, result };
  });

  exportsTarget.getAgentTaskAuditTrail = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const proposalId = optionalString(request.data && request.data.proposalId, 180);
    let query = db.collection("agentTaskAuditLog").orderBy("createdAt", "desc").limit(100);
    if (proposalId) query = query.where("proposalId", "==", proposalId);
    const snapshot = await query.get();
    return { accepted: true, entries: snapshot.docs.map((doc) => doc.data()) };
  });



  exportsTarget.prepareAgentTaskPrHandoff = onCall(async (request) => {
    const automationControl = (await getGlobalAutomationControl(db)).data;
    assertAutomationMayStartNewWork(automationControl, HttpsError, optionalString(request.data && request.data.taskType, 80));
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator", "agent_executor_service"]);
    const data = request.data || {};
    const executionId = requiredString(data.executionId, "executionId", HttpsError, 180);
    const handoffBranchName = requiredString(data.branchName, "branchName", HttpsError, 200);
    if (["main", "master"].includes(handoffBranchName.toLowerCase())) throw new HttpsError("invalid-argument", "Branch main/master ist nicht erlaubt.");
    if (!isSafeBranchName(handoffBranchName)) throw new HttpsError("invalid-argument", "Unsicherer Branch-Name.");
    const handoffTitle = requiredString(data.title, "title", HttpsError, 200);
    const handoffSummary = requiredString(data.summary, "summary", HttpsError, 2000);

    const executionRef = db.collection("agentTaskExecutions").doc(executionId);
    const executionSnap = await executionRef.get();
    if (!executionSnap.exists) throw new HttpsError("not-found", "Execution nicht gefunden.");
    const execution = executionSnap.data() || {};
    if (execution.status !== "queued") throw new HttpsError("failed-precondition", "Execution ist nicht im queued Status.");
    const approvalId = requiredString(execution.approvalId, "approvalId", HttpsError, 180);
    const approvalSnap = await db.collection("agentTaskApprovals").doc(approvalId).get();
    if (!approvalSnap.exists) throw new HttpsError("failed-precondition", "Approval fehlt.");
    const approval = approvalSnap.data() || {};
    if (approval.status !== "approved") throw new HttpsError("failed-precondition", "Approval ist nicht approved.");

    const proposalSnap = await db.collection("agentTaskProposals").doc(execution.proposalId).get();
    if (!proposalSnap.exists) throw new HttpsError("failed-precondition", "Proposal fehlt.");
    const proposal = proposalSnap.data() || {};
    assertProtectedScopesAllowed({ protectedScopes: proposal.protectedScopes || [], approvalScope: approval.approvalScope || [], actorRole, HttpsError });

    const allowedFilesSnapshot = parseStringList(approval.approvedAllowedFiles || []);
    const ownerCanonicalTruthApproval = approval.ownerCanonicalTruthApproval === true || proposal.ownerCanonicalTruthApproval === true;
    assertCanonicalTruthChangeAllowed({ files: allowedFilesSnapshot, actorRole, ownerApprovalFlag: ownerCanonicalTruthApproval, HttpsError });
    const blockedFilesSnapshot = parseStringList(approval.approvedBlockedFiles || []);
    const protectedScopesSnapshot = parseStringList(proposal.protectedScopes || [], 40, 80);
    const requiredChecks = buildRequiredChecks({ targetTrack: proposal.targetTrack, allowedFiles: allowedFilesSnapshot });

    await executionRef.set({
      handoffBranchName,
      handoffTitle,
      handoffSummary,
      prHandoffStatus: "ready_for_handoff",
      requiredChecks,
      allowedFilesSnapshot,
      blockedFilesSnapshot,
      protectedScopesSnapshot,
      humanMergeRequired: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    await writeAgentAudit(db, { actorId, actorRole, action: "execution_handoff_prepared", proposalId: execution.proposalId || null, approvalId, executionId, allowedFiles: allowedFilesSnapshot, blockedFiles: blockedFilesSnapshot, riskLevel: proposal.riskLevel || "medium", result: "ready_for_handoff" });
    return { accepted: true, executionId, prHandoffStatus: "ready_for_handoff", requiredChecks, humanMergeRequired: true };
  });

  exportsTarget.markAgentTaskHandoffCreated = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator", "agent_executor_service"]);
    const executionId = requiredString(request.data && request.data.executionId, "executionId", HttpsError, 180);
    const executionRef = db.collection("agentTaskExecutions").doc(executionId);
    const executionSnap = await executionRef.get();
    if (!executionSnap.exists) throw new HttpsError("not-found", "Execution nicht gefunden.");
    await executionRef.set({ prHandoffStatus: "handoff_created", handoffCreatedAt: FieldValue.serverTimestamp(), humanMergeRequired: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    const execution = executionSnap.data() || {};
    await writeAgentAudit(db, { actorId, actorRole, action: "execution_handoff_created", proposalId: execution.proposalId || null, approvalId: execution.approvalId || null, executionId, result: "handoff_created" });
    return { accepted: true, executionId, prHandoffStatus: "handoff_created", humanMergeRequired: true };
  });

  exportsTarget.generateAgentTaskCodexPrompt = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const executionId = requiredString(request.data && request.data.executionId, "executionId", HttpsError, 180);
    const executionRef = db.collection("agentTaskExecutions").doc(executionId);
    const executionSnap = await executionRef.get();
    if (!executionSnap.exists) throw new HttpsError("not-found", "Execution nicht gefunden.");
    const execution = executionSnap.data() || {};
    if (execution.prHandoffStatus !== "ready_for_handoff") throw new HttpsError("failed-precondition", "Execution ist nicht ready_for_handoff.");
    const proposalId = requiredString(execution.proposalId, "proposalId", HttpsError, 180);
    const approvalId = requiredString(execution.approvalId, "approvalId", HttpsError, 180);
    const [proposalSnap, approvalSnap] = await Promise.all([db.collection("agentTaskProposals").doc(proposalId).get(), db.collection("agentTaskApprovals").doc(approvalId).get()]);
    if (!proposalSnap.exists || !approvalSnap.exists) throw new HttpsError("failed-precondition", "Proposal oder Approval fehlt.");
    const proposal = proposalSnap.data() || {};
    const approval = approvalSnap.data() || {};
    if (approval.proposalId !== proposalId || approval.status !== "approved") throw new HttpsError("failed-precondition", "Approval inkonsistent.");
    const targetTrack = optionalString(proposal.targetTrack, 80) || "blocked";
    if (targetTrack === "blocked") throw new HttpsError("failed-precondition", "Blocked targetTrack darf keinen Prompt erzeugen.");
    const branchName = requiredString(execution.handoffBranchName, "handoffBranchName", HttpsError, 200);
    const allowedFiles = parseStringList(execution.allowedFilesSnapshot || approval.approvedAllowedFiles || []);
    const blockedFiles = parseStringList(execution.blockedFilesSnapshot || approval.approvedBlockedFiles || []);
    const protectedScopes = parseStringList(execution.protectedScopesSnapshot || proposal.protectedScopes || [], 40, 80);
    const requiredChecks = parseStringList(execution.requiredChecks || buildRequiredChecks({ targetTrack, allowedFiles }), 40, 240);
    const commitMessage = optionalString(request.data && request.data.commitMessage, 240) || "feat: add safe codex handoff prompts";
    const prTitle = optionalString(request.data && request.data.prTitle, 200) || execution.handoffTitle || "Add safe Codex handoff prompts";
    const reportRequirements = [
      "Branch",
      "geaenderte Dateien",
      "Checks mit Ergebnis",
      "Risiken/Blocker",
      "Auto-Merge/Deploy weiter verboten",
      "Prompt manuell in Codex verwenden",
    ];
    const promptText = buildCodexHandoffPrompt({ execution, proposal, requiredChecks, allowedFiles, blockedFiles, protectedScopes, branchName, commitMessage, prTitle, reportRequirements });
    const promptRef = db.collection("agentTaskHandoffPrompts").doc();
    const doc = { handoffPromptId: promptRef.id, executionId, proposalId, approvalId, branchName, promptText, allowedFiles, blockedFiles, protectedScopes, requiredChecks, commitMessage, prTitle, reportRequirements, status: "generated", humanMergeRequired: true, autoMerge: false, autoDeploy: false, createdAt: FieldValue.serverTimestamp(), createdBy: actorId, createdByRole: actorRole };
    await promptRef.set(doc);
    await writeAgentAudit(db, { actorId, actorRole, action: "codex_prompt_generated", proposalId, approvalId, executionId, allowedFiles, blockedFiles, result: "generated", promptRef: promptRef.id });
    return { accepted: true, handoffPromptId: promptRef.id, status: "generated", promptText, branchName, humanMergeRequired: true, autoMerge: false, autoDeploy: false };
  });

  exportsTarget.getAgentTaskCodexPrompt = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const handoffPromptId = requiredString(request.data && request.data.handoffPromptId, "handoffPromptId", HttpsError, 180);
    const snap = await db.collection("agentTaskHandoffPrompts").doc(handoffPromptId).get();
    if (!snap.exists) throw new HttpsError("not-found", "Handoff Prompt nicht gefunden.");
    return { accepted: true, prompt: snap.data() };
  });

  exportsTarget.markAgentTaskCodexPromptCopied = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const handoffPromptId = requiredString(request.data && request.data.handoffPromptId, "handoffPromptId", HttpsError, 180);
    const ref = db.collection("agentTaskHandoffPrompts").doc(handoffPromptId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Handoff Prompt nicht gefunden.");
    const prompt = snap.data() || {};
    if (!HANDOFF_PROMPT_STATUSES.includes(prompt.status || "")) throw new HttpsError("failed-precondition", "Ungültiger Prompt-Status.");
    await ref.set({ status: "copied", copiedAt: FieldValue.serverTimestamp(), copiedBy: actorId, copiedByRole: actorRole, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "codex_prompt_copied", proposalId: prompt.proposalId || null, approvalId: prompt.approvalId || null, executionId: prompt.executionId || null, promptRef: handoffPromptId, result: "copied" });
    return { accepted: true, handoffPromptId, status: "copied" };
  });

  exportsTarget.listAgentTaskHandoffPrompts = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const executionId = optionalString(request.data && request.data.executionId, 180);
    let query = db.collection("agentTaskHandoffPrompts").orderBy("createdAt", "desc").limit(100);
    if (executionId) query = query.where("executionId", "==", executionId);
    const snapshot = await query.get();
    return { accepted: true, prompts: snapshot.docs.map((doc) => doc.data()) };
  });

  exportsTarget.blockAgentTaskExecution = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor"]);
    const executionId = requiredString(request.data && request.data.executionId, "executionId", HttpsError, 180);
    const reason = optionalString(request.data && request.data.reason, 500) || "execution_blocked";
    const executionRef = db.collection("agentTaskExecutions").doc(executionId);
    const executionSnap = await executionRef.get();
    if (!executionSnap.exists) throw new HttpsError("not-found", "Execution nicht gefunden.");
    await executionRef.set({ status: "blocked", prHandoffStatus: "blocked", blockReason: reason, humanMergeRequired: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    const execution = executionSnap.data() || {};
    await writeAgentAudit(db, { actorId, actorRole, action: "execution_blocked", proposalId: execution.proposalId || null, approvalId: execution.approvalId || null, executionId, result: reason });
    return { accepted: true, executionId, status: "blocked", prHandoffStatus: "blocked" };
  });

  exportsTarget.listAgentTaskExecutions = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator", "agent_executor_service"]);
    const status = optionalString(request.data && request.data.status, 40);
    let query = db.collection("agentTaskExecutions").orderBy("startedAt", "desc").limit(100);
    if (status && EXECUTION_STATUSES.includes(status)) query = query.where("status", "==", status);
    const snapshot = await query.get();
    return { accepted: true, executions: snapshot.docs.map((doc) => doc.data()) };
  });

  exportsTarget.createAgentWorkerQueueItem = onCall(async (request) => {
    const automationControl = (await getGlobalAutomationControl(db)).data;
    assertAutomationMayStartNewWork(automationControl, HttpsError, optionalString(request.data && request.data.taskType, 80));
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const executionId = requiredString(request.data && request.data.executionId, "executionId", HttpsError, 180);
    const handoffPromptId = requiredString(request.data && request.data.handoffPromptId, "handoffPromptId", HttpsError, 180);
    const [executionSnap, promptSnap] = await Promise.all([db.collection("agentTaskExecutions").doc(executionId).get(), db.collection("agentTaskHandoffPrompts").doc(handoffPromptId).get()]);
    if (!executionSnap.exists || !promptSnap.exists) throw new HttpsError("failed-precondition", "Execution oder Prompt fehlt.");
    const execution = executionSnap.data() || {};
    const prompt = promptSnap.data() || {};
    if (execution.prHandoffStatus !== "ready_for_handoff") throw new HttpsError("failed-precondition", "Execution ist nicht ready_for_handoff.");
    if (!["generated", "copied"].includes(optionalString(prompt.status, 40) || "")) throw new HttpsError("failed-precondition", "Prompt ist nicht generated/copied.");
    if (prompt.executionId !== executionId || prompt.proposalId !== execution.proposalId || prompt.approvalId !== execution.approvalId) throw new HttpsError("failed-precondition", "Prompt/Execution inkonsistent.");
    const branchName = requiredString(prompt.branchName || execution.handoffBranchName, "branchName", HttpsError, 200);
    if (["main", "master"].includes(branchName.toLowerCase())) throw new HttpsError("failed-precondition", "Branch main/master ist nicht erlaubt.");
    const ref = db.collection("agentTaskWorkerQueue").doc();
    const workerMode = WORKER_QUEUE_MODES.includes(optionalString(request.data && request.data.workerMode, 60) || "") ? optionalString(request.data && request.data.workerMode, 60) : "manual_codex";
    const doc = {
      workerQueueId: ref.id, executionId, proposalId: execution.proposalId, approvalId: execution.approvalId, handoffPromptId, branchName,
      taskTitle: optionalString(execution.handoffTitle, 200) || optionalString(prompt.prTitle, 200) || "Agent Worker Task",
      promptTextRef: handoffPromptId, promptTextSnapshot: optionalString(prompt.promptText, 12000) || null,
      allowedFiles: parseStringList(prompt.allowedFiles || execution.allowedFilesSnapshot || []),
      blockedFiles: parseStringList(prompt.blockedFiles || execution.blockedFilesSnapshot || []),
      protectedScopes: parseStringList(prompt.protectedScopes || execution.protectedScopesSnapshot || [], 40, 80),
      requiredChecks: parseStringList(prompt.requiredChecks || execution.requiredChecks || [], 80, 240),
      canonicalTruthReadRequired: true,
      canonicalTruthProtectedFiles: CANONICAL_TRUTH_PROTECTED_FILES,
      canonicalTruthEditable: false,
      canonicalTruthOwnerApprovalRequired: true,
      canonicalTruthChangeProposalFile: CANONICAL_TRUTH_PROPOSAL_FILE,
      workerStatus: "ready_for_worker", workerMode, humanMergeRequired: true, autoMerge: false, autoDeploy: false,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(doc);
    await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_created", proposalId: doc.proposalId, approvalId: doc.approvalId, executionId, promptRef: handoffPromptId, allowedFiles: doc.allowedFiles, blockedFiles: doc.blockedFiles, result: "ready_for_worker" });
    return { accepted: true, workerQueueId: ref.id, workerStatus: "ready_for_worker", humanMergeRequired: true, autoMerge: false, autoDeploy: false };
  });

  exportsTarget.claimAgentWorkerQueueItem = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "agent_executor_service"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const ref = db.collection("agentTaskWorkerQueue").doc(workerQueueId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Worker Queue Item nicht gefunden.");
    const item = snap.data() || {};
    if (item.workerStatus !== "ready_for_worker") throw new HttpsError("failed-precondition", "Worker Queue Item ist nicht ready_for_worker.");
    await ref.set({ workerStatus: "claimed", claimedAt: FieldValue.serverTimestamp(), claimedBy: actorId, updatedAt: FieldValue.serverTimestamp(), humanMergeRequired: true, autoMerge: false, autoDeploy: false }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_claimed", proposalId: item.proposalId || null, approvalId: item.approvalId || null, executionId: item.executionId || null, result: "claimed" });
    return { accepted: true, workerQueueId, workerStatus: "claimed" };
  });

  exportsTarget.updateAgentWorkerQueueStatus = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "agent_executor_service"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const workerStatus = requiredString(request.data && request.data.workerStatus, "workerStatus", HttpsError, 60);
    if (!WORKER_QUEUE_STATUSES.includes(workerStatus)) throw new HttpsError("invalid-argument", "Ungültiger Worker-Status.");
    const ref = db.collection("agentTaskWorkerQueue").doc(workerQueueId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Worker Queue Item nicht gefunden.");
    const item = snap.data() || {};
    if (!validateWorkerStatusTransition(optionalString(item.workerStatus, 60) || "ready_for_worker", workerStatus)) throw new HttpsError("failed-precondition", "Ungültiger Statusübergang.");
    if (workerStatus === "completed") {
      const checks = Array.isArray(item.checks) ? item.checks : [];
      const requiredChecks = parseStringList(item.requiredChecks || [], 80, 240);
      if (checks.some((check) => optionalString(check.result, 20) === "fail")) throw new HttpsError("failed-precondition", "Failed checks verhindern completed.");
      const commands = new Set(checks.map((check) => optionalString(check.command, 240)).filter(Boolean));
      const missing = requiredChecks.filter((command) => !commands.has(command));
      if (missing.length) {
        await ref.set({ workerStatus: "blocked", errorSummary: `Missing required checks: ${missing.join(", ")}`, updatedAt: FieldValue.serverTimestamp(), humanMergeRequired: true, autoMerge: false, autoDeploy: false }, { merge: true });
        await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_blocked", proposalId: item.proposalId || null, approvalId: item.approvalId || null, executionId: item.executionId || null, result: "missing_required_checks" });
        return { accepted: true, workerQueueId, workerStatus: "blocked", message: "Required checks fehlen." };
      }
    }
    await ref.set({ workerStatus, updatedAt: FieldValue.serverTimestamp(), humanMergeRequired: true }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_status_updated", proposalId: item.proposalId || null, approvalId: item.approvalId || null, executionId: item.executionId || null, result: workerStatus });
    return { accepted: true, workerQueueId, workerStatus };
  });

  exportsTarget.recordAgentWorkerQueueChecks = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "agent_executor_service"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const checks = normalizeCheckEntries(request.data && request.data.checks);
    if (!checks.length) throw new HttpsError("invalid-argument", "Checks fehlen.");
    const ref = db.collection("agentTaskWorkerQueue").doc(workerQueueId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Worker Queue Item nicht gefunden.");
    const item = snap.data() || {};
    const requiredChecks = parseStringList(item.requiredChecks || [], 80, 240);
    const commands = new Set(checks.map((check) => check.command));
    const missing = requiredChecks.filter((command) => !commands.has(command));
    const hasFail = checks.some((check) => check.result === "fail");
    const workerStatus = missing.length ? "blocked" : (hasFail ? "failed" : "checks_recorded");
    await ref.set({
      checks,
      workerStatus,
      errorSummary: missing.length ? `Missing required checks: ${missing.join(", ")}` : null,
      updatedAt: FieldValue.serverTimestamp(),
      humanMergeRequired: true,
      ...(workerStatus === "failed" || workerStatus === "blocked" ? { autoMerge: false, autoDeploy: false } : {}),
    }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_checks_recorded", proposalId: item.proposalId || null, approvalId: item.approvalId || null, executionId: item.executionId || null, result: workerStatus });
    return { accepted: true, workerQueueId, workerStatus, missingRequiredChecks: missing };
  });

  exportsTarget.markAgentWorkerPrPrepared = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "agent_executor_service"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const prRef = optionalString(request.data && request.data.prRef, 220);
    const ref = db.collection("agentTaskWorkerQueue").doc(workerQueueId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Worker Queue Item nicht gefunden.");
    const item = snap.data() || {};
    await ref.set({ workerStatus: "pr_prepared", prRef: prRef || item.prRef || null, updatedAt: FieldValue.serverTimestamp(), humanMergeRequired: true }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_pr_prepared", proposalId: item.proposalId || null, approvalId: item.approvalId || null, executionId: item.executionId || null, result: "pr_prepared" });
    return { accepted: true, workerQueueId, workerStatus: "pr_prepared", humanMergeRequired: true };
  });

  exportsTarget.blockAgentWorkerQueueItem = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const reason = optionalString(request.data && request.data.reason, 1000) || "worker_blocked";
    const ref = db.collection("agentTaskWorkerQueue").doc(workerQueueId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Worker Queue Item nicht gefunden.");
    const item = snap.data() || {};
    await ref.set({ workerStatus: "blocked", errorSummary: reason, updatedAt: FieldValue.serverTimestamp(), humanMergeRequired: true, autoMerge: false, autoDeploy: false }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_blocked", proposalId: item.proposalId || null, approvalId: item.approvalId || null, executionId: item.executionId || null, result: reason });
    return { accepted: true, workerQueueId, workerStatus: "blocked" };
  });

  exportsTarget.listAgentWorkerQueueItems = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator", "agent_executor_service"]);
    const status = optionalString(request.data && request.data.status, 60);
    let query = db.collection("agentTaskWorkerQueue").orderBy("createdAt", "desc").limit(100);
    if (status && WORKER_QUEUE_STATUSES.includes(status)) query = query.where("workerStatus", "==", status);
    const snapshot = await query.get();
    return { accepted: true, items: snapshot.docs.map((doc) => doc.data()) };
  });

  exportsTarget.getAgentWorkerQueueItem = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator", "agent_executor_service"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const snap = await db.collection("agentTaskWorkerQueue").doc(workerQueueId).get();
    if (!snap.exists) throw new HttpsError("not-found", "Worker Queue Item nicht gefunden.");
    return { accepted: true, item: snap.data() };
  });

  exportsTarget.createAgentAutomationPolicy = onCall(async (request) => {
    const automationControl = (await getGlobalAutomationControl(db)).data;
    assertAutomationMayStartNewWork(automationControl, HttpsError, optionalString(request.data && request.data.taskType, 80));
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const workerSnap = await db.collection("agentTaskWorkerQueue").doc(workerQueueId).get();
    if (!workerSnap.exists) throw new HttpsError("not-found", "Worker Queue Item nicht gefunden.");
    const worker = workerSnap.data() || {};
    const risk = classifyAutomationRisk(worker);
    const summary = summarizeChecks(worker);
    const ref = db.collection("agentTaskAutomationPolicies").doc();
    const policy = { policyId: ref.id, workerQueueId, executionId: worker.executionId || null, canonicalTruthReadRequired: true, canonicalTruthProtectedFiles: CANONICAL_TRUTH_PROTECTED_FILES, canonicalTruthEditable: false, canonicalTruthOwnerApprovalRequired: true, canonicalTruthChangeProposalFile: CANONICAL_TRUTH_PROPOSAL_FILE, proposalId: worker.proposalId || null, approvalId: worker.approvalId || null, handoffPromptId: worker.handoffPromptId || null, targetBranch: worker.branchName || null, prRef: worker.prRef || null, riskLevel: risk.riskLevel, targetTrack: optionalString(worker.targetTrack, 80) || "runtime_backend", allowedFiles: parseStringList(worker.allowedFiles || []), blockedFiles: parseStringList(worker.blockedFiles || []), protectedScopes: parseStringList(risk.protectedScopes || [], 40, 80), requiredChecks: summary.requiredChecks, checkSummary: summary.checks, allRequiredChecksPassed: summary.allRequiredChecksPassed, qualityGatePassed: summary.qualityGatePassed, qualityGateOverrideRequested: false, qualityGateOverrideApproved: false, autoMergeRequested: false, autoMergeApproved: false, autoMergeApprovedBy: null, autoMergeApprovedByRole: null, autoMergeDecisionAt: null, autoDeployRequested: false, autoDeployEnvironment: "none", autoDeployApproved: false, autoDeployApprovedBy: null, autoDeployApprovedByRole: null, autoDeployDecisionAt: null, productionDeploySecondApprovalRequired: false, productionDeploySecondApprovalApproved: false, productionDeploySecondApprovalBy: null, status: summary.allRequiredChecksPassed ? "waiting_for_admin_decision" : "waiting_for_checks", humanOverrideReason: null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
    await ref.set(policy);
    await db.collection("agentTaskWorkerQueue").doc(workerQueueId).set({ automationPolicyId: ref.id, automationStatus: "not_requested", autoMerge: false, autoDeploy: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "automation_policy_created", proposalId: policy.proposalId, approvalId: policy.approvalId, executionId: policy.executionId, result: policy.status });
    return { accepted: true, policyId: ref.id, status: policy.status };
  });

  exportsTarget.getAgentAutomationPolicy = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator", "agent_executor_service"]);
    const policyId = requiredString(request.data && request.data.policyId, "policyId", HttpsError, 180);
    const snap = await db.collection("agentTaskAutomationPolicies").doc(policyId).get();
    if (!snap.exists) throw new HttpsError("not-found", "Automation Policy nicht gefunden.");
    return { accepted: true, policy: snap.data() };
  });

  exportsTarget.listAgentAutomationPolicies = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator", "agent_executor_service"]);
    const status = optionalString(request.data && request.data.status, 80);
    let query = db.collection("agentTaskAutomationPolicies").orderBy("createdAt", "desc").limit(100);
    if (status && AUTOMATION_POLICY_STATUSES.includes(status)) query = query.where("status", "==", status);
    const snapshot = await query.get();
    return { accepted: true, policies: snapshot.docs.map((doc) => doc.data()) };
  });

  async function updatePolicyDecision({ policyId, update, actorId, actorRole, action }) {
    const ref = db.collection("agentTaskAutomationPolicies").doc(policyId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Automation Policy nicht gefunden.");
    const policy = snap.data() || {};
    await ref.set({ ...update, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action, proposalId: policy.proposalId || null, approvalId: policy.approvalId || null, executionId: policy.executionId || null, result: update.status || "updated" });
    return policy;
  }

  exportsTarget.requestAgentAutoMerge = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const policyId = requiredString(request.data && request.data.policyId, "policyId", HttpsError, 180);
    const policySnap = await db.collection("agentTaskAutomationPolicies").doc(policyId).get();
    if (!policySnap.exists) throw new HttpsError("not-found", "Automation Policy nicht gefunden.");
    const policy = policySnap.data() || {};
    if (!policy.allRequiredChecksPassed) throw new HttpsError("failed-precondition", "Required checks fehlen.");
    await updatePolicyDecision({ policyId, update: { autoMergeRequested: true, status: "waiting_for_admin_decision" }, actorId, actorRole, action: "automation_auto_merge_requested" });
    return { accepted: true, policyId, status: "waiting_for_admin_decision" };
  });



  exportsTarget.approveAgentAutoMerge = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor"]);
    const policyId = requiredString(request.data && request.data.policyId, "policyId", HttpsError, 180);
    const snap = await db.collection("agentTaskAutomationPolicies").doc(policyId).get();
    if (!snap.exists) throw new HttpsError("not-found", "Automation Policy nicht gefunden.");
    const policy = snap.data() || {};
    if (!policy.autoMergeRequested) throw new HttpsError("failed-precondition", "Auto-Merge nicht angefordert.");
    if (!policy.allRequiredChecksPassed) throw new HttpsError("failed-precondition", "Required checks fehlen.");
    if (!policy.qualityGatePassed && !policy.qualityGateOverrideApproved) throw new HttpsError("failed-precondition", "Quality gate nicht gruen.");
    if (policy.riskLevel === "high" && actorRole !== "owner") throw new HttpsError("permission-denied", "High-risk nur Owner.");
    if (policy.riskLevel === "high" && !optionalString(policy.humanOverrideReason, 500)) throw new HttpsError("failed-precondition", "High-risk braucht Override-Begruendung.");
    await updatePolicyDecision({ policyId, update: { autoMergeApproved: true, autoMergeApprovedBy: actorId, autoMergeApprovedByRole: actorRole, autoMergeDecisionAt: FieldValue.serverTimestamp(), status: "approved_for_auto_merge" }, actorId, actorRole, action: "automation_auto_merge_approved" });
    await db.collection("agentTaskWorkerQueue").doc(policy.workerQueueId).set({ autoMerge: true, automationStatus: "merge_approved", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { accepted: true, policyId, status: "approved_for_auto_merge" };
  });

  exportsTarget.rejectAgentAutoMerge = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor"]);
    const policyId = requiredString(request.data && request.data.policyId, "policyId", HttpsError, 180);
    const reason = requiredString(request.data && request.data.reason, "reason", HttpsError, 500);
    await updatePolicyDecision({ policyId, update: { autoMergeApproved: false, status: "rejected", humanOverrideReason: reason }, actorId, actorRole, action: "automation_auto_merge_rejected" });
    return { accepted: true, policyId, status: "rejected" };
  });

  exportsTarget.requestAgentQualityGateOverride = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const policyId = requiredString(request.data && request.data.policyId, "policyId", HttpsError, 180);
    const reason = requiredString(request.data && request.data.reason, "reason", HttpsError, 500);
    await updatePolicyDecision({ policyId, update: { qualityGateOverrideRequested: true, qualityGateOverrideApproved: false, humanOverrideReason: reason, status: "waiting_for_admin_decision" }, actorId, actorRole, action: "automation_quality_gate_override_requested" });
    return { accepted: true, policyId, status: "waiting_for_admin_decision" };
  });

  exportsTarget.approveAgentQualityGateOverride = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor"]);
    const policyId = requiredString(request.data && request.data.policyId, "policyId", HttpsError, 180);
    await updatePolicyDecision({ policyId, update: { qualityGateOverrideRequested: true, qualityGateOverrideApproved: true, status: "waiting_for_admin_decision" }, actorId, actorRole, action: "automation_quality_gate_override_approved" });
    return { accepted: true, policyId, status: "waiting_for_admin_decision" };
  });

  exportsTarget.rejectAgentQualityGateOverride = onCall(async (request) => { const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor"]); const policyId = requiredString(request.data && request.data.policyId, "policyId", HttpsError, 180); const reason = requiredString(request.data && request.data.reason, "reason", HttpsError, 500); await updatePolicyDecision({ policyId, update: { qualityGateOverrideRequested: false, qualityGateOverrideApproved: false, status: "rejected", humanOverrideReason: reason }, actorId, actorRole, action: "automation_quality_gate_override_rejected" }); return { accepted: true, policyId, status: "rejected" }; });

  exportsTarget.requestAgentDeploy = onCall(async (request) => { const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]); const policyId = requiredString(request.data && request.data.policyId, "policyId", HttpsError, 180); const environment = optionalString(request.data && request.data.environment, 30) || "none"; if (!["preview","staging","production"].includes(environment)) throw new HttpsError("invalid-argument", "Ungueltige Umgebung."); const snap = await db.collection("agentTaskAutomationPolicies").doc(policyId).get(); const policy = snap.data()||{}; if (!policy.allRequiredChecksPassed) throw new HttpsError("failed-precondition", "Required checks fehlen."); await updatePolicyDecision({ policyId, update: { autoDeployRequested: true, autoDeployEnvironment: environment, productionDeploySecondApprovalRequired: environment==="production", status: "waiting_for_admin_decision" }, actorId, actorRole, action: "automation_deploy_requested" }); return { accepted: true, policyId, status: "waiting_for_admin_decision" }; });

  exportsTarget.approveAgentDeploy = onCall(async (request) => { const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor"]); const policyId = requiredString(request.data && request.data.policyId, "policyId", HttpsError, 180); const snap = await db.collection("agentTaskAutomationPolicies").doc(policyId).get(); const policy=snap.data()||{}; const gate=canApproveDeploy(policy, actorRole, policy.autoDeployEnvironment||"none"); if(!gate.allowed) throw new HttpsError("failed-precondition", gate.reason); const approvedStatus = policy.autoDeployEnvironment==="production"?"approved_for_production_deploy":"approved_for_staging_deploy"; await updatePolicyDecision({ policyId, update: { autoDeployApproved: true, autoDeployApprovedBy: actorId, autoDeployApprovedByRole: actorRole, autoDeployDecisionAt: FieldValue.serverTimestamp(), autoDeploy: true, status: approvedStatus }, actorId, actorRole, action: "automation_deploy_approved" }); await db.collection("agentTaskWorkerQueue").doc(policy.workerQueueId).set({ autoDeploy: true, automationStatus: "deploy_approved", supervisedRunnerStatus: "metadata_only", autoDeployApprovedSnapshot: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true }); return { accepted: true, policyId, status: approvedStatus }; });

  exportsTarget.rejectAgentDeploy = onCall(async (request)=>{const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor"]); const policyId=requiredString(request.data&&request.data.policyId,"policyId",HttpsError,180); const reason=requiredString(request.data&&request.data.reason,"reason",HttpsError,500); await updatePolicyDecision({policyId,update:{autoDeployApproved:false,status:"rejected",humanOverrideReason:reason},actorId,actorRole,action:"automation_deploy_rejected"}); return {accepted:true,policyId,status:"rejected"};});

  exportsTarget.requestAgentProductionDeploySecondApproval = onCall(async (request)=>{const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor","admin_operator"]); const policyId=requiredString(request.data&&request.data.policyId,"policyId",HttpsError,180); await updatePolicyDecision({policyId,update:{productionDeploySecondApprovalRequired:true,productionDeploySecondApprovalApproved:false,status:"waiting_for_admin_decision"},actorId,actorRole,action:"automation_production_second_approval_requested"}); return {accepted:true,policyId,status:"waiting_for_admin_decision"};});
  exportsTarget.approveAgentProductionDeploySecondApproval = onCall(async (request)=>{const { actorId, actorRole } = requireRole(request, HttpsError,["owner"]); const policyId=requiredString(request.data&&request.data.policyId,"policyId",HttpsError,180); const snap = await db.collection("agentTaskAutomationPolicies").doc(policyId).get(); const policy = snap.data()||{}; const qualityGateSatisfied = !!policy.qualityGatePassed || !!policy.qualityGateOverrideApproved; if (!policy.autoDeployRequested) throw new HttpsError("failed-precondition", "deploy_not_requested"); if (policy.autoDeployEnvironment !== "production") throw new HttpsError("failed-precondition", "production_environment_required"); if (!policy.allRequiredChecksPassed) throw new HttpsError("failed-precondition", "checks_failed"); if (!qualityGateSatisfied) throw new HttpsError("failed-precondition", "quality_gate_failed"); if (policy.status === "blocked") throw new HttpsError("failed-precondition", "policy_blocked"); const status = "approved_for_production_deploy"; await updatePolicyDecision({policyId,update:{productionDeploySecondApprovalRequired:true,productionDeploySecondApprovalApproved:true,productionDeploySecondApprovalBy:actorId,productionDeploySecondApprovalByRole:actorRole,productionDeploySecondApprovalAt:FieldValue.serverTimestamp(),autoDeployApproved:true,autoDeployApprovedBy:actorId,autoDeployApprovedByRole:actorRole,autoDeployDecisionAt:FieldValue.serverTimestamp(),autoDeploy:true,status},actorId,actorRole,action:"automation_production_second_approval_approved"}); await db.collection("agentTaskWorkerQueue").doc(policy.workerQueueId).set({ autoDeploy: true, automationStatus: "deploy_approved", supervisedRunnerStatus: "metadata_only", productionDeploySecondApprovalSnapshot: true, autoDeployApprovedSnapshot: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true }); return {accepted:true,policyId,status};});
  exportsTarget.rejectAgentProductionDeploySecondApproval = onCall(async (request)=>{const { actorId, actorRole } = requireRole(request, HttpsError,["owner"]); const policyId=requiredString(request.data&&request.data.policyId,"policyId",HttpsError,180); const reason=requiredString(request.data&&request.data.reason,"reason",HttpsError,500); await updatePolicyDecision({policyId,update:{productionDeploySecondApprovalApproved:false,status:"rejected",humanOverrideReason:reason},actorId,actorRole,action:"automation_production_second_approval_rejected"}); return {accepted:true,policyId,status:"rejected"};});

  exportsTarget.recordAgentAutomationExecutionMetadata = onCall(async (request)=>{const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor","agent_executor_service"]); const policyId=requiredString(request.data&&request.data.policyId,"policyId",HttpsError,180); await updatePolicyDecision({policyId,update:{status:"executed_metadata_only"},actorId,actorRole,action:"automation_execution_metadata_recorded"}); return {accepted:true,policyId,status:"executed_metadata_only"};});
  function computeRunnerAutomationGate(policy) {
    const qualityGateSatisfied = !!policy.qualityGatePassed || !!policy.qualityGateOverrideApproved;
    const blocked = policy.status === "blocked" || policy.status === "rejected" || policy.automationStatus === "automation_blocked";
    const checksPassed = policy.allRequiredChecksPassed === true && qualityGateSatisfied && !blocked;
    const environment = DEPLOY_ENVIRONMENTS.includes(policy.autoDeployEnvironment) ? policy.autoDeployEnvironment : "none";
    const deployApproved = policy.autoDeployApproved === true && policy.autoDeployRequested === true;
    const deployAllowed = deployApproved && checksPassed && environment !== "none" && (environment !== "production" || policy.productionDeploySecondApprovalApproved === true);
    const mergeAllowed = policy.autoMergeApproved === true && checksPassed;
    return { deployAllowed, mergeAllowed, environment };
  }

  exportsTarget.prepareAgentSupervisedRunnerJob = onCall(async (request)=>{const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor","admin_operator"]); const workerQueueId=requiredString(request.data&&request.data.workerQueueId,"workerQueueId",HttpsError,180); const policyId=requiredString(request.data&&request.data.policyId,"policyId",HttpsError,180); const taskType = optionalString(request.data && request.data.taskType, 80); const automationControl = (await getGlobalAutomationControl(db)).data; assertAutomationMayStartNewWork(automationControl, HttpsError, taskType); const policySnap = await db.collection("agentTaskAutomationPolicies").doc(policyId).get(); const policy = policySnap.data() || {}; const gate = computeRunnerAutomationGate(policy); const ref=db.collection("agentTaskSupervisedRunnerJobs").doc(); await ref.set({jobId:ref.id,workerQueueId,policyId,runnerStatus:"metadata_only",deployAllowed:gate.deployAllowed,mergeAllowed:gate.mergeAllowed,autoDeployEnvironment:gate.environment,canonicalTruthReadRequired:true,canonicalTruthProtectedFiles:CANONICAL_TRUTH_PROTECTED_FILES,canonicalTruthEditable:false,canonicalTruthOwnerApprovalRequired:true,canonicalTruthChangeProposalFile:CANONICAL_TRUTH_PROPOSAL_FILE,createdBy:actorId,createdByRole:actorRole,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()}); await db.collection("agentTaskWorkerQueue").doc(workerQueueId).set({ deployAllowed: gate.deployAllowed, mergeAllowed: gate.mergeAllowed, autoDeployEnvironment: gate.environment, supervisedRunnerStatus: "metadata_only", updatedAt: FieldValue.serverTimestamp() }, { merge: true }); await writeAgentAudit(db,{actorId,actorRole,action:"automation_runner_job_prepared",result:"metadata_only",approvalId: policyId}); return {accepted:true,jobId:ref.id,runnerStatus:"metadata_only",deployAllowed:gate.deployAllowed,mergeAllowed:gate.mergeAllowed,status:"metadata_only"};});



  function buildGithubRunnerStatus(config) {
    const hasConfig = !!(config && config.enabled);
    const apiImplemented = githubApiImplementationAvailable();
    if (!hasConfig) return { status: "missing_server_config", realGithubIntegration: false };
    if (!apiImplemented) return { status: "github_api_not_implemented", realGithubIntegration: false };
    return { status: "metadata_only", realGithubIntegration: true };
  }

  exportsTarget.prepareAgentGithubRunnerJob = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor","admin_operator"]); const workerQueueId=requiredString(request.data&&request.data.workerQueueId,"workerQueueId",HttpsError,180); const policyId=requiredString(request.data&&request.data.policyId,"policyId",HttpsError,180); const automationControl = (await getGlobalAutomationControl(db)).data; assertAutomationMayStartNewWork(automationControl, HttpsError, optionalString(request.data&&request.data.taskType,80)); const worker=(await db.collection("agentTaskWorkerQueue").doc(workerQueueId).get()).data()||{}; const policy=(await db.collection("agentTaskAutomationPolicies").doc(policyId).get()).data()||{}; const branchName=optionalString(request.data&&request.data.githubBranchName,180)||optionalString(worker.branchName,180)||`runtime/${workerQueueId}`; if (isProtectedBranchName(branchName) || !isSafeBranchName(branchName)) throw new HttpsError("failed-precondition","direct_main_write_blocked"); const gs=buildGithubRunnerCapability(); const ref=db.collection("agentTaskSupervisedRunnerJobs").doc(); await ref.set({jobId:ref.id,workerQueueId,policyId,runnerStatus:"metadata_only",githubRunnerStatus:gs.status,githubBranchName:branchName,githubPrRef:null,githubPrUrl:null,githubCommitSha:null,requiredChecksSnapshot:policy.requiredChecks||[],checkResultsSnapshot:policy.checkSummary||[],realGithubIntegration:gs.realGithubIntegration,canonicalTruthProtectedFiles:CANONICAL_TRUTH_PROTECTED_FILES,allowedFiles:parseStringList(worker.allowedFiles||[]),blockedFiles:parseStringList(worker.blockedFiles||[]),createdBy:actorId,createdByRole:actorRole,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()}); await writeAgentAudit(db,{actorId,actorRole,action:"github_runner_prepared",result:gs.status,approvalId:policyId}); return {accepted:true,jobId:ref.id,status:gs.status}; });
  exportsTarget.createAgentGithubBranch = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request,HttpsError,["owner","agent_supervisor","admin_operator"]); const jobId=requiredString(request.data&&request.data.jobId,"jobId",HttpsError,180); const baseBranch=optionalString(request.data&&request.data.baseBranch,180)||"main"; const ref=db.collection("agentTaskSupervisedRunnerJobs").doc(jobId); const snap=await ref.get(); if(!snap.exists) throw new HttpsError("not-found","Runner Job nicht gefunden."); const job=snap.data()||{}; const branchName=requiredString(request.data&&request.data.githubBranchName,"githubBranchName",HttpsError,180); if (isProtectedBranchName(branchName)||!isSafeBranchName(branchName)) throw new HttpsError("failed-precondition","direct_main_write_blocked"); const capability=buildGithubRunnerCapability(); if(!capability.hasServerConfig){ await ref.set({githubRunnerStatus:"missing_server_config",updatedAt:FieldValue.serverTimestamp()},{merge:true}); return {accepted:false,jobId,status:"missing_server_config"}; } if(!capability.githubApiImplemented){ await ref.set({githubRunnerStatus:"github_api_not_implemented",updatedAt:FieldValue.serverTimestamp()},{merge:true}); return {accepted:false,jobId,status:"github_api_not_implemented"}; } try { const created=await createGithubBranch({branchName,baseBranch}); await ref.set({githubRunnerStatus:"branch_created",branchCreatedAt:FieldValue.serverTimestamp(),lastStatusChangedAt:FieldValue.serverTimestamp(),githubBranchName:branchName,githubCommitSha:created&&created.object&&created.object.sha||null,baseSha:created&&created.object&&created.object.sha||null,realGithubIntegration:true,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:"github_runner_branch_created",result:"branch_created"}); return {accepted:true,jobId,status:"branch_created"}; } catch(err){ await ref.set({githubRunnerStatus:"failed",runnerErrorSummary:optionalString(err.message,400),updatedAt:FieldValue.serverTimestamp()},{merge:true}); throw new HttpsError("failed-precondition","github_branch_create_failed"); } });
  exportsTarget.applyAgentGithubFileChanges = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request,HttpsError,["owner","agent_supervisor","agent_executor_service"]); const jobId=requiredString(request.data&&request.data.jobId,"jobId",HttpsError,180); const fileChanges=Array.isArray(request.data&&request.data.fileChanges)?request.data.fileChanges:[]; const commitMessage=requiredString(request.data&&request.data.commitMessage,"commitMessage",HttpsError,240); const ref=db.collection("agentTaskSupervisedRunnerJobs").doc(jobId); const snap=await ref.get(); if(!snap.exists) throw new HttpsError("not-found","Runner Job nicht gefunden."); const job=snap.data()||{}; const branchName=optionalString(job.githubBranchName,180); if(!branchName || isProtectedBranchName(branchName)) throw new HttpsError("failed-precondition","direct_main_write_blocked"); const allowed=parseStringList(job.allowedFiles||[],400,260); const blocked=parseStringList(job.blockedFiles||[],400,260); for(const c of fileChanges){ const pth=requiredString(c&&c.path,'path',HttpsError,260); if(!allowed.some((a)=>pth===a||pth.startsWith(a.replace(/\*\*$/,'')))) throw new HttpsError('failed-precondition','file_outside_allowedFiles'); if(blocked.some((b)=>pth===b||pth.startsWith(b.replace(/\*\*$/,'')))) throw new HttpsError('failed-precondition','file_in_blockedFiles'); assertCanonicalTruthChangeAllowed({files:[pth],actorRole,ownerApprovalFlag:false,HttpsError}); }
 const capability=buildGithubRunnerCapability(); if(!capability.hasServerConfig) return {accepted:false,jobId,status:'missing_server_config'}; if(!capability.githubApiImplemented) return {accepted:false,jobId,status:'github_api_not_implemented'};
 let lastSha=null; for(const ch of fileChanges){ const pth=ch.path; let sha=null; try{ const existing=await getGithubFile({path:pth,branchName}); sha=existing&&existing.sha||null; }catch(e){} const res=await putGithubFile({path:pth,content:String(ch.content||''),branchName,message:commitMessage,sha}); lastSha=res&&res.commit&&res.commit.sha||lastSha; }
 await ref.set({githubRunnerStatus:'files_committed',githubCommitSha:lastSha||null,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:'github_runner_files_committed',result:'files_committed'}); return {accepted:true,jobId,status:'files_committed'}; });

  function sanitizeGithubError(err) {
    const msg = optionalString(err && err.message, 220) || "github_request_failed";
    return msg.replace(/token\s+[A-Za-z0-9_\-.]+/gi, "token [redacted]");
  }

  function normalizeCheckName(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/npm\s+run\s+/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function buildRequiredCheckCandidates(requiredCheck) {
    const raw = String(requiredCheck || "").trim();
    const aliases = new Set([raw]);
    const normalizedRaw = normalizeCheckName(raw);
    if (normalizedRaw) aliases.add(normalizedRaw);
    const map = {
      "npm run build": ["build"],
      "npm run lint": ["lint"],
      "npm run agent:validate": ["agent validate", "agent:validate"],
      "npm run agent:quality-gate": ["agent quality gate", "agent:quality-gate", "quality gate"],
      "npm --prefix functions run check": ["functions check", "function check", "npm --prefix functions run check"],
      "npm --prefix functions run test:emulator": ["beta 1 emulator tests", "emulator", "test emulator"],
      "git diff --check": ["git diff --check"],
    };
    (map[raw.toLowerCase()] || []).forEach((alias) => aliases.add(alias));
    return Array.from(aliases).map((entry) => normalizeCheckName(entry)).filter(Boolean);
  }

  function normalizeGithubCheckState(input) {
    const raw = String(input || "").toLowerCase();
    if (["success", "completed", "neutral", "skipped"].includes(raw)) return "pass";
    if (["failure", "failed", "error", "timed_out", "cancelled", "action_required", "startup_failure", "stale"].includes(raw)) return "fail";
    if (["queued", "in_progress", "pending", "requested", "waiting", ""].includes(raw)) return "pending";
    return "skipped_with_reason";
  }


  async function readRunnerPolicyAndWorker(job) {
    const [policySnap, workerSnap] = await Promise.all([
      db.collection("agentTaskAutomationPolicies").doc(job.policyId || "").get(),
      db.collection("agentTaskWorkerQueue").doc(job.workerQueueId || "").get(),
    ]);
    return { policy: policySnap.exists ? (policySnap.data() || {}) : {}, worker: workerSnap.exists ? (workerSnap.data() || {}) : {} };
  }

  exportsTarget.createAgentGithubPullRequest = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request,HttpsError,["owner","agent_supervisor","admin_operator","agent_executor_service"]); const jobId=requiredString(request.data&&request.data.jobId,"jobId",HttpsError,180); const title=requiredString(request.data&&request.data.title,"title",HttpsError,240); const body=requiredString(request.data&&request.data.body,"body",HttpsError,4000); const ref=db.collection("agentTaskSupervisedRunnerJobs").doc(jobId); const snap=await ref.get(); if(!snap.exists) throw new HttpsError("not-found","Runner Job nicht gefunden."); const job=snap.data()||{}; const branchName=optionalString(job.githubBranchName,180); if(!branchName||isProtectedBranchName(branchName)) throw new HttpsError("failed-precondition","direct_main_write_blocked"); const {policy}=await readRunnerPolicyAndWorker(job); const control=(await getGlobalAutomationControl(db)).data; assertAutomationMayContinue(control,HttpsError,optionalString(request.data&&request.data.taskType,80)); if(policy.autoMergeApproved!==true&&policy.status!=="approved_for_auto_merge") throw new HttpsError("failed-precondition","policy_not_approved"); if(job.githubRunnerStatus!=="files_committed"&&!optionalString(job.githubCommitSha,120)) throw new HttpsError("failed-precondition","missing_commits"); const cap=buildGithubRunnerCapability(); if(!cap.hasServerConfig){ await ref.set({githubRunnerStatus:"missing_server_config",updatedAt:FieldValue.serverTimestamp()},{merge:true}); return {accepted:false,jobId,status:"missing_server_config"}; } if(!cap.githubApiImplemented){ await ref.set({githubRunnerStatus:"github_api_not_implemented",updatedAt:FieldValue.serverTimestamp()},{merge:true}); return {accepted:false,jobId,status:"github_api_not_implemented"}; }
    try { const repoConfig=getRepoConfig(); const requestedBase=optionalString(request.data&&request.data.baseBranch,180); const configuredBase=optionalString(repoConfig&&repoConfig.baseBranch,180)||"main"; const baseBranch=requestedBase&&isSafeBranchName(requestedBase)&&!isProtectedBranchName(requestedBase)&&requestedBase!==branchName?requestedBase:configuredBase; if(baseBranch===branchName) throw new HttpsError("failed-precondition","invalid_base_branch"); const pr=await createGithubPullRequest({branchName,baseBranch,title,body}); await ref.set({githubRunnerStatus:"pr_created",prCreatedAt:FieldValue.serverTimestamp(),lastStatusChangedAt:FieldValue.serverTimestamp(),githubPrRef:pr&&pr.number?`#${pr.number}`:null,githubPrNumber:pr&&pr.number||null,githubPrUrl:optionalString(pr&&pr.html_url,600),prCreatedAt:FieldValue.serverTimestamp(),lastStatusChangedAt:FieldValue.serverTimestamp(),realGithubIntegration:true,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:"github_runner_pr_created",result:"pr_created"}); return {accepted:true,jobId,status:"pr_created",prNumber:pr&&pr.number,prUrl:pr&&pr.html_url}; } catch(err){ const msg=sanitizeGithubError(err); const noChanges = /No commits between/i.test(msg); const status=noChanges?"pr_blocked_no_changes":"failed"; await ref.set({githubRunnerStatus:status,runnerErrorSummary:msg,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:"github_runner_pr_failed",result:status}); if(noChanges) return {accepted:false,jobId,status}; throw new HttpsError("failed-precondition","github_pr_create_failed"); }
  });

  exportsTarget.refreshAgentGithubCheckStatus = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request,HttpsError,["owner","agent_supervisor","admin_operator","agent_executor_service"]); const jobId=requiredString(request.data&&request.data.jobId,"jobId",HttpsError,180); const ref=db.collection("agentTaskSupervisedRunnerJobs").doc(jobId); const snap=await ref.get(); if(!snap.exists) throw new HttpsError("not-found","Runner Job nicht gefunden."); const job=snap.data()||{}; const commitRef=optionalString(job.githubCommitSha,120); if(!commitRef) throw new HttpsError("failed-precondition","pr_required"); const cap=buildGithubRunnerCapability(); if(!cap.hasServerConfig){ await ref.set({githubRunnerStatus:"missing_server_config",updatedAt:FieldValue.serverTimestamp()},{merge:true}); return {accepted:false,jobId,status:"missing_server_config"}; } if(!cap.githubApiImplemented){ await ref.set({githubRunnerStatus:"github_api_not_implemented",updatedAt:FieldValue.serverTimestamp()},{merge:true}); return {accepted:false,jobId,status:"github_api_not_implemented"}; }
    try { const {policy}=await readRunnerPolicyAndWorker(job); const required=parseStringList(policy.requiredChecks||job.requiredChecksSnapshot||[],80,240); const result=await listGithubCheckRunsOrCommitStatuses({ref:commitRef}); const checks=[...(result.checks&&result.checks.check_runs||[]).map((c)=>({name:c.name,status:c.status,conclusion:c.conclusion,source:"github_check_run"})),...(result.statuses&&result.statuses.statuses||[]).map((s)=>({name:s.context,status:s.state,conclusion:s.state,source:"github_status"}))]; const normalizedGithubChecks=checks.map((c)=>({...c,normalizedName:normalizeCheckName(c.name),normalizedState:normalizeGithubCheckState(c.conclusion||c.status)})); const requiredStates=required.map((requiredCheck)=>{ const candidates=buildRequiredCheckCandidates(requiredCheck); const match=normalizedGithubChecks.find((gh)=>candidates.includes(gh.normalizedName)); const isLocalOnly=normalizeCheckName(requiredCheck)==="git diff check"; if(match){ return {requiredCheck,matchedGithubCheckName:match.name,normalizedState:match.normalizedState,source:match.source,notes:"matched_by_alias_normalization"}; } return {requiredCheck,matchedGithubCheckName:null,normalizedState:isLocalOnly?"skipped_with_reason":"pending",source:"local_required_not_reported",notes:isLocalOnly?"local_only_check_not_reported_by_github":"required_check_not_reported_by_github"}; }); const failed=requiredStates.some((c)=>c.normalizedState==="fail"); const pending=requiredStates.some((c)=>c.normalizedState==="pending"); const allPassed=required.length>0 && requiredStates.every((c)=>c.normalizedState==="pass"); const status=failed?"checks_failed":(allPassed?"checks_passed":"checks_pending"); await ref.set({githubRunnerStatus:status,checkResultsSnapshot:requiredStates,allRequiredChecksPassed:allPassed,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:"github_runner_checks_refreshed",result:status}); return {accepted:true,jobId,status,allRequiredChecksPassed:allPassed,pendingChecks:pending}; } catch(err){ await ref.set({githubRunnerStatus:"failed",runnerErrorSummary:sanitizeGithubError(err),updatedAt:FieldValue.serverTimestamp()},{merge:true}); throw new HttpsError("failed-precondition","github_checks_refresh_failed"); }
  });

  exportsTarget.executeAgentGithubAutoMergeMetadataOrReal = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request,HttpsError,["owner","agent_supervisor","agent_executor_service"]); const jobId=requiredString(request.data&&request.data.jobId,"jobId",HttpsError,180); const ref=db.collection("agentTaskSupervisedRunnerJobs").doc(jobId); const snap=await ref.get(); if(!snap.exists) throw new HttpsError("not-found","Runner Job nicht gefunden."); const job=snap.data()||{}; const {policy,worker}=await readRunnerPolicyAndWorker(job); const control=(await getGlobalAutomationControl(db)).data; assertAutomationMayContinue(control,HttpsError,optionalString(request.data&&request.data.taskType,80)); const branchName=optionalString(job.githubBranchName,180); if(!branchName||isProtectedBranchName(branchName)) throw new HttpsError("failed-precondition","direct_main_write_blocked"); if(!optionalString(job.githubPrRef,80) && !job.githubPrNumber) throw new HttpsError("failed-precondition","pr_required"); if(policy.autoMergeApproved!==true) throw new HttpsError("failed-precondition","auto_merge_not_approved"); if(job.allRequiredChecksPassed!==true) throw new HttpsError("failed-precondition","checks_failed"); if((job.checkResultsSnapshot||[]).some((c)=>String(c&&c.source)==="local_required_not_reported" && String(c&&c.normalizedState)!=="skipped_with_reason")) throw new HttpsError("failed-precondition","required_checks_unresolved"); if(!(policy.qualityGatePassed===true || policy.qualityGateOverrideApproved===true)) throw new HttpsError("failed-precondition","quality_gate_failed"); const cap=buildGithubRunnerCapability(); if(!cap.hasServerConfig){ await ref.set({githubRunnerStatus:"missing_server_config",updatedAt:FieldValue.serverTimestamp()},{merge:true}); return {accepted:false,jobId,status:"missing_server_config"}; } if(!cap.githubApiImplemented){ await ref.set({githubRunnerStatus:"github_api_not_implemented",updatedAt:FieldValue.serverTimestamp()},{merge:true}); return {accepted:false,jobId,status:"github_api_not_implemented"}; }
    try{ const prNumber=Number(job.githubPrNumber||String(job.githubPrRef||"").replace("#","")); const merged=await mergeGithubPullRequest({prNumber,mergeMethod:"squash"}); if(!merged||merged.merged!==true) throw new Error("merge_failed"); await ref.set({githubRunnerStatus:"auto_merged",githubMergedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()},{merge:true}); await db.collection("agentTaskWorkerQueue").doc(job.workerQueueId).set({workerStatus:"completed",supervisedRunnerStatus:"runner_executed",updatedAt:FieldValue.serverTimestamp()},{merge:true}); await db.collection("agentAutomationControl").doc("global").set({lastMergeStatus:"merged",lastPrRef:job.githubPrRef||`#${prNumber}`,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:"github_runner_auto_merged",result:"auto_merged"}); return {accepted:true,jobId,status:"auto_merged"}; } catch(err){ await ref.set({githubRunnerStatus:"failed",runnerErrorSummary:sanitizeGithubError(err),updatedAt:FieldValue.serverTimestamp()},{merge:true}); await db.collection("agentAutomationControl").doc("global").set({automationMode:"repair_required",automationEnabled:false,lastMergeStatus:"failed",lastFailureReason:sanitizeGithubError(err),updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:"github_runner_auto_merge_failed",result:"failed"}); return {accepted:false,jobId,status:"failed"}; }
  });

    exportsTarget.blockAgentGithubRunnerJob = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request,HttpsError,["owner","agent_supervisor"]); const jobId=requiredString(request.data&&request.data.jobId,"jobId",HttpsError,180); const reason=optionalString(request.data&&request.data.reason,500)||"blocked"; await db.collection("agentTaskSupervisedRunnerJobs").doc(jobId).set({githubRunnerStatus:"blocked",runnerErrorSummary:reason,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:"github_runner_blocked",result:"blocked"}); return {accepted:true,jobId,status:"blocked"}; });
  exportsTarget.listAgentGithubRunnerJobs = onCall(async (request)=>{ requireRole(request,HttpsError,["owner","agent_supervisor","readonly_observer","support_operator","admin_operator"]); const snapshot = await db.collection("agentTaskSupervisedRunnerJobs").orderBy("createdAt","desc").limit(100).get(); return {accepted:true,jobs:snapshot.docs.map((d)=>d.data())}; });
  exportsTarget.getAgentGithubRunnerJob = onCall(async (request)=>{ requireRole(request,HttpsError,["owner","agent_supervisor","readonly_observer","support_operator","admin_operator"]); const jobId=requiredString(request.data&&request.data.jobId,"jobId",HttpsError,180); const snap=await db.collection("agentTaskSupervisedRunnerJobs").doc(jobId).get(); if(!snap.exists) throw new HttpsError("not-found","Runner Job nicht gefunden."); return {accepted:true,job:snap.data()}; });

  exportsTarget.getAgentAutomationControl = onCall(async (request)=>{ requireRole(request,HttpsError,["owner","agent_supervisor","readonly_observer","support_operator","admin_operator","agent_executor_service"]); const c=await getGlobalAutomationControl(db); return {accepted:true,control:c.data,checklist:buildCycleStartChecklist()}; });
  exportsTarget.setAgentAutomationMode = onCall(async (request)=>{ const {actorId,actorRole}=requireRole(request,HttpsError,["owner","agent_supervisor"]); const mode=requiredString(request.data&&request.data.automationMode,'automationMode',HttpsError,80); if(!AUTOMATION_MODES.includes(mode)) throw new HttpsError('invalid-argument','Ungueltiger mode'); if(actorRole!=="owner" && mode==="halted_waiting_owner") throw new HttpsError('permission-denied','Nur owner'); if(actorRole!=="owner" && mode==="runner_enabled") throw new HttpsError('permission-denied','Nur owner'); const g=await getGlobalAutomationControl(db); await g.ref.set({automationMode:mode,automationEnabled:["supervised","runner_enabled","planning_only"].includes(mode),updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:'automation_mode_set',result:mode}); return {accepted:true,automationMode:mode}; });
  exportsTarget.pauseAgentAutomation = onCall(async (request)=>{ const {actorId,actorRole}=requireRole(request,HttpsError,["owner","agent_supervisor"]); const g=await getGlobalAutomationControl(db); await g.ref.set({automationMode:'paused',automationEnabled:false,pausedBy:actorId,pausedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:'automation_paused',result:'paused'}); return {accepted:true,automationMode:'paused'}; });
  exportsTarget.resumeAgentAutomation = onCall(async (request)=>{ const {actorId,actorRole}=requireRole(request,HttpsError,["owner"]); const g=await getGlobalAutomationControl(db); await g.ref.set({automationMode:'supervised',automationEnabled:true,resumedBy:actorId,resumedAt:FieldValue.serverTimestamp(),ownerReviewRequired:false,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:'automation_resumed',result:'supervised'}); return {accepted:true,automationMode:'supervised'}; });
  exportsTarget.recordAgentAutomationMergeOutcome = onCall(async (request)=>{ const {actorId,actorRole}=requireRole(request,HttpsError,["owner","agent_supervisor","admin_operator","agent_executor_service"]); const mergeStatus=requiredString(request.data&&request.data.mergeStatus,'mergeStatus',HttpsError,80); const prRef=optionalString(request.data&&request.data.prRef,220)||null; const reason=optionalString(request.data&&request.data.reason,500)||null; const g=await getGlobalAutomationControl(db); const fail=["failed","conflict","checks_failed","blocked"].includes(mergeStatus); await g.ref.set({lastMergeStatus:mergeStatus,lastPrRef:prRef,lastFailureReason:reason,automationMode:fail?'repair_required':g.data.automationMode,automationEnabled:fail?false:g.data.automationEnabled,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:'automation_merge_outcome_recorded',result:mergeStatus}); return {accepted:true,mergeStatus}; });
  exportsTarget.recordAgentAutomationRepairAttempt = onCall(async (request)=>{ const {actorId,actorRole}=requireRole(request,HttpsError,["owner","agent_supervisor","admin_operator","agent_executor_service"]); const result=requiredString(request.data&&request.data.result,'result',HttpsError,40); const reason=optionalString(request.data&&request.data.reason,500)||null; const g=await getGlobalAutomationControl(db); let count=Number(g.data.repairAttemptCount||0); if(result==='failed' || result==='blocked') count+=1; const halt=count>=Number(g.data.maxRepairAttempts||3); const update={repairAttemptCount:count,lastFailureReason:reason,automationMode:halt?'halted_waiting_owner':(result==='fixed'?'supervised':'repair_required'),automationEnabled:halt?false:(result==='fixed'),ownerReviewRequired:halt,haltedAt:halt?FieldValue.serverTimestamp():g.data.haltedAt||null,resumedAt:result==='fixed'?FieldValue.serverTimestamp():g.data.resumedAt||null,lastStatusChangedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()}; await g.ref.set(update,{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:'automation_repair_attempt_recorded',result}); return {accepted:true,repairAttemptCount:count,halted:halt}; });
  exportsTarget.resetAgentAutomationRepairCounter = onCall(async (request)=>{ const {actorId,actorRole}=requireRole(request,HttpsError,["owner","agent_supervisor"]); const g=await getGlobalAutomationControl(db); await g.ref.set({repairAttemptCount:0,ownerReviewRequired:false,updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:'automation_repair_counter_reset',result:'ok'}); return {accepted:true}; });
  exportsTarget.approveAgentAutomationContinueAfterHalt = onCall(async (request)=>{ const {actorId,actorRole}=requireRole(request,HttpsError,["owner"]); const g=await getGlobalAutomationControl(db); await g.ref.set({automationMode:'supervised',automationEnabled:true,repairAttemptCount:0,ownerReviewRequired:false,resumedBy:actorId,resumedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:'automation_continue_after_halt_approved',result:'supervised'}); return {accepted:true,automationMode:'supervised'}; });



  exportsTarget.createAgentTaskProposalFromApprovedDossier = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor","admin_operator"]); const dossierId=requiredString(request.data&&request.data.dossierId,"dossierId",HttpsError,180); const dossierType=requiredString(request.data&&request.data.dossierType,"dossierType",HttpsError,80); const adminDecisionId=requiredString(request.data&&request.data.adminDecisionId,"adminDecisionId",HttpsError,180); const dossierSnap=await db.collection("agentDossiers").doc(dossierId).get(); if(!dossierSnap.exists) throw new HttpsError("not-found","dossier_not_found"); const decisionSnap=await db.collection("agentCenterDecisions").doc(adminDecisionId).get(); const decision=decisionSnap.data()||{}; if(!decisionSnap.exists || decision.decision!=="approved") throw new HttpsError("failed-precondition","dossier_not_approved"); if(decision.targetId!==dossierId) throw new HttpsError("failed-precondition","decision_target_mismatch"); const dossier=dossierSnap.data()||{}; const allowedFiles=parseStringList(dossier.allowedFiles||[]); assertCanonicalTruthChangeAllowed({ files: allowedFiles, actorRole, ownerApprovalFlag: false, HttpsError }); const blockedFiles=parseStringList(dossier.blockedFiles||[]); const requiredChecks=parseStringList(dossier.requiredChecks||buildRequiredChecks({targetTrack:"runtime_pipeline",allowedFiles})); const riskLevel=normalizeRiskLevel(dossier.riskLevel||decision.riskLevel||"medium"); const status=riskLevel==='high'?"review_required":"proposed"; const ref=db.collection("agentTaskProposals").doc(); await ref.set({proposalId:ref.id,title:optionalString(request.data&&request.data.title,160)||optionalString(dossier.title,160)||`Dossier ${dossierId}`,promptRef:`dossier:${dossierType}:${dossierId}`,requestedAction:optionalString(request.data&&request.data.reason,500)||"create proposal from approved dossier",targetTrack:"runtime_pipeline",riskLevel,status,allowedFiles,blockedFiles,requiredChecks,sourceDossierId:dossierId,sourceDossierType:dossierType,adminDecisionId,createdBy:actorId,createdByRole:actorRole,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()}); await writeAgentAudit(db,{actorId,actorRole,action:"dossier_task_proposal_created",result:status,proposalId:ref.id,allowedFiles,blockedFiles,riskLevel}); return {accepted:true,proposalId:ref.id,status}; });

  exportsTarget.createWorkerQueueFromApprovedAgentTask = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor","admin_operator"]); const proposalId=requiredString(request.data&&request.data.proposalId,"proposalId",HttpsError,180); const approvalId=requiredString(request.data&&request.data.approvalId,"approvalId",HttpsError,180); const [pSnap,aSnap,g]=await Promise.all([db.collection("agentTaskProposals").doc(proposalId).get(),db.collection("agentTaskApprovals").doc(approvalId).get(),getGlobalAutomationControl(db)]); const proposal=pSnap.data()||{}; const approval=aSnap.data()||{}; if(!pSnap.exists || proposal.status!=="approved") throw new HttpsError("failed-precondition","proposal_not_approved"); if(!aSnap.exists || approval.status!=="approved") throw new HttpsError("failed-precondition","approval_not_auditable"); assertAutomationMayStartNewWork(g.data,HttpsError,optionalString(request.data&&request.data.taskType,80)); const ref=db.collection("agentTaskWorkerQueue").doc(); const workerMode = g.data.automationMode === "runner_enabled" ? "supervised_agent" : "manual_codex"; await ref.set({workerQueueId:ref.id,proposalId,approvalId,workerStatus:"ready_for_worker",queuedAt:FieldValue.serverTimestamp(),lastStatusChangedAt:FieldValue.serverTimestamp(),workerMode,branchName:optionalString(request.data&&request.data.branchName,180)||`runtime/${proposalId}`,allowedFiles:parseStringList(approval.approvedAllowedFiles||proposal.allowedFiles||[]),blockedFiles:parseStringList(approval.approvedBlockedFiles||proposal.blockedFiles||[]),protectedScopes:parseStringList(proposal.protectedScopes||[]),requiredChecks:parseStringList(proposal.requiredChecks||[]),canonicalTruthReadRequired:true,adminApprovalSnapshot:{approvalId,status:approval.status,approvedBy:approval.approvedBy||null},createdBy:actorId,createdByRole:actorRole,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()}); await writeAgentAudit(db,{actorId,actorRole,action:"worker_queue_created_from_approved_task",result:"ready_for_worker",proposalId,approvalId}); return {accepted:true,workerQueueId:ref.id,workerStatus:"ready_for_worker",workerMode}; });

  exportsTarget.createGithubRunnerJobFromWorkerQueue = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor","admin_operator"]); const workerQueueId=requiredString(request.data&&request.data.workerQueueId,"workerQueueId",HttpsError,180); const policyId=requiredString(request.data&&request.data.policyId,"policyId",HttpsError,180); const [wSnap,pSnap,g,b]=await Promise.all([db.collection("agentTaskWorkerQueue").doc(workerQueueId).get(),db.collection("agentTaskAutomationPolicies").doc(policyId).get(),getGlobalAutomationControl(db),db.collection("qualityGateKnownBlockers").doc("global").get()]); const worker=wSnap.data()||{}; if(!wSnap.exists || worker.workerStatus!=="ready_for_worker") throw new HttpsError("failed-precondition","worker_not_ready"); assertAutomationMayStartNewWork(g.data,HttpsError,optionalString(request.data&&request.data.taskType,80)); const blockers=parseStringList((b.data()||{}).knownBlockers||[]); if(blockers.length && (b.data()||{}).blocksRealRunner===true) throw new HttpsError("failed-precondition","known_blocker_blocks_real_runner"); const branchName=optionalString(request.data&&request.data.githubBranchName,180)||optionalString(worker.branchName,180)||`runtime/${workerQueueId}`; if (isProtectedBranchName(branchName) || !isSafeBranchName(branchName)) throw new HttpsError("failed-precondition","direct_main_write_blocked"); const gs=buildGithubRunnerCapability(); const status = gs.status === "metadata_only" ? "ready_for_github" : gs.status; const ref=db.collection("agentTaskSupervisedRunnerJobs").doc(); await ref.set({jobId:ref.id,workerQueueId,policyId,githubRunnerStatus:status,runnerJobCreatedAt:FieldValue.serverTimestamp(),runnerStartedAt:FieldValue.serverTimestamp(),lastStatusChangedAt:FieldValue.serverTimestamp(),githubBranchName:branchName,runnerStatus:status,createdBy:actorId,createdByRole:actorRole,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()},{merge:true}); await writeAgentAudit(db,{actorId,actorRole,action:"github_runner_created_from_worker_queue",result:status,approvalId:policyId}); return {accepted:true,jobId:ref.id,status}; });

  exportsTarget.createRepairTaskFromFailedRunnerJob = onCall(async (request)=>{ const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor","admin_operator"]); const jobId=requiredString(request.data&&request.data.jobId,"jobId",HttpsError,180); const job=(await db.collection("agentTaskSupervisedRunnerJobs").doc(jobId).get()).data()||{}; const failed=["failed","checks_failed","blocked","conflict","repair_required"].includes(String(job.githubRunnerStatus||job.runnerStatus||"")); if(!failed) throw new HttpsError("failed-precondition","repair_not_allowed_for_status"); const g=await getGlobalAutomationControl(db); const count=Number(g.data.repairAttemptCount||0); const max=Number(g.data.maxRepairAttempts||3); if(count>=max) throw new HttpsError("failed-precondition","repair_limit_reached"); const ref=db.collection("agentTaskProposals").doc(); await ref.set({proposalId:ref.id,title:`Repair ${jobId}`,requestedAction:"repair_only_failed_runner_job",targetTrack:"runtime_pipeline",status:"repair_required",riskLevel:"medium",repairOnly:true,sourceRunnerJobId:jobId,repairRequiredAt:FieldValue.serverTimestamp(),repairRequiredAt:FieldValue.serverTimestamp(),lastStatusChangedAt:FieldValue.serverTimestamp(),createdBy:actorId,createdByRole:actorRole,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()}); await writeAgentAudit(db,{actorId,actorRole,action:"repair_task_created",result:"proposed",proposalId:ref.id}); return {accepted:true,proposalId:ref.id,status:"proposed",repairAttemptCount:count}; });
  function safeTimestampValue(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") {
      try { return value.toDate().toISOString(); } catch (_) { return null; }
    }
    return value;
  }

  function getWorkerQueueStatusValue(data) {
    const status = optionalString(data.workerStatus, 80) || optionalString(data.status, 80) || "pending_worker_review";
    if (status === "claimed" || status === "running" || status === "checks_recorded" || status === "pr_prepared") return "in_progress";
    if (status === "failed") return "blocked";
    return status;
  }

  function mapSafeAgentTaskWorkerQueueItem(doc) {
    const data = doc.data() || {};
    const taskProposalId = optionalString(data.taskProposalId, 180) || optionalString(data.proposalId, 180) || null;
    return {
      workerQueueId: optionalString(data.workerQueueId, 180) || doc.id,
      taskProposalId,
      title: optionalString(data.title, 240) || optionalString(data.taskTitle, 240) || (taskProposalId ? `Task Proposal ${taskProposalId}` : `Worker Queue ${doc.id}`),
      summary: optionalString(data.summary, 1200) || "",
      requestedAction: optionalString(data.requestedAction, 1200) || "",
      sourceInboxId: optionalString(data.sourceInboxId, 180) || null,
      status: getWorkerQueueStatusValue(data),
      riskLevel: normalizeRiskLevel(data.riskLevel || "medium"),
      allowedFiles: parseStringList(data.allowedFiles || [], 80, 260),
      blockedFiles: parseStringList(data.blockedFiles || [], 80, 260),
      requiredChecks: parseStringList(data.requiredChecks || [], 80, 260),
      noRunnerStarted: data.noRunnerStarted !== false && data.runnerStarted !== true,
      noBranchOrPrOrMerge: data.noBranchOrPrOrMerge !== false && data.autoMerge !== true,
      noDeploy: data.noDeploy !== false && data.autoDeploy !== true,
      createdAt: safeTimestampValue(data.createdAt || data.queuedAt),
      updatedAt: safeTimestampValue(data.updatedAt || data.lastStatusChangedAt),
    };
  }


  function mapSafeAgentRunnerJob(doc) {
    const data = doc.data() || {};
    return {
      runnerJobId: optionalString(data.runnerJobId, 180) || doc.id,
      workerQueueId: optionalString(data.workerQueueId, 180) || null,
      taskProposalId: optionalString(data.taskProposalId, 180) || null,
      pickupContractId: optionalString(data.pickupContractId, 180) || null,
      title: optionalString(data.title, 240) || `Runner Job ${doc.id}`,
      status: optionalString(data.status, 80) || "pending_runner_pickup",
      executionMode: optionalString(data.executionMode, 120) || "owner_approved_manual_pickup",
      allowedFiles: parseStringList(data.allowedFiles || [], 80, 260),
      blockedFiles: parseStringList(data.blockedFiles || [], 80, 260),
      requiredChecks: parseStringList(data.requiredChecks || [], 80, 260),
      riskLevel: normalizeRiskLevel(data.riskLevel || "medium"),
      noRunnerStarted: data.noRunnerStarted !== false && data.runnerStarted !== true,
      noBranchOrPrOrMerge: data.noBranchOrPrOrMerge !== false && data.autoMerge !== true,
      noDeploy: data.noDeploy !== false && data.autoDeploy !== true,
      runnerStartAllowed: data.runnerStartAllowed === true,
      requiresManualRunnerPickup: data.requiresManualRunnerPickup === true,
      createdAt: safeTimestampValue(data.createdAt),
      ownerApprovedAt: safeTimestampValue(data.ownerApprovedAt),
      pickupContractCreatedAt: safeTimestampValue(data.pickupContractCreatedAt),
    };
  }

  function mapSafeAgentRunnerPickupContract(doc) {
    const data = doc.data() || {};
    return {
      pickupContractId: optionalString(data.pickupContractId, 180) || doc.id,
      runnerJobId: optionalString(data.runnerJobId, 180) || null,
      workerQueueId: optionalString(data.workerQueueId, 180) || null,
      taskProposalId: optionalString(data.taskProposalId, 180) || null,
      title: optionalString(data.title, 240) || `Pickup Contract ${doc.id}`,
      requestedAction: optionalString(data.requestedAction, 1200) || "Manual runner may create an implementation plan only.",
      allowedFiles: parseStringList(data.allowedFiles || [], 80, 260),
      blockedFiles: parseStringList(data.blockedFiles || [], 80, 260),
      requiredChecks: parseStringList(data.requiredChecks || [], 80, 260),
      riskLevel: normalizeRiskLevel(data.riskLevel || "medium"),
      status: optionalString(data.status, 80) || "pickup_contract_created",
      executionMode: optionalString(data.executionMode, 120) || "manual_runner_pickup_contract",
      runnerStartAllowed: data.runnerStartAllowed === true,
      requiresManualRunnerPickup: data.requiresManualRunnerPickup === true,
      noDeploy: data.noDeploy !== false,
      noMerge: data.noMerge !== false,
      noAutoApproval: data.noAutoApproval !== false,
      branchCreationAllowed: data.branchCreationAllowed === true,
      prCreationAllowed: data.prCreationAllowed === true,
      fileWriteAllowed: data.fileWriteAllowed === true,
      nextStep: optionalString(data.nextStep, 500) || "Manual runner may create an implementation plan only.",
      createdAt: safeTimestampValue(data.createdAt),
    };
  }


  function mapSafeAgentRunnerImplementationPlan(doc) {
    const data = doc.data() || {};
    return {
      implementationPlanId: optionalString(data.implementationPlanId, 180) || doc.id,
      pickupContractId: optionalString(data.pickupContractId, 180) || null,
      runnerJobId: optionalString(data.runnerJobId, 180) || null,
      workerQueueId: optionalString(data.workerQueueId, 180) || null,
      taskProposalId: optionalString(data.taskProposalId, 180) || null,
      title: optionalString(data.title, 240) || `Implementation Plan ${doc.id}`,
      requestedAction: optionalString(data.requestedAction, 1200) || "Create a manual implementation plan only.",
      status: optionalString(data.status, 80) || "implementation_plan_created",
      executionMode: optionalString(data.executionMode, 120) || "manual_plan_only",
      allowedFiles: parseStringList(data.allowedFiles || [], 80, 260),
      blockedFiles: parseStringList(data.blockedFiles || [], 80, 260),
      requiredChecks: parseStringList(data.requiredChecks || [], 80, 260),
      riskLevel: normalizeRiskLevel(data.riskLevel || "medium"),
      planSummary: optionalString(data.planSummary, 2000) || "",
      plannedSteps: parseStringList(data.plannedSteps || [], 80, 1000),
      expectedFilesToTouch: parseStringList(data.expectedFilesToTouch || [], 80, 260),
      expectedOutputs: parseStringList(data.expectedOutputs || [], 80, 1000),
      validationPlan: parseStringList(data.validationPlan || [], 80, 1000),
      rollbackPlan: parseStringList(data.rollbackPlan || [], 80, 1000),
      openQuestions: parseStringList(data.openQuestions || [], 80, 1000),
      fileWriteAllowed: data.fileWriteAllowed === true,
      branchCreationAllowed: data.branchCreationAllowed === true,
      prCreationAllowed: data.prCreationAllowed === true,
      noDeploy: data.noDeploy !== false,
      noMerge: data.noMerge !== false,
      requiresOwnerPlanApproval: data.requiresOwnerPlanApproval === true,
      ownerPlanApprovedAt: safeTimestampValue(data.ownerPlanApprovedAt),
      ownerPlanApprovalDecision: optionalString(data.ownerPlanApprovalDecision, 160) || null,
      nextStep: optionalString(data.nextStep, 500) || "Owner must approve implementation plan before any file write or branch creation.",
      createdAt: safeTimestampValue(data.createdAt),
    };
  }

  function mapSafeAgentTaskProposal(doc, sourceInbox) {
    const data = doc.data() || {};
    const summary = optionalString(data.summary, 1200) || optionalString(data.plainSummary, 1200) || optionalString(sourceInbox && (sourceInbox.summary || sourceInbox.plainSummary), 1200) || optionalString(data.requestedAction, 1200);
    const recommendation = optionalString(data.recommendation, 1200) || optionalString(sourceInbox && (sourceInbox.recommendation || sourceInbox.recommendationLabel || sourceInbox.recommendationText), 1200);
    return {
      taskProposalId: optionalString(data.taskProposalId, 180) || optionalString(data.proposalId, 180) || doc.id,
      proposalId: optionalString(data.proposalId, 180) || doc.id,
      title: optionalString(data.title, 240) || `Task Proposal ${doc.id}`,
      summary: summary || "",
      requestedAction: optionalString(data.requestedAction, 1200) || "",
      sourceInboxId: optionalString(data.sourceInboxId, 180) || null,
      sourceDossierId: optionalString(data.sourceDossierId, 180) || null,
      sourceType: optionalString(data.sourceType, 120) || null,
      status: optionalString(data.status, 80) || "proposed",
      allowedFiles: parseStringList(data.allowedFiles || [], 80, 260),
      blockedFiles: parseStringList(data.blockedFiles || [], 80, 260),
      requiredChecks: parseStringList(data.requiredChecks || [], 80, 260),
      riskLevel: normalizeRiskLevel(data.riskLevel || "medium"),
      recommendation: recommendation || "",
      targetTrack: optionalString(data.targetTrack, 80) || null,
      suggestedBranch: optionalString(data.suggestedBranch, 180) || null,
      noRunnerStarted: data.noRunnerStarted !== false,
      noBranchOrPrOrMerge: data.noBranchOrPrOrMerge !== false,
      noDeploy: data.noDeploy !== false,
      workerQueueId: optionalString(data.workerQueueId, 180) || null,
      lastWorkerQueueStatus: optionalString(data.lastWorkerQueueStatus, 80) || null,
      createdAt: safeTimestampValue(data.createdAt),
      updatedAt: safeTimestampValue(data.updatedAt),
      lastStatusChangedAt: safeTimestampValue(data.lastStatusChangedAt),
    };
  }


  exportsTarget.archiveAndResetAgentCenterPipelineData = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "admin_operator", "admin"]);
    const reason = requiredString(request.data && request.data.reason, "reason", HttpsError, 1000);
    const safetyDecision = buildAgentCenterPipelineResetSafetyDecision(request.data || {});

    const resetScope = buildAgentCenterPipelineResetScope();
    const invalidScope = resetScope.find((entry) => AGENT_CENTER_PIPELINE_PROTECTED_COLLECTIONS.has(entry.collectionName));
    if (invalidScope) throw new HttpsError("failed-precondition", `protected_collection_in_reset_scope:${invalidScope.collectionName}`);

    const snapshots = [];
    for (const scopeEntry of resetScope) {
      snapshots.push(await previewAgentCenterPipelineCollection(db, scopeEntry.collectionName));
    }

    const countsBeforeReset = {};
    const sampleIds = {};
    snapshots.forEach((snapshot) => {
      countsBeforeReset[snapshot.collectionName] = snapshot.count;
      sampleIds[snapshot.collectionName] = snapshot.sampleIds;
    });

    await writeAgentAudit(db, {
      actorId,
      actorRole,
      action: "agent_center_pipeline_reset_preview",
      result: "accepted",
      riskLevel: "low",
    });

    return {
      accepted: safetyDecision.accepted,
      blocked: safetyDecision.blocked,
      dryRun: true,
      previewOnly: true,
      deletionBlocked: true,
      deleteAllowed: false,
      countsBeforeReset,
      sampleIds,
      deletedCounts: {},
      archivedCounts: {},
      skippedCollections: resetScope.map((entry) => entry.collectionName),
      skippedReasons: safetyDecision.skippedReasons,
      blockedReasons: safetyDecision.blockedReasons,
      safetyStatus: safetyDecision.safetyStatus,
      recommendedNextAction: safetyDecision.recommendedNextAction,
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
      message: safetyDecision.message,
    };
  });

  exportsTarget.listAgentTaskWorkerQueueItems = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const status = optionalString(request.data && request.data.status, 80);
    let query = db.collection("agentTaskWorkerQueue").orderBy("createdAt", "desc").limit(100);
    if (status && WORKER_QUEUE_STATUSES.includes(status)) {
      query = query.where("workerStatus", "==", status);
    }
    const snapshot = await query.get();
    const items = snapshot.docs.map(mapSafeAgentTaskWorkerQueueItem);
    return { accepted: true, items, workerQueueItems: items, loadedCount: items.length, noRunnerStarted: true, noBranchOrPrOrMerge: true, noDeploy: true };
  });

  exportsTarget.previewRunnerPickupForWorkerQueueItem = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "admin_operator"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const workerRef = db.collection("agentTaskWorkerQueue").doc(workerQueueId);
    const workerSnap = await workerRef.get();
    if (!workerSnap.exists) throw new HttpsError("not-found", "worker_queue_item_not_found");
    const item = workerSnap.data() || {};
    const decision = buildRunnerPickupPreviewDecision({ ...item, workerQueueId }, workerQueueId);
    if (!decision.previewable) throw new HttpsError("failed-precondition", decision.failureMessage || `runner_pickup_preview_blocked:${decision.missing.join(",")}`);
    const preview = decision.preview;
    return { accepted: true, ...preview, preview, message: "Runner-Pickup Preview bereit. Keine Ausführung gestartet." };
  });


  exportsTarget.approveRunnerStartForWorkerQueueItem = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "admin_operator"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const workerRef = db.collection("agentTaskWorkerQueue").doc(workerQueueId);
    const workerSnap = await workerRef.get();
    if (!workerSnap.exists) throw new HttpsError("not-found", "worker_queue_item_not_found");
    const item = workerSnap.data() || {};
    const decision = buildRunnerStartApprovalDecision({ ...item, workerQueueId }, workerQueueId);
    if (!decision.approvable) throw new HttpsError("failed-precondition", decision.failureMessage || `runner_start_approval_blocked:${decision.missing.join(",")}`);
    const now = FieldValue.serverTimestamp();
    const runnerRef = db.collection("agentRunnerJobs").doc();
    const runnerJob = {
      ...decision.runnerJob,
      runnerJobId: runnerRef.id,
      createdAt: now,
      ownerApprovedAt: now,
    };
    await runnerRef.set(runnerJob);
    await workerRef.set({
      workerStatus: "runner_start_approved",
      status: "runner_start_approved",
      runnerJobId: runnerRef.id,
      runnerStartApprovedAt: now,
      runnerStartApprovalDecision: "approved_for_manual_runner_pickup",
      noRunnerStarted: true,
      runnerStarted: false,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
      runnerStartAllowed: false,
      requiresManualRunnerPickup: true,
      humanMergeRequired: true,
      autoMerge: false,
      autoDeploy: false,
      lastStatusChangedAt: now,
      updatedAt: now,
    }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "runner_start_approval_saved", proposalId: item.taskProposalId || item.proposalId || null, result: "pending_runner_pickup", allowedFiles: decision.runnerJob.allowedFiles, blockedFiles: decision.runnerJob.blockedFiles });
    return { accepted: true, runnerJobId: runnerRef.id, workerQueueId, taskProposalId: runnerJob.taskProposalId, status: "runner_start_approved", runnerJobStatus: "pending_runner_pickup", runnerStartApprovalDecision: "approved_for_manual_runner_pickup", noRunnerStarted: true, noBranchOrPrOrMerge: true, noDeploy: true, runnerStartAllowed: false, requiresManualRunnerPickup: true, message: "Runner-Start-Freigabe gespeichert. Kein Runner gestartet." };
  });


  exportsTarget.createManualRunnerPickupContract = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "admin_operator"]);
    const runnerJobId = requiredString(request.data && request.data.runnerJobId, "runnerJobId", HttpsError, 180);
    const runnerRef = db.collection("agentRunnerJobs").doc(runnerJobId);
    const runnerSnap = await runnerRef.get();
    if (!runnerSnap.exists) throw new HttpsError("not-found", "runner_job_not_found");
    const item = runnerSnap.data() || {};
    const decision = buildManualRunnerPickupContractDecision({ ...item, runnerJobId }, runnerJobId);
    if (!decision.contractable) throw new HttpsError("failed-precondition", decision.failureMessage || `manual_runner_pickup_contract_blocked:${decision.missing.join(",")}`);
    const now = FieldValue.serverTimestamp();
    const contractRef = db.collection("agentRunnerPickupContracts").doc();
    const contract = {
      ...decision.contract,
      pickupContractId: contractRef.id,
      createdAt: now,
      createdByRole: actorRole,
    };
    await contractRef.set(contract);
    await runnerRef.set({
      status: "pickup_contract_created",
      pickupContractId: contractRef.id,
      pickupContractCreatedAt: now,
      runnerStartAllowed: false,
      requiresManualRunnerPickup: true,
      noDeploy: true,
      noMerge: true,
      noAutoApproval: true,
      branchCreationAllowed: false,
      prCreationAllowed: false,
      fileWriteAllowed: false,
      runnerStarted: false,
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      lastStatusChangedAt: now,
      updatedAt: now,
    }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "manual_runner_pickup_contract_created", proposalId: item.taskProposalId || null, result: "pickup_contract_created", allowedFiles: decision.contract.allowedFiles, blockedFiles: decision.contract.blockedFiles });
    return { accepted: true, ...contract, contract, message: "Pickup-Contract erzeugt. Noch keine Ausführung gestartet." };
  });


  exportsTarget.createManualRunnerImplementationPlan = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "admin_operator"]);
    const pickupContractId = requiredString(request.data && request.data.pickupContractId, "pickupContractId", HttpsError, 180);
    const contractRef = db.collection("agentRunnerPickupContracts").doc(pickupContractId);
    const contractSnap = await contractRef.get();
    if (!contractSnap.exists) throw new HttpsError("not-found", "pickup_contract_not_found");
    const item = contractSnap.data() || {};
    const decision = buildManualRunnerImplementationPlanDecision({ ...item, pickupContractId }, pickupContractId);
    if (!decision.plannable) throw new HttpsError("failed-precondition", decision.failureMessage || `manual_runner_implementation_plan_blocked:${decision.missing.join(",")}`);
    const now = FieldValue.serverTimestamp();
    const planRef = db.collection("agentRunnerImplementationPlans").doc();
    const plan = {
      ...decision.plan,
      implementationPlanId: planRef.id,
      createdAt: now,
      createdByRole: actorRole,
    };
    await planRef.set(plan);
    await contractRef.set({
      status: "implementation_plan_created",
      implementationPlanId: planRef.id,
      implementationPlanCreatedAt: now,
      fileWriteAllowed: false,
      branchCreationAllowed: false,
      prCreationAllowed: false,
      noDeploy: true,
      noMerge: true,
      runnerStartAllowed: false,
      lastStatusChangedAt: now,
      updatedAt: now,
    }, { merge: true });
    if (decision.plan.runnerJobId) {
      await db.collection("agentRunnerJobs").doc(decision.plan.runnerJobId).set({
        status: "implementation_plan_created",
        implementationPlanId: planRef.id,
        implementationPlanCreatedAt: now,
        runnerStartAllowed: false,
        fileWriteAllowed: false,
        branchCreationAllowed: false,
        prCreationAllowed: false,
        noDeploy: true,
        noMerge: true,
        lastStatusChangedAt: now,
        updatedAt: now,
      }, { merge: true });
    }
    await writeAgentAudit(db, { actorId, actorRole, action: "manual_runner_implementation_plan_created", proposalId: item.taskProposalId || null, result: "implementation_plan_created", allowedFiles: decision.plan.allowedFiles, blockedFiles: decision.plan.blockedFiles });
    return { accepted: true, ...plan, plan, message: "Implementierungsplan erzeugt. Noch keine Dateiänderung gestartet." };
  });

  exportsTarget.approveManualRunnerImplementationPlan = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "admin_operator"]);
    const implementationPlanId = requiredString(request.data && request.data.implementationPlanId, "implementationPlanId", HttpsError, 180);
    const planRef = db.collection("agentRunnerImplementationPlans").doc(implementationPlanId);
    const planSnap = await planRef.get();
    if (!planSnap.exists) throw new HttpsError("not-found", "implementation_plan_not_found");
    const item = planSnap.data() || {};
    const decision = buildManualRunnerImplementationPlanApprovalDecision({ ...item, implementationPlanId }, implementationPlanId);
    if (!decision.approvable) throw new HttpsError("failed-precondition", decision.failureMessage || `manual_runner_implementation_plan_approval_blocked:${decision.missing.join(",")}`);
    const now = FieldValue.serverTimestamp();
    const approvalUpdate = {
      ...decision.approvalUpdate,
      ownerPlanApprovedAt: now,
      ownerPlanApprovedByRole: actorRole,
      lastStatusChangedAt: now,
      updatedAt: now,
    };
    await planRef.set(approvalUpdate, { merge: true });
    const pickupContractId = optionalString(item.pickupContractId, 180);
    if (pickupContractId) {
      await db.collection("agentRunnerPickupContracts").doc(pickupContractId).set({
        status: "implementation_plan_approved",
        implementationPlanId,
        implementationPlanApprovedAt: now,
        fileWriteAllowed: false,
        branchCreationAllowed: false,
        prCreationAllowed: false,
        noDeploy: true,
        noMerge: true,
        lastStatusChangedAt: now,
        updatedAt: now,
      }, { merge: true });
    }
    await writeAgentAudit(db, { actorId, actorRole, action: "manual_runner_implementation_plan_approved", proposalId: item.taskProposalId || null, result: "implementation_plan_approved", allowedFiles: decision.allowedFiles, blockedFiles: decision.blockedFiles });
    const approvedPlan = { ...item, ...approvalUpdate, implementationPlanId };
    return { accepted: true, ...approvedPlan, plan: approvedPlan, message: "Implementierungsplan freigegeben. Noch keine Dateiänderung gestartet." };
  });

  exportsTarget.listAgentRunnerImplementationPlans = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const status = optionalString(request.data && request.data.status, 80);
    let query = db.collection("agentRunnerImplementationPlans").orderBy("createdAt", "desc").limit(100);
    if (status && RUNNER_IMPLEMENTATION_PLAN_STATUSES.includes(status)) query = query.where("status", "==", status);
    const snapshot = await query.get();
    const items = snapshot.docs.map(mapSafeAgentRunnerImplementationPlan);
    return { accepted: true, items, implementationPlans: items, loadedCount: items.length, fileWriteAllowed: false, branchCreationAllowed: false, prCreationAllowed: false, noDeploy: true, noMerge: true };
  });

  exportsTarget.listAgentRunnerPickupContracts = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const status = optionalString(request.data && request.data.status, 80);
    let query = db.collection("agentRunnerPickupContracts").orderBy("createdAt", "desc").limit(100);
    if (status && RUNNER_PICKUP_CONTRACT_STATUSES.includes(status)) query = query.where("status", "==", status);
    const snapshot = await query.get();
    const items = snapshot.docs.map(mapSafeAgentRunnerPickupContract);
    return { accepted: true, items, pickupContracts: items, loadedCount: items.length, noDeploy: true, noMerge: true, runnerStartAllowed: false, fileWriteAllowed: false, branchCreationAllowed: false, prCreationAllowed: false };
  });

  exportsTarget.listAgentRunnerJobs = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const status = optionalString(request.data && request.data.status, 80);
    let query = db.collection("agentRunnerJobs").orderBy("createdAt", "desc").limit(100);
    if (status && RUNNER_JOB_STATUSES.includes(status)) query = query.where("status", "==", status);
    const snapshot = await query.get();
    const items = snapshot.docs.map(mapSafeAgentRunnerJob);
    return { accepted: true, items, runnerJobs: items, loadedCount: items.length, noRunnerStarted: true, noBranchOrPrOrMerge: true, noDeploy: true };
  });

  exportsTarget.releaseWorkerQueueItemForWorker = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "admin_operator"]);
    const workerQueueId = requiredString(getWorkerQueueReleaseTargetId(request.data), "workerQueueId", HttpsError, 180);
    const workerRef = db.collection("agentTaskWorkerQueue").doc(workerQueueId);
    const workerSnap = await workerRef.get();
    if (!workerSnap.exists) throw new HttpsError("not-found", "worker_queue_item_not_found");
    const item = workerSnap.data() || {};
    const decision = buildWorkerQueueReleaseDecision(item);
    if (!decision.releasable) throw new HttpsError("failed-precondition", decision.failureMessage || `worker_queue_release_blocked:${decision.missing.join(",")}`);
    const now = FieldValue.serverTimestamp();
    await workerRef.set({
      workerStatus: "ready_for_worker",
      status: "ready_for_worker",
      ownerReleasedAt: now,
      ownerReleasedByRole: actorRole,
      ownerReleaseDecision: "approved_for_worker_pickup",
      noRunnerStarted: true,
      runnerStarted: false,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
      humanMergeRequired: true,
      autoMerge: false,
      autoDeploy: false,
      lastStatusChangedAt: now,
      updatedAt: now,
    }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_owner_released", proposalId: item.taskProposalId || item.proposalId || null, result: "ready_for_worker", allowedFiles: decision.allowedFiles, blockedFiles: decision.blockedFiles });
    return { accepted: true, workerQueueId, workerStatus: "ready_for_worker", status: "ready_for_worker", ownerReleaseDecision: "approved_for_worker_pickup", noRunnerStarted: true, noBranchOrPrOrMerge: true, noDeploy: true };
  });

  exportsTarget.createWorkerQueueItemFromTaskProposal = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const taskProposalId = requiredString(request.data && (request.data.taskProposalId || request.data.proposalId), "taskProposalId", HttpsError, 180);
    const proposalRef = db.collection("agentTaskProposals").doc(taskProposalId);
    const proposalSnap = await proposalRef.get();
    if (!proposalSnap.exists) throw new HttpsError("not-found", "task_proposal_not_found");
    const proposal = proposalSnap.data() || {};
    const currentStatus = optionalString(proposal.status, 80) || "proposed";
    if (!["proposed", "review_required"].includes(currentStatus)) throw new HttpsError("failed-precondition", "task_proposal_status_not_reviewable");
    const allowedFiles = parseStringList(proposal.allowedFiles || [], 80, 260);
    const blockedFiles = parseStringList(proposal.blockedFiles || [], 80, 260);
    const requiredChecks = parseStringList(proposal.requiredChecks || [], 80, 260);
    assertCanonicalTruthChangeAllowed({ files: [...allowedFiles, ...blockedFiles], actorRole, ownerApprovalFlag: false, HttpsError });
    const now = FieldValue.serverTimestamp();
    const workerStatus = optionalString(request.data && request.data.workerStatus, 80) === "queued_for_owner_review" ? "queued_for_owner_review" : "pending_worker_review";
    const workerMode = "manual_codex";
    const workerRef = db.collection("agentTaskWorkerQueue").doc();
    const workerDoc = {
      workerQueueId: workerRef.id,
      taskProposalId,
      proposalId: optionalString(proposal.proposalId, 180) || taskProposalId,
      sourceInboxId: optionalString(proposal.sourceInboxId, 180) || null,
      sourceDossierId: optionalString(proposal.sourceDossierId, 180) || null,
      workerStatus,
      workerMode,
      taskTitle: optionalString(proposal.title, 240) || `Task Proposal ${taskProposalId}`,
      summary: optionalString(proposal.summary, 1200) || optionalString(proposal.requestedAction, 1200) || "",
      requestedAction: optionalString(proposal.requestedAction, 1200) || "",
      targetTrack: optionalString(proposal.targetTrack, 80) || "docs_register",
      riskLevel: normalizeRiskLevel(proposal.riskLevel || "medium"),
      allowedFiles,
      blockedFiles,
      requiredChecks,
      suggestedBranch: optionalString(proposal.suggestedBranch, 180) || null,
      canonicalTruthReadRequired: true,
      canonicalTruthProtectedFiles: CANONICAL_TRUTH_PROTECTED_FILES,
      canonicalTruthEditable: false,
      canonicalTruthOwnerApprovalRequired: true,
      canonicalTruthChangeProposalFile: CANONICAL_TRUTH_PROPOSAL_FILE,
      humanMergeRequired: true,
      autoMerge: false,
      autoDeploy: false,
      runnerStarted: false,
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
      createdBy: actorId,
      createdByRole: actorRole,
      queuedAt: now,
      lastStatusChangedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await workerRef.set(workerDoc, { merge: true });
    await proposalRef.set({
      status: "queued_for_worker_review",
      workerQueueId: workerRef.id,
      lastWorkerQueueStatus: workerStatus,
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
      lastStatusChangedAt: now,
      updatedAt: now,
    }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_prepared_from_task_proposal", proposalId: taskProposalId, result: workerStatus, allowedFiles, blockedFiles });
    return { accepted: true, taskProposalId, proposalStatus: "queued_for_worker_review", workerQueueId: workerRef.id, workerStatus, noRunnerStarted: true, noBranchOrPrOrMerge: true, noDeploy: true };
  });

  exportsTarget.listAgentTaskProposals = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const status = optionalString(request.data && request.data.status, 40);
    let query = db.collection("agentTaskProposals");
    if (status && PROPOSAL_STATUSES.includes(status)) query = query.where("status", "==", status);
    query = query.limit(100);
    const snapshot = await query.get();
    const sourceInboxIds = Array.from(new Set(snapshot.docs.map((doc) => optionalString((doc.data() || {}).sourceInboxId, 180)).filter(Boolean)));
    const sourceInboxById = new Map();
    await Promise.all(sourceInboxIds.slice(0, 100).map(async (inboxId) => {
      const inboxSnap = await db.collection("agentCenterInbox").doc(inboxId).get();
      sourceInboxById.set(inboxId, inboxSnap.exists ? (inboxSnap.data() || {}) : null);
    }));
    const proposals = snapshot.docs
      .map((doc) => mapSafeAgentTaskProposal(doc, sourceInboxById.get(optionalString((doc.data() || {}).sourceInboxId, 180))))
      .sort((a, b) => String(b.createdAt || b.updatedAt || b.taskProposalId || "").localeCompare(String(a.createdAt || a.updatedAt || a.taskProposalId || "")));
    const statusCounts = buildAgentTaskProposalStatusCounts(proposals);
    return { accepted: true, proposals, items: proposals, loadedCount: proposals.length, statusCounts };
  });

  async function upsertInboxItem({ actorId, actorRole, sourceType, listType, sourceRef, sourceDossierId, payload, createdAtFallback, preserveExistingDecisionStatus = false }) {
    const inboxIdInfo = buildAgentCenterInboxId({ sourceType, sourceDossierId, listType });
    const inboxId = inboxIdInfo.inboxId;
    if (inboxIdInfo.invalidInboxIdSanitized) {
      const error = new Error("invalid_inbox_id");
      error.safeMessage = "Inbox-ID konnte nicht sicher erzeugt werden.";
      error.invalidInboxIdSanitized = true;
      error.sourceDossierIdHadSlash = inboxIdInfo.sourceDossierIdHadSlash;
      throw error;
    }
    const ref = db.collection("agentCenterInbox").doc(inboxId);
    const existingSnap = preserveExistingDecisionStatus ? await ref.get() : null;
    const existingData = existingSnap && existingSnap.exists ? (existingSnap.data() || {}) : null;
    const existingStatus = sanitizeInboxText(existingData && existingData.status, 40);
    const preserveDecisionStatus = Boolean(existingData && INBOX_DECISION_PRESERVED_STATUSES.has(existingStatus));
    const now = FieldValue.serverTimestamp();
    const createdAt = createdAtFallback || now;
    const status = toInboxStatusByListType(listType);
    const allowedFiles = firstPresentList(payload, ["allowedFiles", "allowedWriteScopes", "allowedPaths", "affectedFiles", "files"], 80, 260);
    const blockedFiles = firstPresentList(payload, ["blockedFiles", "blockedWriteScopes", "forbiddenFiles", "protectedFiles", "blockedPaths"], 80, 260);
    const requiredChecks = firstPresentList(payload, ["requiredChecks", "checks", "qualityChecks", "requiredCommands", "validationCommands"], 80, 260);
    assertCanonicalTruthChangeAllowed({ files: allowedFiles, actorRole, ownerApprovalFlag: actorRole === "owner", HttpsError });
    const decisionDetails = buildInboxDecisionDetails(payload, { sourceType, listType, sourceDossierId, allowedFiles, blockedFiles, requiredChecks });
    const reapprovalState = buildSingleDecisionReapprovalState({ existingData, currentContractFields: decisionDetails });
    const doc = {
      inboxId,
      sourceType,
      sourceRef,
      sourceDossierId,
      sourceDossierIdHadSlash: inboxIdInfo.sourceDossierIdHadSlash,
      listType,
      ...decisionDetails,
      businessBenefit: firstPresentText(payload, ["businessBenefit", "businessValue", "partnerBenefit"], 1200),
      status: preserveDecisionStatus ? existingStatus : status,
      createdAt,
      submittedAt: createdAt,
      waitingForApprovalAt: createdAt,
      ...(preserveDecisionStatus ? {} : { lastStatusChangedAt: now }),
      riskLevel: normalizeRiskLevel(payload.riskLevel || "medium"),
      targetTrack: firstPresentText(payload, ["targetTrack", "track", "scopeTrack"], 80),
      suggestedBranch: firstPresentText(payload, ["suggestedBranch", "branchName", "branch"], 180),
      runnerEligibility: sanitizeInboxText(payload.runnerEligibility, 80) || "admin_review_required",
      adminApprovalRequired: true,
      requiresAdminReview: true,
      canonicalTruthProtected: touchesCanonicalTruthProtectedFiles(allowedFiles).length > 0,
      beta1Allowed: payload.beta1Allowed !== false,
      forbiddenScope: parseStringList(payload.forbiddenScope || [], 40, 120),
      sourcePayloadSummary: firstPresentText(payload, ["sourcePayloadSummary", "summary", "plainSummary", "description"], 1200),
      readableDecisionDossierSourceDossierId: payload.readableDecisionDossierSourceDossierId || null,
      readableDecisionDossierId: payload.readableDecisionDossierId || null,
      readableDossierInboxId: payload.readableDossierInboxId || null,
      supersededByReadableDecisionDossier: payload.supersededByReadableDecisionDossier === true,
      legacyProductEvolutionSource: payload.legacyProductEvolutionSource || null,
      adminCenterSourcePriority: Number(payload.adminCenterSourcePriority || (listType === "decisionDossiers" ? 10 : 50)),
      ...(reapprovalState.requiresSingleDecisionReapproval ? { singleDecisionStatus: reapprovalState.singleDecisionStatus, autoProgressStatus: reapprovalState.autoProgressStatus, requiresSingleDecisionReapproval: true, reapprovalReason: reapprovalState.reapprovalReason, approvalCoversAutomaticExecution: false } : { requiresSingleDecisionReapproval: false, reapprovalReason: "" }),
      updatedAt: now,
    };
    await ref.set(doc, { merge: true });
    return { inboxId, existingStatusPreserved: preserveDecisionStatus, preservedStatus: preserveDecisionStatus ? existingStatus : "", requiresSingleDecisionReapproval: reapprovalState.requiresSingleDecisionReapproval, contractUpgradeDetected: reapprovalState.contractUpgradeDetected, currentExecutionContractHashPresent: Boolean(decisionDetails.executionContractHash), approvedExecutionContractHashPresent: Boolean(existingData && existingData.approvedExecutionContractHash), approvalCoversAutomaticExecution: Boolean(existingData && existingData.approvalCoversAutomaticExecution === true) };
  }

  exportsTarget.syncProductEvolutionFirstRunInbox = onCall(async (request) => {
    const responseBase = { accepted: false };
    try {
      const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
      const sourceRef = "project-register/agent-product-evolution-first-run-output.json";
      const decisionDossiersSourceRef = "project-register/agent-product-evolution-decision-dossiers.json";
      const requestData = request.data && typeof request.data === "object" ? request.data : {};
      const snapshotResolution = resolveRegisterSnapshot(requestData);
      const registerSnapshot = snapshotResolution.registerSnapshot;
      const payloadUnwrappedFrom = snapshotResolution.payloadUnwrappedFrom;

      const snap = await db.collection("agentSystemRegisters").doc("agent-product-evolution-first-run-output").get();
      const mirror = snap.exists ? (snap.data() || {}) : {};
      const mirrorCollections = getFirstRunCandidateCollections(mirror);
      const snapshotCollections = getFirstRunCandidateCollections(registerSnapshot || {});
      const useMirror = mirrorCollections.length > 0;
      const register = useMirror ? mirror : (registerSnapshot || {});
      const collections = useMirror ? mirrorCollections : snapshotCollections;
      const serverSnapshotReceived = Boolean(registerSnapshot);
      const serverSnapshotKeys = registerSnapshot && typeof registerSnapshot === "object" ? Object.keys(registerSnapshot) : [];
      const createdAtFallback = FieldValue.serverTimestamp();
      let created = 0;
      let updated = 0;
      let skipped = 0;
      let preservedDecisionStatusCount = 0;
      const samplePreservedDecisionIds = [];
      const skippedReasons = { missing_sourceDossierId: 0, missing_decision_data: 0, protected_scope: 0, invalid_inbox_id: 0 };
      const sampleCreatedIds = [];
      const sampleSkipped = [];
      let contractUpgradeDetectedCount = 0;
      let reapprovalRequiredCount = 0;
      const sampleReapprovalRequiredIds = [];
      let currentExecutionContractHashPresent = false;
      let approvedExecutionContractHashPresent = false;
      let approvalCoversAutomaticExecution = false;
      let serverCandidateCount = 0;
      let invalidInboxIdSanitized = false;
      let sourceDossierIdHadSlash = false;
      const readableDossierLookup = buildReadableDecisionDossierLookup(collections);

      for (const collection of collections) {
        for (const raw of collection.items) {
          let item = normalizeFirstRunEntry(raw, collection.listType);
          serverCandidateCount += 1;
          const readableMatch = findReadableDecisionDossierForItem(item, collection.listType, readableDossierLookup);
          if (readableMatch) item = overlayReadableDecisionDossierFields(item, collection.listType, readableMatch);
          const sourceDossierId = sanitizeInboxText(item.sourceDossierId || extractProductEvolutionId(raw), 180);
          if (!sourceDossierId) {
            sampleSkipped.push({ listType: collection.listType, reason: "missing_sourceDossierId", id: sanitizeInboxText(item.id || item.title, 180) });
            skippedReasons.missing_sourceDossierId = Number(skippedReasons.missing_sourceDossierId || 0) + 1;
            skipped += 1;
            continue;
          }
          const executionFieldsForScope = extractExecutionContractFields(item);
          const canSyncVersionedSingleDecisionContract = collection.listType === "decisionDossiers" && (executionFieldsForScope.mode === "single_owner_decision" || (executionFieldsForScope.executionContract && executionFieldsForScope.executionContract.mode === "single_owner_decision"));
          if (hasProtectedFileScope(item.allowedFiles || []) && !canSyncVersionedSingleDecisionContract) {
            sampleSkipped.push({ listType: collection.listType, reason: "protected_scope", id: sourceDossierId });
            skippedReasons.protected_scope = Number(skippedReasons.protected_scope || 0) + 1;
            skipped += 1;
            continue;
          }
          if (!(item.summary || item.plainSummary || item.whatWillChange || item.whySuggested)) {
            item.missingDecisionData = true;
            if (collection.listType === "generatedDossiers" || collection.listType === "recommendedApprovals") {
              item.summary = item.summary || `Auto-import aus ${String(raw || "")}`;
            } else {
              sampleSkipped.push({ listType: collection.listType, reason: "missing_decision_data", id: sourceDossierId });
              skippedReasons.missing_decision_data = Number(skippedReasons.missing_decision_data || 0) + 1;
              skipped += 1;
              continue;
            }
          }
          const inboxIdInfo = buildAgentCenterInboxId({ sourceType: "product_evolution_first_run", sourceDossierId, listType: collection.listType });
          invalidInboxIdSanitized = invalidInboxIdSanitized || inboxIdInfo.invalidInboxIdSanitized;
          sourceDossierIdHadSlash = sourceDossierIdHadSlash || inboxIdInfo.sourceDossierIdHadSlash;
          if (inboxIdInfo.invalidInboxIdSanitized) {
            sampleSkipped.push({ listType: collection.listType, reason: "invalid_inbox_id", sourceDossierIdHadSlash: inboxIdInfo.sourceDossierIdHadSlash });
            skippedReasons.invalid_inbox_id = Number(skippedReasons.invalid_inbox_id || 0) + 1;
            skipped += 1;
            continue;
          }
          const existing = await db.collection("agentCenterInbox").doc(inboxIdInfo.inboxId).get();
          const itemSourceRef = collection.listType === "decisionDossiers" ? sanitizeInboxText(register.decisionDossiersSourceRef, 240) || decisionDossiersSourceRef : sourceRef;
          const upsertResult = await upsertInboxItem({ actorId, actorRole, sourceType: "product_evolution_first_run", listType: collection.listType, sourceRef: itemSourceRef, sourceDossierId, payload: item, createdAtFallback, preserveExistingDecisionStatus: true });
          if (upsertResult.contractUpgradeDetected) contractUpgradeDetectedCount += 1;
          if (upsertResult.requiresSingleDecisionReapproval) {
            reapprovalRequiredCount += 1;
            if (sampleReapprovalRequiredIds.length < 10) sampleReapprovalRequiredIds.push(inboxIdInfo.inboxId);
          }
          currentExecutionContractHashPresent = currentExecutionContractHashPresent || Boolean(upsertResult.currentExecutionContractHashPresent);
          approvedExecutionContractHashPresent = approvedExecutionContractHashPresent || Boolean(upsertResult.approvedExecutionContractHashPresent);
          approvalCoversAutomaticExecution = approvalCoversAutomaticExecution || Boolean(upsertResult.approvalCoversAutomaticExecution);
          if (upsertResult.existingStatusPreserved) {
            preservedDecisionStatusCount += 1;
            if (samplePreservedDecisionIds.length < 10) samplePreservedDecisionIds.push(inboxIdInfo.inboxId);
          }
          if (existing.exists) updated += 1;
          else created += 1;
          if (sampleCreatedIds.length < 10) sampleCreatedIds.push(inboxIdInfo.inboxId);
        }
      }

      const diagnostics = buildInboxSyncDiagnostics({
        requestData, registerSnapshot, collections, serverCandidateCount, payloadUnwrappedFrom,
        registerSnapshotFieldPresent: snapshotResolution.registerSnapshotFieldPresent,
        registerSnapshotValueType: snapshotResolution.registerSnapshotValueType,
      });
      const synced = created + updated;
      const base = { ...responseBase, ...diagnostics, accepted: synced > 0 || skipped > 0, syncedCount: synced, created, updated, skipped, skippedReasons, preservedDecisionStatusCount, samplePreservedDecisionIds, sampleCreatedIds, sampleSkipped, contractUpgradeDetectedCount, reapprovalRequiredCount, sampleReapprovalRequiredIds, currentExecutionContractHashPresent, approvedExecutionContractHashPresent, approvalCoversAutomaticExecution, invalidInboxIdSanitized, sourceDossierIdHadSlash, serverSnapshotReceived, serverSnapshotKeys, idempotent: true, sourceRef, sourceTrust: useMirror ? "firestore_mirror" : "admin_provided_repo_snapshot" };

      if (!useMirror && !registerSnapshot) {
        return { ...base, message: "Kein Snapshot empfangen und Firestore-Mirror leer." };
      }
      if (serverCandidateCount === 0) {
        return { ...base, message: `Snapshot empfangen, aber keine Candidate-Arrays gefunden. Keys: ${serverSnapshotKeys.join(', ') || '(none)'}` };
      }
      if (!synced && !skipped) {
        return { ...base, accepted: false, message: "Keine syncbaren First-Run-Einträge gefunden." };
      }

      await writeAgentAudit(db, { actorId, actorRole, action: "sync_product_evolution_first_run_inbox", result: useMirror ? "mirror" : "admin_provided_repo_snapshot" });
      return { ...base, message: `Inbox synchronisiert: ${created} erstellt, ${updated} aktualisiert, ${skipped} übersprungen.` };
    } catch (error) {
      const message = error && typeof error === "object" && "message" in error ? String(error.message || "sync_failed") : "sync_failed";
      const diagnostics = buildInboxSyncDiagnostics({
        requestData: request.data, registerSnapshot: null, collections: [], serverCandidateCount: 0, payloadUnwrappedFrom: "none",
        registerSnapshotFieldPresent: false, registerSnapshotValueType: "null",
      });
      if (error && typeof error === "object" && "code" in error && String(error.code).includes("permission-denied")) {
        return { ...responseBase, ...diagnostics, accepted: false, message: "Rolle nicht berechtigt." };
      }
      const invalidInboxIdFailure = message.includes("documentPath") || message.includes("invalid_inbox_id");
      return {
        ...responseBase,
        ...diagnostics,
        accepted: false,
        message: invalidInboxIdFailure ? "Inbox-ID konnte nicht sicher erzeugt werden." : (message.slice(0, 240) || "sync_failed"),
        invalidInboxIdSanitized: invalidInboxIdFailure,
        sourceDossierIdHadSlash: Boolean(error && typeof error === "object" && "sourceDossierIdHadSlash" in error && error.sourceDossierIdHadSlash),
        sampleSkipped: invalidInboxIdFailure ? [{ reason: "invalid_inbox_id" }] : [],
      };
    }
  });

  exportsTarget.syncAgentCenterLocalRegistersInbox = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const proposals = await db.collection("agentTaskProposals").orderBy("createdAt", "desc").limit(200).get();
    let synced = 0;
    for (const doc of proposals.docs) {
      const p = doc.data() || {};
      const reviewable = p.adminApprovalRequired === true || p.requiresAdminReview === true || ["review_required", "pending_approval"].includes(String(p.status || ""));
      if (!reviewable) continue;
      const sourceDossierId = sanitizeInboxText(p.sourceDossierId || p.proposalId || doc.id, 180);
      if (!sourceDossierId) continue;
      await upsertInboxItem({ actorId, actorRole, sourceType: "proposal", listType: "suggestedTaskQueue", sourceRef: "agentTaskProposals", sourceDossierId, payload: p, createdAtFallback: FieldValue.serverTimestamp() });
      synced += 1;
    }
    await writeAgentAudit(db, { actorId, actorRole, action: "sync_agent_center_local_registers_inbox", result: "ok" });
    return { accepted: true, syncedCount: synced, idempotent: true };
  });

  exportsTarget.regenerateProductEvolutionRevisionDossiers = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const requestData = request.data && typeof request.data === "object" ? request.data : {};
    const snapshotResolution = resolveRegisterSnapshot(requestData);
    const registerSnapshot = snapshotResolution.registerSnapshot;
    const mirrorSnap = await db.collection("agentSystemRegisters").doc("agent-product-evolution-first-run-output").get();
    const mirror = mirrorSnap.exists ? (mirrorSnap.data() || {}) : {};
    const useMirror = getFirstRunCandidateCollections(mirror).length > 0;
    const effectiveSnapshot = useMirror ? mirror : (registerSnapshot || {});
    const limit = Math.min(Math.max(Number(requestData.limit || 100), 1), 200);
    const snap = await db.collection("agentCenterInbox")
      .where("status", "==", "revision_requested")
      .limit(limit)
      .get();
    let regenerated = 0;
    let stillRevisionRequested = 0;
    const sampleRegeneratedIds = [];
    const sampleRevisionBlocked = [];
    const now = FieldValue.serverTimestamp();
    for (const doc of snap.docs) {
      const inbox = doc.data() || {};
      if (String(inbox.sourceType || "") !== "product_evolution_first_run") continue;
      const sourceMatch = findRevisionSourcePayload({ inbox, registerSnapshot: effectiveSnapshot });
      const result = buildProductEvolutionRevisionDossier({
        inbox,
        sourcePayload: sourceMatch && sourceMatch.payload,
        sourceMeta: sourceMatch ? { listType: sourceMatch.listType, collectionPath: sourceMatch.collectionPath } : null,
      });
      assertCanonicalTruthChangeAllowed({ files: [...result.dossier.allowedFiles, ...result.dossier.blockedFiles], actorRole, ownerApprovalFlag: actorRole === "owner", HttpsError });
      const revisionEntry = {
        at: now,
        byRole: actorRole,
        action: result.complete ? "revision_dossier_regenerated" : "revision_dossier_insufficient",
        message: result.complete ? "Revision-Dossier neu erzeugt und zur Freigabe gestellt." : REVISION_DOSSIER_MESSAGE,
        missingCriticalDecisionFields: result.missing,
        sourceDossierId: result.dossier.sourceDossierId || null,
      };
      if (result.complete) {
        await doc.ref.set({
          ...result.dossier,
          status: "pending_approval",
          detailStatus: "complete",
          dossierIncomplete: false,
          missingCriticalDecisionFields: [],
          revisionRegeneratedAt: now,
          waitingForApprovalAt: now,
          lastStatusChangedAt: now,
          updatedAt: now,
          noRunnerStarted: true,
          noDeploy: true,
          noMerge: true,
          revisionHistory: FieldValue.arrayUnion(revisionEntry),
        }, { merge: true });
        regenerated += 1;
        if (sampleRegeneratedIds.length < 10) sampleRegeneratedIds.push(doc.id);
      } else {
        await doc.ref.set({
          status: "revision_requested",
          detailStatus: "missing",
          dossierIncomplete: true,
          missingCriticalDecisionFields: result.missing,
          revisionMessage: REVISION_DOSSIER_MESSAGE,
          revisionCheckedAt: now,
          updatedAt: now,
          noRunnerStarted: true,
          noDeploy: true,
          noMerge: true,
          revisionHistory: FieldValue.arrayUnion(revisionEntry),
        }, { merge: true });
        stillRevisionRequested += 1;
        if (sampleRevisionBlocked.length < 10) sampleRevisionBlocked.push({ inboxId: doc.id, missingCriticalDecisionFields: result.missing, message: REVISION_DOSSIER_MESSAGE });
      }
    }
    await writeAgentAudit(db, { actorId, actorRole, action: "product_evolution_revision_dossiers_regenerated", result: "ok" });
    return {
      accepted: true,
      status: "revision_dossier_generation_complete",
      message: regenerated > 0 ? `${regenerated} Revision-Dossiers wurden wieder zur Freigabe gestellt.` : REVISION_DOSSIER_MESSAGE,
      scanned: snap.size,
      regenerated,
      stillRevisionRequested,
      sampleRegeneratedIds,
      sampleRevisionBlocked,
      sourceTrust: useMirror ? "firestore_mirror" : "admin_provided_repo_snapshot",
      noRunnerStarted: true,
      noDeploy: true,
      noMerge: true,
    };
  });

  exportsTarget.listAgentCenterInboxItems = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const data = request.data || {};
    let q = db.collection("agentCenterInbox").orderBy("createdAt", "desc").limit(200);
    const status = optionalString(data.status, 80);
    const sourceType = optionalString(data.sourceType, 80);
    const recommendation = optionalString(data.recommendation, 80);
    const listType = optionalString(data.listType, 80);
    if (status && INBOX_STATUSES.includes(status)) q = q.where("status", "==", status);
    if (sourceType && INBOX_SOURCE_TYPES.includes(sourceType)) q = q.where("sourceType", "==", sourceType);
    if (recommendation) q = q.where("recommendation", "==", recommendation);
    if (listType && INBOX_LIST_TYPES.includes(listType)) q = q.where("listType", "==", listType);
    const snap = await q.get();
    return { accepted: true, items: snap.docs.map((d) => d.data()) };
  });

  exportsTarget.getAgentCenterInboxItem = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const inboxId = requiredString(request.data && request.data.inboxId, "inboxId", HttpsError, 180);
    const snap = await db.collection("agentCenterInbox").doc(inboxId).get();
    if (!snap.exists) throw new HttpsError("not-found", "inbox_not_found");
    return { accepted: true, item: snap.data() };
  });

  exportsTarget.createAgentTaskProposalFromApprovedInboxItem = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const inboxId = requiredString(request.data && request.data.inboxId, "inboxId", HttpsError, 180);
    const titleOverride = optionalString(request.data && request.data.title, 240);
    const reason = optionalString(request.data && request.data.reason, 1200) || "approved_inbox_to_task_proposal";
    const suggestedBranch = optionalString(request.data && request.data.suggestedBranch, 180);
    const inboxRef = db.collection("agentCenterInbox").doc(inboxId);
    const inboxSnap = await inboxRef.get();
    if (!inboxSnap.exists) throw new HttpsError("not-found", "inbox_not_found");
    const inbox = inboxSnap.data() || {};
    if (String(inbox.status || "") !== "approved") throw new HttpsError("failed-precondition", "inbox_not_approved");
    if (["rejected", "blocked", "revision_requested", "pending_approval"].includes(String(inbox.status || ""))) throw new HttpsError("failed-precondition", "inbox_status_not_allowed");
    if (((inbox.executionContract && inbox.executionContract.mode) || inbox.mode) === "single_owner_decision" && !contractApprovalCoversCurrentExecutionContract(inbox)) throw new HttpsError("failed-precondition", AUTO_PROGRESS_CONTRACT_BLOCKED_MESSAGE);
    const decisionQuery = await db.collection("agentCenterDecisions").where("targetId", "==", inboxId).where("decision", "==", "approved").orderBy("createdAt", "desc").limit(1).get();
    if (decisionQuery.empty) throw new HttpsError("failed-precondition", "missing_approved_admin_decision");
    const allowedFiles = parseStringList(inbox.allowedFiles || [], 80, 260);
    const blockedFiles = parseStringList(inbox.blockedFiles || [], 80, 260);
    const requiredChecks = parseStringList(inbox.requiredChecks || [], 80, 260);
    if (!allowedFiles.length || !blockedFiles.length || !requiredChecks.length) throw new HttpsError("failed-precondition", "missing_decision_data");
    assertCanonicalTruthChangeAllowed({ files: [...allowedFiles, ...blockedFiles], actorRole, ownerApprovalFlag: false, HttpsError });
    const riskLevel = normalizeRiskLevel(inbox.riskLevel || "medium");
    const proposalStatus = (riskLevel === "high" || riskLevel === "critical" || requiredChecks.length === 0) ? "review_required" : "proposed";
    const proposalRef = db.collection("agentTaskProposals").doc();
    const now = FieldValue.serverTimestamp();
    const proposal = {
      proposalId: proposalRef.id,
      sourceInboxId: inboxId,
      sourceDossierId: optionalString(inbox.sourceDossierId, 180) || null,
      sourceType: optionalString(inbox.sourceType, 120) || "inbox",
      title: titleOverride || optionalString(inbox.title, 240) || `Inbox ${inboxId}`,
      summary: optionalString(inbox.summary, 1200) || optionalString(inbox.plainSummary, 1200) || "",
      requestedAction: optionalString(inbox.whatWillChange, 1200) || optionalString(inbox.plainSummary, 1200) || reason,
      recommendation: optionalString(inbox.recommendation, 1200) || optionalString(inbox.recommendationLabel, 1200) || optionalString(inbox.recommendationText, 1200) || "",
      targetTrack: optionalString(inbox.targetTrack, 80) || "docs_register",
      riskLevel,
      allowedFiles,
      blockedFiles,
      requiredChecks,
      suggestedBranch: suggestedBranch || optionalString(inbox.suggestedBranch, 180) || null,
      status: proposalStatus,
      adminApprovalRequired: true,
      requiresAdminReview: proposalStatus === "review_required",
      createdBy: actorId,
      createdByRole: actorRole,
      createdAt: now,
      updatedAt: now,
      lastStatusChangedAt: now,
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
    };
    await proposalRef.set(proposal, { merge: true });
    await inboxRef.set({
      status: "synced_to_task_proposal",
      taskProposalId: proposalRef.id,
      taskProposalCreatedAt: now,
      lastStatusChangedAt: now,
      updatedAt: now,
    }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "approved_inbox_to_task_proposal_created", proposalId: proposalRef.id, riskLevel, result: "ok", evidenceRef: inboxId, allowedFiles, blockedFiles });
    return { accepted: true, inboxId, taskProposalId: proposalRef.id, status: "synced_to_task_proposal", proposalStatus, noRunnerStarted: true, noBranchOrPrOrMerge: true, noDeploy: true };
  });



  async function writeCenterDecision({ request, targetType, decision }) {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const data = request.data || {};
    const targetId = requiredString(data.targetId, "targetId", HttpsError, 180);
    const sourceRefHint = optionalString(data.sourceRef, 260) || null;
    const reason = optionalString(data.reason, 1000) || null;

    async function resolveTarget() {
      if (targetType === "agent") {
        const [inboxSnap, proposalSnap, backlogSnap, catalogSnap] = await Promise.all([
          db.collection("agentCenterInbox").doc(targetId).get(),
          db.collection("agentTaskProposals").doc(targetId).get(),
          db.collection("approvedAgentBuildBacklogMirror").doc(targetId).get(),
          db.collection("agentCatalogMirror").doc(targetId).get(),
        ]);
        if (inboxSnap.exists) {
          const inbox = inboxSnap.data() || {};
          const inboxStatus = String(inbox.status || "");
          if (inboxStatus !== "pending_approval") throw new HttpsError("failed-precondition", "center_inbox_not_decidable");
          if (decision === "approved") {
            const mode = String((inbox.executionContract && inbox.executionContract.mode) || inbox.mode || "manual_step_by_step");
            if (mode === "single_owner_decision" || inbox.executionContract) {
              const validation = validateSingleDecisionExecutionContract(inbox);
              if (!validation.approvable) throw new HttpsError("failed-precondition", "incomplete_single_decision_contract");
            } else if (!isCompleteDecisionDossier(inbox)) throw new HttpsError("failed-precondition", "missing_decision_data");
          }
          return { sourceRef: "agentCenterInbox", riskLevel: normalizeRiskLevel(inbox.riskLevel), protectedScopes: parseStringList(inbox.forbiddenScope || []), allowedFiles: parseStringList(inbox.allowedFiles || []), inboxRef: inboxSnap.ref, inbox };
        }
        if (proposalSnap.exists) return { sourceRef: "agentTaskProposals", riskLevel: normalizeRiskLevel(proposalSnap.data().riskLevel), protectedScopes: parseStringList(proposalSnap.data().protectedScopes || []), allowedFiles: parseStringList(proposalSnap.data().allowedFiles || []) };
        if (backlogSnap.exists) return { sourceRef: "approvedAgentBuildBacklogMirror", riskLevel: normalizeRiskLevel(backlogSnap.data().riskLevel), protectedScopes: parseStringList(backlogSnap.data().protectedScopes || []), allowedFiles: parseStringList(backlogSnap.data().allowedWriteScopes || []) };
        if (catalogSnap.exists) return { sourceRef: "agentCatalogMirror", riskLevel: normalizeRiskLevel(catalogSnap.data().riskLevel), protectedScopes: parseStringList(catalogSnap.data().protectedScopes || []), allowedFiles: parseStringList(catalogSnap.data().allowedWriteScopes || []) };
        throw new HttpsError("not-found", "server_inbox_entry_not_found");
      }
      const missionSnap = await db.collection("agentCenterMissionProposals").doc(targetId).get();
      if (!missionSnap.exists) throw new HttpsError("not-found", "server_inbox_entry_not_found");
      const d = missionSnap.data() || {};
      return { sourceRef: "agentCenterMissionProposals", riskLevel: normalizeRiskLevel(d.riskLevel), protectedScopes: parseStringList(d.protectedScopes || []), allowedFiles: parseStringList(d.allowedWriteScopes || []) };
    }

    const resolved = await resolveTarget();
    const sourceRef = resolved.sourceRef || sourceRefHint || null;
    const riskLevel = normalizeRiskLevel(resolved.riskLevel);
    // Center decisions only write the decision/audit and, for inbox items, the inbox status.
    // They must stay independent from Automation Control because they do not start runners,
    // enqueue workers, create task proposals, or perform branch/PR/merge/deploy actions.
    const canonHints = [sourceRef, sourceRefHint, ...resolved.allowedFiles, ...resolved.protectedScopes].filter(Boolean);
    const canonicalMatches = touchesCanonicalTruthProtectedFiles(canonHints);
    const canonicalKeyword = canonHints.some((x) => /canonical[-_]?truth/i.test(String(x || "")));
    const protectedScopeDetected = canonicalMatches.length > 0 || canonicalKeyword;
    const ownerRequired = protectedScopeDetected || riskLevel === "high" || riskLevel === "critical";
    if (["approved", "rejected", "blocked"].includes(decision) && !["owner", "agent_supervisor"].includes(actorRole)) {
      const adminAllowed = actorRole === "admin_operator" && decision === "approved" && ["low", "medium"].includes(riskLevel) && !ownerRequired;
      if (!adminAllowed) throw new HttpsError("permission-denied", "role_denied");
    }
    if (ownerRequired && actorRole !== "owner") throw new HttpsError("failed-precondition", "protected_scope_owner_required");
    const ref = db.collection(targetType === "agent" ? "agentCenterDecisions" : "missionCenterDecisions").doc();
    const now = FieldValue.serverTimestamp();
    const statusByDecision = { approved: "approved", rejected: "rejected", blocked: "blocked", revise: "revision_requested", review: "review" };
    const timelineByDecision = { approvedAt: decision === "approved" ? now : null, rejectedAt: decision === "rejected" ? now : null, blockedAt: decision === "blocked" ? now : null, revisionRequestedAt: decision === "revise" ? now : null, waitingForApprovalAt: decision === "review" ? now : null };
    const approvalFields = resolved.inbox ? buildExecutionContractApprovalFields(resolved.inbox) : {};
    const isSingleDecisionInbox = Boolean(resolved.inbox && (((resolved.inbox.executionContract && resolved.inbox.executionContract.mode) || resolved.inbox.mode) === "single_owner_decision"));
    const doc = { decisionId: ref.id, targetType, targetId, sourceRef, decision, status: statusByDecision[decision] || decision, decidedBy: actorId, decidedByRole: actorRole, reason, riskLevel, protectedScopeDetected, ownerRequired, ...(isSingleDecisionInbox && decision === "approved" ? { approvalMode: "single_owner_decision", approvedExecutionContractVersion: approvalFields.executionContractVersion || null, approvedExecutionContractHash: approvalFields.executionContractHash || null, approvalCoversAutomaticExecution: true } : {}), lastStatusChangedAt: now, ...timelineByDecision, createdAt: now };
    await ref.set(doc);
    if (resolved.inboxRef) {
      await resolved.inboxRef.set({
        status: statusByDecision[decision] || decision,
        approvedAt: decision === "approved" ? now : null,
        rejectedAt: decision === "rejected" ? now : null,
        blockedAt: decision === "blocked" ? now : null,
        revisionRequestedAt: decision === "revise" ? now : null,
        waitingForApprovalAt: decision === "review" ? now : null,
        lastStatusChangedAt: now,
        auditRef: ref.id,
        ...(isSingleDecisionInbox ? { singleDecisionStatus: decision === "approved" ? "single_decision_approved" : (decision === "rejected" ? "single_decision_rejected" : (decision === "revise" ? "single_decision_revision_requested" : (decision === "blocked" ? "single_decision_blocked" : "pending_single_decision"))), autoProgressStatus: decision === "approved" ? "auto_progress_ready" : "auto_progress_paused", ...(decision === "approved" ? { approvedExecutionContractVersion: approvalFields.executionContractVersion || null, approvedExecutionContractHash: approvalFields.executionContractHash || null, approvalMode: "single_owner_decision", approvalCoversAutomaticExecution: true, requiresSingleDecisionReapproval: false, reapprovalReason: "" } : { approvalCoversAutomaticExecution: false }) } : {}),
        updatedAt: now,
      }, { merge: true });
    }
    await writeAgentAudit(db, { actorId, actorRole, action: `${targetType}_center_${decision}`, proposalId: targetId, riskLevel, result: decision });
    return { accepted: true, decisionId: ref.id, targetType, targetId, decision, ownerRequired, protectedScopeDetected };
  }


  async function readLimitedCollection(collectionName, limit = 200) {
    const snap = await db.collection(collectionName).limit(limit).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }));
  }

  async function safeCountCollection(collectionName) {
    try {
      const aggregate = await db.collection(collectionName).count().get();
      return aggregate.data().count || 0;
    } catch (error) {
      const snap = await db.collection(collectionName).limit(1000).get();
      return snap.size;
    }
  }

  async function getBuilderWorkPackagesForSerialGroup(serialGroup = BUILDER_SERIAL_GROUP) {
    const snap = await db.collection("agentBuilderWorkPackages").where("serialGroup", "==", serialGroup).limit(200).get();
    return snap.docs.map(mapSafeBuilderWorkPackageDoc).sort((a, b) => Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0));
  }

  async function getNextBuilderSequenceNumber(transaction) {
    const counterRef = db.collection("agentAutomationControl").doc("builderQueueCounter");
    const counterSnap = await transaction.get(counterRef);
    const current = counterSnap.exists ? Number((counterSnap.data() || {}).lastSequenceNumber || 0) : 0;
    const next = current + 1;
    transaction.set(counterRef, { lastSequenceNumber: next, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return next;
  }

  async function pauseAutopilotForBuilderBlocker(reason) {
    const autopilot = await getAutopilotControl(db);
    await autopilot.ref.set({ paused: true, pauseReason: reason, nextRecommendedAction: "Queue pausiert: Blocker pruefen, Repair planen oder Owner-Entscheidung einholen. Keine neue Arbeit starten.", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }

  exportsTarget.getAgentCenterAutopilotSnapshot = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const [inboxRaw, safetyDossierRaw, proposalsRaw, workerRaw, runnerRaw, pickupRaw, planRaw, builderPackages, autopilotDoc] = await Promise.all([
      readLimitedCollection("agentCenterInbox", 200),
      readLimitedCollection("agentSafetyDossiers", 200),
      readLimitedCollection("agentTaskProposals", 200),
      readLimitedCollection("agentTaskWorkerQueue", 200),
      readLimitedCollection("agentRunnerJobs", 200),
      readLimitedCollection("agentRunnerPickupContracts", 200),
      readLimitedCollection("agentRunnerImplementationPlans", 200),
      getBuilderWorkPackagesForSerialGroup(BUILDER_SERIAL_GROUP),
      getAutopilotControl(db),
    ]);
    const [inboxTotal, decisionsTotal] = await Promise.all([safeCountCollection("agentCenterInbox"), safeCountCollection("agentCenterDecisions")]);
    const inbox = inboxRaw.map((doc) => mapSafeAgentCenterDossierDoc(doc));
    const openDossiers = inbox.filter((item) => !["approved", "rejected", "blocked", "synced_to_task_proposal"].includes(String(item.status || ""))).slice(0, 25);
    const approvedDossiers = inbox.filter((item) => String(item.status || "") === "approved").slice(0, 25);
    const resetSafety = buildAgentCenterPipelineResetSafetyDecision({ dryRun: true, previewOnly: true });
    const builderGuard = buildBuilderQueueGuardState(builderPackages, autopilotDoc.data);
    const blockedBuilders = builderPackages.filter((item) => ["blocked", "repair_required", "paused"].includes(getBuilderWorkPackageStatusBucket(item.status)));
    const lastKnownBlocker = builderGuard.lastKnownBlocker || (blockedBuilders[0] ? `${blockedBuilders[0].workPackageId}:${blockedBuilders[0].status}` : null) || sanitizeTelemetryText((autopilotDoc.data || {}).pauseReason, 240);
    const lastCheckOrRepairStatus = builderPackages.find((item) => Number(item.repairAttemptCount || 0) > 0 || String(item.status || "") === "repair_required") || null;
    const sanitizedAutopilotControl = sanitizeAutopilotControl(autopilotDoc.data);
    const nextRecommendedAction = lastKnownBlocker
      ? "Blocker/Repair im Admin Center pruefen; keine neue Builder-Arbeit starten."
      : (approvedDossiers.length > 0 ? "Freigegebene Dossiers nacheinander als metadata-only Bauauftraege vorbereiten." : sanitizedAutopilotControl.nextRecommendedAction);
    const snapshot = {
      snapshotVersion: "agent-center-autopilot-snapshot-v1",
      snapshotCreatedAt: new Date().toISOString(),
      agentCenterCounts: {
        inboxTotal,
        decisionTotal: decisionsTotal,
        loadedInboxCount: inbox.length,
        openDossiers: openDossiers.length,
        approvedDossiers: approvedDossiers.length,
      },
      safetyDossierStatus: {
        loadedCount: safetyDossierRaw.length,
        blockers: safetyDossierRaw.filter((item) => String(item.status || "").includes("blocker")).length,
        sample: safetyDossierRaw.slice(0, 10).map(mapSafeAgentCenterDossierDoc),
      },
      resetSafetyStatus: sanitizeTelemetryObject(resetSafety),
      openAgentDossiers: openDossiers,
      approvedAgentDossiers: approvedDossiers,
      taskProposalCounts: buildAgentTaskProposalStatusCounts(proposalsRaw),
      workerQueueCounts: getStatusCountsByBucket(workerRaw, (item) => getWorkerQueueStatusBucket(item.status || item.workerStatus), ["waiting_review", "waiting_owner", "ready_for_worker", "in_progress", "completed", "blocked", "repair_required"]),
      runnerJobCounts: getStatusCountsByBucket(runnerRaw, (item) => getRunnerJobStatusBucket(item.status || item.runnerJobStatus), ["pending_runner_pickup", "pickup_contract_created", "implementation_plan_created", "planning", "in_progress", "completed", "blocked", "repair_required"]),
      pickupContractCounts: getStatusCountsByBucket(pickupRaw, (item) => getPickupContractStatusBucket(item.status), ["planning_open", "implementation_plan_created", "implementation_plan_review", "implementation_plan_approved", "planning", "completed", "blocked", "repair_required"]),
      implementationPlanCounts: getStatusCountsByBucket(planRaw, (item) => getImplementationPlanStatusBucket(item.status), ["created", "review", "approved", "planning", "completed", "blocked", "repair_required"]),
      builderWorkPackageCounts: getStatusCountsByBucket(builderPackages, (item) => getBuilderWorkPackageStatusBucket(item.status), ["proposed", "waiting", "active", "blocked", "repair_required", "completed", "cancelled", "paused"]),
      builderWorkPackages: builderPackages.slice(0, 50),
      builderQueueGuard: builderGuard,
      lastKnownBlocker: sanitizeTelemetryText(lastKnownBlocker, 260),
      lastCheckOrRepairStatus: lastCheckOrRepairStatus ? sanitizeTelemetryObject(lastCheckOrRepairStatus) : null,
      autopilotControl: sanitizedAutopilotControl,
      nextRecommendedAction,
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
      noTokenPaymentBlockchain: true,
      sanitized: true,
      screenshotsNoLongerNeededReason: "Dieser Snapshot liefert Agenten bereinigte Counts, Dossierlisten und Queue-Status ohne private E-Mails, Tokens, Secrets, Sessions oder volle Payloads.",
    };
    return { accepted: true, snapshot };
  });

  exportsTarget.prepareBuilderWorkPackageFromApprovedDossier = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const data = request.data || {};
    const dossierId = requiredString(data.dossierId || data.inboxId || data.sourceDossierId, "dossierId", HttpsError, 180);
    const baseSha = optionalString(data.baseSha, 120);
    const dossierRef = db.collection("agentCenterInbox").doc(dossierId);
    const now = FieldValue.serverTimestamp();
    const result = await db.runTransaction(async (transaction) => {
      const [dossierSnap, packagesSnap, autopilotSnap] = await Promise.all([
        transaction.get(dossierRef),
        transaction.get(db.collection("agentBuilderWorkPackages").where("serialGroup", "==", BUILDER_SERIAL_GROUP).limit(200)),
        transaction.get(db.collection("agentAutomationControl").doc("autopilot")),
      ]);
      if (!dossierSnap.exists) throw new HttpsError("not-found", "approved_dossier_not_found");
      const dossier = dossierSnap.data() || {};
      if (String(dossier.status || "") !== "approved") throw new HttpsError("failed-precondition", "dossier_not_approved");
      const existingForDossier = packagesSnap.docs.find((doc) => String((doc.data() || {}).sourceDossierId || "") === String(dossier.sourceDossierId || dossierId));
      if (existingForDossier) {
        const existing = mapSafeBuilderWorkPackageDoc(existingForDossier);
        return { existing: true, workPackage: existing };
      }
      const active = packagesSnap.docs.filter((doc) => String((doc.data() || {}).status || "") === "active_metadata_only");
      const blocking = packagesSnap.docs.filter((doc) => ["blocked_by_existing_active_work", "blocked_by_failed_checks", "blocked_by_stale_base", "repair_required", "paused_by_owner"].includes(String((doc.data() || {}).status || "")));
      const repairLimitHit = packagesSnap.docs.some((doc) => Number((doc.data() || {}).repairAttemptCount || 0) >= BUILDER_MAX_REPAIR_ATTEMPTS || String((doc.data() || {}).status || "") === "repair_required");
      const sequenceNumber = await getNextBuilderSequenceNumber(transaction);
      const wpRef = db.collection("agentBuilderWorkPackages").doc();
      const wpBase = buildBuilderWorkPackageFromDossier({ dossier, dossierId, actorRole, sequenceNumber, baseSha });
      const automationPaused = repairLimitHit || blocking.length > 0 || (autopilotSnap.exists && (autopilotSnap.data() || {}).paused === true);
      const status = "approved_waiting";
      const workPackage = {
        ...wpBase,
        workPackageId: wpRef.id,
        status,
        existingActiveWorkPackageCount: active.length,
        automationPaused,
        pauseReason: automationPaused ? (repairLimitHit ? "repair_limit_reached" : "open_previous_blocker") : null,
        createdBy: actorId,
        createdByRole: actorRole,
        ownerApprovedAt: dossier.approvedAt || now,
        createdAt: now,
        updatedAt: now,
        lastStatusChangedAt: now,
      };
      if (!workPackage.allowedFiles.length || !workPackage.blockedFiles.length || !workPackage.requiredChecks.length) throw new HttpsError("failed-precondition", "missing_allowed_blocked_files_or_required_checks");
      assertCanonicalTruthChangeAllowed({ files: [...workPackage.allowedFiles, ...workPackage.blockedFiles], actorRole, ownerApprovalFlag: false, HttpsError });
      transaction.set(wpRef, workPackage, { merge: true });
      transaction.set(db.collection("agentAutomationControl").doc("autopilot"), {
        ...buildDefaultAutopilotControl(),
        ...(autopilotSnap.exists ? (autopilotSnap.data() || {}) : {}),
        mode: (autopilotSnap.exists && (autopilotSnap.data() || {}).mode) || "builder_metadata_only",
        maxConcurrentWorkPackages: 1,
        maxRepairAttempts: BUILDER_MAX_REPAIR_ATTEMPTS,
        paused: automationPaused,
        pauseReason: automationPaused ? workPackage.pauseReason : ((autopilotSnap.exists && (autopilotSnap.data() || {}).pauseReason) || null),
        nextRecommendedAction: automationPaused ? "Vorherigen Blocker/Repair pruefen; neue Bauauftraege bleiben approved_waiting." : "Naechstes Work Package bleibt approved_waiting, bis Owner spaeter Aktivierung erlaubt.",
        lastOwnerDecisionAt: now,
        updatedAt: now,
      }, { merge: true });
      return { existing: false, workPackage: mapSafeBuilderWorkPackageDoc({ id: wpRef.id, data: () => workPackage }) };
    });
    if (result.workPackage && Number(result.workPackage.repairAttemptCount || 0) >= BUILDER_MAX_REPAIR_ATTEMPTS) await pauseAutopilotForBuilderBlocker("repair_limit_reached");
    await writeAgentAudit(db, { actorId, actorRole, action: result.existing ? "builder_work_package_existing_for_approved_dossier" : "builder_work_package_prepared_from_approved_dossier", proposalId: dossierId, result: result.workPackage.status || "approved_waiting" });
    return { accepted: true, workPackage: result.workPackage, workPackageId: result.workPackage.workPackageId, status: result.workPackage.status, existing: result.existing, noRunnerStarted: true, noBranchOrPrOrMerge: true, noDeploy: true, noTokenPaymentBlockchain: true };
  });

  exportsTarget.pauseAgentAutopilotMetadataOnly = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const reason = optionalString(request.data && request.data.reason, 240) || "paused_by_owner";
    const autopilot = await getAutopilotControl(db);
    await autopilot.ref.set({ paused: true, pauseReason: reason, lastOwnerDecisionAt: FieldValue.serverTimestamp(), nextRecommendedAction: "Autopilot metadata-only pausiert. Keine Builder-Aktivierung, kein Runner, kein Deploy.", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "autopilot_metadata_only_paused", result: "paused" });
    return { accepted: true, status: "paused", noRunnerStarted: true, noBranchOrPrOrMerge: true, noDeploy: true, noTokenPaymentBlockchain: true };
  });

  exportsTarget.resumeAgentAutopilotMetadataOnly = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner"]);
    const autopilot = await getAutopilotControl(db);
    await autopilot.ref.set({ paused: false, pauseReason: null, mode: "builder_metadata_only", maxConcurrentWorkPackages: 1, lastOwnerDecisionAt: FieldValue.serverTimestamp(), nextRecommendedAction: "Metadata-only Planung fortsetzen; echte GitHub-Automation bleibt aus.", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await writeAgentAudit(db, { actorId, actorRole, action: "autopilot_metadata_only_resumed", result: "builder_metadata_only" });
    return { accepted: true, status: "builder_metadata_only", noRunnerStarted: true, noBranchOrPrOrMerge: true, noDeploy: true, noTokenPaymentBlockchain: true };
  });

  exportsTarget.approveAgentCenterProposal = onCall(async (request) => writeCenterDecision({ request, targetType: "agent", decision: "approved" }));
  exportsTarget.rejectAgentCenterProposal = onCall(async (request) => writeCenterDecision({ request, targetType: "agent", decision: "rejected" }));
  exportsTarget.requestRevisionAgentCenterProposal = onCall(async (request) => writeCenterDecision({ request, targetType: "agent", decision: "revise" }));
  exportsTarget.blockAgentCenterProposal = onCall(async (request) => writeCenterDecision({ request, targetType: "agent", decision: "blocked" }));
  exportsTarget.markAgentCenterProposalForReview = onCall(async (request) => writeCenterDecision({ request, targetType: "agent", decision: "review" }));
  exportsTarget.approveMissionCenterProposal = onCall(async (request) => writeCenterDecision({ request, targetType: "mission", decision: "approved" }));
  exportsTarget.rejectMissionCenterProposal = onCall(async (request) => writeCenterDecision({ request, targetType: "mission", decision: "rejected" }));
  exportsTarget.requestRevisionMissionCenterProposal = onCall(async (request) => writeCenterDecision({ request, targetType: "mission", decision: "revise" }));
  exportsTarget.blockMissionCenterProposal = onCall(async (request) => writeCenterDecision({ request, targetType: "mission", decision: "blocked" }));
  exportsTarget.markMissionCenterProposalForReview = onCall(async (request) => writeCenterDecision({ request, targetType: "mission", decision: "review" }));


}

module.exports = { registerAgentAdminRolesAudit, AGENT_CENTER_PIPELINE_RESET_BLOCKED_MESSAGE, AGENT_CENTER_PIPELINE_DELETE_COLLECTIONS, AGENT_CENTER_PIPELINE_PROTECTED_COLLECTIONS, buildAgentCenterPipelineResetSafetyDecision, buildAgentCenterPipelineResetScope, BLOCKED_PROTECTED_SCOPES, CANONICAL_TRUTH_PROTECTED_FILES, CANONICAL_TRUTH_PROPOSAL_FILE, touchesCanonicalTruthProtectedFiles, assertCanonicalTruthChangeAllowed, buildCanonicalTruthPromptGuardrail, resolveRegisterSnapshot, getFirstRunCandidateCollections, sanitizeFirestoreDocIdPart, buildAgentCenterInboxId, buildProductEvolutionRevisionDossier, getRevisionMissingFields, isCompleteDecisionDossier, validateSingleDecisionExecutionContract, findRevisionSourcePayload, buildReadableDecisionDossierLookup, findReadableDecisionDossierForItem, overlayReadableDecisionDossierFields, getAgentTaskProposalStatusBucket, buildAgentTaskProposalStatusCounts, getStatusCountsByBucket, getWorkerQueueStatusBucket, getRunnerJobStatusBucket, getPickupContractStatusBucket, getImplementationPlanStatusBucket, getBuilderWorkPackageStatusBucket, sanitizeTelemetryObject, sanitizeAutopilotControl, buildBuilderQueueGuardState, buildBuilderWorkPackageFromDossier, getWorkerQueueReleaseTargetId, buildWorkerQueueReleaseFailureMessage, buildWorkerQueueReleaseDecision, buildRunnerPickupPreviewFailureMessage, buildRunnerPickupPreviewDecision, buildRunnerStartApprovalFailureMessage, buildRunnerStartApprovalDecision, buildManualRunnerPickupContractFailureMessage, buildManualRunnerPickupContractDecision, buildManualRunnerImplementationPlanFailureMessage, buildManualRunnerImplementationPlanDecision, buildManualRunnerImplementationPlanApprovalFailureMessage, buildManualRunnerImplementationPlanApprovalDecision, REVISION_DOSSIER_MESSAGE, SINGLE_DECISION_BLOCKER_MESSAGE, SINGLE_DECISION_REAPPROVAL_REASON, AUTO_PROGRESS_CONTRACT_BLOCKED_MESSAGE, SINGLE_DECISION_STATUSES, EXECUTION_MODES, buildExecutionContractHash, buildExecutionContractApprovalFields, buildSingleDecisionReapprovalState, contractApprovalCoversCurrentExecutionContract };
