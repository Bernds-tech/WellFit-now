"use client";

import { useMemo, useState } from "react";
import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import {
  buildAdminDecisionSummary,
  deriveTimeline,
  formatAdminDate,
  getAgentStatusBucket,
  getMissionStatusBucket,
} from "@/lib/admin/agentCenterStatus";
import type {
  AdminCenterListFilter,
  AgentCenterDecisionInput,
  AgentCenterInboxItem,
  MissionCenterDecisionInput,
} from "@/lib/admin/beta1AdminTypes";

type Row = Record<string, unknown> & {
  id?: string;
  title?: string;
  name?: string;
  sourceLabel?: string;
  status?: string;
  canDecide?: boolean;
  decisionHint?: string;
  mirrorTargetId?: string;
  inboxId?: string;
  sourceDossierId?: string;
  sourceRef?: string;
  listType?: string;
};

type Data = { agents: Row[]; missions: Row[]; stats: Record<string, number> };
type SyncStats = { created?: number; updated?: number; skipped?: number; syncedCount?: number; idempotent?: boolean };

const FILTER_TO_BUCKET: Record<AdminCenterListFilter, "total" | ReturnType<typeof getAgentStatusBucket>> = { agent_total:"total",agent_pending:"pending_approval",agent_approved:"approved_ready",agent_rejected:"rejected",agent_blocked:"blocked",agent_in_progress:"in_progress",agent_completed:"completed",agent_repair_required:"repair_required",agent_halted_waiting_owner:"halted_waiting_owner",agent_cycle_restart_required:"cycle_restart_required",mission_total:"total",mission_pending:"pending_approval",mission_approved:"approved_ready",mission_rejected:"rejected",mission_blocked:"blocked",mission_in_progress:"in_progress",mission_completed:"completed" };
const FILTERS: Array<{ key: AdminCenterListFilter; label: string; statKey: string }> = [{ key: "agent_total", label: "Agenten gesamt", statKey: "agent_total" },{ key: "agent_pending", label: "Warten auf Freigabe", statKey: "agent_pending" },{ key: "agent_approved", label: "Freigegeben", statKey: "agent_approved" },{ key: "agent_rejected", label: "Abgelehnt", statKey: "agent_rejected" },{ key: "agent_blocked", label: "Blockiert", statKey: "agent_blocked" },{ key: "agent_in_progress", label: "In Arbeit", statKey: "agent_in_progress" },{ key: "agent_completed", label: "Fertig", statKey: "agent_completed" },{ key: "agent_repair_required", label: "Repair required", statKey: "agent_repair_required" },{ key: "agent_halted_waiting_owner", label: "Halted waiting owner", statKey: "agent_halted_waiting_owner" },{ key: "agent_cycle_restart_required", label: "Next cycle required", statKey: "agent_cycle_restart_required" },{ key: "mission_total", label: "Missionsvorschläge gesamt", statKey: "mission_total" },{ key: "mission_pending", label: "Warten auf Freigabe", statKey: "mission_pending" },{ key: "mission_approved", label: "Freigegeben", statKey: "mission_approved" },{ key: "mission_rejected", label: "Abgelehnt", statKey: "mission_rejected" },{ key: "mission_blocked", label: "Blockiert", statKey: "mission_blocked" },{ key: "mission_in_progress", label: "In Arbeit", statKey: "mission_in_progress" },{ key: "mission_completed", label: "Fertig", statKey: "mission_completed" }];

const statusLabel: Record<string,string> = { pending_approval:"Wartet auf Freigabe", approved_ready:"Freigegeben", in_progress:"In Arbeit", completed:"Fertig", rejected:"Abgelehnt", blocked:"Blockiert", not_decidable_sync_needed:"Nicht entscheidbar" };

function computeMirrorKey(row: Row): string {
  const listType = String(row.listType || "suggestedTaskQueue");
  const sourceId = String(row.sourceDossierId || row.id || row.title || row.name || "").trim();
  return sourceId ? `product-evolution-first-run:${sourceId}:${listType}` : "";
}

export default function AgentCenterInteractive({ data, firstRunOutput }: { data: Data; firstRunOutput?: unknown }) {
  const [active, setActive] = useState<AdminCenterListFilter>("agent_total");
  const [feedback, setFeedback] = useState("");
  const [inboxItems, setInboxItems] = useState<AgentCenterInboxItem[]>([]);
  const [syncStatus, setSyncStatus] = useState("");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inboxById = useMemo(() => new Map(inboxItems.map((item) => [String(item.inboxId), item])), [inboxItems]);
  const mappedLocalData = useMemo(() => {
    const attach = (rows: Row[]) => rows.map((row) => {
      const candidateIds = [String(row.inboxId || ""), String(row.mirrorTargetId || ""), computeMirrorKey(row)].filter(Boolean);
      const inboxMatch = candidateIds.map((id) => inboxById.get(id)).find(Boolean);
      if (!inboxMatch) return row;
      return {
        ...row,
        inboxId: inboxMatch.inboxId,
        mirrorTargetId: inboxMatch.inboxId,
        sourceType: inboxMatch.sourceType,
        status: inboxMatch.status || row.status,
        recommendation: inboxMatch.recommendation || row.recommendation,
        riskLevel: row.riskLevel || inboxMatch.riskLevel,
        canDecide: true,
      };
    });
    return { agents: attach(data.agents), missions: attach(data.missions) };
  }, [data.agents, data.missions, inboxById]);

  const activeStat = data.stats[active] ?? 0;
  const visible = useMemo(() => { const isMission = active.startsWith("mission_"); const bucket = FILTER_TO_BUCKET[active]; const list = isMission ? mappedLocalData.missions : mappedLocalData.agents; if (bucket === "total") return list; const fn = isMission ? getMissionStatusBucket : getAgentStatusBucket; return list.filter((r) => fn(r) === bucket); }, [active, mappedLocalData]);

  async function refreshInbox() {
    setBusy(true);
    try {
      const result = await beta1AdminClient.listAgentCenterInboxItems({});
      const items = Array.isArray((result as { items?: AgentCenterInboxItem[] }).items) ? (result as { items?: AgentCenterInboxItem[] }).items || [] : [];
      setInboxItems(items);
      setFeedback(`Server-Inbox geladen: ${items.length} Einträge.`);
    } catch {
      setFeedback("Server-Inbox konnte nicht geladen werden. Bitte Berechtigung und Callables prüfen.");
    } finally {
      setBusy(false);
    }
  }

  async function runSync(kind: "product" | "local") {
    setBusy(true);
    try {
      const result = kind === "product"
        ? await beta1AdminClient.syncProductEvolutionFirstRunInbox({ registerSnapshot: firstRunOutput })
        : await beta1AdminClient.syncAgentCenterLocalRegistersInbox();
      const typed = result as SyncStats & { accepted?: boolean; message?: string };
      if (!typed.accepted) {
        setSyncStatus(typed.message || "Inbox-Synchronisierung fehlgeschlagen.");
      } else {
        setLastSyncAt(new Date().toISOString());
        const total = typed.syncedCount ?? 0;
        setSyncStatus(total > 0 ? `Sync erfolgreich: erstellt/aktualisiert ${total} Einträge.` : "Keine syncbaren First-Run-Einträge gefunden. Prüfe agent-product-evolution-first-run-output.json.");
        await refreshInbox();
      }
    } catch {
      setSyncStatus("Inbox-Synchronisierung fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  async function decide(kind:"agent"|"mission", action: "approve"|"reject"|"revise"|"block"|"review", row: Row) {
    const summary = buildAdminDecisionSummary(row);
    const targetId = String(row.inboxId || row.mirrorTargetId || row.id || "");
    if (!targetId) {
      setFeedback("Noch nicht entscheidbar: zuerst Inbox synchronisieren, damit eine serverseitige inboxId vorhanden ist.");
      return;
    }
    const canDecide = row.canDecide && summary.missingDecisionData.length < 6;
    if (!canDecide) return setFeedback(String(row.decisionHint || "Nicht entscheidbar / Details fehlen."));
    const mapA = { approve: beta1AdminClient.approveAgentCenterProposal,reject: beta1AdminClient.rejectAgentCenterProposal,revise: beta1AdminClient.requestRevisionAgentCenterProposal,block: beta1AdminClient.blockAgentCenterProposal,review: beta1AdminClient.markAgentCenterProposalForReview };
    const mapM = { approve: beta1AdminClient.approveMissionCenterProposal,reject: beta1AdminClient.rejectMissionCenterProposal,revise: beta1AdminClient.requestRevisionMissionCenterProposal,block: beta1AdminClient.blockMissionCenterProposal,review: beta1AdminClient.markMissionCenterProposalForReview };
    const input = kind==="agent"?{targetType:"agent",targetId,sourceRef:String(row.sourceType || "agentCenterInbox"),reason:action} as AgentCenterDecisionInput:{targetType:"mission",targetId,sourceRef:String(row.sourceType || "agentCenterInbox"),reason:action} as MissionCenterDecisionInput;
    const result = await (kind==="agent"?mapA:mapM)[action](input as never);
    const msg = action === "approve" ? "Freigegeben gespeichert" : action === "reject" ? "Abgelehnt gespeichert" : action === "revise" ? "Überarbeitung angefordert" : "Blockiert gespeichert";
    setFeedback(result.accepted ? `${msg}.` : (result.message||"Eintrag konnte serverseitig nicht entschieden werden."));
    await refreshInbox();
  }

  return <section className="space-y-4 rounded-xl border border-white/12 bg-slate-950/35 p-4">
    <div className="flex flex-wrap gap-2">
      <button disabled={busy} className="border px-2 py-1 disabled:opacity-50" onClick={() => runSync("product")}>Product-Evolution Inbox synchronisieren</button>
      <button disabled={busy} className="border px-2 py-1 disabled:opacity-50" onClick={() => runSync("local")}>Lokale Register Inbox synchronisieren</button>
      <button disabled={busy} className="border px-2 py-1 disabled:opacity-50" onClick={refreshInbox}>Server-Inbox neu laden</button>
    </div>
    <p className="text-xs text-cyan-100/80">Nach Sync können Einträge entscheidbar werden, sofern ein serverseitiges Inbox-Target vorhanden ist.</p>
    {syncStatus ? <p className="rounded border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs">{syncStatus} Letzter Erfolg: {lastSyncAt ? formatAdminDate(lastSyncAt) : "—"}</p> : null}
    {feedback?<p className="rounded border border-cyan-200/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-50">{feedback}</p>:null}

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">{FILTERS.map(i=><button key={i.key} onClick={()=>setActive(i.key)} className={`rounded-lg border p-3 text-left ${active===i.key?"border-cyan-300/60 bg-cyan-400/10":"border-white/12 bg-slate-900/55"}`}><p className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-100/65">{i.label}</p><p className="font-mono text-2xl font-bold text-white">{data.stats[i.statKey] ?? 0}</p></button>)}</div>

    {activeStat > 0 && visible.length === 0 ? <p className="rounded border border-amber-200/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-50">Statistik und Liste sind nicht synchron. Bitte Datenquellen prüfen.</p> : null}

    <div className="space-y-3 text-xs text-white/90">{visible.length === 0 ? <p className="rounded border border-white/10 bg-slate-900/40 px-3 py-2 text-white/75">Keine Einträge für diesen Filter vorhanden.</p> : visible.map((row)=>{const t=deriveTimeline(row); const name=String(row.title||row.name||row.id||"Eintrag"); const mission=active.startsWith("mission_"); const bucket = (mission?getMissionStatusBucket:getAgentStatusBucket)(row); const summary = buildAdminDecisionSummary(row); const hasInboxId = Boolean(String(row.inboxId || "")); const critical = ["plainSummary","whatWillChange","whySuggested","wellFitBenefit","riskSummary","allowedFiles","blockedFiles","requiredChecks"]; const missingCritical = summary.missingDecisionData.filter((x)=>critical.includes(x)); const canDecide = !!row.canDecide && hasInboxId && missingCritical.length === 0; return <div key={String(row.id||name)} className="rounded border border-white/10 p-3"><div className="flex items-center justify-between"><b>{summary.plainTitle}</b><span className="rounded border border-cyan-200/30 px-2 py-0.5">{statusLabel[bucket] || String(row.status||"Technischer Registereintrag")}</span></div><p className="mt-1 text-white/80">{summary.plainSummary}</p><div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2"><span><b>Was soll passieren?</b> {summary.whatWillChange || "fehlt"}</span><span><b>Warum vorgeschlagen?</b> {summary.whySuggested || "fehlt"}</span><span><b>Vorteil für WellFit:</b> {summary.wellFitBenefit || "fehlt"}</span><span><b>User Benefit:</b> {String(row.userBenefit || "fehlt")}</span><span><b>Business Benefit:</b> {String(row.businessBenefit || "fehlt")}</span><span><b>Economy Impact:</b> {String(row.economyImpact || "fehlt")}</span><span><b>Risiko:</b> {summary.riskSummary || "fehlt"}</span><span><b>Empfehlung:</b> {String(row.recommendation || "fehlt")}</span><span><b>Nach Zustimmung passiert:</b> Freigabe gespeichert. Nächster kontrollierter Schritt: Approved Inbox → Agent Task Proposal.</span><span><b>Quelle:</b> {String(row.sourceLabel || row.sourceRef || row.source || "fehlt")}</span><span>Wartet seit: {formatAdminDate(t.waitingForApprovalAt)}</span><span>Freigegeben/Ablehnung/Blockiert: {formatAdminDate(t.approvedAt)} / {formatAdminDate(t.rejectedAt)} / {formatAdminDate(t.blockedAt)}</span><span><b>Allowed Files:</b> {summary.allowedFilesPreview}</span><span><b>Blocked Files:</b> {summary.blockedFilesPreview}</span><span><b>Required Checks:</b> {Array.isArray(row.requiredChecks) ? (row.requiredChecks as string[]).slice(0, 3).join(", ") || "fehlt" : "fehlt"}</span><span><b>Inbox ID:</b> {String(row.inboxId || "fehlt")}</span><span><b>Server-Inbox:</b> {hasInboxId ? "gespiegelt" : "Dossierdaten unvollständig. Bitte Überarbeiten wählen oder Dossier-Details ergänzen."}</span></div>{!canDecide ? <p className="mt-2 rounded border border-amber-300/30 bg-amber-400/10 px-2 py-1">Dossierdaten unvollständig. Bitte Überarbeiten wählen oder Dossier-Details ergänzen.</p> : null}<div className="mt-2 flex flex-wrap gap-2"><button disabled={!canDecide} className="border px-2 disabled:cursor-not-allowed disabled:opacity-50" onClick={()=>decide(mission?"mission":"agent","approve",row)}>Zustimmen</button><button disabled={!canDecide} className="border px-2 disabled:cursor-not-allowed disabled:opacity-50" onClick={()=>decide(mission?"mission":"agent","reject",row)}>Ablehnen</button><button disabled={!canDecide} className="border px-2 disabled:cursor-not-allowed disabled:opacity-50" onClick={()=>decide(mission?"mission":"agent","revise",row)}>Überarbeiten</button><button disabled={!canDecide} className="border px-2 disabled:cursor-not-allowed disabled:opacity-50" onClick={()=>decide(mission?"mission":"agent","block",row)}>Blockieren</button></div></div>;})}</div>

    <div className="rounded border border-white/10 bg-slate-900/40 p-3 text-xs">
      <h3 className="font-semibold">Server-Inbox</h3>
      {inboxItems.length === 0 ? <p>Keine geladenen Inbox-Einträge.</p> : inboxItems.slice(0, 30).map((item) => (
        <p key={item.inboxId}>{item.inboxId} · {item.title || "fehlt"} · {item.sourceType} · {item.listType} · {item.status} · {item.recommendation || "fehlt"} · {item.riskLevel || "fehlt"}</p>
      ))}
    </div>
  </section>;
}
