import type { Metadata } from "next";

import AppShell from "@/app/components/AppShell";
import agentBuildProposals from "@/project-register/agent-build-proposals.json";
import agentCatalog from "@/project-register/agent-catalog.json";
import approvalWorkflowJson from "@/project-register/agent-center-approval-workflow.json";
import missionProposalsJson from "@/project-register/agent-center-mission-proposals.json";
import approvedAgentBuildBacklog from "@/project-register/approved-agent-build-backlog.json";
import routesRegisterJson from "@/project-register/routes.json";
import AgentCenterInteractive from "./AgentCenterInteractive";

type AgentEntry = {
  id?: string;
  name?: string;
  proposedAgentName?: string;
  status?: string;
  artifactStatus?: string;
  executionCapability?: string;
  riskLevel?: string;
  requiresHumanApprovalForRuntime?: boolean;
  humanReviewRequired?: boolean;
  nextRecommendedAction?: string;
  nextSafeMaintenanceTask?: string;
  reason?: string;
  purpose?: string;
  expectedBenefit?: string;
  ownerArea?: string;
  priority?: string;
  allowedWriteScopes?: string[];
  forbiddenWriteScopes?: string[];
  connectedAgents?: string[];
  connectedRegisters?: string[];
};

type MissionProposalEntry = {
  id: string;
  title: string;
  status: "gemacht" | "verschieden" | "abgelehnt" | string;
  subject: string;
  linkedRoute?: string;
  linkedRegister?: string;
  riskLevel?: string;
  decisionNote?: string;
};


type RegisterWithEntries = {
  updated?: string;
  status?: string;
  activationState?: string;
  purpose?: string;
  entries?: AgentEntry[];
};

type SourceEntry = AgentEntry & {
  source: string;
  sourceLabel: string;
};

type RouteEntry = {
  route: string;
  area?: string;
  status?: string;
};

type RoutesRegister = {
  protectedAppPages?: RouteEntry[];
  mobilePages?: RouteEntry[];
};

type MissionProposalRegister = {
  entries?: MissionProposalEntry[];
};

type ApprovalWorkflowRegister = {
  activationState?: string;
  workflowSteps?: { id: string; label: string; description: string; automated: boolean }[];
};


function asRegisterWithEntries(value: unknown): RegisterWithEntries {
  if (value && typeof value === "object" && "entries" in value) {
    return value as RegisterWithEntries;
  }
  return { entries: [] };
}

const catalogRegister = asRegisterWithEntries(agentCatalog);
const backlogRegister = asRegisterWithEntries(approvedAgentBuildBacklog);
const proposalsRegister = asRegisterWithEntries(agentBuildProposals);
const missionProposalRegister = missionProposalsJson as MissionProposalRegister;
const approvalWorkflow = approvalWorkflowJson as ApprovalWorkflowRegister;
const routesRegister = routesRegisterJson as RoutesRegister;

const sourceEntries: SourceEntry[] = [
  ...(catalogRegister.entries ?? []).map((entry) => ({ ...entry, source: "project-register/agent-catalog.json", sourceLabel: "Catalog" })),
  ...(backlogRegister.entries ?? []).map((entry) => ({ ...entry, source: "project-register/approved-agent-build-backlog.json", sourceLabel: "Backlog" })),
  ...(proposalsRegister.entries ?? []).map((entry) => ({ ...entry, source: "project-register/agent-build-proposals.json", sourceLabel: "Proposal" })),
];




const rejectedStatuses = new Set(["rejected", "blocked", "declined", "abgelehnt"]);
const pendingApprovalStatuses = new Set(["drafted", "proposed", "planning_only", "approved_for_planning", "review_required", "in_progress"]);
const completedStatuses = new Set(["active", "built", "report_only", "superseded"]);
const missionRouteEntries = [...(routesRegister.protectedAppPages ?? []), ...(routesRegister.mobilePages ?? [])].filter((route) =>
  route.route.includes("/missionen") || route.area?.toLowerCase().includes("mission"),
);
const missionProposalEntries = missionProposalRegister.entries ?? [];

function getEntryKey(entry: SourceEntry) {
  return entry.id ?? entry.proposedAgentName ?? entry.name ?? `${entry.source}-${getEntryTitle(entry)}`;
}

function getUniqueAgents(entries: SourceEntry[]) {
  const unique = new Map<string, SourceEntry>();
  for (const entry of entries) {
    const key = getEntryKey(entry);
    const existing = unique.get(key);
    if (!existing || existing.sourceLabel === "Backlog" || existing.sourceLabel === "Proposal") {
      unique.set(key, entry);
    }
  }
  return [...unique.values()].sort((first, second) => getEntryTitle(first).localeCompare(getEntryTitle(second), "de"));
}

const uniqueAgents = getUniqueAgents(sourceEntries);
const pendingApprovalAgents = uniqueAgents.filter((entry) => {
  const status = entry.status ?? "";
  if (rejectedStatuses.has(status) || completedStatuses.has(status)) return false;
  return pendingApprovalStatuses.has(status) || entry.requiresHumanApprovalForRuntime || entry.humanReviewRequired;
});
const rejectedAgents = uniqueAgents.filter((entry) => rejectedStatuses.has(entry.status ?? ""));
const rejectedMissionProposals = missionProposalEntries.filter((entry) => entry.status === "abgelehnt" || rejectedStatuses.has(entry.status ?? ""));
const doneMissionProposals = missionProposalEntries.filter((entry) => entry.status === "gemacht");
const distinctMissionProposals = missionProposalEntries.filter((entry) => entry.status === "verschieden");
const distinctMissionRoutes = Array.from(new Map(missionRouteEntries.map((route) => [route.route, route])).values());
export const metadata: Metadata = {
  title: "Agent Center | WellFit Admin",
  description: "Live sichtbares WellFit Agent Control Center mit sicher aktivierter report-only Agent-OS-Schicht.",
};

function getEntryTitle(entry: AgentEntry) {
  return entry.name ?? entry.proposedAgentName ?? entry.id ?? "Unbenannter Eintrag";
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "safe" | "warn" | "danger" }) {
  const className = {
    safe: "border-emerald-300/40 bg-emerald-300/15 text-emerald-50",
    warn: "border-amber-300/50 bg-amber-300/15 text-amber-50",
    danger: "border-rose-300/50 bg-rose-400/15 text-rose-50",
    neutral: "border-white/15 bg-white/10 text-white/85",
  }[tone];

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <article className="rounded-lg border border-white/12 bg-slate-900/55 p-3 shadow-sm shadow-slate-950/20">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cyan-100/65">{label}</p>
        <p className="font-mono text-2xl font-bold leading-none text-white">{value}</p>
      </div>
      <p className="mt-2 border-t border-white/10 pt-2 text-xs leading-5 text-cyan-50/70">{hint}</p>
    </article>
  );
}

function ApprovalTopPanel() {
  return (
    <section className="rounded-xl border border-white/12 bg-slate-950/35 p-4 shadow-sm shadow-slate-950/20">
      <div className="mb-3 flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Kennzahlen und Registerstatus</h2>
          <p className="mt-1 text-xs leading-5 text-cyan-50/65">Technische Übersicht aus lokalen Governance-Registern. Interaktive Freigaben erfolgen im Bereich „Interaktive Listen“ unten; kein Merge/Deploy.</p>
        </div>
        <Pill>Register-Snapshot</Pill>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Agenten gesamt" value={uniqueAgents.length} hint="Katalog, Build-Backlog und Build-Proposals." />
        <StatCard label="Warten auf Freigabe" value={pendingApprovalAgents.length} hint="Nicht aktiv oder review-pflichtig." />
        <StatCard label="Abgelehnt / blockiert" value={rejectedAgents.length} hint="Rejected, declined, abgelehnt, blocked." />
        <StatCard label="Missionsvorschläge" value={missionProposalEntries.length} hint="Mission-Proposal-Register." />
        <StatCard label="Missionen" value={`${doneMissionProposals.length}/${distinctMissionRoutes.length}`} hint={`${distinctMissionProposals.length} verschieden; Routen im Nenner.`} />
        <StatCard label="Missionen abgelehnt" value={rejectedMissionProposals.length} hint="Sichtbar, aber nicht startbar." />
      </div>
    </section>
  );
}

function RejectedOverviewBox({ title, entries, emptyText }: { title: string; entries: SourceEntry[] | AgentEntry[]; emptyText: string }) {
  return (
    <article className="rounded-xl border border-rose-200/20 bg-slate-950/35 p-4 shadow-sm shadow-slate-950/20">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-rose-50/72">Abgelehnte oder blockierte Einträge bleiben sichtbar, damit sie nicht versehentlich erneut gestartet werden.</p>
        </div>
        <Pill tone="danger">{entries.length} Einträge</Pill>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.length > 0 ? entries.slice(0, 12).map((entry) => <Pill key={entry.id ?? getEntryTitle(entry)} tone="danger">{getEntryTitle(entry)}</Pill>) : <Pill>{emptyText}</Pill>}
      </div>
    </article>
  );
}

function MissionProposalOverviewBox() {
  return (
    <article className="rounded-xl border border-rose-200/20 bg-slate-950/35 p-4 shadow-sm shadow-slate-950/20">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Abgelehnte Missionsvorschläge</h2>
          <p className="mt-1 text-xs leading-5 text-rose-50/72">Direkt aus dem Mission-Proposal-Register; abgelehnte Vorschläge dürfen nicht per Agent-Center-Klick gestartet werden.</p>
        </div>
        <Pill tone="danger">{rejectedMissionProposals.length} Einträge</Pill>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {rejectedMissionProposals.length > 0 ? rejectedMissionProposals.map((entry) => <Pill key={entry.id} tone="danger">{entry.title}</Pill>) : <Pill>Keine abgelehnten Missionsvorschläge dokumentiert.</Pill>}
      </div>
    </article>
  );
}

function ApprovalWorkflowBox() {
  const steps = approvalWorkflow.workflowSteps ?? [];

  return (
    <section className="rounded-xl border border-amber-200/20 bg-slate-950/35 p-4 shadow-sm shadow-slate-950/20">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Sicherer PR-/Merge-Gate-Workflow</h2>
          <p className="mt-1 text-xs leading-5 text-amber-50/75">Zustimmen bleibt ein UI-Feld; PR-Erstellung und Merge sind separate, authentifizierte Human-Review-Schritte.</p>
        </div>
        <Pill tone="warn">{approvalWorkflow.activationState ?? "defined_not_automated"}</Pill>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
          <thead className="uppercase tracking-[0.16em] text-amber-100/60">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Kontrollpunkt</th>
              <th className="px-3 py-2">Beschreibung</th>
              <th className="px-3 py-2">Automatisierung</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <tr key={step.id} className="bg-white/[0.06] text-amber-50/80">
                <td className="rounded-l-md px-3 py-2 font-mono text-amber-100/75">{String(index + 1).padStart(2, "0")}</td>
                <td className="px-3 py-2 font-semibold text-white">{step.label}</td>
                <td className="px-3 py-2 leading-5">{step.description}</td>
                <td className="rounded-r-md px-3 py-2"><Pill tone={step.automated ? "warn" : "safe"}>{step.automated ? "systemgestützt" : "manuell"}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AgentCenterPage() {
  return (
    <AppShell reward={0} contentClassName="px-0 py-0">
      <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(135deg,_#06252d,_#07111f_54%,_#0f172a)] px-5 py-6 pb-24 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <header className="rounded-xl border border-white/12 bg-slate-950/45 p-4 shadow-sm shadow-slate-950/25">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/65">WellFit Admin · Agentensteuerung · Governance</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">Agent Center</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-cyan-50/72">
                  Technisches Kontrollzentrum für Freigaben, Registerstatus und PR-/Merge-Gates. Die Oberfläche dokumentiert Entscheidungen und startet keine automatische Ausführung.
                </p>
              </div>
              <div className="grid gap-2 text-xs text-cyan-50/75 sm:grid-cols-3 lg:min-w-[34rem]">
                <div className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2"><span className="block uppercase tracking-[0.14em] text-cyan-100/55">Datenquelle</span><strong className="mt-1 block text-white">lokale Register</strong></div>
                <div className="rounded-md border border-amber-200/20 bg-amber-300/[0.07] px-3 py-2"><span className="block uppercase tracking-[0.14em] text-amber-100/60">Freigabe</span><strong className="mt-1 block text-white">UI-Entscheidung</strong></div>
                <div className="rounded-md border border-rose-200/20 bg-rose-400/[0.07] px-3 py-2"><span className="block uppercase tracking-[0.14em] text-rose-100/60">Merge</span><strong className="mt-1 block text-white">separat / manuell</strong></div>
              </div>
            </div>
          </header>

          <ApprovalTopPanel />

          <ApprovalWorkflowBox />

          <section className="grid gap-5 xl:grid-cols-2">
            <RejectedOverviewBox title="Abgelehnte Agenten" entries={rejectedAgents} emptyText="Keine abgelehnten Agenten dokumentiert." />
            <MissionProposalOverviewBox />
          </section>

          <AgentCenterInteractive data={{
            stats: {
              agents: uniqueAgents.length,
              pending: pendingApprovalAgents.length,
              rejected: rejectedAgents.length,
              missionSuggestions: missionProposalEntries.length,
              missions: `${doneMissionProposals.length}/${distinctMissionRoutes.length}`,
              missionRejected: rejectedMissionProposals.length,
            },
            uniqueAgents, pendingApprovalAgents, rejectedAgents, missionProposalEntries, doneMissionProposals, distinctMissionRoutes, rejectedMissionProposals
          }} />

        </div>
      </div>
    </AppShell>
  );
}
