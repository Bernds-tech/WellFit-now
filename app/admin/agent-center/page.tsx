import type { Metadata } from "next";

import AppShell from "@/app/components/AppShell";
import agentBuildProposals from "@/project-register/agent-build-proposals.json";
import agentCatalog from "@/project-register/agent-catalog.json";
import approvalWorkflowJson from "@/project-register/agent-center-approval-workflow.json";
import missionProposalsJson from "@/project-register/agent-center-mission-proposals.json";
import approvedAgentBuildBacklog from "@/project-register/approved-agent-build-backlog.json";
import routesRegisterJson from "@/project-register/routes.json";

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

const catalogRegister = agentCatalog as RegisterWithEntries;
const backlogRegister = approvedAgentBuildBacklog as RegisterWithEntries;
const proposalsRegister = agentBuildProposals as RegisterWithEntries;
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
const approvalQueueRows = [...pendingApprovalAgents, ...rejectedAgents].sort((first, second) => {
  const firstRejected = rejectedStatuses.has(first.status ?? "");
  const secondRejected = rejectedStatuses.has(second.status ?? "");
  if (firstRejected !== secondRejected) return firstRejected ? 1 : -1;
  return getEntryTitle(first).localeCompare(getEntryTitle(second), "de");
});

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
    <article className="rounded-3xl border border-white/12 bg-white/10 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-cyan-50/75">{hint}</p>
    </article>
  );
}

function ApprovalTopPanel() {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Agenten gesamt" value={uniqueAgents.length} hint="Eindeutige Agenten aus Katalog, Build-Backlog und Build-Proposals." />
        <StatCard label="Warten auf Freigabe" value={pendingApprovalAgents.length} hint="Noch nicht gebaut/aktiv oder explizit review-pflichtig." />
        <StatCard label="Abgelehnt / blockiert" value={rejectedAgents.length} hint="Status rejected, declined, abgelehnt oder blocked." />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Missionsvorschläge" value={missionProposalEntries.length} hint="Klare Datenquelle: Agent-Center-Mission-Proposal-Register." />
        <StatCard label="Missionen" value={`${doneMissionProposals.length}/${distinctMissionRoutes.length}`} hint={`${distinctMissionProposals.length} verschieden markiert; aktive Routen rechts im Nenner.`} />
        <StatCard label="Missionen abgelehnt" value={rejectedMissionProposals.length} hint="Status abgelehnt/blocked; bleibt sichtbar, aber nicht startbar." />
      </div>
    </section>
  );
}

function RejectedOverviewBox({ title, entries, emptyText }: { title: string; entries: SourceEntry[] | AgentEntry[]; emptyText: string }) {
  return (
    <article className="rounded-3xl border border-rose-200/25 bg-rose-400/10 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-rose-50/80">Abgelehnte oder blockierte Einträge bleiben sichtbar, damit sie nicht versehentlich erneut gestartet werden.</p>
        </div>
        <Pill tone="danger">{entries.length} Einträge</Pill>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {entries.length > 0 ? entries.slice(0, 12).map((entry) => <Pill key={entry.id ?? getEntryTitle(entry)} tone="danger">{getEntryTitle(entry)}</Pill>) : <Pill>{emptyText}</Pill>}
      </div>
    </article>
  );
}

function MissionProposalOverviewBox() {
  return (
    <article className="rounded-3xl border border-rose-200/25 bg-rose-400/10 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Abgelehnte Missionsvorschläge</h2>
          <p className="mt-1 text-sm leading-6 text-rose-50/80">Direkt aus dem Mission-Proposal-Register; abgelehnte Vorschläge dürfen nicht per Agent-Center-Klick gestartet werden.</p>
        </div>
        <Pill tone="danger">{rejectedMissionProposals.length} Einträge</Pill>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {rejectedMissionProposals.length > 0 ? rejectedMissionProposals.map((entry) => <Pill key={entry.id} tone="danger">{entry.title}</Pill>) : <Pill>Keine abgelehnten Missionsvorschläge dokumentiert.</Pill>}
      </div>
    </article>
  );
}

function ApprovalWorkflowBox() {
  const steps = approvalWorkflow.workflowSteps ?? [];

  return (
    <section className="rounded-3xl border border-amber-200/25 bg-amber-300/10 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Sicherer PR-/Merge-Gate-Workflow</h2>
          <p className="mt-1 text-sm leading-6 text-amber-50/85">Zustimmen ist nur ein UI-Feld. PR-Erstellung und Merge bleiben separat, authentifiziert und human-reviewed.</p>
        </div>
        <Pill tone="warn">{approvalWorkflow.activationState ?? "defined_not_automated"}</Pill>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.id} className="rounded-2xl border border-white/10 bg-white/[0.07] p-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-100/70">Schritt {index + 1}</p>
            <p className="mt-2 font-bold text-white">{step.label}</p>
            <p className="mt-2 text-xs leading-5 text-amber-50/75">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function getApprovalDocumentId(entry: SourceEntry) {
  return `agent-doc-${getEntryKey(entry).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function ApprovalScopeDocument({ entry }: { entry: SourceEntry }) {
  const documentId = getApprovalDocumentId(entry);
  const title = getEntryTitle(entry);
  const allowedScopes = entry.allowedWriteScopes ?? [];
  const forbiddenScopes = entry.forbiddenWriteScopes ?? [];

  return (
    <div id={documentId} className="pointer-events-none fixed inset-0 z-50 hidden items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm target:pointer-events-auto target:flex">
      <article className="relative mt-8 w-full max-w-4xl rounded-[2rem] border border-cyan-200/25 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/70 md:p-8">
        <a href="#agent-approval-list" aria-label="Dokument schließen" className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-lg font-black text-white hover:bg-white/20">×</a>
        <p className="pr-10 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100/70">Freigabe-Dokument</p>
        <h3 className="mt-3 pr-10 text-3xl font-black tracking-tight text-white">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-cyan-50/80">{entry.purpose ?? entry.reason ?? entry.expectedBenefit ?? "Für diesen Agenten ist im Register noch keine ausführliche Beschreibung hinterlegt."}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200/20 bg-emerald-300/10 p-4">
            <h4 className="font-bold text-emerald-50">Dafür ist der Agent gedacht</h4>
            <p className="mt-2 text-sm leading-6 text-emerald-50/80">{entry.expectedBenefit ?? entry.nextRecommendedAction ?? entry.nextSafeMaintenanceTask ?? "Nutzen oder nächster Schritt muss vor der Freigabe ergänzt werden."}</p>
          </div>
          <div className="rounded-2xl border border-amber-200/20 bg-amber-300/10 p-4">
            <h4 className="font-bold text-amber-50">Freigabeumfang</h4>
            <p className="mt-2 text-sm leading-6 text-amber-50/85">Zustimmung bedeutet nur fachliche Intent-Erfassung. PR-Erstellung und Merge-Prüfung folgen erst über den separaten Owner-Workflow; diese Oberfläche führt weiterhin nichts automatisch aus.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.07] p-4">
            <h4 className="font-bold text-white">Darf verändern</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cyan-50/80">
              {allowedScopes.length > 0 ? allowedScopes.map((scope) => <li key={scope} className="font-mono text-xs">• {scope}</li>) : <li>• Keine Schreibpfade dokumentiert.</li>}
            </ul>
          </div>
          <div className="rounded-2xl bg-rose-400/[0.09] p-4">
            <h4 className="font-bold text-white">Darf nicht verändern</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-rose-50/85">
              {forbiddenScopes.length > 0 ? forbiddenScopes.map((scope) => <li key={scope} className="font-mono text-xs">• {scope}</li>) : <li>• Keine Sperrpfade dokumentiert.</li>}
            </ul>
          </div>
        </div>
      </article>
    </div>
  );
}

function AgentApprovalQueue() {
  return (
    <section id="agent-approval-list" className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Freigabe-Zeilenliste</h2>
          <p className="mt-1 text-sm leading-6 text-cyan-50/75">Links steht der Agent, daneben der Betreff/Nutzen, dann das Dokument und rechts die Entscheidung. Die Felder speichern noch nicht in Firebase und starten keinen Merge automatisch.</p>
        </div>
        <Pill tone="warn">{approvalQueueRows.length} Zeilen</Pill>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">
            <tr>
              <th className="px-3 py-2">Agent</th>
              <th className="px-3 py-2">Betreff / wofür gut</th>
              <th className="px-3 py-2">Dokument</th>
              <th className="px-3 py-2">Zustimmen / ablehnen</th>
            </tr>
          </thead>
          <tbody>
            {approvalQueueRows.map((entry) => {
              const title = getEntryTitle(entry);
              const rowTone = rejectedStatuses.has(entry.status ?? "") ? "danger" : "warn";
              return (
                <tr key={`${entry.source}-${getEntryKey(entry)}`} className="bg-white/[0.08] text-cyan-50/85 align-top">
                  <td className="rounded-l-2xl px-3 py-4">
                    <p className="font-bold text-white">{title}</p>
                    <p className="mt-1 font-mono text-xs text-cyan-100/65">{entry.id ?? entry.sourceLabel}</p>
                    <div className="mt-2 flex flex-wrap gap-2"><Pill tone={rowTone}>{entry.status ?? "n/a"}</Pill><Pill>{entry.riskLevel ?? "risk n/a"}</Pill></div>
                  </td>
                  <td className="max-w-xl px-3 py-4 text-sm leading-6">{entry.expectedBenefit ?? entry.purpose ?? entry.reason ?? "Kein Betreff/Nutzen im Register dokumentiert."}</td>
                  <td className="px-3 py-4">
                    <a href={`#${getApprovalDocumentId(entry)}`} className="inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-50 hover:bg-cyan-300/25">Dokument öffnen</a>
                    <ApprovalScopeDocument entry={entry} />
                  </td>
                  <td className="rounded-r-2xl px-3 py-4">
                    <fieldset className="space-y-2">
                      <legend className="sr-only">Entscheidung für {title}</legend>
                      <label className="flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-50"><input type="radio" name={`approval-${getEntryKey(entry)}`} /> Zustimmen</label>
                      <label className="flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-50"><input type="radio" name={`approval-${getEntryKey(entry)}`} defaultChecked={rejectedStatuses.has(entry.status ?? "")} /> Ablehnen</label>
                    </fieldset>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {approvalQueueRows.length === 0 && <p className="mt-4 rounded-2xl bg-white/[0.08] p-4 text-sm text-cyan-50/75">Keine Agenten warten aktuell auf Freigabe.</p>}
    </section>
  );
}

export default function AgentCenterPage() {
  return (
    <AppShell reward={0} contentClassName="px-0 py-0">
      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(0,170,190,0.32),_transparent_30%),linear-gradient(135deg,_#06252d,_#07111f_52%,_#0f172a)] px-5 py-8 pb-24 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-100/75">WellFit Admin · Freigabeübersicht · keine Auto-Ausführung</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Agent Center</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-cyan-50/80">
                  Kompakte Sicht für Agenten- und Missionsfreigaben: oben nur Kennzahlen, darunter abgelehnte Einträge und die Zeilenliste mit Dokument, Zustimmen/Ablehnen-Feld sowie klarer PR-/Merge-Grenze.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill tone="safe">lokale Register</Pill>
                <Pill tone="warn">Freigabeentscheidung vorbereitet</Pill>
                <Pill tone="danger">kein Auto-Merge</Pill>
              </div>
            </div>
          </header>

          <ApprovalTopPanel />

          <ApprovalWorkflowBox />

          <section className="grid gap-5 xl:grid-cols-2">
            <RejectedOverviewBox title="Abgelehnte Agenten" entries={rejectedAgents} emptyText="Keine abgelehnten Agenten dokumentiert." />
            <MissionProposalOverviewBox />
          </section>

          <AgentApprovalQueue />
        </div>
      </div>
    </AppShell>
  );
}
