const { FieldValue } = require("firebase-admin/firestore");
const { optionalString, requiredString } = require("./beta1Runtime");

const ALLOWED_TARGET_TRACKS = ["docs_register", "runtime_ui", "runtime_backend", "live_page", "evidence", "blocked"];
const PROPOSAL_STATUSES = ["proposed", "review_required", "approved", "rejected", "executed", "blocked"];
const APPROVAL_STATUSES = ["approved", "rejected", "revoked"];
const EXECUTION_STATUSES = ["queued", "running", "completed", "failed", "blocked"];
const CHECK_RESULTS = ["pass", "fail", "blocked", "skipped"];
const BLOCKED_PROTECTED_SCOPES = new Set(["token", "nft", "payment", "cashout", "blockchain", "sui", "wft", "child", "health", "location", "privacy", "legal"]);

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
      status: "proposed",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(proposal);
    await writeAgentAudit(db, { actorId, actorRole, action: "proposal_created", proposalId: ref.id, promptRef: proposal.promptRef, allowedFiles: proposal.allowedFiles, blockedFiles: proposal.blockedFiles, riskLevel: proposal.riskLevel, result: "created" });
    return { accepted: true, proposalId: ref.id, status: proposal.status };
  });

  exportsTarget.reviewAgentTaskProposal = onCall(async (request) => {
    const { actorId, actorRole } = requireRole(request, HttpsError, ["owner", "agent_supervisor", "admin_operator"]);
    const data = request.data || {};
    const proposalId = requiredString(data.proposalId, "proposalId", HttpsError, 180);
    const status = optionalString(data.status, 40) || "review_required";
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
    const approvalRef = db.collection("agentTaskApprovals").doc();
    const approval = {
      approvalId: approvalRef.id, proposalId, approverId: actorId, approverRole: actorRole, approvalScope,
      approvedAllowedFiles: parseStringList(data.approvedAllowedFiles && data.approvedAllowedFiles.length ? data.approvedAllowedFiles : proposal.allowedFiles),
      approvedBlockedFiles: parseStringList(data.approvedBlockedFiles && data.approvedBlockedFiles.length ? data.approvedBlockedFiles : proposal.blockedFiles),
      approvalExpiresAt: data.approvalExpiresAt || null,
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
    const executionRef = db.collection("agentTaskExecutions").doc();
    const status = optionalString(data.status, 40) || "queued";
    if (!EXECUTION_STATUSES.includes(status)) throw new HttpsError("invalid-argument", "Ungültiger Execution-Status.");
    const execution = { executionId: executionRef.id, proposalId, approvalId, executorType: ["codex", "agent", "human"].includes(optionalString(data.executorType, 40)) ? optionalString(data.executorType, 40) : "agent", branchName: requiredString(data.branchName, "branchName", HttpsError, 200), commitSha: optionalString(data.commitSha, 120), prRef: optionalString(data.prRef, 200), status, startedAt: FieldValue.serverTimestamp(), completedAt: null, checkSummary: optionalString(data.checkSummary, 800) || null };
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

  exportsTarget.listAgentTaskProposals = onCall(async (request) => {
    requireRole(request, HttpsError, ["owner", "agent_supervisor", "readonly_observer", "support_operator", "admin_operator"]);
    const status = optionalString(request.data && request.data.status, 40);
    let query = db.collection("agentTaskProposals").orderBy("createdAt", "desc").limit(100);
    if (status && PROPOSAL_STATUSES.includes(status)) query = query.where("status", "==", status);
    const snapshot = await query.get();
    return { accepted: true, proposals: snapshot.docs.map((doc) => doc.data()) };
  });
}

module.exports = { registerAgentAdminRolesAudit, BLOCKED_PROTECTED_SCOPES };
