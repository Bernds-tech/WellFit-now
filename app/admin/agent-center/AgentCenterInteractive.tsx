"use client";
import { useState } from "react";
import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import type { AdminCenterListFilter, AgentCenterDecisionInput, MissionCenterDecisionInput } from "@/lib/admin/beta1AdminTypes";

type AgentRow = { id?: string; name?: string; sourceLabel?: string; status?: string; riskLevel?: string; ownerArea?: string; purpose?: string; sourceRef?: string };
type MissionRow = { id: string; title: string; status?: string; subject?: string; riskLevel?: string };
type Data = { stats: { agents: number; pending: number; rejected: number; missionSuggestions: number; missions: string; missionRejected: number }; uniqueAgents: AgentRow[]; pendingApprovalAgents: AgentRow[]; rejectedAgents: AgentRow[]; missionProposalEntries: MissionRow[]; doneMissionProposals: MissionRow[]; distinctMissionRoutes: { route: string }[]; rejectedMissionProposals: MissionRow[] };

export default function AgentCenterInteractive({ data }: { data: Data }) {
  const [active, setActive] = useState<AdminCenterListFilter>("agenten_gesamt");
  const [msg, setMsg] = useState("");
  const runAgent = async (action: "approve"|"reject"|"revise"|"block"|"review", input: AgentCenterDecisionInput) => {
    const map = {approve: beta1AdminClient.approveAgentCenterProposal,reject: beta1AdminClient.rejectAgentCenterProposal,revise: beta1AdminClient.requestRevisionAgentCenterProposal,block: beta1AdminClient.blockAgentCenterProposal,review: beta1AdminClient.markAgentCenterProposalForReview};
    const r = await map[action](input); setMsg(r.accepted ? (action==="approve"?"Freigabe gespeichert. Umsetzung läuft erst über Worker Queue / Runner Gates.":"Entscheidung gespeichert.") : (r.message||"Fehler ohne Details."));
  };
  const runMission = async (action: "approve"|"reject"|"revise"|"block"|"review", input: MissionCenterDecisionInput) => {
    const map = {approve: beta1AdminClient.approveMissionCenterProposal,reject: beta1AdminClient.rejectMissionCenterProposal,revise: beta1AdminClient.requestRevisionMissionCenterProposal,block: beta1AdminClient.blockMissionCenterProposal,review: beta1AdminClient.markMissionCenterProposalForReview};
    const r = await map[action](input); setMsg(r.accepted ? (action==="approve"?"Freigabe gespeichert. Umsetzung läuft erst über Worker Queue / Runner Gates.":"Entscheidung gespeichert.") : (r.message||"Fehler ohne Details."));
  };
  return <section className="space-y-4">{msg&&<p className="text-xs text-cyan-100">{msg}</p>}</section>;
}
