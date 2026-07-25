import { MISSION_LIFECYCLE_STEPS } from "@/lib/beta1/missionStatusPresentation.mjs";
import type { MissionStatusPresentation } from "@/lib/beta1/missionStatusPresentation.mjs";

const toneClasses: Record<MissionStatusPresentation["tone"], string> = {
  neutral: "border-slate-300/25 bg-slate-400/10 text-slate-100",
  info: "border-cyan-300/35 bg-cyan-400/10 text-cyan-50",
  warning: "border-amber-300/40 bg-amber-400/10 text-amber-50",
  success: "border-emerald-300/40 bg-emerald-400/10 text-emerald-50",
  error: "border-rose-300/40 bg-rose-400/10 text-rose-50",
};

function formatDeferredChange(value?: string | null) {
  if (!value) return "nach Ablauf der Sicherheitsfrist";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function MissionLifecyclePanel({
  presentation,
  periodLabel,
  timeZone,
  calendarAuthority,
  timeZoneChangeDeferred = false,
  nextTimeZoneChangeAt = null,
  attemptStatus = null,
  compact = false,
}: {
  presentation: MissionStatusPresentation;
  periodLabel: string;
  timeZone?: string | null;
  calendarAuthority?: "server-user-time-zone" | "device-preview" | string | null;
  timeZoneChangeDeferred?: boolean;
  nextTimeZoneChangeAt?: string | null;
  attemptStatus?: string | null;
  compact?: boolean;
}) {
  const serverCalendar = calendarAuthority === "server-user-time-zone";

  return (
    <section className={`rounded-2xl border p-3.5 ${toneClasses[presentation.tone]}`} aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold">{presentation.title}</p>
          <p className={`mt-1 leading-relaxed opacity-80 ${compact ? "text-[11px]" : "text-xs"}`}>{presentation.detail}</p>
        </div>
        <span className="rounded-full border border-current/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
          {presentation.progress}%
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Missionsablauf">
        {MISSION_LIFECYCLE_STEPS.map((step, index) => {
          const completed = index < presentation.completedStepCount;
          const current = presentation.completedStepCount < MISSION_LIFECYCLE_STEPS.length
            && index === presentation.completedStepCount;
          return (
            <div
              key={step.key}
              aria-current={current ? "step" : undefined}
              className={`rounded-lg border px-1.5 py-2 text-center text-[10px] font-bold ${
                completed
                  ? "border-emerald-200/35 bg-emerald-200/15 text-emerald-50"
                  : current
                    ? "border-white/45 bg-white/15 text-white"
                    : "border-white/10 bg-black/10 text-white/45"
              }`}
            >
              <span className="block text-xs">{completed ? "✓" : index + 1}</span>
              <span className="mt-0.5 block">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold">
        <span className="rounded-full border border-white/15 bg-black/10 px-2 py-1">{periodLabel}</span>
        {timeZone ? <span className="rounded-full border border-white/15 bg-black/10 px-2 py-1">Zeitzone: {timeZone}</span> : null}
        <span className="rounded-full border border-white/15 bg-black/10 px-2 py-1">
          {serverCalendar ? "Server-Kalenderautorität" : "Gerätezeit nur Vorschau"}
        </span>
        {attemptStatus ? <span className="rounded-full border border-white/15 bg-black/10 px-2 py-1">Vorgang: {attemptStatus}</span> : null}
      </div>

      {presentation.canResume ? (
        <p className="mt-2 rounded-lg border border-white/15 bg-black/10 px-2.5 py-2 text-[11px] leading-relaxed">
          Bestehender Vorgang wird fortgesetzt. Ein erneuter Aufruf erzeugt keinen zusätzlichen Reward.
        </p>
      ) : null}

      {timeZoneChangeDeferred ? (
        <p className="mt-2 rounded-lg border border-amber-200/30 bg-amber-200/10 px-2.5 py-2 text-[11px] leading-relaxed text-amber-50">
          Ein schneller Zeitzonenwechsel wurde zum Schutz vor Mehrfachbelohnungen zurückgestellt. Nächste mögliche Übernahme: {formatDeferredChange(nextTimeZoneChangeAt)}.
        </p>
      ) : null}
    </section>
  );
}
