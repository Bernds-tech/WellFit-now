import type { Metadata } from "next";

import AppShell from "@/app/components/AppShell";
import agentBuildProposals from "@/project-register/agent-build-proposals.json";
import agentCatalog from "@/project-register/agent-catalog.json";
import agentControlCenter from "@/project-register/agent-control-center.json";
import conceptLearningQuestions from "@/project-register/concept-learning-questions.json";
import agentWorkLog from "@/project-register/agent-work-log.json";
import approvedAgentBuildBacklog from "@/project-register/approved-agent-build-backlog.json";

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


type LearningQuestionStatus = "offen" | "beantwortet" | "braucht Rückfrage" | "umgesetzt";

type LearningQuestion = {
  id: string;
  status: LearningQuestionStatus;
  category?: "open" | "answered" | "archived";
  question: string;
  whyImportant: string;
  risk: string;
  affectedWellFitArea: string[];
  proposedStorageLocation: string;
  answerPreparation?: {
    mode?: "lokal_statisch_vorbereitet" | "api_follow_up_spaeter";
    draftAnswer?: string;
    apiFollowUpRequired?: boolean;
    apiFollowUpNote?: string;
  };
  followUp?: string;
  archivedReason?: string;
};

type LearningQuestionsRegister = {
  updated?: string;
  status?: string;
  name?: string;
  purpose?: string;
  dataPolicy?: {
    containsSensitiveUserData?: boolean;
    rule?: string;
  };
  questions?: LearningQuestion[];
  archivedQuestions?: LearningQuestion[];
};

type RegisterWithEntries = {
  updated?: string;
  status?: string;
  activationState?: string;
  purpose?: string;
  entries?: AgentEntry[];
};

type WorkLogEntry = {
  taskId?: string;
  title?: string;
  status?: string;
  riskLevel?: string;
  nextRecommendedTask?: string;
  changedFiles?: string[];
  checksRun?: string[];
  followUps?: string[];
  pr?: {
    branch?: string;
    number?: number | null;
    url?: string | null;
    title?: string;
  };
};

type WorkLogRegister = {
  updated?: string;
  purpose?: string;
  entries?: WorkLogEntry[];
};

type ApprovalOwner = {
  id?: string;
  displayName?: string;
  role?: string;
  approvalScopes?: string[];
  explicitlyBlocked?: string[];
  approvalBoundaries?: string[];
  currentApprovalCapability?: string;
};

type ControlCenterRegister = RegisterWithEntries & {
  name?: string;
  allowed_low_risk_actions?: string[];
  blocked_auto_actions?: string[];
  protected_scopes?: string[];
  human_approval_required_for?: string[];
  proposal_statuses?: string[];
  roles?: {
    id?: string;
    label?: string;
    permissions?: string[];
    forbidden_actions?: string[];
  }[];
  owners?: ApprovalOwner[];
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
    separateAuthFollowUp?: string;
  };
  admin_ui_target?: {
    status?: string;
    register_sources?: string[];
    must_not_create_in_this_task?: string[];
  };
};

type SourceEntry = AgentEntry & {
  source: string;
  sourceLabel: string;
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
const learningQuestionsRegister = conceptLearningQuestions as LearningQuestionsRegister;
const workLogRegister = agentWorkLog as WorkLogRegister;

const registerSummaries: RegisterSummary[] = [
  {
    label: "Agent Catalog",
    source: "project-register/agent-catalog.json",
    register: catalogRegister,
    description: "Aktive, gebaute und report-only Agenten mit dokumentierter maximaler Capability.",
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
    description: "Historische und offene Proposal-Artefakte für Agent-Builds.",
  },
  {
    label: "Agent Control Center",
    source: "project-register/agent-control-center.json",
    register: controlCenterRegister,
    description: "Governance-Regeln, Rollen, blockierte Aktionen und Follow-up-Anforderungen.",
  },
  {
    label: "Agent Work Log",
    source: "project-register/agent-work-log.json",
    register: workLogRegister,
    description: "Auditfähige Aufgabenhistorie mit Checks, PR-Metadaten und Follow-ups.",
  },
];

const sourceEntries: SourceEntry[] = [
  ...(catalogRegister.entries ?? []).map((entry) => ({ ...entry, source: "project-register/agent-catalog.json", sourceLabel: "Catalog" })),
  ...(backlogRegister.entries ?? []).map((entry) => ({ ...entry, source: "project-register/approved-agent-build-backlog.json", sourceLabel: "Backlog" })),
  ...(proposalsRegister.entries ?? []).map((entry) => ({ ...entry, source: "project-register/agent-build-proposals.json", sourceLabel: "Proposal" })),
];

const openStatuses = new Set(["in_progress", "review_required", "planning_only", "approved_for_planning"]);
const confirmedStatuses = new Set(["active", "built", "report_only", "approved_for_build"]);
const blockedStatuses = new Set(["blocked"]);

const openAgents = sourceEntries.filter((entry) => openStatuses.has(entry.status ?? ""));
const confirmedAgents = sourceEntries.filter((entry) => confirmedStatuses.has(entry.status ?? ""));
const blockedAgents = sourceEntries.filter((entry) => blockedStatuses.has(entry.status ?? ""));
const approvalGatedAgents = sourceEntries.filter((entry) => entry.requiresHumanApprovalForRuntime || entry.humanReviewRequired);
const workLogEntries = workLogRegister.entries ?? [];
const learningQuestions = learningQuestionsRegister.questions ?? [];
const archivedLearningQuestions = learningQuestionsRegister.archivedQuestions ?? [];
const allLearningQuestions = [...learningQuestions, ...archivedLearningQuestions];

export const metadata: Metadata = {
  title: "Agent Center | WellFit Admin",
  description: "Read-only WellFit Agent Control Center aus statischen Governance-Registern.",
};

function countBy<T>(entries: T[], key: keyof T) {
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

function SummaryCard({ summary }: { summary: RegisterSummary }) {
  const entries = summary.register.entries ?? [];
  const statusCounts = countBy(entries, "status");
  const capabilityCounts = countBy(entries, "executionCapability");
  const humanApprovalCount = entries.filter((entry) => entry.requiresHumanApprovalForRuntime || entry.humanReviewRequired).length;

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
        <div className="rounded-2xl bg-white/[0.08] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">Einträge</p>
          <p className="mt-2 text-2xl font-black text-white">{entries.length}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.08] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">Registerstatus</p>
          <p className="mt-2 text-sm font-semibold text-white">{summary.register.status ?? summary.register.activationState ?? "n/a"}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.08] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">Runtime Approval</p>
          <p className="mt-2 text-sm font-semibold text-white">{humanApprovalCount} Einträge markiert</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <StatusPillGroup title="Status" counts={statusCounts} emptyLabel="keine Statuswerte" />
        <StatusPillGroup title="Capabilities" counts={capabilityCounts} emptyLabel="keine Capability-Werte" />
      </div>
    </article>
  );
}

function StatusPillGroup({ title, counts, emptyLabel }: { title: string; counts: Record<string, number>; emptyLabel: string }) {
  const entries = Object.entries(counts);

  return (
    <div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {entries.length > 0 ? entries.map(([status, count]) => <Pill key={status}>{status}: {count}</Pill>) : <Pill>{emptyLabel}</Pill>}
      </div>
    </div>
  );
}

function AgentList({ title, description, entries, tone = "neutral" }: { title: string; description: string; entries: SourceEntry[]; tone?: "neutral" | "safe" | "warn" | "danger" }) {
  return (
    <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-cyan-50/75">{description}</p>
        </div>
        <Pill tone={tone}>{entries.length} Einträge</Pill>
      </div>
      <div className="mt-4 space-y-3">
        {entries.slice(0, 10).map((entry) => (
          <article key={`${entry.source}-${entry.id ?? getEntryTitle(entry)}`} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-bold text-white">{getEntryTitle(entry)}</h3>
                <p className="mt-1 text-xs font-mono text-cyan-100/65">{entry.source}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill tone={tone}>{entry.status ?? "n/a"}</Pill>
                <Pill>{entry.executionCapability ?? "capability n/a"}</Pill>
                <Pill tone={entry.riskLevel === "high" || entry.riskLevel === "critical" ? "danger" : "neutral"}>{entry.riskLevel ?? "risk n/a"}</Pill>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-cyan-50/75">{entry.purpose ?? entry.reason ?? entry.expectedBenefit ?? "Kein Beschreibungstext im Register."}</p>
          </article>
        ))}
        {entries.length === 0 && <p className="rounded-2xl bg-white/[0.08] p-4 text-sm text-cyan-50/75">Keine passenden Einträge in den gelesenen Registern.</p>}
      </div>
    </section>
  );
}

function OwnerInfoBox() {
  const owner = controlCenterRegister.owners?.[0];
  const followUp = controlCenterRegister.follow_up_required_for_real_approvals;

  return (
    <article className="rounded-3xl border border-cyan-200/25 bg-cyan-300/10 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Owner-Freigabe-Infobox</h2>
          <p className="mt-2 text-sm leading-6 text-cyan-50/80">
            Zeigt read-only, welche Freigabeart aktuell im Governance-Modell moeglich waere. Es gibt keine Approval-Aktion und keine Runtime-Aktivierung.
          </p>
        </div>
        <Pill tone="warn">Auth-Follow-up offen</Pill>
      </div>

      <dl className="mt-4 grid gap-4 text-sm leading-6 text-cyan-50/85 md:grid-cols-2">
        <div className="rounded-2xl bg-white/[0.08] p-4">
          <dt className="font-semibold text-white">Owner</dt>
          <dd>{owner?.displayName ?? "Nicht gesetzt"} · {owner?.role ?? "role n/a"}</dd>
        </div>
        <div className="rounded-2xl bg-white/[0.08] p-4">
          <dt className="font-semibold text-white">Aktuell moeglich</dt>
          <dd>Agent Proposals sowie Low-/Medium-Agenten nur scope-bound; High/Critical nur mit Reviewplan.</dd>
        </div>
        <div className="rounded-2xl bg-white/[0.08] p-4 md:col-span-2">
          <dt className="font-semibold text-white">Freigabebereiche</dt>
          <dd>{formatList(owner?.approvalScopes)}</dd>
        </div>
        <div className="rounded-2xl bg-white/[0.08] p-4 md:col-span-2">
          <dt className="font-semibold text-white">Audit-/Scope-Grenzen</dt>
          <dd>{formatList(owner?.approvalBoundaries)}</dd>
        </div>
        <div className="rounded-2xl bg-white/[0.08] p-4 md:col-span-2">
          <dt className="font-semibold text-white">Separates Follow-up</dt>
          <dd>{followUp?.separateAuthFollowUp ?? "Firebase Auth-/Rollen-Anbindung bleibt vor echten Freigaben separat zu klaeren."}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {(owner?.explicitlyBlocked ?? []).map((action) => <Pill key={action} tone="danger">{action}</Pill>)}
      </div>
    </article>
  );
}

function ApprovalStatusPanel() {
  const approvalUser = controlCenterRegister.authorized_approval_user;
  const followUp = controlCenterRegister.follow_up_required_for_real_approvals;

  return (
    <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-3xl border border-amber-200/25 bg-amber-300/10 p-5 shadow-xl shadow-slate-950/25">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Freigabe-Status</h2>
            <p className="mt-2 text-sm leading-6 text-amber-50/85">Konzept sichtbar, echte Ausführung bleibt gated und braucht einen separaten Follow-up-Task.</p>
          </div>
          <Pill tone="warn">gated</Pill>
        </div>
        <dl className="mt-4 space-y-4 text-sm leading-6 text-amber-50/85">
          <div>
            <dt className="font-semibold text-white">Freigabe-Nutzer im Konzept</dt>
            <dd>{approvalUser?.displayName ?? "Nicht gesetzt"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-white">Zulässige Rollen</dt>
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
        <h2 className="text-xl font-bold text-white">Geschützte Runtime-Aktionen</h2>
        <p className="mt-2 text-sm leading-6 text-rose-50/80">Keine Auto-Merge-, Auto-Deploy-, Approval-, Firebase-Write- oder Protected-Scope-Aktion ist in dieser UI verdrahtet.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ...(approvalUser?.blockedActions ?? []),
            ...(controlCenterRegister.blocked_auto_actions ?? []),
            ...(followUp?.blockedUntilFollowUpIsApproved ?? []),
          ].slice(0, 18).map((action) => (
            <Pill key={action} tone="danger">{action}</Pill>
          ))}
        </div>
      </article>
    </section>
  );
}

function getLearningQuestionTone(status: LearningQuestionStatus): "neutral" | "safe" | "warn" | "danger" {
  if (status === "beantwortet" || status === "umgesetzt") return "safe";
  if (status === "braucht Rückfrage") return "danger";
  return "warn";
}

function LearningQuestionsPanel() {
  const statusCounts = countBy(allLearningQuestions, "status");
  const containsSensitiveUserData = learningQuestionsRegister.dataPolicy?.containsSensitiveUserData === true;

  return (
    <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Fragen an Bernd</h2>
          <p className="mt-1 text-sm leading-6 text-cyan-50/75">
            Statischer Auszug aus project-register/concept-learning-questions.json. Antworten sind lokal vorbereitet oder als späterer API-Follow-up markiert; es wird nichts automatisch gesendet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="warn">{allLearningQuestions.length} Fragen</Pill>
          <Pill tone={containsSensitiveUserData ? "danger" : "safe"}>{containsSensitiveUserData ? "Datenprüfung nötig" : "keine sensiblen Nutzerdaten"}</Pill>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-cyan-200/20 bg-cyan-300/[0.07] p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-100/75">Register-Regel</h3>
          <p className="mt-2 text-sm leading-6 text-cyan-50/80">{learningQuestionsRegister.dataPolicy?.rule ?? "Nur planning-only Fragen ohne sensible Nutzerdaten speichern."}</p>
          <p className="mt-3 font-mono text-xs text-cyan-100/60">Stand: {learningQuestionsRegister.updated ?? "n/a"}</p>
        </div>
        <StatusPillGroup title="Fragenstatus" counts={statusCounts} emptyLabel="keine Fragen" />
      </div>

      <div className="mt-5 space-y-4">
        {allLearningQuestions.map((entry) => (
          <article key={entry.id} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-xs text-cyan-100/60">{entry.id}{entry.category === "archived" ? " · archiviert" : ""}</p>
                <h3 className="mt-2 text-base font-bold text-white">{entry.question}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill tone={getLearningQuestionTone(entry.status)}>{entry.status}</Pill>
                <Pill tone={entry.risk === "high" || entry.risk === "critical" ? "danger" : entry.risk === "medium" ? "warn" : "neutral"}>Risiko: {entry.risk}</Pill>
                <Pill>{entry.answerPreparation?.mode === "api_follow_up_spaeter" ? "API-Follow-up später" : "lokal/statisch"}</Pill>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 text-sm leading-6 text-cyan-50/80 lg:grid-cols-2">
              <div className="rounded-2xl bg-white/[0.07] p-3">
                <dt className="font-semibold text-white">Warum wichtig</dt>
                <dd>{entry.whyImportant}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-3">
                <dt className="font-semibold text-white">Betroffener WellFit-Bereich</dt>
                <dd>{formatList(entry.affectedWellFitArea)}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-3">
                <dt className="font-semibold text-white">Vorgeschlagener Speicherort</dt>
                <dd className="break-words font-mono text-xs text-cyan-100/75">{entry.proposedStorageLocation}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-3">
                <dt className="font-semibold text-white">Antwort / Follow-up</dt>
                <dd>{entry.answerPreparation?.draftAnswer ?? entry.followUp ?? "Noch keine Antwort vorbereitet."}</dd>
                {entry.answerPreparation?.apiFollowUpNote && <dd className="mt-2 text-xs text-amber-100/80">{entry.answerPreparation.apiFollowUpNote}</dd>}
              </div>
              {entry.archivedReason && (
                <div className="rounded-2xl bg-white/[0.07] p-3 lg:col-span-2">
                  <dt className="font-semibold text-white">Archivgrund</dt>
                  <dd>{entry.archivedReason}</dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function UploadPreparationPanel() {
  return (
    <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Upload-Bereich als UI-Vorbereitung</h2>
          <p className="mt-1 text-sm leading-6 text-cyan-50/75">Platzhalter für spätere Register-, Report- oder Audit-Artefakte. Der Bereich hat bewusst keinen Handler und keine Server-Anbindung.</p>
        </div>
        <Pill tone="warn">deaktiviert</Pill>
      </div>
      <div className="mt-5 rounded-3xl border border-dashed border-cyan-200/30 bg-cyan-300/[0.07] p-8 text-center">
        <p className="text-lg font-black text-white">Upload später möglich</p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-cyan-50/75">Dateien werden aktuell nicht angenommen, nicht gespeichert und nicht verarbeitet. Spätere Aktivierung benötigt Auth, Rollenprüfung, Dateityp-Policy, Audit-Log und explizite Owner-Freigabe.</p>
        <div className="mt-5 inline-flex cursor-not-allowed rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-bold text-white/55" aria-disabled="true">
          Upload gesperrt
        </div>
      </div>
    </section>
  );
}

function AuditTrailPanel() {
  return (
    <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Audit-/Aktivitätsverlauf</h2>
          <p className="mt-1 text-sm leading-6 text-cyan-50/75">Auszug aus project-register/agent-work-log.json. Sichtbar sind Status, Branch und dokumentierte Checks.</p>
        </div>
        <Pill tone="safe">{workLogEntries.length} Work-Log-Einträge</Pill>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">
            <tr>
              <th className="px-3 py-2">Task</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Branch/PR</th>
              <th className="px-3 py-2">Checks</th>
              <th className="px-3 py-2">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {workLogEntries.slice(0, 8).map((entry) => (
              <tr key={entry.taskId ?? entry.title} className="bg-white/[0.08] text-cyan-50/85">
                <td className="rounded-l-2xl px-3 py-3 font-semibold text-white">{entry.title ?? entry.taskId ?? "Unbenannter Task"}</td>
                <td className="px-3 py-3">{entry.status ?? "n/a"}</td>
                <td className="px-3 py-3">{entry.pr?.branch ?? entry.pr?.title ?? "n/a"}</td>
                <td className="px-3 py-3">{entry.checksRun?.length ?? 0}</td>
                <td className="rounded-r-2xl px-3 py-3">{entry.nextRecommendedTask ?? entry.followUps?.[0] ?? "n/a"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AgentCenterPage() {
  const statusCounts = countBy(sourceEntries, "status");
  const capabilityCounts = countBy(sourceEntries, "executionCapability");
  const followUp = controlCenterRegister.follow_up_required_for_real_approvals;

  return (
    <AppShell reward={0} contentClassName="px-0 py-0">
      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(0,170,190,0.32),_transparent_30%),linear-gradient(135deg,_#06252d,_#07111f_52%,_#0f172a)] px-5 py-8 pb-24 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <header className="rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-100/75">WellFit Admin · Read-only · Live sichtbar</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Agent Center</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-cyan-50/80">
                  Diese Admin-Konsole liest statische Governance-Register und macht Agentenstatus, Freigabe-Gates, Lernfragen,
                  Upload-Vorbereitung und Audit-Verlauf sichtbar. Ausführung, Approval, Merge, Deploy und geschützte Runtime-Aktionen bleiben gesperrt.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill tone="safe">statische Register</Pill>
                <Pill tone="warn">keine Freigabe-Buttons</Pill>
                <Pill tone="danger">keine Runtime-Ausführung</Pill>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Register" value={registerSummaries.length + 1} hint="Sechs lokale JSON-Register inklusive Fragenregister." />
            <StatCard label="Agenten gesamt" value={sourceEntries.length} hint="Catalog, Backlog und Proposal-Einträge zusammengeführt." />
            <StatCard label="Offene Agenten" value={openAgents.length} hint="Planung, Review oder laufende Agenten aus den Registern." />
            <StatCard label="Blockiert" value={blockedAgents.length} hint="Status blocked; keine Ausführung in dieser UI." />
            <StatCard label="Approval-Gated" value={approvalGatedAgents.length} hint={`Follow-up: ${followUp?.status ?? "separat erforderlich"}.`} />
          </section>

          <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Agentenübersicht</h2>
                <p className="mt-1 text-sm leading-6 text-cyan-50/75">Kombinierte Sicht auf Status, Capabilities und gelesene Source-of-Truth-Dateien.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(controlCenterRegister.admin_ui_target?.register_sources ?? registerSummaries.map((summary) => summary.source)).map((source) => <Pill key={source}>{source}</Pill>)}
              </div>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <StatusPillGroup title="Statusverteilung" counts={statusCounts} emptyLabel="keine Statuswerte" />
              <StatusPillGroup title="Capability-Verteilung" counts={capabilityCounts} emptyLabel="keine Capability-Werte" />
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            {registerSummaries.map((summary) => <SummaryCard key={summary.source} summary={summary} />)}
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <AgentList title="Offene Agenten" description="Einträge mit Planung, Reviewbedarf oder laufender Umsetzung." entries={openAgents} tone="warn" />
            <AgentList title="Bestätigte Agenten" description="Aktive, gebaute oder ausdrücklich report-only sichtbare Agenten." entries={confirmedAgents} tone="safe" />
            <AgentList title="Blockierte Agenten" description="Einträge mit blocked-Status; nächste Schritte brauchen menschliche Entscheidung." entries={blockedAgents} tone="danger" />
          </section>

          <OwnerInfoBox />
          <ApprovalStatusPanel />
          <LearningQuestionsPanel />
          <UploadPreparationPanel />
          <AuditTrailPanel />
        </div>
      </div>
    </AppShell>
  );
}
