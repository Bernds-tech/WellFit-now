import type { Metadata } from "next";

import AppShell from "@/app/components/AppShell";
import agentBuildProposals from "@/project-register/agent-build-proposals.json";
import agentCatalog from "@/project-register/agent-catalog.json";
import missionProposalsJson from "@/project-register/agent-center-mission-proposals.json";
import productEvolutionFirstRunOutput from "@/project-register/agent-product-evolution-first-run-output.json";
import productEvolutionDecisionDossiers from "@/project-register/agent-product-evolution-decision-dossiers.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import approvedAgentBuildBacklog from "@/project-register/approved-agent-build-backlog.json";
import AgentCenterInteractive from "./AgentCenterInteractive";
import { buildAdminDecisionSummary, getAgentStatusBucket, getMissionStatusBucket } from "@/lib/admin/agentCenterStatus";

type AnyRow = Record<string, unknown>;
const DOSSIER_IDS = ["PE-20260523-01", "PE-20260523-02", "PE-20260523-03"];

const productOpportunityMd = readFileSync(join(process.cwd(), "todolist/AGENT_PRODUCT_OPPORTUNITY_PROPOSALS.md"), "utf8");
const missionStoryMd = readFileSync(join(process.cwd(), "todolist/AGENT_MISSION_STORY_PROPOSALS.md"), "utf8");

function entriesOf(value: unknown): AnyRow[] { return value && typeof value === "object" && "entries" in value && Array.isArray((value as { entries?: unknown[] }).entries) ? (value as { entries: AnyRow[] }).entries : []; }
function asText(v: unknown): string { return typeof v === "string" ? v.trim() : ""; }
function clipText(text: string, max = 1700): string { return text.length > max ? `${text.slice(0, max)}…` : text; }
function findSection(md: string, id: string): string {
  const rx = new RegExp(`(^|\\n)#{1,6}[^\\n]*${id}[^\\n]*\\n([\\s\\S]*?)(?=\\n#{1,6}\\s|$)`, "i");
  const match = md.match(rx);
  if (match) return `${match[0].trim()}\n${match[2]?.trim() || ""}`.trim();
  const idx = md.indexOf(id);
  if (idx < 0) return "";
  return md.slice(Math.max(0, idx - 120), idx + 2600).split("\n## ")[0]?.trim() || "";
}
function findField(section: string, labels: string[]): string {
  for (const raw of section.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const normalized = line.toLowerCase();
    if (labels.some((label) => normalized.includes(label.toLowerCase()))) {
      return line.replace(/^[-*#\s]+/, "").replace(/^([^:]{1,40}):\s*/i, "").trim();
    }
  }
  return "";
}
function extractPeId(...values: unknown[]): string {
  for (const value of values) {
    const text = asText(value);
    if (!text) continue;
    const match = text.match(/(PE-\d{8}-\d+)/i);
    if (match) return match[1].toUpperCase();
  }
  return "";
}

function dossierPackFromMarkdown(dossierId: string): AnyRow {
  const section = findSection(productOpportunityMd, dossierId) || findSection(missionStoryMd, dossierId);
  if (!section) return { detailStatus: "missing", hasDossierDetails: false };
  const detailSections = {
    summary: findField(section, ["summary", "zusammenfassung"]),
    problem: findField(section, ["problem", "issue", "pain"]),
    proposedChange: findField(section, ["proposed change", "änderung", "change", "was soll passieren"]),
    whyNow: findField(section, ["why now", "warum jetzt"]),
    wellFitBenefit: findField(section, ["wellfit benefit", "vorteil für wellfit"]),
    userBenefit: findField(section, ["user benefit", "nutzer", "user"]),
    businessBenefit: findField(section, ["business", "geschäft"]),
    economyImpact: findField(section, ["economy", "financial", "wirtschaft", "impact"]),
    risks: findField(section, ["risk", "risiko"]),
    mitigation: findField(section, ["mitigation", "absicherung", "gegenmaßnahme"]),
    recommendation: findField(section, ["recommend", "empfehl"]),
    suggestedTaskProposal: findField(section, ["task proposal", "vorgeschlagener task", "nächster task"]),
  };
  const filled = Object.values(detailSections).filter(Boolean).length;
  const detailStatus = filled >= 6 ? "structured" : filled > 0 ? "partial_structured" : "reference_only";
  return { detailStatus, hasDossierDetails: true, detailText: clipText(section), detailSections };
}

function normalizeFirstRunRows(run: AnyRow): AnyRow[] {
  const createdAt = asText(run.createdAt);
  const mapEntry = (entry: AnyRow, listType: string, status: string): AnyRow => {
    const sourceDossierId = extractPeId(entry.sourceDossierId, entry.dossierId, entry.id, entry.title) || asText(entry.dossierId) || asText(entry.sourceDossierId);
    const dossierRef = asText(entry.dossierRef) || (sourceDossierId ? `todolist/AGENT_PRODUCT_OPPORTUNITY_PROPOSALS.md#${sourceDossierId}` : "");
    const reportRef = asText(entry.reportRef) || "docs/architecture/WELLFIT_AGENT_PRODUCT_EVOLUTION_FIRST_RUN_ANALYSIS.md";
    const fromMd = DOSSIER_IDS.includes(sourceDossierId) ? dossierPackFromMarkdown(sourceDossierId) : { detailStatus: dossierRef ? "reference_only" : "missing", hasDossierDetails: Boolean(dossierRef), detailText: dossierRef || "" };
    const detailSections = (entry.detailSections as AnyRow | undefined) || (fromMd.detailSections as AnyRow | undefined) || {};
    const missingCriticalDecisionFields = ["summary", "proposedChange", "whyNow", "wellFitBenefit", "risks", "recommendation"].filter((k) => !asText(detailSections[k]));
    return { ...entry, id: asText(entry.id) || asText(entry.taskProposalId) || sourceDossierId, title: asText(entry.title) || asText(entry.dossierTitle) || sourceDossierId || "Product Evolution Entry", status, source: "project-register/agent-product-evolution-first-run-output.json", sourceLabel: "Product Evolution First Run", sourceDossierId, dossierId: sourceDossierId, sourcePath: "project-register/agent-product-evolution-first-run-output.json", dossierRef, reportRef, hasDossierDetails: Boolean(fromMd.hasDossierDetails), hasReportDetails: Boolean(reportRef), detailStatus: fromMd.detailStatus, detailText: asText(entry.detailText) || asText(fromMd.detailText), detailSections, missingCriticalDecisionFields, missingDecisionData: missingCriticalDecisionFields, createdAt: asText(entry.createdAt) || createdAt, waitingForApprovalAt: createdAt || undefined, riskLevel: entry.riskLevel, listType, canDecide: false, decisionHint: "Noch nicht in Server-Inbox gespiegelt." };
  };
  const rows: AnyRow[] = [];
  for (const e of (run.generatedDossiers as AnyRow[] ?? [])) rows.push(mapEntry(e, "generatedDossiers", "pending_approval"));
  for (const e of (run.suggestedTaskQueue as AnyRow[] ?? [])) if (e.requiresAdminReview === true || e.adminApprovalRequired === true) rows.push(mapEntry(e, "suggestedTaskQueue", "pending_approval"));
  for (const e of (run.recommendedApprovals as AnyRow[] ?? [])) rows.push(mapEntry(e, "recommendedApprovals", "pending_approval"));
  return rows;
}

const sourceEntries = [...entriesOf(agentCatalog).map((entry) => ({ ...entry, sourceLabel: "Catalog", canDecide: false })), ...entriesOf(approvedAgentBuildBacklog).map((entry) => ({ ...entry, sourceLabel: "Backlog", canDecide: false })), ...entriesOf(agentBuildProposals).map((entry) => ({ ...entry, sourceLabel: "Proposal", canDecide: false })), ...normalizeFirstRunRows(productEvolutionFirstRunOutput as AnyRow)];
const adminAgentRows = Array.from(new Map(sourceEntries.map((entry) => { const row = entry as AnyRow; const key = String(row.id || row.title || row.name); return [key, { ...row, decisionSummary: buildAdminDecisionSummary(row) }]; })).values());
const adminMissionRows = ((missionProposalsJson as { entries?: AnyRow[] }).entries ?? []).map((entry) => ({ ...entry, canDecide: true }));
const countByBucket = (rows: AnyRow[], fn: (entry: AnyRow) => string) => rows.reduce((acc, row) => ((acc[fn(row)] = Number(acc[fn(row)] ?? 0) + 1), acc), {} as Record<string, number>);
const agentBuckets = countByBucket(adminAgentRows, getAgentStatusBucket);
const missionBuckets = countByBucket(adminMissionRows, getMissionStatusBucket);

export const metadata: Metadata = { title: "Agent Center | WellFit Admin", description: "Live sichtbares WellFit Agent Control Center" };
export default function AgentCenterPage() {
  const decisionDossiers = Array.isArray((productEvolutionDecisionDossiers as AnyRow).dossiers) ? (productEvolutionDecisionDossiers as AnyRow).dossiers : [];
  const firstRunRegisterSnapshot = { ...((productEvolutionFirstRunOutput as AnyRow) || {}), decisionDossiers, decisionDossiersSourceRef: (productEvolutionDecisionDossiers as AnyRow).sourceRef || "project-register/agent-product-evolution-decision-dossiers.json" };
  const firstRunRegisterSnapshotKeys = Object.keys(firstRunRegisterSnapshot);

  return <AppShell reward={0} contentClassName="px-0 py-0"><div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(135deg,_#06252d,_#07111f_54%,_#0f172a)] px-5 py-6 pb-24 text-white sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col gap-4"><AgentCenterInteractive firstRunRegisterSnapshot={firstRunRegisterSnapshot} firstRunRegisterSnapshotKeys={firstRunRegisterSnapshotKeys} firstRunOutput={productEvolutionFirstRunOutput as AnyRow} data={{ agents: adminAgentRows, missions: adminMissionRows, stats: { agent_total: adminAgentRows.length, agent_pending: Number(agentBuckets.pending_approval ?? 0), agent_approved: Number(agentBuckets.approved_ready ?? 0), agent_rejected: Number(agentBuckets.rejected ?? 0), agent_blocked: Number(agentBuckets.blocked ?? 0), agent_in_progress: Number(agentBuckets.in_progress ?? 0), agent_completed: Number(agentBuckets.completed ?? 0), agent_repair_required: Number(agentBuckets.repair_required ?? 0), agent_halted_waiting_owner: Number(agentBuckets.halted_waiting_owner ?? 0), agent_cycle_restart_required: Number(agentBuckets.cycle_restart_required ?? 0), mission_total: adminMissionRows.length, mission_pending: Number(missionBuckets.pending_approval ?? 0), mission_approved: Number(missionBuckets.approved_ready ?? 0), mission_rejected: Number(missionBuckets.rejected ?? 0), mission_blocked: Number(missionBuckets.blocked ?? 0), mission_in_progress: Number(missionBuckets.in_progress ?? 0), mission_completed: Number(missionBuckets.completed ?? 0) } }} /></div></div></AppShell>;
}
