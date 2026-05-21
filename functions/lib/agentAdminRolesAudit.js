const { FieldValue } = require("firebase-admin/firestore");
const { optionalString, requiredString } = require("./beta1Runtime");

const ALLOWED_TARGET_TRACKS = ["docs_register", "runtime_ui", "runtime_backend", "live_page", "evidence", "blocked"];
const PROPOSAL_STATUSES = ["proposed", "review_required", "approved", "rejected", "executed", "blocked"];
const APPROVAL_STATUSES = ["approved", "rejected", "revoked"];
const EXECUTION_STATUSES = ["queued", "running", "completed", "failed", "blocked"];
const CHECK_RESULTS = ["pass", "fail", "blocked", "skipped"];
const HANDOFF_PROMPT_STATUSES = ["generated", "copied", "superseded", "blocked"];
const BLOCKED_PROTECTED_SCOPES = new Set(["token", "nft", "payment", "cashout", "blockchain", "sui", "wft", "child", "health", "location", "privacy", "legal"]);

const BASE_REQUIRED_CHECKS = ["npm run agent:validate", "npm run agent:quality-gate", "npm run lint", "git diff --check"];
const FUNCTION_SCOPE_MARKERS = ["runtime_backend", "functions", "firestore"];
const UI_SCOPE_MARKERS = ["runtime_ui", "live_page", "ui", "app", "components"];

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
