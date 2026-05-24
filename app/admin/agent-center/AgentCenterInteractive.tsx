"use client";

import { useCallback, useMemo, useState } from "react";

import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import { buildAdminDecisionSummary, deriveTimeline, formatAdminDate, getAgentStatusBucket, getMissionStatusBucket } from "@/lib/admin/agentCenterStatus";
import type { AdminCenterDetailStatus, AdminCenterListFilter, AgentCenterDecisionInput, AgentCenterInboxItem, MissionCenterDecisionInput, ProductEvolutionInboxSyncResult } from "@/lib/admin/beta1AdminTypes";

type DetailSections = Record<string, string>;
type Row = Record<string, unknown> & {
  id?: string;
  title?: string;
  status?: string;
  listType?: string;
  sourceDossierId?: string;
  dossierId?: string;
  detailStatus?: AdminCenterDetailStatus | "partial_structured";
  detailText?: string;
  detailSections?: DetailSections;
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
const extractPeId = (...values: unknown[]): string => {
  for (const value of values) {
    const text = asText(value);
    const match = text.match(/(PE-\d{8}-\d+)/i);
    if (match) return match[1].toUpperCase();
  }
  return "";
};
const isMissionFilter = (value: AdminCenterListFilter): value is Extract<AdminCenterListFilter, `mission_${string}`> => value.startsWith("mission_");

export default function AgentCenterInteractive({ data, firstRunOutput = {} }: { data: DataProps; firstRunOutput?: Record<string, unknown> }) {
  const [active, setActive] = useState<AdminCenterListFilter>("agent_pending");
  const [feedback, setFeedback] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [inboxItems, setInboxItems] = useState<AgentCenterInboxItem[]>([]);
  const [detailRow, setDetailRow] = useState<Row | null>(null);
  const [syncDebug, setSyncDebug] = useState<Record<string, unknown>>({});

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
    const listType = asText(row.listType);
    const candidateKeys = new Set([
      asText(row.inboxId),
      asText(row.mirrorTargetId),
      `product-evolution-first-run:${sourceDossierId}:${listType}`,
      `product-evolution-first-run:${sourceDossierId}:suggestedTaskQueue`,
      `product-evolution-first-run:${sourceDossierId}:generatedDossiers`,
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
      return item ? { ...row, ...item, inboxId: item.inboxId, mirrorTargetId: item.mirrorTargetId || row.mirrorTargetId, status: item.status } : row;
    }),
    missions: data.missions.map((row) => {
      const item = matchInbox(row);
      return item ? { ...row, ...item, inboxId: item.inboxId, mirrorTargetId: item.mirrorTargetId || row.mirrorTargetId, status: item.status } : row;
    }),
  }), [data.agents, data.missions, matchInbox]);

  const visible = useMemo(() => {
    const missionMode = isMissionFilter(active);
    const bucket = FILTER_TO_BUCKET[active];
    const list = missionMode ? mapped.missions : mapped.agents;
    if (bucket === "total") return list;
    return list.filter((row) => (missionMode ? getMissionStatusBucket(row) : getAgentStatusBucket(row)) === bucket);
  }, [active, mapped]);

  const snapshotStats = useMemo(() => {
    const snapshot = firstRunOutput && typeof firstRunOutput === "object" ? firstRunOutput : {};
    const keys = Object.keys(snapshot);
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
  }, [firstRunOutput]);

  async function refreshInbox() {
    setBusy(true);
    try {
      const result = await beta1AdminClient.listAgentCenterInboxItems() as unknown as { items?: AgentCenterInboxItem[] };
      const items = Array.isArray(result.items) ? result.items : [];
      setInboxItems(items);
      setSyncStatus(`Server-Inbox geladen: ${items.length} Einträge.${items.length > 0 ? " Server-Inbox gespiegelt. Bitte Warten auf Freigabe erneut öffnen oder Liste aktualisieren." : " Sync erzeugte keine Inbox-Einträge. Grund: fehlende/ungültige sourceDossierId oder fehlende Decision-Daten."}`);
    } finally {
      setBusy(false);
    }
  }

  async function runSync() {
    setBusy(true);
    try {
      const result = await beta1AdminClient.syncProductEvolutionFirstRunInbox({ registerSnapshot: firstRunOutput }) as ProductEvolutionInboxSyncResult;
      const created = Number(result.created ?? 0);
      const updated = Number(result.updated ?? 0);
      const skipped = Number(result.skipped ?? 0);
      const reasons = Object.entries(result.skippedReasons || {}).filter(([, count]) => Number(count) > 0).map(([reason, count]) => `${reason}:${count}`).join(", ");
      const samples = (result.sampleCreatedIds || []).slice(0, 3).join(", ");
      const skippedSample = (result.sampleSkipped || []).slice(0, 2).map((entry) => JSON.stringify(entry)).join(" | ");
      setSyncDebug({
        callableName: result.callableName || "",
        callableVersion: result.callableVersion || "",
        responseShapeVersion: result.responseShapeVersion || "",
        serverTimestamp: result.serverTimestamp || "",
        serverReceivedInputKeys: result.serverReceivedInputKeys || [],
        hasRegisterSnapshot: result.hasRegisterSnapshot,
        registerSnapshotType: result.registerSnapshotType || "",
        registerSnapshotKeys: result.registerSnapshotKeys || [],
        payloadUnwrappedFrom: result.payloadUnwrappedFrom || "",
        serverSnapshotReceived: result.serverSnapshotReceived,
        serverSnapshotKeys: result.serverSnapshotKeys || [],
        serverCandidateCount: result.serverCandidateCount ?? 0,
        serverCandidateCollections: result.serverCandidateCollections || [],
        skippedReasons: result.skippedReasons || {},
        sampleCreatedIds: result.sampleCreatedIds || [],
        sampleSkipped: result.sampleSkipped || [],
      });
      setSyncStatus(result.message || (created + updated > 0 ? `Inbox synchronisiert: ${created} erstellt, ${updated} aktualisiert, ${skipped} übersprungen.` : "Keine syncbaren Einträge gefunden."));
      const shapeMismatch = snapshotStats.localFirstRunCandidateCount > 0 && created + updated + skipped === 0;
      setFeedback(`Sync Debug → created:${created}, updated:${updated}, skipped:${skipped}${reasons ? `, reasons:${reasons}` : ""}${samples ? `, sampleCreatedIds:${samples}` : ""}${skippedSample ? `, sampleSkipped:${skippedSample}` : ""}${shapeMismatch ? ` | Client hat ${snapshotStats.localFirstRunCandidateCount} Kandidaten gesendet, Server hat 0 verarbeitet. Snapshot-Shape passt nicht.` : ""}`);
      await refreshInbox();
    } finally {
      setBusy(false);
    }
  }

  function buttonReason(action: "approve" | "reject" | "revise" | "block", row: Row): string {
    const status = String(row.status || "");
    const hasInbox = Boolean(asText(row.inboxId));
    const missing = Array.isArray(row.missingCriticalDecisionFields) ? row.missingCriticalDecisionFields : [];

    if (!hasInbox) return "Erst Inbox synchronisieren";
    if (action === "approve" && missing.length > 0 && !["structured", "partial_structured"].includes(String(row.detailStatus || ""))) return "Dossierdaten kritisch unvollständig";
    if (action === "approve" && !["pending_approval", "review_required"].includes(status)) return "Status erlaubt diese Aktion nicht";
    if (action === "revise" && !["pending_approval", "review_required"].includes(status)) return "Status erlaubt diese Aktion nicht";
    if ((action === "reject" || action === "block") && ["completed", "synced_to_task_proposal"].includes(status)) return "Status erlaubt diese Aktion nicht";

    return "";
  }

  async function decide(kind: "agent" | "mission", action: "approve" | "reject" | "revise" | "block", row: Row) {
    const reason = buttonReason(action, row);
    if (reason) {
      setFeedback(reason);
      return;
    }

    const inboxId = asText(row.inboxId);
    const agentMap = { approve: beta1AdminClient.approveAgentCenterProposal, reject: beta1AdminClient.rejectAgentCenterProposal, revise: beta1AdminClient.requestRevisionAgentCenterProposal, block: beta1AdminClient.blockAgentCenterProposal };
    const missionMap = { approve: beta1AdminClient.approveMissionCenterProposal, reject: beta1AdminClient.rejectMissionCenterProposal, revise: beta1AdminClient.requestRevisionMissionCenterProposal, block: beta1AdminClient.blockMissionCenterProposal };

    const result = kind === "agent"
      ? await agentMap[action]({ targetType: "agent", targetId: inboxId, reason: action } satisfies AgentCenterDecisionInput)
      : await missionMap[action]({ targetType: "mission", targetId: inboxId, reason: action } satisfies MissionCenterDecisionInput);
    setFeedback(result.accepted ? "Entscheidung gespeichert." : (result.message || "Fehler"));
    await refreshInbox();
  }

  return (
    <section className="space-y-4 rounded-xl border border-white/12 bg-slate-950/35 p-4">
      <div className="flex gap-2">
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={runSync}>Product-Evolution Inbox synchronisieren</button>
        <button disabled={busy} className="cursor-pointer rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={refreshInbox}>Server-Inbox neu laden</button>
      </div>
      {syncStatus && <p className="text-xs">{syncStatus}</p>}
      {feedback && <p className="text-xs">{feedback}</p>}
      {!snapshotStats.hasFirstRunOutput && <p className="text-xs text-amber-300">First-Run-Output wurde nicht in die Admin-Komponente geladen.</p>}
      <div className="rounded border border-white/20 p-2 text-xs">
        <p>Client snapshot candidates: {snapshotStats.localFirstRunCandidateCount}</p>
        <p>Client snapshot keys: [{snapshotStats.localFirstRunKeys.join(", ")}]</p>
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
        <p>payloadUnwrappedFrom: {String(syncDebug.payloadUnwrappedFrom || "-")}</p>
        <p>serverSnapshotReceived: {String(syncDebug.serverSnapshotReceived ?? "-")}</p>
        <p>serverSnapshotKeys: [{((syncDebug.serverSnapshotKeys as string[] | undefined) || []).join(", ")}]</p>
        <p>serverCandidateCount: {String(syncDebug.serverCandidateCount ?? "-")}</p>
        <p>serverCandidateCollections: {JSON.stringify(syncDebug.serverCandidateCollections || [])}</p>
        <p>skippedReasons: {JSON.stringify(syncDebug.skippedReasons || {})}</p>
        <p>sampleCreatedIds: {JSON.stringify(syncDebug.sampleCreatedIds || [])}</p>
        <p>sampleSkipped: {JSON.stringify(syncDebug.sampleSkipped || [])}</p>
        {!String(syncDebug.callableVersion || "") && <p className="text-amber-300">Backend-Callable liefert keine Version. Wahrscheinlich läuft noch eine alte Functions-Version. Bitte Functions deployen.</p>}
        {String(syncDebug.callableVersion || "") !== "" && <p className="text-emerald-300">Backend-Callable-Version erkannt: {String(syncDebug.callableVersion)}</p>}
        {(String(syncDebug.callableVersion || "") === "" || String(syncDebug.responseShapeVersion || "") === "") && <p className="text-amber-300">Frontend ist neuer als Backend. Bitte Firebase Functions deployen oder Backend-Callable prüfen.</p>}
        {String(syncDebug.callableVersion || "") !== "" && String(syncDebug.responseShapeVersion || "") !== "" && Number(syncDebug.serverCandidateCount || 0) === 0 && snapshotStats.localFirstRunCandidateCount > 0 && <p className="text-amber-300">Backend ist aktuell, aber Snapshot-Struktur wird nicht verarbeitet. Siehe serverSnapshotKeys/serverCandidateCollections.</p>}
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
          const hasInbox = Boolean(asText(row.inboxId));
          const missing = Array.isArray(row.missingCriticalDecisionFields) ? row.missingCriticalDecisionFields : [];
          const approveReason = buttonReason("approve", row);
          const rejectReason = buttonReason("reject", row);
          const blockReason = buttonReason("block", row);
          const reviseReason = buttonReason("revise", row);
          const decisionBlocker = approveReason || rejectReason || blockReason || reviseReason;

          return (
            <div key={String(row.id || row.title)} className="rounded border p-3 text-xs">
              <b>{summary.plainTitle}</b>
              <p>{summary.plainSummary || "Dossier vorhanden – Details ansehen"}</p>
              <p>Status: {String(row.status || "pending_approval")} · Inbox: {hasInbox ? "Server-Inbox gespiegelt" : "Noch nicht synchronisiert"}</p>
              <p>Warum Buttons ggf. gesperrt: {!hasInbox ? "keine inboxId / noch nicht synchronisiert" : missing.length > 0 ? "kritische Decision-Daten fehlen" : "entscheidbar"}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                <button className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={!row.hasDossierDetails && !row.hasReportDetails} onClick={() => setDetailRow(row)}>Dossier ansehen (konkrete Entscheidungsvorlage)</button>
                <button className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={!row.hasReportDetails} onClick={() => setDetailRow(row)}>Bericht ansehen (übergeordnete Analyse / Hintergrundbericht)</button>
                <button title={approveReason || "Zustimmen"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={Boolean(approveReason)} onClick={() => decide(missionMode ? "mission" : "agent", "approve", row)}>Zustimmen</button>
                <button title={rejectReason || "Ablehnen"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={Boolean(rejectReason)} onClick={() => decide(missionMode ? "mission" : "agent", "reject", row)}>Ablehnen</button>
                <button title={reviseReason || "Überarbeiten"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={Boolean(reviseReason)} onClick={() => decide(missionMode ? "mission" : "agent", "revise", row)}>Überarbeiten</button>
                <button title={blockReason || "Blockieren"} className="cursor-pointer rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={Boolean(blockReason)} onClick={() => decide(missionMode ? "mission" : "agent", "block", row)}>Blockieren</button>
                {decisionBlocker && <p className="w-full text-amber-300">Sperrgrund: {decisionBlocker}</p>}
              </div>
              <p>Wartet seit: {formatAdminDate(timeline.waitingForApprovalAt)}</p>
            </div>
          );
        })}
      </div>

      {detailRow && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setDetailRow(null)}>
          <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg bg-slate-900 p-4 text-xs text-white" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 mb-2 flex justify-between bg-slate-900 pb-2">
              <h3 className="text-base font-semibold">{String(detailRow.title || detailRow.id || "Dossier")}</h3>
              <button className="cursor-pointer rounded border px-2" onClick={() => setDetailRow(null)}>Schließen</button>
            </div>
            <p>Dossier-ID: {String(detailRow.sourceDossierId || "—")}</p>
            <p>Quelle: {String(detailRow.sourcePath || detailRow.dossierRef || "—")}</p>
            <p>Status: {String(detailRow.status || "pending_approval")}</p>
            <p>Detailstatus: {String(detailRow.detailStatus || "missing")}</p>
            {(detailRow.detailStatus === "missing" && !asText(detailRow.detailText)) && <p className="text-amber-300">Dossierinhalt nicht gefunden. First-Run-Register muss angereichert werden.</p>}
            {Object.entries(detailRow.detailSections || {}).map(([key, value]) => value ? <p key={key}><b>{key}:</b> {value}</p> : null)}
            {asText(detailRow.detailText) && (
              <div>
                <p className="mt-2 font-semibold">Dossierauszug</p>
                <p className="whitespace-pre-wrap">{asText(detailRow.detailText)}</p>
              </div>
            )}
            <p>Allowed Files: {asStringArray(detailRow.allowedFiles).join(", ") || "—"}</p>
            <p>Blocked Files: {asStringArray(detailRow.blockedFiles).join(", ") || "—"}</p>
            <p>Required Checks: {asStringArray(detailRow.requiredChecks).join(", ") || "—"}</p>
            <p>Nächster Schritt nach Zustimmung: Approved Inbox → Task Proposal.</p>
          </div>
        </div>
      )}
    </section>
  );
}
