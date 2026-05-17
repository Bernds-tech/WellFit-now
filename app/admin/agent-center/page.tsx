import type { Metadata } from "next";

import agentBuildProposals from "@/project-register/agent-build-proposals.json";
import agentCatalog from "@/project-register/agent-catalog.json";
import agentControlCenter from "@/project-register/agent-control-center.json";
import approvedAgentBuildBacklog from "@/project-register/approved-agent-build-backlog.json";

type RegisterEntry = {
  id?: string;
  name?: string;
  proposedAgentName?: string;
  status?: string;
  artifactStatus?: string;
  executionCapability?: string;
  riskLevel?: string;
  requiresHumanApprovalForRuntime?: boolean;
  nextRecommendedAction?: string;
  reason?: string;
  purpose?: string;
};

type RegisterWithEntries = {
  updated?: string;
  status?: string;
  activationState?: string;
  entries?: RegisterEntry[];
};

type ControlCenterRegister = RegisterWithEntries & {
  name?: string;
  purpose?: string;
  allowed_low_risk_actions?: string[];
  blocked_auto_actions?: string[];
  protected_scopes?: string[];
  authorized_approval_user?: {
    displayName?: string;
    allowedRoles?: string[];
    allowedApprovalTypes?: string[];
    blockedActions?: string[];
    currentImplementation?: string;
  };
  follow_up_required_for_real_approvals?: {
    status?: string;
    requiredBeforeAnyApprovalAction?: string[];
    blockedUntilFollowUpIsApproved?: string[];
  };
  admin_ui_target?: {
    status?: string;
    register_sources?: string[];
    must_not_create_in_this_task?: string[];
  };
};

type RegisterSummary = {
  label: string;
  source: string;
  register: RegisterWithEntries;
  description: string;
};

const catalogRegister = agentCatalog as RegisterWithEntries;
const backlogRegister = approvedAgentBuildBacklog as RegisterWithEntries;
const proposalsRegister = agentBuildProposals as RegisterWithEntries;
const controlCenterRegister = agentControlCenter as ControlCenterRegister;

const registerSummaries: RegisterSummary[] = [
  {
    label: "Agent Catalog",
    source: "project-register/agent-catalog.json",
    register: catalogRegister,
    description: "Aktuelle Agenten und ihre dokumentierte maximale Capability.",
  },
  {
    label: "Approved Build Backlog",
    source: "project-register/approved-agent-build-backlog.json",
    register: backlogRegister,
    description: "Freigegebene oder vorgemerkte Agent-Builds mit Human-Approval-Grenzen.",
  },
  {
    label: "Build Proposals",
    source: "project-register/agent-build-proposals.json",
    register: proposalsRegister,
    description: "Historische und offene Proposal-Artefakte fuer Agent-Builds.",
  },
  {
    label: "Agent Control Center",
    source: "project-register/agent-control-center.json",
    register: controlCenterRegister,
    description: "Governance-Regeln, Rollen, blockierte Aktionen und Follow-up-Anforderungen.",
  },
];

export const metadata: Metadata = {
  title: "Agent Center | WellFit Admin",
  description: "Read-only WellFit Agent Control Center aus statischen Governance-Registern.",
};

function countBy(entries: RegisterEntry[], key: keyof RegisterEntry) {
  return entries.reduce<Record<string, number>>((accumulator, entry) => {
    const value = entry[key];
    if (typeof value !== "string" || value.length === 0) return accumulator;
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

function formatList(items: string[] | undefined, fallback = "Nicht dokumentiert") {
  if (!items || items.length === 0) return fallback;
  return items.join(", ");
}

function getEntryTitle(entry: RegisterEntry) {
  return entry.name ?? entry.proposedAgentName ?? entry.id ?? "Unbenannter Eintrag";
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "safe" | "warn" }) {
  const className =
    tone === "safe"
      ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-50"
      : tone === "warn"
        ? "border-amber-300/50 bg-amber-300/15 text-amber-50"
        : "border-white/15 bg-white/10 text-white/85";

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
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

function SummaryCard({ summary }: { summary: RegisterSummary }) {
  const entries = summary.register.entries ?? [];
  const statusCounts = countBy(entries, "status");
  const capabilityCounts = countBy(entries, "executionCapability");
  const humanApprovalCount = entries.filter((entry) => entry.requiresHumanApprovalForRuntime).length;

  return (
    <article className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{summary.label}</h2>
          <p className="mt-1 text-sm text-cyan-50/70">{summary.description}</p>
          <p className="mt-2 font-mono text-xs text-cyan-100/70">{summary.source}</p>
        </div>
        <Pill tone="safe">read-only</Pill>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/8 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">Eintraege</p>
          <p className="mt-2 text-2xl font-black text-white">{entries.length}</p>
        </div>
        <div className="rounded-2xl bg-white/8 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">Registerstatus</p>
          <p className="mt-2 text-sm font-semibold text-white">{summary.register.status ?? summary.register.activationState ?? "n/a"}</p>
        </div>
        <div className="rounded-2xl bg-white/8 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">Runtime Approval</p>
          <p className="mt-2 text-sm font-semibold text-white">{humanApprovalCount} Eintraege markiert</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold text-white">Status</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(statusCounts).length > 0 ? (
              Object.entries(statusCounts).map(([status, count]) => <Pill key={status}>{status}: {count}</Pill>)
            ) : (
              <Pill>keine Statuswerte</Pill>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Capabilities</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(capabilityCounts).length > 0 ? (
              Object.entries(capabilityCounts).map(([capability, count]) => <Pill key={capability}>{capability}: {count}</Pill>)
            ) : (
              <Pill>keine Capability-Werte</Pill>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function EntryTable({ title, entries }: { title: string; entries: RegisterEntry[] }) {
  return (
    <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <Pill>erste {Math.min(entries.length, 8)} von {entries.length}</Pill>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">
            <tr>
              <th className="px-3 py-2">Agent</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Capability</th>
              <th className="px-3 py-2">Risiko</th>
              <th className="px-3 py-2">Human Review</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(0, 8).map((entry) => (
              <tr key={entry.id ?? getEntryTitle(entry)} className="bg-white/8 text-cyan-50/85">
                <td className="rounded-l-2xl px-3 py-3 font-semibold text-white">{getEntryTitle(entry)}</td>
                <td className="px-3 py-3">{entry.status ?? "n/a"}</td>
                <td className="px-3 py-3">{entry.executionCapability ?? "n/a"}</td>
                <td className="px-3 py-3">{entry.riskLevel ?? "n/a"}</td>
                <td className="rounded-r-2xl px-3 py-3">{entry.requiresHumanApprovalForRuntime ? "erforderlich" : "nicht markiert"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AgentCenterPage() {
  const allEntries = registerSummaries.flatMap((summary) => summary.register.entries ?? []);
  const approvalUser = controlCenterRegister.authorized_approval_user;
  const followUp = controlCenterRegister.follow_up_required_for_real_approvals;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,170,190,0.35),_transparent_30%),linear-gradient(135deg,_#06252d,_#07111f_52%,_#0f172a)] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-100/75">WellFit Admin · Read-only</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Agent Center</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-cyan-50/80">
                Diese Seite zeigt nur statische Governance-Register. Sie fuehrt keine Agenten aus, schreibt nicht nach Firebase,
                erstellt keine API-Routen und enthaelt bewusst keine Approval-, Merge-, Deploy- oder Auto-Repair-Aktionen.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill tone="safe">statische Register</Pill>
              <Pill tone="warn">keine Freigabe-Buttons</Pill>
              <Pill tone="warn">keine Runtime-Ausfuehrung</Pill>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Register" value={registerSummaries.length} hint="Nur lokale JSON-Register aus project-register/." />
          <StatCard label="Agent-Eintraege" value={allEntries.length} hint="Summierte Eintraege aus Catalog, Backlog und Proposals." />
          <StatCard label="Control Status" value={controlCenterRegister.status ?? "n/a"} hint={`Aktualisiert: ${controlCenterRegister.updated ?? "n/a"}.`} />
          <StatCard label="Approval Follow-up" value={followUp?.status ?? "separat"} hint="Echte Freigaben brauchen Auth, Rollenpruefung und Audit-Log." />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          {registerSummaries.map((summary) => <SummaryCard key={summary.source} summary={summary} />)}
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl border border-amber-200/25 bg-amber-300/10 p-5 shadow-xl shadow-slate-950/25">
            <h2 className="text-xl font-bold text-white">Freigabe-Nutzer im Konzept</h2>
            <dl className="mt-4 space-y-4 text-sm leading-6 text-amber-50/85">
              <div>
                <dt className="font-semibold text-white">Anzeigename</dt>
                <dd>{approvalUser?.displayName ?? "Nicht gesetzt"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Zulaessige Rollen</dt>
                <dd>{formatList(approvalUser?.allowedRoles)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Erlaubte Freigabearten</dt>
                <dd>{formatList(approvalUser?.allowedApprovalTypes)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Aktuelle Umsetzung</dt>
                <dd>{approvalUser?.currentImplementation ?? "read-only"}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-3xl border border-rose-200/25 bg-rose-400/10 p-5 shadow-xl shadow-slate-950/25">
            <h2 className="text-xl font-bold text-white">Blockierte Aktionen</h2>
            <p className="mt-2 text-sm leading-6 text-rose-50/80">
              Die folgenden Aktionen sind in dieser Route nicht implementiert und bleiben bis zu einem separaten Follow-up gesperrt.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(approvalUser?.blockedActions ?? controlCenterRegister.blocked_auto_actions ?? []).map((action) => (
                <Pill key={action} tone="warn">{action}</Pill>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
          <h2 className="text-xl font-bold text-white">Follow-up fuer echte Freigabeaktionen</h2>
          <p className="mt-2 text-sm leading-6 text-cyan-50/75">
            Jede echte Approval-Funktion ist ein separater Task. Vorher erforderlich:
          </p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {(followUp?.requiredBeforeAnyApprovalAction ?? []).map((requirement) => (
              <li key={requirement} className="rounded-2xl bg-white/8 px-4 py-3 text-sm text-cyan-50/85">{requirement}</li>
            ))}
          </ul>
        </section>

        <EntryTable title="Agent Catalog Status" entries={catalogRegister.entries ?? []} />
        <EntryTable title="Approved Build Backlog Status" entries={backlogRegister.entries ?? []} />
        <EntryTable title="Agent Build Proposal Status" entries={proposalsRegister.entries ?? []} />
      </div>
    </main>
  );
}
