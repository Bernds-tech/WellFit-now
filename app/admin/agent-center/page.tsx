import type { Metadata } from "next";

import AppShell from "@/app/components/AppShell";
import agentBuildProposals from "@/project-register/agent-build-proposals.json";
import agentCatalog from "@/project-register/agent-catalog.json";
import missionProposalsJson from "@/project-register/agent-center-mission-proposals.json";
import productEvolutionFirstRunOutput from "@/project-register/agent-product-evolution-first-run-output.json";
import approvedAgentBuildBacklog from "@/project-register/approved-agent-build-backlog.json";
import AgentCenterInteractive from "./AgentCenterInteractive";
import { buildAdminDecisionSummary, getAgentStatusBucket, getMissionStatusBucket } from "@/lib/admin/agentCenterStatus";

type AnyRow = Record<string, unknown>;

function entriesOf(value: unknown): AnyRow[] {
  if (value && typeof value === "object" && "entries" in value && Array.isArray((value as { entries?: unknown[] }).entries)) return (value as { entries: AnyRow[] }).entries;
  return [];
}

function asText(v: unknown): string { return typeof v === "string" ? v : ""; }

function normalizeFirstRunRows(run: AnyRow): AnyRow[] {
  const createdAt = asText(run.createdAt);
  const mapEntry = (entry: AnyRow, listType: string, status: string, nextActionOverride?: string): AnyRow => ({
    id: asText(entry.id) || asText(entry.taskProposalId) || asText(entry.dossierId),
    title: asText(entry.title) || asText(entry.dossierTitle) || asText(entry.name) || "Product Evolution Entry",
    status,
    source: "project-register/agent-product-evolution-first-run-output.json",
    sourceLabel: "Product Evolution First Run",
    sourceDossierId: asText(entry.dossierId) || asText(entry.sourceDossierId),
    dossierId: asText(entry.dossierId) || asText(entry.sourceDossierId),
    createdAt: asText(entry.createdAt) || createdAt,
    submittedAt: createdAt || undefined,
    waitingForApprovalAt: createdAt || undefined,
    approvedAt: entry.approvedAt,
    rejectedAt: entry.rejectedAt,
    blockedAt: entry.blockedAt,
    riskLevel: entry.riskLevel,
    allowedFiles: entry.allowedFiles,
    blockedFiles: entry.blockedFiles,
    requiredChecks: entry.requiredChecks,
    nextAction: nextActionOverride || entry.nextAction || entry.recommendedAction,
    runnerEligibility: entry.runnerEligibility,
    adminApprovalRequired: true,
    requiresAdminReview: true,
    listType,
    canDecide: false,
    decisionHint: "Noch nicht in Firestore-Mirror synchronisiert; erst Inbox-Sync nötig.",
  });

  const rows: AnyRow[] = [];
  for (const e of (run.generatedDossiers as AnyRow[] ?? [])) rows.push(mapEntry(e, "generatedDossiers", "pending_approval"));
  for (const e of (run.suggestedTaskQueue as AnyRow[] ?? [])) {
    const requiresAdminReview = e.requiresAdminReview === true || e.adminApprovalRequired === true;
    if (requiresAdminReview) rows.push(mapEntry(e, "suggestedTaskQueue", "pending_approval"));
  }
  for (const e of (run.recommendedApprovals as AnyRow[] ?? [])) rows.push(mapEntry(e, "recommendedApprovals", "pending_approval"));
  for (const e of (run.recommendedResearchMore as AnyRow[] ?? [])) rows.push(mapEntry(e, "recommendedResearchMore", "research_more", "research_more"));
  for (const e of (run.blockedItems as AnyRow[] ?? [])) rows.push(mapEntry(e, "blockedItems", "blocked"));
  return rows;
}

const sourceEntries = [
  ...entriesOf(agentCatalog).map((entry) => ({ ...entry, source: "project-register/agent-catalog.json", sourceLabel: "Catalog", canDecide: false, decisionHint: "Noch nicht entscheidbar: Dieser Eintrag ist nur ein lokaler Register-/Catalog-Eintrag. Bitte zuerst Inbox synchronisieren oder Dossier erzeugen." })),
  ...entriesOf(approvedAgentBuildBacklog).map((entry) => ({ ...entry, source: "project-register/approved-agent-build-backlog.json", sourceLabel: "Backlog", canDecide: false, decisionHint: "Noch nicht entscheidbar: Dieser Backlog-Eintrag braucht zuerst ein serverseitiges Inbox-Target." })),
  ...entriesOf(agentBuildProposals).map((entry) => ({ ...entry, source: "project-register/agent-build-proposals.json", sourceLabel: "Proposal", canDecide: false, decisionHint: "Noch nicht entscheidbar: Proposal erst nach Inbox-Sync oder Dossier-Mirror freigabefähig." })),
  ...normalizeFirstRunRows(productEvolutionFirstRunOutput as AnyRow),
];

const adminAgentRows = Array.from(new Map(sourceEntries.map((entry) => { const row = entry as AnyRow; const summary = buildAdminDecisionSummary(row); const key = String(row.id || row.title || row.name); return [key, { ...row, decisionSummary: summary }]; })).values());
const adminMissionRows = ((missionProposalsJson as { entries?: AnyRow[] }).entries ?? []).map((entry) => ({ ...entry, canDecide: true }));

function countByBucket(rows: AnyRow[], fn: (entry: AnyRow) => string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const row of rows) {
    const bucket = fn(row);
    result[bucket] = Number(result[bucket] ?? 0) + 1;
  }
  return result;
}

const agentBuckets: Record<string, number> = countByBucket(adminAgentRows, getAgentStatusBucket);
const missionBuckets: Record<string, number> = countByBucket(adminMissionRows, getMissionStatusBucket);

export const metadata: Metadata = { title: "Agent Center | WellFit Admin", description: "Live sichtbares WellFit Agent Control Center mit sicher aktivierter report-only Agent-OS-Schicht." };

export default function AgentCenterPage() {
  return <AppShell reward={0} contentClassName="px-0 py-0"><div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(135deg,_#06252d,_#07111f_54%,_#0f172a)] px-5 py-6 pb-24 text-white sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col gap-4"><header className="rounded-xl border border-white/12 bg-slate-950/45 p-4 shadow-sm shadow-slate-950/25"><h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">Agent Center</h1></header><section className="rounded-xl border border-white/12 bg-slate-950/35 p-4"><p className="text-sm text-cyan-50/80">Interaktive Listen nutzen eine gemeinsame normalisierte Datenbasis. Product-Evolution-First-Run Einträge mit Admin-Review erscheinen unter „Warten auf Freigabe“.</p><p className="mt-2 text-xs text-cyan-50/70">Quelle zusätzlich eingebunden: project-register/agent-product-evolution-first-run-output.json.</p><p className="mt-2 text-xs text-amber-50/75">Falls lokale Register-Einträge noch kein Firestore-Mirror targetId besitzen, bleiben Actions deaktiviert bis Inbox-Sync.</p></section><AgentCenterInteractive data={{ agents: adminAgentRows, missions: adminMissionRows, stats: { agent_total: adminAgentRows.length, agent_pending: agentBuckets.pending_approval ?? 0, agent_approved: agentBuckets.approved_ready ?? 0, agent_rejected: agentBuckets.rejected ?? 0, agent_blocked: agentBuckets.blocked ?? 0, agent_in_progress: agentBuckets.in_progress ?? 0, agent_completed: agentBuckets.completed ?? 0, agent_repair_required: agentBuckets.repair_required ?? 0, agent_halted_waiting_owner: agentBuckets.halted_waiting_owner ?? 0, agent_cycle_restart_required: agentBuckets.cycle_restart_required ?? 0, mission_total: adminMissionRows.length, mission_pending: missionBuckets.pending_approval ?? 0, agent_not_decidable_sync_needed: agentBuckets.not_decidable_sync_needed ?? 0, mission_approved: missionBuckets.approved_ready ?? 0, mission_rejected: missionBuckets.rejected ?? 0, mission_blocked: missionBuckets.blocked ?? 0, mission_in_progress: missionBuckets.in_progress ?? 0, mission_completed: missionBuckets.completed ?? 0 } }} /></div></div></AppShell>;
}
