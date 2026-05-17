import agentTaskDraftSchema from "@/project-register/agent-task-draft-schema.json";
import agentTaskQueue from "@/project-register/agent-task-queue.json";

type Tone = "neutral" | "safe" | "warn" | "danger";

type TaskCandidate = {
  id?: string;
  title?: string;
  priority?: number;
  riskLevel?: string;
  purpose?: string;
  allowedFiles?: string[];
  forbiddenFiles?: string[];
  requiredChecks?: string[];
  stopConditions?: string[];
  expectedPrOutput?: string[];
  category?: string;
  taskCategory?: string;
};

type TaskProposalDraftConnection = {
  status?: string;
  schema?: string;
  adminConsoleRoute?: string;
  queueSource?: string;
  candidateSourceKey?: string;
  draftFieldMapping?: Record<string, string>;
  protectedWritePolicy?: {
    default?: string;
    blockedPathsOverrideAllowedPaths?: boolean;
    adminConsoleCanApprove?: boolean;
    adminConsoleCanExecute?: boolean;
    protectedAreasRequireHumanApproval?: string[];
  };
};

type TaskQueueRegister = {
  updated?: string;
  status?: string;
  purpose?: string;
  globalForbiddenFiles?: string[];
  defaultRequiredChecks?: string[];
  taskCandidates?: TaskCandidate[];
  taskProposalDraftConnection?: TaskProposalDraftConnection;
};

type TaskDraftSchema = {
  title?: string;
  required?: string[];
  properties?: Record<string, unknown>;
  wellfitPolicy?: {
    adminConsoleMode?: string;
    blockedAlways?: string[];
  };
};

const taskQueueRegister = agentTaskQueue as TaskQueueRegister;
const taskDraftSchema = agentTaskDraftSchema as TaskDraftSchema;

const taskCandidates = taskQueueRegister.taskCandidates ?? [];
const taskProposalConnection = taskQueueRegister.taskProposalDraftConnection;
const requiredDraftFields = taskDraftSchema.required ?? [];
const blockedAlways = taskDraftSchema.wellfitPolicy?.blockedAlways ?? [];
const protectedDraftCandidates = taskCandidates.filter((candidate) =>
  candidate.forbiddenFiles?.some((path) => (taskQueueRegister.globalForbiddenFiles ?? []).includes(path)),
);

function formatList(items: string[] | undefined, fallback = "Nicht dokumentiert") {
  if (!items || items.length === 0) return fallback;
  return items.join(", ");
}

function getRiskTone(riskLevel: string | undefined): Tone {
  if (riskLevel === "critical" || riskLevel === "high") return "danger";
  if (riskLevel === "medium") return "warn";
  if (riskLevel === "low") return "safe";
  return "neutral";
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  const className = {
    safe: "border-emerald-300/40 bg-emerald-300/15 text-emerald-50",
    warn: "border-amber-300/50 bg-amber-300/15 text-amber-50",
    danger: "border-rose-300/50 bg-rose-400/15 text-rose-50",
    neutral: "border-white/15 bg-white/10 text-white/85",
  }[tone];

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

export default function TaskProposalsPanel() {
  const visibleCandidates = taskCandidates.slice(0, 8);
  const policy = taskProposalConnection?.protectedWritePolicy;

  return (
    <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 shadow-xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Task-Vorschläge</h2>
          <p className="mt-1 text-sm leading-6 text-cyan-50/75">
            Read-only Vorschau aus project-register/agent-task-queue.json, verbunden mit project-register/agent-task-draft-schema.json.
            Die Admin-Konsole zeigt Kandidaten, Pflichtfelder, Checks und Pfadgrenzen, erstellt aber keine Freigabe und führt nichts aus.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="safe">{taskCandidates.length} Queue-Kandidaten</Pill>
          <Pill tone="warn">{requiredDraftFields.length} Pflichtfelder</Pill>
          <Pill tone="danger">Protected Writes gesperrt</Pill>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <article className="rounded-2xl border border-cyan-200/20 bg-cyan-300/[0.07] p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-100/75">Schema & Queue-Verbindung</h3>
          <dl className="mt-3 space-y-3 text-sm leading-6 text-cyan-50/80">
            <div>
              <dt className="font-semibold text-white">Schema</dt>
              <dd className="break-words font-mono text-xs text-cyan-100/75">{taskProposalConnection?.schema ?? "project-register/agent-task-draft-schema.json"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Queue-Quelle</dt>
              <dd className="break-words font-mono text-xs text-cyan-100/75">{taskProposalConnection?.queueSource ?? "project-register/agent-task-queue.json"} · {taskProposalConnection?.candidateSourceKey ?? "taskCandidates"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Status</dt>
              <dd>{taskProposalConnection?.status ?? taskQueueRegister.status ?? "read_only_admin_visibility"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Admin-Modus</dt>
              <dd>{taskDraftSchema.wellfitPolicy?.adminConsoleMode ?? "read_only_visibility_only"}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {requiredDraftFields.map((field) => <Pill key={field}>{field}</Pill>)}
          </div>
        </article>

        <article className="rounded-2xl border border-rose-200/25 bg-rose-400/10 p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-rose-100/80">Freigabe-Grenze für geschützte Bereiche</h3>
          <p className="mt-2 text-sm leading-6 text-rose-50/80">
            {policy?.default ?? "Kein Task darf ohne menschliche Freigabe in geschützte Bereiche schreiben. Blocked Paths überschreiben Allowed Paths."}
          </p>
          <div className="mt-4 grid gap-3 text-sm text-rose-50/85 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.08] p-3">
              <p className="font-semibold text-white">Blocked vor Allowed</p>
              <p>{policy?.blockedPathsOverrideAllowedPaths === false ? "nein" : "ja"}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.08] p-3">
              <p className="font-semibold text-white">UI darf freigeben</p>
              <p>{policy?.adminConsoleCanApprove ? "ja" : "nein"}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.08] p-3">
              <p className="font-semibold text-white">UI darf ausführen</p>
              <p>{policy?.adminConsoleCanExecute ? "ja" : "nein"}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(policy?.protectedAreasRequireHumanApproval ?? taskQueueRegister.globalForbiddenFiles ?? blockedAlways).slice(0, 12).map((path) => <Pill key={path} tone="danger">{path}</Pill>)}
          </div>
        </article>
      </div>

      <div className="mt-5 space-y-3">
        {visibleCandidates.map((candidate) => (
          <article key={candidate.id ?? candidate.title} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-xs text-cyan-100/60">{candidate.id ?? "TASK-ID-OFFEN"} · Priorität {candidate.priority ?? "n/a"}</p>
                <h3 className="mt-2 font-bold text-white">{candidate.title ?? "Unbenannter Task-Vorschlag"}</h3>
                <p className="mt-2 text-sm leading-6 text-cyan-50/75">{candidate.purpose ?? "Kein Zweck dokumentiert."}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Pill tone={getRiskTone(candidate.riskLevel)}>Risiko: {candidate.riskLevel ?? "n/a"}</Pill>
                <Pill>{candidate.category ?? candidate.taskCategory ?? "Kategorie n/a"}</Pill>
                <Pill tone="warn">Freigabe vor Write</Pill>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm leading-6 text-cyan-50/80 lg:grid-cols-3">
              <div className="rounded-2xl bg-white/[0.07] p-3">
                <dt className="font-semibold text-white">Allowed Paths</dt>
                <dd className="break-words font-mono text-xs text-cyan-100/75">{formatList(candidate.allowedFiles?.slice(0, 4), "Keine Allowlist")}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-3">
                <dt className="font-semibold text-white">Blocked Paths</dt>
                <dd className="break-words font-mono text-xs text-cyan-100/75">{formatList(candidate.forbiddenFiles?.slice(0, 4), "Keine Blocklist")}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-3">
                <dt className="font-semibold text-white">Pflichtchecks / Stop</dt>
                <dd>{candidate.requiredChecks?.length ?? 0} Checks · {candidate.stopConditions?.length ?? 0} Stop-Bedingungen</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <p className="mt-4 text-xs leading-5 text-cyan-100/65">
        {protectedDraftCandidates.length} Queue-Kandidaten enthalten globale Blockpfade in ihrer Denylist; das ist erwartetes Schutzverhalten und keine Schreibfreigabe.
      </p>
    </section>
  );
}
