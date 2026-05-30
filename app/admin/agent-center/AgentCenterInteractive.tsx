"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";

import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import { buildAdminDecisionSummary, deriveTimeline, formatAdminDate, getAgentStatusBucket, getMissionStatusBucket } from "@/lib/admin/agentCenterStatus";
import type { AdminCallableAuthState, AdminCenterDetailStatus, AdminCenterListFilter, AgentCenterDecisionInput, AgentCenterInboxItem, MissionCenterDecisionInput, ProductEvolutionInboxSyncResult, ProductEvolutionRevisionDossierResult } from "@/lib/admin/beta1AdminTypes";
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

const FILTER_TO_BUCKET: Record<AdminCenterListFilter, "total" | ReturnType<typeof getAgentStatusBucket>> = { agent_total: "total", agent_pending: "pending_approval", agent_approved: "approved_ready", agent_rejected: "rejected", agent_blocked: "blocked", agent_in_progress: "in_progress", agent_completed: "completed", agent_repair_required: "repair_required", agent_halted_waiting_owner: "halted_waiting_owner", agent_cycle_restart_required: "cycle_restart_required", mission_total: "total", mission_pending: "pending_approval", mission_approved: "approved_ready", mission_rejected: "rejected", mission_blocked: "blocked", mission_in_progress: "in_progress", mission_completed: "completed" };
const FILTER_LABELS: Record<AdminCenterListFilter, string> = { agent_total: "Agenten gesamt", agent_pending: "Warten auf Freigabe", agent_approved: "Freigegeben", agent_rejected: "Abgelehnt", agent_blocked: "Blockiert", agent_in_progress: "In Arbeit", agent_completed: "Fertig", agent_repair_required: "Repair Required", agent_halted_waiting_owner: "Wartet auf Owner", agent_cycle_restart_required: "Nächster Zyklus", mission_total: "Missionsvorschläge gesamt", mission_pending: "Warten auf Freigabe", mission_approved: "Freigegeben", mission_rejected: "Abgelehnt", mission_blocked: "Blockiert", mission_in_progress: "In Arbeit", mission_completed: "Fertig" };
const FILTER_KEYS = Object.keys(FILTER_TO_BUCKET) as AdminCenterListFilter[];

  const asText = (value: unknown): string => (typeof value === "string" ? value : "");
const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : []);
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
    recommendation: firstText(row.recommendation, row.detailSections?.recommendation),
    source: firstText(row.sourceRef, row.sourcePath, row.dossierRef, row.sourceType),
    nextStep: firstText(row.nextStep, "Approved Inbox → Task Proposal. Kein Runner/Deploy automatisch."),
    allowedFiles, blockedFiles, requiredChecks,
  };
  const missing = [!details.summary ? "summary" : "", !details.what ? "what" : "", !details.why ? "why" : "", !details.wellFitBenefit ? "wellFitBenefit" : "", !details.userBenefit ? "userBenefit" : "", !details.economyImpact ? "economyImpact" : "", !details.risk ? "risk" : "", !details.recommendation ? "recommendation" : "", allowedFiles.length === 0 ? "allowedFiles" : "", blockedFiles.length === 0 ? "blockedFiles" : "", requiredChecks.length === 0 ? "requiredChecks" : ""].filter(Boolean);
  return { ...details, missing, isComplete: missing.length === 0 };
};
const extractPeId = (...values: unknown[]): string => {
  for (const value of values) {
    const text = asText(value);
    const match = text.match(/(PE-\d{8}-\d+)/i);
    if (match) return match[1].toUpperCase();
  }
  return "";
};
const isMissionFilter = (value: AdminCenterListFilter): value is Extract<AdminCenterListFilter, `mission_${string}`> => value.startsWith("mission_");

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
  if (diagnostic.includes("center_inbox_not_decidable") || message === "Eintrag ist nicht mehr entscheidbar.") return "Eintrag ist nicht mehr entscheidbar.";
  if (diagnostic.includes("server_inbox_entry_not_found") || code.includes("not-found") || message === "Server-Inbox-Eintrag nicht gefunden.") return "Server-Inbox-Eintrag nicht gefunden.";
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

const stableDocIdHashForLookup = (value: string): string => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
};

const sanitizeFirestoreDocIdPartForLookup = (value: unknown, maxLength = 180): string => {
  const raw = asText(value).slice(0, Math.max(maxLength * 2, 240));
  let sanitized = raw
    .replace(/[\\/]+/g, "__")
    .replace(/[\u0000-\u001f\u007f#?%[\]*`'"<>|{}^~]+/g, "_")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_.:]+|[-_.:]+$/g, "");
  if (!sanitized || sanitized === "." || sanitized === "..") sanitized = "unknown";
  if (sanitized.length > maxLength) {
    const hash = stableDocIdHashForLookup(sanitized);
    const prefixLength = Math.max(1, maxLength - hash.length - 1);
    sanitized = `${sanitized.slice(0, prefixLength)}-${hash}`;
  }
  return sanitized;
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
  const [active, setActive] = useState<AdminCenterListFilter>("agent_pending");
  const [feedback, setFeedback] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [inboxItems, setInboxItems] = useState<AgentCenterInboxItem[]>([]);
  const [detailRow, setDetailRow] = useState<Row | null>(null);
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


  const indexedInbox = useMemo(() => {
    const byId = new Map<string, AgentCenterInboxItem>();
    const byMirror = new Map<string, AgentCenterInboxItem>();
    for (const item of inboxItems) {
      byId.set(item.inboxId, item);
      if (item.mirrorTargetId) byMirror.set(item.mirrorTargetId, item);
    }
    return { byId, byMirror };
  }, [inboxItems]);

  const matchInbox = useCallback((row: Row): AgentCenterInboxItem | undefined => {
    const inboxId = asText(row.inboxId);
    if (inboxId && indexedInbox.byId.has(inboxId)) return indexedInbox.byId.get(inboxId);

    const mirrorTargetId = asText(row.mirrorTargetId);
    if (mirrorTargetId && indexedInbox.byMirror.has(mirrorTargetId)) return indexedInbox.byMirror.get(mirrorTargetId);

    const sourceDossierId = extractPeId(row.sourceDossierId, row.dossierId, row.id, row.title) || asText(row.sourceDossierId || row.dossierId || row.id);
    const safeSourceDossierId = sanitizeFirestoreDocIdPartForLookup(sourceDossierId);
    const listType = asText(row.listType);
    const safeListType = sanitizeFirestoreDocIdPartForLookup(listType, 80);
    const candidateKeys = new Set([
      asText(row.inboxId),
      asText(row.mirrorTargetId),
      `product-evolution-first-run:${sourceDossierId}:${listType}`,
      `product-evolution-first-run:${safeSourceDossierId}:${safeListType}`,
      `product-evolution-first-run:${sourceDossierId}:suggestedTaskQueue`,
      `product-evolution-first-run:${safeSourceDossierId}:suggestedTaskQueue`,
      `product-evolution-first-run:${sourceDossierId}:generatedDossiers`,
      `product-evolution-first-run:${safeSourceDossierId}:generatedDossiers`,
      sourceDossierId,
    ].filter(Boolean));

    for (const item of inboxItems) {
      if (candidateKeys.has(asText(item.mirrorTargetId))) return item;
      if (candidateKeys.has(asText(item.inboxId))) return item;
    }

    return undefined;
  }, [indexedInbox.byId, indexedInbox.byMirror, inboxItems]);

  const mapped = useMemo(() => ({
    agents: data.agents.map((row) => {
      const item = matchInbox(row);
      return item ? { ...row, ...item, inboxId: item.inboxId, mirrorTargetId: item.mirrorTargetId || row.mirrorTargetId, status: item.status, visibleListSource: "server_inbox" as const } : { ...row, visibleListSource: "local_snapshot" as const };
    }),
    missions: data.missions.map((row) => {
      const item = matchInbox(row);
      return item ? { ...row, ...item, inboxId: item.inboxId, mirrorTargetId: item.mirrorTargetId || row.mirrorTargetId, status: item.status, visibleListSource: "server_inbox" as const } : { ...row, visibleListSource: "local_snapshot" as const };
    }),
  }), [data.agents, data.missions, matchInbox]);

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
  const visibleListSource: "server_inbox" | "local_snapshot" = serverInboxRows.length > 0 ? "server_inbox" : "local_snapshot";
  const serverInboxPendingCount = useMemo(() => serverInboxRows.filter((row) => getAgentStatusBucket(row) === "pending_approval").length, [serverInboxRows]);

  const visible = useMemo(() => {
    const missionMode = isMissionFilter(active);
    const bucket = FILTER_TO_BUCKET[active];
    const list = visibleListSource === "server_inbox" ? serverInboxRows : (missionMode ? mapped.missions : mapped.agents);
    if (bucket === "total") return list;
    return list.filter((row) => (missionMode ? getMissionStatusBucket(row) : getAgentStatusBucket(row)) === bucket);
  }, [active, mapped, serverInboxRows, visibleListSource]);

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
    const hasArrays = ["generatedDossiers", "recommendedApprovals", "recommendedResearchMore", "suggestedTaskQueue", "blockedItems"].some((key) => Array.isArray(reconstructed[key]) && (reconstructed[key] as unknown[]).length > 0);
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
      localFirstRunCandidateCount: suggestedTaskQueueCount + generatedDossiersCount + recommendedApprovalsCount + recommendedResearchMoreCount + blockedItemsCount,
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
        ? ["generatedDossiers", "recommendedApprovals", "recommendedResearchMore", "suggestedTaskQueue", "blockedItems"]
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
        <p>revisionRegenerated: {String(syncDebug.revisionRegenerated ?? "-")}</p>
        <p>revisionStillRequested: {String(syncDebug.revisionStillRequested ?? "-")}</p>
        <p>revisionNoRunnerStarted: {String(syncDebug.revisionNoRunnerStarted ?? "-")}</p>
        <p>revisionNoDeploy: {String(syncDebug.revisionNoDeploy ?? "-")}</p>
        <p>revisionNoMerge: {String(syncDebug.revisionNoMerge ?? "-")}</p>
        <p>visibleListSource: {visibleListSource}</p>
        <p>lastDecisionAction: {String(syncDebug.lastDecisionAction || "-")}</p>
        <p>lastDecisionTargetIdPresent: {String(syncDebug.lastDecisionTargetIdPresent ?? "-")}</p>
        <p>lastDecisionAccepted: {String(syncDebug.lastDecisionAccepted ?? "-")}</p>
        <p>lastDecisionStatus: {String(syncDebug.lastDecisionStatus || "-")}</p>
        <p>lastDecisionMessage: {String(syncDebug.lastDecisionMessage || "-")}</p>
        <p>lastDecisionErrorCode: {String(syncDebug.lastDecisionErrorCode || "-")}</p>
        <p>lastAuthGuardMessage: {String(authDebug.lastAuthGuardMessage || "-")}</p>
        <p>clientSendingRegisterSnapshot: {String(syncDebug.clientSendingRegisterSnapshot ?? "-")}</p>
        <p>clientSendingRegisterSnapshotKeys: [{((syncDebug.clientSendingRegisterSnapshotKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>clientSendingRegisterSnapshotType: {String(syncDebug.clientSendingRegisterSnapshotType || "-")}</p>
        <p>clientSendingCandidateCount: {String(syncDebug.clientSendingCandidateCount ?? "-")}</p>
        <p>clientSnapshotSource: {String(syncDebug.clientSnapshotSource || snapshotResolution.source || "-")}</p>
        {Number(syncDebug.clientSendingCandidateCount ?? snapshotStats.localFirstRunCandidateCount) !== snapshotStats.localFirstRunCandidateCount && <p className="text-amber-300">UI zeigt {snapshotStats.localFirstRunCandidateCount} Kandidaten, sendet aber {Number(syncDebug.clientSendingCandidateCount ?? 0)} Kandidaten. Snapshot-Quelle prüfen.</p>}
        <p>suggestedTaskQueue: {snapshotStats.suggestedTaskQueueCount}</p>
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

      <div className="flex flex-wrap gap-2 text-xs">
        {FILTER_KEYS.map((key) => {
          const activeCard = active === key;
          return (
            <button key={key} onClick={() => setActive(key)} className={`cursor-pointer rounded border px-2 py-1 ${activeCard ? "border-cyan-300 bg-cyan-400/10 text-cyan-100 ring-1 ring-orange-300/60" : "border-white/25 hover:border-white/60 hover:bg-white/5"}`}>
              {FILTER_LABELS[key]} ({data.stats[key] ?? 0})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {visible.map((row) => {
          const summary = buildAdminDecisionSummary(row);
          const timeline = deriveTimeline(row);
          const missionMode = isMissionFilter(active);
          const decisionKind = row.visibleListSource === "server_inbox" ? "agent" : (missionMode ? "mission" : "agent");
          const hasInbox = Boolean(asText(row.inboxId));
          const decisionDetails = getDecisionDetails(row);
          const missing = Array.isArray(row.missingCriticalDecisionFields) ? row.missingCriticalDecisionFields : decisionDetails.missing;
          const approveReason = buttonReason("approve", row);
          const rejectReason = buttonReason("reject", row);
          const blockReason = buttonReason("block", row);
          const reviseReason = buttonReason("revise", row);
          const decisionBlocker = approveReason || rejectReason || blockReason || reviseReason;

          return (
            <div key={String(row.id || row.title)} className="rounded border p-3 text-xs">
              <b>{summary.plainTitle}</b>
              <p>{decisionDetails.summary || summary.plainSummary || "Dossier vorhanden – Details ansehen"}</p>
              <p>Status: {String(row.status || "pending_approval")} · Inbox: {hasInbox ? "synchronisiert" : "Noch nicht synchronisiert"}</p>
              <p>inboxId: {hasInbox ? asText(row.inboxId) : "—"}</p>
              <p>Warum Buttons ggf. gesperrt: {decisionBlocker || (missing.length > 0 ? `Dossierdaten unvollständig (${missing.join(", ")})` : "entscheidbar")}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                <button className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={!row.hasDossierDetails && !row.hasReportDetails} onClick={() => setDetailRow(row)}>Dossier ansehen (konkrete Entscheidungsvorlage)</button>
                <button className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={!row.hasReportDetails} onClick={() => setDetailRow(row)}>Bericht ansehen (übergeordnete Analyse / Hintergrundbericht)</button>
                <button title={approveReason || "Zustimmen"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(approveReason)} onClick={() => decide(decisionKind, "approve", row)}>Zustimmen</button>
                <button title={rejectReason || "Ablehnen"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(rejectReason)} onClick={() => decide(decisionKind, "reject", row)}>Ablehnen</button>
                <button title={reviseReason || "Überarbeiten"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(reviseReason)} onClick={() => decide(decisionKind, "revise", row)}>Überarbeiten</button>
                <button title={blockReason || "Blockieren"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || Boolean(blockReason)} onClick={() => decide(decisionKind, "block", row)}>Blockieren</button>
                {decisionBlocker && <p className="w-full text-amber-300">Sperrgrund: {decisionBlocker}</p>}
              </div>
              <p>Wartet seit: {formatAdminDate(timeline.waitingForApprovalAt)}</p>
            </div>
          );
        })}
      </div>

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
            {info("Empfehlung", details.recommendation)}
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
