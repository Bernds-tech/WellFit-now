const { FieldValue } = require("firebase-admin/firestore");
const { optionalString, requiredString } = require("./beta1Runtime");

const ALLOWED_TARGET_TRACKS = ["docs_register", "runtime_ui", "runtime_backend", "live_page", "evidence", "blocked"];
const PROPOSAL_STATUSES = ["proposed", "review_required", "approved", "rejected", "executed", "blocked"];
const APPROVAL_STATUSES = ["approved", "rejected", "revoked"];
const EXECUTION_STATUSES = ["queued", "running", "completed", "failed", "blocked"];
const CHECK_RESULTS = ["pass", "fail", "blocked", "skipped"];
const HANDOFF_PROMPT_STATUSES = ["generated", "copied", "superseded", "blocked"];
const WORKER_QUEUE_STATUSES = ["ready_for_worker", "claimed", "running", "checks_recorded", "pr_prepared", "blocked", "failed", "completed"];
const WORKER_QUEUE_MODES = ["manual_codex", "supervised_agent", "automated_low_risk_planned"];
const CHECK_RESULT_VALUES = ["pass", "fail", "blocked", "skipped"];
const BLOCKED_PROTECTED_SCOPES = new Set(["token", "nft", "payment", "cashout", "blockchain", "sui", "wft", "child", "health", "location", "privacy", "legal"]);

const CANONICAL_TRUTH_PROTECTED_FILES = [
  "project-register/wellfit-beta1-canonical-truth.json",
  "docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md",
  "todolist/CODEX_CONTEXT_WELLFIT_BETA1.md",
];
const CANONICAL_TRUTH_PROPOSAL_FILE = "todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md";

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
const HIGH_RISK_FILE_PREFIXES = ["functions/", ".github/"];
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

function normalizeRiskLevel(value) {
  const risk = optionalString(value, 40) || "medium";
  return ["low", "medium", "high", "critical"].includes(risk) ? risk : "medium";
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
    assertCanonicalTruthChangeAllowed({ files: proposal.allowedFiles || [], actorRole, ownerApprovalFlag: ownerCanonicalTruthApproval, HttpsError });
    const approvalRef = db.collection("agentTaskApprovals").doc();
    const approval = {
      approvalId: approvalRef.id, proposalId, approverId: actorId, approverRole: actorRole, approvalScope,
      approvedAllowedFiles: parseStringList(data.approvedAllowedFiles && data.approvedAllowedFiles.length ? data.approvedAllowedFiles : proposal.allowedFiles),
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
      workerStatus: "ready_for_worker", workerMode, humanMergeRequired: true, autoMerge: false, autoDeploy: false,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(doc);
    await writeAgentAudit(db, { actorId, actorRole, action: "worker_queue_created", proposalId: doc.proposalId, approvalId: doc.approvalId, executionId, promptRef: handoffPromptId, allowedFiles: doc.allowedFiles, blockedFiles: doc.blockedFiles, result: "ready_for_worker" });
    return { accepted: true, workerQueueId: ref.id, workerStatus: "ready_for_worker", humanMergeRequired: true, autoMerge: false, autoDeploy: false };
  });

  exportsTarget.claimAgentWorkerQueueItem = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "agent_executor_service"]);
    const workerQueueId = requiredString(request.data && request.data.workerQueueId, "workerQueueId", HttpsError, 180);
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
    const workerQueueId = requiredString(request.data && request.data.workerQueueId, "workerQueueId", HttpsError, 180);
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
    const workerQueueId = requiredString(request.data && request.data.workerQueueId, "workerQueueId", HttpsError, 180);
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
    const workerQueueId = requiredString(request.data && request.data.workerQueueId, "workerQueueId", HttpsError, 180);
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
    const workerQueueId = requiredString(request.data && request.data.workerQueueId, "workerQueueId", HttpsError, 180);
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
    const workerQueueId = requiredString(request.data && request.data.workerQueueId, "workerQueueId", HttpsError, 180);
    const snap = await db.collection("agentTaskWorkerQueue").doc(workerQueueId).get();
    if (!snap.exists) throw new HttpsError("not-found", "Worker Queue Item nicht gefunden.");
    return { accepted: true, item: snap.data() };
  });

  exportsTarget.createAgentAutomationPolicy = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const workerQueueId = requiredString(request.data && request.data.workerQueueId, "workerQueueId", HttpsError, 180);
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

  exportsTarget.prepareAgentSupervisedRunnerJob = onCall(async (request)=>{const { actorId, actorRole } = requireRole(request, HttpsError,["owner","agent_supervisor","admin_operator"]); const workerQueueId=requiredString(request.data&&request.data.workerQueueId,"workerQueueId",HttpsError,180); const policyId=requiredString(request.data&&request.data.policyId,"policyId",HttpsError,180); const policySnap = await db.collection("agentTaskAutomationPolicies").doc(policyId).get(); const policy = policySnap.data() || {}; const gate = computeRunnerAutomationGate(policy); const ref=db.collection("agentTaskSupervisedRunnerJobs").doc(); await ref.set({jobId:ref.id,workerQueueId,policyId,runnerStatus:"metadata_only",deployAllowed:gate.deployAllowed,mergeAllowed:gate.mergeAllowed,autoDeployEnvironment:gate.environment,canonicalTruthReadRequired:true,canonicalTruthProtectedFiles:CANONICAL_TRUTH_PROTECTED_FILES,canonicalTruthEditable:false,canonicalTruthOwnerApprovalRequired:true,canonicalTruthChangeProposalFile:CANONICAL_TRUTH_PROPOSAL_FILE,createdBy:actorId,createdByRole:actorRole,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()}); await db.collection("agentTaskWorkerQueue").doc(workerQueueId).set({ deployAllowed: gate.deployAllowed, mergeAllowed: gate.mergeAllowed, autoDeployEnvironment: gate.environment, supervisedRunnerStatus: "metadata_only", updatedAt: FieldValue.serverTimestamp() }, { merge: true }); await writeAgentAudit(db,{actorId,actorRole,action:"automation_runner_job_prepared",result:"metadata_only",approvalId: policyId}); return {accepted:true,jobId:ref.id,runnerStatus:"metadata_only",deployAllowed:gate.deployAllowed,mergeAllowed:gate.mergeAllowed,status:"metadata_only"};});

  exportsTarget.listAgentTaskProposals = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const status = optionalString(request.data && request.data.status, 40);
    let query = db.collection("agentTaskProposals").orderBy("createdAt", "desc").limit(100);
    if (status && PROPOSAL_STATUSES.includes(status)) query = query.where("status", "==", status);
    const snapshot = await query.get();
    return { accepted: true, proposals: snapshot.docs.map((doc) => doc.data()) };
  });
}

module.exports = { registerAgentAdminRolesAudit, BLOCKED_PROTECTED_SCOPES, CANONICAL_TRUTH_PROTECTED_FILES, CANONICAL_TRUTH_PROPOSAL_FILE, touchesCanonicalTruthProtectedFiles, assertCanonicalTruthChangeAllowed, buildCanonicalTruthPromptGuardrail };
