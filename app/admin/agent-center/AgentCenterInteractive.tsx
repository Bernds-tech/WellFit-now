"use client";

import { useEffect, useMemo, useState } from "react";

import { getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";

import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import { buildAdminDecisionSummary, buildServerInboxCounts, deriveTimeline, formatAdminDate, getAgentStatusBucket, getMissionStatusBucket, getServerInboxStatusBucket } from "@/lib/admin/agentCenterStatus";
import type { AdminCallableAuthState, AdminCenterDetailStatus, AdminCenterListFilter, AgentCenterDecisionInput, AgentCenterInboxItem, MissionCenterDecisionInput, ApprovedInboxToTaskProposalResult, AgentTaskProposal, AgentTaskProposalListResult, ProductEvolutionInboxSyncResult, ProductEvolutionRevisionDossierResult } from "@/lib/admin/beta1AdminTypes";
import { auth } from "@/lib/firebase";

type DetailSections = Record<string, string>;
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
};

type DataProps = { agents: Row[]; missions: Row[]; stats: Partial<Record<AdminCenterListFilter, number>> };
type ServerInboxFilter = "server_total" | "server_pending" | "server_approved" | "server_rejected" | "server_blocked" | "server_revision_requested" | "server_synced_to_task_proposal";
type TaskProposalFilter = "task_total" | "task_pending" | "task_approved" | "task_rejected" | "task_in_progress" | "task_completed" | "task_blocked";
type TaskProposalBucket = "pending" | "approved" | "rejected" | "in_progress" | "completed" | "blocked" | "unknown";
type ActiveListFilter = AdminCenterListFilter | ServerInboxFilter | TaskProposalFilter;

const SERVER_FILTER_TO_BUCKET: Record<ServerInboxFilter, ReturnType<typeof getServerInboxStatusBucket> | "total"> = { server_total: "total", server_pending: "pending_approval", server_approved: "approved", server_rejected: "rejected", server_blocked: "blocked", server_revision_requested: "revision_requested", server_synced_to_task_proposal: "synced_to_task_proposal" };
const SERVER_FILTER_LABELS: Record<ServerInboxFilter, string> = { server_total: "Server-Inbox gesamt", server_pending: "Server: wartet auf Freigabe", server_approved: "Server: freigegeben", server_rejected: "Server: abgelehnt", server_blocked: "Server: blockiert", server_revision_requested: "Server: Überarbeitung angefordert", server_synced_to_task_proposal: "Server: Task Proposal erzeugt" };
const SERVER_FILTER_KEYS = Object.keys(SERVER_FILTER_TO_BUCKET) as ServerInboxFilter[];
const isServerInboxFilter = (value: ActiveListFilter): value is ServerInboxFilter => value.startsWith("server_");
const TASK_PROPOSAL_FILTER_TO_BUCKET: Record<TaskProposalFilter, TaskProposalBucket | "total"> = { task_total: "total", task_pending: "pending", task_approved: "approved", task_rejected: "rejected", task_in_progress: "in_progress", task_completed: "completed", task_blocked: "blocked" };
const TASK_PROPOSAL_FILTER_LABELS: Record<TaskProposalFilter, string> = { task_total: "Task Proposals gesamt", task_pending: "Task Proposals: warten/pending", task_approved: "Task Proposals: freigegeben", task_rejected: "Task Proposals: abgelehnt", task_in_progress: "Task Proposals: in Arbeit", task_completed: "Task Proposals: fertig", task_blocked: "Task Proposals: blockiert" };
const TASK_PROPOSAL_FILTER_KEYS = Object.keys(TASK_PROPOSAL_FILTER_TO_BUCKET) as TaskProposalFilter[];
const isTaskProposalFilter = (value: ActiveListFilter): value is TaskProposalFilter => value.startsWith("task_");

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
  if (["queued", "ready_for_worker", "claimed", "running", "checks_recorded", "pr_prepared", "in_progress"].includes(status)) return "in_progress";
  if (["completed", "done", "executed"].includes(status)) return "completed";
  if (["blocked", "failed", "repair_required"].includes(status)) return "blocked";
  return "unknown";
}

function buildTaskProposalCounts(proposals: AgentTaskProposal[]) {
  const counts: Record<TaskProposalBucket, number> & { total: number } = { total: proposals.length, pending: 0, approved: 0, rejected: 0, in_progress: 0, completed: 0, blocked: 0, unknown: 0 };
  proposals.forEach((proposal) => { counts[getTaskProposalBucket(proposal)] += 1; });
  return counts;
}

const firstText = (...values: unknown[]): string => { for (const value of values) { const text = asText(value).trim(); if (text) return text; } return ""; };
const getDecisionDetails = (row: Row) => {
  const allowedFiles = asStringArray(row.allowedFiles);
  const blockedFiles = asStringArray(row.blockedFiles);
  const requiredChecks = asStringArray(row.requiredChecks);
  const details = {
    title: firstText(row.title, row.id),
    summary: firstText(row.summary, row.plainSummary, row.detailSections?.summary, row.detailText),
    what: firstText(row.what, row.whatWillChange, row.detailSections?.what, row.detailSections?.proposedChange),
    why: firstText(row.why, row.whySuggested, row.detailSections?.why, row.detailSections?.whyNow),
    wellFitBenefit: firstText(row.wellFitBenefit, row.wellfitBenefit, row.detailSections?.wellFitBenefit),
    userBenefit: firstText(row.userBenefit, row.detailSections?.userBenefit),
    economyImpact: firstText(row.economyImpact, row.detailSections?.economyImpact),
    risk: firstText(row.risk, row.riskSummary, row.detailSections?.risk, row.detailSections?.risks),
    recommendationLabel: firstText(row.recommendationLabel, row.recommendation, row.detailSections?.recommendation),
    recommendationText: firstText(row.recommendationText, row.recommendationLabel, row.recommendation, row.detailSections?.recommendation),
    recommendation: firstText(row.recommendationText, row.recommendationLabel, row.recommendation, row.detailSections?.recommendation),
    recommendationDebug: firstText(row.recommendation, row.detailSections?.recommendation),
    source: firstText(row.sourceRef, row.sourcePath, row.dossierRef, row.sourceType),
    nextStep: firstText(row.nextStep, "Approved Inbox → Task Proposal. Kein Runner/Deploy automatisch."),
    allowedFiles, blockedFiles, requiredChecks,
  };
  const missing = [!details.summary ? "summary" : "", !details.what ? "what" : "", !details.why ? "why" : "", !details.wellFitBenefit ? "wellFitBenefit" : "", !details.userBenefit ? "userBenefit" : "", !details.economyImpact ? "economyImpact" : "", !details.risk ? "risk" : "", !details.recommendation ? "recommendation" : "", allowedFiles.length === 0 ? "allowedFiles" : "", blockedFiles.length === 0 ? "blockedFiles" : "", requiredChecks.length === 0 ? "requiredChecks" : ""].filter(Boolean);
  return { ...details, missing, isComplete: missing.length === 0 };
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
  if (diagnostic.includes("inbox_not_approved") || diagnostic.includes("inbox_status_not_allowed") || message === "Eintrag ist nicht approved.") return "Eintrag ist nicht approved.";
  if (diagnostic.includes("missing_approved_admin_decision") || message === "Missing approved admin decision.") return "Missing approved admin decision.";
  if (diagnostic.includes("missing_decision_data") || message === "Missing decision data.") return "Missing decision data.";
  if (diagnostic.includes("protected_scope_owner_required") || message === "Protected scope owner required.") return "Protected scope owner required.";
  if (diagnostic.includes("center_inbox_not_decidable") || message === "Eintrag ist nicht mehr entscheidbar.") return "Eintrag ist nicht mehr entscheidbar.";
  if (diagnostic.includes("server_inbox_entry_not_found") || diagnostic.includes("inbox_not_found") || code.includes("not-found") || message === "Server-Inbox-Eintrag nicht gefunden.") return "Server-Inbox-Eintrag nicht gefunden.";
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
  const [detailRow, setDetailRow] = useState<Row | null>(null);
  const [taskProposalDetail, setTaskProposalDetail] = useState<AgentTaskProposal | null>(null);
  const [syncDebug, setSyncDebug] = useState<Record<string, unknown>>({});
  const [authDebug, setAuthDebug] = useState<AdminCallableAuthState>({ authReady: false, firebaseUserPresent: false, firebaseUidPresent: false, idTokenAvailable: false, tokenClaimsLoaded: false, agentRoleClaim: null, adminCallableAuthReady: false, lastAuthGuardMessage: "" });
  const [authActionPending, setAuthActionPending] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async () => {
      const state = await beta1AdminClient.getAdminCallableAuthState(false);
      setAuthDebug(state);
    });
    return () => unsubscribe();
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
  const visibleListSource: "server_inbox" | "local_snapshot" | "task_proposals" = isTaskProposalFilter(active) ? "task_proposals" : (isServerInboxFilter(active) ? "server_inbox" : "local_snapshot");
  const activeCountSource: "server_inbox" | "legacy_register" | "mission_proposals" | "task_proposals" = isTaskProposalFilter(active) ? "task_proposals" : (isServerInboxFilter(active) ? "server_inbox" : (isMissionFilter(active) ? "mission_proposals" : "legacy_register"));
  const serverInboxCounts = useMemo(() => buildServerInboxCounts(serverInboxRows), [serverInboxRows]);
  const serverInboxPendingCount = serverInboxCounts.pending_approval;
  const taskProposalCounts = useMemo(() => buildTaskProposalCounts(taskProposals), [taskProposals]);

  const visibleTaskProposals = useMemo(() => {
    const sorted = [...taskProposals].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    if (!isTaskProposalFilter(active)) return [];
    const bucket = TASK_PROPOSAL_FILTER_TO_BUCKET[active];
    if (bucket === "total") return sorted;
    return sorted.filter((proposal) => getTaskProposalBucket(proposal) === bucket);
  }, [active, taskProposals]);

  const visible = useMemo(() => {
    if (isTaskProposalFilter(active)) return [];
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

  async function refreshTaskProposals() {
    if (!(await ensureAdminAuthReady())) return;
    setBusy(true);
    try {
      const result = await beta1AdminClient.listAgentTaskProposals() as AgentTaskProposalListResult;
      const proposals = Array.isArray(result.proposals) ? result.proposals : [];
      setTaskProposals(proposals);
      setSyncDebug((prev) => ({
        ...prev,
        taskProposalLoadedCount: proposals.length,
        taskProposalPendingCount: proposals.filter((proposal) => getTaskProposalBucket(proposal) === "pending").length,
        taskProposalNoRunnerStartedVisible: proposals.some((proposal) => proposal.noRunnerStarted === true),
        taskProposalNoBranchOrPrOrMergeVisible: proposals.some((proposal) => proposal.noBranchOrPrOrMerge === true),
        taskProposalNoDeployVisible: proposals.some((proposal) => proposal.noDeploy === true),
      }));
      setSyncStatus(`Task Proposals geladen: ${proposals.length}. Read-only Review; keine Worker Queue, kein Runner, kein Deploy.`);
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
    if (status !== "pending_approval") return "Status erlaubt diese Aktion nicht";
    if (_action === "approve" && getDecisionDetails(row).missing.length > 0) return "Dossier unvollständig – zuerst Überarbeiten wählen";

    return "";
  }

  function taskProposalButtonReason(row: Row): string {
    const status = String(row.status || "").toLowerCase();
    const inboxId = asText(row.inboxId);
    if (!inboxId) return "Server-Inbox-Eintrag fehlt";
    if (!authDebug.adminCallableAuthReady) return "Admin-Auth fehlt";
    if (status !== "approved") return "Eintrag ist nicht approved.";
    return "";
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
      <div className="flex gap-2">
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={runSync}>Product-Evolution Inbox synchronisieren</button>
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={refreshInbox}>Server-Inbox neu laden</button>
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={refreshTaskProposals}>Task Proposals neu laden</button>
        {canRunRevisionDossierGenerator && <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={runRevisionDossierGenerator}>Revision-Dossiers neu erzeugen</button>}
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
        <p>taskProposalLoadedCount: {String(syncDebug.taskProposalLoadedCount ?? taskProposals.length)}</p>
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
        <p className="text-cyan-100">Agent Task Proposals / agentTaskProposals — Read-only Review, erzeugt keine Worker Queue und startet keinen Runner.</p>
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
              </div>
            </article>
          ))}
          {visibleTaskProposals.length === 0 && <p className="rounded border border-white/15 p-3 text-xs text-white/70">Keine Task Proposals für diesen Filter geladen.</p>}
        </div>
      )}

      {!isTaskProposalFilter(active) && <div className="space-y-3">
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
          const canShowTaskProposalAction = String(row.status || "").toLowerCase() === "approved";
          const decisionBlocker = approveReason || rejectReason || blockReason || reviseReason;

          return (
            <div key={String(row.id || row.title)} className="rounded border p-3 text-xs">
              <b>{summary.plainTitle}</b>
              <p>{decisionDetails.summary || summary.plainSummary || "Dossier vorhanden – Details ansehen"}</p>
              <p>Status: {String(row.status || "pending_approval")} · Inbox: {hasInbox ? "synchronisiert" : "Noch nicht synchronisiert"}</p>
              {asText(row.recommendationLabel) && <p className="text-emerald-200">Empfehlung: {asText(row.recommendationLabel)}</p>}
              {row.supersededByReadableDecisionDossier === true && <p className="text-amber-200">Legacy/alte Quelle: lesbares Decision-Dossier wird bevorzugt ({asText(row.readableDossierInboxId) || "decisionDossiers"}).</p>}
              <p>inboxId: {hasInbox ? asText(row.inboxId) : "—"}</p>
              <p>Warum Buttons ggf. gesperrt: {decisionBlocker || (missing.length > 0 ? `Dossierdaten unvollständig (${missing.join(", ")})` : "entscheidbar")}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                <button className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={!row.hasDossierDetails && !row.hasReportDetails} onClick={() => setDetailRow(row)}>Dossier ansehen (konkrete Entscheidungsvorlage)</button>
                <button className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={!row.hasReportDetails} onClick={() => setDetailRow(row)}>Bericht ansehen (übergeordnete Analyse / Hintergrundbericht)</button>
                <button title={approveReason || "Zustimmen"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(approveReason)} onClick={() => decide(decisionKind, "approve", row)}>Zustimmen</button>
                <button title={rejectReason || "Ablehnen"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(rejectReason)} onClick={() => decide(decisionKind, "reject", row)}>Ablehnen</button>
                <button title={reviseReason || "Überarbeiten"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(reviseReason)} onClick={() => decide(decisionKind, "revise", row)}>Überarbeiten</button>
                <button title={blockReason || "Blockieren"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(blockReason)} onClick={() => decide(decisionKind, "block", row)}>Blockieren</button>
                {canShowTaskProposalAction && <button title={taskProposalReason || "Task Proposal erzeugen"} className="cursor-pointer rounded border border-emerald-300/70 px-2 text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(taskProposalReason)} onClick={() => createTaskProposal(row)}>Task Proposal erzeugen</button>}
                {decisionBlocker && <p className="w-full text-amber-300">Sperrgrund: {decisionBlocker}</p>}
                {canShowTaskProposalAction && taskProposalReason && <p className="w-full text-amber-300">Task-Proposal-Sperrgrund: {taskProposalReason}</p>}
              </div>
              <p>Wartet seit: {formatAdminDate(timeline.waitingForApprovalAt)}</p>
            </div>
          );
        })}
      </div>}


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
              {info("Was passiert als nächstes?", "Admin prüft dieses Task Proposal manuell. Erst nach separater Freigabe darf daraus eine Worker Queue oder ein Runner-Handoff entstehen; diese Ansicht startet nichts.")}
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
            <p>Detailstatus: {details.isComplete ? "structured" : "missing"}</p>
            {!details.isComplete && <div className="mt-2 rounded border border-amber-300/50 bg-amber-300/10 p-2 text-amber-100"><p className="font-semibold">Dossierdaten unvollständig</p><p>Fehlende Entscheidungsfelder: {details.missing.join(", ")}</p><p>Sperrgrund: Dossier unvollständig – zuerst Überarbeiten wählen.</p></div>}
            {info("Was ist der Vorschlag?", details.summary)}
            {info("Was soll geändert/gebaut werden?", details.what)}
            {info("Warum ist das sinnvoll?", details.why)}
            {info("Vorteil für WellFit", details.wellFitBenefit)}
            {info("Nutzen für User", details.userBenefit)}
            {info("Economy Impact", details.economyImpact)}
            {info("Risiko", details.risk)}
            {info("Empfehlung", details.recommendationLabel)}
            {details.recommendationText && details.recommendationText !== details.recommendationLabel && info("Empfehlungstext", details.recommendationText)}
            {details.recommendationDebug && details.recommendationDebug !== details.recommendationLabel && details.recommendationDebug !== details.recommendationText && info("Technischer Empfehlungswert (Debug)", details.recommendationDebug)}
            {detailRow.supersededByReadableDecisionDossier === true && info("Legacy/alte Quelle", `Dieser technische Eintrag wurde durch ein lesbares Decision-Dossier ergaenzt: ${asText(detailRow.readableDossierInboxId) || "decisionDossiers"}`)}
            {fileList("Betroffene/erlaubte Dateien", details.allowedFiles)}
            {fileList("Blockierte Dateien", details.blockedFiles)}
            {fileList("Required Checks", details.requiredChecks)}
            {info("Quelle", `${details.source || "—"}${detailRow.sourceDossierId ? ` · ${detailRow.sourceDossierId}` : ""}`)}
            {info("Nächster Schritt nach Zustimmung", details.nextStep)}
          </div>
        </div>
        );
      })()}
    </section>
  );
}
