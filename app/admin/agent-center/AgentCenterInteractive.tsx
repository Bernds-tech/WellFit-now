"use client";

import { useMemo, useState } from "react";
import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import type { AdminCenterListFilter, AgentCenterDecisionInput, MissionCenterDecisionInput } from "@/lib/admin/beta1AdminTypes";

type AgentRow = { id?: string; name?: string; sourceLabel?: string; sourceRef?: string; status?: string; riskLevel?: string; ownerArea?: string; purpose?: string; requiresHumanApprovalForRuntime?: boolean; humanReviewRequired?: boolean; nextRecommendedAction?: string; allowedWriteScopes?: string[]; forbiddenWriteScopes?: string[] };
type MissionRow = { id: string; title: string; status?: string; subject?: string; riskLevel?: string; linkedRoute?: string; linkedRegister?: string; decisionNote?: string };
type RouteRow = { route: string };
type Data = { stats: { agents: number; pending: number; rejected: number; missionSuggestions: number; missions: string; missionRejected: number }; uniqueAgents: AgentRow[]; pendingApprovalAgents: AgentRow[]; rejectedAgents: AgentRow[]; missionProposalEntries: MissionRow[]; doneMissionProposals: MissionRow[]; distinctMissionRoutes: RouteRow[]; rejectedMissionProposals: MissionRow[] };

const FILTERS: Array<{ key: AdminCenterListFilter; label: string; value: (d: Data["stats"]) => string | number }> = [
  { key: "agenten_gesamt", label: "Agenten gesamt", value: (s) => s.agents },
  { key: "warten_auf_freigabe", label: "Warten auf Freigabe", value: (s) => s.pending },
  { key: "abgelehnt_blockiert", label: "Abgelehnt / blockiert", value: (s) => s.rejected },
  { key: "missionsvorschlaege", label: "Missionsvorschläge", value: (s) => s.missionSuggestions },
  { key: "missionen", label: "Missionen", value: (s) => s.missions },
  { key: "missionen_abgelehnt", label: "Missionen abgelehnt", value: (s) => s.missionRejected },
];

export default function AgentCenterInteractive({ data }: { data: Data }) {
  const [active, setActive] = useState<AdminCenterListFilter>("agenten_gesamt");
  const [feedback, setFeedback] = useState("");

  async function runAgent(action: "approve" | "reject" | "revise" | "block" | "review", row: AgentRow) {
    const input: AgentCenterDecisionInput = { targetType: "agent", targetId: row.id ?? row.name ?? "", reason: action };
    const clientMap = {
      approve: beta1AdminClient.approveAgentCenterProposal,
      reject: beta1AdminClient.rejectAgentCenterProposal,
      revise: beta1AdminClient.requestRevisionAgentCenterProposal,
      block: beta1AdminClient.blockAgentCenterProposal,
      review: beta1AdminClient.markAgentCenterProposalForReview,
    };
    const result = await clientMap[action](input);
    setFeedback(result.accepted ? (action === "approve" ? "Freigabe gespeichert. Umsetzung läuft erst über Worker Queue / Runner Gates." : "Entscheidung gespeichert.") : (result.message ?? "Aktion fehlgeschlagen."));
  }

  async function runMission(action: "approve" | "reject" | "revise" | "block" | "review", row: MissionRow) {
    const input: MissionCenterDecisionInput = { targetType: "mission", targetId: row.id, reason: action };
    const clientMap = {
      approve: beta1AdminClient.approveMissionCenterProposal,
      reject: beta1AdminClient.rejectMissionCenterProposal,
      revise: beta1AdminClient.requestRevisionMissionCenterProposal,
      block: beta1AdminClient.blockMissionCenterProposal,
      review: beta1AdminClient.markMissionCenterProposalForReview,
    };
    const result = await clientMap[action](input);
    setFeedback(result.accepted ? (action === "approve" ? "Freigabe gespeichert. Umsetzung läuft erst über Worker Queue / Runner Gates." : "Entscheidung gespeichert.") : (result.message ?? "Aktion fehlgeschlagen."));
  }

  const actions = useMemo(() => (
    <div className="flex flex-wrap gap-2 text-xs">
      {feedback ? <p className="rounded border border-cyan-200/30 bg-cyan-400/10 px-3 py-2 text-cyan-50">{feedback}</p> : null}
    </div>
  ), [feedback]);

  return (
    <section className="space-y-4 rounded-xl border border-white/12 bg-slate-950/35 p-4">
      <h3 className="text-sm font-semibold text-cyan-100">Interaktive Listen</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {FILTERS.map((item) => (
          <button key={item.key} onClick={() => setActive(item.key)} className={`rounded-lg border p-3 text-left ${active === item.key ? "border-cyan-300/60 bg-cyan-400/10" : "border-white/12 bg-slate-900/55"}`}>
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-100/65">{item.label}</p>
            <p className="font-mono text-2xl font-bold text-white">{item.value(data.stats)}</p>
          </button>
        ))}
      </div>
      {actions}
      <div className="space-y-2 text-xs text-white/85">
        {active === "agenten_gesamt" && data.uniqueAgents.map((row) => <div key={`${row.sourceLabel}-${row.id ?? row.name}`} className="rounded border border-white/10 p-2"><b>{row.name ?? row.id}</b> · {row.sourceLabel} · {row.status ?? "n/a"} · {row.riskLevel ?? "medium"} · {row.ownerArea ?? row.purpose ?? "-"}</div>)}
        {active === "warten_auf_freigabe" && data.pendingApprovalAgents.map((row) => <div key={row.id ?? row.name} className="rounded border border-white/10 p-2"><b>{row.name ?? row.id}</b><div className="mt-2 flex flex-wrap gap-2"> <button className="border px-2" onClick={() => runAgent("approve", row)}>Zustimmen</button><button className="border px-2" onClick={() => runAgent("reject", row)}>Ablehnen</button><button className="border px-2" onClick={() => runAgent("revise", row)}>Überarbeiten</button><button className="border px-2" onClick={() => runAgent("block", row)}>Blockieren</button><button className="border px-2" onClick={() => runAgent("review", row)}>Details</button></div></div>)}
        {active === "abgelehnt_blockiert" && data.rejectedAgents.map((row) => <div key={row.id ?? row.name} className="rounded border border-rose-300/30 p-2"><b>{row.name ?? row.id}</b><div className="mt-2 flex gap-2"><button className="border px-2" onClick={() => runAgent("review", row)}>Details</button><button className="border px-2" onClick={() => runAgent("review", row)}>Zur erneuten Prüfung</button></div></div>)}
        {active === "missionsvorschlaege" && data.missionProposalEntries.map((row) => <div key={row.id} className="rounded border border-white/10 p-2"><b>{row.title}</b> · {row.status} · {row.subject}</div>)}
        {active === "missionen" && <><h4 className="font-semibold">Gemachte Missionsvorschläge</h4>{data.doneMissionProposals.map((row) => <div key={row.id} className="rounded border border-white/10 p-2">{row.title}</div>)}<h4 className="pt-2 font-semibold">Vorhandene Mission-Routen</h4>{data.distinctMissionRoutes.map((row) => <div key={row.route} className="rounded border border-white/10 p-2">{row.route}</div>)}</>}
        {active === "missionen_abgelehnt" && data.rejectedMissionProposals.map((row) => <div key={row.id} className="rounded border border-rose-300/30 p-2"><b>{row.title}</b><div className="mt-2 flex flex-wrap gap-2"><button className="border px-2" onClick={() => runMission("approve", row)}>Zustimmen</button><button className="border px-2" onClick={() => runMission("reject", row)}>Ablehnen</button><button className="border px-2" onClick={() => runMission("revise", row)}>Überarbeiten</button><button className="border px-2" onClick={() => runMission("block", row)}>Blockieren</button><button className="border px-2" onClick={() => runMission("review", row)}>Details</button></div></div>)}
      </div>
    </section>
  );
}
